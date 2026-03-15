import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, RefreshCw, ArrowLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t, lf, RTL_LANGS } from '../utils/translations.js';
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

// Teacher guidance messages per language — KIDS
const TEACHER_MSGS = {
  he: {
    letsLearn: 'עכשיו נתרגל להגיד משפט חדש באנגלית! הקשיבו טוב',
    thisMeans: 'בעברית זה אומר:',
    yourTurn: 'עכשיו תורכם! לחצו על המיקרופון ותגידו את המשפט',
    perfect: 'מצוין! אמרתם את זה מושלם!',
    great: 'כל הכבוד! כמעט מושלם!',
    good: 'יפה! אבל יש כמה מילים שצריך לתרגל',
    needsWork: 'בואו ננסה שוב! אני אעזור לכם',
    wordCorrect: 'מילה טובה!',
    wordClose: 'כמעט נכון, נסו לבטא יותר ברור',
    wordMissing: 'חסרה מילה, נסו להגיד גם את',
    wordWrong: 'המילה הזאת צריכה תרגול, תקשיבו איך אומרים',
    listenAgain: 'תקשיבו שוב איך אומרים את זה',
    tryAgain: 'בואו ננסה עוד פעם! אתם יכולים!',
  },
  ar: {
    letsLearn: 'الآن سنتدرب على قول جملة جديدة بالإنجليزية! استمعوا جيداً',
    thisMeans: 'بالعربية تعني:',
    yourTurn: 'الآن دوركم! اضغطوا على الميكروفون وقولوا الجملة',
    perfect: 'ممتاز! قلتموها بشكل مثالي!',
    great: 'أحسنتم! تقريباً مثالي!',
    good: 'جيد! لكن هناك بعض الكلمات تحتاج تمرين',
    needsWork: 'هيا نحاول مرة أخرى! سأساعدكم',
    listenAgain: 'استمعوا مرة أخرى كيف نقولها',
    tryAgain: 'هيا نحاول مرة أخرى! أنتم تستطيعون!',
  },
  ru: {
    letsLearn: 'Сейчас потренируемся говорить новое предложение по-английски! Слушайте внимательно',
    thisMeans: 'По-русски это значит:',
    yourTurn: 'Теперь ваша очередь! Нажмите на микрофон и скажите предложение',
    perfect: 'Отлично! Вы сказали это идеально!',
    great: 'Молодцы! Почти идеально!',
    good: 'Хорошо! Но некоторые слова нужно потренировать',
    needsWork: 'Давайте попробуем ещё раз! Я помогу вам',
    listenAgain: 'Послушайте ещё раз, как это произносится',
    tryAgain: 'Давайте попробуем ещё раз! Вы сможете!',
  },
};

// Teacher guidance messages — ADULTS (professional, concise)
const ADULT_MSGS = {
  he: {
    listen: 'הקשיבו למשפט',
    meaning: 'המשמעות:',
    yourTurn: 'תורכם — לחצו על המיקרופון ואמרו את המשפט',
    perfect: 'מצוין! הגייה מושלמת',
    great: 'טוב מאוד! כמעט מושלם',
    good: 'לא רע, אבל כדאי לשפר כמה מילים',
    needsWork: 'כדאי לנסות שוב, הקשיבו לדוגמה',
    listenAgain: 'הקשיבו שוב',
    tryAgain: 'נסו שוב',
  },
  ar: {
    listen: 'استمع للجملة',
    meaning: 'المعنى:',
    yourTurn: 'دورك — اضغط على الميكروفون وقل الجملة',
    perfect: 'ممتاز! نطق مثالي',
    great: 'جيد جداً! تقريباً مثالي',
    good: 'ليس سيئاً، لكن بعض الكلمات تحتاج تحسين',
    needsWork: 'حاول مرة أخرى، استمع للمثال',
    listenAgain: 'استمع مرة أخرى',
    tryAgain: 'حاول مرة أخرى',
  },
  ru: {
    listen: 'Послушайте предложение',
    meaning: 'Значение:',
    yourTurn: 'Ваша очередь — нажмите на микрофон и произнесите',
    perfect: 'Отлично! Идеальное произношение',
    great: 'Очень хорошо! Почти идеально',
    good: 'Неплохо, но стоит улучшить некоторые слова',
    needsWork: 'Стоит попробовать ещё раз, послушайте пример',
    listenAgain: 'Послушайте ещё раз',
    tryAgain: 'Попробуйте ещё раз',
  },
};

function getTeacherMsg(key, lang) {
  const msgs = TEACHER_MSGS[lang] || TEACHER_MSGS.he;
  return msgs[key] || TEACHER_MSGS.he[key] || '';
}

function getAdultMsg(key, lang) {
  const msgs = ADULT_MSGS[lang] || ADULT_MSGS.he;
  return msgs[key] || ADULT_MSGS.he[key] || '';
}

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

// Teacher feedback bubble
function TeacherBubble({ text, isRTL, variant = 'kids' }) {
  const isAdult = variant === 'adult';
  return (
    <div style={{
      background: isAdult
        ? 'linear-gradient(135deg, #F0F9FF, #E0F2FE)'
        : 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
      border: isAdult ? '2px solid #BAE6FD' : '2px solid #FDE68A',
      borderRadius: isAdult ? 12 : 16,
      padding: '12px 16px',
      marginBottom: 12,
      textAlign: 'center',
      direction: isRTL ? 'rtl' : 'ltr',
      animation: 'curriculum-fade-in 0.4s ease',
    }}>
      <span style={{
        fontSize: isAdult ? 14 : 15,
        fontWeight: isAdult ? 500 : 600,
        color: isAdult ? '#0369A1' : '#92400E',
        lineHeight: 1.6,
      }}>
        {text}
      </span>
    </div>
  );
}

export default function PronunciationPage() {
  const { uiLang } = useTheme();
  const { addXP, progress, updateProgress, isChildMode } = useUserProgress();
  const { speak } = useSpeechSynthesis();
  const { transcript, confidence, isListening, startListening, stopListening, sttSupported: supported } = useSpeechRecognition();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(null);
  const [wordResults, setWordResults] = useState(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  // Teacher guidance phase (kids & adults)
  const [phase, setPhase] = useState('intro'); // 'intro' | 'ready' | 'recording' | 'feedback'
  const [teacherText, setTeacherText] = useState('');
  const teacherTimersRef = useRef([]);

  const isRTL = RTL_LANGS.includes(uiLang);

  // Stop all audio on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      teacherTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  const sentence = PRACTICE_SENTENCES[currentIndex];

  const xpAwardedRef = useRef(false);
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  // Teacher intro sequence when sentence changes (kids & adults)
  useEffect(() => {
    teacherTimersRef.current.forEach(clearTimeout);
    teacherTimersRef.current = [];
    setPhase('intro');

    const translation = lf(sentence, 'translation', uiLang);

    if (isChildMode) {
      // KIDS: full 5-step guided intro
      setTeacherText(getTeacherMsg('letsLearn', uiLang));
      const t1 = setTimeout(() => {
        speak(getTeacherMsg('letsLearn', uiLang), { lang: uiLang, rate: 0.9, onEnd: () => {
          const t2 = setTimeout(() => {
            speak(sentence.text, { lang: 'en', rate: 0.75, onEnd: () => {
              const t3 = setTimeout(() => {
                setTeacherText(`${getTeacherMsg('thisMeans', uiLang)} ${translation}`);
                speak(translation, { lang: uiLang, rate: 0.9, onEnd: () => {
                  const t4 = setTimeout(() => {
                    speak(sentence.text, { lang: 'en', rate: 0.85, onEnd: () => {
                      const t5 = setTimeout(() => {
                        setTeacherText(getTeacherMsg('yourTurn', uiLang));
                        speak(getTeacherMsg('yourTurn', uiLang), { lang: uiLang, rate: 0.9 });
                        setPhase('ready');
                      }, 300);
                      teacherTimersRef.current.push(t5);
                    }});
                  }, 400);
                  teacherTimersRef.current.push(t4);
                }});
              }, 400);
              teacherTimersRef.current.push(t3);
            }});
          }, 400);
          teacherTimersRef.current.push(t2);
        }});
      }, 500);
      teacherTimersRef.current.push(t1);
    } else {
      // ADULTS: streamlined 3-step intro (English sentence → translation → your turn)
      setTeacherText(getAdultMsg('listen', uiLang));
      const t1 = setTimeout(() => {
        speak(sentence.text, { lang: 'en', rate: 0.85, onEnd: () => {
          const t2 = setTimeout(() => {
            setTeacherText(`${getAdultMsg('meaning', uiLang)} ${translation}`);
            speak(translation, { lang: uiLang, rate: 0.95, onEnd: () => {
              const t3 = setTimeout(() => {
                setTeacherText(getAdultMsg('yourTurn', uiLang));
                speak(getAdultMsg('yourTurn', uiLang), { lang: uiLang, rate: 1.0 });
                setPhase('ready');
              }, 250);
              teacherTimersRef.current.push(t3);
            }});
          }, 300);
          teacherTimersRef.current.push(t2);
        }});
      }, 400);
      teacherTimersRef.current.push(t1);
    }
  }, [currentIndex, isChildMode]);

  // Process results after recording
  useEffect(() => {
    if (transcript && !isListening && hasRecorded) {
      const s = pronunciationScore(sentence.text, transcript, confidence);
      setScore(s);
      const results = compareWords(sentence.text, transcript);
      setWordResults(results);

      setPhase('feedback');
      const feedbackTimers = [];
      const getMsgFn = isChildMode ? getTeacherMsg : getAdultMsg;
      let feedbackMsg;
      if (s >= 90) feedbackMsg = getMsgFn('perfect', uiLang);
      else if (s >= 70) feedbackMsg = getMsgFn('great', uiLang);
      else if (s >= 50) feedbackMsg = getMsgFn('good', uiLang);
      else feedbackMsg = getMsgFn('needsWork', uiLang);

      setTeacherText(feedbackMsg);
      const ft1 = setTimeout(() => {
        speak(feedbackMsg, { lang: uiLang, rate: isChildMode ? 0.9 : 1.0, onEnd: () => {
          // For imperfect scores: replay the sentence
          const problemWords = results.filter(r => r.status === 'missing' || r.status === 'wrong' || r.status === 'close');
          if (problemWords.length > 0 && s < 90) {
            const ft2 = setTimeout(() => {
              const listenMsg = getMsgFn('listenAgain', uiLang);
              setTeacherText(listenMsg);
              speak(listenMsg, { lang: uiLang, rate: isChildMode ? 0.9 : 1.0, onEnd: () => {
                const ft3 = setTimeout(() => {
                  speak(sentence.text, { lang: 'en', rate: isChildMode ? 0.7 : 0.8, _queued: true });
                }, 300);
                feedbackTimers.push(ft3);
              }});
            }, isChildMode ? 400 : 300);
            feedbackTimers.push(ft2);
          }
        }});
      }, 500);
      feedbackTimers.push(ft1);
      teacherTimersRef.current.push(...feedbackTimers);

      if (s >= 50 && !xpAwardedRef.current) {
        xpAwardedRef.current = true;
        addXP(3, 'pronunciation');

        const p = progressRef.current;
        const counterUpdates = {
          pronunciationExercises: (p.pronunciationExercises || 0) + 1,
        };
        if (s >= 95) {
          counterUpdates.pronunciationHighScore = Math.max(p.pronunciationHighScore || 0, s);
        }
        if (s >= 80) {
          counterUpdates.pronunciationStreak = (p.pronunciationStreak || 0) + 1;
        } else {
          counterUpdates.pronunciationStreak = 0;
        }
        updateProgress(counterUpdates);
      }
    }
  }, [transcript, isListening, hasRecorded, sentence.text, confidence, addXP, updateProgress]);

  const handleRecord = () => {
    if (isListening) {
      stopListening();
    } else {
      stopAllAudio();
      teacherTimersRef.current.forEach(clearTimeout);
      setScore(null);
      setWordResults(null);
      setHasRecorded(true);
      setPhase('recording');
      startListening();
    }
  };

  const nextSentence = () => {
    stopAllAudio();
    teacherTimersRef.current.forEach(clearTimeout);
    setCurrentIndex(prev => (prev + 1) % PRACTICE_SENTENCES.length);
    setScore(null);
    setWordResults(null);
    setHasRecorded(false);
    xpAwardedRef.current = false;
  };

  const replayTeacher = useCallback(() => {
    stopAllAudio();
    teacherTimersRef.current.forEach(clearTimeout);
    // Read the sentence in English then translation
    speak(sentence.text, { lang: 'en', rate: 0.75, onEnd: () => {
      const translation = lf(sentence, 'translation', uiLang);
      setTimeout(() => speak(translation, { lang: uiLang, rate: 0.9, _queued: true }), 300);
    }});
  }, [sentence, uiLang, speak]);

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

      {/* Teacher guidance bubble */}
      {teacherText && (
        <TeacherBubble text={teacherText} isRTL={isRTL} variant={isChildMode ? 'kids' : 'adult'} />
      )}

      {/* Target Sentence */}
      <GlassCard variant="strong" className="text-center py-6">
        <button
          onClick={replayTeacher}
          aria-label="Listen"
          className="mx-auto mb-3 p-3 rounded-full bg-brand-100 dark:bg-brand-900/30 hover:bg-brand-200 dark:hover:bg-brand-800/40 transition-colors"
        >
          <Volume2 size={24} className="text-brand-600 dark:text-brand-400" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1" dir="ltr">{sentence.text}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400" dir={isRTL ? 'rtl' : 'ltr'}>{lf(sentence, 'translation', uiLang)}</p>
      </GlassCard>

      {/* Waveform */}
      <WaveformVisualizer isActive={isListening} />

      {/* Record Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRecord}
          disabled={phase === 'intro'}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
            phase === 'intro'
              ? 'bg-gray-300 dark:bg-gray-600 opacity-50 cursor-not-allowed'
              : isListening
                ? 'bg-red-500 shadow-lg shadow-red-500/30 recording-pulse'
                : 'bg-brand-500 shadow-lg shadow-brand-500/30 hover:bg-brand-600'
          }`}
        >
          {isListening ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
        </button>
      </div>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {isListening ? t('recording', uiLang) :
         phase === 'intro' ? (isRTL ? '🔊 המורה מדבר...' : '🔊 Teacher speaking...') :
         t('tapToRecord', uiLang)}
      </p>

      {/* Transcript */}
      {transcript && !isListening && (
        <GlassCard className="text-center animate-slide-up">
          <p className="text-sm text-gray-500 mb-1">{t('youSaid', uiLang)}</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white" dir="ltr">{transcript}</p>
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
            <AnimatedButton onClick={() => { const msg = isChildMode ? getTeacherMsg('tryAgain', uiLang) : getAdultMsg('tryAgain', uiLang); setTeacherText(msg); speak(msg, { lang: uiLang, rate: isChildMode ? 0.9 : 1.0 }); handleRecord(); }} variant="secondary" icon={RefreshCw}>
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
