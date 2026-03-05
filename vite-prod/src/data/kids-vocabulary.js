// Kids vocabulary organized by level, following Israel Ministry of Education curriculum
// Level 1: Pre-A1 Beginner (ages 4-5) — 20 simple words
// Level 2: Pre-A1+ Explorer (ages 6-7) — adds 15 more words
// Level 3: Pre-A1→A1 Reader (ages 7-8) — adds 15 more words
// Level 4: A1 Champion (ages 9-10) — adds 20+ more words

export const WORDS_BY_LEVEL = {
  1: [
    // Greetings
    { word: 'hello', emoji: '👋', translation: 'שָׁלוֹם', translationAr: 'مرحبا', translationRu: 'привет' },
    { word: 'bye', emoji: '👋', translation: 'בַּיי', translationAr: 'وداعا', translationRu: 'пока' },
    { word: 'yes', emoji: '✅', translation: 'כֵּן', translationAr: 'نعم', translationRu: 'да' },
    { word: 'no', emoji: '❌', translation: 'לֹא', translationAr: 'لا', translationRu: 'нет' },
    // Numbers
    { word: 'one', emoji: '1️⃣', translation: 'אֶחָד', translationAr: 'واحد', translationRu: 'один' },
    { word: 'two', emoji: '2️⃣', translation: 'שְׁנַיִם', translationAr: 'اثنان', translationRu: 'два' },
    // Colors
    { word: 'red', emoji: '🔴', translation: 'אָדֹם', translationAr: 'أحمر', translationRu: 'красный' },
    { word: 'blue', emoji: '🔵', translation: 'כָּחֹל', translationAr: 'أزرق', translationRu: 'синий' },
    { word: 'green', emoji: '🟢', translation: 'יָרֹק', translationAr: 'أخضر', translationRu: 'зелёный' },
    // Animals
    { word: 'cat', emoji: '🐱', translation: 'חָתוּל', translationAr: 'قطة', translationRu: 'кошка' },
    { word: 'dog', emoji: '🐶', translation: 'כֶּלֶב', translationAr: 'كلب', translationRu: 'собака' },
    { word: 'fish', emoji: '🐟', translation: 'דָּג', translationAr: 'سمكة', translationRu: 'рыба' },
    { word: 'bird', emoji: '🐦', translation: 'צִפּוֹר', translationAr: 'طائر', translationRu: 'птица' },
    // Food
    { word: 'apple', emoji: '🍎', translation: 'תַּפּוּחַ', translationAr: 'تفاحة', translationRu: 'яблоко' },
    { word: 'banana', emoji: '🍌', translation: 'בָּנָנָה', translationAr: 'موزة', translationRu: 'банан' },
    { word: 'milk', emoji: '🥛', translation: 'חָלָב', translationAr: 'حليب', translationRu: 'молоко' },
    // Basic objects
    { word: 'sun', emoji: '☀️', translation: 'שֶׁמֶשׁ', translationAr: 'شمس', translationRu: 'солнце' },
    { word: 'star', emoji: '⭐', translation: 'כּוֹכָב', translationAr: 'نجمة', translationRu: 'звезда' },
    { word: 'ball', emoji: '⚽', translation: 'כַּדּוּר', translationAr: 'كرة', translationRu: 'мяч' },
    { word: 'cake', emoji: '🎂', translation: 'עוּגָה', translationAr: 'كعكة', translationRu: 'торт' },
  ],
  2: [
    // Family
    { word: 'mom', emoji: '👩', translation: 'אִמָּא', translationAr: 'أمّ', translationRu: 'мама' },
    { word: 'dad', emoji: '👨', translation: 'אַבָּא', translationAr: 'أبّ', translationRu: 'папа' },
    { word: 'baby', emoji: '👶', translation: 'תִּינוֹק', translationAr: 'طفل رضيع', translationRu: 'малыш' },
    // Body
    { word: 'hand', emoji: '✋', translation: 'יָד', translationAr: 'يد', translationRu: 'рука' },
    { word: 'head', emoji: '🗣️', translation: 'רֹאשׁ', translationAr: 'رأس', translationRu: 'голова' },
    { word: 'eye', emoji: '👁️', translation: 'עַיִן', translationAr: 'عين', translationRu: 'глаз' },
    // Classroom
    { word: 'book', emoji: '📖', translation: 'סֵפֶר', translationAr: 'كتاب', translationRu: 'книга' },
    { word: 'pen', emoji: '🖊️', translation: 'עֵט', translationAr: 'قلم', translationRu: 'ручка' },
    // More colors
    { word: 'yellow', emoji: '🟡', translation: 'צָהֹב', translationAr: 'أصفر', translationRu: 'жёлтый' },
    { word: 'pink', emoji: '💗', translation: 'וָרֹד', translationAr: 'وردي', translationRu: 'розовый' },
    // More animals
    { word: 'duck', emoji: '🦆', translation: 'בַּרְוָז', translationAr: 'بطة', translationRu: 'утка' },
    { word: 'frog', emoji: '🐸', translation: 'צְפַרְדֵּעַ', translationAr: 'ضفدع', translationRu: 'лягушка' },
    // Adjectives
    { word: 'big', emoji: '🐘', translation: 'גָּדוֹל', translationAr: 'كبير', translationRu: 'большой' },
    { word: 'small', emoji: '🐁', translation: 'קָטָן', translationAr: 'صغير', translationRu: 'маленький' },
    { word: 'happy', emoji: '😊', translation: 'שָׂמֵחַ', translationAr: 'سعيد', translationRu: 'счастливый' },
  ],
  3: [
    // Food
    { word: 'orange', emoji: '🍊', translation: 'תַּפּוּז', translationAr: 'برتقالة', translationRu: 'апельсин' },
    { word: 'grape', emoji: '🍇', translation: 'עֲנָבִים', translationAr: 'عنب', translationRu: 'виноград' },
    { word: 'water', emoji: '💧', translation: 'מַיִם', translationAr: 'ماء', translationRu: 'вода' },
    // Weather
    { word: 'rain', emoji: '🌧️', translation: 'גֶּשֶׁם', translationAr: 'مطر', translationRu: 'дождь' },
    { word: 'moon', emoji: '🌙', translation: 'יָרֵחַ', translationAr: 'قمر', translationRu: 'луна' },
    // Home
    { word: 'house', emoji: '🏠', translation: 'בַּיִת', translationAr: 'بيت', translationRu: 'дом' },
    { word: 'door', emoji: '🚪', translation: 'דֶּלֶת', translationAr: 'باب', translationRu: 'дверь' },
    { word: 'bed', emoji: '🛏️', translation: 'מִטָּה', translationAr: 'سرير', translationRu: 'кровать' },
    // Clothing
    { word: 'hat', emoji: '🎩', translation: 'כּוֹבַע', translationAr: 'قبعة', translationRu: 'шляпа' },
    { word: 'shoe', emoji: '👟', translation: 'נַעַל', translationAr: 'حذاء', translationRu: 'туфля' },
    // Transport
    { word: 'car', emoji: '🚗', translation: 'מְכוֹנִית', translationAr: 'سيارة', translationRu: 'машина' },
    { word: 'bus', emoji: '🚌', translation: 'אוֹטוֹבּוּס', translationAr: 'حافلة', translationRu: 'автобус' },
    // Nature
    { word: 'tree', emoji: '🌳', translation: 'עֵץ', translationAr: 'شجرة', translationRu: 'дерево' },
    { word: 'flower', emoji: '🌸', translation: 'פֶּרַח', translationAr: 'زهرة', translationRu: 'цветок' },
    // More adjectives
    { word: 'hot', emoji: '🔥', translation: 'חַם', translationAr: 'حار', translationRu: 'горячий' },
  ],
  4: [
    // Bigger animals
    { word: 'elephant', emoji: '🐘', translation: 'פִּיל', translationAr: 'فيل', translationRu: 'слон' },
    { word: 'horse', emoji: '🐎', translation: 'סוּס', translationAr: 'حصان', translationRu: 'лошадь' },
    { word: 'bear', emoji: '🐻', translation: 'דֹּב', translationAr: 'دب', translationRu: 'медведь' },
    { word: 'whale', emoji: '🐋', translation: 'לִוְיָתָן', translationAr: 'حوت', translationRu: 'кит' },
    { word: 'butterfly', emoji: '🦋', translation: 'פַּרְפַּר', translationAr: 'فراشة', translationRu: 'бабочка' },
    // Verbs
    { word: 'run', emoji: '🏃', translation: 'לָרוּץ', translationAr: 'يجري', translationRu: 'бежать' },
    { word: 'eat', emoji: '🍽️', translation: 'לֶאֱכֹל', translationAr: 'يأكل', translationRu: 'есть' },
    { word: 'read', emoji: '📖', translation: 'לִקְרֹא', translationAr: 'يقرأ', translationRu: 'читать' },
    { word: 'play', emoji: '🎮', translation: 'לְשַׂחֵק', translationAr: 'يلعب', translationRu: 'играть' },
    { word: 'sing', emoji: '🎤', translation: 'לָשִׁיר', translationAr: 'يغني', translationRu: 'петь' },
    // Places
    { word: 'school', emoji: '🏫', translation: 'בֵּית סֵפֶר', translationAr: 'مدرسة', translationRu: 'школа' },
    { word: 'park', emoji: '🌳', translation: 'פָּארְק', translationAr: 'حديقة', translationRu: 'парк' },
    // More objects
    { word: 'cup', emoji: '🥤', translation: 'כּוֹס', translationAr: 'كوب', translationRu: 'кружка' },
    { word: 'heart', emoji: '❤️', translation: 'לֵב', translationAr: 'قلب', translationRu: 'сердце' },
    // Adjectives
    { word: 'cold', emoji: '🥶', translation: 'קַר', translationAr: 'بارد', translationRu: 'холодный' },
    { word: 'fast', emoji: '⚡', translation: 'מָהִיר', translationAr: 'سريع', translationRu: 'быстрый' },
    { word: 'slow', emoji: '🐢', translation: 'אִטִּי', translationAr: 'بطيء', translationRu: 'медленный' },
    // More food
    { word: 'bread', emoji: '🍞', translation: 'לֶחֶם', translationAr: 'خبز', translationRu: 'хлеб' },
    { word: 'egg', emoji: '🥚', translation: 'בֵּיצָה', translationAr: 'بيضة', translationRu: 'яйцо' },
    { word: 'rice', emoji: '🍚', translation: 'אוֹרֶז', translationAr: 'أرز', translationRu: 'рис' },
  ],
};

export const SENTENCES_BY_LEVEL = {
  1: [
    { sentence: 'Hello friend', words: ['Hello', 'friend'], emoji: '👋', translationHe: 'שלום חבר', translationAr: 'مرحبا صديقي', translationRu: 'Привет, друг' },
    { sentence: 'Red apple', words: ['Red', 'apple'], emoji: '🍎', translationHe: 'תפוח אדום', translationAr: 'تفاحة حمراء', translationRu: 'Красное яблоко' },
    { sentence: 'Blue ball', words: ['Blue', 'ball'], emoji: '⚽', translationHe: 'כדור כחול', translationAr: 'كرة زرقاء', translationRu: 'Синий мяч' },
    { sentence: 'Big dog', words: ['Big', 'dog'], emoji: '🐶', translationHe: 'כלב גדול', translationAr: 'كلب كبير', translationRu: 'Большая собака' },
    { sentence: 'Bye bye', words: ['Bye', 'bye'], emoji: '👋', translationHe: 'ביי ביי', translationAr: 'وداعا وداعا', translationRu: 'Пока пока' },
    { sentence: 'Yes please', words: ['Yes', 'please'], emoji: '✅', translationHe: 'כן בבקשה', translationAr: 'نعم من فضلك', translationRu: 'Да, пожалуйста' },
  ],
  2: [
    { sentence: 'I like cats', words: ['I', 'like', 'cats'], emoji: '🐱', translationHe: 'אני אוהב חתולים', translationAr: 'أنا أحب القطط', translationRu: 'Я люблю кошек' },
    { sentence: 'I am happy', words: ['I', 'am', 'happy'], emoji: '😊', translationHe: 'אני שמח', translationAr: 'أنا سعيد', translationRu: 'Я счастлив' },
    { sentence: 'Big red ball', words: ['Big', 'red', 'ball'], emoji: '🔴', translationHe: 'כדור אדום גדול', translationAr: 'كرة حمراء كبيرة', translationRu: 'Большой красный мяч' },
    { sentence: 'Mom and dad', words: ['Mom', 'and', 'dad'], emoji: '👨‍👩‍👦', translationHe: 'אמא ואבא', translationAr: 'أمّ وأبّ', translationRu: 'Мама и папа' },
    { sentence: 'My blue book', words: ['My', 'blue', 'book'], emoji: '📖', translationHe: 'הספר הכחול שלי', translationAr: 'كتابي الأزرق', translationRu: 'Моя синяя книга' },
    { sentence: 'I see fish', words: ['I', 'see', 'fish'], emoji: '🐟', translationHe: 'אני רואה דג', translationAr: 'أنا أرى سمكة', translationRu: 'Я вижу рыбу' },
  ],
  3: [
    { sentence: 'The sun is hot', words: ['The', 'sun', 'is', 'hot'], emoji: '☀️', translationHe: 'השמש חמה', translationAr: 'الشمس حارة', translationRu: 'Солнце горячее' },
    { sentence: 'I like apples', words: ['I', 'like', 'apples'], emoji: '🍎', translationHe: 'אני אוהב תפוחים', translationAr: 'أنا أحب التفاح', translationRu: 'Я люблю яблоки' },
    { sentence: 'The cat is small', words: ['The', 'cat', 'is', 'small'], emoji: '🐱', translationHe: 'החתול קטן', translationAr: 'القطة صغيرة', translationRu: 'Кошка маленькая' },
    { sentence: 'She has a dog', words: ['She', 'has', 'a', 'dog'], emoji: '🐶', translationHe: 'יש לה כלב', translationAr: 'عندها كلب', translationRu: 'У неё есть собака' },
    { sentence: 'The bird can fly', words: ['The', 'bird', 'can', 'fly'], emoji: '🐦', translationHe: 'הציפור יכולה לעוף', translationAr: 'الطائر يستطيع الطيران', translationRu: 'Птица умеет летать' },
    { sentence: 'He reads a book', words: ['He', 'reads', 'a', 'book'], emoji: '📖', translationHe: 'הוא קורא ספר', translationAr: 'هو يقرأ كتابا', translationRu: 'Он читает книгу' },
  ],
  4: [
    { sentence: 'She has a big dog', words: ['She', 'has', 'a', 'big', 'dog'], emoji: '🐶', translationHe: 'יש לה כלב גדול', translationAr: 'عندها كلب كبير', translationRu: 'У неё есть большая собака' },
    { sentence: 'We go to school', words: ['We', 'go', 'to', 'school'], emoji: '🏫', translationHe: 'אנחנו הולכים לבית ספר', translationAr: 'نحن نذهب إلى المدرسة', translationRu: 'Мы идём в школу' },
    { sentence: 'The fish is blue', words: ['The', 'fish', 'is', 'blue'], emoji: '🐟', translationHe: 'הדג כחול', translationAr: 'السمكة زرقاء', translationRu: 'Рыба синяя' },
    { sentence: 'They eat cake now', words: ['They', 'eat', 'cake', 'now'], emoji: '🎂', translationHe: 'הם אוכלים עוגה עכשיו', translationAr: 'هم يأكلون الكعكة الآن', translationRu: 'Они едят торт сейчас' },
    { sentence: 'I can run fast', words: ['I', 'can', 'run', 'fast'], emoji: '🏃', translationHe: 'אני יכול לרוץ מהר', translationAr: 'أنا أستطيع الجري بسرعة', translationRu: 'Я умею быстро бегать' },
    { sentence: 'The ball is red', words: ['The', 'ball', 'is', 'red'], emoji: '🔴', translationHe: 'הכדור אדום', translationAr: 'الكرة حمراء', translationRu: 'Мяч красный' },
  ],
};

export const CATEGORIES_BY_LEVEL = {
  1: [
    {
      categories: [
        { name: 'Animals', nameHe: 'חיות', nameAr: 'حيوانات', nameRu: 'Животные', emoji: '🐾', color: 'from-amber-400 to-orange-500' },
        { name: 'Food', nameHe: 'אוכל', nameAr: 'طعام', nameRu: 'Еда', emoji: '🍽️', color: 'from-green-400 to-emerald-500' },
      ],
      items: [
        { word: 'cat', emoji: '🐱', translation: 'חתול', category: 0 },
        { word: 'dog', emoji: '🐶', translation: 'כלב', category: 0 },
        { word: 'apple', emoji: '🍎', translation: 'תפוח', category: 1 },
        { word: 'cake', emoji: '🎂', translation: 'עוגה', category: 1 },
      ],
    },
  ],
  2: [
    {
      categories: [
        { name: 'Animals', nameHe: 'חיות', nameAr: 'حيوانات', nameRu: 'Животные', emoji: '🐾', color: 'from-amber-400 to-orange-500' },
        { name: 'Food', nameHe: 'אוכל', nameAr: 'طعام', nameRu: 'Еда', emoji: '🍽️', color: 'from-green-400 to-emerald-500' },
      ],
      items: [
        { word: 'cat', emoji: '🐱', translation: 'חתול', category: 0 },
        { word: 'dog', emoji: '🐶', translation: 'כלב', category: 0 },
        { word: 'fish', emoji: '🐟', translation: 'דג', category: 0 },
        { word: 'apple', emoji: '🍎', translation: 'תפוח', category: 1 },
        { word: 'cake', emoji: '🎂', translation: 'עוגה', category: 1 },
        { word: 'banana', emoji: '🍌', translation: 'בננה', category: 1 },
      ],
    },
  ],
  3: [
    {
      categories: [
        { name: 'Animals', nameHe: 'חיות', nameAr: 'حيوانات', nameRu: 'Животные', emoji: '🐾', color: 'from-amber-400 to-orange-500' },
        { name: 'Food', nameHe: 'אוכל', nameAr: 'طعام', nameRu: 'Еда', emoji: '🍽️', color: 'from-green-400 to-emerald-500' },
      ],
      items: [
        { word: 'cat', emoji: '🐱', translation: 'חתול', category: 0 },
        { word: 'dog', emoji: '🐶', translation: 'כלב', category: 0 },
        { word: 'fish', emoji: '🐟', translation: 'דג', category: 0 },
        { word: 'bird', emoji: '🐦', translation: 'ציפור', category: 0 },
        { word: 'apple', emoji: '🍎', translation: 'תפוח', category: 1 },
        { word: 'cake', emoji: '🎂', translation: 'עוגה', category: 1 },
        { word: 'banana', emoji: '🍌', translation: 'בננה', category: 1 },
        { word: 'milk', emoji: '🥛', translation: 'חלב', category: 1 },
      ],
    },
    {
      categories: [
        { name: 'Nature', nameHe: 'טבע', nameAr: 'طبيعة', nameRu: 'Природа', emoji: '🌿', color: 'from-green-400 to-teal-500' },
        { name: 'Things', nameHe: 'דברים', nameAr: 'أشياء', nameRu: 'Вещи', emoji: '📦', color: 'from-blue-400 to-indigo-500' },
      ],
      items: [
        { word: 'sun', emoji: '☀️', translation: 'שמש', category: 0 },
        { word: 'moon', emoji: '🌙', translation: 'ירח', category: 0 },
        { word: 'tree', emoji: '🌳', translation: 'עץ', category: 0 },
        { word: 'flower', emoji: '🌸', translation: 'פרח', category: 0 },
        { word: 'book', emoji: '📖', translation: 'ספר', category: 1 },
        { word: 'ball', emoji: '⚽', translation: 'כדור', category: 1 },
        { word: 'car', emoji: '🚗', translation: 'מכונית', category: 1 },
        { word: 'house', emoji: '🏠', translation: 'בית', category: 1 },
      ],
    },
  ],
  4: [
    {
      categories: [
        { name: 'Animals', nameHe: 'חיות', nameAr: 'حيوانات', nameRu: 'Животные', emoji: '🐾', color: 'from-amber-400 to-orange-500' },
        { name: 'Food', nameHe: 'אוכל', nameAr: 'طعام', nameRu: 'Еда', emoji: '🍽️', color: 'from-green-400 to-emerald-500' },
      ],
      items: [
        { word: 'cat', emoji: '🐱', translation: 'חתול', category: 0 },
        { word: 'dog', emoji: '🐶', translation: 'כלב', category: 0 },
        { word: 'fish', emoji: '🐟', translation: 'דג', category: 0 },
        { word: 'bird', emoji: '🐦', translation: 'ציפור', category: 0 },
        { word: 'apple', emoji: '🍎', translation: 'תפוח', category: 1 },
        { word: 'cake', emoji: '🎂', translation: 'עוגה', category: 1 },
        { word: 'banana', emoji: '🍌', translation: 'בננה', category: 1 },
        { word: 'milk', emoji: '🥛', translation: 'חלב', category: 1 },
      ],
    },
    {
      categories: [
        { name: 'Big', nameHe: 'גדולים', nameAr: 'كبيرة', nameRu: 'Большие', emoji: '🐘', color: 'from-purple-400 to-violet-500' },
        { name: 'Small', nameHe: 'קטנים', nameAr: 'صغيرة', nameRu: 'Маленькие', emoji: '🐁', color: 'from-pink-400 to-rose-500' },
      ],
      items: [
        { word: 'elephant', emoji: '🐘', translation: 'פיל', category: 0 },
        { word: 'whale', emoji: '🐋', translation: 'לווייתן', category: 0 },
        { word: 'horse', emoji: '🐎', translation: 'סוס', category: 0 },
        { word: 'bear', emoji: '🐻', translation: 'דוב', category: 0 },
        { word: 'mouse', emoji: '🐭', translation: 'עכבר', category: 1 },
        { word: 'ant', emoji: '🐜', translation: 'נמלה', category: 1 },
        { word: 'bee', emoji: '🐝', translation: 'דבורה', category: 1 },
        { word: 'butterfly', emoji: '🦋', translation: 'פרפר', category: 1 },
      ],
    },
  ],
};

// Returns words for the given level (includes all lower levels)
export function getWordsForLevel(level) {
  const words = [];
  for (let l = 1; l <= level; l++) {
    if (WORDS_BY_LEVEL[l]) {
      words.push(...WORDS_BY_LEVEL[l]);
    }
  }
  return words;
}

// Level metadata for display
export const LEVEL_INFO = [
  null, // index 0 unused
  { name: 'צעדים ראשונים', nameEn: 'First Steps', emoji: '🌱', color: 'from-green-400 to-emerald-500', textColor: 'text-green-600 dark:text-green-400' },
  { name: 'חוקר', nameEn: 'Explorer', emoji: '🔭', color: 'from-blue-400 to-indigo-500', textColor: 'text-blue-600 dark:text-blue-400' },
  { name: 'קורא', nameEn: 'Reader', emoji: '📖', color: 'from-purple-400 to-violet-500', textColor: 'text-purple-600 dark:text-purple-400' },
  { name: 'אלוף', nameEn: 'Champion', emoji: '🏆', color: 'from-orange-400 to-amber-500', textColor: 'text-orange-600 dark:text-orange-400' },
];

// Quest grammar fill-in-blank sentences per level
export const QUEST_GRAMMAR = {
  1: [
    { sentence: 'I ___ a cat', blank: 'have', options: ['have', 'has', 'is'], translationHe: 'יש לי חתול' },
    { sentence: 'The dog ___ big', blank: 'is', options: ['is', 'am', 'are'], translationHe: 'הכלב גדול' },
    { sentence: 'I ___ happy', blank: 'am', options: ['am', 'is', 'are'], translationHe: 'אני שמח' },
    { sentence: 'The ball ___ red', blank: 'is', options: ['is', 'am', 'has'], translationHe: 'הכדור אדום' },
    { sentence: 'I ___ an apple', blank: 'like', options: ['like', 'likes', 'liking'], translationHe: 'אני אוהב תפוח' },
    { sentence: 'Hello, ___ name is Dan', blank: 'my', options: ['my', 'me', 'I'], translationHe: 'שלום, השם שלי דן' },
    { sentence: 'The cat ___ small', blank: 'is', options: ['is', 'am', 'has'], translationHe: 'החתול קטן' },
    { sentence: 'I can ___ a star', blank: 'see', options: ['see', 'sees', 'saw'], translationHe: 'אני יכול לראות כוכב' },
  ],
  2: [
    { sentence: 'She ___ a dog', blank: 'has', options: ['has', 'have', 'had'], translationHe: 'יש לה כלב' },
    { sentence: 'We ___ friends', blank: 'are', options: ['are', 'is', 'am'], translationHe: 'אנחנו חברים' },
    { sentence: 'He ___ to school', blank: 'goes', options: ['goes', 'go', 'going'], translationHe: 'הוא הולך לבית ספר' },
    { sentence: 'They ___ playing', blank: 'are', options: ['are', 'is', 'am'], translationHe: 'הם משחקים' },
    { sentence: 'The bird ___ fly', blank: 'can', options: ['can', 'is', 'has'], translationHe: 'הציפור יכולה לעוף' },
    { sentence: 'I ___ cake', blank: 'like', options: ['like', 'likes', 'liking'], translationHe: 'אני אוהב עוגה' },
    { sentence: 'Mom ___ cooking', blank: 'is', options: ['is', 'am', 'are'], translationHe: 'אמא מבשלת' },
    { sentence: 'The sun ___ hot', blank: 'is', options: ['is', 'am', 'has'], translationHe: 'השמש חמה' },
  ],
  3: [
    { sentence: 'I ___ to the park yesterday', blank: 'went', options: ['went', 'go', 'goes'], translationHe: 'הלכתי לפארק אתמול' },
    { sentence: 'She ___ reading a book', blank: 'is', options: ['is', 'am', 'are'], translationHe: 'היא קוראת ספר' },
    { sentence: 'They ___ not like rain', blank: 'do', options: ['do', 'does', 'did'], translationHe: 'הם לא אוהבים גשם' },
    { sentence: 'He ___ fast', blank: 'runs', options: ['runs', 'run', 'running'], translationHe: 'הוא רץ מהר' },
    { sentence: 'We ___ eat lunch now', blank: 'will', options: ['will', 'was', 'is'], translationHe: 'נאכל ארוחת צהריים עכשיו' },
    { sentence: 'The flower ___ beautiful', blank: 'is', options: ['is', 'are', 'has'], translationHe: 'הפרח יפה' },
    { sentence: 'I ___ my homework', blank: 'did', options: ['did', 'do', 'does'], translationHe: 'עשיתי את שיעורי הבית' },
    { sentence: 'She ___ two cats', blank: 'has', options: ['has', 'have', 'is'], translationHe: 'יש לה שני חתולים' },
  ],
  4: [
    { sentence: 'If it rains, I ___ stay home', blank: 'will', options: ['will', 'was', 'am'], translationHe: 'אם ירד גשם, אשאר בבית' },
    { sentence: 'She ___ already eaten', blank: 'has', options: ['has', 'have', 'had'], translationHe: 'היא כבר אכלה' },
    { sentence: 'They ___ playing since morning', blank: 'have been', options: ['have been', 'has been', 'was'], translationHe: 'הם משחקים מהבוקר' },
    { sentence: 'He ___ not come yesterday', blank: 'did', options: ['did', 'does', 'do'], translationHe: 'הוא לא בא אתמול' },
    { sentence: 'We should ___ more books', blank: 'read', options: ['read', 'reads', 'reading'], translationHe: 'עלינו לקרוא יותר ספרים' },
    { sentence: 'The elephant ___ the biggest animal', blank: 'is', options: ['is', 'are', 'am'], translationHe: 'הפיל הוא החיה הגדולה ביותר' },
    { sentence: 'I ___ never seen a whale', blank: 'have', options: ['have', 'has', 'had'], translationHe: 'מעולם לא ראיתי לווייתן' },
    { sentence: 'She ___ her homework every day', blank: 'does', options: ['does', 'do', 'did'], translationHe: 'היא עושה שיעורי בית כל יום' },
  ],
};
