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
import { Moon, Sun } from 'lucide-react';
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
  theme: 'blue-smoke',
  setTheme: (theme: ThemeName) => {},
  toggleTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
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

const getCurrentMonthData = () => {
  const now = new Date();
  return {
    monthIndex: now.getMonth(),
    monthName: now.toLocaleString('default', { month: 'long' })
  };
};

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
      
      // Calculate new totals from clients
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
      // Ensure clients array exists
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
      
      // Recalculate totals after removing client
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
  
  toast({
    title: "Client Deleted",
    description: "The client has been successfully removed.",
  });
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
    [field]: field === 'sipTarget' ? value : 
             (record.monthIndex === 0 ? value : 0)
  }));
  await saveToFirestore(updatedRecords);
};

  // Update current month when component mounts and periodically
  useEffect(() => {
    const updateCurrentMonth = () => {
      const now = new Date();
      const newMonthIndex = now.getMonth();
      const newYear = now.getFullYear();
      
      if (newMonthIndex !== currentMonthIndex) {
        setCurrentMonthIndex(newMonthIndex);
        setCurrentMonthName(now.toLocaleString('default', { month: 'long' }));
      }
      
      if (newYear !== currentYear) {
        setCurrentYear(newYear);
      }
    };
    
    // Update immediately
    updateCurrentMonth();
    
    // Set up interval to check for month changes
    const interval = setInterval(updateCurrentMonth, 3600000); // Check every hour
    
    return () => clearInterval(interval);
  }, [currentMonthIndex, currentYear]);

  // Firestore document reference
  const investmentDocRef = doc(db, 'investmentTracker', currentYear.toString());

  // Load data from Firestore
  useEffect(() => {
  const unsubscribe = onSnapshot(investmentDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      // Ensure all records have properly initialized clients arrays
      const sanitizedRecords = (data.records || defaultRecords).map(record => ({
        ...record,
        clients: record.clients || []
      }));
      
      // Update records from Firestore
      setRecords(sanitizedRecords);
      // Only update month index if it's not the current month
      if (data.currentMonthIndex !== currentMonthIndex) {
        setCurrentMonthIndex(data.currentMonthIndex);
        setCurrentMonthName(
          new Date(currentYear, data.currentMonthIndex, 1)
            .toLocaleString('default', { month: 'long' })
        );
      }
    } else {
      // Initialize with default data if document doesn't exist
      initializeFirestoreData();
    }
    setIsLoading(false);
  });

  return () => unsubscribe();
}, [currentYear]);

  const initializeFirestoreData = async () => {
  try {
    await setDoc(investmentDocRef, {
      records: defaultRecords.map(record => ({ 
        ...record, 
        clients: record.clients || [] // Ensure clients array is always initialized
      })),
      currentMonthIndex: currentMonthIndex,
      year: currentYear,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error initializing data:", error);
    toast({
      title: "Error",
      description: "Failed to initialize investment tracker",
      variant: "destructive"
    });
  }
};
  // Update editable status based on current month
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
    // Ensure all records have properly initialized clients arrays
    const sanitizedRecords = updatedRecords.map(record => ({
      ...record,
      clients: record.clients || []
    }));
    
    await setDoc(investmentDocRef, {
      records: sanitizedRecords,
      currentMonthIndex: newMonthIndex !== undefined ? newMonthIndex : currentMonthIndex,
      year: currentYear,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    setRecords(sanitizedRecords);
    if (newMonthIndex !== undefined) {
      setCurrentMonthIndex(newMonthIndex);
      setCurrentMonthName(
        new Date(currentYear, newMonthIndex, 1)
          .toLocaleString('default', { month: 'long' })
      );
    }
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    toast({
      title: 'Error',
      description: 'Failed to save data',
      variant: 'destructive'
    });
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
    setCurrentMonthName(
      new Date(newYear, newMonthIndex, 1)
        .toLocaleString('default', { month: 'long' })
    );
    await saveToFirestore(records, newMonthIndex);
  };

  return (
       <div className={`space-y-4 ${bgColor} ${textColor}`}>
      {/* Confirmation Dialog */}
      {clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white dark:bg-gray-300">
            <CardHeader>
              <CardTitle>Confirm Deletion</CardTitle>
              <CardDescription>
                Are you sure you want to delete this client? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelDeleteClient}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={removeClient}>
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Investment Tracker - {currentYear}</CardTitle>
              <CardDescription>Track your monthly investment goals and achievements</CardDescription>
            </div>
          <div className="text-sm text-muted-foreground">
  Current Month: {currentMonthName} {currentYear}
</div>
          </div>
        </CardHeader>

        {/* Summary Cards */}
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Investment Summary</h3>
            <Button
  onClick={() => setIsEditingSummary(!isEditingSummary)}
  variant="outline"
  className={`gap-2 ${getButtonClasses(theme, 'outline')}`}
>
  {isEditingSummary ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
  {isEditingSummary ? "Save Summary" : "Edit Summary"}
</Button>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* SIP Summary */}
            <Card className={`${highlightBg} ${borderColor}`}>
              <CardHeader>
                <CardTitle className="text-lg">SIP Summary (Yearly)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <Label>Target:</Label>
                  {isEditingSummary ? (
                    <Input
                      type="number"
                      value={records[0]?.sipTarget || 0}
                      onChange={(e) => handleUpdateTargetValue('sipTarget', Number(e.target.value))}
                       className={`w-24 ${inputBg} ${borderColor}`}
                    />
                  ) : (
                    <span className="font-medium">{formatCurrency(totals.sipTarget)}</span>
                  )}
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
    <span>Progress: {
      totals.sipTarget > 0 
        ? `${Math.min(100, Math.round((totals.sipAchieved / totals.sipTarget) * 100))}`
        : '0'
    }%</span>
  </div>
 <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
  <div 
    className={`h-full rounded-full ${
      theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
    } transition-all duration-300`} 
    style={{ 
      width: totals.sipTarget > 0 
        ? `${Math.min(100, (totals.sipAchieved / totals.sipTarget) * 100)}%` 
        : '0%'
    }}
  ></div>
</div>
                </div>
              </CardContent>
            </Card>

            {/* Lumpsum Summary */}
            <Card className={`${highlightBg} ${borderColor}`}>
              <CardHeader>
                <CardTitle className="text-lg">Lumpsum Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <Label>Target:</Label>
                  {isEditingSummary ? (
                    <Input
                      type="number"
                      value={records[0]?.lumpsumTarget || 0}
                      onChange={(e) => handleUpdateTargetValue('lumpsumTarget', Number(e.target.value))}
                       className={`w-24 ${inputBg} ${borderColor}`}
                    />
                  ) : (
                    <span className="font-medium">{formatCurrency(records[0]?.lumpsumTarget || 0)}</span>
                  )}
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
    <span>Progress: {
      totals.lumpsumTarget > 0 
        ? `${Math.min(100, Math.round((totals.lumpsumAchieved / totals.lumpsumTarget) * 100))}`
        : '0'
    }%</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <div 
      className="h-full rounded-full bg-green-500 transition-all duration-300" 
      style={{ 
        width: totals.lumpsumTarget > 0 
          ? `${Math.min(100, (totals.lumpsumAchieved / totals.lumpsumTarget) * 100)}%` 
          : '0%'
      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Year Summary */}
            <Card className={`${highlightBg} ${borderColor}`}>
              <CardHeader>
                <CardTitle className="text-lg">{currentYear} Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                    {formatCurrency(records[0]?.sipTarget || 0)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Annual Lumpsum Target: </span>
                    {formatCurrency(records[0]?.lumpsumTarget || 0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Details Table */}
      <Card className={`${cardBg} ${borderColor}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Monthly Investment Details</CardTitle>
              <CardDescription>
                {isEditingMonthly 
                  ? `Editing ${records[currentMonthIndex]?.month} ${currentYear} data` 
                  : 'Click "Edit Monthly Data" to update values'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditingMonthly(!isEditingMonthly)}
                variant="outline"
                className={`gap-2 ${getButtonClasses(theme, 'outline')}`}
              >
                {isEditingMonthly ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditingMonthly ? "Save Monthly Data" : "Edit Monthly Data"}
              </Button>
              {isEditingMonthly && (
                <Button
                  onClick={completeCurrentMonth}
                  variant="default"
                  className={`gap-2 ${getButtonClasses(theme, 'outline')}`}
                >
                  Complete Current Month
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
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
              <tbody className="divide-y divide-border">
  {records.map((record) => (
    <>
      <tr 
        key={record.month}
        className={`border-b ${borderColor} ${
          record.isEditable ? (theme === 'dark' ? 'bg-white text-black' : 'bg-blue-50') : ''
        }`}
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
              className="p-1 mr-2"
            >
              {expandedMonths[record.monthIndex] ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
            <span>
              {record.month}
              {record.isEditable && <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">(Current)</span>}
            </span>
          </div>
        </td>
        <td className="px-4 py-2 whitespace-nowrap">
          {formatCurrency(record.sipTarget)}
        </td>
        <td className="px-4 py-2 whitespace-nowrap">
          <div className="flex items-center">
            {record.isEditable && isEditingMonthly ? (
              <Input
                type="number"
                value={record.sipAchieved}
                onChange={(e) => handleUpdateAchievedValue(record.monthIndex, 'sipAchieved', Number(e.target.value))}
                className={`w-24 ${inputBg} ${borderColor}`}
              />
            ) : (
              <>
                {formatCurrency(record.sipAchieved)}
                {!record.isEditable && <Lock className="h-3 w-3 ml-1 text-muted-foreground dark:text-gray-400" />}
              </>
            )}
            {record.sipAchieved >= record.sipTarget && record.sipTarget > 0 && (
              <Star className="h-4 w-4 ml-1 text-green-500" />
            )}
          </div>
        </td>
        <td className={`px-4 py-2 whitespace-nowrap ${
          record.sipAchieved >= record.sipTarget ? 'text-green-500' : 'text-red-500'
        }`}>
          {formatCurrency(record.sipAchieved - record.sipTarget)}
        </td>
        <td className="px-4 py-2 whitespace-nowrap">
          {formatCurrency(record.lumpsumTarget)}
        </td>
        <td className="px-4 py-2 whitespace-nowrap">
          <div className="flex items-center">
            {record.isEditable && isEditingMonthly ? (
              <Input
                type="number"
                value={record.lumpsumAchieved}
                onChange={(e) => handleUpdateAchievedValue(record.monthIndex, 'lumpsumAchieved', Number(e.target.value))}
                className={`w-24 ${inputBg} ${borderColor}`}
              />
            ) : (
              <>
                {formatCurrency(record.lumpsumAchieved)}
                {!record.isEditable && <Lock className="h-3 w-3 ml-1 text-muted-foreground dark:text-gray-400" />}
              </>
            )}
            {record.lumpsumAchieved >= record.lumpsumTarget && record.lumpsumTarget > 0 && (
              <Star className="h-4 w-4 ml-1 text-green-500" />
            )}
          </div>
        </td>
        <td className={`px-4 py-2 whitespace-nowrap ${
          record.lumpsumAchieved >= record.lumpsumTarget ? 'text-green-500' : 'text-red-500'
        }`}>
          {formatCurrency(record.lumpsumAchieved - record.lumpsumTarget)}
        </td>
      </tr>
      
      {/* Client Details Section - Appears directly below the month row with proper card styling */}
      {expandedMonths[record.monthIndex] && (
        <tr key={`client-${record.monthIndex}`}>
          <td colSpan={7} className="px-0 py-2">
            <Card className={`${cardBg} ${borderColor} mx-4`}>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-4">Client Investments for {record.month} {currentYear}</h3>
                
                {isEditingMonthly && (
                  <div className="mb-4">
                    <Button 
                      onClick={() => addNewClient(record.monthIndex)}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Client
                    </Button>
                  </div>
                )}
                
                {(!record.clients || record.clients.length === 0) ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No clients added for this month</p>
                    {isEditingMonthly && (
                      <Button 
                        onClick={() => addNewClient(record.monthIndex)}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Add First Client
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Client</th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">SIP Amount</th>
                          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Lumpsum Amount</th>
                          {isEditingMonthly && (
                            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(record.clients || []).map((client) => (
                          <tr key={client.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditingMonthly ? (
                                <Input
                                  value={client.name}
                                  onChange={(e) => handleClientChange(record.monthIndex, client.id, 'name', e.target.value)}
                                />
                              ) : (
                                client.name
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditingMonthly ? (
                                <Input
                                  type="number"
                                  value={client.sipAmount || 0}
                                  onChange={(e) => handleClientChange(record.monthIndex, client.id, 'sipAmount', Number(e.target.value))}
                                  className="w-24"
                                />
                              ) : (
                                formatCurrency(client.sipAmount || 0)
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditingMonthly ? (
                                <Input
                                  type="number"
                                  value={client.lumpsumAmount || 0}
                                  onChange={(e) => handleClientChange(record.monthIndex, client.id, 'lumpsumAmount', Number(e.target.value))}
                                  className="w-24"
                                />
                              ) : (
                                formatCurrency(client.lumpsumAmount || 0)
                              )}
                            </td>
                            {isEditingMonthly && (
                              <td className="px-4 py-3 whitespace-nowrap">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmDeleteClient(record.monthIndex, client.id)}
                                  className="text-red-500 hover:text-red-700"
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
                
                <div className="mt-4 p-4 rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">Summary for {record.month}:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total SIP</p>
                      <p className="font-medium">
                        {formatCurrency((record.clients || []).reduce((sum, client) => sum + (client.sipAmount || 0), 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Lumpsum</p>
                      <p className="font-medium">
                        {formatCurrency((record.clients || []).reduce((sum, client) => sum + (client.lumpsumAmount || 0), 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Investment</p>
                      <p className="font-medium">
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

// Export the hook properly
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
            // Ensure all records have properly initialized clients arrays
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
            // Initialize with default data if document doesn't exist
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