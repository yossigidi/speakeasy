import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft, Volume2, Star, Zap, ChevronRight, RotateCcw, Sparkles, BookOpen, Dumbbell, Trophy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import { playSequence, stopAllAudio } from '../utils/hebrewAudio.js';
import { playCorrect, playWrong, playComplete, playStar, playPop, playTap } from '../utils/gameSounds.js';
import { shuffle } from '../utils/shuffle.js';
import { t, lf, RTL_LANGS } from '../utils/translations.js';
import SpeakliAvatar from '../components/kids/SpeakliAvatar.jsx';
import {
  KIDS_LESSON_LEVELS, getAllTopics, getTopicById, getLessonWords,
  LESSONS_PER_TOPIC, getNextRecommendedTopic, getWeakTopics, calculateKidsLevel,
} from '../data/kids-lesson-topics.js';

/* ── Translation helper for word objects ── */
const wt = (w, lang) => {
  if (!w) return '';
  const map = { he: 'he', ar: 'ar', ru: 'ru' };
  return w[map[lang]] || w.he || w.word;
};

/* ── Encouragement phrases ── */
const ENCOURAGEMENT = {
  he: ['יופי!', 'נכון!', 'מצוין!', 'כל הכבוד!', 'מדהים!', 'סופר!'],
  ar: ['رائع!', 'صحيح!', 'ممتاز!', 'أحسنت!', 'مذهل!', 'سوبر!'],
  ru: ['Отлично!', 'Правильно!', 'Молодец!', 'Замечательно!', 'Супер!', 'Класс!'],
  en: ['Great!', 'Correct!', 'Excellent!', 'Well done!', 'Amazing!', 'Super!'],
};
const getEncouragement = (lang) => {
  const arr = ENCOURAGEMENT[lang] || ENCOURAGEMENT.en;
  return arr[Math.floor(Math.random() * arr.length)];
};

/* ── Topic intro phrases ── */
const INTRO_PHRASES = {
  he: 'היום נלמד',
  ar: 'اليوم سنتعلم',
  ru: 'Сегодня учим',
  en: 'Today we learn',
};

/* ── Teacher guidance phrases per phase ── */
const TEACHER_GUIDE = {
  learnStart: {
    he: 'בואו נלמד מילים חדשות! הקשיבו טוב ותחזרו אחרי.',
    ar: 'هيا نتعلم كلمات جديدة! استمعوا جيداً وكرروا.',
    ru: 'Давайте учить новые слова! Слушайте и повторяйте.',
    en: "Let's learn new words! Listen carefully and repeat after me.",
  },
  practiceStart: {
    he: 'עכשיו בואו נבדוק מה למדנו! בחרו את התשובה הנכונה.',
    ar: 'الآن دعونا نتحقق مما تعلمنا! اختاروا الإجابة الصحيحة.',
    ru: 'Теперь проверим, что выучили! Выберите правильный ответ.',
    en: "Now let's check what we learned! Choose the correct answer.",
  },
  speakStart: {
    he: 'הגיע הזמן לדבר! הקשיבו למילה ותגידו אותה בקול רם.',
    ar: 'حان وقت الكلام! استمعوا إلى الكلمة وقولوها بصوت عالٍ.',
    ru: 'Пора говорить! Слушайте слово и скажите его вслух.',
    en: "Time to speak! Listen to the word and say it out loud.",
  },
  gameStart: {
    he: 'עכשיו משחק מהיר! ענו כמה שיותר מהר ונכון!',
    ar: 'الآن لعبة سريعة! أجيبوا بأسرع ما يمكن وبشكل صحيح!',
    ru: 'Теперь быстрая игра! Отвечайте быстро и правильно!',
    en: "Now a speed game! Answer as fast and correct as you can!",
  },
  bossStart: {
    he: 'שלב בוס! בואו נראה אם זוכרים את כל המילים!',
    ar: 'مرحلة البوس! هيا نرى هل تتذكرون كل الكلمات!',
    ru: 'Уровень босса! Посмотрим, помните ли все слова!',
    en: "Boss level! Let's see if you remember all the words!",
  },
  wrongAnswer: {
    he: 'לא נורא! בואו ננסה שוב.',
    ar: 'لا بأس! هيا نحاول مرة أخرى.',
    ru: 'Ничего страшного! Попробуем ещё раз.',
    en: "That's okay! Let's try again.",
  },
  summaryGreat: {
    he: 'וואו מדהים! עשיתם עבודה נפלאה! ספיקלי גאה בכם!',
    ar: 'واو رائع! عمل ممتاز! سبيكلي فخور بكم!',
    ru: 'Вау потрясающе! Отличная работа! Спикли гордится вами!',
    en: "Wow amazing! Great job! Speakli is so proud of you!",
  },
  summaryGood: {
    he: 'כל הכבוד! למדתם מילים חדשות! נמשיך להתאמן!',
    ar: 'أحسنتم! تعلمتم كلمات جديدة! لنستمر بالتدريب!',
    ru: 'Молодцы! Вы выучили новые слова! Продолжаем!',
    en: "Well done! You learned new words! Let's keep practicing!",
  },
  summaryTryAgain: {
    he: 'לא נורא! תרגול עושה מושלם! בואו ננסה שוב!',
    ar: 'لا بأس! التدريب يصنع الكمال! هيا نحاول مرة أخرى!',
    ru: 'Ничего! Практика делает совершенным! Попробуем снова!',
    en: "No worries! Practice makes perfect! Let's try again!",
  },
};
const tg = (key, lang) => TEACHER_GUIDE[key]?.[lang] || TEACHER_GUIDE[key]?.en || '';
const getLangCode = (lang) => lang === 'en' ? 'en-US' : `${lang}-${lang.toUpperCase()}`;

/* ══════════════════════════════════════════
   Shared UI
   ══════════════════════════════════════════ */

function ConfettiBurst({ show }) {
  if (!show) return null;
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="confetti-piece" style={{
          left: `${Math.random() * 100}%`, top: `${Math.random() * 30}%`,
          background: colors[i % colors.length], animationDelay: `${Math.random() * 0.5}s`,
          animationDuration: `${1 + Math.random() * 1}s`,
          width: `${6 + Math.random() * 8}px`, height: `${6 + Math.random() * 8}px`,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        }} />
      ))}
    </div>
  );
}

function FloatingDecorations() {
  const items = ['⭐', '🌈', '🎈', '🦋', '🌸', '✨', '🎵', '💫'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {items.map((e, i) => (
        <div key={i} className="absolute animate-float text-2xl opacity-20" style={{
          left: `${10 + (i * 12) % 90}%`, top: `${5 + (i * 17) % 85}%`,
          animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i * 0.5}s`,
        }}>{e}</div>
      ))}
    </div>
  );
}

function PhaseProgress({ phases, currentIndex }) {
  return (
    <div className="flex justify-center gap-1.5 px-4 py-2">
      {phases.map((p, i) => (
        <div key={i} className={`h-2 rounded-full transition-all duration-500 ${
          i < currentIndex ? 'w-2 bg-emerald-400' :
          i === currentIndex ? 'w-6 bg-gradient-to-r from-cyan-400 to-blue-500' :
          'w-2 bg-gray-300 dark:bg-gray-600'
        }`} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   PHASE: SELECT — Choose lesson
   ══════════════════════════════════════════ */

function SelectPhase({ onSelectTopic, onBack, progress, uiLang }) {
  const recommended = useMemo(() => getNextRecommendedTopic(progress), [progress]);
  const weakTopics = useMemo(() => getWeakTopics(progress), [progress]);
  const [tab, setTab] = useState('recommended'); // recommended | all | reinforce
  const lessonProgress = progress.kidsLessonProgress || {};
  const isRTL = RTL_LANGS.includes(uiLang);

  const tabLabels = {
    recommended: { he: 'מומלץ', ar: 'موصى', ru: 'Рекомендуемый', en: 'Recommended' },
    all: { he: 'כל הנושאים', ar: 'كل المواضيع', ru: 'Все темы', en: 'All Topics' },
    reinforce: { he: 'חיזוק', ar: 'تعزيز', ru: 'Укрепление', en: 'Reinforce' },
  };
  const getLabel = (key) => tabLabels[key]?.[uiLang] || tabLabels[key]?.en;

  return (
    <div className="kids-bg min-h-screen relative">
      <FloatingDecorations />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button onClick={onBack} className="text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-full p-3 backdrop-blur-sm min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
          </button>
          <h2 className="text-lg font-black text-gray-800 dark:text-white flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-500" />
            {{ he: 'שיעור חכם', ar: 'درس ذكي', ru: 'Умный урок', en: 'Smart Lesson' }[uiLang] || 'Smart Lesson'}
          </h2>
          <div className="w-11" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 mb-4">
          {['recommended', 'all', 'reinforce'].map(key => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === key ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg' :
                'bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300'
              }`}
            >{getLabel(key)}</button>
          ))}
        </div>

        {/* Recommended */}
        {tab === 'recommended' && recommended && (
          <div className="px-4 mb-6">
            <button onClick={() => onSelectTopic(recommended.topic, recommended.lessonIndex)}
              className={`w-full bg-gradient-to-br ${recommended.topic.gradient} rounded-3xl p-5 text-white text-left shadow-2xl active:scale-[0.97] transition-transform`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{recommended.topic.emoji}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold opacity-80 mb-1">
                    {{ he: 'השיעור הבא שלך', ar: 'درسك التالي', ru: 'Следующий урок', en: 'Your next lesson' }[uiLang] || 'Your next lesson'}
                  </div>
                  <div className="text-xl font-black">
                    {({ he: recommended.topic.nameHe, ar: recommended.topic.nameAr, ru: recommended.topic.nameRu }[uiLang]) || recommended.topic.name}
                  </div>
                  <div className="text-sm font-medium opacity-80 mt-1">
                    {{ he: `שיעור ${recommended.lessonIndex + 1} מתוך ${LESSONS_PER_TOPIC}`,
                       en: `Lesson ${recommended.lessonIndex + 1} of ${LESSONS_PER_TOPIC}` }[uiLang] || `Lesson ${recommended.lessonIndex + 1} of ${LESSONS_PER_TOPIC}`}
                  </div>
                </div>
                <ChevronRight size={24} className={isRTL ? 'rotate-180' : ''} />
              </div>
            </button>
          </div>
        )}

        {/* All topics */}
        {tab === 'all' && (
          <div className="px-4 space-y-4 pb-24">
            {KIDS_LESSON_LEVELS.map(lvl => (
              <div key={lvl.level}>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
                  <span>{lvl.emoji}</span>
                  {({ he: lvl.nameHe, ar: lvl.nameAr, ru: lvl.nameRu }[uiLang]) || lvl.name}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {lvl.topics.map(topic => {
                    const tp = lessonProgress[topic.id];
                    const completed = tp?.lessonsCompleted || 0;
                    const done = completed >= LESSONS_PER_TOPIC;
                    return (
                      <button key={topic.id}
                        onClick={() => onSelectTopic({ ...topic, level: lvl.level }, Math.min(completed, LESSONS_PER_TOPIC - 1))}
                        className={`bg-white/80 dark:bg-gray-800/80 rounded-2xl p-3 text-center shadow-md active:scale-95 transition-all border-2 ${
                          done ? 'border-emerald-300' : 'border-transparent'
                        }`}
                      >
                        <span className="text-3xl block mb-1">{topic.emoji}</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200 block">
                          {({ he: topic.nameHe, ar: topic.nameAr, ru: topic.nameRu }[uiLang]) || topic.name}
                        </span>
                        <div className="flex justify-center gap-0.5 mt-1">
                          {[...Array(LESSONS_PER_TOPIC)].map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < completed ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reinforce */}
        {tab === 'reinforce' && (
          <div className="px-4 pb-24">
            {weakTopics.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">🌟</span>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {{ he: 'אין נושאים לחיזוק! כל הכבוד!', en: 'No topics to reinforce! Great job!' }[uiLang] || 'No topics to reinforce!'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {weakTopics.map(topic => (
                  <button key={topic.id}
                    onClick={() => onSelectTopic(topic, 0)}
                    className="w-full flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 rounded-2xl p-4 shadow-md active:scale-95 transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <span className="text-3xl">{topic.emoji}</span>
                    <div className="flex-1 text-left" dir={isRTL ? 'rtl' : 'ltr'}>
                      <div className="font-bold text-gray-800 dark:text-white">
                        {({ he: topic.nameHe, ar: topic.nameAr, ru: topic.nameRu }[uiLang]) || topic.name}
                      </div>
                      <div className="text-xs text-orange-500 font-medium">
                        {{ he: 'צריך חיזוק', en: 'Needs practice' }[uiLang] || 'Needs practice'}
                      </div>
                    </div>
                    <Dumbbell size={20} className="text-orange-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PHASE: INTRO — Speakli introduces topic
   ══════════════════════════════════════════ */

function IntroPhase({ topic, lessonIndex, uiLang, speak, onDone }) {
  const [avatarMode, setAvatarMode] = useState('fly');
  const [showText, setShowText] = useState(false);
  const timerRef = useRef(null);
  const isBoss = lessonIndex >= 3;

  useEffect(() => {
    setTimeout(() => setShowText(true), 600);
    const introText = INTRO_PHRASES[uiLang] || INTRO_PHRASES.en;
    const topicName = ({ he: topic.nameHe, ar: topic.nameAr, ru: topic.nameRu }[uiLang]) || topic.name;
    const bossText = { he: 'בואו נבדוק מה למדנו!', ar: 'هيا نراجع ما تعلمنا!', ru: 'Проверим, что выучили!', en: "Let's test what we learned!" }[uiLang] || "Let's test what we learned!";

    setTimeout(() => {
      setAvatarMode('talk');
      const langCode = getLangCode(uiLang);
      playSequence([
        { text: isBoss ? bossText : `${introText} ${topicName}!`, lang: langCode, rate: 0.85 },
        { pause: 600 },
        { text: isBoss ? tg('bossStart', uiLang) : tg('learnStart', uiLang), lang: langCode, rate: 0.85 },
      ], speak, () => setAvatarMode('idle'));
    }, 800);

    timerRef.current = setTimeout(onDone, 7000);
    return () => { clearTimeout(timerRef.current); stopAllAudio(); };
  }, []);

  const topicName = ({ he: topic.nameHe, ar: topic.nameAr, ru: topic.nameRu }[uiLang]) || topic.name;
  const introLabel = INTRO_PHRASES[uiLang] || INTRO_PHRASES.en;

  return (
    <div className={`kids-bg min-h-screen flex flex-col items-center justify-center px-6 relative`}>
      <FloatingDecorations />
      <div className={`relative z-10 text-center transition-all duration-700 ${showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <SpeakliAvatar mode={avatarMode} size="xl" glow />
        <div className="text-6xl mb-4 animate-jelly">{topic.emoji}</div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
          {isBoss ? (
            <span className="flex items-center justify-center gap-2">
              <Trophy size={28} className="text-yellow-500" />
              {{ he: 'שלב בוס!', en: 'Boss Level!' }[uiLang] || 'Boss Level!'}
            </span>
          ) : `${introLabel}:`}
        </h2>
        {!isBoss && (
          <h1 className={`text-4xl font-black bg-gradient-to-r ${topic.gradient} bg-clip-text text-transparent py-2`}>
            {topicName}
          </h1>
        )}
        <button onClick={onDone}
          className="mt-6 px-8 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 font-bold text-gray-700 dark:text-gray-200 active:scale-95 transition-transform shadow-lg"
        >
          {{ he: 'המשך', en: 'Continue' }[uiLang] || 'Continue'} →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PHASE: LEARN — Show words one by one
   ══════════════════════════════════════════ */

function LearnPhase({ words, uiLang, speak, onDone }) {
  const [idx, setIdx] = useState(0);
  const [showWord, setShowWord] = useState(false);
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const isRTL = RTL_LANGS.includes(uiLang);

  const word = words[idx];

  useEffect(() => {
    setShowWord(false);
    const t1 = setTimeout(() => setShowWord(true), 200);
    const langCode = getLangCode(uiLang);
    const t2 = setTimeout(() => {
      const seq = [];
      // On first word, add teacher guidance
      if (idx === 0) {
        seq.push({ text: tg('learnStart', uiLang), lang: langCode, rate: 0.85 });
        seq.push({ pause: 600 });
      }
      seq.push(
        { text: word.word, lang: 'en-US', rate: 0.45 },
        { pause: 600 },
        { text: word.word, lang: 'en-US', rate: 0.45 },
        { pause: 500 },
        { text: wt(word, uiLang), lang: langCode, rate: 0.8 },
      );
      playSequence(seq, speakRef.current);
    }, 500);
    return () => { clearTimeout(t1); clearTimeout(t2); stopAllAudio(); };
  }, [idx]);

  const next = () => {
    stopAllAudio();
    if (idx < words.length - 1) {
      setIdx(i => i + 1);
    } else {
      onDone();
    }
  };

  const replay = () => {
    playSequence([
      { text: word.word, lang: 'en-US', rate: 0.45 },
      { pause: 500 },
      { text: wt(word, uiLang), lang: uiLang === 'en' ? 'en-US' : `${uiLang}-${uiLang.toUpperCase()}`, rate: 0.8 },
    ], speakRef.current);
  };

  if (!word) return null;

  return (
    <div className="kids-bg min-h-screen flex flex-col relative">
      <FloatingDecorations />
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Progress */}
        <div className="flex justify-center gap-2 px-4 pt-4">
          {words.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${
              i < idx ? 'w-2 bg-emerald-400' : i === idx ? 'w-8 bg-gradient-to-r from-cyan-400 to-blue-500' : 'w-2 bg-gray-300 dark:bg-gray-600'
            }`} />
          ))}
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
          <BookOpen size={14} className="inline mr-1" />
          {{ he: 'לימוד מילים', en: 'Learning words' }[uiLang] || 'Learning words'}
        </div>

        {/* Word Card */}
        <div className={`flex-1 flex items-center justify-center px-6 transition-all duration-500 ${showWord ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full">
            <span className="text-8xl block mb-4 animate-jelly">{word.emoji}</span>
            <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2">{word.word}</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium" dir={isRTL ? 'rtl' : 'ltr'}>
              {wt(word, uiLang)}
            </p>
            <button onClick={replay}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 font-bold active:scale-95 transition-transform"
            >
              <Volume2 size={18} />
              {{ he: 'שמע שוב', en: 'Listen again' }[uiLang] || 'Listen again'}
            </button>
          </div>
        </div>

        {/* Next button */}
        <div className="px-6 pb-8">
          <button onClick={next}
            className={`w-full py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r ${
              idx < words.length - 1 ? 'from-cyan-400 to-blue-500' : 'from-emerald-400 to-green-500'
            } shadow-xl active:scale-[0.97] transition-transform`}
          >
            {idx < words.length - 1
              ? ({ he: 'מילה הבאה', en: 'Next word' }[uiLang] || 'Next word')
              : ({ he: 'בואו נתרגל!', en: "Let's practice!" }[uiLang] || "Let's practice!")}
            {' '}→
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PHASE: PRACTICE — Recognition exercises
   ══════════════════════════════════════════ */

function generatePracticeExercises(words, allWords, uiLang) {
  const exercises = [];
  const allPool = allWords.length >= 6 ? allWords : [...allWords, ...words];

  for (const w of words) {
    // Type 1: Emoji pick — "Which emoji is [word]?"
    const wrongEmojis = shuffle(allPool.filter(x => x.word !== w.word)).slice(0, 3);
    exercises.push({
      type: 'emoji-pick',
      question: w.word,
      correct: w,
      options: shuffle([w, ...wrongEmojis]),
    });

    // Type 2: Translation pick — Show emoji, pick translation
    const wrongTrans = shuffle(allPool.filter(x => x.word !== w.word)).slice(0, 3);
    exercises.push({
      type: 'translation-pick',
      question: w,
      correct: w,
      options: shuffle([w, ...wrongTrans]),
    });
  }

  // Type 3: Listen pick — hear word, pick emoji (one per word set)
  const listenWord = words[Math.floor(Math.random() * words.length)];
  const wrongListen = shuffle(allPool.filter(x => x.word !== listenWord.word)).slice(0, 3);
  exercises.push({
    type: 'listen-pick',
    question: listenWord,
    correct: listenWord,
    options: shuffle([listenWord, ...wrongListen]),
  });

  return shuffle(exercises).slice(0, Math.min(exercises.length, 5));
}

function PracticePhase({ words, allWords, uiLang, speak, onDone }) {
  const exercises = useMemo(() => generatePracticeExercises(words, allWords, uiLang), [words, allWords]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const timersRef = useRef([]);
  const isRTL = RTL_LANGS.includes(uiLang);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const exercise = exercises[idx];

  // Auto-speak: teacher guidance at start + listen-pick words
  useEffect(() => {
    const langCode = getLangCode(uiLang);
    if (idx === 0) {
      // Teacher introduces the practice phase
      const t = setTimeout(() => {
        const seq = [
          { text: tg('practiceStart', uiLang), lang: langCode, rate: 0.85 },
        ];
        if (exercise?.type === 'listen-pick') {
          seq.push({ pause: 600 });
          seq.push({ text: exercise.question.word, lang: 'en-US', rate: 0.45 });
          seq.push({ pause: 500 });
          seq.push({ text: exercise.question.word, lang: 'en-US', rate: 0.45 });
        }
        playSequence(seq, speakRef.current);
      }, 400);
      return () => { clearTimeout(t); stopAllAudio(); };
    } else if (exercise?.type === 'listen-pick') {
      const t = setTimeout(() => {
        playSequence([
          { text: exercise.question.word, lang: 'en-US', rate: 0.45 },
          { pause: 500 },
          { text: exercise.question.word, lang: 'en-US', rate: 0.45 },
        ], speakRef.current);
      }, 400);
      return () => { clearTimeout(t); stopAllAudio(); };
    }
  }, [idx]);

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    setSelected(opt.word);
    const correct = opt.word === exercise.correct.word;
    setIsCorrect(correct);

    if (correct) {
      playCorrect();
      setScore(s => s + 1);
      timersRef.current.push(setTimeout(() => {
        playSequence([
          { text: getEncouragement(uiLang), lang: uiLang === 'en' ? 'en-US' : `${uiLang}-${uiLang.toUpperCase()}`, rate: 0.9 },
        ], speakRef.current);
      }, 200));
    } else {
      playWrong();
      const langCode = getLangCode(uiLang);
      // Teacher encourages + teaches the correct answer
      timersRef.current.push(setTimeout(() => {
        playSequence([
          { text: tg('wrongAnswer', uiLang), lang: langCode, rate: 0.85 },
          { pause: 400 },
          { text: exercise.correct.word, lang: 'en-US', rate: 0.45 },
          { pause: 400 },
          { text: wt(exercise.correct, uiLang), lang: langCode, rate: 0.8 },
        ], speakRef.current);
      }, 300));
    }

    timersRef.current.push(setTimeout(() => {
      setSelected(null);
      setIsCorrect(null);
      if (idx < exercises.length - 1) {
        setIdx(i => i + 1);
      } else {
        onDone(score + (correct ? 1 : 0), exercises.length);
      }
    }, correct ? 1200 : 2000));
  };

  if (!exercise) return null;

  const questionLabel = {
    'emoji-pick': { he: 'מצאו את התמונה של:', en: 'Find the picture of:' },
    'translation-pick': { he: 'מה המילה באנגלית?', en: 'What is it in English?' },
    'listen-pick': { he: 'הקשיבו ובחרו:', en: 'Listen and choose:' },
  };

  return (
    <div className="kids-bg min-h-screen flex flex-col relative">
      <FloatingDecorations />
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Progress */}
        <div className="flex justify-center gap-1.5 px-4 pt-4">
          {exercises.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${
              i < idx ? 'w-2 bg-emerald-400' : i === idx ? 'w-6 bg-gradient-to-r from-purple-400 to-pink-500' : 'w-2 bg-gray-300 dark:bg-gray-600'
            }`} />
          ))}
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
          <Dumbbell size={14} className="inline mr-1" />
          {{ he: 'תרגול', en: 'Practice' }[uiLang] || 'Practice'}
        </div>

        {/* Question */}
        <div className="text-center px-6 mt-6 mb-2">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
            {questionLabel[exercise.type]?.[uiLang] || questionLabel[exercise.type]?.en}
          </p>

          {exercise.type === 'emoji-pick' && (
            <h2 className="text-3xl font-black text-gray-800 dark:text-white">{exercise.question}</h2>
          )}
          {exercise.type === 'translation-pick' && (
            <div>
              <span className="text-6xl block mb-2">{exercise.question.emoji}</span>
              <p className="text-lg font-bold text-gray-600 dark:text-gray-300" dir={isRTL ? 'rtl' : 'ltr'}>
                {wt(exercise.question, uiLang)}
              </p>
            </div>
          )}
          {exercise.type === 'listen-pick' && (
            <button onClick={() => {
              playSequence([
                { text: exercise.question.word, lang: 'en-US', rate: 0.45 },
              ], speakRef.current);
            }} className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl px-8 py-4 font-bold text-lg shadow-xl animate-glow-pulse">
              <Volume2 size={24} />
              {{ he: 'שמע שוב', en: 'Listen' }[uiLang] || 'Listen'}
            </button>
          )}
        </div>

        {/* Options */}
        <div className="flex-1 flex items-center">
          <div className={`grid grid-cols-2 gap-3 px-4 w-full ${exercise.type === 'translation-pick' ? '' : ''}`}>
            {exercise.options.map((opt, i) => {
              const isSelected = selected === opt.word;
              const isRight = opt.word === exercise.correct.word;
              const showResult = selected !== null;

              return (
                <button key={i} onClick={() => handleAnswer(opt)}
                  disabled={selected !== null}
                  className={`rounded-2xl p-4 text-center transition-all duration-300 ${
                    showResult && isRight
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 border-3 border-emerald-400 scale-105'
                      : showResult && isSelected && !isRight
                        ? 'bg-red-100 dark:bg-red-900/40 border-3 border-red-400 animate-shake'
                        : 'bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 shadow-lg active:scale-95'
                  }`}
                >
                  {exercise.type === 'emoji-pick' || exercise.type === 'listen-pick' ? (
                    <>
                      <span className="text-4xl block mb-1">{opt.emoji}</span>
                      {showResult && isRight && <span className="text-xs font-bold text-emerald-600">{opt.word}</span>}
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-800 dark:text-white">{opt.word}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PHASE: SPEAK — Say the word
   ══════════════════════════════════════════ */

function SpeakPhase({ words, uiLang, speak, onDone }) {
  const [idx, setIdx] = useState(0);
  const [said, setSaid] = useState(false);
  const speakRef = useRef(speak);
  speakRef.current = speak;

  const word = words[idx];

  useEffect(() => {
    setSaid(false);
    const langCode = getLangCode(uiLang);
    const t = setTimeout(() => {
      const seq = [];
      // Teacher guides at start of speak phase
      if (idx === 0) {
        seq.push({ text: tg('speakStart', uiLang), lang: langCode, rate: 0.85 });
        seq.push({ pause: 600 });
      }
      seq.push(
        { text: { he: 'תגידו:', ar: 'قولوا:', ru: 'Скажите:', en: 'Say:' }[uiLang] || 'Say:', lang: langCode, rate: 0.85 },
        { pause: 400 },
        { text: word.word, lang: 'en-US', rate: 0.45 },
        { pause: 500 },
        { text: word.word, lang: 'en-US', rate: 0.45 },
      );
      playSequence(seq, speakRef.current);
    }, 400);
    return () => { clearTimeout(t); stopAllAudio(); };
  }, [idx]);

  const replay = () => {
    playSequence([
      { text: word.word, lang: 'en-US', rate: 0.45 },
    ], speakRef.current);
  };

  const next = () => {
    stopAllAudio();
    if (idx < words.length - 1) {
      setIdx(i => i + 1);
    } else {
      onDone();
    }
  };

  const markSaid = () => {
    setSaid(true);
    playCorrect();
    playSequence([
      { text: getEncouragement(uiLang), lang: uiLang === 'en' ? 'en-US' : `${uiLang}-${uiLang.toUpperCase()}`, rate: 0.9 },
    ], speakRef.current);
  };

  if (!word) return null;

  return (
    <div className="kids-bg min-h-screen flex flex-col relative">
      <FloatingDecorations />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
          🎤 {{ he: 'דיבור', en: 'Speaking' }[uiLang] || 'Speaking'} ({idx + 1}/{words.length})
        </div>

        <SpeakliAvatar mode={said ? 'celebrate' : 'idle'} size="lg" glow />

        <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl p-6 shadow-2xl text-center mt-4 w-full max-w-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-bold">
            {{ he: 'תגידו:', ar: 'قولوا:', ru: 'Скажите:', en: 'Say:' }[uiLang] || 'Say:'}
          </p>
          <span className="text-5xl block mb-2">{word.emoji}</span>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-1">{word.word}</h2>
          <button onClick={replay} className="text-cyan-500 font-bold text-sm flex items-center gap-1 mx-auto">
            <Volume2 size={16} /> {{ he: 'שמע שוב', en: 'Listen' }[uiLang] || 'Listen'}
          </button>
        </div>

        <div className="flex gap-3 mt-6 w-full max-w-sm">
          {!said ? (
            <button onClick={markSaid}
              className="flex-1 py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-emerald-400 to-green-500 shadow-xl active:scale-[0.97] transition-transform"
            >
              {{ he: 'אמרתי! ✓', en: 'I said it! ✓' }[uiLang] || 'I said it! ✓'}
            </button>
          ) : (
            <button onClick={next}
              className="flex-1 py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-cyan-400 to-blue-500 shadow-xl active:scale-[0.97] transition-transform"
            >
              {idx < words.length - 1
                ? ({ he: 'מילה הבאה →', en: 'Next word →' }[uiLang] || 'Next word →')
                : ({ he: 'למשחק! 🎮', en: 'To the game! 🎮' }[uiLang] || 'To the game! 🎮')}
            </button>
          )}
        </div>
        <button onClick={next} className="mt-3 text-sm text-gray-400 font-medium">
          {{ he: 'דלג', en: 'Skip' }[uiLang] || 'Skip'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PHASE: GAME — Speed round
   ══════════════════════════════════════════ */

function GamePhase({ words, allWords, uiLang, speak, onDone }) {
  const allPool = allWords.length >= 4 ? allWords : [...allWords, ...words];
  const questions = useMemo(() => {
    return shuffle(words.flatMap(w => [
      { word: w, type: 'emoji' },
      { word: w, type: 'word' },
    ])).slice(0, 6);
  }, [words]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [streak, setStreak] = useState(0);
  const timersRef = useRef([]);
  const speakRef = useRef(speak);
  speakRef.current = speak;

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  // Auto-speak: teacher intro at first question + word each round
  useEffect(() => {
    if (idx < questions.length) {
      const q = questions[idx];
      const t = setTimeout(() => {
        const seq = [];
        if (idx === 0) {
          seq.push({ text: tg('gameStart', uiLang), lang: getLangCode(uiLang), rate: 0.85 });
          seq.push({ pause: 500 });
        }
        seq.push({ text: q.word.word, lang: 'en-US', rate: 0.5 });
        playSequence(seq, speakRef.current);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [idx]);

  const q = questions[idx];

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    setSelected(opt.word);
    const correct = opt.word === q.word.word;

    if (correct) {
      playPop();
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      playWrong();
      setStreak(0);
    }

    timersRef.current.push(setTimeout(() => {
      setSelected(null);
      if (idx < questions.length - 1) {
        setIdx(i => i + 1);
      } else {
        onDone(score + (correct ? 1 : 0), questions.length);
      }
    }, 800));
  };

  if (!q) return null;

  const wrong = shuffle(allPool.filter(x => x.word !== q.word.word)).slice(0, 3);
  const options = useMemo(() => shuffle([q.word, ...wrong]), [idx]);

  return (
    <div className="kids-bg min-h-screen flex flex-col relative">
      <FloatingDecorations />
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-300">
            {idx + 1}/{questions.length}
          </div>
          <div className="text-sm font-black text-gray-800 dark:text-white flex items-center gap-1">
            🎮 {{ he: 'משחק מהיר', en: 'Speed Round' }[uiLang] || 'Speed Round'}
          </div>
          {streak >= 2 && (
            <div className="bg-orange-100 dark:bg-orange-900/40 rounded-full px-3 py-1 text-xs font-bold text-orange-600 animate-pop-in">
              🔥 {streak}
            </div>
          )}
          {streak < 2 && <div className="w-12" />}
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {q.type === 'emoji' ? (
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-2">
                {{ he: 'מה התמונה של:', en: 'Find the picture:' }[uiLang] || 'Find:'}
              </p>
              <h2 className="text-3xl font-black text-gray-800 dark:text-white">{q.word.word}</h2>
            </div>
          ) : (
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-2">
                {{ he: 'מה המילה?', en: 'What word?' }[uiLang] || 'What word?'}
              </p>
              <span className="text-7xl block">{q.word.emoji}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {options.map((opt, i) => {
              const isSelected = selected === opt.word;
              const isRight = opt.word === q.word.word;
              const show = selected !== null;

              return (
                <button key={i} onClick={() => handleAnswer(opt)}
                  disabled={selected !== null}
                  className={`rounded-2xl p-4 text-center transition-all duration-200 ${
                    show && isRight ? 'bg-emerald-100 dark:bg-emerald-900/40 border-3 border-emerald-400 scale-105' :
                    show && isSelected ? 'bg-red-100 dark:bg-red-900/40 border-3 border-red-400' :
                    'bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 shadow-lg active:scale-95'
                  }`}
                >
                  {q.type === 'emoji' ? (
                    <span className="text-4xl">{opt.emoji}</span>
                  ) : (
                    <span className="text-lg font-bold text-gray-800 dark:text-white">{opt.word}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PHASE: SUMMARY — Stars, XP, words learned
   ══════════════════════════════════════════ */

function SummaryPhase({ topic, words, practiceScore, practiceTotal, gameScore, gameTotal, uiLang, speak, onDone }) {
  const totalCorrect = practiceScore + gameScore;
  const totalQuestions = practiceTotal + gameTotal;
  const accuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
  const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.4 ? 1 : 0;
  const xp = stars * 10 + words.length * 2;
  const isRTL = RTL_LANGS.includes(uiLang);

  useEffect(() => {
    playComplete();
    // Teacher speaks summary based on performance
    const langCode = getLangCode(uiLang);
    const guideKey = stars >= 3 ? 'summaryGreat' : stars >= 2 ? 'summaryGood' : 'summaryTryAgain';
    setTimeout(() => {
      playSequence([
        { text: tg(guideKey, uiLang), lang: langCode, rate: 0.85 },
      ], speak);
    }, 800);
    return () => stopAllAudio();
  }, []);

  return (
    <div className="kids-bg min-h-screen relative">
      <FloatingDecorations />
      <ConfettiBurst show={stars >= 2} />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <SpeakliAvatar mode="celebrate" size="lg" glow />

        <h2 className="text-3xl font-black mt-3 mb-2" style={{
          background: 'linear-gradient(135deg, #2563EB, #06B6D4, #F59E0B)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {{ he: 'כל הכבוד!', en: 'Well done!' }[uiLang] || 'Well done!'}
        </h2>

        {/* Stars */}
        <div className="flex gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <Star key={i} size={40} className={`${i < stars ? 'text-yellow-400 fill-yellow-400 animate-pop-in' : 'text-gray-300'}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* XP */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-4 shadow-lg">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            <span className="text-lg font-bold text-yellow-600">+{xp} XP</span>
          </div>
        </div>

        {/* Words learned */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl px-5 py-3 mb-6 w-full max-w-sm">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
            {{ he: `למדתם ${words.length} מילים חדשות:`, en: `You learned ${words.length} new words:` }[uiLang] || `${words.length} new words:`}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {words.map((w, i) => (
              <span key={i} className="bg-white dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-bold text-gray-700 dark:text-gray-200 shadow">
                {w.emoji} {w.word}
              </span>
            ))}
          </div>
        </div>

        {/* Score */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {{ he: `דיוק: ${Math.round(accuracy * 100)}%`, en: `Accuracy: ${Math.round(accuracy * 100)}%` }[uiLang] || `Accuracy: ${Math.round(accuracy * 100)}%`}
        </p>

        <button onClick={() => onDone(xp, accuracy, stars)}
          className={`w-full max-w-sm py-4 rounded-2xl font-black text-white text-xl bg-gradient-to-r ${topic.gradient} shadow-2xl active:scale-[0.97] transition-transform`}
        >
          {{ he: 'המשך', en: 'Continue' }[uiLang] || 'Continue'} ✨
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN: KidsAILessonPage
   ══════════════════════════════════════════ */

const PHASES = ['select', 'intro', 'learn', 'practice', 'speak', 'game', 'summary'];

export default function KidsAILessonPage({ onNavigate }) {
  const { uiLang } = useTheme();
  const { progress, updateProgress } = useUserProgress();
  const { speak } = useSpeech();

  const [phase, setPhase] = useState('select');
  const [topic, setTopic] = useState(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceTotal, setPracticeTotal] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameTotal, setGameTotal] = useState(0);

  // Words for current lesson
  const lessonWords = useMemo(() => {
    if (!topic) return [];
    return getLessonWords(topic, lessonIndex);
  }, [topic, lessonIndex]);

  const allTopicWords = topic?.words || [];

  const handleSelectTopic = (t, li) => {
    setTopic(t);
    setLessonIndex(li);
    setPracticeScore(0);
    setPracticeTotal(0);
    setGameScore(0);
    setGameTotal(0);
    setPhase('intro');
  };

  const handlePracticeDone = (score, total) => {
    setPracticeScore(score);
    setPracticeTotal(total);
    setPhase('speak');
  };

  const handleGameDone = (score, total) => {
    setGameScore(score);
    setGameTotal(total);
    setPhase('summary');
  };

  const handleSummaryDone = (xp, accuracy, stars) => {
    // Save progress
    const prev = progress.kidsLessonProgress || {};
    const topicProgress = prev[topic.id] || { lessonsCompleted: 0, accuracy: 0, wordsLearned: [], totalAttempts: 0 };

    const newWordsLearned = [...new Set([...(topicProgress.wordsLearned || []), ...lessonWords.map(w => w.word)])];
    const newCompleted = Math.max(topicProgress.lessonsCompleted, lessonIndex + 1);
    const totalAttempts = (topicProgress.totalAttempts || 0) + 1;
    // Running average accuracy
    const newAccuracy = topicProgress.totalAttempts > 0
      ? ((topicProgress.accuracy * topicProgress.totalAttempts) + accuracy) / totalAttempts
      : accuracy;

    const newProgress = {
      ...prev,
      [topic.id]: {
        lessonsCompleted: newCompleted,
        accuracy: Math.round(newAccuracy * 100) / 100,
        wordsLearned: newWordsLearned,
        totalAttempts,
        lastPlayed: Date.now(),
      },
    };

    updateProgress({
      kidsLessonProgress: newProgress,
      xp: (progress.xp || 0) + xp,
      totalLessonsCompleted: (progress.totalLessonsCompleted || 0) + 1,
      totalWordsLearned: (progress.totalWordsLearned || 0) + lessonWords.length,
    });

    // Back to select
    setPhase('select');
  };

  const goBack = () => {
    stopAllAudio();
    if (phase === 'select') {
      onNavigate('kids-home');
    } else {
      setPhase('select');
    }
  };

  // Cleanup on unmount
  useEffect(() => () => stopAllAudio(), []);

  switch (phase) {
    case 'select':
      return <SelectPhase onSelectTopic={handleSelectTopic} onBack={goBack} progress={progress} uiLang={uiLang} />;
    case 'intro':
      return <IntroPhase topic={topic} lessonIndex={lessonIndex} uiLang={uiLang} speak={speak} onDone={() => {
        // Boss lesson skips learn phase
        setPhase(lessonIndex >= 3 ? 'practice' : 'learn');
      }} />;
    case 'learn':
      return <LearnPhase words={lessonWords} uiLang={uiLang} speak={speak} onDone={() => setPhase('practice')} />;
    case 'practice':
      return <PracticePhase words={lessonWords} allWords={allTopicWords} uiLang={uiLang} speak={speak} onDone={handlePracticeDone} />;
    case 'speak':
      return <SpeakPhase words={lessonWords} uiLang={uiLang} speak={speak} onDone={() => setPhase('game')} />;
    case 'game':
      return <GamePhase words={lessonWords} allWords={allTopicWords} uiLang={uiLang} speak={speak} onDone={handleGameDone} />;
    case 'summary':
      return <SummaryPhase topic={topic} words={lessonWords} practiceScore={practiceScore} practiceTotal={practiceTotal}
        gameScore={gameScore} gameTotal={gameTotal} uiLang={uiLang} speak={speak} onDone={handleSummaryDone} />;
    default:
      return null;
  }
}
