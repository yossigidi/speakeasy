import React, { useState, useEffect, useRef } from 'react';
import SpeakliAvatar from '../kids/SpeakliAvatar.jsx';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { stopAllAudio } from '../../utils/hebrewAudio.js';
import { t, RTL_LANGS } from '../../utils/translations.js';

/**
 * Pre-game instruction overlay.
 * Shows Speakli avatar + game emoji, instruction text, TTS, and animated start button.
 */
export default function GameInstructionOverlay({ gameEmoji, title, instruction, uiLang, onStart }) {
  const { speak, stopSpeaking } = useSpeech();
  const [visible, setVisible] = useState(true);
  const spokenRef = useRef(false);

  // Auto-speak instruction
  useEffect(() => {
    if (!spokenRef.current && instruction) {
      spokenRef.current = true;
      const timer = setTimeout(() => {
        speak(instruction, { lang: uiLang });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [instruction, uiLang, speak]);

  const handleStart = () => {
    stopSpeaking();
    stopAllAudio();
    setVisible(false);
    onStart();
  };

  if (!visible) return null;

  const isRTL = RTL_LANGS.includes(uiLang);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 mx-6 max-w-sm w-full text-center shadow-2xl animate-pop-in">
        <div className="flex justify-center mb-3">
          <SpeakliAvatar mode="bounce" size="md" shadow={false} />
        </div>

        <div className="text-5xl mb-3">{gameEmoji}</div>

        <h2 className="text-xl font-black text-gray-800 dark:text-white mb-2">
          {title}
        </h2>

        <p className="text-base text-gray-600 dark:text-gray-300 font-medium mb-5 leading-relaxed px-2">
          {instruction}
        </p>

        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-black text-white text-xl bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg active:scale-95 transition-transform animate-pulse"
        >
          {t('letsStart', uiLang)} ✨
        </button>
      </div>
    </div>
  );
}
