// Speakli Daily Reminder + Weekly Parent Report
// Vercel Serverless Function - Cron Job
// Runs daily at 6:00 UTC (8:00 AM Israel time)
// On Sundays, also sends weekly progress email to parents via Brevo

const admin = require('firebase-admin');
const webpush = require('web-push');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function getAIInsight(childSummary, lang) {
    const GROQ_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_KEY) return null;

    const langName = lang === 'he' ? 'Hebrew' : lang === 'ar' ? 'Arabic' : lang === 'ru' ? 'Russian' : 'English';
    const prompt = `You are an educational AI assistant for Speakli, an English learning app for children.
Based on this child's weekly progress, write a SHORT (2-3 sentences) personalized insight for the parent in ${langName}.

Child: ${childSummary.name}
Level: ${childSummary.level}
Weekly XP: ${childSummary.weekXP}
Active days: ${childSummary.activeDays}/7
Words learned (total): ${childSummary.totalWords}
Lessons completed (total): ${childSummary.totalLessons}
Current streak: ${childSummary.streak} days
Recent words: ${(childSummary.recentWords || []).join(', ') || 'N/A'}

Rules:
- Be warm, encouraging, and specific
- If active: praise what they did well, suggest what to focus on next
- If inactive: gently encourage without guilt
- Mention specific data points (e.g. "5 active days is great!")
- Keep it SHORT — max 2-3 sentences
- Write ONLY in ${langName}`;

    try {
        const resp = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 200,
            }),
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        return data?.choices?.[0]?.message?.content?.trim() || null;
    } catch (_) { return null; }
}

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
    const BREVO_KEY = process.env.BREVO_API_KEY_speakli || process.env.BREVO_API_KEY;
    if (!BREVO_KEY) return { sent: 0, error: 'No BREVO_API_KEY configured' };

    const results = { sent: 0, failed: 0, skipped: 0, sentTo: [], skippedDetails: [] };

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
        // Try Firestore email first, fallback to Firebase Auth email
        let email = userData.email;
        if (!email) {
            try {
                const authUser = await admin.auth().getUser(userDoc.id);
                email = authUser.email;
            } catch (_) {}
        }
        if (!email) { results.skipped++; results.skippedDetails.push({ uid: userDoc.id, reason: 'no email' }); continue; }

        const childrenIds = userData.childrenIds || [];
        if (!childrenIds.length) { results.skipped++; results.skippedDetails.push({ uid: userDoc.id, email, reason: 'no children' }); continue; }

        const lang = userData.uiLang || 'he';
        const childSummaries = [];

        for (const childId of childrenIds) {
            try {
                const childDoc = await db.collection('childProfiles').doc(childId).get();
                if (!childDoc.exists) continue;
                const child = childDoc.data();

                // Fetch weekly activity (per day for chart)
                let weekXP = 0, weekMinutes = 0, activeDays = 0;
                const dailyXPs = [];
                for (const date of days) {
                    try {
                        const actSnap = await db.collection('childProfiles').doc(childId)
                            .collection('dailyActivity').doc(date).get();
                        if (actSnap.exists) {
                            const act = actSnap.data();
                            const dayXP = act.xp || 0;
                            weekXP += dayXP;
                            weekMinutes += act.minutes || 0;
                            if (dayXP > 0) activeDays++;
                            dailyXPs.push(dayXP);
                        } else {
                            dailyXPs.push(0);
                        }
                    } catch (_) { dailyXPs.push(0); }
                }

                // Fetch recent learned words (last 10)
                let recentWords = [];
                try {
                    const wordsSnap = await db.collection('childProfiles').doc(childId)
                        .collection('learnedWords').orderBy('learnedAt', 'desc').limit(10).get();
                    recentWords = wordsSnap.docs.map(d => d.data().word || d.id);
                } catch (_) {}

                childSummaries.push({
                    name: child.name || 'ילד',
                    avatar: child.avatar || '👧',
                    weekXP,
                    weekMinutes: Math.round(weekMinutes),
                    activeDays,
                    dailyXPs,
                    totalWords: child.totalWordsLearned || 0,
                    totalLessons: child.totalLessonsCompleted || 0,
                    streak: child.streak || 0,
                    level: child.curriculumLevel || child.childLevel || 1,
                    recentWords,
                });
            } catch (_) {}
        }

        if (!childSummaries.length) { results.skipped++; results.skippedDetails.push({ uid: userDoc.id, email, reason: 'no child summaries' }); continue; }

        // Generate AI insights for each child (in parallel)
        const aiLabel = lang === 'he' ? 'המלצת AI' : lang === 'ar' ? 'توصية AI' : lang === 'ru' ? 'Рекомендация AI' : 'AI Insight';
        await Promise.all(childSummaries.map(async (c) => {
            try {
                c.aiInsight = await getAIInsight(c, lang);
            } catch (_) { c.aiInsight = null; }
        }));

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

        // Day labels for chart
        const dayLabelsHe = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];
        const dayLabelsEn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const dayLabelsAr = ['أحد','إثن','ثلا','أرب','خمي','جمع','سبت'];
        const dayLabelsRu = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
        const dayLbls = lang === 'he' ? dayLabelsHe : lang === 'ar' ? dayLabelsAr : lang === 'ru' ? dayLabelsRu : dayLabelsEn;
        // Map days array to day-of-week labels
        const chartLabels = days.map(d => dayLbls[new Date(d).getDay()]);

        // Date range for header
        const dateRange = `${days[0]} — ${days[6]}`;

        let childrenHtml = '';
        for (const c of childSummaries) {
            if (c.weekXP === 0 && c.activeDays === 0) {
                childrenHtml += `<div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:16px;border:1px solid #E5E7EB;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                        <div style="font-size:32px;">${c.avatar}</div>
                        <div>
                            <div style="font-size:16px;font-weight:700;color:#111827;">${c.name}</div>
                            <div style="font-size:12px;color:#9CA3AF;">${labels.level} ${c.level}</div>
                        </div>
                    </div>
                    <div style="background:#FEF2F2;border-radius:8px;padding:16px;text-align:center;">
                        <p style="color:#6B7280;font-size:14px;margin:0;">${labels.noActivity}</p>
                    </div>
                    ${c.aiInsight ? `<div style="border-top:1px solid #E5E7EB;margin-top:16px;padding-top:16px;">
                        <div style="font-size:11px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${aiLabel}</div>
                        <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;">${c.aiInsight}</p>
                    </div>` : ''}
                </div>`;
                continue;
            }

            // Build daily activity bar chart
            const maxXP = Math.max(...c.dailyXPs, 1);
            let barChartHtml = '<table style="width:100%;border-collapse:collapse;"><tr style="vertical-align:bottom;">';
            for (let i = 0; i < 7; i++) {
                const h = Math.max(Math.round((c.dailyXPs[i] / maxXP) * 60), c.dailyXPs[i] > 0 ? 6 : 3);
                const color = c.dailyXPs[i] > 0 ? '#6366F1' : '#E5E7EB';
                barChartHtml += `<td style="text-align:center;width:14.28%;padding:0 2px;"><div style="background:${color};width:100%;height:${h}px;border-radius:4px 4px 0 0;"></div></td>`;
            }
            barChartHtml += '</tr><tr>';
            for (let i = 0; i < 7; i++) {
                barChartHtml += `<td style="text-align:center;font-size:10px;color:#9CA3AF;padding-top:4px;">${chartLabels[i]}</td>`;
            }
            barChartHtml += '</tr></table>';

            // Progress bars: words, lessons, consistency
            const wordsPct = Math.min(Math.round((c.totalWords / Math.max(c.totalWords, 50)) * 100), 100);
            const lessonsPct = Math.min(Math.round((c.totalLessons / Math.max(c.totalLessons, 20)) * 100), 100);
            const consistencyPct = Math.round((c.activeDays / 7) * 100);

            childrenHtml += `<div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:16px;border:1px solid #E5E7EB;">
                <!-- Child header -->
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #F3F4F6;">
                    <div style="font-size:32px;">${c.avatar}</div>
                    <div style="flex:1;">
                        <div style="font-size:16px;font-weight:700;color:#111827;">${c.name}</div>
                        <div style="font-size:12px;color:#9CA3AF;">${labels.level} ${c.level} · ${labels.streak}: ${c.streak}</div>
                    </div>
                    <div style="text-align:center;background:#F0FDF4;border-radius:8px;padding:8px 12px;">
                        <div style="font-size:20px;font-weight:800;color:#059669;">${c.weekXP}</div>
                        <div style="font-size:9px;color:#6B7280;text-transform:uppercase;">${labels.xp}</div>
                    </div>
                </div>

                <!-- Key metrics row -->
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                    <tr>
                        <td style="width:33%;text-align:center;padding:8px 0;">
                            <div style="font-size:22px;font-weight:800;color:#111827;">${c.activeDays}<span style="font-size:13px;color:#9CA3AF;">/7</span></div>
                            <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.3px;">${labels.activeDays}</div>
                        </td>
                        <td style="width:33%;text-align:center;padding:8px 0;border-left:1px solid #F3F4F6;border-right:1px solid #F3F4F6;">
                            <div style="font-size:22px;font-weight:800;color:#111827;">${c.totalWords}</div>
                            <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.3px;">${labels.words}</div>
                        </td>
                        <td style="width:33%;text-align:center;padding:8px 0;">
                            <div style="font-size:22px;font-weight:800;color:#111827;">${c.totalLessons}</div>
                            <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.3px;">${labels.lessons}</div>
                        </td>
                    </tr>
                </table>

                <!-- Daily activity chart -->
                <div style="margin-bottom:20px;">
                    <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${lang === 'he' ? 'פעילות יומית' : lang === 'ar' ? 'النشاط اليومي' : lang === 'ru' ? 'Ежедневная активность' : 'Daily Activity'}</div>
                    ${barChartHtml}
                </div>

                <!-- Progress bars -->
                <div style="margin-bottom:16px;">
                    <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">${lang === 'he' ? 'התקדמות' : lang === 'ar' ? 'التقدم' : lang === 'ru' ? 'Прогресс' : 'Progress'}</div>

                    <div style="margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                            <span style="font-size:11px;color:#6B7280;">${labels.words}</span>
                            <span style="font-size:11px;font-weight:600;color:#374151;">${c.totalWords}</span>
                        </div>
                        <div style="background:#F3F4F6;border-radius:99px;height:6px;overflow:hidden;">
                            <div style="background:#6366F1;height:100%;width:${wordsPct}%;border-radius:99px;"></div>
                        </div>
                    </div>

                    <div style="margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                            <span style="font-size:11px;color:#6B7280;">${labels.lessons}</span>
                            <span style="font-size:11px;font-weight:600;color:#374151;">${c.totalLessons}</span>
                        </div>
                        <div style="background:#F3F4F6;border-radius:99px;height:6px;overflow:hidden;">
                            <div style="background:#10B981;height:100%;width:${lessonsPct}%;border-radius:99px;"></div>
                        </div>
                    </div>

                    <div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                            <span style="font-size:11px;color:#6B7280;">${lang === 'he' ? 'עקביות' : lang === 'ar' ? 'الاتساق' : lang === 'ru' ? 'Стабильность' : 'Consistency'}</span>
                            <span style="font-size:11px;font-weight:600;color:#374151;">${c.activeDays}/7</span>
                        </div>
                        <div style="background:#F3F4F6;border-radius:99px;height:6px;overflow:hidden;">
                            <div style="background:#F59E0B;height:100%;width:${consistencyPct}%;border-radius:99px;"></div>
                        </div>
                    </div>
                </div>

                <!-- AI Insight -->
                ${c.aiInsight ? `<div style="border-top:1px solid #E5E7EB;margin-top:16px;padding-top:16px;">
                    <div style="font-size:11px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${aiLabel}</div>
                    <p style="font-size:13px;color:#374151;margin:0;line-height:1.7;">${c.aiInsight}</p>
                </div>` : ''}
            </div>`;
        }

        const html = `<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <!-- Header -->
    <table style="width:100%;margin-bottom:28px;">
        <tr>
            <td style="width:48px;"><img src="https://www.speakli.co.il/images/speakli-icon.webp" alt="Speakli" style="width:40px;height:40px;border-radius:10px;" /></td>
            <td style="padding-${dir === 'rtl' ? 'right' : 'left'}:12px;">
                <div style="font-size:18px;font-weight:700;color:#111827;">${title}</div>
                <div style="font-size:12px;color:#9CA3AF;">${dateRange}</div>
            </td>
        </tr>
    </table>

    ${childrenHtml}

    <!-- CTA -->
    <div style="text-align:center;margin-top:28px;">
        <a href="https://www.speakli.co.il" style="display:inline-block;background:#111827;color:white;padding:14px 40px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;">${labels.cta}</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #E5E7EB;">
        <p style="font-size:11px;color:#9CA3AF;margin:0;">Speakli — Learn English the fun way</p>
        <p style="font-size:10px;color:#D1D5DB;margin:6px 0 0;">${lang === 'he' ? 'מייל זה נשלח אוטומטית מ-Speakli' : lang === 'ar' ? 'تم إرسال هذا البريد تلقائياً من Speakli' : lang === 'ru' ? 'Это письмо отправлено автоматически от Speakli' : 'This email was sent automatically by Speakli'}</p>
    </div>
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
            if (resp.ok) { results.sent++; results.sentTo.push({ email, children: childSummaries.map(c => ({ name: c.name, weekXP: c.weekXP, activeDays: c.activeDays, weekMinutes: c.weekMinutes, totalWords: c.totalWords, streak: c.streak })) }); }
            else {
                results.failed++;
                const errText = await resp.text();
                results.sentTo.push({ email, error: errText });
                console.error('Brevo error:', errText);
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
    const cronSecret = process.env.SPEAKLI_CRON_SECRET || process.env.CRON_SECRET;
    const authHeader = req.headers['authorization'];
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const db = getFirestoreAdmin();
        const results = { pushesSent: 0, pushesFailed: 0, staleRemoved: 0, errors: [] };

        // ── Weekly report on Sundays (or forced via ?test=weekly) ──
        const forceWeekly = req.query?.test === 'weekly';
        const dayOfWeek = new Date().getDay(); // 0 = Sunday
        if (dayOfWeek === 0 || forceWeekly) {
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
