import { handleCors } from '../lib/cors.js';
import { getFirestore } from '../lib/firebase.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { familyCode, childId, childName, pin } = req.body || {};

    if (!familyCode || !childId || !childName || !pin) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const db = getFirestore();

    // Read child profile (Admin SDK bypasses security rules)
    const childDoc = await db.collection('childProfiles').doc(childId).get();
    if (!childDoc.exists) {
      return res.status(404).json({ error: 'invalidPin' });
    }

    const childData = childDoc.data();

    // Verify the child belongs to the given family code
    if (childData.familyCode && childData.familyCode !== familyCode.toUpperCase()) {
      return res.status(403).json({ error: 'invalidPin' });
    }

    // Compute PIN hash (same algorithm as client)
    const normalized = childName.trim().toLowerCase();
    const data = normalized + pin + familyCode.toUpperCase();
    const hash = crypto.createHash('sha256').update(data, 'utf8').digest('hex');

    if (hash !== childData.pinHash) {
      return res.status(403).json({ error: 'invalidPin' });
    }

    // Success — return child session data
    return res.status(200).json({
      success: true,
      child: {
        childId,
        name: childData.name,
        avatar: childData.avatar,
        avatarColor: childData.avatarColor,
        age: childData.age,
        parentUid: childData.parentUid,
        familyCode: familyCode.toUpperCase(),
      },
    });
  } catch (error) {
    console.error('child-login error:', error);
    return res.status(500).json({ error: 'serverError' });
  }
}
