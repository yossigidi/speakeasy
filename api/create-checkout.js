import Stripe from 'stripe';
import admin from 'firebase-admin';
import { handleCors } from '../lib/cors.js';
import { getFirestore } from '../lib/firebase.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  personal_month: process.env.STRIPE_PRICE_PERSONAL_MONTHLY,
  personal_year: process.env.STRIPE_PRICE_PERSONAL_ANNUAL,
  family_month: process.env.STRIPE_PRICE_FAMILY_MONTHLY,
  family_year: process.env.STRIPE_PRICE_FAMILY_ANNUAL,
};

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

  const { plan, interval, promoCode } = req.body;
  if (!['personal', 'family'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }
  if (!['month', 'year'].includes(interval)) {
    return res.status(400).json({ error: 'Invalid interval' });
  }

  const priceId = PRICE_IDS[`${plan}_${interval}`];
  if (!priceId) return res.status(400).json({ error: 'Price not configured' });

  const db = getFirestore();
  const userRef = db.collection('users').doc(user.uid);
  const userDoc = await userRef.get();
  const userData = userDoc.data() || {};

  // Get or create Stripe customer
  let customerId = userData.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { firebaseUid: user.uid },
    });
    customerId = customer.id;
    await userRef.set({ stripeCustomerId: customerId }, { merge: true });
  }

  // Look up promotion code if provided
  let discounts;
  if (promoCode) {
    try {
      const promoCodes = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 });
      if (promoCodes.data.length > 0) {
        discounts = [{ promotion_code: promoCodes.data[0].id }];
      } else {
        return res.status(400).json({ error: 'Invalid promo code' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid promo code' });
    }
  }

  // Create Checkout Session
  const sessionParams = {
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.headers.origin || 'https://www.speakli.co.il'}/app?subscription=success`,
    cancel_url: `${req.headers.origin || 'https://www.speakli.co.il'}/app?subscription=canceled`,
    metadata: { firebaseUid: user.uid, plan },
    subscription_data: {
      metadata: { firebaseUid: user.uid, plan },
    },
  };
  if (discounts) sessionParams.discounts = discounts;
  else sessionParams.allow_promotion_codes = true;

  const session = await stripe.checkout.sessions.create(sessionParams);

  return res.status(200).json({ url: session.url });
}
