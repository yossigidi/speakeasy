// Speakli Daily Learning Reminder Push API
// Vercel Serverless Function - Cron Job
// Runs daily at 6:00 UTC (8:00 AM Israel time)

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
