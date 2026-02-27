import React, { useState, useEffect } from 'react';
import { X, Heart, Volume2, Check, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t } from '../utils/translations.js';
import { calcLessonXP } from '../utils/xpCalculator.js';
import { fuzzyMatch } from '../utils/stringDistance.js';
import { shuffle } from '../utils/shuffle.js';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import useAudio from '../hooks/useAudio.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import AnimatedButton from '../components/shared/AnimatedButton.jsx';
import ConfettiExplosion from '../components/shared/ConfettiExplosion.jsx';

function MultipleChoice({ exercise, onAnswer, uiLang }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const check = () => {
    setAnswered(true);
    onAnswer(selected === exercise.correct);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{exercise.question}</h3>
      {exercise.questionHe && uiLang === 'he' && (
        <p className="text-sm text-gray-500 dark:text-gray-400" dir="rtl">{exercise.questionHe}</p>
      )}
      <div className="space-y-2">
        {exercise.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => !answered && setSelected(i)}
            className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all ${
              answered
                ? i === exercise.correct
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                  : i === selected
                    ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-800 dark:text-red-300'
                    : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent text-gray-500'
                : selected === i
                  ? 'bg-brand-50 dark:bg-brand-900/30 border-2 border-brand-500 text-brand-800 dark:text-brand-300'
                  : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {!answered && (
        <AnimatedButton onClick={check} disabled={selected === null} size="full">
          {t('check', uiLang)}
        </AnimatedButton>
      )}
    </div>
  );
}

function FillInBlank({ exercise, onAnswer, uiLang, speak }) {
  const [input, setInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const check = () => {
    const isCorrect = fuzzyMatch(exercise.answer, input) ||
      (exercise.alternatives || []).some(alt => fuzzyMatch(alt, input));
    setCorrect(isCorrect);
    setAnswered(true);
    if (isCorrect && speak) {
      speak(exercise.answer, { rate: 0.85, onEnd: () => {
        const fullSentence = exercise.sentence.replace('___', exercise.answer);
        speak(fullSentence, { rate: 0.9, _queued: true });
      }});
    }
    onAnswer(isCorrect);
  };

  const parts = exercise.sentence.split('___');

  return (
    <div className="space-y-4">
      <div className="text-lg font-medium text-gray-900 dark:text-white">
        {parts[0]}
        <span className={`inline-block min-w-[80px] border-b-2 mx-1 ${
          answered ? (correct ? 'border-emerald-500' : 'border-red-500') : 'border-brand-500'
        }`}>
          {answered ? (
            <span className={correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
              {input || '___'}
            </span>
          ) : null}
        </span>
        {parts[1]}
      </div>
      {exercise.hint && <p className="text-sm text-gray-500 dark:text-gray-400" dir={uiLang === 'he' ? 'rtl' : 'ltr'}>💡 {exercise.hint}</p>}
      {!answered && (
        <>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && input.trim() && check()}
              placeholder="..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-center text-lg"
              autoFocus
            />
            {!showHelp && (
              <button
                onClick={() => { setShowHelp(true); if (speak) speak(exercise.answer, { rate: 0.7 }); }}
                className="px-3 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 text-amber-600 font-medium text-sm whitespace-nowrap"
              >
                💡 {t('hint', uiLang)}
              </button>
            )}
          </div>
          {showHelp && (
            <p className="text-sm text-amber-600 dark:text-amber-400 text-center font-medium">
              {uiLang === 'he' ? 'מתחיל ב:' : 'Starts with:'} "{exercise.answer[0]}..."
            </p>
          )}
          <AnimatedButton onClick={check} disabled={!input.trim()} size="full">
            {t('check', uiLang)}
          </AnimatedButton>
        </>
      )}
      {answered && !correct && (
        <p className="text-sm text-center">
          <span className="text-gray-500">{t('correct', uiLang).replace('!', ':')} </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{exercise.answer}</span>
        </p>
      )}
    </div>
  );
}

function WordArrange({ exercise, onAnswer }) {
  const [selected, setSelected] = useState([]);
  const [available, setAvailable] = useState(() => shuffle(exercise.words));
  const [answered, setAnswered] = useState(false);

  const addWord = (word, i) => {
    setSelected([...selected, word]);
    setAvailable(available.filter((_, idx) => idx !== i));
  };

  const removeWord = (word, i) => {
    setAvailable([...available, word]);
    setSelected(selected.filter((_, idx) => idx !== i));
  };

  const check = () => {
    const isCorrect = selected.join(' ') === exercise.correct;
    setAnswered(true);
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-4">
      {exercise.translation && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{exercise.translation}</p>
      )}
      <div className="min-h-[60px] p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-wrap gap-2">
        {selected.map((word, i) => (
          <button
            key={`${word}-${i}`}
            onClick={() => !answered && removeWord(word, i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              answered
                ? selected.join(' ') === exercise.correct
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
            }`}
          >
            {word}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {available.map((word, i) => (
          <button
            key={`${word}-${i}`}
            onClick={() => !answered && addWord(word, i)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            {word}
          </button>
        ))}
      </div>
      {!answered && selected.length > 0 && (
        <AnimatedButton onClick={check} size="full">{t('check', uiLang)}</AnimatedButton>
      )}
      {answered && selected.join(' ') !== exercise.correct && (
        <p className="text-sm text-center text-emerald-600 dark:text-emerald-400 font-medium">{exercise.correct}</p>
      )}
    </div>
  );
}

function TranslationExercise({ exercise, onAnswer, uiLang, speak }) {
  const [input, setInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const check = () => {
    const isCorrect = fuzzyMatch(exercise.target, input, 0.75) ||
      (exercise.alternatives || []).some(alt => fuzzyMatch(alt, input, 0.75));
    setCorrect(isCorrect);
    setAnswered(true);
    if (isCorrect && speak) {
      speak(exercise.target, { rate: 0.9 });
    }
    onAnswer(isCorrect);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t('translate', uiLang)}:</p>
      <div className="text-center">
        <span className="text-xl font-bold text-gray-900 dark:text-white">{exercise.source}</span>
      </div>
      {!answered && (
        <>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && input.trim() && check()}
              placeholder="Type in English..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-center"
              autoFocus
            />
            {!showHelp && (
              <button
                onClick={() => { setShowHelp(true); if (speak) speak(exercise.target, { rate: 0.7 }); }}
                className="px-3 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 text-amber-600 font-medium text-sm whitespace-nowrap"
              >
                💡 {t('hint', uiLang)}
              </button>
            )}
          </div>
          {showHelp && (
            <p className="text-sm text-amber-600 dark:text-amber-400 text-center font-medium">
              {uiLang === 'he' ? 'מתחיל ב:' : 'Starts with:'} "{exercise.target.substring(0, 2)}..."
            </p>
          )}
          <AnimatedButton onClick={check} disabled={!input.trim()} size="full">{t('check', uiLang)}</AnimatedButton>
        </>
      )}
      {answered && (
        <div className="text-center">
          <p className={`font-medium ${correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {input}
          </p>
          {!correct && <p className="text-sm text-gray-500 mt-1">Answer: <span className="font-bold text-emerald-600">{exercise.target}</span></p>}
        </div>
      )}
    </div>
  );
}

function MatchPairs({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState(null);
  const pairs = exercise.pairs;

  const leftItems = pairs.map(p => p[0]);
  const rightItems = shuffle(pairs.map(p => p[1]));

  const handleTap = (side, item) => {
    if (matched.includes(item)) return;

    if (!selected) {
      setSelected({ side, item });
      return;
    }

    if (selected.side === side) {
      setSelected({ side, item });
      return;
    }

    // Check if match
    const pair = selected.side === 'left'
      ? pairs.find(p => p[0] === selected.item && p[1] === item)
      : pairs.find(p => p[1] === selected.item && p[0] === item);

    if (pair) {
      setMatched([...matched, pair[0], pair[1]]);
      setSelected(null);
      if (matched.length + 2 >= pairs.length * 2) {
        onAnswer(true);
      }
    } else {
      setWrong([selected.item, item]);
      setTimeout(() => { setWrong(null); setSelected(null); }, 600);
    }
  };

  const getItemClass = (item) => {
    if (matched.includes(item)) return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 text-emerald-700 opacity-60';
    if (wrong?.includes(item)) return 'bg-red-100 dark:bg-red-900/30 border-red-300 text-red-700 animate-shake';
    if (selected?.item === item) return 'bg-brand-100 dark:bg-brand-900/30 border-brand-500 text-brand-700';
    return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {leftItems.map((item, i) => (
            <button key={i} onClick={() => handleTap('left', item)}
              className={`w-full p-3 rounded-xl border-2 text-sm font-medium transition-all ${getItemClass(item)}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map((item, i) => (
            <button key={i} onClick={() => handleTap('right', item)}
              className={`w-full p-3 rounded-xl border-2 text-sm font-medium transition-all ${getItemClass(item)}`}>
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListeningExercise({ exercise, onAnswer, speak, uiLang }) {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => speak(exercise.text), 300);
    return () => clearTimeout(t);
  }, []);

  const check = () => {
    setAnswered(true);
    onAnswer(selected === exercise.correct);
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <button onClick={() => speak(exercise.text)} className="p-4 rounded-full bg-brand-100 dark:bg-brand-900/30 mx-auto hover:bg-brand-200 transition-colors">
          <Volume2 size={32} className="text-brand-600" />
        </button>
        <p className="text-sm text-gray-500 mt-2">{t('listen', uiLang)}</p>
      </div>
      <div className="space-y-2">
        {exercise.options.map((opt, i) => (
          <button key={i} onClick={() => !answered && setSelected(i)}
            className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all border-2 ${
              answered
                ? i === exercise.correct ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : i === selected ? 'bg-red-100 border-red-500 text-red-800' : 'bg-gray-50 border-transparent text-gray-500'
                : selected === i ? 'bg-brand-50 border-brand-500 text-brand-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
            {opt}
          </button>
        ))}
      </div>
      {!answered && <AnimatedButton onClick={check} disabled={selected === null} size="full">{t('check', uiLang)}</AnimatedButton>}
    </div>
  );
}

function ExerciseFeedback({ correct, explanation, onContinue }) {
  const { uiLang } = useTheme();
  return (
    <div className={`animate-slide-up p-4 rounded-xl ${
      correct ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {correct ? <Check size={20} className="text-emerald-600" /> : <X size={20} className="text-red-600" />}
        <span className={`font-bold ${correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
          {correct ? t('correct', uiLang) : t('incorrect', uiLang)}
        </span>
      </div>
      {explanation && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{explanation}</p>}
      <AnimatedButton onClick={onContinue} variant={correct ? 'success' : 'primary'} size="full">
        {t('continue', uiLang)}
      </AnimatedButton>
    </div>
  );
}

export default function LessonPage({ lesson, onComplete, onBack }) {
  const { uiLang } = useTheme();
  const { addXP } = useUserProgress();
  const { speak } = useSpeechSynthesis();
  const { playCorrect, playWrong } = useAudio();

  // Use a default lesson if none provided
  const exercises = lesson?.exercises || [
    { type: 'multiple-choice', question: 'What is the English word for "שלום"?', questionHe: 'מהי המילה באנגלית ל-"שלום"?', options: ['Hello', 'Goodbye', 'Please', 'Thank you'], correct: 0, explanation: uiLang === 'he' ? '"Hello" = שלום. זוהי הברכה הנפוצה ביותר באנגלית.' : '"Hello" means "שלום" in Hebrew - the most common English greeting.' },
    { type: 'fill-blank', sentence: 'Nice to ___ you.', answer: 'meet', hint: uiLang === 'he' ? 'ברכה כשפוגשים מישהו חדש (נעים להכיר)' : 'A greeting when meeting someone new', alternatives: ['meet'] },
    { type: 'word-arrange', words: ['are', 'How', 'you', '?'], correct: 'How are you ?', translation: 'מה שלומך?' },
    { type: 'translation', source: 'תודה רבה', target: 'Thank you very much', alternatives: ['Thanks a lot', 'Thank you so much'] },
    { type: 'match-pairs', pairs: [['Hello', 'שלום'], ['Goodbye', 'להתראות'], ['Please', 'בבקשה'], ['Thank you', 'תודה']] },
    { type: 'multiple-choice', question: 'Choose the correct greeting for the morning:', questionHe: 'בחר את הברכה הנכונה לבוקר:', options: ['Good morning', 'Good evening', 'Good night', 'Goodbye'], correct: 0, explanation: uiLang === 'he' ? 'Good morning = בוקר טוב. משתמשים בברכה הזו עד הצהריים.' : 'Good morning is used until around noon.' },
    { type: 'fill-blank', sentence: 'My ___ is David.', answer: 'name', hint: uiLang === 'he' ? 'כשמציגים את עצמנו - "השם שלי הוא..."' : 'When introducing yourself - "My ... is"' },
    { type: 'listening', text: 'Where are you from?', options: ['Where are you from?', 'How old are you?', 'What is your name?', 'Where do you live?'], correct: 0 },
  ];

  const [currentExercise, setCurrentExercise] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(null);
  const [lessonDone, setLessonDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const exercise = exercises[currentExercise];
  const progress = ((currentExercise) / exercises.length) * 100;

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      playCorrect();
      setCorrectCount(c => c + 1);
    } else {
      playWrong();
      setHearts(h => h - 1);
    }
    setShowFeedback({ correct: isCorrect, explanation: exercise.explanation });
  };

  const handleContinue = () => {
    setShowFeedback(null);

    if (hearts <= 0) {
      // Lesson failed
      setLessonDone(true);
      return;
    }

    if (currentExercise + 1 >= exercises.length) {
      // Lesson complete
      const accuracy = Math.round((correctCount / exercises.length) * 100);
      const xp = calcLessonXP(accuracy, exercises.length);
      addXP(xp.total, 'lesson');

      if (accuracy === 100) setShowConfetti(true);
      setLessonDone(true);
    } else {
      setCurrentExercise(currentExercise + 1);
    }
  };

  if (lessonDone) {
    const accuracy = Math.round((correctCount / exercises.length) * 100);
    const xp = calcLessonXP(accuracy, exercises.length);
    const failed = hearts <= 0;

    return (
      <div className="pb-24 px-4 pt-8 flex flex-col items-center justify-center min-h-[70vh]">
        <ConfettiExplosion trigger={showConfetti} />
        <span className="text-6xl mb-4">{failed ? '💔' : accuracy === 100 ? '🎉' : '✅'}</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {failed ? (uiLang === 'he' ? 'נגמרו הלבבות' : 'Out of Hearts') : t('lessonComplete', uiLang)}
        </h1>
        {!failed && (
          <div className="space-y-3 text-center mt-4">
            <div className="flex items-center justify-center gap-6">
              <div>
                <p className="text-3xl font-bold gradient-text">{accuracy}%</p>
                <p className="text-xs text-gray-500">{t('accuracy', uiLang)}</p>
              </div>
              <div>
                <p className="text-3xl font-bold gradient-text-gold">+{xp.total}</p>
                <p className="text-xs text-gray-500">{t('xpEarned', uiLang)}</p>
              </div>
            </div>
            {accuracy === 100 && (
              <p className="text-lg font-bold gradient-text-gold">{t('perfectLesson', uiLang)}</p>
            )}
          </div>
        )}
        <div className="flex gap-3 mt-8">
          {failed && (
            <AnimatedButton onClick={() => { setCurrentExercise(0); setHearts(3); setCorrectCount(0); setLessonDone(false); }} variant="secondary">
              {t('tryAgain', uiLang)}
            </AnimatedButton>
          )}
          <AnimatedButton onClick={onComplete || onBack} variant="primary">
            {t('continue', uiLang)}
          </AnimatedButton>
        </div>
      </div>
    );
  }

  const renderExercise = () => {
    switch (exercise.type) {
      case 'multiple-choice': return <MultipleChoice exercise={exercise} onAnswer={handleAnswer} uiLang={uiLang} />;
      case 'fill-blank': return <FillInBlank exercise={exercise} onAnswer={handleAnswer} uiLang={uiLang} speak={speak} />;
      case 'word-arrange': return <WordArrange exercise={exercise} onAnswer={handleAnswer} />;
      case 'translation': return <TranslationExercise exercise={exercise} onAnswer={handleAnswer} uiLang={uiLang} speak={speak} />;
      case 'match-pairs': return <MatchPairs exercise={exercise} onAnswer={handleAnswer} />;
      case 'listening': return <ListeningExercise exercise={exercise} onAnswer={handleAnswer} speak={speak} uiLang={uiLang} />;
      default: return <MultipleChoice exercise={exercise} onAnswer={handleAnswer} uiLang={uiLang} />;
    }
  };

  return (
    <div className="pb-24 px-4 pt-4 space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <X size={22} className="text-gray-500" />
        </button>
        <div className="flex-1 progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-0.5">
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              size={18}
              className={i < hearts ? 'text-red-500' : 'text-gray-300 dark:text-gray-600'}
              fill={i < hearts ? 'currentColor' : 'none'}
            />
          ))}
        </div>
      </div>

      {/* Exercise */}
      <GlassCard variant="strong" className="min-h-[200px]">
        {showFeedback ? (
          <ExerciseFeedback {...showFeedback} onContinue={handleContinue} />
        ) : (
          <div key={currentExercise} className="animate-fade-in">
            {renderExercise()}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
