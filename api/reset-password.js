import { handleCors } from '../lib/cors.js';
import admin from 'firebase-admin';

function ensureApp() {
  if (admin.apps.length === 0) {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    } catch (e) {
      serviceAccount = {};
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }
}

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
    ensureApp();

    // Generate Firebase password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(trimmed, {
      url: 'https://www.speakli.co.il',
    });

    // Send via Brevo
    await sendBrevoEmail({
      to: trimmed,
      subject: 'איפוס סיסמה - Speakli',
      htmlContent: `
        <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; text-align: center;">
          <img src="https://www.speakli.co.il/images/speakli-avatar.webp" alt="Speakli" style="width: 80px; height: 80px; margin-bottom: 16px;" />
          <h2 style="color: #1e3a5f; margin-bottom: 8px;">איפוס סיסמה</h2>
          <p style="color: #555; font-size: 15px; margin-bottom: 24px;">
            קיבלנו בקשה לאפס את הסיסמה שלכם.<br/>
            לחצו על הכפתור למטה כדי לבחור סיסמה חדשה:
          </p>
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-weight: bold; font-size: 16px;">
            איפוס סיסמה
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            אם לא ביקשתם איפוס סיסמה, התעלמו מהמייל הזה.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #bbb; font-size: 11px;">Speakli — למדו אנגלית בקלות ובכיף</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err.code || err.message);

    if (err.code === 'auth/user-not-found') {
      // Still return success to not reveal if email exists
      return res.status(200).json({ success: true });
    }

    return res.status(500).json({ error: 'Failed to send reset email' });
  }
}
