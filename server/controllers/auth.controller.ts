import admin from '../config/firebase-admin';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface FirebaseUserData {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface TokenResponse {
  uid: string;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  firebaseToken: string;
}

export async function verifyGoogleTokenAndCreateFirebaseToken(idToken: string): Promise<TokenResponse> {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload?.sub) {
      throw new Error('Invalid token payload');
    }
    
    // Create or get Firebase user
    let user: FirebaseUserData;
    try {
      user = await admin.auth().getUser(payload.sub);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        user = await admin.auth().createUser({
          uid: payload.sub,
          email: payload.email,
          displayName: payload.name,
          photoURL: payload.picture
        });
      } else {
        throw error;
      }
    }
    
    // Create custom token
    const firebaseToken = await admin.auth().createCustomToken(user.uid);
    
    return {
      uid: user.uid,
      email: user.email,
      name: user.displayName || undefined,
      picture: user.photoURL || undefined,
      firebaseToken
    };
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw error;
  }
}