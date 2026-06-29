import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Mail, Inbox, Send, Star, FileText, Edit, Plus, MessageSquare, User, Search, ChevronDown, ChevronUp, Archive, AlertCircle, Trash2, Clock, Tag, Mailbox, Paperclip, X } from 'lucide-react'
import { ThemeName, themes, getButtonClasses, isNeon } from '@/lib/theme'
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast'

interface EmailComponentProps {
  theme: ThemeName;
  clients: Client[];
  leads: Lead[];
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

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Lead {
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

export function EmailComponent({ theme, clients, leads, defaultRecipient = '', openCompose = false }: EmailComponentProps) {
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
  const neon = isNeon(theme);
  
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

  // ─── Neon Styles Object (Consistent with Dashboard) ──────────
  const ns = neon ? {
    sidebar: 'border-cyan-500/20 shadow-[0_0_25px_rgba(0,255,255,0.06)]',
    mainArea: 'border-cyan-500/20 shadow-[0_0_25px_rgba(0,255,255,0.06)]',
    title: 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]',
    label: 'text-slate-400 drop-shadow-[0_0_2px_rgba(0,255,255,0.1)]',
    value: 'text-cyan-100 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]',
    primary: 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]',
    muted: 'text-slate-500',
    input: 'bg-slate-900 border-cyan-500/30 text-cyan-100 placeholder-slate-500 focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(0,255,255,0.3)]',
    btnOutline: 'border-cyan-500/40 text-cyan-300 shadow-[0_0_6px_rgba(0,255,255,0.12)] hover:border-cyan-400 hover:shadow-[0_0_14px_rgba(0,255,255,0.3)] hover:text-cyan-200',
    btnPrimary: 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(0,255,255,0.3)] hover:bg-cyan-500/30 hover:shadow-[0_0_14px_rgba(0,255,255,0.5)]',
    btnSuccess: 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)] hover:bg-emerald-500/30 hover:shadow-[0_0_14px_rgba(52,211,153,0.5)]',
    btnDanger: 'bg-red-500/20 border border-red-500/40 text-red-300 shadow-[0_0_8px_rgba(248,113,113,0.3)] hover:bg-red-500/30 hover:shadow-[0_0_14px_rgba(248,113,113,0.5)]',
    activeNav: 'bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.1)]',
    inactiveNav: 'text-slate-400 hover:bg-cyan-500/5 hover:text-cyan-400',
    composeCard: 'border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.08)]',
    recipientChip: 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-200',
    suggestionBox: 'bg-slate-900/95 border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.1)] backdrop-blur-sm',
    suggestionActive: 'bg-cyan-500/10 text-cyan-300',
    suggestionInactive: 'text-slate-300 hover:bg-cyan-500/5 hover:text-cyan-400',
    emailRow: 'border-cyan-500/10 hover:bg-cyan-500/5 hover:border-cyan-500/30 hover:shadow-[0_0_10px_rgba(0,255,255,0.08)]',
    emailRowUnread: 'bg-cyan-500/[0.03] border-l-4 border-l-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.06)]',
    emailDetail: 'border-cyan-500/20 shadow-[0_0_15px_rgba(0,255,255,0.08)]',
    categoryActive: 'text-cyan-300 border-b-2 border-cyan-400 drop-shadow-[0_0_6px_rgba(0,255,255,0.3)]',
    categoryInactive: 'text-slate-500 hover:text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_6px_rgba(0,255,255,0.15)]',
    starActive: 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]',
    starInactive: 'text-slate-600 hover:text-yellow-400',
    importantActive: 'text-fuchsia-400 drop-shadow-[0_0_6px_rgba(232,121,249,0.5)]',
    importantInactive: 'text-slate-600 hover:text-fuchsia-400',
    whatsappBubbleIncoming: 'bg-slate-800 border border-slate-700 text-slate-200',
    whatsappBubbleOutgoing: 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-100 shadow-[0_0_8px_rgba(0,255,255,0.1)]',
    whatsappHeader: 'border-b border-cyan-500/20',
    textSlate200: 'text-slate-200',
    textSlate300: 'text-slate-300',
    textSlate400: 'text-slate-400',
    textCyan400: 'text-cyan-400',
    textCyan300: 'text-cyan-300',
    emptyState: 'text-cyan-400/50',
    emptyIcon: 'text-cyan-500/30 drop-shadow-[0_0_10px_rgba(0,255,255,0.2)]',
  } : {};

 const [recipients, setRecipients] = useState<string[]>([])
  const [currentRecipient, setCurrentRecipient] = useState('')
  const [suggestions, setSuggestions] = useState<{id: string, name: string, email: string}[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const recipientsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const emailContentRef = useRef<HTMLDivElement>(null);

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
      setTimeout(() => { inputRef.current?.focus(); }, 0);
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
      setSelectedSuggestionIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev)
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : prev)
    } 
    else if (e.key === 'Tab' && showSuggestions && suggestions.length > 0) {
      e.preventDefault()
      selectSuggestion(selectedSuggestionIndex >= 0 ? suggestions[selectedSuggestionIndex].email : suggestions[0].email)
    }
    else if (e.key === 'Backspace' && !currentRecipient && recipients.length > 0) {
      removeRecipient(recipients[recipients.length - 1])
    }
  }

    const categorizeEmail = (email: any) => {
  const from = email.from.toLowerCase();
  if (from.includes('facebook') || from.includes('twitter') || from.includes('instagram') || from.includes('linkedin')) return 'social';
  if (from.includes('offers') || from.includes('discount') || from.includes('flipkart') || from.includes('amazon') || from.includes('hostinger') || from.includes('advisorkhoj') || from.includes('njwealth')) return 'promotions';
  return 'primary';
};

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (recipientsRef.current && !recipientsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setComposeData(prev => ({ ...prev, to: recipients.join(', ') }))
  }, [recipients])
  
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email')
  const [emailSubTab, setEmailSubTab] = useState<'inbox' | 'sent' | 'starred' | 'compose' | 'drafts' | 'important' | 'spam' | 'trash' | 'scheduled'>('inbox')
  const [emailCategory, setEmailCategory] = useState<'primary' | 'social' | 'promotions'>('primary')
  const [gmailEmails, setGmailEmails] = useState<Email[]>([])
  const [emails, setEmails] = useState<Email[]>([])

  const filteredEmails = emails.filter(email => {
  const isClientOrLeadEmail = [...clients, ...leads].some(person => {
    const personEmail = person.email.toLowerCase();
    return (email.from.toLowerCase().includes(personEmail) || (email.to && email.to.toLowerCase().includes(personEmail)));
  });

  if (!isClientOrLeadEmail) return false;

  if (emailSubTab === 'sent') {
    return [...clients, ...leads].some(person => email.from.toLowerCase().includes(person.email.toLowerCase()));
  }

  if (emailSubTab === 'inbox') {
    return [...clients, ...leads].some(person => email.to && email.to.toLowerCase().includes(person.email.toLowerCase()));
  }

  return true;
});

  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' })
  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null)

  const [whatsappContacts, setWhatsappContacts] = useState(
    clients.map(client => ({
      id: client.id, name: client.name, phone: client.phone, lastMessage: '', unread: 0, lastSeen: 'online'
    }))
  )
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([
    { id: '1', contact: 'John Doe', phone: '+1234567890', message: 'Hey there! I wanted to discuss my investment portfolio', timestamp: '10:30 AM', status: 'read', incoming: true },
    { id: '2', contact: 'John Doe', phone: '+1234567890', message: 'Hi John! Sure, what would you like to know?', timestamp: '10:32 AM', status: 'read', incoming: false },
    { id: '3', contact: 'John Doe', phone: '+1234567890', message: "I'm concerned about the market volatility lately", timestamp: '10:33 AM', status: 'read', incoming: true },
    { id: '4', contact: 'John Doe', phone: '+1234567890', message: "Let's schedule a call to discuss this in detail", timestamp: '10:35 AM', status: 'read', incoming: false }
  ])
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    if (activeTab !== 'email') {
      setEmailSubTab('inbox'); setSelectedDraft(null); setComposeData({ to: '', subject: '', body: '' }); setRecipients([]);
    }
  }, [activeTab])

  const handleTabChange = (newTab: 'email' | 'whatsapp') => {
    if (newTab !== activeTab) {
      if (newTab !== 'email') { setEmailSubTab('inbox'); setSelectedDraft(null); setComposeData({ to: '', subject: '', body: '' }); setRecipients([]); }
      setActiveTab(newTab);
    }
  };

  useEffect(() => {
    return () => { setEmailSubTab('inbox'); setComposeData({ to: '', subject: '', body: '' }); setRecipients([]); };
  }, []);

  const closeCompose = () => {
    setEmailSubTab('inbox'); setSelectedDraft(null); setComposeData({ to: '', subject: '', body: '' }); setRecipients([]); setComposeManuallyClosed(true);
  }

  const openNewCompose = () => {
    setEmailSubTab('compose'); setSelectedDraft(null); setComposeData({ to: '', subject: '', body: '' }); setComposeManuallyClosed(false);
  }

  useEffect(() => { console.log('Active tab changed to:', activeTab); console.log('Email sub tab:', emailSubTab); }, [activeTab, emailSubTab]);

  window.addEventListener('message', (event) => {
    if (event.data?.type === 'google-auth-success') {
      const { tokens, user } = event.data;
      localStorage.setItem('gmail_access_token', tokens.access_token);
      console.log('✅ Gmail Token:', tokens.access_token); console.log('📧 Logged in as:', user.email);
    }
  });

  useEffect(() => {
    setWhatsappContacts(
      clients.map(client => ({
        id: client.id, name: client.name, phone: client.phone,
        lastMessage: whatsappContacts.find(c => c.id === client.id)?.lastMessage || '',
        unread: whatsappContacts.find(c => c.id === client.id)?.unread || 0,
        lastSeen: whatsappContacts.find(c => c.id === client.id)?.lastSeen || 'online'
      }))
    )
  }, [clients])

  const fetchGmail = async (folder: 'inbox' | 'sent' = 'inbox') => {
  try {
    const accessToken = localStorage.getItem('gmail_token')
    if (!accessToken) { console.warn('No Gmail access token found.'); return [] }

    const allContactEmails = [...clients, ...leads].map(c => c.email.toLowerCase())
    let query = ''
    if (folder === 'inbox') { query = allContactEmails.map(email => `from:${email}`).join(' OR ') }
    else if (folder === 'sent') { query = allContactEmails.map(email => `to:${email}`).join(' OR ') }

    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&labelIds=${folder === 'sent' ? 'SENT' : 'INBOX'}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const listData = await listRes.json()
    const messages = listData.messages?.slice(0, 10) || []

    const detailedEmails: Email[] = await Promise.all(
      messages.map(async msg => {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, { headers: { Authorization: `Bearer ${accessToken}` } })
        const msgData = await msgRes.json()
        const headers = msgData.payload.headers
        const from = headers.find(h => h.name === 'From')?.value || ''
        const to = headers.find(h => h.name === 'To')?.value || ''
        const subject = headers.find(h => h.name === 'Subject')?.value || ''
        const date = headers.find(h => h.name === 'Date')?.value || ''
        
        const payload = msgData.payload;
        function findMimePart(parts, mimeType) {
          for (const part of parts) {
            if (part.mimeType === mimeType && part.body?.data) return part;
            if (part.parts) { const found = findMimePart(part.parts, mimeType); if (found) return found; }
          }
          return null;
        }

        let body = '';
        if (payload.parts) {
          const htmlPart = findMimePart(payload.parts, 'text/html');
          const textPart = findMimePart(payload.parts, 'text/plain');
          const dataPart = htmlPart || textPart;
          if (dataPart?.body?.data) { body = decodeBase64Unicode(dataPart.body.data); }
        } else if (payload.body?.data) { body = decodeBase64Unicode(payload.body.data); }

        return { id: msg.id, from, to, subject, date, body, read: !msg.labelIds?.includes('UNREAD'), starred: msg.labelIds?.includes('STARRED') || false, important: false, folder, category: categorizeEmail({ from }) }
      })
    )
    return detailedEmails
  } catch (err) { console.error('Gmail fetch error:', err); return [] }
}

useEffect(() => {
  const fetchEmails = async () => {
    if (emailSubTab === 'inbox') { const inboxEmails = await fetchGmail('inbox'); setGmailEmails(inboxEmails) }
    else if (emailSubTab === 'sent') { const sentEmails = await fetchGmail('sent'); setGmailEmails(sentEmails) }
  }
  fetchEmails()
}, [emailSubTab, clients])
     
  const handleComposeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setComposeData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveDraft = () => {
    if (!composeData.to && !composeData.subject && !composeData.body) return
    const newDraft: Draft = { id: Date.now().toString(), to: composeData.to, subject: composeData.subject, body: composeData.body, lastEdited: new Date().toLocaleString() }
    setDrafts(prev => [...prev, newDraft])
    setComposeData({ to: '', subject: '', body: '' })
  }

  const handleLoadDraft = (draft: Draft) => {
    setComposeData({ to: draft.to, subject: draft.subject, body: draft.body }); setSelectedDraft(draft); setEmailSubTab('compose');
  }

  const handleDeleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(draft => draft.id !== id)); if (selectedDraft?.id === id) setSelectedDraft(null);
  }

  const handleSendEmail = async () => {
  if (recipients.length === 0 || !composeData.subject) { toast.error('Please enter a recipient and subject'); return }
  const accessToken = localStorage.getItem('gmail_token')
  if (!accessToken) { toast.error('Please login with Gmail first'); return }

  try {
    const loadingToast = toast.loading('Sending email...')
    const res = await fetch('http://localhost:5000/api/gmail/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: accessToken, to: recipients.join(', '), subject: composeData.subject, message: composeData.body }),
    })
    if (!res.ok) throw new Error('Failed to send email via Gmail')

    const newEmail: Email = { id: Date.now().toString(), from: 'me', to: recipients.join(', '), subject: composeData.subject, body: composeData.body, date: new Date().toLocaleString(), read: true, starred: false, important: false, folder: 'sent' }
    setEmails(prev => [...prev, newEmail]); setGmailEmails(prev => [...prev, newEmail]);

    if (selectedDraft) { setDrafts(prev => prev.filter(draft => draft.id !== selectedDraft.id)); setSelectedDraft(null); }
    setRecipients([]); setComposeData({ to: '', subject: '', body: '' }); setEmailSubTab('sent');
    toast.success('Email sent successfully!', { id: loadingToast })
  } catch (err) { console.error('❌ Error sending email:', err); toast.error('Failed to send email') }
}

  const toggleStarEmail = (id: string) => { setEmails(prev => prev.map(email => email.id === id ? {...email, starred: !email.starred} : email)) }
  
  const login = useGoogleLogin({
  flow: 'implicit',
  scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
  onSuccess: async (tokenResponse) => {
    console.log('✅ Access Token:', tokenResponse.access_token);
    localStorage.setItem('gmail_token', tokenResponse.access_token);
    const inboxEmails = await fetchGmail('inbox'); setGmailEmails(inboxEmails); setEmailSubTab('inbox');
  },
  onError: () => { console.error('Login Failed'); },
});

useEffect(() => {
  const fetchEmailsOnLogin = async () => {
    const token = localStorage.getItem('gmail_token');
    if (token && emailSubTab === 'inbox' && gmailEmails.length === 0) { const inboxEmails = await fetchGmail('inbox'); setGmailEmails(inboxEmails); }
  };
  fetchEmailsOnLogin();
}, [emailSubTab]);

  const toggleImportantEmail = (id: string) => { setEmails(prev => prev.map(email => email.id === id ? {...email, important: !email.important} : email)) }
  const moveToTrash = (id: string) => { setEmails(prev => prev.map(email => email.id === id ? {...email, folder: 'trash'} : email)) }
  const markAsSpam = (id: string) => { setEmails(prev => prev.map(email => email.id === id ? {...email, folder: 'spam'} : email)) }
  const archiveEmail = (id: string) => { setEmails(prev => prev.filter(email => email.id !== id)) }

  const getFilteredEmails = () => {
    let filtered = emails.filter(email => email.folder === emailSubTab)
    if (emailSubTab === 'inbox') { filtered = filtered.filter(email => email.category === emailCategory) }
    return filtered
  }

  const handleSendWhatsAppMessage = () => {
    if (!newMessage.trim() || !selectedContact) return
    const contact = whatsappContacts.find(c => c.id === selectedContact)
    if (!contact) return
    const message: WhatsAppMessage = { id: Date.now().toString(), contact: contact.name, phone: contact.phone, message: newMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'sent', incoming: false }
    setWhatsappMessages(prev => [...prev, message])
    setWhatsappContacts(prev => prev.map(c => c.id === selectedContact ? { ...c, lastMessage: newMessage, unread: 0 } : c))
    setNewMessage('')
    setTimeout(() => {
      const reply: WhatsAppMessage = { id: Date.now().toString(), contact: contact.name, phone: contact.phone, message: getRandomReply(), timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'read', incoming: true }
      setWhatsappMessages(prev => [...prev, reply])
      setWhatsappContacts(prev => prev.map(c => c.id === selectedContact ? { ...c, lastMessage: reply.message, unread: c.unread + 1 } : c))
    }, 1000 + Math.random() * 2000)
  }

  const getRandomReply = () => {
    const replies = ["Thanks for your message!", "I'll get back to you soon.", "Can we talk about this later?", "Sounds good!", "I'm busy right now, will reply properly later.", "Got it, thanks!", "Let me check and get back to you."]
    return replies[Math.floor(Math.random() * replies.length)]
  }

  const getContactName = (contactId: string) => { return whatsappContacts.find(c => c.id === contactId)?.name || contactId }
  const handleClientSelect = (email: string) => { setComposeData(prev => ({ ...prev, to: email })) }

  return (
    <div className={`flex h-screen ${bgColor} ${textColor}`}>
      {/* Sidebar */}
      <div className={`w-64 ${cardBg} border-r ${borderColor} p-4 rounded-3xl border ${neon ? ns.sidebar : ''}`}>
        {/* Main Tabs - Email/WhatsApp */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className={`grid grid-cols-2 rounded-full ${neon ? 'bg-slate-800 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,255,255,0.1)]' : `${borderColor} border`} w-full mb-6`}>
            <TabsTrigger 
              value="email" 
              className={`rounded-full ${activeTab === 'email' ? (neon ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_8px_rgba(0,255,255,0.2)]' : `${highlightBg} ${textColor}`) : (neon ? 'text-slate-400 hover:text-cyan-400' : '')}`}
            >
              <Mail className="h-4 w-4 mr-2" /> Email
            </TabsTrigger>
            <TabsTrigger 
              value="whatsapp" 
              className={`rounded-full ${activeTab === 'whatsapp' ? (neon ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.2)]' : `${highlightBg} ${textColor}`) : (neon ? 'text-slate-400 hover:text-emerald-400' : '')}`}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Email Sidebar Content */}
        {activeTab === 'email' && (
          <>
            <Button
              className={`w-full rounded-full mb-5 ${neon ? ns.btnOutline : getButtonClasses(theme, 'outline')}`}
              onClick={() => login()}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z" />
                <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z" />
                <path fill="#FBBC05" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.706-.1-1.417-.264-2.09H12v4.09h6.44a5.09 5.09 0 0 1-2.2 3.32L19.834 21z" />
                <path fill="#4285F4" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067z" />
              </svg>
              Login with Gmail
            </Button>

            <Button
              className={`w-full rounded-full ${neon ? ns.btnPrimary : getButtonClasses(theme)} mb-6`}
              onClick={openNewCompose}
            >
              <Plus className="mr-2 h-4 w-4" />
              Compose
            </Button>
            
            <nav className="space-y-1">
              {[
                { tab: 'inbox', icon: Inbox, label: 'Inbox', count: emails.filter(e => e.folder === 'inbox' && !e.read).length },
                { tab: 'starred', icon: Star, label: 'Starred' },
                { tab: 'important', icon: Tag, label: 'Important' },
                { tab: 'sent', icon: Send, label: 'Sent' },
                { tab: 'drafts', icon: FileText, label: 'Drafts', count: drafts.length },
                { tab: 'scheduled', icon: Clock, label: 'Scheduled' },
                { tab: 'spam', icon: AlertCircle, label: 'Spam' },
                { tab: 'trash', icon: Trash2, label: 'Trash' },
              ].map(({ tab, icon: Icon, label, count }) => (
                <Button
                  key={tab}
                  variant="ghost"
                  className={`w-full justify-start rounded-full ${emailSubTab === tab ? (neon ? ns.activeNav : `${highlightBg} ${textColor}`) : (neon ? ns.inactiveNav : `hover:${highlightBg} ${mutedText}`)}`}
                  onClick={() => setEmailSubTab(tab as any)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${neon ? ns.badge : `bg-${theme === 'dark' ? 'blue-400' : 'blue-500'} text-white`}`}>
                      {count}
                    </span>
                  )}
                </Button>
              ))}
            </nav>
          </>
        )}

        {/* WhatsApp Sidebar Content */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-2">
            <div className="relative">
              <Input
                placeholder="Search contacts..."
                className={`rounded-full pl-8 ${neon ? ns.input : `${inputBg} ${borderColor}`}`}
              />
              <Search className={`absolute left-3 top-2.5 h-4 w-4 ${neon ? 'text-cyan-400/50' : 'text-muted-foreground'}`} />
            </div>
            
            <div className="space-y-1 mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {clients.map(client => (
                <Button
                  key={client.id}
                  variant="ghost"
                  className={`w-full justify-start rounded-full ${neon ? 'text-slate-300 hover:bg-cyan-500/5 hover:text-cyan-300' : mutedText}`}
                  onClick={() => {
                    const message = `Hi ${client.name}, this is Chetan from Dhanam Financial Services. Let's connect!`;
                    const link = `https://wa.me/${client.phone}?text=${encodeURIComponent(message)}`;
                    window.open(link, "_blank");
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${neon ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-gray-200'}`}>
                    <User className={`h-4 w-4 ${neon ? 'text-cyan-400' : ''}`} />
                  </div>
                  {client.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
            {/* Main Content Area */}
      <div className={`flex-1 ${cardBg} border-r ${borderColor} p-4 rounded-3xl overflow-hidden flex flex-col ml-4 border ${neon ? ns.mainArea : ''}`}>
        {/* Email Content */}
        {activeTab === 'email' && (
          <>
            {emailSubTab === 'compose' && activeTab === 'email' && !composeManuallyClosed ? (
              /* ─── Compose View ──────────────────────────────── */
              <div className={`${cardBg} rounded-3xl p-4 shadow-sm h-flex`}>
                <h2 className={`text-2xl font-bold mb-6 ${neon ? ns.title : textColor}`}>
                  {selectedDraft ? 'Edit Draft' : 'Compose Email'}
                  <Button variant="ghost" size="sm" className="rounded-full mr-4" onClick={closeCompose}>
                    <X className="h-5 w-5" />
                  </Button>
                </h2>
                
                <Card className={`rounded-2xl ${borderColor} border h-full ${neon ? ns.composeCard : ''}`}>
                  <CardContent className="pt-0 space-y-4 h-full flex flex-col">
                    {/* Recipients Input */}
                    <div className="relative" ref={recipientsRef}>
                      <label htmlFor="to" className={`block text-sm font-medium mb-1 ${neon ? ns.label : mutedText}`}>
                        To
                      </label>
                      <div 
                        className={`flex flex-wrap gap-2 items-center p-2 rounded-lg ${neon ? ns.input : `${inputBg} ${borderColor}`} border min-h-12`}
                        onClick={() => inputRef.current?.focus()}
                      >
                        {recipients.map(email => (
                          <div 
                            key={email} 
                            className={`flex items-center px-3 py-1 rounded-full ${neon ? ns.recipientChip : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} ${textColor}`}`}
                          >
                            <span className="text-sm">{email}</span>
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); removeRecipient(email); }}
                              className={`ml-2 ${neon ? 'text-cyan-400/70 hover:text-cyan-300' : 'text-gray-500 hover:text-gray-700'}`}
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
                          className={`flex-1 min-w-[100px] bg-transparent outline-none ${neon ? 'text-cyan-100 placeholder-slate-500' : textColor}`}
                        />
                      </div>
                      {showSuggestions && suggestions.length > 0 && (
                        <div 
                          className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg ${neon ? ns.suggestionBox : `${cardBg} ${borderColor}`} border max-h-60 overflow-auto`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {suggestions.map((client, index) => (
                            <div
                              key={client.id}
                              className={`px-4 py-2 cursor-pointer ${neon ? (selectedSuggestionIndex === index ? ns.suggestionActive : ns.suggestionInactive) : `hover:${highlightBg} ${textColor} ${selectedSuggestionIndex === index ? highlightBg : ''}`}`}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectSuggestion(client.email); }}
                              onMouseEnter={() => setSelectedSuggestionIndex(index)}
                            >
                              <div className={`font-medium ${neon ? 'text-slate-200' : ''}`}>{client.name}</div>
                              <div className={`text-sm ${neon ? 'text-slate-400' : ''}`}>{client.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Subject Input */}
                    <div>
                      <label htmlFor="subject" className={`block text-sm font-medium mb-1 ${neon ? ns.label : mutedText}`}>
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={composeData.subject}
                        onChange={handleComposeChange}
                        placeholder="Subject"
                        className={`rounded-full ${neon ? ns.input : `${inputBg} ${borderColor}`}`}
                      />
                    </div>
                    
                    {/* Body Textarea */}
                    <div className="flex-1">
                      <Textarea
                        id="body"
                        name="body"
                        value={composeData.body}
                        onChange={handleComposeChange}
                        placeholder="Write your message here..."
                        className={`h-full min-h-[300px] rounded-2xl ${neon ? ns.input : `${inputBg} ${borderColor}`}`}
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between pt-2">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          className={`rounded-full border ${neon ? ns.btnOutline : `${borderColor} hover:${highlightBg} ${getButtonClasses(theme, 'outline')}`}`}
                          onClick={handleSaveDraft}
                        >
                          {selectedDraft ? 'Update Draft' : 'Save Draft'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className={`rounded-full border ${neon ? ns.btnOutline : `${borderColor} hover:${highlightBg} ${getButtonClasses(theme, 'outline')}`}`}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        className={`rounded-full ${neon ? ns.btnPrimary : getButtonClasses(theme)}`}
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
              /* ─── Email List View ─────────────────────────────── */
              <div className="flex flex-col h-full">
                {/* Email Categories (Primary, Social, Promotions) */}
                {emailSubTab === 'inbox' && (
                  <div className={`flex border-b ${borderColor} ${neon ? 'border-cyan-500/15' : ''}`}>
                    {['primary', 'social', 'promotions'].map((cat) => (
                      <button
                        key={cat}
                        className={`flex-1 py-4 text-center font-medium capitalize ${emailCategory === cat ? (neon ? ns.categoryActive : `${textColor} border-b-2 border-blue-500`) : (neon ? ns.categoryInactive : mutedText)}`}
                        onClick={() => setEmailCategory(cat as any)}
                      >
                        {cat}
                      </button>
                    ))}

                    <Button
                      className={`rounded-full ml-auto self-center px-3 py-1 text-xs ${neon ? ns.btnOutline : getButtonClasses(theme, 'outline')}`}
                      variant="outline" 
                      onClick={async () => {
                        if (emailSubTab === 'inbox') { const inboxEmails = await fetchGmail('inbox'); setGmailEmails(inboxEmails); }
                        else if (emailSubTab === 'sent') { const sentEmails = await fetchGmail('sent'); setGmailEmails(sentEmails); }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </Button>
                  </div>
                )}

                {/* Drafts View */}
                {emailSubTab === 'drafts' && (
                  <div className="space-y-4 p-4">
                    {drafts.length > 0 ? (
                      drafts.map(draft => (
                        <Card 
                          key={draft.id} 
                          className={`cursor-pointer ${borderColor} border ${neon ? 'border-cyan-500/10 hover:border-cyan-500/30 hover:shadow-[0_0_10px_rgba(0,255,255,0.08)] transition-all' : ''}`}
                          onClick={() => handleLoadDraft(draft)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className={`font-medium ${neon ? 'text-slate-200' : ''}`}>{draft.subject || '(No subject)'}</h3>
                                <p className={`text-sm ${neon ? 'text-slate-400' : 'text-muted-foreground'}`}>To: {draft.to || '(No recipient)'}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`${neon ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:shadow-[0_0_8px_rgba(248,113,113,0.3)]' : 'text-muted-foreground hover:text-destructive'}`}
                                onClick={(e) => { e.stopPropagation(); handleDeleteDraft(draft.id); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-4">
                            <p className={`text-sm line-clamp-2 ${neon ? 'text-slate-400' : 'text-muted-foreground'}`}>
                              {draft.body || '(No content)'}
                            </p>
                            <p className={`text-xs mt-2 ${neon ? 'text-slate-500' : 'text-muted-foreground'}`}>
                              Last edited: {draft.lastEdited}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className={`text-center py-12 ${neon ? ns.emptyState : mutedText}`}>
                        <FileText className={`mx-auto h-12 w-12 ${neon ? ns.emptyIcon : ''}`} />
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
                              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                !email.read 
                                  ? (neon ? ns.emailRowUnread : `bg-blue-50 border-l-4 border-l-blue-500 dark:bg-blue-900/30`)
                                  : (neon ? ns.emailRow : `${highlightBg} ${borderColor} border`)
                              }`}
                              onClick={() => {
                                if (selectedEmail?.id === email.id) { setSelectedEmail(null); }
                                else {
                                  if (!email.read) {
                                    if (!gmailEmails.some(e => e.id === email.id)) {
                                      setEmails(prev => prev.map(e => e.id === email.id ? {...e, read: true} : e));
                                    } else {
                                      setGmailEmails(prev => prev.map(e => e.id === email.id ? {...e, read: true} : e));
                                    }
                                  }
                                  setSelectedEmail(email);
                                }
                              }}
                            >
                              <div className="flex items-center space-x-4 w-full">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); if (!gmailEmails.some(e => e.id === email.id)) { toggleStarEmail(email.id); }}}
                                    className={`${neon ? (email.starred ? ns.starActive : ns.starInactive) : 'text-gray-400 hover:text-yellow-400'} ${gmailEmails.some(e => e.id === email.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={gmailEmails.some(e => e.id === email.id)}
                                  >
                                    <Star className={`h-5 w-5 ${email.starred ? 'fill-yellow-400' : ''} ${!neon && email.starred ? 'text-yellow-400' : ''}`} />
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); if (!gmailEmails.some(e => e.id === email.id)) { toggleImportantEmail(email.id); }}}
                                    className={`${neon ? (email.important ? ns.importantActive : ns.importantInactive) : 'text-gray-400 hover:text-blue-400'} ${gmailEmails.some(e => e.id === email.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={gmailEmails.some(e => e.id === email.id)}
                                  >
                                    <Tag className={`h-5 w-5 ${email.important ? 'fill-blue-400' : ''} ${!neon && email.important ? 'text-blue-400' : ''}`} />
                                  </button>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h3 className={`truncate ${!email.read ? (neon ? 'text-cyan-200 font-bold drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]' : 'font-bold text-blue-600 dark:text-blue-300') : (neon ? 'text-slate-300' : textColor)}`}>
                                      {email.folder === 'sent' ? email.to : email.from}
                                    </h3>
                                    <p className={`text-xs whitespace-nowrap ml-2 ${!email.read ? (neon ? 'text-cyan-400/70 font-bold' : 'font-bold text-blue-600 dark:text-blue-300') : (neon ? 'text-slate-500' : mutedText)}`}>
                                      {new Date(email.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                  </div>
                                  <p className={`truncate ${!email.read ? (neon ? 'text-slate-200 font-semibold' : 'font-bold') : (neon ? 'text-slate-400' : textColor)}`}>
                                    {email.subject}
                                  </p>
                                  <p className={`text-sm truncate ${!email.read ? (neon ? 'text-slate-400 font-medium' : 'font-medium text-gray-700 dark:text-gray-300') : (neon ? 'text-slate-500' : mutedText)}`}>
                                    {email.body.split('\n')[0].substring(0, 100)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Email View */}
                            {selectedEmail?.id === email.id && (
                              <div className={`mt-2 mb-4 ${cardBg} rounded-lg p-4 ${borderColor} border ${neon ? ns.emailDetail : ''}`}>
                                <div className="mb-4">
                                  <h2 className={`text-xl font-bold ${neon ? ns.title : textColor}`}>
                                    {selectedEmail.subject}
                                  </h2>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className={neon ? 'text-slate-300' : textColor}>
                                      From: {selectedEmail.from}
                                      {selectedEmail.to && ` | To: ${selectedEmail.to}`}
                                    </p>
                                    <p className={`text-sm ${neon ? 'text-slate-500' : mutedText}`}>
                                      {new Date(selectedEmail.date).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div
                                  className={`prose max-w-none ${neon ? 'text-slate-300' : textColor}`}
                                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                                />

                                <div className="flex space-x-2 mt-4">
                                  {!gmailEmails.some(e => e.id === email.id) && (
                                    <>
                                      <Button variant="outline" className={`rounded-full ${neon ? ns.btnOutline : ''}`} onClick={() => archiveEmail(selectedEmail.id)}>
                                        <Archive className="h-4 w-4 mr-2" /> Archive
                                      </Button>
                                      <Button variant="outline" className={`rounded-full ${neon ? ns.btnOutline : ''}`} onClick={() => markAsSpam(selectedEmail.id)}>
                                        <AlertCircle className="h-4 w-4 mr-2" /> Report Spam
                                      </Button>
                                    </>
                                  )}
                                  <Button variant="outline" className={`rounded-full ${neon ? ns.btnDanger : ''}`} onClick={() => { if (gmailEmails.some(e => e.id === email.id)) { setSelectedEmail(null); } else { moveToTrash(selectedEmail.id); } }}>
                                    <Trash2 className="h-4 w-4 mr-2" /> {gmailEmails.some(e => e.id === email.id) ? 'Close' : 'Delete'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-12 ${neon ? ns.emptyState : mutedText}`}>
                        <Mailbox className={`mx-auto h-12 w-12 ${neon ? ns.emptyIcon : ''}`} />
                        <p className="mt-2">No client emails found in {emailCategory} category</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Actions Footer */}
                {selectedEmail && (
                  <div className={`border-t ${borderColor} p-4 ${cardBg} ${neon ? 'border-cyan-500/15' : ''}`}>
                    <div className="flex space-x-2">
                      <Button variant="outline" className={`rounded-full ${neon ? ns.btnOutline : ''}`} onClick={() => archiveEmail(selectedEmail.id)}>
                        <Archive className="h-4 w-4 mr-2" /> Archive
                      </Button>
                      <Button variant="outline" className={`rounded-full ${neon ? ns.btnOutline : ''}`} onClick={() => markAsSpam(selectedEmail.id)}>
                        <AlertCircle className="h-4 w-4 mr-2" /> Report Spam
                      </Button>
                      <Button variant="outline" className={`rounded-full ${neon ? ns.btnDanger : ''}`} onClick={() => moveToTrash(selectedEmail.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
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
          <div className={`${cardBg} rounded-3xl p-6 shadow-sm ${borderColor} border ${neon ? 'border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.06)]' : ''}`}>
            {selectedContact ? (
              <>
                <div className={`flex items-center justify-between mb-6 ${neon ? ns.whatsappHeader : ''} pb-4`}>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${neon ? 'bg-emerald-500/10 border border-emerald-500/20' : (theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200')}`}>
                      <User className={`h-5 w-5 ${neon ? 'text-emerald-400' : ''}`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${neon ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]' : textColor}`}>
                        {getContactName(selectedContact)}
                      </h2>
                      <p className={`text-sm ${neon ? 'text-slate-400' : mutedText}`}>
                        {whatsappContacts.find(c => c.id === selectedContact)?.phone}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`rounded-full ${neon ? 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10' : mutedText}`}
                    onClick={() => setSelectedContact(null)}
                  >
                    Back
                  </Button>
                </div>

                <div className={`rounded-2xl ${borderColor} border p-4 mb-4 h-[500px] overflow-y-auto ${neon ? 'border-emerald-500/15 bg-slate-900/50' : ''}`}>
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
                                ? (neon ? ns.whatsappBubbleIncoming : `${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`)
                                : (neon ? ns.whatsappBubbleOutgoing : `${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500 text-white'}`)
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p className={`text-xs mt-1 text-right ${
                              msg.incoming 
                                ? (neon ? 'text-slate-500' : mutedText) 
                                : (neon ? 'text-cyan-400/60' : 'text-blue-100')
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
                    className={`rounded-full flex-1 ${neon ? ns.input : `${inputBg} ${borderColor}`}`}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendWhatsAppMessage()}
                  />
                  <Button 
                    className={`rounded-full ${neon ? ns.btnSuccess : getButtonClasses(theme, 'success')}`}
                    onClick={handleSendWhatsAppMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className={`text-center py-12 ${neon ? ns.emptyState : mutedText}`}>
                <MessageSquare className={`mx-auto h-12 w-12 ${neon ? ns.emptyIcon : ''}`} />
                <h3 className={`text-xl font-bold mt-4 ${neon ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]' : textColor}`}>WhatsApp Messages</h3>
                <p className={`mt-2 ${neon ? 'text-slate-500' : mutedText}`}>Select a contact to start chatting</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}