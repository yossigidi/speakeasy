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
    background: SCENE1_BG,
    particles: { type: 'bubbles', density: 12 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'dolphin', type: 'dolphin', position: { x: 0.75, y: 0.65 } }],
    intro: { speakliWalkTo: { x: 0.35, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "Wow, we're underwater! Look at all the colors!", textHe: 'וואו, אנחנו מתחת למים! תראו כמה צבעים!', emotion: 'excited' },
      { speaker: 'dolphin', text: "Welcome to the ocean! I'm Dina the Dolphin! To enter the reef, tell me — what's this?", textHe: 'ברוכים הבאים לאוקיינוס! אני דינה הדולפינה! כדי להיכנס לשונית, ספרו לי — מה זה?', emotion: 'excited' },
      { speaker: 'speakli', text: "It's a body part... I need to pick the right English word!", textHe: 'זה איבר בגוף... אני צריך לבחור את המילה הנכונה באנגלית!', emotion: 'talk' },
    ],
    exercise: {
      type: 'wordDoor',
      config: {
        targetWord: { word: 'hand', translation: 'יד' },
        distractors: ['foot', 'ear', 'eye'],
        prompt: 'Choose the right word to enter the reef!',
        promptHe: 'בחרו את המילה הנכונה כדי להיכנס לשונית!',
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
        targetWord: { word: 'apple', translation: 'תפוח' },
        hint: "A red fruit: ____",
        hintHe: 'פרי אדום: ____',
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
    background: SCENE3_BG,
    particles: { type: 'bubbles', density: 10 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'octopus', type: 'octopus', position: { x: 0.65, y: 0.65 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'octopus', text: "Hello friends! I'm Oscar the Octopus! I know everything about the body — let me quiz you!", textHe: 'שלום חברים! אני אוסקר התמנון! אני יודע הכל על הגוף — בואו אבחן אתכם!', emotion: 'excited' },
      { speaker: 'speakli', text: "Body parts in English? Let's go!", textHe: 'איברי הגוף באנגלית? יאללה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'multipleChoice',
      config: {
        questions: [
          { question: 'What do you see with?', questionHe: 'במה רואים?', answer: 'eye', options: ['eye', 'ear', 'nose', 'mouth'], image: '👁️' },
          { question: 'What do you hear with?', questionHe: 'במה שומעים?', answer: 'ear', options: ['hand', 'ear', 'foot', 'head'], image: '👂' },
          { question: 'What do you walk with?', questionHe: 'במה הולכים?', answer: 'foot', options: ['arm', 'nose', 'foot', 'eye'], image: '🦶' },
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
    background: SCENE4_BG,
    particles: { type: 'bubbles', density: 8 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'seahorse', type: 'seahorse', position: { x: 0.7, y: 0.6 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'seahorse', text: "Hello! I'm Sandy the Seahorse. Listen carefully and find the right family member!", textHe: 'שלום! אני סנדי סוסון הים. הקשיבו היטב ומצאו את בן המשפחה הנכון!', emotion: 'talk' },
      { speaker: 'speakli', text: "Family words! I'll listen and find the right one!", textHe: 'מילים של משפחה! אקשיב ואמצא את הנכונה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'listenFind',
      config: {
        words: [
          { word: 'mother', translation: 'אמא', emoji: '🤱' },
          { word: 'father', translation: 'אבא', emoji: '👨‍👦' },
          { word: 'sister', translation: 'אחות', emoji: '👧' },
          { word: 'brother', translation: 'אח', emoji: '👦' },
        ],
        rounds: 3,
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
              targetWord: { word: 'three', translation: 'שלוש' },
              distractors: ['one', 'five', 'four'],
              prompt: 'Light 1: How many claws does Carlos have? (Hint: not really!)',
              promptHe: 'אור 1: בחרו את המספר הנכון!',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'bread', translation: 'לחם' },
              distractors: ['water', 'milk', 'egg'],
              prompt: 'Light 2: Choose the right food word!',
              promptHe: 'אור 2: בחרו את מילת האוכל הנכונה!',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'baby', translation: 'תינוק' },
              distractors: ['mother', 'father', 'sister'],
              prompt: 'Light 3: The youngest family member!',
              promptHe: 'אור 3: בן המשפחה הצעיר ביותר!',
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
                  question: 'Which word means "ראש"?',
                  questionHe: 'איזו מילה היא "ראש"?',
                  answer: 'head',
                  options: ['head', 'hand', 'foot', 'arm'],
                  image: '🧠',
                },
              ],
            },
          },
          {
            type: 'spellBridge',
            config: {
              targetWord: { word: 'water', translation: 'מים' },
              hint: "Fish live in ____",
              hintHe: 'דגים חיים ב____',
            },
          },
          {
            type: 'listenFind',
            config: {
              words: [
                { word: 'one', translation: 'אחד', emoji: '1️⃣' },
                { word: 'two', translation: 'שניים', emoji: '2️⃣' },
                { word: 'three', translation: 'שלוש', emoji: '3️⃣' },
                { word: 'four', translation: 'ארבע', emoji: '4️⃣' },
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
