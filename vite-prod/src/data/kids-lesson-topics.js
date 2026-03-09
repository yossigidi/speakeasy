/**
 * Kids AI Lesson Topics
 * 4 levels × 6 topics = 24 topics
 * Each topic has ~10 words supporting 4 lessons:
 *   Lesson 1-3: 3 new words each
 *   Lesson 4: Boss review of all words
 */

export const KIDS_LESSON_LEVELS = [
  // ═══════════════════════════════════════
  // LEVEL 1 — First Words (ages 4-5)
  // ═══════════════════════════════════════
  {
    level: 1,
    name: 'First Words',
    nameHe: 'מילים ראשונות',
    nameAr: 'الكلمات الأولى',
    nameRu: 'Первые слова',
    emoji: '🌱',
    gradient: 'from-green-400 to-emerald-500',
    topics: [
      {
        id: 'greetings',
        name: 'Greetings',
        nameHe: 'ברכות',
        nameAr: 'تحيات',
        nameRu: 'Приветствия',
        emoji: '👋',
        gradient: 'from-yellow-400 to-orange-400',
        words: [
          { word: 'hello', emoji: '👋', he: 'שָׁלוֹם', ar: 'مرحبا', ru: 'привет' },
          { word: 'goodbye', emoji: '🖐️', he: 'לְהִתְרָאוֹת', ar: 'مع السلامة', ru: 'до свидания' },
          { word: 'thank you', emoji: '🙏', he: 'תּוֹדָה', ar: 'شكراً', ru: 'спасибо' },
          { word: 'please', emoji: '😊', he: 'בְּבַקָּשָׁה', ar: 'من فضلك', ru: 'пожалуйста' },
          { word: 'yes', emoji: '✅', he: 'כֵּן', ar: 'نعم', ru: 'да' },
          { word: 'no', emoji: '❌', he: 'לֹא', ar: 'لا', ru: 'нет' },
          { word: 'sorry', emoji: '😔', he: 'סְלִיחָה', ar: 'آسف', ru: 'извини' },
          { word: 'good morning', emoji: '🌅', he: 'בֹּקֶר טוֹב', ar: 'صباح الخير', ru: 'доброе утро' },
          { word: 'good night', emoji: '🌙', he: 'לַיְלָה טוֹב', ar: 'تصبح على خير', ru: 'спокойной ночи' },
        ],
      },
      {
        id: 'colors',
        name: 'Colors',
        nameHe: 'צבעים',
        nameAr: 'ألوان',
        nameRu: 'Цвета',
        emoji: '🎨',
        gradient: 'from-pink-400 to-purple-500',
        words: [
          { word: 'red', emoji: '🔴', he: 'אָדֹם', ar: 'أحمر', ru: 'красный' },
          { word: 'blue', emoji: '🔵', he: 'כָּחֹל', ar: 'أزرق', ru: 'синий' },
          { word: 'green', emoji: '🟢', he: 'יָרֹק', ar: 'أخضر', ru: 'зелёный' },
          { word: 'yellow', emoji: '🟡', he: 'צָהֹב', ar: 'أصفر', ru: 'жёлтый' },
          { word: 'orange', emoji: '🟠', he: 'כָּתֹם', ar: 'برتقالي', ru: 'оранжевый' },
          { word: 'pink', emoji: '🩷', he: 'וָרֹד', ar: 'وردي', ru: 'розовый' },
          { word: 'purple', emoji: '🟣', he: 'סָגֹל', ar: 'بنفسجي', ru: 'фиолетовый' },
          { word: 'white', emoji: '⚪', he: 'לָבָן', ar: 'أبيض', ru: 'белый' },
          { word: 'black', emoji: '⚫', he: 'שָׁחֹר', ar: 'أسود', ru: 'чёрный' },
        ],
      },
      {
        id: 'animals',
        name: 'Animals',
        nameHe: 'חיות',
        nameAr: 'حيوانات',
        nameRu: 'Животные',
        emoji: '🐾',
        gradient: 'from-amber-400 to-orange-500',
        words: [
          { word: 'dog', emoji: '🐶', he: 'כֶּלֶב', ar: 'كلب', ru: 'собака' },
          { word: 'cat', emoji: '🐱', he: 'חָתוּל', ar: 'قطة', ru: 'кошка' },
          { word: 'bird', emoji: '🐦', he: 'צִפּוֹר', ar: 'طائر', ru: 'птица' },
          { word: 'fish', emoji: '🐟', he: 'דָּג', ar: 'سمكة', ru: 'рыба' },
          { word: 'lion', emoji: '🦁', he: 'אַרְיֵה', ar: 'أسد', ru: 'лев' },
          { word: 'elephant', emoji: '🐘', he: 'פִּיל', ar: 'فيل', ru: 'слон' },
          { word: 'rabbit', emoji: '🐰', he: 'אַרְנָב', ar: 'أرنب', ru: 'кролик' },
          { word: 'monkey', emoji: '🐵', he: 'קוֹף', ar: 'قرد', ru: 'обезьяна' },
          { word: 'bear', emoji: '🐻', he: 'דֹּב', ar: 'دب', ru: 'медведь' },
        ],
      },
      {
        id: 'numbers-1',
        name: 'Numbers 1-5',
        nameHe: 'מספרים 1-5',
        nameAr: 'أرقام ١-٥',
        nameRu: 'Числа 1-5',
        emoji: '🔢',
        gradient: 'from-blue-400 to-cyan-500',
        words: [
          { word: 'one', emoji: '1️⃣', he: 'אֶחָד', ar: 'واحد', ru: 'один' },
          { word: 'two', emoji: '2️⃣', he: 'שְׁנַיִם', ar: 'اثنان', ru: 'два' },
          { word: 'three', emoji: '3️⃣', he: 'שְׁלוֹשָׁה', ar: 'ثلاثة', ru: 'три' },
          { word: 'four', emoji: '4️⃣', he: 'אַרְבָּעָה', ar: 'أربعة', ru: 'четыре' },
          { word: 'five', emoji: '5️⃣', he: 'חֲמִשָּׁה', ar: 'خمسة', ru: 'пять' },
        ],
      },
      {
        id: 'family',
        name: 'Family',
        nameHe: 'משפחה',
        nameAr: 'عائلة',
        nameRu: 'Семья',
        emoji: '👨‍👩‍👧‍👦',
        gradient: 'from-rose-400 to-pink-500',
        words: [
          { word: 'mom', emoji: '👩', he: 'אִמָּא', ar: 'أم', ru: 'мама' },
          { word: 'dad', emoji: '👨', he: 'אַבָּא', ar: 'أب', ru: 'папа' },
          { word: 'brother', emoji: '👦', he: 'אָח', ar: 'أخ', ru: 'брат' },
          { word: 'sister', emoji: '👧', he: 'אָחוֹת', ar: 'أخت', ru: 'сестра' },
          { word: 'baby', emoji: '👶', he: 'תִּינוֹק', ar: 'طفل', ru: 'малыш' },
          { word: 'grandma', emoji: '👵', he: 'סָבְתָא', ar: 'جدة', ru: 'бабушка' },
          { word: 'grandpa', emoji: '👴', he: 'סָבָא', ar: 'جد', ru: 'дедушка' },
          { word: 'friend', emoji: '🤝', he: 'חָבֵר', ar: 'صديق', ru: 'друг' },
          { word: 'teacher', emoji: '👩‍🏫', he: 'מוֹרָה', ar: 'معلمة', ru: 'учитель' },
        ],
      },
      {
        id: 'toys',
        name: 'Toys',
        nameHe: 'צעצועים',
        nameAr: 'ألعاب',
        nameRu: 'Игрушки',
        emoji: '🧸',
        gradient: 'from-teal-400 to-emerald-500',
        words: [
          { word: 'ball', emoji: '⚽', he: 'כַּדּוּר', ar: 'كرة', ru: 'мяч' },
          { word: 'car', emoji: '🚗', he: 'מְכוֹנִית', ar: 'سيارة', ru: 'машина' },
          { word: 'doll', emoji: '🧸', he: 'בּוּבָּה', ar: 'دمية', ru: 'кукла' },
          { word: 'puzzle', emoji: '🧩', he: 'פָּאזֶל', ar: 'أحجية', ru: 'пазл' },
          { word: 'robot', emoji: '🤖', he: 'רוֹבּוֹט', ar: 'روبوت', ru: 'робот' },
          { word: 'kite', emoji: '🪁', he: 'עֲפִיפוֹן', ar: 'طائرة ورقية', ru: 'воздушный змей' },
          { word: 'train', emoji: '🚂', he: 'רַכֶּבֶת', ar: 'قطار', ru: 'поезд' },
          { word: 'drum', emoji: '🥁', he: 'תֹּף', ar: 'طبل', ru: 'барабан' },
          { word: 'book', emoji: '📖', he: 'סֵפֶר', ar: 'كتاب', ru: 'книга' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════
  // LEVEL 2 — Word Builder (ages 6-7)
  // ═══════════════════════════════════════
  {
    level: 2,
    name: 'Word Builder',
    nameHe: 'בונה מילים',
    nameAr: 'بناء الكلمات',
    nameRu: 'Строитель слов',
    emoji: '🧱',
    gradient: 'from-blue-400 to-indigo-500',
    topics: [
      {
        id: 'food',
        name: 'Food',
        nameHe: 'אוכל',
        nameAr: 'طعام',
        nameRu: 'Еда',
        emoji: '🍕',
        gradient: 'from-red-400 to-orange-500',
        words: [
          { word: 'apple', emoji: '🍎', he: 'תַּפּוּחַ', ar: 'تفاحة', ru: 'яблоко' },
          { word: 'banana', emoji: '🍌', he: 'בָּנָנָה', ar: 'موزة', ru: 'банан' },
          { word: 'pizza', emoji: '🍕', he: 'פִּיצָה', ar: 'بيتزا', ru: 'пицца' },
          { word: 'milk', emoji: '🥛', he: 'חָלָב', ar: 'حليب', ru: 'молоко' },
          { word: 'bread', emoji: '🍞', he: 'לֶחֶם', ar: 'خبز', ru: 'хлеб' },
          { word: 'juice', emoji: '🧃', he: 'מִיץ', ar: 'عصير', ru: 'сок' },
          { word: 'cake', emoji: '🎂', he: 'עוּגָה', ar: 'كعكة', ru: 'торт' },
          { word: 'egg', emoji: '🥚', he: 'בֵּיצָה', ar: 'بيضة', ru: 'яйцо' },
          { word: 'water', emoji: '💧', he: 'מַיִם', ar: 'ماء', ru: 'вода' },
        ],
      },
      {
        id: 'clothes',
        name: 'Clothes',
        nameHe: 'בגדים',
        nameAr: 'ملابس',
        nameRu: 'Одежда',
        emoji: '👕',
        gradient: 'from-violet-400 to-purple-500',
        words: [
          { word: 'shirt', emoji: '👕', he: 'חוּלְצָה', ar: 'قميص', ru: 'рубашка' },
          { word: 'shoes', emoji: '👟', he: 'נַעֲלַיִם', ar: 'حذاء', ru: 'ботинки' },
          { word: 'hat', emoji: '🧢', he: 'כּוֹבַע', ar: 'قبعة', ru: 'шляпа' },
          { word: 'jacket', emoji: '🧥', he: 'מְעִיל', ar: 'سترة', ru: 'куртка' },
          { word: 'pants', emoji: '👖', he: 'מִכְנָסַיִם', ar: 'بنطلون', ru: 'брюки' },
          { word: 'socks', emoji: '🧦', he: 'גַּרְבַּיִם', ar: 'جوارب', ru: 'носки' },
          { word: 'dress', emoji: '👗', he: 'שִׂמְלָה', ar: 'فستان', ru: 'платье' },
          { word: 'scarf', emoji: '🧣', he: 'צָעִיף', ar: 'وشاح', ru: 'шарф' },
          { word: 'glasses', emoji: '👓', he: 'מִשְׁקָפַיִם', ar: 'نظارات', ru: 'очки' },
        ],
      },
      {
        id: 'body',
        name: 'Body Parts',
        nameHe: 'חלקי גוף',
        nameAr: 'أجزاء الجسم',
        nameRu: 'Части тела',
        emoji: '🫀',
        gradient: 'from-pink-400 to-rose-500',
        words: [
          { word: 'eyes', emoji: '👀', he: 'עֵינַיִם', ar: 'عيون', ru: 'глаза' },
          { word: 'nose', emoji: '👃', he: 'אַף', ar: 'أنف', ru: 'нос' },
          { word: 'mouth', emoji: '👄', he: 'פֶּה', ar: 'فم', ru: 'рот' },
          { word: 'hands', emoji: '🤲', he: 'יָדַיִם', ar: 'يدين', ru: 'руки' },
          { word: 'feet', emoji: '🦶', he: 'רַגְלַיִם', ar: 'قدمين', ru: 'ноги' },
          { word: 'ears', emoji: '👂', he: 'אוֹזְנַיִם', ar: 'أذنين', ru: 'уши' },
          { word: 'head', emoji: '🗣️', he: 'רֹאשׁ', ar: 'رأس', ru: 'голова' },
          { word: 'hair', emoji: '💇', he: 'שֵׂעָר', ar: 'شعر', ru: 'волосы' },
          { word: 'teeth', emoji: '🦷', he: 'שִׁינַיִם', ar: 'أسنان', ru: 'أسنان' },
        ],
      },
      {
        id: 'shapes',
        name: 'Shapes',
        nameHe: 'צורות',
        nameAr: 'أشكال',
        nameRu: 'Фигуры',
        emoji: '🔷',
        gradient: 'from-cyan-400 to-blue-500',
        words: [
          { word: 'circle', emoji: '⭕', he: 'עִיגּוּל', ar: 'دائرة', ru: 'круг' },
          { word: 'square', emoji: '🟧', he: 'רִיבּוּעַ', ar: 'مربع', ru: 'квадрат' },
          { word: 'triangle', emoji: '🔺', he: 'מְשׁוּלָשׁ', ar: 'مثلث', ru: 'треугольник' },
          { word: 'star', emoji: '⭐', he: 'כּוֹכָב', ar: 'نجمة', ru: 'звезда' },
          { word: 'heart', emoji: '❤️', he: 'לֵב', ar: 'قلب', ru: 'сердце' },
          { word: 'diamond', emoji: '💎', he: 'יָהָלוֹם', ar: 'ماسة', ru: 'ромб' },
        ],
      },
      {
        id: 'numbers-2',
        name: 'Numbers 6-10',
        nameHe: 'מספרים 6-10',
        nameAr: 'أرقام ٦-١٠',
        nameRu: 'Числа 6-10',
        emoji: '🔟',
        gradient: 'from-indigo-400 to-violet-500',
        words: [
          { word: 'six', emoji: '6️⃣', he: 'שֵׁשׁ', ar: 'ستة', ru: 'шесть' },
          { word: 'seven', emoji: '7️⃣', he: 'שֶׁבַע', ar: 'سبعة', ru: 'семь' },
          { word: 'eight', emoji: '8️⃣', he: 'שְׁמוֹנֶה', ar: 'ثمانية', ru: 'восемь' },
          { word: 'nine', emoji: '9️⃣', he: 'תֵּשַׁע', ar: 'تسعة', ru: 'девять' },
          { word: 'ten', emoji: '🔟', he: 'עֶשֶׂר', ar: 'عشرة', ru: 'десять' },
        ],
      },
      {
        id: 'nature',
        name: 'Nature',
        nameHe: 'טבע',
        nameAr: 'طبيعة',
        nameRu: 'Природа',
        emoji: '🌳',
        gradient: 'from-green-400 to-teal-500',
        words: [
          { word: 'sun', emoji: '☀️', he: 'שֶׁמֶשׁ', ar: 'شمس', ru: 'солнце' },
          { word: 'moon', emoji: '🌙', he: 'יָרֵחַ', ar: 'قمر', ru: 'луна' },
          { word: 'tree', emoji: '🌳', he: 'עֵץ', ar: 'شجرة', ru: 'дерево' },
          { word: 'flower', emoji: '🌸', he: 'פֶּרַח', ar: 'زهرة', ru: 'цветок' },
          { word: 'rain', emoji: '🌧️', he: 'גֶּשֶׁם', ar: 'مطر', ru: 'дождь' },
          { word: 'cloud', emoji: '☁️', he: 'עָנָן', ar: 'سحابة', ru: 'облако' },
          { word: 'snow', emoji: '❄️', he: 'שֶׁלֶג', ar: 'ثلج', ru: 'снег' },
          { word: 'water', emoji: '💧', he: 'מַיִם', ar: 'ماء', ru: 'вода' },
          { word: 'mountain', emoji: '⛰️', he: 'הַר', ar: 'جبل', ru: 'гора' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════
  // LEVEL 3 — Simple Phrases (ages 7-8)
  // ═══════════════════════════════════════
  {
    level: 3,
    name: 'Simple Phrases',
    nameHe: 'ביטויים פשוטים',
    nameAr: 'عبارات بسيطة',
    nameRu: 'Простые фразы',
    emoji: '💬',
    gradient: 'from-purple-400 to-pink-500',
    topics: [
      {
        id: 'i-like',
        name: 'I Like...',
        nameHe: 'אני אוהב...',
        nameAr: 'أنا أحب...',
        nameRu: 'Мне нравится...',
        emoji: '❤️',
        gradient: 'from-red-400 to-rose-500',
        pattern: 'I like {word}',
        patternHe: 'אני אוהב {word}',
        patternAr: 'أنا أحب {word}',
        patternRu: 'Мне нравится {word}',
        words: [
          { word: 'apples', emoji: '🍎', he: 'תַּפּוּחִים', ar: 'التفاح', ru: 'яблоки' },
          { word: 'dogs', emoji: '🐶', he: 'כְּלָבִים', ar: 'الكلاب', ru: 'собаки' },
          { word: 'pizza', emoji: '🍕', he: 'פִּיצָה', ar: 'البيتزا', ru: 'пиццу' },
          { word: 'music', emoji: '🎵', he: 'מוּזִיקָה', ar: 'الموسيقى', ru: 'музыку' },
          { word: 'games', emoji: '🎮', he: 'מִשְׂחָקִים', ar: 'الألعاب', ru: 'игры' },
          { word: 'chocolate', emoji: '🍫', he: 'שׁוֹקוֹלָד', ar: 'الشوكولاتة', ru: 'шоколад' },
          { word: 'football', emoji: '⚽', he: 'כַּדּוּרֶגֶל', ar: 'كرة القدم', ru: 'футбол' },
          { word: 'ice cream', emoji: '🍦', he: 'גְּלִידָה', ar: 'الآيس كريم', ru: 'мороженое' },
          { word: 'books', emoji: '📚', he: 'סְפָרִים', ar: 'الكتب', ru: 'книги' },
        ],
      },
      {
        id: 'i-see',
        name: 'I See...',
        nameHe: 'אני רואה...',
        nameAr: 'أنا أرى...',
        nameRu: 'Я вижу...',
        emoji: '👁️',
        gradient: 'from-sky-400 to-blue-500',
        pattern: 'I see a {word}',
        patternHe: 'אני רואה {word}',
        patternAr: 'أنا أرى {word}',
        patternRu: 'Я вижу {word}',
        words: [
          { word: 'cat', emoji: '🐱', he: 'חָתוּל', ar: 'قطة', ru: 'кошку' },
          { word: 'tree', emoji: '🌳', he: 'עֵץ', ar: 'شجرة', ru: 'дерево' },
          { word: 'bird', emoji: '🐦', he: 'צִפּוֹר', ar: 'طائر', ru: 'птицу' },
          { word: 'car', emoji: '🚗', he: 'מְכוֹנִית', ar: 'سيارة', ru: 'машину' },
          { word: 'flower', emoji: '🌸', he: 'פֶּרַח', ar: 'زهرة', ru: 'цветок' },
          { word: 'star', emoji: '⭐', he: 'כּוֹכָב', ar: 'نجمة', ru: 'звезду' },
          { word: 'house', emoji: '🏠', he: 'בַּיִת', ar: 'بيت', ru: 'дом' },
          { word: 'butterfly', emoji: '🦋', he: 'פַּרְפַּר', ar: 'فراشة', ru: 'бабочку' },
          { word: 'rainbow', emoji: '🌈', he: 'קֶשֶׁת', ar: 'قوس قزح', ru: 'радугу' },
        ],
      },
      {
        id: 'this-is',
        name: 'This Is...',
        nameHe: 'זה...',
        nameAr: 'هذا...',
        nameRu: 'Это...',
        emoji: '👆',
        gradient: 'from-amber-400 to-yellow-500',
        pattern: 'This is a {word}',
        patternHe: 'זֶה {word}',
        patternAr: 'هذا {word}',
        patternRu: 'Это {word}',
        words: [
          { word: 'ball', emoji: '⚽', he: 'כַּדּוּר', ar: 'كرة', ru: 'мяч' },
          { word: 'book', emoji: '📖', he: 'סֵפֶר', ar: 'كتاب', ru: 'книга' },
          { word: 'dog', emoji: '🐶', he: 'כֶּלֶב', ar: 'كلب', ru: 'собака' },
          { word: 'pen', emoji: '🖊️', he: 'עֵט', ar: 'قلم', ru: 'ручка' },
          { word: 'cup', emoji: '🥤', he: 'כּוֹס', ar: 'كوب', ru: 'чашка' },
          { word: 'shoe', emoji: '👟', he: 'נַעַל', ar: 'حذاء', ru: 'ботинок' },
          { word: 'chair', emoji: '🪑', he: 'כִּסֵּא', ar: 'كرسي', ru: 'стул' },
          { word: 'table', emoji: '🪵', he: 'שׁוּלְחָן', ar: 'طاولة', ru: 'стол' },
          { word: 'phone', emoji: '📱', he: 'טֶלֶפוֹן', ar: 'هاتف', ru: 'телефон' },
        ],
      },
      {
        id: 'colors-things',
        name: 'Color + Thing',
        nameHe: 'צבע + דבר',
        nameAr: 'لون + شيء',
        nameRu: 'Цвет + предмет',
        emoji: '🎯',
        gradient: 'from-emerald-400 to-green-500',
        pattern: '{color} {word}',
        words: [
          { word: 'red ball', emoji: '🔴', he: 'כַּדּוּר אָדֹם', ar: 'كرة حمراء', ru: 'красный мяч' },
          { word: 'blue car', emoji: '🔵', he: 'מְכוֹנִית כְּחוּלָה', ar: 'سيارة زرقاء', ru: 'синяя машина' },
          { word: 'green tree', emoji: '🟢', he: 'עֵץ יָרֹק', ar: 'شجرة خضراء', ru: 'зелёное дерево' },
          { word: 'yellow sun', emoji: '🟡', he: 'שֶׁמֶשׁ צְהוּבָּה', ar: 'شمس صفراء', ru: 'жёлтое солнце' },
          { word: 'pink flower', emoji: '🌸', he: 'פֶּרַח וָרֹד', ar: 'زهرة وردية', ru: 'розовый цветок' },
          { word: 'white cloud', emoji: '☁️', he: 'עָנָן לָבָן', ar: 'سحابة بيضاء', ru: 'белое облако' },
          { word: 'black cat', emoji: '🐱', he: 'חָתוּל שָׁחֹר', ar: 'قطة سوداء', ru: 'чёрная кошка' },
          { word: 'orange fish', emoji: '🐠', he: 'דָּג כָּתֹם', ar: 'سمكة برتقالية', ru: 'оранжевая рыба' },
          { word: 'big dog', emoji: '🐕', he: 'כֶּלֶב גָּדוֹל', ar: 'كلب كبير', ru: 'большая собака' },
        ],
      },
      {
        id: 'actions',
        name: 'Action Words',
        nameHe: 'מילות פעולה',
        nameAr: 'أفعال',
        nameRu: 'Действия',
        emoji: '🏃',
        gradient: 'from-orange-400 to-red-500',
        words: [
          { word: 'run', emoji: '🏃', he: 'לָרוּץ', ar: 'يركض', ru: 'бегать' },
          { word: 'jump', emoji: '🤸', he: 'לִקְפּוֹץ', ar: 'يقفز', ru: 'прыгать' },
          { word: 'eat', emoji: '🍽️', he: 'לֶאֱכֹל', ar: 'يأكل', ru: 'есть' },
          { word: 'drink', emoji: '🥤', he: 'לִשְׁתּוֹת', ar: 'يشرب', ru: 'пить' },
          { word: 'play', emoji: '🎮', he: 'לְשַׂחֵק', ar: 'يلعب', ru: 'играть' },
          { word: 'sleep', emoji: '😴', he: 'לִישׁוֹן', ar: 'ينام', ru: 'спать' },
          { word: 'sing', emoji: '🎤', he: 'לָשִׁיר', ar: 'يغني', ru: 'петь' },
          { word: 'dance', emoji: '💃', he: 'לִרְקוֹד', ar: 'يرقص', ru: 'танцевать' },
          { word: 'read', emoji: '📖', he: 'לִקְרוֹא', ar: 'يقرأ', ru: 'читать' },
        ],
      },
      {
        id: 'weather',
        name: 'Weather',
        nameHe: 'מזג אוויר',
        nameAr: 'الطقس',
        nameRu: 'Погода',
        emoji: '🌤️',
        gradient: 'from-sky-400 to-cyan-500',
        pattern: 'It is {word}',
        patternHe: 'הַיוֹם {word}',
        patternAr: 'الطقس {word}',
        patternRu: 'Сегодня {word}',
        words: [
          { word: 'sunny', emoji: '☀️', he: 'שִׁמְשִׁי', ar: 'مشمس', ru: 'солнечно' },
          { word: 'rainy', emoji: '🌧️', he: 'גָּשׁוּם', ar: 'ممطر', ru: 'дождливо' },
          { word: 'cloudy', emoji: '☁️', he: 'מְעוּנָּן', ar: 'غائم', ru: 'облачно' },
          { word: 'windy', emoji: '💨', he: 'סוֹעֵר', ar: 'عاصف', ru: 'ветрено' },
          { word: 'snowy', emoji: '❄️', he: 'מוּשְׁלָג', ar: 'مثلج', ru: 'снежно' },
          { word: 'hot', emoji: '🥵', he: 'חַם', ar: 'حار', ru: 'жарко' },
          { word: 'cold', emoji: '🥶', he: 'קַר', ar: 'بارد', ru: 'холодно' },
          { word: 'warm', emoji: '😊', he: 'חָמִים', ar: 'دافئ', ru: 'тепло' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════
  // LEVEL 4 — Mini Sentences (ages 8-10)
  // ═══════════════════════════════════════
  {
    level: 4,
    name: 'Mini Sentences',
    nameHe: 'משפטים קצרים',
    nameAr: 'جمل قصيرة',
    nameRu: 'Короткие предложения',
    emoji: '📝',
    gradient: 'from-indigo-400 to-purple-500',
    topics: [
      {
        id: 'descriptions',
        name: 'Descriptions',
        nameHe: 'תיאורים',
        nameAr: 'أوصاف',
        nameRu: 'Описания',
        emoji: '🔍',
        gradient: 'from-teal-400 to-cyan-500',
        words: [
          { word: 'big', emoji: '🐘', he: 'גָּדוֹל', ar: 'كبير', ru: 'большой' },
          { word: 'small', emoji: '🐜', he: 'קָטָן', ar: 'صغير', ru: 'маленький' },
          { word: 'tall', emoji: '🦒', he: 'גָּבוֹהַ', ar: 'طويل', ru: 'высокий' },
          { word: 'short', emoji: '🐿️', he: 'נָמוּךְ', ar: 'قصير', ru: 'короткий' },
          { word: 'fast', emoji: '🐆', he: 'מָהִיר', ar: 'سريع', ru: 'быстрый' },
          { word: 'slow', emoji: '🐢', he: 'אִטִּי', ar: 'بطيء', ru: 'медленный' },
          { word: 'happy', emoji: '😊', he: 'שָׂמֵחַ', ar: 'سعيد', ru: 'счастливый' },
          { word: 'sad', emoji: '😢', he: 'עָצוּב', ar: 'حزين', ru: 'грустный' },
          { word: 'strong', emoji: '💪', he: 'חָזָק', ar: 'قوي', ru: 'сильный' },
        ],
      },
      {
        id: 'i-have',
        name: 'I Have...',
        nameHe: 'יש לי...',
        nameAr: 'لدي...',
        nameRu: 'У меня есть...',
        emoji: '🎒',
        gradient: 'from-amber-400 to-orange-500',
        pattern: 'I have a {word}',
        patternHe: 'יֵשׁ לִי {word}',
        patternAr: 'لدي {word}',
        patternRu: 'У меня есть {word}',
        words: [
          { word: 'dog', emoji: '🐶', he: 'כֶּלֶב', ar: 'كلب', ru: 'собака' },
          { word: 'book', emoji: '📖', he: 'סֵפֶר', ar: 'كتاب', ru: 'книга' },
          { word: 'ball', emoji: '⚽', he: 'כַּדּוּר', ar: 'كرة', ru: 'мяч' },
          { word: 'hat', emoji: '🧢', he: 'כּוֹבַע', ar: 'قبعة', ru: 'шляпа' },
          { word: 'bike', emoji: '🚲', he: 'אוֹפַנַיִם', ar: 'دراجة', ru: 'велосипед' },
          { word: 'pencil', emoji: '✏️', he: 'עִפָּרוֹן', ar: 'قلم رصاص', ru: 'карандаш' },
          { word: 'cat', emoji: '🐱', he: 'חָתוּל', ar: 'قطة', ru: 'кошка' },
          { word: 'toy', emoji: '🧸', he: 'צַעֲצוּעַ', ar: 'لعبة', ru: 'игрушка' },
          { word: 'friend', emoji: '🤝', he: 'חָבֵר', ar: 'صديق', ru: 'друг' },
        ],
      },
      {
        id: 'questions',
        name: 'Questions',
        nameHe: 'שאלות',
        nameAr: 'أسئلة',
        nameRu: 'Вопросы',
        emoji: '❓',
        gradient: 'from-violet-400 to-purple-500',
        words: [
          { word: 'What is this?', emoji: '🤔', he: 'מָה זֶה?', ar: 'ما هذا؟', ru: 'Что это?' },
          { word: 'Where is it?', emoji: '🗺️', he: 'אֵיפֹה זֶה?', ar: 'أين هذا؟', ru: 'Где это?' },
          { word: 'Who is it?', emoji: '👤', he: 'מִי זֶה?', ar: 'من هذا؟', ru: 'Кто это?' },
          { word: 'How are you?', emoji: '😊', he: 'מָה שְׁלוֹמְךָ?', ar: 'كيف حالك؟', ru: 'Как дела?' },
          { word: 'How many?', emoji: '🔢', he: 'כַּמָּה?', ar: 'كم عدد؟', ru: 'Сколько?' },
          { word: 'Do you like?', emoji: '❤️', he: 'אַתָּה אוֹהֵב?', ar: 'هل تحب؟', ru: 'Тебе нравится?' },
          { word: 'Can I?', emoji: '🙋', he: 'אֶפְשָׁר?', ar: 'هل يمكنني؟', ru: 'Можно?' },
          { word: 'What color?', emoji: '🎨', he: 'אֵיזֶה צֶבַע?', ar: 'أي لون؟', ru: 'Какой цвет?' },
        ],
      },
      {
        id: 'daily',
        name: 'Daily Routine',
        nameHe: 'שגרת יום',
        nameAr: 'روتين يومي',
        nameRu: 'Распорядок дня',
        emoji: '📅',
        gradient: 'from-sky-400 to-blue-500',
        words: [
          { word: 'wake up', emoji: '⏰', he: 'לְהִתְעוֹרֵר', ar: 'يستيقظ', ru: 'просыпаться' },
          { word: 'brush teeth', emoji: '🪥', he: 'לְצַחְצֵחַ שִׁינַיִם', ar: 'ينظف أسنانه', ru: 'чистить зубы' },
          { word: 'eat breakfast', emoji: '🥣', he: 'לֶאֱכֹל אֲרוּחַת בֹּקֶר', ar: 'يتناول الفطور', ru: 'завтракать' },
          { word: 'go to school', emoji: '🏫', he: 'לָלֶכֶת לְבֵית סֵפֶר', ar: 'يذهب إلى المدرسة', ru: 'идти в школу' },
          { word: 'do homework', emoji: '📝', he: 'לַעֲשׂוֹת שִׁעוּרֵי בַּיִת', ar: 'يعمل الواجب', ru: 'делать уроки' },
          { word: 'take a bath', emoji: '🛁', he: 'לְהִתְרַחֵץ', ar: 'يستحم', ru: 'принимать ванну' },
          { word: 'go to sleep', emoji: '😴', he: 'לָלֶכֶת לִישׁוֹן', ar: 'ينام', ru: 'ложиться спать' },
          { word: 'play outside', emoji: '🏞️', he: 'לְשַׂחֵק בַּחוּץ', ar: 'يلعب في الخارج', ru: 'играть на улице' },
        ],
      },
      {
        id: 'places',
        name: 'Places',
        nameHe: 'מקומות',
        nameAr: 'أماكن',
        nameRu: 'Места',
        emoji: '🏠',
        gradient: 'from-green-400 to-emerald-500',
        words: [
          { word: 'home', emoji: '🏠', he: 'בַּיִת', ar: 'بيت', ru: 'дом' },
          { word: 'school', emoji: '🏫', he: 'בֵּית סֵפֶר', ar: 'مدرسة', ru: 'школа' },
          { word: 'park', emoji: '🏞️', he: 'פַּארְק', ar: 'حديقة', ru: 'парк' },
          { word: 'store', emoji: '🏪', he: 'חֲנוּת', ar: 'متجر', ru: 'магазин' },
          { word: 'beach', emoji: '🏖️', he: 'חוֹף', ar: 'شاطئ', ru: 'пляж' },
          { word: 'zoo', emoji: '🦁', he: 'גַּן חַיּוֹת', ar: 'حديقة الحيوان', ru: 'зоопарк' },
          { word: 'library', emoji: '📚', he: 'סִפְרִיָּה', ar: 'مكتبة', ru: 'библиотека' },
          { word: 'playground', emoji: '🛝', he: 'גַּן שַׁעֲשׁוּעִים', ar: 'ملعب', ru: 'площадка' },
          { word: 'hospital', emoji: '🏥', he: 'בֵּית חוֹלִים', ar: 'مستشفى', ru: 'больница' },
        ],
      },
      {
        id: 'conversation',
        name: 'Conversation',
        nameHe: 'שיחה',
        nameAr: 'محادثة',
        nameRu: 'Разговор',
        emoji: '💬',
        gradient: 'from-pink-400 to-rose-500',
        words: [
          { word: 'My name is...', emoji: '🏷️', he: 'שְׁמִי...', ar: 'اسمي...', ru: 'Меня зовут...' },
          { word: 'I am ... years old', emoji: '🎂', he: 'אֲנִי בֶּן ...', ar: 'عمري ... سنوات', ru: 'Мне ... лет' },
          { word: 'I feel happy', emoji: '😊', he: 'אֲנִי מַרְגִּישׁ שָׂמֵחַ', ar: 'أنا سعيد', ru: 'Я рад' },
          { word: 'I feel sad', emoji: '😢', he: 'אֲנִי מַרְגִּישׁ עָצוּב', ar: 'أنا حزين', ru: 'Мне грустно' },
          { word: 'I want...', emoji: '🙋', he: 'אֲנִי רוֹצֶה...', ar: 'أنا أريد...', ru: 'Я хочу...' },
          { word: 'I can...', emoji: '💪', he: 'אֲנִי יָכוֹל...', ar: 'أنا أستطيع...', ru: 'Я могу...' },
          { word: 'Let\'s play!', emoji: '🎮', he: 'בּוֹאוּ נְשַׂחֵק!', ar: 'هيا نلعب!', ru: 'Давай играть!' },
          { word: 'See you!', emoji: '👋', he: 'לְהִתְרָאוֹת!', ar: 'أراك لاحقاً!', ru: 'Увидимся!' },
          { word: 'Well done!', emoji: '👏', he: 'כׇּל הַכָּבוֹד!', ar: 'أحسنت!', ru: 'Молодец!' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════
  // LEVEL 5 — Speaking Play (ages 9-11)
  // ═══════════════════════════════════════
  {
    level: 5,
    name: 'Speaking Play',
    nameHe: 'משחקי דיבור',
    nameAr: 'ألعاب الكلام',
    nameRu: 'Разговорные игры',
    emoji: '🎭',
    gradient: 'from-orange-400 to-red-500',
    topics: [
      {
        id: 'introductions',
        name: 'Introductions',
        nameHe: 'הצגה עצמית',
        nameAr: 'تقديم النفس',
        nameRu: 'Знакомство',
        emoji: '🤝',
        gradient: 'from-blue-400 to-indigo-500',
        words: [
          { word: 'My name is Tom', emoji: '🏷️', he: 'שְׁמִי טוֹם', ar: 'اسمي توم', ru: 'Меня зовут Том' },
          { word: 'I am seven years old', emoji: '7️⃣', he: 'אֲנִי בֶּן שֶׁבַע', ar: 'عمري سبع سنوات', ru: 'Мне семь лет' },
          { word: 'I live in Israel', emoji: '🏠', he: 'אֲנִי גָּר בְּיִשְׂרָאֵל', ar: 'أنا أعيش في إسرائيل', ru: 'Я живу в Израиле' },
          { word: 'Nice to meet you', emoji: '😊', he: 'נָעִים לְהַכִּיר', ar: 'سعيد بلقائك', ru: 'Приятно познакомиться' },
          { word: 'What is your name?', emoji: '❓', he: 'מָה שִׁמְךָ?', ar: 'ما اسمك؟', ru: 'Как тебя зовут?' },
          { word: 'How old are you?', emoji: '🎂', he: 'בֶּן כַּמָּה אַתָּה?', ar: 'كم عمرك؟', ru: 'Сколько тебе лет?' },
          { word: 'Where do you live?', emoji: '🗺️', he: 'אֵיפֹה אַתָּה גָּר?', ar: 'أين تعيش؟', ru: 'Где ты живёшь?' },
          { word: 'I am a student', emoji: '🎒', he: 'אֲנִי תַּלְמִיד', ar: 'أنا طالب', ru: 'Я ученик' },
          { word: 'This is my friend', emoji: '🤝', he: 'זֶה הַחָבֵר שֶׁלִּי', ar: 'هذا صديقي', ru: 'Это мой друг' },
        ],
      },
      {
        id: 'favorites',
        name: 'My Favorites',
        nameHe: 'האהובים שלי',
        nameAr: 'المفضلات',
        nameRu: 'Мои любимые',
        emoji: '⭐',
        gradient: 'from-yellow-400 to-amber-500',
        words: [
          { word: 'My favorite color is blue', emoji: '💙', he: 'הַצֶּבַע הָאָהוּב עָלַי הוּא כָּחֹל', ar: 'لوني المفضل أزرق', ru: 'Мой любимый цвет синий' },
          { word: 'My favorite food is pizza', emoji: '🍕', he: 'הָאֹכֶל הָאָהוּב עָלַי הוּא פִּיצָה', ar: 'طعامي المفضل البيتزا', ru: 'Моя любимая еда пицца' },
          { word: 'My favorite animal is a dog', emoji: '🐶', he: 'הַחַיָּה הָאֲהוּבָה עָלַי הִיא כֶּלֶב', ar: 'حيواني المفضل الكلب', ru: 'Моё любимое животное собака' },
          { word: 'I love to play football', emoji: '⚽', he: 'אֲנִי אוֹהֵב לְשַׂחֵק כַּדּוּרֶגֶל', ar: 'أحب لعب كرة القدم', ru: 'Я люблю играть в футбол' },
          { word: 'I love to draw', emoji: '🎨', he: 'אֲנִי אוֹהֵב לְצַיֵּר', ar: 'أحب الرسم', ru: 'Я люблю рисовать' },
          { word: 'I love to sing', emoji: '🎤', he: 'אֲנִי אוֹהֵב לָשִׁיר', ar: 'أحب الغناء', ru: 'Я люблю петь' },
          { word: 'My favorite game is...', emoji: '🎮', he: 'הַמִּשְׂחָק הָאָהוּב עָלַי הוּא...', ar: 'لعبتي المفضلة هي...', ru: 'Моя любимая игра...' },
          { word: 'My favorite season is summer', emoji: '☀️', he: 'הָעוֹנָה הָאֲהוּבָה עָלַי הִיא קַיִץ', ar: 'فصلي المفضل الصيف', ru: 'Моё любимое время года лето' },
          { word: 'I like weekends', emoji: '🎉', he: 'אֲנִי אוֹהֵב סוֹפְשָׁבוּעַ', ar: 'أحب عطلة نهاية الأسبوع', ru: 'Я люблю выходные' },
        ],
      },
      {
        id: 'asking-questions',
        name: 'Asking Questions',
        nameHe: 'שואלים שאלות',
        nameAr: 'طرح الأسئلة',
        nameRu: 'Задаём вопросы',
        emoji: '🙋',
        gradient: 'from-violet-400 to-purple-500',
        words: [
          { word: 'What is this?', emoji: '🤔', he: 'מָה זֶה?', ar: 'ما هذا؟', ru: 'Что это?' },
          { word: 'Where is the ball?', emoji: '⚽', he: 'אֵיפֹה הַכַּדּוּר?', ar: 'أين الكرة؟', ru: 'Где мяч?' },
          { word: 'Can I have water?', emoji: '💧', he: 'אֶפְשָׁר מַיִם?', ar: 'هل يمكنني الحصول على ماء؟', ru: 'Можно воды?' },
          { word: 'Do you want to play?', emoji: '🎮', he: 'אַתָּה רוֹצֶה לְשַׂחֵק?', ar: 'هل تريد أن تلعب؟', ru: 'Хочешь поиграть?' },
          { word: 'What time is it?', emoji: '🕐', he: 'מָה הַשָּׁעָה?', ar: 'كم الساعة؟', ru: 'Который час?' },
          { word: 'How do you say...?', emoji: '💬', he: 'אֵיךְ אוֹמְרִים...?', ar: 'كيف تقول...؟', ru: 'Как сказать...?' },
          { word: 'Where are you going?', emoji: '🚶', he: 'לְאָן אַתָּה הוֹלֵךְ?', ar: 'إلى أين أنت ذاهب؟', ru: 'Куда ты идёшь?' },
          { word: 'Who is that?', emoji: '👤', he: 'מִי זֶה?', ar: 'من ذلك؟', ru: 'Кто это?' },
          { word: 'Why?', emoji: '❓', he: 'לָמָּה?', ar: 'لماذا؟', ru: 'Почему?' },
        ],
      },
      {
        id: 'at-school',
        name: 'At School',
        nameHe: 'בבית הספר',
        nameAr: 'في المدرسة',
        nameRu: 'В школе',
        emoji: '🏫',
        gradient: 'from-cyan-400 to-teal-500',
        words: [
          { word: 'Open your book', emoji: '📖', he: 'פִּתְחוּ אֶת הַסֵּפֶר', ar: 'افتح كتابك', ru: 'Откройте книгу' },
          { word: 'Sit down please', emoji: '🪑', he: 'שְׁבוּ בְּבַקָּשָׁה', ar: 'اجلس من فضلك', ru: 'Сядьте пожалуйста' },
          { word: 'Raise your hand', emoji: '✋', he: 'הָרִימוּ יָד', ar: 'ارفع يدك', ru: 'Поднимите руку' },
          { word: 'Listen carefully', emoji: '👂', he: 'הַקְשִׁיבוּ', ar: 'استمع بعناية', ru: 'Слушайте внимательно' },
          { word: 'Write your name', emoji: '✏️', he: 'כִּתְבוּ אֶת הַשֵּׁם', ar: 'اكتب اسمك', ru: 'Напишите своё имя' },
          { word: 'Read the sentence', emoji: '📝', he: 'קִרְאוּ אֶת הַמִּשְׁפָּט', ar: 'اقرأ الجملة', ru: 'Прочитайте предложение' },
          { word: 'I don\'t understand', emoji: '😕', he: 'אֲנִי לֹא מֵבִין', ar: 'لا أفهم', ru: 'Я не понимаю' },
          { word: 'Can you help me?', emoji: '🙏', he: 'אַתָּה יָכוֹל לַעְזוֹר לִי?', ar: 'هل يمكنك مساعدتي؟', ru: 'Можешь мне помочь?' },
          { word: 'I finished!', emoji: '🎉', he: 'סִיַּמְתִּי!', ar: 'انتهيت!', ru: 'Я закончил!' },
        ],
      },
      {
        id: 'feelings',
        name: 'Feelings',
        nameHe: 'רגשות',
        nameAr: 'المشاعر',
        nameRu: 'Чувства',
        emoji: '😊',
        gradient: 'from-pink-400 to-rose-500',
        words: [
          { word: 'I am happy', emoji: '😊', he: 'אֲנִי שָׂמֵחַ', ar: 'أنا سعيد', ru: 'Я счастлив' },
          { word: 'I am sad', emoji: '😢', he: 'אֲנִי עָצוּב', ar: 'أنا حزين', ru: 'Мне грустно' },
          { word: 'I am tired', emoji: '😴', he: 'אֲנִי עָיֵף', ar: 'أنا متعب', ru: 'Я устал' },
          { word: 'I am hungry', emoji: '🍽️', he: 'אֲנִי רָעֵב', ar: 'أنا جائع', ru: 'Я голоден' },
          { word: 'I am scared', emoji: '😨', he: 'אֲנִי מְפַחֵד', ar: 'أنا خائف', ru: 'Мне страшно' },
          { word: 'I am excited', emoji: '🤩', he: 'אֲנִי נִרְגָּשׁ', ar: 'أنا متحمس', ru: 'Я в восторге' },
          { word: 'I am angry', emoji: '😠', he: 'אֲנִי כּוֹעֵס', ar: 'أنا غاضب', ru: 'Я злой' },
          { word: 'I am brave', emoji: '🦸', he: 'אֲנִי אַמִּיץ', ar: 'أنا شجاع', ru: 'Я смелый' },
          { word: 'I am proud', emoji: '🏆', he: 'אֲנִי גָּאֶה', ar: 'أنا فخور', ru: 'Я горжусь' },
        ],
      },
      {
        id: 'shopping',
        name: 'Shopping',
        nameHe: 'קניות',
        nameAr: 'التسوق',
        nameRu: 'Покупки',
        emoji: '🛒',
        gradient: 'from-green-400 to-emerald-500',
        words: [
          { word: 'How much is this?', emoji: '💰', he: 'כַּמָּה זֶה עוֹלֶה?', ar: 'كم سعر هذا؟', ru: 'Сколько это стоит?' },
          { word: 'I want to buy...', emoji: '🛍️', he: 'אֲנִי רוֹצֶה לִקְנוֹת...', ar: 'أريد أن أشتري...', ru: 'Я хочу купить...' },
          { word: 'Can I have one?', emoji: '☝️', he: 'אֶפְשָׁר אֶחָד?', ar: 'هل يمكنني الحصول على واحد؟', ru: 'Можно один?' },
          { word: 'Thank you very much', emoji: '🙏', he: 'תּוֹדָה רַבָּה', ar: 'شكراً جزيلاً', ru: 'Спасибо большое' },
          { word: 'Do you have...?', emoji: '🤔', he: 'יֵשׁ לְךָ...?', ar: 'هل لديك...؟', ru: 'У тебя есть...?' },
          { word: 'That is too big', emoji: '📏', he: 'זֶה גָּדוֹל מִדַּי', ar: 'هذا كبير جداً', ru: 'Это слишком большое' },
          { word: 'That is too small', emoji: '🔍', he: 'זֶה קָטָן מִדַּי', ar: 'هذا صغير جداً', ru: 'Это слишком маленькое' },
          { word: 'I like this one', emoji: '👍', he: 'אֲנִי אוֹהֵב אֶת זֶה', ar: 'أنا أحب هذا', ru: 'Мне нравится это' },
          { word: 'Here you go', emoji: '🤲', he: 'הִנֵּה, בְּבַקָּשָׁה', ar: 'تفضل', ru: 'Вот, пожалуйста' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════
  // LEVEL 6 — Smart Conversation (ages 10-12)
  // ═══════════════════════════════════════
  {
    level: 6,
    name: 'Smart Conversation',
    nameHe: 'שיחה חכמה',
    nameAr: 'محادثة ذكية',
    nameRu: 'Умный разговор',
    emoji: '🧠',
    gradient: 'from-violet-500 to-purple-600',
    topics: [
      {
        id: 'about-me',
        name: 'About Me',
        nameHe: 'על עצמי',
        nameAr: 'عن نفسي',
        nameRu: 'Обо мне',
        emoji: '🪪',
        gradient: 'from-blue-400 to-cyan-500',
        words: [
          { word: 'I was born in...', emoji: '🎂', he: 'נוֹלַדְתִּי בְּ...', ar: 'ولدت في...', ru: 'Я родился в...' },
          { word: 'I have brown eyes', emoji: '👁️', he: 'יֵשׁ לִי עֵינַיִם חוּמוֹת', ar: 'لدي عيون بنية', ru: 'У меня карие глаза' },
          { word: 'I am in second grade', emoji: '🏫', he: 'אֲנִי בְּכִתָּה ב׳', ar: 'أنا في الصف الثاني', ru: 'Я во втором классе' },
          { word: 'My hobby is reading', emoji: '📚', he: 'הַתַּחְבִּיב שֶׁלִּי הוּא קְרִיאָה', ar: 'هوايتي القراءة', ru: 'Моё хобби чтение' },
          { word: 'I have one brother', emoji: '👦', he: 'יֵשׁ לִי אָח אֶחָד', ar: 'لدي أخ واحد', ru: 'У меня один брат' },
          { word: 'I like to help people', emoji: '🤝', he: 'אֲנִי אוֹהֵב לַעְזוֹר לַאֲנָשִׁים', ar: 'أحب مساعدة الناس', ru: 'Я люблю помогать людям' },
          { word: 'When I grow up...', emoji: '🌟', he: 'כְּשֶׁאֶגְדַּל...', ar: 'عندما أكبر...', ru: 'Когда вырасту...' },
          { word: 'I am good at math', emoji: '🔢', he: 'אֲנִי טוֹב בְּחֶשְׁבּוֹן', ar: 'أنا جيد في الرياضيات', ru: 'Я хорош в математике' },
          { word: 'I want to be a doctor', emoji: '👨‍⚕️', he: 'אֲנִי רוֹצֶה לִהְיוֹת רוֹפֵא', ar: 'أريد أن أكون طبيباً', ru: 'Я хочу стать врачом' },
        ],
      },
      {
        id: 'telling-stories',
        name: 'Telling Stories',
        nameHe: 'מספרים סיפורים',
        nameAr: 'رواية القصص',
        nameRu: 'Рассказываем истории',
        emoji: '📖',
        gradient: 'from-amber-400 to-orange-500',
        words: [
          { word: 'Once upon a time', emoji: '✨', he: 'הָיוּ הָיוּ פַּעַם', ar: 'كان يا ما كان', ru: 'Жили-были' },
          { word: 'There was a little boy', emoji: '👦', he: 'הָיָה יֶלֶד קָטָן', ar: 'كان هناك ولد صغير', ru: 'Жил маленький мальчик' },
          { word: 'He went to the forest', emoji: '🌲', he: 'הוּא הָלַךְ לַיַּעַר', ar: 'ذهب إلى الغابة', ru: 'Он пошёл в лес' },
          { word: 'He found a treasure', emoji: '💎', he: 'הוּא מָצָא אוֹצָר', ar: 'وجد كنزاً', ru: 'Он нашёл сокровище' },
          { word: 'And then...', emoji: '➡️', he: 'וְאָז...', ar: 'وبعد ذلك...', ru: 'И потом...' },
          { word: 'The end!', emoji: '🎬', he: 'הַסּוֹף!', ar: 'النهاية!', ru: 'Конец!' },
          { word: 'Yesterday I went to...', emoji: '📅', he: 'אֶתְמוֹל הָלַכְתִּי לְ...', ar: 'بالأمس ذهبت إلى...', ru: 'Вчера я ходил в...' },
          { word: 'It was so much fun!', emoji: '🎉', he: 'זֶה הָיָה כָּל כָּךְ כֵּיף!', ar: 'كان ممتعاً جداً!', ru: 'Было очень весело!' },
          { word: 'I will never forget', emoji: '💭', he: 'לְעוֹלָם לֹא אֶשְׁכַּח', ar: 'لن أنسى أبداً', ru: 'Я никогда не забуду' },
        ],
      },
      {
        id: 'opinions',
        name: 'Opinions',
        nameHe: 'דעות',
        nameAr: 'آراء',
        nameRu: 'Мнения',
        emoji: '💡',
        gradient: 'from-emerald-400 to-teal-500',
        words: [
          { word: 'I think that...', emoji: '🤔', he: 'אֲנִי חוֹשֵׁב שֶׁ...', ar: 'أعتقد أن...', ru: 'Я думаю, что...' },
          { word: 'I agree', emoji: '👍', he: 'אֲנִי מַסְכִּים', ar: 'أنا أوافق', ru: 'Я согласен' },
          { word: 'I don\'t agree', emoji: '👎', he: 'אֲנִי לֹא מַסְכִּים', ar: 'أنا لا أوافق', ru: 'Я не согласен' },
          { word: 'That is a good idea', emoji: '💡', he: 'זֶה רַעְיוֹן טוֹב', ar: 'هذه فكرة جيدة', ru: 'Хорошая идея' },
          { word: 'I prefer...', emoji: '⭐', he: 'אֲנִי מַעְדִיף...', ar: 'أنا أفضل...', ru: 'Я предпочитаю...' },
          { word: 'Because...', emoji: '💬', he: 'כִּי...', ar: 'لأن...', ru: 'Потому что...' },
          { word: 'In my opinion', emoji: '🗣️', he: 'לְדַעְתִּי', ar: 'في رأيي', ru: 'По-моему' },
          { word: 'That is interesting', emoji: '🧐', he: 'זֶה מְעַנְיֵין', ar: 'هذا مثير للاهتمام', ru: 'Это интересно' },
          { word: 'I changed my mind', emoji: '🔄', he: 'שִׁנִּיתִי אֶת דַּעְתִּי', ar: 'غيرت رأيي', ru: 'Я передумал' },
        ],
      },
      {
        id: 'polite-talk',
        name: 'Being Polite',
        nameHe: 'נימוסים',
        nameAr: 'الأدب',
        nameRu: 'Вежливость',
        emoji: '🎩',
        gradient: 'from-rose-400 to-pink-500',
        words: [
          { word: 'Excuse me', emoji: '🙋', he: 'סְלִיחָה', ar: 'عفواً', ru: 'Извините' },
          { word: 'Could you please...?', emoji: '🙏', he: 'אַתָּה יָכוֹל בְּבַקָּשָׁה...?', ar: 'هل يمكنك من فضلك...؟', ru: 'Не могли бы вы...?' },
          { word: 'May I come in?', emoji: '🚪', he: 'אֶפְשָׁר לְהִכָּנֵס?', ar: 'هل يمكنني الدخول؟', ru: 'Можно войти?' },
          { word: 'I\'m sorry for being late', emoji: '⏰', he: 'אֲנִי מִצְטַעֵר עַל הָאִחוּר', ar: 'أعتذر عن التأخير', ru: 'Извините за опоздание' },
          { word: 'You\'re welcome', emoji: '😊', he: 'אֵין בְּעָד מָה', ar: 'على الرحب والسعة', ru: 'Пожалуйста (не за что)' },
          { word: 'After you', emoji: '🚶', he: 'אַחֲרֶיךָ', ar: 'بعدك', ru: 'После вас' },
          { word: 'Have a nice day!', emoji: '🌞', he: 'יוֹם נָעִים!', ar: 'يوماً سعيداً!', ru: 'Хорошего дня!' },
          { word: 'Bless you!', emoji: '🤧', he: 'לַבְּרִיאוּת!', ar: 'يرحمك الله!', ru: 'Будь здоров!' },
          { word: 'Can I help you?', emoji: '🤝', he: 'אֶפְשָׁר לַעְזוֹר?', ar: 'هل يمكنني مساعدتك؟', ru: 'Могу помочь?' },
        ],
      },
      {
        id: 'comparing',
        name: 'Comparing Things',
        nameHe: 'השוואות',
        nameAr: 'المقارنات',
        nameRu: 'Сравнения',
        emoji: '⚖️',
        gradient: 'from-sky-400 to-blue-500',
        words: [
          { word: 'bigger than', emoji: '📏', he: 'יוֹתֵר גָּדוֹל מִ...', ar: 'أكبر من', ru: 'больше чем' },
          { word: 'smaller than', emoji: '🔍', he: 'יוֹתֵר קָטָן מִ...', ar: 'أصغر من', ru: 'меньше чем' },
          { word: 'faster than', emoji: '🏎️', he: 'יוֹתֵר מָהִיר מִ...', ar: 'أسرع من', ru: 'быстрее чем' },
          { word: 'slower than', emoji: '🐢', he: 'יוֹתֵר אִטִּי מִ...', ar: 'أبطأ من', ru: 'медленнее чем' },
          { word: 'the biggest', emoji: '🐘', he: 'הֲכִי גָּדוֹל', ar: 'الأكبر', ru: 'самый большой' },
          { word: 'the smallest', emoji: '🐜', he: 'הֲכִי קָטָן', ar: 'الأصغر', ru: 'самый маленький' },
          { word: 'the same as', emoji: '🟰', he: 'אוֹתוֹ דָּבָר כְּמוֹ', ar: 'نفس الشيء', ru: 'такой же как' },
          { word: 'different from', emoji: '↔️', he: 'שׁוֹנֶה מִ...', ar: 'مختلف عن', ru: 'отличается от' },
          { word: 'better than', emoji: '🏆', he: 'יוֹתֵר טוֹב מִ...', ar: 'أفضل من', ru: 'лучше чем' },
        ],
      },
      {
        id: 'future-plans',
        name: 'Future Plans',
        nameHe: 'תוכניות לעתיד',
        nameAr: 'خطط المستقبل',
        nameRu: 'Планы на будущее',
        emoji: '🚀',
        gradient: 'from-indigo-400 to-violet-500',
        words: [
          { word: 'I will go to...', emoji: '✈️', he: 'אֲנִי אֵלֵךְ לְ...', ar: 'سأذهب إلى...', ru: 'Я пойду в...' },
          { word: 'Tomorrow I will...', emoji: '📅', he: 'מָחָר אֲנִי...', ar: 'غداً سأ...', ru: 'Завтра я...' },
          { word: 'I want to learn...', emoji: '📖', he: 'אֲנִי רוֹצֶה לִלְמוֹד...', ar: 'أريد أن أتعلم...', ru: 'Я хочу учить...' },
          { word: 'One day I will...', emoji: '🌟', he: 'יוֹם אֶחָד אֲנִי...', ar: 'يوماً ما سأ...', ru: 'Однажды я...' },
          { word: 'I dream of...', emoji: '💭', he: 'אֲנִי חוֹלֵם עַל...', ar: 'أحلم بـ...', ru: 'Я мечтаю о...' },
          { word: 'I will try my best', emoji: '💪', he: 'אֲנִי אֶעֱשֶׂה כְּמֵיטַב יָכׇלְתִּי', ar: 'سأبذل قصارى جهدي', ru: 'Я постараюсь' },
          { word: 'I hope to...', emoji: '🤞', he: 'אֲנִי מְקַוֶּה לְ...', ar: 'أتمنى أن...', ru: 'Я надеюсь...' },
          { word: 'Next year I will...', emoji: '🗓️', he: 'בַּשָּׁנָה הַבָּאָה אֲנִי...', ar: 'السنة القادمة سأ...', ru: 'В следующем году я...' },
          { word: 'I believe I can', emoji: '✨', he: 'אֲנִי מַאֲמִין שֶׁאֲנִי יָכוֹל', ar: 'أؤمن أنني أستطيع', ru: 'Я верю, что могу' },
        ],
      },
    ],
  },
];

/* ── Helper functions ── */

/** Get all topics flat */
export function getAllTopics() {
  return KIDS_LESSON_LEVELS.flatMap(lvl =>
    lvl.topics.map(t => ({ ...t, level: lvl.level, levelName: lvl.name, levelNameHe: lvl.nameHe }))
  );
}

/** Get topic by id */
export function getTopicById(topicId) {
  for (const lvl of KIDS_LESSON_LEVELS) {
    const topic = lvl.topics.find(t => t.id === topicId);
    if (topic) return { ...topic, level: lvl.level };
  }
  return null;
}

/** Get words for a specific lesson within a topic (0-3) */
export function getLessonWords(topic, lessonIndex) {
  const words = topic.words || [];
  if (lessonIndex >= 3) return words; // Boss lesson — all words
  const perLesson = 3;
  const start = lessonIndex * perLesson;
  return words.slice(start, start + perLesson);
}

/** How many lessons per topic */
export const LESSONS_PER_TOPIC = 4;

/** Determine next recommended topic based on progress */
export function getNextRecommendedTopic(progress) {
  const lessonProgress = progress.kidsLessonProgress || {};

  for (const lvl of KIDS_LESSON_LEVELS) {
    for (const topic of lvl.topics) {
      const tp = lessonProgress[topic.id];
      if (!tp || tp.lessonsCompleted < LESSONS_PER_TOPIC) {
        return {
          topic: { ...topic, level: lvl.level },
          lessonIndex: tp ? tp.lessonsCompleted : 0,
          isReview: false,
        };
      }
    }
  }
  // All done — recommend review of weakest topic
  let weakest = null;
  let lowestAcc = 1;
  for (const [id, data] of Object.entries(lessonProgress)) {
    if ((data.accuracy || 1) < lowestAcc) {
      lowestAcc = data.accuracy;
      weakest = id;
    }
  }
  if (weakest) {
    return { topic: getTopicById(weakest), lessonIndex: 0, isReview: true };
  }
  return { topic: { ...KIDS_LESSON_LEVELS[0].topics[0], level: 1 }, lessonIndex: 0, isReview: true };
}

/** Get topics that need reinforcement */
export function getWeakTopics(progress) {
  const lessonProgress = progress.kidsLessonProgress || {};
  return Object.entries(lessonProgress)
    .filter(([, data]) => data.accuracy < 0.7 && data.lessonsCompleted > 0)
    .map(([id]) => getTopicById(id))
    .filter(Boolean);
}

/** Calculate overall level from progress */
export function calculateKidsLevel(progress) {
  const lessonProgress = progress.kidsLessonProgress || {};
  for (let i = KIDS_LESSON_LEVELS.length - 1; i >= 0; i--) {
    const lvl = KIDS_LESSON_LEVELS[i];
    const completedTopics = lvl.topics.filter(t => {
      const tp = lessonProgress[t.id];
      return tp && tp.lessonsCompleted >= LESSONS_PER_TOPIC && (tp.accuracy || 0) >= 0.7;
    }).length;
    if (completedTopics >= 4) return lvl.level + 1; // Passed this level
  }
  return 1;
}
