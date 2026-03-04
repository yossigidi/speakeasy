/**
 * Forest World — 6 scenes.
 *
 * Each scene defines: background, particles, character positions,
 * dialogue, exercise, and rewards.
 */

// Background definitions — single fullscreen image per scene
const SCENE1_BG = { fullscreen: '/images/adventure/backgrounds/forest-scene1-gate.jpg' };
const SCENE2_BG = { fullscreen: '/images/adventure/backgrounds/forest-scene2-bridge.jpg' };
const SCENE3_BG = { fullscreen: '/images/adventure/backgrounds/forest-scene3-berries.jpg' };
const SCENE4_BG = { fullscreen: '/images/adventure/backgrounds/forest-scene4-river.jpg' };
const SCENE5_BG = { fullscreen: '/images/adventure/backgrounds/forest-scene5-cave.jpg' };
const SCENE6_BG = { fullscreen: '/images/adventure/backgrounds/forest-scene6-dragon.jpg' };

export const FOREST_SCENES = [
  // Scene 1: The Forest Gate
  {
    id: 'forest-1-entrance',
    titleEn: 'The Forest Gate',
    titleHe: 'שער היער',
    introVideo: '/videos/adventure/forest-scene1.mp4',
    background: SCENE1_BG,
    particles: { type: 'leaves', density: 15 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'fox', type: 'fox', position: { x: 0.75, y: 0.7 } }],
    intro: { speakliWalkTo: { x: 0.35, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "Look! A big gate... It's locked!", textHe: 'תראו! שער גדול... הוא נעול!', emotion: 'talk' },
      { speaker: 'fox', text: "Hi! I'm Felix the Fox! Say the magic word to open it!", textHe: 'היי! אני פליקס השועל! תגידו את מילת הקסם כדי לפתוח!', emotion: 'excited' },
      { speaker: 'speakli', text: "The magic word is an English word... Let's try!", textHe: 'מילת הקסם היא מילה באנגלית... בואו ננסה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'wordDoor',
      config: {
        targetWord: { word: 'hello', translation: 'שלום' },
        distractors: ['bye', 'yes', 'no'],
        prompt: 'Say the magic word to open the gate!',
        promptHe: 'בחרו את מילת הקסם כדי לפתוח את השער!',
      },
    },
    reward: { xp: 10, coins: 5, speakliAnimation: 'celebrate' },
  },

  // Scene 2: The Talking Tree
  {
    id: 'forest-2-tree',
    titleEn: 'The Talking Tree',
    titleHe: 'העץ המדבר',
    introVideo: '/videos/adventure/forest-scene2.mp4',
    background: SCENE2_BG,
    particles: { type: 'leaves', density: 20 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'owl', type: 'owl', position: { x: 0.7, y: 0.55 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "Oh no, the bridge is broken!", textHe: 'אוי לא, הגשר שבור!', emotion: 'sad' },
      { speaker: 'owl', text: "Hoo hoo! I'm Oliver the Owl. Spell the word to fix the bridge!", textHe: 'הוהו! אני אוליבר הינשוף. אייתו את המילה כדי לתקן את הגשר!', emotion: 'talk' },
      { speaker: 'speakli', text: "I need to put the letters in order!", textHe: 'אני צריך לשים את האותיות בסדר הנכון!', emotion: 'talk' },
    ],
    exercise: {
      type: 'spellBridge',
      config: {
        targetWord: { word: 'bird', translation: 'ציפור' },
        hint: "Oliver is a ____",
        hintHe: 'אוליבר הוא ____',
      },
    },
    reward: { xp: 15, coins: 5, speakliAnimation: 'celebrate' },
  },

  // Scene 3: The Berry Patch
  {
    id: 'forest-3-berries',
    titleEn: 'The Berry Patch',
    titleHe: 'שדה הפירות',
    introVideo: '/videos/adventure/forest-scene3.mp4',
    background: SCENE3_BG,
    particles: { type: 'leaves', density: 10 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'bunny', type: 'bunny', position: { x: 0.65, y: 0.72 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'bunny', text: "Hi friends! I'm Bella the Bunny! Can you help me sort berries?", textHe: 'היי חברים! אני Bella הארנבת! תעזרו לי למיין פירות?', emotion: 'excited' },
      { speaker: 'speakli', text: "Sure! We need to know our colors in English!", textHe: 'בטח! אנחנו צריכים לדעת צבעים באנגלית!', emotion: 'talk' },
    ],
    exercise: {
      type: 'multipleChoice',
      config: {
        questions: [
          { question: 'What color is a strawberry?', questionHe: 'באיזה צבע תות?', answer: 'red', options: ['red', 'blue', 'green', 'yellow'], image: '🍓' },
          { question: 'What color is a blueberry?', questionHe: 'באיזה צבע אוכמנית?', answer: 'blue', options: ['red', 'blue', 'green', 'yellow'], image: '🫐' },
          { question: 'What color is a banana?', questionHe: 'באיזה צבע בננה?', answer: 'yellow', options: ['red', 'blue', 'green', 'yellow'], image: '🍌' },
        ],
      },
    },
    reward: { xp: 15, coins: 8, speakliAnimation: 'celebrate' },
  },

  // Scene 4: The River Crossing
  {
    id: 'forest-4-river',
    titleEn: 'The River Crossing',
    titleHe: 'חציית הנהר',
    introVideo: '/videos/adventure/forest-scene4.mp4',
    background: SCENE4_BG,
    particles: { type: 'sparkle', density: 8 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'deer', type: 'deer', position: { x: 0.7, y: 0.7 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'deer', text: "Hello! I'm Danny the Deer. To cross the river, listen carefully!", textHe: 'שלום! אני דני האייל. כדי לחצות את הנהר, הקשיבו בתשומת לב!', emotion: 'talk' },
      { speaker: 'speakli', text: "I'll listen to the word and find the right picture!", textHe: 'אקשיב למילה ואמצא את התמונה הנכונה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'listenFind',
      config: {
        words: [
          { word: 'cat', translation: 'חתול', emoji: '🐱' },
          { word: 'dog', translation: 'כלב', emoji: '🐶' },
          { word: 'fish', translation: 'דג', emoji: '🐟' },
          { word: 'tree', translation: 'עץ', emoji: '🌳' },
        ],
        rounds: 3,
      },
    },
    reward: { xp: 15, coins: 8, speakliAnimation: 'celebrate' },
  },

  // Scene 5: The Dark Cave
  {
    id: 'forest-5-cave',
    titleEn: 'The Dark Cave',
    titleHe: 'המערה החשוכה',
    introVideo: '/videos/adventure/forest-scene5.mp4',
    background: SCENE5_BG,
    particles: { type: 'sparkle', density: 5 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'firefly', type: 'firefly', position: { x: 0.5, y: 0.45 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "It's so dark in here...", textHe: 'חשוך כאן...', emotion: 'sad' },
      { speaker: 'firefly', text: "Don't worry! I'm Glowy! Open 3 doors with English words!", textHe: 'אל תדאגו! אני גלואי! פתחו 3 דלתות עם מילים באנגלית!', emotion: 'excited' },
    ],
    exercise: {
      type: 'boss',
      config: {
        rounds: [
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'open', translation: 'פתוח' },
              distractors: ['close', 'stop', 'run'],
              prompt: 'Door 1: Choose the right word!',
              promptHe: 'דלת 1: בחרו את המילה הנכונה!',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'light', translation: 'אור' },
              distractors: ['dark', 'heavy', 'small'],
              prompt: 'Door 2: Choose the right word!',
              promptHe: 'דלת 2: בחרו את המילה הנכונה!',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'star', translation: 'כוכב' },
              distractors: ['moon', 'sun', 'cloud'],
              prompt: 'Door 3: Choose the right word!',
              promptHe: 'דלת 3: בחרו את המילה הנכונה!',
            },
          },
        ],
      },
    },
    reward: { xp: 20, coins: 10, speakliAnimation: 'celebrate' },
  },

  // Scene 6: The Dragon's Challenge (Boss)
  {
    id: 'forest-6-dragon',
    titleEn: "The Dragon's Challenge",
    titleHe: 'האתגר של הדרקון',
    introVideo: '/videos/adventure/forest-scene6.mp4',
    background: SCENE6_BG,
    particles: { type: 'sparkle', density: 12 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'dragon', type: 'dragon', position: { x: 0.7, y: 0.6 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'dragon', text: "ROAR! I'm Drago! Beat my 3 challenges to become a Forest Hero!", textHe: 'שאגה! אני דרגו! נצחו ב-3 אתגרים שלי כדי להפוך לגיבורי היער!', emotion: 'excited' },
      { speaker: 'speakli', text: "We can do it! We've learned so much!", textHe: 'אנחנו יכולים! למדנו כל כך הרבה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'boss',
      config: {
        rounds: [
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'brave', translation: 'אמיץ' },
              distractors: ['scared', 'tired', 'angry'],
              prompt: 'Round 1: What does a hero need to be?',
              promptHe: 'סיבוב 1: מה גיבור צריך להיות?',
            },
          },
          {
            type: 'spellBridge',
            config: {
              targetWord: { word: 'fire', translation: 'אש' },
              hint: "Dragons breathe ____",
              hintHe: 'דרקונים נושפים ____',
            },
          },
          {
            type: 'multipleChoice',
            config: {
              questions: [
                {
                  question: 'What does Drago want to be?',
                  questionHe: 'מה דרגו רוצה להיות?',
                  answer: 'friend',
                  options: ['friend', 'enemy', 'king', 'monster'],
                  image: '🐉',
                },
              ],
            },
          },
        ],
      },
    },
    reward: { xp: 30, coins: 15, speakliAnimation: 'celebrate' },
  },
];
