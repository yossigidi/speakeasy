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
  const { speak } = useSpeech();
  const { uiLang } = useTheme();
  const spokenRef = useRef(false);

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

      // Small delay + cancel ongoing speech to avoid race condition with other click-triggered speech
      setTimeout(() => {
        window.speechSynthesis?.cancel();
        const isHe = uiLang === 'he';
        speak(isHe ? textHe : textEn, { lang: isHe ? 'he' : 'en-US', rate: 0.9 });
      }, 300);
    };

    document.addEventListener('click', doSpeak);
    document.addEventListener('touchstart', doSpeak);

    return () => {
      document.removeEventListener('click', doSpeak);
      document.removeEventListener('touchstart', doSpeak);
    };
  }, [key, textHe, textEn, uiLang, speak]);
}
