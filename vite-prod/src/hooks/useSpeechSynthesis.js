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

  // Speak English word then Hebrew translation with minimal gap
  const speakWordPair = useCallback((englishWord, hebrewTranslation) => {
    speakSequence([
      { text: englishWord, lang: 'en-US', rate: 0.92 },
      { pause: 150 },
      { text: hebrewTranslation, lang: 'he', rate: 0.9 },
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
