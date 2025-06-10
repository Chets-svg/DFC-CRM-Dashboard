import { Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from 'react';
import { Calendar } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Pause, Play } from "lucide-react";
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import React from 'react';
import { getSheetData, addSheetData } from '@/services/sheetService';


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
  CheckCircle,
  FileText, CreditCard, FileSignature, ThumbsUp, CalendarCheck, ExternalLink, ChevronLeft, ChevronRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
type CommunicationType = 'email' | 'whatsapp' | 'call' | 'meeting' | 'document';
type ThemeName = 'canberra' | 'wisteria' | 'apricot' | 'blue-smoke' | 'green-smoke' | 
                'tradewind' | 'dark' | 'sunrise' | 'ocean' | 'lava' | 
                'coral-teal' | 'orange-blue' | 'blue-pink' | 
                'green-purple' | 'teal-orange' | 'dark-neon' | 'blue' | 'green' | 'purple';

type CommunicationPriority = 'low' | 'medium' | 'high';
type CommunicationStatus = 'pending' | 'sent' | 'received' | 'read' | 'failed';

interface ThemeSelectorProps {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

interface ThemeColors {
  bgColor: string;
  textColor: string;
  cardBg: string;
  borderColor: string;
  inputBg: string;
  mutedText: string;
  highlightBg: string;
  selectedBg: string;
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
  // Optional dark mode properties
  darkBgColor?: string;
  darkTextColor?: string;
  darkCardBg?: string;
  darkBorderColor?: string;
  darkHighlightBg?: string;
  darkButtonBg?: string;
  darkButtonHover?: string;
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
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  nextDate: string;
  status: 'active' | 'paused' | 'completed';
  lastReminderSent?: string;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  productInterest: string[]; // Changed from string to string[]
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  notes: string[];
  progressStatus: 'lead-generated' | 'kyc-started' | 'kyc-completed' | 
                'can-no-generated' | 'can-account-created' | 
                'mandate-generated' | 'mandate-accepted' | 'sip-setup';
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

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  sipStartDate?: string; // Add this line
  sipNextDate?: string;  // Add this line
  
  products: {
    mutualFund?: boolean;
    sip?: boolean;
    lumpsum?: boolean;
    healthInsurance?: boolean;
    lifeInsurance?: boolean;
  };
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


const themes: Record<ThemeName, ThemeColors> = {
   'canberra': {
    bgColor: 'bg-[#fff0f0]',          // Light coral background
    textColor: 'text-[#1a1a2e]',      // Dark navy text
    cardBg: 'bg-white',               // Pure white cards
    borderColor: 'border-[#ffb3b3]',  // Light coral border
    inputBg: 'bg-white',
    mutedText: 'text-[#6b7280]',
    highlightBg: 'bg-[#ffd6d6]',      // Light coral highlight
    selectedBg: 'bg-[#ff9999]',       // Medium coral selection
    buttonBg: 'bg-[#ff5e62]',         // VIBRANT CORAL (primary)
    buttonHover: 'hover:bg-[#ff3c41]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#1a1a2e]',      // Dark navy background
    darkTextColor: 'text-[#e6f7ff]',  // Light teal text
    darkCardBg: 'bg-[#16213e]',       // Darker navy cards
    darkBorderColor: 'border-[#4cc9f0]', // Teal border
    darkHighlightBg: 'bg-[#4cc9f0]',  // Teal highlight
  },

  // Vibrant Purple + Gold
  'wisteria': {
    bgColor: 'bg-[#f8f0ff]',          // Light purple background
    textColor: 'text-[#2a0a4a]',      // Deep purple text
    cardBg: 'bg-white',
    borderColor: 'border-[#e0b0ff]',  // Light purple border
    inputBg: 'bg-white',
    mutedText: 'text-[#6b46c1]',
    highlightBg: 'bg-[#e9d5ff]',
    selectedBg: 'bg-[#d8b4fe]',
    buttonBg: 'bg-[#8a2be2]',         // VIBRANT PURPLE (primary)
    buttonHover: 'hover:bg-[#7b1fa2]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#2a0a4a]',      // Deep purple background
    darkTextColor: 'text-[#ffd700]',  // Gold text
    darkCardBg: 'bg-[#3a0a5f]',
    darkBorderColor: 'border-[#ffd700]', // Gold border
    darkHighlightBg: 'bg-[#ffd700]',  // Gold highlight
  },

  // Vibrant Orange + Blue
  'apricot': {
    bgColor: 'bg-[#fff4e6]',          // Light orange background
    textColor: 'text-[#333333]',      // Dark gray text
    cardBg: 'bg-white',
    borderColor: 'border-[#ffcc99]',  // Light orange border
    inputBg: 'bg-white',
    mutedText: 'text-[#e67e22]',
    highlightBg: 'bg-[#ffe0b3]',
    selectedBg: 'bg-[#ffb366]',
    buttonBg: 'bg-[#ff7f50]',         // VIBRANT CORAL (primary)
    buttonHover: 'hover:bg-[#e67347]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#1e3a8a]',      // Navy blue background
    darkTextColor: 'text-[#ffa500]',  // Orange text
    darkCardBg: 'bg-[#1e40af]',
    darkBorderColor: 'border-[#ffa500]', // Orange border
    darkHighlightBg: 'bg-[#ffa500]',  // Orange highlight
  },

  // Vibrant Blue + Pink
  'blue-smoke': {
    bgColor: 'bg-[#7DA0C4]',          // Light blue background
    textColor: 'text-[#0d3b66]',      // Dark blue text
    cardBg: 'bg-white',
    borderColor: 'border-[#b3e0ff]',  // Light blue border
    inputBg: 'bg-white',
    mutedText: 'text-[#3b82f6]',
    highlightBg: 'bg-[#cce6ff]',
    selectedBg: 'bg-[#99ccff]',
    buttonBg: 'bg-[#3b82f6]',         // VIBRANT BLUE (primary)
    buttonHover: 'hover:bg-[#2563eb]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#0d3b66]',      // Dark blue background
    darkTextColor: 'text-[#ff6b6b]',  // Pink text
    darkCardBg: 'bg-[#1e40af]',
    darkBorderColor: 'border-[#ff6b6b]', // Pink border
    darkHighlightBg: 'bg-[#ff6b6b]',  // Pink highlight
  },

  // Vibrant Green + Purple
  'green-smoke': {
    bgColor: 'bg-[#00c04b]',          // Light green background
    textColor: 'text-[#14532d]',      // Dark green text
    cardBg: 'bg-white',
    borderColor: 'border-[#b3ffc2]',  // Light green border
    inputBg: 'bg-white',
    mutedText: 'text-[#22c55e]',
    highlightBg: 'bg-[#ccffdd]',
    selectedBg: 'bg-[#99ffbb]',
    buttonBg: 'bg-[#22c55e]',         // VIBRANT GREEN (primary)
    buttonHover: 'hover:bg-[#16a34a]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#14532d]',      // Dark green background
    darkTextColor: 'text-[#d8b4fe]',  // Light purple text
    darkCardBg: 'bg-[#166534]',
    darkBorderColor: 'border-[#d8b4fe]', // Purple border
    darkHighlightBg: 'bg-[#d8b4fe]',  // Purple highlight
  },

  // Vibrant Teal + Orange
  'tradewind': {
    bgColor: 'bg-[#e6fffa]',          // Light teal background
    textColor: 'text-[#134e4a]',      // Dark teal text
    cardBg: 'bg-white',
    borderColor: 'border-[#b8fff0]',  // Light teal border
    inputBg: 'bg-white',
    mutedText: 'text-[#0d9488]',
    highlightBg: 'bg-[#ccfff5]',
    selectedBg: 'bg-[#99ffeb]',
    buttonBg: 'bg-[#0d9488]',         // VIBRANT TEAL (primary)
    buttonHover: 'hover:bg-[#0f766e]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#134e4a]',      // Dark teal background
    darkTextColor: 'text-[#ffa500]',  // Orange text
    darkCardBg: 'bg-[#115e59]',
    darkBorderColor: 'border-[#ffa500]', // Orange border
    darkHighlightBg: 'bg-[#ffa500]',  // Orange highlight
  },

  // High Contrast Dark + Neon Green
  'dark Green Neon': {
    bgColor: 'bg-[#0a0a0a]',          // Near-black background
    textColor: 'text-[#f0f0f0]',      // Light gray text
    cardBg: 'bg-[#1a1a1a]',           // Dark gray cards
    borderColor: 'border-[#333333]',   // Medium gray border
    inputBg: 'bg-[#1a1a1a]',
    mutedText: 'text-[#a0a0a0]',
    highlightBg: 'bg-[#333333]',
    selectedBg: 'bg-[#00ff00]',       // NEON GREEN selection
    buttonBg: 'bg-[#00ff00]',         // NEON GREEN (primary)
    buttonHover: 'hover:bg-[#00cc00]',
    buttonText: 'text-black',
    darkBgColor: 'bg-[#0a0a0a]',
    darkTextColor: 'text-[#f0f0f0]',
    darkCardBg: 'bg-[#1a1a1a]',
    darkBorderColor: 'border-[#333333]',
    darkHighlightBg: 'bg-[#333333]'
  },

  // Additional vibrant themes
  'sunrise': {
    bgColor: 'bg-[#fff5f5]',          // Soft pink background
    textColor: 'text-[#2a2a2a]',      // Dark gray text
    cardBg: 'bg-white',               // Pure white cards
    borderColor: 'border-[#ffcdb2]',  // Peach border
    inputBg: 'bg-white',
    mutedText: 'text-[#6b7280]',
    highlightBg: 'bg-[#ffcdb2]',      // Peach highlight
    selectedBg: 'bg-[#ffb4a2]',       // Coral selection
    buttonBg: 'bg-[#ff6b6b]',         // VIBRANT CORAL (primary)
    buttonHover: 'hover:bg-[#ff5252]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#2a2a2a]',
    darkTextColor: 'text-[#ffcdb2]',
    darkCardBg: 'bg-[#333333]',
    darkBorderColor: 'border-[#ff6b6b]',
    darkHighlightBg: 'bg-[#ff6b6b]'
  },

  'ocean': {
    bgColor: 'bg-[#04BADE]',          // Light sky blue
    textColor: 'text-[#1e3a8a]',      // Navy text
    cardBg: 'bg-white',
    borderColor: 'border-[#bfdbfe]',  // Light blue border
    inputBg: 'bg-white',
    mutedText: 'text-[#4b5563]',
    highlightBg: 'bg-[#bfdbfe]',
    selectedBg: 'bg-[#93c5fd]',
    buttonBg: 'bg-[#3b82f6]',         // VIBRANT BLUE (primary)
    buttonHover: 'hover:bg-[#2563eb]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#1e3a8a]',
    darkTextColor: 'text-[#bfdbfe]',
    darkCardBg: 'bg-[#1e40af]',
    darkBorderColor: 'border-[#3b82f6]',
    darkHighlightBg: 'bg-[#3b82f6]'
  },

    'lava': {
    bgColor: 'bg-[#fef2f2]',          // Light red
    textColor: 'text-[#5c1a1a]',      // Dark red text
    cardBg: 'bg-white',
    borderColor: 'border-[#fecaca]',  // Light red border
    inputBg: 'bg-white',
    mutedText: 'text-[#b91c1c]',
    highlightBg: 'bg-[#fecaca]',
    selectedBg: 'bg-[#fca5a5]',
    buttonBg: 'bg-[#ef4444]',         // VIBRANT RED (primary)
    buttonHover: 'hover:bg-[#dc2626]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#5c1a1a]',
    darkTextColor: 'text-[#fecaca]',
    darkCardBg: 'bg-[#7f1d1d]',
    darkBorderColor: 'border-[#ef4444]',
    darkHighlightBg: 'bg-[#ef4444]'
  },
'coral-teal': {
    name: 'Coral Teal',
    bgColor: 'bg-[#fff0f0]',
    textColor: 'text-[#1a1a2e]',
    cardBg: 'bg-white',
    borderColor: 'border-[#ffb3b3]',
    inputBg: 'bg-white',
    mutedText: 'text-[#6b7280]',
    highlightBg: 'bg-[#ffd6d6]',
    selectedBg: 'bg-[#ff9999]',
    buttonBg: 'bg-[#ff5e62]',
    buttonHover: 'hover:bg-[#ff3c41]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#1a1a2e]',
    darkTextColor: 'text-[#e6f7ff]',
    darkCardBg: 'bg-[#16213e]',
    darkBorderColor: 'border-[#4cc9f0]',
    darkHighlightBg: 'bg-[#4cc9f0]',
    darkButtonBg: 'bg-[#4cc9f0]',
    darkButtonHover: 'hover:bg-[#3aa8d8]'
  },
  
  'orange-blue': {
    name: 'Orange Blue',
    bgColor: 'bg-[#fff4e6]',
    textColor: 'text-[#333333]',
    cardBg: 'bg-white',
    borderColor: 'border-[#ffcc99]',
    inputBg: 'bg-white',
    mutedText: 'text-[#e67e22]',
    highlightBg: 'bg-[#ffe0b3]',
    selectedBg: 'bg-[#ffb366]',
    buttonBg: 'bg-[#ff7f50]',
    buttonHover: 'hover:bg-[#e67347]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#1e3a8a]',
    darkTextColor: 'text-[#ffa500]',
    darkCardBg: 'bg-[#1e40af]',
    darkBorderColor: 'border-[#ffa500]',
    darkHighlightBg: 'bg-[#ffa500]',
    darkButtonBg: 'bg-[#ffa500]',
    darkButtonHover: 'hover:bg-[#e69500]'
  },
  'blue-pink': {
    name: 'Blue Pink',
    bgColor: 'bg-[#5B84B1FF]',
    textColor: 'text-[#0d3b66]',
    cardBg: 'bg-white',
    borderColor: 'border-[#b3e0ff]',
    inputBg: 'bg-white',
    mutedText: 'text-[#3b82f6]',
    highlightBg: 'bg-[#cce6ff]',
    selectedBg: 'bg-[#99ccff]',
    buttonBg: 'bg-[#3b82f6]',
    buttonHover: 'hover:bg-[#2563eb]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#0d3b66]',
    darkTextColor: 'text-[#ff6b6b]',
    darkCardBg: 'bg-[#1e40af]',
    darkBorderColor: 'border-[#ff6b6b]',
    darkHighlightBg: 'bg-[#ff6b6b]',
    darkButtonBg: 'bg-[#ff6b6b]',
    darkButtonHover: 'hover:bg-[#e65050]'
  },
  'green-purple': {
    name: 'Green Purple',
    bgColor: 'bg-[#e6ffec]',
    textColor: 'text-[#14532d]',
    cardBg: 'bg-white',
    borderColor: 'border-[#b3ffc2]',
    inputBg: 'bg-white',
    mutedText: 'text-[#22c55e]',
    highlightBg: 'bg-[#ccffdd]',
    selectedBg: 'bg-[#99ffbb]',
    buttonBg: 'bg-[#22c55e]',
    buttonHover: 'hover:bg-[#16a34a]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#14532d]',
    darkTextColor: 'text-[#d8b4fe]',
    darkCardBg: 'bg-[#166534]',
    darkBorderColor: 'border-[#d8b4fe]',
    darkHighlightBg: 'bg-[#d8b4fe]',
    darkButtonBg: 'bg-[#d8b4fe]',
    darkButtonHover: 'hover:bg-[#c49af7]'
  },
  'teal-orange': {
    name: 'Teal Orange',
    bgColor: 'bg-[#e6fffa]',
    textColor: 'text-[#134e4a]',
    cardBg: 'bg-white',
    borderColor: 'border-[#b8fff0]',
    inputBg: 'bg-white',
    mutedText: 'text-[#0d9488]',
    highlightBg: 'bg-[#ccfff5]',
    selectedBg: 'bg-[#99ffeb]',
    buttonBg: 'bg-[#0d9488]',
    buttonHover: 'hover:bg-[#0f766e]',
    buttonText: 'text-white',
    darkBgColor: 'bg-[#134e4a]',
    darkTextColor: 'text-[#ffa500]',
    darkCardBg: 'bg-[#115e59]',
    darkBorderColor: 'border-[#ffa500]',
    darkHighlightBg: 'bg-[#ffa500]',
    darkButtonBg: 'bg-[#ffa500]',
    darkButtonHover: 'hover:bg-[#e69500]'
  },
  dark: {
    bgColor: 'bg-gray-800',
    textColor: 'text-gray-100',
    cardBg: 'bg-gray-700',
    borderColor: 'border-gray-600',
    inputBg: 'bg-gray-600',
    mutedText: 'text-gray-300',
    highlightBg: 'bg-gray-600',
    selectedBg: 'bg-blue-900',
    buttonBg: 'bg-gray-600',
    buttonHover: 'hover:bg-gray-500',
    buttonText: 'text-white'
  }

};

function ThemeSelector({ theme, setTheme }: { theme: ThemeName, setTheme: (theme: ThemeName) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div cclassname="relative">
      <Button 
  variant="outline" 
  className={`${getButtonClasses(theme, 'outline')} flex items-center gap-2`}
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
          className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
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
                  theme === themeName ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`}
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

const getButtonClasses = (theme: ThemeName, variant: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'link' = 'primary') => {
  const themeObj = themes[theme];
  
  switch (variant) {
    case 'danger':
      return `${theme === 'dark' ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white`;
    case 'success':
      return `${theme === 'dark' ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700'} text-white`;
    case 'secondary':
      return `${themeObj.buttonBg} hover:${themeObj.buttonHover} ${themeObj.buttonText}`;
    case 'outline':
      return `border ${themeObj.borderColor} hover:${themeObj.highlightBg} ${themeObj.textColor}`;
    case 'ghost':
      return `hover:${themeObj.highlightBg} ${themeObj.textColor}`;
    case 'link':
      return `hover:underline ${themeObj.textColor}`;
    default: // primary
      return `${themeObj.buttonBg} hover:${themeObj.buttonHover} ${themeObj.buttonText}`;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function LeadProgressBar({ status, onStatusChange, theme = 'light' }: LeadProgressBarProps & { theme?: 'light' | 'dark' }) {
  const stages: Stage[] = [
    { 
      id: 'lead-generated', 
      label: 'Generated', 
      icon: <User className="w-4 h-4" />,
      description: 'Lead has been created in the system'
    },
    { 
      id: 'kyc-started', 
      label: 'KYC Started', 
      icon: <FileText className="w-4 h-4" />,
      description: 'KYC process initiated - verification required',
      actionLink: 'https://mfs.kfintech.com/dit/login'
    },
    { 
      id: 'kyc-completed', 
      label: 'KYC Done', 
      icon: <Check className="w-4 h-4" />,
      description: 'KYC documents verified and approved',
      actionLink: 'https://www.mfuonline.com/' // 
          },
    { 
      id: 'can-no-generated', 
      label: 'CAN No.', 
      icon: <CreditCard className="w-4 h-4" />,
      description: 'Client Account Number generated',
      actionLink: 'https://www.mfuonline.com/' // 
            
    },
    { 
      id: 'can-account-created', 
      label: 'CAN Account', 
      icon: <Check className="w-4 w-4" />,
      description: 'Investment account created',
      actionLink: 'https://www.mfuonline.com/' // 
    },
    { 
      id: 'mandate-generated', 
      label: 'Mandate', 
      icon: <FileSignature className="w-4 h-4" />,
      description: 'Auto-debit mandate generated',
      actionLink: 'https://www.mfuonline.com/' // 
    },
    { 
      id: 'mandate-accepted', 
      label: 'Accepted', 
      icon: <ThumbsUp className="w-4 h-4" />,
      description: 'Mandate approved by client',
      actionLink: 'https://www.mfuonline.com/' // 
    },
    { 
      id: 'sip-setup', 
      label: 'SIP Done', 
      icon: <CalendarCheck className="w-4 h-4" />,
      description: 'Systematic Investment Plan activated'
    }
  ];

  const { mutedText } = theme === 'dark' ? themes['dark'] : themes['blue-smoke']; // Or use your default theme


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
          <p className={`text-sm ${mutedText}`}>
            {stages[currentIndex]?.description}
          </p>
          {stages[currentIndex]?.actionLink && (
            <a 
              href={stages[currentIndex].actionLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`mt-4 inline-flex items-center text-sm ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
              } underline`}
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
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
                  {isCompleted ? (
                    <Check className={`w-8 h-8 ${isComplete ? 'text-green-500' : 'text-blue-500'}`} />
                  ) : isCurrent ? (
                    <motion.div animate={{ scale: [1, 1.5, 1] }}>
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
export default function CRMDashboard() {
  const [theme, setTheme] = useState<ThemeName>('blue-smoke'); // Default to blue-smoke
  const [previousLightTheme, setPreviousLightTheme] = useState<ThemeName>('blue-smoke');
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState('');
  const [whatsappContent, setWhatsappContent] = useState('');
  const [clientViewMode, setClientViewMode] = useState<'card' | 'grid'>('card');
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
const [clientDetailsId, setClientDetailsId] = useState<string | null>(null);
const [editedClient, setEditedClient] = useState<Partial<Client>>({});
const [alertOpen, setAlertOpen] = useState(false);
const [alertMessage, setAlertMessage] = useState("");
const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date())
const [meetingNotes, setMeetingNotes] = useState("")
const [currentStatus, setCurrentStatus] = useState('lead-generated');

const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({ name: '', email: '', phone: '' })

const handleScheduleMeeting = () => {
    if (!selectedClientId) {
      showAlert('Please select a client first');
      return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    const newCommunication: EnhancedCommunication = {
      id: (communications.length + 1).toString(),
      clientId: selectedClientId,
      type: 'meeting',
      date: meetingDate?.toISOString() || new Date().toISOString(),
      subject: 'Scheduled Meeting',
      content: meetingNotes,
      priority: 'medium',
      status: 'pending',
      followUpDate: '',
      relatedProduct: '',
      advisorNotes: 'Meeting scheduled via dashboard'
    };

    const newActivity: ActivityItem = {
      id: `activity-${Date.now()}`,
      type: 'task',
      title: 'Meeting Scheduled',
      description: `Scheduled meeting with ${client.name} for ${meetingDate?.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    setCommunications([newCommunication, ...communications]);
    setActivities([newActivity, ...activities]);
    setMeetingNotes('');
    showAlert(`Meeting scheduled with ${client.name}`);
  };

  const [communications, setCommunications] = useState<EnhancedCommunication[]>([
  {
    id: '1',
    clientId: '1',
    type: 'email',
    date: '2023-06-10',
    subject: 'Mutual Fund Documents',
    content: 'Sent the latest mutual fund documents for review',
    priority: 'medium',
    status: 'sent',
    followUpDate: '2023-06-17',
    relatedProduct: 'Mutual Funds - SIP',
    advisorNotes: 'Client requested more info on tax implications'
  },
  {
    id: '2',
    clientId: '1',
    type: 'call',
    date: '2023-06-15',
    subject: 'Portfolio Review',
    content: 'Discussed current portfolio performance and rebalancing options',
    priority: 'high',
    status: 'completed',
    relatedProduct: 'Investment Portfolio'
  }
]);

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

const handleSaveEdit = () => {
  if (editingClientId) {
    setClients(clients.map(client => 
      client.id === editingClientId ? { ...client, ...editedClient } : client
    ));
    setEditingClientId(null);
  }
};

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

  const [sipReminders, setSipReminders] = useState<SIPReminder[]>([
  {
    id: '1',
    clientId: '1',
    amount: 5000,
    frequency: 'Monthly',
    nextDate: '2023-07-01',
    status: 'active',
    lastReminderSent: '2023-06-25'
  },
  {
    id: '2',
    clientId: '1',
    amount: 10000,
    frequency: 'Quarterly',
    nextDate: '2023-09-01',
    status: 'active',
    lastReminderSent: '2023-06-20'
  },
  {
    id: '3',
    clientId: '1',
    amount: 20000,
    frequency: 'Yearly',
    nextDate: '2024-01-01',
    status: 'paused'
  }
]);

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
  const [leads, setLeads] = useState<Lead[]>([
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    productInterest: ['Mutual Funds - SIP', 'Health Insurance'],
    status: 'new',
    notes: ['Interested in index funds'],
    progressStatus: 'lead-generated'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '0987654321',
    productInterest: ['Health Insurance', 'Life Insurance'],
    status: 'contacted',
    notes: ['Follow up next week'],
    progressStatus: 'kyc-started'
  }
]);

  const [kycs, setKycs] = useState<KYC[]>([
    {
      id: '1',
      leadId: '1',
      status: 'pending'
    },
    {
      id: '2',
      leadId: '2',
      status: 'completed',
      completedDate: '2023-06-15'
    }
  ]);
  const [clients, setClients] = useState<Client[]>([
  {
    id: '1',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    phone: '1122334455',
    sipStartDate: '2023-01-15',
    sipNextDate: '2023-07-15',
    products: {
      mutualFund: true,
      sip: true,
      healthInsurance: true
    }
  },
  ]);
  
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
  const pendingKYC = kycs.filter(kyc => kyc.status === 'pending').length;
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
  const [activities, setActivities] = useState<ActivityItem[]>([
  {
    id: 1,
    type: 'login',
    title: 'Test',
    description: 'Test description',
    timestamp: '2023-01-01T00:00:00'
  }
]);

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

  
    const toggleTheme = () => {
    if (theme === 'dark') {
      // When turning off dark mode, return to previous light theme
      setTheme(previousLightTheme);
    } else {
      // When turning on dark mode, remember current light theme
      setPreviousLightTheme(theme);
      setTheme('dark');
    }
  };

  const toggleLead = (id: string) => {
    setExpandedLeadId(expandedLeadId === id ? null : id);
  };

 const addLead = () => {
  if (!newLead.name.trim() || !newLead.email.trim() || !newLead.phone.trim() || newLead.productInterest.length === 0) {
    showAlert('Please fill in all required fields and select at least one product');
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(newLead.email)) {
    alert('Please enter a valid email address');
    return;
  }

  if (!/^\d{10,}$/.test(newLead.phone.replace(/\D/g, ''))) {
    alert('Please enter a valid phone number (at least 10 digits)');
    return;
  }

  const hasMutualFunds = newLead.productInterest.some(product => 
    product.includes('Mutual Funds')
  );

  const lead: Lead = {
    ...newLead,
    id: (leads.length + 1).toString(),
    status: 'new',
    progressStatus: hasMutualFunds ? 'lead-generated' : undefined, // Set initial status
    notes: []
  };

  // Add new activity
  const newActivity: ActivityItem = {
    id: `activity-${Date.now()}`,
    type: 'task',
    title: 'New lead added',
    description: `Added ${newLead.name} to leads`,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };

  setLeads([...leads, lead]);
  setActivities([newActivity, ...activities]); 
  
  // Reset the form with productInterest as array
  setNewLead({ 
    name: '', 
    email: '', 
    phone: '', 
    productInterest: [] 
  });
};


  const updateLeadStatus = (id: string, status: Lead['status']) => {
  const lead = leads.find(l => l.id === id);
  if (!lead) return;

  // Add status change activity
  const newActivity: ActivityItem = {
    id: activities.length + 1,
    type: 'task',
    title: 'Lead status updated',
    description: `Changed ${lead.name}'s status to ${status}`,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };
  setLeads(leads.map(lead => 
    lead.id === id ? { ...lead, status } : lead
  ));
  setActivities([newActivity, ...activities]); // Add the new activity
};

const markReminderSent = (id: string) => {
  setSipReminders(sipReminders.map(reminder => 
    reminder.id === id 
      ? { 
          ...reminder, 
          lastReminderSent: new Date().toISOString().split('T')[0] 
        } 
      : reminder
  ));
};
const toggleSipStatus = (id: string) => {
  setSipReminders(sipReminders.map(reminder => 
    reminder.id === id 
      ? { 
          ...reminder, 
          status: reminder.status === 'active' ? 'paused' : 'active' 
        } 
      : reminder
  ));
};

  // ✅ Add Note to Lead
const addNoteToLead = (leadId: string) => {
  if (!newNote.trim()) return;

  const timestampedNote = `${formatDate(new Date())}: ${newNote}`;

  const updatedLeads = leads.map(lead =>
    lead.id === leadId
      ? { ...lead, notes: [...lead.notes, timestampedNote] }
      : lead
  );

  setLeads(updatedLeads);
  setNewNote('');
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

// ✅ Convert Lead to Client
const convertLeadToClient = (leadId: string) => {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;

  if (clients.some(c => c.email === lead.email)) {
    showAlert('This lead has already been converted to a client');
    return;
  }

  const newClient: Client = {
    id: (clients.length + 1).toString(),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    products: {
      mutualFund: lead.productInterest.some(p => p.includes('Mutual Funds')),
      
      sip: lead.productInterest.some(p => p.includes('SIP')),
      lumpsum: lead.productInterest.some(p => p.includes('Lumpsum')),
      healthInsurance: lead.productInterest.includes('Health Insurance'),
      lifeInsurance: lead.productInterest.includes('Life Insurance'),
    },
  };

  
  const newActivity: ActivityItem = {
    id: `activity-${Date.now()}`,
    type: 'task',
    title: 'Lead Converted',
    description: `Converted ${lead.name} to client`,
    timestamp: new Date().toISOString(),
    status: 'completed',
  };

  setClients([...clients, newClient]);
  setLeads(leads.filter(l => l.id !== leadId));
  setActivities([newActivity, ...activities]);
  setActiveTab('clients');
  showAlert(`${lead.name} has been successfully converted to a client`);
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

const handleThemeChange = (newTheme: ThemeName) => {
    if (theme !== 'dark') {
      // If not in dark mode, update the previous light theme
      setPreviousLightTheme(newTheme);
    }
    setTheme(newTheme);
  };

 return (
    <div className={`min-h-screen ${themes[theme].bgColor} ${themes[theme].textColor}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with theme selector */}
         <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">DFS CRM Dashboard</h1>
          <div className="flex items-center gap-2">
            <ThemeSelector theme={theme} setTheme={handleThemeChange} />
            
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
          </div>
        </div>
              
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full grid-cols-6 ${theme === 'dark' ? 'bg-gray-700' : highlightBg}`}>
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
</TabsList>
           
          

          {/* Dashboard Tab */}
    <TabsContent value="dashboard">
  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingKYC}</div>
            <p className={`text-xs ${mutedText}`}>Requires verification</p>
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
              <Bar dataKey="value" fill="#8884d8" />
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
                  '#0088FE'
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

    {/* Recent Activity - Column 3 */}
    <div className="lg:col-span-4">
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
              {filteredActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`p-4 border rounded-lg hover:${highlightBg} transition-colors ${borderColor}`}
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

    {/* Empty Column 4 - Could be used for another component */}
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

  </div>
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
      'Life Insurance'
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
  {leads.map(lead => (
    <div 
      key={lead.id} 
      className={`p-4 border rounded-lg ${borderColor} ${expandedLeadId === lead.id ? selectedBg : highlightBg}`}
    >
      <div 
        className="flex justify-between items-start cursor-pointer"
        onClick={() => toggleLead(lead.id)}
      >
        <div>
          <h3 className="font-bold">{lead.name}</h3>
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

      {/* Progress Bar - Added this line */}
      {lead.productInterest.some(product => product.includes('Mutual Funds')) && (
  <div className="my-3">
    <LeadProgressBar 
      status={lead.progressStatus} 
      onStatusChange={(newStatus) => {
        setLeads(leads.map(l => 
          l.id === lead.id ? {...l, progressStatus: newStatus} : l
        ));
      }}
      theme={theme === 'dark' ? 'dark' : 'light'} 
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
                  <CardTitle>KYC Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {kycs.map(kyc => {
                      const lead = leads.find(l => l.id === kyc.leadId)
                      return (
                        <div key={kyc.id} className={`p-4 border rounded ${highlightBg} ${borderColor}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{lead?.name}</h3>
                              <p className={`text-sm ${mutedText}`}>{lead?.email}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                kyc.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                                kyc.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                kyc.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {kyc.status}
                              </span>
                              {kyc.completedDate && (
                                <p className={`text-xs mt-1 ${mutedText}`}>Completed: {kyc.completedDate}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4">
                            <Button 
  variant="outline" 
  size="sm" 
  onClick={() => performKYC(kyc.leadId)}
  disabled={kyc.status === 'in-progress' || kyc.status === 'completed'}
>
  {kyc.status === 'pending' ? 'Start KYC' : 
   kyc.status === 'in-progress' ? 'KYC in progress...' : 'KYC Completed'}
</Button>
                          </div>
                        </div>
                      )
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
    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <CardTitle>Client Management</CardTitle>
      <div className="flex gap-2">
        <Button 
          variant={clientViewMode === 'card' ? 'default' : 'outline'}
          onClick={() => setClientViewMode('card')}
          size="sm"
          className={clientViewMode === 'card' ? getButtonClasses(theme) : ''}
        >
          <List className="mr-2 h-4 w-4" /> List View
        </Button>
        <Button 
          variant={clientViewMode === 'grid' ? 'default' : 'outline'}
          onClick={() => setClientViewMode('grid')}
          size="sm"
          className={clientViewMode === 'grid' ? getButtonClasses(theme) : ''}
        >
          <Grid className="mr-2 h-4 w-4" /> Card View
        </Button>
      </div>
    </CardHeader>
    
    <CardContent>
      {clientViewMode === 'grid' ? (
        // Grid View - Now with proper styling
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <div 
              key={client.id} 
              className={`p-4 border rounded-lg ${borderColor} ${
                clientDetailsId === client.id ? selectedBg : highlightBg
              } hover:${selectedBg} transition-colors`}
            >
              {/* Client info and avatar section */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{client.name}</h3>
                  <p className={`text-sm ${mutedText}`}>{client.email}</p>
                  <p className={`text-sm ${mutedText}`}>{client.phone}</p>
                </div>
              </div>
              {/* Products Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.entries(editingClientId === client.id ? 
                  {...client.products, ...editedClient.products} : 
                  client.products).map(([product, isSelected]) => (
                  <div 
                    key={product}
                    className={`p-1 rounded text-center text-xs cursor-pointer ${
                      isSelected ? 
                        `${theme === 'dark' ? themes[theme].productSelectedBg : 'bg-green-100'}` : 
                        highlightBg
                    }`}
                    onClick={() => {
                      if (editingClientId === client.id) {
                        setEditedClient({
                          ...editedClient,
                          products: {
                            ...editedClient.products,
                            [product]: !isSelected
                          }
                        });
                      }
                    }}
                  >
                    {product.split(/(?=[A-Z])/).join(' ')}
                  </div>
                ))}
              </div>

              {/* SIP Dates Section - Only shown in edit mode */}
              {editingClientId === client.id && client.products?.sip && (
                <div className="mt-4 space-y-2">
                  <div>
                    <label className="block text-xs mb-1">SIP Start Date</label>
                    <Input
                      type="date"
                      value={editedClient.sipStartDate || client.sipStartDate || ''}
                      onChange={(e) => setEditedClient({...editedClient, sipStartDate: e.target.value})}
                      className={`text-xs ${inputBg} ${borderColor}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Next SIP Date</label>
                    <Input
                      type="date"
                      value={editedClient.sipNextDate || client.sipNextDate || ''}
                      onChange={(e) => setEditedClient({...editedClient, sipNextDate: e.target.value})}
                      className={`text-xs ${inputBg} ${borderColor}`}
                    />
                  </div>
                </div>
              )}
              
              
                {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {editingClientId === client.id ? (
                  <>
                     <Button 
          onClick={handleSaveEdit}
          className={`${getButtonClasses(theme)}`}
          size="sm"
        >
          <Check className="mr-2 h-4 w-4" /> Save
        </Button>
        <Button 
          onClick={handleCancelEdit}
          className={getButtonClasses(theme, 'danger')}
          size="sm"
        >
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditClient(client)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setClientDetailsId(clientDetailsId === client.id ? null : client.id)}
                    >
                      {clientDetailsId === client.id ? 'Hide' : 'Details'}
                    </Button>
                  </>
                )}
              </div>
             {/* Client Details - Only shown when expanded */}
              {clientDetailsId === client.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-bold mb-2 text-sm">Client Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Email:</span> {client.email}</p>
                    <p><span className="font-medium">Phone:</span> {client.phone}</p>
                    {client.sipStartDate && (
                      <p><span className="font-medium">SIP Start:</span> {new Date(client.sipStartDate).toLocaleDateString()}</p>
                    )}
                    {client.sipNextDate && (
                      <p><span className="font-medium">Next SIP:</span> {new Date(client.sipNextDate).toLocaleDateString()}</p>
                    )}
                    <div>
                      <span className="font-medium">Products:</span>
                      <ul className="list-disc pl-5 mt-1">
                        {Object.entries(client.products)
                          .filter(([_, isSelected]) => isSelected)
                          .map(([product]) => (
                            <li key={product}>{product.split(/(?=[A-Z])/).join(' ')}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Card View
        <div className="space-y-4">
          {clients.map(client => (
            <div key={client.id} className={`p-4 border rounded ${highlightBg} ${borderColor}`}>
              <div className="flex justify-between items-start">
                {editingClientId === client.id ? (
                  <div className="w-full space-y-3">
                    <Input
                      value={editedClient.name || client.name}
                      onChange={(e) => setEditedClient({...editedClient, name: e.target.value})}
                      placeholder="Client Name"
                    />
                    <Input
                      value={editedClient.email || client.email}
                      onChange={(e) => setEditedClient({...editedClient, email: e.target.value})}
                      placeholder="Email"
                      type="email"
                    />
                    <Input
                      value={editedClient.phone || client.phone}
                      onChange={(e) => setEditedClient({...editedClient, phone: e.target.value})}
                      placeholder="Phone"
                      type="tel"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold">{client.name}</h3>
                    <p className={`text-sm ${mutedText}`}>{client.email}</p>
                    <p className={`text-sm ${mutedText}`}>{client.phone}</p>
                  </div>
                )}
                <div className="flex space-x-2">
                  {editingClientId === client.id ? (
                    <>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={handleSaveEdit}
                      >
                        <Check className="mr-2 h-4 w-4" /> Save
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                    <Button 
        onClick={() => handleEditClient(client)}
        className={`${getButtonClasses(theme, 'secondary')}`}
        size="sm"
      >
        <Edit className="mr-2 h-4 w-4" /> Edit
      </Button>
                    <Button 
        onClick={() => setClientDetailsId(clientDetailsId === client.id ? null : client.id)}
        className={`${getButtonClasses(theme, 'secondary')}`}
        size="sm"
      >
        {clientDetailsId === client.id ? 'Hide' : 'Details'}
      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Products Section */}
              <div className="mt-4">
                <h4 className="font-bold mb-2">Products</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(editingClientId === client.id ? 
                    {...client.products, ...editedClient.products} : 
                    client.products).map(([product, isSelected]) => (
                    <div 
                      key={product}
                      className={`p-2 rounded text-center cursor-pointer ${
                        isSelected ? 
                          `${theme === 'dark' ? themes[theme].productSelectedBg : 'bg-green-100'}` : 
                          highlightBg
                      }`}
                      onClick={() => {
                        if (editingClientId === client.id) {
                          setEditedClient({
                            ...editedClient,
                            products: {
                              ...editedClient.products,
                              [product]: !isSelected
                            }
                          });
                        }
                      }}
                    >
                      <div className="font-medium text-sm">
                        {product.split(/(?=[A-Z])/).join(' ')}
                      </div>
                      {isSelected ? (
                        <Check className="mx-auto h-4 w-4 text-green-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* SIP Dates Section - Only shown in edit mode */}
              {editingClientId === client.id && client.products?.sip && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">SIP Start Date</label>
                    <Input
                      type="date"
                      value={editedClient.sipStartDate || client.sipStartDate || ''}
                      onChange={(e) => setEditedClient({...editedClient, sipStartDate: e.target.value})}
                      className={`${inputBg} ${borderColor}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Next SIP Date</label>
                    <Input
                      type="date"
                      value={editedClient.sipNextDate || client.sipNextDate || ''}
                      onChange={(e) => setEditedClient({...editedClient, sipNextDate: e.target.value})}
                      className={`${inputBg} ${borderColor}`}
                    />
                  </div>
                </div>
              )}

              {/* Client Details - Only shown when expanded */}
              {clientDetailsId === client.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-bold mb-2">Client Details</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {client.email}</p>
                    <p><span className="font-medium">Phone:</span> {client.phone}</p>
                    {client.sipStartDate && (
                      <p><span className="font-medium">SIP Start:</span> {new Date(client.sipStartDate).toLocaleDateString()}</p>
                    )}
                    {client.sipNextDate && (
                      <p><span className="font-medium">Next SIP:</span> {new Date(client.sipNextDate).toLocaleDateString()}</p>
                    )}
                    <div>
                      <span className="font-medium">Products:</span>
                      <ul className="list-disc pl-5 mt-1">
                        {Object.entries(client.products)
                          .filter(([_, isSelected]) => isSelected)
                          .map(([product]) => (
                            <li key={product}>{product.split(/(?=[A-Z])/).join(' ')}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
{/* Communication Tab */}
<TabsContent value="communication">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
      <h3 className="font-medium mb-3">Schedule Meeting</h3>
      <Card className={`${cardBg} ${borderColor}`}>
        <CardContent className="pt-6">
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
    <Card className={`${cardBg} ${borderColor}`}>
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
                'Retirement Planning',
                'Tax Planning'
              ].map(product => (
                <SelectItem 
                  key={product} 
                  value={product} // Must be non-empty string
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
      <label className="block mb-1">Content *</label>
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
  onClick={() => {
    if (!selectedClientId) {
      alert('Please select a client');
      return;
    }
    if (!newCommunication.subject || !newCommunication.content) {
      alert('Please fill in subject and content');
      return;
    }

    const newComm: EnhancedCommunication = {
      id: (communications.length + 1).toString(),
      clientId: selectedClientId,
      date: new Date().toISOString(),
      status: 'pending',
      ...newCommunication
    };

    setCommunications([newComm, ...communications]);
    setNewCommunication({
      type: 'email',
      subject: '',
      content: '',
      priority: 'medium',
      followUpDate: '',
      relatedProduct: ''
    });

    const client = clients.find(c => c.id === selectedClientId);
    const newActivity: ActivityItem = {
      id: `activity-${Date.now()}`,
      type: 'task',
      title: `New ${newCommunication.type} created`,
      description: `Created communication for ${client?.name} about ${newCommunication.relatedProduct || 'general inquiry'}`,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    setActivities([newActivity, ...activities]);
  }}
>
  <Mail className="mr-2 h-4 w-4" /> Create Communication
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
        <CardTitle>SIP Reminders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sipReminders.map(reminder => (
            <div key={reminder.id} className={`p-4 border rounded-lg ${borderColor} ${highlightBg}`}>
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{/* Client name */}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm ${
                      reminder.status === 'active' ? 'text-green-500' : 
                      reminder.status === 'paused' ? 'text-yellow-500' : 
                      'text-gray-500'
                    }`}>
                      ₹{reminder.amount.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      • {reminder.frequency}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => toggleSipStatus(reminder.id)}
                    className={getButtonClasses(
                      theme,
                      reminder.status === 'active' ? 'danger' : 'primary'
                    )}
                  >
                    {reminder.status === 'active' ? 'Pause' : 'Activate'}
                  </Button>
                </div>
              </div>

              {/* Details */}
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Next: {new Date(reminder.nextDate).toLocaleDateString()}
                  </p>
                  {reminder.lastReminderSent && (
                    <p className="text-xs text-muted-foreground">
                      Last sent: {new Date(reminder.lastReminderSent).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditReminder(reminder.id)}
                    className={getButtonClasses(theme, 'secondary')}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markReminderSent(reminder.id)}
                    disabled={reminder.status !== 'active'}
                    className={getButtonClasses(theme, 'secondary')}
                  >
                    <Bell className="mr-2 h-4 w-4" /> Send
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className={`w-full ${getButtonClasses(theme)}`}>
          <Plus className="mr-2 h-4 w-4" /> Add SIP Reminder
        </Button>
      </CardFooter>
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