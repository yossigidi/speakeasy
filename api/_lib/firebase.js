import admin from 'firebase-admin';

let db = null;

function ensureApp() {
  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }
}

export function getFirestore() {
  if (db) return db;
  ensureApp();
  db = admin.firestore();
  return db;
}

export async function getAccessToken() {
  ensureApp();
  const token = await admin.app().options.credential.getAccessToken();
  return token.access_token;
}
