import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import LetterCube from '../components/LetterCube.jsx';
import { generateRound, MODE_CONFIGS, getWeakLetters } from '../data/alphabet-tower-data.js';
import { playSequence, playFromAPI, stopAllAudio } from '../../../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playStar, playComplete } from '../../../../utils/gameSounds.js';
import SpeakliAvatar from '../../../../components/kids/SpeakliAvatar.jsx';

const CUBE_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

const GUIDE = {
  he: 'בואו נתרגל אותיות!',
  ar: 'هيا نتدرب على الحروف!',
  ru: 'Давайте тренировать буквы!',
  en: "Let's practice letters!",
};

const ENCOURAGEMENT = {
  he: ['יופי!', 'מצוין!', 'כל הכבוד!', 'נהדר!', 'סופר!'],
  ar: ['رائع!', 'ممتاز!', 'أحسنت!', 'مذهل!', 'سوبر!'],
  ru: ['Отлично!', 'Молодец!', 'Замечательно!', 'Супер!', 'Класс!'],
  en: ['Great!', 'Excellent!', 'Well done!', 'Amazing!', 'Super!'],
};

const TRY_AGAIN = {
  he: 'ננסה שוב!',
  ar: 'لنحاول مرة أخرى!',
  ru: 'Попробуем ещё!',
  en: "Let's try again!",
};

const THIS_IS = {
  he: 'זו האות',
  ar: 'هذا هو الحرف',
  ru: 'Это буква',
  en: 'This is',
};

const WHICH_LETTER = {
  he: 'איזו אות זו?',
  ar: 'أي حرف هذا؟',
  ru: 'Какая это буква?',
  en: 'Which letter is this?',
};

const REPORT_TITLE = {
  he: 'כרטיס ציונים',
  ar: 'بطاقة التقرير',
  ru: 'Табель',
  en: 'Report Card',
};

const TOTAL_ROUNDS = MODE_CONFIGS.aiAdaptive.roundsPerGame; // 10

const AIAdaptiveMode = React.memo(function AIAdaptiveMode({
  difficulty,
  letterStats,
  onRoundComplete,
  onGameComplete,
  onLetterResult,
  uiLang,
}) {
  // ─── state ──────────────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(0);
  const [roundData, setRoundData] = useState(() =>
    generateRound('aiAdaptive', difficulty, letterStats)
  );
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null); // null | true | false
  const [isAnimating, setIsAnimating] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(null); // text to display
  const [totalStars, setTotalStars] = useState(0);
  const [avatarMode, setAvatarMode] = useState('talk');
  const [showReport, setShowReport] = useState(false);
  const [roundResults, setRoundResults] = useState([]); // { letter, correct }

  const timersRef = useRef([]);
  const isRTL = uiLang === 'he' || uiLang === 'ar';

  // ─── timer helpers ──────────────────────────────────────────────────
  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // ─── cleanup ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimers();
      stopAllAudio();
    };
  }, [clearTimers]);

  // ─── speak letter on round start ───────────────────────────────────
  useEffect(() => {
    try {
      if (currentRound === 0) {
        playSequence([GUIDE[uiLang] || GUIDE.en], uiLang);
      }
      // Speak the target letter after a short delay
      const timer = setTimeout(() => {
        try {
          playFromAPI(roundData.target, uiLang || 'en');
        } catch { /* ignore */ }
      }, currentRound === 0 ? 1500 : 500);
      timersRef.current.push(timer);
    } catch { /* ignore */ }
    setAvatarMode('talk');
    const t = setTimeout(() => setAvatarMode('idle'), 2000);
    timersRef.current.push(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound, uiLang]);

  // ─── random encouragement ──────────────────────────────────────────
  const getEncouragement = useCallback(() => {
    const list = ENCOURAGEMENT[uiLang] || ENCOURAGEMENT.en;
    return list[Math.floor(Math.random() * list.length)];
  }, [uiLang]);

  // ─── handle option tap ─────────────────────────────────────────────
  const handleOptionTap = useCallback(
    (letter) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setSelectedOption(letter);

      const correct = letter === roundData.target;
      setIsCorrect(correct);

      // Report to parent
      try { onLetterResult(roundData.target, correct); } catch { /* */ }

      // Track result
      setRoundResults((prev) => [...prev, { letter: roundData.target, correct }]);

      if (correct) {
        // Correct answer
        try { playCorrect(); } catch { /* */ }
        try { playStar(); } catch { /* */ }
        setAvatarMode('celebrate');
        const enc = getEncouragement();
        setShowEncouragement(enc);

        const stars = MODE_CONFIGS.aiAdaptive.starsPerRound;
        const newTotal = totalStars + stars;
        setTotalStars(newTotal);

        addTimer(() => {
          onRoundComplete(stars);
          setShowEncouragement(null);
          setAvatarMode('idle');

          const nextRound = currentRound + 1;
          if (nextRound >= TOTAL_ROUNDS) {
            // Show report card
            setShowReport(true);
            try { playComplete(); } catch { /* */ }
          } else {
            const newRoundData = generateRound('aiAdaptive', difficulty, letterStats);
            setCurrentRound(nextRound);
            setRoundData(newRoundData);
            setSelectedOption(null);
            setIsCorrect(null);
            setIsAnimating(false);
          }
        }, 1500);
      } else {
        // Wrong answer
        try { playWrong(); } catch { /* */ }
        setAvatarMode('talk');

        // Show correct answer and speak it
        addTimer(() => {
          try {
            const lang = uiLang || 'en';
            const text = `${THIS_IS[lang]} ${roundData.target}`;
            playFromAPI(text, lang);
          } catch { /* */ }
        }, 600);

        setShowEncouragement(TRY_AGAIN[uiLang] || TRY_AGAIN.en);

        addTimer(() => {
          setShowEncouragement(null);
          setAvatarMode('idle');

          const nextRound = currentRound + 1;
          if (nextRound >= TOTAL_ROUNDS) {
            setShowReport(true);
            try { playComplete(); } catch { /* */ }
          } else {
            const newRoundData = generateRound('aiAdaptive', difficulty, letterStats);
            setCurrentRound(nextRound);
            setRoundData(newRoundData);
            setSelectedOption(null);
            setIsCorrect(null);
            setIsAnimating(false);
          }
        }, 2200);
      }
    },
    [
      isAnimating, roundData, totalStars, currentRound, difficulty,
      letterStats, uiLang, onRoundComplete, onLetterResult,
      getEncouragement, addTimer,
    ],
  );

  // ─── finish game from report ───────────────────────────────────────
  const handleFinishGame = useCallback(() => {
    const bonus = MODE_CONFIGS.aiAdaptive.bonusStars;
    onGameComplete(totalStars + bonus);
  }, [totalStars, onGameComplete]);

  // ─── report card stats ─────────────────────────────────────────────
  const reportStats = useMemo(() => {
    const map = {};
    for (const r of roundResults) {
      if (!map[r.letter]) {
        map[r.letter] = { correct: 0, wrong: 0, total: 0 };
      }
      map[r.letter].total++;
      if (r.correct) map[r.letter].correct++;
      else map[r.letter].wrong++;
    }
    const totalCorrect = roundResults.filter((r) => r.correct).length;
    const accuracy = roundResults.length > 0
      ? Math.round((totalCorrect / roundResults.length) * 100)
      : 0;
    return { map, accuracy, totalCorrect, totalRounds: roundResults.length };
  }, [roundResults]);

  // ─── render: report card ───────────────────────────────────────────
  if (showReport) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          padding: '24px 16px',
          direction: isRTL ? 'rtl' : 'ltr',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <SpeakliAvatar mode="celebrate" size="lg" />

        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#1e293b',
            marginTop: 16,
            marginBottom: 8,
            fontFamily: "'Fredoka', 'Heebo', sans-serif",
          }}
        >
          {REPORT_TITLE[uiLang] || REPORT_TITLE.en}
        </div>

        {/* Accuracy circle */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: reportStats.accuracy >= 70
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : reportStats.accuracy >= 40
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1,
              fontFamily: "'Fredoka', sans-serif",
            }}
          >
            {reportStats.accuracy}%
          </span>
        </div>

        {/* Letter results */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            marginBottom: 24,
            maxWidth: 340,
          }}
        >
          {Object.entries(reportStats.map).map(([letter, stats]) => (
            <div
              key={letter}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: stats.correct > stats.wrong
                  ? 'rgba(34,197,94,0.12)'
                  : 'rgba(239,68,68,0.12)',
                borderRadius: 12,
                padding: '8px 14px',
                border: `2px solid ${stats.correct > stats.wrong ? '#22c55e' : '#ef4444'}`,
                minWidth: 60,
              }}
            >
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: "'Fredoka', sans-serif",
                  color: '#1e293b',
                }}
              >
                {letter}
              </span>
              <span style={{ fontSize: 18, marginTop: 2 }}>
                {stats.correct > stats.wrong ? '\u2705' : '\u274C'}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: '#6b7280',
                  fontWeight: 600,
                  fontFamily: "'Fredoka', sans-serif",
                }}
              >
                {stats.correct}/{stats.total}
              </span>
            </div>
          ))}
        </div>

        {/* Finish button */}
        <button
          onClick={handleFinishGame}
          style={{
            padding: '12px 36px',
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: 'none',
            borderRadius: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37,99,235,0.4)',
            fontFamily: "'Fredoka', 'Heebo', sans-serif",
            transition: 'transform 0.15s',
          }}
          onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {uiLang === 'he' ? 'סיום' : uiLang === 'ar' ? 'إنهاء' : uiLang === 'ru' ? 'Готово' : 'Finish'}
        </button>

        <style>{`
          @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ─── render: game round ────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        minHeight: '100%',
        padding: '12px 8px',
        direction: isRTL ? 'rtl' : 'ltr',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── Progress dots ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: i < currentRound
                ? '#22c55e'
                : i === currentRound
                  ? '#3b82f6'
                  : '#d1d5db',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* ── Round counter ── */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#6b7280',
          marginBottom: 10,
          fontFamily: "'Fredoka', 'Heebo', sans-serif",
        }}
      >
        {currentRound + 1}/{TOTAL_ROUNDS}
      </div>

      {/* ── Avatar ── */}
      <SpeakliAvatar mode={avatarMode} size="md" />

      {/* ── Question text ── */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#64748b',
          marginTop: 8,
          marginBottom: 4,
          fontFamily: "'Fredoka', 'Heebo', sans-serif",
          textAlign: 'center',
        }}
      >
        {WHICH_LETTER[uiLang] || WHICH_LETTER.en}
      </div>

      {/* ── Target letter ── */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: CUBE_COLORS[currentRound % CUBE_COLORS.length],
          lineHeight: 1,
          fontFamily: "'Fredoka', 'Heebo', 'Inter', sans-serif",
          textShadow: '0 4px 12px rgba(0,0,0,0.15), 0 0 24px rgba(99,102,241,0.2)',
          marginBottom: 8,
          animation: 'letter-appear 0.4s ease-out',
          cursor: 'pointer',
        }}
        onClick={() => {
          try { playFromAPI(roundData.target, uiLang || 'en'); } catch { /* */ }
        }}
      >
        {roundData.target}
      </div>

      {/* ── Encouragement / feedback text ── */}
      {showEncouragement && (
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: isCorrect ? '#16a34a' : '#dc2626',
            marginBottom: 8,
            fontFamily: "'Fredoka', 'Heebo', sans-serif",
            animation: 'encouragement-pop 0.4s ease-out',
            textAlign: 'center',
          }}
        >
          {showEncouragement}
        </div>
      )}

      {/* ── Star on correct ── */}
      {isCorrect === true && (
        <div
          style={{
            fontSize: 36,
            animation: 'star-float-up 1s ease-out forwards',
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          ⭐
        </div>
      )}

      {/* ── 2x2 option grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginTop: 16,
          direction: 'ltr',
          maxWidth: 280,
          width: '100%',
        }}
      >
        {roundData.allOptions.map((letter, idx) => {
          const isSelected = selectedOption === letter;
          const isTarget = letter === roundData.target;
          const showCorrectHighlight = isCorrect !== null && isTarget;
          const showWrongHighlight = isCorrect === false && isSelected && !isTarget;

          let animClass = '';
          if (showCorrectHighlight) animClass = 'option-correct';
          else if (showWrongHighlight) animClass = 'option-wrong';

          return (
            <div
              key={`${letter}-${idx}`}
              className={`option-cube-wrapper ${animClass}`}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: isAnimating ? 'default' : 'pointer',
                position: 'relative',
              }}
              onClick={() => handleOptionTap(letter)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleOptionTap(letter);
              }}
            >
              {/* Glow rings for correct/wrong */}
              {showCorrectHighlight && (
                <div
                  style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: 18,
                    boxShadow: '0 0 24px 8px rgba(34,197,94,0.5)',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />
              )}
              {showWrongHighlight && (
                <div
                  style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: 18,
                    boxShadow: '0 0 24px 8px rgba(239,68,68,0.5)',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />
              )}

              <LetterCube
                letter={letter}
                color={CUBE_COLORS[idx % CUBE_COLORS.length]}
                size={64}
                isPlaced={showCorrectHighlight}
                isWrong={showWrongHighlight}
              />
            </div>
          );
        })}
      </div>

      {/* ── Inline styles ── */}
      <style>{`
        @keyframes letter-appear {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes encouragement-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes star-float-up {
          0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-60px) scale(1.6); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .option-cube-wrapper {
          transition: transform 0.15s;
        }
        .option-cube-wrapper:active {
          transform: scale(0.93);
        }
        .option-correct {
          animation: correct-bounce 0.5s ease-out;
        }
        .option-wrong {
          animation: wrong-shake 0.4s ease-in-out;
        }

        @keyframes correct-bounce {
          0% { transform: scale(1); }
          30% { transform: scale(1.15); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1.05); }
        }
        @keyframes wrong-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
});

export default AIAdaptiveMode;
