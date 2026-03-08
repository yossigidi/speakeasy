import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import useSubscription from './useSubscription.js';
import { FREE_LIMITS } from '../data/subscription-plans.js';

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function useUsageLimit(feature) {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = FREE_LIMITS[feature] ?? Infinity;

  useEffect(() => {
    if (isPremium || !user?.uid || !feature) {
      setUsed(0);
      setLoading(false);
      return;
    }

    const db = window.db;
    const firestore = window.firestore;
    if (!db || !firestore) { setLoading(false); return; }

    const todayKey = getTodayKey();
    const docRef = firestore.doc(db, 'users', user.uid, 'dailyActivity', todayKey);

    const unsub = firestore.onSnapshot(docRef, (snap) => {
      const data = snap.data();
      setUsed(data?.featureUsage?.[feature] || 0);
      setLoading(false);
    }, () => { setLoading(false); });

    return unsub;
  }, [user?.uid, feature, isPremium]);

  const increment = useCallback(async () => {
    if (isPremium || !user?.uid || !feature) return;
    const db = window.db;
    const firestore = window.firestore;
    if (!db || !firestore) return;

    const todayKey = getTodayKey();
    const docRef = firestore.doc(db, 'users', user.uid, 'dailyActivity', todayKey);
    await firestore.setDoc(docRef, {
      featureUsage: { [feature]: firestore.increment(1) },
    }, { merge: true });
  }, [user?.uid, feature, isPremium]);

  const remaining = isPremium ? Infinity : Math.max(0, limit - used);
  const isBlocked = !isPremium && used >= limit;

  return { used, limit, remaining, isBlocked, loading, increment };
}
