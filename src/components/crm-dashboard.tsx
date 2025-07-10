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

type LeadSortField = 'createdAt' | 'name' | 'status' | 'productInterest';

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

interface KYCDetails {
  fullName: string
  dob: string
  address: string
  idType: 'passport' | 'driver-license' | 'national-id'
  idNumber: string
  status: 'pending' | 'verified' | 'revoked'
}

interface ClientDetailsModalProps {
  client: {
    id: string
    name: string
    email: string
    phone: string
    address: string
    products: {
      sip: boolean
      mutualFunds: boolean
      stocks: boolean
      bonds: boolean
    }
    createdAt: string
    notes: string
    riskProfile: 'conservative' | 'moderate' | 'aggressive'
  }
  theme: ThemeName
}

interface KYCContextType {
  kycData: KYCDetails | null
  loading: boolean
  updateKYC: (data: Partial<KYCDetails>) => Promise<void>
}

interface EnhancedCommunication {
  id: string;
  clientId: string;
  type: CommunicationType;
  date: string;
  subject: string;
  content: string;
  priority: CommunicationPriority;
  status: CommunicationStatus;
  followUpDate?: string;
  relatedProduct?: string;
  advisorNotes?: string;
}

type SIPReminder = {
  id: string;
  clientId: string;
  clientName: string; // Add client name for easier display
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  startDate: string;
  nextDate: string;
  status: 'active' | 'paused' | 'completed';
  lastReminderSent?: string;
  createdAt:String;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  productInterest: string[];
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  notes: string[];
  progressStatus: ProgressStatus; // Make this required
  createdAt: String;
};

interface LeadProgressBarProps {
  status: ProgressStatus;
  onStatusChange: (newStatus: ProgressStatus) => void;
  theme?: 'light' | 'dark';
}

type KYC = {
  id: string;
  leadId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  completedDate?: string;
};
type ClientSortField = 'createdAt' | 'name' | 'products';

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  marriageAnniversary?: string;
  sipStartDate?: string;
  sipNextDate?: string;
  products: {
    mutualFund?: boolean;
    sip?: boolean;
    lumpsum?: boolean;
    healthInsurance?: boolean;
    lifeInsurance?: boolean;
    taxation?: boolean; // Add this
    nps?: boolean; // Add this
  };
  createdAt: string;
};

type ProgressStatus = 'lead-generated' | 'kyc-started' | 'kyc-completed' | 
                     'can-no-generated' | 'can-account-created' | 
                     'mandate-generated' | 'mandate-accepted' | 'sip-setup';

type Stage = {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
};
interface LeadProgressBarProps {
  status?: string;
  onStatusChange?: (newStatus: string) => void;
}

type Communication = {
  id: string;
  clientId: string;
  type: 'email' | 'whatsapp';
  date: string;
  content: string;
};

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


const LEAD_STATUS_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const PRODUCT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

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

export function InvestmentSummaryCards() {
  const { data, loading } = useInvestmentData();

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-lg">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      ))}
    </div>;
  }

  if (!data) {
    return <div className="text-center py-4">No investment data available</div>;
  }

  const calculateTotals = () => {
    const monthlySipTarget = data.records[0]?.sipTarget || 0;
    return {
      sipTarget: monthlySipTarget * 12,
      lumpsumTarget: data.records.reduce((sum, record) => sum + record.lumpsumTarget, 0),
      sipAchieved: data.records.reduce((sum, record) => sum + record.sipAchieved, 0),
      lumpsumAchieved: data.records.reduce((sum, record) => sum + record.lumpsumAchieved, 0),
    };
  };

  const totals = calculateTotals();

  // Calculate progress percentages
  const sipProgress = totals.sipTarget > 0 ? 
    Math.min(100, (totals.sipAchieved / totals.sipTarget) * 100) : 0;
  const lumpsumProgress = totals.lumpsumTarget > 0 ? 
    Math.min(100, (totals.lumpsumAchieved / totals.lumpsumTarget) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* SIP Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SIP Summary (Yearly)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Label>Target:</Label>
            <span className="font-medium">{formatCurrency(totals.sipTarget)}</span>
          </div>
          <div className="flex justify-between">
            <Label>Achieved:</Label>
            <span className="text-primary font-medium">{formatCurrency(totals.sipAchieved)}</span>
          </div>
          <div className="flex justify-between">
            <Label>Deficit:</Label>
            <span className={`font-medium ${
              totals.sipAchieved >= totals.sipTarget ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(totals.sipAchieved - totals.sipTarget)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress: {Math.round(sipProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full bg-primary" 
                style={{ 
                  width: `${sipProgress}%`,
                  transition: 'width 0.5s ease-in-out'
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      

      {/* Lumpsum Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lumpsum Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Label>Target:</Label>
            <span className="font-medium">{formatCurrency(totals.lumpsumTarget)}</span>
          </div>
          <div className="flex justify-between">
            <Label>Achieved:</Label>
            <span className="text-primary font-medium">{formatCurrency(totals.lumpsumAchieved)}</span>
          </div>
          <div className="flex justify-between">
            <Label>Deficit:</Label>
            <span className={`font-medium ${
              totals.lumpsumAchieved >= totals.lumpsumTarget ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(totals.lumpsumAchieved - totals.lumpsumTarget)}
            </span>
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress: {Math.round(lumpsumProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full bg-primary" 
                style={{ 
                  width: `${lumpsumProgress}%`,
                  transition: 'width 0.5s ease-in-out'
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Year Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{data.year} Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <Label>Total Target:</Label>
            <span className="font-medium">
              {formatCurrency(totals.sipTarget + totals.lumpsumTarget)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label>Total Achieved:</Label>
            <span className="text-primary font-medium">
              {formatCurrency(totals.sipAchieved + totals.lumpsumAchieved)}
            </span>
          </div>
          <div className="flex justify-between">
            <Label>Overall Deficit:</Label>
            <span className={`font-medium ${
              (totals.sipAchieved + totals.lumpsumAchieved) >= 
              (totals.sipTarget + totals.lumpsumTarget) ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(
                (totals.sipAchieved + totals.lumpsumAchieved) - 
                (totals.sipTarget + totals.lumpsumTarget)
              )}
            </span>
          </div>
          <div className="pt-2 space-y-2">
            <div className="text-sm">
              <span className="font-medium">Monthly SIP Target: </span>
              {formatCurrency(data.records[0]?.sipTarget || 0)}
            </div>
            <div className="text-sm">
              <span className="font-medium">Annual Lumpsum Target: </span>
              {formatCurrency(data.records[0]?.lumpsumTarget || 0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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

function LeadProgressBar({ 
  status, 
  onStatusChange,
  theme = 'light' 
}: LeadProgressBarProps & { theme?: 'light' | 'dark' }) {
  const stages: Stage[] = [
    { 
      id: 'lead-generated', 
      label: 'Generated', 
      icon: <User className="w-5 h-5" />,
      description: 'Lead has been created in the system',
      actionLink: 'https://www.cvlkra.com/'
    },
    { 
      id: 'Kyc-Status', 
      label: 'KYC Status', 
      icon: <Shield className="w-5 h-5" />,
      description: 'Lead has been created in the system',
      actionLink: 'https://www.cvlkra.com/'
    },
    { 
      id: 'kyc-started', 
      label: 'KYC Started', 
      icon: <FileText className="w-5 h-5" />,
      description: 'KYC process initiated - verification required',
      actionLink: 'https://edge360.camsonline.com/signin', 
    },
    { 
      id: 'kyc-completed', 
      label: 'KYC Done', 
      icon: <Check className="w-5 w-5" />,
      description: 'KYC documents verified and approved',
      actionLink: 'https://www.mfuonline.com/'
    },
    { 
      id: 'can-no-generated', 
      label: 'CAN No.', 
      icon: <CreditCard className="w-5 w-5" />,
      description: 'Client Account Number generated',
      actionLink: 'https://www.mfuonline.com/'
    },
    { 
      id: 'can-account-created', 
      label: 'CAN Account', 
      icon: <Check className="w-5 w-5" />,
      description: 'Investment account created',
      actionLink: 'https://www.mfuonline.com/'
    },
    { 
      id: 'mandate-generated', 
      label: 'Mandate', 
      icon: <FileSignature className="w-5 w-5" />,
      description: 'Auto-debit mandate generated',
      actionLink: 'https://www.mfuonline.com/'
    },
    { 
      id: 'mandate-accepted', 
      label: 'Accepted', 
      icon: <ThumbsUp className="w-5 w-5" />,
      description: 'Mandate approved by client',
      actionLink: 'https://www.mfuonline.com/'
    },
    { 
      id: 'sip-setup', 
      label: 'SIP Done', 
      icon: <CalendarCheck className="w-5 w-5" />,
      description: 'Systematic Investment Plan activated'
    }
  ];

  const currentIndex = stages.findIndex(stage => stage.id === status);
  const isComplete = status === 'sip-setup';

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newStatus = stages[currentIndex - 1].id;
      onStatusChange(newStatus);
    }
  };

  const handleNext = () => {
    if (currentIndex < stages.length - 1) {
      const newStatus = stages[currentIndex + 1].id;
      onStatusChange(newStatus);
    }
  };

  return (
    <div className="relative w-full py-1">
      <div className="flex justify-between items-center mb-5">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        <div className="text-center px-10">
          <p className="text-sm text-muted-foreground">
            {stages[currentIndex]?.description}
          </p>
          {stages[currentIndex]?.actionLink && (
            <a 
              href={stages[currentIndex].actionLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {stages[currentIndex].actionLink}
              <ExternalLink className="ml-1 h-10 w-5" />
            </a>
          )}
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleNext}
          disabled={currentIndex === stages.length - 1}
        >
          Next
        </Button>
      </div>
      
      <div className="relative flex justify-between items-center">
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={stage.id}>
              <div className="flex flex-col items-center z-10">
                <motion.div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
                    isCurrent 
                      ? isComplete 
                        ? 'border-green-500 bg-green-50 shadow-lg' 
                        : 'border-blue-500 bg-white shadow-lg' 
                      : isCompleted 
                        ? isComplete 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-blue-300 bg-white' 
                        : 'border-gray-200 bg-white'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {/* Spinning circle for current step */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500"
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                  
                  {isCompleted ? (
                    <Check className={`w-6 h-6 ${isComplete ? 'text-green-500' : 'text-blue-500'}`} />
                  ) : isCurrent ? (
                    <motion.div 
                      animate={{ 
                        scale: [1, 1, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      <div className={isComplete ? 'text-green-500' : 'text-blue-500'}>
                        {stage.icon}
                      </div>
                    </motion.div>
                  ) : (
                    <span className="text-xs font-medium text-gray-500">
                      {stage.icon}
                    </span>
                  )}
                </motion.div>
                <span className={`text-xs font-medium text-center max-w-[80px] mt-2 ${
                  isCurrent 
                    ? isComplete 
                      ? 'text-green-600 font-semibold' 
                      : 'text-blue-600 font-semibold' 
                    : isCompleted 
                      ? isComplete 
                        ? 'text-green-500' 
                        : 'text-blue-500' 
                      : 'text-gray-500'
                }`}>
                  {stage.label}
                </span>
              </div>

              {index < stages.length - 1 && (
                <div className="flex-1 flex justify-center">
                  <ArrowRight className={`w-6 h-6 ${
                    isCompleted 
                      ? isComplete 
                        ? 'text-green-500' 
                        : 'text-blue-500' 
                      : 'text-gray-300'
                  }`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

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

export function ClientDetailsModal({ 
  client, 
  theme,
  sipReminders = [], 
  investments = [],
  onNavigateToSIP,
  onNavigateToInvestments
}: {
  client: Client;
  theme: ThemeName;
  sipReminders?: SIPReminder[];
  investments?: any[]; // Add your investment type here
  onNavigateToSIP: () => void;
  onNavigateToInvestments: () => void;
}) {
  const [open, setOpen] = useState(false);
  const currentTheme = themes[theme] || themes['blue-smoke'];
  
  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('');
  
  const formatDate = (dateString?: string) => 
    dateString ? new Date(dateString).toLocaleDateString() : 'Not set';

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const getProductDisplayName = (productKey: string) => {
    return productKey.split(/(?=[A-Z])/).join(' ');
  };

  // Get SIP reminders for this client
  const clientSIPs = sipReminders.filter(reminder => reminder.clientId === client.id);
  
  // Get investments for this client
  const clientInvestments = investments.filter(inv => inv.clientId === client.id);
  
  // Calculate total investment value
  const totalInvestmentValue = clientInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  
  // Calculate total SIP amount
  const totalSIPAmount = clientSIPs.reduce((sum, sip) => sum + sip.amount, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`${getButtonClasses(theme, 'outline')} mt-0`}
        >
          View Details
        </Button>
      </DialogTrigger>
      
      <DialogContent className={`${currentTheme.cardBg} ${currentTheme.borderColor} border max-w-4xl`}>
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="absolute right-0 top-0 p-2"
          >
            
          </Button>
          
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-blue-500 shadow-md`}>
                <span className="text-white font-bold text-xl">
                  {getInitials(client.name)}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl">{client.name}</CardTitle>
                <p className={`text-sm ${currentTheme.mutedText}`}>
                  Client since {formatDate(client.createdAt)}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{client.phone}</span>
                </div>
                {client.address && (
                  <div className="flex items-start gap-2">
                    <span className="mt-1">
                      <Home className="h-4 w-4" />
                    </span>
                    <span>{client.address}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Personal Dates */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Personal Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                {client.dob && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Birthday</p>
                    <p className="text-sm">
                      {formatDate(client.dob)}
                    </p>
                  </div>
                )}
                {client.marriageAnniversary && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Anniversary</p>
                    <p className="text-sm">
                      {formatDate(client.marriageAnniversary)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Investment Profile */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Investment Profile</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Risk Profile:</span> 
                  <span className={`capitalize ml-2 px-2 py-1 rounded-full text-xs ${
                    client.riskProfile === 'conservative' ? 'bg-blue-100 text-blue-800' :
                    client.riskProfile === 'moderate' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {client.riskProfile}
                  </span>
                </p>
                
                <div className="mt-3">
                  <h4 className="font-medium mb-2">Products:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(client.products)
                      .filter(([_, isSelected]) => isSelected)
                      .map(([productKey]) => (
                        <span 
                          key={productKey} 
                          className={`px-3 py-1 rounded-full text-sm ${
                            productKey === 'sip' ? 'bg-blue-100 text-blue-800' :
                            productKey === 'mutualFund' ? 'bg-purple-100 text-purple-800' :
                            productKey === 'lumpsum' ? 'bg-green-100 text-green-800' :
                            productKey === 'healthInsurance' ? 'bg-teal-100 text-teal-800' :
                            productKey === 'lifeInsurance' ? 'bg-indigo-100 text-indigo-800' :
                            productKey === 'taxation' ? 'bg-orange-100 text-orange-800' :
                            productKey === 'nps' ? 'bg-pink-100 text-pink-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {getProductDisplayName(productKey)}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
                       
            {/* SIP Information */}
            {client.products.sip && (
              <div className="space-y-4">
                <h3 className="font-medium text-lg">SIP Details</h3>
                {clientSIPs.length > 0 ? (
                  <div className="space-y-3">
                    {clientSIPs.map((sip, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg ${currentTheme.highlightBg}`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{formatCurrency(sip.amount)}</p>
                            <p className="text-sm text-gray-500">
                              {sip.frequency} • Next: {formatDate(sip.nextDate)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            sip.status === 'active' ? 'bg-green-100 text-green-800' :
                            sip.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sip.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-3 rounded-lg ${currentTheme.highlightBg}`}>
                    <p className="text-sm">No active SIPs found</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setOpen(false);
                    onNavigateToSIP();
                  }}
                  className={getButtonClasses(theme, 'outline')}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add SIP Reminder
                </Button>
              </div>
            )}
            
            {/* Recent Investments */}
            
            {/* Notes */}
            <div className="md:col-span-1">
              <h3 className="font-medium text-lg mb-3">Notes</h3>
              <div className={`p-2 rounded-lg ${currentTheme.highlightBg}`}>
                {client.notes || "No notes available for this client."}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className={getButtonClasses(theme, 'outline')}
            >
              Close
            </Button>
            
          </CardFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_TIMEOUT = 8 * 60 * 1000; // 8 minutes (show warning at 8 minutes)

export default function CRMDashboard() {
  const [theme, setTheme] = useState<ThemeName>('blue-smoke'); // Default to blue-smoke
  const [previousLightTheme, setPreviousLightTheme] = useState<ThemeName>('blue-smoke');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState('');
  const [whatsappContent, setWhatsappContent] = useState('');
    const [editingClientId, setEditingClientId] = useState<string | null>(null);
const [clientDetailsId, setClientDetailsId] = useState<string | null>(null);
const [editedClient, setEditedClient] = useState<Partial<Client>>({});
const [alertOpen, setAlertOpen] = useState(false);
const [alertMessage, setAlertMessage] = useState("");
const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date())
const [meetingNotes, setMeetingNotes] = useState("")
const [currentStatus, setCurrentStatus] = useState('lead-generated');
const [sortField, setSortField] = useState<LeadSortField>('createdAt');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
const [leads, setLeads] = useState<Lead[]>([]);
const [clients, setClients] = useState<Client[]>([]);
const [communications, setCommunications] = useState<EnhancedCommunication[]>([]);
const [sipReminders, setSipReminders] = useState<SIPReminder[]>([]);
const [activities, setActivities] = useState<ActivityItem[]>([]);
const [kycs, setKycs] = useState<KYC[]>([]);
type ClientSortField = 'createdAt' | 'name' | 'products';
const [clientSortField, setClientSortField] = useState<ClientSortField>('createdAt');
const [clientSortDirection, setClientSortDirection] = useState<'asc' | 'desc'>('desc');
const [isAdding, setIsAdding] = useState(false)
const [editingId, setEditingId] = useState<string | null>(null)
const [inactiveTime, setInactiveTime] = useState(0); 
const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
const logoutTimer = useRef<NodeJS.Timeout | null>(null);
const warningTimer = useRef<NodeJS.Timeout>();
const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
const [lastActivity, setLastActivity] = useState(Date.now());

const [formData, setFormData] = useState<Omit<Client, 'id'>>({ 
  name: '', 
  email: '', 
  phone: '' 
});

const handleLogout = useCallback(async () => {
  try {
    await logout();
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed:', error);
    toast.error('Logout failed. Please try again.');
  }
}, []);

const resetInactivityTimer = useCallback(() => {
  // Don't reset if warning is already showing
  if (showTimeoutWarning) return;

  // Clear existing timers
  if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  if (warningTimer.current) clearTimeout(warningTimer.current);

  // Set new warning timer
  warningTimer.current = setTimeout(() => {
    setShowTimeoutWarning(true);
  }, WARNING_TIMEOUT);

  // Set new logout timer
  inactivityTimer.current = setTimeout(() => {
    handleLogout();
  }, INACTIVITY_TIMEOUT);
}, [handleLogout, showTimeoutWarning]);

// Set up event listeners
useEffect(() => {
  // Initial setup
  resetInactivityTimer();

  const handleActivity = (e: Event) => {
    // Ignore mouse movements when warning is shown
    if (showTimeoutWarning && e.type === 'mousemove') {
      return;
    }
    resetInactivityTimer();
  };

  // Events that indicate user activity
  const events = [
    'mousedown', 'keypress', 'scroll', 
    'touchstart', 'click', 'input', 'wheel'
  ];

  events.forEach(event => {
    window.addEventListener(event, handleActivity);
  });

  // Cleanup
  return () => {
    events.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  };
}, [resetInactivityTimer, showTimeoutWarning]);

// SIP Reminder form state
const [newSIPReminder, setNewSIPReminder] = useState<Omit<SIPReminder, 'id'>>({
  clientId: '',
  clientName: '',
  amount: 0,
  frequency: 'Monthly',
  startDate: new Date().toISOString().split('T')[0],
  nextDate: '',
  status: 'active'
});

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

const { user } = useAuth();
const location = useLocation();
 if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

function ClientCard({ 
  client, 
  theme, 
  onEdit, 
  onDetailsToggle, 
  onEmail, 
  onWhatsApp,
  isExpanded,
  sipReminders,
  investments
}: {
  client: Client;
  theme: ThemeName;
  onEdit: () => void;
  onDetailsToggle: () => void;
  onEmail: () => void;
  onWhatsApp: () => void;
  isExpanded: boolean;
  sipReminders: SIPReminder[];
  investments: any[];
}) {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const getInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('');

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : 'Not set';

  const primaryProduct = getClientPrimaryProduct(client);
  const productColor = PRODUCT_COLORS[primaryProduct];

  // Calculate upcoming SIPs
  const upcomingSIPs = sipReminders.filter(r => r.clientId === client.id && r.status === 'active');
  const hasUpcomingSIP = upcomingSIPs.length > 0;
  
  // Calculate total investments
  const clientInvestments = investments.filter(i => i.clientId === client.id);
  const totalInvestment = clientInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);

  // Check for upcoming birthdays/anniversaries
  const today = new Date();
  const isBirthdayThisMonth = client.dob && new Date(today.getFullYear(), today.getMonth(), 1) <= new Date(client.dob) && 
                            new Date(client.dob) <= new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const isAnniversaryThisMonth = client.marriageAnniversary && 
                               new Date(today.getFullYear(), today.getMonth(), 1) <= new Date(client.marriageAnniversary) && 
                               new Date(client.marriageAnniversary) <= new Date(today.getFullYear(), today.getMonth() + 1, 0);


  return (    
     <div className={`bg-white rounded-xl shadow-lg border ${currentTheme.borderColor} overflow-hidden`}>
      {/* Header */}
      <div 
        className={`px-5 py-3 flex justify-between items-center ${
          theme === 'dark' 
            ? themes[theme].darkBgColor 
              ? `bg-gradient-to-r ${themes[theme].darkButtonBg} ${themes[theme].darkButtonHover}`
              : `bg-gradient-to-r from-gray-700 to-gray-600`
            : `bg-gradient-to-r ${themes[theme].buttonBg} ${themes[theme].buttonHover}`
        }`}
      >
        <div>
          <h2 className="text-white font-semibold text-lg">{client.name}</h2>
          <p className="text-blue-100 text-sm">Added on {formatDate(client.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          {client.products.sip && (
            <Badge className="bg-white/20 text-white">
              {hasUpcomingSIP ? 'Upcoming SIP' : 'SIP Client'}
            </Badge>
          )}
          {client.riskProfile && (
            <Badge className={`
              ${client.riskProfile === 'conservative' ? 'bg-blue-100 text-blue-800' : 
                client.riskProfile === 'moderate' ? 'bg-green-100 text-green-800' : 
                'bg-red-100 text-red-800'}
            `}>
              {client.riskProfile}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          {/* Avatar with date indicators */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" />
            <Avatar className="relative h-14 w-14 border-2 border-blue-500">
              <AvatarFallback className="bg-transparent text-white font-bold text-xl">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            {/* Date indicators */}
            <div className="absolute -bottom-1 -right-1 flex">
              {isBirthdayThisMonth && (
                <div className="bg-pink-500 rounded-full p-1">
                  <CalendarDays className="h-3 w-3 text-white" />
                </div>
              )}
              {isAnniversaryThisMonth && (
                <div className="bg-purple-500 rounded-full p-1">
                  <Heart className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="text-sm text-gray-600 space-y-0">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-blue-500" />
                {client.email}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-500" />
                  {client.phone}
                </div>
                {/* Edit Button - Added here next to phone number */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onEdit}
                  className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
              
              {/* Add DOB and Anniversary here */}
              <div className="flex flex-wrap gap-3 mt-4 text-sm">
                {client.dob && (
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3 text-blue-500" />
                    <span>DOB: {formatDate(client.dob)}</span>
                  </div>
                )}
                {client.marriageAnniversary && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-pink-500" />
                    <span>Anniversary: {formatDate(client.marriageAnniversary)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600" 
                  onClick={onEmail}
                >
                  <Mail className="w-4 w-4 mr-1" />
                  Email
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-green-200 bg-green-50 hover:bg-green-100 text-green-600" 
                  onClick={onWhatsApp}
                >
                  <MessageSquare className="w-4 w-4 mr-1" /> WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {client.products.sip && (
            <div className={`p-0 rounded ${cardBg.highlightBg}`}>
              <p className="text-xs text-gray-500">SIP Amount</p>
              <p className="font-medium">
                {upcomingSIPs.length > 0 
                  ? `₹${upcomingSIPs[0].amount.toLocaleString()}` 
                  : 'No active SIP'}
              </p>
            </div>
          )}
          <div className={`p-0 rounded ${cardBg.highlightBg}`}>
            <p className="text-xs text-gray-500">Total Investment</p>
            <p className="font-medium">
              {totalInvestment > 0 
                ? `₹${totalInvestment.toLocaleString()}` 
                : 'No investments'}
            </p>
          </div>
        </div>

        {/* Products */}
        <div className="pt-0">
          <h4 className="font-medium text-sm text-gray-700 mb-1">Products</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(client.products).filter(([_, value]) => value).map(([key]) => (
              <Badge key={key} className="text-blue-600 bg-blue-50 border border-blue-100 text-xs px-2 py-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-between text-xs text-gray-500">
          <span>Client ID: {getInitials(client.name)}-{client.createdAt.replace(/-/g, '').slice(2)}</span>
          <ClientDetailsModal 
            client={client} 
            theme={theme}
            sipReminders={sipReminders.filter(r => r.clientId === client.id)}
            investments={investments.filter(i => i.clientId === client.id)}
            onNavigateToSIP={() => {
              setActiveTab("sip");
              setSelectedClientId(client.id);
            }}
            onNavigateToInvestments={() => {
              setActiveTab("investment-tracker");
              setSelectedClientId(client.id);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EditClientModal({
  client,
  onSave,
  onCancel,
  theme
}: {
  client: Client;
  onSave: (updatedClient: Client) => void;
  onCancel: () => void;
  theme: ThemeName;
}) {
  const [editedClient, setEditedClient] = useState<Client>(client);
  const currentTheme = themes[theme] || themes['blue-smoke'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedClient(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: keyof Client, date: Date | undefined) => {
    setEditedClient(prev => ({
      ...prev,
      [name]: date?.toISOString().split('T')[0] || ''
    }));
  };

  const handleProductToggle = (product: keyof Client['products']) => {
    setEditedClient(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [product]: !prev.products[product]
      }
    }));
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className={`${currentTheme.cardBg} ${currentTheme.borderColor} max-w-4xl`}>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
          <DialogDescription>
            Edit all details for {client.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="font-medium">Basic Information</h3>
            
            <div>
              <div className="space-y-2"></div>
              <Label className="mb-1 block">Full Name *</Label>
              <Input
                name="name"
                value={editedClient.name}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">Email *</Label>
              <Input
                name="email"
                type="email"
                value={editedClient.email}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">Phone *</Label>
              <Input
                name="phone"
                value={editedClient.phone}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">Address</Label>
              <Input
                name="address"
                value={editedClient.address || ''}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
              />
            </div>
          </div>

          {/* Dates Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Important Dates</h3>
            <div>
              <Label className="mb-1 block">Date of Birth</Label>
              <Input
                type="date"
                name="dob"
                value={editedClient.dob || ''}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
              />
            </div>
            <div>
              <Label className="mb-1 block">Marriage Anniversary</Label>
              <Input
                type="date"
                name="marriageAnniversary"
                value={editedClient.marriageAnniversary || ''}
                onChange={handleInputChange}
                className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
              />
            </div>
            <div>
              <Label className="mb-1 block">Risk Profile</Label>
              <Select
                value={editedClient.riskProfile || 'moderate'}
                onValueChange={(value) => setEditedClient(prev => ({
                  ...prev,
                  riskProfile: value as 'conservative' | 'moderate' | 'aggressive'
                }))}
              >
                <SelectTrigger className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}>
                  <SelectValue placeholder="Select risk profile" />
                </SelectTrigger>
                <SelectContent className={`${currentTheme.cardBg} ${currentTheme.borderColor}`}>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Section */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-medium">Investment Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(editedClient.products).map(([product, isSelected]) => (
                <div key={product} className="flex items-center space-x-2">
                  <Checkbox
                    id={`product-${product}`}
                    checked={isSelected}
                    onCheckedChange={() => handleProductToggle(product as keyof Client['products'])}
                  />
                  <Label htmlFor={`product-${product}`} className="text-sm font-normal capitalize">
                    {product.split(/(?=[A-Z])/).join(' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="md:col-span-2">
            <Label className="mb-1 block">Notes</Label>
            <Textarea
              value={editedClient.notes || ''}
              onChange={(e) => setEditedClient(prev => ({ ...prev, notes: e.target.value }))}
              className={`${currentTheme.inputBg} ${currentTheme.borderColor}`}
              placeholder="Additional notes about the client..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className={getButtonClasses(theme, 'outline')}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(editedClient)}
            className={getButtonClasses(theme)}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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


// 2. Update the AddSIPReminderForm component
const AddSIPReminderForm = ({ theme }: AddSIPReminderFormProps) => {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { cardBg, borderColor, inputBg, highlightBg, textColor } = currentTheme;

  const calculateNextDate = (startDate: string, frequency: 'Monthly' | 'Quarterly' | 'Yearly') => {
    const date = new Date(startDate);
    switch (frequency) {
      case 'Monthly': date.setMonth(date.getMonth() + 1); break;
      case 'Quarterly': date.setMonth(date.getMonth() + 3); break;
      case 'Yearly': date.setFullYear(date.getFullYear() + 1); break;
    }
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!newSIPReminder.clientId || newSIPReminder.amount <= 0) {
        throw new Error('Please select a client and enter a valid amount');
      }

      const reminderData = {
        ...newSIPReminder,
        nextDate: calculateNextDate(newSIPReminder.startDate, newSIPReminder.frequency)
      };

      await addDocument(SIP_REMINDERS_COLLECTION, reminderData);
      
      // Reset form
      setNewSIPReminder({
        clientId: '',
        clientName: '',
        amount: 0,
        frequency: 'Monthly',
        startDate: new Date().toISOString().split('T')[0],
        nextDate: '',
        status: 'active'
      });
      
      setShowSIPForm(false);
      showAlert('SIP Reminder added successfully');
    } catch (error) {
      console.error('Error adding SIP reminder:', error);
      showAlert(error.message || 'Error adding SIP reminder');
    }
  };

  return (
    <Card className={`mt-1 ${cardBg} ${borderColor}`}>
      <CardHeader>
        <CardTitle>Add New SIP Reminder</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2"> {/* Added space-y-2 between label and input */}
      <Label htmlFor="client">Client*</Label>
            
            <Select
              value={newSIPReminder.clientId}
              onValueChange={(value) => {
                const client = clients.find(c => c.id === value);
                setNewSIPReminder(prev => ({
                  ...prev,
                  clientId: value,
                  clientName: client?.name || ''
                }));
              }}
            >
              <SelectTrigger className={`${inputBg} ${borderColor}`}>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent className={`${cardBg} ${borderColor}`}>
                {clients.map(client => (
                  <SelectItem 
                    key={client.id} 
                    value={client.id}
                    className={`hover:${highlightBg} ${textColor}`}
                  >
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
  <Label htmlFor="amount">SIP Amount*</Label>
  <div className="flex gap-2">
    <Select
      value={newSIPReminder.amount.toString()}
      onValueChange={(value) => {
        setNewSIPReminder(prev => ({
          ...prev,
          amount: parseFloat(value) || 0
        }));
      }}
    >
      <SelectTrigger className={`w-[150px] ${inputBg} ${borderColor}`}>
        <SelectValue placeholder="Select amount" />
      </SelectTrigger>
      <SelectContent className={`${cardBg} ${borderColor}`}>
        {[500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000].map((amount) => (
          <SelectItem 
            key={amount} 
            value={amount.toString()}
            className={`hover:${highlightBg} ${textColor}`}
          >
            ₹{amount.toLocaleString()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    
    <Input
      type="number"
      value={newSIPReminder.amount || ''}
      onChange={(e) => setNewSIPReminder(prev => ({
        ...prev,
        amount: parseFloat(e.target.value) || 0
      }))}
      className={`flex-1 ${inputBg} ${borderColor}`}
      min="0"
      step="100"
      placeholder="Or enter custom amount"
    />
  </div>
</div>
          

          {/* Frequency Selection */}
          <div className="space-y-2"> {/* Added space-y-2 between label and input */}
      <Label>Frequency*</Label>
            <Select
              value={newSIPReminder.frequency}
              onValueChange={(value) => setNewSIPReminder(prev => ({
                ...prev,
                frequency: value as 'Monthly' | 'Quarterly' | 'Yearly',
                nextDate: calculateNextDate(prev.startDate, value as 'Monthly' | 'Quarterly' | 'Yearly')
              }))}
            >
              <SelectTrigger className={`${inputBg} ${borderColor}`}>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className={`${cardBg} ${borderColor}`}>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2"> {/* Added space-y-2 between label and input */}
      <Label htmlFor="startDate">Start Date*</Label>
            <Input
              type="date"
              value={newSIPReminder.startDate}
              onChange={(e) => setNewSIPReminder(prev => ({
                ...prev,
                startDate: e.target.value,
                nextDate: calculateNextDate(e.target.value, prev.frequency)
              }))}
              className={`${inputBg} ${borderColor}`}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowSIPForm(false)}
              className={getButtonClasses(theme, 'outline')}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className={getButtonClasses(theme)}
            >
              Add SIP Reminder
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
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

const [showSIPForm, setShowSIPForm] = useState(false);

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

// Then use it like this:
<AmountInput 
  value={newSIPReminder.amount} 
  onChange={(amount) => setNewSIPReminder(prev => ({...prev, amount}))} 
/>

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
const handleDeleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id))
  }

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

const toggleSipStatus = async (id: string) => {
  const reminder = sipReminders.find(r => r.id === id);
  if (!reminder) return;

  const newStatus = reminder.status === 'active' ? 'paused' : 'active';
  
  try {
    await updateDocument(SIP_REMINDERS_COLLECTION, id, { status: newStatus });
    showAlert(`SIP reminder ${newStatus}`);
  } catch (error) {
    showAlert('Error updating SIP status');
    console.error(error);
  }
};

const markReminderSent = async (id: string) => {
  try {
    await updateDocument(SIP_REMINDERS_COLLECTION, id, {
      lastReminderSent: new Date().toISOString().split('T')[0]
    });
    showAlert('Reminder marked as sent');
  } catch (error) {
    showAlert('Error updating reminder');
    console.error(error);
  }
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
    {showTimeoutWarning && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div 
      className={`p-6 rounded-lg ${themes[theme].cardBg} ${themes[theme].borderColor} max-w-md w-full`}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xl font-bold mb-4">Session Timeout Warning</h3>
      <p className="mb-4">Your session is about to expire due to inactivity.</p>
      <p className="mb-6">Would you like to continue your session?</p>
      
      {/* Add the countdown timer here */}
      <p className="mb-6 text-sm text-yellow-600 dark:text-yellow-400">
        Your session will expire in {Math.ceil((INACTIVITY_TIMEOUT - WARNING_TIMEOUT) / 1000)} seconds.
      </p>
      
      <div className="flex justify-end gap-2">
        <Button 
          onClick={() => {
            resetInactivityTimer();
            setShowTimeoutWarning(false);
          }}
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
)}
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
  <div className="relative group">
    <Button 
      variant="ghost" 
      size="icon" 
      className="ml-2 hover:bg-transparent"
      onMouseEnter={(e) => e.preventDefault()}
    >
      <MoreVertical className="h-5 w-5" />
    </Button>
    
    {/* Dropdown Content */}
    <div className={`
      absolute right-0 top-full mt-1 w-56
      ${themes[theme].cardBg} ${themes[theme].borderColor}
      border rounded-md shadow-lg
      opacity-0 invisible group-hover:opacity-100 group-hover:visible
      transition-opacity duration-200 ease-in-out
      z-50
    `}>
      <div className="p-1">
        <div className={`px-2 py-1.5 text-sm font-semibold ${themes[theme].textColor}`}>Quick Links</div>
        <div className={`h-px ${themes[theme].borderColor} mx-2`}></div>
        <div 
          className={`px-2 py-1.5 text-sm rounded cursor-pointer
            ${theme === 'dark' ? 
              'hover:bg-gray-700 text-gray-200 hover:text-white' : 
              'hover:bg-gray-100 text-gray-800 hover:text-gray-900'}`}
          onClick={() => window.open('https://dhanamfinser.themfbox.com/', '_blank')}
        >
          DFS Themebox
        </div>
        <div 
          className={`px-2 py-1.5 text-sm rounded cursor-pointer
            ${theme === 'dark' ? 
              'hover:bg-gray-700 text-gray-200 hover:text-white' : 
              'hover:bg-gray-100 text-gray-800 hover:text-gray-900'}`}
          onClick={() => window.open('https://www.cvlkra.com/', '_blank')}
        >
          CVL KRA Portal
        </div>
        <div 
          className={`px-2 py-1.5 text-sm rounded cursor-pointer
            ${theme === 'dark' ? 
              'hover:bg-gray-700 text-gray-200 hover:text-white' : 
              'hover:bg-gray-100 text-gray-800 hover:text-gray-900'}`}
          onClick={() => window.open('https://edge360.camsonline.com/signin', '_blank')}
        >
          Edge360 Portal
        </div>
         <div 
          className={`px-2 py-1.5 text-sm rounded cursor-pointer
            ${theme === 'dark' ? 
              'hover:bg-gray-700 text-gray-200 hover:text-white' : 
              'hover:bg-gray-100 text-gray-800 hover:text-gray-900'}`}
          onClick={() => window.open('https://mfs.kfintech.com/dit/login', '_blank')}
        >
          Kfintech Portal
        </div>
        <div 
          className={`px-2 py-1.5 text-sm rounded cursor-pointer
            ${theme === 'dark' ? 
              'hover:bg-gray-700 text-gray-200 hover:text-white' : 
              'hover:bg-gray-100 text-gray-800 hover:text-gray-900'}`}
          onClick={() => window.open('https://www.mfuonline.com/', '_blank')}
        >
          MF Utilities Portal
        </div>
        <div 
          className={`px-2 py-1.5 text-sm rounded cursor-pointer
            ${theme === 'dark' ? 
              'hover:bg-gray-700 text-gray-200 hover:text-white' : 
              'hover:bg-gray-100 text-gray-800 hover:text-gray-900'}`}
          onClick={() => window.open('https://app.mintpro.in/home', '_blank')}
        >
          Turtlemint Pro
        </div>
        <div 
          className={`px-2 py-1.5 text-sm rounded cursor-pointer
            ${theme === 'dark' ? 
              'hover:bg-gray-700 text-gray-200 hover:text-white' : 
              'hover:bg-gray-100 text-gray-800 hover:text-gray-900'}`}
          onClick={() => window.open('https://www.njindiaonline.in/pdesk/login.fin?cmdAction=login', '_blank')}
        >
          NJ Partner Desk
        </div>
        <div 
          className={`px-2 py-1.5 text-sm rounded cursor-pointer
            ${theme === 'dark' ? 
              'hover:bg-gray-700 text-gray-200 hover:text-white' : 
              'hover:bg-gray-100 text-gray-800 hover:text-gray-900'}`}
          onClick={() => window.open('https://www.incometax.gov.in/iec/foportal/', '_blank')}
        >
          Income Tax
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
      <InvestmentSummaryCards />
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
    defaultRecipient={emailComponentProps.defaultRecipient}
    openCompose={emailComponentProps.openCompose}
  />
</TabsContent>

<TabsContent value="tasks">
  <EnhancedTaskTab theme={theme} />
</TabsContent>

          {/* Leads Tab */}
         <TabsContent value="leads">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className={`${cardBg} ${borderColor}`}>
      <CardHeader>
        <CardTitle>Add New Lead</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block mb-1">Name *</label>
            <Input
              type="text"
              value={newLead.name}
              onChange={(e) => setNewLead({...newLead, name: e.target.value})}
              className={`${inputBg} ${borderColor}`}
              required
            />
          </div>
          
          {/* Email Input */}
          <div>
            <label className="block mb-1">Email *</label>
            <Input
              type="email"
              value={newLead.email}
              onChange={(e) => setNewLead({...newLead, email: e.target.value})}
              className={`${inputBg} ${borderColor}`}
              required
            />
          </div>
          
          {/* Phone Input */}
          <div>
            <label className="block mb-1">Phone *</label>
            <Input
              type="tel"
              value={newLead.phone}
              onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
              className={`${inputBg} ${borderColor}`}
              required
            />
          </div>
          
          {/* Product Interest - Multi-select */}
          <div>
  <label className="block mb-1">Interested Products *</label>
  <div className={`p-3 border rounded ${inputBg} ${borderColor}`}>
    {[
      'Mutual Funds - SIP',
      'Mutual Funds - Lumpsum',
      'Mutual Funds - SWP',
      'Mutual Funds - STP',
      'Health Insurance',
      'Life Insurance',
      'Taxation Planning', // Add this
    'National Pension System (NPS)' // Add this
    ].map(product => (
      <div key={product} className="flex items-center mb-2">
        <input
          type="checkbox"
          id={`product-${product}`}
          checked={newLead.productInterest.includes(product)}
          onChange={(e) => {
            if (e.target.checked) {
              setNewLead({
                ...newLead,
                productInterest: [...newLead.productInterest, product]
              });
            } else {
              setNewLead({
                ...newLead,
                productInterest: newLead.productInterest.filter(p => p !== product)
              });
            }
          }}
          className="mr-2 h-4 w-4"
        />
        <label htmlFor={`product-${product}`} className="text-sm">
          {product}
        </label>
      </div>
    ))}
  </div>
</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
  onClick={addLead} 
  className={`${getButtonClasses(theme)} w-full`}
  disabled={!newLead.name || !newLead.email || !newLead.phone || newLead.productInterest.length === 0}
>
  <Plus className="mr-2 h-4 w-4" /> Add Lead
</Button>
      </CardFooter>
    </Card>

    <div className="md:col-span-2 space-y-4">
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader>
          <CardTitle>Lead List</CardTitle>
        </CardHeader>
        <CardContent>
         <div className="space-y-4">
  {leads
  .sort((a, b) => {
    // Push lost leads to the bottom
    if (a.status === 'lost' && b.status !== 'lost') return 1;
    if (a.status !== 'lost' && b.status === 'lost') return -1;
    // For non-lost leads, sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })
  .map(lead => (
    <div key={lead.id} className={`p-4 border rounded-lg ${borderColor} ${expandedLeadId === lead.id ? selectedBg : highlightBg}`}>
      <div 
        className="flex justify-between items-start cursor-pointer"
        onClick={() => toggleLead(lead.id)}
      >
        <div>
          {/* Make lost lead names red */}
          <h3 className={`font-bold ${lead.status === 'lost' ? 'text-red-600' : ''}`}>
            {lead.name}
          </h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {lead.productInterest.map(product => (
              <span 
                key={product} 
                className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
              >
                {product}
              </span>
            ))}
          </div>
          <p className={`text-sm ${mutedText}`}>{lead.email} | {lead.phone}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
            lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {lead.status}
          </span>
          {expandedLeadId === lead.id ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Progress Bar - Always shown for lost leads when expanded, otherwise only for mutual fund leads */}
      {(expandedLeadId === lead.id || (lead.productInterest.some(product => product.includes('Mutual Funds')) && lead.status !== 'lost')) && (
        <div className="my-3">
          <LeadProgressBar 
            status={lead.progressStatus} 
            onStatusChange={(newStatus) => updateLeadProgress(lead.id, newStatus)}
            theme={theme === 'dark' ? 'dark' : 'light'} 
            isLost={lead.status === 'lost'} // Pass isLost prop to customize appearance
          />
        </div>
      )}

                      {/* Expanded Lead Details */}
                {expandedLeadId === lead.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between mb-4">
                      <div className="space-x-2">
                        <Button 
  variant={lead.status === 'contacted' ? 'default' : 'outline'}
  size="sm"
  onClick={() => updateLeadStatus(lead.id, 'contacted')}
  className={`${lead.status === 'contacted' ? getButtonClasses(theme, 'primary') : getButtonClasses(theme, 'outline')}`}
>
  Contacted
</Button>
                        <Button 
                          variant={lead.status === 'qualified' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateLeadStatus(lead.id, 'qualified')}
                          className={lead.status === 'qualified' ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          Qualified
                        </Button>
                        <Button 
                          variant={lead.status === 'lost' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateLeadStatus(lead.id, 'lost')}
                          className={lead.status === 'lost' ? 'bg-red-500 hover:bg-red-600' : ''}
                        >
                          Lost
                        </Button>
                      </div>
                      
                   <Button 
  onClick={() => convertLeadToClient(lead.id)}
  disabled={lead.status === 'lost'}
  className={`${getButtonClasses(theme)}`}
>
  Convert to Client
</Button>
                    </div>

                    <div>
                      <h4 className="font-bold mb-2">Notes</h4>
                      <div className="space-y-2 mb-4">
                        {lead.notes.map((note, index) => (
                          <div key={index} className={`p-2 rounded ${highlightBg}`}>
                            {note}
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <Input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          className={`flex-1 ${inputBg} ${borderColor}`}
                        />
                        <Button 
                          onClick={() => {
                            addNoteToLead(lead.id);
                            if (expandedLeadId !== lead.id) {
                              setExpandedLeadId(lead.id);
                            }
                          }}
                          className="ml-2"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</TabsContent>

          {/* KYC Tab */}
   <TabsContent value="kyc">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card className={`${cardBg} ${borderColor}`}>
      <CardHeader>
        <CardTitle>KYC Status ({pendingKYC})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads
            .filter(lead => lead.progressStatus === 'kyc-started')
            .map(lead => {
              const kyc = kycs.find(k => k.leadId === lead.id);
              return (
                <div key={lead.id} className={`p-4 border rounded ${highlightBg} ${borderColor}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{lead.name}</h3>
                      <p className={`text-sm ${mutedText}`}>{lead.email}</p>
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800`}>
                          KYC in Progress
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        try {
                          await updateDocument(LEADS_COLLECTION, lead.id, {
                            progressStatus: 'kyc-completed'
                          });
                          if (kyc) {
                            await updateDocument(KYCS_COLLECTION, kyc.id, {
                              status: 'completed',
                              completedDate: new Date().toISOString().split('T')[0]
                            });
                          }
                          showAlert('KYC marked as completed');
                        } catch (error) {
                          showAlert('Error updating KYC status');
                          console.error(error);
                        }
                      }}
                      className={getButtonClasses(theme, 'outline')}
                    >
                      <Check className="mr-2 h-4 w-4" /> Mark as Completed
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
              <Card className={`${cardBg} ${borderColor}`}>
                <CardHeader>
                  <CardTitle>KYC Process</CardTitle>
                  <CardDescription className={mutedText}>
                    Perform KYC verification for your leads before converting them to clients.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className={`p-4 rounded ${highlightBg}`}>
                      <h4 className="font-bold mb-2">Steps to complete KYC:</h4>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Click "Start KYC" on the lead</li>
                        <li>Verify identity documents</li>
                        <li>Verify address proof</li>
                        <li>Complete in-person verification if required</li>
                        <li>Submit for approval</li>
                      </ol>
                    </div>
                    <div className={`p-4 rounded ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'}`}>
                      <h4 className="font-bold mb-2">KYC Status Legend:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-gray-300 rounded-full mr-2"></span>
                          <span>Pending</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-yellow-300 rounded-full mr-2"></span>
                          <span>In Progress</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-green-300 rounded-full mr-2"></span>
                          <span>Completed</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-red-300 rounded-full mr-2"></span>
                          <span>Failed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
  <Card className={`${cardBg} ${borderColor}`}>
    <CardHeader>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle>Client Management</CardTitle>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          
          <Button 
            onClick={() => setActiveTab("leads")}
            className={getButtonClasses(theme)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Lead
          </Button>
          
      <div className="flex items-center gap-2">
  <Select
    value={clientSortField}
    onValueChange={(value) => setClientSortField(value as ClientSortField)}
  >
    <SelectTrigger className={`w-[180px] ${inputBg} ${borderColor}`}>
      <SelectValue placeholder="Sort by" />
    </SelectTrigger>
    <SelectContent className={`${cardBg} ${borderColor}`}>
      <SelectItem value="createdAt">Date Created</SelectItem>
      <SelectItem value="name">Name</SelectItem>
      <SelectItem value="products">Primary Product</SelectItem>
    </SelectContent>
  </Select>

  {/* Single toggle button for sort direction */}
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setClientSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
    className="p-2"
  >
    {clientSortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )}
  </Button>
</div>
          </div>
      </div>
    </CardHeader>
    
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
  <ClientCard
    key={client.id}
    client={client}
    theme={theme}
    isExpanded={clientDetailsId === client.id}
    onEdit={() => setEditingClient(client)}
    onDetailsToggle={() => 
      setClientDetailsId(clientDetailsId === client.id ? null : client.id)
    }
    onEmail={() => {
      setActiveTab("email");
      setEmailComponentProps({
        defaultRecipient: client.email,
        openCompose: true
      });
    }}
    onWhatsApp={() => {
      window.open(
        `https://api.whatsapp.com/send/?phone=91${client.phone}&text=${encodeURIComponent(
          `Hi ${client.name}, this is from Dhanam Financial Services. Let's connect!`
        )}&type=phone_number&app_absent=0`,
        '_blank'
      );
    }}
    sipReminders={sipReminders.filter(r => r.clientId === client.id)}
    investments={investments.filter(i => i.clientId === client.id)}
  />
))}

{editingClient && (
  <EditClientModal
    client={editingClient}
    onSave={async (updatedClient) => {
      try {
        await updateClient(updatedClient.id, updatedClient);
        setEditingClient(null);
        showAlert('Client updated successfully');
      } catch (error) {
        console.error('Error updating client:', error);
        showAlert('Error updating client');
      }
    }}
    onCancel={() => setEditingClient(null)}
    theme={theme}
  />
)}

      </div>
    </CardContent>
  </Card>
</TabsContent>


{/* Communication Tab */}
<TabsContent value="communication">
  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
    {/* Communication History */}
    <Card className={`${cardBg} ${borderColor} lg:col-span-2`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Client Communication History</CardTitle>
          <Select
            value={selectedClientId || undefined} // Use undefined instead of empty string
            onValueChange={(value) => setSelectedClientId(value || null)}
          >
            <SelectTrigger className={`w-[200px] ${inputBg} ${borderColor}`}>
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent className={`${cardBg} ${borderColor}`}>
              {clients?.map(client => (
                <SelectItem 
                  key={client.id} 
                  value={client.id} // Must be non-empty string
                  className={`hover:${highlightBg} ${textColor}`}
                >
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {communications
            .filter(comm => !selectedClientId || comm.clientId === selectedClientId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(comm => {
              const client = clients.find(c => c.id === comm.clientId);
              return (
                <div key={comm.id} className={`p-4 border rounded-lg ${highlightBg} ${borderColor}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{comm.subject}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(comm.priority)}`}>
                          {comm.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(comm.status)}`}>
                          {comm.status}
                        </span>
                      </div>
                      <p className={`text-sm ${mutedText}`}>
                        {client?.name} • {formatDate(comm.date)} • {comm.type}
                      </p>
                    </div>
                    {comm.relatedProduct && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {comm.relatedProduct}
                      </span>
                    )}
                  </div>
                  
                  <div className={`mt-3 p-3 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-50'}`}>
                    <p>{comm.content}</p>
                  </div>

                  {(comm.followUpDate || comm.advisorNotes) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {comm.followUpDate && (
                        <p className="text-sm">
                          <span className="font-medium">Follow-up:</span> {formatDate(comm.followUpDate)}
                        </p>
                      )}
                      {comm.advisorNotes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Advisor Notes:</p>
                          <p className={`text-sm ${mutedText}`}>{comm.advisorNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </CardContent>
      
    </Card>

    {/* Schedule Meeting Section - Added this new section */}
   <div>      
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader>
        <CardTitle>Schedule Meeting</CardTitle>
      </CardHeader>
    
        <CardContent className="pt-1">
          <div className="space-y-5">
             <div>
            <Label className="block mb-2">Client</Label>
              
              <Select
                value={selectedClientId || undefined} // Use undefined instead of empty string
                onValueChange={(value) => setSelectedClientId(value || null)}
              >
                <SelectTrigger className={`w-full ${inputBg} ${borderColor}`}>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className={`${cardBg} ${borderColor}`}>
                  {clients?.map(client => (
                    <SelectItem 
                      key={client.id} 
                      value={client.id} // Must be non-empty string
                      className={`hover:${highlightBg} ${textColor}`}
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


          <div>
            <Label>Date & Time</Label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-5 w-5 text-gray-500" />
              <Input
                type="datetime-local"
                value={meetingDate?.toISOString().slice(0, 16)}
                onChange={(e) => setMeetingDate(new Date(e.target.value))}
                className={`${inputBg} ${borderColor}`}
              />
            </div>
          </div>

          <div>
            <Label className="block mb-2">Meeting Agenda</Label> 

            <Textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              placeholder="Meeting agenda or notes..."
              rows={3}
              className={`${inputBg} ${borderColor}`}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleScheduleMeeting}
              className={getButtonClasses(theme)}
              disabled={!selectedClientId}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

    {/* New Communication Panel */}
    <Card className={`${cardBg} ${borderColor} lg:col-span-2`}>
      <CardHeader>
        <CardTitle>New Communication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type Select */}
        <div>
          <Label className="block mb-2">Type *</Label>
          <Select
            value={newCommunication.type}
            onValueChange={(value) => setNewCommunication({...newCommunication, type: value as CommunicationType})}
          >
            <SelectTrigger className={`${inputBg} ${borderColor}`}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className={`${cardBg} ${borderColor}`}>
              {['email', 'whatsapp', 'call', 'meeting', 'document'].map(type => (
                <SelectItem 
                  key={type} 
                  value={type} // Must be non-empty string
                  className={`hover:${highlightBg} ${textColor}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


    {/* Priority Select */}
        <div>
          <Label className="block mb-2">Priority *</Label>
          <Select
            value={newCommunication.priority}
            onValueChange={(value) => setNewCommunication({...newCommunication, priority: value as CommunicationPriority})}
          >
            <SelectTrigger className={`${inputBg} ${borderColor}`}>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className={`${cardBg} ${borderColor}`}>
              {['low', 'medium', 'high'].map(priority => (
                <SelectItem 
                  key={priority} 
                  value={priority} // Must be non-empty string
                  className={`hover:${highlightBg} ${textColor}`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
         {newCommunication.type === 'email' && (
      <div>
              </div>
    )}

    {/* Related Product Select */}
        <div>
          <Label className="block mb-2">Related Product</Label>
          <Select
            value={newCommunication.relatedProduct || undefined} // Use undefined instead of empty string
            onValueChange={(value) => setNewCommunication({...newCommunication, relatedProduct: value})}
          >
            <SelectTrigger className={`${inputBg} ${borderColor}`}>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent className={`${cardBg} ${borderColor}`}>
              {[
    'Mutual Funds - SIP',
    'Mutual Funds - Lumpsum',
    'Health Insurance',
    'Life Insurance',
    'Taxation Planning', // Add this
    'National Pension System (NPS)' // Add this
       ].map(product => (
    <SelectItem 
      key={product} 
      value={product}
      className={`hover:${highlightBg} ${textColor}`}
    >
      {product}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

    {/* Subject Input */}
    <div>
      <label className="block mb-1">Subject *</label>
      <Input
        value={newCommunication.subject}
        onChange={(e) => setNewCommunication({...newCommunication, subject: e.target.value})}
        placeholder="Subject"
        className={`${inputBg} ${borderColor}`}
      />
    </div>

    {/* Content Textarea */}
    <div>
      <label className="block mb-2">Content *</label>
      <Textarea
        value={newCommunication.content}
        onChange={(e) => setNewCommunication({...newCommunication, content: e.target.value})}
        placeholder="Type your message here..."
        rows={5}
        className={`${inputBg} ${borderColor}`}
      />
    </div>

    {/* Follow-up Date Input */}
    <div>
      <label className="block mb-1">Follow-up Date</label>
      <Input
        type="date"
        value={newCommunication.followUpDate}
        onChange={(e) => setNewCommunication({...newCommunication, followUpDate: e.target.value})}
        className={`${inputBg} ${borderColor}`}
      />
    </div>

    {/* Submit Button */}
     <Button 
      className={`w-full mt-4 ${getButtonClasses(theme)}`}
      onClick={handleCreateCommunication}
      disabled={!selectedClientId || !newCommunication.subject || !newCommunication.content}
    >
      <Mail className="mr-2 h-4 w-4" /> 
      Create Communication
    </Button>
  </CardContent>
</Card>
  </div>
</TabsContent>

{/* SIP Tab */}
<TabsContent value="sip">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* SIP Reminders List - spans 2 columns */}
    <Card className={`${cardBg} ${borderColor} md:col-span-2`}>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>SIP Reminders</CardTitle>
        <Button 
          onClick={() => setShowSIPForm(!showSIPForm)}
          className={getButtonClasses(theme)}
        >
          <Plus className="mr-2 h-4 w-4" /> 
          {showSIPForm ? 'Cancel' : 'Add SIP Reminder'}
        </Button>
      </div>
    </CardHeader>
    
    {showSIPForm && <AddSIPReminderForm theme={theme} />}

    <CardContent>
      <div className="space-y-4">
        {sipReminders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No SIP reminders yet. Add one above!
          </div>
        ) : (
          sipReminders
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by date descending
              .map(reminder => (
                <div key={reminder.id} className={`p-4 rounded-lg ${cardBg} ${borderColor}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{reminder.clientName}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ₹{reminder.amount} • {reminder.frequency} • Next: {reminder.nextDate}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => markReminderSent(reminder.id)}
                    className="text-green-600 hover:text-green-700 dark:text-green-400"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleSipStatus(reminder.id)}
                    className={reminder.status === 'active' 
                      ? "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400" 
                      : "text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    }
                  >
                    {reminder.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>

    {/* Statistics Column - Now 3rd column */}
    <div className="space-y-4">
      {/* Total SIP Investments */}
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total SIP Investments</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{sipReminders.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
          </div>
          <p className={`text-xs ${mutedText}`}>Across all active SIPs</p>
        </CardContent>
      </Card>

      {/* Active vs Paused */}
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SIP Status</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {sipReminders.filter(r => r.status === 'active').length}
              </div>
              <p className={`text-xs ${mutedText}`}>Active</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {sipReminders.filter(r => r.status === 'paused').length}
              </div>
              <p className={`text-xs ${mutedText}`}>Paused</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frequency Distribution */}
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Frequency Distribution</CardTitle>
          <PieChart className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Monthly', value: sipReminders.filter(r => r.frequency === 'Monthly').length },
                    { name: 'Quarterly', value: sipReminders.filter(r => r.frequency === 'Quarterly').length },
                    { name: 'Yearly', value: sipReminders.filter(r => r.frequency === 'Yearly').length }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={60}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {['#0088FE', '#00C49F', '#FFBB28'].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Upcoming SIPs - Now 4th column */}
  <Card className={`${cardBg} ${borderColor}`}>
  <CardHeader>
    <CardTitle>Upcoming SIPs</CardTitle>
    <CardDescription className={mutedText}>
      Next 5 upcoming SIP payments
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {sipReminders
        .filter(r => r.status === 'active')
        .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
        .slice(0, 5)
        .map(reminder => {
          const client = clients.find(c => c.id === reminder.clientId);
          return (
            <div key={reminder.id} className={`p-3 border rounded-lg ${borderColor} ${highlightBg}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{client?.name}</h4>
                  <p className={`text-sm ${mutedText}`}>
                    {new Date(reminder.nextDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{reminder.amount.toLocaleString()}</p>
                  <p className={`text-xs ${mutedText}`}>{reminder.frequency}</p>
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markReminderSent(reminder.id)}
                  className={`${getButtonClasses(theme, 'secondary')} text-xs`}
                >
                  <Bell className="mr-1 h-3 w-3" /> Remind
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSipStatus(reminder.id)}
                  className={`${
                    reminder.status === 'active' 
                      ? getButtonClasses(theme, 'danger') 
                      : getButtonClasses(theme, 'success')
                  } text-xs`}
                >
                  {reminder.status === 'active' ? (
                    <>
                      <Pause className="mr-1 h-3 w-3" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-1 h-3 w-3" /> Activate
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
    </div>
  </CardContent>
</Card>
  </div>
</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}