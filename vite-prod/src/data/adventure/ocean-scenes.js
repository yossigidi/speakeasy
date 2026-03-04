/**
 * Ocean World — 6 scenes.
 *
 * Each scene defines: background, particles, character positions,
 * dialogue, exercise, and rewards.
 */

// Background definitions — single fullscreen image per scene
const SCENE1_BG = { fullscreen: '/images/adventure/backgrounds/ocean-scene1-reef.jpg' };
const SCENE2_BG = { fullscreen: '/images/adventure/backgrounds/ocean-scene2-ship.jpg' };
const SCENE3_BG = { fullscreen: '/images/adventure/backgrounds/ocean-scene3-garden.jpg' };
const SCENE4_BG = { fullscreen: '/images/adventure/backgrounds/ocean-scene4-cave.jpg' };
const SCENE5_BG = { fullscreen: '/images/adventure/backgrounds/ocean-scene5-trench.jpg' };
const SCENE6_BG = { fullscreen: '/images/adventure/backgrounds/ocean-scene6-whale.jpg' };

export const OCEAN_SCENES = [
  // Scene 1: The Coral Reef
  {
    id: 'ocean-1-reef',
    titleEn: 'The Coral Reef',
    titleHe: 'שונית האלמוגים',
    introVideo: '/videos/adventure/ocean-scene1.mp4',
    videoNarration: 'שונית אלמוגים צבעונית! מה נגלה מתחת למים?',
    background: SCENE1_BG,
    particles: { type: 'bubbles', density: 12 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'dolphin', type: 'dolphin', position: { x: 0.75, y: 0.65 } }],
    intro: { speakliWalkTo: { x: 0.35, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "Wow, we're underwater! Look at all the colors!", textHe: 'וואו, אנחנו מתחת למים! תראו כמה צבעים!', emotion: 'excited' },
      { speaker: 'dolphin', text: "Welcome to the ocean! I'm Dina the Dolphin! To enter the reef, tell me — what's this?", textHe: 'ברוכים הבאים לאוקיינוס! אני דינה הדולפינה! כדי להיכנס לשונית, ספרו לי — מה זה?', emotion: 'excited' },
      { speaker: 'speakli', text: "An animal that lives in the sea... I need to pick the right one!", textHe: 'חיה שגרה בים... אני צריך לבחור את הנכונה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'wordDoor',
      config: {
        targetWord: { word: 'fish', translation: 'דג' },
        distractors: ['cat', 'dog', 'bird'],
        prompt: '🐟 Which animal lives in the sea?',
        promptHe: '🐟 איזו חיה גרה בים?',
      },
    },
    reward: { xp: 10, coins: 5, speakliAnimation: 'celebrate' },
  },

  // Scene 2: The Sunken Ship
  {
    id: 'ocean-2-ship',
    titleEn: 'The Sunken Ship',
    titleHe: 'הספינה הטרופה',
    introVideo: '/videos/adventure/ocean-scene2.mp4',
    videoNarration: 'ספינה טרופה! איזה אוצרות מסתתרים כאן?',
    background: SCENE2_BG,
    particles: { type: 'bubbles', density: 15 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'turtle', type: 'turtle', position: { x: 0.7, y: 0.7 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "An old sunken ship! There's treasure inside!", textHe: 'ספינה טרופה ישנה! יש בפנים אוצר!', emotion: 'excited' },
      { speaker: 'turtle', text: "Hi there! I'm Tami the Turtle. Spell the word to unlock the treasure chest!", textHe: 'היי! אני טמי הצב. אייתו את המילה כדי לפתוח את ארגז האוצר!', emotion: 'talk' },
      { speaker: 'speakli', text: "I need to put the letters in the right order!", textHe: 'אני צריך לשים את האותיות בסדר הנכון!', emotion: 'talk' },
    ],
    exercise: {
      type: 'spellBridge',
      config: {
        targetWord: { word: 'cat', translation: 'חתול' },
        hint: '🐱 Say meow! Spell: ____',
        hintHe: '🐱 מיאו! אייתו: ____',
      },
    },
    reward: { xp: 15, coins: 5, speakliAnimation: 'celebrate' },
  },

  // Scene 3: The Sea Garden
  {
    id: 'ocean-3-garden',
    titleEn: 'The Sea Garden',
    titleHe: 'גן הים',
    introVideo: '/videos/adventure/ocean-scene3.mp4',
    videoNarration: 'גן ים קסום! פרחים שגדלים מתחת למים!',
    background: SCENE3_BG,
    particles: { type: 'bubbles', density: 10 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'octopus', type: 'octopus', position: { x: 0.65, y: 0.65 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'octopus', text: "Hello friends! I'm Oscar the Octopus! I know everything about the sea — let me quiz you!", textHe: 'שלום חברים! אני אוסקר התמנון! אני יודע הכל על הים — בואו אבחן אתכם!', emotion: 'excited' },
      { speaker: 'speakli', text: "Questions about the sea? Let's go!", textHe: 'שאלות על הים? יאללה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'multipleChoice',
      config: {
        questions: [
          { question: '🐠 What is this?', questionHe: '🐠 מה זה?', answer: 'fish', options: ['fish', 'cat', 'dog', 'bird'], image: '🐠' },
          { question: '🌊 What color is the sea?', questionHe: '🌊 באיזה צבע הים?', answer: 'blue', options: ['blue', 'red', 'green', 'yellow'], image: '🌊' },
          { question: '🐚 Where do fish live?', questionHe: '🐚 איפה דגים גרים?', answer: 'water', options: ['water', 'tree', 'house', 'car'], image: '🐚' },
        ],
      },
    },
    reward: { xp: 15, coins: 8, speakliAnimation: 'celebrate' },
  },

  // Scene 4: The Underwater Cave
  {
    id: 'ocean-4-cave',
    titleEn: 'The Underwater Cave',
    titleHe: 'המערה התת-ימית',
    introVideo: '/videos/adventure/ocean-scene4.mp4',
    videoNarration: 'מערה תת-ימית! מי גר במקום החשוך הזה?',
    background: SCENE4_BG,
    particles: { type: 'bubbles', density: 8 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'seahorse', type: 'seahorse', position: { x: 0.7, y: 0.6 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'seahorse', text: "Hello! I'm Sandy the Seahorse. Listen carefully and find the right animal!", textHe: 'שלום! אני סנדי סוסון הים. הקשיבו היטב ומצאו את החיה הנכונה!', emotion: 'talk' },
      { speaker: 'speakli', text: "Animal sounds! I'll listen and find the right one!", textHe: 'קולות של חיות! אקשיב ואמצא את הנכונה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'listenFind',
      config: {
        words: [
          { word: 'fish', translation: 'דג', emoji: '🐟' },
          { word: 'cat', translation: 'חתול', emoji: '🐱' },
          { word: 'dog', translation: 'כלב', emoji: '🐶' },
          { word: 'bird', translation: 'ציפור', emoji: '🐦' },
        ],
        rounds: 2,
      },
    },
    reward: { xp: 15, coins: 8, speakliAnimation: 'celebrate' },
  },

  // Scene 5: The Deep Trench (Mini-boss)
  {
    id: 'ocean-5-trench',
    titleEn: 'The Deep Trench',
    titleHe: 'התעלה העמוקה',
    introVideo: '/videos/adventure/ocean-scene5.mp4',
    videoNarration: 'אוי! התעלה העמוקה והחשוכה! כאן מחכה לנו קרלוס הסרטן עם שאלות מאתגרות!',
    background: SCENE5_BG,
    particles: { type: 'bubbles', density: 6 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'crab', type: 'crab', position: { x: 0.7, y: 0.72 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "It's so deep and dark down here...", textHe: 'כל כך עמוק וחשוך פה למטה...', emotion: 'sad' },
      { speaker: 'crab', text: "Hey! I'm Carlos the Crab! Answer 3 questions to light the way!", textHe: 'היי! אני קרלוס הסרטן! ענו על 3 שאלות כדי להאיר את הדרך!', emotion: 'excited' },
    ],
    exercise: {
      type: 'boss',
      config: {
        rounds: [
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'red', translation: 'אדום' },
              distractors: ['blue', 'green', 'yellow'],
              prompt: '🔴 What color is Carlos the Crab?',
              promptHe: '🔴 באיזה צבע קרלוס הסרטן?',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'fish', translation: 'דג' },
              distractors: ['cat', 'dog', 'bird'],
              prompt: '🐟 What lives in the sea?',
              promptHe: '🐟 מה גר בים?',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'two', translation: 'שתיים' },
              distractors: ['one', 'three', 'four'],
              prompt: '✌️ How many claws does Carlos have?',
              promptHe: '✌️ כמה צבתות יש לקרלוס?',
            },
          },
        ],
      },
    },
    reward: { xp: 20, coins: 10, speakliAnimation: 'celebrate' },
  },

  // Scene 6: Whale's Challenge (Boss)
  {
    id: 'ocean-6-whale',
    titleEn: "Whale's Challenge",
    titleHe: 'האתגר של הלווייתן',
    introVideo: '/videos/adventure/ocean-scene6.mp4',
    videoNarration: 'הלווייתן הגדול! ההרפתקה התת-ימית מגיעה לסוף!',
    background: SCENE6_BG,
    particles: { type: 'bubbles', density: 18 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'whale', type: 'whale', position: { x: 0.7, y: 0.55 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'whale', text: "SPLASH! I'm Wendy the Whale! Beat my 3 challenges to become an Ocean Hero!", textHe: 'שפריץ! אני וונדי הלווייתן! נצחו ב-3 אתגרים שלי כדי להפוך לגיבורי האוקיינוס!', emotion: 'excited' },
      { speaker: 'speakli', text: "We can do it! We've learned so much about the ocean!", textHe: 'אנחנו יכולים! למדנו כל כך הרבה על האוקיינוס!', emotion: 'talk' },
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
                  question: '🐋 What is the biggest animal in the sea?',
                  questionHe: '🐋 מה החיה הכי גדולה בים?',
                  answer: 'whale',
                  options: ['whale', 'fish', 'crab', 'turtle'],
                  image: '🐋',
                },
              ],
            },
          },
          {
            type: 'spellBridge',
            config: {
              targetWord: { word: 'dog', translation: 'כלב' },
              hint: '🐶 Woof woof! Spell: ____',
              hintHe: '🐶 הב הב! אייתו: ____',
            },
          },
          {
            type: 'listenFind',
            config: {
              words: [
                { word: 'red', translation: 'אדום', emoji: '🔴' },
                { word: 'blue', translation: 'כחול', emoji: '🔵' },
                { word: 'green', translation: 'ירוק', emoji: '🟢' },
                { word: 'yellow', translation: 'צהוב', emoji: '🟡' },
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
