import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { unlockAudioContext } from '../../utils/hebrewAudio.js';
import SpeakliAvatar from './SpeakliAvatar.jsx';

const SESSION_KEY = 'kids-intro-seen';

function getSeenSet() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]'));
  } catch { return new Set(); }
}

function markSeen(id) {
  const set = getSeenSet();
  set.add(id);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
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
  desc = '',
  descHe = '',
  uiLang = 'en',
  gradient = 'from-blue-500 via-sky-500 to-cyan-500',
  buttonLabel = "Let's go!",
  buttonLabelHe = 'יאללה!',
  onDone,
}) {
  const { speak, stopSpeaking } = useSpeech();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState('enter'); // enter → visible → exit
  const [avatarMode, setAvatarMode] = useState('fly');

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
    const isHe = uiLang === 'he';
    const d = isHe ? descHe : desc;
    return { text: d, lang: isHe ? 'he' : 'en-US' };
  }, [uiLang, desc, descHe]);

  // Fire speech immediately when overlay appears
  useEffect(() => {
    if (phase !== 'visible' || !visible || spokenRef.current) return;
    const speechTimer = setTimeout(() => {
      if (spokenRef.current) return;
      const { text, lang } = getSpeechText();
      setAvatarMode('talk');
      speak(text, {
        lang,
        rate: 0.9,
        noWebSpeechFallback: true,
        onEnd: () => setAvatarMode('idle'),
      });
      spokenRef.current = true;
    }, 300);
    return () => clearTimeout(speechTimer);
  }, [phase, visible, getSpeechText, speak]);

  // Fallback: if user taps on the overlay card, unlock audio + speak (iOS)
  const handleCardTouch = useCallback(() => {
    if (spokenRef.current) return;
    unlockAudioContext();
    const { text, lang } = getSpeechText();
    setAvatarMode('talk');
    speak(text, {
      lang,
      rate: 0.9,
      noWebSpeechFallback: true,
      onEnd: () => setAvatarMode('idle'),
    });
    spokenRef.current = true;
  }, [getSpeechText, speak]);

  const dismiss = useCallback(() => {
    stopSpeaking();
    setPhase('exit');
    markSeen(id);
    setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 400);
  }, [id, onDone, stopSpeaking]);

  if (!visible) return null;

  const isHe = uiLang === 'he';

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
      onClick={dismiss}
    >
      <div
        className={`relative w-full max-w-sm rounded-[2rem] bg-gradient-to-br ${gradient} p-1 shadow-2xl`}
        onClick={e => { e.stopPropagation(); handleCardTouch(); }}
        onTouchStart={handleCardTouch}
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
              {isHe ? `היי ${name}!` : `Hi ${name}!`}
            </h2>
          )}

          {/* Title */}
          <h3 className="text-xl font-extrabold text-gray-800 dark:text-white mb-2">
            {isHe ? titleHe : title}
          </h3>

          {/* Description */}
          {(desc || descHe) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed" dir={isHe ? 'rtl' : 'ltr'}>
              {isHe ? descHe : desc}
            </p>
          )}

          {/* CTA Button */}
          <button
            onClick={dismiss}
            className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${gradient} text-white font-black text-lg shadow-lg active:scale-95 transition-transform`}
          >
            {isHe ? buttonLabelHe : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
