import { useCallback } from 'react';
import { useSpeech } from '../contexts/SpeechContext.jsx';

export default function useSpeechSynthesis() {
  const { ttsSupported, isSpeaking, speak: ctxSpeak, speakSequence, stopSpeaking, preferredVoice } = useSpeech();

  const speak = useCallback((text, options = {}) => {
    return ctxSpeak(text, options);
  }, [ctxSpeak]);

  const speakSlow = useCallback((text) => {
    return ctxSpeak(text, { rate: 0.6 });
  }, [ctxSpeak]);

  // Speak English word then native-language translation with minimal gap
  const speakWordPair = useCallback((englishWord, translation, translationLang = 'he') => {
    speakSequence([
      { text: englishWord, lang: 'en-US', rate: 0.6 },
      { pause: 400 },
      { text: translation, lang: translationLang, rate: 0.85 },
    ]);
  }, [speakSequence]);

  return {
    speak,
    speakSlow,
    speakWordPair,
    speakSequence,
    stop: stopSpeaking,
    isSpeaking,
    supported: ttsSupported,
    voice: preferredVoice,
  };
}
