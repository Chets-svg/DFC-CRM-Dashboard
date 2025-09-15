import { useState, useEffect } from 'react';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ClientInvestment {
  id: string;
  name: string;
  sipAmount: number;
  lumpsumAmount: number;
}

interface InvestmentRecord {
  month: string;
  monthIndex: number;
  sipTarget: number;
  lumpsumTarget: number;
  sipAchieved: number;
  lumpsumAchieved: number;
  isEditable: boolean;
  clients: ClientInvestment[];
}

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
];

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
            setData({
              records: defaultRecords,
              currentMonthIndex: new Date().getMonth(),
              year: currentYear
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