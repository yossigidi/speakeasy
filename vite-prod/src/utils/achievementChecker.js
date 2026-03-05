/**
 * Achievement Checker Utility
 *
 * Maps achievement condition types from achievements.json to actual progress fields.
 * The `checkAchievements` function compares current progress against all achievement
 * conditions and returns IDs of newly unlocked achievements.
 *
 * Progress field mapping (achievement condition type -> progress field):
 *   lessonsCompleted       -> totalLessonsCompleted
 *   perfectLesson          -> perfectLessons
 *   wordsLearned           -> totalWordsLearned
 *   vocabReviews           -> vocabReviews
 *   streak                 -> streak (or longestStreak)
 *   conversationsCompleted -> conversationsCompleted
 *   pronunciationExercises -> pronunciationExercises
 *   pronunciationScore     -> pronunciationHighScore
 *   pronunciationStreak    -> pronunciationStreak
 *   totalXP                -> xp
 *   dailyGoalStreak        -> dailyGoalStreak
 *   storiesRead            -> storiesRead
 *   cefrLevel              -> cefrLevel
 *   unitsCompleted         -> (computed from curriculum.units)
 *   lateNightLesson        -> lateNightLessons
 *   earlyMorningLesson     -> earlyMorningLessons
 *   adventureScenesCompleted -> (handled by adventure game)
 *   adventureWorldCompleted  -> (handled by adventure game)
 *   adventureCoins           -> (handled by adventure game)
 *   allScenarios             -> (computed from simulation.completedScenarios)
 */

import achievementsData from '../data/achievements.json';

// CEFR level ordering for comparison
const CEFR_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

// Adventure achievements are handled by the adventure game's own _checkAchievements
const ADVENTURE_TYPES = new Set([
  'adventureScenesCompleted',
  'adventureWorldCompleted',
  'adventureCoins',
]);

/**
 * Compute the total number of completed units from the curriculum object.
 */
function countCompletedUnits(curriculum) {
  if (!curriculum || !curriculum.units) return 0;
  return Object.values(curriculum.units).filter(u => u.completed).length;
}

/**
 * Compute the total number of completed simulation scenarios.
 */
function countCompletedScenarios(simulation) {
  if (!simulation || !simulation.completedScenarios) return 0;
  return Object.keys(simulation.completedScenarios).length;
}

/**
 * Evaluate a single achievement condition against progress.
 * Returns true if the condition is met.
 */
function evaluateCondition(condition, progress) {
  const { type, value } = condition;

  switch (type) {
    case 'lessonsCompleted': {
      // Count lessons from all sources: top-level + curriculum + skills
      const topLevel = progress.totalLessonsCompleted || 0;
      const curriculumLessons = progress.curriculum?.totalLessonsCompleted || 0;
      const skillsLessons = progress.skills?.totalLessonsCompleted || 0;
      // Use the maximum of top-level or sum of sub-systems
      const total = Math.max(topLevel, curriculumLessons + skillsLessons);
      return total >= value;
    }

    case 'perfectLesson':
      return (progress.perfectLessons || 0) >= value;

    case 'wordsLearned':
      return (progress.totalWordsLearned || 0) >= value;

    case 'vocabReviews':
      return (progress.vocabReviews || 0) >= value;

    case 'streak':
      // Use the higher of current or longest streak
      return Math.max(progress.streak || 0, progress.longestStreak || 0) >= value;

    case 'conversationsCompleted':
      return (progress.conversationsCompleted || 0) >= value;

    case 'pronunciationExercises':
      return (progress.pronunciationExercises || 0) >= value;

    case 'pronunciationScore':
      return (progress.pronunciationHighScore || 0) >= value;

    case 'pronunciationStreak':
      return (progress.pronunciationStreak || 0) >= value;

    case 'totalXP':
      return (progress.xp || 0) >= value;

    case 'dailyGoalStreak':
      return (progress.dailyGoalStreak || 0) >= value;

    case 'storiesRead':
      return (progress.storiesRead || 0) >= value;

    case 'cefrLevel':
      return (CEFR_ORDER[progress.cefrLevel] || 0) >= (CEFR_ORDER[value] || 0);

    case 'unitsCompleted':
      return countCompletedUnits(progress.curriculum) >= value;

    case 'lateNightLesson':
      return (progress.lateNightLessons || 0) >= value;

    case 'earlyMorningLesson':
      return (progress.earlyMorningLessons || 0) >= value;

    case 'allScenarios':
      // There are 7 defined scenarios in the simulation page
      return countCompletedScenarios(progress.simulation) >= 7;

    // Adventure types are handled separately by the adventure game engine
    case 'adventureScenesCompleted':
    case 'adventureWorldCompleted':
    case 'adventureCoins':
      return false;

    default:
      return false;
  }
}

/**
 * Check all achievements against the current progress.
 * Returns an array of achievement IDs that are newly unlocked.
 *
 * @param {Object} progress - The user's progress object
 * @param {Set<string>} unlockedSet - Set of already-unlocked achievement IDs
 * @returns {string[]} Array of newly unlocked achievement IDs
 */
export function checkAchievements(progress, unlockedSet) {
  const newlyUnlocked = [];

  for (const achievement of achievementsData) {
    // Skip already unlocked
    if (unlockedSet.has(achievement.id)) continue;

    // Skip adventure achievements (handled by adventure game)
    if (ADVENTURE_TYPES.has(achievement.condition?.type)) continue;

    // Evaluate
    if (achievement.condition && evaluateCondition(achievement.condition, progress)) {
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
}
