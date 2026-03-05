/**
 * Space World — 6 scenes.
 *
 * Each scene defines: background, particles, character positions,
 * dialogue, exercise, and rewards.
 */

// Background definitions — single fullscreen image per scene
const SCENE1_BG = { fullscreen: '/images/adventure/backgrounds/space-scene1-launchpad.jpg' };
const SCENE2_BG = { fullscreen: '/images/adventure/backgrounds/space-scene2-asteroids.jpg' };
const SCENE3_BG = { fullscreen: '/images/adventure/backgrounds/space-scene3-station.jpg' };
const SCENE4_BG = { fullscreen: '/images/adventure/backgrounds/space-scene4-moon.jpg' };
const SCENE5_BG = { fullscreen: '/images/adventure/backgrounds/space-scene5-nebula.jpg' };
const SCENE6_BG = { fullscreen: '/images/adventure/backgrounds/space-scene6-phoenix.jpg' };

export const SPACE_SCENES = [
  // Scene 1: The Launch Pad
  {
    id: 'space-1-launchpad',
    titleEn: 'The Launch Pad',
    titleHe: 'כן השיגור',
    titleAr: 'منصة الإطلاق',
    titleRu: 'Стартовая площадка',
    introVideo: '/videos/adventure/space-scene1.mp4',
    videoNarration: 'כן השיגור! מוכנים להמריא לחלל?',
    background: SCENE1_BG,
    particles: { type: 'stars', density: 12 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'star', type: 'star', position: { x: 0.75, y: 0.6 } }],
    intro: { speakliWalkTo: { x: 0.35, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "We made it to space! Look at all the stars!", textHe: 'הגענו לחלל! תראו כמה כוכבים!', textAr: 'وصلنا إلى الفضاء! انظروا إلى كل هذه النجوم!', textRu: 'Мы добрались до космоса! Посмотрите на все эти звёзды!', emotion: 'excited' },
      { speaker: 'star', text: "Welcome, astronaut! I'm Stella the Star! What's the weather like on Earth?", textHe: 'ברוכים הבאים, אסטרונאוט! אני סטלה הכוכב! מה מזג האוויר על כדור הארץ?', textAr: 'أهلاً، رائد الفضاء! أنا ستيلا النجمة! كيف الطقس على كوكب الأرض؟', textRu: 'Добро пожаловать, астронавт! Я Стелла Звезда! Какая погода на Земле?', emotion: 'excited' },
      { speaker: 'speakli', text: "Weather words in English... Let's go!", textHe: 'מילים של מזג אוויר באנגלית... יאללה!', textAr: 'كلمات الطقس بالإنجليزية... هيا بنا!', textRu: 'Слова о погоде по-английски... Давайте!', emotion: 'talk' },
    ],
    exercise: {
      type: 'wordDoor',
      config: {
        targetWord: { word: 'sun', translation: 'שמש' },
        distractors: ['rain', 'snow', 'cloud'],
        prompt: 'What shines bright in the sky?',
        promptHe: 'מה זורח בשמיים?',
        promptAr: 'ما الذي يلمع في السماء؟',
        promptRu: 'Что ярко светит на небе?',
      },
    },
    reward: { xp: 10, coins: 5, speakliAnimation: 'celebrate' },
  },

  // Scene 2: The Asteroid Belt
  {
    id: 'space-2-asteroids',
    titleEn: 'The Asteroid Belt',
    titleHe: 'חגורת האסטרואידים',
    titleAr: 'حزام الكويكبات',
    titleRu: 'Пояс астероидов',
    introVideo: '/videos/adventure/space-scene2.mp4',
    videoNarration: 'שדה אסטרואידים! צריך לעבור בזהירות!',
    background: SCENE2_BG,
    particles: { type: 'stars', density: 15 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'comet', type: 'comet', position: { x: 0.7, y: 0.6 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "So many asteroids! We need to fly through!", textHe: 'כל כך הרבה אסטרואידים! צריך לעבור ביניהם!', textAr: 'كم هذه الكويكبات كثيرة! يجب أن نطير عبرها!', textRu: 'Так много астероидов! Нам нужно пролететь сквозь них!', emotion: 'excited' },
      { speaker: 'comet', text: "Hi! I'm Cosmo the Comet! Spell the word to clear the path!", textHe: 'היי! אני קוסמו השביט! אייתו את המילה כדי לפנות את הדרך!', textAr: 'مرحباً! أنا كوسمو المذنب! تهجَّ الكلمة لتنظيف الطريق!', textRu: 'Привет! Я Космо Комета! Произнеси слово по буквам, чтобы расчистить путь!', emotion: 'talk' },
      { speaker: 'speakli', text: "I need to put the letters in the right order!", textHe: 'אני צריך לסדר את האותיות בסדר הנכון!', textAr: 'أحتاج إلى ترتيب الحروف بالترتيب الصحيح!', textRu: 'Мне нужно расставить буквы в правильном порядке!', emotion: 'talk' },
    ],
    exercise: {
      type: 'spellBridge',
      config: {
        targetWord: { word: 'shirt', translation: 'חולצה' },
        hint: "You wear a ____ on your body",
        hintHe: 'לובשים ____ על הגוף',
        hintAr: 'ترتدي ____ على جسمك',
        hintRu: 'Ты носишь ____ на теле',
      },
    },
    reward: { xp: 15, coins: 5, speakliAnimation: 'celebrate' },
  },

  // Scene 3: The Space Station
  {
    id: 'space-3-station',
    titleEn: 'The Space Station',
    titleHe: 'תחנת החלל',
    titleAr: 'محطة الفضاء',
    titleRu: 'Космическая станция',
    introVideo: '/videos/adventure/space-scene3.mp4',
    videoNarration: 'תחנת חלל! מי עובד כאן למעלה בין הכוכבים?',
    background: SCENE3_BG,
    particles: { type: 'stars', density: 8 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'alien', type: 'alien', position: { x: 0.65, y: 0.65 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'alien', text: "Greetings, Earthling! I'm Luna! I want to learn about your weather!", textHe: 'שלום, ארצישראלי! אני לונה! אני רוצה ללמוד על מזג האוויר שלכם!', textAr: 'تحياتي، يا إنسان الأرض! أنا لونا! أريد أن أتعلم عن طقسكم!', textRu: 'Привет, землянин! Я Луна! Я хочу узнать о вашей погоде!', emotion: 'excited' },
      { speaker: 'speakli', text: "Let's teach Luna about weather in English!", textHe: 'בואו נלמד את לונה על מזג אוויר באנגלית!', textAr: 'لنعلم لونا عن الطقس بالإنجليزية!', textRu: 'Давайте научим Луну погоде по-английски!', emotion: 'talk' },
    ],
    exercise: {
      type: 'multipleChoice',
      config: {
        questions: [
          { question: 'What falls from the clouds?', questionHe: 'מה נופל מהעננים?', questionAr: 'ماذا يسقط من الغيوم؟', questionRu: 'Что падает из облаков?', answer: 'rain', options: ['rain', 'sun', 'wind', 'hot'], image: '🌧️' },
          { question: 'What is white and fluffy in the sky?', questionHe: 'מה לבן ורך בשמיים?', questionAr: 'ما هو الأبيض والرقيق في السماء؟', questionRu: 'Что белое и пушистое на небе?', answer: 'cloud', options: ['snow', 'cloud', 'rain', 'cold'], image: '☁️' },
          { question: 'What is cold and white in winter?', questionHe: 'מה קר ולבן בחורף?', questionAr: 'ما هو البارد والأبيض في الشتاء؟', questionRu: 'Что холодное и белое зимой?', answer: 'snow', options: ['rain', 'wind', 'snow', 'sun'], image: '❄️' },
        ],
      },
    },
    reward: { xp: 15, coins: 8, speakliAnimation: 'celebrate' },
  },

  // Scene 4: The Moon Base
  {
    id: 'space-4-moon',
    titleEn: 'The Moon Base',
    titleHe: 'בסיס הירח',
    titleAr: 'قاعدة القمر',
    titleRu: 'Лунная база',
    introVideo: '/videos/adventure/space-scene4.mp4',
    videoNarration: 'הירח! האם נפגוש חייזרים ידידותיים?',
    background: SCENE4_BG,
    particles: { type: 'sparkle', density: 6 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'robot', type: 'robot', position: { x: 0.7, y: 0.7 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'robot', text: "Beep boop! I'm Buzz the Robot! Listen and find the right clothing!", textHe: 'ביפ בופ! אני באז הרובוט! הקשיבו ומצאו את הבגד הנכון!', textAr: 'بيب بوب! أنا باز الروبوت! استمعوا وابحثوا عن الملابس الصحيحة!', textRu: 'Бип-буп! Я Базз Робот! Слушайте и найдите правильную одежду!', emotion: 'talk' },
      { speaker: 'speakli', text: "Clothes in English! I'll listen carefully!", textHe: 'בגדים באנגלית! אקשיב בתשומת לב!', textAr: 'الملابس بالإنجليزية! سأستمع بانتباه!', textRu: 'Одежда по-английски! Я буду слушать внимательно!', emotion: 'talk' },
    ],
    exercise: {
      type: 'listenFind',
      config: {
        words: [
          { word: 'shoes', translation: 'נעליים', emoji: '👟' },
          { word: 'hat', translation: 'כובע', emoji: '🎩' },
          { word: 'dress', translation: 'שמלה', emoji: '👗' },
          { word: 'pants', translation: 'מכנסיים', emoji: '👖' },
        ],
        rounds: 3,
      },
    },
    reward: { xp: 15, coins: 8, speakliAnimation: 'celebrate' },
  },

  // Scene 5: The Nebula (Mini-boss)
  {
    id: 'space-5-nebula',
    titleEn: 'The Nebula',
    titleHe: 'הערפילית',
    titleAr: 'السديم',
    titleRu: 'Туманность',
    introVideo: '/videos/adventure/space-scene5.mp4',
    videoNarration: 'ערפילית צבעונית! איזה יופי יש בחלל!',
    background: SCENE5_BG,
    particles: { type: 'stars', density: 20 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'spacecat', type: 'spacecat', position: { x: 0.7, y: 0.68 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "It's so colorful here! Like a painting!", textHe: 'כל כך צבעוני פה! כמו ציור!', textAr: 'كم هذا المكان ملوّن! مثل اللوحة الفنية!', textRu: 'Здесь так красочно! Как картина!', emotion: 'excited' },
      { speaker: 'spacecat', text: "Meow! I'm Nova the Space Cat! Answer 3 questions to cross the nebula!", textHe: 'מיאו! אני נובה חתולת החלל! ענו על 3 שאלות כדי לחצות את הערפילית!', textAr: 'مياو! أنا نوفا قطة الفضاء! أجيبوا على 3 أسئلة لعبور السديم!', textRu: 'Мяу! Я Нова Космическая Кошка! Ответьте на 3 вопроса, чтобы пересечь туманность!', emotion: 'excited' },
    ],
    exercise: {
      type: 'boss',
      config: {
        rounds: [
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'rain', translation: 'גשם' },
              distractors: ['sun', 'hot', 'wind'],
              prompt: 'Star 1: What makes puddles on the ground?',
              promptHe: 'כוכב 1: מה עושה שלוליות על הרצפה?',
              promptAr: 'النجمة 1: ما الذي يصنع البرك على الأرض؟',
              promptRu: 'Звезда 1: Что делает лужи на земле?',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'shoes', translation: 'נעליים' },
              distractors: ['hat', 'shirt', 'dress'],
              prompt: 'Star 2: What do you wear on your feet?',
              promptHe: 'כוכב 2: מה לובשים על הרגליים?',
              promptAr: 'النجمة 2: ماذا ترتدي على قدميك؟',
              promptRu: 'Звезда 2: Что ты носишь на ногах?',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'bed', translation: 'מיטה' },
              distractors: ['chair', 'table', 'door'],
              prompt: 'Star 3: Where do you sleep?',
              promptHe: 'כוכב 3: איפה ישנים?',
              promptAr: 'النجمة 3: أين تنام؟',
              promptRu: 'Звезда 3: Где ты спишь?',
            },
          },
        ],
      },
    },
    reward: { xp: 20, coins: 10, speakliAnimation: 'celebrate' },
  },

  // Scene 6: Galaxy's Challenge (Boss)
  {
    id: 'space-6-phoenix',
    titleEn: "Galaxy's Challenge",
    titleHe: 'האתגר של גלקסי',
    titleAr: 'تحدي المجرة',
    titleRu: 'Испытание Галактики',
    introVideo: '/videos/adventure/space-scene6.mp4',
    videoNarration: 'עוף החול הקוסמי! ההרפתקה בחלל מגיעה לסוף!',
    background: SCENE6_BG,
    particles: { type: 'sparkle', density: 18 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'phoenix', type: 'phoenix', position: { x: 0.7, y: 0.55 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'phoenix', text: "I'm Galaxy the Space Phoenix! Pass my 3 challenges to become a Space Hero!", textHe: 'אני גלקסי עוף החול של החלל! עברו 3 אתגרים שלי כדי להפוך לגיבורי החלל!', textAr: 'أنا غالاكسي طائر الفضاء الخرافي! اجتازوا تحدياتي الـ3 لتصبحوا أبطال الفضاء!', textRu: 'Я Галакси Космический Феникс! Пройдите мои 3 испытания, чтобы стать Героями Космоса!', emotion: 'excited' },
      { speaker: 'speakli', text: "We've come so far! We can do this!", textHe: 'עשינו דרך ארוכה! אנחנו יכולים!', textAr: 'لقد قطعنا شوطاً طويلاً! نستطيع فعل هذا!', textRu: 'Мы прошли такой долгий путь! Мы справимся!', emotion: 'talk' },
    ],
    exercise: {
      type: 'boss',
      config: {
        rounds: [
          {
            type: 'multipleChoice',
            config: {
              questions: [
                {
                  question: 'Where do you sit?',
                  questionHe: 'איפה יושבים?',
                  questionAr: 'أين تجلس؟',
                  questionRu: 'Где ты сидишь?',
                  answer: 'chair',
                  options: ['chair', 'bed', 'window', 'door'],
                  image: '🪑',
                },
              ],
            },
          },
          {
            type: 'spellBridge',
            config: {
              targetWord: { word: 'house', translation: 'בית' },
              hint: "You live in a ____",
              hintHe: 'גרים ב____',
              hintAr: 'تعيش في ____',
              hintRu: 'Ты живёшь в ____',
            },
          },
          {
            type: 'listenFind',
            config: {
              words: [
                { word: 'run', translation: 'לרוץ', emoji: '🏃' },
                { word: 'jump', translation: 'לקפוץ', emoji: '🤸' },
                { word: 'eat', translation: 'לאכול', emoji: '🍽️' },
                { word: 'sleep', translation: 'לישון', emoji: '😴' },
              ],
              rounds: 2,
            },
          },
        ],
      },
    },
    reward: { xp: 30, coins: 15, speakliAnimation: 'celebrate' },
  },
];
