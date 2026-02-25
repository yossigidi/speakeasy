/**
 * Hebrew Audio System
 * Plays pre-recorded Hebrew MP3 files instead of robotic Web Speech API.
 * Files are in /sounds/he/*.mp3
 */

// Map of translation words to their audio file names
const WORD_MAP = {
  'תפוח': 'w_apple', 'בננה': 'w_banana', 'תפוז': 'w_orange', 'ענבים': 'w_grape',
  'חתול': 'w_cat', 'כלב': 'w_dog', 'דג': 'w_fish', 'ציפור': 'w_bird',
  'אדום': 'w_red', 'כחול': 'w_blue', 'ירוק': 'w_green', 'צהוב': 'w_yellow',
  'שמש': 'w_sun', 'ירח': 'w_moon', 'כוכב': 'w_star', 'לב': 'w_heart',
  'כדור': 'w_ball', 'עוגה': 'w_cake', 'כובע': 'w_hat', 'כוס': 'w_cup',
  'מיטה': 'w_bed', 'אוטובוס': 'w_bus', 'עץ': 'w_tree', 'ספר': 'w_book',
  'צפרדע': 'w_frog', 'ברווז': 'w_duck', 'גשם': 'w_rain', 'חלב': 'w_milk',
  'יד': 'w_hand',
};

// Map of common phrases to their audio file names
const PHRASE_MAP = {
  'היי!': 'hey',
  'יופי!': 'great',
  'נכון!': 'correct',
  'מצוין!': 'excellent',
  'בהצלחה!': 'good_luck',
  'כל הכבוד!': 'well_done',
  'מדהים!': 'amazing',
  'נסו שוב': 'try_again',
  'בואו נשחק!': 'lets_play',
  // Bubble pop
  'מצאו את הבועה': 'bubble_intro_1',
  'עם האות הנכונה': 'bubble_intro_2',
  'ולחצו עליה': 'bubble_intro_3',
  'איפה האות': 'bubble_find',
  // Memory match
  'משחק זיכרון': 'memory_title',
  'לחצו על קלף': 'memory_intro_1',
  'ומצאו את הזוג שלו': 'memory_intro_2',
  // Word builder
  'בונים מילה': 'builder_title',
  'הקשיבו למילה': 'builder_intro_1',
  'ולחצו על האותיות': 'builder_intro_2',
  'בסדר הנכון': 'builder_intro_3',
};

// Audio cache - reuse Audio objects
const audioCache = {};

// API TTS cache - stores decoded AudioBuffers by text
const apiAudioCache = new Map();
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/**
 * Preload Hebrew audio for a list of texts.
 * Fetches all from API in parallel and caches AudioBuffers.
 * Call this on game mount so playback is instant.
 */
export async function preloadHebrewAudio(texts) {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();

  const toLoad = texts.filter(t => t && !apiAudioCache.has(t.trim()));
  if (toLoad.length === 0) return;

  await Promise.allSettled(toLoad.map(async (text) => {
    const trimmed = text.trim();
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!res.ok) return;
      const { audio } = await res.json();
      if (!audio) return;
      const raw = atob(audio);
      const buf = new ArrayBuffer(raw.length);
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const audioBuffer = await ctx.decodeAudioData(buf);
      apiAudioCache.set(trimmed, audioBuffer);
    } catch (e) { /* skip failed */ }
  }));
}

/**
 * Play Hebrew text via Google Cloud TTS API.
 * Returns Promise<boolean> - true if played successfully.
 */
export async function playHebrewFromAPI(text) {
  try {
    const trimmed = text.trim();
    if (!trimmed) return false;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    // Check cache first
    if (apiAudioCache.has(trimmed)) {
      const cached = apiAudioCache.get(trimmed);
      const source = ctx.createBufferSource();
      source.buffer = cached;
      source.connect(ctx.destination);
      return new Promise(resolve => {
        source.onended = () => resolve(true);
        source.start(0);
      });
    }

    // Fetch from API
    console.log('TTS API: fetching', trimmed);
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed }),
    });

    if (!res.ok) {
      console.warn('TTS API: HTTP', res.status);
      return false;
    }

    const { audio, mimeType } = await res.json();
    if (!audio) {
      console.warn('TTS API: no audio in response');
      return false;
    }
    console.log('TTS API: got audio', audio.length, 'chars, type:', mimeType);

    // Decode base64 MP3 → ArrayBuffer → AudioBuffer
    const raw = atob(audio);
    const buf = new ArrayBuffer(raw.length);
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    const audioBuffer = await ctx.decodeAudioData(buf);

    // Cache for reuse
    apiAudioCache.set(trimmed, audioBuffer);

    // Play
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    return new Promise(resolve => {
      source.onended = () => resolve(true);
      source.start(0);
    });
  } catch (e) {
    console.warn('Hebrew TTS API failed:', e.message);
    return false;
  }
}

function getAudio(filename) {
  if (!audioCache[filename]) {
    audioCache[filename] = new Audio(`/sounds/he/${filename}.mp3`);
  }
  return audioCache[filename];
}

/**
 * Find audio file for a Hebrew text (exact match or word match)
 */
function findAudioFile(text) {
  const trimmed = text.trim();
  // Check phrases first (exact match)
  if (PHRASE_MAP[trimmed]) return PHRASE_MAP[trimmed];
  // Normalize: remove punctuation for matching
  const clean = trimmed.replace(/[!.,?]/g, '').trim();
  if (PHRASE_MAP[clean]) return PHRASE_MAP[clean];
  if (PHRASE_MAP[clean + '!']) return PHRASE_MAP[clean + '!'];
  // Check word translations
  if (WORD_MAP[trimmed]) return WORD_MAP[trimmed];
  if (WORD_MAP[clean]) return WORD_MAP[clean];
  return null;
}

/**
 * Play a single Hebrew audio file.
 * Returns a promise that resolves when playback finishes.
 */
export function playHebrew(text) {
  return new Promise((resolve) => {
    const filename = findAudioFile(text);
    if (!filename) {
      // No pre-recorded file - resolve immediately
      resolve(false);
      return;
    }
    const audio = getAudio(filename);
    audio.currentTime = 0;
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    audio.play().catch(() => resolve(false));
  });
}

/**
 * Play a sequence of items: { text, lang, pause }
 * For Hebrew items, uses pre-recorded audio.
 * For English items, calls the provided speakEnglish function.
 * Pauses are just delays.
 */
export function playSequence(items, speakEnglish, onDone) {
  let index = 0;

  const playNext = () => {
    if (index >= items.length) {
      if (onDone) onDone();
      return;
    }

    const item = items[index];
    index++;

    // Pause item
    if (item.pause) {
      setTimeout(playNext, item.pause);
      return;
    }

    const isHebrew = item.lang === 'he' || item.lang === 'he-IL';

    if (isHebrew) {
      // Try Cloud TTS API first (natural voice from Firestore cache)
      playHebrewFromAPI(item.text).then(async (played) => {
        if (played) {
          playNext();
          return;
        }
        // Fallback: pre-recorded MP3
        const mp3Played = await playHebrew(item.text);
        if (mp3Played) {
          playNext();
          return;
        }
        // Last resort: Web Speech API
        if (speakEnglish) {
          speakEnglish(item.text, {
            lang: 'he',
            rate: item.rate || 0.88,
            _queued: true,
            onEnd: playNext,
          });
        } else {
          playNext();
        }
      });
    } else {
      // English - use Web Speech API (which sounds good)
      if (speakEnglish) {
        speakEnglish(item.text, {
          lang: item.lang || 'en-US',
          rate: item.rate || 0.92,
          _queued: true,
          onEnd: playNext,
        });
      } else {
        playNext();
      }
    }
  };

  // Cancel any current speech before starting
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  playNext();
}

/**
 * Check if a Hebrew text has a pre-recorded audio file
 */
export function hasHebrewAudio(text) {
  return findAudioFile(text) !== null;
}

/**
 * Stop all Hebrew audio playback
 */
export function stopHebrew() {
  Object.values(audioCache).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}
