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
  simulationBase: 20,
  simulationMax: 60,
  simulationPerfectBonus: 30,
  careerPromotion: 100,
  speakingCoachBase: 25,
  speakingCoachMax: 70,
  speakingCoachPerfectBonus: 40,
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

export function calcSimulationXP(avgScore, stepCount) {
  // avgScore: 0-100, stepCount: number of completed steps
  const scoreRatio = avgScore / 100;
  const base = XP_REWARDS.simulationBase + Math.round(scoreRatio * (XP_REWARDS.simulationMax - XP_REWARDS.simulationBase));
  const stepsBonus = Math.min(stepCount * 2, 10);
  const perfectBonus = avgScore >= 90 ? XP_REWARDS.simulationPerfectBonus : 0;
  const total = base + stepsBonus + perfectBonus;
  return { base, stepsBonus, perfectBonus, total };
}

export function calcSpeakingCoachXP(avgScore, turnCount) {
  const scoreRatio = avgScore / 100;
  const base = XP_REWARDS.speakingCoachBase + Math.round(scoreRatio * (XP_REWARDS.speakingCoachMax - XP_REWARDS.speakingCoachBase));
  const turnsBonus = Math.min(turnCount * 3, 15);
  const perfectBonus = avgScore >= 90 ? XP_REWARDS.speakingCoachPerfectBonus : 0;
  return { base, turnsBonus, perfectBonus, total: base + turnsBonus + perfectBonus };
}
