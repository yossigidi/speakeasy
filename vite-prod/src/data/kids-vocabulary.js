// Kids vocabulary organized by level, following Israel Ministry of Education curriculum
// Level 1: Pre-A1 Beginner (ages 4-5) — 20 simple words
// Level 2: Pre-A1+ Explorer (ages 6-7) — adds 15 more words
// Level 3: Pre-A1→A1 Reader (ages 7-8) — adds 15 more words
// Level 4: A1 Champion (ages 9-10) — adds 20+ more words

export const WORDS_BY_LEVEL = {
  1: [
    // Greetings
    { word: 'hello', emoji: '👋', translation: 'שָׁלוֹם' },
    { word: 'bye', emoji: '👋', translation: 'בַּיי' },
    { word: 'yes', emoji: '✅', translation: 'כֵּן' },
    { word: 'no', emoji: '❌', translation: 'לֹא' },
    // Numbers
    { word: 'one', emoji: '1️⃣', translation: 'אֶחָד' },
    { word: 'two', emoji: '2️⃣', translation: 'שְׁנַיִם' },
    // Colors
    { word: 'red', emoji: '🔴', translation: 'אָדֹם' },
    { word: 'blue', emoji: '🔵', translation: 'כָּחֹל' },
    { word: 'green', emoji: '🟢', translation: 'יָרֹק' },
    // Animals
    { word: 'cat', emoji: '🐱', translation: 'חָתוּל' },
    { word: 'dog', emoji: '🐶', translation: 'כֶּלֶב' },
    { word: 'fish', emoji: '🐟', translation: 'דָּג' },
    { word: 'bird', emoji: '🐦', translation: 'צִפּוֹר' },
    // Food
    { word: 'apple', emoji: '🍎', translation: 'תַּפּוּחַ' },
    { word: 'banana', emoji: '🍌', translation: 'בָּנָנָה' },
    { word: 'milk', emoji: '🥛', translation: 'חָלָב' },
    // Basic objects
    { word: 'sun', emoji: '☀️', translation: 'שֶׁמֶשׁ' },
    { word: 'star', emoji: '⭐', translation: 'כּוֹכָב' },
    { word: 'ball', emoji: '⚽', translation: 'כַּדּוּר' },
    { word: 'cake', emoji: '🎂', translation: 'עוּגָה' },
  ],
  2: [
    // Family
    { word: 'mom', emoji: '👩', translation: 'אִמָּא' },
    { word: 'dad', emoji: '👨', translation: 'אַבָּא' },
    { word: 'baby', emoji: '👶', translation: 'תִּינוֹק' },
    // Body
    { word: 'hand', emoji: '✋', translation: 'יָד' },
    { word: 'head', emoji: '🗣️', translation: 'רֹאשׁ' },
    { word: 'eye', emoji: '👁️', translation: 'עַיִן' },
    // Classroom
    { word: 'book', emoji: '📖', translation: 'סֵפֶר' },
    { word: 'pen', emoji: '🖊️', translation: 'עֵט' },
    // More colors
    { word: 'yellow', emoji: '🟡', translation: 'צָהֹב' },
    { word: 'pink', emoji: '💗', translation: 'וָרֹד' },
    // More animals
    { word: 'duck', emoji: '🦆', translation: 'בַּרְוָז' },
    { word: 'frog', emoji: '🐸', translation: 'צְפַרְדֵּעַ' },
    // Adjectives
    { word: 'big', emoji: '🐘', translation: 'גָּדוֹל' },
    { word: 'small', emoji: '🐁', translation: 'קָטָן' },
    { word: 'happy', emoji: '😊', translation: 'שָׂמֵחַ' },
  ],
  3: [
    // Food
    { word: 'orange', emoji: '🍊', translation: 'תַּפּוּז' },
    { word: 'grape', emoji: '🍇', translation: 'עֲנָבִים' },
    { word: 'water', emoji: '💧', translation: 'מַיִם' },
    // Weather
    { word: 'rain', emoji: '🌧️', translation: 'גֶּשֶׁם' },
    { word: 'moon', emoji: '🌙', translation: 'יָרֵחַ' },
    // Home
    { word: 'house', emoji: '🏠', translation: 'בַּיִת' },
    { word: 'door', emoji: '🚪', translation: 'דֶּלֶת' },
    { word: 'bed', emoji: '🛏️', translation: 'מִטָּה' },
    // Clothing
    { word: 'hat', emoji: '🎩', translation: 'כּוֹבַע' },
    { word: 'shoe', emoji: '👟', translation: 'נַעַל' },
    // Transport
    { word: 'car', emoji: '🚗', translation: 'מְכוֹנִית' },
    { word: 'bus', emoji: '🚌', translation: 'אוֹטוֹבּוּס' },
    // Nature
    { word: 'tree', emoji: '🌳', translation: 'עֵץ' },
    { word: 'flower', emoji: '🌸', translation: 'פֶּרַח' },
    // More adjectives
    { word: 'hot', emoji: '🔥', translation: 'חַם' },
  ],
  4: [
    // Bigger animals
    { word: 'elephant', emoji: '🐘', translation: 'פִּיל' },
    { word: 'horse', emoji: '🐎', translation: 'סוּס' },
    { word: 'bear', emoji: '🐻', translation: 'דֹּב' },
    { word: 'whale', emoji: '🐋', translation: 'לִוְיָתָן' },
    { word: 'butterfly', emoji: '🦋', translation: 'פַּרְפַּר' },
    // Verbs
    { word: 'run', emoji: '🏃', translation: 'לָרוּץ' },
    { word: 'eat', emoji: '🍽️', translation: 'לֶאֱכֹל' },
    { word: 'read', emoji: '📖', translation: 'לִקְרֹא' },
    { word: 'play', emoji: '🎮', translation: 'לְשַׂחֵק' },
    { word: 'sing', emoji: '🎤', translation: 'לָשִׁיר' },
    // Places
    { word: 'school', emoji: '🏫', translation: 'בֵּית סֵפֶר' },
    { word: 'park', emoji: '🌳', translation: 'פָּארְק' },
    // More objects
    { word: 'cup', emoji: '🥤', translation: 'כּוֹס' },
    { word: 'heart', emoji: '❤️', translation: 'לֵב' },
    // Adjectives
    { word: 'cold', emoji: '🥶', translation: 'קַר' },
    { word: 'fast', emoji: '⚡', translation: 'מָהִיר' },
    { word: 'slow', emoji: '🐢', translation: 'אִטִּי' },
    // More food
    { word: 'bread', emoji: '🍞', translation: 'לֶחֶם' },
    { word: 'egg', emoji: '🥚', translation: 'בֵּיצָה' },
    { word: 'rice', emoji: '🍚', translation: 'אוֹרֶז' },
  ],
};

export const SENTENCES_BY_LEVEL = {
  1: [
    { sentence: 'Hello friend', words: ['Hello', 'friend'], emoji: '👋', translationHe: 'שלום חבר' },
    { sentence: 'Red apple', words: ['Red', 'apple'], emoji: '🍎', translationHe: 'תפוח אדום' },
    { sentence: 'Blue ball', words: ['Blue', 'ball'], emoji: '⚽', translationHe: 'כדור כחול' },
    { sentence: 'Big dog', words: ['Big', 'dog'], emoji: '🐶', translationHe: 'כלב גדול' },
    { sentence: 'Bye bye', words: ['Bye', 'bye'], emoji: '👋', translationHe: 'ביי ביי' },
    { sentence: 'Yes please', words: ['Yes', 'please'], emoji: '✅', translationHe: 'כן בבקשה' },
  ],
  2: [
    { sentence: 'I like cats', words: ['I', 'like', 'cats'], emoji: '🐱', translationHe: 'אני אוהב חתולים' },
    { sentence: 'I am happy', words: ['I', 'am', 'happy'], emoji: '😊', translationHe: 'אני שמח' },
    { sentence: 'Big red ball', words: ['Big', 'red', 'ball'], emoji: '🔴', translationHe: 'כדור אדום גדול' },
    { sentence: 'Mom and dad', words: ['Mom', 'and', 'dad'], emoji: '👨‍👩‍👦', translationHe: 'אמא ואבא' },
    { sentence: 'My blue book', words: ['My', 'blue', 'book'], emoji: '📖', translationHe: 'הספר הכחול שלי' },
    { sentence: 'I see fish', words: ['I', 'see', 'fish'], emoji: '🐟', translationHe: 'אני רואה דג' },
  ],
  3: [
    { sentence: 'The sun is hot', words: ['The', 'sun', 'is', 'hot'], emoji: '☀️', translationHe: 'השמש חמה' },
    { sentence: 'I like apples', words: ['I', 'like', 'apples'], emoji: '🍎', translationHe: 'אני אוהב תפוחים' },
    { sentence: 'The cat is small', words: ['The', 'cat', 'is', 'small'], emoji: '🐱', translationHe: 'החתול קטן' },
    { sentence: 'She has a dog', words: ['She', 'has', 'a', 'dog'], emoji: '🐶', translationHe: 'יש לה כלב' },
    { sentence: 'The bird can fly', words: ['The', 'bird', 'can', 'fly'], emoji: '🐦', translationHe: 'הציפור יכולה לעוף' },
    { sentence: 'He reads a book', words: ['He', 'reads', 'a', 'book'], emoji: '📖', translationHe: 'הוא קורא ספר' },
  ],
  4: [
    { sentence: 'She has a big dog', words: ['She', 'has', 'a', 'big', 'dog'], emoji: '🐶', translationHe: 'יש לה כלב גדול' },
    { sentence: 'We go to school', words: ['We', 'go', 'to', 'school'], emoji: '🏫', translationHe: 'אנחנו הולכים לבית ספר' },
    { sentence: 'The fish is blue', words: ['The', 'fish', 'is', 'blue'], emoji: '🐟', translationHe: 'הדג כחול' },
    { sentence: 'They eat cake now', words: ['They', 'eat', 'cake', 'now'], emoji: '🎂', translationHe: 'הם אוכלים עוגה עכשיו' },
    { sentence: 'I can run fast', words: ['I', 'can', 'run', 'fast'], emoji: '🏃', translationHe: 'אני יכול לרוץ מהר' },
    { sentence: 'The ball is red', words: ['The', 'ball', 'is', 'red'], emoji: '🔴', translationHe: 'הכדור אדום' },
  ],
};

export const CATEGORIES_BY_LEVEL = {
  1: [
    {
      categories: [
        { name: 'Animals', nameHe: 'חיות', emoji: '🐾', color: 'from-amber-400 to-orange-500' },
        { name: 'Food', nameHe: 'אוכל', emoji: '🍽️', color: 'from-green-400 to-emerald-500' },
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
        { name: 'Animals', nameHe: 'חיות', emoji: '🐾', color: 'from-amber-400 to-orange-500' },
        { name: 'Food', nameHe: 'אוכל', emoji: '🍽️', color: 'from-green-400 to-emerald-500' },
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
        { name: 'Animals', nameHe: 'חיות', emoji: '🐾', color: 'from-amber-400 to-orange-500' },
        { name: 'Food', nameHe: 'אוכל', emoji: '🍽️', color: 'from-green-400 to-emerald-500' },
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
        { name: 'Nature', nameHe: 'טבע', emoji: '🌿', color: 'from-green-400 to-teal-500' },
        { name: 'Things', nameHe: 'דברים', emoji: '📦', color: 'from-blue-400 to-indigo-500' },
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
        { name: 'Animals', nameHe: 'חיות', emoji: '🐾', color: 'from-amber-400 to-orange-500' },
        { name: 'Food', nameHe: 'אוכל', emoji: '🍽️', color: 'from-green-400 to-emerald-500' },
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
        { name: 'Big', nameHe: 'גדולים', emoji: '🐘', color: 'from-purple-400 to-violet-500' },
        { name: 'Small', nameHe: 'קטנים', emoji: '🐁', color: 'from-pink-400 to-rose-500' },
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
