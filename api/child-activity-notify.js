// Speakli - Notify parent when child starts/finishes learning
// POST /api/child-activity-notify
// Body: { parentUid, childName, event: 'start' | 'end', durationMinutes? }

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

const MESSAGES = {
    he: {
        start: (name) => ({ title: `Speakli — ${name} התחיל ללמוד! 📚`, body: `${name} נכנס/ה עכשיו ללמוד אנגלית` }),
        end: (name, mins) => ({ title: `Speakli — ${name} סיים ללמוד! ✅`, body: mins > 0 ? `${name} למד/ה ${mins} דקות. כל הכבוד!` : `${name} סיים/ה את הלמידה` }),
    },
    en: {
        start: (name) => ({ title: `Speakli — ${name} started learning! 📚`, body: `${name} just opened the app to learn English` }),
        end: (name, mins) => ({ title: `Speakli — ${name} finished learning! ✅`, body: mins > 0 ? `${name} studied for ${mins} minutes. Great job!` : `${name} finished their session` }),
    },
    ar: {
        start: (name) => ({ title: `Speakli — ${name} بدأ التعلم! 📚`, body: `${name} دخل الآن لتعلم الإنجليزية` }),
        end: (name, mins) => ({ title: `Speakli — ${name} أنهى التعلم! ✅`, body: mins > 0 ? `${name} تعلم ${mins} دقيقة. أحسنت!` : `${name} أنهى جلسة التعلم` }),
    },
    ru: {
        start: (name) => ({ title: `Speakli — ${name} начал учиться! 📚`, body: `${name} открыл приложение для изучения английского` }),
        end: (name, mins) => ({ title: `Speakli — ${name} закончил учиться! ✅`, body: mins > 0 ? `${name} занимался ${mins} минут. Молодец!` : `${name} завершил занятие` }),
    },
};

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { parentUid, childName, event, durationMinutes } = req.body || {};

    if (!parentUid || !childName || !event) {
        return res.status(400).json({ error: 'Missing parentUid, childName, or event' });
    }

    if (event !== 'start' && event !== 'end') {
        return res.status(400).json({ error: 'event must be "start" or "end"' });
    }

    try {
        const db = getFirestoreAdmin();

        // Get parent's push subscriptions
        const subsSnap = await db.collection('push-subscriptions')
            .where('userId', '==', parentUid)
            .get();

        if (subsSnap.empty) {
            return res.status(200).json({ success: true, sent: 0, reason: 'No push subscriptions for parent' });
        }

        // Set up web-push
        webpush.setVapidDetails(
            (process.env.VAPID_SUBJECT || 'mailto:support@speakeasy.co.il').trim(),
            (process.env.VAPID_PUBLIC_KEY || '').trim(),
            (process.env.VAPID_PRIVATE_KEY || '').trim()
        );

        let sent = 0;
        let staleRemoved = 0;

        for (const subDoc of subsSnap.docs) {
            const subData = subDoc.data();
            if (!subData.endpoint || !subData.keys) continue;

            const lang = subData.language || 'he';
            const msgs = MESSAGES[lang] || MESSAGES.en;
            const msg = event === 'start'
                ? msgs.start(childName)
                : msgs.end(childName, durationMinutes || 0);

            const payload = JSON.stringify({
                title: msg.title,
                body: msg.body,
                lang,
                tag: `child-activity-${event}`,
            });

            const pushSub = {
                endpoint: subData.endpoint,
                keys: { p256dh: subData.keys.p256dh, auth: subData.keys.auth },
            };

            try {
                await webpush.sendNotification(pushSub, payload);
                sent++;
            } catch (err) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await subDoc.ref.delete();
                    staleRemoved++;
                } else {
                    console.warn('Push send failed:', err.statusCode, err.message);
                }
            }
        }

        return res.status(200).json({ success: true, sent, staleRemoved });
    } catch (error) {
        console.error('child-activity-notify error:', error);
        return res.status(500).json({ error: 'Internal error' });
    }
};
