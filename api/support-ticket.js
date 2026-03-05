import { handleCors } from '../lib/cors.js';
import { getFirestore } from '../lib/firebase.js';
import admin from 'firebase-admin';

// Ensure Firebase Admin is initialised (shared with lib/firebase.js)
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

async function verifyAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    ensureApp();
    return await admin.auth().verifyIdToken(token);
  } catch { return null; }
}

const ADMIN_EMAIL = process.env.SUPPORT_ADMIN_EMAIL || 'support@speakli.co.il';

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function sendBrevoEmail({ to, subject, htmlContent }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Speakli Support', email: 'noreply@speakli.co.il' },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Brevo error:', err);
  }
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { userId, email, name, category, subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }

    // Validate email format if provided
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const db = getFirestore();

    // Save ticket to Firestore
    const ticketRef = await db.collection('support-tickets').add({
      userId: userId || 'anonymous',
      email: email || '',
      name: name || 'User',
      category: category || 'other',
      subject,
      message,
      status: 'open',
      createdAt: new Date(),
      replies: [],
    });

    const ticketId = ticketRef.id;

    // Send email to admin (fire-and-forget)
    const categoryLabel = { bug: 'Bug', feature: 'Feature Request', account: 'Account', billing: 'Billing', other: 'Other' }[category] || 'Other';

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    sendBrevoEmail({
      to: ADMIN_EMAIL,
      subject: `[Speakli] ${categoryLabel}: ${safeSubject}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">New Support Ticket</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; color: #666;">Ticket ID</td><td style="padding: 8px;">${ticketId}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #666;">From</td><td style="padding: 8px;">${safeName} (${safeEmail})</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #666;">Category</td><td style="padding: 8px;">${categoryLabel}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #666;">Subject</td><td style="padding: 8px;">${safeSubject}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f0fdfa; border-radius: 8px;">
            <p style="margin: 0; white-space: pre-wrap;">${safeMessage}</p>
          </div>
          <p style="margin-top: 16px; color: #999; font-size: 12px;">User ID: ${escapeHtml(userId)}</p>
        </div>
      `,
    }).catch(err => console.error('Admin email failed:', err));

    // Send confirmation to user (fire-and-forget)
    if (email) {
      sendBrevoEmail({
        to: email,
        subject: 'קיבלנו את הפנייה שלך - Speakli',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl; text-align: right;">
            <h2 style="color: #0d9488;">שלום ${safeName},</h2>
            <p>קיבלנו את הפנייה שלך ונחזור אליך בהקדם.</p>
            <div style="margin: 16px 0; padding: 16px; background: #f0fdfa; border-radius: 8px;">
              <p style="margin: 0; font-weight: bold; color: #666;">נושא: ${safeSubject}</p>
              <p style="margin: 8px 0 0; color: #444; white-space: pre-wrap;">${safeMessage}</p>
            </div>
            <p style="color: #999; font-size: 12px;">מזהה פנייה: ${ticketId}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center; direction: ltr;">Speakli - Learn English the Easy Way</p>
          </div>
        `,
      }).catch(err => console.error('User confirmation email failed:', err));
    }

    return res.status(200).json({ success: true, ticketId });
  } catch (error) {
    console.error('Support ticket error:', error);
    return res.status(500).json({ error: 'Failed to create support ticket' });
  }
}
