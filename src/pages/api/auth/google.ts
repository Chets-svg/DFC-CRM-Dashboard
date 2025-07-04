import { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Handle the initial auth request
    if (!req.query.code) {
      const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send'],
        prompt: 'consent' // Forces consent screen to get refresh token
      });
      return res.redirect(url);
    }

    // Handle the callback with authorization code
    const { code } = req.query;
    
    try {
      const { tokens } = await client.getToken(code as string);
      client.setCredentials(tokens);
      
      // Get user info
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      
      // Send the tokens back to the frontend
      return res.send(`
        <html>
          <head>
            <title>Authentication Successful</title>
          </head>
          <body>
            <script>
              window.opener.postMessage(
  { 
    type: 'google-auth-success',
    tokens: ${JSON.stringify(tokens)},
    user: ${JSON.stringify({
      name: payload?.name,
      email: payload?.email,
      picture: payload?.picture
    })}
  }, 
  '${process.env.NEXT_PUBLIC_BASE_URL}'
);
              window.close();
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage(
                { 
                  type: 'google-auth-error',
                  error: 'Authentication failed'
                }, 
                '${process.env.NEXT_PUBLIC_BASE_URL}'
              );
              window.close();
            </script>
          </body>
        </html>
      `);
    }
  }

  return res.status(405).send('Method not allowed');
}