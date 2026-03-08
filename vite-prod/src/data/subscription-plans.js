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
  personal: {
    id: 'personal',
    priceMonthly: 19.90,
    priceAnnualPerMonth: 14.90,
    priceAnnualTotal: 178.80,
    currency: 'ILS',
    includesFamily: false,
  },
  family: {
    id: 'family',
    priceMonthly: 29.90,
    priceAnnualPerMonth: 22.90,
    priceAnnualTotal: 274.80,
    currency: 'ILS',
    includesFamily: true,
  },
};

// Features list for PricingPage display
export const FEATURES = {
  free: [
    'unlimitedLessons',
    'unlimitedVocabulary',
    'unlimitedAlphabet',
    'unlimitedReading',
    'unlimitedKidsGames',
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
    'skillsAccess',
    'audioLearningAccess',
    'prioritySupport',
    'noAds',
  ],
};
