// Free tier daily limits per feature
export const FREE_LIMITS = {
  speakingCoach: 2,
  lifeCoach: 2,
  simulation: 2,
  pronunciation: 5,
  generateLesson: 1,
  generateStory: 1,
  adventure: 2,       // max worlds (not sessions)
  englishQuest: 1,
  talkingWorld: 3,
};

// Map API action names → feature keys
export const ACTION_TO_FEATURE = {
  'speaking-coach': 'speakingCoach',
  'life-coach': 'lifeCoach',
  'simulation': 'simulation',
  'pronunciation-feedback': 'pronunciation',
  'generate-lesson': 'generateLesson',
  'generate-story': 'generateStory',
  'talking-world': 'talkingWorld',
};

// Subscription plans
export const PLANS = {
  child: {
    id: 'child',
    priceMonthly: 19.90,
    priceAnnualPerMonth: 18.25,   // 11 months ÷ 12 = ~18.25
    priceAnnualTotal: 218.90,     // 19.90 × 11 (pay 11 get 12)
    freeMonths: 1,
    currency: 'ILS',
    includesFamily: false,
    maxChildren: 1,
  },
  adult: {
    id: 'adult',
    priceMonthly: 19.90,
    priceAnnualPerMonth: 18.25,
    priceAnnualTotal: 218.90,
    freeMonths: 1,
    currency: 'ILS',
    includesFamily: false,
    maxChildren: 0,
  },
  family: {
    id: 'family',
    priceMonthly: 34.90,
    priceAnnualPerMonth: 31.99,   // 11 months ÷ 12 = ~31.99
    priceAnnualTotal: 383.90,     // 34.90 × 11
    freeMonths: 1,
    currency: 'ILS',
    includesFamily: true,
    maxChildren: Infinity,
  },
};

// How many items are free per feature (content gating)
export const CONTENT_LIMITS = {
  alphabet: 5,           // letters A-E free
  vocabulary: 10,        // first 10 words (from level 1)
  games: 2,              // first 2 games free
  lessons: 3,            // first 3 lessons per unit
  reading: 1,            // 1 story
  teacherTopics: 3,      // first 3 topics (Colors, Animals, Numbers)
  talkingWorldNpcs: 2,   // 2 NPCs per world
  talkingWorldWorlds: 1, // 1 world free
  questScenes: 1,        // 1 scene (Forest)
  adventureWorlds: 1,    // 1 world (Forest)
  skills: 0,             // fully locked
  audioLearning: 10,     // first 10 words free
};

// Features list for PricingPage display
export const FEATURES = {
  free: [
    'limitedLessons',
    'limitedVocabulary',
    'limitedAlphabet',
    'limitedReading',
    'limitedGames',
    'limitedTeacher',
    'limitedPronunciation',
    'limitedCoaching',
    'limitedAIGeneration',
    'limitedAdventure',
    'limitedQuest',
  ],
  premium: [
    'unlimitedLessons',
    'unlimitedVocabulary',
    'unlimitedAlphabet',
    'unlimitedReading',
    'unlimitedKidsGames',
    'unlimitedPronunciation',
    'unlimitedCoaching',
    'unlimitedAIGeneration',
    'allAdventureWorlds',
    'unlimitedQuest',
    'unlimitedTeacher',
    'skillsAccess',
    'audioLearningAccess',
    'weeklyParentReport',
    'prioritySupport',
    'noAds',
  ],
};
