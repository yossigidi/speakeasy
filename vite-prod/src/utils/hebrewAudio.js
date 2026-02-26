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

// API TTS cache - stores decoded AudioBuffers by text+lang key
const apiAudioCache = new Map();
let audioCtx = null;

// Track active AudioBufferSourceNodes for stopping
const activeSources = new Set();
// Flag to cancel a running playSequence
let sequenceCancelled = false;

function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function cacheKey(text, lang) {
  return `${lang || 'auto'}::${text.trim()}`;
}

/**
 * Preload audio for a list of texts via Cloud TTS API.
 * Fetches all in parallel and caches AudioBuffers.
 * Call this on component mount so playback is instant.
 * @param {string[]} texts - texts to preload
 * @param {string} [lang] - 'he' or 'en' (auto-detected if omitted)
 */
export async function preloadHebrewAudio(texts, lang) {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') await ctx.resume();

  const toLoad = texts.filter(t => t && !apiAudioCache.has(cacheKey(t, lang)));
  if (toLoad.length === 0) return;

  await Promise.allSettled(toLoad.map(async (text) => {
    const trimmed = text.trim();
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, lang }),
      });
      if (!res.ok) return;
      const { audio } = await res.json();
      if (!audio) return;
      const raw = atob(audio);
      const buf = new ArrayBuffer(raw.length);
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      const audioBuffer = await ctx.decodeAudioData(buf);
      apiAudioCache.set(cacheKey(trimmed, lang), audioBuffer);
    } catch (e) { /* skip failed */ }
  }));
}

/** Preload English audio */
export async function preloadEnglishAudio(texts) {
  return preloadHebrewAudio(texts, 'en');
}

/**
 * Play text via Google Cloud TTS API (supports both Hebrew and English).
 * Returns Promise<boolean> - true if played successfully.
 * @param {string} text - text to speak
 * @param {string} [lang] - 'he' or 'en' (auto-detected if omitted)
 */
/**
 * Play text via Google Cloud TTS API.
 * Returns { started: true, endPromise } on success, or { started: false } on failure.
 * The caller can use `started` to know audio began immediately,
 * and `endPromise` to chain actions after playback finishes.
 */
export async function playFromAPI(text, lang, signal) {
  try {
    const trimmed = text.trim();
    if (!trimmed) return { started: false };

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();

    const key = cacheKey(trimmed, lang);

    // Helper to play a cached AudioBuffer
    const playBuffer = (audioBuffer) => {
      if (signal && signal.aborted) return { started: false };
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      activeSources.add(source);
      const endPromise = new Promise(resolve => {
        source.onended = () => { activeSources.delete(source); resolve(); };
      });
      source.start(0);
      return { started: true, endPromise };
    };

    // Check cache first
    if (apiAudioCache.has(key)) {
      return playBuffer(apiAudioCache.get(key));
    }

    // Fetch from API (pass signal to cancel fetch if needed)
    const fetchOpts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed, lang }),
    };
    if (signal) fetchOpts.signal = signal;

    const res = await fetch('/api/tts', fetchOpts);

    if (!res.ok) {
      console.warn('TTS API: HTTP', res.status);
      return { started: false };
    }

    const { audio } = await res.json();
    if (!audio) {
      console.warn('TTS API: no audio in response');
      return { started: false };
    }

    // Decode base64 MP3 → ArrayBuffer → AudioBuffer
    const raw = atob(audio);
    const buf = new ArrayBuffer(raw.length);
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    const audioBuffer = await ctx.decodeAudioData(buf);

    // Cache for reuse
    apiAudioCache.set(key, audioBuffer);

    return playBuffer(audioBuffer);
  } catch (e) {
    if (e.name === 'AbortError') return { started: false };
    console.warn('TTS API failed:', e.message);
    return { started: false };
  }
}

/** Play Hebrew text via Cloud TTS (backward-compatible alias) */
export async function playHebrewFromAPI(text) {
  return playFromAPI(text, 'he');
}

/** Play English text via Cloud TTS */
export async function playEnglishFromAPI(text) {
  return playFromAPI(text, 'en');
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
  sequenceCancelled = false;

  const playNext = () => {
    if (sequenceCancelled) return;
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

    // Try Cloud TTS API first for both languages (natural voice)
    const apiLang = isHebrew ? 'he' : 'en';
    playFromAPI(item.text, apiLang).then(async (result) => {
      if (sequenceCancelled) return;
      if (result.started) {
        await result.endPromise;
        if (!sequenceCancelled) playNext();
        return;
      }

      if (isHebrew) {
        // Hebrew fallback: pre-recorded MP3
        const mp3Played = await playHebrew(item.text);
        if (sequenceCancelled) return;
        if (mp3Played) {
          playNext();
          return;
        }
      }

      // Last resort: Web Speech API
      if (speakEnglish) {
        speakEnglish(item.text, {
          lang: isHebrew ? 'he' : (item.lang || 'en-US'),
          rate: item.rate || (isHebrew ? 0.88 : 0.92),
          _queued: true,
          onEnd: playNext,
        });
      } else {
        playNext();
      }
    });
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

/**
 * Stop ALL audio: Web Speech, pre-recorded MP3s, AudioContext sources, and cancel sequences.
 */
export function stopAllAudio() {
  // Cancel any running sequence
  sequenceCancelled = true;

  // Stop Web Speech API
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  // Stop pre-recorded MP3s
  Object.values(audioCache).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });

  // Stop all active AudioBufferSource nodes (Cloud TTS)
  activeSources.forEach(source => {
    try { source.stop(); } catch (e) { /* already stopped */ }
  });
  activeSources.clear();
}
