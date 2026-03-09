import { handleCors } from '../lib/cors.js';
import admin from 'firebase-admin';
import { getFirestore } from '../lib/firebase.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    const db = getFirestore();

    // Verify the user's Firebase token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // Find all childProfiles where parentUid matches this user
    const childSnaps = await db.collection('childProfiles')
      .where('parentUid', '==', uid)
      .get();

    if (childSnaps.empty) {
      return res.json({ message: 'No child profiles found for this user', childrenIds: [] });
    }

    const childrenIds = childSnaps.docs.map(d => d.id);

    // Restore childrenIds on the user doc
    await db.doc(`users/${uid}`).set({ childrenIds }, { merge: true });

    return res.json({
      message: `Restored ${childrenIds.length} children`,
      childrenIds,
    });
  } catch (e) {
    console.error('restore-children error:', e);
    return res.status(500).json({ error: e.message });
  }
}
