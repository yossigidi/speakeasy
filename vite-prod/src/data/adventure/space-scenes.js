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
    introVideo: '/videos/adventure/space-scene1.mp4',
    background: SCENE1_BG,
    particles: { type: 'stars', density: 12 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'star', type: 'star', position: { x: 0.75, y: 0.6 } }],
    intro: { speakliWalkTo: { x: 0.35, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "We made it to space! Look at all the stars!", textHe: 'הגענו לחלל! תראו כמה כוכבים!', emotion: 'excited' },
      { speaker: 'star', text: "Welcome, astronaut! I'm Stella the Star! What's the weather like on Earth?", textHe: 'ברוכים הבאים, אסטרונאוט! אני סטלה הכוכב! מה מזג האוויר על כדור הארץ?', emotion: 'excited' },
      { speaker: 'speakli', text: "Weather words in English... Let's go!", textHe: 'מילים של מזג אוויר באנגלית... יאללה!', emotion: 'talk' },
    ],
    exercise: {
      type: 'wordDoor',
      config: {
        targetWord: { word: 'sun', translation: 'שמש' },
        distractors: ['rain', 'snow', 'cloud'],
        prompt: 'What shines bright in the sky?',
        promptHe: 'מה זורח בשמיים?',
      },
    },
    reward: { xp: 10, coins: 5, speakliAnimation: 'celebrate' },
  },

  // Scene 2: The Asteroid Belt
  {
    id: 'space-2-asteroids',
    titleEn: 'The Asteroid Belt',
    titleHe: 'חגורת האסטרואידים',
    introVideo: '/videos/adventure/space-scene2.mp4',
    background: SCENE2_BG,
    particles: { type: 'stars', density: 15 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'comet', type: 'comet', position: { x: 0.7, y: 0.6 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "So many asteroids! We need to fly through!", textHe: 'כל כך הרבה אסטרואידים! צריך לעבור ביניהם!', emotion: 'excited' },
      { speaker: 'comet', text: "Hi! I'm Cosmo the Comet! Spell the word to clear the path!", textHe: 'היי! אני קוסמו השביט! אייתו את המילה כדי לפנות את הדרך!', emotion: 'talk' },
      { speaker: 'speakli', text: "I need to put the letters in the right order!", textHe: 'אני צריך לסדר את האותיות בסדר הנכון!', emotion: 'talk' },
    ],
    exercise: {
      type: 'spellBridge',
      config: {
        targetWord: { word: 'shirt', translation: 'חולצה' },
        hint: "You wear a ____ on your body",
        hintHe: 'לובשים ____ על הגוף',
      },
    },
    reward: { xp: 15, coins: 5, speakliAnimation: 'celebrate' },
  },

  // Scene 3: The Space Station
  {
    id: 'space-3-station',
    titleEn: 'The Space Station',
    titleHe: 'תחנת החלל',
    introVideo: '/videos/adventure/space-scene3.mp4',
    background: SCENE3_BG,
    particles: { type: 'stars', density: 8 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'alien', type: 'alien', position: { x: 0.65, y: 0.65 } }],
    intro: { speakliWalkTo: { x: 0.3, y: 0.75 } },
    dialogue: [
      { speaker: 'alien', text: "Greetings, Earthling! I'm Luna! I want to learn about your weather!", textHe: 'שלום, ארצישראלי! אני לונה! אני רוצה ללמוד על מזג האוויר שלכם!', emotion: 'excited' },
      { speaker: 'speakli', text: "Let's teach Luna about weather in English!", textHe: 'בואו נלמד את לונה על מזג אוויר באנגלית!', emotion: 'talk' },
    ],
    exercise: {
      type: 'multipleChoice',
      config: {
        questions: [
          { question: 'What falls from the clouds?', questionHe: 'מה נופל מהעננים?', answer: 'rain', options: ['rain', 'sun', 'wind', 'hot'], image: '🌧️' },
          { question: 'What is white and fluffy in the sky?', questionHe: 'מה לבן ורך בשמיים?', answer: 'cloud', options: ['snow', 'cloud', 'rain', 'cold'], image: '☁️' },
          { question: 'What is cold and white in winter?', questionHe: 'מה קר ולבן בחורף?', answer: 'snow', options: ['rain', 'wind', 'snow', 'sun'], image: '❄️' },
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
    introVideo: '/videos/adventure/space-scene4.mp4',
    background: SCENE4_BG,
    particles: { type: 'sparkle', density: 6 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'robot', type: 'robot', position: { x: 0.7, y: 0.7 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'robot', text: "Beep boop! I'm Buzz the Robot! Listen and find the right clothing!", textHe: 'ביפ בופ! אני באז הרובוט! הקשיבו ומצאו את הבגד הנכון!', emotion: 'talk' },
      { speaker: 'speakli', text: "Clothes in English! I'll listen carefully!", textHe: 'בגדים באנגלית! אקשיב בתשומת לב!', emotion: 'talk' },
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
    introVideo: '/videos/adventure/space-scene5.mp4',
    background: SCENE5_BG,
    particles: { type: 'stars', density: 20 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'spacecat', type: 'spacecat', position: { x: 0.7, y: 0.68 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'speakli', text: "It's so colorful here! Like a painting!", textHe: 'כל כך צבעוני פה! כמו ציור!', emotion: 'excited' },
      { speaker: 'spacecat', text: "Meow! I'm Nova the Space Cat! Answer 3 questions to cross the nebula!", textHe: 'מיאו! אני נובה חתולת החלל! ענו על 3 שאלות כדי לחצות את הערפילית!', emotion: 'excited' },
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
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'shoes', translation: 'נעליים' },
              distractors: ['hat', 'shirt', 'dress'],
              prompt: 'Star 2: What do you wear on your feet?',
              promptHe: 'כוכב 2: מה לובשים על הרגליים?',
            },
          },
          {
            type: 'wordDoor',
            config: {
              targetWord: { word: 'bed', translation: 'מיטה' },
              distractors: ['chair', 'table', 'door'],
              prompt: 'Star 3: Where do you sleep?',
              promptHe: 'כוכב 3: איפה ישנים?',
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
    introVideo: '/videos/adventure/space-scene6.mp4',
    background: SCENE6_BG,
    particles: { type: 'sparkle', density: 18 },
    speakliPosition: { x: 0.1, y: 0.75 },
    npcs: [{ id: 'phoenix', type: 'phoenix', position: { x: 0.7, y: 0.55 } }],
    intro: { speakliWalkTo: { x: 0.25, y: 0.75 } },
    dialogue: [
      { speaker: 'phoenix', text: "I'm Galaxy the Space Phoenix! Pass my 3 challenges to become a Space Hero!", textHe: 'אני גלקסי עוף החול של החלל! עברו 3 אתגרים שלי כדי להפוך לגיבורי החלל!', emotion: 'excited' },
      { speaker: 'speakli', text: "We've come so far! We can do this!", textHe: 'עשינו דרך ארוכה! אנחנו יכולים!', emotion: 'talk' },
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
