// =============================================================================
// Alphabet Tower - Game Data
// =============================================================================

const UPPERCASE_A_F = ['A', 'B', 'C', 'D', 'E', 'F'];
const UPPERCASE_A_L = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
const UPPERCASE_A_Z = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LOWERCASE_A_Z = 'abcdefghijklmnopqrstuvwxyz'.split('');

// -----------------------------------------------------------------------------
// 1. DIFFICULTY_LEVELS
// -----------------------------------------------------------------------------
export const DIFFICULTY_LEVELS = [
  {
    level: 1,
    letters: UPPERCASE_A_F,
    unlockStars: 0,
    labelEn: 'A - F',
    labelHe: 'A - F',
    labelAr: 'A - F',
    labelRu: 'A - F',
    descEn: 'First 6 letters',
    descHe: '6 האותיות הראשונות',
    descAr: 'الحروف الستة الاولى',
    descRu: 'Первые 6 букв',
  },
  {
    level: 2,
    letters: UPPERCASE_A_L,
    unlockStars: 15,
    labelEn: 'A - L',
    labelHe: 'A - L',
    labelAr: 'A - L',
    labelRu: 'A - L',
    descEn: 'First 12 letters',
    descHe: '12 האותיות הראשונות',
    descAr: 'الحروف الاثني عشر الاولى',
    descRu: 'Первые 12 букв',
  },
  {
    level: 3,
    letters: UPPERCASE_A_Z,
    unlockStars: 40,
    labelEn: 'A - Z',
    labelHe: 'A - Z',
    labelAr: 'A - Z',
    labelRu: 'A - Z',
    descEn: 'Full alphabet',
    descHe: 'כל האלפבית',
    descAr: 'الابجدية كاملة',
    descRu: 'Весь алфавит',
  },
  {
    level: 4,
    letters: LOWERCASE_A_Z,
    unlockStars: 80,
    labelEn: 'a - z',
    labelHe: 'a - z',
    labelAr: 'a - z',
    labelRu: 'a - z',
    descEn: 'Lowercase letters',
    descHe: 'אותיות קטנות',
    descAr: 'الحروف الصغيرة',
    descRu: 'Строчные буквы',
  },
  {
    level: 5,
    letters: null, // uses WORD_LIST instead
    unlockStars: 120,
    labelEn: 'Words',
    labelHe: 'מילים',
    labelAr: 'كلمات',
    labelRu: 'Слова',
    descEn: 'Build simple words',
    descHe: 'בנה מילים פשוטות',
    descAr: 'ابنِ كلمات بسيطة',
    descRu: 'Составляй простые слова',
  },
];

// -----------------------------------------------------------------------------
// 2. REWARD_MILESTONES
// -----------------------------------------------------------------------------
export const REWARD_MILESTONES = [
  { stars: 5, type: 'trophy', id: 'first_trophy', emoji: '\u{1F3C6}', nameHe: 'גביע ראשון', nameAr: 'الكأس الاول', nameRu: 'Первый кубок', nameEn: 'First Trophy' },
  { stars: 15, type: 'character', id: 'panda', emoji: '\u{1F43C}', nameHe: 'פנדה', nameAr: 'باندا', nameRu: 'Панда', nameEn: 'Panda' },
  { stars: 30, type: 'giftbox', id: 'gift_box', emoji: '\u{1F381}', nameHe: 'קופסת מתנה', nameAr: 'صندوق هدية', nameRu: 'Подарок', nameEn: 'Gift Box' },
  { stars: 50, type: 'character', id: 'bunny', emoji: '\u{1F430}', nameHe: 'ארנבון', nameAr: 'ارنب', nameRu: 'Зайчик', nameEn: 'Bunny' },
  { stars: 75, type: 'trophy', id: 'master_trophy', emoji: '\u{1F451}', nameHe: 'כתר המלך', nameAr: 'تاج الملك', nameRu: 'Корона', nameEn: 'Master Trophy' },
  { stars: 100, type: 'character', id: 'fox', emoji: '\u{1F98A}', nameHe: 'שועל', nameAr: 'ثعلب', nameRu: 'Лисичка', nameEn: 'Fox' },
  { stars: 150, type: 'character', id: 'unicorn', emoji: '\u{1F984}', nameHe: 'חד קרן', nameAr: 'يونيكورن', nameRu: 'Единорог', nameEn: 'Unicorn' },
];

// -----------------------------------------------------------------------------
// 3. MODE_CONFIGS
// -----------------------------------------------------------------------------
export const MODE_CONFIGS = {
  alphabetOrder: { roundsPerGame: 4, starsPerRound: 1, bonusStars: 2 },
  missingLetter: { roundsPerGame: 5, starsPerRound: 1, bonusStars: 2 },
  wordBuilder: { roundsPerGame: 6, starsPerRound: 2, bonusStars: 3 },
  fallingCubes: { roundsPerGame: 6, starsPerRound: 1, bonusStars: 3 },
  alphabetTrain: { roundsPerGame: 4, starsPerRound: 2, bonusStars: 3 },
  aiAdaptive: { roundsPerGame: 6, starsPerRound: 1, bonusStars: 5 },
};

// -----------------------------------------------------------------------------
// 4. WORD_LISTS (tiered by difficulty)
// -----------------------------------------------------------------------------

// Easy 3-letter words (levels 1-3)
export const WORD_LIST_EASY = [
  { word: 'cat', emoji: '🐱', he: 'חתול', ar: 'قطة', ru: 'кот' },
  { word: 'dog', emoji: '🐶', he: 'כלב', ar: 'كلب', ru: 'пёс' },
  { word: 'sun', emoji: '☀️', he: 'שמש', ar: 'شمس', ru: 'солнце' },
  { word: 'hat', emoji: '🎩', he: 'כובע', ar: 'قبعة', ru: 'шляпа' },
  { word: 'bed', emoji: '🛏️', he: 'מיטה', ar: 'سرير', ru: 'кровать' },
  { word: 'cup', emoji: '☕', he: 'כוס', ar: 'كوب', ru: 'чашка' },
  { word: 'fox', emoji: '🦊', he: 'שועל', ar: 'ثعلب', ru: 'лиса' },
  { word: 'run', emoji: '🏃', he: 'לרוץ', ar: 'اركض', ru: 'бег' },
  { word: 'red', emoji: '🔴', he: 'אדום', ar: 'أحمر', ru: 'красный' },
  { word: 'big', emoji: '🐘', he: 'גדול', ar: 'كبير', ru: 'большой' },
  { word: 'bus', emoji: '🚌', he: 'אוטובוס', ar: 'باص', ru: 'автобус' },
  { word: 'pen', emoji: '🖊️', he: 'עט', ar: 'قلم', ru: 'ручка' },
  { word: 'map', emoji: '🗺️', he: 'מפה', ar: 'خريطة', ru: 'карта' },
  { word: 'box', emoji: '📦', he: 'קופסא', ar: 'صندوق', ru: 'коробка' },
  { word: 'nut', emoji: '🥜', he: 'אגוז', ar: 'جوزة', ru: 'орех' },
  { word: 'jam', emoji: '🍯', he: 'ריבה', ar: 'مربى', ru: 'джем' },
  { word: 'egg', emoji: '🥚', he: 'ביצה', ar: 'بيضة', ru: 'яйцо' },
  { word: 'ant', emoji: '🐜', he: 'נמלה', ar: 'نملة', ru: 'муравей' },
  { word: 'bee', emoji: '🐝', he: 'דבורה', ar: 'نحلة', ru: 'пчела' },
  { word: 'cow', emoji: '🐄', he: 'פרה', ar: 'بقرة', ru: 'корова' },
  { word: 'ear', emoji: '👂', he: 'אוזן', ar: 'أذن', ru: 'ухо' },
  { word: 'eye', emoji: '👁️', he: 'עין', ar: 'عين', ru: 'глаз' },
  { word: 'leg', emoji: '🦵', he: 'רגל', ar: 'ساق', ru: 'нога' },
  { word: 'net', emoji: '🥅', he: 'רשת', ar: 'شبكة', ru: 'сеть' },
  { word: 'ice', emoji: '🧊', he: 'קרח', ar: 'ثلج', ru: 'лёд' },
  { word: 'key', emoji: '🔑', he: 'מפתח', ar: 'مفتاح', ru: 'ключ' },
  { word: 'car', emoji: '🚗', he: 'מכונית', ar: 'سيارة', ru: 'машина' },
  { word: 'toy', emoji: '🧸', he: 'צעצוע', ar: 'لعبة', ru: 'игрушка' },
  { word: 'pie', emoji: '🥧', he: 'פאי', ar: 'فطيرة', ru: 'пирог' },
  { word: 'bat', emoji: '🦇', he: 'עטלף', ar: 'خفاش', ru: 'летучая мышь' },
];

// Medium 4-letter words (level 4)
export const WORD_LIST_MEDIUM = [
  { word: 'bird', emoji: '🐦', he: 'ציפור', ar: 'طائر', ru: 'птица' },
  { word: 'fish', emoji: '🐟', he: 'דג', ar: 'سمكة', ru: 'рыба' },
  { word: 'tree', emoji: '🌳', he: 'עץ', ar: 'شجرة', ru: 'дерево' },
  { word: 'moon', emoji: '🌙', he: 'ירח', ar: 'قمر', ru: 'луна' },
  { word: 'star', emoji: '⭐', he: 'כוכב', ar: 'نجمة', ru: 'звезда' },
  { word: 'cake', emoji: '🎂', he: 'עוגה', ar: 'كعكة', ru: 'торт' },
  { word: 'duck', emoji: '🦆', he: 'ברווז', ar: 'بطة', ru: 'утка' },
  { word: 'frog', emoji: '🐸', he: 'צפרדע', ar: 'ضفدع', ru: 'лягушка' },
  { word: 'hand', emoji: '✋', he: 'יד', ar: 'يد', ru: 'рука' },
  { word: 'king', emoji: '👑', he: 'מלך', ar: 'ملك', ru: 'король' },
  { word: 'lion', emoji: '🦁', he: 'אריה', ar: 'أسد', ru: 'лев' },
  { word: 'ball', emoji: '⚽', he: 'כדור', ar: 'كرة', ru: 'мяч' },
  { word: 'bell', emoji: '🔔', he: 'פעמון', ar: 'جرس', ru: 'колокол' },
  { word: 'boat', emoji: '⛵', he: 'סירה', ar: 'قارب', ru: 'лодка' },
  { word: 'book', emoji: '📖', he: 'ספר', ar: 'كتاب', ru: 'книга' },
  { word: 'door', emoji: '🚪', he: 'דלת', ar: 'باب', ru: 'дверь' },
  { word: 'gift', emoji: '🎁', he: 'מתנה', ar: 'هدية', ru: 'подарок' },
  { word: 'milk', emoji: '🥛', he: 'חלב', ar: 'حليب', ru: 'молоко' },
  { word: 'rain', emoji: '🌧️', he: 'גשם', ar: 'مطر', ru: 'дождь' },
  { word: 'snow', emoji: '❄️', he: 'שלג', ar: 'ثلج', ru: 'снег' },
];

// Full word list (level 5 — mix of all)
export const WORD_LIST = [
  { word: 'cat', emoji: '\u{1F431}', he: '\u05D7\u05EA\u05D5\u05DC', ar: '\u0642\u0637\u0629', ru: '\u043A\u043E\u0442' },
  { word: 'dog', emoji: '\u{1F436}', he: '\u05DB\u05DC\u05D1', ar: '\u0643\u0644\u0628', ru: '\u043F\u0451\u0441' },
  { word: 'sun', emoji: '\u2600\uFE0F', he: '\u05E9\u05DE\u05E9', ar: '\u0634\u0645\u0633', ru: '\u0441\u043E\u043B\u043D\u0446\u0435' },
  { word: 'hat', emoji: '\u{1F3A9}', he: '\u05DB\u05D5\u05D1\u05E2', ar: '\u0642\u0628\u0639\u0629', ru: '\u0448\u043B\u044F\u043F\u0430' },
  { word: 'bed', emoji: '\u{1F6CF}\uFE0F', he: '\u05DE\u05D9\u05D8\u05D4', ar: '\u0633\u0631\u064A\u0631', ru: '\u043A\u0440\u043E\u0432\u0430\u0442\u044C' },
  { word: 'cup', emoji: '\u2615', he: '\u05DB\u05D5\u05E1', ar: '\u0643\u0648\u0628', ru: '\u0447\u0430\u0448\u043A\u0430' },
  { word: 'pig', emoji: '\u{1F437}', he: '\u05D7\u05D6\u05D9\u05E8', ar: '\u062E\u0646\u0632\u064A\u0631', ru: '\u0441\u0432\u0438\u043D\u044C\u044F' },
  { word: 'fox', emoji: '\u{1F98A}', he: '\u05E9\u05D5\u05E2\u05DC', ar: '\u062B\u0639\u0644\u0628', ru: '\u043B\u0438\u0441\u0430' },
  { word: 'run', emoji: '\u{1F3C3}', he: '\u05DC\u05E8\u05D5\u05E5', ar: '\u0627\u0631\u0643\u0636', ru: '\u0431\u0435\u0433' },
  { word: 'sit', emoji: '\u{1FA91}', he: '\u05DC\u05E9\u05D1\u05EA', ar: '\u0627\u062C\u0644\u0633', ru: '\u0441\u0438\u0434\u0435\u0442\u044C' },
  { word: 'red', emoji: '\u{1F534}', he: '\u05D0\u05D3\u05D5\u05DD', ar: '\u0623\u062D\u0645\u0631', ru: '\u043A\u0440\u0430\u0441\u043D\u044B\u0439' },
  { word: 'big', emoji: '\u{1F418}', he: '\u05D2\u05D3\u05D5\u05DC', ar: '\u0643\u0628\u064A\u0631', ru: '\u0431\u043E\u043B\u044C\u0448\u043E\u0439' },
  { word: 'bus', emoji: '\u{1F68C}', he: '\u05D0\u05D5\u05D8\u05D5\u05D1\u05D5\u05E1', ar: '\u0628\u0627\u0635', ru: '\u0430\u0432\u0442\u043E\u0431\u0443\u0441' },
  { word: 'pen', emoji: '\u{1F58A}\uFE0F', he: '\u05E2\u05D8', ar: '\u0642\u0644\u0645', ru: '\u0440\u0443\u0447\u043A\u0430' },
  { word: 'map', emoji: '\u{1F5FA}\uFE0F', he: '\u05DE\u05E4\u05D4', ar: '\u062E\u0631\u064A\u0637\u0629', ru: '\u043A\u0430\u0440\u0442\u0430' },
  { word: 'box', emoji: '\u{1F4E6}', he: '\u05E7\u05D5\u05E4\u05E1\u05D0', ar: '\u0635\u0646\u062F\u0648\u0642', ru: '\u043A\u043E\u0440\u043E\u0431\u043A\u0430' },
  { word: 'fan', emoji: '\u{1FA87}', he: '\u05DE\u05D0\u05D5\u05D5\u05E8\u05E8', ar: '\u0645\u0631\u0648\u062D\u0629', ru: '\u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440' },
  { word: 'nut', emoji: '\u{1F95C}', he: '\u05D0\u05D2\u05D5\u05D6', ar: '\u062C\u0648\u0632\u0629', ru: '\u043E\u0440\u0435\u0445' },
  { word: 'jam', emoji: '\u{1F36F}', he: '\u05E8\u05D9\u05D1\u05D4', ar: '\u0645\u0631\u0628\u0649', ru: '\u0434\u0436\u0435\u043C' },
  { word: 'zip', emoji: '\u26A1', he: '\u05E8\u05D5\u05DB\u05E1\u05DF', ar: '\u0633\u062D\u0627\u0628', ru: '\u043C\u043E\u043B\u043D\u0438\u044F' },
];

// -----------------------------------------------------------------------------
// 5. GAME_MODES
// -----------------------------------------------------------------------------
export const GAME_MODES = [
  {
    id: 'alphabetOrder',
    emoji: '\u{1F522}',
    nameHe: '\u05E1\u05D3\u05E8 \u05D4\u05D0\u05DC\u05E4\u05D1\u05D9\u05EA',
    nameAr: '\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u0623\u0628\u062C\u062F\u064A\u0629',
    nameRu: '\u041F\u043E\u0440\u044F\u0434\u043E\u043A \u0430\u043B\u0444\u0430\u0432\u0438\u0442\u0430',
    nameEn: 'Alphabet Order',
    descHe: '\u05E1\u05D3\u05E8 \u05D0\u05EA \u05D4\u05D0\u05D5\u05EA\u05D9\u05D5\u05EA \u05DC\u05E4\u05D9 \u05D4\u05E1\u05D3\u05E8 \u05D4\u05E0\u05DB\u05D5\u05DF',
    descEn: 'Arrange letters in the correct order',
    gradient: 'from-blue-400 to-blue-600',
    icon: 'SortAscending',
  },
  {
    id: 'missingLetter',
    emoji: '\u2753',
    nameHe: '\u05D0\u05D5\u05EA \u05D7\u05E1\u05E8\u05D4',
    nameAr: '\u0627\u0644\u062D\u0631\u0641 \u0627\u0644\u0645\u0641\u0642\u0648\u062F',
    nameRu: '\u041F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043D\u0430\u044F \u0431\u0443\u043A\u0432\u0430',
    nameEn: 'Missing Letter',
    descHe: '\u05DE\u05E6\u05D0 \u05D0\u05EA \u05D4\u05D0\u05D5\u05EA \u05D4\u05D7\u05E1\u05E8\u05D4 \u05D1\u05E8\u05E6\u05E3',
    descEn: 'Find the missing letter in the sequence',
    gradient: 'from-purple-400 to-purple-600',
    icon: 'Search',
  },
  {
    id: 'wordBuilder',
    emoji: '\u{1F9E9}',
    nameHe: '\u05D1\u05D5\u05E0\u05D4 \u05DE\u05D9\u05DC\u05D9\u05DD',
    nameAr: '\u0628\u0646\u0627\u0621 \u0627\u0644\u0643\u0644\u0645\u0627\u062A',
    nameRu: '\u0421\u043E\u0431\u0435\u0440\u0438 \u0441\u043B\u043E\u0432\u043E',
    nameEn: 'Word Builder',
    descHe: '\u05E1\u05D3\u05E8 \u05D0\u05D5\u05EA\u05D9\u05D5\u05EA \u05DC\u05D1\u05E0\u05D9\u05D9\u05EA \u05DE\u05D9\u05DC\u05D9\u05DD',
    descEn: 'Arrange letters to build words',
    gradient: 'from-green-400 to-green-600',
    icon: 'Puzzle',
  },
  {
    id: 'fallingCubes',
    emoji: '\u{1F9CA}',
    nameHe: '\u05E7\u05D5\u05D1\u05D9\u05D5\u05EA \u05E0\u05D5\u05E4\u05DC\u05D5\u05EA',
    nameAr: '\u0627\u0644\u0645\u0643\u0639\u0628\u0627\u062A \u0627\u0644\u0645\u062A\u0633\u0627\u0642\u0637\u0629',
    nameRu: '\u041F\u0430\u0434\u0430\u044E\u0449\u0438\u0435 \u043A\u0443\u0431\u0438\u043A\u0438',
    nameEn: 'Falling Cubes',
    descHe: '\u05EA\u05E4\u05D5\u05E1 \u05D0\u05EA \u05D4\u05D0\u05D5\u05EA \u05D4\u05E0\u05DB\u05D5\u05E0\u05D4 \u05DC\u05E4\u05E0\u05D9 \u05E9\u05D4\u05D9\u05D0 \u05E0\u05D5\u05E4\u05DC\u05EA',
    descEn: 'Catch the correct letter before it falls',
    gradient: 'from-orange-400 to-red-500',
    icon: 'ArrowDown',
  },
  {
    id: 'alphabetTrain',
    emoji: '\u{1F682}',
    nameHe: '\u05E8\u05DB\u05D1\u05EA \u05D4\u05D0\u05DC\u05E4\u05D1\u05D9\u05EA',
    nameAr: '\u0642\u0637\u0627\u0631 \u0627\u0644\u0623\u0628\u062C\u062F\u064A\u0629',
    nameRu: '\u041F\u043E\u0435\u0437\u0434 \u0430\u043B\u0444\u0430\u0432\u0438\u0442\u0430',
    nameEn: 'Alphabet Train',
    descHe: '\u05D4\u05E9\u05DC\u05DD \u05D0\u05EA \u05D4\u05E7\u05E8\u05D5\u05E0\u05D5\u05EA \u05D1\u05E8\u05DB\u05D1\u05EA',
    descEn: 'Complete the train cars in order',
    gradient: 'from-teal-400 to-cyan-500',
    icon: 'Train',
  },
  {
    id: 'aiAdaptive',
    emoji: '\u{1F916}',
    nameHe: '\u05D0\u05EA\u05D2\u05E8 \u05D7\u05DB\u05DD',
    nameAr: '\u0627\u0644\u062A\u062D\u062F\u064A \u0627\u0644\u0630\u0643\u064A',
    nameRu: '\u0423\u043C\u043D\u044B\u0439 \u0432\u044B\u0437\u043E\u0432',
    nameEn: 'AI Challenge',
    descHe: '\u05D4\u05DE\u05E9\u05D7\u05E7 \u05DE\u05EA\u05D0\u05D9\u05DD \u05D0\u05EA \u05E2\u05E6\u05DE\u05D5 \u05DC\u05E8\u05DE\u05D4 \u05E9\u05DC\u05DA',
    descEn: 'The game adapts to your skill level',
    gradient: 'from-pink-400 to-rose-600',
    icon: 'Brain',
  },
];

// =============================================================================
// 6. Helper Functions
// =============================================================================

/**
 * Returns the letter array for a given difficulty level (1-4).
 * For level 5 (words), returns null - use getWordsForLevel() instead.
 */
export function getLettersForLevel(level) {
  const config = DIFFICULTY_LEVELS.find((d) => d.level === level);
  return config?.letters || UPPERCASE_A_F;
}

/**
 * Returns the word list for a given difficulty level.
 * Levels 1-3: easy 3-letter words
 * Level 4: medium 4-letter words
 * Level 5: all words mixed
 */
export function getWordsForLevel(level = 5) {
  if (level <= 3) return WORD_LIST_EASY;
  if (level === 4) return WORD_LIST_MEDIUM;
  return WORD_LIST;
}

/**
 * Returns all rewards the player has unlocked based on total stars.
 */
export function getUnlockedRewards(totalStars) {
  return REWARD_MILESTONES.filter((r) => totalStars >= r.stars);
}

/**
 * Returns the next reward the player has NOT yet unlocked,
 * or null if all rewards are unlocked.
 */
export function getNextReward(totalStars) {
  return REWARD_MILESTONES.find((r) => totalStars < r.stars) || null;
}

/**
 * Given a letterStats object { A: { correct, wrong, total }, ... },
 * returns the `count` weakest letters sorted by accuracy ascending.
 */
export function getWeakLetters(letterStats, count = 4) {
  if (!letterStats || typeof letterStats !== 'object') return [];

  const entries = Object.entries(letterStats)
    .filter(([, stats]) => stats && stats.total > 0)
    .map(([letter, stats]) => ({
      letter,
      accuracy: stats.correct / stats.total,
      total: stats.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);

  return entries.slice(0, count).map((e) => e.letter);
}

/**
 * Generates a single round configuration based on game mode, difficulty level,
 * and optional player letter stats (for AI adaptive mode).
 *
 * Returns an object describing what the round should look like.
 */
export function generateRound(mode, level, letterStats = null) {
  const letters = getLettersForLevel(level);
  const words = getWordsForLevel(level);
  const isWordLevel = level === 5;

  // Utility: pick N random items from an array
  const pickRandom = (arr, n) => {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  };

  // Utility: pick one random item
  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

  switch (mode) {
    case 'alphabetOrder': {
      // Player must arrange CONSECUTIVE letters in order (teaches real alphabet sequence)
      const pool = letters || UPPERCASE_A_Z;
      const subsetSize = pool.length <= 6 ? 3 + Math.floor(Math.random() * 2) : 4 + Math.floor(Math.random() * 2); // 3-4 or 4-5
      const maxStart = Math.max(0, pool.length - subsetSize);
      const startIdx = Math.floor(Math.random() * (maxStart + 1));
      const consecutive = pool.slice(startIdx, startIdx + subsetSize);
      const scrambled = [...consecutive].sort(() => Math.random() - 0.5);
      // Vary layout: row (horizontal) or tower (vertical stacking)
      const layout = Math.random() < 0.5 ? 'row' : 'tower';
      return { type: 'sort', letters: scrambled, answer: consecutive, layout };
    }

    case 'missingLetter': {
      // Show a sequence with one gap, player picks the missing letter
      const pool = letters || UPPERCASE_A_Z;
      const seqLen = pool.length <= 6 ? 4 : 5;
      const startIdx = Math.floor(Math.random() * Math.max(1, pool.length - (seqLen - 1)));
      const sequence = pool.slice(startIdx, startIdx + seqLen);
      const missingIdx = Math.floor(Math.random() * sequence.length);
      const answer = sequence[missingIdx];
      const display = sequence.map((l, i) => (i === missingIdx ? '_' : l));
      const options = pickRandom(
        pool.filter((l) => l !== answer),
        3
      ).concat(answer).sort(() => Math.random() - 0.5);
      return { type: 'fillGap', display, answer, options };
    }

    case 'wordBuilder': {
      // Always use real words — easy 3-letter words for early levels, harder words for higher levels
      const wordObj = pickOne(words);
      const scrambled = wordObj.word.split('').sort(() => Math.random() - 0.5);
      return { type: 'buildWord', scrambled, answer: wordObj.word, hint: wordObj.emoji, translations: { he: wordObj.he, ar: wordObj.ar, ru: wordObj.ru } };
    }

    case 'fallingCubes': {
      // Player must tap the correct letter from several falling options
      const pool = letters || UPPERCASE_A_Z;
      const target = pickOne(pool);
      const distractors = pickRandom(
        pool.filter((l) => l !== target),
        3
      );
      return { type: 'catch', target, distractors, allOptions: [target, ...distractors].sort(() => Math.random() - 0.5) };
    }

    case 'alphabetTrain': {
      // Fill in blank train cars in a sequence
      const pool = letters || UPPERCASE_A_Z;
      const trainLen = pool.length <= 6 ? 4 : 6;
      const numBlanks = pool.length <= 6 ? 1 : 2;
      const startIdx = Math.floor(Math.random() * Math.max(1, pool.length - (trainLen - 1)));
      const sequence = pool.slice(startIdx, startIdx + trainLen);
      // Remove random cars
      const indices = Array.from({ length: trainLen }, (_, i) => i);
      const blanks = pickRandom(indices, numBlanks).sort((a, b) => a - b);
      const display = sequence.map((l, i) => (blanks.includes(i) ? '_' : l));
      const answers = blanks.map((i) => sequence[i]);
      return { type: 'trainFill', display, answers, blanks };
    }

    case 'aiAdaptive': {
      // Mix weak letters (50% chance) with random pool letters for variety
      const pool = letters || UPPERCASE_A_Z;
      let target;
      if (letterStats) {
        const weak = getWeakLetters(letterStats, 4);
        if (weak.length > 0 && Math.random() < 0.5) {
          target = pickOne(weak);
        } else {
          target = pickOne(pool);
        }
      } else {
        target = pickOne(pool);
      }
      const distractors = pickRandom(
        pool.filter((l) => l !== target),
        3
      );
      return {
        type: 'adaptive',
        target,
        distractors,
        allOptions: [target, ...distractors].sort(() => Math.random() - 0.5),
        focusLetters,
      };
    }

    default:
      return { type: 'unknown', mode };
  }
}
