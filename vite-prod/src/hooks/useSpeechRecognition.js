import { useState, useRef, useCallback } from 'react';
import { useSpeech } from '../contexts/SpeechContext.jsx';

export default function useSpeechRecognition() {
  const { sttSupported, setIsListening, recognitionRef } = useSpeech();
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startListening = useCallback((options = {}) => {
    if (!sttSupported) return;

    // Abort any existing recognition instance before starting a new one
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
      recognitionRef.current = null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = options.continuous || false;
    recognition.interimResults = true;
    recognition.lang = options.lang || 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsActive(true);
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
          setConfidence(result[0].confidence);
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) setTranscript(finalText);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsActive(false);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsActive(false);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [sttSupported, setIsListening, recognitionRef]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsActive(false);
    setIsListening(false);
  }, [setIsListening, recognitionRef]);

  return {
    transcript,
    interimTranscript,
    confidence,
    isListening: isActive,
    startListening,
    stopListening,
    sttSupported,
  };
}
