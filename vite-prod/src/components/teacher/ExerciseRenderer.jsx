import React, { useState, useRef, useEffect } from 'react';

export default function ExerciseRenderer({ exercise, onAnswer, t, uiLang, speak, speakWordPair }) {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakResult, setSpeakResult] = useState(null);
  const timersRef = useRef([]);
  const recognitionRef = useRef(null);

  // Cleanup timers and speech recognition on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleSelect = (answer, isCorrect) => {
    if (selected !== null) return;
    setSelected(answer);
    setShowResult(true);
    const t1 = setTimeout(() => {
      onAnswer(isCorrect, exercise.wordData);
      setSelected(null);
      setShowResult(false);
    }, 800);
    timersRef.current.push(t1);
  };

  const btnStyle = (isCorrect, isThis) => ({
    fontSize: 18, padding: '12px 20px', borderRadius: 14, fontWeight: 600,
    border: `3px solid ${showResult && isCorrect ? '#10B981' : showResult && isThis ? '#EF4444' : '#E5E7EB'}`,
    background: showResult && isThis ? (isCorrect ? '#D1FAE5' : '#FEE2E2') : showResult && isCorrect ? '#D1FAE5' : 'white',
    cursor: selected ? 'default' : 'pointer', transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: '100%', textAlign: 'center'
  });

  const speakWord = () => speak(exercise.question, { lang: 'en-US', rate: 1.0 });

  // ── emoji-pick ──
  if (exercise.type === 'emoji-pick') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-2">{t('pickTheEmoji', uiLang)}</div>
        <div className="text-purple-600 dark:text-purple-400 font-bold text-xl mb-5">{exercise.question}</div>
        <button onClick={speakWord} className="bg-purple-100 dark:bg-purple-900/40 rounded-xl px-4 py-2 mb-4 text-base">🔊 {t('listenAndPick', uiLang)}</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 280, margin: '0 auto' }}>
          {exercise.options.map((opt, i) => {
            const isCorrect = opt.emoji === exercise.correctAnswer;
            const isThis = selected === opt.emoji;
            return (
              <button key={i} onClick={() => handleSelect(opt.emoji, isCorrect)} disabled={selected !== null}
                style={{
                  fontSize: 44, padding: 16, borderRadius: 16,
                  border: `3px solid ${showResult && isCorrect ? '#10B981' : showResult && isThis ? '#EF4444' : '#E5E7EB'}`,
                  background: showResult && isThis ? (isCorrect ? '#D1FAE5' : '#FEE2E2') : showResult && isCorrect ? '#D1FAE5' : 'white',
                  cursor: selected ? 'default' : 'pointer', transition: 'all 0.2s',
                  transform: isThis ? 'scale(0.95)' : 'scale(1)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                {opt.emoji}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── word-to-hebrew ──
  if (exercise.type === 'word-to-hebrew') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-2">{t('translateToNative', uiLang)}</div>
        <div style={{ fontSize: 36, marginBottom: 4 }}>{exercise.wordData?.emoji}</div>
        <div className="text-purple-600 dark:text-purple-400 font-bold text-xl mb-5">{exercise.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
          {exercise.options.map((opt, i) => {
            const isCorrect = opt === exercise.correctAnswer;
            const isThis = selected === opt;
            return (
              <button key={i} onClick={() => handleSelect(opt, isCorrect)} disabled={selected !== null}
                style={{ ...btnStyle(isCorrect, isThis), direction: 'rtl' }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── listen-pick ──
  if (exercise.type === 'listen-pick') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-4">{t('listenAndPick', uiLang)}</div>
        <button onClick={speakWord}
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: 'white', border: 'none', borderRadius: 20, padding: '16px 32px', cursor: 'pointer', marginBottom: 20, fontSize: 24, boxShadow: '0 4px 15px rgba(124,58,237,0.3)' }}>
          🔊
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300, margin: '0 auto' }}>
          {exercise.options.map((opt, i) => {
            const isCorrect = opt === exercise.correctAnswer;
            const isThis = selected === opt;
            return (
              <button key={i} onClick={() => handleSelect(opt, isCorrect)} disabled={selected !== null}
                style={btnStyle(isCorrect, isThis)}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── fill-letter ──
  if (exercise.type === 'fill-letter') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-2">{t('fillMissingLetter', uiLang)}</div>
        <div style={{ fontSize: 36, marginBottom: 4 }}>{exercise.emoji}</div>
        <div className="text-purple-600 dark:text-purple-400 font-bold text-2xl mb-5 tracking-widest font-mono">{exercise.question}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {exercise.options.map((letter, i) => {
            const isCorrect = letter === exercise.correctAnswer;
            const isThis = selected === letter;
            return (
              <button key={i} onClick={() => handleSelect(letter, isCorrect)} disabled={selected !== null}
                style={{
                  width: 56, height: 56, fontSize: 22, fontWeight: 700, borderRadius: '50%',
                  border: `3px solid ${showResult && isCorrect ? '#10B981' : showResult && isThis ? '#EF4444' : '#E5E7EB'}`,
                  background: showResult && isThis ? (isCorrect ? '#D1FAE5' : '#FEE2E2') : showResult && isCorrect ? '#D1FAE5' : 'white',
                  cursor: selected ? 'default' : 'pointer', transition: 'all 0.2s',
                  textTransform: 'lowercase', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── speak-word ──
  if (exercise.type === 'speak-word') {
    const startListening = () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { onAnswer(true, exercise.wordData); return; }
      // Abort previous recognition if any
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      setListening(true);
      const recognition = new SR();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
      recognition.onresult = (event) => {
        const spoken = Array.from(event.results[0]).map(r => r.transcript.toLowerCase().trim());
        const correct = spoken.some(s => s.includes(exercise.correctAnswer.toLowerCase()) || exercise.correctAnswer.toLowerCase().includes(s));
        setListening(false);
        recognitionRef.current = null;
        setSpeakResult(correct ? 'correct' : 'wrong');
        const t2 = setTimeout(() => { onAnswer(correct, exercise.wordData); setSpeakResult(null); }, 800);
        timersRef.current.push(t2);
      };
      recognition.onerror = () => { setListening(false); recognitionRef.current = null; onAnswer(true, exercise.wordData); };
      recognition.onend = () => { setListening(false); recognitionRef.current = null; };
      recognition.start();
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <div className="text-gray-800 dark:text-gray-200 font-semibold text-lg mb-2">{t('sayTheWord', uiLang)}</div>
        <div style={{ fontSize: 64, marginBottom: 8 }}>{exercise.emoji}</div>
        <div className="text-purple-600 dark:text-purple-400 font-bold text-2xl mb-6">{exercise.question}</div>
        <button onClick={speakWord} className="bg-purple-100 dark:bg-purple-900/40 rounded-xl px-5 py-2 mb-4 text-base">🔊</button>
        <br />
        <button onClick={startListening} disabled={listening || speakResult !== null}
          style={{
            width: 80, height: 80, borderRadius: '50%', border: 'none', fontSize: 32,
            background: listening ? 'linear-gradient(135deg, #EF4444, #F97316)' : speakResult === 'correct' ? '#10B981' : speakResult === 'wrong' ? '#EF4444' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            color: 'white', cursor: listening ? 'default' : 'pointer', transition: 'all 0.3s',
            boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
            animation: listening ? 'teacher-pulse 1s ease infinite' : 'none'
          }}>
          {listening ? '👂' : speakResult === 'correct' ? '✅' : speakResult === 'wrong' ? '❌' : '🎤'}
        </button>
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {listening ? t('listening', uiLang) : speakResult ? '' : t('tapToSpeak', uiLang)}
        </div>
      </div>
    );
  }

  return <div className="text-center text-gray-500">Exercise type: {exercise.type}</div>;
}
