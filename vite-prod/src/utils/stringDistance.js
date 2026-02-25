// Levenshtein distance for pronunciation scoring

export function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Compare words and return color-coded results
export function compareWords(target, spoken) {
  const targetWords = target.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const spokenWords = spoken.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);

  return targetWords.map((word, i) => {
    const spokenWord = spokenWords[i] || '';
    if (!spokenWord) return { word, status: 'missing', spoken: '' };

    if (word === spokenWord) return { word, status: 'correct', spoken: spokenWord };

    const dist = levenshteinDistance(word, spokenWord);
    const maxLen = Math.max(word.length, spokenWord.length);
    const similarity = 1 - dist / maxLen;

    if (similarity >= 0.7) return { word, status: 'close', spoken: spokenWord };
    return { word, status: 'wrong', spoken: spokenWord };
  });
}

// Calculate pronunciation score
export function pronunciationScore(target, spoken, confidence = 0.5) {
  const targetClean = target.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const spokenClean = spoken.toLowerCase().replace(/[^\w\s]/g, '').trim();

  if (!spokenClean) return 0;

  const dist = levenshteinDistance(targetClean, spokenClean);
  const maxLen = Math.max(targetClean.length, spokenClean.length);
  const textScore = 1 - dist / maxLen;

  // Weighted: 60% text accuracy, 40% speech recognition confidence
  return Math.round((textScore * 0.6 + confidence * 0.4) * 100);
}

// Fuzzy match for translation exercises
export function fuzzyMatch(target, input, threshold = 0.8) {
  const a = target.toLowerCase().trim();
  const b = input.toLowerCase().trim();
  if (a === b) return true;

  const dist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return (1 - dist / maxLen) >= threshold;
}
