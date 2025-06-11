import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCd6PrNl6p6_BxCF0z1alr1nQellQi8vvw",
  authDomain: "dfs-crm-dashboard.firebaseapp.com",
  projectId: "dfs-crm-dashboard",
  storageBucket: "dfs-crm-dashboard.firebasestorage.app",
  messagingSenderId: "79153373658",
  appId: "1:79153373658:web:bcae1a05f58df4e199a0e3"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper functions for Firestore operations
export const getCollectionData = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addDocument = async (collectionName: string, data: any) => {
  const docRef = doc(collection(db, collectionName));
  await setDoc(docRef, data);
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