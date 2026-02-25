// XP Award Calculations

export const XP_REWARDS = {
  lessonBase: 10,
  lessonMax: 35,
  perfectLessonBonus: 50,
  vocabReviewBase: 2,
  vocabReviewMax: 5,
  conversation: 15,
  reading: 20,
  pronunciation: 3,
  dailyGoalBonus: 10,
  streakBonusPerDay: 2,
  streakBonusMax: 30,
};

export function calcLessonXP(accuracy, exerciseCount) {
  const base = XP_REWARDS.lessonBase;
  const bonus = Math.round((accuracy / 100) * (XP_REWARDS.lessonMax - base));
  const total = base + bonus;
  const perfectBonus = accuracy === 100 ? XP_REWARDS.perfectLessonBonus : 0;
  return { base: total, perfectBonus, total: total + perfectBonus };
}

export function calcVocabReviewXP(quality) {
  // quality 0-5, higher = more XP
  if (quality >= 4) return XP_REWARDS.vocabReviewMax;
  if (quality >= 3) return 3;
  return XP_REWARDS.vocabReviewBase;
}

export function calcStreakBonus(streakDays) {
  return Math.min(streakDays * XP_REWARDS.streakBonusPerDay, XP_REWARDS.streakBonusMax);
}

export function calcConversationXP(messageCount) {
  // Base XP + small bonus for longer conversations
  return XP_REWARDS.conversation + Math.min(Math.floor(messageCount / 5) * 3, 15);
}
