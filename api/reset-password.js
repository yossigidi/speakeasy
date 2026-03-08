import { handleCors } from '../lib/cors.js';

const FIREBASE_API_KEY = 'AIzaSyCWI1dPrkv168J06cSINAlQPeFn-KtrYxc';

async function sendBrevoEmail({ to, subject, htmlContent }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Speakli', email: 'noreply@speakli.co.il' },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Brevo error:', err);
    throw new Error(`Brevo failed: ${res.status}`);
  }
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const trimmed = email.trim().toLowerCase();

  try {
    // Use Firebase Auth REST API to send password reset email
    // This uses Firebase's built-in email sending as a reliable fallback
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email: trimmed,
        }),
      }
    );

    const data = await firebaseRes.json();

    if (!firebaseRes.ok) {
      const errCode = data?.error?.message;
      console.error('Firebase reset error:', errCode);
      // Don't reveal if email exists or not
      if (errCode === 'EMAIL_NOT_FOUND') {
        return res.status(200).json({ success: true });
      }
      throw new Error(errCode || 'Firebase reset failed');
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err.message);
    return res.status(500).json({ error: 'Failed to send reset email', detail: err.message });
  }
}
