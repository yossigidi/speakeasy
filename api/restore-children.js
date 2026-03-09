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

    let childrenIds = [];

    // 1. Try childProfiles collection (primary)
    const childSnaps = await db.collection('childProfiles')
      .where('parentUid', '==', uid)
      .get();

    if (!childSnaps.empty) {
      childrenIds = childSnaps.docs.map(d => d.id);
    }

    // 2. Fallback: check parentChildren collection
    if (childrenIds.length === 0) {
      const pcSnaps = await db.collection('parentChildren')
        .where('parentUid', '==', uid)
        .get();

      if (!pcSnaps.empty) {
        const pcData = pcSnaps.docs[0].data();
        if (pcData.children && pcData.children.length > 0) {
          childrenIds = pcData.children.map(c => c.childId).filter(Boolean);
        }
      }
    }

    if (childrenIds.length === 0) {
      return res.json({ message: 'No children found for this user', childrenIds: [] });
    }

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
