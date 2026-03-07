import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { unlockAudioContext, stopAllAudio } from '../../utils/hebrewAudio.js';
import SpeakliAvatar from './SpeakliAvatar.jsx';
import { t, tReplace, RTL_LANGS } from '../../utils/translations.js';

// In-memory set: resets on every app launch / page refresh.
// (sessionStorage persists indefinitely on iOS PWA, so intros would never re-appear.)
const seenSet = new Set();

function getSeenSet() {
  return seenSet;
}

function markSeen(id) {
  seenSet.add(id);
}

/**
 * KidsIntro — fun animated intro overlay for kids pages.
 * Speaks the greeting + description aloud when shown.
 * Always mentions "ספיקלי" to build brand recognition in kids' minds.
 */
export default function KidsIntro({
  id,
  name,
  emoji = '🦉',
  title = "Let's go!",
  titleHe = 'בואו נתחיל!',
  titleAr,
  titleRu,
  desc = '',
  descHe = '',
  descAr,
  descRu,
  uiLang = 'en',
  gradient = 'from-blue-500 via-sky-500 to-cyan-500',
  buttonLabel = "Let's go!",
  buttonLabelHe = 'יאללה!',
  buttonLabelAr,
  buttonLabelRu,
  onDone,
}) {
  const { speak, stopSpeaking } = useSpeech();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState('enter'); // enter → visible → exit
  const [avatarMode, setAvatarMode] = useState('fly');
  const dismissTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(dismissTimerRef.current), []);

  useEffect(() => {
    const seen = getSeenSet();
    if (seen.has(id)) {
      setVisible(false);
      return;
    }
    setVisible(true);
    requestAnimationFrame(() => setPhase('visible'));

    // Avatar animation sequence: fly → talk (immediate speech)
    const waveTimer = setTimeout(() => setAvatarMode('talk'), 300);
    return () => clearTimeout(waveTimer);
  }, [id]);

  const spokenRef = useRef(false);

  // Build the full description text to speak (Speakli's unique voice)
  const getSpeechText = useCallback(() => {
    const LANG_SUFFIX_MAP = {he:'He',ar:'Ar',ru:'Ru'};
    const suffix = LANG_SUFFIX_MAP[uiLang] || '';
    const TTS_LANG = { he: 'he-IL', ar: 'ar-SA', ru: 'ru-RU' };
    const localizedDescs = { He: descHe, Ar: descAr, Ru: descRu };
    const d = (suffix ? localizedDescs[suffix] : null) || desc;
    return { text: d, lang: TTS_LANG[uiLang] || 'en-US' };
  }, [uiLang, desc, descHe, descAr, descRu]);

  // Fire speech once when overlay appears — no delay, guarded by ref
  useEffect(() => {
    if (phase !== 'visible' || !visible || spokenRef.current) return;
    spokenRef.current = true;
    stopAllAudio();
    const { text, lang } = getSpeechText();
    setAvatarMode('talk');
    speak(text, {
      lang,
      rate: 0.9,
      noWebSpeechFallback: true,
      onEnd: () => setAvatarMode('idle'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, visible]);

  // Tap to re-speak (useful on iOS where auto-speak may silently fail)
  const handleCardTouch = useCallback(() => {
    unlockAudioContext();
    stopAllAudio();
    const { text, lang } = getSpeechText();
    setAvatarMode('talk');
    speak(text, {
      lang,
      rate: 0.9,
      noWebSpeechFallback: true,
      onEnd: () => setAvatarMode('idle'),
    });
  }, [getSpeechText, speak]);

  const dismiss = useCallback(() => {
    stopSpeaking();
    setPhase('exit');
    markSeen(id);
    dismissTimerRef.current = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 400);
  }, [id, onDone, stopSpeaking]);

  if (!visible) return null;

  // Use React Portal to render at body level — bypasses parent CSS
  // (transform, filter, backdrop-filter) that breaks position: fixed
  const overlay = (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center p-6 transition-all duration-300 ${
        phase === 'exit' ? 'opacity-0 scale-95' : phase === 'visible' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}
      style={{
        backdropFilter: 'blur(12px)',
        background: 'rgba(0,0,0,0.4)',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div
        className={`relative w-full max-w-sm rounded-[2rem] bg-gradient-to-br ${gradient} p-1 shadow-2xl`}
        onClick={e => { e.stopPropagation(); handleCardTouch(); }}
      >
        {/* Inner card */}
        <div className="rounded-[1.8rem] bg-white/95 dark:bg-gray-900/95 p-6 text-center relative overflow-hidden">
          {/* Decorative sparkles */}
          <div className="absolute top-3 left-4 text-xl animate-sparkle">✨</div>
          <div className="absolute top-4 right-5 text-lg animate-sparkle" style={{ animationDelay: '0.3s' }}>⭐</div>
          <div className="absolute bottom-4 left-6 text-sm animate-sparkle" style={{ animationDelay: '0.6s' }}>💫</div>
          <div className="absolute bottom-3 right-4 text-lg animate-sparkle" style={{ animationDelay: '0.9s' }}>🌟</div>

          {/* Speakli mascot — animated, alive! */}
          <SpeakliAvatar mode={avatarMode} size="xl" glow />

          {/* Greeting with name */}
          {name && (
            <h2 className="text-2xl font-black rainbow-text py-1 mb-1">
              {tReplace('introGreeting', uiLang, { name })}
            </h2>
          )}

          {/* Title */}
          <h3 className="text-xl font-extrabold text-gray-800 dark:text-white mb-2">
            {({he: titleHe, ar: titleAr, ru: titleRu}[uiLang]) || title}
          </h3>

          {/* Description */}
          {(desc || descHe) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>
              {({he: descHe, ar: descAr, ru: descRu}[uiLang]) || desc}
            </p>
          )}

          {/* CTA Button */}
          <button
            onClick={e => { e.stopPropagation(); dismiss(); }}
            className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${gradient} text-white font-black text-lg shadow-lg active:scale-95 transition-transform`}
          >
            {({he: buttonLabelHe, ar: buttonLabelAr, ru: buttonLabelRu}[uiLang]) || buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
