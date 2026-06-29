"use client";

import React, { useState, useEffect } from 'react'
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
  getButtonClasses,
  isNeon
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

  // ─── Neon Styles Object (Consistent with Dashboard) ──────────
  const ns = neon ? {
    card: 'border-cyan-500/25 shadow-[0_0_25px_rgba(0,255,255,0.08)]',
    sipCard: 'border-cyan-500/25 shadow-[0_0_25px_rgba(0,255,255,0.08)]',
    lumpCard: 'border-emerald-500/25 shadow-[0_0_25px_rgba(52,211,153,0.08)]',
    yearCard: 'border-violet-500/25 shadow-[0_0_25px_rgba(139,92,246,0.08)]',
    monthlyCard: 'border-fuchsia-500/25 shadow-[0_0_25px_rgba(217,70,239,0.08)]',
    clientCard: 'border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.06)]',
    title: 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]',
    sipTitle: 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]',
    lumpTitle: 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]',
    yearTitle: 'text-violet-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]',
    monthlyTitle: 'text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.4)]',
    label: 'text-slate-400 drop-shadow-[0_0_2px_rgba(0,255,255,0.1)]',
    value: 'text-cyan-100 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]',
    primary: 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,255,255,0.4)]',
    muted: 'text-slate-500',
    progressTrack: 'bg-slate-800 border border-cyan-500/15',
    lumpProgressTrack: 'bg-slate-800 border border-emerald-500/15',
    yearProgressTrack: 'bg-slate-800 border border-violet-500/15',
    yearlyProgressTrack: 'bg-slate-800 border border-amber-500/15',
    sipBar: 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.6)]',
    lumpBar: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]',
    yearBar: 'bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.6)]',
    yearlyBar: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]',
    input: 'bg-slate-900 border-cyan-500/30 text-cyan-100 placeholder-slate-500 focus:border-cyan-400 focus:shadow-[0_0_8px_rgba(0,255,255,0.3)]',
    tableHead: 'bg-slate-800/80 text-cyan-400/80',
    tableBody: 'divide-cyan-500/10',
    currentRow: 'bg-cyan-500/[0.02] rounded-full',
    summaryBox: 'bg-slate-800/60 border border-cyan-500/10',
    deficitPositive: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]',
    deficitNegative: 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]',
    btnOutline: 'border-cyan-500/40 text-cyan-300 shadow-[0_0_6px_rgba(0,255,255,0.12)] hover:border-cyan-400 hover:shadow-[0_0_14px_rgba(0,255,255,0.3)] hover:text-cyan-200',
    btnDestructive: 'bg-red-500/20 border border-red-500/40 text-red-300 shadow-[0_0_8px_rgba(248,113,113,0.3)] hover:bg-red-500/30 hover:shadow-[0_0_14px_rgba(248,113,113,0.5)]',
    btnGhost: 'text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10',
    chevron: 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]',
    lock: 'text-slate-500',
    star: 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]',
    currentBadge: 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]',
    overlay: 'bg-black/70',
    dialogCard: 'bg-slate-900 border-red-500/30 shadow-[0_0_30px_rgba(248,113,113,0.15)]',
    dialogTitle: 'text-red-300 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]',
    dialogDesc: 'text-slate-400',
    completeMonthBtn: 'bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 shadow-[0_0_8px_rgba(217,70,239,0.3)] hover:bg-fuchsia-500/30 hover:shadow-[0_0_14px_rgba(217,70,239,0.5)]',
    clientTitle: 'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.3)]',
    clientSummaryTitle: 'text-amber-300 drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]',
    lumpValue: 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]',
    yearValue: 'text-violet-300 drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]',
    totalInvestValue: 'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]',
    textSlate200: 'text-slate-200',
    textSlate300: 'text-slate-300',
    textSlate400: 'text-slate-400',
    textCyan400_70: 'text-cyan-400/70 drop-shadow-[0_0_4px_rgba(0,255,255,0.2)]',
    deleteBtn: 'text-red-400 hover:text-red-300 hover:shadow-[0_0_8px_rgba(248,113,113,0.4)]',
    sipProgressPct: 'text-cyan-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]',
    lumpProgressPct: 'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]',
    yearProgressPct: 'text-violet-400 drop-shadow-[0_0_4px_rgba(139,92,246,0.3)]',
    yearlyProgressPct: 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]',
    monthlySipValue: 'text-cyan-300 drop-shadow-[0_0_4px_rgba(0,255,255,0.3)]',
    monthlyLumpValue: 'text-emerald-300 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]',
  } : {};

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

  const totalTarget = totals.sipTarget + totals.lumpsumTarget;
  const totalAchieved = totals.sipAchieved + totals.lumpsumAchieved;

  const sipProgress = totals.sipTarget > 0 ? Math.min(100, Math.round((totals.sipAchieved / totals.sipTarget) * 100)) : 0;
  const lumpsumProgress = totals.lumpsumTarget > 0 ? Math.min(100, Math.round((totals.lumpsumAchieved / totals.lumpsumTarget) * 100)) : 0;
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalAchieved / totalTarget) * 100)) : 0;

  // ─── Yearly Progress Calculation ──────────────────────────
  const now = new Date();
  const isCurrentYear = currentYear === now.getFullYear();
  const currentMonthForProgress = now.getMonth() + 1; // 1-12
  const yearlyProgress = isCurrentYear 
    ? Math.round((currentMonthForProgress / 12) * 100) 
    : 100;

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

  return (
    <div className={`space-y-4 ${bgColor} ${textColor}`}>
      {/* ─── Confirmation Dialog ──────────────────────────────── */}
      {clientToDelete && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${neon ? ns.overlay : 'bg-black bg-opacity-40'}`}>
          <Card className={`w-full max-w-md ${neon ? ns.dialogCard : 'bg-white dark:bg-gray-300'}`}>
            <CardHeader>
              <CardTitle className={neon ? ns.dialogTitle : ''}>Confirm Deletion</CardTitle>
              <CardDescription className={neon ? ns.dialogDesc : ''}>Are you sure you want to delete this client? This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelDeleteClient} className={neon ? ns.btnOutline : getButtonClasses(theme, 'outline')}>Cancel</Button>
              <Button variant="destructive" onClick={removeClient} className={neon ? ns.btnDestructive : ''}>Delete</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Main Investment Card ─────────────────────────────── */}
      <Card className={`${cardBg} ${borderColor} ${neon ? ns.card : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className={neon ? ns.title : ''}>Investment Tracker - {currentYear}</CardTitle>
              <CardDescription className={neon ? ns.dialogDesc : ''}>Track your monthly investment goals and achievements</CardDescription>
            </div>
            <div className={`text-sm ${neon ? ns.textCyan400_70 : 'text-muted-foreground'}`}>
              Current Month: {currentMonthName} {currentYear}
            </div>
          </div>
        </CardHeader>

        {/* ─── Summary Cards ──────────────────────────────────── */}
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-semibold ${neon ? 'text-cyan-200 drop-shadow-[0_0_6px_rgba(0,255,255,0.3)]' : ''}`}>Investment Summary</h3>
            <Button onClick={() => setIsEditingSummary(!isEditingSummary)} variant="outline" className={`gap-2 rounded-full ${neon ? ns.btnOutline : getButtonClasses(theme, 'outline')}`}>
              {isEditingSummary ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {isEditingSummary ? "Save Summary" : "Edit Summary"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SIP Summary */}
            <Card className={`${highlightBg} ${borderColor} ${neon ? ns.sipCard : ''}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${neon ? ns.sipTitle : ''}`}>SIP Summary (Yearly)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <Label className={neon ? ns.label : ''}>Target:</Label>
                  {isEditingSummary ? (
                    <Input type="number" value={records[0]?.sipTarget || 0} onChange={(e) => handleUpdateTargetValue('sipTarget', Number(e.target.value))} className={`w-24 ${neon ? ns.input : `${inputBg} ${borderColor}`}`} />
                  ) : (
                    <span className={`font-medium ${neon ? ns.value : ''}`}>{formatCurrency(totals.sipTarget)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <Label className={neon ? ns.label : ''}>Achieved:</Label>
                  <span className={`text-primary font-medium ${neon ? ns.primary : ''}`}>{formatCurrency(totals.sipAchieved)}</span>
                </div>
                <div className="flex justify-between">
                  <Label className={neon ? ns.label : ''}>Deficit:</Label>
                  <span className={`font-medium ${totals.sipAchieved >= totals.sipTarget ? (neon ? ns.deficitPositive : 'text-green-500') : (neon ? ns.deficitNegative : 'text-red-500')}`}>{formatCurrency(totals.sipAchieved - totals.sipTarget)}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={neon ? ns.label : ''}>
                      Progress: <span className={neon ? ns.sipProgressPct : ''}>{sipProgress}%</span>
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-3 overflow-hidden ${neon ? ns.progressTrack : 'bg-gray-200'}`}>
                    <div className={`h-full rounded-full transition-all duration-300 ${neon ? ns.sipBar : (theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500')}`} style={{ width: `${sipProgress}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lumpsum Summary */}
            <Card className={`${highlightBg} ${borderColor} ${neon ? ns.lumpCard : ''}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${neon ? ns.lumpTitle : ''}`}>Lumpsum Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <Label className={neon ? ns.label : ''}>Target:</Label>
                  {isEditingSummary ? (
                    <Input type="number" value={records[0]?.lumpsumTarget || 0} onChange={(e) => handleUpdateTargetValue('lumpsumTarget', Number(e.target.value))} className={`w-24 ${neon ? ns.input : `${inputBg} ${borderColor}`}`} />
                  ) : (
                    <span className={`font-medium ${neon ? 'text-emerald-100 drop-shadow-[0_0_4px_rgba(52,211,153,0.2)]' : ''}`}>{formatCurrency(records[0]?.lumpsumTarget || 0)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <Label className={neon ? ns.label : ''}>Achieved:</Label>
                  <span className={`text-primary font-medium ${neon ? ns.lumpValue : ''}`}>{formatCurrency(totals.lumpsumAchieved)}</span>
                </div>
                <div className="flex justify-between">
                  <Label className={neon ? ns.label : ''}>Deficit:</Label>
                  <span className={`font-medium ${totals.lumpsumAchieved >= totals.lumpsumTarget ? (neon ? ns.deficitPositive : 'text-green-500') : (neon ? ns.deficitNegative : 'text-red-500')}`}>{formatCurrency(totals.lumpsumAchieved - totals.lumpsumTarget)}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={neon ? ns.label : ''}>
                      Progress: <span className={neon ? ns.lumpProgressPct : ''}>{lumpsumProgress}%</span>
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-3 overflow-hidden ${neon ? ns.lumpProgressTrack : 'bg-gray-200'}`}>
                    <div className={`h-full rounded-full transition-all duration-300 ${neon ? ns.lumpBar : 'bg-green-500'}`} style={{ width: `${lumpsumProgress}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Year Summary ────────────────────────────────── */}
            <Card className={`${highlightBg} ${borderColor} ${neon ? ns.yearCard : ''}`}>
              <CardHeader>
                <CardTitle className={`text-lg ${neon ? ns.yearTitle : ''}`}>{currentYear} Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <Label className={neon ? ns.label : ''}>Total Target:</Label>
                  <span className={`font-medium ${neon ? 'text-violet-100 drop-shadow-[0_0_4px_rgba(139,92,246,0.2)]' : ''}`}>{formatCurrency(totalTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <Label className={neon ? ns.label : ''}>Total Achieved:</Label>
                  <span className={`text-primary font-medium ${neon ? ns.yearValue : ''}`}>{formatCurrency(totalAchieved)}</span>
                </div>
                <div className="flex justify-between">
                  <Label className={neon ? ns.label : ''}>Overall Deficit:</Label>
                  <span className={`font-medium ${totalAchieved >= totalTarget ? (neon ? ns.deficitPositive : 'text-green-500') : (neon ? ns.deficitNegative : 'text-red-500')}`}>{formatCurrency(totalAchieved - totalTarget)}</span>
                </div>

                {/* Overall Investment Progress */}
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={neon ? ns.label : ''}>
                      Overall Progress: <span className={neon ? ns.yearProgressPct : ''}>{overallProgress}%</span>
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-3 overflow-hidden ${neon ? ns.yearProgressTrack : 'bg-gray-200'}`}>
                    <div className={`h-full rounded-full transition-all duration-300 ${neon ? ns.yearBar : 'bg-purple-500'}`} style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <div className={`text-sm ${neon ? ns.textSlate300 : ''}`}>
                    <span className={`font-medium ${neon ? ns.label : ''}`}>Monthly SIP Target: </span>
                    <span className={neon ? ns.monthlySipValue : ''}>{formatCurrency(records[0]?.sipTarget || 0)}</span>
                  </div>
                  <div className={`text-sm ${neon ? ns.textSlate300 : ''}`}>
                    <span className={`font-medium ${neon ? ns.label : ''}`}>Annual Lumpsum Target: </span>
                    <span className={neon ? ns.monthlyLumpValue : ''}>{formatCurrency(records[0]?.lumpsumTarget || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
            {/* ─── Monthly Details Table ──────────────────────────────── */}
      <Card className={`${cardBg} ${borderColor} ${neon ? ns.monthlyCard : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className={neon ? ns.monthlyTitle : ''}>Monthly Investment Details</CardTitle>
              <CardDescription className={neon ? ns.dialogDesc : ''}>
                {isEditingMonthly ? `Editing ${records[currentMonthIndex]?.month} ${currentYear} data` : 'Click "Edit Monthly Data" to update values'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsEditingMonthly(!isEditingMonthly)} variant="outline" className={`gap-2 rounded-full ${neon ? ns.btnOutline : getButtonClasses(theme, 'outline')}`}>
                {isEditingMonthly ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditingMonthly ? "Save Monthly Data" : "Edit Monthly Data"}
              </Button>
              {isEditingMonthly && (
                <Button onClick={completeCurrentMonth} variant="default" className={`gap-2 rounded-full ${neon ? ns.completeMonthBtn : getButtonClasses(theme, 'outline')}`}>
                  Complete Current Month
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${neon ? ns.tableBody : 'divide-border'}`}>
              <thead className={neon ? ns.tableHead : 'bg-muted'}>
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
              <tbody className={`divide-y ${neon ? ns.tableBody : 'divide-border'}`}>
                {records.map((record) => (
                  <React.Fragment key={record.month}>
                    <tr className={`border-b ${borderColor} ${record.isEditable ? (neon ? ns.currentRow : 'bg-cyan-500/10 rounded-full') : ''}`}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMonthExpansion(record.monthIndex);
                            }}
                            className={`p-1 mr-2 ${neon ? ns.btnGhost : ''}`}
                          >
                            {expandedMonths[record.monthIndex] ? 
                              <ChevronUp className={`h-4 w-4 ${neon ? ns.chevron : ''}`} /> : 
                              <ChevronDown className={`h-4 w-4 ${neon ? ns.chevron : ''}`} />
                            }
                          </Button>
                          <span className={neon ? ns.textSlate200 : ''}>
                            {record.month}
                            {record.isEditable && <span className={`ml-2 text-xs ${neon ? ns.currentBadge : 'text-blue-500 dark:text-blue-400'}`}>(Current)</span>}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap ${neon ? ns.textSlate300 : ''}`}>
                        {formatCurrency(record.sipTarget)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          {record.isEditable && isEditingMonthly ? (
                            <Input
                              type="number"
                              value={record.sipAchieved}
                              onChange={(e) => handleUpdateAchievedValue(record.monthIndex, 'sipAchieved', Number(e.target.value))}
                              className={`w-24 ${neon ? ns.input : `${inputBg} ${borderColor}`}`}
                            />
                          ) : (
                            <>
                              <span className={neon ? ns.primary : ''}>{formatCurrency(record.sipAchieved)}</span>
                              {!record.isEditable && <Lock className={`h-3 w-3 ml-1 ${neon ? ns.lock : 'text-muted-foreground dark:text-gray-400'}`} />}
                            </>
                          )}
                          {record.sipAchieved >= record.sipTarget && record.sipTarget > 0 && (
                            <Star className={`h-4 w-4 ml-1 ${neon ? ns.star : 'text-green-500'}`} />
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap font-medium ${
                        record.sipAchieved >= record.sipTarget ? (neon ? ns.deficitPositive : 'text-green-500') : (neon ? ns.deficitNegative : 'text-red-500')
                      }`}>
                        {formatCurrency(record.sipAchieved - record.sipTarget)}
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap ${neon ? ns.textSlate300 : ''}`}>
                        {formatCurrency(record.lumpsumTarget)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          {record.isEditable && isEditingMonthly ? (
                            <Input
                              type="number"
                              value={record.lumpsumAchieved}
                              onChange={(e) => handleUpdateAchievedValue(record.monthIndex, 'lumpsumAchieved', Number(e.target.value))}
                              className={`w-24 ${neon ? ns.input : `${inputBg} ${borderColor}`}`}
                            />
                          ) : (
                            <>
                              <span className={neon ? ns.lumpValue : ''}>
                                {formatCurrency(record.lumpsumAchieved)}
                              </span>
                              {!record.isEditable && <Lock className={`h-3 w-3 ml-1 ${neon ? ns.lock : 'text-muted-foreground dark:text-gray-400'}`} />}
                            </>
                          )}
                          {record.lumpsumAchieved >= record.lumpsumTarget && record.lumpsumTarget > 0 && (
                            <Star className={`h-4 w-4 ml-1 ${neon ? ns.star : 'text-green-500'}`} />
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-2 whitespace-nowrap font-medium ${
                        record.lumpsumAchieved >= record.lumpsumTarget ? (neon ? ns.deficitPositive : 'text-green-500') : (neon ? ns.deficitNegative : 'text-red-500')
                      }`}>
                        {formatCurrency(record.lumpsumAchieved - record.lumpsumTarget)}
                      </td>
                    </tr>
                    
                    {/* ── Client Details Section ────────────────────── */}
                    {expandedMonths[record.monthIndex] && (
                      <tr key={`client-${record.monthIndex}`}>
                        <td colSpan={7} className="px-0 py-2">
                          <Card className={`${cardBg} ${borderColor} ${neon ? ns.clientCard : ''} mx-4`}>
                            <CardContent className="p-4">
                              <h3 className={`text-lg font-semibold mb-4 ${neon ? ns.clientTitle : ''}`}>
                                Client Investments for {record.month} {currentYear}
                              </h3>
                              
                              {isEditingMonthly && (
                                <div className="mb-4">
                                  <Button 
                                    onClick={() => addNewClient(record.monthIndex)}
                                    variant="outline"
                                    size="sm"
                                    className={`gap-1 rounded-full ${neon ? ns.btnOutline : getButtonClasses(theme, 'outline')}`}
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add Client
                                  </Button>
                                </div>
                              )}
                              
                              {(!record.clients || record.clients.length === 0) ? (
                                <div className={`text-center py-8 ${neon ? ns.muted : 'text-muted-foreground'}`}>
                                  <p>No clients added for this month</p>
                                  {isEditingMonthly && (
                                    <Button 
                                      onClick={() => addNewClient(record.monthIndex)}
                                      variant="outline"
                                      size="sm"
                                      className={`mt-2 rounded-full ${neon ? ns.btnOutline : getButtonClasses(theme, 'outline')}`}
                                    >
                                      Add First Client
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className={`min-w-full divide-y ${neon ? ns.tableBody : 'divide-border'}`}>
                                    <thead className={neon ? ns.tableHead : 'bg-muted'}>
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Client</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">SIP Amount</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Lumpsum Amount</th>
                                        {isEditingMonthly && (
                                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody className={`divide-y ${neon ? ns.tableBody : 'divide-border'}`}>
                                      {(record.clients || []).map((client) => (
                                        <tr key={client.id}>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            {isEditingMonthly ? (
                                              <Input
                                                value={client.name}
                                                onChange={(e) => handleClientChange(record.monthIndex, client.id, 'name', e.target.value)}
                                                className={neon ? ns.input : `${inputBg} ${borderColor}`}
                                              />
                                            ) : (
                                              <span className={neon ? ns.textSlate200 : ''}>{client.name}</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            {isEditingMonthly ? (
                                              <Input
                                                type="number"
                                                value={client.sipAmount || 0}
                                                onChange={(e) => handleClientChange(record.monthIndex, client.id, 'sipAmount', Number(e.target.value))}
                                                className={`w-24 ${neon ? ns.input : `${inputBg} ${borderColor}`}`}
                                              />
                                            ) : (
                                              <span className={neon ? ns.primary : ''}>{formatCurrency(client.sipAmount || 0)}</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            {isEditingMonthly ? (
                                              <Input
                                                type="number"
                                                value={client.lumpsumAmount || 0}
                                                onChange={(e) => handleClientChange(record.monthIndex, client.id, 'lumpsumAmount', Number(e.target.value))}
                                                className={`w-24 ${neon ? ns.input : `${inputBg} ${borderColor}`}`}
                                              />
                                            ) : (
                                              <span className={neon ? ns.lumpValue : ''}>
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
                                                className={neon ? ns.deleteBtn : 'text-red-500 hover:text-red-700'}
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
                              <div className={`mt-4 p-4 rounded-lg ${neon ? ns.summaryBox : 'bg-muted'}`}>
                                <h4 className={`font-medium mb-2 ${neon ? ns.clientSummaryTitle : ''}`}>
                                  Summary for {record.month}:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <p className={`text-sm ${neon ? ns.muted : 'text-muted-foreground'}`}>Total SIP</p>
                                    <p className={`font-medium ${neon ? ns.primary : ''}`}>
                                      {formatCurrency((record.clients || []).reduce((sum, client) => sum + (client.sipAmount || 0), 0))}
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-sm ${neon ? ns.muted : 'text-muted-foreground'}`}>Total Lumpsum</p>
                                    <p className={`font-medium ${neon ? ns.lumpValue : ''}`}>
                                      {formatCurrency((record.clients || []).reduce((sum, client) => sum + (client.lumpsumAmount || 0), 0))}
                                    </p>
                                  </div>
                                  <div>
                                    <p className={`text-sm ${neon ? ns.muted : 'text-muted-foreground'}`}>Total Investment</p>
                                    <p className={`font-medium ${neon ? ns.totalInvestValue : ''}`}>
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
                  </React.Fragment>
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