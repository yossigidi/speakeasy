import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getLevel, calculateXP } from '../data/curriculum/curriculum-index.js';

const DEFAULT_CURRICULUM = {
  currentLevel: 1,
  lessons: {},
  units: {},
  unlockedLevels: [1],
  totalStars: 0,
  totalLessonsCompleted: 0,
};

export default function useCurriculumProgress() {
  const { user } = useAuth();
  const { progress, updateProgress, activeChildId, addXP } = useUserProgress();

  const curriculum = progress.curriculum || DEFAULT_CURRICULUM;

  // Check if a lesson is unlocked
  function isLessonUnlocked(lessonId, levelId) {
    // Already completed lessons are always accessible
    if (curriculum.lessons[lessonId]?.completed) return true;

    const level = getLevel(levelId);
    if (!level) return false;

    // Level must be unlocked
    const unlockedLevels = curriculum.unlockedLevels || [1];
    if (!unlockedLevels.includes(levelId)) return false;

    // Find which unit and lesson index this lessonId belongs to
    for (let ui = 0; ui < level.units.length; ui++) {
      const unit = level.units[ui];
      for (let li = 0; li < unit.lessons.length; li++) {
        if (unit.lessons[li].id === lessonId) {
          // First lesson of first unit → always unlocked
          if (ui === 0 && li === 0) return true;

          // First lesson of a subsequent unit → unlocked if previous unit's last lesson (test) is completed
          if (li === 0 && ui > 0) {
            const prevUnit = level.units[ui - 1];
            const prevTestId = prevUnit.lessons[prevUnit.lessons.length - 1].id;
            return !!curriculum.lessons[prevTestId]?.completed;
          }

          // Lesson N+1 within same unit → unlocked if lesson N is completed
          const prevLessonId = unit.lessons[li - 1].id;
          return !!curriculum.lessons[prevLessonId]?.completed;
        }
      }
    }

    return false;
  }

  // Get lesson result
  function getLessonResult(lessonId) {
    return curriculum.lessons[lessonId] || null;
  }

  // Complete a lesson - save stars, accuracy, and unlock next
  async function completeLesson(lessonId, stars, accuracy) {
    const existing = curriculum.lessons[lessonId];
    const isNewCompletion = !existing?.completed;
    const isBetterScore = !existing || stars > (existing.stars || 0);

    const lessonUpdate = {
      completed: true,
      completedAt: new Date().toISOString(),
      ...(isBetterScore ? { stars, bestAccuracy: accuracy } : {}),
    };

    // Calculate new total stars
    let newTotalStars = curriculum.totalStars || 0;
    if (isBetterScore) {
      newTotalStars = newTotalStars - (existing?.stars || 0) + stars;
    }

    const newTotalLessons = isNewCompletion
      ? (curriculum.totalLessonsCompleted || 0) + 1
      : curriculum.totalLessonsCompleted || 0;

    // Check if unit is completed (test lesson = the last lesson of the unit)
    // lessonId format: L1U1-1 → unitId: L1U1
    const unitId = lessonId.split('-')[0];
    // Find the unit to determine the actual last lesson
    const levelId = parseInt(unitId.charAt(1));
    const unitData = getLevel(levelId)?.units?.find(u => u.id === unitId);
    const lastLessonIndex = unitData ? unitData.lessons.length : 6;
    const testLessonId = unitId + '-' + lastLessonIndex;
    const unitCompleted = lessonId === testLessonId && stars > 0;

    const unitUpdate = unitCompleted ? {
      completed: true,
      testStars: stars,
    } : undefined;

    await updateProgress({
      curriculum: {
        ...curriculum,
        lessons: {
          ...curriculum.lessons,
          [lessonId]: { ...(curriculum.lessons[lessonId] || {}), ...lessonUpdate },
        },
        ...(unitUpdate ? {
          units: {
            ...curriculum.units,
            [unitId]: { ...(curriculum.units[unitId] || {}), ...unitUpdate },
          },
        } : {}),
        totalStars: newTotalStars,
        totalLessonsCompleted: newTotalLessons,
      },
    });

    // Add XP for new completions
    const xpAmount = calculateXP(stars);
    if (xpAmount > 0 && isNewCompletion) {
      await addXP(xpAmount, 'curriculum');
    }

    return { isNewCompletion, isBetterScore };
  }

  // Get unit progress (how many lessons completed — dynamically counts)
  function getUnitProgress(unitId) {
    const levelId = parseInt(unitId.charAt(1));
    const unitData = getLevel(levelId)?.units?.find(u => u.id === unitId);
    const totalLessons = unitData ? unitData.lessons.length : 6;
    let completed = 0;
    let totalStars = 0;
    for (let i = 1; i <= totalLessons; i++) {
      const lid = `${unitId}-${i}`;
      const result = curriculum.lessons[lid];
      if (result?.completed) {
        completed++;
        totalStars += result.stars || 0;
      }
    }
    return { completed, total: totalLessons, totalStars, maxStars: totalLessons * 3, isComplete: completed === totalLessons };
  }

  return {
    curriculum,
    isLessonUnlocked,
    getLessonResult,
    completeLesson,
    getUnitProgress,
  };
}
