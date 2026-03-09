import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import LetterCube from '../components/LetterCube.jsx';
import useDragAndDrop from '../hooks/useDragAndDrop.js';
import { generateRound, MODE_CONFIGS } from '../data/alphabet-tower-data.js';
import { playSequence, stopAllAudio } from '../../../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playStar, playPop, playTap, playComplete } from '../../../../utils/gameSounds.js';

const CUBE_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

const GUIDE = {
  he: 'מצאו את האות החסרה!',
  ar: 'اعثروا على الحرف المفقود!',
  ru: 'Найдите пропущенную букву!',
  en: 'Find the missing letter!',
};

const TOTAL_ROUNDS = MODE_CONFIGS.missingLetter.roundsPerGame; // 8

const MissingLetterMode = React.memo(function MissingLetterMode({
  difficulty,
  onRoundComplete,
  onGameComplete,
  uiLang,
}) {
  // ─── state ──────────────────────────────────────────────────────────
  const [currentRound, setCurrentRound] = useState(0);
  const [roundData, setRoundData] = useState(() => generateRound('missingLetter', difficulty));
  const [filled, setFilled] = useState(false); // has the gap been filled this round?
  const [filledLetter, setFilledLetter] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wrongOption, setWrongOption] = useState(null); // option id shaking
  const [shakeGap, setShakeGap] = useState(false);
  const [showPlaceAnim, setShowPlaceAnim] = useState(false);
  const [showRoundStars, setShowRoundStars] = useState(false);
  const [totalStars, setTotalStars] = useState(0);

  const timersRef = useRef([]);
  const isRTL = uiLang === 'he' || uiLang === 'ar';

  // ─── derived ────────────────────────────────────────────────────────
  const gapIndex = useMemo(
    () => roundData.display.indexOf('_'),
    [roundData],
  );

  const optionItems = useMemo(
    () => roundData.options.map((l, i) => ({ id: `opt-${currentRound}-${i}`, letter: l })),
    [roundData, currentRound],
  );

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
      playSequence([{ text: GUIDE[uiLang] || GUIDE.en, lang: uiLang }]);
    } catch { /* ignore */ }
  }, [currentRound, uiLang]);

  // ─── advance to next round ─────────────────────────────────────────
  const advanceRound = useCallback(() => {
    const stars = MODE_CONFIGS.missingLetter.starsPerRound;
    const newTotal = totalStars + stars;
    setTotalStars(newTotal);
    onRoundComplete(stars);

    const nextRound = currentRound + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      const bonus = MODE_CONFIGS.missingLetter.bonusStars;
      onGameComplete(newTotal + bonus);
    } else {
      const newRoundData = generateRound('missingLetter', difficulty);
      setCurrentRound(nextRound);
      setRoundData(newRoundData);
      setFilled(false);
      setFilledLetter(null);
      setShowPlaceAnim(false);
      setIsAnimating(false);
    }
  }, [totalStars, currentRound, difficulty, onRoundComplete, onGameComplete]);

  // ─── drag and drop ─────────────────────────────────────────────────
  const handleDrop = useCallback(
    (itemId, zoneId) => {
      if (zoneId !== 'gap-zone' || filled) return;

      const item = optionItems.find((o) => o.id === itemId);
      if (!item) return;

      if (item.letter === roundData.answer) {
        // Correct!
        try { playCorrect(); } catch { /* */ }
        try { playStar(); } catch { /* */ }
        setFilled(true);
        setFilledLetter(item.letter);
        setIsAnimating(true);
        setShowPlaceAnim(true);

        addTimer(() => {
          setShowPlaceAnim(false);
          setShowRoundStars(true);
          try { playComplete(); } catch { /* */ }
        }, 600);

        addTimer(() => {
          setShowRoundStars(false);
          advanceRound();
        }, 1800);
      } else {
        // Wrong
        try { playWrong(); } catch { /* */ }
        setIsAnimating(true);
        setWrongOption(itemId);
        setShakeGap(true);

        // Speak "try again"
        const tryAgain = {
          he: 'נסו שוב!',
          ar: 'حاولوا مرة أخرى!',
          ru: 'Попробуйте ещё!',
          en: 'Try again!',
        };
        try { playSequence([{ text: tryAgain[uiLang] || tryAgain.en, lang: uiLang }]); } catch { /* */ }

        addTimer(() => {
          setWrongOption(null);
          setShakeGap(false);
          setIsAnimating(false);
        }, 500);
      }
    },
    [filled, optionItems, roundData.answer, addTimer, advanceRound, uiLang],
  );

  const handleMiss = useCallback(() => {
    try { playPop(); } catch { /* */ }
  }, []);

  const { dragHandlers, activeDrag, dropZoneRef } = useDragAndDrop({
    onDrop: handleDrop,
    onMiss: handleMiss,
    enabled: !isAnimating,
  });

  // ─── find dragged item for overlay ─────────────────────────────────
  const draggedItem = activeDrag
    ? optionItems.find((o) => o.id === activeDrag.id)
    : null;

  const draggedOrigIndex = draggedItem
    ? optionItems.findIndex((o) => o.id === activeDrag.id)
    : -1;

  // ─── hoveredGap: is pointer over the gap zone? ────────────────────
  const [hoveredGap, setHoveredGap] = useState(false);

  useEffect(() => {
    if (!activeDrag) {
      setHoveredGap(false);
      return;
    }
    const gapEl = document.querySelector('[data-drop-zone="gap-zone"]');
    if (gapEl) {
      const rect = gapEl.getBoundingClientRect();
      setHoveredGap(
        activeDrag.x >= rect.left &&
        activeDrag.x <= rect.right &&
        activeDrag.y >= rect.top &&
        activeDrag.y <= rect.bottom,
      );
    }
  }, [activeDrag]);

  // ─── render ─────────────────────────────────────────────────────────
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
          marginBottom: 6,
          fontFamily: "'Fredoka', 'Heebo', sans-serif",
        }}
      >
        {currentRound + 1}/{TOTAL_ROUNDS}
      </div>

      {/* ── Teacher guidance ── */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: 24,
          textAlign: 'center',
          fontFamily: "'Fredoka', 'Heebo', sans-serif",
        }}
      >
        {GUIDE[uiLang] || GUIDE.en}
      </div>

      {/* ── Sequence row ── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 40,
          direction: 'ltr', // letters always LTR
        }}
      >
        {roundData.display.map((item, idx) => {
          const isGap = item === '_';

          if (isGap) {
            // Gap / drop zone
            return (
              <div
                key={`seq-${idx}`}
                data-drop-zone="gap-zone"
                ref={(el) => dropZoneRef('gap-zone', el)}
                style={{
                  position: 'relative',
                  animation: shakeGap ? 'ml-shake 0.4s ease-in-out' : 'none',
                }}
              >
                {/* Hover glow */}
                {hoveredGap && !filled && (
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

                {filled ? (
                  <div
                    style={{
                      animation: showPlaceAnim ? 'ml-place 0.5s ease-out' : 'none',
                    }}
                  >
                    <LetterCube
                      letter={filledLetter}
                      color="#22c55e"
                      isPlaced
                      size={56}
                    />
                  </div>
                ) : (
                  <LetterCube
                    letter="?"
                    color="#9ca3af"
                    isGhost
                    size={56}
                  />
                )}

                {/* Star burst on fill */}
                {showPlaceAnim && (
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
              </div>
            );
          }

          // Normal letter in sequence
          return (
            <LetterCube
              key={`seq-${idx}`}
              letter={item}
              color={CUBE_COLORS[idx % CUBE_COLORS.length]}
              size={56}
            />
          );
        })}
      </div>

      {/* ── Option cubes (2x2 grid) ── */}
      {!filled && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            justifyItems: 'center',
            direction: 'ltr',
          }}
        >
          {optionItems.map((item, idx) => {
            const isBeingDragged = activeDrag?.id === item.id;
            const isShaking = wrongOption === item.id;

            return (
              <div
                key={item.id}
                style={{
                  opacity: isBeingDragged ? 0.3 : 1,
                  transition: 'opacity 0.15s',
                  animation: isShaking ? 'ml-shake 0.4s ease-in-out' : 'none',
                }}
              >
                <LetterCube
                  letter={item.letter}
                  color={CUBE_COLORS[idx % CUBE_COLORS.length]}
                  size={56}
                  onPointerDown={(e) => {
                    try { playTap(); } catch { /* */ }
                    dragHandlers.onPointerDown(e, item.id);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

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
            color={CUBE_COLORS[draggedOrigIndex % CUBE_COLORS.length]}
            isDragging
            size={56}
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
        @keyframes ml-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes ml-place {
          0% { transform: scale(0.5); opacity: 0.5; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
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

export default MissingLetterMode;
