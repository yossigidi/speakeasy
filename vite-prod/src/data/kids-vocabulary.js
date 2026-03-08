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
    // New words for expanded quest content
    { word: 'white', emoji: '⬜', translation: 'לָבָן', translationAr: 'أبيض', translationRu: 'белый' },
    { word: 'black', emoji: '⬛', translation: 'שָׁחֹר', translationAr: 'أسود', translationRu: 'чёрный' },
    { word: 'orange', emoji: '🟠', translation: 'כָּתֹם', translationAr: 'برتقالي', translationRu: 'оранжевый' },
    { word: 'cow', emoji: '🐄', translation: 'פָּרָה', translationAr: 'بقرة', translationRu: 'корова' },
    { word: 'pig', emoji: '🐷', translation: 'חֲזִיר', translationAr: 'خنزير', translationRu: 'свинья' },
    { word: 'rabbit', emoji: '🐰', translation: 'אַרְנָב', translationAr: 'أرنب', translationRu: 'кролик' },
    { word: 'lion', emoji: '🦁', translation: 'אַרְיֵה', translationAr: 'أسد', translationRu: 'лев' },
    { word: 'cookie', emoji: '🍪', translation: 'עוּגִיָּה', translationAr: 'بسكويت', translationRu: 'печенье' },
    { word: 'water', emoji: '💧', translation: 'מַיִם', translationAr: 'ماء', translationRu: 'вода' },
    { word: 'three', emoji: '3️⃣', translation: 'שָׁלוֹשׁ', translationAr: 'ثلاثة', translationRu: 'три' },
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
    // New words for expanded quest content
    { word: 'brother', emoji: '👦', translation: 'אָח', translationAr: 'أخ', translationRu: 'брат' },
    { word: 'sister', emoji: '👧', translation: 'אָחוֹת', translationAr: 'أخت', translationRu: 'сестра' },
    { word: 'friend', emoji: '🤝', translation: 'חָבֵר', translationAr: 'صديق', translationRu: 'друг' },
    { word: 'nose', emoji: '👃', translation: 'אַף', translationAr: 'أنف', translationRu: 'нос' },
    { word: 'ear', emoji: '👂', translation: 'אֹזֶן', translationAr: 'أذن', translationRu: 'ухо' },
    { word: 'mouth', emoji: '👄', translation: 'פֶּה', translationAr: 'فم', translationRu: 'рот' },
    { word: 'pencil', emoji: '✏️', translation: 'עִפָּרוֹן', translationAr: 'قلم رصاص', translationRu: 'карандаш' },
    { word: 'table', emoji: '🪑', translation: 'שֻׁלְחָן', translationAr: 'طاولة', translationRu: 'стол' },
    { word: 'school', emoji: '🏫', translation: 'בֵּית סֵפֶר', translationAr: 'مدرسة', translationRu: 'школа' },
    { word: 'sad', emoji: '😢', translation: 'עָצוּב', translationAr: 'حزين', translationRu: 'грустный' },
    { word: 'old', emoji: '👴', translation: 'יָשָׁן', translationAr: 'قديم', translationRu: 'старый' },
    { word: 'new', emoji: '✨', translation: 'חָדָשׁ', translationAr: 'جديد', translationRu: 'новый' },
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
    // New words for expanded quest content
    { word: 'window', emoji: '🪟', translation: 'חַלּוֹן', translationAr: 'نافذة', translationRu: 'окно' },
    { word: 'chair', emoji: '🪑', translation: 'כִּסֵּא', translationAr: 'كرسي', translationRu: 'стул' },
    { word: 'kitchen', emoji: '🍳', translation: 'מִטְבָּח', translationAr: 'مطبخ', translationRu: 'кухня' },
    { word: 'cloud', emoji: '☁️', translation: 'עָנָן', translationAr: 'سحابة', translationRu: 'облако' },
    { word: 'snow', emoji: '❄️', translation: 'שֶׁלֶג', translationAr: 'ثلج', translationRu: 'снег' },
    { word: 'wind', emoji: '💨', translation: 'רוּחַ', translationAr: 'رياح', translationRu: 'ветер' },
    { word: 'river', emoji: '🏞️', translation: 'נָהָר', translationAr: 'نهر', translationRu: 'река' },
    { word: 'mountain', emoji: '⛰️', translation: 'הַר', translationAr: 'جبل', translationRu: 'гора' },
    { word: 'sea', emoji: '🌊', translation: 'יָם', translationAr: 'بحر', translationRu: 'море' },
    { word: 'bike', emoji: '🚲', translation: 'אוֹפַנַּיִם', translationAr: 'دراجة', translationRu: 'велосипед' },
    { word: 'train', emoji: '🚂', translation: 'רַכֶּבֶת', translationAr: 'قطار', translationRu: 'поезд' },
    { word: 'shirt', emoji: '👕', translation: 'חוּלְצָה', translationAr: 'قميص', translationRu: 'рубашка' },
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
    // New words for expanded quest content
    { word: 'monkey', emoji: '🐒', translation: 'קוֹף', translationAr: 'قرد', translationRu: 'обезьяна' },
    { word: 'dolphin', emoji: '🐬', translation: 'דוֹלְפִין', translationAr: 'دلفين', translationRu: 'дельфин' },
    { word: 'penguin', emoji: '🐧', translation: 'פִּינְגְּוִין', translationAr: 'بطريق', translationRu: 'пингвин' },
    { word: 'swim', emoji: '🏊', translation: 'לִשְׂחוֹת', translationAr: 'يسبح', translationRu: 'плавать' },
    { word: 'write', emoji: '✍️', translation: 'לִכְתֹּב', translationAr: 'يكتب', translationRu: 'писать' },
    { word: 'jump', emoji: '🤸', translation: 'לִקְפֹּץ', translationAr: 'يقفز', translationRu: 'прыгать' },
    { word: 'dance', emoji: '💃', translation: 'לִרְקֹד', translationAr: 'يرقص', translationRu: 'танцевать' },
    { word: 'beach', emoji: '🏖️', translation: 'חוֹף', translationAr: 'شاطئ', translationRu: 'пляж' },
    { word: 'forest', emoji: '🌲', translation: 'יַעַר', translationAr: 'غابة', translationRu: 'лес' },
    { word: 'strong', emoji: '💪', translation: 'חָזָק', translationAr: 'قوي', translationRu: 'сильный' },
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
    { sentence: 'Blue sky', words: ['Blue', 'sky'], emoji: '🌤️', translationHe: 'שמיים כחולים', translationAr: 'سماء زرقاء', translationRu: 'Голубое небо' },
    { sentence: 'Big sun', words: ['Big', 'sun'], emoji: '☀️', translationHe: 'שמש גדולה', translationAr: 'شمس كبيرة', translationRu: 'Большое солнце' },
    { sentence: 'Green frog', words: ['Green', 'frog'], emoji: '🐸', translationHe: 'צפרדע ירוקה', translationAr: 'ضفدع أخضر', translationRu: 'Зелёная лягушка' },
    { sentence: 'Small cat', words: ['Small', 'cat'], emoji: '🐱', translationHe: 'חתול קטן', translationAr: 'قطة صغيرة', translationRu: 'Маленькая кошка' },
    { sentence: 'One fish', words: ['One', 'fish'], emoji: '🐟', translationHe: 'דג אחד', translationAr: 'سمكة واحدة', translationRu: 'Одна рыба' },
    { sentence: 'White rabbit', words: ['White', 'rabbit'], emoji: '🐰', translationHe: 'ארנב לבן', translationAr: 'أرنب أبيض', translationRu: 'Белый кролик' },
    { sentence: 'Good milk', words: ['Good', 'milk'], emoji: '🥛', translationHe: 'חלב טוב', translationAr: 'حليب جيد', translationRu: 'Хорошее молоко' },
    { sentence: 'Two birds', words: ['Two', 'birds'], emoji: '🐦', translationHe: 'שתי ציפורים', translationAr: 'طائران', translationRu: 'Две птицы' },
  ],
  2: [
    { sentence: 'I like cats', words: ['I', 'like', 'cats'], emoji: '🐱', translationHe: 'אני אוהב חתולים', translationAr: 'أنا أحب القطط', translationRu: 'Я люблю кошек' },
    { sentence: 'I am happy', words: ['I', 'am', 'happy'], emoji: '😊', translationHe: 'אני שמח', translationAr: 'أنا سعيد', translationRu: 'Я счастлив' },
    { sentence: 'Big red ball', words: ['Big', 'red', 'ball'], emoji: '🔴', translationHe: 'כדור אדום גדול', translationAr: 'كرة حمراء كبيرة', translationRu: 'Большой красный мяч' },
    { sentence: 'Mom and dad', words: ['Mom', 'and', 'dad'], emoji: '👨‍👩‍👦', translationHe: 'אמא ואבא', translationAr: 'أمّ وأبّ', translationRu: 'Мама и папа' },
    { sentence: 'My blue book', words: ['My', 'blue', 'book'], emoji: '📖', translationHe: 'הספר הכחול שלי', translationAr: 'كتابي الأزرق', translationRu: 'Моя синяя книга' },
    { sentence: 'I see fish', words: ['I', 'see', 'fish'], emoji: '🐟', translationHe: 'אני רואה דג', translationAr: 'أنا أرى سمكة', translationRu: 'Я вижу рыбу' },
    { sentence: 'She is happy', words: ['She', 'is', 'happy'], emoji: '😊', translationHe: 'היא שמחה', translationAr: 'هي سعيدة', translationRu: 'Она счастлива' },
    { sentence: 'I have a dog', words: ['I', 'have', 'a', 'dog'], emoji: '🐶', translationHe: 'יש לי כלב', translationAr: 'عندي كلب', translationRu: 'У меня есть собака' },
    { sentence: 'He is sad', words: ['He', 'is', 'sad'], emoji: '😢', translationHe: 'הוא עצוב', translationAr: 'هو حزين', translationRu: 'Он грустный' },
    { sentence: 'My new pencil', words: ['My', 'new', 'pencil'], emoji: '✏️', translationHe: 'העיפרון החדש שלי', translationAr: 'قلمي الجديد', translationRu: 'Мой новый карандаш' },
    { sentence: 'Big yellow duck', words: ['Big', 'yellow', 'duck'], emoji: '🦆', translationHe: 'ברווז צהוב גדול', translationAr: 'بطة صفراء كبيرة', translationRu: 'Большая жёлтая утка' },
    { sentence: 'I like school', words: ['I', 'like', 'school'], emoji: '🏫', translationHe: 'אני אוהב בית ספר', translationAr: 'أنا أحب المدرسة', translationRu: 'Я люблю школу' },
    { sentence: 'My old friend', words: ['My', 'old', 'friend'], emoji: '🤝', translationHe: 'החבר הוותיק שלי', translationAr: 'صديقي القديم', translationRu: 'Мой старый друг' },
    { sentence: 'Pink and red', words: ['Pink', 'and', 'red'], emoji: '💗', translationHe: 'ורוד ואדום', translationAr: 'وردي وأحمر', translationRu: 'Розовый и красный' },
  ],
  3: [
    { sentence: 'The sun is hot', words: ['The', 'sun', 'is', 'hot'], emoji: '☀️', translationHe: 'השמש חמה', translationAr: 'الشمس حارة', translationRu: 'Солнце горячее' },
    { sentence: 'I like apples', words: ['I', 'like', 'apples'], emoji: '🍎', translationHe: 'אני אוהב תפוחים', translationAr: 'أنا أحب التفاح', translationRu: 'Я люблю яблоки' },
    { sentence: 'The cat is small', words: ['The', 'cat', 'is', 'small'], emoji: '🐱', translationHe: 'החתול קטן', translationAr: 'القطة صغيرة', translationRu: 'Кошка маленькая' },
    { sentence: 'She has a dog', words: ['She', 'has', 'a', 'dog'], emoji: '🐶', translationHe: 'יש לה כלב', translationAr: 'عندها كلب', translationRu: 'У неё есть собака' },
    { sentence: 'The bird can fly', words: ['The', 'bird', 'can', 'fly'], emoji: '🐦', translationHe: 'הציפור יכולה לעוף', translationAr: 'الطائر يستطيع الطيران', translationRu: 'Птица умеет летать' },
    { sentence: 'He reads a book', words: ['He', 'reads', 'a', 'book'], emoji: '📖', translationHe: 'הוא קורא ספר', translationAr: 'هو يقرأ كتابا', translationRu: 'Он читает книгу' },
    { sentence: 'I go to school', words: ['I', 'go', 'to', 'school'], emoji: '🏫', translationHe: 'אני הולך לבית ספר', translationAr: 'أنا أذهب إلى المدرسة', translationRu: 'Я иду в школу' },
    { sentence: 'The car is fast', words: ['The', 'car', 'is', 'fast'], emoji: '🚗', translationHe: 'המכונית מהירה', translationAr: 'السيارة سريعة', translationRu: 'Машина быстрая' },
    { sentence: 'I see a cloud', words: ['I', 'see', 'a', 'cloud'], emoji: '☁️', translationHe: 'אני רואה ענן', translationAr: 'أنا أرى سحابة', translationRu: 'Я вижу облако' },
    { sentence: 'The tree is big', words: ['The', 'tree', 'is', 'big'], emoji: '🌳', translationHe: 'העץ גדול', translationAr: 'الشجرة كبيرة', translationRu: 'Дерево большое' },
    { sentence: 'She likes flowers', words: ['She', 'likes', 'flowers'], emoji: '🌸', translationHe: 'היא אוהבת פרחים', translationAr: 'هي تحب الأزهار', translationRu: 'Она любит цветы' },
    { sentence: 'The bus is red', words: ['The', 'bus', 'is', 'red'], emoji: '🚌', translationHe: 'האוטובוס אדום', translationAr: 'الحافلة حمراء', translationRu: 'Автобус красный' },
    { sentence: 'It is very hot', words: ['It', 'is', 'very', 'hot'], emoji: '🔥', translationHe: 'מאוד חם', translationAr: 'الجو حار جدا', translationRu: 'Очень жарко' },
    { sentence: 'I ride my bike', words: ['I', 'ride', 'my', 'bike'], emoji: '🚲', translationHe: 'אני רוכב על אופניים', translationAr: 'أنا أركب دراجتي', translationRu: 'Я еду на велосипеде' },
  ],
  4: [
    { sentence: 'She has a big dog', words: ['She', 'has', 'a', 'big', 'dog'], emoji: '🐶', translationHe: 'יש לה כלב גדול', translationAr: 'عندها كلب كبير', translationRu: 'У неё есть большая собака' },
    { sentence: 'We go to school', words: ['We', 'go', 'to', 'school'], emoji: '🏫', translationHe: 'אנחנו הולכים לבית ספר', translationAr: 'نحن نذهب إلى المدرسة', translationRu: 'Мы идём в школу' },
    { sentence: 'The fish is blue', words: ['The', 'fish', 'is', 'blue'], emoji: '🐟', translationHe: 'הדג כחול', translationAr: 'السمكة زرقاء', translationRu: 'Рыба синяя' },
    { sentence: 'They eat cake now', words: ['They', 'eat', 'cake', 'now'], emoji: '🎂', translationHe: 'הם אוכלים עוגה עכשיו', translationAr: 'هم يأكلون الكعكة الآن', translationRu: 'Они едят торт сейчас' },
    { sentence: 'I can run fast', words: ['I', 'can', 'run', 'fast'], emoji: '🏃', translationHe: 'אני יכול לרוץ מהר', translationAr: 'أنا أستطيع الجري بسرعة', translationRu: 'Я умею быстро бегать' },
    { sentence: 'The ball is red', words: ['The', 'ball', 'is', 'red'], emoji: '🔴', translationHe: 'הכדור אדום', translationAr: 'الكرة حمراء', translationRu: 'Мяч красный' },
    { sentence: 'The elephant is very big', words: ['The', 'elephant', 'is', 'very', 'big'], emoji: '🐘', translationHe: 'הפיל מאוד גדול', translationAr: 'الفيل كبير جدا', translationRu: 'Слон очень большой' },
    { sentence: 'I like to read books', words: ['I', 'like', 'to', 'read', 'books'], emoji: '📖', translationHe: 'אני אוהב לקרוא ספרים', translationAr: 'أنا أحب قراءة الكتب', translationRu: 'Я люблю читать книги' },
    { sentence: 'She can swim very fast', words: ['She', 'can', 'swim', 'very', 'fast'], emoji: '🏊', translationHe: 'היא יכולה לשחות מהר', translationAr: 'هي تستطيع السباحة بسرعة', translationRu: 'Она умеет плавать очень быстро' },
    { sentence: 'The monkey likes bananas', words: ['The', 'monkey', 'likes', 'bananas'], emoji: '🐒', translationHe: 'הקוף אוהב בננות', translationAr: 'القرد يحب الموز', translationRu: 'Обезьяна любит бананы' },
    { sentence: 'We play in the park', words: ['We', 'play', 'in', 'the', 'park'], emoji: '🌳', translationHe: 'אנחנו משחקים בפארק', translationAr: 'نحن نلعب في الحديقة', translationRu: 'Мы играем в парке' },
    { sentence: 'The dolphin can jump', words: ['The', 'dolphin', 'can', 'jump'], emoji: '🐬', translationHe: 'הדולפין יכול לקפוץ', translationAr: 'الدلفين يستطيع القفز', translationRu: 'Дельфин умеет прыгать' },
    { sentence: 'He runs to the beach', words: ['He', 'runs', 'to', 'the', 'beach'], emoji: '🏖️', translationHe: 'הוא רץ לחוף', translationAr: 'هو يجري إلى الشاطئ', translationRu: 'Он бежит на пляж' },
    { sentence: 'I can dance and sing', words: ['I', 'can', 'dance', 'and', 'sing'], emoji: '💃', translationHe: 'אני יכול לרקוד ולשיר', translationAr: 'أنا أستطيع الرقص والغناء', translationRu: 'Я умею танцевать и петь' },
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
        { word: 'cat', emoji: '🐱', translation: 'חתול', translationAr: 'قطة', translationRu: 'кошка', category: 0 },
        { word: 'dog', emoji: '🐶', translation: 'כלב', translationAr: 'كلب', translationRu: 'собака', category: 0 },
        { word: 'apple', emoji: '🍎', translation: 'תפוח', translationAr: 'تفاحة', translationRu: 'яблоко', category: 1 },
        { word: 'cake', emoji: '🎂', translation: 'עוגה', translationAr: 'كعكة', translationRu: 'торт', category: 1 },
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
        { word: 'cat', emoji: '🐱', translation: 'חתול', translationAr: 'قطة', translationRu: 'кошка', category: 0 },
        { word: 'dog', emoji: '🐶', translation: 'כלב', translationAr: 'كلب', translationRu: 'собака', category: 0 },
        { word: 'fish', emoji: '🐟', translation: 'דג', translationAr: 'سمكة', translationRu: 'рыба', category: 0 },
        { word: 'apple', emoji: '🍎', translation: 'תפוח', translationAr: 'تفاحة', translationRu: 'яблоко', category: 1 },
        { word: 'cake', emoji: '🎂', translation: 'עוגה', translationAr: 'كعكة', translationRu: 'торт', category: 1 },
        { word: 'banana', emoji: '🍌', translation: 'בננה', translationAr: 'موزة', translationRu: 'банан', category: 1 },
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
        { word: 'cat', emoji: '🐱', translation: 'חתול', translationAr: 'قطة', translationRu: 'кошка', category: 0 },
        { word: 'dog', emoji: '🐶', translation: 'כלב', translationAr: 'كلب', translationRu: 'собака', category: 0 },
        { word: 'fish', emoji: '🐟', translation: 'דג', translationAr: 'سمكة', translationRu: 'рыба', category: 0 },
        { word: 'bird', emoji: '🐦', translation: 'ציפור', translationAr: 'طائر', translationRu: 'птица', category: 0 },
        { word: 'apple', emoji: '🍎', translation: 'תפוח', translationAr: 'تفاحة', translationRu: 'яблоко', category: 1 },
        { word: 'cake', emoji: '🎂', translation: 'עוגה', translationAr: 'كعكة', translationRu: 'торт', category: 1 },
        { word: 'banana', emoji: '🍌', translation: 'בננה', translationAr: 'موزة', translationRu: 'банан', category: 1 },
        { word: 'milk', emoji: '🥛', translation: 'חלב', translationAr: 'حليب', translationRu: 'молоко', category: 1 },
      ],
    },
    {
      categories: [
        { name: 'Nature', nameHe: 'טבע', nameAr: 'طبيعة', nameRu: 'Природа', emoji: '🌿', color: 'from-green-400 to-teal-500' },
        { name: 'Things', nameHe: 'דברים', nameAr: 'أشياء', nameRu: 'Вещи', emoji: '📦', color: 'from-blue-400 to-indigo-500' },
      ],
      items: [
        { word: 'sun', emoji: '☀️', translation: 'שמש', translationAr: 'شمس', translationRu: 'солнце', category: 0 },
        { word: 'moon', emoji: '🌙', translation: 'ירח', translationAr: 'قمر', translationRu: 'луна', category: 0 },
        { word: 'tree', emoji: '🌳', translation: 'עץ', translationAr: 'شجرة', translationRu: 'дерево', category: 0 },
        { word: 'flower', emoji: '🌸', translation: 'פרח', translationAr: 'زهرة', translationRu: 'цветок', category: 0 },
        { word: 'book', emoji: '📖', translation: 'ספר', translationAr: 'كتاب', translationRu: 'книга', category: 1 },
        { word: 'ball', emoji: '⚽', translation: 'כדור', translationAr: 'كرة', translationRu: 'мяч', category: 1 },
        { word: 'car', emoji: '🚗', translation: 'מכונית', translationAr: 'سيارة', translationRu: 'машина', category: 1 },
        { word: 'house', emoji: '🏠', translation: 'בית', translationAr: 'منزل', translationRu: 'дом', category: 1 },
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
        { word: 'cat', emoji: '🐱', translation: 'חתול', translationAr: 'قطة', translationRu: 'кошка', category: 0 },
        { word: 'dog', emoji: '🐶', translation: 'כלב', translationAr: 'كلب', translationRu: 'собака', category: 0 },
        { word: 'fish', emoji: '🐟', translation: 'דג', translationAr: 'سمكة', translationRu: 'рыба', category: 0 },
        { word: 'bird', emoji: '🐦', translation: 'ציפור', translationAr: 'طائر', translationRu: 'птица', category: 0 },
        { word: 'apple', emoji: '🍎', translation: 'תפוח', translationAr: 'تفاحة', translationRu: 'яблоко', category: 1 },
        { word: 'cake', emoji: '🎂', translation: 'עוגה', translationAr: 'كعكة', translationRu: 'торт', category: 1 },
        { word: 'banana', emoji: '🍌', translation: 'בננה', translationAr: 'موزة', translationRu: 'банан', category: 1 },
        { word: 'milk', emoji: '🥛', translation: 'חלב', translationAr: 'حليب', translationRu: 'молоко', category: 1 },
      ],
    },
    {
      categories: [
        { name: 'Big', nameHe: 'גדולים', nameAr: 'كبيرة', nameRu: 'Большие', emoji: '🐘', color: 'from-purple-400 to-violet-500' },
        { name: 'Small', nameHe: 'קטנים', nameAr: 'صغيرة', nameRu: 'Маленькие', emoji: '🐁', color: 'from-pink-400 to-rose-500' },
      ],
      items: [
        { word: 'elephant', emoji: '🐘', translation: 'פיל', translationAr: 'فيل', translationRu: 'слон', category: 0 },
        { word: 'whale', emoji: '🐋', translation: 'לווייתן', translationAr: 'حوت', translationRu: 'кит', category: 0 },
        { word: 'horse', emoji: '🐎', translation: 'סוס', translationAr: 'حصان', translationRu: 'лошадь', category: 0 },
        { word: 'bear', emoji: '🐻', translation: 'דוב', translationAr: 'دب', translationRu: 'медведь', category: 0 },
        { word: 'mouse', emoji: '🐭', translation: 'עכבר', translationAr: 'فأر', translationRu: 'мышь', category: 1 },
        { word: 'ant', emoji: '🐜', translation: 'נמלה', translationAr: 'نملة', translationRu: 'муравей', category: 1 },
        { word: 'bee', emoji: '🐝', translation: 'דבורה', translationAr: 'نحلة', translationRu: 'пчела', category: 1 },
        { word: 'butterfly', emoji: '🦋', translation: 'פרפר', translationAr: 'فراشة', translationRu: 'бабочка', category: 1 },
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
  { nameHe: 'צעדים ראשונים', nameEn: 'First Steps', nameAr: 'الخطوات الأولى', nameRu: 'Первые шаги', emoji: '🌱', color: 'from-green-400 to-emerald-500', textColor: 'text-green-600 dark:text-green-400' },
  { nameHe: 'חוקר', nameEn: 'Explorer', nameAr: 'المستكشف', nameRu: 'Исследователь', emoji: '🔭', color: 'from-blue-400 to-indigo-500', textColor: 'text-blue-600 dark:text-blue-400' },
  { nameHe: 'קורא', nameEn: 'Reader', nameAr: 'القارئ', nameRu: 'Читатель', emoji: '📖', color: 'from-purple-400 to-violet-500', textColor: 'text-purple-600 dark:text-purple-400' },
  { nameHe: 'אלוף', nameEn: 'Champion', nameAr: 'البطل', nameRu: 'Чемпион', emoji: '🏆', color: 'from-orange-400 to-amber-500', textColor: 'text-orange-600 dark:text-orange-400' },
];

// Quest grammar fill-in-blank sentences per level
export const QUEST_GRAMMAR = {
  1: [
    { sentence: 'I ___ a cat', blank: 'have', options: ['have', 'has', 'is'], translationHe: 'יש לי חתול', translationAr: 'عندي قطة', translationRu: 'У меня есть кошка' },
    { sentence: 'The dog ___ big', blank: 'is', options: ['is', 'am', 'are'], translationHe: 'הכלב גדול', translationAr: 'الكلب كبير', translationRu: 'Собака большая' },
    { sentence: 'I ___ happy', blank: 'am', options: ['am', 'is', 'are'], translationHe: 'אני שמח', translationAr: 'أنا سعيد', translationRu: 'Я счастлив' },
    { sentence: 'The ball ___ red', blank: 'is', options: ['is', 'am', 'has'], translationHe: 'הכדור אדום', translationAr: 'الكرة حمراء', translationRu: 'Мяч красный' },
    { sentence: 'I ___ an apple', blank: 'like', options: ['like', 'likes', 'liking'], translationHe: 'אני אוהב תפוח', translationAr: 'أنا أحب التفاح', translationRu: 'Я люблю яблоко' },
    { sentence: 'Hello, ___ name is Dan', blank: 'my', options: ['my', 'me', 'I'], translationHe: 'שלום, השם שלי דן', translationAr: 'مرحبا، اسمي دان', translationRu: 'Привет, меня зовут Дан' },
    { sentence: 'The cat ___ small', blank: 'is', options: ['is', 'am', 'has'], translationHe: 'החתול קטן', translationAr: 'القطة صغيرة', translationRu: 'Кошка маленькая' },
    { sentence: 'I can ___ a star', blank: 'see', options: ['see', 'sees', 'saw'], translationHe: 'אני יכול לראות כוכב', translationAr: 'أستطيع أن أرى نجمة', translationRu: 'Я могу видеть звезду' },
    { sentence: 'The fish ___ blue', blank: 'is', options: ['is', 'am', 'are'], translationHe: 'הדג כחול', translationAr: 'السمكة زرقاء', translationRu: 'Рыба синяя' },
    { sentence: 'I ___ two cats', blank: 'have', options: ['have', 'has', 'is'], translationHe: 'יש לי שני חתולים', translationAr: 'عندي قطتان', translationRu: 'У меня есть две кошки' },
    { sentence: 'The sun ___ big', blank: 'is', options: ['is', 'am', 'has'], translationHe: 'השמש גדולה', translationAr: 'الشمس كبيرة', translationRu: 'Солнце большое' },
    { sentence: 'I ___ a bird', blank: 'see', options: ['see', 'sees', 'saw'], translationHe: 'אני רואה ציפור', translationAr: 'أنا أرى طائرا', translationRu: 'Я вижу птицу' },
    { sentence: 'We ___ happy', blank: 'are', options: ['are', 'is', 'am'], translationHe: 'אנחנו שמחים', translationAr: 'نحن سعداء', translationRu: 'Мы счастливы' },
    { sentence: 'I ___ a banana', blank: 'want', options: ['want', 'wants', 'wanting'], translationHe: 'אני רוצה בננה', translationAr: 'أنا أريد موزة', translationRu: 'Я хочу банан' },
  ],
  2: [
    { sentence: 'She ___ a dog', blank: 'has', options: ['has', 'have', 'had'], translationHe: 'יש לה כלב', translationAr: 'عندها كلب', translationRu: 'У неё есть собака' },
    { sentence: 'We ___ friends', blank: 'are', options: ['are', 'is', 'am'], translationHe: 'אנחנו חברים', translationAr: 'نحن أصدقاء', translationRu: 'Мы друзья' },
    { sentence: 'He ___ to school', blank: 'goes', options: ['goes', 'go', 'going'], translationHe: 'הוא הולך לבית ספר', translationAr: 'هو يذهب إلى المدرسة', translationRu: 'Он ходит в школу' },
    { sentence: 'They ___ playing', blank: 'are', options: ['are', 'is', 'am'], translationHe: 'הם משחקים', translationAr: 'هم يلعبون', translationRu: 'Они играют' },
    { sentence: 'The bird ___ fly', blank: 'can', options: ['can', 'is', 'has'], translationHe: 'הציפור יכולה לעוף', translationAr: 'الطائر يستطيع الطيران', translationRu: 'Птица умеет летать' },
    { sentence: 'I ___ cake', blank: 'like', options: ['like', 'likes', 'liking'], translationHe: 'אני אוהב עוגה', translationAr: 'أنا أحب الكعكة', translationRu: 'Я люблю торт' },
    { sentence: 'Mom ___ cooking', blank: 'is', options: ['is', 'am', 'are'], translationHe: 'אמא מבשלת', translationAr: 'أمي تطبخ', translationRu: 'Мама готовит' },
    { sentence: 'The sun ___ hot', blank: 'is', options: ['is', 'am', 'has'], translationHe: 'השמש חמה', translationAr: 'الشمس حارة', translationRu: 'Солнце горячее' },
    { sentence: 'He ___ a big brother', blank: 'has', options: ['has', 'have', 'is'], translationHe: 'יש לו אח גדול', translationAr: 'عنده أخ كبير', translationRu: 'У него есть старший брат' },
    { sentence: 'She ___ running fast', blank: 'is', options: ['is', 'am', 'are'], translationHe: 'היא רצה מהר', translationAr: 'هي تجري بسرعة', translationRu: 'Она бежит быстро' },
    { sentence: 'We ___ to the park', blank: 'go', options: ['go', 'goes', 'going'], translationHe: 'אנחנו הולכים לפארק', translationAr: 'نحن نذهب إلى الحديقة', translationRu: 'Мы идём в парк' },
    { sentence: 'The duck ___ swim', blank: 'can', options: ['can', 'is', 'has'], translationHe: 'הברווז יכול לשחות', translationAr: 'البطة تستطيع السباحة', translationRu: 'Утка умеет плавать' },
    { sentence: 'I ___ my pencil', blank: 'like', options: ['like', 'likes', 'liking'], translationHe: 'אני אוהב את העיפרון שלי', translationAr: 'أنا أحب قلمي', translationRu: 'Мне нравится мой карандаш' },
    { sentence: 'They ___ happy friends', blank: 'are', options: ['are', 'is', 'am'], translationHe: 'הם חברים שמחים', translationAr: 'هم أصدقاء سعداء', translationRu: 'Они счастливые друзья' },
  ],
  3: [
    { sentence: 'I ___ to the park yesterday', blank: 'went', options: ['went', 'go', 'goes'], translationHe: 'הלכתי לפארק אתמול', translationAr: 'ذهبت إلى الحديقة أمس', translationRu: 'Я ходил в парк вчера' },
    { sentence: 'She ___ reading a book', blank: 'is', options: ['is', 'am', 'are'], translationHe: 'היא קוראת ספר', translationAr: 'هي تقرأ كتابا', translationRu: 'Она читает книгу' },
    { sentence: 'They ___ not like rain', blank: 'do', options: ['do', 'does', 'did'], translationHe: 'הם לא אוהבים גשם', translationAr: 'هم لا يحبون المطر', translationRu: 'Они не любят дождь' },
    { sentence: 'He ___ fast', blank: 'runs', options: ['runs', 'run', 'running'], translationHe: 'הוא רץ מהר', translationAr: 'هو يجري بسرعة', translationRu: 'Он бегает быстро' },
    { sentence: 'We ___ eat lunch now', blank: 'will', options: ['will', 'was', 'is'], translationHe: 'נאכל ארוחת צהריים עכשיו', translationAr: 'سنأكل الغداء الآن', translationRu: 'Мы будем есть обед сейчас' },
    { sentence: 'The flower ___ beautiful', blank: 'is', options: ['is', 'are', 'has'], translationHe: 'הפרח יפה', translationAr: 'الزهرة جميلة', translationRu: 'Цветок красивый' },
    { sentence: 'I ___ my homework', blank: 'did', options: ['did', 'do', 'does'], translationHe: 'עשיתי את שיעורי הבית', translationAr: 'أنجزت واجبي المنزلي', translationRu: 'Я сделал домашнее задание' },
    { sentence: 'She ___ two cats', blank: 'has', options: ['has', 'have', 'is'], translationHe: 'יש לה שני חתולים', translationAr: 'عندها قطتان', translationRu: 'У неё есть две кошки' },
    { sentence: 'He ___ play outside', blank: 'can', options: ['can', 'is', 'has'], translationHe: 'הוא יכול לשחק בחוץ', translationAr: 'هو يستطيع اللعب بالخارج', translationRu: 'Он может играть на улице' },
    { sentence: 'They ___ eating lunch', blank: 'are', options: ['are', 'is', 'am'], translationHe: 'הם אוכלים ארוחת צהריים', translationAr: 'هم يأكلون الغداء', translationRu: 'Они обедают' },
    { sentence: 'I ___ to the store yesterday', blank: 'went', options: ['went', 'go', 'goes'], translationHe: 'הלכתי לחנות אתמול', translationAr: 'ذهبت إلى المتجر أمس', translationRu: 'Я ходил в магазин вчера' },
    { sentence: 'She ___ not like rain', blank: 'does', options: ['does', 'do', 'did'], translationHe: 'היא לא אוהבת גשם', translationAr: 'هي لا تحب المطر', translationRu: 'Она не любит дождь' },
    { sentence: 'We ___ ride bikes', blank: 'will', options: ['will', 'was', 'is'], translationHe: 'נרכב על אופניים', translationAr: 'سنركب الدراجات', translationRu: 'Мы будем кататься на велосипедах' },
    { sentence: 'The train ___ very fast', blank: 'is', options: ['is', 'are', 'am'], translationHe: 'הרכבת מהירה מאוד', translationAr: 'القطار سريع جدا', translationRu: 'Поезд очень быстрый' },
  ],
  4: [
    { sentence: 'If it rains, I ___ stay home', blank: 'will', options: ['will', 'was', 'am'], translationHe: 'אם ירד גשם, אשאר בבית', translationAr: 'إذا أمطرت، سأبقى في البيت', translationRu: 'Если пойдёт дождь, я останусь дома' },
    { sentence: 'She ___ already eaten', blank: 'has', options: ['has', 'have', 'had'], translationHe: 'היא כבר אכלה', translationAr: 'هي أكلت بالفعل', translationRu: 'Она уже поела' },
    { sentence: 'They ___ playing since morning', blank: 'have been', options: ['have been', 'has been', 'was'], translationHe: 'הם משחקים מהבוקר', translationAr: 'هم يلعبون منذ الصباح', translationRu: 'Они играют с утра' },
    { sentence: 'He ___ not come yesterday', blank: 'did', options: ['did', 'does', 'do'], translationHe: 'הוא לא בא אתמול', translationAr: 'هو لم يأتِ أمس', translationRu: 'Он не пришёл вчера' },
    { sentence: 'We should ___ more books', blank: 'read', options: ['read', 'reads', 'reading'], translationHe: 'עלינו לקרוא יותר ספרים', translationAr: 'يجب أن نقرأ المزيد من الكتب', translationRu: 'Нам следует читать больше книг' },
    { sentence: 'The elephant ___ the biggest animal', blank: 'is', options: ['is', 'are', 'am'], translationHe: 'הפיל הוא החיה הגדולה ביותר', translationAr: 'الفيل هو أكبر حيوان', translationRu: 'Слон -- самое большое животное' },
    { sentence: 'I ___ never seen a whale', blank: 'have', options: ['have', 'has', 'had'], translationHe: 'מעולם לא ראיתי לווייתן', translationAr: 'لم أرَ حوتا من قبل', translationRu: 'Я никогда не видел кита' },
    { sentence: 'She ___ her homework every day', blank: 'does', options: ['does', 'do', 'did'], translationHe: 'היא עושה שיעורי בית כל יום', translationAr: 'هي تعمل واجبها المنزلي كل يوم', translationRu: 'Она делает домашнее задание каждый день' },
    { sentence: 'They ___ been to the beach', blank: 'have', options: ['have', 'has', 'had'], translationHe: 'הם היו בחוף', translationAr: 'هم ذهبوا إلى الشاطئ', translationRu: 'Они были на пляже' },
    { sentence: 'The penguin ___ not fly', blank: 'can', options: ['can', 'is', 'has'], translationHe: 'הפינגווין לא יכול לעוף', translationAr: 'البطريق لا يستطيع الطيران', translationRu: 'Пингвин не умеет летать' },
    { sentence: 'I ___ writing a story', blank: 'am', options: ['am', 'is', 'are'], translationHe: 'אני כותב סיפור', translationAr: 'أنا أكتب قصة', translationRu: 'Я пишу рассказ' },
    { sentence: 'She ___ swim before she could walk', blank: 'could', options: ['could', 'can', 'will'], translationHe: 'היא ידעה לשחות לפני שידעה ללכת', translationAr: 'هي استطاعت السباحة قبل أن تمشي', translationRu: 'Она умела плавать ещё до того, как научилась ходить' },
    { sentence: 'The monkey ___ jumped very high', blank: 'has', options: ['has', 'have', 'had'], translationHe: 'הקוף קפץ מאוד גבוה', translationAr: 'القرد قفز عاليا جدا', translationRu: 'Обезьяна прыгнула очень высоко' },
    { sentence: 'We ___ going to the forest', blank: 'are', options: ['are', 'is', 'am'], translationHe: 'אנחנו הולכים ליער', translationAr: 'نحن ذاهبون إلى الغابة', translationRu: 'Мы идём в лес' },
  ],
};

// Quest level themes for level selector
export const QUEST_LEVEL_THEMES = [
  null, // index 0 unused
  { nameHe: 'צבעים וחיות', nameEn: 'Colors & Animals', nameAr: 'ألوان وحيوانات', nameRu: 'Цвета и животные', emoji: '🌈', ageRange: '4-5', color: 'from-green-400 to-emerald-500' },
  { nameHe: 'משפחה ובית ספר', nameEn: 'Family & School', nameAr: 'العائلة والمدرسة', nameRu: 'Семья и школа', emoji: '👨‍👩‍👧‍👦', ageRange: '6-7', color: 'from-blue-400 to-indigo-500' },
  { nameHe: 'בית וטבע', nameEn: 'Home & Nature', nameAr: 'البيت والطبيعة', nameRu: 'Дом и природа', emoji: '🏠', ageRange: '7-8', color: 'from-purple-400 to-violet-500' },
  { nameHe: 'הרפתקאות', nameEn: 'Adventures', nameAr: 'مغامرات', nameRu: 'Приключения', emoji: '🏆', ageRange: '9-10', color: 'from-orange-400 to-amber-500' },
];

// Quest difficulty scaling per level
export const QUEST_DIFFICULTY = [
  null, // index 0 unused
  { vocabOptions: 4, vocabRounds: 5, vocabXP: 10, grammarRounds: 4, grammarXP: 15, bossHP: 80, speechRounds: 3, speechXP: 15, timerEnabled: false, xpMultiplier: 1.0 },
  { vocabOptions: 4, vocabRounds: 6, vocabXP: 12, grammarRounds: 4, grammarXP: 18, bossHP: 100, speechRounds: 3, speechXP: 18, timerEnabled: false, xpMultiplier: 1.2 },
  { vocabOptions: 6, vocabRounds: 6, vocabXP: 12, grammarRounds: 5, grammarXP: 20, bossHP: 120, speechRounds: 4, speechXP: 20, timerEnabled: true, timerSeconds: 15, xpMultiplier: 1.5 },
  { vocabOptions: 6, vocabRounds: 7, vocabXP: 15, grammarRounds: 5, grammarXP: 25, bossHP: 150, speechRounds: 4, speechXP: 25, timerEnabled: true, timerSeconds: 12, xpMultiplier: 2.0 },
];
