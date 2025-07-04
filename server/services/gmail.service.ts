import { google } from 'googleapis';
import admin from './firebase-admin';

interface GmailTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}


class GmailService {
  async function getEmails(userId: string): Promise<any[]> {
  try {
    // Get user's Firebase auth record
    const userRecord = await admin.auth().getUser(userId);
    
    // Get stored OAuth tokens (you'll need to store these during initial auth)
    const tokens = await getStoredTokens(userId); // Implement this
    
    if (!tokens) throw new Error('No Gmail tokens found');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    const { data } = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'in:inbox'
    });
    
    return data.messages || [];
  } catch (error) {
    console.error('Gmail API error:', error);
    throw error;
  }
}

export default new GmailService();

interface EmailParams {
    to: string;
    subject: string;
    body: string;
  }

  interface GmailService {
    getAuthUrl(): string;
    getTokens(code: string): Promise<{
      access_token: string;
      refresh_token?: string;
      id_token?: string;
    }>;
    getUserProfile(): Promise<{
      id: string;
      email: string;
      name?: string;
      picture?: string;
    }>;
    setCredentials(tokens: {
      access_token: string;
      refresh_token?: string;
    }): void;
    listEmails(maxResults: number): Promise<any[]>;
    sendEmail(params: EmailParams): Promise<any>;
  }
}

declare module '../services/firebase-auth.service' {
  export function verifyGoogleTokenAndCreateFirebaseToken(
    idToken: string
  ): Promise<{ firebaseToken: string }>;
}