import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { SKILLS } from '../data/skills/skills-data.js';
import { calculateXP } from '../data/curriculum/curriculum-index.js';

const DEFAULT_SKILLS = {
  lessons: {},
  totalStars: 0,
  totalLessonsCompleted: 0,
};

export default function useSkillsProgress() {
  const { progress, updateProgress, addXP } = useUserProgress();

  const skills = progress.skills || DEFAULT_SKILLS;

  // Check if a skill lesson is unlocked
  function isSkillLessonUnlocked(lessonId) {
    // Already completed → always accessible
    if (skills.lessons[lessonId]?.completed) return true;

    // Find which skill this lesson belongs to
    for (let si = 0; si < SKILLS.length; si++) {
      const skill = SKILLS[si];
      const lessonIndex = skill.lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex === -1) continue;

      // First lesson of first skill → always unlocked
      if (si === 0 && lessonIndex === 0) return true;

      // First lesson of a subsequent skill → unlocked if previous skill's test is completed
      if (lessonIndex === 0 && si > 0) {
        const prevSkill = SKILLS[si - 1];
        const prevTestId = prevSkill.lessons[prevSkill.lessons.length - 1].id;
        return !!skills.lessons[prevTestId]?.completed;
      }

      // Lesson N+1 within same skill → unlocked if lesson N is completed
      const prevLessonId = skill.lessons[lessonIndex - 1].id;
      return !!skills.lessons[prevLessonId]?.completed;
    }

    return false;
  }

  // Get lesson result
  function getLessonResult(lessonId) {
    return skills.lessons[lessonId] || null;
  }

  // Complete a lesson
  async function completeLesson(lessonId, stars, accuracy) {
    try {
      const existing = skills.lessons[lessonId];
      const isNewCompletion = !existing?.completed;
      const isBetterScore = !existing || stars > (existing.stars || 0);

      const lessonUpdate = {
        completed: true,
        completedAt: new Date().toISOString(),
        ...(isBetterScore ? { stars, bestAccuracy: accuracy } : {}),
      };

      let newTotalStars = skills.totalStars || 0;
      if (isBetterScore) {
        newTotalStars = newTotalStars - (existing?.stars || 0) + stars;
      }

      const newTotalLessons = isNewCompletion
        ? (skills.totalLessonsCompleted || 0) + 1
        : skills.totalLessonsCompleted || 0;

      // Build top-level achievement counter updates
      const achievementCounters = {};
      if (isNewCompletion) {
        achievementCounters.totalLessonsCompleted = (progress.totalLessonsCompleted || 0) + 1;
      }
      if (isNewCompletion && accuracy === 100) {
        achievementCounters.perfectLessons = (progress.perfectLessons || 0) + 1;
      }

      await updateProgress({
        ...achievementCounters,
        skills: {
          ...skills,
          lessons: {
            ...skills.lessons,
            [lessonId]: { ...(skills.lessons[lessonId] || {}), ...lessonUpdate },
          },
          totalStars: newTotalStars,
          totalLessonsCompleted: newTotalLessons,
        },
      });

      // Add XP for new completions
      const xpAmount = calculateXP(stars);
      if (xpAmount > 0 && isNewCompletion) {
        await addXP(xpAmount, 'skills');
      }

      return { isNewCompletion, isBetterScore };
    } catch (error) {
      console.error('completeLesson (skills) failed:', error);
      throw error;
    }
  }

  // Get progress for a specific skill
  function getSkillProgress(skillId) {
    const skill = SKILLS.find(s => s.id === skillId);
    if (!skill) return { completed: 0, total: 0, totalStars: 0, maxStars: 0, isComplete: false };

    let completed = 0;
    let totalStars = 0;
    for (const lesson of skill.lessons) {
      const result = skills.lessons[lesson.id];
      if (result?.completed) {
        completed++;
        totalStars += result.stars || 0;
      }
    }

    return {
      completed,
      total: skill.lessons.length,
      totalStars,
      maxStars: skill.lessons.length * 3,
      isComplete: completed === skill.lessons.length,
    };
  }

  return {
    skills,
    isSkillLessonUnlocked,
    getLessonResult,
    completeLesson,
    getSkillProgress,
  };
}
