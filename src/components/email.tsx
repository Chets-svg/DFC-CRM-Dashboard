import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Mail, Inbox, Send, Star, FileText, Edit, Plus, MessageSquare, User, Search, ChevronDown, ChevronUp, Archive, AlertCircle, Trash2, Clock, Tag, Mailbox } from 'lucide-react'
import { ThemeName, themes, getButtonClasses } from '@/lib/theme'
import { useRef } from 'react'
import { X } from 'lucide-react'
import { Paperclip } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface EmailComponentProps {
  theme: ThemeName;
  clients: Client[];
  defaultRecipient?: string;
  openCompose?: boolean;
}

type Email = {
  id: string
  from: string
  to?: string
  subject: string
  body: string
  date: string
  read: boolean
  starred: boolean
  important: boolean
  folder: 'inbox' | 'sent' | 'starred' | 'trash' | 'spam' | 'important' | 'scheduled' | 'drafts'
  category?: 'primary' | 'social' | 'promotions'
}

type Draft = {
  id: string
  to: string
  subject: string
  body: string
  lastEdited: string
}

type WhatsAppMessage = {
  id: string
  contact: string
  phone: string
  message: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
  incoming: boolean
}

interface EmailComponentProps {
  theme: ThemeName
  clients: {
    id: string
    name: string
    email: string
    phone: string
  }[]
}
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

function decodeBase64Unicode(str) {
  try {
    const decoded = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    const decoder = new TextDecoder('utf-8');
    const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
    return decoder.decode(bytes);
  } catch (e) {
    console.warn('Failed to decode base64 HTML body:', e);
    return '';
  }
}

const initialDrafts: Draft[] = [
  {
    id: 'd1',
    to: 'team@example.com',
    subject: 'Project Update',
    body: 'Hello team,\n\nHere is the latest update on our project...',
    lastEdited: '2023-05-14 16:45'
  },
  {
    id: 'd2',
    to: 'client@example.com',
    subject: 'Proposal Discussion',
    body: 'Dear Client,\n\nI wanted to follow up on our proposal...',
    lastEdited: '2023-05-15 10:30'
  }
];

export function EmailComponent({ theme, clients, defaultRecipient = '', openCompose = false }: EmailComponentProps) {
  const [initialized, setInitialized] = useState(false);
  const [composeManuallyClosed, setComposeManuallyClosed] = useState(false)
  useEffect(() => {
    if (!initialized) {
      if (openCompose && defaultRecipient) {
        setEmailSubTab('compose');
        setRecipients([defaultRecipient]);
      }
      setInitialized(true);
    }
  }, [openCompose, defaultRecipient, initialized]);

  const currentTheme = themes[theme] || themes['blue-smoke']
  const {
    bgColor,
    textColor,
    cardBg,
    borderColor,
    inputBg,
    mutedText,
    highlightBg,
    selectedBg
  } = currentTheme

 const [recipients, setRecipients] = useState<string[]>([])
  const [currentRecipient, setCurrentRecipient] = useState('')
  const [suggestions, setSuggestions] = useState<{id: string, name: string, email: string}[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const recipientsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  

const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCurrentRecipient(value)
    
    if (value.length > 1) {
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(value.toLowerCase()) || 
        client.email.toLowerCase().includes(value.toLowerCase())
      ).map(client => ({ id: client.id, name: client.name, email: client.email }))
      
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
      setSelectedSuggestionIndex(-1)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (email: string) => {
    try {
      if (!email) return;
      
      if (!recipients.includes(email)) {
        setRecipients(prev => [...prev, email]);
      }
      setCurrentRecipient('');
      setShowSuggestions(false);
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error('Error in selectSuggestion:', error);
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email))
    inputRef.current?.focus()
  }

  const handleRecipientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        selectSuggestion(suggestions[selectedSuggestionIndex].email)
      } else if (currentRecipient && !showSuggestions) {
        if (!recipients.includes(currentRecipient)) {
          setRecipients([...recipients, currentRecipient])
        }
        setCurrentRecipient('')
      }
    } 
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : prev
      )
    } 
    else if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0) {
        selectSuggestion(suggestions[selectedSuggestionIndex].email)
      } else {
        selectSuggestion(suggestions[0].email)
      }
    }
    else if (e.key === 'Backspace' && !currentRecipient && recipients.length > 0) {
      removeRecipient(recipients[recipients.length - 1])
    }
  }

    const categorizeEmail = (email: any) => {
  const from = email.from.toLowerCase();

  if (
    from.includes('facebook') ||
    from.includes('twitter') ||
    from.includes('instagram') ||
    from.includes('linkedin')
  ) return 'social';

  if (
    from.includes('offers') ||
    from.includes('discount') ||
    from.includes('flipkart') ||
    from.includes('amazon') ||
    from.includes('hostinger') ||
    from.includes('advisorkhoj') ||
    from.includes('njwealth')
  ) return 'promotions';

  return 'primary';
};



  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (recipientsRef.current && !recipientsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update composeData.to when recipients change
  useEffect(() => {
    setComposeData(prev => ({ ...prev, to: recipients.join(', ') }))
  }, [recipients])
  
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email')
  const [emailSubTab, setEmailSubTab] = useState<'inbox' | 'sent' | 'starred' | 'compose' | 'drafts' | 'important' | 'spam' | 'trash' | 'scheduled'>('inbox')
  const [emailCategory, setEmailCategory] = useState<'primary' | 'social' | 'promotions'>('primary')
  const [gmailEmails, setGmailEmails] = useState<Email[]>([])
  const [emails, setEmails] = useState<Email[]>([])

  const filteredEmails = emails.filter(email => {
  // Check if email is from OR to a client
  const isClientEmail = clients.some(client => {
    const clientEmail = client.email.toLowerCase();
    return (
      email.from.toLowerCase().includes(clientEmail) || 
      (email.to && email.to.toLowerCase().includes(clientEmail))
    );
  });

  if (!isClientEmail) return false;

  // For sent folder, show all client emails where we are the sender
  if (emailSubTab === 'sent') {
    return clients.some(client => 
      email.from.toLowerCase().includes(client.email.toLowerCase())
    );
  }

  // For inbox, show emails where we are the recipient
  if (emailSubTab === 'inbox') {
    return clients.some(client => 
      email.to && email.to.toLowerCase().includes(client.email.toLowerCase())
    );
  }

  // For other folders (starred, important, etc.), use existing logic
  return true;
});

  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: ''
  })
  
  
  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null)

  // WhatsApp state - now using client data
  const [whatsappContacts, setWhatsappContacts] = useState(
    clients.map(client => ({
      id: client.id,
      name: client.name,
      phone: client.phone,
      lastMessage: '',
      unread: 0,
      lastSeen: 'online'
    }))
  )
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([
    {
      id: '1',
      contact: 'John Doe',
      phone: '+1234567890',
      message: 'Hey there! I wanted to discuss my investment portfolio',
      timestamp: '10:30 AM',
      status: 'read',
      incoming: true
    },
    {
      id: '2',
      contact: 'John Doe',
      phone: '+1234567890',
      message: 'Hi John! Sure, what would you like to know?',
      timestamp: '10:32 AM',
      status: 'read',
      incoming: false
    },
    {
      id: '3',
      contact: 'John Doe',
      phone: '+1234567890',
      message: "I'm concerned about the market volatility lately",
      timestamp: '10:33 AM',
      status: 'read',
      incoming: true
    },
    {
      id: '4',
      contact: 'John Doe',
      phone: '+1234567890',
      message: "Let's schedule a call to discuss this in detail",
      timestamp: '10:35 AM',
      status: 'read',
      incoming: false
    }
  ])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (activeTab !== 'email') {
      setEmailSubTab('inbox')
      setSelectedDraft(null)
      setComposeData({ to: '', subject: '', body: '' })
      setRecipients([])
    }
  }, [activeTab])

  const handleTabChange = (newTab: 'email' | 'whatsapp') => {
    if (newTab !== activeTab) {
      // Only reset if we're actually changing tabs
      if (newTab !== 'email') {
        setEmailSubTab('inbox');
        setSelectedDraft(null);
        setComposeData({ to: '', subject: '', body: '' });
        setRecipients([]);
      }
      setActiveTab(newTab);
    }
  };
useEffect(() => {
    return () => {
      setEmailSubTab('inbox');
      setComposeData({ to: '', subject: '', body: '' });
      setRecipients([]);
    };
  }, []);

  const closeCompose = () => {
    setEmailSubTab('inbox')
    setSelectedDraft(null)
    setComposeData({ to: '', subject: '', body: '' })
    setRecipients([])
    setComposeManuallyClosed(true) // Set flag when manually closed
  }
const openNewCompose = () => {
    setEmailSubTab('compose')
    setSelectedDraft(null)
    setComposeData({ to: '', subject: '', body: '' })
    setComposeManuallyClosed(false) // Reset flag when opening new compose
  }

  useEffect(() => {
  console.log('Active tab changed to:', activeTab);
  console.log('Email sub tab:', emailSubTab);
}, [activeTab, emailSubTab]);

window.addEventListener('message', (event) => {
  if (event.data?.type === 'google-auth-success') {
    const { tokens, user } = event.data;
    localStorage.setItem('gmail_access_token', tokens.access_token);
    console.log('✅ Gmail Token:', tokens.access_token);
    console.log('📧 Logged in as:', user.email);
  }
});

  // Update WhatsApp contacts when clients change
  useEffect(() => {
    setWhatsappContacts(
      clients.map(client => ({
        id: client.id,
        name: client.name,
        phone: client.phone,
        lastMessage: whatsappContacts.find(c => c.id === client.id)?.lastMessage || '',
        unread: whatsappContacts.find(c => c.id === client.id)?.unread || 0,
        lastSeen: whatsappContacts.find(c => c.id === client.id)?.lastSeen || 'online'
      }))
    )
  }, [clients])

  const fetchGmail = async (folder: 'inbox' | 'sent' = 'inbox') => {
  try {
    const accessToken = localStorage.getItem('gmail_token')
    if (!accessToken) {
      console.warn('No Gmail access token found.')
      return []
    }

    // Get client emails for filtering
    const clientEmails = clients.map(c => c.email.toLowerCase())

    // Different query for inbox vs sent
    let query = ''
    if (folder === 'inbox') {
      query = clientEmails.map(email => `from:${email}`).join(' OR ')
    } else if (folder === 'sent') {
      query = clientEmails.map(email => `to:${email}`).join(' OR ')
    }

    // Step 1: List messages with query
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
        query
      )}&labelIds=${folder === 'sent' ? 'SENT' : 'INBOX'}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    const listData = await listRes.json()
    const messages = listData.messages?.slice(0, 10) || [] // Fetch latest 10 for demo

    // Step 2: Get full message content
    const detailedEmails: Email[] = await Promise.all(
      messages.map(async msg => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
        const msgData = await msgRes.json()

        const headers = msgData.payload.headers
        const from = headers.find(h => h.name === 'From')?.value || ''
        const to = headers.find(h => h.name === 'To')?.value || ''
        const subject = headers.find(h => h.name === 'Subject')?.value || ''
        const date = headers.find(h => h.name === 'Date')?.value || ''

        // Decode body (only handles plain text, not multipart/HTML for now)
        
let htmlBody = '';
const payload = msgData.payload;

function findMimePart(parts, mimeType) {
  for (const part of parts) {
    if (part.mimeType === mimeType && part.body?.data) {
      return part;
    }
    if (part.parts) {
      const found = findMimePart(part.parts, mimeType);
      if (found) return found;
    }
  }
  return null;
}

let body = '';

if (payload.parts) {
  const htmlPart = findMimePart(payload.parts, 'text/html');
  const textPart = findMimePart(payload.parts, 'text/plain');
  const dataPart = htmlPart || textPart;

  if (dataPart?.body?.data) {
    body = decodeBase64Unicode(dataPart.body.data); // ✅ FIXED
  }
} else if (payload.body?.data) {
  body = decodeBase64Unicode(payload.body.data);
}

return {
  id: msg.id,
  from,
  to,
  subject,
  date,
  body,
  read: false,
  starred: false,
  important: false,
  folder,
  category: categorizeEmail({ from }),
       }
      })
    )

    return detailedEmails
  } catch (err) {
    console.error('Gmail fetch error:', err)
    return []
  }
}

// Add this useEffect to fetch emails when tab changes
useEffect(() => {
  const fetchEmails = async () => {
    if (emailSubTab === 'inbox') {
      const inboxEmails = await fetchGmail('inbox')
      setGmailEmails(inboxEmails)
    } else if (emailSubTab === 'sent') {
      const sentEmails = await fetchGmail('sent')
      setGmailEmails(sentEmails)
    }
  }

  fetchEmails()
}, [emailSubTab, clients])

     
  // Email functions
  const handleComposeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setComposeData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveDraft = () => {
    if (!composeData.to && !composeData.subject && !composeData.body) return
    
    const newDraft: Draft = {
      id: Date.now().toString(),
      to: composeData.to,
      subject: composeData.subject,
      body: composeData.body,
      lastEdited: new Date().toLocaleString()
    }
    
    setDrafts(prev => [...prev, newDraft])
    setComposeData({ to: '', subject: '', body: '' })
  }

  const handleLoadDraft = (draft: Draft) => {
    setComposeData({ to: draft.to, subject: draft.subject, body: draft.body })
    setSelectedDraft(draft)
    setEmailSubTab('compose')
  }

  const handleDeleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(draft => draft.id !== id))
    if (selectedDraft?.id === id) setSelectedDraft(null)
  }

  const handleSendEmail = async () => {
  if (recipients.length === 0 || !composeData.subject) {
    toast.error('Please enter a recipient and subject')
    return
  }

  const accessToken = localStorage.getItem('gmail_token')
  if (!accessToken) {
    toast.error('Please login with Gmail first')
    return
  }

  try {
    // Show loading state
    const loadingToast = toast.loading('Sending email...')

    const res = await fetch('http://localhost:5000/api/gmail/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: accessToken,
        to: recipients.join(', '),
        subject: composeData.subject,
        message: composeData.body,
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to send email via Gmail')
    }

    // Update UI with the sent email
    const newEmail: Email = {
      id: Date.now().toString(),
      from: 'me', // You might want to get the actual sender email from the API response
      to: recipients.join(', '),
      subject: composeData.subject,
      body: composeData.body,
      date: new Date().toLocaleString(),
      read: true,
      starred: false,
      important: false,
      folder: 'sent',
    }

    setEmails(prev => [...prev, newEmail])
    setGmailEmails(prev => [...prev, newEmail])

    // Clear form
    if (selectedDraft) {
      setDrafts(prev => prev.filter(draft => draft.id !== selectedDraft.id))
      setSelectedDraft(null)
    }

    setRecipients([])
    setComposeData({ to: '', subject: '', body: '' })
    setEmailSubTab('sent')

    toast.success('Email sent successfully!', { id: loadingToast })
  } catch (err) {
    console.error('❌ Error sending email:', err)
    toast.error('Failed to send email', { id: loadingToast })
  }
}


  const toggleStarEmail = (id: string) => {
    setEmails(prev => 
      prev.map(email => 
        email.id === id ? {...email, starred: !email.starred} : email
      )
    )
  }
  const sendEmail = async () => {
  const token = localStorage.getItem('gmail_token');
  if (!token) return alert('Please login with Gmail first.');

  const res = await fetch('http://localhost:5000/api/gmail/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      to: 'recipient@example.com',
      subject: 'Test Email',
      body: 'This is a test email sent from my CRM.'
    })
  });

  const result = await res.json();
  console.log('📤 Email send result:', result);
};
  
const login = useGoogleLogin({
  flow: 'implicit',
  scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
  onSuccess: async (tokenResponse) => {
    console.log('✅ Access Token:', tokenResponse.access_token);
    localStorage.setItem('gmail_token', tokenResponse.access_token);
    fetchGmail(); // fetch inbox as before
  },
  onError: () => {
    console.error('Login Failed');
  }
});

  const toggleImportantEmail = (id: string) => {
    setEmails(prev => 
      prev.map(email => 
        email.id === id ? {...email, important: !email.important} : email
      )
    )
  }

const moveToTrash = (id: string) => {
    setEmails(prev => 
      prev.map(email => 
        email.id === id ? {...email, folder: 'trash'} : email
      )
    )
  }

  const markAsSpam = (id: string) => {
    setEmails(prev => 
      prev.map(email => 
        email.id === id ? {...email, folder: 'spam'} : email
      )
    )
  }

  const archiveEmail = (id: string) => {
    setEmails(prev => prev.filter(email => email.id !== id))
  }

  const getFilteredEmails = () => {
    let filtered = emails.filter(email => email.folder === emailSubTab)
    
    if (emailSubTab === 'inbox') {
      filtered = filtered.filter(email => email.category === emailCategory)
    }
    
    return filtered
  }

  // WhatsApp functions
  const handleSendWhatsAppMessage = () => {
    if (!newMessage.trim() || !selectedContact) return
    
    const contact = whatsappContacts.find(c => c.id === selectedContact)
    if (!contact) return
    
    const message: WhatsAppMessage = {
      id: Date.now().toString(),
      contact: contact.name,
      phone: contact.phone,
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      incoming: false
    }
    
    setWhatsappMessages(prev => [...prev, message])
    
    // Update last message in contacts
    setWhatsappContacts(prev => 
      prev.map(c => 
        c.id === selectedContact 
          ? { ...c, lastMessage: newMessage, unread: 0 } 
          : c
      )
    )
    
    setNewMessage('')
    
    // Simulate reply
    setTimeout(() => {
      const reply: WhatsAppMessage = {
        id: Date.now().toString(),
        contact: contact.name,
        phone: contact.phone,
        message: getRandomReply(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        incoming: true
      }
      setWhatsappMessages(prev => [...prev, reply])
      
      // Update last message and unread count
      setWhatsappContacts(prev => 
        prev.map(c => 
          c.id === selectedContact 
            ? { ...c, lastMessage: reply.message, unread: c.unread + 1 } 
            : c
        )
      )
    }, 1000 + Math.random() * 2000)
  }

  const getRandomReply = () => {
    const replies = [
      "Thanks for your message!",
      "I'll get back to you soon.",
      "Can we talk about this later?",
      "Sounds good!",
      "I'm busy right now, will reply properly later.",
      "Got it, thanks!",
      "Let me check and get back to you."
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }

  const getContactName = (contactId: string) => {
    return whatsappContacts.find(c => c.id === contactId)?.name || contactId
  }

  // Auto-fill email when client is selected from dropdown
  const handleClientSelect = (email: string) => {
    setComposeData(prev => ({ ...prev, to: email }))
  }

  return (
    <div className={`flex h-screen ${bgColor} ${textColor}`}>
      {/* Sidebar */}
      <div className={`w-64 ${cardBg} border-r ${borderColor} p-4 rounded-3xl border`}>
        {/* Main Tabs - Email/WhatsApp */}
        
        <Tabs 
          value={activeTab} 
                   onValueChange={handleTabChange}
          className="mb-6"
        >
          <TabsList className={`grid grid-cols-2 rounded-full ${borderColor} border w-full mb-6`}>
            <TabsTrigger 
              value="email" 
              className={`rounded-full ${activeTab === 'email' ? `${highlightBg} ${textColor}` : ''}`}
            >
              <Mail className="h-4 w-4 mr-2" /> Email
            </TabsTrigger>
            <TabsTrigger 
              value="whatsapp" 
              className={`rounded-full ${activeTab === 'whatsapp' ? `${highlightBg} ${textColor}` : ''}`}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Email Sidebar Content */}
        {activeTab === 'email' && (
  <>
    <Button
      className={`w-full rounded-full mb-5 ${getButtonClasses(theme, 'outline')}`}
      onClick={() => login()}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path 
          fill="#EA4335" 
          d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"
        />
        <path 
          fill="#34A853" 
          d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"
        />
        <path 
          fill="#FBBC05" 
          d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.706-.1-1.417-.264-2.09H12v4.09h6.44a5.09 5.09 0 0 1-2.2 3.32L19.834 21z"
        />
        <path 
          fill="#4285F4" 
          d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z"
        />
      </svg>
      Login with Gmail
    </Button>
<Button
              className={`w-full rounded-full ${getButtonClasses(theme)} mb-6`}
              onClick={openNewCompose} // Use the new function here
            >
              <Plus className="mr-2 h-4 w-4" />
              Compose
            </Button>
            
            <nav className="space-y-1">
              <Button
                variant="ghost"
                className={`w-full justify-start rounded-full ${emailSubTab === 'inbox' ? 
                  `${highlightBg} ${textColor}` : 
                  `hover:${highlightBg} ${mutedText}`}`}
                onClick={() => setEmailSubTab('inbox')}
              >
                <Inbox className="mr-2 h-4 w-4" />
                Inbox
                <span className={`ml-auto bg-${theme === 'dark' ? 'blue-400' : 'blue-500'} text-xs font-medium px-2 py-0.5 rounded-full text-white`}>
                  {emails.filter(e => e.folder === 'inbox' && !e.read).length}
                </span>
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start rounded-full ${emailSubTab === 'starred' ? 
                  `${highlightBg} ${textColor}` : 
                  `hover:${highlightBg} ${mutedText}`}`}
                onClick={() => setEmailSubTab('starred')}
              >
                <Star className="mr-2 h-4 w-4" />
                Starred
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start rounded-full ${emailSubTab === 'important' ? 
                  `${highlightBg} ${textColor}` : 
                  `hover:${highlightBg} ${mutedText}`}`}
                onClick={() => setEmailSubTab('important')}
              >
                <Tag className="mr-2 h-4 w-4" />
                Important
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start rounded-full ${emailSubTab === 'sent' ? 
                  `${highlightBg} ${textColor}` : 
                  `hover:${highlightBg} ${mutedText}`}`}
                onClick={() => setEmailSubTab('sent')}
              >
                <Send className="mr-2 h-4 w-4" />
                Sent
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start rounded-full ${emailSubTab === 'drafts' ? 
                  `${highlightBg} ${textColor}` : 
                  `hover:${highlightBg} ${mutedText}`}`}
                onClick={() => setEmailSubTab('drafts')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Drafts
                {drafts.length > 0 && (
                  <span className={`ml-auto bg-${theme === 'dark' ? 'blue-400' : 'blue-500'} text-xs font-medium px-2 py-0.5 rounded-full text-white`}>
                    {drafts.length}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start rounded-full ${emailSubTab === 'scheduled' ? 
                  `${highlightBg} ${textColor}` : 
                  `hover:${highlightBg} ${mutedText}`}`}
                onClick={() => setEmailSubTab('scheduled')}
              >
                <Clock className="mr-2 h-4 w-4" />
                Scheduled
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start rounded-full ${emailSubTab === 'spam' ? 
                  `${highlightBg} ${textColor}` : 
                  `hover:${highlightBg} ${mutedText}`}`}
                onClick={() => setEmailSubTab('spam')}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Spam
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start rounded-full ${emailSubTab === 'trash' ? 
                  `${highlightBg} ${textColor}` : 
                  `hover:${highlightBg} ${mutedText}`}`}
                onClick={() => setEmailSubTab('trash')}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Trash
              </Button>
              


            </nav>
          </>
        )}

        {/* WhatsApp Sidebar Content */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="Search contacts..."
                className={`rounded-full pl-8 ${inputBg} ${borderColor}`}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="space-y-1 mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {clients.map(client => (
  <Button
    key={client.id}
    variant="ghost"
    className={`w-full justify-start rounded-full ${mutedText}`}
    onClick={() => {
      const message = `Hi ${client.name}, this is Chetan from Dhanam Financial Services. Let’s connect!`;
      const link = `https://wa.me/${client.phone}?text=${encodeURIComponent(message)}`;
      window.open(link, "_blank");
    }}
  >
    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-gray-200">
      <User className="h-4 w-4" />
    </div>
    {client.name}
  </Button>
))}

            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
       <div className={`flex-1 ${cardBg} border-r ${borderColor} p-4 rounded-3xl overflow-hidden flex flex-col ml-4 border`}>
        {/* Email Content */}
        {activeTab === 'email' && (
          <>
            {emailSubTab === 'compose' && activeTab === 'email' && !composeManuallyClosed ? (
              <div className={`${cardBg} rounded-3xl p-4 shadow-sm h-flex`}>
                <h2 className={`text-2xl font-bold mb-6 ${textColor}`}>
                  {selectedDraft ? 'Edit Draft' : 'Compose Email'}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full mr-4"
                    onClick={closeCompose} // Use the closeCompose function
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </h2>
                
                
                <Card className={`rounded-2xl ${borderColor} border h-full`}>
                  <CardContent className="pt-0 space-y-4 h-full flex flex-col">
                    <div className="relative" ref={recipientsRef}>
                      <label htmlFor="to" className={`block text-sm font-medium mb-1 ${mutedText}`}>
                        
                        To
                        
                      </label>
                      <div 
                        className={`flex flex-wrap gap-2 items-center p-2 rounded-lg ${inputBg} ${borderColor} border min-h-12`}
                        onClick={() => inputRef.current?.focus()}
                      >
                        
                        {recipients.map(email => (
                          <div 
                            key={email} 
                            className={`flex items-center px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${textColor}`}
                          >
                            <span className="text-sm">{email}</span>
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation()
                                removeRecipient(email)
                              }}
                              className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <input
                          ref={inputRef}
                          id="to"
                          name="to"
                          value={currentRecipient}
                          onChange={handleRecipientChange}
                          onKeyDown={handleRecipientKeyDown}
                          placeholder={recipients.length === 0 ? "Enter email or select client" : ""}
                          className={`flex-1 min-w-[100px] bg-transparent outline-none ${textColor}`}
                        />
                      </div>
                      {showSuggestions && suggestions.length > 0 && (
                        <div 
                          className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg ${cardBg} ${borderColor} border max-h-60 overflow-auto`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {suggestions.map((client, index) => (
                            <div
                              key={client.id}
                              className={`px-4 py-2 cursor-pointer hover:${highlightBg} ${textColor} ${
                                selectedSuggestionIndex === index ? `${highlightBg}` : ''
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                selectSuggestion(client.email);
                              }}
                              onMouseEnter={() => setSelectedSuggestionIndex(index)}
                            >
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm">{client.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className={`block text-sm font-medium mb-1 ${mutedText}`}>
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={composeData.subject}
                        onChange={handleComposeChange}
                        placeholder="Subject"
                        className={`rounded-full ${inputBg} ${borderColor}`}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <Textarea
                        id="body"
                        name="body"
                        value={composeData.body}
                        onChange={handleComposeChange}
                        placeholder="Write your message here..."
                        className={`h-full min-h-[300px] rounded-2xl ${inputBg} ${borderColor}`}
                      />
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          className={`rounded-full border ${borderColor} hover:${highlightBg} ${getButtonClasses(theme, 'outline')}`}
                          onClick={handleSaveDraft}
                        >
                          {selectedDraft ? 'Update Draft' : 'Save Draft'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className={`rounded-full border ${borderColor} hover:${highlightBg} ${getButtonClasses(theme, 'outline')}`}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        className={`rounded-full ${getButtonClasses(theme)}`}
                        onClick={handleSendEmail}
                        disabled={recipients.length === 0 || !composeData.subject}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Email Categories (Primary, Social, Promotions) */}
                
                {emailSubTab === 'inbox' && (
                  <div className={`flex border-b ${borderColor}`}>
                    <button
                      className={`flex-1 py-4 text-center font-medium ${emailCategory === 'primary' ? `${textColor} border-b-2 border-blue-500` : mutedText}`}
                      onClick={() => setEmailCategory('primary')}
                    >
                      Primary
                    </button>
                    
                    <button
                      className={`flex-1 py-4 text-center font-medium ${emailCategory === 'social' ? `${textColor} border-b-2 border-blue-500` : mutedText}`}
                      onClick={() => setEmailCategory('social')}
                    >
                      Social
                    </button>
                    <button
                      className={`flex-1 py-4 text-center font-medium ${emailCategory === 'promotions' ? `${textColor} border-b-2 border-blue-500` : mutedText}`}
                      onClick={() => setEmailCategory('promotions')}
                    >
                      Promotions
                    </button>
                  </div>
                )}
                

                                {emailSubTab === 'drafts' && (
          <div className="space-y-4 p-4">
            {drafts.length > 0 ? (
              drafts.map(draft => (
                <Card 
                  key={draft.id} 
                  className={`cursor-pointer ${borderColor} border`}
                  onClick={() => handleLoadDraft(draft)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{draft.subject || '(No subject)'}</h3>
                        <p className="text-sm text-muted-foreground">To: {draft.to || '(No recipient)'}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDraft(draft.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm line-clamp-2 text-muted-foreground">
                      {draft.body || '(No content)'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Last edited: {draft.lastEdited}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className={`text-center py-12 ${mutedText}`}>
                <FileText className="mx-auto h-12 w-12" />
                <p className="mt-2">No drafts found</p>
              </div>
            )}
          </div>
        )}

                {/* Email List */}
              <div className={`flex-1 overflow-auto ${cardBg}`}>
  <div className="p-4">
    {[...getFilteredEmails(), ...gmailEmails].length > 0 ? (
      <div className="space-y-2">
        {[...getFilteredEmails(), ...gmailEmails].map(email => (
          <div key={email.id}>
            {/* Email List Item */}
            <div 
              className={`flex items-center p-3 rounded-lg cursor-pointer ${
                !email.read ? selectedBg : highlightBg
              } ${borderColor} border`}
              onClick={() => {
                // Toggle selection - if already selected, deselect
                if (selectedEmail?.id === email.id) {
                  setSelectedEmail(null);
                } else {
                  setSelectedEmail(email);
                  // Mark as read when clicked - only for local emails
                  if (!gmailEmails.some(e => e.id === email.id)) {
                    setEmails(prev => 
                      prev.map(e => 
                        e.id === email.id ? {...e, read: true} : e
                      )
                    );
                  }
                }
              }}
            >
              <div className="flex items-center space-x-4 w-full">
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      // Only allow starring local emails
                      if (!gmailEmails.some(e => e.id === email.id)) {
                        toggleStarEmail(email.id)
                      }
                    }}
                    className={`text-gray-400 hover:text-yellow-400 ${
                      gmailEmails.some(e => e.id === email.id) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={gmailEmails.some(e => e.id === email.id)}
                  >
                    <Star className={`h-5 w-5 ${email.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      // Only allow marking important for local emails
                      if (!gmailEmails.some(e => e.id === email.id)) {
                        toggleImportantEmail(email.id)
                      }
                    }}
                    className={`text-gray-400 hover:text-blue-400 ${
                      gmailEmails.some(e => e.id === email.id) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={gmailEmails.some(e => e.id === email.id)}
                  >
                    <Tag className={`h-5 w-5 ${email.important ? 'fill-blue-400 text-blue-400' : ''}`} />
                  </button>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium truncate ${textColor}`}>
                      {email.folder === 'sent' ? email.to : email.from}
                    </h3>
                    <p className={`text-xs ${mutedText}`}>
                      {new Date(email.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <p className={`truncate ${textColor}`}>{email.subject}</p>
                  <p className={`text-sm truncate ${mutedText}`}>
                    {email.body.split('\n')[0].substring(0, 100)}
                  </p>
                </div>
              </div>
            </div>

            {/* Expanded Email View - appears below clicked email */}
            {selectedEmail?.id === email.id && (
              <div className={`mt-2 mb-4 ${cardBg} rounded-lg p-4 ${borderColor} border`}>
                <div className="mb-4">
                  <h2 className={`text-xl font-bold ${textColor}`}>
                    {selectedEmail.subject}
                  </h2>
                  <div className="flex items-center justify-between mt-2">
                    <p className={`${textColor}`}>
                      From: {selectedEmail.from}
                      {selectedEmail.to && ` | To: ${selectedEmail.to}`}
                    </p>
                    <p className={`text-sm ${mutedText}`}>
                      {new Date(selectedEmail.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div
  className={`prose max-w-none ${textColor}`}
  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
/>

                <div className="flex space-x-2 mt-4">
                  {!gmailEmails.some(e => e.id === email.id) && (
                    <>
                      <Button 
                        variant="outline" 
                        className="rounded-full"
                        onClick={() => archiveEmail(selectedEmail.id)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                      <Button 
                        variant="outline" 
                        className="rounded-full"
                        onClick={() => markAsSpam(selectedEmail.id)}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Report Spam
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="outline" 
                    className="rounded-full"
                    onClick={() => {
                      if (gmailEmails.some(e => e.id === email.id)) {
                        // For Gmail emails, just close the view
                        setSelectedEmail(null);
                      } else {
                        // For local emails, move to trash
                        moveToTrash(selectedEmail.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {gmailEmails.some(e => e.id === email.id) ? 'Close' : 'Delete'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className={`text-center py-12 ${mutedText}`}>
        <Mailbox className="mx-auto h-12 w-12" />
        <p>No client emails found in {emailCategory} category</p>
      </div>
    )}
  </div>
</div>                {/* Email Actions */}
                {selectedEmail && (
                  <div className={`border-t ${borderColor} p-4 ${cardBg}`}>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="rounded-full"
                        onClick={() => archiveEmail(selectedEmail.id)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                      <Button 
                        variant="outline" 
                        className="rounded-full"
                        onClick={() => markAsSpam(selectedEmail.id)}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Report Spam
                      </Button>
                      <Button 
                        variant="outline" 
                        className="rounded-full"
                        onClick={() => moveToTrash(selectedEmail.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* WhatsApp Content */}
 {activeTab === 'whatsapp' && (
            <div className={`${cardBg} rounded-3xl p-6 shadow-sm ${borderColor} border`}>
              {selectedContact ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${textColor}`}>
                          {getContactName(selectedContact)}
                        </h2>
                        <p className={`text-sm ${mutedText}`}>
                          {whatsappContacts.find(c => c.id === selectedContact)?.phone}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`rounded-full ${mutedText}`}
                      onClick={() => setSelectedContact(null)}
                    >
                      Back
                    </Button>
                  </div>

                  <div className={`rounded-2xl ${borderColor} border p-4 mb-4 h-[500px] overflow-y-auto`}>
                    <div className="space-y-3">
                      {whatsappMessages
                        .filter(msg => msg.phone === whatsappContacts.find(c => c.id === selectedContact)?.phone)
                        .map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`flex ${msg.incoming ? 'justify-start' : 'justify-end'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-2xl p-3 ${
                                msg.incoming 
                                  ? `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
                                  : `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500 text-white'}`
                              }`}
                            >
                              <p>{msg.message}</p>
                              <p className={`text-xs mt-1 text-right ${
                                msg.incoming ? mutedText : 'text-blue-100'
                              }`}>
                                {msg.timestamp}
                                {!msg.incoming && (
                                  <span className="ml-1">
                                    {msg.status === 'sent' && '✓'}
                                    {msg.status === 'delivered' && '✓✓'}
                                    {msg.status === 'read' && '✓✓✓'}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className={`rounded-full flex-1 ${inputBg} ${borderColor}`}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendWhatsAppMessage()}
                    />
                    <Button 
                      className={`rounded-full ${getButtonClasses(theme, 'success')}`}
                      onClick={handleSendWhatsAppMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className={`text-center py-12 ${mutedText}`}>
                  <MessageSquare className="mx-auto h-12 w-12" />
                  <h3 className={`text-xl font-bold mt-4 ${textColor}`}>WhatsApp Messages</h3>
                  <p className={`mt-2 ${mutedText}`}>Select a contact to start chatting</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
}