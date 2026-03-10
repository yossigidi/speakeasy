import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import LetterCube from '../components/LetterCube.jsx';
import useDragAndDrop from '../hooks/useDragAndDrop.js';
import { generateRound, MODE_CONFIGS } from '../data/alphabet-tower-data.js';
import { playSequence, stopAllAudio } from '../../../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playStar, playPop, playTap, playComplete } from '../../../../utils/gameSounds.js';
import SpeakliTeacher from '../components/SpeakliTeacher.jsx';
import { ConfettiBurst, FloatingElements, RoundTransition } from '../components/GameEffects.jsx';
import { ArrowLeft } from 'lucide-react';

const CUBE_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

const GUIDE = {
  he: 'סדרו את האותיות!',
  ar: 'رتبوا الحروف!',
  ru: 'Расставьте буквы!',
  en: 'Arrange the letters!',
};

const GUIDE_TOWER = {
  he: 'בנו את המגדל!',
  ar: 'ابنوا البرج!',
  ru: 'Постройте башню!',
  en: 'Build the tower!',
};

const ENCOURAGEMENT = {
  he: ['יופי!', 'מצוין!', 'כל הכבוד!', 'נהדר!', 'סופר!'],
  ar: ['رائع!', 'ممتاز!', 'أحسنت!', 'مذهل!', 'سوبر!'],
  ru: ['Отлично!', 'Молодец!', 'Замечательно!', 'Супер!', 'Класс!'],
  en: ['Great!', 'Excellent!', 'Well done!', 'Amazing!', 'Super!'],
};

const TRY_AGAIN = {
  he: 'זו לא האות, בואו ננסה שוב',
  ar: 'هذا ليس الحرف، هيا نحاول مرة أخرى',
  ru: 'Это не та буква, давай попробуем ещё раз',
  en: "That's not the letter, let's try again",
};
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const TOTAL_ROUNDS = MODE_CONFIGS.alphabetOrder.roundsPerGame; // 6

const AlphabetOrderMode = React.memo(function AlphabetOrderMode({
  difficulty,
  onRoundComplete,
  onGameComplete,
  onBack,
  uiLang,
}) {
  // ─── state ──────────────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(0);
  const [roundData, setRoundData] = useState(() => generateRound('alphabetOrder', difficulty));
  const [placedMap, setPlacedMap] = useState({}); // { zoneIndex: letter }
  const [availableLetters, setAvailableLetters] = useState(() =>
    roundData.letters.map((l, i) => ({ id: `letter-${i}`, letter: l }))
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [wrongZone, setWrongZone] = useState(null); // zone index that is shaking
  const [wrongCube, setWrongCube] = useState(null); // cube id that is shaking
  const [justPlaced, setJustPlaced] = useState(null); // zone index for placed anim
  const [starBurst, setStarBurst] = useState(null); // zone index for star burst
  const [showRoundStars, setShowRoundStars] = useState(false);
  const [totalStars, setTotalStars] = useState(0);
  const [teacherPose, setTeacherPose] = useState('happy');
  const [teacherSpeech, setTeacherSpeech] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

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

  // ─── speak on round start ──────────────────────────────────────────
  useEffect(() => {
    try {
      const guide = roundData.layout === 'tower' ? GUIDE_TOWER : GUIDE;
      const text = currentRound === 0
        ? (guide[uiLang] || guide.en)
        : pickRandom(ENCOURAGEMENT[uiLang] || ENCOURAGEMENT.en);
      playSequence([{ text, lang: uiLang }]);
    } catch { /* ignore */ }
  }, [currentRound, uiLang, roundData.layout]);

  // ─── derive answer order ───────────────────────────────────────────
  const answerLetters = useMemo(() => roundData.answer, [roundData]);
  const zoneCount = answerLetters.length;
  const isTower = roundData.layout === 'tower';

  // ─── check round complete ──────────────────────────────────────────
  const checkAllPlaced = useCallback(
    (nextPlacedMap) => {
      if (Object.keys(nextPlacedMap).length === zoneCount) {
        setIsAnimating(true);
        setShowRoundStars(true);
        setShowConfetti(true);
        setTeacherPose('star');
        setTeacherSpeech('');
        try { playComplete(); } catch { /* */ }

        const stars = MODE_CONFIGS.alphabetOrder.starsPerRound;
        const newTotal = totalStars + stars;
        setTotalStars(newTotal);

        addTimer(() => {
          setShowRoundStars(false);
          onRoundComplete(stars);

          const nextRound = currentRound + 1;
          if (nextRound >= TOTAL_ROUNDS) {
            const bonus = MODE_CONFIGS.alphabetOrder.bonusStars;
            onGameComplete(newTotal + bonus);
          } else {
            // Next round
            const newRoundData = generateRound('alphabetOrder', difficulty);
            setCurrentRound(nextRound);
            setRoundData(newRoundData);
            setPlacedMap({});
            setAvailableLetters(
              newRoundData.letters.map((l, i) => ({ id: `letter-${nextRound}-${i}`, letter: l }))
            );
            setIsAnimating(false);
            setShowConfetti(false);
            setShowTransition(true);
            setTimeout(() => setShowTransition(false), 600);
            setTeacherPose('happy');
            setTeacherSpeech('');
          }
        }, 1500);
      }
    },
    [zoneCount, totalStars, currentRound, difficulty, onRoundComplete, onGameComplete, addTimer],
  );

  // ─── drag and drop ─────────────────────────────────────────────────
  const handleDrop = useCallback(
    (itemId, zoneId) => {
      // zoneId format: "zone-{index}"
      const zoneIndex = parseInt(zoneId.replace('zone-', ''), 10);
      const expectedLetter = answerLetters[zoneIndex];

      // Find the dragged letter
      const item = availableLetters.find((l) => l.id === itemId);
      if (!item) return;

      if (item.letter === expectedLetter && !placedMap[zoneIndex]) {
        // Correct placement
        try { playCorrect(); } catch { /* */ }
        try { playStar(); } catch { /* */ }
        setTeacherPose('clap');
        const enc = pickRandom(ENCOURAGEMENT[uiLang] || ENCOURAGEMENT.en);
        setTeacherSpeech(enc);
        addTimer(() => { setTeacherPose('think'); setTeacherSpeech(''); }, 1200);

        const nextPlaced = { ...placedMap, [zoneIndex]: item.letter };
        setPlacedMap(nextPlaced);
        setAvailableLetters((prev) => prev.filter((l) => l.id !== itemId));

        // Placed animation
        setJustPlaced(zoneIndex);
        setStarBurst(zoneIndex);
        addTimer(() => setJustPlaced(null), 600);
        addTimer(() => setStarBurst(null), 900);

        // Speak the letter + encouragement
        addTimer(() => {
          playSequence([
            { text: item.letter, lang: 'en-US' },
            { pause: 300 },
            { text: pickRandom(ENCOURAGEMENT[uiLang] || ENCOURAGEMENT.en), lang: uiLang },
          ]);
        }, 200);

        checkAllPlaced(nextPlaced);
      } else {
        // Wrong placement
        try { playWrong(); } catch { /* */ }
        setIsAnimating(true);
        setWrongZone(zoneIndex);
        setWrongCube(itemId);
        setTeacherPose('sad');
        setTeacherSpeech('');
        addTimer(() => {
          playSequence([
            { text: TRY_AGAIN[uiLang] || TRY_AGAIN.en, lang: uiLang },
          ]);
        }, 300);
        addTimer(() => {
          setWrongZone(null);
          setWrongCube(null);
          setIsAnimating(false);
          setTeacherPose('think');
        }, 500);
      }
    },
    [answerLetters, availableLetters, placedMap, checkAllPlaced, addTimer],
  );

  const handleMiss = useCallback(
    (itemId) => {
      try { playPop(); } catch { /* */ }
    },
    [],
  );

  const { dragHandlers, activeDrag, dropZoneRef } = useDragAndDrop({
    onDrop: handleDrop,
    onMiss: handleMiss,
    enabled: !isAnimating,
  });

  // ─── find the dragged item for overlay ─────────────────────────────
  const draggedItem = activeDrag
    ? availableLetters.find((l) => l.id === activeDrag.id)
    : null;

  const draggedOriginalIndex = draggedItem
    ? roundData.letters.indexOf(draggedItem.letter)
    : -1;

  // ─── hoveredZone: which zone is the pointer over ──────────────────
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    if (!activeDrag) {
      setHoveredZone(null);
      return;
    }
    // Check each zone rect
    const zones = document.querySelectorAll('[data-drop-zone]');
    let found = null;
    zones.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (
        activeDrag.x >= rect.left &&
        activeDrag.x <= rect.right &&
        activeDrag.y >= rect.top &&
        activeDrag.y <= rect.bottom
      ) {
        found = el.getAttribute('data-drop-zone');
      }
    });
    setHoveredZone(found);
  }, [activeDrag]);

  // ─── render ─────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: '8px 8px 4px',
        direction: isRTL ? 'rtl' : 'ltr',
        position: 'relative',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Background image ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/images/games/bg-alphabet-order.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.4,
        borderRadius: 16,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <FloatingElements type="stars" count={6} />
      <ConfettiBurst active={showConfetti} />
      <RoundTransition show={showTransition} />

      {/* ── Back button ── */}
      {onBack && (
        <button
          onClick={onBack}
          style={{ position: 'absolute', top: 12, [isRTL ? 'right' : 'left']: 12, background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 50, transform: isRTL ? 'scaleX(-1)' : 'none' }}
          aria-label="Back"
        >
          <ArrowLeft size={20} color="#475569" />
        </button>
      )}

      {/* ── Progress dots ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 4, position: 'relative', zIndex: 1 }}>
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: i < currentRound ? '#22c55e' : i === currentRound ? '#3b82f6' : '#d1d5db',
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
          marginBottom: 2,
          fontFamily: "'Fredoka', 'Heebo', sans-serif",
          position: 'relative',
          zIndex: 1,
        }}
      >
        {currentRound + 1}/{TOTAL_ROUNDS}
      </div>

      {/* ── Teacher character ── */}
      <SpeakliTeacher
        pose={teacherPose}
        size="sm"
        isRTL={isRTL}
        speech={teacherSpeech || (isTower ? (GUIDE_TOWER[uiLang] || GUIDE_TOWER.en) : (GUIDE[uiLang] || GUIDE.en))}
        style={{ marginBottom: 6 }}
      />

      {/* ── Drop zones (top / tower) ── */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          zIndex: 1,
          flexDirection: isTower ? 'column-reverse' : 'row',
          gap: isTower ? 4 : 8,
          justifyContent: 'center',
          alignItems: isTower ? 'center' : undefined,
          flexWrap: isTower ? 'nowrap' : 'wrap',
          marginBottom: isTower ? 12 : 20,
          minHeight: isTower ? undefined : 70,
          direction: 'ltr', // letters always LTR
        }}
      >
        {answerLetters.map((letter, idx) => {
          const isPlaced = placedMap[idx] != null;
          const isHovered = hoveredZone === `zone-${idx}` && !isPlaced;
          const isJustPlaced = justPlaced === idx;
          const isWrongTarget = wrongZone === idx;
          const hasBurst = starBurst === idx;

          return (
            <div
              key={`zone-${idx}`}
              data-drop-zone={`zone-${idx}`}
              ref={(el) => dropZoneRef(`zone-${idx}`, el)}
              style={{
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: isJustPlaced
                  ? 'scale(1.15)'
                  : isWrongTarget
                    ? 'translateX(0)'
                    : 'scale(1)',
                animation: isWrongTarget ? 'cube-shake 0.4s ease-in-out' : 'none',
              }}
            >
              {/* Glow ring on hover */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    inset: -6,
                    borderRadius: 16,
                    background: 'rgba(34, 197, 94, 0.25)',
                    boxShadow: '0 0 18px 4px rgba(34, 197, 94, 0.4)',
                    zIndex: 0,
                    animation: 'glow-pulse 0.8s ease-in-out infinite alternate',
                  }}
                />
              )}

              {/* Placed cube or ghost */}
              {isPlaced ? (
                <LetterCube
                  letter={placedMap[idx]}
                  color={CUBE_COLORS[idx % CUBE_COLORS.length]}
                  isPlaced
                  size={isTower ? 44 : 48}
                />
              ) : (
                <div style={{ position: 'relative' }}>
                  <LetterCube
                    letter={letter}
                    color="#9ca3af"
                    isGhost
                    size={isTower ? 44 : 48}
                  />
                  {/* Visible drop zone indicator */}
                  <div style={{
                    position: 'absolute',
                    inset: 2,
                    borderRadius: 10,
                    border: '2.5px dashed rgba(59,130,246,0.5)',
                    background: 'rgba(59,130,246,0.08)',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }} />
                </div>
              )}

              {/* Correct-placement green glow */}
              {isJustPlaced && (
                <div
                  style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: 16,
                    boxShadow: '0 0 20px 6px rgba(34,197,94,0.5)',
                    pointerEvents: 'none',
                    zIndex: 3,
                  }}
                />
              )}

              {/* Star burst */}
              {hasBurst && (
                <div
                  style={{
                    position: 'absolute',
                    top: -18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 28,
                    animation: 'star-float-up 0.9s ease-out forwards',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                >
                  ⭐
                </div>
              )}

              {/* Order label */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#9ca3af',
                  marginTop: isTower ? 0 : 2,
                  marginLeft: isTower ? 6 : 0,
                  fontFamily: "'Fredoka', sans-serif",
                  position: isTower ? 'absolute' : 'static',
                  right: isTower ? -20 : undefined,
                  top: isTower ? '50%' : undefined,
                  transform: isTower ? 'translateY(-50%)' : undefined,
                }}
              >
                {idx + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Scrambled cubes (bottom) ── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          flexWrap: 'wrap',
          direction: 'ltr',
          position: 'relative',
          zIndex: 1,
          marginTop: 'auto',
          paddingBottom: 8,
        }}
      >
        {availableLetters.map((item) => {
          const origIdx = roundData.letters.indexOf(item.letter);
          const isBeingDragged = activeDrag?.id === item.id;
          const isShaking = wrongCube === item.id;

          return (
            <div
              key={item.id}
              style={{
                opacity: isBeingDragged ? 0.3 : 1,
                transition: 'opacity 0.15s, transform 0.2s',
                animation: isShaking ? 'cube-shake 0.4s ease-in-out' : 'none',
              }}
            >
              <LetterCube
                letter={item.letter}
                color={CUBE_COLORS[origIdx % CUBE_COLORS.length]}
                size={52}
                onPointerDown={(e) => {
                  try { playTap(); } catch { /* */ }
                  dragHandlers.onPointerDown(e, item.id);
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Drag overlay ── */}
      {activeDrag && draggedItem && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            zIndex: 1000,
            transform: `translate(${activeDrag.x - 42}px, ${activeDrag.y - 42}px)`,
            transition: 'none',
          }}
        >
          <LetterCube
            letter={draggedItem.letter}
            color={CUBE_COLORS[draggedOriginalIndex % CUBE_COLORS.length]}
            isDragging
            size={52}
          />
        </div>
      )}

      {/* ── Round-complete stars ── */}
      {showRoundStars && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.15)',
            zIndex: 100,
            animation: 'fade-in 0.3s ease-out',
          }}
        >
          <div
            style={{
              fontSize: 60,
              animation: 'star-pop 0.6s ease-out',
            }}
          >
            ⭐🎉⭐
          </div>
        </div>
      )}

      {/* ── Inline keyframes ── */}
      <style>{`
        @keyframes cube-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes glow-pulse {
          0% { box-shadow: 0 0 12px 2px rgba(34,197,94,0.3); }
          100% { box-shadow: 0 0 22px 6px rgba(34,197,94,0.55); }
        }
        @keyframes star-float-up {
          0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-36px) scale(1.5); }
        }
        @keyframes star-pop {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
});

export default AlphabetOrderMode;
