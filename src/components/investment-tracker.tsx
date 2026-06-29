"use client";

import { useState, useEffect } from 'react'
import { Star, Edit, Save, Lock, ChevronDown, ChevronUp, Plus, Trash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore"
import { createContext, useContext } from 'react';

import { 
  ThemeName, 
  ThemeColors, 
  themes, 
  getButtonClasses 
} from '@/lib/theme';

interface ClientInvestment {
  id: string;
  name: string;
  sipAmount: number;
  lumpsumAmount: number;
}

interface InvestmentRecord {
  month: string
  monthIndex: number
  sipTarget: number
  lumpsumTarget: number
  sipAchieved: number
  lumpsumAchieved: number
  isEditable: boolean
  clients: ClientInvestment[]
}

interface InvestmentTrackerProps {
  theme?: ThemeName;
}

const ThemeContext = createContext({
  theme: 'blue-smoke' as ThemeName,
  setTheme: (theme: ThemeName) => {},
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>('blue-smoke');
  const [previousTheme, setPreviousTheme] = useState<ThemeName>('blue-smoke');

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme(previousTheme);
    } else {
      setPreviousTheme(theme);
      setTheme('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

const defaultRecords: InvestmentRecord[] = [
  { month: "January", monthIndex: 0, sipTarget: 15000, lumpsumTarget: 4000000, sipAchieved: 15000, lumpsumAchieved: 85000, isEditable: false, clients: [] },
  { month: "February", monthIndex: 1, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false, clients: [] },
  { month: "March", monthIndex: 2, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 7000, lumpsumAchieved: 0, isEditable: false, clients: [] },
  { month: "April", monthIndex: 3, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false, clients: [] },
  { month: "May", monthIndex: 4, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 14000, lumpsumAchieved: 0, isEditable: false, clients: [] },
  { month: "June", monthIndex: 5, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false, clients: [] },
  { month: "July", monthIndex: 6, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false, clients: [] },
  { month: "August", monthIndex: 7, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false, clients: [] },
  { month: "September", monthIndex: 8, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false, clients: [] },
  { month: "October", monthIndex: 9, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false, clients: [] },
  { month: "November", monthIndex: 10, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false, clients: [] },
  { month: "December", monthIndex: 11, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false, clients: [] },
]

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

export default function InvestmentTracker({ theme = 'blue-smoke' }: InvestmentTrackerProps) {
  const currentTheme = themes[theme] || themes['blue-smoke'];
  const neon = theme === 'neon-cyberpunk';
  
  const {
    bgColor,
    textColor,
    cardBg,
    borderColor,
    inputBg,
    mutedText,
    highlightBg,
    selectedBg
  } = currentTheme;

  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isEditingMonthly, setIsEditingMonthly] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [currentMonthName, setCurrentMonthName] = useState(
    new Date().toLocaleString('default', { month: 'long' })
  );
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState<InvestmentRecord[]>(defaultRecords);
  const [expandedMonths, setExpandedMonths] = useState<Record<number, boolean>>({});
  const [clientToDelete, setClientToDelete] = useState<{ monthIndex: number; clientId: string } | null>(null);

  const calculateTotals = () => {
    const monthlySipTarget = Math.max(0, records[0]?.sipTarget || 0);
    const lumpsumTarget = Math.max(0, records.reduce((sum, record) => sum + (record.lumpsumTarget || 0), 0));
    const sipAchieved = Math.max(0, records.reduce((sum, record) => sum + (record.sipAchieved || 0), 0));
    const lumpsumAchieved = Math.max(0, records.reduce((sum, record) => sum + (record.lumpsumAchieved || 0), 0));

    return {
      sipTarget: monthlySipTarget * 12,
      lumpsumTarget,
      sipAchieved,
      lumpsumAchieved,
    };
  };

  const totals = calculateTotals();

  const toggleMonthExpansion = (monthIndex: number) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthIndex]: !prev[monthIndex]
    }));
  };

  const handleClientChange = async (monthIndex: number, clientId: string, field: keyof ClientInvestment, value: string | number) => {
    const updatedRecords = records.map(record => {
      if (record.monthIndex === monthIndex) {
        const updatedClients = record.clients.map(client => 
          client.id === clientId ? { ...client, [field]: value } : client
        );
        const newSipAchieved = updatedClients.reduce((sum, client) => sum + (client.sipAmount || 0), 0);
        const newLumpsumAchieved = updatedClients.reduce((sum, client) => sum + (client.lumpsumAmount || 0), 0);
        return { 
          ...record, 
          clients: updatedClients,
          sipAchieved: newSipAchieved,
          lumpsumAchieved: newLumpsumAchieved
        };
      }
      return record;
    });
    setRecords(updatedRecords);
    await saveToFirestore(updatedRecords);
  };

  const addNewClient = async (monthIndex: number) => {
    const updatedRecords = records.map(record => {
      if (record.monthIndex === monthIndex) {
        const clients = record.clients || [];
        const newClient: ClientInvestment = {
          id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `New Client ${clients.length + 1}`,
          sipAmount: 0,
          lumpsumAmount: 0
        };
        return { ...record, clients: [...clients, newClient] };
      }
      return record;
    });
    setRecords(updatedRecords);
    await saveToFirestore(updatedRecords);
  };

  const confirmDeleteClient = (monthIndex: number, clientId: string) => {
    setClientToDelete({ monthIndex, clientId });
  };

  const cancelDeleteClient = () => {
    setClientToDelete(null);
  };

  const removeClient = async () => {
    if (!clientToDelete) return;
    const { monthIndex, clientId } = clientToDelete;
    const updatedRecords = records.map(record => {
      if (record.monthIndex === monthIndex) {
        const updatedClients = record.clients.filter(client => client.id !== clientId);
        const newSipAchieved = updatedClients.reduce((sum, client) => sum + (client.sipAmount || 0), 0);
        const newLumpsumAchieved = updatedClients.reduce((sum, client) => sum + (client.lumpsumAmount || 0), 0);
        return { 
          ...record, 
          clients: updatedClients,
          sipAchieved: newSipAchieved,
          lumpsumAchieved: newLumpsumAchieved
        };
      }
      return record;
    });
    setRecords(updatedRecords);
    await saveToFirestore(updatedRecords);
    setClientToDelete(null);
    toast({ title: "Client Deleted", description: "The client has been successfully removed." });
  };

  const handleUpdateAchievedValue = async (monthIndex: number, field: 'sipAchieved' | 'lumpsumAchieved', value: number) => {
    const updatedRecords = records.map(record => 
      record.monthIndex === monthIndex ? { ...record, [field]: value } : record
    );
    await saveToFirestore(updatedRecords);
  };

  const handleUpdateTargetValue = async (field: 'sipTarget' | 'lumpsumTarget', value: number) => {
    const updatedRecords = records.map(record => ({
      ...record,
      [field]: field === 'sipTarget' ? value : (record.monthIndex === 0 ? value : 0)
    }));
    await saveToFirestore(updatedRecords);
  };

  useEffect(() => {
    const updateCurrentMonth = () => {
      const now = new Date();
      const newMonthIndex = now.getMonth();
      const newYear = now.getFullYear();
      if (newMonthIndex !== currentMonthIndex) {
        setCurrentMonthIndex(newMonthIndex);
        setCurrentMonthName(now.toLocaleString('default', { month: 'long' }));
      }
      if (newYear !== currentYear) setCurrentYear(newYear);
    };
    updateCurrentMonth();
    const interval = setInterval(updateCurrentMonth, 3600000);
    return () => clearInterval(interval);
  }, [currentMonthIndex, currentYear]);

  const investmentDocRef = doc(db, 'investmentTracker', currentYear.toString());

  useEffect(() => {
    const unsubscribe = onSnapshot(investmentDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const sanitizedRecords = (data.records || defaultRecords).map(record => ({
          ...record,
          clients: record.clients || []
        }));
        setRecords(sanitizedRecords);
        if (data.currentMonthIndex !== currentMonthIndex) {
          setCurrentMonthIndex(data.currentMonthIndex);
          setCurrentMonthName(new Date(currentYear, data.currentMonthIndex, 1).toLocaleString('default', { month: 'long' }));
        }
      } else {
        initializeFirestoreData();
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [currentYear]);

  const initializeFirestoreData = async () => {
    try {
      await setDoc(investmentDocRef, {
        records: defaultRecords.map(record => ({ ...record, clients: record.clients || [] })),
        currentMonthIndex: currentMonthIndex,
        year: currentYear,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error initializing data:", error);
      toast({ title: "Error", description: "Failed to initialize investment tracker", variant: "destructive" });
    }
  };

  useEffect(() => {
    const updatedRecords = records.map(record => ({
      ...record,
      isEditable: record.monthIndex === currentMonthIndex
    }));
    if (JSON.stringify(updatedRecords) !== JSON.stringify(records)) {
      setRecords(updatedRecords);
    }
  }, [currentMonthIndex, records]);

  const saveToFirestore = async (updatedRecords: InvestmentRecord[], newMonthIndex?: number) => {
    try {
      const sanitizedRecords = updatedRecords.map(record => ({ ...record, clients: record.clients || [] }));
      await setDoc(investmentDocRef, {
        records: sanitizedRecords,
        currentMonthIndex: newMonthIndex !== undefined ? newMonthIndex : currentMonthIndex,
        year: currentYear,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setRecords(sanitizedRecords);
      if (newMonthIndex !== undefined) {
        setCurrentMonthIndex(newMonthIndex);
        setCurrentMonthName(new Date(currentYear, newMonthIndex, 1).toLocaleString('default', { month: 'long' }));
      }
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      toast({ title: 'Error', description: 'Failed to save data', variant: 'destructive' });
    }
  };

  const completeCurrentMonth = async () => {
    let newMonthIndex = currentMonthIndex < 11 ? currentMonthIndex + 1 : 0;
    let newYear = currentYear;
    if (currentMonthIndex === 11) {
      newYear = currentYear + 1;
      setCurrentYear(newYear);
    }
    setCurrentMonthIndex(newMonthIndex);
    setCurrentMonthName(new Date(newYear, newMonthIndex, 1).toLocaleString('default', { month: 'long' }));
    await saveToFirestore(records, newMonthIndex);
  };

  // ─── Neon helper classes ───────────────────────────────────────
  const neonCardBase = neon ? 'border-cyan-500/25 shadow-[0_0_25px_rgba(0,255,255,0.08)]' : '';
  const neonSipCard = neon ? 'border-cyan-500/25 shadow-[0_0_25px_rgba(0,255,255,0.08)]' : '';
  const neonLumpCard = neon ? 'border-emerald-500/25 shadow-[0_0_25px_rgba(52,211,153,0.08)]' : '';
  const neonYearCard = neon ? 'border-violet-500/25 shadow-[0_0_25px_rgba(139,92,246,0.08)]' : '';
  const neonMonthlyCard = neon ? 'border-fuchsia-500/25 shadow-[0_0_25px_rgba(217,70,239,0.08)]' : '';
  const neonClientCard = neon ? 'border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.06)]' : '';

  const neonTitleCls = neon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : '';
  const neonSipTitle = neon ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]' : '';
  const neonLumpTitle = neon ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' : '';
  const neonYearTitle = neon ? 'text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]' : '';
  const neonMonthlyTitle = neon ? 'text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.4)]' : '';

  const neonLabelCls = neon ? 'text-slate-400 drop-shadow-[0_0_2px_rgba(0,255,255,0.1)]' : '';
  const neonValueCls = neon ? 'text-cyan-100 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]' : '';
  const neonPrimaryCls = neon ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]' : '';
  const neonMutedCls = neon ? 'text-slate-500' : '';

  const neonProgressTrack = neon ? 'bg-slate-800 border border-cyan-500/15' : 'bg-gray-200';
  const neonSipBar = neon ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.6)]' : (theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500');
  const neonLumpBar = neon ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-green-500';

  const neonInputCls = neon 
    ? 'bg-slate-900 border-cyan-500/30 text-cyan-100 placeholder-slate-500 focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(0,255,255,0.3)]' 
    : `${inputBg} ${borderColor}`;

  const neonTableHead = neon ? 'bg-slate-800/80 text-cyan-400/80' : 'bg-muted';
  const neonTableBody = neon ? 'divide-cyan-500/10' : 'divide-border';
  const neonCurrentRow = neon ? 'bg-cyan-500/[0.02] rounded-full' : 'bg-cyan-500/10 rounded-full';
  const neonSummaryBox = neon ? 'bg-slate-800/60 border border-cyan-500/10' : 'bg-muted';

  const neonDeficitPositive = neon ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-green-500';
  const neonDeficitNegative = neon ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : 'text-red-500';

  const neonBtnOutline = neon 
    ? 'border-cyan-500/40 text-cyan-300 shadow-[0_0_6px_rgba(0,255,255,0.12)] hover:border-cyan-400 hover:shadow-[0_0_14px_rgba(0,255,255,0.3)] hover:text-cyan-200' 
    : getButtonClasses(theme, 'outline');

  const neonBtnDestructive = neon 
    ? 'bg-red-500/20 border border-red-500/40 text-red-300 shadow-[0_0_8px_rgba(248,113,113,0.3)] hover:bg-red-500/30 hover:shadow-[0_0_14px_rgba(248,113,113,0.5)]' 
    : '';

  const neonBtnGhost = neon ? 'text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10' : '';
  const neonChevronCls = neon ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : '';
  const neonLockCls = neon ? 'text-slate-500' : 'text-muted-foreground dark:text-gray-400';
  const neonStarCls = neon ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'text-green-500';
  const neonCurrentBadge = neon ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : 'text-blue-500 dark:text-blue-400';

  return (
    <div className={`space-y-4 ${bgColor} ${textColor}`}>
      {/* ─── Confirmation Dialog ──────────────────────────────── */}
      {clientToDelete && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${neon ? 'bg-black/70' : 'bg-black bg-opacity-40'}`}>
          <Card className={`w-full max-w-md ${neon ? 'bg-slate-900 border-red-500/30 shadow-[0_0_30px_rgba(248,113,113,0.15)]' : 'bg-white dark:bg-gray-300'}`}>
            <CardHeader>
              <CardTitle className={neon ? 'text-red-300 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]' : ''}>Confirm Deletion</CardTitle>
              <CardDescription className={neon ? 'text-slate-400' : ''}>Are you sure you want to delete this client? This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelDeleteClient} className={neonBtnOutline}>Cancel</Button>
              <Button variant="destructive" onClick={removeClient} className={neon ? neonBtnDestructive : ''}>Delete</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Main Investment Card ─────────────────────────────── */}
      <Card className={`${cardBg} ${borderColor} ${neonCardBase}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className={neonTitleCls}>Investment Tracker - {currentYear}</CardTitle>
              <CardDescription className={neon ? 'text-slate-400' : ''}>Track your monthly investment goals and achievements</CardDescription>
            </div>
            <div className={`text-sm ${neon ? 'text-cyan-400/70 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]' : 'text-muted-foreground'}`}>
              Current Month: {currentMonthName} {currentYear}
            </div>
          </div>
        </CardHeader>

        {/* ─── Summary Cards ──────────────────────────────────── */}
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-semibold ${neon ? 'text-cyan-200 drop-shadow-[0_0_6px_rgba(0,255,255,0.3)]' : ''}`}>Investment Summary</h3>
            <Button onClick={() => setIsEditingSummary(!isEditingSummary)} variant="outline" className={`gap-2 rounded-full ${neonBtnOutline}`}>
              {isEditingSummary ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {isEditingSummary ? "Save Summary" : "Edit Summary"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SIP Summary */}
            <Card className={`${highlightBg} ${borderColor} ${neonSipCard}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${neonSipTitle}`}>SIP Summary (Yearly)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <Label className={neonLabelCls}>Target:</Label>
                  {isEditingSummary ? (
                    <Input type="number" value={records[0]?.sipTarget || 0} onChange={(e) => handleUpdateTargetValue('sipTarget', Number(e.target.value))} className={`w-24 ${neonInputCls}`} />
                  ) : (
                    <span className={`font-medium ${neonValueCls}`}>{formatCurrency(totals.sipTarget)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <Label className={neonLabelCls}>Achieved:</Label>
                  <span className={`text-primary font-medium ${neonPrimaryCls}`}>{formatCurrency(totals.sipAchieved)}</span>
                </div>
                <div className="flex justify-between">
                  <Label className={neonLabelCls}>Deficit:</Label>
                  <span className={`font-medium ${totals.sipAchieved >= totals.sipTarget ? neonDeficitPositive : neonDeficitNegative}`}>{formatCurrency(totals.sipAchieved - totals.sipTarget)}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={neonLabelCls}>Progress: <span className={neon ? 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : ''}>{totals.sipTarget > 0 ? `${Math.min(100, Math.round((totals.sipAchieved / totals.sipTarget) * 100))}` : '0'}%</span></span>
                  </div>
                  <div className={`w-full rounded-full h-3 overflow-hidden ${neonProgressTrack}`}>
                    <div className={`h-full rounded-full ${neonSipBar} transition-all duration-300`} style={{ width: totals.sipTarget > 0 ? `${Math.min(100, (totals.sipAchieved / totals.sipTarget) * 100)}%` : '0%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lumpsum Summary */}
            <Card className={`${highlightBg} ${borderColor} ${neonLumpCard}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${neonLumpTitle}`}>Lumpsum Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <Label className={neonLabelCls}>Target:</Label>
                  {isEditingSummary ? (
                    <Input type="number" value={records[0]?.lumpsumTarget || 0} onChange={(e) => handleUpdateTargetValue('lumpsumTarget', Number(e.target.value))} className={`w-24 ${neonInputCls}`} />
                  ) : (
                    <span className={`font-medium ${neon ? 'text-emerald-100 drop-shadow-[0_0_4px_rgba(52,211,153,0.2)]' : ''}`}>{formatCurrency(records[0]?.lumpsumTarget || 0)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <Label className={neonLabelCls}>Achieved:</Label>
                  <span className={`text-primary font-medium ${neon ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]' : ''}`}>{formatCurrency(totals.lumpsumAchieved)}</span>
                </div>
                <div className="flex justify-between">
                  <Label className={neonLabelCls}>Deficit:</Label>
                  <span className={`font-medium ${totals.lumpsumAchieved >= totals.lumpsumTarget ? neonDeficitPositive : neonDeficitNegative}`}>{formatCurrency(totals.lumpsumAchieved - totals.lumpsumTarget)}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={neonLabelCls}>Progress: <span className={neon ? 'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]' : ''}>{totals.lumpsumTarget > 0 ? `${Math.min(100, Math.round((totals.lumpsumAchieved / totals.lumpsumTarget) * 100))}` : '0'}%</span></span>
                  </div>
                  <div className={`w-full rounded-full h-3 overflow-hidden ${neonProgressTrack}`}>
                    <div className={`h-full rounded-full ${neonLumpBar} transition-all duration-300`} style={{ width: totals.lumpsumTarget > 0 ? `${Math.min(100, (totals.lumpsumAchieved / totals.lumpsumTarget) * 100)}%` : '0%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Year Summary */}
            <Card className={`${highlightBg} ${borderColor} ${neonYearCard}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${neonYearTitle}`}>{currentYear} Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <Label className={neonLabelCls}>Total Target:</Label>
                  <span className={`font-medium ${neon ? 'text-violet-100 drop-shadow-[0_0_4px_rgba(139,92,246,0.2)]' : ''}`}>{formatCurrency(totals.sipTarget + totals.lumpsumTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <Label className={neonLabelCls}>Total Achieved:</Label>
                  <span className={`text-primary font-medium ${neon ? 'text-violet-300 drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]' : ''}`}>{formatCurrency(totals.sipAchieved + totals.lumpsumAchieved)}</span>
                </div>
                <div className="flex justify-between">
                  <Label className={neonLabelCls}>Overall Deficit:</Label>
                  <span className={`font-medium ${(totals.sipAchieved + totals.lumpsumAchieved) >= (totals.sipTarget + totals.lumpsumTarget) ? neonDeficitPositive : neonDeficitNegative}`}>{formatCurrency((totals.sipAchieved + totals.lumpsumAchieved) - (totals.sipTarget + totals.lumpsumTarget))}</span>
                </div>
                <div className="pt-2 space-y-2">
                  <div className={`text-sm ${neon ? 'text-slate-300' : ''}`}>
                    <span className={`font-medium ${neonLabelCls}`}>Monthly SIP Target: </span>
                    <span className={neon ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]' : ''}>{formatCurrency(records[0]?.sipTarget || 0)}</span>
                  </div>
                  <div className={`text-sm ${neon ? 'text-slate-300' : ''}`}>
                    <span className={`font-medium ${neonLabelCls}`}>Annual Lumpsum Target: </span>
                    <span className={neon ? 'text-emerald-300 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]' : ''}>{formatCurrency(records[0]?.lumpsumTarget || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* ─── Monthly Details Table ──────────────────────────────── */}
      <Card className={`${cardBg} ${borderColor} ${neonMonthlyCard}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className={neonMonthlyTitle}>Monthly Investment Details</CardTitle>
              <CardDescription className={neon ? 'text-slate-400' : ''}>
                {isEditingMonthly ? `Editing ${records[currentMonthIndex]?.month} ${currentYear} data` : 'Click "Edit Monthly Data" to update values'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsEditingMonthly(!isEditingMonthly)} variant="outline" className={`gap-2 rounded-full ${neonBtnOutline}`}>
                {isEditingMonthly ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditingMonthly ? "Save Monthly Data" : "Edit Monthly Data"}
              </Button>
              {isEditingMonthly && (
                <Button onClick={completeCurrentMonth} variant="default" className={`gap-2 rounded-full ${neon ? 'bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 shadow-[0_0_8px_rgba(217,70,239,0.3)] hover:bg-fuchsia-500/30 hover:shadow-[0_0_14px_rgba(217,70,239,0.5)]' : getButtonClasses(theme, 'outline')}`}>
                  Complete Current Month
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${neonTableBody}`}>
              <thead className={neonTableHead}>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Month</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">SIP Target</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">SIP Achieved</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Deficit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Lumpsum Target</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Lumpsum Achieved</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Deficit</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${neonTableBody}`}>
                {records.map((record) => (
                  // ─── Row continues in Part 2 ──────────────────
                                  <>
                    <tr 
                      key={record.month}
                      className={`border-b ${borderColor} ${record.isEditable && !neon ? neonCurrentRow : ''}`}
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMonthExpansion(record.monthIndex);
                            }}
                            className={`p-1 mr-2 ${neonBtnGhost}`}
                          >
                            {expandedMonths[record.monthIndex] ? 
                              <ChevronUp className={`h-4 w-4 ${neonChevronCls}`} /> : 
                              <ChevronDown className={`h-4 w-4 ${neonChevronCls}`} />
                            }
                          </Button>
                          <span className={neon ? 'text-slate-200' : ''}>
                            {record.month}
                            {record.isEditable && <span className={`ml-2 text-xs ${neonCurrentBadge}`}>(Current)</span>}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap ${neon ? 'text-slate-300' : ''}`}>
                        {formatCurrency(record.sipTarget)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          {record.isEditable && isEditingMonthly ? (
                            <Input
                              type="number"
                              value={record.sipAchieved}
                              onChange={(e) => handleUpdateAchievedValue(record.monthIndex, 'sipAchieved', Number(e.target.value))}
                              className={`w-24 ${neonInputCls}`}
                            />
                          ) : (
                            <>
                              <span className={neonPrimaryCls}>{formatCurrency(record.sipAchieved)}</span>
                              {!record.isEditable && <Lock className={`h-3 w-3 ml-1 ${neonLockCls}`} />}
                            </>
                          )}
                          {record.sipAchieved >= record.sipTarget && record.sipTarget > 0 && (
                            <Star className={`h-4 w-4 ml-1 ${neonStarCls}`} />
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap font-medium ${
                        record.sipAchieved >= record.sipTarget ? neonDeficitPositive : neonDeficitNegative
                      }`}>
                        {formatCurrency(record.sipAchieved - record.sipTarget)}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap ${neon ? 'text-slate-300' : ''}`}>
                        {formatCurrency(record.lumpsumTarget)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          {record.isEditable && isEditingMonthly ? (
                            <Input
                              type="number"
                              value={record.lumpsumAchieved}
                              onChange={(e) => handleUpdateAchievedValue(record.monthIndex, 'lumpsumAchieved', Number(e.target.value))}
                              className={`w-24 ${neonInputCls}`}
                            />
                          ) : (
                            <>
                              <span className={neon ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]' : ''}>
                                {formatCurrency(record.lumpsumAchieved)}
                              </span>
                              {!record.isEditable && <Lock className={`h-3 w-3 ml-1 ${neonLockCls}`} />}
                            </>
                          )}
                          {record.lumpsumAchieved >= record.lumpsumTarget && record.lumpsumTarget > 0 && (
                            <Star className={`h-4 w-4 ml-1 ${neonStarCls}`} />
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap font-medium ${
                        record.lumpsumAchieved >= record.lumpsumTarget ? neonDeficitPositive : neonDeficitNegative
                      }`}>
                        {formatCurrency(record.lumpsumAchieved - record.lumpsumTarget)}
                      </td>
                    </tr>
                    
                    {/* ── Client Details Section ────────────────────── */}
                    {expandedMonths[record.monthIndex] && (
                      <tr key={`client-${record.monthIndex}`}>
                        <td colSpan={7} className="px-0 py-2">
                          <Card className={`${cardBg} ${borderColor} ${neonClientCard} mx-4`}>
                            <CardContent className="p-4">
                              <h3 className={`text-lg font-semibold mb-4 ${neon ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]' : ''}`}>
                                Client Investments for {record.month} {currentYear}
                              </h3>
                              
                              {isEditingMonthly && (
                                <div className="mb-4">
                                  <Button 
                                    onClick={() => addNewClient(record.monthIndex)}
                                    variant="outline"
                                    size="sm"
                                    className={`gap-1 rounded-full ${neonBtnOutline}`}
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add Client
                                  </Button>
                                </div>
                              )}
                              
                              {(!record.clients || record.clients.length === 0) ? (
                                <div className={`text-center py-8 ${neonMutedCls}`}>
                                  <p>No clients added for this month</p>
                                  {isEditingMonthly && (
                                    <Button 
                                      onClick={() => addNewClient(record.monthIndex)}
                                      variant="outline"
                                      size="sm"
                                      className={`mt-2 rounded-full ${neonBtnOutline}`}
                                    >
                                      Add First Client
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className={`min-w-full divide-y ${neonTableBody}`}>
                                    <thead className={neonTableHead}>
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Client</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">SIP Amount</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Lumpsum Amount</th>
                                        {isEditingMonthly && (
                                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody className={`divide-y ${neonTableBody}`}>
                                      {(record.clients || []).map((client) => (
                                        <tr key={client.id}>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            {isEditingMonthly ? (
                                              <Input
                                                value={client.name}
                                                onChange={(e) => handleClientChange(record.monthIndex, client.id, 'name', e.target.value)}
                                                className={neonInputCls}
                                              />
                                            ) : (
                                              <span className={neon ? 'text-slate-200' : ''}>{client.name}</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            {isEditingMonthly ? (
                                              <Input
                                                type="number"
                                                value={client.sipAmount || 0}
                                                onChange={(e) => handleClientChange(record.monthIndex, client.id, 'sipAmount', Number(e.target.value))}
                                                className={`w-24 ${neonInputCls}`}
                                              />
                                            ) : (
                                              <span className={neonPrimaryCls}>{formatCurrency(client.sipAmount || 0)}</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            {isEditingMonthly ? (
                                              <Input
                                                type="number"
                                                value={client.lumpsumAmount || 0}
                                                onChange={(e) => handleClientChange(record.monthIndex, client.id, 'lumpsumAmount', Number(e.target.value))}
                                                className={`w-24 ${neonInputCls}`}
                                              />
                                            ) : (
                                              <span className={neon ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]' : ''}>
                                                {formatCurrency(client.lumpsumAmount || 0)}
                                              </span>
                                            )}
                                          </td>
                                          {isEditingMonthly && (
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => confirmDeleteClient(record.monthIndex, client.id)}
                                                className={`text-red-500 hover:text-red-700 ${neon ? 'text-red-400 hover:text-red-300 hover:shadow-[0_0_8px_rgba(248,113,113,0.4)]' : ''}`}
                                              >
                                                <Trash className="h-4 w-4" />
                                              </Button>
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              
                              {/* ── Client Summary Box ─────────────────────── */}
                              <div className={`mt-4 p-4 rounded-lg ${neonSummaryBox}`}>
                                <h4 className={`font-medium mb-2 ${neon ? 'text-amber-300 drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]' : ''}`}>
                                  Summary for {record.month}:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <p className={`text-sm ${neonMutedCls}`}>Total SIP</p>
                                    <p className={`font-medium ${neonPrimaryCls}`}>
                                      {formatCurrency((record.clients || []).reduce((sum, client) => sum + (client.sipAmount || 0), 0))}
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-sm ${neonMutedCls}`}>Total Lumpsum</p>
                                    <p className={`font-medium ${neon ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]' : ''}`}>
                                      {formatCurrency((record.clients || []).reduce((sum, client) => sum + (client.lumpsumAmount || 0), 0))}
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-sm ${neonMutedCls}`}>Total Investment</p>
                                    <p className={`font-medium ${neon ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]' : ''}`}>
                                      {formatCurrency((record.clients || []).reduce((sum, client) => sum + (client.sipAmount || 0) + (client.lumpsumAmount || 0), 0))}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Export the hook properly ──────────────────────────────────
export const useInvestmentData = () => {
  const [data, setData] = useState<{
    records: InvestmentRecord[];
    currentMonthIndex: number;
    year: number;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const investmentDocRef = doc(db, 'investmentTracker', currentYear.toString());

    const unsubscribe = onSnapshot(investmentDocRef, 
      (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const docData = docSnapshot.data();
            const sanitizedRecords = (docData.records || defaultRecords).map(record => ({
              ...record,
              clients: record.clients || []
            }));
            
            setData({
              records: sanitizedRecords,
              currentMonthIndex: docData.currentMonthIndex || new Date().getMonth(),
              year: docData.year || currentYear
            });
          } else {
            setDoc(investmentDocRef, {
              records: defaultRecords.map(record => ({ 
                ...record, 
                clients: record.clients || [] 
              })),
              currentMonthIndex: new Date().getMonth(),
              year: currentYear,
              createdAt: new Date().toISOString()
            });
          }
          setLoading(false);
        } catch (err) {
          setError(err as Error);
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error };
};