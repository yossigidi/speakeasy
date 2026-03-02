/**
 * Vocabulary mapping per curriculum level.
 * Each scene can pull from these words based on the child's level.
 */
export const ADVENTURE_VOCAB = {
  // Level 1 — Beginner (ages 5-6)
  1: {
    greetings: [
      { word: 'hello', translation: 'שלום' },
      { word: 'bye', translation: 'להתראות' },
      { word: 'yes', translation: 'כן' },
      { word: 'no', translation: 'לא' },
      { word: 'please', translation: 'בבקשה' },
      { word: 'thank you', translation: 'תודה' },
    ],
    colors: [
      { word: 'red', translation: 'אדום' },
      { word: 'blue', translation: 'כחול' },
      { word: 'green', translation: 'ירוק' },
      { word: 'yellow', translation: 'צהוב' },
    ],
    animals: [
      { word: 'cat', translation: 'חתול', emoji: '🐱' },
      { word: 'dog', translation: 'כלב', emoji: '🐶' },
      { word: 'bird', translation: 'ציפור', emoji: '🐦' },
      { word: 'fish', translation: 'דג', emoji: '🐟' },
    ],
    objects: [
      { word: 'tree', translation: 'עץ', emoji: '🌳' },
      { word: 'star', translation: 'כוכב', emoji: '⭐' },
      { word: 'sun', translation: 'שמש', emoji: '☀️' },
      { word: 'moon', translation: 'ירח', emoji: '🌙' },
    ],
  },
  // Level 2 — Elementary (ages 7-8)
  2: {
    greetings: [
      { word: 'good morning', translation: 'בוקר טוב' },
      { word: 'good night', translation: 'לילה טוב' },
      { word: 'how are you', translation: 'מה שלומך' },
      { word: 'friend', translation: 'חבר' },
    ],
    colors: [
      { word: 'orange', translation: 'כתום' },
      { word: 'purple', translation: 'סגול' },
      { word: 'pink', translation: 'ורוד' },
      { word: 'brown', translation: 'חום' },
    ],
    animals: [
      { word: 'rabbit', translation: 'ארנב', emoji: '🐰' },
      { word: 'fox', translation: 'שועל', emoji: '🦊' },
      { word: 'owl', translation: 'ינשוף', emoji: '🦉' },
      { word: 'deer', translation: 'אייל', emoji: '🦌' },
    ],
    adjectives: [
      { word: 'big', translation: 'גדול' },
      { word: 'small', translation: 'קטן' },
      { word: 'fast', translation: 'מהיר' },
      { word: 'brave', translation: 'אמיץ' },
    ],
  },
};

/**
 * Get vocabulary for a scene based on curriculum level.
 */
export function getVocabForLevel(level, category) {
  const vocab = ADVENTURE_VOCAB[level] || ADVENTURE_VOCAB[1];
  if (category) return vocab[category] || [];
  // Return all words for the level
  return Object.values(vocab).flat();
}
