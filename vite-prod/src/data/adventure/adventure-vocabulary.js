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
    bodyParts: [
      { word: 'hand', translation: 'יד', emoji: '✋' },
      { word: 'head', translation: 'ראש', emoji: '🧠' },
      { word: 'eye', translation: 'עין', emoji: '👁️' },
      { word: 'nose', translation: 'אף', emoji: '👃' },
      { word: 'mouth', translation: 'פה', emoji: '👄' },
      { word: 'ear', translation: 'אוזן', emoji: '👂' },
      { word: 'foot', translation: 'רגל', emoji: '🦶' },
      { word: 'arm', translation: 'זרוע', emoji: '💪' },
    ],
    food: [
      { word: 'apple', translation: 'תפוח', emoji: '🍎' },
      { word: 'bread', translation: 'לחם', emoji: '🍞' },
      { word: 'water', translation: 'מים', emoji: '💧' },
      { word: 'milk', translation: 'חלב', emoji: '🥛' },
      { word: 'egg', translation: 'ביצה', emoji: '🥚' },
      { word: 'rice', translation: 'אורז', emoji: '🍚' },
    ],
    family: [
      { word: 'mother', translation: 'אמא', emoji: '👩' },
      { word: 'father', translation: 'אבא', emoji: '👨' },
      { word: 'sister', translation: 'אחות', emoji: '👧' },
      { word: 'brother', translation: 'אח', emoji: '👦' },
      { word: 'baby', translation: 'תינוק', emoji: '👶' },
      { word: 'family', translation: 'משפחה', emoji: '👨‍👩‍👧‍👦' },
    ],
    numbers: [
      { word: 'one', translation: 'אחד', emoji: '1️⃣' },
      { word: 'two', translation: 'שניים', emoji: '2️⃣' },
      { word: 'three', translation: 'שלוש', emoji: '3️⃣' },
      { word: 'four', translation: 'ארבע', emoji: '4️⃣' },
      { word: 'five', translation: 'חמש', emoji: '5️⃣' },
    ],
  },
  // Level 3 — Intermediate (ages 8-9)
  3: {
    weather: [
      { word: 'sun', translation: 'שמש', emoji: '☀️' },
      { word: 'rain', translation: 'גשם', emoji: '🌧️' },
      { word: 'cloud', translation: 'ענן', emoji: '☁️' },
      { word: 'wind', translation: 'רוח', emoji: '💨' },
      { word: 'snow', translation: 'שלג', emoji: '❄️' },
      { word: 'hot', translation: 'חם', emoji: '🔥' },
      { word: 'cold', translation: 'קר', emoji: '🥶' },
    ],
    clothes: [
      { word: 'shirt', translation: 'חולצה', emoji: '👕' },
      { word: 'pants', translation: 'מכנסיים', emoji: '👖' },
      { word: 'shoes', translation: 'נעליים', emoji: '👟' },
      { word: 'hat', translation: 'כובע', emoji: '🎩' },
      { word: 'dress', translation: 'שמלה', emoji: '👗' },
      { word: 'socks', translation: 'גרביים', emoji: '🧦' },
    ],
    home: [
      { word: 'house', translation: 'בית', emoji: '🏠' },
      { word: 'door', translation: 'דלת', emoji: '🚪' },
      { word: 'window', translation: 'חלון', emoji: '🪟' },
      { word: 'bed', translation: 'מיטה', emoji: '🛏️' },
      { word: 'chair', translation: 'כיסא', emoji: '🪑' },
      { word: 'table', translation: 'שולחן', emoji: '🪵' },
    ],
    actions: [
      { word: 'run', translation: 'לרוץ', emoji: '🏃' },
      { word: 'jump', translation: 'לקפוץ', emoji: '🤸' },
      { word: 'eat', translation: 'לאכול', emoji: '🍽️' },
      { word: 'drink', translation: 'לשתות', emoji: '🥤' },
      { word: 'sleep', translation: 'לישון', emoji: '😴' },
      { word: 'play', translation: 'לשחק', emoji: '🎮' },
    ],
  },
  // Level 4 — Advanced (ages 9-10)
  4: {
    school: [
      { word: 'book', translation: 'ספר', emoji: '📖' },
      { word: 'pen', translation: 'עט', emoji: '🖊️' },
      { word: 'pencil', translation: 'עיפרון', emoji: '✏️' },
      { word: 'desk', translation: 'שולחן כתיבה', emoji: '🪑' },
      { word: 'bag', translation: 'תיק', emoji: '🎒' },
      { word: 'ruler', translation: 'סרגל', emoji: '📏' },
    ],
    nature: [
      { word: 'flower', translation: 'פרח', emoji: '🌸' },
      { word: 'river', translation: 'נהר', emoji: '🏞️' },
      { word: 'mountain', translation: 'הר', emoji: '⛰️' },
      { word: 'forest', translation: 'יער', emoji: '🌲' },
      { word: 'sea', translation: 'ים', emoji: '🌊' },
      { word: 'sky', translation: 'שמיים', emoji: '🌤️' },
    ],
    feelings: [
      { word: 'happy', translation: 'שמח', emoji: '😊' },
      { word: 'sad', translation: 'עצוב', emoji: '😢' },
      { word: 'angry', translation: 'כועס', emoji: '😠' },
      { word: 'tired', translation: 'עייף', emoji: '😴' },
      { word: 'hungry', translation: 'רעב', emoji: '🤤' },
      { word: 'scared', translation: 'מפוחד', emoji: '😨' },
    ],
    time: [
      { word: 'morning', translation: 'בוקר', emoji: '🌅' },
      { word: 'night', translation: 'לילה', emoji: '🌙' },
      { word: 'today', translation: 'היום', emoji: '📅' },
      { word: 'tomorrow', translation: 'מחר', emoji: '➡️' },
      { word: 'day', translation: 'יום', emoji: '☀️' },
      { word: 'week', translation: 'שבוע', emoji: '📆' },
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
