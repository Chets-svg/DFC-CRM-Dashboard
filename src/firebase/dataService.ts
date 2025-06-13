import { database, firestore } from './firebase';
import { ref, set, onValue, push, DatabaseReference, DataSnapshot } from "firebase/database";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  DocumentData, 
  DocumentReference,
  FirestoreError 
} from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { firestore } from "./firebase";

export interface DocumentWithId<T = DocumentData> extends T {
  id: string;
}

// Type for documents with auto-generated ID
export interface DocumentWithId<T = DocumentData> extends T {
  id: string;
}

// Real-time Database operations
export const writeData = async (path: string, data: any): Promise<void> => {
  try {
    await set(ref(database, path), data);
  } catch (error) {
    console.error(`Firebase write error at ${path}:`, error);
    throw error;
  }
};

export const pushData = async (path: string, data: any): Promise<DatabaseReference> => {
  try {
    const newRef = push(ref(database, path));
    await set(newRef, data);
    return newRef;
  } catch (error) {
    console.error(`Firebase push error at ${path}:`, error);
    throw error;
  }
};

export const readData = (
  path: string,
  callback: (data: any) => void,
  errorCallback?: (error: FirestoreError) => void
): (() => void) => {
  const dataRef = ref(database, path);
  return onValue(
    dataRef,
    (snapshot: DataSnapshot) => callback(snapshot.val()),
    (error) => {
      console.error(`Firebase read error at ${path}:`, error);
      errorCallback?.(error);
    }
  );
};

// Firestore operations
export const addDocument = async <T extends DocumentData>(
  collectionPath: string,
  data: T
): Promise<DocumentReference<T>> => {
  try {
    return await addDoc(collection(firestore, collectionPath), data);
  } catch (error) {
    console.error(`Firestore add error in ${collectionPath}:`, error);
    throw error;
  }
};

export const setDocument = async <T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: T,
  merge = false
): Promise<void> => {
  try {
    await setDoc(doc(firestore, collectionPath, docId), data, { merge });
  } catch (error) {
    console.error(`Firestore set error for ${collectionPath}/${docId}:`, error);
    throw error;
  }
};

export const getCollectionData = async <T extends DocumentData>(
  collectionName: string
): Promise<DocumentWithId<T>[]> => {
  return getDocuments<T>(collectionName);
};

;// Get all documents from a collection
export const getDocuments = async <T extends DocumentData>(
  collectionPath: string
): Promise<DocumentWithId<T>[]> => {
  try {
    const snapshot = await getDocs(collection(firestore, collectionPath));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DocumentWithId<T>[];
  } catch (error) {
    console.error(`Error getting documents from ${collectionPath}:`, error);
    throw error;
  }
};

export const updateDocument = async <T extends DocumentData>(
  collectionPath: string,
  docId: string,
  data: Partial<T>
): Promise<void> => {
  try {
    await updateDoc(doc(firestore, collectionPath, docId), data);
  } catch (error) {
    console.error(`Firestore update error for ${collectionPath}/${docId}:`, error);
    throw error;
  }
};