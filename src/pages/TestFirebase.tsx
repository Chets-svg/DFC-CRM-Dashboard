"use client";
import { useEffect } from 'react';
import { addDocument, getDocument } from '@/lib/firebase';

export default function TestFirebase() {
  useEffect(() => {
    async function testFirebase() {
      // Add a test document
      const id = await addDocument('test', { message: 'Hello Firebase!', timestamp: new Date() });
      console.log('Added document with ID:', id);
      
      // Retrieve the document
      const doc = await getDocument('test', id);
      console.log('Retrieved document:', doc);
    }
    
    testFirebase();
  }, []);

  return (
    <div className="p-4 bg-blue-100">
      <p>Testing Firebase connection - check browser console for output</p>
    </div>
  );
}