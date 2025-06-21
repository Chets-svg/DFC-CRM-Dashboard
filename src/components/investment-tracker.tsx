import { useState, useEffect } from 'react'
import { Star, Edit, Save, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore"
import { Moon, Sun } from 'lucide-react';
import { 
  ThemeName, 
  ThemeColors, 
  themes, 
  getButtonClasses 
} from '@/lib/theme';

interface InvestmentRecord {
  month: string
  monthIndex: number
  sipTarget: number
  lumpsumTarget: number
  sipAchieved: number
  lumpsumAchieved: number
  isEditable: boolean
}

interface InvestmentTrackerProps {
  theme?: ThemeName; // Add theme prop
}

const defaultRecords: InvestmentRecord[] = [
  { month: "January", monthIndex: 0, sipTarget: 15000, lumpsumTarget: 4000000, sipAchieved: 15000, lumpsumAchieved: 85000, isEditable: false },
  { month: "February", monthIndex: 1, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false },
  { month: "March", monthIndex: 2, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 7000, lumpsumAchieved: 0, isEditable: false },
  { month: "April", monthIndex: 3, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false },
  { month: "May", monthIndex: 4, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 14000, lumpsumAchieved: 0, isEditable: false },
  { month: "June", monthIndex: 5, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false },
  { month: "July", monthIndex: 6, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false },
  { month: "August", monthIndex: 7, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false },
  { month: "September", monthIndex: 8, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false },
  { month: "October", monthIndex: 9, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false },
  { month: "November", monthIndex: 10, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false },
  { month: "December", monthIndex: 11, sipTarget: 15000, lumpsumTarget: 0, sipAchieved: 0, lumpsumAchieved: 0, isEditable: false },
]

const toggleTheme = () => {
  if (darkMode) {
    setDarkMode(false);
    // Return to previous theme
  } else {
    setDarkMode(true);
    setPreviousTheme(theme);
  }
};


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
    selectedBg,
    buttonBg,
    buttonHover,
    buttonText
  } = currentTheme;

  

  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [isEditingMonthly, setIsEditingMonthly] = useState(false)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth())
  const [isLoading, setIsLoading] = useState(true)
  const [records, setRecords] = useState<InvestmentRecord[]>(defaultRecords)
  
  const [previousTheme, setPreviousTheme] = useState<ThemeName>(theme);
  const [darkMode, setDarkMode] = useState(false);
  const getThemedButtonClasses = (variant: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'link' = 'primary') => {
    return getButtonClasses(theme, variant);
  };

  
  // Firestore document reference
  const investmentDocRef = doc(db, 'investmentTracker', currentYear.toString())

  // Load data from Firestore
 useEffect(() => {
    const unsubscribe = onSnapshot(investmentDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data()
        // Update both records and current month index from Firestore
        setRecords(data.records || defaultRecords)
        setCurrentMonthIndex(data.currentMonthIndex || new Date().getMonth())
      } else {
        // Initialize with default data if document doesn't exist
        initializeFirestoreData()
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [currentYear])

  const initializeFirestoreData = async () => {
    try {
      await setDoc(investmentDocRef, {
        records: defaultRecords,
        currentMonthIndex: new Date().getMonth(),
        year: currentYear,
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error initializing data:", error)
      toast({
        title: "Error",
        description: "Failed to initialize investment tracker",
        variant: "destructive"
      })
    }
  }

  // Update editable status based on current month
  useEffect(() => {
    const updatedRecords = records.map(record => ({
      ...record,
      isEditable: record.monthIndex === currentMonthIndex
    }))
    // Only update if there are actual changes to prevent infinite loops
    if (JSON.stringify(updatedRecords) !== JSON.stringify(records)) {
      setRecords(updatedRecords)
    }
  }, [currentMonthIndex, records])

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

  const totals = calculateTotals()

  const saveToFirestore = async (updatedRecords: InvestmentRecord[], newMonthIndex?: number) => {
    try {
      await setDoc(investmentDocRef, {
        records: updatedRecords,
        currentMonthIndex: newMonthIndex !== undefined ? newMonthIndex : currentMonthIndex,
        year: currentYear,
        updatedAt: new Date().toISOString()
      }, { merge: true })
      
      // Update local state immediately for better UX
      setRecords(updatedRecords)
      if (newMonthIndex !== undefined) {
        setCurrentMonthIndex(newMonthIndex)
      }
    } catch (error) {
      console.error('Error saving to Firestore:', error)
      toast({
        title: 'Error',
        description: 'Failed to save data',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateAchievedValue = async (monthIndex: number, field: 'sipAchieved' | 'lumpsumAchieved', value: number) => {
    const updatedRecords = records.map(record => 
      record.monthIndex === monthIndex ? { ...record, [field]: value } : record
    )
    await saveToFirestore(updatedRecords)
  }

  const handleUpdateTargetValue = async (field: 'sipTarget' | 'lumpsumTarget', value: number) => {
    const updatedRecords = records.map(record => ({
      ...record,
      [field]: field === 'sipTarget' ? value : 
               (record.monthIndex === 0 ? value : 0)
    }))
    await saveToFirestore(updatedRecords)
  }

  const completeCurrentMonth = async () => {
    let newMonthIndex = currentMonthIndex < 11 ? currentMonthIndex + 1 : 0
    if (currentMonthIndex === 11) {
      setCurrentYear(prev => prev + 1)
    }
    await saveToFirestore(records, newMonthIndex)
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
       <div className="space-y-4" >
      <Card className="bg-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Investment Tracker - {currentYear}</CardTitle>
              <CardDescription>Track your monthly investment goals and achievements</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Current Month: {records[currentMonthIndex]?.month}
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
              className="gap-2"
            >
              {isEditingSummary ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              {isEditingSummary ? "Save Summary" : "Edit Summary"}
            </Button>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* SIP Summary */}
            <Card>
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
                      className="w-24"
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
      className="h-full rounded-full bg-blue-500 transition-all duration-300" 
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
            <Card>
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
                      className="w-24"
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
            <Card>
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
      <Card className="bg-white">
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
                className="gap-2"
              >
                {isEditingMonthly ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditingMonthly ? "Save Monthly Data" : "Edit Monthly Data"}
              </Button>
              {isEditingMonthly && (
                <Button
                  onClick={completeCurrentMonth}
                  variant="default"
                  className="gap-2"
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
                  <tr 
                    key={record.month} 
                    className={record.isEditable ? "bg-blue-50" : ""}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      {record.month}
                      {record.isEditable && <span className="ml-2 text-xs text-blue-500">(Current)</span>}
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
                            className="w-24"
                          />
                        ) : (
                          <>
                            {formatCurrency(record.sipAchieved)}
                            {!record.isEditable && <Lock className="h-3 w-3 ml-1 text-muted-foreground" />}
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
                            className="w-24"
                          />
                        ) : (
                          <>
                            {formatCurrency(record.lumpsumAchieved)}
                            {!record.isEditable && <Lock className="h-3 w-3 ml-1 text-muted-foreground" />}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
            setData({
              records: docData.records || defaultRecords,
              currentMonthIndex: docData.currentMonthIndex || new Date().getMonth(),
              year: docData.year || currentYear
            });
          } else {
            // Initialize with default data if document doesn't exist
            setDoc(investmentDocRef, {
              records: defaultRecords,
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