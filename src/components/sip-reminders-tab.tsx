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
import { ThemeName, themes, getButtonClasses } from '@/lib/theme';
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
  // Step-up SIP fields
  stepUpAmount?: number;
  stepUpFrequency?: '6 months' | '1 year' | '2 years';
  stepUpNextDate?: string;
};

interface AddSIPReminderFormProps {
  theme: ThemeName;
  clients: Client[];
  onSIPAdded: () => void;
}

const AddSIPReminderForm = ({ theme, clients, onSIPAdded }: AddSIPReminderFormProps) => {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { cardBg, borderColor, inputBg, highlightBg, textColor } = currentTheme;

  // Sort clients by latest added first
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
    // Step-up fields
    stepUpAmount: 0,
    stepUpFrequency: '1 year'
  });

  const [showStepUp, setShowStepUp] = useState(false);

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

      const reminderData = {
        ...newSIPReminder,
        nextDate: calculateNextDate(newSIPReminder.startDate, newSIPReminder.frequency),
        stepUpNextDate: showStepUp && newSIPReminder.stepUpAmount && newSIPReminder.stepUpAmount > 0
          ? calculateStepUpNextDate(newSIPReminder.startDate, newSIPReminder.stepUpFrequency || '1 year')
          : undefined,
        createdAt: new Date().toISOString()
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
      <Card className={`mt-1 ${cardBg} ${borderColor}`}>
        <CardHeader>
          <CardTitle>Add New SIP Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">Client*</Label>
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
                <SelectTrigger className={`${inputBg} ${borderColor}`}>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className={`${cardBg} ${borderColor}`}>
                  {sortedClients.map(client => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Predefined Amounts */}
                <div className="space-y-2">
                  <Label className="text-sm">Quick Select</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 1500, 2000, 2500, 3000].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setNewSIPReminder(prev => ({
                          ...prev,
                          amount
                        }))}
                        className={`h-10 ${newSIPReminder.amount === amount ? 'bg-primary text-primary-foreground' : ''}`}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Manual Amount Entry */}
                <div className="space-y-2">
                  <Label className="text-sm">Custom Amount</Label>
                  <Input
                    type="number"
                    value={newSIPReminder.amount || ''}
                    onChange={(e) => setNewSIPReminder(prev => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0
                    }))}
                    className={`${inputBg} ${borderColor}`}
                    min="0"
                    step="100"
                    placeholder="Enter custom amount"
                  />
                </div>
              </div>
            </div>

            {/* Frequency Selection */}
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date*</Label>
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
                className={`${inputBg} ${borderColor}`}
              />
            </div>

            {/* Step-up SIP Section */}
            <div className={`border rounded-lg p-4 ${borderColor} ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarPlus className="h-5 w-5 text-blue-500" />
                  <Label className="font-medium">Step-up SIP</Label>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowStepUp(!showStepUp)}
                  className={getButtonClasses(theme, 'outline')}
                >
                  {showStepUp ? 'Hide' : 'Add Step-up'}
                </Button>
              </div>
              
              {showStepUp && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically increase your SIP amount at regular intervals.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stepUpAmount">Step-up Amount</Label>
                      <Input
                        type="number"
                        id="stepUpAmount"
                        value={newSIPReminder.stepUpAmount || ''}
                        onChange={(e) => setNewSIPReminder(prev => ({
                          ...prev,
                          stepUpAmount: parseFloat(e.target.value) || 0
                        }))}
                        className={`${inputBg} ${borderColor}`}
                        min="0"
                        step="100"
                        placeholder="e.g., 1000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Step-up Frequency</Label>
                      <Select
                        value={newSIPReminder.stepUpFrequency}
                        onValueChange={(value) => setNewSIPReminder(prev => ({
                          ...prev,
                          stepUpFrequency: value as '6 months' | '1 year' | '2 years'
                        }))}
                      >
                        <SelectTrigger className={`${inputBg} ${borderColor}`}>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className={`${cardBg} ${borderColor}`}>
                          <SelectItem value="6 months">Every 6 Months</SelectItem>
                          <SelectItem value="1 year">Every Year</SelectItem>
                          <SelectItem value="2 years">Every 2 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {newSIPReminder.stepUpAmount && newSIPReminder.stepUpAmount > 0 && (
                    <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="font-medium">Step-up Schedule:</p>
                      <p className="mt-1">
                        Your SIP will increase by ₹{newSIPReminder.stepUpAmount} every{' '}
                        {newSIPReminder.stepUpFrequency === '6 months' ? '6 months' : 
                         newSIPReminder.stepUpFrequency === '1 year' ? 'year' : '2 years'}.
                      </p>
                      <p className="mt-1 text-blue-700 dark:text-blue-300">
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
                  className={getButtonClasses(theme, 'outline')}
                >
                  Cancel
                </Button>
              </DialogTrigger>
              <Button 
                type="submit"
                className={getButtonClasses(theme)}
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
  
  // Sorting state
  const [sortBy, setSortBy] = useState<'createdAt' | 'clientName' | 'amount'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const { cardBg, borderColor, highlightBg, mutedText } = currentTheme;

  // Apply sorting to SIP reminders
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

  const toggleSipStatus = async (id: string) => {
    const reminder = sipReminders.find(r => r.id === id);
    if (!reminder) return;

    const newStatus = reminder.status === 'active' ? 'paused' : 'active';
    
    try {
      await updateDocument(SIP_REMINDERS_COLLECTION, id, { status: newStatus });
      setSipReminders(sipReminders.map(r => 
        r.id === id ? { ...r, status: newStatus } : r
      ));
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

  // Function to open delete confirmation dialog
  const openDeleteDialog = (reminder: SIPReminder) => {
    setReminderToDelete(reminder);
    setDeleteDialogOpen(true);
  };

  // Function to close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReminderToDelete(null);
  };

  // Delete SIP reminder function
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

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Statistics calculations
  const totalSIPInvestments = sipReminders.reduce((sum, r) => sum + r.amount, 0);
  const activeSIPs = sipReminders.filter(r => r.status === 'active').length;
  const pausedSIPs = sipReminders.filter(r => r.status === 'paused').length;
  const stepUpSIPs = sipReminders.filter(r => r.stepUpAmount && r.stepUpAmount > 0).length;
  
  const frequencyData = [
    { name: 'Monthly', value: sipReminders.filter(r => r.frequency === 'Monthly').length },
    { name: 'Quarterly', value: sipReminders.filter(r => r.frequency === 'Quarterly').length },
    { name: 'Yearly', value: sipReminders.filter(r => r.frequency === 'Yearly').length }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* SIP Reminders List - spans 2 columns */}
      <Card className={`${cardBg} ${borderColor} md:col-span-2`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>SIP Reminders</CardTitle>
            <div className="flex gap-2">
              {/* Sorting Controls */}
              <div className="flex items-center gap-1">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="clientName">Client Name</SelectItem>
                    <SelectItem value="amount">SIP Amount</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleSortDirection}
                  className="px-2"
                >
                  {sortDirection === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Dialog open={showSIPForm} onOpenChange={setShowSIPForm}>
                <DialogTrigger asChild>
                  <Button className={getButtonClasses(theme)}>
                    <Plus className="mr-2 h-4 w-4" /> 
                    {showSIPForm ? 'Cancel' : 'Add SIP'}
                  </Button>
                </DialogTrigger>
                
                <DialogContent className={`${cardBg} ${borderColor} max-w-2xl max-h-[90vh] overflow-y-auto`}>
                  <DialogHeader>
                    <DialogTitle>Add New SIP Reminder</DialogTitle>
                    <DialogDescription>
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
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedSipReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No SIP reminders yet. Add one above!
              </div>
            ) : (
              sortedSipReminders.map(reminder => (
                <div 
                  key={reminder.id} 
                  className={`p-4 ${cardBg} ${borderColor}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{reminder.clientName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ₹{reminder.amount} • {reminder.frequency} • Next: {reminder.nextDate}
                      </p>
                      {reminder.stepUpAmount && reminder.stepUpAmount > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                          <CalendarPlus className="h-3 w-3 text-blue-500" />
                          <span>
                            Step-up: +₹{reminder.stepUpAmount} every {reminder.stepUpFrequency}
                          </span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Created: {new Date(reminder.createdAt).toLocaleDateString()}
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
                        className={
                          reminder.status === 'active' 
                            ? "text-yellow-600 hover:text-yellow-700 dark:text-yellow-400" 
                            : "text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        }
                      >
                        {reminder.status === 'active' 
                          ? <Pause className="h-4 w-4" /> 
                          : <Play className="h-4 w-4" />}
                      </Button>
                      {/* Add Delete Button */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openDeleteDialog(reminder)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
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
              ₹{totalSIPInvestments.toLocaleString()}
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
                  {activeSIPs}
                </div>
                <p className={`text-xs ${mutedText}`}>Active</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {pausedSIPs}
                </div>
                <p className={`text-xs ${mutedText}`}>Paused</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-up SIPs */}
        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Step-up SIPs</CardTitle>
            <CalendarPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stepUpSIPs}
            </div>
            <p className={`text-xs ${mutedText}`}>With automatic increases</p>
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
                    data={frequencyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {COLORS.map((color, index) => (
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
            {sortedSipReminders
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
                    {reminder.stepUpAmount && reminder.stepUpAmount > 0 && (
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        Step-up: +₹{reminder.stepUpAmount} on {reminder.stepUpNextDate}
                      </div>
                    )}
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
                      {/* Add Delete Button to Upcoming SIPs */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(reminder)}
                        className={`${getButtonClasses(theme, 'danger')} text-xs`}
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className={`${cardBg} ${borderColor}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              {reminderToDelete && (
                <div className="mt-2">
                  <p>Are you sure you want to delete the SIP reminder for:</p>
                  <p className="font-semibold mt-2">{reminderToDelete.clientName}</p>
                  <p className="text-sm mt-1">
                    Amount: ₹{reminderToDelete.amount} | Frequency: {reminderToDelete.frequency}
                  </p>
                  {reminderToDelete.stepUpAmount && reminderToDelete.stepUpAmount > 0 && (
                    <p className="text-sm mt-1">
                      Step-up: +₹{reminderToDelete.stepUpAmount} every {reminderToDelete.stepUpFrequency}
                    </p>
                  )}
                  <p className="text-sm text-red-500 mt-3">
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
              className={getButtonClasses(theme, 'outline')}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteSipReminder}
              className={getButtonClasses(theme, 'danger')}
            >
              Delete SIP Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}