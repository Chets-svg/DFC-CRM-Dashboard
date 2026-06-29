"use client";

import { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Pause, 
  Play, 
  Plus, 
  Check, 
  TrendingUp, 
  Activity, 
  PieChart, 
  Bell,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  CalendarPlus
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  addDocument, 
  updateDocument, 
  deleteDocument,
  SIP_REMINDERS_COLLECTION,
  CLIENTS_COLLECTION
} from "@/lib/firebase-config";
import { ThemeName, themes, getButtonClasses, isNeon } from '@/lib/theme';
import toast from 'react-hot-toast';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  products: {
    sip?: boolean;
    mutualFund?: boolean;
    lumpsum?: boolean;
    healthInsurance?: boolean;
    lifeInsurance?: boolean;
    taxation?: boolean;
    nps?: boolean;
  };
  createdAt: string;
}

type SIPReminder = {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  startDate: string;
  nextDate: string;
  status: 'active' | 'paused' | 'completed';
  lastReminderSent?: string;
  createdAt: string;
  stepUpAmount?: number;
  stepUpFrequency?: '6 months' | '1 year' | '2 years';
  stepUpNextDate?: string;
};

interface AddSIPReminderFormProps {
  theme: ThemeName;
  clients: Client[];
  onSIPAdded: () => void;
}

// ── Neon Color Constants ──
const NEON_COLORS = ['#00FFFF', '#FF00FF', '#FFD700'];

const AddSIPReminderForm = ({ theme, clients, onSIPAdded }: AddSIPReminderFormProps) => {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { cardBg, borderColor, inputBg, highlightBg, textColor } = currentTheme;
  const neon = isNeon(theme);

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [clients]);

  const [newSIPReminder, setNewSIPReminder] = useState<Omit<SIPReminder, 'id' | 'createdAt'>>({
    clientId: '',
    clientName: '',
    amount: 0,
    frequency: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    nextDate: '',
    status: 'active',
    stepUpAmount: null,
    stepUpFrequency: '1 year'
  });

  const [showStepUp, setShowStepUp] = useState(false);

  // ── Neon Helper Classes ──
  const neonCardCls = neon ? 'bg-gray-950 border-cyan-500/20' : `${cardBg} ${borderColor}`;
  const neonTitleCls = neon ? 'text-cyan-300 tracking-wide' : '';
  const neonDescCls = neon ? 'text-cyan-500/60' : '';
  const neonInputCls = neon ? 'bg-gray-900 border-cyan-500/30 text-cyan-200 placeholder-cyan-700 focus:border-cyan-400 focus:ring-cyan-500/20' : `${inputBg} ${borderColor}`;
  const neonSelectContentCls = neon ? 'bg-gray-900 border-cyan-500/30' : `${cardBg} ${borderColor}`;
  const neonSelectItemCls = neon ? 'text-cyan-200 focus:bg-cyan-500/10 focus:text-cyan-100' : textColor;
  const neonLabelCls = neon ? 'text-cyan-300/80' : '';
  const neonBodyTextCls = neon ? 'text-cyan-200/70' : '';
  const neonMutedTextCls = neon ? 'text-cyan-500/60' : 'text-gray-500 dark:text-gray-400';
  const neonStepUpBoxCls = neon ? 'border-cyan-500/20 bg-cyan-950/10' : `${borderColor} ${cardBg}`;
  const neonStepUpInfoCls = neon ? 'bg-cyan-950/30 border border-cyan-500/15 text-cyan-300' : 'bg-blue-50 dark:bg-blue-900/20';
  const neonStepUpInfoAccentCls = neon ? 'text-cyan-400' : 'text-blue-700 dark:text-blue-300';
  const neonQuickBtnCls = neon
    ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/30 hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_8px_rgba(0,255,255,0.15)]'
    : '';
  const neonQuickBtnActiveCls = neon
    ? 'bg-cyan-600 text-gray-950 border-cyan-400 shadow-[0_0_12px_rgba(0,255,255,0.3)]'
    : 'bg-primary text-primary-foreground';
  const neonCancelBtnCls = neon
    ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400'
    : getButtonClasses(theme, 'outline');
  const neonSubmitBtnCls = neon
    ? 'bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-semibold shadow-[0_0_15px_rgba(0,255,255,0.3)]'
    : getButtonClasses(theme);
  const neonStepUpToggleCls = neon
    ? 'border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-950/30 hover:bg-fuchsia-500/10 hover:border-fuchsia-400'
    : getButtonClasses(theme, 'outline');

  const calculateNextDate = (startDate: string, frequency: 'Monthly' | 'Quarterly' | 'Yearly') => {
    const date = new Date(startDate);
    switch (frequency) {
      case 'Monthly': date.setMonth(date.getMonth() + 1); break;
      case 'Quarterly': date.setMonth(date.getMonth() + 3); break;
      case 'Yearly': date.setFullYear(date.getFullYear() + 1); break;
    }
    return date.toISOString().split('T')[0];
  };

  const calculateStepUpNextDate = (startDate: string, frequency: '6 months' | '1 year' | '2 years') => {
    const date = new Date(startDate);
    switch (frequency) {
      case '6 months': date.setMonth(date.getMonth() + 6); break;
      case '1 year': date.setFullYear(date.getFullYear() + 1); break;
      case '2 years': date.setFullYear(date.getFullYear() + 2); break;
    }
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!newSIPReminder.clientId || newSIPReminder.amount <= 0) {
        throw new Error('Please select a client and enter a valid amount');
      }

      const reminderData: any = {
        ...newSIPReminder,
        nextDate: calculateNextDate(newSIPReminder.startDate, newSIPReminder.frequency),
        createdAt: new Date().toISOString()
      };

      if (showStepUp && newSIPReminder.stepUpAmount && newSIPReminder.stepUpAmount > 0) {
        reminderData.stepUpNextDate = calculateStepUpNextDate(
          newSIPReminder.startDate, 
          newSIPReminder.stepUpFrequency || '1 year'
        );
      } else {
        reminderData.stepUpNextDate = null;
      }

      await addDocument(SIP_REMINDERS_COLLECTION, reminderData);
      
      setNewSIPReminder({
        clientId: '',
        clientName: '',
        amount: 0,
        frequency: 'Monthly',
        startDate: new Date().toISOString().split('T')[0],
        nextDate: '',
        status: 'active',
        stepUpAmount: 0,
        stepUpFrequency: '1 year'
      });
      setShowStepUp(false);
      
      onSIPAdded();
      toast.success('SIP Reminder added successfully');
    } catch (error: any) {
      console.error('Error adding SIP reminder:', error);
      toast.error(error.message || 'Error adding SIP reminder');
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-1">
      <Card className={`mt-1 ${neonCardCls}`}>
        <CardHeader>
          <CardTitle className={neonTitleCls}>Add New SIP Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client" className={neonLabelCls}>Client*</Label>
              <Select
                value={newSIPReminder.clientId}
                onValueChange={(value) => {
                  const client = sortedClients.find(c => c.id === value);
                  setNewSIPReminder(prev => ({
                    ...prev,
                    clientId: value,
                    clientName: client?.name || ''
                  }));
                }}
              >
                <SelectTrigger className={neonInputCls}>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className={neonSelectContentCls}>
                  {sortedClients.map(client => (
                    <SelectItem 
                      key={client.id} 
                      value={client.id}
                      className={neonSelectItemCls}
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className={neonLabelCls}>SIP Amount*</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className={`text-sm ${neonLabelCls}`}>Quick Select</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 1500, 2000, 2500, 3000].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewSIPReminder(prev => ({ ...prev, amount }))}
                        className={`h-10 rounded-lg ${
                          newSIPReminder.amount === amount ? neonQuickBtnActiveCls : neonQuickBtnCls
                        }`}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className={`text-sm ${neonLabelCls}`}>Custom Amount</Label>
                  <Input
                    type="number"
                    value={newSIPReminder.amount || ''}
                    onChange={(e) => setNewSIPReminder(prev => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0
                    }))}
                    className={neonInputCls}
                    min="0"
                    step="100"
                    placeholder="Enter custom amount"
                  />
                </div>
              </div>
            </div>

            {/* Frequency Selection */}
            <div className="space-y-2">
              <Label className={neonLabelCls}>Frequency*</Label>
              <Select
                value={newSIPReminder.frequency}
                onValueChange={(value) => setNewSIPReminder(prev => ({
                  ...prev,
                  frequency: value as 'Monthly' | 'Quarterly' | 'Yearly',
                  nextDate: calculateNextDate(prev.startDate, value as 'Monthly' | 'Quarterly' | 'Yearly')
                }))}
              >
                <SelectTrigger className={neonInputCls}>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className={neonSelectContentCls}>
                  <SelectItem value="Monthly" className={neonSelectItemCls}>Monthly</SelectItem>
                  <SelectItem value="Quarterly" className={neonSelectItemCls}>Quarterly</SelectItem>
                  <SelectItem value="Yearly" className={neonSelectItemCls}>Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className={neonLabelCls}>Start Date*</Label>
              <Input
                type="date"
                value={newSIPReminder.startDate}
                onChange={(e) => setNewSIPReminder(prev => ({
                  ...prev,
                  startDate: e.target.value,
                  nextDate: calculateNextDate(e.target.value, prev.frequency),
                  stepUpNextDate: showStepUp && prev.stepUpAmount && prev.stepUpAmount > 0
                    ? calculateStepUpNextDate(e.target.value, prev.stepUpFrequency || '1 year')
                    : undefined
                }))}
                className={neonInputCls}
              />
            </div>

            {/* Step-up SIP Section */}
            <div className={`border rounded-xl p-4 ${neonStepUpBoxCls}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarPlus className={`h-5 w-5 ${neon ? 'text-fuchsia-400' : 'text-blue-500'}`} />
                  <Label className={`font-medium ${neon ? 'text-cyan-200' : ''}`}>Step-up SIP</Label>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowStepUp(!showStepUp)}
                  className={`rounded-lg ${neonStepUpToggleCls}`}
                >
                  {showStepUp ? 'Hide' : 'Add Step-up'}
                </Button>
              </div>
              
              {showStepUp && (
                <div className="mt-4 space-y-4">
                  <p className={`text-sm ${neonMutedTextCls}`}>
                    Automatically increase your SIP amount at regular intervals.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stepUpAmount" className={neonLabelCls}>Step-up Amount</Label>
                      <Input
                        type="number"
                        id="stepUpAmount"
                        value={newSIPReminder.stepUpAmount !== undefined ? newSIPReminder.stepUpAmount : ''}
                        onChange={(e) => setNewSIPReminder(prev => ({
                          ...prev,
                          stepUpAmount: e.target.value ? parseFloat(e.target.value) : undefined
                        }))}
                        className={neonInputCls}
                        min="0"
                        step="100"
                        placeholder="e.g., 1000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className={neonLabelCls}>Step-up Frequency</Label>
                      <Select
                        value={newSIPReminder.stepUpFrequency}
                        onValueChange={(value) => setNewSIPReminder(prev => ({
                          ...prev,
                          stepUpFrequency: value as '6 months' | '1 year' | '2 years'
                        }))}
                      >
                        <SelectTrigger className={neonInputCls}>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className={neonSelectContentCls}>
                          <SelectItem value="6 months" className={neonSelectItemCls}>Every 6 Months</SelectItem>
                          <SelectItem value="1 year" className={neonSelectItemCls}>Every Year</SelectItem>
                          <SelectItem value="2 years" className={neonSelectItemCls}>Every 2 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {newSIPReminder.stepUpAmount && newSIPReminder.stepUpAmount > 0 && (
                    <div className={`text-sm p-3 rounded-lg ${neonStepUpInfoCls}`}>
                      <p className="font-medium">Step-up Schedule:</p>
                      <p className={`mt-1 ${neonBodyTextCls}`}>
                        Your SIP will increase by ₹{newSIPReminder.stepUpAmount} every{' '}
                        {newSIPReminder.stepUpFrequency === '6 months' ? '6 months' : 
                         newSIPReminder.stepUpFrequency === '1 year' ? 'year' : '2 years'}.
                      </p>
                      <p className={`mt-1 ${neonStepUpInfoAccentCls}`}>
                        First increase on: {newSIPReminder.stepUpNextDate || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <DialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  className={`rounded-lg ${neonCancelBtnCls}`}
                >
                  Cancel
                </Button>
              </DialogTrigger>
              <Button 
                type="submit"
                className={`rounded-lg ${neonSubmitBtnCls}`}
                disabled={!newSIPReminder.clientId || newSIPReminder.amount <= 0}
              >
                Add SIP Reminder
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// MAIN SIP REMINDERS TAB COMPONENT
// ══════════════════════════════════════════════════════════

interface SIPRemindersTabProps {
  theme: ThemeName;
  clients: Client[];
  sipReminders: SIPReminder[];
  setSipReminders: (reminders: SIPReminder[]) => void;
}

export default function SIPRemindersTab({ 
  theme, 
  clients, 
  sipReminders, 
  setSipReminders 
}: SIPRemindersTabProps) {
  const [showSIPForm, setShowSIPForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<SIPReminder | null>(null);
  
  const [sortBy, setSortBy] = useState<'createdAt' | 'clientName' | 'amount'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { cardBg, borderColor, highlightBg, mutedText } = currentTheme;
  const neon = isNeon(theme);

  // ── Neon Helper Classes ──
  const neonCardCls = neon ? 'bg-gray-950 border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.06)]' : `${cardBg} ${borderColor}`;
  const neonTitleCls = neon ? 'text-cyan-300 tracking-wide' : '';
  const neonDescCls = neon ? 'text-cyan-500/60' : mutedText;
  const neonMutedTextCls = neon ? 'text-cyan-500/60' : mutedText;
  const neonBodyTextCls = neon ? 'text-cyan-200/70' : '';
  const neonInputCls = neon ? 'bg-gray-900 border-cyan-500/30 text-cyan-200' : '';
  const neonSelectContentCls = neon ? 'bg-gray-900 border-cyan-500/30' : '';
  const neonSelectItemCls = neon ? 'text-cyan-200 focus:bg-cyan-500/10' : '';
  const neonDividerCls = neon ? 'divide-cyan-500/10' : 'divide-gray-200 dark:divide-gray-700';
  const neonHighlightBg = neon ? 'bg-cyan-950/20 border-cyan-500/15' : highlightBg;
  const neonDialogCls = neon ? 'bg-gray-950 border-cyan-500/20' : `${cardBg} ${borderColor}`;
  const neonDangerDialogCls = neon ? 'bg-gray-950 border-red-500/20' : `${cardBg} ${borderColor}`;

  // ── Sorting Logic ──
  const sortedSipReminders = useMemo(() => {
    return [...sipReminders].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'clientName':
          comparison = a.clientName.localeCompare(b.clientName);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        default:
          comparison = 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [sipReminders, sortBy, sortDirection]);

  // ── Upcoming SIPs (within next 15 days) ──
  const upcomingSips = useMemo(() => {
    const today = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    
    return sipReminders
      .filter(reminder => {
        if (reminder.status !== 'active') return false;
        const nextDate = new Date(reminder.nextDate);
        return nextDate >= today && nextDate <= fifteenDaysFromNow;
      })
      .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
  }, [sipReminders]);

  // ── Action Handlers ──
  const toggleSipStatus = async (id: string) => {
    const reminder = sipReminders.find(r => r.id === id);
    if (!reminder) return;
    const newStatus = reminder.status === 'active' ? 'paused' : 'active';
    try {
      await updateDocument(SIP_REMINDERS_COLLECTION, id, { status: newStatus });
      setSipReminders(sipReminders.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success(`SIP reminder ${newStatus}`);
    } catch (error) {
      toast.error('Error updating SIP status');
      console.error(error);
    }
  };

  const markReminderSent = async (id: string) => {
    try {
      await updateDocument(SIP_REMINDERS_COLLECTION, id, {
        lastReminderSent: new Date().toISOString().split('T')[0]
      });
      setSipReminders(sipReminders.map(r => 
        r.id === id ? { ...r, lastReminderSent: new Date().toISOString().split('T')[0] } : r
      ));
      toast.success('Reminder marked as sent');
    } catch (error) {
      toast.error('Error updating reminder');
      console.error(error);
    }
  };

  const openDeleteDialog = (reminder: SIPReminder) => {
    setReminderToDelete(reminder);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReminderToDelete(null);
  };

  const deleteSipReminder = async () => {
    if (!reminderToDelete) return;
    try {
      await deleteDocument(SIP_REMINDERS_COLLECTION, reminderToDelete.id);
      setSipReminders(sipReminders.filter(r => r.id !== reminderToDelete.id));
      toast.success(`SIP reminder for ${reminderToDelete.clientName} deleted successfully`);
      closeDeleteDialog();
    } catch (error) {
      toast.error('Error deleting SIP reminder');
      console.error(error);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // ── Statistics ──
  const totalSIPInvestments = sipReminders.reduce((sum, r) => sum + r.amount, 0);
  const activeSIPs = sipReminders.filter(r => r.status === 'active').length;
  const pausedSIPs = sipReminders.filter(r => r.status === 'paused').length;
  const stepUpSIPs = sipReminders.filter(r => r.stepUpAmount && r.stepUpAmount > 0).length;
  
  const frequencyData = [
    { name: 'Monthly', value: sipReminders.filter(r => r.frequency === 'Monthly').length },
    { name: 'Quarterly', value: sipReminders.filter(r => r.frequency === 'Quarterly').length },
    { name: 'Yearly', value: sipReminders.filter(r => r.frequency === 'Yearly').length }
  ];
    return (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* ── SIP Reminders List (spans 2 columns) ── */}
    <Card className={`${cardBg} ${borderColor} md:col-span-2`}>
      
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className={neonTitleCls}>SIP Reminders</CardTitle>
          <div className="flex gap-2">
            {/* Sorting Controls */}
            <div className="flex items-center gap-1">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className={`w-[120px] rounded-full ${neonInputCls}`}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className={neonSelectContentCls}>
                  <SelectItem value="createdAt" className={neonSelectItemCls}>Date Created</SelectItem>
                  <SelectItem value="clientName" className={neonSelectItemCls}>Client Name</SelectItem>
                  <SelectItem value="amount" className={neonSelectItemCls}>SIP Amount</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSortDirection}
                className={`px-3 rounded-full ${
                  neon
                    ? 'border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400'
                    : ''
                }`}
              >
                {sortDirection === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
              
              {/* Add SIP Dialog */}
              <Dialog open={showSIPForm} onOpenChange={setShowSIPForm}>
                <DialogTrigger asChild>
                  <Button className={`rounded-full ${
                    neon
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-semibold shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                      : getButtonClasses(theme)
                  }`}>
                    <Plus className="mr-2 h-4 w-4" /> 
                    {showSIPForm ? 'Cancel' : 'Add SIP'}
                  </Button>
                </DialogTrigger>
                
                <DialogContent className={`${neonDialogCls} max-w-2xl max-h-[90vh] overflow-y-auto`}>
                  <DialogHeader>
                    <DialogTitle className={neonTitleCls}>Add New SIP Reminder</DialogTitle>
                    <DialogDescription className={neonDescCls}>
                      Create a new SIP reminder for a client
                    </DialogDescription>
                  </DialogHeader>
                  <AddSIPReminderForm 
                    theme={theme} 
                    clients={clients} 
                    onSIPAdded={() => setShowSIPForm(false)} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className={`divide-y ${neonDividerCls}`}>
            {sortedSipReminders.length === 0 ? (
              <div className={`text-center py-8 ${neonMutedTextCls}`}>
                No SIP reminders yet. Add one above!
              </div>
            ) : (
              sortedSipReminders.map(reminder => (
                <div 
                  key={reminder.id} 
                  className={`p-4 transition-colors ${
                    neon
                      ? 'hover:bg-cyan-950/10'
                      : `${cardBg} ${borderColor}`
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-medium ${neon ? 'text-cyan-200' : ''}`}>
                        {reminder.clientName}
                      </h4>
                      <p className={`text-sm ${neonMutedTextCls}`}>
                        ₹{reminder.amount} • {reminder.frequency} • Next: {reminder.nextDate}
                      </p>
                      {reminder.stepUpAmount && reminder.stepUpAmount > 0 && (
                        <div className={`mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          neon
                            ? 'bg-fuchsia-950/30 text-fuchsia-300 border border-fuchsia-500/20'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          <CalendarPlus className={`h-3 w-3 ${neon ? 'text-fuchsia-400' : 'text-blue-500'}`} />
                          <span>
                            Step-up: +₹{reminder.stepUpAmount} every {reminder.stepUpFrequency}
                          </span>
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${neon ? 'text-cyan-600/50' : 'text-gray-400 dark:text-gray-500'}`}>
                        Created: {new Date(reminder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markReminderSent(reminder.id)}
                        className={`rounded-full ${
                          neon
                            ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                            : 'text-green-600 hover:text-green-700 dark:text-green-400'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleSipStatus(reminder.id)}
                        className={
                          neon
                            ? reminder.status === 'active'
                              ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                              : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                            : reminder.status === 'active' 
                              ? "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400" 
                              : "text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        }
                      >
                        {reminder.status === 'active' 
                          ? <Pause className="h-4 w-4" /> 
                          : <Play className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openDeleteDialog(reminder)}
                        className={`${
                          neon
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                            : 'text-red-600 hover:text-red-700 dark:text-red-400'
                        }`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Statistics Column (3rd column) ── */}
      <div className="space-y-4">
        {/* Total SIP Investments */}
        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${neon ? 'text-cyan-300/80' : ''}`}>
              Total SIP Investments
            </CardTitle>
            <TrendingUp className={`h-4 w-4 ${neon ? 'text-green-400 shadow-[0_0_0px_rgba(74,222,128,0.4)]' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${neon ? 'text-green-400' : ''}`}>
              ₹{totalSIPInvestments.toLocaleString()}
            </div>
            <p className={`text-xs ${neonMutedTextCls}`}>Across all active SIPs</p>
          </CardContent>
        </Card>

        {/* Active vs Paused */}
        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${neon ? 'text-cyan-300/80' : ''}`}>
              SIP Status
            </CardTitle>
            <Activity className={`h-4 w-4 ${neon ? 'text-cyan-400 shadow-[0_0_0px_rgba(0,255,255,0.4)]' : 'text-blue-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className={`text-2xl font-bold ${neon ? 'text-green-400 shadow-[0_0_0px_rgba(74,222,128,0.3)]' : 'text-green-500'}`}>
                  {activeSIPs}
                </div>
                <p className={`text-xs ${neonMutedTextCls}`}>Active</p>
              </div>
              <div>
                <div className={`text-2xl font-bold ${neon ? 'text-amber-400 shadow-[0_0_0px_rgba(245,158,11,0.3)]' : 'text-yellow-500'}`}>
                  {pausedSIPs}
                </div>
                <p className={`text-xs ${neonMutedTextCls}`}>Paused</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-up SIPs */}
        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${neon ? 'text-cyan-300/80' : ''}`}>
              Step-up SIPs
            </CardTitle>
            <CalendarPlus className={`h-4 w-4 ${neon ? 'text-fuchsia-400 shadow-[0_0_8px_rgba(255,0,255,0.4)]' : 'text-blue-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${neon ? 'text-fuchsia-400 shadow-[0_0_0px_rgba(255,0,255,0.3)]' : 'text-blue-500'}`}>
              {stepUpSIPs}
            </div>
            <p className={`text-xs ${neonMutedTextCls}`}>With automatic increases</p>
          </CardContent>
        </Card>

        {/* Frequency Distribution Pie Chart */}
        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${neon ? 'text-cyan-300/80' : ''}`}>
              Frequency Distribution
            </CardTitle>
            <PieChart className={`h-4 w-4 ${neon ? 'text-fuchsia-400' : 'text-purple-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={frequencyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    stroke={neon ? 'rgba(0,255,255,0.15)' : 'none'}
                    strokeWidth={neon ? 1 : 0}
                  >
                    {NEON_COLORS.map((color, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={neon ? color : ['#0088FE', '#00C49F', '#FFBB28'][index]} 
                        style={neon ? { filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.4))' } : {}}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={neon ? {
                      backgroundColor: '#0a0a1a',
                      border: '1px solid rgba(0,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#00ffff',
                      boxShadow: '0 0 15px rgba(0,255,255,0.1)'
                    } : {}}
                    itemStyle={neon ? { color: '#00ffff' } : {}}
                    labelStyle={neon ? { color: '#00ffff' } : {}}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Upcoming SIPs (4th column) ── */}
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader>
          <CardTitle className={neonTitleCls}>
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${neon ? 'text-amber-400' : ''}`} />
              Upcoming SIPs
            </div>
          </CardTitle>
          <CardDescription className={neonDescCls}>
            Due in next 15 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSips.length === 0 ? (
              <div className={`text-center py-4 ${neonMutedTextCls}`}>
                No upcoming SIPs in the next 15 days
              </div>
            ) : (
              upcomingSips.map(reminder => {
                const client = clients.find(c => c.id === reminder.clientId);
                return (
                  <div key={reminder.id} className={`p-3 border rounded-xl ${
                    neon
                      ? 'border-amber-500/15 bg-amber-950/10 hover:border-amber-400/30 transition-colors'
                      : `${borderColor} ${highlightBg}`
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className={`font-medium ${neon ? 'text-cyan-200' : ''}`}>
                          {client?.name}
                        </h4>
                        <p className={`text-sm ${neonMutedTextCls}`}>
                          {new Date(reminder.nextDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${neon ? 'text-amber-300' : ''}`}>
                          ₹{reminder.amount.toLocaleString()}
                        </p>
                        <p className={`text-xs ${neonMutedTextCls}`}>{reminder.frequency}</p>
                      </div>
                    </div>
                    {reminder.stepUpAmount && reminder.stepUpAmount > 0 && (
                      <div className={`mt-2 text-xs ${neon ? 'text-fuchsia-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        Step-up: +₹{reminder.stepUpAmount} on {reminder.stepUpNextDate}
                      </div>
                    )}
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markReminderSent(reminder.id)}
                        className={`text-xs rounded-full ${
                          neon
                            ? 'border-green-500/30 text-green-400 bg-green-950/30 hover:bg-green-500/10 hover:border-green-400'
                            : getButtonClasses(theme, 'secondary')
                        }`}
                      >
                        <Bell className="mr-1 h-3 w-3" /> Remind
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSipStatus(reminder.id)}
                        className={`text-xs rounded-full ${
                          neon
                            ? reminder.status === 'active'
                              ? 'border-amber-500/30 text-amber-400 bg-amber-950/30 hover:bg-amber-500/10 hover:border-amber-400'
                              : 'border-green-500/30 text-green-400 bg-green-950/30 hover:bg-green-500/10 hover:border-green-400'
                            : reminder.status === 'active' 
                              ? getButtonClasses(theme, 'danger') 
                              : getButtonClasses(theme, 'success')
                        }`}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(reminder)}
                        className={`text-xs rounded-full ${
                          neon
                            ? 'border-red-500/30 text-red-400 bg-red-950/30 hover:bg-red-500/10 hover:border-red-400'
                            : getButtonClasses(theme, 'danger')
                        }`}
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className={neonDangerDialogCls}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${neon ? 'text-red-400' : ''}`}>
              <AlertTriangle className={`h-5 w-5 ${neon ? 'text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.4)]' : 'text-red-500'}`} />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className={neon ? 'text-cyan-500/60' : ''}>
              {reminderToDelete && (
                <div className="mt-2">
                  <p className={neon ? 'text-cyan-200/70' : ''}>
                    Are you sure you want to delete the SIP reminder for:
                  </p>
                  <p className={`font-semibold mt-2 ${neon ? 'text-cyan-300' : ''}`}>
                    {reminderToDelete.clientName}
                  </p>
                  <p className={`text-sm mt-1 ${neon ? 'text-cyan-200/60' : ''}`}>
                    Amount: ₹{reminderToDelete.amount} | Frequency: {reminderToDelete.frequency}
                  </p>
                  {reminderToDelete.stepUpAmount && reminderToDelete.stepUpAmount > 0 && (
                    <p className={`text-sm mt-1 ${neon ? 'text-fuchsia-400' : ''}`}>
                      Step-up: +₹{reminderToDelete.stepUpAmount} every {reminderToDelete.stepUpFrequency}
                    </p>
                  )}
                  <p className={`text-sm mt-3 ${neon ? 'text-red-400 shadow-[0_0_8px_rgba(255,0,0,0.2)]' : 'text-red-500'}`}>
                    This action cannot be undone.
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={closeDeleteDialog}
              className={`rounded-lg ${
                neon
                  ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400'
                  : getButtonClasses(theme, 'outline')
              }`}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteSipReminder}
              className={`rounded-lg ${
                neon
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(255,0,0,0.3)]'
                  : getButtonClasses(theme, 'danger')
              }`}
            >
              Delete SIP Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}