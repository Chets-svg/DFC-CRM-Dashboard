import { Router, Request, Response, NextFunction } from 'express';
import authenticate from '../middlewares/auth.middleware';
import gmailService from '../services/gmail.service';

interface EmailRequest extends Request {
  body: {
    accessToken: string;
    refreshToken?: string;
    to?: string;
    subject?: string;
    body?: string;
  };
}

// Middleware to set Gmail credentials
async function setGmailCredentials(req: EmailRequest, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }
    
    gmailService.setCredentials({ 
      access_token: accessToken, 
      refresh_token: refreshToken 
    });
    next();
  } catch (error: any) {
    console.error('Error setting Gmail credentials:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to authenticate with Gmail' 
    });
  }
}

const router = Router();

// Get emails
router.get('/emails', authenticate, setGmailCredentials, async (req: EmailRequest, res: Response) => {
  try {
    const emails = await gmailService.listEmails(10);
    res.json(emails);
  } catch (error: any) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch emails' 
    });
  }
});

// Send email
router.post('/send', authenticate, setGmailCredentials, async (req: EmailRequest, res: Response) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await gmailService.sendEmail({ to, subject, body });
    res.json(result);
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to send email' 
    });
  }
});

export default router;