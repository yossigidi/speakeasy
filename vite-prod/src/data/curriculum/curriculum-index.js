import { LEVEL_1 } from './level-1.js';

export const LEVELS = [LEVEL_1];

// Level metadata for display
export const LEVEL_META = [
  { id: 1, name: 'Starters', nameHe: 'מתחילים', emoji: '🌱', color: '#FF6B6B', bgGradient: 'from-red-400 to-coral-500' },
  { id: 2, name: 'Explorers', nameHe: 'חוקרים', emoji: '🔭', color: '#38BDF8', bgGradient: 'from-sky-400 to-blue-500', locked: true },
  { id: 3, name: 'Readers', nameHe: 'קוראים', emoji: '📖', color: '#10B981', bgGradient: 'from-emerald-400 to-green-500', locked: true },
  { id: 4, name: 'Writers', nameHe: 'כותבים', emoji: '✍️', color: '#FB923C', bgGradient: 'from-orange-400 to-amber-500', locked: true },
  { id: 5, name: 'Champions', nameHe: 'אלופים', emoji: '🏆', color: '#0EA5E9', bgGradient: 'from-teal-400 to-cyan-500', locked: true },
];

// Get a specific level's data
export function getLevel(levelId) {
  return LEVELS.find(l => l.id === levelId) || null;
}

// Get a specific unit
export function getUnit(levelId, unitId) {
  const level = getLevel(levelId);
  if (!level) return null;
  return level.units.find(u => u.id === unitId) || null;
}

// Get a specific lesson
export function getLesson(lessonId) {
  for (const level of LEVELS) {
    for (const unit of level.units) {
      const lesson = unit.lessons.find(l => l.id === lessonId);
      if (lesson) return { lesson, unit, level };
    }
  }
  return null;
}

// Get the next lesson after a given lessonId
export function getNextLesson(lessonId) {
  for (const level of LEVELS) {
    for (let ui = 0; ui < level.units.length; ui++) {
      const unit = level.units[ui];
      for (let li = 0; li < unit.lessons.length; li++) {
        if (unit.lessons[li].id === lessonId) {
          // Next lesson in same unit
          if (li + 1 < unit.lessons.length) {
            return { lesson: unit.lessons[li + 1], unit, level };
          }
          // First lesson of next unit
          if (ui + 1 < level.units.length) {
            const nextUnit = level.units[ui + 1];
            return { lesson: nextUnit.lessons[0], unit: nextUnit, level };
          }
          // End of level
          return null;
        }
      }
    }
  }
  return null;
}

// Get total lesson count for a level
export function getLevelStats(levelId) {
  const level = getLevel(levelId);
  if (!level) return { units: 0, lessons: 0, words: 0 };
  let lessons = 0, words = 0;
  for (const unit of level.units) {
    lessons += unit.lessons.length;
    words += unit.words.length;
  }
  return { units: level.units.length, lessons, words };
}

// Lesson type metadata
export const LESSON_TYPES = {
  speaking: { icon: '🗣️', color: '#FF6B6B', nameHe: 'דיבור', nameEn: 'Speaking' },
  vocabulary: { icon: '📚', color: '#8B5CF6', nameHe: 'אוצר מילים', nameEn: 'Vocabulary' },
  reading: { icon: '📖', color: '#0EA5E9', nameHe: 'קריאה', nameEn: 'Reading' },
  writing: { icon: '✍️', color: '#10B981', nameHe: 'כתיבה', nameEn: 'Writing' },
  mixed: { icon: '🎯', color: '#FB923C', nameHe: 'תרגול מעורב', nameEn: 'Mixed' },
  test: { icon: '⭐', color: '#EAB308', nameHe: 'מבחן', nameEn: 'Test' },
};

// Star calculation
export function calculateStars(accuracy) {
  if (accuracy >= 95) return 3;
  if (accuracy >= 75) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}

// XP calculation based on stars
export function calculateXP(stars) {
  if (stars === 3) return 30;
  if (stars === 2) return 20;
  if (stars === 1) return 10;
  return 0;
}
