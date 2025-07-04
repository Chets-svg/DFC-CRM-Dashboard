import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import admin from 'firebase-admin';
import cors from 'cors';

const router = Router();
router.use(cors());  Allow frontend to call this API

 Initialize Firebase Admin (replace with your config)
const serviceAccount = require('..path-to-your-firebase-adminsdk.json');
admin.initializeApp({
  credential admin.credential.cert(serviceAccount),
});

 Google OAuth Client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

 (1) Start Google OAuth Flow
router.get('google', (req Request, res Response) = {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type 'offline',
    scope ['email', 'profile'],
    prompt 'consent',
  });
  res.redirect(authUrl);
});

 (2) Handle Google Callback
router.get('googlecallback', async (req Request, res Response) = {
  try {
    const { code } = req.query as { code string };
    if (!code) throw new Error(No auth code received);

     Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

     Get user info
    const ticket = await oauth2Client.verifyIdToken({
      idToken tokens.id_token!,
      audience process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.email) throw new Error(No email found);

     CreateGet Firebase user
    let user;
    try {
      user = await admin.auth().getUserByEmail(payload.email);
    } catch (error) {
      user = await admin.auth().createUser({
        email payload.email,
        displayName payload.name,
      });
    }

     Generate Firebase token for frontend
    const firebaseToken = await admin.auth().createCustomToken(user.uid);

     Send token back to frontend
    res.json({
      success true,
      firebaseToken,
      user {
        email payload.email,
        name payload.name,
      },
    });
  } catch (error) {
    console.error(Google Auth Error, error);
    res.status(500).json({ error Login failed });
  }
});

// Add to your server routes
router.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    res.json({ email: payload.email });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
export default router;