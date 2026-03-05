/**
 * Vocabulary mapping per curriculum level.
 * Each scene can pull from these words based on the child's level.
 */
export const ADVENTURE_VOCAB = {
  // Level 1 — Beginner (ages 5-6)
  1: {
    greetings: [
      { word: 'hello', translation: 'שלום', translationAr: 'مرحبا', translationRu: 'привет' },
      { word: 'bye', translation: 'להתראות', translationAr: 'مع السلامة', translationRu: 'пока' },
      { word: 'yes', translation: 'כן', translationAr: 'نعم', translationRu: 'да' },
      { word: 'no', translation: 'לא', translationAr: 'لا', translationRu: 'нет' },
      { word: 'please', translation: 'בבקשה', translationAr: 'من فضلك', translationRu: 'пожалуйста' },
      { word: 'thank you', translation: 'תודה', translationAr: 'شكرا', translationRu: 'спасибо' },
    ],
    colors: [
      { word: 'red', translation: 'אדום', translationAr: 'أحمر', translationRu: 'красный' },
      { word: 'blue', translation: 'כחול', translationAr: 'أزرق', translationRu: 'синий' },
      { word: 'green', translation: 'ירוק', translationAr: 'أخضر', translationRu: 'зелёный' },
      { word: 'yellow', translation: 'צהוב', translationAr: 'أصفر', translationRu: 'жёлтый' },
    ],
    animals: [
      { word: 'cat', translation: 'חתול', translationAr: 'قطة', translationRu: 'кошка', emoji: '🐱' },
      { word: 'dog', translation: 'כלב', translationAr: 'كلب', translationRu: 'собака', emoji: '🐶' },
      { word: 'bird', translation: 'ציפור', translationAr: 'طائر', translationRu: 'птица', emoji: '🐦' },
      { word: 'fish', translation: 'דג', translationAr: 'سمكة', translationRu: 'рыба', emoji: '🐟' },
    ],
    objects: [
      { word: 'tree', translation: 'עץ', translationAr: 'شجرة', translationRu: 'дерево', emoji: '🌳' },
      { word: 'star', translation: 'כוכב', translationAr: 'نجمة', translationRu: 'звезда', emoji: '⭐' },
      { word: 'sun', translation: 'שמש', translationAr: 'شمس', translationRu: 'солнце', emoji: '☀️' },
      { word: 'moon', translation: 'ירח', translationAr: 'قمر', translationRu: 'луна', emoji: '🌙' },
    ],
  },
  // Level 2 — Elementary (ages 7-8)
  2: {
    greetings: [
      { word: 'good morning', translation: 'בוקר טוב', translationAr: 'صباح الخير', translationRu: 'доброе утро' },
      { word: 'good night', translation: 'לילה טוב', translationAr: 'تصبح على خير', translationRu: 'спокойной ночи' },
      { word: 'how are you', translation: 'מה שלומך', translationAr: 'كيف حالك', translationRu: 'как дела' },
      { word: 'friend', translation: 'חבר', translationAr: 'صديق', translationRu: 'друг' },
    ],
    colors: [
      { word: 'orange', translation: 'כתום', translationAr: 'برتقالي', translationRu: 'оранжевый' },
      { word: 'purple', translation: 'סגול', translationAr: 'بنفسجي', translationRu: 'фиолетовый' },
      { word: 'pink', translation: 'ורוד', translationAr: 'وردي', translationRu: 'розовый' },
      { word: 'brown', translation: 'חום', translationAr: 'بني', translationRu: 'коричневый' },
    ],
    animals: [
      { word: 'rabbit', translation: 'ארנב', translationAr: 'أرنب', translationRu: 'кролик', emoji: '🐰' },
      { word: 'fox', translation: 'שועל', translationAr: 'ثعلب', translationRu: 'лиса', emoji: '🦊' },
      { word: 'owl', translation: 'ינשוף', translationAr: 'بومة', translationRu: 'сова', emoji: '🦉' },
      { word: 'deer', translation: 'אייל', translationAr: 'غزال', translationRu: 'олень', emoji: '🦌' },
    ],
    adjectives: [
      { word: 'big', translation: 'גדול', translationAr: 'كبير', translationRu: 'большой' },
      { word: 'small', translation: 'קטן', translationAr: 'صغير', translationRu: 'маленький' },
      { word: 'fast', translation: 'מהיר', translationAr: 'سريع', translationRu: 'быстрый' },
      { word: 'brave', translation: 'אמיץ', translationAr: 'شجاع', translationRu: 'смелый' },
    ],
    bodyParts: [
      { word: 'hand', translation: 'יד', translationAr: 'يد', translationRu: 'рука', emoji: '✋' },
      { word: 'head', translation: 'ראש', translationAr: 'رأس', translationRu: 'голова', emoji: '🧠' },
      { word: 'eye', translation: 'עין', translationAr: 'عين', translationRu: 'глаз', emoji: '👁️' },
      { word: 'nose', translation: 'אף', translationAr: 'أنف', translationRu: 'нос', emoji: '👃' },
      { word: 'mouth', translation: 'פה', translationAr: 'فم', translationRu: 'рот', emoji: '👄' },
      { word: 'ear', translation: 'אוזן', translationAr: 'أذن', translationRu: 'ухо', emoji: '👂' },
      { word: 'foot', translation: 'רגל', translationAr: 'قدم', translationRu: 'нога', emoji: '🦶' },
      { word: 'arm', translation: 'זרוע', translationAr: 'ذراع', translationRu: 'рука', emoji: '💪' },
    ],
    food: [
      { word: 'apple', translation: 'תפוח', translationAr: 'تفاحة', translationRu: 'яблоко', emoji: '🍎' },
      { word: 'bread', translation: 'לחם', translationAr: 'خبز', translationRu: 'хлеб', emoji: '🍞' },
      { word: 'water', translation: 'מים', translationAr: 'ماء', translationRu: 'вода', emoji: '💧' },
      { word: 'milk', translation: 'חלב', translationAr: 'حليب', translationRu: 'молоко', emoji: '🥛' },
      { word: 'egg', translation: 'ביצה', translationAr: 'بيضة', translationRu: 'яйцо', emoji: '🥚' },
      { word: 'rice', translation: 'אורז', translationAr: 'أرز', translationRu: 'рис', emoji: '🍚' },
    ],
    family: [
      { word: 'mother', translation: 'אמא', translationAr: 'أم', translationRu: 'мама', emoji: '👩' },
      { word: 'father', translation: 'אבא', translationAr: 'أب', translationRu: 'папа', emoji: '👨' },
      { word: 'sister', translation: 'אחות', translationAr: 'أخت', translationRu: 'сестра', emoji: '👧' },
      { word: 'brother', translation: 'אח', translationAr: 'أخ', translationRu: 'брат', emoji: '👦' },
      { word: 'baby', translation: 'תינוק', translationAr: 'طفل', translationRu: 'малыш', emoji: '👶' },
      { word: 'family', translation: 'משפחה', translationAr: 'عائلة', translationRu: 'семья', emoji: '👨‍👩‍👧‍👦' },
    ],
    numbers: [
      { word: 'one', translation: 'אחד', translationAr: 'واحد', translationRu: 'один', emoji: '1️⃣' },
      { word: 'two', translation: 'שניים', translationAr: 'اثنان', translationRu: 'два', emoji: '2️⃣' },
      { word: 'three', translation: 'שלוש', translationAr: 'ثلاثة', translationRu: 'три', emoji: '3️⃣' },
      { word: 'four', translation: 'ארבע', translationAr: 'أربعة', translationRu: 'четыре', emoji: '4️⃣' },
      { word: 'five', translation: 'חמש', translationAr: 'خمسة', translationRu: 'пять', emoji: '5️⃣' },
    ],
  },
  // Level 3 — Intermediate (ages 8-9)
  3: {
    weather: [
      { word: 'sun', translation: 'שמש', translationAr: 'شمس', translationRu: 'солнце', emoji: '☀️' },
      { word: 'rain', translation: 'גשם', translationAr: 'مطر', translationRu: 'дождь', emoji: '🌧️' },
      { word: 'cloud', translation: 'ענן', translationAr: 'سحابة', translationRu: 'облако', emoji: '☁️' },
      { word: 'wind', translation: 'רוח', translationAr: 'رياح', translationRu: 'ветер', emoji: '💨' },
      { word: 'snow', translation: 'שלג', translationAr: 'ثلج', translationRu: 'снег', emoji: '❄️' },
      { word: 'hot', translation: 'חם', translationAr: 'حار', translationRu: 'жарко', emoji: '🔥' },
      { word: 'cold', translation: 'קר', translationAr: 'بارد', translationRu: 'холодно', emoji: '🥶' },
    ],
    clothes: [
      { word: 'shirt', translation: 'חולצה', translationAr: 'قميص', translationRu: 'рубашка', emoji: '👕' },
      { word: 'pants', translation: 'מכנסיים', translationAr: 'بنطلون', translationRu: 'брюки', emoji: '👖' },
      { word: 'shoes', translation: 'נעליים', translationAr: 'حذاء', translationRu: 'обувь', emoji: '👟' },
      { word: 'hat', translation: 'כובע', translationAr: 'قبعة', translationRu: 'шляпа', emoji: '🎩' },
      { word: 'dress', translation: 'שמלה', translationAr: 'فستان', translationRu: 'платье', emoji: '👗' },
      { word: 'socks', translation: 'גרביים', translationAr: 'جوارب', translationRu: 'носки', emoji: '🧦' },
    ],
    home: [
      { word: 'house', translation: 'בית', translationAr: 'بيت', translationRu: 'дом', emoji: '🏠' },
      { word: 'door', translation: 'דלת', translationAr: 'باب', translationRu: 'дверь', emoji: '🚪' },
      { word: 'window', translation: 'חלון', translationAr: 'نافذة', translationRu: 'окно', emoji: '🪟' },
      { word: 'bed', translation: 'מיטה', translationAr: 'سرير', translationRu: 'кровать', emoji: '🛏️' },
      { word: 'chair', translation: 'כיסא', translationAr: 'كرسي', translationRu: 'стул', emoji: '🪑' },
      { word: 'table', translation: 'שולחן', translationAr: 'طاولة', translationRu: 'стол', emoji: '🪵' },
    ],
    actions: [
      { word: 'run', translation: 'לרוץ', translationAr: 'يركض', translationRu: 'бегать', emoji: '🏃' },
      { word: 'jump', translation: 'לקפוץ', translationAr: 'يقفز', translationRu: 'прыгать', emoji: '🤸' },
      { word: 'eat', translation: 'לאכול', translationAr: 'يأكل', translationRu: 'есть', emoji: '🍽️' },
      { word: 'drink', translation: 'לשתות', translationAr: 'يشرب', translationRu: 'пить', emoji: '🥤' },
      { word: 'sleep', translation: 'לישון', translationAr: 'ينام', translationRu: 'спать', emoji: '😴' },
      { word: 'play', translation: 'לשחק', translationAr: 'يلعب', translationRu: 'играть', emoji: '🎮' },
    ],
  },
  // Level 4 — Advanced (ages 9-10)
  4: {
    school: [
      { word: 'book', translation: 'ספר', translationAr: 'كتاب', translationRu: 'книга', emoji: '📖' },
      { word: 'pen', translation: 'עט', translationAr: 'قلم', translationRu: 'ручка', emoji: '🖊️' },
      { word: 'pencil', translation: 'עיפרון', translationAr: 'قلم رصاص', translationRu: 'карандаш', emoji: '✏️' },
      { word: 'desk', translation: 'שולחן כתיבה', translationAr: 'مكتب', translationRu: 'парта', emoji: '🪑' },
      { word: 'bag', translation: 'תיק', translationAr: 'حقيبة', translationRu: 'сумка', emoji: '🎒' },
      { word: 'ruler', translation: 'סרגל', translationAr: 'مسطرة', translationRu: 'линейка', emoji: '📏' },
    ],
    nature: [
      { word: 'flower', translation: 'פרח', translationAr: 'زهرة', translationRu: 'цветок', emoji: '🌸' },
      { word: 'river', translation: 'נהר', translationAr: 'نهر', translationRu: 'река', emoji: '🏞️' },
      { word: 'mountain', translation: 'הר', translationAr: 'جبل', translationRu: 'гора', emoji: '⛰️' },
      { word: 'forest', translation: 'יער', translationAr: 'غابة', translationRu: 'лес', emoji: '🌲' },
      { word: 'sea', translation: 'ים', translationAr: 'بحر', translationRu: 'море', emoji: '🌊' },
      { word: 'sky', translation: 'שמיים', translationAr: 'سماء', translationRu: 'небо', emoji: '🌤️' },
    ],
    feelings: [
      { word: 'happy', translation: 'שמח', translationAr: 'سعيد', translationRu: 'счастливый', emoji: '😊' },
      { word: 'sad', translation: 'עצוב', translationAr: 'حزين', translationRu: 'грустный', emoji: '😢' },
      { word: 'angry', translation: 'כועס', translationAr: 'غاضب', translationRu: 'злой', emoji: '😠' },
      { word: 'tired', translation: 'עייף', translationAr: 'متعب', translationRu: 'уставший', emoji: '😴' },
      { word: 'hungry', translation: 'רעב', translationAr: 'جائع', translationRu: 'голодный', emoji: '🤤' },
      { word: 'scared', translation: 'מפוחד', translationAr: 'خائف', translationRu: 'испуганный', emoji: '😨' },
    ],
    time: [
      { word: 'morning', translation: 'בוקר', translationAr: 'صباح', translationRu: 'утро', emoji: '🌅' },
      { word: 'night', translation: 'לילה', translationAr: 'ليل', translationRu: 'ночь', emoji: '🌙' },
      { word: 'today', translation: 'היום', translationAr: 'اليوم', translationRu: 'сегодня', emoji: '📅' },
      { word: 'tomorrow', translation: 'מחר', translationAr: 'غدا', translationRu: 'завтра', emoji: '➡️' },
      { word: 'day', translation: 'יום', translationAr: 'يوم', translationRu: 'день', emoji: '☀️' },
      { word: 'week', translation: 'שבוע', translationAr: 'أسبوع', translationRu: 'неделя', emoji: '📆' },
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
