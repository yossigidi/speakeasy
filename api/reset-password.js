import { handleCors } from '../lib/cors.js';
import admin from 'firebase-admin';
import { getFirestore } from '../lib/firebase.js';

async function sendBrevoEmail({ to, subject, htmlContent }) {
  const BREVO_KEY = process.env.BREVO_API_KEY_speakli || process.env.BREVO_API_KEY;
  if (!BREVO_KEY) throw new Error('No BREVO_API_KEY configured');

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Speakli', email: 'report@speakli.co.il' },
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

function buildResetEmail(resetLink, lang) {
  const isRTL = lang === 'he' || lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  const texts = {
    he: {
      title: 'איפוס סיסמה',
      greeting: 'שלום,',
      body: 'קיבלנו בקשה לאיפוס הסיסמה שלך ב-Speakli.',
      cta: 'איפוס סיסמה',
      ignore: 'אם לא ביקשת לאפס את הסיסמה, ניתן להתעלם ממייל זה.',
      expires: 'הקישור תקף לשעה אחת.',
    },
    en: {
      title: 'Password Reset',
      greeting: 'Hello,',
      body: 'We received a request to reset your Speakli password.',
      cta: 'Reset Password',
      ignore: 'If you didn\'t request a password reset, you can ignore this email.',
      expires: 'This link expires in 1 hour.',
    },
    ar: {
      title: 'إعادة تعيين كلمة المرور',
      greeting: 'مرحبًا،',
      body: 'تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك في Speakli.',
      cta: 'إعادة تعيين كلمة المرور',
      ignore: 'إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.',
      expires: 'هذا الرابط صالح لمدة ساعة واحدة.',
    },
    ru: {
      title: 'Сброс пароля',
      greeting: 'Здравствуйте,',
      body: 'Мы получили запрос на сброс пароля вашего аккаунта Speakli.',
      cta: 'Сбросить пароль',
      ignore: 'Если вы не запрашивали сброс пароля, проигнорируйте это письмо.',
      expires: 'Ссылка действительна в течение 1 часа.',
    },
  };

  const t = texts[lang] || texts.he;

  return `<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:32px;">
    <img src="https://www.speakli.co.il/images/speakli-icon.webp" alt="Speakli" style="width:48px;height:48px;border-radius:12px;" />
  </div>
  <div style="background:#fff;border-radius:16px;padding:32px 24px;border:1px solid #E5E7EB;">
    <h1 style="font-size:22px;font-weight:700;color:#111827;margin:0 0 16px;text-align:center;">${t.title}</h1>
    <p style="font-size:15px;color:#374151;margin:0 0 8px;line-height:1.6;">${t.greeting}</p>
    <p style="font-size:15px;color:#374151;margin:0 0 24px;line-height:1.6;">${t.body}</p>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${resetLink}" style="display:inline-block;background:#6366F1;color:white;padding:14px 40px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;">${t.cta}</a>
    </div>
    <p style="font-size:13px;color:#9CA3AF;margin:0 0 4px;text-align:center;">${t.expires}</p>
    <p style="font-size:13px;color:#9CA3AF;margin:0;text-align:center;">${t.ignore}</p>
  </div>
  <div style="text-align:center;margin-top:24px;">
    <p style="font-size:11px;color:#D1D5DB;margin:0;">Speakli — Learn English the fun way</p>
  </div>
</div>
</body></html>`;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, lang } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const trimmed = email.trim().toLowerCase();
  const uiLang = ['he', 'en', 'ar', 'ru'].includes(lang) ? lang : 'he';

  try {
    // Ensure Firebase Admin is initialized
    getFirestore();

    // Generate password reset link via Firebase Admin
    const resetLink = await admin.auth().generatePasswordResetLink(trimmed, {
      url: 'https://www.speakli.co.il',
    });

    // Send via Brevo for fast, reliable delivery from verified domain
    const subjects = { he: 'איפוס סיסמה — Speakli', en: 'Password Reset — Speakli', ar: 'إعادة تعيين كلمة المرور — Speakli', ru: 'Сброс пароля — Speakli' };
    await sendBrevoEmail({
      to: trimmed,
      subject: subjects[uiLang] || subjects.he,
      htmlContent: buildResetEmail(resetLink, uiLang),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err.message, err.code);

    // Don't reveal if email exists or not
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
      return res.status(200).json({ success: true });
    }

    return res.status(500).json({ error: 'Failed to send reset email', detail: err.message });
  }
}
