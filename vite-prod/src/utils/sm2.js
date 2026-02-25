// SM-2 Spaced Repetition Algorithm
// Quality scale: 0-5
// 0 = Again (complete failure), 2 = Hard, 4 = Good, 5 = Easy

export function calculateSM2(quality, repetitions, easeFactor, interval) {
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response - reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    interval: newInterval,
    nextReviewDate: nextReviewDate.toISOString().split('T')[0],
  };
}

export function getInitialSM2() {
  return {
    repetitions: 0,
    easeFactor: 2.5,
    interval: 0,
    nextReviewDate: new Date().toISOString().split('T')[0],
  };
}

// Map button labels to quality values
export const QUALITY_MAP = {
  again: 0,
  hard: 2,
  good: 4,
  easy: 5,
};
