import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { getToday, isYesterday } from '../utils/dateUtils.js';

export default function useStreak() {
  const { progress } = useUserProgress();

  const isActiveToday = progress.lastActiveDate === getToday();
  const isAtRisk = !isActiveToday && progress.streak > 0 && isYesterday(progress.lastActiveDate);
  const hasFreezes = (progress.streakFreezes || 0) > 0;

  // Milestone checks
  const milestones = [7, 30, 100, 365];
  const nextMilestone = milestones.find(m => m > progress.streak) || null;
  const daysToMilestone = nextMilestone ? nextMilestone - progress.streak : 0;

  return {
    streak: progress.streak,
    longestStreak: progress.longestStreak,
    isActiveToday,
    isAtRisk,
    hasFreezes,
    freezeCount: progress.streakFreezes || 0,
    nextMilestone,
    daysToMilestone,
  };
}
