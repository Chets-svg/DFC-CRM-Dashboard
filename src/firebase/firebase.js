import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push, update, remove } from "firebase/database";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCd6PrNl6p6_BxCF0z1alr1nQellQi8vvw",
  authDomain: "dfs-crm-dashboard.firebaseapp.com",
  projectId: "dfs-crm-dashboard",
  storageBucket: "dfs-crm-dashboard.firebasestorage.app",
  messagingSenderId: "79153373658",
  appId: "1:79153373658:web:bcae1a05f58df4e199a0e3",
  databaseURL: "https://dfs-crm-dashboard-default-rtdb.firebaseio.com"
};

// Initialize Firebase with singleton pattern
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Initialize Firestore
const firestore = getFirestore(app);

// Realtime Database helper functions
const getRealtimeData = (path: string) => {
  return ref(database, path);
};

const addRealtimeData = (path: string, data: any) => {
  return push(ref(database, path), data);
};

const updateRealtimeData = (path: string, data: any) => {
  return update(ref(database, path), data);
};

const deleteRealtimeData = (path: string) => {
  return remove(ref(database, path));
};

// Firestore helper functions
const getCollectionData = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(firestore, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const addDocument = async (collectionName: string, data: any) => {
  const docRef = doc(collection(firestore, collectionName));
  await setDoc(docRef, data);
  return docRef.id;
};

const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(firestore, collectionName, id);
  await updateDoc(docRef, data);
};

const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(firestore, collectionName, id);
  await deleteDoc(docRef);
};

export { 
  database,
  firestore,
  getRealtimeData,
  addRealtimeData,
  updateRealtimeData,
  deleteRealtimeData,
  getCollectionData,
  addDocument,
  updateDocument,
  deleteDocument
};

