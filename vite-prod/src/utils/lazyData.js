/**
 * Lazy data loader — fetches JSON from public/data/ on demand with caching.
 * Replaces eager `import wordsA1 from '../data/words-a1.json'` pattern.
 */

const cache = {};

export async function loadWordData(level) {
  const key = `words-${level}`;
  if (cache[key]) return cache[key];

  const res = await fetch(`/data/words-${level}.json`);
  if (!res.ok) throw new Error(`Failed to load ${key}`);
  const data = await res.json();
  cache[key] = data;
  return data;
}

export async function loadPhrasesCommon() {
  if (cache.phrases) return cache.phrases;
  const res = await fetch('/data/phrases-common.json');
  if (!res.ok) throw new Error('Failed to load phrases');
  const data = await res.json();
  cache.phrases = data;
  return data;
}

/** Preload a set of levels in parallel (non-blocking) */
export function preloadWordData(...levels) {
  levels.forEach(level => loadWordData(level).catch(() => {}));
}
