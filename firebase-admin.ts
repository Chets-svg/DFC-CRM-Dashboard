import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json'; // update with actual filename

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default admin;