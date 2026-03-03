/**
 * Forest World — 6 scenes.
 *
 * Each scene defines: background, particles, character positions,
 * dialogue, exercise, and rewards.
 */

// Background definitions — image assets with color fallbacks
const FOREST_BG = {
  layers: [
    { asset: '/images/adventure/backgrounds/forest-sky.jpg', speed: 0.1, y: 0, height: 180 },
    { asset: '/images/adventure/backgrounds/forest-trees-far.jpg', speed: 0.3, y: 150, height: 120 },
    { asset: '/images/adventure/backgrounds/forest-trees-near.jpg', speed: 0.6, y: 250, height: 110 },
    { asset: '/images/adventure/backgrounds/forest-ground.jpg', speed: 1.0, y: 340, height: 360 },
  ],
};

const DARK_CAVE_BG = {
  layers: [
    { asset: '/images/adventure/backgrounds/forest-sky.jpg', speed: 0.1, y: 0, height: 180 },
    { asset: '/images/adventure/objects/cave-entrance.jpg', speed: 0.3, y: 150, height: 140 },
    { color: [0x2D2D44, 0x1E1E33], speed: 0.6, y: 270, height: 100 },
    { color: [0x3D3D55, 0x2A2A3E], speed: 1.0, y: 350, height: 350 },
  ],
};

const RIVER_BG = {
  layers: [
    { asset: '/images/adventure/backgrounds/forest-sky.jpg', speed: 0.1, y: 0, height: 160 },
    { asset: '/images/adventure/backgrounds/forest-trees-far.jpg', speed: 0.3, y: 130, height: 100 },
    { asset: '/images/adventure/objects/forest-river.jpg', speed: 0.6, y: 220, height: 90 },
    { asset: '/images/adventure/backgrounds/forest-ground.jpg', speed: 1.0, y: 300, height: 400 },
  ],
};

const DRAGON_BG = {
  layers: [
    { asset: '/images/adventure/backgrounds/forest-sky.jpg', speed: 0.1, y: 0, height: 180 },
    { asset: '/images/adventure/objects/dragon-lair.jpg', speed: 0.3, y: 150, height: 120 },
    { color: [0x5C4033, 0x6B4D3B], speed: 0.7, y: 260, height: 90 },
    { color: [0x8B4513, 0x6B3410], speed: 1.0, y: 340, height: 360 },
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
    sceneObjects: [
      { id: 'gate', asset: '/images/adventure/objects/forest-gate.jpg', assetAfter: '/images/adventure/objects/forest-gate-open.jpg', position: { x: 0.5, y: 0.65 }, height: 120 },
    ],
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
    sceneObjects: [
      { id: 'bridge', asset: '/images/adventure/objects/bridge-broken.jpg', assetAfter: '/images/adventure/objects/bridge-fixed.jpg', position: { x: 0.5, y: 0.78 }, height: 80 },
    ],
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
    sceneObjects: [
      { id: 'berries', asset: '/images/adventure/objects/berry-bushes.jpg', position: { x: 0.45, y: 0.7 }, height: 90 },
    ],
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
    sceneObjects: [
      { id: 'river', asset: '/images/adventure/objects/forest-river.jpg', position: { x: 0.5, y: 0.75 }, height: 70 },
    ],
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
    sceneObjects: [
      { id: 'cave', asset: '/images/adventure/objects/cave-entrance.jpg', position: { x: 0.35, y: 0.6 }, height: 110 },
    ],
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
    sceneObjects: [
      { id: 'lair', asset: '/images/adventure/objects/dragon-lair.jpg', position: { x: 0.5, y: 0.55 }, height: 130 },
    ],
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
