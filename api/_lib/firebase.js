import admin from 'firebase-admin';

let db = null;

export function getFirestore() {
  if (db) return db;

  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }
  db = admin.firestore();
  return db;
}
