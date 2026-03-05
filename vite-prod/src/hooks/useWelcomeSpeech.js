import { useEffect, useRef } from 'react';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { t } from '../utils/translations.js';

/**
 * Play a welcome speech once per session when user first interacts with the page.
 * Uses Cloud TTS (natural voice) triggered from user gesture for iOS compatibility.
 *
 * @param {string} key    - unique sessionStorage key (e.g. 'alphabet', 'games')
 * @param {string} textHe - Hebrew welcome text
 * @param {string} textEn - English welcome text
 * @param {string} [textAr] - Arabic welcome text (optional)
 * @param {string} [textRu] - Russian welcome text (optional)
 */
export default function useWelcomeSpeech(key, textHe, textEn, textAr, textRu) {
  const { speak, isSpeaking } = useSpeech();
  const { uiLang } = useTheme();
  const spokenRef = useRef(false);
  const timerRef = useRef(null);
  const isSpeakingRef = useRef(false);
  isSpeakingRef.current = isSpeaking;

  // Keep fresh refs so the event handler closure always uses latest values
  const uiLangRef = useRef(uiLang);
  uiLangRef.current = uiLang;
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const textHeRef = useRef(textHe);
  textHeRef.current = textHe;
  const textEnRef = useRef(textEn);
  textEnRef.current = textEn;
  const textArRef = useRef(textAr);
  textArRef.current = textAr;
  const textRuRef = useRef(textRu);
  textRuRef.current = textRu;

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
      timerRef.current = setTimeout(() => {
        if (isSpeakingRef.current) return; // another click handler is already speaking
        const lang = uiLangRef.current;
        const textMap = {
          he: textHeRef.current,
          ar: textArRef.current,
          ru: textRuRef.current,
        };
        const text = textMap[lang] || textEnRef.current;
        speakRef.current(text, { lang: t('speechLang', lang), rate: 0.9 });
      }, 500);
    };

    document.addEventListener('click', doSpeak);
    document.addEventListener('touchstart', doSpeak);

    return () => {
      clearTimeout(timerRef.current);
      document.removeEventListener('click', doSpeak);
      document.removeEventListener('touchstart', doSpeak);
    };
  }, [key]); // Only re-register on key change; refs handle stale closure
}
