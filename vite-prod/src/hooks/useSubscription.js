import { useMemo } from 'react';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { FREE_LIMITS } from '../data/subscription-plans.js';

// Features that are always free (no limit)
const ALWAYS_FREE = new Set([
  'lessons', 'vocabulary', 'alphabet', 'reading', 'kidsGames',
]);

export default function useSubscription() {
  const { progress, isChildMode } = useUserProgress();

  return useMemo(() => {
    const sub = progress.subscription || {};
    const plan = sub.plan || 'free';
    const status = sub.status || 'none';
    const isPremium = (plan === 'personal' || plan === 'family') && (status === 'active' || status === 'trialing');
    const isFamily = plan === 'family' && isPremium;

    const canAccess = (feature) => {
      if (isPremium) return true;
      if (ALWAYS_FREE.has(feature)) return true;
      // Free tier — features with limits are accessible (limits checked by useUsageLimit)
      return feature in FREE_LIMITS;
    };

    return {
      plan,
      status,
      isPremium,
      isFamily,
      expiresAt: sub.currentPeriodEnd || null,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
      canAccess,
    };
  }, [progress.subscription, isChildMode]);
}
