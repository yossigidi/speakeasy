// Skills Data — מיומנויות שיחה לבוגרים
// Each skill teaches a real-world conversation scenario through a multi-lesson flow.
// Data shape mirrors curriculum units so generateExercises() works directly.

export const SKILL_LEVELS = [
  { id: 'foundation', emoji: '🌱', nameEn: 'Foundation', nameHe: 'בסיס', color: '#10B981' },
  { id: 'confidence', emoji: '💪', nameEn: 'Confidence', nameHe: 'ביטחון', color: '#3B82F6' },
  { id: 'advanced', emoji: '🎯', nameEn: 'Advanced', nameHe: 'מתקדם', color: '#8B5CF6' },
];

export const SKILLS = [
  // ═══════════════════════════════════════════════════════
  // SK1 — Introduce Yourself (Foundation 🌱)
  // ═══════════════════════════════════════════════════════
  {
    id: 'SK1',
    level: 'foundation',
    emoji: '👋',
    titleEn: 'Introduce Yourself',
    titleHe: 'הצג את עצמך',
    descEn: 'Learn to introduce yourself confidently in English',
    descHe: 'למדו להציג את עצמכם בביטחון באנגלית',
    words: [
      { word: 'name', emoji: '📛', translation: 'שם', example: "My name is David." },
      { word: 'from', emoji: '📍', translation: 'מ-', example: "I'm from Israel." },
      { word: 'live', emoji: '🏠', translation: 'גר', example: "I live in Tel Aviv." },
      { word: 'work', emoji: '💼', translation: 'עובד', example: "I work in tech." },
      { word: 'hobby', emoji: '🎨', translation: 'תחביב', example: "My hobby is cooking." },
      { word: 'nice', emoji: '😊', translation: 'נעים', example: "Nice to meet you!" },
      { word: 'meet', emoji: '🤝', translation: 'לפגוש', example: "Nice to meet you too." },
      { word: 'family', emoji: '👨‍👩‍👧', translation: 'משפחה', example: "I have a big family." },
      { word: 'speak', emoji: '🗣️', translation: 'מדבר', example: "I speak Hebrew and English." },
      { word: 'learn', emoji: '📚', translation: 'לומד', example: "I'm learning English." },
    ],
    phrases: [
      { en: "Hi, I'm...", he: '...היי, אני' },
      { en: "Nice to meet you!", he: 'נעים להכיר!' },
      { en: "I'm from...", he: '...אני מ' },
      { en: "I work as a...", he: '...אני עובד כ' },
      { en: "In my free time, I like to...", he: '...בזמן הפנוי שלי, אני אוהב' },
    ],
    dialogue: {
      speakers: [
        { id: 'alex', name: 'Alex', emoji: '👨‍💻' },
        { id: 'you', name: 'You', emoji: '🙋' },
      ],
      lines: [
        { speaker: 'alex', text: "Hi there! I'm Alex. What's your name?", keyPhrases: ["What's your name"] },
        { speaker: 'you', text: "Hi Alex! My name is David. Nice to meet you!", keyPhrases: ["Nice to meet you"] },
        { speaker: 'alex', text: "Nice to meet you too, David! Where are you from?", keyPhrases: ["Where are you from"] },
        { speaker: 'you', text: "I'm from Israel. I live in Tel Aviv.", keyPhrases: ["I'm from", "I live in"] },
        { speaker: 'alex', text: "Cool! What do you do for work?", keyPhrases: ["What do you do"] },
        { speaker: 'you', text: "I work in tech. I'm a software developer.", keyPhrases: ["I work in"] },
        { speaker: 'alex', text: "That's great! What do you like to do in your free time?", keyPhrases: ["in your free time"] },
        { speaker: 'you', text: "I like to cook and play guitar. How about you?", keyPhrases: ["I like to", "How about you"] },
      ],
    },
    sentences: [
      { en: 'My name is David', words: ['My', 'name', 'is', 'David'], he: 'שמי דויד' },
      { en: 'I am from Israel', words: ['I', 'am', 'from', 'Israel'], he: 'אני מישראל' },
      { en: 'I live in Tel Aviv', words: ['I', 'live', 'in', 'Tel Aviv'], he: 'אני גר בתל אביב' },
      { en: 'I work in tech', words: ['I', 'work', 'in', 'tech'], he: 'אני עובד בהייטק' },
      { en: 'Nice to meet you', words: ['Nice', 'to', 'meet', 'you'], he: 'נעים להכיר' },
      { en: 'I like to cook', words: ['I', 'like', 'to', 'cook'], he: 'אני אוהב לבשל' },
      { en: 'I speak English', words: ['I', 'speak', 'English'], he: 'אני מדבר אנגלית' },
      { en: 'I am learning English', words: ['I', 'am', 'learning', 'English'], he: 'אני לומד אנגלית' },
    ],
    simulation: {
      npcName: 'Alex',
      npcRole: 'New colleague',
      context: "You just started a new job and you're meeting your colleague Alex for the first time at the office kitchen. Introduce yourself naturally.",
      steps: [
        { hint: 'Say hello and introduce yourself (name, where you are from)' },
        { hint: 'Tell Alex what you do at the company' },
        { hint: 'Ask Alex about himself and share a hobby' },
      ],
    },
    lessons: [
      {
        id: 'SK1-vocab',
        type: 'vocabulary',
        titleHe: 'מילים להיכרות',
        titleEn: 'Introduction Words',
        exerciseTypes: ['emoji-pick', 'word-to-hebrew', 'listen-pick', 'fill-letter', 'emoji-pick', 'word-to-hebrew', 'listen-pick', 'translation'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      {
        id: 'SK1-phrases',
        type: 'reading',
        titleHe: 'ביטויים ודיאלוג',
        titleEn: 'Phrases & Dialogue',
        hasDialogue: true,
        exerciseTypes: ['multiple-choice', 'word-arrange', 'fill-blank', 'translation', 'multiple-choice', 'word-arrange', 'fill-blank', 'translation'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      {
        id: 'SK1-practice',
        type: 'mixed',
        titleHe: 'תרגול',
        titleEn: 'Practice',
        exerciseTypes: ['emoji-pick', 'fill-blank', 'word-arrange', 'match-pairs', 'listen-pick', 'translation', 'multiple-choice', 'word-to-hebrew'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      {
        id: 'SK1-speaking',
        type: 'speaking',
        titleHe: 'דיבור עם AI',
        titleEn: 'Speak with AI',
        hasSimulation: true,
        exerciseTypes: [],
        wordIndices: [],
      },
      {
        id: 'SK1-test',
        type: 'test',
        titleHe: 'מבחן מיומנות',
        titleEn: 'Skill Test',
        exerciseTypes: ['word-to-hebrew', 'fill-blank', 'word-arrange', 'translation', 'listen-pick', 'multiple-choice', 'match-pairs', 'emoji-pick'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // SK2 — Small Talk: Weekends (Confidence 💪)
  // ═══════════════════════════════════════════════════════
  {
    id: 'SK2',
    level: 'confidence',
    emoji: '☕',
    titleEn: 'Small Talk — Weekends',
    titleHe: 'שיחת חולין — סופי שבוע',
    descEn: 'Make small talk about weekends and free time',
    descHe: 'נהלו שיחת חולין על סופי שבוע וזמן פנוי',
    words: [
      { word: 'weekend', emoji: '🗓️', translation: 'סוף שבוע', example: "How was your weekend?" },
      { word: 'trip', emoji: '✈️', translation: 'טיול', example: "I went on a short trip." },
      { word: 'relax', emoji: '😌', translation: 'להירגע', example: "I just relaxed at home." },
      { word: 'movie', emoji: '🎬', translation: 'סרט', example: "We watched a movie." },
      { word: 'restaurant', emoji: '🍽️', translation: 'מסעדה', example: "We tried a new restaurant." },
      { word: 'friend', emoji: '👯', translation: 'חבר', example: "I met up with friends." },
      { word: 'plan', emoji: '📋', translation: 'תוכנית', example: "Do you have any plans?" },
      { word: 'enjoy', emoji: '😄', translation: 'ליהנות', example: "I really enjoyed it." },
      { word: 'busy', emoji: '⏰', translation: 'עסוק', example: "It was a busy weekend." },
      { word: 'amazing', emoji: '🤩', translation: 'מדהים', example: "It was amazing!" },
    ],
    phrases: [
      { en: "How was your weekend?", he: 'איך היה סוף השבוע שלך?' },
      { en: "It was great, thanks!", he: '!היה מעולה, תודה' },
      { en: "Did you do anything fun?", he: 'עשית משהו כיף?' },
      { en: "We went to...", he: '...הלכנו ל' },
      { en: "Sounds like fun!", he: '!נשמע כיף' },
      { en: "Any plans for this weekend?", he: 'יש תוכניות לסוף השבוע?' },
    ],
    dialogue: {
      speakers: [
        { id: 'sarah', name: 'Sarah', emoji: '👩‍🦰' },
        { id: 'you', name: 'You', emoji: '🙋' },
      ],
      lines: [
        { speaker: 'sarah', text: "Hey! How was your weekend?", keyPhrases: ["How was your weekend"] },
        { speaker: 'you', text: "It was great, thanks! I went on a trip to the north.", keyPhrases: ["It was great", "went on a trip"] },
        { speaker: 'sarah', text: "Oh nice! What did you do there?", keyPhrases: ["What did you do"] },
        { speaker: 'you', text: "We hiked and tried a new restaurant. The food was amazing!", keyPhrases: ["tried a new restaurant", "was amazing"] },
        { speaker: 'sarah', text: "Sounds like fun! I just relaxed at home and watched a movie.", keyPhrases: ["Sounds like fun", "relaxed at home"] },
        { speaker: 'you', text: "That sounds nice too. Any plans for this weekend?", keyPhrases: ["Any plans for this weekend"] },
        { speaker: 'sarah', text: "I'm meeting up with friends. How about you?", keyPhrases: ["meeting up with friends"] },
        { speaker: 'you', text: "I'm not sure yet, maybe I'll go to the beach.", keyPhrases: ["I'm not sure yet"] },
      ],
    },
    sentences: [
      { en: 'How was your weekend', words: ['How', 'was', 'your', 'weekend'], he: 'איך היה סוף השבוע שלך' },
      { en: 'I went on a trip', words: ['I', 'went', 'on', 'a', 'trip'], he: 'יצאתי לטיול' },
      { en: 'We tried a new restaurant', words: ['We', 'tried', 'a', 'new', 'restaurant'], he: 'ניסינו מסעדה חדשה' },
      { en: 'I relaxed at home', words: ['I', 'relaxed', 'at', 'home'], he: 'נרגעתי בבית' },
      { en: 'It was amazing', words: ['It', 'was', 'amazing'], he: 'זה היה מדהים' },
      { en: 'I watched a movie', words: ['I', 'watched', 'a', 'movie'], he: 'צפיתי בסרט' },
      { en: 'I met up with friends', words: ['I', 'met', 'up', 'with', 'friends'], he: 'נפגשתי עם חברים' },
      { en: 'Do you have any plans', words: ['Do', 'you', 'have', 'any', 'plans'], he: 'יש לך תוכניות' },
    ],
    simulation: {
      npcName: 'Sarah',
      npcRole: 'Co-worker',
      context: "It's Monday morning at the office. Sarah, your co-worker, asks about your weekend. Have a friendly small talk conversation.",
      steps: [
        { hint: 'Respond about your weekend — what you did' },
        { hint: 'Ask Sarah about her weekend and react to her answer' },
        { hint: 'Talk about plans for the coming weekend' },
      ],
    },
    lessons: [
      {
        id: 'SK2-vocab',
        type: 'vocabulary',
        titleHe: 'מילים לשיחת חולין',
        titleEn: 'Small Talk Words',
        exerciseTypes: ['emoji-pick', 'word-to-hebrew', 'listen-pick', 'fill-letter', 'emoji-pick', 'word-to-hebrew', 'listen-pick', 'translation'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      {
        id: 'SK2-phrases',
        type: 'reading',
        titleHe: 'ביטויים ודיאלוג',
        titleEn: 'Phrases & Dialogue',
        hasDialogue: true,
        exerciseTypes: ['multiple-choice', 'word-arrange', 'fill-blank', 'translation', 'multiple-choice', 'word-arrange', 'fill-blank', 'translation'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      {
        id: 'SK2-practice',
        type: 'mixed',
        titleHe: 'תרגול',
        titleEn: 'Practice',
        exerciseTypes: ['emoji-pick', 'fill-blank', 'word-arrange', 'match-pairs', 'listen-pick', 'translation', 'multiple-choice', 'word-to-hebrew'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      {
        id: 'SK2-speaking',
        type: 'speaking',
        titleHe: 'דיבור עם AI',
        titleEn: 'Speak with AI',
        hasSimulation: true,
        exerciseTypes: [],
        wordIndices: [],
      },
      {
        id: 'SK2-test',
        type: 'test',
        titleHe: 'מבחן מיומנות',
        titleEn: 'Skill Test',
        exerciseTypes: ['word-to-hebrew', 'fill-blank', 'word-arrange', 'translation', 'listen-pick', 'multiple-choice', 'match-pairs', 'emoji-pick'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // SK3 — Handling Complaints (Advanced 🎯)
  // ═══════════════════════════════════════════════════════
  {
    id: 'SK3',
    level: 'advanced',
    emoji: '🛎️',
    titleEn: 'Handling Complaints',
    titleHe: 'טיפול בתלונות',
    descEn: 'Learn to handle complaints politely and professionally',
    descHe: 'למדו לטפל בתלונות בנימוס ובמקצועיות',
    words: [
      { word: 'problem', emoji: '⚠️', translation: 'בעיה', example: "There seems to be a problem." },
      { word: 'sorry', emoji: '😔', translation: 'מצטער', example: "I'm sorry about that." },
      { word: 'fix', emoji: '🔧', translation: 'לתקן', example: "Let me fix that for you." },
      { word: 'understand', emoji: '🧠', translation: 'להבין', example: "I understand your frustration." },
      { word: 'solution', emoji: '💡', translation: 'פתרון', example: "Here's a solution." },
      { word: 'charge', emoji: '💳', translation: 'חיוב', example: "There was a wrong charge." },
      { word: 'refund', emoji: '💰', translation: 'החזר', example: "I can offer you a refund." },
      { word: 'manager', emoji: '👔', translation: 'מנהל', example: "Can I speak to a manager?" },
      { word: 'complaint', emoji: '📝', translation: 'תלונה', example: "I'd like to file a complaint." },
      { word: 'apologize', emoji: '🙏', translation: 'להתנצל', example: "I apologize for the inconvenience." },
    ],
    phrases: [
      { en: "I'm sorry to hear that.", he: 'מצטער לשמוע את זה.' },
      { en: "I understand your frustration.", he: 'אני מבין את התסכול שלך.' },
      { en: "Let me look into that for you.", he: 'תן לי לבדוק את זה עבורך.' },
      { en: "I'd like to make this right.", he: 'אני רוצה לתקן את זה.' },
      { en: "Is there anything else I can help with?", he: 'יש עוד משהו שאוכל לעזור?' },
    ],
    dialogue: {
      speakers: [
        { id: 'customer', name: 'Customer', emoji: '😤' },
        { id: 'you', name: 'You', emoji: '🙋' },
      ],
      lines: [
        { speaker: 'customer', text: "Excuse me, there's a problem with my order. I ordered a salad but got soup.", keyPhrases: ["there's a problem"] },
        { speaker: 'you', text: "I'm sorry about that! Let me fix it right away.", keyPhrases: ["I'm sorry about that", "Let me fix it"] },
        { speaker: 'customer', text: "Also, I was charged twice for my drink.", keyPhrases: ["charged twice"] },
        { speaker: 'you', text: "I understand your frustration. Let me check the bill.", keyPhrases: ["I understand your frustration"] },
        { speaker: 'customer', text: "This is really unacceptable.", keyPhrases: ["unacceptable"] },
        { speaker: 'you', text: "You're absolutely right, and I apologize. I'll fix the order and remove the extra charge.", keyPhrases: ["I apologize", "remove the extra charge"] },
        { speaker: 'customer', text: "Thank you. Can I also get a discount for the trouble?", keyPhrases: ["a discount"] },
        { speaker: 'you', text: "Of course! I'll give you 20% off. Is there anything else I can help with?", keyPhrases: ["anything else I can help with"] },
      ],
    },
    sentences: [
      { en: 'I am sorry about that', words: ['I', 'am', 'sorry', 'about', 'that'], he: 'אני מצטער על זה' },
      { en: 'Let me fix it for you', words: ['Let', 'me', 'fix', 'it', 'for', 'you'], he: 'תן לי לתקן את זה' },
      { en: 'I understand the problem', words: ['I', 'understand', 'the', 'problem'], he: 'אני מבין את הבעיה' },
      { en: 'I can offer a refund', words: ['I', 'can', 'offer', 'a', 'refund'], he: 'אני יכול להציע החזר' },
      { en: 'There was a wrong charge', words: ['There', 'was', 'a', 'wrong', 'charge'], he: 'היה חיוב שגוי' },
      { en: 'I apologize for the problem', words: ['I', 'apologize', 'for', 'the', 'problem'], he: 'אני מתנצל על הבעיה' },
      { en: 'Here is a solution', words: ['Here', 'is', 'a', 'solution'], he: 'הנה פתרון' },
      { en: 'Can I speak to a manager', words: ['Can', 'I', 'speak', 'to', 'a', 'manager'], he: 'אפשר לדבר עם מנהל' },
    ],
    simulation: {
      npcName: 'Customer',
      npcRole: 'Unhappy customer',
      context: "You work as a customer service representative. A customer calls with a complaint about a wrong delivery. Handle the situation politely and find a solution.",
      steps: [
        { hint: 'Listen and acknowledge the problem, apologize' },
        { hint: 'Ask for details and offer a solution' },
        { hint: 'Confirm the resolution and ask if there is anything else' },
      ],
    },
    lessons: [
      {
        id: 'SK3-vocab',
        type: 'vocabulary',
        titleHe: 'מילים לטיפול בתלונות',
        titleEn: 'Complaint Handling Words',
        exerciseTypes: ['emoji-pick', 'word-to-hebrew', 'listen-pick', 'fill-letter', 'emoji-pick', 'word-to-hebrew', 'listen-pick', 'translation'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      {
        id: 'SK3-phrases',
        type: 'reading',
        titleHe: 'ביטויים ודיאלוג',
        titleEn: 'Phrases & Dialogue',
        hasDialogue: true,
        exerciseTypes: ['multiple-choice', 'word-arrange', 'fill-blank', 'translation', 'multiple-choice', 'word-arrange', 'fill-blank', 'translation'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      {
        id: 'SK3-practice',
        type: 'mixed',
        titleHe: 'תרגול',
        titleEn: 'Practice',
        exerciseTypes: ['emoji-pick', 'fill-blank', 'word-arrange', 'match-pairs', 'listen-pick', 'translation', 'multiple-choice', 'word-to-hebrew'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      {
        id: 'SK3-speaking',
        type: 'speaking',
        titleHe: 'דיבור עם AI',
        titleEn: 'Speak with AI',
        hasSimulation: true,
        exerciseTypes: [],
        wordIndices: [],
      },
      {
        id: 'SK3-test',
        type: 'test',
        titleHe: 'מבחן מיומנות',
        titleEn: 'Skill Test',
        exerciseTypes: ['word-to-hebrew', 'fill-blank', 'word-arrange', 'translation', 'listen-pick', 'multiple-choice', 'match-pairs', 'emoji-pick'],
        wordIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
    ],
  },
];

// Helper functions
export function getSkill(skillId) {
  return SKILLS.find(s => s.id === skillId) || null;
}

export function getSkillLesson(lessonId) {
  for (const skill of SKILLS) {
    const lesson = skill.lessons.find(l => l.id === lessonId);
    if (lesson) return { lesson, skill };
  }
  return null;
}
