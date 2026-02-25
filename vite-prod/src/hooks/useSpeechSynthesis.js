import { useCallback } from 'react';
import { useSpeech } from '../contexts/SpeechContext.jsx';

export default function useSpeechSynthesis() {
  const { ttsSupported, isSpeaking, speak: ctxSpeak, stopSpeaking, preferredVoice } = useSpeech();

  const speak = useCallback((text, options = {}) => {
    return ctxSpeak(text, options);
  }, [ctxSpeak]);

  const speakSlow = useCallback((text) => {
    return ctxSpeak(text, { rate: 0.6 });
  }, [ctxSpeak]);

  return {
    speak,
    speakSlow,
    stop: stopSpeaking,
    isSpeaking,
    supported: ttsSupported,
    voice: preferredVoice,
  };
}
