// Exercise Generation Engine for Speakli Kids English Learning App
// Takes a unit's word/sentence data and a lesson definition, generates exercises.
//
// Unit data shape:
//   { words: [{ word, emoji, translation, translationAr, translationRu, example }], sentences: [{ en, words, he, ar, ru }] }
//
// Lesson definition shape:
//   { id, type, exerciseTypes: [...], wordIndices: [0,1,2,3] }
//
// Returns 8 exercise objects per lesson.

import { lf } from '../../utils/translations.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a new array with elements in random order (Fisher-Yates shuffle).
 */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Pick `count` random items from `pool` that are NOT equal to `exclude`,
 * using a custom comparator (defaults to strict equality).
 */
function pickDistractors(pool, exclude, count = 3, key = null) {
  const filtered = pool.filter((item) => {
    const a = key ? item[key] : item;
    const b = key ? exclude[key] : exclude;
    return a !== b;
  });
  const shuffled = shuffleArray(filtered);
  return shuffled.slice(0, count);
}

/**
 * Build an options array: place the correct answer among distractors and shuffle.
 */
function buildOptions(correct, distractors) {
  return shuffleArray([correct, ...distractors]);
}

/**
 * Pick a random letter from the English alphabet that is NOT in `excludeSet`.
 */
function randomLetterExcluding(excludeSet) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const candidates = alphabet.split('').filter((l) => !excludeSet.has(l));
  if (candidates.length === 0) return 'a';
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Get the localized translation for a word object.
 * Uses lf() to check translationAr/translationRu/translationEn then falls back to translation (Hebrew).
 */
function getWordTranslation(wordData, lang) {
  return lf(wordData, 'translation', lang);
}

/**
 * Get the localized sentence string for a sentence object.
 * Checks sentence[lang] (e.g. sentence.ar, sentence.ru) then falls back to sentence.he.
 */
function getSentenceTranslation(sentence, lang) {
  return (lang && sentence[lang]) || sentence.he || '';
}

/**
 * Build a localized wordData snapshot for attaching to exercise objects.
 */
function wordSnapshot(wordData, lang) {
  return {
    word: wordData.word,
    emoji: wordData.emoji,
    translation: getWordTranslation(wordData, lang),
  };
}

// ---------------------------------------------------------------------------
// Individual exercise generators
// ---------------------------------------------------------------------------

/**
 * emoji-pick: Show English word, pick correct emoji from 4 options.
 */
function generateEmojiPick(wordData, allWords, _sentences, _lessonWords, lang) {
  const distractors = pickDistractors(allWords, wordData, 3, 'emoji').map(
    (w) => w.emoji
  );
  return {
    type: 'emoji-pick',
    question: wordData.word,
    correctAnswer: wordData.emoji,
    options: buildOptions(wordData.emoji, distractors),
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
  };
}

/**
 * word-to-hebrew: Show emoji + English word, pick native-language translation from 4.
 */
function generateWordToHebrew(wordData, allWords, _sentences, _lessonWords, lang) {
  const translation = getWordTranslation(wordData, lang);
  const distractors = pickDistractors(allWords, wordData, 3, 'word').map(
    (w) => getWordTranslation(w, lang)
  ).filter((t) => t !== translation);
  // Deduplicate and pad if needed
  const uniqueDistractors = [...new Set(distractors)].slice(0, 3);
  return {
    type: 'word-to-hebrew',
    question: wordData.word,
    correctAnswer: translation,
    options: buildOptions(translation, uniqueDistractors),
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
  };
}

/**
 * listen-pick: Play word audio, pick correct word from 4 options.
 */
function generateListenPick(wordData, allWords, _sentences, _lessonWords, lang) {
  const distractors = pickDistractors(allWords, wordData, 3, 'word').map(
    (w) => w.word
  );
  return {
    type: 'listen-pick',
    question: wordData.word,
    correctAnswer: wordData.word,
    options: buildOptions(wordData.word, distractors),
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
    audio: wordData.word, // the word to play via TTS
  };
}

/**
 * fill-letter: Show word with one missing letter, pick the letter from 4.
 */
function generateFillLetter(wordData, _allWords, _sentences, _lessonWords, lang) {
  const word = wordData.word.toLowerCase();
  // Only pick letter characters (skip spaces, hyphens, etc.)
  const letterIndices = [...word].map((ch, i) => /[a-z]/i.test(ch) ? i : -1).filter(i => i >= 0);
  const idx = letterIndices.length > 0
    ? letterIndices[Math.floor(Math.random() * letterIndices.length)]
    : Math.floor(Math.random() * word.length);
  const missingLetter = word[idx];
  const displayed = word.substring(0, idx) + '_' + word.substring(idx + 1);

  // Build 3 wrong letters that are not the correct one
  const usedLetters = new Set([missingLetter]);
  const wrongLetters = [];
  while (wrongLetters.length < 3) {
    const letter = randomLetterExcluding(usedLetters);
    if (letter) {
      wrongLetters.push(letter);
      usedLetters.add(letter);
    }
  }

  return {
    type: 'fill-letter',
    question: displayed,
    correctAnswer: missingLetter,
    options: buildOptions(missingLetter, wrongLetters),
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
    fullWord: wordData.word,
    missingIndex: idx,
  };
}

/**
 * speak-word: Show emoji + word, user speaks it. No options needed.
 */
function generateSpeakWord(wordData, _allWords, _sentences, _lessonWords, lang) {
  return {
    type: 'speak-word',
    question: wordData.word,
    correctAnswer: wordData.word,
    options: [],
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
  };
}

/**
 * multiple-choice: Show a sentence/question, pick from 4 options.
 * Uses sentence data when available, otherwise falls back to word-level.
 */
function generateMultipleChoice(wordData, allWords, sentences, _lessonWords, lang) {
  // Prefer a sentence that contains the target word
  const relatedSentence = sentences.find((s) =>
    s.words.map((w) => w.toLowerCase()).includes(wordData.word.toLowerCase())
  );

  if (relatedSentence) {
    const correctTranslation = getSentenceTranslation(relatedSentence, lang);
    // Question: English sentence, pick localized translation
    const distractors = sentences
      .filter((s) => getSentenceTranslation(s, lang) !== correctTranslation)
      .map((s) => getSentenceTranslation(s, lang))
      .filter(Boolean);
    const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
    // If not enough sentence distractors, pad with word translations
    let _mc_safety = 0;
    while (shuffledDistractors.length < 3 && _mc_safety++ < 50) {
      const extra = allWords[Math.floor(Math.random() * allWords.length)];
      const extraTr = getWordTranslation(extra, lang);
      if (!shuffledDistractors.includes(extraTr) && extraTr !== correctTranslation) {
        shuffledDistractors.push(extraTr);
      }
    }
    return {
      type: 'multiple-choice',
      question: relatedSentence.en,
      correctAnswer: correctTranslation,
      options: buildOptions(correctTranslation, shuffledDistractors.slice(0, 3)),
      wordData: wordSnapshot(wordData, lang),
      emoji: wordData.emoji,
      sentence: relatedSentence,
    };
  }

  // Fallback: word-level multiple choice (what does this word mean?)
  const translation = getWordTranslation(wordData, lang);
  const distractors = pickDistractors(allWords, wordData, 3, 'word').map(
    (w) => getWordTranslation(w, lang)
  );
  return {
    type: 'multiple-choice',
    question: `What does "${wordData.word}" mean?`,
    correctAnswer: translation,
    options: buildOptions(translation, distractors),
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
  };
}

/**
 * fill-blank: Show sentence with blank, pick correct word from 4.
 */
function generateFillBlank(wordData, allWords, sentences, _lessonWords, lang) {
  const relatedSentence = sentences.find((s) =>
    s.words.map((w) => w.toLowerCase()).includes(wordData.word.toLowerCase())
  );

  if (relatedSentence) {
    // Replace the target word with ___
    const blanked = relatedSentence.en.replace(
      new RegExp(`\\b${wordData.word}\\b`, 'i'),
      '___'
    );
    const distractors = pickDistractors(allWords, wordData, 3, 'word').map(
      (w) => w.word
    );
    return {
      type: 'fill-blank',
      question: blanked,
      correctAnswer: wordData.word,
      options: buildOptions(wordData.word, distractors),
      wordData: wordSnapshot(wordData, lang),
      emoji: wordData.emoji,
      fullSentence: relatedSentence.en,
    };
  }

  // Fallback: create a simple prompt
  const distractors = pickDistractors(allWords, wordData, 3, 'word').map(
    (w) => w.word
  );
  return {
    type: 'fill-blank',
    question: `The ${wordData.emoji} is a ___`,
    correctAnswer: wordData.word,
    options: buildOptions(wordData.word, distractors),
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
  };
}

/**
 * word-arrange: Arrange words to form a sentence.
 */
function generateWordArrange(wordData, _allWords, sentences, _lessonWords, lang) {
  const relatedSentence = sentences.find((s) =>
    s.words.map((w) => w.toLowerCase()).includes(wordData.word.toLowerCase())
  );

  if (relatedSentence) {
    const hintTranslation = getSentenceTranslation(relatedSentence, lang);
    return {
      type: 'word-arrange',
      question: hintTranslation, // Show localized translation as hint
      correctAnswer: relatedSentence.en,
      options: shuffleArray(relatedSentence.words),
      wordData: wordSnapshot(wordData, lang),
      emoji: wordData.emoji,
      correctOrder: relatedSentence.words,
    };
  }

  // Fallback: simple two-word phrase
  const simpleWords = ['I', 'like', wordData.word];
  return {
    type: 'word-arrange',
    question: getWordTranslation(wordData, lang),
    correctAnswer: simpleWords.join(' '),
    options: shuffleArray([...simpleWords]),
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
    correctOrder: simpleWords,
  };
}

/**
 * translation: Translate sentence from English to native language (pick from 4).
 */
function generateTranslation(wordData, allWords, sentences, _lessonWords, lang) {
  const relatedSentence = sentences.find((s) =>
    s.words.map((w) => w.toLowerCase()).includes(wordData.word.toLowerCase())
  );

  if (relatedSentence) {
    const correctTranslation = getSentenceTranslation(relatedSentence, lang);
    const distractors = sentences
      .filter((s) => getSentenceTranslation(s, lang) !== correctTranslation)
      .map((s) => getSentenceTranslation(s, lang))
      .filter(Boolean);
    const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
    // Pad if not enough sentence distractors
    let _tr_safety = 0;
    while (shuffledDistractors.length < 3 && _tr_safety++ < 50) {
      const extra = allWords[Math.floor(Math.random() * allWords.length)];
      const extraTr = getWordTranslation(extra, lang);
      if (!shuffledDistractors.includes(extraTr) && extraTr !== correctTranslation) {
        shuffledDistractors.push(extraTr);
      }
    }
    return {
      type: 'translation',
      question: relatedSentence.en,
      correctAnswer: correctTranslation,
      options: buildOptions(correctTranslation, shuffledDistractors.slice(0, 3)),
      wordData: wordSnapshot(wordData, lang),
      emoji: wordData.emoji,
      sentence: relatedSentence,
    };
  }

  // Fallback: word-level translation
  const translation = getWordTranslation(wordData, lang);
  const distractors = pickDistractors(allWords, wordData, 3, 'word').map(
    (w) => getWordTranslation(w, lang)
  );
  return {
    type: 'translation',
    question: wordData.word,
    correctAnswer: translation,
    options: buildOptions(translation, distractors),
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
  };
}

/**
 * match-pairs: Match 4 English-native-language pairs from the unit.
 */
function generateMatchPairs(_wordData, allWords, _sentences, lessonWords, lang) {
  // Pick up to 4 words from the lesson, padding from allWords if needed
  let pairWords = shuffleArray(lessonWords).slice(0, 4);
  if (pairWords.length < 4) {
    const anchor = pairWords[0] || allWords[0];
    if (!anchor) return null; // No words available
    const extras = pickDistractors(allWords, anchor, 4 - pairWords.length, 'word');
    pairWords = [...pairWords, ...extras].slice(0, 4);
  }
  if (pairWords.length === 0) return null;

  const pairs = pairWords.map((w) => ({
    en: w.word,
    he: getWordTranslation(w, lang),
    emoji: w.emoji,
  }));

  return {
    type: 'match-pairs',
    question: 'Match the pairs',
    correctAnswer: pairs,
    options: {
      english: shuffleArray(pairs.map((p) => p.en)),
      hebrew: shuffleArray(pairs.map((p) => p.he)),
    },
    wordData: wordSnapshot(pairWords[0], lang),
    emoji: pairWords[0].emoji,
    pairs,
  };
}

/**
 * picture-sentence: Show emoji scene, pick correct sentence from 4.
 */
function generatePictureSentence(wordData, _allWords, sentences, _lessonWords, lang) {
  const relatedSentence = sentences.find((s) =>
    s.words.map((w) => w.toLowerCase()).includes(wordData.word.toLowerCase())
  );

  if (relatedSentence) {
    const distractors = pickDistractors(sentences, relatedSentence, 3, 'en').map(
      (s) => s.en
    );
    // Pad with generated alternatives if needed
    let _ps_safety = 0;
    while (distractors.length < 3 && _ps_safety++ < 10) {
      distractors.push(`I see a ${wordData.word}`);
    }
    return {
      type: 'picture-sentence',
      question: wordData.emoji,
      correctAnswer: relatedSentence.en,
      options: buildOptions(relatedSentence.en, distractors.slice(0, 3)),
      wordData: wordSnapshot(wordData, lang),
      emoji: wordData.emoji,
      sentence: relatedSentence,
    };
  }

  // Fallback: use word-level
  const correctSentence = `This is a ${wordData.word}`;
  const wrongSentences = [
    `This is a ball`,
    `I like cats`,
    `Hello friend`,
  ];
  return {
    type: 'picture-sentence',
    question: wordData.emoji,
    correctAnswer: correctSentence,
    options: buildOptions(correctSentence, wrongSentences),
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
  };
}

/**
 * category-sort: Sort words into 2 categories.
 * Stub for level 1 -- returns a placeholder exercise.
 */
function generateCategorySort(wordData, _allWords, _sentences, _lessonWords, lang) {
  return {
    type: 'category-sort',
    question: 'Sort the words into categories',
    correctAnswer: null,
    options: [],
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
    stub: true,
    message: 'Category sort is available from level 2 onwards.',
  };
}

/**
 * sentence-correction: Fix an error in a sentence.
 * Stub for level 1 -- returns a placeholder exercise.
 */
function generateSentenceCorrection(wordData, _allWords, _sentences, _lessonWords, lang) {
  return {
    type: 'sentence-correction',
    question: 'Find and fix the error',
    correctAnswer: null,
    options: [],
    wordData: wordSnapshot(wordData, lang),
    emoji: wordData.emoji,
    stub: true,
    message: 'Sentence correction is available from level 2 onwards.',
  };
}

// ---------------------------------------------------------------------------
// Generator dispatch map
// ---------------------------------------------------------------------------

const GENERATORS = {
  'emoji-pick': generateEmojiPick,
  'word-to-hebrew': generateWordToHebrew,
  'listen-pick': generateListenPick,
  'fill-letter': generateFillLetter,
  'speak-word': generateSpeakWord,
  'multiple-choice': generateMultipleChoice,
  'fill-blank': generateFillBlank,
  'word-arrange': generateWordArrange,
  'translation': generateTranslation,
  'match-pairs': generateMatchPairs,
  'picture-sentence': generatePictureSentence,
  'category-sort': generateCategorySort,
  'sentence-correction': generateSentenceCorrection,
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Generate exercises for a lesson.
 *
 * @param {Object} unit - The unit data ({ words, sentences }).
 * @param {Object} lesson - The lesson definition ({ id, type, exerciseTypes, wordIndices }).
 * @param {string} [lang='he'] - The UI language code ('he', 'ar', 'ru'). Controls which translation fields are used.
 * @returns {Array} An array of 8 exercise objects.
 */
export function generateExercises(unit, lesson, lang = 'he') {
  const EXERCISES_PER_LESSON = 8;

  const allWords = unit.words || [];
  const sentences = unit.sentences || [];
  const exerciseTypes = lesson.exerciseTypes || [];
  const wordIndices = lesson.wordIndices || [];

  // Resolve the lesson's words from the unit
  const lessonWords = wordIndices
    .map((i) => allWords[i])
    .filter(Boolean);

  // If no lesson words, fall back to all unit words
  const wordPool = lessonWords.length > 0 ? lessonWords : allWords;

  const exercises = [];

  for (let i = 0; i < EXERCISES_PER_LESSON; i++) {
    // Cycle through exercise types
    const exType = exerciseTypes[i % exerciseTypes.length];

    // Cycle through words so each word appears roughly equally
    const targetWord = wordPool[i % wordPool.length];

    const generator = GENERATORS[exType];

    if (!generator) {
      console.warn(`[exercise-generator] Unknown exercise type: "${exType}", skipping.`);
      continue;
    }

    const exercise = generator(targetWord, allWords, sentences, lessonWords, lang);

    if (!exercise) {
      console.warn(`[exercise-generator] Generator for "${exType}" returned null, skipping.`);
      continue;
    }

    // Attach metadata
    exercise.index = i;
    exercise.lessonId = lesson.id;

    exercises.push(exercise);
  }

  return exercises;
}

export { shuffleArray };
