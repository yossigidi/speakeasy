import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Volume2, ArrowLeft, Star, Trophy, Sparkles, Check, Heart, Zap, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { useSpeech } from '../contexts/SpeechContext.jsx';
import GlassCard from '../components/shared/GlassCard.jsx';
import KidsIntro from '../components/kids/KidsIntro.jsx';
import SpeakliAvatar from '../components/kids/SpeakliAvatar.jsx';
import PaywallModal from '../components/subscription/PaywallModal.jsx';
import useContentGate from '../hooks/useContentGate.js';
import alphabetData from '../data/alphabet-kids.json';
import { shuffle } from '../utils/shuffle.js';
import { stopAllAudio } from '../utils/hebrewAudio.js';
import { playWrong } from '../utils/gameSounds.js';
import { t, tReplace, RTL_LANGS, lf } from '../utils/translations.js';

/* ── Confetti burst helper ── */
function ConfettiBurst({ show }) {
  if (!show) return null;
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 30}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random() * 1}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

/* ── Floating decorations for kids bg ── */
function FloatingDecorations() {
  const emojis = ['⭐', '🌈', '🎈', '🦋', '🌸', '✨', '🎵', '💫'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {emojis.map((e, i) => (
        <div
          key={i}
          className="absolute animate-float text-2xl opacity-20"
          style={{
            left: `${10 + (i * 12) % 90}%`,
            top: `${5 + (i * 17) % 85}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        >
          {e}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   LETTER GRID - Colorful alphabet overview
   ══════════════════════════════════════════ */
function LetterGrid({ onSelect, completedLetters }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();
  const { progress } = useUserProgress();
  const { isLocked } = useContentGate();
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <div className="kids-bg min-h-screen pb-24 px-4 pt-2 relative">
      <FloatingDecorations />

      <KidsIntro
        id="kids-alphabet-v4"
        name={progress.displayName}
        emoji="🔤"
        title="Speakli's Letters!"
        titleHe="האותיות של ספיקלי!"
        titleAr="حروف سبيكلي!"
        titleRu="Буквы Спикли!"
        desc="Hi! Let's learn the letters with Speakli! Tap the letters to learn!"
        descHe="היי! בואו נלמד את האותיות עם ספיקלי! לחצו על האותיות כדי ללמוד!"
        descAr="مرحباً! دعونا نتعلم الحروف مع سبيكلي! اضغط على الحروف للتعلم!"
        descRu="Привет! Учим буквы вместе со Спикли! Нажимай на буквы, чтобы учиться!"
        uiLang={uiLang}
        gradient="from-blue-500 via-sky-500 to-cyan-500"
        buttonLabel="Let's learn with Speakli!"
        buttonLabelHe="בואו נלמד עם ספיקלי!"
        buttonLabelAr="هيا نتعلم مع سبيكلي!"
        buttonLabelRu="Учимся со Спикли!"
      />

      <div className="relative z-10 stagger-children">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-black rainbow-text py-1">
            {t('myLetters', uiLang)}
          </h1>
          <div className="flex justify-center gap-1 mt-1">
            {['🌈', '🔤', '🎉'].map((e, i) => (
              <span key={i} className="text-xl animate-float" style={{ animationDelay: `${i * 0.3}s` }}>{e}</span>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('tapLetterToLearn', uiLang)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              {completedLetters.length >= 26 ? (
                <span className="text-lg animate-spin-star">🏆</span>
              ) : (
                <span className="text-lg animate-sparkle">⭐</span>
              )}
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {completedLetters.length}/26
              </span>
            </div>
            <div className="flex gap-0.5">
              {[...Array(Math.min(completedLetters.length, 5))].map((_, i) => (
                <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
          </div>
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
              style={{
                width: `${(completedLetters.length / 26) * 100}%`,
                background: 'linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff)',
                backgroundSize: '200% auto',
                animation: 'rainbowShift 3s linear infinite',
              }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>

        {/* Letter Grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {alphabetData.map((item, i) => {
            const isDone = completedLetters.includes(item.letter);
            const locked = isLocked('alphabet', i);
            return (
              <button
                key={item.letter}
                onClick={() => {
                  if (locked) { setShowPaywall(true); return; }
                  speak(item.letter, { rate: 0.6 });
                  onSelect(item);
                }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-[0.88] hover:scale-[1.05] ${
                  locked
                    ? 'bg-gradient-to-br from-gray-400 to-gray-500 opacity-60'
                    : isDone
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-400/40 ring-2 ring-emerald-300'
                    : `bg-gradient-to-br ${item.color} shadow-lg shadow-gray-300/50 dark:shadow-black/30`
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {locked && (
                  <div className="absolute top-1 right-1 bg-black/40 rounded-full p-1">
                    <Lock size={12} className="text-white" />
                  </div>
                )}
                {!locked && isDone && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm animate-pop-in">
                    <Check size={12} className="text-emerald-600" strokeWidth={3} />
                  </div>
                )}
                <span className="text-2xl font-black text-white drop-shadow-md leading-none">{item.letter}</span>
                <span className="text-sm font-bold text-white/70 leading-none">{item.lower}</span>
                <span className="text-xs leading-none mt-0.5">{item.emoji}</span>

                {/* Sparkle for uncompleted */}
                {!isDone && !locked && (
                  <div className="absolute -top-1 -right-1 text-xs animate-sparkle">✨</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {showPaywall && <PaywallModal feature="alphabet" onClose={() => setShowPaywall(false)} onNavigate={() => {}} />}
    </div>
  );
}

/* ══════════════════════════════════════════
   LETTER DETAIL - Learn one letter deeply
   ══════════════════════════════════════════ */
function LetterDetail({ letter, onBack, onStartGame }) {
  const { uiLang } = useTheme();
  const { speak, speakSequence } = useSpeech();

  const speakLetter = () => speak(letter.letter, { rate: 0.6 });
  const speakSound = () => speak(letter.soundWord, { rate: 0.6 });
  const speakWord = (wordObj) => {
    speakSequence([
      { text: wordObj.word, lang: 'en-US', rate: 0.6 },
      { pause: 400 },
      { text: lf(wordObj, 'translation', uiLang), lang: uiLang, rate: 0.85 },
    ]);
  };

  return (
    <div className="kids-bg min-h-screen pb-24 px-4 pt-2 relative">
      <FloatingDecorations />
      <div className="relative z-10 stagger-children">
        {/* Back button */}
        <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-3 bg-white/50 dark:bg-gray-800/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
          <ArrowLeft size={16} className={RTL_LANGS.includes(uiLang) ? 'rotate-180' : ''} />
          <span className="text-sm font-medium">{t('back', uiLang)}</span>
        </button>

        {/* Big Letter Card */}
        <div className={`rounded-3xl bg-gradient-to-br ${letter.color} p-8 text-center mb-4 shadow-2xl relative overflow-hidden`}>
          {/* Decorative circles */}
          <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full" />
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 left-0 w-12 h-12 bg-white/5 rounded-full" />

          <div className="relative">
            <div className="flex items-center justify-center gap-8 mb-4">
              <button onClick={speakLetter} className="active:scale-90 transition-transform hover:scale-110">
                <span className="text-8xl font-black text-white drop-shadow-lg">{letter.letter}</span>
              </button>
              <button onClick={speakLetter} className="active:scale-90 transition-transform hover:scale-110">
                <span className="text-8xl font-black text-white/60 drop-shadow-lg">{letter.lower}</span>
              </button>
            </div>
            <button
              onClick={speakLetter}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/25 backdrop-blur-sm text-white font-bold text-base active:scale-95 transition-all hover:bg-white/35 shadow-lg"
            >
              <Volume2 size={20} />
              {t('listenExclaim', uiLang)}
            </button>
          </div>
        </div>

        {/* Sound Card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-lg border border-white/50 dark:border-gray-700/50">
          <div className="flex items-center gap-4">
            <button
              onClick={speakSound}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${letter.color} flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:scale-110`}
            >
              <span className="text-3xl">{letter.emoji}</span>
            </button>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                {t('letterSound', uiLang)}
              </p>
              <p className="text-lg font-bold mt-0.5">
                <span className={`text-2xl bg-gradient-to-r ${letter.color} bg-clip-text text-transparent`}>{letter.letter}</span>
                {' '}{t('asIn', uiLang)}{' '}
                <button onClick={speakSound} className="underline decoration-dotted decoration-2 hover:text-brand-600 font-black">
                  {letter.soundWord}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Words Section */}
        <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
          <span>📝</span>
          {tReplace('wordsWithLetter', uiLang, { letter: letter.letter })}
        </h3>
        <div className="space-y-2 mb-4">
          {letter.words.map((w, i) => (
            <button
              key={i}
              onClick={() => speakWord(w)}
              className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 text-start shadow-md border border-white/50 dark:border-gray-700/50 active:scale-[0.97] transition-all hover:shadow-lg"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${letter.color} flex items-center justify-center shadow-md text-3xl`}>
                {w.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg">{w.word}</span>
                  <Volume2 size={14} className="text-brand-500 shrink-0 animate-pulse" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{lf(w, 'translation', uiLang)}</p>
                <p className="text-xs text-gray-400 italic mt-0.5 truncate">"{w.sentence}"</p>
              </div>
            </button>
          ))}
        </div>

        {/* Fun Fact */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-2xl p-4 mb-4 border-2 border-yellow-300 dark:border-yellow-800 shadow-md">
          <div className="flex items-start gap-2">
            <span className="text-2xl animate-float">💡</span>
            <div>
              <p className="text-xs font-black text-yellow-700 dark:text-yellow-400 uppercase tracking-wider mb-1">
                {t('funFact', uiLang)}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {lf(letter, 'funFact', uiLang)}
              </p>
            </div>
          </div>
        </div>

        {/* Play Games Button */}
        <button
          onClick={onStartGame}
          className={`w-full py-5 rounded-2xl font-black text-white text-xl bg-gradient-to-r ${letter.color} shadow-2xl active:scale-[0.97] transition-all flex items-center justify-center gap-3 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/10 animate-pulse" style={{ animationDuration: '2s' }} />
          <span className="relative flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            {t('letsPlay', uiLang)}
            <Sparkles size={22} className="animate-sparkle" />
          </span>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   GAMES - 4 creative mini-games per letter
   ══════════════════════════════════════════ */

/* Game 1: Find the Letter - Whack-a-mole style */
function FindLetterGame({ letter, onComplete }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();
  const [found, setFound] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const findTimersRef = useRef([]);
  useEffect(() => () => { findTimersRef.current.forEach(clearTimeout); }, []);

  // Read instruction aloud when game loads
  useEffect(() => {
    const instruction = tReplace('findAllLettersInstruction', uiLang, { upper: letter.letter, lower: letter.lower });
    speak(instruction, { lang: uiLang, rate: 0.9 });
  }, []);

  const letters = useMemo(() => {
    const others = shuffle(alphabetData.filter(l => l.letter !== letter.letter))
      .slice(0, 6)
      .map(l => ({ char: Math.random() > 0.5 ? l.letter : l.lower, isTarget: false, color: l.color }));
    const targets = [
      { char: letter.letter, isTarget: true, color: letter.color },
      { char: letter.lower, isTarget: true, color: letter.color },
      { char: letter.letter, isTarget: true, color: letter.color },
    ];
    return shuffle([...others, ...targets]);
  }, [letter]);

  const totalTargets = letters.filter(l => l.isTarget).length;

  const handleTap = (l, i) => {
    if (found.includes(i)) return;
    speak(l.char, { rate: 0.6 });
    if (l.isTarget) {
      const newFound = [...found, i];
      setFound(newFound);
      if (newFound.length >= totalTargets) {
        setShowConfetti(true);
        findTimersRef.current.push(setTimeout(onComplete, 1200));
      }
    } else {
      setWrong(i);
      findTimersRef.current.push(setTimeout(() => setWrong(null), 500));
    }
  };

  return (
    <div className="text-center">
      <ConfettiBurst show={showConfetti} />
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-4 mb-4">
        <p className="text-lg font-black mb-1">
          {tReplace('findTheLetterTitle', uiLang, { letter: letter.letter })}
        </p>
        <p className="text-sm text-gray-500 font-medium">
          {tReplace('tapEveryLetterYouSee', uiLang, { upper: letter.letter, lower: letter.lower })}
        </p>
        <div className="flex items-center justify-center gap-4">
          <span className={`text-5xl font-black bg-gradient-to-r ${letter.color} bg-clip-text text-transparent animate-jelly`}>
            {letter.letter}
          </span>
          <span className={`text-5xl font-black bg-gradient-to-r ${letter.color} bg-clip-text text-transparent animate-jelly`} style={{ animationDelay: '0.2s' }}>
            {letter.lower}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {letters.map((l, i) => (
          <button
            key={i}
            onClick={() => handleTap(l, i)}
            disabled={found.includes(i)}
            className={`aspect-square rounded-2xl text-3xl font-black flex items-center justify-center transition-all duration-300 border-2 ${
              found.includes(i)
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 scale-90 border-emerald-400 animate-success-flash'
                : wrong === i
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-500 animate-shake border-red-400'
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/50 dark:border-gray-700 hover:scale-110 active:scale-90 shadow-lg'
            }`}
          >
            {found.includes(i) ? <span className="animate-pop-in">✅</span> : l.char}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        {[...Array(totalTargets)].map((_, i) => (
          <Heart
            key={i}
            size={20}
            className={`transition-all duration-300 ${
              i < found.length ? 'text-pink-500 fill-pink-500 scale-125' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* Game 2: Match Word to Emoji - Drag-style matching */
function MatchWordGame({ letter, onComplete }) {
  const { uiLang } = useTheme();
  const { speak, speakSequence } = useSpeech();
  const [matched, setMatched] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongPair, setWrongPair] = useState(null);
  const matchTimersRef = useRef([]);
  useEffect(() => () => { matchTimersRef.current.forEach(clearTimeout); }, []);

  // Read instruction aloud when game loads
  useEffect(() => {
    const instruction = t('tapWordThenPicture', uiLang);
    speak(instruction, { lang: uiLang, rate: 0.9 });
  }, []);

  // Limit to 3 words for young kids (ages 3-8) - 5 pairs is too overwhelming
  const words = useMemo(() => shuffle(letter.words).slice(0, 3).map((w, i) => ({ ...w, id: i })), [letter]);
  const shuffledEmojis = useMemo(() => shuffle(words), [words]);

  const handleWordTap = (w) => {
    // Allow deselecting by tapping same word again
    if (selectedWord === w.id) {
      setSelectedWord(null);
      return;
    }
    speakSequence([
      { text: w.word, lang: 'en-US', rate: 0.6 },
      { pause: 400 },
      { text: lf(w, 'translation', uiLang), lang: uiLang, rate: 0.85 },
    ]);
    setSelectedWord(w.id);
    setWrongPair(null);
  };

  const handleEmojiTap = (w) => {
    if (selectedWord === null) return;
    if (selectedWord === w.id) {
      const newMatched = [...matched, w.id];
      setMatched(newMatched);
      setSelectedWord(null);
      // Speak translation in user's native language on match
      speakSequence([
        { text: w.word, lang: 'en-US', rate: 0.6 },
        { pause: 300 },
        { text: lf(w, 'translation', uiLang), lang: uiLang, rate: 0.85 },
      ]);
      if (newMatched.length >= words.length) {
        setShowConfetti(true);
        matchTimersRef.current.push(setTimeout(onComplete, 1000));
      }
    } else {
      setWrongPair(w.id);
      setSelectedWord(null);
      matchTimersRef.current.push(setTimeout(() => setWrongPair(null), 500));
    }
  };

  return (
    <div className="text-center">
      <ConfettiBurst show={showConfetti} />
      <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-3 mb-4">
        <p className="text-lg font-black">
          {t('matchWordToPicture', uiLang)} {letter.emoji}
        </p>
        <p className="text-sm text-gray-500 font-medium mt-1">
          {t('tapWordThenPicture', uiLang)}
        </p>
      </div>
      <div className="flex gap-4 justify-center">
        {/* Words column */}
        <div className="flex flex-col gap-3">
          {words.map(w => (
            <button
              key={w.id}
              disabled={matched.includes(w.id)}
              onClick={() => handleWordTap(w)}
              className={`px-5 py-4 rounded-2xl font-black text-base transition-all border-2 ${
                matched.includes(w.id)
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 border-emerald-400 line-through animate-success-flash'
                  : selectedWord === w.id
                    ? `bg-gradient-to-r ${letter.color} text-white border-transparent shadow-xl scale-110`
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/50 dark:border-gray-700 shadow-md active:scale-95'
              }`}
            >
              {matched.includes(w.id) ? '✅' : w.word}
            </button>
          ))}
        </div>
        {/* Emoji column */}
        <div className="flex flex-col gap-3">
          {shuffledEmojis.map(w => (
            <button
              key={w.id}
              disabled={matched.includes(w.id)}
              onClick={() => handleEmojiTap(w)}
              className={`w-16 h-[56px] rounded-2xl text-3xl flex items-center justify-center transition-all border-2 ${
                matched.includes(w.id)
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 scale-90'
                  : wrongPair === w.id
                    ? 'bg-red-100 dark:bg-red-900/40 border-red-400 animate-shake'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/50 dark:border-gray-700 shadow-md hover:scale-110 active:scale-90'
              }`}
            >
              {matched.includes(w.id) ? <span className="animate-pop-in">⭐</span> : w.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Game 3: Uppercase/Lowercase Match */
const ENCOURAGEMENT_PHRASES_BY_LANG = {
  he: [
    'לא נורא, נסו שוב!',
    'כמעט! בואו ננסה שוב',
    'בואו ננסה פעם נוספת!',
    'לא קרה כלום, נסו שוב!',
  ],
  ar: [
    'لا بأس، حاولوا مرة أخرى!',
    'تقريباً! هيا نحاول مرة أخرى',
    'هيا نحاول مرة أخرى!',
    'لا شيء، حاولوا مرة أخرى!',
  ],
  ru: [
    'Ничего страшного, попробуйте снова!',
    'Почти! Давайте попробуем ещё раз',
    'Давайте попробуем ещё раз!',
    'Не беда, попробуйте снова!',
  ],
  en: [
    'No worries, try again!',
    'Almost! Let\'s try again',
    'Let\'s try one more time!',
    'No problem, try again!',
  ],
};

function CaseMatchGame({ letter, onComplete }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(null); // the wrong option picked
  const [encourageMsg, setEncourageMsg] = useState('');
  const caseTimersRef = useRef([]);
  useEffect(() => () => { caseTimersRef.current.forEach(clearTimeout); }, []);

  // Read instruction aloud when game loads
  useEffect(() => {
    const instruction = tReplace('uppercaseFindLowercaseInstruction', uiLang, { letter: letter.letter });
    speak(instruction, { lang: uiLang, rate: 0.9 });
  }, []);

  // All questions are about the SAME letter the child chose to learn.
  // Each question shows the uppercase and asks to find the lowercase,
  // but with different distractor options each time.
  const questions = useMemo(() => {
    const others = alphabetData.filter(l => l.letter !== letter.letter);
    const numQuestions = 3;
    const qs = [];
    for (let i = 0; i < numQuestions; i++) {
      // Pick 3 random wrong lowercase letters as distractors
      const distractors = shuffle(others).slice(0, 3).map(l => l.lower);
      qs.push({
        prompt: letter.letter,
        correct: letter.lower,
        color: letter.color,
        options: shuffle([letter.lower, ...distractors]),
      });
    }
    return qs;
  }, [letter]);

  const handleAnswer = (opt) => {
    speak(opt, { rate: 0.6 });
    const isCorrect = opt === questions[current].correct;

    if (isCorrect) {
      // Clear any wrong state and advance
      setWrongAnswer(null);
      setEncourageMsg('');
      const newAnswers = [...answers, true];
      setAnswers(newAnswers);

      caseTimersRef.current.push(setTimeout(() => {
        if (current + 1 >= questions.length) {
          setShowConfetti(true);
          caseTimersRef.current.push(setTimeout(onComplete, 800));
        } else {
          setCurrent(c => c + 1);
        }
      }, 600));
    } else {
      // Wrong answer — show feedback, don't advance
      playWrong();
      setWrongAnswer(opt);
      const phrases = ENCOURAGEMENT_PHRASES_BY_LANG[uiLang] || ENCOURAGEMENT_PHRASES_BY_LANG.en;
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      setEncourageMsg(phrase);
      caseTimersRef.current.push(setTimeout(() => speak(phrase, { lang: uiLang, rate: 0.95, _queued: true }), 300));
    }
  };

  if (current >= questions.length) return null;
  const q = questions[current];
  const isAnswered = answers.length > current;

  return (
    <div className="text-center">
      <ConfettiBurst show={showConfetti} />
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-950/30 dark:to-yellow-950/30 rounded-2xl p-3 mb-4">
        <p className="text-lg font-black">
          {tReplace('findLowercaseTitle', uiLang, { letter: letter.letter })}
        </p>
        <p className="text-sm text-gray-500 font-medium mt-1">
          {tReplace('uppercaseFindLowercaseHint', uiLang, { letter: letter.letter })}
        </p>
      </div>

      <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${q.color} flex items-center justify-center mx-auto mb-6 shadow-2xl`}>
        <span className="text-6xl font-black text-white drop-shadow-lg animate-jelly">
          {q.prompt}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {q.options.map((opt, i) => {
          const isCorrectOpt = opt === q.correct;
          const isWrongPick = wrongAnswer === opt;
          const showCorrectHighlight = isAnswered && isCorrectOpt;
          const showWrongHighlight = wrongAnswer && isWrongPick;
          const showCorrectHint = wrongAnswer && isCorrectOpt;
          return (
            <button
              key={i}
              onClick={() => !isAnswered && handleAnswer(opt)}
              disabled={isAnswered}
              className={`py-5 rounded-2xl text-4xl font-black transition-all duration-300 border-2 ${
                showCorrectHighlight
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 border-emerald-400 scale-110 animate-success-flash'
                  : showWrongHighlight
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-500 border-red-400 animate-shake'
                    : showCorrectHint
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 ring-2 ring-emerald-300'
                      : wrongAnswer && !isCorrectOpt
                        ? 'opacity-30 border-transparent'
                        : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/50 dark:border-gray-700 shadow-lg hover:scale-110 active:scale-90'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Encouragement message */}
      {encourageMsg && !isAnswered && (
        <div className="mt-3 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 animate-fade-in">
          <p className="text-sm font-bold text-amber-700 dark:text-amber-300" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>{encourageMsg}</p>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-5">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i < current ? (answers[i] ? 'bg-emerald-400 scale-125' : 'bg-red-400')
                : i === current ? `bg-gradient-to-r ${letter.color} w-6 scale-110`
                  : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* Game 4: Listen & Choose - hear a word, pick the right emoji */
function ListenChooseGame({ letter, onComplete }) {
  const { uiLang } = useTheme();
  const { speak, speakSequence, stopSpeaking } = useSpeech();
  const listenTimersRef = useRef([]);
  useEffect(() => () => { listenTimersRef.current.forEach(clearTimeout); }, []);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const speakRef = useRef(speak);
  speakRef.current = speak;
  const stopSpeakingRef = useRef(stopSpeaking);
  stopSpeakingRef.current = stopSpeaking;

  // Read instruction aloud with Jessica voice on mount
  useEffect(() => {
    const instruction = t('tapSpeakerPickPicture', uiLang);
    speak(instruction, { lang: uiLang, rate: 0.9 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const questions = useMemo(() => {
    return letter.words.map(w => {
      const wrongs = shuffle(alphabetData.filter(l => l.letter !== letter.letter))
        .slice(0, 2)
        .map(l => l.words[Math.floor(Math.random() * l.words.length)]);
      const options = shuffle([
        { ...w, isCorrect: true },
        { ...wrongs[0], isCorrect: false },
        { ...wrongs[1], isCorrect: false },
      ]);
      return { targetWord: w.word, targetTranslation: lf(w, 'translation', uiLang), options };
    });
  }, [letter]);

  useEffect(() => {
    if (current < questions.length) {
      const speakTimer = setTimeout(() => {
        // Cancel any ongoing speech before speaking next question
        if (stopSpeakingRef.current) stopSpeakingRef.current();
        speakRef.current(questions[current].targetWord, { rate: 0.6 });
      }, 600);
      return () => clearTimeout(speakTimer);
    }
  }, [current, questions]);

  const handlePick = (opt) => {
    if (result !== null) return;
    if (opt.isCorrect) {
      setResult('correct');
      setScore(s => s + 1);
      speakSequence([
        { text: opt.word, lang: 'en-US', rate: 0.6 },
        { pause: 400 },
        { text: lf(opt, 'translation', uiLang), lang: uiLang, rate: 0.85 },
      ]);
      listenTimersRef.current.push(setTimeout(() => {
        setResult(null);
        if (current + 1 >= questions.length) {
          setShowConfetti(true);
          listenTimersRef.current.push(setTimeout(onComplete, 500));
        } else {
          setCurrent(c => c + 1);
        }
      }, 2500));
    } else {
      setResult('wrong');
      listenTimersRef.current.push(setTimeout(() => setResult(null), 600));
    }
  };

  if (current >= questions.length) return null;
  const q = questions[current];

  return (
    <div className="text-center">
      <ConfettiBurst show={showConfetti} />
      <div className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-950/30 dark:to-teal-950/30 rounded-2xl p-3 mb-4">
        <p className="text-lg font-black">
          {t('listenAndChooseTitle', uiLang)}
        </p>
        <p className="text-sm text-gray-500 font-medium mt-1">
          {t('tapSpeakerPickPicture', uiLang)}
        </p>
      </div>

      {/* Big speaker button */}
      <button
        onClick={() => speak(q.targetWord, { rate: 0.6 })}
        className={`w-24 h-24 rounded-full bg-gradient-to-br ${letter.color} flex items-center justify-center mx-auto mb-6 shadow-2xl active:scale-90 transition-transform relative`}
      >
        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'inherit' }} />
        <Volume2 size={40} className="text-white drop-shadow-lg" />
      </button>

      {/* Options */}
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handlePick(opt)}
            className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 border-2 ${
              result === 'correct' && opt.isCorrect
                ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 scale-110 animate-success-flash'
                : result === 'wrong' && !opt.isCorrect
                  ? 'opacity-30 border-transparent'
                  : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/50 dark:border-gray-700 shadow-lg hover:scale-105 active:scale-90'
            }`}
          >
            <span className="text-4xl">{opt.emoji}</span>
            <span className="text-xs font-bold">{opt.word}</span>
          </button>
        ))}
      </div>

      {/* Score */}
      <div className="flex justify-center gap-1 mt-4">
        {questions.map((_, i) => (
          <Zap
            key={i}
            size={16}
            className={`transition-all duration-300 ${
              i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   GAME FLOW - Manages 4 games sequentially
   ══════════════════════════════════════════ */
const COMPLETION_PHRASES_HE = [
  'כל הכבוד! הצלחתם לצבור כוכבים! בואו נמשיך',
  'מדהים! עשיתם עבודה נהדרת!',
  'ספיקלי גאה בכם! המשיכו כך!',
  'יופי! סיימתם בהצלחה!',
];
const COMPLETION_PHRASES_EN = [
  'Great job! You earned stars! Let\'s continue!',
  'Amazing! You did a great job!',
  'Speakli is proud of you! Keep it up!',
  'Awesome! You finished successfully!',
];
const COMPLETION_PHRASES_AR = [
  'أحسنتم! جمعتم نجومًا! هيا نكمل',
  'رائع! عمل ممتاز!',
  'سبيكلي فخور بكم! استمروا هكذا!',
  'ممتاز! أنهيتم بنجاح!',
];
const COMPLETION_PHRASES_RU = [
  'Молодцы! Вы собрали звёзды! Давайте продолжим',
  'Потрясающе! Отличная работа!',
  'Спикли гордится вами! Так держать!',
  'Супер! Вы успешно закончили!',
];

function GameFlow({ letter, onComplete, onBack }) {
  const { uiLang } = useTheme();
  const { speak } = useSpeech();
  const [gameIndex, setGameIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const flowTimersRef = useRef([]);
  useEffect(() => () => { flowTimersRef.current.forEach(clearTimeout); }, []);

  // Speak congratulations when completing all games
  useEffect(() => {
    if (showComplete) {
      const PHRASES_BY_LANG = { he: COMPLETION_PHRASES_HE, ar: COMPLETION_PHRASES_AR, ru: COMPLETION_PHRASES_RU };
      const phrases = PHRASES_BY_LANG[uiLang] || COMPLETION_PHRASES_EN;
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      const timer = setTimeout(() => {
        speak(phrase, { lang: uiLang, rate: 0.9 });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showComplete]);

  const games = [
    { component: FindLetterGame, name: t('gameFindLetter', uiLang), color: 'from-purple-500 to-pink-500' },
    { component: MatchWordGame, name: t('gameMatchWords', uiLang), color: 'from-blue-500 to-cyan-500' },
    { component: CaseMatchGame, name: t('gameBigSmall', uiLang), color: 'from-orange-500 to-yellow-500' },
    { component: ListenChooseGame, name: t('gameListenPick', uiLang), color: 'from-green-500 to-teal-500' },
  ];

  const handleGameComplete = useCallback(() => {
    setStars(s => s + 1);
    if (gameIndex + 1 >= games.length) {
      setShowComplete(true);
    } else {
      flowTimersRef.current.push(setTimeout(() => setGameIndex(i => i + 1), 600));
    }
  }, [gameIndex, games.length]);

  if (showComplete) {
    return (
      <div className="kids-bg min-h-screen relative">
        <FloatingDecorations />
        <ConfettiBurst show={true} />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
          <SpeakliAvatar mode="celebrate" size="xl" glow />
          <h2 className="text-4xl font-black py-2 mb-2 mt-2" style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('speakliProud', uiLang)}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4 font-medium">
            {tReplace('youMasteredLetter', uiLang, { letter: letter.letter })}
          </p>
          <div className="flex gap-2 mb-6">
            {[0, 1, 2, 3].map(i => (
              <Star
                key={i}
                size={40}
                className={`transition-all duration-500 ${
                  i < stars ? 'text-yellow-400 fill-yellow-400 animate-pop-in' : 'text-gray-300'
                }`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl px-6 py-3 mb-6 shadow-lg">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-yellow-500" />
              <span className="text-lg font-bold text-yellow-600">+15 XP</span>
            </div>
          </div>
          <button
            onClick={() => onComplete(letter.letter)}
            className={`px-10 py-5 rounded-2xl font-black text-white text-xl bg-gradient-to-r ${letter.color} shadow-2xl active:scale-[0.97] transition-all`}
          >
            {t('continue', uiLang)} ✨
          </button>
        </div>
      </div>
    );
  }

  const GameComponent = games[gameIndex].component;

  return (
    <div className="kids-bg min-h-screen pb-24 px-4 pt-2 relative">
      <FloatingDecorations />
      <div className="relative z-10">
        {/* Game header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 bg-white/50 dark:bg-gray-800/50 rounded-full p-2 backdrop-blur-sm">
            <ArrowLeft size={18} className={RTL_LANGS.includes(uiLang) ? 'rotate-180' : ''} />
          </button>
          <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${letter.color} flex items-center justify-center`}>
              <span className="text-xs font-black text-white">{letter.letter}</span>
            </div>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
              {games[gameIndex].name}
            </span>
          </div>
          <div className="flex gap-1">
            {games.map((g, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i < gameIndex ? 'w-2 bg-emerald-400' : i === gameIndex ? `w-6 bg-gradient-to-r ${g.color}` : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-1.5 mb-4">
          {[0, 1, 2, 3].map(i => (
            <Star
              key={i}
              size={24}
              className={`transition-all duration-500 ${
                i < stars ? 'text-yellow-400 fill-yellow-400 scale-125' : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Game */}
        <div className="animate-fade-in" key={gameIndex}>
          <GameComponent letter={letter} onComplete={handleGameComplete} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE - Orchestrates views
   ══════════════════════════════════════════ */
export default function KidsAlphabetPage() {
  const { progress, updateProgress, addXP } = useUserProgress();
  const [view, setView] = useState('grid');
  const [selectedLetter, setSelectedLetter] = useState(null);

  // Stop any lingering audio on unmount
  useEffect(() => {
    return () => stopAllAudio();
  }, []);

  const completedLetters = progress.lettersCompleted || [];

  const handleSelectLetter = (letterData) => {
    setSelectedLetter(letterData);
    setView('detail');
  };

  const handleStartGame = () => setView('game');

  const handleGameComplete = async (letterChar) => {
    if (!completedLetters.includes(letterChar)) {
      const updated = [...completedLetters, letterChar];
      await updateProgress({ lettersCompleted: updated });
    }
    await addXP(15, 'alphabet');
    setView('grid');
    setSelectedLetter(null);
  };

  const handleBackToGrid = () => { setView('grid'); setSelectedLetter(null); };
  const handleBackToDetail = () => setView('detail');

  switch (view) {
    case 'detail':
      return <LetterDetail letter={selectedLetter} onBack={handleBackToGrid} onStartGame={handleStartGame} />;
    case 'game':
      return <GameFlow letter={selectedLetter} onComplete={handleGameComplete} onBack={handleBackToDetail} />;
    default:
      return <LetterGrid onSelect={handleSelectLetter} completedLetters={completedLetters} />;
  }
}
