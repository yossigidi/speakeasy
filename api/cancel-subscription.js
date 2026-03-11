import Stripe from 'stripe';
import admin from 'firebase-admin';
import { handleCors } from '../lib/cors.js';
import { getFirestore } from '../lib/firebase.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function ensureApp() {
  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  }
}

async function verifyAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    ensureApp();
    return await admin.auth().verifyIdToken(token);
  } catch { return null; }
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuth(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const db = getFirestore();
  const userDoc = await db.collection('users').doc(user.uid).get();
  const userData = userDoc.data() || {};
  const subId = userData.subscription?.stripeSubscriptionId;

  if (!subId) {
    return res.status(400).json({ error: 'No active subscription found' });
  }

  // Cancel at end of billing period (not immediately)
  await stripe.subscriptions.update(subId, { cancel_at_period_end: true });

  // Update Firestore
  await db.collection('users').doc(user.uid).update({
    'subscription.cancelAtPeriodEnd': true,
  });

  return res.status(200).json({ success: true });
}
