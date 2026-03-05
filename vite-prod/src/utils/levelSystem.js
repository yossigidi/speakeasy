// Level thresholds and titles
const LEVELS = [
  { level: 1,  xp: 0,     title: 'Newcomer',    titleHe: 'מתחיל',  titleAr: 'مبتدئ',       titleRu: 'Новичок' },
  { level: 2,  xp: 100,   title: 'Newcomer',    titleHe: 'מתחיל',  titleAr: 'مبتدئ',       titleRu: 'Новичок' },
  { level: 3,  xp: 250,   title: 'Beginner',    titleHe: 'טירון',  titleAr: 'مبتدئ صغير', titleRu: 'Начинающий' },
  { level: 4,  xp: 500,   title: 'Beginner',    titleHe: 'טירון',  titleAr: 'مبتدئ صغير', titleRu: 'Начинающий' },
  { level: 5,  xp: 850,   title: 'Student',     titleHe: 'תלמיד',  titleAr: 'طالب',        titleRu: 'Ученик' },
  { level: 6,  xp: 1300,  title: 'Student',     titleHe: 'תלמיד',  titleAr: 'طالب',        titleRu: 'Ученик' },
  { level: 7,  xp: 1900,  title: 'Explorer',    titleHe: 'חוקר',   titleAr: 'مستكشف',      titleRu: 'Исследователь' },
  { level: 8,  xp: 2600,  title: 'Explorer',    titleHe: 'חוקר',   titleAr: 'مستكشف',      titleRu: 'Исследователь' },
  { level: 9,  xp: 3500,  title: 'Scholar',     titleHe: 'למדן',   titleAr: 'عالم',         titleRu: 'Знаток' },
  { level: 10, xp: 4600,  title: 'Scholar',     titleHe: 'למדן',   titleAr: 'عالم',         titleRu: 'Знаток' },
  { level: 11, xp: 5900,  title: 'Adept',       titleHe: 'מומחה',  titleAr: 'ماهر',        titleRu: 'Умелец' },
  { level: 12, xp: 7400,  title: 'Adept',       titleHe: 'מומחה',  titleAr: 'ماهر',        titleRu: 'Умелец' },
  { level: 13, xp: 9200,  title: 'Expert',      titleHe: 'מיומן',  titleAr: 'خبير',        titleRu: 'Эксперт' },
  { level: 14, xp: 11300, title: 'Expert',      titleHe: 'מיומן',  titleAr: 'خبير',        titleRu: 'Эксперт' },
  { level: 15, xp: 13800, title: 'Master',      titleHe: 'אמן',    titleAr: 'أستاذ',       titleRu: 'Мастер' },
  { level: 16, xp: 16800, title: 'Master',      titleHe: 'אמן',    titleAr: 'أستاذ',       titleRu: 'Мастер' },
  { level: 17, xp: 20300, title: 'Champion',    titleHe: 'אלוף',   titleAr: 'بطل',         titleRu: 'Чемпион' },
  { level: 18, xp: 24500, title: 'Champion',    titleHe: 'אלוף',   titleAr: 'بطل',         titleRu: 'Чемпион' },
  { level: 19, xp: 29500, title: 'Legend',       titleHe: 'אגדה',  titleAr: 'أسطورة',      titleRu: 'Легенда' },
  { level: 20, xp: 35500, title: 'Legend',       titleHe: 'אגדה',  titleAr: 'أسطورة',      titleRu: 'Легенда' },
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
    titleAr: currentLevel.titleAr,
    titleRu: currentLevel.titleRu,
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
  if (lang === 'he') return l.titleHe;
  if (lang === 'ar') return l.titleAr;
  if (lang === 'ru') return l.titleRu;
  return l.title;
}
