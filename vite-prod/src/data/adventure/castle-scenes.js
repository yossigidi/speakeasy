/**
 * Castle World — 6 scenes.
 *
 * Each scene defines: background, particles, character positions,
 * dialogue, exercise, and rewards.
 */

// Background definitions — single fullscreen image per scene
const SCENE1_BG = { fullscreen: '/images/adventure/backgrounds/castle-scene1-gate.jpg' };
const SCENE2_BG = { fullscreen: '/images/adventure/backgrounds/castle-scene2-garden.jpg' };
const SCENE3_BG = { fullscreen: '/images/adventure/backgrounds/castle-scene3-library.jpg' };
const SCENE4_BG = { fullscreen: '/images/adventure/backgrounds/castle-scene4-tower.jpg' };
const SCENE5_BG = { fullscreen: '/images/adventure/backgrounds/castle-scene5-dungeon.jpg' };
const SCENE6_BG = { fullscreen: '/images/adventure/backgrounds/castle-scene6-throne.jpg' };

export const CASTLE_SCENES = [
  // Scene 1: The Castle Gate
  {
    id: 'castle-1-gate',
    titleEn: 'The Castle Gate',
    titleHe: 'שער הטירה',
    background: SCENE1_BG,
    particles: { type: 'sparkle', density: 10 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'knight', type: 'knight', position: { x: 0.75, y: 0.7 } }],
    intro: { speakliWalkTo: { x: 0.35, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "A magical castle! But the gate is guarded!", textHe: 'טירה קסומה! אבל השער שמור!', emotion: 'excited' },
      { speaker: 'knight', text: "Halt! I'm Kevin the Knight! Answer my question to enter the castle!", textHe: 'עצור! אני קווין האביר! ענו על השאלה שלי כדי להיכנס לטירה!', emotion: 'talk' },
      { speaker: 'speakli', text: "A question about school... I can do this!", textHe: 'שאלה על בית ספר... אני יכול!', emotion: 'talk' },
    ],
    exercise: {
      type: 'wordDoor',
      config: {
        targetWord: { word: 'book', translation: 'ספר' },
        distractors: ['pen', 'desk', 'bag'],
        prompt: 'What do you read?',
        promptHe: 'במה קוראים?',
      },
    },
    reward: { xp: 10, coins: 5, speakliAnimation: 'celebrate' },
  },

  // Scene 2: The Royal Garden
  {
    id: 'castle-2-garden',
    titleEn: 'The Royal Garden',
    titleHe: 'הגן המלכותי',
    background: SCENE2_BG,
    particles: { type: 'leaves', density: 12 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'princess', type: 'princess', position: { x: 0.7, y: 0.68 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'princess', text: "Hello! I'm Princess Penelope! Spell the word to make the flowers bloom!", textHe: 'שלום! אני הנסיכה פנלופה! אייתו את המילה כדי לגרום לפרחים לפרוח!', emotion: 'excited' },
      { speaker: 'speakli', text: "A nature word! Let me spell it!", textHe: 'מילה מהטבע! בואו נאיית אותה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'spellBridge',
      config: {
        targetWord: { word: 'flower', translation: 'פרח' },
        hint: "Something beautiful that grows in the garden: ____",
        hintHe: 'משהו יפה שגדל בגינה: ____',
      },
    },
    reward: { xp: 15, coins: 5, speakliAnimation: 'celebrate' },
  },

  // Scene 3: The Grand Library
  {
    id: 'castle-3-library',
    titleEn: 'The Grand Library',
    titleHe: 'הספרייה הגדולה',
    background: SCENE3_BG,
    particles: { type: 'sparkle', density: 8 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'wizard', type: 'wizard', position: { x: 0.65, y: 0.65 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'wizard', text: "Welcome to my library! I'm Wally the Wizard! Let me test your knowledge of school!", textHe: 'ברוכים הבאים לספרייה שלי! אני וולי הקוסם! בואו אבדוק את הידע שלכם על בית ספר!', emotion: 'excited' },
      { speaker: 'speakli', text: "School words in English! Let's go!", textHe: 'מילים של בית ספר באנגלית! יאללה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'multipleChoice',
      config: {
        questions: [
          { question: 'Where do students sit?', questionHe: 'איפה תלמידים יושבים?', answer: 'desk', options: ['desk', 'pen', 'book', 'bag'], image: '🪑' },
          { question: 'What do you write with?', questionHe: 'במה כותבים?', answer: 'pen', options: ['book', 'pen', 'desk', 'ruler'], image: '✏️' },
          { question: 'What do you carry your things in?', questionHe: 'במה נושאים את הדברים?', answer: 'bag', options: ['pen', 'desk', 'bag', 'book'], image: '🎒' },
        ],
      },
    },
    reward: { xp: 15, coins: 8, speakliAnimation: 'celebrate' },
  },

  // Scene 4: The Tall Tower
  {
    id: 'castle-4-tower',
    titleEn: 'The Tall Tower',
    titleHe: 'המגדל הגבוה',
    background: SCENE4_BG,
    particles: { type: 'sparkle', density: 6 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'fairy', type: 'fairy', position: { x: 0.7, y: 0.55 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'fairy', text: "Hi! I'm Fiona the Fairy! Listen carefully and find the right nature word!", textHe: 'היי! אני פיונה הפיה! הקשיבו היטב ומצאו את מילת הטבע הנכונה!', emotion: 'talk' },
      { speaker: 'speakli', text: "Nature words! I'll listen and find the right picture!", textHe: 'מילים מהטבע! אקשיב ואמצא את התמונה הנכונה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'listenFind',
      config: {
        words: [
          { word: 'flower', translation: 'פרח', emoji: '🌸' },
          { word: 'river', translation: 'נהר', emoji: '🏞️' },
          { word: 'mountain', translation: 'הר', emoji: '⛰️' },
          { word: 'forest', translation: 'יער', emoji: '🌲' },
        ],
        rounds: 3,
      },
    },
    reward: { xp: 15, coins: 8, speakliAnimation: 'celebrate' },
  },

  // Scene 5: The Secret Dungeon (Mini-boss)
  {
    id: 'castle-5-dungeon',
    titleEn: 'The Secret Dungeon',
    titleHe: 'המרתף הסודי',
    background: SCENE5_BG,
    particles: { type: 'sparkle', density: 5 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'unicorn', type: 'unicorn', position: { x: 0.7, y: 0.65 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "A secret room! And there's a unicorn!", textHe: 'חדר סודי! ויש שם חד-קרן!', emotion: 'excited' },
      { speaker: 'unicorn', text: "I'm Uma the Unicorn! Open 3 magic locks to free me!", textHe: 'אני אומה חד-הקרן! פתחו 3 מנעולים קסומים כדי לשחרר אותי!', emotion: 'talk' },
    ],
    exercise: {
      type: 'boss',
      config: {
        rounds: [
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'pencil', translation: 'עיפרון' },
              distractors: ['ruler', 'book', 'desk'],
              prompt: 'Lock 1: What do you draw with?',
              promptHe: 'מנעול 1: במה מציירים?',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'river', translation: 'נהר' },
              distractors: ['mountain', 'forest', 'flower'],
              prompt: 'Lock 2: Water that flows through the land!',
              promptHe: 'מנעול 2: מים שזורמים בארץ!',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'happy', translation: 'שמח' },
              distractors: ['sad', 'angry', 'tired'],
              prompt: 'Lock 3: How do you feel when you win?',
              promptHe: 'מנעול 3: איך מרגישים כשמנצחים?',
            },
          },
        ],
      },
    },
    reward: { xp: 20, coins: 10, speakliAnimation: 'celebrate' },
  },

  // Scene 6: The Throne Room (Boss)
  {
    id: 'castle-6-throne',
    titleEn: "The King's Challenge",
    titleHe: 'האתגר של המלך',
    background: SCENE6_BG,
    particles: { type: 'sparkle', density: 18 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'king', type: 'king', position: { x: 0.7, y: 0.6 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'king', text: "Welcome, brave hero! I'm King Rex! Pass my 3 final challenges to become the Champion of Speakli!", textHe: 'ברוכים הבאים, גיבור אמיץ! אני המלך רקס! עברו 3 אתגרים אחרונים כדי להפוך לאלוף של ספיקלי!', emotion: 'excited' },
      { speaker: 'speakli', text: "The final challenge! We've learned so much — we can do this!", textHe: 'האתגר האחרון! למדנו כל כך הרבה — אנחנו יכולים!', emotion: 'talk' },
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
                  question: 'How do you feel when something bad happens?',
                  questionHe: 'איך מרגישים כשמשהו רע קורה?',
                  answer: 'sad',
                  options: ['sad', 'happy', 'hungry', 'tired'],
                  image: '😢',
                },
              ],
            },
          },
          {
            type: 'spellBridge',
            config: {
              targetWord: { word: 'castle', translation: 'טירה' },
              hint: "A king lives in a ____",
              hintHe: 'מלך גר ב____',
            },
          },
          {
            type: 'listenFind',
            config: {
              words: [
                { word: 'book', translation: 'ספר', emoji: '📖' },
                { word: 'pencil', translation: 'עיפרון', emoji: '✏️' },
                { word: 'flower', translation: 'פרח', emoji: '🌸' },
                { word: 'happy', translation: 'שמח', emoji: '😊' },
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
