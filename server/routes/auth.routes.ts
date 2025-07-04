import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import admin from 'firebase-admin';
import cors from 'cors';

const router = Router();
router.use(cors());

// Initialize Firebase Admin (replace with your config)
const serviceAccount = require('../path-to-your-firebase-adminsdk.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Start Google OAuth Flow
router.get('/google', (req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile'],
    prompt: 'consent',
  });
  res.redirect(authUrl);
});

// Handle Google Callback
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query as { code: string };
    if (!code) throw new Error("No auth code received");

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) throw new Error("No email found");

    let user;
    try {
      user = await admin.auth().getUserByEmail(payload.email);
    } catch (error) {
      user = await admin.auth().createUser({
        email: payload.email,
        displayName: payload.name,
      });
    }

    const firebaseToken = await admin.auth().createCustomToken(user.uid);

    res.json({
      success: true,
      firebaseToken,
      user: {
        email: payload.email,
        name: payload.name,
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;

router.post('/gmail/send', async (req: Request, res: Response) => {
  try {
    const { to, subject, body, accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: me`,
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    res.json({ success: true, messageId: response.data.id });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});