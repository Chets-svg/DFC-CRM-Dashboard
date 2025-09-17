import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState,useRef, useCallback, createContext, useContext } from 'react';
import { Calendar } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Pause, Play } from "lucide-react";
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import React from 'react';
import InvestmentTracker from '@/components/investment-tracker'
import { formatCurrency } from "@/lib/utils" // You'll need to create this utility
import 'react-calendar/dist/Calendar.css';
import { Calendar as ReactCalendar } from 'react-calendar';
import { useInvestmentData } from "@/components/investment-tracker";
import { logout } from '@/lib/firebase-config';
import { saveUserThemePreference } from '@/lib/firebase-config'
import { ThemeName, themes, getButtonClasses } from '@/lib/theme';
import ClientCelebrations from './client-celebrations';
import { EmailComponent } from '/src/components/email.tsx'
import { Toaster } from 'react-hot-toast'
import { BirthdayBanner } from '@/components/birthday-banner';
import EnhancedTaskTab from './enhanced-task-tab';
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeProvider } from '@/components/theme-provider'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Heart, MoreVertical } from "lucide-react";
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import CommunicationTab from './communication-tab'; // Adjust path as needed
import KYCTab from './kyc-tab'; // Adjust path as needed
import LeadsTab from './leads-tab'; // Adjust path as needed
import SIPRemindersTab from './sip-reminders-tab'; // Adjust path as needed
import ClientsTab from './clients-tab'; // Adjust path as needed
import { InvestmentSummaryCards } from './investment-summary-cards';

import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { doc, onSnapshot, setDoc, getDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/auth-context';
import { 
  Sun, 
  Moon, 
  Users, 
  Shield, 
  Mail, 
  User, 
  Plus, 
  Edit, 
  Check, 
  X,
  Activity,
  BarChart2,
  TrendingUp,
  PieChart,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  Phone,
  CalendarDays, 
  Bell,
  ListChecks,
  CheckCircle, Trash2, 
  FileText, CreditCard, FileSignature, ThumbsUp, CalendarCheck, ExternalLink, ChevronLeft, ChevronRight, MessageSquare, Home
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { 
  addDocument, 
  updateDocument, 
  deleteDocument, 
  subscribeToCollection,
  LEADS_COLLECTION,
  CLIENTS_COLLECTION,
  COMMUNICATIONS_COLLECTION,
  SIP_REMINDERS_COLLECTION,
  ACTIVITIES_COLLECTION,
  KYCS_COLLECTION
} from "@/lib/firebase-config";

type CommunicationType = 'email' | 'whatsapp' | 'call' | 'meeting' | 'document';
type CommunicationPriority = 'low' | 'medium' | 'high';
type CommunicationStatus = 'pending' | 'sent' | 'received' | 'read' | 'failed';

interface ThemeSelectorProps {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}
type ViewMode = 'grid' | 'list'

interface AddSIPReminderFormProps {
  theme: ThemeName;
}

type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo: string;
  clientId?: string;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
}

interface TimeoutWarningModalProps {
  theme: ThemeName;
}

type ActivityType = 'all' | 'login' | 'task' | 'system' | 'notification';
interface ActivityItem {
  id: string;
  type: 'login' | 'task' | 'system' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: 'completed' | 'failed';
}

interface Event {
  date: Date;
  title: string;
  time: string;
  description?: string;
}
interface DashboardCalendarProps {
  theme: ThemeName;
}

function DashboardCalendar({ theme }: DashboardCalendarProps) {
  const [date, setDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(true);
  const [activeDate, setActiveDate] = useState<Date | null>(new Date());

  const currentTheme = themes[theme] || themes['blue-smoke']; // Fallback to 'blue-smoke' if theme is invalid

  // Sample events data
  const events: Event[] = [
    { 
      date: new Date(2023, 5, 15), 
      title: 'Client Meeting', 
      time: '10:00 AM',
      description: 'Quarterly portfolio review with John Doe from Acme Inc.' 
    },
    { 
      date: new Date(2023, 5, 20), 
      title: 'SIP Due', 
      time: 'All Day',
      description: 'Monthly SIP payment for Robert Johnson' 
    },
    { 
      date: new Date(2023, 5, 25), 
      title: 'Portfolio Review', 
      time: '2:30 PM',
      description: 'Discuss investment strategy with Jane Smith' 
    },
    { 
      date: new Date(), 
      title: 'Today\'s Event', 
      time: '3:00 PM',
      description: 'Demo meeting with potential client' 
    },
  ];

  const VALID_TABS = [
  'dashboard',
  'leads',
  'kyc',
  'clients',
  'crm',
  'sip',
  'communication',
  'email',
  'tasks',
  'investment-tracker'
];

  // Custom class for days with events
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const hasEvents = events.some(
        event => event.date.toDateString() === date.toDateString()
      );
      return hasEvents ? (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></div>
      ) : null;
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    // ... your implementation
  };

  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };
return (
    <Card className={`${currentTheme.cardBg} ${currentTheme.borderColor}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Upcoming Events</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
            className={getButtonClasses(theme, 'outline')}
          >
            {showCalendar ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Hide Calendar
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show Calendar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCalendar && (
          <div className="flex flex-col">
            {/* Calendar Component */}
            <div className="mb-4">
              <ReactCalendar
  onChange={(value) => {
    setDate(value as Date);
    setActiveDate(value as Date);
  }}
  value={date}
  className={`
    react-calendar
    bg-inherit
    text-inherit
    border-inherit
    rounded-md
    [&_.react-calendar__navigation]:bg-inherit
    [&_.react-calendar__navigation__label]:text-inherit
    [&_.react-calendar__navigation__arrow]:text-inherit
  `}
  tileContent={tileContent}
  tileClassName={({ date, view }) => `
    ${view === 'month' ? 'h-12' : ''}
    ${date.toDateString() === new Date().toDateString() ? 
      'react-calendar__tile--now' : ''}
    hover:bg-opacity-10
  `}
  navigationLabel={({ label }) => (
    <span className="text-inherit font-medium">{label}</span>
  )}
  formatMonthYear={(locale, date) =>
    new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(date)
  }
  minDetail="month"
  prev2Label={null}
  next2Label={null}
/>
            </div>

            {/* Events for selected date */}
            <div className="mt-4">
              <h3 className="font-medium mb-3">
                {activeDate?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h3>
              
              {getEventsForDate(activeDate || new Date()).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(activeDate || new Date()).map((event, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg ${currentTheme.highlightBg}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${currentTheme.selectedBg}`}>
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold">{event.title}</h4>
                            <span className="text-sm font-medium">
                              {event.time}
                            </span>
                          </div>
                          {event.description && (
                            <p className="mt-2 text-sm">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-4 text-center rounded-lg ${currentTheme.highlightBg}`}>
                  <p className={`text-sm ${currentTheme.mutedText}`}>
                    No events scheduled for this day
                  </p>
                </div>
              )}
            </div>

            {/* Upcoming Events (when not viewing today) */}
            {activeDate?.toDateString() !== new Date().toDateString() && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Today's Events</h3>
                {getEventsForDate(new Date()).length > 0 ? (
                  <div className="space-y-3">
                    {getEventsForDate(new Date()).map((event, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg ${currentTheme.highlightBg}`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <p className="mt-1 text-sm">{event.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${currentTheme.mutedText}`}>
                    No events today
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Compact view when calendar is hidden */}
        {!showCalendar && (
          <div className="space-y-4">
            <h3 className="font-medium">Upcoming Events</h3>
            {events
              .filter(e => e.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 3)
              .map((event, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${currentTheme.highlightBg}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{event.title}</span>
                    <span className={`text-xs ${currentTheme.mutedText}`}>
                      {event.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span className="text-xs">{event.time}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ThemeSelector({ theme, setTheme }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = themes[theme] || themes['blue-smoke'];

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        className={`flex items-center gap-2 ${getButtonClasses(theme, 'outline')}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-4 h-4 rounded-full" style={{ 
          backgroundColor: themes[theme].buttonBg.replace('bg-[', '').replace(']', '')
        }} />
        <span>Theme</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </Button>
      
      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${currentTheme.cardBg} ${currentTheme.borderColor}`}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-1">
            {Object.entries(themes).map(([themeName, themeColors]) => (
              <button
                key={themeName}
                onClick={() => {
                  setTheme(themeName as ThemeName);
                  setIsOpen(false);
                }}
                className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                  theme === themeName 
                    ? currentTheme.selectedBg 
                    : `hover:${currentTheme.highlightBg}`
                } ${currentTheme.textColor}`}
              >
                <div className="w-4 h-4 rounded-full mr-3" style={{ 
                  backgroundColor: themeColors.buttonBg.replace('bg-[', '').replace(']', '')
                }} />
                <span className="capitalize">{themeName.replace('-', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getUserThemePreference = async (userId: string): Promise<ThemeName> => {
  try {
    const docRef = doc(db, 'userPreferences', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Validate the theme exists in your themes object
      if (data.theme && themes[data.theme as ThemeName]) {
        return data.theme as ThemeName;
      }
    }
    // Return default theme if no preference found or invalid
    return 'blue-smoke';
  } catch (error) {
    console.error('Error getting theme preference:', error);
    return 'blue-smoke'; // Fallback to default
  }
};

function TimeoutWarningModal({ theme }: TimeoutWarningModalProps) {
  const { 
    inactiveTime, 
    showTimeoutWarning, 
    resetInactivityTimer,
    logout
  } = useAuth();
  const currentTheme = themes[theme] || themes['blue-smoke'];

  if (!showTimeoutWarning) return null;

  const minutes = Math.floor(inactiveTime / 60);
  const seconds = inactiveTime % 60;

  const handleContinue = () => {
    resetInactivityTimer();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className={`timeout-modal p-6 rounded-lg ${currentTheme.cardBg} ${currentTheme.borderColor} max-w-md w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">Session Timeout Warning</h3>
        <p className="mb-4">Your session is about to expire due to inactivity.</p>
        <p className="mb-6">Would you like to continue your session?</p>
        
        {/* Countdown timer */}
        <div className="mb-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Time remaining
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            onClick={handleContinue}
            className={getButtonClasses(theme)}
          >
            Continue Session
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className={getButtonClasses(theme, 'outline')}
          >
            Log Out Now
          </Button>
        </div>
      </div>
    </div>
  );
}
export default function CRMDashboard() {
  const [theme, setTheme] = useState<ThemeName>('blue-smoke'); // Default to blue-smoke
  const [previousLightTheme, setPreviousLightTheme] = useState<ThemeName>('blue-smoke');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState('');
  const [whatsappContent, setWhatsappContent] = useState('');
const [alertOpen, setAlertOpen] = useState(false);
const [alertMessage, setAlertMessage] = useState("");
const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date())
const [meetingNotes, setMeetingNotes] = useState("")
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
const [leads, setLeads] = useState<Lead[]>([]);
const [clients, setClients] = useState<Client[]>([]);
const [communications, setCommunications] = useState<EnhancedCommunication[]>([]);
const [sipReminders, setSipReminders] = useState<SIPReminder[]>([]);
const [activities, setActivities] = useState<ActivityItem[]>([]);
const [kycs, setKycs] = useState<KYC[]>([]);
const [isAdding, setIsAdding] = useState(false)
const [editingId, setEditingId] = useState<string | null>(null)
const [clientSortField, setClientSortField] = useState<ClientSortField>('createdAt');


const [clientSortDirection, setClientSortDirection] = useState<'asc' | 'desc'>('desc');
const showAlert = useCallback((message: string) => {
  setAlertMessage(message);
  setAlertOpen(true);
  toast(message); // This will show the toast notification
}, []);

{alertOpen && (
  <div className="fixed top-4 right-4 z-50">
    <div className={`p-4 rounded-lg shadow-lg ${themes[theme].cardBg} ${themes[theme].borderColor} border`}>
      <div className="flex items-center">
        <span className="text-green-500 mr-2">✓</span>
        <span>{alertMessage}</span>
        <button 
          onClick={() => setAlertOpen(false)}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
)}


const handleLogout = useCallback(async () => {
  try {
    await logout();
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
    toast.error('Logout failed. Please try again.');
  }
}, []);

const [amountInput, setAmountInput] = useState(''); 
const [themeLoading, setThemeLoading] = useState(true);
const [tabLoading, setTabLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState('');
const [investments, setInvestments] = useState<any[]>([]);
const [editingClient, setEditingClient] = useState<Client | null>(null);

const getClientPrimaryProduct = (client: Client) => {
  // Check for any mutual fund product first
  if (client.products.mutualFund || client.products.sip || client.products.lumpsum) {
    return 'mutualFund';
  }
  if (client.products.healthInsurance) return 'healthInsurance';
  if (client.products.lifeInsurance) return 'lifeInsurance';
  if (client.products.taxation) return 'taxation'; // Add this
  if (client.products.nps) return 'nps'; // Add this
  return 'mutualFund'; // Default to mutual fund if no product is selected
};

const filteredClients = useMemo(() => {
  const searchedClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  return [...searchedClients].sort((a, b) => {
    let comparison = 0;
    
    if (clientSortField === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (clientSortField === 'name') {
      comparison = (a.name || '').localeCompare(b.name || '');
    } else if (clientSortField === 'products') {
      const productA = getClientPrimaryProduct(a);
      const productB = getClientPrimaryProduct(b);
      comparison = productA.localeCompare(productB);
    }
    
    return clientSortDirection === 'asc' ? comparison : -comparison;
  });
}, [clients, searchTerm, clientSortField, clientSortDirection]);

const SortControls = () => (
  <div className="flex items-center gap-1">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setClientSortDirection('asc')}
      className={`p-1 h-8 w-8 ${clientSortDirection === 'asc' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
    >
      <ChevronUp className="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setClientSortDirection('desc')}
      className={`p-1 h-8 w-8 ${clientSortDirection === 'desc' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
    >
      <ChevronDown className="h-4 w-4" />
    </Button>
  </div>
);

const getInitialTab = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  }
  return 'dashboard';
};

const [activeTab, setActiveTab] = useState<string>(getInitialTab());

const [emailComponentProps, setEmailComponentProps] = useState({
  defaultRecipient: '',
  openCompose: false
});

const { 
  user, 
  logout, 
  inactiveTime, 
  resetInactivityTimer
} = useAuth();

const location = useLocation();
 if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

const PRODUCT_COLORS = {
  mutualFund: 'bg-blue-300 text-blue-900 border-blue-900',
  healthInsurance: 'bg-green-200 text-green-900 border-green-900',
  lifeInsurance: 'bg-purple-200 text-purple-800 border-purple-900',
  taxation: 'bg-orange-200 text-orange-900 border-orange-900', // Add this
  nps: 'bg-teal-200 text-teal-900 border-teal-900' // Add this
};
const handleTabChange = (value: string) => {
  setActiveTab(value);
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set('tab', value);
  window.history.pushState({}, '', newUrl);
};

const sortClients = (clients: Client[]) => {
  return [...clients].sort((a, b) => {
    let comparison = 0;
    
    if (clientSortField === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (clientSortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (clientSortField === 'products') {
      const productA = getClientPrimaryProduct(a);
      const productB = getClientPrimaryProduct(b);
      comparison = productA.localeCompare(productB);
    }
    
    return clientSortDirection === 'asc' ? comparison : -comparison;
  });
};

const sortedLeads = [...leads].sort((a, b) => 
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

  useEffect(() => {
  const unsubscribeLeads = subscribeToCollection(LEADS_COLLECTION, (data) => {
    setLeads(data as Lead[]);
  });

  const unsubscribeClients = subscribeToCollection(CLIENTS_COLLECTION, (data) => {
    setClients(data as Client[]);
  });
  
  const unsubscribeComms = onSnapshot(
    collection(db, COMMUNICATIONS_COLLECTION),
    (snapshot) => {
      const commsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EnhancedCommunication[];
      console.log("Communications data loaded:", commsData); // Debug log
      setCommunications(commsData);
    },
    (error) => {
      console.error("Error loading communications:", error);
      showAlert("Failed to load communications. Please refresh the page.");
    }
  );

  const unsubscribeSIPs = subscribeToCollection(SIP_REMINDERS_COLLECTION, (data) => {
    setSipReminders(data as SIPReminder[]);
  });

  const unsubscribeActivities = subscribeToCollection(ACTIVITIES_COLLECTION, (data) => {
    setActivities(data as ActivityItem[]);
  });

  // Fix the KYC subscription
  const unsubscribeKYCs = onSnapshot(collection(db, KYCS_COLLECTION), 
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("KYC Data Loaded:", data); // Debug log
      setKycs(data as KYC[]);
    },
    (error) => {
      console.error("Error loading KYCs:", error);
      // Show error to user
      showAlert("Failed to load KYC data. Please refresh the page.");
    }
  );

  return () => {
    unsubscribeLeads();
    unsubscribeClients();
    unsubscribeComms();
    unsubscribeSIPs();
    unsubscribeActivities();
    unsubscribeKYCs();
  };
}, []);

console.log("Firestore instance:", db);
console.log("KYCs collection path:", collection(db, KYCS_COLLECTION).path);

// Update your CRUD operations to use Firestore:

// For leads
const addLead = async () => {
  if (!newLead.name.trim() || !newLead.email.trim() || !newLead.phone.trim() || newLead.productInterest.length === 0) {
    showAlert('Please fill in all required fields and select at least one product');
    return;
  }

  const leadData = {
    name: newLead.name.trim(),
    email: newLead.email.trim(),
    phone: newLead.phone.trim(),
    productInterest: newLead.productInterest,
    status: 'new' as const,
    progressStatus: newLead.productInterest.some(p => p.includes('Mutual Funds')) 
      ? 'lead-generated' as const 
      : 'kyc-started' as const,
    notes: [], // Initialize empty notes array
    createdAt: new Date().toISOString() // Add current timestamp
  };

  try {
    await addDocument(LEADS_COLLECTION, leadData);
    setNewLead({ name: '', email: '', phone: '', productInterest: [] });
    showAlert('Lead added successfully');
  } catch (error) {
    showAlert('Error adding lead');
    console.error(error);
  }
};

const updateLeadStatus = async (id: string, status: Lead['status']) => {
  try {
    await updateDocument(LEADS_COLLECTION, id, { status });
  } catch (error) {
    showAlert('Error updating lead status');
    console.error(error);
  }
};

const deleteLead = async (id: string) => {
  try {
    await deleteDocument(LEADS_COLLECTION, id);
    showAlert('Lead deleted successfully');
  } catch (error) {
    showAlert('Error deleting lead');
    console.error(error);
  }
};

//Lead Progress Status

const updateLeadProgress = async (leadId: string, newStatus: ProgressStatus) => {
  try {
    await updateDocument(LEADS_COLLECTION, leadId, { progressStatus: newStatus });
    
    // Add activity log
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      await addDocument(ACTIVITIES_COLLECTION, {
        type: 'task',
        title: 'Lead Progress Updated',
        description: `Updated ${lead.name}'s progress to ${newStatus}`,
        timestamp: new Date().toISOString(),
        status: 'completed',
      });
    }
  } catch (error) {
    showAlert('Error updating lead progress');
    console.error(error);
  }
};

// For clients
const addClient = async (clientData: Omit<Client, 'id'>) => {
  try {
    await addDocument(CLIENTS_COLLECTION, clientData);
    showAlert('Client added successfully');
    return true;
  } catch (error) {
    showAlert('Error adding client');
    console.error(error);
    return false;
  }
};

const updateClient = async (id: string, clientData: Partial<Client>) => {
  try {
    await updateDocument(CLIENTS_COLLECTION, id, clientData);
    return true;
  } catch (error) {
    console.error('Error updating client:', error);
    showAlert('Error updating client');
    return false;
  }
};

const deleteClient = async (id: string) => {
  try {
    await deleteDocument(CLIENTS_COLLECTION, id);
    showAlert('Client deleted successfully');
  } catch (error) {
    showAlert('Error deleting client');
    console.error(error);
  }
};

// For communications
const addCommunication = async (commData: Omit<EnhancedCommunication, 'id'>) => {
  try {
    await addDocument(COMMUNICATIONS_COLLECTION, commData);
    showAlert('Communication added successfully');
  } catch (error) {
    showAlert('Error adding communication');
    console.error(error);
  }
};

// For SIP reminders
const addSIPReminder = async (reminderData: Omit<SIPReminder, 'id'>) => {
  try {
    await addDocument(SIP_REMINDERS_COLLECTION, reminderData);
    showAlert('SIP reminder added successfully');
  } catch (error) {
    showAlert('Error adding SIP reminder');
    console.error(error);
  }
};

const updateSIPReminder = async (id: string, reminderData: Partial<SIPReminder>) => {
  try {
    await updateDocument(SIP_REMINDERS_COLLECTION, id, reminderData);
    showAlert('SIP reminder updated successfully');
  } catch (error) {
    showAlert('Error updating SIP reminder');
    console.error(error);
  }
};

const AmountInput = ({ value, onChange }) => {
  const [internalValue, setInternalValue] = useState(value === 0 ? '' : value.toString());

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setInternalValue(val);
      onChange(val === '' ? 0 : parseFloat(val) || 0);
    }
  };

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={internalValue}
      onChange={handleChange}
      className={`${inputBg} ${borderColor}`}
    />
  );
};

// Update your convertLeadToClient function to use Firestore
const convertLeadToClient = async (leadId: string) => {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;

  // Check if client already exists with this email
  if (clients.some(c => c.email === lead.email)) {
    showAlert('This lead has already been converted to a client');
    return;
  }

  const newClient = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    products: {
      mutualFund: lead.productInterest.some(p => p.includes('Mutual Funds')),
      sip: lead.productInterest.some(p => p.includes('SIP')),
      lumpsum: lead.productInterest.some(p => p.includes('Lumpsum')),
      healthInsurance: lead.productInterest.includes('Health Insurance'),
      lifeInsurance: lead.productInterest.includes('Life Insurance'),
      taxation: lead.productInterest.includes('Taxation Planning'), // Add this
      nps: lead.productInterest.includes('National Pension System (NPS)') // Add this
    },
    sipStartDate: new Date().toISOString().split('T')[0],
    sipNextDate: calculateNextSIPDate('Monthly'),
    createdAt: new Date().toISOString()
  };
  try {
    // First add the new client
    await addDocument(CLIENTS_COLLECTION, newClient);
    
    // Then delete the lead
    await deleteDocument(LEADS_COLLECTION, leadId);
    
    // Add activity log
    await addDocument(ACTIVITIES_COLLECTION, {
      type: 'task',
      title: 'Lead Converted',
      description: `Converted ${lead.name} to client`,
      timestamp: new Date().toISOString(),
      status: 'completed',
    });
    
    setActiveTab('clients');
    showAlert(`${lead.name} has been successfully converted to a client`);
  } catch (error) {
    showAlert('Error converting lead to client');
    console.error(error);
  }
};

function calculateNextSIPDate(frequency: 'Monthly' | 'Quarterly' | 'Yearly'): string {
  const today = new Date();
  let nextDate = new Date(today);
  
  switch (frequency) {
    case 'Monthly':
      nextDate.setMonth(today.getMonth() + 1);
      break;
    case 'Quarterly':
      nextDate.setMonth(today.getMonth() + 3);
      break;
    case 'Yearly':
      nextDate.setFullYear(today.getFullYear() + 1);
      break;
  }
  
  return nextDate.toISOString().split('T')[0];
}

// Update your handleSaveEdit function
const handleSaveEdit = async () => {
  if (!editingClientId) return;

  try {
    const success = await updateClient(editingClientId, editedClient);
    if (success) {
      setEditingClientId(null);
      setEditedClient({});
      showAlert('Client updated successfully');
    }
  } catch (error) {
    console.error('Error updating client:', error);
    showAlert('Error updating client');
  }
};

const handleScheduleMeeting = async () => {
  if (!selectedClientId) {
    showAlert('Please select a client first');
    return;
  }

  const client = clients.find(c => c.id === selectedClientId);
  if (!client) return;

  try {
    // Create the meeting communication document
    await addDocument(COMMUNICATIONS_COLLECTION, {
      clientId: selectedClientId,
      clientName: client.name,
      type: 'meeting',
      date: meetingDate?.toISOString() || new Date().toISOString(),
      subject: 'Scheduled Meeting',
      content: meetingNotes,
      priority: 'medium',
      status: 'pending',
      followUpDate: '',
      relatedProduct: '',
      advisorNotes: 'Meeting scheduled via dashboard'
    });

    // Create activity log
    await addDocument(ACTIVITIES_COLLECTION, {
      type: 'task',
      title: 'Meeting Scheduled',
      description: `Scheduled meeting with ${client.name} for ${meetingDate?.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      status: 'completed'
    });

    setMeetingNotes('');
    showAlert(`Meeting scheduled with ${client.name}`);
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    showAlert('Error scheduling meeting');
  }
};
 const handleAddClient = () => {
    if (!formData.name || !formData.email || !formData.phone) return
    
    const newClient = {
      ...formData,
      id: Date.now().toString()
    }
    
    setClients([...clients, newClient])
    setFormData({ name: '', email: '', phone: '' })
    setIsAdding(false)
    }
    const handleUpdateClient = () => {
    if (!editingId || !formData.name || !formData.email || !formData.phone) return
    
    setClients(clients.map(client => 
      client.id === editingId 
        ? { ...client, ...formData } 
        : client
    ))
    setFormData({ name: '', email: '', phone: '' })
    setEditingId(null)
  }

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
const handleEditClient = (client: Client) => {
  setEditingClientId(client.id);
  setEditedClient({ ...client });
};
const handleDeleteClient = async (id: string) => {
  try {
    // First delete from Firebase
    await deleteDocument(CLIENTS_COLLECTION, id);
    
    // Then update local state
    setClients(clients.filter(client => client.id !== id));
    
    // Show success message
    showAlert('Client deleted successfully');
  } catch (error) {
    console.error('Error deleting client:', error);
    showAlert('Error deleting client');
  }
};

  const cancelForm = () => {
    setFormData({ name: '', email: '', phone: '' })
    setIsAdding(false)
    setEditingId(null)
  }

const handleCancelEdit = () => {
  setEditingClientId(null);
  setEditedClient({});
};

const {
    bgColor,
    textColor,
    cardBg,
    borderColor,
    inputBg,
    mutedText,
    highlightBg,
    selectedBg
  } = themes[theme];

const [newCommunication, setNewCommunication] = useState<{
  type: CommunicationType;
  subject: string;
  content: string;
  priority: CommunicationPriority;
  followUpDate: string;
  relatedProduct: string;
}>({
  type: 'email',
  subject: '',
  content: '',
  priority: 'medium',
  followUpDate: '',
  relatedProduct: ''
});
const getPriorityColor = (priority: CommunicationPriority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
const handleCreateCommunication = async () => {
  if (!selectedClientId) {
    showAlert('Please select a client');
    return;
  }
  if (!newCommunication.subject || !newCommunication.content) {
    showAlert('Please fill in subject and content');
    return;
  }
  try {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) {
      showAlert('Client not found');
      return;
    }

    // Create the communication document
    await addDocument(COMMUNICATIONS_COLLECTION, {
      clientId: selectedClientId,
      clientName: client.name,
      date: new Date().toISOString(),
      status: 'pending',
      ...newCommunication
    });

    // Reset form
    setNewCommunication({
      type: 'email',
      subject: '',
      content: '',
      priority: 'medium',
      followUpDate: '',
      relatedProduct: ''
    });

    showAlert('Communication created successfully');
  } catch (error) {
    console.error('Error creating communication:', error);
    showAlert('Error creating communication');
  }
};

const getStatusColor = (status: CommunicationStatus) => {
  switch (status) {
    case 'pending': return 'bg-blue-100 text-blue-800';
    case 'sent': return 'bg-purple-100 text-purple-800';
    case 'received': return 'bg-green-100 text-green-800';
    case 'read': return 'bg-indigo-100 text-indigo-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const handleSendEmail = () => {
  if (!selectedClientId || !emailContent.trim()) {
    showAlert('Please select a client and enter email content');
    return;
  }

  const client = clients.find(c => c.id === selectedClientId);
  if (!client) return;

  const newCommunication: Communication = {
    id: (communications.length + 1).toString(),
    clientId: selectedClientId,
    type: 'email',
    date: new Date().toISOString(),
    content: emailContent
  };

  const newActivity: ActivityItem = {
    id: `activity-${Date.now()}`,
    type: 'task',
    title: 'Email Sent',
    description: `Sent email to ${client.name}`,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };

  setCommunications([newCommunication, ...communications]);
  setActivities([newActivity, ...activities]);
  setEmailContent('');
  showAlert(`Email sent to ${client.name}`);
};

const handleSendWhatsApp = () => {
  if (!selectedClientId || !whatsappContent.trim()) {
    alert('Please select a client and enter WhatsApp message');
    return;
  }

  const client = clients.find(c => c.id === selectedClientId);
  if (!client) return;

  const newCommunication: Communication = {
    id: (communications.length + 1).toString(),
    clientId: selectedClientId,
    type: 'whatsapp',
    date: new Date().toISOString(),
    content: whatsappContent
  };

  const newActivity: ActivityItem = {
    id: `activity-${Date.now()}`,
    type: 'task',
    title: 'WhatsApp Sent',
    description: `Sent WhatsApp to ${client.name}`,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };

  setCommunications([newCommunication, ...communications]);
  setActivities([newActivity, ...activities]);
  setWhatsappContent('');
  alert(`WhatsApp message sent to ${client.name}`);
};
  
  const [newLead, setNewLead] = useState<Omit<Lead, 'id' | 'status' | 'notes'>>({ 
    name: '', 
    email: '', 
    phone: '', 
    productInterest: '' 
  });
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [activityFilter, setActivityFilter] = useState<ActivityType>('all');

  // Dashboard metrics
  const activeLeads = leads.filter(lead => lead.status !== 'lost').length;
  const convertedClients = clients.length;
  const pendingKYC = leads.filter(lead => 
  lead.progressStatus === 'kyc-started'
).length;
  const conversionRate = leads.length > 0 
    ? Math.round((convertedClients / (convertedClients + leads.length)) * 100) 
    : 0;

  // Chart data
  const leadsVsClientsData = [
    { name: 'Leads', value: leads.length },
    { name: 'Clients', value: clients.length }
  ];

  const leadStatusData = [
    { name: 'New', value: leads.filter(l => l.status === 'new').length },
    { name: 'Contacted', value: leads.filter(l => l.status === 'contacted').length },
    { name: 'Qualified', value: leads.filter(l => l.status === 'qualified').length },
    { name: 'Lost', value: leads.filter(l => l.status === 'lost').length }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Activity data
  
  const filteredActivities = activityFilter === 'all' 
  ? activities 
  : activities.filter(activity => activity.type === activityFilter);

 const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'login':
      return <User className="w-4 h-4 text-blue-500" />;
    case 'task':
      return <ArrowRight className="w-4 h-4 text-green-500" />;
    case 'system':
      return <Plus className="w-4 h-4 text-purple-500" />;
    case 'notification':
      return <Check className="w-4 h-4 text-yellow-500" />;
    default:
      return <Activity className="w-4 h-4 text-gray-500" />;
  }
};

  const getStatusIcon = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const toggleLead = (id: string) => {
    setExpandedLeadId(expandedLeadId === id ? null : id);
  };

  // ✅ Add Note to Lead
const addNoteToLead = async (leadId: string) => {
  if (!newNote.trim()) return;

  const timestampedNote = `${formatDate(new Date())}: ${newNote}`;

  try {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    await updateDocument(LEADS_COLLECTION, leadId, {
      notes: [...lead.notes, timestampedNote]
    });
    
    setNewNote('');
    showAlert('Note added successfully');
  } catch (error) {
    showAlert('Error adding note');
    console.error(error);
  }
};

// ✅ Perform KYC with activity tracking
const performKYC = (leadId: string) => {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;

  // Update KYC status to in-progress
  setKycs(kycs.map(kyc =>
    kyc.leadId === leadId ? { ...kyc, status: 'in-progress' } : kyc
  ));

  // Add KYC started activity
  const startActivity: ActivityItem = {
    id: `activity-${Date.now()}`,
    type: 'task',
    title: 'KYC Started',
    description: `Started KYC for ${lead.name}`,
    timestamp: new Date().toISOString(),
    status: 'in-progress',
  };
  setActivities([startActivity, ...activities]);

  // Simulate KYC completion
  setTimeout(() => {
    setKycs(kycs.map(kyc =>
      kyc.leadId === leadId
        ? {
            ...kyc,
            status: 'completed',
            completedDate: new Date().toISOString().split('T')[0],
          }
        : kyc
    ));

    const completeActivity: ActivityItem = {
      id: `activity-${Date.now()}`,
      type: 'task',
      title: 'KYC Completed',
      description: `Completed KYC for ${lead.name}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };
    setActivities([completeActivity, ...activities]);
  }, 2000);
};
  
// ✅ Refresh Button
<Button 
  variant="outline" 
  onClick={() => {
    setActivities([...activities]); // triggers a rerender
  }}
>
  Refresh
</Button>


useEffect(() => {
  const loadTheme = async () => {
    try {
      if (user?.uid) {
        const savedTheme = await getUserThemePreference(user.uid);
        if (savedTheme) {
          setTheme(savedTheme);
          if (savedTheme !== 'dark') {
            setPreviousLightTheme(savedTheme);
          }
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to default theme
      setTheme('blue-smoke');
      setPreviousLightTheme('blue-smoke');
    } finally {
      setThemeLoading(false);
    }
  };
  
  loadTheme();
}, [user?.uid]);

// Update the theme change handlers
const handleThemeChange = async (newTheme: ThemeName) => {
  // Update local state immediately for better UX
  setTheme(newTheme);
  
  if (newTheme !== 'dark') {
    setPreviousLightTheme(newTheme);
  }
  
  // Save to Firebase
  if (user?.uid) {
    try {
      await saveUserThemePreference(user.uid, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
      // Revert if save fails
      setTheme(theme);
    }
  }
};

const toggleTheme = async () => {
  const newTheme = theme === 'dark' ? previousLightTheme : 'dark';
  setTheme(newTheme);
  
  // Save to Firebase
  if (user?.uid) {
    try {
      await saveUserThemePreference(user.uid, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
      // Revert if save fails
      setTheme(theme);
    }
  }
};
if (themeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

 return (
      <div className={`min-h-screen ${themes[theme].bgColor} ${themes[theme].textColor}`}>
    {/* Timeout Warning Modal */}
<TimeoutWarningModal theme={theme} />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8">
        {/* Header with theme selector */}
         <div className="flex justify-between items-center mb-8">
  <h1 className="text-3xl font-bold">DFS CRM Dashboard</h1>
  <ClientCelebrations clients={clients} />
  <div className="flex items-center gap-2">
    <ThemeSelector theme={theme} setTheme={handleThemeChange} />
    <Toaster position="top-right" />
    {/* Updated Theme Toggle Button */}
    <Button 
      variant="outline" 
      onClick={toggleTheme}
      className={`${getButtonClasses(theme, 'outline')} flex items-center gap-2`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span>Dark Mode</span>
        </>
      )}
    </Button>
    
    {/* Logout Button */}
    <Button 
      onClick={async () => {
        try {
          await logout();
          window.location.href = '/login';
        } catch (error) {
          console.error('Logout failed:', error);
          showAlert('Logout failed. Please try again.');
        }
      }}
      variant="outline"
      className={getButtonClasses(theme, 'danger')}
    >
      Logout
    </Button>
    
    {/* Quick Links Dropdown - Hover Version with Fixed Colors */}
 {/* Quick Links Dropdown - Floating Icon Version */}
<div className="fixed right-4 bottom-4 z-50">
  <div className="group relative">
    {/* Floating Icon Button */}
    <Button 
      variant="default"
      size="icon"
      className={`
        w-12 h-12 rounded-full shadow-lg
        ${theme === 'dark' 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'bg-blue-500 hover:bg-blue-600'}
        text-white transition-all duration-300
      `}
    >
      <MoreVertical className="h-6 w-6" />
    </Button>
    
   {/* Expandable Dropdown Menu */}
<div className={`
  absolute right-0 bottom-full mb-2
  w-56
  ${themes[theme].cardBg} ${themes[theme].borderColor}
  border rounded-lg shadow-xl
  opacity-0 invisible group-hover:opacity-100 group-hover:visible
  transition-all duration-300 ease-in-out
  transform group-hover:translate-y-0 translate-y-2
  z-50
`}>
  <div className="p-2">
    <div className={`px-3 py-2 text-sm font-semibold ${themes[theme].textColor}`}>
      Quick Links
    </div>
    <div className={`h-px ${themes[theme].borderColor} mx-2 my-1`}></div>
    {[
      { name: 'DFS Themebox', url: 'https://dhanamfinser.themfbox.com/' },
      { name: 'CVL KRA Portal', url: 'https://www.cvlkra.com/' },
      { name: 'Edge360 Portal', url: 'https://edge360.camsonline.com/signin' },
      { name: 'Kfintech Portal', url: 'https://mfs.kfintech.com/dit/login' },
      { name: 'MF Utilities Portal', url: 'https://www.mfuonline.com/' },
      { name: 'Turtlemint Pro', url: 'https://app.mintpro.in/home' },
      { name: 'NJ Partner Desk', url: 'https://www.njindiaonline.in/pdesk/login.fin?cmdAction=login' },
      { name: 'Income Tax', url: 'https://www.incometax.gov.in/iec/foportal/' },
      { name: 'Care Health Insurance', url: 'https://faveo.careinsurance.com/NewFaveo/#auth/login' }
    ].map((link, index) => (
      <div 
        key={index}
        className={`
          px-3 py-2 text-sm rounded cursor-pointer flex items-center
          transition-colors duration-200
          ${theme === 'dark' 
            ? 'hover:bg-gray-700 text-gray-200 hover:text-white' 
            : 'hover:bg-gray-100 text-gray-800 hover:text-gray-900'}
        `}
        onClick={() => window.open(link.url, '_blank')}
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        <span className="truncate">{link.name}</span>
      </div>
    ))}
  </div>
</div>
    </div>
  </div>
</div>
</div>


<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className={`grid w-full grid-cols-9 ${theme === 'dark' ? 'bg-gray-700' : highlightBg}`}>
  <TabsTrigger
    value="dashboard"
    className={`${theme === 'dark' ? 'data-[state=active]:bg-gray-600' : 'data-[state=active]:bg-white'} data-[state=active]:border data-[state=active]:border-gray-300`}
  >
    <Activity className="mr-2 h-4 w-4 text-blue-500" /> Dashboard
  </TabsTrigger>
  <TabsTrigger 
    value="leads" 
    className={`${theme === 'dark' ? 'data-[state=active]:bg-gray-600' : 'data-[state=active]:bg-white'} data-[state=active]:border data-[state=active]:border-gray-300`}
  >
    <Users className="mr-2 h-4 w-4 text-green-500" /> Leads
  </TabsTrigger>
  <TabsTrigger 
    value="kyc" 
    className={`${theme === 'dark' ? 'data-[state=active]:bg-gray-600' : 'data-[state=active]:bg-white'} data-[state=active]:border data-[state=active]:border-gray-300`}
  >
    <Shield className="mr-2 h-4 w-4 text-yellow-500" /> KYC
  </TabsTrigger>
  <TabsTrigger 
    value="clients" 
    className={`${theme === 'dark' ? 'data-[state=active]:bg-gray-600' : 'data-[state=active]:bg-white'} data-[state=active]:border data-[state=active]:border-gray-300`}
  >
    <User className="mr-2 h-4 w-4 text-purple-500" /> Clients
  </TabsTrigger>
  
  <TabsTrigger 
    value="sip" 
    className={`${theme === 'dark' ? 'data-[state=active]:bg-gray-600' : 'data-[state=active]:bg-white'} data-[state=active]:border data-[state=active]:border-gray-300`}
  >
    <CalendarDays className="mr-2 h-4 w-4 text-red-500" /> SIP Reminders
  </TabsTrigger>
  <TabsTrigger 
    value="communication" 
    className={`${theme === 'dark' ? 'data-[state=active]:bg-gray-600' : 'data-[state=active]:bg-white'} data-[state=active]:border data-[state=active]:border-gray-300`}
  >
    <Mail className="mr-2 h-4 w-4 text-indigo-500" /> Communication
  </TabsTrigger>
  <TabsTrigger 
  value="email" 
  className={`${theme === 'dark' ? 'data-[state=active]:bg-gray-600' : 'data-[state=active]:bg-white'} data-[state=active]:border data-[state=active]:border-gray-300`}
>
  <Mail theme={theme} /> Email
</TabsTrigger>
<TabsTrigger 
      value="tasks" 
      className={`${theme === 'dark' ? 'data-[state=active]:bg-gray-600' : 'data-[state=active]:bg-white'} data-[state=active]:border data-[state=active]:border-gray-300`}
    >
      <ListChecks className="mr-2 h-4 w-4 text-indigo-500" /> Tasks
    </TabsTrigger>
  <TabsTrigger 
    value="investment-tracker" 
    className={`${theme === 'dark' ? 'data-[state=active]:bg-gray-600' : 'data-[state=active]:bg-white'} data-[state=active]:border data-[state=active]:border-gray-300`}
  >
    <BarChart2 className="mr-2 h-4 w-4 text-teal-500" /> Investment Tracker
  </TabsTrigger>

  </TabsList>
  
<TabsContent value="investment-tracker">
    <InvestmentTracker theme={theme} />
      </TabsContent>        
      
          {/* Dashboard Tab */}
    <TabsContent value="dashboard">
  <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
    {/* First row - Metrics cards */}
    <div className="lg:col-span-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeads}</div>
            <p className={`text-xs ${mutedText}`}>Currently being worked on</p>
          </CardContent>
        </Card>

        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted Clients</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convertedClients}</div>
            <p className={`text-xs ${mutedText}`}>Total successful conversions</p>
          </CardContent>
        </Card>

  <Card className={`${cardBg} ${borderColor}`}>
  <CardHeader 
    className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-pointer"
    onClick={() => setActiveTab("kyc")}
  >
    <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
    <Shield className="h-4 w-4 text-yellow-500" />
  </CardHeader>
  <CardContent 
    className="cursor-pointer"
    onClick={() => setActiveTab("kyc")}
  >
    <div className="text-2xl font-bold">{pendingKYC}</div>
    <p className={`text-xs ${mutedText}`}>Leads in KYC process</p>
  </CardContent>
</Card>

        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className={`text-xs ${mutedText}`}>Leads to clients ratio</p>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Second row - Charts and Activity */}
    {/* Leads vs Clients Chart - Column 1 */}
        <div className="lg:col-span-2">
      <Card className={`${cardBg} ${borderColor} h-full`}>
        <CardHeader>
          <CardTitle>Leads vs Clients</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadsVsClientsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Lead Status Distribution - Column 2 */}
    <div className="lg:col-span-2">
      <Card className={`${cardBg} ${borderColor} h-full`}>
  <CardHeader>
    <CardTitle>Lead Status Distribution</CardTitle>
  </CardHeader>
  <CardContent className="h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={leadStatusData.filter(item => item.value > 0)}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={45}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {leadStatusData
            .filter(item => item.value > 0)
            .map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Pie>
        <Tooltip />
        {leadStatusData.some(item => item.value > 0) && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
    {!leadStatusData.some(item => item.value > 0) && (
      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
        No lead status data available
      </div>
    )}
  </CardContent>
</Card>
    </div>

    {/* New Product Distribution - 2 columns */}
    <div className="lg:col-span-2">
      <Card className={`${cardBg} ${borderColor} h-full`}>
        <CardHeader>
          <CardTitle>Product Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
  data={[
    { 
      name: 'SIP', 
      value: clients.filter(c => c.products.sip).length 
    },
    { 
      name: 'Lumpsum', 
      value: clients.filter(c => c.products.lumpsum).length 
    },
    { 
      name: 'Health Insurance', 
      value: clients.filter(c => c.products.healthInsurance).length 
    },
    { 
      name: 'Life Insurance', 
      value: clients.filter(c => c.products.lifeInsurance).length 
    },
    { 
      name: 'Taxation', 
      value: clients.filter(c => c.products.taxation).length 
    },
    { 
      name: 'NPS', 
      value: clients.filter(c => c.products.nps).length 
    }
  ]}
  cx="45%"
  cy="45%"
  labelLine={false}
  outerRadius={80}
  innerRadius={45}
  fill="#8884d8"
  dataKey="value"
  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
>
  {[
    '#e46b0c', 
    '#00C49F', 
    '#FFBB28', 
    '#0088FE',
    '#FF8042', // Add color for Taxation
    '#A4DE6C'  // Add color for NPS
  ].map((color, index) => (
    <Cell key={`cell-${index}`} fill={color} />
  ))}
</Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

  <div className="lg:col-span-4">
  <Card className={`${cardBg} ${borderColor}`}>
    <CardHeader>
      <CardTitle>Investment Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <InvestmentSummaryCards theme={theme} />
    </CardContent>
  </Card>
</div>
   <div className="lg:col-span-2">
  <Card className={`${cardBg} ${borderColor} h-full`}>
    <CardHeader>
      <CardTitle>Quick Actions</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <Button 
        variant="outline" 
        className={`h-24 flex flex-col items-center justify-center ${getButtonClasses(theme, 'primary')}`}
        onClick={() => {
          setActiveTab("leads");
          // Scroll to top in case the form is below
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <Plus className="h-6 w-6 mb-2" />
        Add New Lead
      </Button>
      
      <Button 
        variant="outline" 
       className={`h-24 flex flex-col items-center justify-center ${getButtonClasses(theme, 'primary')}`}
        onClick={() => {
          setActiveTab("communication");
          // Auto-select the first client if available
          if (clients.length > 0 && !selectedClientId) {
            setSelectedClientId(clients[0].id);
          }
        }}
      >
        <Mail className="h-6 w-6 mb-2" />
        Send Email
      </Button>
      
      <Button 
        variant="outline" 
        className={`h-24 flex flex-col items-center justify-center ${getButtonClasses(theme, 'primary')}`}
        onClick={() => {
          setActiveTab("communication");
          // Set today's date as default for meeting
          setMeetingDate(new Date());
          // Auto-select the first client if available
          if (clients.length > 0 && !selectedClientId) {
            setSelectedClientId(clients[0].id);
          }
        }}
      >
        <CalendarDays className="h-6 w-6 mb-2" />
        Schedule Meeting
      </Button>
      
      <Button 
        variant="outline" 
        className={`h-24 flex flex-col items-center justify-center ${getButtonClasses(theme, 'primary')}`}
        onClick={() => {
          setActiveTab("kyc");
          // Scroll to top in case the form is below
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <Shield className="h-6 w-6 mb-2" />
        Start KYC
      </Button>
    </CardContent>
  </Card>
</div>

<div className="lg:col-span-2">
  <DashboardCalendar theme={theme} />
         </div>
          
    {/* Recent Activity - Column 3 */}
    <div className="lg:col-span-2">
      <Card className={`${cardBg} ${borderColor} h-full`}>
  <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <CardTitle className="text-xl md:text-2xl">Recent Activity</CardTitle>
    <div className="flex gap-2 items-center">
      <Select
        value={activityFilter}
        onValueChange={(value) => setActivityFilter(value as ActivityType)}
      >
        <SelectTrigger className={`w-[180px] ${inputBg} ${borderColor}`}>
          <SelectValue placeholder="All Activities" />
        </SelectTrigger>
        <SelectContent className={`${cardBg} ${borderColor}`}>
          {[
            { value: 'all', label: 'All Activities' },
            { value: 'login', label: 'Logins' },
            { value: 'task', label: 'Tasks' },
            { value: 'system', label: 'System' },
            { value: 'notification', label: 'Notifications' }
          ].map((item) => (
            <SelectItem 
              key={item.value} 
              value={item.value}
              className={`hover:${highlightBg} ${textColor}`}
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

  </CardHeader>
  
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activities found for the selected filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities
              .filter(activity => {
                // Filter activities from the last 7 days
                const activityDate = new Date(activity.timestamp);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return activityDate >= sevenDaysAgo;
              })
              .map(activity => (
                <div 
                  key={activity.id} 
                  className={`p-4 border rounded-lg hover:${highlightBg} transition-colors ${borderColor} cursor-pointer`}
                  onClick={() => {
                    // Navigate to relevant tab based on activity type
                    switch(activity.type) {
                      case 'task':
                        if (activity.title.includes('Lead')) {
                          setActiveTab('leads');
                        } else if (activity.title.includes('Client')) {
                          setActiveTab('clients');
                        } else if (activity.title.includes('KYC')) {
                          setActiveTab('kyc');
                        } else if (activity.title.includes('Meeting') || activity.title.includes('Communication')) {
                          setActiveTab('communication');
                        } else if (activity.title.includes('SIP')) {
                          setActiveTab('sip');
                        }
                        break;
                      case 'system':
                      case 'notification':
                      case 'login':
                      default:
                        // Default to dashboard for other types
                        setActiveTab('dashboard');
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{activity.title}</h3>
                        {getStatusIcon(activity.status)}
                      </div>
                      <p className={`text-sm ${mutedText}`}>{activity.description}</p>
                      {activity.user && (
                        <p className={`text-xs ${mutedText} mt-1`}>User: {activity.user}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
                
              ))}
            </div>
            
          )}
        </CardContent>
      </Card>
    </div>
    <div className="lg:col-span-2 {`${cardBg} ${borderColor}">
      <ClientCelebrations clients={clients}/>
    </div>
       </div>
</TabsContent>
<TabsContent value="email">
  <EmailComponent 
    theme={theme} 
    clients={clients} 
    leads={leads} // Make sure this is passed
    defaultRecipient={emailComponentProps.defaultRecipient}
    openCompose={emailComponentProps.openCompose}
  />
</TabsContent>

<TabsContent value="tasks">
  <EnhancedTaskTab theme={theme} />
</TabsContent>

          {/* Leads Tab */}
         <TabsContent value="leads">
  <LeadsTab
    theme={theme}
    leads={leads}
    addLead={addLead}
    newLead={newLead}
    setNewLead={setNewLead}
    toggleLead={toggleLead}
    expandedLeadId={expandedLeadId}
    updateLeadStatus={updateLeadStatus}
    updateLeadProgress={updateLeadProgress}
    convertLeadToClient={convertLeadToClient}
    addNoteToLead={addNoteToLead}
    newNote={newNote}
    setNewNote={setNewNote}
  />
</TabsContent>
          {/* KYC Tab */}
   <TabsContent value="kyc">
  <KYCTab
    theme={theme}
    leads={leads}
    kycs={kycs}
    showAlert={showAlert}
  />
</TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
  <ClientsTab
    theme={theme}
    clients={clients}
    sipReminders={sipReminders}
    investments={investments}
    searchTerm={searchTerm}
    setSearchTerm={setSearchTerm}
    clientSortField={clientSortField}
    setClientSortField={setClientSortField}
    clientSortDirection={clientSortDirection}
    setClientSortDirection={setClientSortDirection}
    setActiveTab={setActiveTab}
    setEmailComponentProps={setEmailComponentProps}
    showAlert={showAlert}
    updateClient={updateClient}
    setEditingClient={setEditingClient}
    editingClient={editingClient}
    onDeleteClient={handleDeleteClient}
    userId={user?.uid || ''} // Add this line
/>
</TabsContent>

{/* Communication Tab */}
<TabsContent value="communication">
  <CommunicationTab
    theme={theme}
    clients={clients}
    communications={communications}
    selectedClientId={selectedClientId}
    setSelectedClientId={setSelectedClientId}
    showAlert={showAlert}
  />
</TabsContent>

{/* SIP Tab */}
<TabsContent value="sip">
  <SIPRemindersTab 
    theme={theme}
    clients={clients}
    sipReminders={sipReminders}
    setSipReminders={setSipReminders}
  />
</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}