import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { playHebrew, playFromAPI, stopAllAudio, unlockAudioContext } from '../utils/hebrewAudio';

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

export function SpeechProvider({ children }) {
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [preferredVoice, setPreferredVoice] = useState(null);
  const [hebrewVoice, setHebrewVoice] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSttSupported(!!SpeechRecognition);
    setTtsSupported('speechSynthesis' in window);

    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        if (v.length === 0) return; // voices not loaded yet
        setVoices(v);

        // Pick best voices using quality ranking
        setPreferredVoice(pickBestVoice(v, 'en'));
        setHebrewVoice(pickBestVoice(v, 'he'));
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

  const speakWithWebSpeech = useCallback((text, options = {}) => {
    if (!('speechSynthesis' in window) || !text) return;

    const isHebrew = options.lang === 'he' || options.lang === 'he-IL';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHebrew ? 'he-IL' : (options.lang || 'en-US');

    utterance.rate = options.rate || (isHebrew ? 0.88 : 0.92);
    utterance.pitch = options.pitch || (isHebrew ? 1.08 : 1.0);
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

  const speak = useCallback((text, options = {}) => {
    if (!text) return;

    // Cancel ALL audio from all channels (not just WebSpeech)
    if (!options._queued) {
      stopAllAudio();
    }

    const isHebrew = options.lang === 'he' || options.lang === 'he-IL';
    const apiLang = isHebrew ? 'he' : 'en';

    setIsSpeaking(true);

    const abortCtrl = new AbortController();
    const API_TIMEOUT = 2000;
    let settled = false;

    const fallbackToLocal = async () => {
      // Hebrew-specific fallback: pre-recorded MP3
      if (isHebrew) {
        const mp3Played = await playHebrew(text);
        if (mp3Played) {
          setIsSpeaking(false);
          if (options.onEnd) options.onEnd();
          return;
        }
      }
      // Last resort: Web Speech API
      speakWithWebSpeech(text, { ...options, _queued: true });
    };

    // Try Cloud TTS with abort signal
    const apiPromise = playFromAPI(text, apiLang, abortCtrl.signal);

    apiPromise.then(async (result) => {
      if (settled) return;
      if (result.started) {
        // Audio is playing — cancel timeout, mark settled
        settled = true;
        clearTimeout(timeoutId);
        // Wait for audio to finish, then fire onEnd
        await result.endPromise;
        setIsSpeaking(false);
        if (options.onEnd) options.onEnd();
      } else {
        // API failed — fall back
        if (!settled) {
          settled = true;
          clearTimeout(timeoutId);
          fallbackToLocal();
        }
      }
    }).catch(() => {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        fallbackToLocal();
      }
    });

    // Timeout: abort the API fetch and fall back to local TTS
    // Do NOT call stopAllAudio() here — it would cancel other queued items
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        abortCtrl.abort();
        fallbackToLocal();
      }
    }, API_TIMEOUT);
  }, [speakWithWebSpeech]);

  // ── speakSequence: chain multiple texts smoothly ─────────
  // Plays an array of { text, lang, rate, pause } items in order.
  // Much smoother than calling speak() repeatedly with timeouts.
  const speakSequence = useCallback((items, onAllDone) => {
    if (!('speechSynthesis' in window) || !items || items.length === 0) {
      if (onAllDone) onAllDone();
      return;
    }

    stopAllAudio();

    let index = 0;

    const playNext = () => {
      if (index >= items.length) {
        if (onAllDone) onAllDone();
        return;
      }

      const item = items[index];
      index++;

      // If it's a pause item, wait then continue
      if (item.pause) {
        setTimeout(playNext, item.pause);
        return;
      }

      speak(item.text, {
        lang: item.lang,
        rate: item.rate,
        pitch: item.pitch,
        _queued: true, // don't cancel previous
        onEnd: playNext,
      });
    };

    playNext();
  }, [speak]);

  const stopSpeaking = useCallback(() => {
    stopAllAudio();
    setIsSpeaking(false);
    stopKeepAlive();
  }, [stopKeepAlive]);

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
