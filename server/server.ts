import express, { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import cors from 'cors';
import admin from './firebase-admin';

dotenv.config();

const app = express();
app.use(express.json());

// CORS Config (MUST come before routes)
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'], // add 5173 if you're using Vite
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Auth URL Generator
app.get('/api/auth/google', (req: Request, res: Response) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send', // Add this for sending emails
      'https://www.googleapis.com/auth/gmail.modify' // Add this for labels/threads
    ],
  });
  res.json({ authUrl: url });
});


// Gmail Fetch Route
app.post('/api/gmail', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is missing' });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20,
      labelIds: ['INBOX'],
    });

    const messages = await Promise.all(
      (response.data.messages || []).map(async (msg) => {
        const fullMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id! });
        const headers = fullMsg.data.payload?.headers || [];
        const from = headers.find(h => h.name === 'From')?.value || '';
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        return {
          id: msg.id,
          from,
          subject,
          snippet: fullMsg.data.snippet || '',
        };
      })
    );

    res.json({ messages });

  } catch (error) {
    console.error('❌ Gmail API Error:', error);
    res.status(500).json({ error: 'Failed to fetch Gmail' });
  }
});

app.post('/api/auth/firebase-token', async (req, res) => {
  const { googleToken } = req.body;
  try {
    const ticket = await admin.auth().verifyIdToken(googleToken);
    const firebaseToken = await admin.auth().createCustomToken(ticket.uid);
    res.json({ firebaseToken });
  } catch (err) {
    console.error('❌ Firebase token error:', err);
    res.status(500).json({ error: 'Failed to verify Google token' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.post('/api/gmail/send', async (req: Request, res: Response) => {
  const { token, to, subject, message } = req.body;
  if (!token || !to || !subject || !message)
    return res.status(400).json({ error: 'Missing fields' });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const rawMessage = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\n\r\n${message}`
  ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage
      }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Gmail Send Error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});