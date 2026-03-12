import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { t, RTL_LANGS } from '../../utils/translations.js';

// Guidance bubble component - shows Hebrew instructions and reads them aloud
function GuidanceBubble({ text, uiLang, speak, onDone }) {
  const spokenRef = useRef(false);

  useEffect(() => {
    // Auto-speak the guidance text when the exercise loads
    let timer;
    if (speak && text && !spokenRef.current) {
      spokenRef.current = true;
      timer = setTimeout(() => {
        speak(text, { lang: uiLang, rate: 0.92, onEnd: () => onDone && onDone() });
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div
      onClick={() => speak && speak(text, { lang: uiLang, rate: 0.92 })}
      style={{
        background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
        border: '2px solid #FDE68A',
        borderRadius: 16,
        padding: '10px 16px',
        marginBottom: 16,
        textAlign: 'center',
        direction: RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr',
        animation: 'curriculum-fade-in 0.4s ease',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: '#92400E', lineHeight: 1.5 }}>
        {'\uD83D\uDD0A'} {text}
      </span>
    </div>
  );
}

export default function CurriculumExerciseRenderer({ exercise, onAnswer, uiLang, speak, saveRecording }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakResult, setSpeakResult] = useState(null);
  const [consentAnswered, setConsentAnswered] = useState(() => localStorage.getItem('speakli_recording_consent') !== null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const guidanceDoneRef = useRef(false);
  const timersRef = useRef([]);

  // Cleanup SpeechRecognition + timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // -- word-arrange state (initialize synchronously from exercise prop) --
  const [arrangedWords, setArrangedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState(
    () => exercise.type === 'word-arrange' ? [...(exercise.options || [])] : null
  );

  // -- match-pairs state --
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchFlash, setMatchFlash] = useState(null); // 'correct' | 'wrong'

  // Reset all state when exercise changes (handles case where component is NOT remounted)
  const exerciseIdRef = useRef(exercise);
  if (exerciseIdRef.current !== exercise) {
    exerciseIdRef.current = exercise;
    // Synchronous reset during render — safe in React 18 concurrent mode
    setSelected(null);
    setShowResult(false);
    setArrangedWords([]);
    setAvailableWords(exercise.type === 'word-arrange' ? [...(exercise.options || [])] : null);
    setMatchedPairs([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchFlash(null);
    setSpeakResult(null);
  }

  // A2: Auto-speak the exercise question/word after guidance finishes
  const guidanceDoneCallback = useCallback(() => {
    guidanceDoneRef.current = true;
    if (speak && exercise && ['emoji-pick','word-to-hebrew','listen-pick','fill-letter','speak-word'].includes(exercise.type)) {
      timersRef.current.push(setTimeout(() => speak(exercise.question, { lang: 'en', rate: 0.9, _queued: true }), 300));
    }
  }, [exercise, speak]);

  // Reset guidanceDone flag when exercise changes
  useEffect(() => {
    guidanceDoneRef.current = false;
  }, [exercise]);

  const handleSelect = (answer, isCorrect) => {
    if (selected !== null) return;
    setSelected(answer);
    setShowResult(true);
    // A3: Speak the correct answer word
    if (isCorrect && speak) {
      const wordToSpeak = exercise.wordData?.word || exercise.correctAnswer || answer;
      speak(wordToSpeak, { lang: 'en', rate: 0.9, _queued: true });
    }
    timersRef.current.push(setTimeout(() => {
      onAnswer(isCorrect, exercise.wordData);
      setSelected(null);
      setShowResult(false);
    }, 1200));
  };

  const btnStyle = (isCorrect, isThis) => ({
    fontSize: 18,
    padding: '14px 20px',
    borderRadius: 16,
    fontWeight: 600,
    border: `3px solid ${showResult && isCorrect ? '#10B981' : showResult && isThis ? '#EF4444' : '#E5E7EB'}`,
    background: showResult && isThis
      ? (isCorrect ? '#D1FAE5' : '#FEE2E2')
      : showResult && isCorrect ? '#D1FAE5' : 'white',
    cursor: selected ? 'default' : 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    width: '100%',
    textAlign: 'center',
    minHeight: 48,
  });

  const speakWord = () => speak(exercise.question, { lang: 'en-US', rate: 1.0 });

  // ====================================================================
  // 1. emoji-pick
  // ====================================================================
  if (exercise.type === 'emoji-pick') {
    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guideEmojiPick', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          {t('pickTheEmoji', uiLang)}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#FF6B6B', marginBottom: 16 }}>
          {exercise.question}
        </div>
        <button
          onClick={speakWord}
          style={{
            background: '#FFF0F0', border: 'none', borderRadius: 12, padding: '8px 16px',
            fontSize: 14, cursor: 'pointer', marginBottom: 16, color: '#FF6B6B', fontWeight: 600,
          }}
        >
          {'\uD83D\uDD0A'} {t('hearTheWord', uiLang)}
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 280, margin: '0 auto' }}>
          {exercise.options.map((opt, i) => {
            const emoji = typeof opt === 'object' ? opt.emoji : opt;
            const isCorrect = emoji === exercise.correctAnswer;
            const isThis = selected === emoji;
            return (
              <button
                key={i}
                onClick={() => handleSelect(emoji, isCorrect)}
                disabled={selected !== null}
                style={{
                  fontSize: 44, padding: 16, borderRadius: 16, minHeight: 80,
                  border: `3px solid ${showResult && isCorrect ? '#10B981' : showResult && isThis ? '#EF4444' : '#E5E7EB'}`,
                  background: showResult && isThis ? (isCorrect ? '#D1FAE5' : '#FEE2E2') : showResult && isCorrect ? '#D1FAE5' : 'white',
                  cursor: selected ? 'default' : 'pointer', transition: 'all 0.2s',
                  transform: isThis ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ====================================================================
  // 2. word-to-hebrew
  // ====================================================================
  if (exercise.type === 'word-to-hebrew') {
    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guideWordToNative', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          {t('translateToNative', uiLang)}
        </div>
        <div style={{ fontSize: 36, marginBottom: 4 }}>{exercise.wordData?.emoji}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#FF6B6B', marginBottom: 20 }}>
          {exercise.question}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
          {exercise.options.map((opt, i) => {
            const isCorrect = opt === exercise.correctAnswer;
            const isThis = selected === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelect(opt, isCorrect)}
                disabled={selected !== null}
                style={{ ...btnStyle(isCorrect, isThis), direction: 'rtl' }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ====================================================================
  // 3. listen-pick
  // ====================================================================
  if (exercise.type === 'listen-pick') {
    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guideListenPick', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#374151' }}>
          {t('listenAndPick', uiLang)}
        </div>
        <button
          onClick={speakWord}
          style={{
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
            color: 'white', border: 'none', borderRadius: 20,
            padding: '18px 36px', cursor: 'pointer', marginBottom: 24,
            fontSize: 28, boxShadow: '0 4px 15px rgba(255,107,107,0.3)',
          }}
        >
          {'\uD83D\uDD0A'}
        </button>
        <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 12, fontWeight: 500 }}>
          {t('hearTheWord', uiLang)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
          {exercise.options.map((opt, i) => {
            const isCorrect = opt === exercise.correctAnswer;
            const isThis = selected === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelect(opt, isCorrect)}
                disabled={selected !== null}
                style={btnStyle(isCorrect, isThis)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ====================================================================
  // 4. fill-letter
  // ====================================================================
  if (exercise.type === 'fill-letter') {
    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guideFillLetter', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          {t('fillMissingLetter', uiLang)}
        </div>
        <div style={{ fontSize: 36, marginBottom: 4 }}>{exercise.emoji}</div>
        <div style={{
          fontSize: 28, fontWeight: 700, color: '#0EA5E9', marginBottom: 24,
          letterSpacing: '0.15em', fontFamily: 'monospace',
        }}>
          {exercise.question}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {exercise.options.map((letter, i) => {
            const isCorrect = letter === exercise.correctAnswer;
            const isThis = selected === letter;
            return (
              <button
                key={i}
                onClick={() => handleSelect(letter, isCorrect)}
                disabled={selected !== null}
                style={{
                  width: 56, height: 56, fontSize: 22, fontWeight: 700, borderRadius: '50%',
                  border: `3px solid ${showResult && isCorrect ? '#10B981' : showResult && isThis ? '#EF4444' : '#E5E7EB'}`,
                  background: showResult && isThis ? (isCorrect ? '#D1FAE5' : '#FEE2E2') : showResult && isCorrect ? '#D1FAE5' : 'white',
                  cursor: selected ? 'default' : 'pointer', transition: 'all 0.2s',
                  textTransform: 'lowercase', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  minHeight: 48,
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ====================================================================
  // 5. speak-word
  // ====================================================================
  if (exercise.type === 'speak-word') {
    const startListening = async () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { onAnswer(true, exercise.wordData); return; }
      // Stop any previous recognition instance
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
      setListening(true);

      // Start MediaRecorder alongside SR to capture raw audio
      const hasConsent = localStorage.getItem('speakli_recording_consent') === '1';
      if (hasConsent && saveRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
          const mr = new MediaRecorder(stream, { mimeType });
          audioChunksRef.current = [];
          mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
          mr.start();
          mediaRecorderRef.current = mr;
        } catch (_) { /* mic denied or unavailable — SR still works */ }
      }

      const recognition = new SR();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
      recognition.onresult = (event) => {
        const spoken = Array.from(event.results[0]).map(r => r.transcript.toLowerCase().trim());
        const correct = spoken.some(s =>
          s.includes(exercise.correctAnswer.toLowerCase()) ||
          exercise.correctAnswer.toLowerCase().includes(s)
        );
        setListening(false);
        recognitionRef.current = null;

        // Stop MediaRecorder and save the recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          const mr = mediaRecorderRef.current;
          mr.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' });
            if (blob.size > 0 && saveRecording) {
              saveRecording(blob, exercise.correctAnswer, correct ? 100 : 0);
            }
            mr.stream.getTracks().forEach(t => t.stop());
            mediaRecorderRef.current = null;
          };
          mr.stop();
        }

        setSpeakResult(correct ? 'correct' : 'wrong');
        timersRef.current.push(setTimeout(() => {
          onAnswer(correct, exercise.wordData);
          setSpeakResult(null);
        }, 800));
      };
      recognition.onerror = () => {
        setListening(false);
        recognitionRef.current = null;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          try { mediaRecorderRef.current.stop(); mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop()); } catch (_) {}
          mediaRecorderRef.current = null;
        }
      };
      recognition.onend = () => { setListening(false); recognitionRef.current = null; };
      recognition.start();
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guideSpeakWord', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />

        {/* Recording consent banner — shown once if saveRecording is available */}
        {saveRecording && !consentAnswered && (
          <div style={{
            background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12,
            padding: '12px 16px', marginBottom: 16, textAlign: 'start',
            direction: ['he', 'ar'].includes(uiLang) ? 'rtl' : 'ltr',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0369A1', marginBottom: 6 }}>
              {t('recordingConsentTitle', uiLang)}
            </div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 10 }}>
              {t('recordingConsentDesc', uiLang)}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { localStorage.setItem('speakli_recording_consent', '0'); setConsentAnswered(true); }}
                style={{ background: 'transparent', border: '1px solid #CBD5E1', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', color: '#64748B' }}
              >
                {t('recordingConsentDeny', uiLang)}
              </button>
              <button
                onClick={() => { localStorage.setItem('speakli_recording_consent', '1'); setConsentAnswered(true); }}
                style={{ background: '#0284C7', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', color: 'white', fontWeight: 600 }}
              >
                {t('recordingConsentAllow', uiLang)}
              </button>
            </div>
          </div>
        )}

        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          {t('sayTheWord', uiLang)}
        </div>
        <div style={{ fontSize: 64, marginBottom: 8 }}>{exercise.emoji}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#FF6B6B', marginBottom: 20 }}>
          {exercise.question}
        </div>
        <button
          onClick={speakWord}
          style={{
            background: '#FFF0F0', border: 'none', borderRadius: 12,
            padding: '8px 20px', fontSize: 16, cursor: 'pointer', marginBottom: 16,
          }}
        >
          {'\uD83D\uDD0A'} {t('hearTheWord', uiLang)}
        </button>
        <br />
        <button
          onClick={startListening}
          disabled={listening || speakResult !== null}
          style={{
            width: 80, height: 80, borderRadius: '50%', border: 'none', fontSize: 32,
            background: listening
              ? 'linear-gradient(135deg, #EF4444, #F97316)'
              : speakResult === 'correct' ? '#10B981'
              : speakResult === 'wrong' ? '#EF4444'
              : 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
            color: 'white', cursor: listening ? 'default' : 'pointer', transition: 'all 0.3s',
            boxShadow: '0 4px 20px rgba(255,107,107,0.3)',
            animation: listening ? 'teacher-pulse 1s ease infinite' : 'none',
          }}
        >
          {listening ? '\uD83D\uDC42' : speakResult === 'correct' ? '\u2705' : speakResult === 'wrong' ? '\u274C' : '\uD83C\uDFA4'}
        </button>
        <div style={{ marginTop: 12, fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>
          {listening ? t('listening', uiLang) : speakResult ? '' : t('tapToSpeak', uiLang)}
        </div>
      </div>
    );
  }

  // ====================================================================
  // 6. multiple-choice
  // ====================================================================
  if (exercise.type === 'multiple-choice') {
    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guideMultipleChoice', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          {t('chooseAnswer', uiLang)}
        </div>
        {exercise.emoji && <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>{exercise.emoji}</span>}
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1F2937', marginBottom: 20, lineHeight: 1.5, direction: 'ltr', textAlign: 'center' }}>
          {exercise.question}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto' }}>
          {exercise.options.map((opt, i) => {
            const isCorrect = opt === exercise.correctAnswer;
            const isThis = selected === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelect(opt, isCorrect)}
                disabled={selected !== null}
                style={btnStyle(isCorrect, isThis)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ====================================================================
  // 7. fill-blank
  // ====================================================================
  if (exercise.type === 'fill-blank') {
    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guideFillBlank', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          {t('fillBlank', uiLang)}
        </div>
        {exercise.emoji && <div style={{ fontSize: 36, marginBottom: 8 }}>{exercise.emoji}</div>}
        <div style={{
          fontSize: 20, fontWeight: 600, color: '#1F2937', marginBottom: 24,
          lineHeight: 1.6, padding: '12px 16px', background: '#F9FAFB', borderRadius: 12,
          maxWidth: 320, margin: '0 auto 20px', direction: 'ltr', textAlign: 'center',
        }}>
          {exercise.question}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
          {exercise.options.map((opt, i) => {
            const isCorrect = opt === exercise.correctAnswer;
            const isThis = selected === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelect(opt, isCorrect)}
                disabled={selected !== null}
                style={btnStyle(isCorrect, isThis)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ====================================================================
  // 8. word-arrange
  // ====================================================================
  if (exercise.type === 'word-arrange') {
    const correctOrder = exercise.correctOrder || [];
    const isComplete = arrangedWords.length === correctOrder.length;

    const handleWordTap = (word, idx) => {
      if (showResult) return;
      const newArranged = [...arrangedWords, word];
      const newAvailable = [...(availableWords || [])];
      newAvailable.splice(idx, 1);
      setArrangedWords(newArranged);
      setAvailableWords(newAvailable);

      // Check if all words placed
      if (correctOrder.length > 0 && newArranged.length === correctOrder.length) {
        const isCorrect = newArranged.every((w, i) => correctOrder[i] && w.toLowerCase() === correctOrder[i].toLowerCase());
        setShowResult(true);
        timersRef.current.push(setTimeout(() => {
          onAnswer(isCorrect, exercise.wordData);
          setArrangedWords([]);
          setAvailableWords(null);
          setShowResult(false);
        }, 800));
      }
    };

    const handleRemoveWord = (idx) => {
      if (showResult) return;
      const word = arrangedWords[idx];
      const newArranged = [...arrangedWords];
      newArranged.splice(idx, 1);
      setArrangedWords(newArranged);
      setAvailableWords([...(availableWords || []), word]);
    };

    const isCorrectSoFar = isComplete && correctOrder.length > 0 && arrangedWords.every((w, i) => correctOrder[i] && w.toLowerCase() === correctOrder[i].toLowerCase());

    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guideWordArrange', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          {t('arrangeWords', uiLang)}
        </div>
        {/* Hint: Hebrew translation or question */}
        <div style={{
          fontSize: 16, color: '#6B7280', marginBottom: 16,
          direction: exercise.question && /[\u0590-\u05FF\u0600-\u06FF]/.test(exercise.question) ? 'rtl' : 'ltr',
        }}>
          {exercise.question}
        </div>

        {/* Answer area */}
        <div style={{
          minHeight: 56, display: 'flex', flexWrap: 'wrap', gap: 8,
          justifyContent: 'center', alignItems: 'center',
          padding: '12px 16px', borderRadius: 16, marginBottom: 20,
          background: showResult
            ? (isCorrectSoFar ? '#D1FAE5' : '#FEE2E2')
            : '#F3F4F6',
          border: `2px dashed ${showResult ? (isCorrectSoFar ? '#10B981' : '#EF4444') : '#D1D5DB'}`,
          transition: 'all 0.3s',
        }}>
          {arrangedWords.length === 0 && (
            <span style={{ color: '#9CA3AF', fontSize: 14 }}>
              {t('tapWordsToArrange', uiLang)}
            </span>
          )}
          {arrangedWords.map((word, idx) => (
            <button
              key={`placed-${idx}`}
              onClick={() => handleRemoveWord(idx)}
              style={{
                padding: '8px 16px', borderRadius: 12, fontSize: 16, fontWeight: 600,
                background: 'white', border: '2px solid #0EA5E9', color: '#0EA5E9',
                cursor: showResult ? 'default' : 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(14,165,233,0.15)',
                minHeight: 40,
              }}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Word chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {(availableWords || []).map((word, idx) => (
            <button
              key={`avail-${idx}`}
              onClick={() => handleWordTap(word, idx)}
              disabled={showResult}
              style={{
                padding: '10px 20px', borderRadius: 16, fontSize: 16, fontWeight: 600,
                background: 'white', border: '2px solid #E5E7EB', color: '#374151',
                cursor: showResult ? 'default' : 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                minHeight: 48,
              }}
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ====================================================================
  // 9. translation
  // ====================================================================
  if (exercise.type === 'translation') {
    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guideTranslation', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          {t('translateSentence', uiLang)}
        </div>
        {exercise.emoji && <div style={{ fontSize: 32, marginBottom: 8 }}>{exercise.emoji}</div>}
        <div style={{
          fontSize: 20, fontWeight: 600, color: '#1F2937', marginBottom: 24,
          padding: '12px 16px', background: '#F9FAFB', borderRadius: 12,
          maxWidth: 320, margin: '0 auto 20px', direction: 'ltr', textAlign: 'center',
        }}>
          {exercise.question}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
          {exercise.options.map((opt, i) => {
            const isCorrect = opt === exercise.correctAnswer;
            const isThis = selected === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelect(opt, isCorrect)}
                disabled={selected !== null}
                style={{ ...btnStyle(isCorrect, isThis), direction: 'rtl' }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ====================================================================
  // 10. match-pairs
  // ====================================================================
  if (exercise.type === 'match-pairs') {
    const pairs = exercise.pairs || [];
    const englishWords = exercise.options?.english || [];
    const hebrewWords = exercise.options?.hebrew || [];

    const handleLeftTap = (word) => {
      if (matchedPairs.find(p => p.en === word)) return;
      setSelectedLeft(word);
      if (selectedRight) {
        tryMatch(word, selectedRight);
      }
    };

    const handleRightTap = (word) => {
      if (matchedPairs.find(p => p.he === word)) return;
      setSelectedRight(word);
      if (selectedLeft) {
        tryMatch(selectedLeft, word);
      }
    };

    const tryMatch = (en, he) => {
      const isMatch = pairs.some(p => p.en === en && p.he === he);
      if (isMatch) {
        const newMatched = [...matchedPairs, { en, he }];
        setMatchedPairs(newMatched);
        setSelectedLeft(null);
        setSelectedRight(null);
        setMatchFlash('correct');
        timersRef.current.push(setTimeout(() => setMatchFlash(null), 400));

        // Check if all pairs matched
        if (newMatched.length === pairs.length) {
          timersRef.current.push(setTimeout(() => {
            onAnswer(true, exercise.wordData);
            setMatchedPairs([]);
            setSelectedLeft(null);
            setSelectedRight(null);
          }, 600));
        }
      } else {
        setMatchFlash('wrong');
        onAnswer(false, exercise.wordData);
        timersRef.current.push(setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setMatchFlash(null);
        }, 500));
      }
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guideMatchPairs', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          {t('matchThePairs', uiLang)}
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12, fontWeight: 500 }}>
          {t('matchInstructions', uiLang)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 340, margin: '0 auto' }}>
          {/* English column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {englishWords.map((word, i) => {
              const isMatched = matchedPairs.find(p => p.en === word);
              const isSelected = selectedLeft === word;
              return (
                <button
                  key={`en-${i}`}
                  onClick={() => handleLeftTap(word)}
                  disabled={!!isMatched}
                  style={{
                    padding: '12px 8px', borderRadius: 14, fontSize: 16, fontWeight: 600,
                    minHeight: 48, transition: 'all 0.2s',
                    background: isMatched ? '#D1FAE5' : isSelected ? '#DBEAFE' : 'white',
                    border: `3px solid ${isMatched ? '#10B981' : isSelected ? '#0EA5E9' : '#E5E7EB'}`,
                    color: isMatched ? '#059669' : '#374151',
                    cursor: isMatched ? 'default' : 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px rgba(14,165,233,0.3)' : '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>
          {/* Hebrew column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {hebrewWords.map((word, i) => {
              const isMatched = matchedPairs.find(p => p.he === word);
              const isSelected = selectedRight === word;
              return (
                <button
                  key={`he-${i}`}
                  onClick={() => handleRightTap(word)}
                  disabled={!!isMatched}
                  style={{
                    padding: '12px 8px', borderRadius: 14, fontSize: 16, fontWeight: 600,
                    minHeight: 48, transition: 'all 0.2s', direction: 'rtl',
                    background: isMatched ? '#D1FAE5' : isSelected ? '#FFF0F0' : 'white',
                    border: `3px solid ${isMatched ? '#10B981' : isSelected ? '#FF6B6B' : '#E5E7EB'}`,
                    color: isMatched ? '#059669' : '#374151',
                    cursor: isMatched ? 'default' : 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px rgba(255,107,107,0.3)' : '0 2px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
        {matchFlash && (
          <div style={{
            marginTop: 12, fontSize: 14, fontWeight: 600,
            color: matchFlash === 'correct' ? '#10B981' : '#EF4444',
            animation: 'curriculum-fade-in 0.3s ease',
          }}>
            {matchFlash === 'correct' ? '\u2705' : '\u274C'}
          </div>
        )}
      </div>
    );
  }

  // ====================================================================
  // 11. picture-sentence
  // ====================================================================
  if (exercise.type === 'picture-sentence') {
    return (
      <div style={{ textAlign: 'center' }}>
        <GuidanceBubble text={t('guidePictureSentence', uiLang)} uiLang={uiLang} speak={speak} onDone={guidanceDoneCallback} />
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#374151' }}>
          {t('pickTheSentence', uiLang)}
        </div>
        <div style={{ fontSize: 72, marginBottom: 20 }}>{exercise.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340, margin: '0 auto' }}>
          {exercise.options.map((opt, i) => {
            const isCorrect = opt === exercise.correctAnswer;
            const isThis = selected === opt;
            return (
              <button
                key={i}
                onClick={() => handleSelect(opt, isCorrect)}
                disabled={selected !== null}
                style={{
                  ...btnStyle(isCorrect, isThis),
                  fontSize: 16, lineHeight: 1.4, textAlign: 'left', padding: '14px 18px',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ====================================================================
  // 12. category-sort (stub)
  // ====================================================================
  if (exercise.type === 'category-sort') {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83D\uDEA7'}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#6B7280', marginBottom: 20 }}>
          {t('comingSoon', uiLang)}
        </div>
        <button
          onClick={() => onAnswer(false, exercise.wordData)}
          style={{
            padding: '12px 32px', borderRadius: 16, fontSize: 16, fontWeight: 600,
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', color: 'white',
            border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,107,107,0.3)',
          }}
        >
          {t('continue', uiLang)}
        </button>
      </div>
    );
  }

  // ====================================================================
  // 13. sentence-correction (stub)
  // ====================================================================
  if (exercise.type === 'sentence-correction') {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83D\uDEA7'}</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#6B7280', marginBottom: 20 }}>
          {t('comingSoon', uiLang)}
        </div>
        <button
          onClick={() => onAnswer(false, exercise.wordData)}
          style={{
            padding: '12px 32px', borderRadius: 16, fontSize: 16, fontWeight: 600,
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', color: 'white',
            border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,107,107,0.3)',
          }}
        >
          {t('continue', uiLang)}
        </button>
      </div>
    );
  }

  // ====================================================================
  // Fallback
  // ====================================================================
  return (
    <div style={{ textAlign: 'center', color: '#9CA3AF', padding: 24 }}>
      Exercise type: {exercise.type}
    </div>
  );
}
