import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { credential } from "firebase-admin";

const serviceAccount = require("./serviceAccountKey.json");

if (!getApps().length) {
  initializeApp({
    credential: credential.cert(serviceAccount)
  });
}

export const adminDb = getFirestore();