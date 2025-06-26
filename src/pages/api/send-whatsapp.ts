import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, from, message } = req.body;

  // Initialize Twilio client
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    // Send WhatsApp message
    await client.messages.create({
      body: message,
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return res.status(500).json({ message: 'Failed to send WhatsApp message' });
  }
}