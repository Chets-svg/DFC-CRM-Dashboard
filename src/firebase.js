import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
export const auth = getAuth(app);