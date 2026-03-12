// Speakli Daily Reminder + Weekly Parent Report
// Vercel Serverless Function - Cron Job
// Runs daily at 6:00 UTC (8:00 AM Israel time)
// On Sundays, also sends weekly progress email to parents via Brevo

const admin = require('firebase-admin');
const webpush = require('web-push');

let db = null;

function getFirestoreAdmin() {
    if (db) return db;
    if (admin.apps.length === 0) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID
            });
        } catch (error) {
            console.error('Firebase init error:', error);
            throw error;
        }
    }
    db = admin.firestore();
    return db;
}

const REMINDER_MESSAGES = {
    he: {
        zero: { title: 'Speakli - בואו נדבר! 💬', body: 'עוד לא דיברתם אנגלית היום! בואו נשוחח 2 דקות 🗣️' },
        partial: { title: 'Speakli - כמעט שם! ⏱️', body: 'עוד {remaining} דקות ליעד הדיבור! 💪' },
        default: { title: 'Speakli - זמן ללמוד! 📚', body: 'אל תשבור את הרצף! בוא לתרגל אנגלית היום 🔥' },
    },
    en: {
        zero: { title: 'Speakli - Let\'s talk! 💬', body: 'You haven\'t spoken English today! Let\'s chat for 2 minutes 🗣️' },
        partial: { title: 'Speakli - Almost there! ⏱️', body: '{remaining} more minutes to hit your speaking goal! 💪' },
        default: { title: 'Speakli - Time to learn! 📚', body: "Don't break your streak! Practice English today 🔥" },
    },
};

// ── Weekly Parent Report via Brevo Email ──
async function sendWeeklyReports(db) {
    const BREVO_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_KEY) return { sent: 0, error: 'No BREVO_API_KEY configured' };

    const results = { sent: 0, failed: 0, skipped: 0 };

    // Get all users who have children
    const usersSnap = await db.collection('users').where('childrenIds', '!=', []).get();
    if (usersSnap.empty) return results;

    // Get last 7 days dates
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        const email = userData.email;
        if (!email) { results.skipped++; continue; }

        const childrenIds = userData.childrenIds || [];
        if (!childrenIds.length) { results.skipped++; continue; }

        const lang = userData.uiLang || 'he';
        const childSummaries = [];

        for (const childId of childrenIds) {
            try {
                const childDoc = await db.collection('childProfiles').doc(childId).get();
                if (!childDoc.exists) continue;
                const child = childDoc.data();

                // Fetch weekly activity
                let weekXP = 0, weekMinutes = 0, activeDays = 0;
                for (const date of days) {
                    try {
                        const actSnap = await db.collection('childProfiles').doc(childId)
                            .collection('dailyActivity').doc(date).get();
                        if (actSnap.exists) {
                            const act = actSnap.data();
                            weekXP += act.xp || 0;
                            weekMinutes += act.minutes || 0;
                            if ((act.xp || 0) > 0) activeDays++;
                        }
                    } catch (_) {}
                }

                childSummaries.push({
                    name: child.name || 'ילד',
                    avatar: child.avatar || '👧',
                    weekXP,
                    weekMinutes: Math.round(weekMinutes),
                    activeDays,
                    totalWords: child.totalWordsLearned || 0,
                    totalLessons: child.totalLessonsCompleted || 0,
                    streak: child.streak || 0,
                    level: child.curriculumLevel || child.childLevel || 1,
                });
            } catch (_) {}
        }

        if (!childSummaries.length) { results.skipped++; continue; }

        // Build email HTML
        const isHe = lang === 'he' || lang === 'ar';
        const dir = isHe ? 'rtl' : 'ltr';
        const title = lang === 'he' ? 'דו״ח שבועי — Speakli' : lang === 'ar' ? 'تقرير أسبوعي — Speakli' : lang === 'ru' ? 'Еженедельный отчёт — Speakli' : 'Weekly Report — Speakli';
        const labels = lang === 'he'
            ? { minutes: 'דקות לימוד', words: 'מילים שנלמדו', lessons: 'שיעורים', streak: 'רצף', activeDays: 'ימים פעילים', xp: 'נקודות', level: 'רמה', cta: 'בואו נמשיך ללמוד!', greeting: 'שלום!', summary: 'הנה הסיכום השבועי', noActivity: 'לא הייתה פעילות השבוע. בואו נחזור ללמוד!' }
            : lang === 'ar'
            ? { minutes: 'دقائق تعلم', words: 'كلمات تعلمها', lessons: 'دروس', streak: 'تسلسل', activeDays: 'أيام نشطة', xp: 'نقاط', level: 'مستوى', cta: 'لنواصل التعلم!', greeting: 'مرحباً!', summary: 'إليكم الملخص الأسبوعي', noActivity: 'لم يكن هناك نشاط هذا الأسبوع. لنعود للتعلم!' }
            : lang === 'ru'
            ? { minutes: 'минут обучения', words: 'слов изучено', lessons: 'уроков', streak: 'серия', activeDays: 'активных дней', xp: 'очков', level: 'уровень', cta: 'Продолжаем учиться!', greeting: 'Привет!', summary: 'Вот ваш еженедельный отчёт', noActivity: 'На этой неделе не было активности. Давайте вернёмся к учёбе!' }
            : { minutes: 'learning minutes', words: 'words learned', lessons: 'lessons', streak: 'day streak', activeDays: 'active days', xp: 'XP earned', level: 'level', cta: "Let's keep learning!", greeting: 'Hello!', summary: "Here's your weekly summary", noActivity: 'No activity this week. Let\'s get back to learning!' };

        let childrenHtml = '';
        for (const c of childSummaries) {
            if (c.weekXP === 0 && c.activeDays === 0) {
                childrenHtml += `<div style="background:#FFF3F3;border-radius:16px;padding:20px;margin-bottom:16px;text-align:center;">
                    <div style="font-size:40px;margin-bottom:8px;">${c.avatar}</div>
                    <div style="font-size:18px;font-weight:700;color:#1F2937;margin-bottom:8px;">${c.name}</div>
                    <p style="color:#6B7280;font-size:14px;">${labels.noActivity}</p>
                </div>`;
                continue;
            }
            childrenHtml += `<div style="background:#F0F9FF;border-radius:16px;padding:20px;margin-bottom:16px;">
                <div style="text-align:center;margin-bottom:16px;">
                    <div style="font-size:40px;margin-bottom:4px;">${c.avatar}</div>
                    <div style="font-size:18px;font-weight:700;color:#1F2937;">${c.name}</div>
                    <div style="font-size:13px;color:#6B7280;">${labels.level} ${c.level}</div>
                </div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr>
                        <td style="padding:8px 4px;text-align:center;width:33%;">
                            <div style="font-size:24px;font-weight:800;color:#6366F1;">${c.weekXP}</div>
                            <div style="font-size:11px;color:#6B7280;">${labels.xp}</div>
                        </td>
                        <td style="padding:8px 4px;text-align:center;width:33%;">
                            <div style="font-size:24px;font-weight:800;color:#10B981;">${c.activeDays}/7</div>
                            <div style="font-size:11px;color:#6B7280;">${labels.activeDays}</div>
                        </td>
                        <td style="padding:8px 4px;text-align:center;width:33%;">
                            <div style="font-size:24px;font-weight:800;color:#F59E0B;">${c.weekMinutes}</div>
                            <div style="font-size:11px;color:#6B7280;">${labels.minutes}</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:8px 4px;text-align:center;">
                            <div style="font-size:24px;font-weight:800;color:#EC4899;">${c.totalWords}</div>
                            <div style="font-size:11px;color:#6B7280;">${labels.words}</div>
                        </td>
                        <td style="padding:8px 4px;text-align:center;">
                            <div style="font-size:24px;font-weight:800;color:#8B5CF6;">${c.totalLessons}</div>
                            <div style="font-size:11px;color:#6B7280;">${labels.lessons}</div>
                        </td>
                        <td style="padding:8px 4px;text-align:center;">
                            <div style="font-size:24px;font-weight:800;color:#EF4444;">🔥 ${c.streak}</div>
                            <div style="font-size:11px;color:#6B7280;">${labels.streak}</div>
                        </td>
                    </tr>
                </table>
            </div>`;
        }

        const html = `<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
        <img src="https://www.speakli.co.il/images/speakli-icon.webp" alt="Speakli" style="width:64px;height:64px;border-radius:16px;" />
        <h1 style="font-size:22px;color:#1F2937;margin:12px 0 4px;">${title}</h1>
        <p style="color:#6B7280;font-size:14px;margin:0;">${labels.greeting} ${labels.summary}</p>
    </div>
    ${childrenHtml}
    <div style="text-align:center;margin-top:24px;">
        <a href="https://www.speakli.co.il" style="display:inline-block;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:white;padding:14px 36px;border-radius:14px;font-weight:700;font-size:16px;text-decoration:none;">${labels.cta}</a>
    </div>
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:24px;">Speakli — Learn English the fun way</p>
</div>
</body></html>`;

        // Send via Brevo API
        try {
            const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': BREVO_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: { name: 'Speakli', email: 'report@speakli.co.il' },
                    to: [{ email }],
                    subject: title,
                    htmlContent: html,
                }),
            });
            if (resp.ok) results.sent++;
            else {
                results.failed++;
                console.error('Brevo error:', await resp.text());
            }
        } catch (e) {
            results.failed++;
            console.error('Brevo send error:', e.message);
        }
    }

    return results;
}

module.exports = async function handler(req, res) {
    // No CORS needed — this is a server-only cron endpoint
    if (req.method === 'OPTIONS') return res.status(200).end();

    // Require CRON_SECRET — fail closed (reject if not configured)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers['authorization'];
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const db = getFirestoreAdmin();
        const results = { pushesSent: 0, pushesFailed: 0, staleRemoved: 0, errors: [] };

        // ── Weekly report on Sundays ──
        const dayOfWeek = new Date().getDay(); // 0 = Sunday
        if (dayOfWeek === 0) {
            try {
                results.weeklyReport = await sendWeeklyReports(db);
            } catch (e) {
                results.weeklyReport = { error: e.message };
                console.error('Weekly report error:', e);
            }
        }

        // Get all push subscriptions
        const subsSnapshot = await db.collection('push-subscriptions').get();
        if (subsSnapshot.empty) {
            return res.status(200).json({ success: true, message: 'No subscriptions', ...results });
        }

        webpush.setVapidDetails(
            (process.env.VAPID_SUBJECT || 'mailto:support@speakeasy.co.il').trim(),
            (process.env.VAPID_PUBLIC_KEY || '').trim(),
            (process.env.VAPID_PRIVATE_KEY || '').trim()
        );

        const today = new Date().toISOString().split('T')[0];

        for (const subDoc of subsSnapshot.docs) {
            const subData = subDoc.data();
            const lang = subData.language || 'he';
            const msgs = REMINDER_MESSAGES[lang] || REMINDER_MESSAGES.he;
            const userId = subData.userId;

            // Check today's speaking minutes if userId available
            let message = msgs.default;
            if (userId) {
                try {
                    const activityRef = db.collection('users').doc(userId).collection('dailyActivity').doc(today);
                    const actSnap = await activityRef.get();
                    const minutes = actSnap.exists ? (actSnap.data().minutes || 0) : 0;
                    if (minutes >= 5) {
                        // Goal met — skip notification
                        results.skippedGoalMet = (results.skippedGoalMet || 0) + 1;
                        continue;
                    } else if (minutes > 0) {
                        const remaining = Math.ceil(5 - minutes);
                        message = { title: msgs.partial.title, body: msgs.partial.body.replace('{remaining}', remaining) };
                    } else {
                        message = msgs.zero;
                    }
                } catch (e) {
                    // Fallback to default message
                }
            }

            const pushPayload = JSON.stringify({
                title: message.title,
                body: message.body,
                lang: lang,
                tag: 'daily-reminder'
            });

            if (!subData.endpoint || !subData.keys?.p256dh || !subData.keys?.auth) {
                results.pushesFailed++;
                results.errors.push({ subId: subDoc.id, error: 'Malformed subscription (missing endpoint or keys)' });
                continue;
            }

            const pushSubscription = {
                endpoint: subData.endpoint,
                keys: { p256dh: subData.keys.p256dh, auth: subData.keys.auth }
            };

            try {
                await webpush.sendNotification(pushSubscription, pushPayload);
                results.pushesSent++;
            } catch (pushError) {
                if (pushError.statusCode === 410 || pushError.statusCode === 404) {
                    await subDoc.ref.delete();
                    results.staleRemoved++;
                } else {
                    results.pushesFailed++;
                    results.errors.push({ subId: subDoc.id, error: pushError.message });
                }
            }
        }

        return res.status(200).json({ success: true, timestamp: new Date().toISOString(), ...results });
    } catch (error) {
        console.error('Daily reminder push error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
