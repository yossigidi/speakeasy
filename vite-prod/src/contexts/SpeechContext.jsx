import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { playHebrew, playFromAPI, stopAllAudio, stopCloudTTS, unlockAudioContext } from '../utils/hebrewAudio';
import { MusicContext } from './MusicContext.jsx';

const SpeechContext = createContext(null);

// ── Voice quality ranking ─────────────────────────────────
// Higher score = better quality. Prioritize neural / premium voices.
function scoreVoice(voice, langHint) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  // Neural / premium voices are the best
  if (name.includes('neural'))   score += 100;
  if (name.includes('premium'))  score += 90;
  if (name.includes('enhanced')) score += 80;
  if (name.includes('natural'))  score += 70;

  // ── Hebrew-specific voices (prioritize these for he) ──
  if (langHint === 'he') {
    // Microsoft Edge – best Hebrew: Hila (female) and Avri (male)
    if (name.includes('hila'))     score += 95;
    if (name.includes('avri'))     score += 90;
    // Apple – Carmit is the classic Hebrew voice
    if (name.includes('carmit'))   score += 75;
    // Apple newer voices
    if (name.includes('lihi'))     score += 80;
    // Google Hebrew voices
    if (name.includes('google') && lang.startsWith('he')) score += 70;
    // Android Hebrew voice packs
    if (name.includes('קול נשי'))  score += 65;
    if (name.includes('קול גברי')) score += 60;
  }

  // ── English-specific voices ──
  if (langHint === 'en') {
    // macOS / iOS
    if (name.includes('samantha'))  score += 60;
    if (name.includes('karen'))     score += 55;
    if (name.includes('daniel'))    score += 55;
    if (name.includes('moira'))     score += 50;
    if (name.includes('tessa'))     score += 50;
  }

  // Google voices (Chrome on Android / desktop)
  if (name.includes('google'))    score += 45;

  // Microsoft voices (Edge / Windows)
  if (name.includes('microsoft') && name.includes('online')) score += 65;
  if (name.includes('microsoft')) score += 35;

  // Network voices tend to be higher quality than local
  if (!voice.localService) score += 20;

  // Default / fallback voices are low quality
  if (name.includes('default'))   score -= 10;

  return score;
}

function pickBestVoice(voices, langPrefix) {
  const matching = voices.filter(v => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
  if (matching.length === 0) return null;

  const hint = langPrefix.startsWith('he') ? 'he' : langPrefix.startsWith('en') ? 'en' : '';
  // Sort by quality score descending
  matching.sort((a, b) => scoreVoice(b, hint) - scoreVoice(a, hint));

  const best = matching[0];
  console.log(`TTS: Best ${langPrefix} voice: "${best.name}" (score: ${scoreVoice(best, hint)}, local: ${best.localService})`);
  return best;
}

// Disambiguation map for ambiguous Hebrew words
// Maps words to their nikud-annotated forms for correct TTS pronunciation
const HEBREW_PRONUNCIATION_MAP = {
  'פה': 'פֶּה',   // pe (mouth), not po (here)
};

// Clean Hebrew text for TTS: strip parentheses, fix ambiguous words
function cleanHebrewForTTS(text) {
  let cleaned = text;
  // Remove parenthetical content (e.g. "יד (כף יד)" → "יד")
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
  cleaned = cleaned.trim();
  // Fix ambiguous single words
  if (HEBREW_PRONUNCIATION_MAP[cleaned]) {
    return HEBREW_PRONUNCIATION_MAP[cleaned];
  }
  return cleaned;
}

export function SpeechProvider({ children }) {
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [preferredVoice, setPreferredVoice] = useState(null);
  const [hebrewVoice, setHebrewVoice] = useState(null);
  const recognitionRef = useRef(null);

  // Promise that resolves when voices are loaded (or times out)
  const voicesReadyRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSttSupported(!!SpeechRecognition);
    setTtsSupported('speechSynthesis' in window);

    if ('speechSynthesis' in window) {
      let resolveVoices;
      voicesReadyRef.current = new Promise((resolve) => { resolveVoices = resolve; });
      // Timeout so speak() never hangs if voices never load
      const voiceTimeout = setTimeout(() => resolveVoices(), 2000);

      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length === 0) return; // voices not loaded yet
        setVoices(v);

        // Pick best voices using quality ranking
        setPreferredVoice(pickBestVoice(v, 'en'));
        setHebrewVoice(pickBestVoice(v, 'he'));
        clearTimeout(voiceTimeout);
        resolveVoices();
      };

      loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }
  }, []);

  // Unlock AudioContext on first user gesture (iOS requirement)
  useEffect(() => {
    const unlock = () => {
      unlockAudioContext();
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
    };
    window.addEventListener('click', unlock, true);
    window.addEventListener('touchstart', unlock, true);
    return () => {
      window.removeEventListener('click', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
    };
  }, []);

  const preferredVoiceRef = useRef(null);
  preferredVoiceRef.current = preferredVoice;
  const hebrewVoiceRef = useRef(null);
  hebrewVoiceRef.current = hebrewVoice;

  // Generation counter: each non-queued speak() call increments this.
  // onEnd callbacks only fire if the generation hasn't changed,
  // preventing stale callbacks from triggering new speech when audio is force-stopped.
  const speakGenRef = useRef(0);

  // Track the current AbortController so we can abort in-flight API calls
  // when a new non-queued speak() call starts.
  const currentAbortRef = useRef(null);

  // Chrome has a bug where long utterances stop after ~15s.
  // This keeps the synth alive by poking it periodically.
  const keepAliveRef = useRef(null);
  const startKeepAlive = useCallback(() => {
    clearInterval(keepAliveRef.current);
    keepAliveRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }, []);

  const stopKeepAlive = useCallback(() => {
    clearInterval(keepAliveRef.current);
  }, []);

  const speakWithWebSpeech = useCallback(async (text, options = {}) => {
    if (!('speechSynthesis' in window) || !text) {
      setIsSpeaking(false);
      if (options.onEnd) options.onEnd();
      return;
    }

    // Wait for voices to be loaded before speaking
    if (voicesReadyRef.current) {
      await voicesReadyRef.current;
    }

    const isHebrew = options.lang === 'he' || options.lang === 'he-IL';
    const cleanedText = isHebrew ? cleanHebrewForTTS(text) : text;
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = isHebrew ? 'he-IL' : (options.lang || 'en-US');

    utterance.rate = options.rate || (isHebrew ? 0.9 : 1.0);
    utterance.pitch = options.pitch || (isHebrew ? 1.02 : 1.0);
    utterance.volume = options.volume || 1.0;

    if (isHebrew && hebrewVoiceRef.current) {
      utterance.voice = hebrewVoiceRef.current;
    } else if (!isHebrew && preferredVoiceRef.current) {
      utterance.voice = preferredVoiceRef.current;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      startKeepAlive();
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      stopKeepAlive();
      if (options.onEnd) options.onEnd();
    };
    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      setIsSpeaking(false);
      stopKeepAlive();
    };

    if (options.onBoundary) {
      utterance.addEventListener('boundary', options.onBoundary);
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  }, [startKeepAlive, stopKeepAlive]);

  // Use a ref so speakSequence and speak can reference each other without circular deps
  const speakRef = useRef(null);

  const speak = useCallback((text, options = {}) => {
    if (!text) {
      if (options.onEnd) options.onEnd();
      return;
    }

    // Cancel ALL audio from all channels (not just WebSpeech)
    if (!options._queued) {
      // Abort any in-flight API fetch from a previous speak() call
      if (currentAbortRef.current) {
        try { currentAbortRef.current.abort(); } catch (e) {}
      }
      stopAllAudio();
      speakGenRef.current++;
    }
    const gen = speakGenRef.current;

    // Ensure AudioContext is resumed (required after user gesture on mobile)
    try { unlockAudioContext(); } catch (e) {}

    const isHebrew = options.lang === 'he' || options.lang === 'he-IL';
    const apiLang = isHebrew ? 'he' : 'en';
    // Clean Hebrew text (strip parentheses etc.) before sending to TTS
    const ttsText = isHebrew ? cleanHebrewForTTS(text) : text;

    setIsSpeaking(true);

    // For long texts (>450 chars), split into sentences and speak via Cloud TTS sequentially
    // This avoids falling back to Web Speech which sounds robotic
    if (ttsText.length > 450) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const items = sentences.map(s => ({ text: s.trim(), lang: options.lang, rate: options.rate }));
      // Use speakSequenceInner directly (avoid circular dependency)
      speakSequenceInner(items, options.onEnd);
      return;
    }

    const abortCtrl = new AbortController();
    currentAbortRef.current = abortCtrl;
    const API_TIMEOUT = 4000;
    let settled = false;

    const fallbackToLocal = async () => {
      if (gen !== speakGenRef.current) return;
      // Hebrew-specific fallback: pre-recorded MP3 (use cleaned text for lookup too)
      if (isHebrew) {
        const mp3Played = await playHebrew(ttsText) || await playHebrew(text);
        if (mp3Played) {
          setIsSpeaking(false);
          if (gen === speakGenRef.current && options.onEnd) options.onEnd();
          return;
        }
      }
      // No Web Speech fallback — only use ElevenLabs API voice
      setIsSpeaking(false);
      if (gen === speakGenRef.current && options.onEnd) options.onEnd();
    };

    // Try Cloud TTS with abort signal (send cleaned text)
    const apiPromise = playFromAPI(ttsText, apiLang, abortCtrl.signal);

    apiPromise.then(async (result) => {
      if (settled || gen !== speakGenRef.current) return;
      if (result.started) {
        // Audio is playing — cancel timeout, mark settled
        settled = true;
        clearTimeout(timeoutId);
        // Wait for audio to finish, then fire onEnd
        await result.endPromise;
        setIsSpeaking(false);
        if (gen === speakGenRef.current && options.onEnd) options.onEnd();
      } else {
        // API failed — fall back
        if (!settled && gen === speakGenRef.current) {
          settled = true;
          clearTimeout(timeoutId);
          fallbackToLocal();
        }
      }
    }).catch(() => {
      if (!settled && gen === speakGenRef.current) {
        settled = true;
        clearTimeout(timeoutId);
        fallbackToLocal();
      }
    });

    // Timeout: abort the API fetch, stop any Cloud TTS that started, fall back
    const timeoutId = setTimeout(() => {
      if (!settled && gen === speakGenRef.current) {
        settled = true;
        abortCtrl.abort();
        stopCloudTTS(); // stop Cloud TTS audio that may have started
        fallbackToLocal();
      }
    }, API_TIMEOUT);
  }, [speakWithWebSpeech]);

  // Keep speakRef updated
  speakRef.current = speak;

  // Inner sequence function that uses speakRef to avoid circular deps
  const speakSequenceInner = useCallback((items, onAllDone) => {
    if (!items || items.length === 0) {
      if (onAllDone) onAllDone();
      return;
    }

    let index = 0;

    const playNext = () => {
      if (index >= items.length) {
        if (onAllDone) onAllDone();
        return;
      }

      const item = items[index];
      index++;

      if (item.pause) {
        setTimeout(playNext, item.pause);
        return;
      }

      speakRef.current(item.text, {
        lang: item.lang,
        rate: item.rate,
        pitch: item.pitch,
        _queued: true,
        onEnd: playNext,
      });
    };

    playNext();
  }, []);

  // ── speakSequence: chain multiple texts smoothly ─────────
  // Plays an array of { text, lang, rate, pause } items in order.
  const speakSequence = useCallback((items, onAllDone) => {
    if (!items || items.length === 0) {
      if (onAllDone) onAllDone();
      return;
    }

    stopAllAudio();
    speakSequenceInner(items, onAllDone);
  }, [speakSequenceInner]);

  const stopSpeaking = useCallback(() => {
    stopAllAudio();
    setIsSpeaking(false);
    stopKeepAlive();
  }, [stopKeepAlive]);

  // Duck background music while TTS is speaking
  const musicCtx = useContext(MusicContext);
  useEffect(() => {
    if (!musicCtx) return;
    if (isSpeaking) { musicCtx.duck(); } else { musicCtx.unduck(); }
  }, [isSpeaking, musicCtx]);

  const value = useMemo(() => ({
    sttSupported,
    ttsSupported,
    isListening,
    setIsListening,
    isSpeaking,
    speak,
    speakSequence,
    stopSpeaking,
    voices,
    preferredVoice,
    recognitionRef,
  }), [sttSupported, ttsSupported, isListening, isSpeaking, speak, speakSequence, stopSpeaking, voices, preferredVoice]);

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) throw new Error('useSpeech must be used within SpeechProvider');
  return context;
}
