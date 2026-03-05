import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, RefreshCw, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t } from '../utils/translations.js';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import { stopAllAudio } from '../utils/hebrewAudio.js';
import { pronunciationScore, compareWords } from '../utils/stringDistance.js';
import GlassCard from '../components/shared/GlassCard.jsx';
import AnimatedButton from '../components/shared/AnimatedButton.jsx';
import KidsIntro from '../components/kids/KidsIntro.jsx';

const PRACTICE_SENTENCES = [
  { text: "Hello, how are you?", level: "A1", translation: "שלום, מה שלומך?", translationAr: "مرحباً، كيف حالك؟", translationRu: "Привет, как дела?" },
  { text: "My name is", level: "A1", translation: "שמי הוא", translationAr: "اسمي هو", translationRu: "Меня зовут" },
  { text: "Nice to meet you", level: "A1", translation: "נעים להכיר", translationAr: "يسعدني لقاؤك", translationRu: "Приятно познакомиться" },
  { text: "Where is the bus stop?", level: "A1", translation: "איפה תחנת האוטובוס?", translationAr: "أين محطة الحافلة؟", translationRu: "Где автобусная остановка?" },
  { text: "I would like a cup of coffee", level: "A2", translation: "הייתי רוצה כוס קפה", translationAr: "أريد فنجان قهوة", translationRu: "Я бы хотел чашку кофе" },
  { text: "Can you help me please?", level: "A1", translation: "אתה יכול לעזור לי בבקשה?", translationAr: "هل يمكنك مساعدتي من فضلك؟", translationRu: "Вы можете мне помочь, пожалуйста?" },
  { text: "The weather is beautiful today", level: "A2", translation: "מזג האוויר יפה היום", translationAr: "الطقس جميل اليوم", translationRu: "Сегодня прекрасная погода" },
  { text: "I need to go to the airport", level: "A2", translation: "אני צריך להגיע לשדה התעופה", translationAr: "أحتاج إلى الذهاب إلى المطار", translationRu: "Мне нужно ехать в аэропорт" },
  { text: "What time does the meeting start?", level: "B1", translation: "באיזו שעה מתחילה הפגישה?", translationAr: "في أي ساعة تبدأ الاجتماع؟", translationRu: "В котором часу начинается встреча?" },
  { text: "I have been studying English for two years", level: "B1", translation: "אני לומד אנגלית כבר שנתיים", translationAr: "أدرس الإنجليزية منذ سنتين", translationRu: "Я изучаю английский уже два года" },
  { text: "Could you recommend a good restaurant?", level: "B1", translation: "אתה יכול להמליץ על מסעדה טובה?", translationAr: "هل يمكنك أن توصي بمطعم جيد؟", translationRu: "Не могли бы вы порекомендовать хороший ресторан?" },
  { text: "I completely agree with your point of view", level: "B2", translation: "אני מסכים לחלוטין עם נקודת המבט שלך", translationAr: "أوافقك الرأي تماماً", translationRu: "Я полностью согласен с вашей точкой зрения" },
  { text: "The presentation went better than expected", level: "B2", translation: "המצגת הלכה טוב מהצפוי", translationAr: "سارت العرض التقديمي أفضل مما كان متوقعاً", translationRu: "Презентация прошла лучше, чем ожидалось" },
  { text: "I would have called you if I had known", level: "B2", translation: "הייתי מתקשר אליך אם הייתי יודע", translationAr: "كنت سأتصل بك لو كنت أعلم", translationRu: "Я бы позвонил тебе, если бы знал" },
];

function WaveformVisualizer({ isActive }) {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            isActive ? 'bg-brand-500 waveform-bar' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          style={{
            height: isActive ? `${20 + Math.random() * 20}px` : '8px',
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

function ScoreDisplay({ score }) {
  const size = 120;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getLabel = (uiLang) => {
    if (score >= 90) return t('excellent', uiLang);
    if (score >= 70) return t('great', uiLang);
    if (score >= 50) return t('good_score', uiLang);
    return t('needsPractice', uiLang);
  };

  const { uiLang } = useTheme();

  return (
    <div className="flex flex-col items-center animate-bounce-in">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={10} className="text-gray-200 dark:text-gray-700" />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={getColor()} strokeWidth={10} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: getColor() }}>{score}</span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <p className="mt-2 font-bold text-lg" style={{ color: getColor() }}>{getLabel(uiLang)}</p>
    </div>
  );
}

function WordComparison({ results }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {results.map((r, i) => (
        <span
          key={i}
          className={`px-2 py-1 rounded-lg text-sm font-medium ${
            r.status === 'correct' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
            r.status === 'close' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
            r.status === 'missing' ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 line-through' :
            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}
        >
          {r.word}
        </span>
      ))}
    </div>
  );
}

export default function PronunciationPage() {
  const { uiLang } = useTheme();
  const { addXP, progress } = useUserProgress();
  const { speak } = useSpeechSynthesis();
  const { transcript, confidence, isListening, startListening, stopListening, sttSupported: supported } = useSpeechRecognition();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(null);
  const [wordResults, setWordResults] = useState(null);
  const [hasRecorded, setHasRecorded] = useState(false);

  // Stop all audio on unmount
  useEffect(() => () => stopAllAudio(), []);

  const sentence = PRACTICE_SENTENCES[currentIndex];

  const xpAwardedRef = useRef(false);
  useEffect(() => {
    if (transcript && !isListening && hasRecorded) {
      const s = pronunciationScore(sentence.text, transcript, confidence);
      setScore(s);
      setWordResults(compareWords(sentence.text, transcript));
      if (s >= 50 && !xpAwardedRef.current) {
        xpAwardedRef.current = true;
        addXP(3, 'pronunciation');
      }
    }
  }, [transcript, isListening, hasRecorded, sentence.text, confidence, addXP]);

  const handleRecord = () => {
    if (isListening) {
      stopListening();
    } else {
      setScore(null);
      setWordResults(null);
      setHasRecorded(true);
      startListening();
    }
  };

  const nextSentence = () => {
    setCurrentIndex(prev => (prev + 1) % PRACTICE_SENTENCES.length);
    setScore(null);
    setWordResults(null);
    setHasRecorded(false);
    xpAwardedRef.current = false;
  };

  if (!supported) {
    return (
      <div className="pb-24 px-4 pt-4 flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-5xl mb-4">🎤</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t('speechNotSupported', uiLang)}
        </h2>
        <p className="text-sm text-gray-500 text-center">
          {t('tryChromeDesktop', uiLang)}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 space-y-6">
      <KidsIntro
        id="pronunciation-v1"
        name={progress.displayName}
        emoji="🎤"
        title="Talk with Speakli!"
        titleHe="דברו עם ספיקלי!"
        titleAr="تحدث مع سبيكلي!"
        titleRu="Говори со Спикли!"
        desc="Hi! Let's practice speaking English together! Listen and repeat after me!"
        descHe="היי! בואו נתרגל לדבר אנגלית ביחד! הקשיבו וחזרו אחריי!"
        descAr="مرحباً! دعونا نتدرب على التحدث بالإنجليزية معاً! استمع وكرر بعدي!"
        descRu="Привет! Давайте тренируем английский вместе! Слушай и повторяй за мной!"
        uiLang={uiLang}
        gradient="from-amber-500 via-orange-500 to-red-500"
        buttonLabel="Let's talk!"
        buttonLabelHe="בואו נדבר!"
        buttonLabelAr="هيا نتحدث!"
        buttonLabelRu="Давай поговорим!"
      />

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{currentIndex + 1} / {PRACTICE_SENTENCES.length}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          sentence.level === 'A1' ? 'bg-green-100 text-green-700' :
          sentence.level === 'A2' ? 'bg-blue-100 text-blue-700' :
          sentence.level === 'B1' ? 'bg-purple-100 text-purple-700' :
          'bg-orange-100 text-orange-700'
        }`}>
          {sentence.level}
        </span>
      </div>

      {/* Target Sentence */}
      <GlassCard variant="strong" className="text-center py-6">
        <button
          onClick={() => speak(sentence.text)}
          className="mx-auto mb-3 p-3 rounded-full bg-brand-100 dark:bg-brand-900/30 hover:bg-brand-200 dark:hover:bg-brand-800/40 transition-colors"
        >
          <Volume2 size={24} className="text-brand-600 dark:text-brand-400" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{sentence.text}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{sentence.translation}</p>
      </GlassCard>

      {/* Waveform */}
      <WaveformVisualizer isActive={isListening} />

      {/* Record Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRecord}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            isListening
              ? 'bg-red-500 shadow-lg shadow-red-500/30 recording-pulse'
              : 'bg-brand-500 shadow-lg shadow-brand-500/30 hover:bg-brand-600'
          }`}
        >
          {isListening ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
        </button>
      </div>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {isListening ? t('recording', uiLang) : t('tapToRecord', uiLang)}
      </p>

      {/* Transcript */}
      {transcript && !isListening && (
        <GlassCard className="text-center animate-slide-up">
          <p className="text-sm text-gray-500 mb-1">{t('youSaid', uiLang)}</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">{transcript}</p>
        </GlassCard>
      )}

      {/* Word Comparison */}
      {wordResults && (
        <div className="animate-slide-up">
          <WordComparison results={wordResults} />
        </div>
      )}

      {/* Score */}
      {score !== null && (
        <div className="space-y-4 animate-slide-up">
          <ScoreDisplay score={score} />
          <div className="flex gap-3 justify-center">
            <AnimatedButton onClick={handleRecord} variant="secondary" icon={RefreshCw}>
              {t('tryAgainPronunciation', uiLang)}
            </AnimatedButton>
            <AnimatedButton onClick={nextSentence} variant="primary">
              {t('next', uiLang)}
            </AnimatedButton>
          </div>
        </div>
      )}
    </div>
  );
}
