const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/gmail', async (req, res) => {
  const { token } = req.body;

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'postmessage'
    );

    const { tokens } = await oauth2Client.getToken(token);
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const messages = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      labelIds: ['INBOX'],
    });

    res.status(200).json(messages.data);
  } catch (err) {
    console.error('❌ Gmail backend error:', err);
    res.status(500).json({ error: 'Failed to fetch Gmail inbox' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Gmail API server running on http://localhost:${PORT}`);
});