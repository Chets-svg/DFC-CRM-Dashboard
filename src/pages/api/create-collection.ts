import { adminDb } from "@/lib/firebase-admin";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Create collection with auto-generated ID
    const docRef = await adminDb.collection("customers").add({
      name: "Server-Side Customer",
      status: "lead"
    });

    res.status(200).json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to create collection" });
  }
}