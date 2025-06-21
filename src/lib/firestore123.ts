import { db } from "./firebase-config"; // Adjust path as needed
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  getDocs,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  lead
} from "firebase/firestore";
import { db } from "./firebase";
import { onClientsSnapshot, onLeadsSnapshot } from "@/lib/firestore";
export type CommunicationType = 'email' | 'whatsapp' | 'call' | 'meeting' | 'document';
export type CommunicationPriority = 'low' | 'medium' | 'high';
export type CommunicationStatus = 'pending' | 'sent' | 'received' | 'read' | 'failed';

export const addLead = async (leadData: LeadFormValues) => {
  try {
    // Verify authentication first
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Add createdBy and timestamps
    const newLead = {
      ...leadData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'new' // default status
    };

    const docRef = await addDoc(collection(db, "leads"), newLead);
    return docRef.id;
  } catch (error) {
    console.error("Error adding lead:", error);
    throw error;
  }
};

export interface EnhancedCommunication {
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

export type SIPReminder = {
  id: string;
  clientId: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  nextDate: string;
  status: 'active' | 'paused' | 'completed';
  lastReminderSent?: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  productInterest: string[];
  status: 'new' | 'contacted' | 'qualified' | 'lost';
  notes: string[];
  progressStatus: 'lead-generated' | 'kyc-started' | 'kyc-completed' | 
                'can-no-generated' | 'can-account-created' | 
                'mandate-generated' | 'mandate-accepted' | 'sip-setup';
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  sipStartDate?: string;
  sipNextDate?: string;
  products: {
    mutualFund?: boolean;
    sip?: boolean;
    lumpsum?: boolean;
    healthInsurance?: boolean;
    lifeInsurance?: boolean;
  };
};


export type ActivityItem = {
  id: string;
  type: 'login' | 'task' | 'system' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  status?: 'completed' | 'failed';
};

export const clientsCol = collection(db, 'clients');
export const leadsCol = collection(db, 'leads');
export const communicationsCol = collection(db, 'communications');
export const sipRemindersCol = collection(db, 'sipReminders');
export const activitiesCol = collection(db, 'activities');

// Client operations
export const addClient = async (clientData: Omit<Client, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(clientsCol, {
      ...clientData,
      products: {
        mutualFund: clientData.products?.mutualFund || false,
        sip: clientData.products?.sip || false,
        lumpsum: clientData.products?.lumpsum || false,
        healthInsurance: clientData.products?.healthInsurance || false,
        lifeInsurance: clientData.products?.lifeInsurance || false,
      }
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding client: ", error);
    throw new Error("Failed to add client");
  }
};

export const updateClient = async (id: string, clientData: Partial<Client>) => {
  try {
    console.log("Updating client:", id, clientData);
    await updateDoc(doc(clientsCol, id), clientData);
    console.log("Client updated successfully");
  } catch (error) {
    console.error("Error updating client: ", error);
    throw error;
  }
};

export const deleteClient = async (id: string) => {
  try {
    console.log("Deleting document at:", `clients/${id}`); // Add this line
    await deleteDoc(doc(db, "clients", id));
  } catch (error) {
    console.error("Firestore delete error:", error);
    throw error;
  }
};

export const getClients = async (): Promise<Client[]> => {
  const snapshot = await getDocs(clientsCol);c
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

// Real-time listener for clients
export const onClientsSnapshot = (
  callback: (clients: Client[]) => void, 
  errorCallback?: (error: Error) => void
) => {
  return onSnapshot(
    clientsCol,
    (snapshot) => {
      const clients = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          sipStartDate: data.sipStartDate || undefined,
          sipNextDate: data.sipNextDate || undefined,
          createdAt: data.createdAt || new Date().toISOString(),
          products: {
            mutualFund: data.products?.mutualFund || false,
            sip: data.products?.sip || false,
            lumpsum: data.products?.lumpsum || false,
            healthInsurance: data.products?.healthInsurance || false,
            lifeInsurance: data.products?.lifeInsurance || false,
          }
        } as Client;
      });
      
      // Sort by createdAt in descending order (newest first)
      const sortedClients = clients.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      callback(sortedClients);
    },
    (error) => {
      console.error("Error in clients snapshot:", error);
      if (errorCallback) errorCallback(error);
    }
  );
};
export const updateLead = async (id: string, leadData: Partial<Lead>) => {
  await updateDoc(doc(leadsCol, id), leadData);
};

export const deleteLead = async (id: string) => {
  await deleteDoc(doc(leadsCol, id));
};

export const getLeads = async (): Promise<Lead[]> => {
  const snapshot = await getDocs(leadsCol);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    name: doc.data().name || '',
    email: doc.data().email || '',
    phone: doc.data().phone || '',
    productInterest: doc.data().productInterest || [],
    status: doc.data().status || 'new',
    notes: doc.data().notes || [],
    progressStatus: doc.data().progressStatus || 'lead-generated'
  } as Lead));
};

// Real-time listener for leads
export const onLeadsSnapshot = (callback: (leads: Lead[]) => void) => {
  return onSnapshot(leadsCol, (snapshot) => {
    const leads = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      email: doc.data().email || '',
      phone: doc.data().phone || '',
      productInterest: doc.data().productInterest || [],
      status: doc.data().status || 'new',
      notes: doc.data().notes || [],
      progressStatus: doc.data().progressStatus || 'lead-generated',
      createdAt: doc.data().createdAt || new Date().toISOString() // Ensure createdAt is included
    })) as Lead[];
    
    // Sort by createdAt in descending order (newest first)
    const sortedLeads = leads.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    callback(sortedLeads);
  });
};

export const saveUserPreferences = async (preferences: UserPreferences) => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await setDoc(doc(db, "userPreferences", user.uid), preferences);
  } catch (error) {
    console.error("Error saving preferences:", error);
    throw error;
  }
};

export const getUserPreferences = async (): Promise<UserPreferences | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const docRef = doc(db, "userPreferences", user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserPreferences;
    }
    return null;
  } catch (error) {
    console.error("Error getting preferences:", error);
    throw error;
  }
};
