/**
 * Forest World — 6 scenes.
 *
 * Each scene defines: background, particles, character positions,
 * dialogue, exercise, and rewards.
 */

// Procedural background color palettes (no external assets needed)
const FOREST_BG = {
  layers: [
    { color: [0x87CEEB, 0x4A90D9], speed: 0.1, y: 0, height: 180 },    // Sky
    { color: [0x228B22, 0x1A6B1A], speed: 0.3, y: 150, height: 120 },   // Far trees
    { color: [0x2D5A1E, 0x1E3F14], speed: 0.5, y: 240, height: 100 },   // Mid trees
    { color: [0x3B7A2E, 0x4A8B3B], speed: 0.8, y: 310, height: 80 },    // Near bushes
    { color: [0x5C4033, 0x4A3328], speed: 1.0, y: 370, height: 130 },    // Ground
  ],
};

const DARK_CAVE_BG = {
  layers: [
    { color: [0x1A1A2E, 0x0F0F1E], speed: 0.1, y: 0, height: 200 },    // Dark ceiling
    { color: [0x2D2D44, 0x1E1E33], speed: 0.3, y: 170, height: 130 },   // Cave walls
    { color: [0x3D3D55, 0x2A2A3E], speed: 0.6, y: 270, height: 100 },   // Mid cave
    { color: [0x4A4A5A, 0x3B3B4A], speed: 1.0, y: 350, height: 150 },   // Cave floor
  ],
};

const RIVER_BG = {
  layers: [
    { color: [0x87CEEB, 0x6BB5D6], speed: 0.1, y: 0, height: 160 },    // Sky
    { color: [0x228B22, 0x196B19], speed: 0.3, y: 130, height: 100 },   // Trees
    { color: [0x1E90FF, 0x1A7AE6], speed: 0.6, y: 220, height: 80 },   // River
    { color: [0x5C4033, 0x4A3328], speed: 0.8, y: 280, height: 60 },    // Bank
    { color: [0x3B7A2E, 0x4A8B3B], speed: 1.0, y: 330, height: 170 },   // Grass
  ],
};

const DRAGON_BG = {
  layers: [
    { color: [0xF97316, 0xDC2626], speed: 0.1, y: 0, height: 180 },    // Sunset sky
    { color: [0x1A1A2E, 0x2D1B4E], speed: 0.3, y: 150, height: 100 },  // Mountains
    { color: [0x4A2C17, 0x3B2312], speed: 0.5, y: 230, height: 80 },   // Rocky terrain
    { color: [0x5C4033, 0x6B4D3B], speed: 0.8, y: 290, height: 80 },   // Rocky ground
    { color: [0x8B4513, 0x6B3410], speed: 1.0, y: 360, height: 140 },   // Dragon's lair floor
  ],
};

export const FOREST_SCENES = [
  // Scene 1: The Forest Gate
  {
    id: 'forest-1-entrance',
    titleEn: 'The Forest Gate',
    titleHe: 'שער היער',
    background: FOREST_BG,
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
    background: FOREST_BG,
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
    background: FOREST_BG,
    particles: { type: 'leaves', density: 10 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'bunny', type: 'bunny', position: { x: 0.65, y: 0.72 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'bunny', text: "Hi friends! I'm Bella the Bunny! Can you help me sort berries?", textHe: 'היי חברים! אני בלה הארנבת! תעזרו לי למיין פירות?', emotion: 'excited' },
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
    background: RIVER_BG,
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
    background: DARK_CAVE_BG,
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
    background: DRAGON_BG,
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
