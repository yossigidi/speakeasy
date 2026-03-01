import { useEffect, useRef } from 'react';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

/**
 * Play a welcome speech once per session when user first interacts with the page.
 * Uses Cloud TTS (natural voice) triggered from user gesture for iOS compatibility.
 *
 * @param {string} key    - unique sessionStorage key (e.g. 'alphabet', 'games')
 * @param {string} textHe - Hebrew welcome text
 * @param {string} textEn - English welcome text
 */
export default function useWelcomeSpeech(key, textHe, textEn) {
  const { speak, isSpeaking } = useSpeech();
  const { uiLang } = useTheme();
  const spokenRef = useRef(false);
  const isSpeakingRef = useRef(false);
  isSpeakingRef.current = isSpeaking;

  useEffect(() => {
    if (spokenRef.current) return;
    const storageKey = `welcome-${key}`;
    if (sessionStorage.getItem(storageKey)) {
      spokenRef.current = true;
      return;
    }

    const doSpeak = () => {
      if (spokenRef.current) return;
      spokenRef.current = true;
      sessionStorage.setItem(storageKey, '1');
      document.removeEventListener('click', doSpeak);
      document.removeEventListener('touchstart', doSpeak);

      // Wait a bit, then only speak if nothing else is playing
      setTimeout(() => {
        if (isSpeakingRef.current) return; // another click handler is already speaking
        const isHe = uiLang === 'he';
        speak(isHe ? textHe : textEn, { lang: isHe ? 'he' : 'en-US', rate: 0.9 });
      }, 500);
    };

    document.addEventListener('click', doSpeak);
    document.addEventListener('touchstart', doSpeak);

    return () => {
      document.removeEventListener('click', doSpeak);
      document.removeEventListener('touchstart', doSpeak);
    };
  }, [key, textHe, textEn, uiLang, speak]);
}
