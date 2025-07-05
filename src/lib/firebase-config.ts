import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword,
  signOut,
  User } from "firebase/auth"; // Add this import

  console.log('Firebase config loaded'); // Add at top of file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize auth

// Auth functions
export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  return await signOut(auth);
};

// Collections
const LEADS_COLLECTION = "leads";
const CLIENTS_COLLECTION = "clients";
const COMMUNICATIONS_COLLECTION = "communications";
const SIP_REMINDERS_COLLECTION = "sipReminders";
const ACTIVITIES_COLLECTION = "activities";
const KYCS_COLLECTION = "kycs";

// Helper functions
export const addDocument = async (collectionName: string, data: any) => {
  const docRef = doc(collection(db, collectionName));
  await setDoc(docRef, { ...data, id: docRef.id });
  return docRef.id;
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

export const getCollection = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToCollection = (
  collectionName: string,
  callback: (data: any[]) => void
) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};
export const saveUserThemePreference = async (userId: string, theme: ThemeName) => {
  try {
    await setDoc(doc(db, 'userPreferences', userId), { theme }, { merge: true });
  } catch (error) {
    console.error('Error saving theme preference:', error);
  }
};
export const getUserThemePreference = async (userId: string): Promise<ThemeName> => {
  try {
    const docRef = doc(db, 'userPreferences', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.theme) {
        return data.theme as ThemeName;
      }
    }
    return 'blue-smoke'; // Default theme
  } catch (error) {
    console.error('Error getting theme preference:', error);
    return 'blue-smoke';
  }
};

export const getUserPreference = async (userId: string, key: string) => {
  try {
    const docRef = doc(db, 'userPreferences', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data()[key] : null;
  } catch (error) {
    console.error('Error getting user preference:', error);
    return null;
  }
};

export const setUserPreference = async (userId: string, key: string, value: any) => {
  try {
    const docRef = doc(db, 'userPreferences', userId);
    await setDoc(docRef, { [key]: value }, { merge: true });
  } catch (error) {
    console.error('Error setting user preference:', error);
  }
};

export {
  db,
  auth,
  LEADS_COLLECTION,
  CLIENTS_COLLECTION,
  COMMUNICATIONS_COLLECTION,
  SIP_REMINDERS_COLLECTION,
  ACTIVITIES_COLLECTION,
  KYCS_COLLECTION
};
