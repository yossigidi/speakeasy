import { useMemo } from 'react';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { FREE_LIMITS } from '../data/subscription-plans.js';

// Features that are always free (no limit) — content gating handled by CONTENT_LIMITS
const ALWAYS_FREE = new Set([]);

// Users created before this date get full access (grandfathered)
const FREEMIUM_CUTOFF = new Date('2026-03-08T00:00:00Z');

export default function useSubscription() {
  const { progress, isChildMode } = useUserProgress();

  return useMemo(() => {
    try {
      const sub = progress?.subscription || {};
      const plan = sub.plan || 'free';
      const status = sub.status || 'none';
      const hasPaidPlan = (plan === 'personal' || plan === 'family') && (status === 'active' || status === 'trialing');

      // Grandfather existing users: accounts created before freemium cutoff get premium
      let isGrandfathered = false;
      try {
        if (progress?.createdAt) {
          const created = progress.createdAt.toDate ? progress.createdAt.toDate() : new Date(progress.createdAt);
          isGrandfathered = created < FREEMIUM_CUTOFF;
        }
      } catch { /* ignore date parsing errors */ }

      const isPremium = hasPaidPlan || isGrandfathered;
      const isFamily = plan === 'family' && hasPaidPlan;

      const canAccess = (feature) => {
        if (isPremium) return true;
        if (ALWAYS_FREE.has(feature)) return true;
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
    } catch {
      // Fallback: treat as free user
      return {
        plan: 'free',
        status: 'none',
        isPremium: false,
        isFamily: false,
        expiresAt: null,
        cancelAtPeriodEnd: false,
        canAccess: (feature) => feature in FREE_LIMITS,
      };
    }
  }, [progress?.subscription, isChildMode]);
}
