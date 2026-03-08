import useSubscription from './useSubscription.js';
import { CONTENT_LIMITS } from '../data/subscription-plans.js';

export default function useContentGate() {
  const { isPremium } = useSubscription();

  const isLocked = (feature, index) => {
    if (isPremium) return false;
    const limit = CONTENT_LIMITS[feature];
    if (limit === undefined) return false;
    return index >= limit;
  };

  return { isPremium, isLocked };
}
