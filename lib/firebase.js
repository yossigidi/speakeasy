import admin from 'firebase-admin';

let db = null;

function ensureApp() {
  if (admin.apps.length === 0) {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e.message);
      serviceAccount = {};
    }
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
