// Level thresholds and titles
const LEVELS = [
  { level: 1,  xp: 0,     title: 'Newcomer',    titleHe: 'מתחיל' },
  { level: 2,  xp: 100,   title: 'Newcomer',    titleHe: 'מתחיל' },
  { level: 3,  xp: 250,   title: 'Beginner',    titleHe: 'טירון' },
  { level: 4,  xp: 500,   title: 'Beginner',    titleHe: 'טירון' },
  { level: 5,  xp: 850,   title: 'Student',     titleHe: 'תלמיד' },
  { level: 6,  xp: 1300,  title: 'Student',     titleHe: 'תלמיד' },
  { level: 7,  xp: 1900,  title: 'Explorer',    titleHe: 'חוקר' },
  { level: 8,  xp: 2600,  title: 'Explorer',    titleHe: 'חוקר' },
  { level: 9,  xp: 3500,  title: 'Scholar',     titleHe: 'למדן' },
  { level: 10, xp: 4600,  title: 'Scholar',     titleHe: 'למדן' },
  { level: 11, xp: 5900,  title: 'Adept',       titleHe: 'מומחה' },
  { level: 12, xp: 7400,  title: 'Adept',       titleHe: 'מומחה' },
  { level: 13, xp: 9200,  title: 'Expert',      titleHe: 'מיומן' },
  { level: 14, xp: 11300, title: 'Expert',      titleHe: 'מיומן' },
  { level: 15, xp: 13800, title: 'Master',      titleHe: 'אמן' },
  { level: 16, xp: 16800, title: 'Master',      titleHe: 'אמן' },
  { level: 17, xp: 20300, title: 'Champion',    titleHe: 'אלוף' },
  { level: 18, xp: 24500, title: 'Champion',    titleHe: 'אלוף' },
  { level: 19, xp: 29500, title: 'Legend',       titleHe: 'אגדה' },
  { level: 20, xp: 35500, title: 'Legend',       titleHe: 'אגדה' },
];

export function getLevelInfo(totalXP) {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xp) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
      break;
    }
  }

  const xpInLevel = totalXP - currentLevel.xp;
  const xpForNext = nextLevel ? nextLevel.xp - currentLevel.xp : 0;
  const progressPercent = nextLevel && xpForNext > 0 ? Math.min((xpInLevel / xpForNext) * 100, 100) : 100;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    titleHe: currentLevel.titleHe,
    xpInLevel,
    xpForNext,
    progressPercent,
    totalXP,
    isMaxLevel: !nextLevel,
  };
}

export function getXPForLevel(level) {
  const l = LEVELS.find(l => l.level === level);
  return l ? l.xp : 0;
}

export function getLevelTitle(level, lang = 'en') {
  const l = LEVELS.find(l => l.level === level) || LEVELS[0];
  return lang === 'he' ? l.titleHe : l.title;
}
