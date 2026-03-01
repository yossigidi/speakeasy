import React, { useState, useEffect, useCallback, useRef } from 'react';
import TeacherCharacter from '../teacher/TeacherCharacter.jsx';
import CurriculumExerciseRenderer from './CurriculumExerciseRenderer.jsx';
import LessonCompleteScreen from './LessonCompleteScreen.jsx';
import { getLesson, calculateStars, calculateXP, LESSON_TYPES } from '../../data/curriculum/curriculum-index.js';
import { generateExercises } from '../../data/curriculum/exercise-generator.js';
import useCurriculumProgress from '../../hooks/useCurriculumProgress.js';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { stopAllAudio } from '../../utils/hebrewAudio.js';
import { playCorrect, playWrong, playComplete } from '../../utils/gameSounds.js';
import { t } from '../../utils/translations.js';

export default function CurriculumLessonRunner({ lessonId, onComplete, onBack, uiLang }) {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'exercise' | 'complete'
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [hearts, setHearts] = useState(3);
  const [streak, setStreak] = useState(0);
  const [teacherState, setTeacherState] = useState('idle');
  const [lessonData, setLessonData] = useState(null);

  const curriculum = useCurriculumProgress();
  const { speak, stopSpeaking } = useSpeech();
  const introTimerRef = useRef(null);
  const spokenRef = useRef(false);
  const exerciseTimersRef = useRef([]);

  const [loadError, setLoadError] = useState(false);

  // Load lesson data and generate exercises
  useEffect(() => {
    const data = getLesson(lessonId);
    if (!data) {
      console.error('Lesson not found:', lessonId);
      setLoadError(true);
      return;
    }

    setLessonData(data);
    try {
      const exs = generateExercises(data.unit, data.lesson);
      setExercises(exs);
    } catch (err) {
      console.error('Failed to generate exercises:', err);
      setLoadError(true);
    }
  }, [lessonId]);

  // Error state — lesson not found
  if (loadError) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
          {uiLang === 'he' ? 'לא הצלחנו לטעון את השיעור' : "Couldn't load lesson"}
        </div>
        <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24 }}>
          {uiLang === 'he' ? 'נסו שוב מאוחר יותר' : 'Please try again later'}
        </div>
        <button
          onClick={onBack}
          style={{
            padding: '12px 32px', borderRadius: 16, fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', color: 'white',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255,107,107,0.3)',
          }}
        >
          {t('back', uiLang)}
        </button>
      </div>
    );
  }

  // Speak intro when entering intro phase
  useEffect(() => {
    if (phase === 'intro' && lessonData && !spokenRef.current) {
      spokenRef.current = true;
      const lessonType = lessonData.lesson?.type;
      const introKey = lessonType === 'speaking' ? 'introSpeakingDesc' :
        lessonType === 'vocabulary' ? 'introVocabDesc' :
        lessonType === 'reading' ? 'introReadingDesc' :
        lessonType === 'writing' ? 'introWritingDesc' :
        lessonType === 'test' ? 'introTestDesc' : 'introMixedDesc';

      const title = uiLang === 'he' ? lessonData.lesson.titleHe : lessonData.lesson.titleEn;
      const desc = t(introKey, uiLang);

      // Speak title then description
      setTimeout(() => {
        speak(title, { lang: uiLang === 'he' ? 'he' : 'en', rate: 0.9, onEnd: () => {
          setTimeout(() => speak(desc, { lang: uiLang === 'he' ? 'he' : 'en', rate: 0.9, _queued: true }), 200);
        }});
      }, 200);
    }
  }, [phase, lessonData]);

  // Intro phase: start lesson
  const handleStartLesson = useCallback(() => {
    stopSpeaking && stopSpeaking();
    setPhase('exercise');
    setTeacherState('idle');
  }, [stopSpeaking]);

  // Handle exercise answer with voice feedback
  const handleAnswer = useCallback((isCorrect, wordData) => {
    // Clear any pending timers from previous exercise
    exerciseTimersRef.current.forEach(clearTimeout);
    exerciseTimersRef.current = [];

    if (isCorrect) {
      playCorrect();
      setCorrectCount(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        // Set teacher state based on fresh streak value
        setTeacherState(newStreak >= 3 ? 'celebrating' : 'happy');
        // Voice feedback
        const msg = newStreak >= 3
          ? t('teacherEncourage3', uiLang)
          : t('teacherEncourage1', uiLang);
        speak(msg, { lang: uiLang === 'he' ? 'he' : 'en', rate: 1.0, _queued: true });
        return newStreak;
      });
    } else {
      playWrong();
      setWrongCount(prev => prev + 1);
      setHearts(prev => {
        const newHearts = Math.max(0, prev - 1);
        // If hearts reach 0, end the lesson immediately
        if (newHearts === 0) {
          setAnswers(a => [...a, { isCorrect, wordData }]);
          const t1 = setTimeout(() => handleLessonComplete(isCorrect), 1200);
          exerciseTimersRef.current.push(t1);
        }
        return newHearts;
      });
      setStreak(0);
      setTeacherState('encouraging');
      speak(t('teacherWrong', uiLang), { lang: uiLang === 'he' ? 'he' : 'en', rate: 0.95, _queued: true });
    }

    setAnswers(prev => [...prev, { isCorrect, wordData }]);

    // Reset teacher state after a moment
    const t1 = setTimeout(() => setTeacherState('idle'), 1500);
    exerciseTimersRef.current.push(t1);

    // Advance to next exercise — stop any ongoing speech first
    const t2 = setTimeout(() => {
      stopAllAudio();
      if (currentExercise + 1 >= exercises.length) {
        handleLessonComplete(isCorrect);
      } else {
        setCurrentExercise(prev => prev + 1);
      }
    }, 1200);
    exerciseTimersRef.current.push(t2);
  }, [currentExercise, exercises.length, uiLang, speak]);

  // Use ref for correctCount to avoid stale closure in handleLessonComplete
  const correctCountRef = useRef(0);
  useEffect(() => { correctCountRef.current = correctCount; }, [correctCount]);

  // Lesson complete handler
  const handleLessonComplete = useCallback(async (lastWasCorrect) => {
    const totalCount = exercises.length;
    const finalCorrect = correctCountRef.current + (lastWasCorrect ? 1 : 0);
    const acc = ((finalCorrect) / totalCount) * 100;
    const stars = calculateStars(acc);
    const xp = calculateXP(stars);

    try {
      await curriculum.completeLesson(lessonId, stars, acc);
    } catch (err) {
      console.error('Failed to save lesson progress:', err);
    }

    playComplete && playComplete();
    setPhase('complete');
  }, [exercises.length, lessonId, curriculum]);

  // Cleanup speech and timers on unmount
  useEffect(() => {
    return () => {
      stopSpeaking && stopSpeaking();
      exerciseTimersRef.current.forEach(clearTimeout);
    };
  }, [stopSpeaking]);

  // Calculate final stats for complete screen (use same formula as handleLessonComplete)
  const totalCount = exercises.length;
  const finalAccuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
  const finalStars = calculateStars(finalAccuracy);
  const finalXP = calculateXP(finalStars);

  // Collect unique words learned
  const wordsLearned = answers
    .filter(a => a.wordData)
    .reduce((acc, a) => {
      if (!acc.find(w => w.word === a.wordData.word)) {
        acc.push(a.wordData);
      }
      return acc;
    }, []);

  const lessonTypeInfo = lessonData?.lesson
    ? LESSON_TYPES[lessonData.lesson.type] || LESSON_TYPES.mixed
    : LESSON_TYPES.mixed;

  const lessonTitle = lessonData?.lesson
    ? (uiLang === 'he' ? lessonData.lesson.titleHe : lessonData.lesson.titleEn) || lessonData.lesson.titleEn || ''
    : '';

  // ── Intro Phase ──
  if (phase === 'intro') {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
      }}>
        {/* Teacher character - centered, normal size */}
        <div style={{ animation: 'teacher-float 3s ease-in-out infinite', marginBottom: 24 }}>
          <TeacherCharacter state="talking" size="normal" />
        </div>

        {/* Lesson type icon + title */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          background: 'white', padding: '10px 20px', borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 24 }}>{lessonTypeInfo.icon}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: lessonTypeInfo.color }}>
            {uiLang === 'he' ? lessonTypeInfo.nameHe : lessonTypeInfo.nameEn}
          </span>
        </div>

        <div style={{
          fontSize: 24, fontWeight: 800, color: '#374151', textAlign: 'center',
          marginBottom: 8, maxWidth: 300,
        }}>
          {lessonTitle}
        </div>

        {/* Lesson type description */}
        <div style={{
          fontSize: 15, color: '#6B7280', marginBottom: 12, textAlign: 'center',
          maxWidth: 280, lineHeight: 1.5,
          direction: uiLang === 'he' ? 'rtl' : 'ltr',
        }}>
          {lessonData?.lesson?.type === 'speaking' ? t('introSpeakingDesc', uiLang) :
           lessonData?.lesson?.type === 'vocabulary' ? t('introVocabDesc', uiLang) :
           lessonData?.lesson?.type === 'reading' ? t('introReadingDesc', uiLang) :
           lessonData?.lesson?.type === 'writing' ? t('introWritingDesc', uiLang) :
           lessonData?.lesson?.type === 'test' ? t('introTestDesc', uiLang) :
           t('introMixedDesc', uiLang)}
        </div>

        <div style={{
          fontSize: 14, color: '#9CA3AF', marginBottom: 32,
          background: 'white', padding: '8px 16px', borderRadius: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          {exercises.length} {t('exercisesCount', uiLang)}
        </div>

        {/* Ready button */}
        <button
          onClick={handleStartLesson}
          style={{
            padding: '16px 48px', borderRadius: 20, fontSize: 20, fontWeight: 800,
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(255,107,107,0.35), 0 3px 0 #E5533A',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s',
            minHeight: 56,
          }}
        >
          {t('letsStart', uiLang)}
        </button>

        {/* Back button */}
        <button
          onClick={() => { stopSpeaking && stopSpeaking(); onBack(); }}
          style={{
            marginTop: 16, padding: '10px 20px', borderRadius: 12,
            fontSize: 14, fontWeight: 600, background: 'transparent',
            color: '#9CA3AF', border: 'none', cursor: 'pointer',
          }}
        >
          {t('back', uiLang)}
        </button>
      </div>
    );
  }

  // ── Complete Phase ──
  if (phase === 'complete') {
    return (
      <LessonCompleteScreen
        stars={finalStars}
        accuracy={finalAccuracy}
        correctCount={correctCount}
        totalCount={totalCount}
        xpEarned={finalXP}
        wordsLearned={wordsLearned}
        onNext={() => onComplete && onComplete({ stars: finalStars, accuracy: finalAccuracy, xp: finalXP })}
        onHome={onBack}
        onRetry={finalStars === 0 ? () => {
          spokenRef.current = false;
          setPhase('intro');
          setCurrentExercise(0);
          setCorrectCount(0);
          setWrongCount(0);
          setAnswers([]);
          setHearts(3);
          setStreak(0);
          setTeacherState('idle');
          if (lessonData) {
            setExercises(generateExercises(lessonData.unit, lessonData.lesson));
          }
        } : null}
        uiLang={uiLang}
        lessonType={lessonData?.lesson?.type}
        speak={speak}
      />
    );
  }

  // ── Exercise Phase ──
  const exercise = exercises[currentExercise];
  const progress = totalCount > 0 ? ((currentExercise) / totalCount) * 100 : 0;
  const isLastExercise = currentExercise === exercises.length - 1;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
      background: '#FAFAFA',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top Bar: Back + Progress + Hearts */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px 16px',
        background: 'white', borderBottom: '1px solid #F3F4F6',
        position: 'relative', zIndex: 10,
      }}>
        <button
          onClick={() => { stopSpeaking && stopSpeaking(); onBack(); }}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: '#F3F4F6', fontSize: 16, fontWeight: 700,
            color: '#9CA3AF', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {'\u2715'}
        </button>

        <div style={{
          flex: 1, height: 10, background: '#E5E7EB', borderRadius: 5,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 5,
            background: 'linear-gradient(90deg, #FF6B6B, #0EA5E9)',
            width: `${progress}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>

        <span style={{ fontSize: 13, fontWeight: 600, color: '#9CA3AF', flexShrink: 0 }}>
          {currentExercise + 1}/{totalCount}
        </span>

        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {[1, 2, 3].map(h => (
            <span key={h} style={{
              fontSize: 18,
              opacity: h <= hearts ? 1 : 0.25,
              transition: 'all 0.3s',
              transform: h <= hearts ? 'scale(1)' : 'scale(0.8)',
            }}>
              {'\u2764\uFE0F'}
            </span>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        overflow: 'auto', position: 'relative',
      }}>
        {/* Teacher character with speech bubble */}
        <div style={{
          position: 'absolute', top: 8, right: 12, zIndex: 5,
          transition: 'all 0.3s',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <TeacherCharacter state={teacherState} size="small" />
          {teacherState !== 'idle' && (
            <div style={{
              marginTop: 2, padding: '3px 8px', borderRadius: 8,
              background: teacherState === 'encouraging' ? '#FEF3C7' : '#D1FAE5',
              fontSize: 11, fontWeight: 700,
              color: teacherState === 'encouraging' ? '#92400E' : '#065F46',
              animation: 'curriculum-fade-in 0.3s ease',
              whiteSpace: 'nowrap',
            }}>
              {teacherState === 'happy' ? t('teacherEncourage1', uiLang) :
               teacherState === 'celebrating' ? t('teacherEncourage3', uiLang) :
               t('teacherWrong', uiLang)}
            </div>
          )}
        </div>

        {/* Last exercise indicator */}
        {isLastExercise && (
          <div style={{
            textAlign: 'center', padding: '8px 0', fontSize: 13,
            fontWeight: 700, color: '#FF6B6B',
            animation: 'curriculum-fade-in 0.5s ease',
          }}>
            {t('lastExercise', uiLang)}
          </div>
        )}

        {/* Streak display */}
        {streak >= 3 && (
          <div style={{
            textAlign: 'center', padding: '4px 0', fontSize: 13,
            fontWeight: 700, color: '#F59E0B',
            animation: 'curriculum-fade-in 0.3s ease',
          }}>
            {'\uD83D\uDD25'} {streak} {t('streakMessage', uiLang)}
          </div>
        )}

        {/* Exercise renderer */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '20px 20px 32px',
        }}>
          {exercise && (
            <CurriculumExerciseRenderer
              key={`${exercise.lessonId}-${exercise.index}-${currentExercise}`}
              exercise={exercise}
              onAnswer={handleAnswer}
              uiLang={uiLang}
              speak={speak}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes curriculum-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes teacher-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes teacher-jelly {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1, 0.9); }
          50% { transform: scale(0.9, 1.1); }
          75% { transform: scale(1.05, 0.95); }
        }
        @keyframes teacher-sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes teacher-wave-left {
          from { transform: rotate(0deg); }
          to { transform: rotate(-25deg); }
        }
        @keyframes teacher-wave-right {
          from { transform: rotate(0deg); }
          to { transform: rotate(25deg); }
        }
        @keyframes teacher-think-dot {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
