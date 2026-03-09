import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { RotateCcw, Grid3x3, Volume2, ChevronRight, ChevronLeft, Check, X, ArrowLeft, BookOpen, Lightbulb, AlertTriangle, Star, Sparkles, Eye, EyeOff, Bookmark, ArrowRight, Shuffle, Zap, GraduationCap, Brain, Trophy, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProgress } from '../contexts/UserProgressContext.jsx';
import { t, tReplace, RTL_LANGS, lf } from '../utils/translations.js';
import { shuffle } from '../utils/shuffle.js';
import { preloadEnglishAudio, preloadHebrewAudio } from '../utils/hebrewAudio.js';
import useSpacedRepetition from '../hooks/useSpacedRepetition.js';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis.js';
import KidsIntro from '../components/kids/KidsIntro.jsx';
import GlassCard from '../components/shared/GlassCard.jsx';
import AnimatedButton from '../components/shared/AnimatedButton.jsx';
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx';
import Modal from '../components/shared/Modal.jsx';

import { loadWordData } from '../utils/lazyData.js';
import useContentGate from '../hooks/useContentGate.js';
import PaywallModal from '../components/subscription/PaywallModal.jsx';

// ── Word Detail Modal ────────────────────────────────────
function WordDetailModal({ word, onClose, onSpeak, onAddToVocab, uiLang, isInVocab }) {
  if (!word) return null;
  const isRtl = RTL_LANGS.includes(uiLang);

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{word.word}</h2>
            <button
              onClick={() => onSpeak(word.word)}
              aria-label="Listen"
              className="p-2 rounded-full hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
            >
              <Volume2 size={22} className="text-brand-500" />
            </button>
          </div>
          <p className="text-sm text-gray-400">{word.ipa}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">
              {word.partOfSpeech}
            </span>
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium">
              {word.cefrLevel}
            </span>
          </div>
        </div>

        {/* Translation & Definition */}
        <div className="bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-brand-950/30 dark:to-emerald-950/30 rounded-2xl p-4">
          <h3 className="text-2xl font-bold text-brand-600 dark:text-brand-400 text-center mb-1">{lf(word, 'translation', uiLang)}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{word.definition}</p>
          {uiLang !== 'en' && lf(word, 'definition', uiLang) && lf(word, 'definition', uiLang) !== word.definition && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>{lf(word, 'definition', uiLang)}</p>
          )}
        </div>

        {/* Examples */}
        {word.examples?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {t('examples', uiLang)}
            </h4>
            <div className="space-y-2">
              {word.examples.map((ex, i) => (
                <div key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <button onClick={() => onSpeak(ex)} aria-label="Listen" className="mt-0.5 shrink-0">
                    <Volume2 size={14} className="text-brand-400" />
                  </button>
                  <p className="text-sm text-gray-700 dark:text-gray-200 italic">"{ex}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collocations */}
        {word.collocations?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {t('commonCollocations', uiLang)}
            </h4>
            <div className="flex flex-wrap gap-2">
              {word.collocations.map((col, i) => (
                <button
                  key={i}
                  onClick={() => onSpeak(col)}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        {(word.tip || word.tipHe) && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <Lightbulb size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  {t('tip', uiLang)}
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-200" dir={isRtl ? 'rtl' : 'ltr'}>
                  {isRtl ? (word.tipHe || word.tip) : word.tip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Common Mistakes */}
        {word.commonMistakes?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {t('vocabCommonMistakes', uiLang)}
            </h4>
            <div className="space-y-2">
              {word.commonMistakes.map((mistake, i) => (
                <div key={i} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <X size={14} className="text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400 line-through">{mistake.wrong}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Check size={14} className="text-emerald-500" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{mistake.correct}</span>
                  </div>
                  {mistake.explanation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-6" dir={isRtl ? 'rtl' : 'ltr'}>{mistake.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Synonyms */}
        {word.synonyms?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {t('synonyms', uiLang)}
            </h4>
            <div className="flex flex-wrap gap-2">
              {word.synonyms.map((syn, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                  {syn}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Audio Hint */}
        {word.audioHint && (
          <div className="text-center py-2">
            <p className="text-xs text-gray-400">
              {t('pronunciationColon', uiLang)} <span className="font-mono text-brand-500">{word.audioHint}</span>
            </p>
          </div>
        )}

        {/* Add to Vocabulary Button */}
        {!isInVocab && (
          <AnimatedButton
            onClick={() => onAddToVocab(word)}
            variant="primary"
            className="w-full"
          >
            <Bookmark size={16} className="mr-2" />
            {t('addToMyVocabulary', uiLang)}
          </AnimatedButton>
        )}
      </div>
    </Modal>
  );
}

// ── Learn New Words Flow ────────────────────────────────
function LearnWordsFlow({ words, onComplete, onBack, onAddToVocab }) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro, examples, collocations, practice, done
  const [showTranslation, setShowTranslation] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceResult, setPracticeResult] = useState(null);
  const [learnedCount, setLearnedCount] = useState(0);
  const { speak, speakWordPair } = useSpeechSynthesis();
  const { uiLang } = useTheme();
  const isRtl = RTL_LANGS.includes(uiLang);
  const inputRef = useRef(null);

  const word = words[step];
  if (!word) return null;

  const totalWords = words.length;
  const progress = ((step) / totalWords) * 100;

  const nextPhase = () => {
    if (phase === 'intro') {
      setPhase('examples');
    } else if (phase === 'examples') {
      if (word.collocations?.length > 0 || word.commonMistakes?.length > 0) {
        setPhase('collocations');
      } else {
        setPhase('practice');
      }
    } else if (phase === 'collocations') {
      setPhase('practice');
    } else if (phase === 'practice') {
      onAddToVocab(word);
      setLearnedCount(prev => prev + 1);
      if (step < totalWords - 1) {
        setStep(step + 1);
        setPhase('intro');
        setShowTranslation(false);
        setPracticeAnswer('');
        setPracticeResult(null);
      } else {
        setPhase('done');
      }
    }
  };

  const checkPractice = () => {
    const correct = (lf(word, 'translation', uiLang) || '').trim();
    const answer = practiceAnswer.trim();
    if (answer === correct || answer === word.word) {
      setPracticeResult('correct');
      // Speak the English word, then the native-language translation
      speakWordPair(word.word, lf(word, 'translation', uiLang), uiLang);
    } else {
      setPracticeResult('wrong');
      // On wrong answer, speak the correct translation
      speak(lf(word, 'translation', uiLang), { lang: uiLang, rate: 0.9 });
    }
  };

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-4 animate-bounce-in">
          <Trophy size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('wellDone', uiLang)}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-1">
          {tReplace('youLearnedCount', uiLang, { count: learnedCount })}
        </p>
        <p className="text-sm text-brand-500 font-medium mb-6">
          +{learnedCount * 5} XP
        </p>
        <AnimatedButton onClick={onComplete} variant="primary" className="w-full max-w-xs">
          {t('done', uiLang)}
        </AnimatedButton>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} />
        </button>
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-brand-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {step + 1}/{totalWords}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── INTRO PHASE ── */}
      {phase === 'intro' && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center py-2">
            <p className="text-xs uppercase tracking-widest text-brand-500 font-semibold mb-3">
              {t('newWord', uiLang)}
            </p>
          </div>

          <GlassCard variant="strong" className="text-center py-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-emerald-400 to-teal-400" />

            <button
              onClick={() => speakWordPair(word.word, lf(word, 'translation', uiLang), uiLang)}
              aria-label="Listen"
              className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow active:scale-95"
            >
              <Volume2 size={24} className="text-white" />
            </button>

            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{word.word}</h2>
            <span className="inline-block px-3 py-1 text-xs rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">
              {word.partOfSpeech}
            </span>

            {word.audioHint && (
              <p className="mt-3 text-xs text-gray-400">
                {t('sayColon', uiLang)} <span className="font-mono text-brand-400 font-medium">{word.audioHint}</span>
              </p>
            )}
          </GlassCard>

          {/* Translation reveal */}
          <GlassCard className="text-center py-6">
            {showTranslation ? (
              <div className="animate-fade-in space-y-2">
                <h3 className="text-2xl font-bold text-brand-600 dark:text-brand-400">{lf(word, 'translation', uiLang)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{word.definition}</p>
                {uiLang !== 'en' && lf(word, 'definition', uiLang) && lf(word, 'definition', uiLang) !== word.definition && (
                  <p className="text-sm text-gray-500 dark:text-gray-400" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>{lf(word, 'definition', uiLang)}</p>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowTranslation(true);
                  // Speak the translation when revealed
                  speak(lf(word, 'translation', uiLang), { lang: uiLang, rate: 0.9 });
                }}
                className="flex items-center justify-center gap-2 mx-auto text-brand-500 hover:text-brand-600 transition-colors"
              >
                <Eye size={18} />
                <span className="font-medium">{t('tapForTranslation', uiLang)}</span>
              </button>
            )}
          </GlassCard>

          {/* Tip */}
          {(word.tip || word.tipHe) && showTranslation && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 animate-slide-up">
              <div className="flex items-start gap-2">
                <Lightbulb size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200" dir={isRtl ? 'rtl' : 'ltr'}>
                  {isRtl ? (word.tipHe || word.tip) : word.tip}
                </p>
              </div>
            </div>
          )}

          {showTranslation && (
            <AnimatedButton onClick={nextPhase} variant="primary" className="w-full">
              {t('continue', uiLang)}
              <ArrowRight size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
            </AnimatedButton>
          )}
        </div>
      )}

      {/* ── EXAMPLES PHASE ── */}
      {phase === 'examples' && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center py-2">
            <p className="text-xs uppercase tracking-widest text-emerald-500 font-semibold mb-1">
              {t('examplesInContext', uiLang)}
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{word.word}</h3>
          </div>

          <div className="space-y-3">
            {word.examples?.map((ex, i) => (
              <GlassCard key={i} className="!p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => speak(ex)}
                    aria-label="Listen"
                    className="mt-1 shrink-0 w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center"
                  >
                    <Volume2 size={14} className="text-brand-500" />
                  </button>
                  <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
                    {ex.split(new RegExp(`(${word.word})`, 'gi')).map((part, j) =>
                      part.toLowerCase() === word.word.toLowerCase()
                        ? <span key={j} className="font-bold text-brand-600 dark:text-brand-400 underline decoration-brand-300">{part}</span>
                        : part
                    )}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Synonyms if any */}
          {word.synonyms?.length > 0 && (
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4">
              <p className="text-xs font-semibold text-teal-500 uppercase tracking-wider mb-2">
                {t('similarWords', uiLang)}
              </p>
              <div className="flex flex-wrap gap-2">
                {word.synonyms.map((syn, i) => (
                  <button
                    key={i}
                    onClick={() => speak(syn)}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-teal-700 dark:text-teal-300 shadow-sm"
                  >
                    {syn}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatedButton onClick={nextPhase} variant="primary" className="w-full">
            {t('continue', uiLang)}
            <ArrowRight size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
          </AnimatedButton>
        </div>
      )}

      {/* ── COLLOCATIONS & MISTAKES PHASE ── */}
      {phase === 'collocations' && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center py-2">
            <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold mb-1">
              {t('properUsage', uiLang)}
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{word.word}</h3>
          </div>

          {/* Collocations */}
          {word.collocations?.length > 0 && (
            <GlassCard className="!p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-500" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('commonCollocations', uiLang)}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {word.collocations.map((col, i) => (
                  <button
                    key={i}
                    onClick={() => speak(col)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-medium hover:shadow-md transition-all active:scale-95"
                  >
                    {col}
                  </button>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Common Mistakes */}
          {word.commonMistakes?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-500" />
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('commonMistakes', uiLang)}
                </h4>
              </div>
              <div className="space-y-3">
                {word.commonMistakes.map((mistake, i) => (
                  <GlassCard key={i} className="!p-4 !bg-gradient-to-r from-red-50/50 to-white dark:from-red-950/20 dark:to-gray-900/50 border-red-100 dark:border-red-900/30">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                          <X size={12} className="text-red-500" />
                        </div>
                        <span className="text-sm text-red-600 dark:text-red-400 line-through font-medium">{mistake.wrong}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-emerald-500" />
                        </div>
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">{mistake.correct}</span>
                      </div>
                      {mistake.explanation && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 mr-7" dir={isRtl ? 'rtl' : 'ltr'}>
                          {mistake.explanation}
                        </p>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          <AnimatedButton onClick={nextPhase} variant="primary" className="w-full">
            {t('quickPractice', uiLang)}
            <Brain size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
          </AnimatedButton>
        </div>
      )}

      {/* ── PRACTICE PHASE ── */}
      {phase === 'practice' && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-center py-2">
            <p className="text-xs uppercase tracking-widest text-teal-500 font-semibold mb-1">
              {t('practice', uiLang)}
            </p>
            <h3 className="text-lg text-gray-600 dark:text-gray-300 mb-2">
              {t('whatIsTranslation', uiLang)}
            </h3>
            <button onClick={() => speak(word.word)} aria-label="Listen" className="inline-flex items-center gap-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{word.word}</h2>
              <Volume2 size={20} className="text-brand-400" />
            </button>
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={practiceAnswer}
              onChange={(e) => setPracticeAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !practiceResult && checkPractice()}
              placeholder={t('typeTranslation', uiLang)}
              className={`w-full px-4 py-4 rounded-2xl text-lg text-center font-medium border-2 transition-colors bg-white dark:bg-gray-800 outline-none ${
                practiceResult === 'correct'
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                  : practiceResult === 'wrong'
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 focus:border-brand-400'
              }`}
              dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}
              autoFocus
              disabled={!!practiceResult}
            />
          </div>

          {practiceResult === 'correct' && (
            <div className="text-center animate-bounce-in">
              <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full">
                <Check size={18} />
                <span className="font-bold">{t('practiceCorrect', uiLang)}</span>
              </div>
            </div>
          )}

          {practiceResult === 'wrong' && (
            <div className="text-center animate-fade-in space-y-2">
              <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-full">
                <X size={18} />
                <span className="font-medium">{t('notQuite', uiLang)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('correctAnswerIs', uiLang)}{' '}
                <span className="font-bold text-brand-600 dark:text-brand-400">{lf(word, 'translation', uiLang)}</span>
              </p>
            </div>
          )}

          {!practiceResult ? (
            <AnimatedButton onClick={checkPractice} variant="primary" className="w-full" disabled={!practiceAnswer.trim()}>
              {t('check', uiLang)}
            </AnimatedButton>
          ) : (
            <AnimatedButton onClick={nextPhase} variant="primary" className="w-full">
              {step < totalWords - 1 ? t('nextWord', uiLang) : t('finish', uiLang)}
              <ArrowRight size={16} className="mr-2 rtl:mr-0 rtl:ml-2" />
            </AnimatedButton>
          )}
        </div>
      )}
    </div>
  );
}

// ── Enhanced Review Session ──────────────────────────────
function ReviewSession({ dueWords, onReview, onBack, ALL_WORDS }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { speak } = useSpeechSynthesis();
  const { uiLang } = useTheme();
  const isRtl = RTL_LANGS.includes(uiLang);

  if (dueWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-4">
          <Check size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t('allWordsReviewed', uiLang)}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('comeBackLater', uiLang)}
        </p>
        <AnimatedButton onClick={onBack} variant="secondary">
          {t('back', uiLang)}
        </AnimatedButton>
      </div>
    );
  }

  const word = dueWords[currentIndex];
  if (!word) return null;

  const fullWord = ALL_WORDS.find(w => w.id === word.wordId || w.word === word.word) || word;

  const handleReview = async (quality) => {
    await onReview(word.id, quality);
    setShowAnswer(false);
    setShowDetails(false);
    if (currentIndex < dueWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} />
        </button>
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-amber-500" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {dueWords.length}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div className="progress-bar-fill bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${((currentIndex + 1) / dueWords.length) * 100}%` }} />
      </div>

      {/* Word Card */}
      <GlassCard variant="strong" className="text-center py-8 relative">
        <button
          onClick={() => speak(fullWord.word || word.word)}
          aria-label="Listen"
          className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Volume2 size={24} className="text-white" />
        </button>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {fullWord.word || word.word}
        </h2>
        <p className="text-sm text-gray-400 font-mono">{fullWord.ipa}</p>
        <span className="mt-2 inline-block px-3 py-0.5 text-xs rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300">
          {fullWord.partOfSpeech}
        </span>

        {showAnswer && (
          <div className="mt-6 animate-fade-in space-y-3">
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            <h3 className="text-2xl font-bold text-brand-600 dark:text-brand-400">
              {lf(fullWord, 'translation', uiLang)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{fullWord.definition}</p>
            {uiLang !== 'en' && lf(fullWord, 'definition', uiLang) && lf(fullWord, 'definition', uiLang) !== fullWord.definition && (
              <p className="text-sm text-gray-500 dark:text-gray-400" dir={RTL_LANGS.includes(uiLang) ? 'rtl' : 'ltr'}>{lf(fullWord, 'definition', uiLang)}</p>
            )}
            {fullWord.examples?.[0] && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => speak(fullWord.examples[0])} aria-label="Listen" className="shrink-0">
                  <Volume2 size={12} className="text-brand-400" />
                </button>
                <p className="text-xs text-gray-500 italic">"{fullWord.examples[0]}"</p>
              </div>
            )}

            {/* Expandable details */}
            {(fullWord.collocations?.length > 0 || fullWord.tip) && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-brand-500 underline"
              >
                {showDetails ? t('hideDetails', uiLang) : t('showMoreDetails', uiLang)}
              </button>
            )}

            {showDetails && (
              <div className="space-y-3 animate-fade-in text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                {fullWord.collocations?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {fullWord.collocations.map((col, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs">
                        {col}
                      </span>
                    ))}
                  </div>
                )}
                {(fullWord.tip || fullWord.tipHe) && (
                  <div className="bg-amber-50/70 dark:bg-amber-900/10 rounded-xl p-2.5">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <Lightbulb size={12} className="inline mr-1" />
                      {isRtl ? (fullWord.tipHe || fullWord.tip) : fullWord.tip}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="mt-6 inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm"
          >
            <Eye size={16} />
            {t('showAnswer', uiLang)}
          </button>
        )}
      </GlassCard>

      {/* Rating Buttons */}
      {showAnswer && (
        <div className="grid grid-cols-4 gap-2 animate-slide-up">
          {[
            { key: 'again', label: t('again', uiLang), color: 'from-red-500 to-red-600', sublabel: '<1m' },
            { key: 'hard', label: t('hard', uiLang), color: 'from-orange-500 to-orange-600', sublabel: t('min', uiLang) },
            { key: 'good', label: t('good', uiLang), color: 'from-emerald-500 to-emerald-600', sublabel: t('days', uiLang) },
            { key: 'easy', label: t('easy', uiLang), color: 'from-blue-500 to-blue-600', sublabel: t('vocabWeek', uiLang) },
          ].map(({ key, label, color, sublabel }) => (
            <button
              key={key}
              onClick={() => handleReview(key)}
              className={`bg-gradient-to-b ${color} text-white py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95 shadow-md hover:shadow-lg`}
            >
              <span className="block">{label}</span>
              <span className="block text-[10px] opacity-70 mt-0.5">{sublabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Category Browser ─────────────────────────────────────
function CategoryBrowser({ onSelectCategory, onLearnCategory, userLevel = 'A1', ALL_WORDS, CATEGORIES }) {
  const { uiLang } = useTheme();
  const { isLocked: isContentLocked } = useContentGate();
  const [showPaywall, setShowPaywall] = useState(false);

  const categoryInfo = {
    greetings: { emoji: '👋', labelHe: 'ברכות', labelEn: 'Greetings', labelAr: 'التحيات', labelRu: 'Приветствия', color: 'from-yellow-400 to-orange-400' },
    numbers: { emoji: '🔢', labelHe: 'מספרים', labelEn: 'Numbers', labelAr: 'الأرقام', labelRu: 'Числа', color: 'from-blue-400 to-indigo-400' },
    family: { emoji: '👨‍👩‍👧‍👦', labelHe: 'משפחה', labelEn: 'Family', labelAr: 'العائلة', labelRu: 'Семья', color: 'from-pink-400 to-rose-400' },
    food: { emoji: '🍕', labelHe: 'אוכל', labelEn: 'Food', labelAr: 'الطعام', labelRu: 'Еда', color: 'from-red-400 to-orange-400' },
    home: { emoji: '🏠', labelHe: 'בית', labelEn: 'Home', labelAr: 'البيت', labelRu: 'Дом', color: 'from-amber-400 to-yellow-400' },
    travel: { emoji: '✈️', labelHe: 'טיולים', labelEn: 'Travel', labelAr: 'السفر', labelRu: 'Путешествия', color: 'from-cyan-400 to-blue-400' },
    work: { emoji: '💼', labelHe: 'עבודה', labelEn: 'Work', labelAr: 'العمل', labelRu: 'Работа', color: 'from-gray-400 to-slate-400' },
    body: { emoji: '🫀', labelHe: 'גוף', labelEn: 'Body', labelAr: 'الجسم', labelRu: 'Тело', color: 'from-rose-400 to-pink-400' },
    animals: { emoji: '🐕', labelHe: 'חיות', labelEn: 'Animals', labelAr: 'الحيوانات', labelRu: 'Животные', color: 'from-green-400 to-emerald-400' },
    colors: { emoji: '🎨', labelHe: 'צבעים', labelEn: 'Colors', labelAr: 'الألوان', labelRu: 'Цвета', color: 'from-purple-400 to-pink-400' },
    clothes: { emoji: '👕', labelHe: 'בגדים', labelEn: 'Clothes', labelAr: 'الملابس', labelRu: 'Одежда', color: 'from-violet-400 to-purple-400' },
    time: { emoji: '⏰', labelHe: 'זמן', labelEn: 'Time', labelAr: 'الوقت', labelRu: 'Время', color: 'from-orange-400 to-amber-400' },
    weather: { emoji: '🌤️', labelHe: 'מזג אוויר', labelEn: 'Weather', labelAr: 'الطقس', labelRu: 'Погода', color: 'from-sky-400 to-blue-400' },
    school: { emoji: '🏫', labelHe: 'בית ספר', labelEn: 'School', labelAr: 'المدرسة', labelRu: 'Школа', color: 'from-indigo-400 to-blue-400' },
    shopping: { emoji: '🛒', labelHe: 'קניות', labelEn: 'Shopping', labelAr: 'التسوق', labelRu: 'Покупки', color: 'from-emerald-400 to-teal-400' },
    directions: { emoji: '🧭', labelHe: 'כיוונים', labelEn: 'Directions', labelAr: 'الاتجاهات', labelRu: 'Направления', color: 'from-teal-400 to-cyan-400' },
    emotions: { emoji: '😊', labelHe: 'רגשות', labelEn: 'Emotions', labelAr: 'المشاعر', labelRu: 'Эмоции', color: 'from-yellow-400 to-amber-400' },
    sports: { emoji: '⚽', labelHe: 'ספורט', labelEn: 'Sports', labelAr: 'الرياضة', labelRu: 'Спорт', color: 'from-green-400 to-lime-400' },
    'daily-routines': { emoji: '🌅', labelHe: 'שגרה יומית', labelEn: 'Daily Routines', labelAr: 'الروتين اليومي', labelRu: 'Распорядок дня', color: 'from-orange-400 to-pink-400' },
    nature: { emoji: '🌿', labelHe: 'טבע', labelEn: 'Nature', labelAr: 'الطبيعة', labelRu: 'Природа', color: 'from-lime-400 to-green-400' },
    // A2 categories
    health: { emoji: '🏥', labelHe: 'בריאות', labelEn: 'Health', labelAr: 'الصحة', labelRu: 'Здоровье', color: 'from-red-400 to-rose-400' },
    technology: { emoji: '💻', labelHe: 'טכנולוגיה', labelEn: 'Technology', labelAr: 'التكنولوجيا', labelRu: 'Технологии', color: 'from-blue-400 to-cyan-400' },
    culture: { emoji: '🎭', labelHe: 'תרבות', labelEn: 'Culture', labelAr: 'الثقافة', labelRu: 'Культура', color: 'from-purple-400 to-violet-400' },
    'travel-advanced': { emoji: '🌍', labelHe: 'טיולים מתקדם', labelEn: 'Advanced Travel', labelAr: 'السفر المتقدم', labelRu: 'Путешествия (продв.)', color: 'from-teal-400 to-emerald-400' },
    'work-advanced': { emoji: '📊', labelHe: 'עבודה מתקדם', labelEn: 'Advanced Work', labelAr: 'العمل المتقدم', labelRu: 'Работа (продв.)', color: 'from-slate-400 to-gray-400' },
    'food-advanced': { emoji: '🍽️', labelHe: 'אוכל מתקדם', labelEn: 'Advanced Food', labelAr: 'الطعام المتقدم', labelRu: 'Еда (продв.)', color: 'from-orange-400 to-red-400' },
    education: { emoji: '🎓', labelHe: 'חינוך', labelEn: 'Education', labelAr: 'التعليم', labelRu: 'Образование', color: 'from-indigo-400 to-purple-400' },
    entertainment: { emoji: '🎬', labelHe: 'בידור', labelEn: 'Entertainment', labelAr: 'الترفيه', labelRu: 'Развлечения', color: 'from-pink-400 to-purple-400' },
    environment: { emoji: '🌎', labelHe: 'סביבה', labelEn: 'Environment', labelAr: 'البيئة', labelRu: 'Окружающая среда', color: 'from-green-400 to-teal-400' },
    relationships: { emoji: '💕', labelHe: 'מערכות יחסים', labelEn: 'Relationships', labelAr: 'العلاقات', labelRu: 'Отношения', color: 'from-rose-400 to-pink-400' },
    hobbies: { emoji: '🎯', labelHe: 'תחביבים', labelEn: 'Hobbies', labelAr: 'الهوايات', labelRu: 'Хобби', color: 'from-amber-400 to-orange-400' },
    city: { emoji: '🏙️', labelHe: 'עיר', labelEn: 'City', labelAr: 'المدينة', labelRu: 'Город', color: 'from-gray-400 to-blue-400' },
    transport: { emoji: '🚇', labelHe: 'תחבורה', labelEn: 'Transport', labelAr: 'المواصلات', labelRu: 'Транспорт', color: 'from-blue-400 to-indigo-400' },
    communication: { emoji: '💬', labelHe: 'תקשורת', labelEn: 'Communication', labelAr: 'التواصل', labelRu: 'Общение', color: 'from-cyan-400 to-blue-400' },
    idioms: { emoji: '💡', labelHe: 'ביטויים', labelEn: 'Idioms', labelAr: 'التعابير', labelRu: 'Идиомы', color: 'from-yellow-400 to-orange-400' },
    // B1 categories
    business: { emoji: '💼', labelHe: 'עסקים', labelEn: 'Business', labelAr: 'الأعمال', labelRu: 'Бизнес', color: 'from-slate-400 to-blue-400' },
    // B2 categories
    media: { emoji: '📺', labelHe: 'תקשורת', labelEn: 'Media', labelAr: 'الإعلام', labelRu: 'СМИ', color: 'from-red-400 to-pink-400' },
    politics: { emoji: '🏛️', labelHe: 'פוליטיקה', labelEn: 'Politics', labelAr: 'السياسة', labelRu: 'Политика', color: 'from-blue-400 to-indigo-400' },
    science: { emoji: '🔬', labelHe: 'מדע', labelEn: 'Science', labelAr: 'العلوم', labelRu: 'Наука', color: 'from-cyan-400 to-teal-400' },
    finance: { emoji: '💰', labelHe: 'פיננסים', labelEn: 'Finance', labelAr: 'المالية', labelRu: 'Финансы', color: 'from-green-400 to-emerald-400' },
    psychology: { emoji: '🧠', labelHe: 'פסיכולוגיה', labelEn: 'Psychology', labelAr: 'علم النفس', labelRu: 'Психология', color: 'from-purple-400 to-violet-400' },
    law: { emoji: '⚖️', labelHe: 'משפט', labelEn: 'Law', labelAr: 'القانون', labelRu: 'Право', color: 'from-gray-400 to-slate-400' },
    'abstract-concepts': { emoji: '💭', labelHe: 'מושגים מופשטים', labelEn: 'Abstract Concepts', labelAr: 'المفاهيم المجردة', labelRu: 'Абстрактные понятия', color: 'from-indigo-400 to-purple-400' },
    career: { emoji: '📈', labelHe: 'קריירה', labelEn: 'Career', labelAr: 'المهنة', labelRu: 'Карьера', color: 'from-amber-400 to-orange-400' },
    // C1 categories
    academic: { emoji: '🎓', labelHe: 'אקדמי', labelEn: 'Academic', labelAr: 'الأكاديمي', labelRu: 'Академический', color: 'from-indigo-400 to-blue-400' },
    literature: { emoji: '📜', labelHe: 'ספרות', labelEn: 'Literature', labelAr: 'الأدب', labelRu: 'Литература', color: 'from-rose-400 to-pink-400' },
    rhetoric: { emoji: '🎤', labelHe: 'רטוריקה', labelEn: 'Rhetoric', labelAr: 'الخطابة', labelRu: 'Риторика', color: 'from-orange-400 to-red-400' },
    diplomacy: { emoji: '🤝', labelHe: 'דיפלומטיה', labelEn: 'Diplomacy', labelAr: 'الدبلوماسية', labelRu: 'Дипломатия', color: 'from-teal-400 to-cyan-400' },
    economics: { emoji: '📊', labelHe: 'כלכלה', labelEn: 'Economics', labelAr: 'الاقتصاد', labelRu: 'Экономика', color: 'from-emerald-400 to-green-400' },
    research: { emoji: '🔍', labelHe: 'מחקר', labelEn: 'Research', labelAr: 'البحث', labelRu: 'Исследования', color: 'from-blue-400 to-cyan-400' },
    journalism: { emoji: '📰', labelHe: 'עיתונאות', labelEn: 'Journalism', labelAr: 'الصحافة', labelRu: 'Журналистика', color: 'from-gray-400 to-blue-400' },
    ethics: { emoji: '⚖️', labelHe: 'אתיקה', labelEn: 'Ethics', labelAr: 'الأخلاق', labelRu: 'Этика', color: 'from-violet-400 to-purple-400' },
  };

  // Separate categories by CEFR level (memoized — data is constant)
  const { a1Categories, a2Categories, b1Categories, b2Categories, c1Categories } = useMemo(() => {
    // Build category→levels map in a single pass
    const catLevels = {};
    for (const w of ALL_WORDS) {
      if (!catLevels[w.category]) catLevels[w.category] = new Set();
      catLevels[w.category].add(w.cefrLevel);
    }
    return {
      a1Categories: CATEGORIES.filter(cat => catLevels[cat]?.has('A1')),
      a2Categories: CATEGORIES.filter(cat => {
        const levels = catLevels[cat];
        return levels && [...levels].every(l => l === 'A2');
      }),
      b1Categories: CATEGORIES.filter(cat => {
        const levels = catLevels[cat];
        return levels?.has('B1') && !levels.has('A1') && !levels.has('A2');
      }),
      b2Categories: CATEGORIES.filter(cat => {
        const levels = catLevels[cat];
        return levels?.has('B2') && !levels.has('A1') && !levels.has('A2') && !levels.has('B1');
      }),
      c1Categories: CATEGORIES.filter(cat => {
        const levels = catLevels[cat];
        return levels?.has('C1') && !levels.has('A1') && !levels.has('A2') && !levels.has('B1') && !levels.has('B2');
      }),
    };
  }, [ALL_WORDS, CATEGORIES]);

  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const userLevelIndex = levelOrder.indexOf(userLevel || 'A1');

  // Track cumulative category index for premium gating
  let globalCatIndex = 0;
  const renderGrid = (categories, levelLabel) => {
    const isLevelLocked = levelOrder.indexOf(levelLabel) > userLevelIndex;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
            isLevelLocked
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300'
          }`}>
            {levelLabel} {isLevelLocked ? '🔒' : ''}
          </span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          {isLevelLocked && (
            <span className="text-[10px] text-gray-400">
              {tReplace('unlocksAtLevel', uiLang, { level: levelLabel })}
            </span>
          )}
        </div>
        <div className={`grid grid-cols-3 gap-3 ${isLevelLocked ? 'opacity-50' : ''}`}>
          {categories.map(cat => {
            const info = categoryInfo[cat] || { emoji: '📚', labelHe: cat, color: 'from-gray-400 to-gray-500' };
            const wordCount = ALL_WORDS.filter(w => w.category === cat).length;
            const premiumLocked = isContentLocked('vocabulary', globalCatIndex);
            globalCatIndex++;
            const locked = isLevelLocked || premiumLocked;

            return (
              <div
                key={cat}
                className={`relative group ${locked ? 'cursor-pointer' : 'cursor-pointer'}`}
                onClick={() => {
                  if (premiumLocked) { setShowPaywall(true); return; }
                  if (!isLevelLocked) onSelectCategory(cat);
                }}
              >
                <GlassCard className={`!p-3 text-center hover:shadow-lg transition-all ${premiumLocked ? 'opacity-60' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${locked ? 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700' : info.color} flex items-center justify-center mx-auto mb-2 shadow-sm`}>
                    <span className="text-lg">{info.emoji}</span>
                  </div>
                  {premiumLocked && (
                    <div className="absolute top-2 right-2 bg-black/40 rounded-full p-1">
                      <Lock size={10} className="text-white" />
                    </div>
                  )}
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 capitalize truncate leading-tight">
                    {lf(info, 'label', uiLang) || cat.replace(/-/g, ' ')}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{wordCount} {t('wordCount', uiLang)}</p>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  globalCatIndex = 0;
  return (
    <>
      <div className="space-y-6">
        {a1Categories.length > 0 && renderGrid(a1Categories, 'A1')}
        {a2Categories.length > 0 && renderGrid(a2Categories, 'A2')}
        {b1Categories.length > 0 && renderGrid(b1Categories, 'B1')}
        {b2Categories.length > 0 && renderGrid(b2Categories, 'B2')}
        {c1Categories.length > 0 && renderGrid(c1Categories, 'C1')}
      </div>
      {showPaywall && <PaywallModal feature="vocabulary" onClose={() => setShowPaywall(false)} onNavigate={() => {}} />}
    </>
  );
}

// ── Category Words View ──────────────────────────────────
function CategoryWordsView({ category, onBack, onSelectWord, onLearn, ALL_WORDS }) {
  const { speak, speakWordPair } = useSpeechSynthesis();
  const { uiLang } = useTheme();
  const isRtl = RTL_LANGS.includes(uiLang);
  const words = ALL_WORDS.filter(w => w.category === category);

  // Preload audio for all words in this category for instant playback
  useEffect(() => {
    const englishTexts = words.map(w => w.word);
    const nativeTexts = words.map(w => (lf(w, 'translation', uiLang) || w.translation || '').replace(/\s*\([^)]*\)/g, '').trim());
    preloadEnglishAudio(englishTexts);
    preloadHebrewAudio(nativeTexts, uiLang);
  }, [category]);

  const categoryInfo = {
    greetings: { emoji: '👋', labelHe: 'ברכות', labelEn: 'Greetings', labelAr: 'التحيات', labelRu: 'Приветствия' },
    numbers: { emoji: '🔢', labelHe: 'מספרים', labelEn: 'Numbers', labelAr: 'الأرقام', labelRu: 'Числа' },
    family: { emoji: '👨‍👩‍👧‍👦', labelHe: 'משפחה', labelEn: 'Family', labelAr: 'العائلة', labelRu: 'Семья' },
    food: { emoji: '🍕', labelHe: 'אוכל', labelEn: 'Food', labelAr: 'الطعام', labelRu: 'Еда' },
    home: { emoji: '🏠', labelHe: 'בית', labelEn: 'Home', labelAr: 'البيت', labelRu: 'Дом' },
    travel: { emoji: '✈️', labelHe: 'טיולים', labelEn: 'Travel', labelAr: 'السفر', labelRu: 'Путешествия' },
    work: { emoji: '💼', labelHe: 'עבודה', labelEn: 'Work', labelAr: 'العمل', labelRu: 'Работа' },
    body: { emoji: '🫀', labelHe: 'גוף', labelEn: 'Body', labelAr: 'الجسم', labelRu: 'Тело' },
    animals: { emoji: '🐕', labelHe: 'חיות', labelEn: 'Animals', labelAr: 'الحيوانات', labelRu: 'Животные' },
    colors: { emoji: '🎨', labelHe: 'צבעים', labelEn: 'Colors', labelAr: 'الألوان', labelRu: 'Цвета' },
    clothes: { emoji: '👕', labelHe: 'בגדים', labelEn: 'Clothes', labelAr: 'الملابس', labelRu: 'Одежда' },
    time: { emoji: '⏰', labelHe: 'זמן', labelEn: 'Time', labelAr: 'الوقت', labelRu: 'Время' },
    weather: { emoji: '🌤️', labelHe: 'מזג אוויר', labelEn: 'Weather', labelAr: 'الطقس', labelRu: 'Погода' },
    school: { emoji: '🏫', labelHe: 'בית ספר', labelEn: 'School', labelAr: 'المدرسة', labelRu: 'Школа' },
    shopping: { emoji: '🛒', labelHe: 'קניות', labelEn: 'Shopping', labelAr: 'التسوق', labelRu: 'Покупки' },
    directions: { emoji: '🧭', labelHe: 'כיוונים', labelEn: 'Directions', labelAr: 'الاتجاهات', labelRu: 'Направления' },
    emotions: { emoji: '😊', labelHe: 'רגשות', labelEn: 'Emotions', labelAr: 'المشاعر', labelRu: 'Эмоции' },
    sports: { emoji: '⚽', labelHe: 'ספורט', labelEn: 'Sports', labelAr: 'الرياضة', labelRu: 'Спорт' },
    'daily-routines': { emoji: '🌅', labelHe: 'שגרה יומית', labelEn: 'Daily Routines', labelAr: 'الروتين اليومي', labelRu: 'Распорядок дня' },
    nature: { emoji: '🌿', labelHe: 'טבע', labelEn: 'Nature', labelAr: 'الطبيعة', labelRu: 'Природа' },
    health: { emoji: '🏥', labelHe: 'בריאות', labelEn: 'Health', labelAr: 'الصحة', labelRu: 'Здоровье' },
    technology: { emoji: '💻', labelHe: 'טכנולוגיה', labelEn: 'Technology', labelAr: 'التكنولوجيا', labelRu: 'Технологии' },
    culture: { emoji: '🎭', labelHe: 'תרבות', labelEn: 'Culture', labelAr: 'الثقافة', labelRu: 'Культура' },
    'travel-advanced': { emoji: '🌍', labelHe: 'טיולים מתקדם', labelEn: 'Advanced Travel', labelAr: 'السفر المتقدم', labelRu: 'Путешествия (продв.)' },
    'work-advanced': { emoji: '📊', labelHe: 'עבודה מתקדם', labelEn: 'Advanced Work', labelAr: 'العمل المتقدم', labelRu: 'Работа (продв.)' },
    'food-advanced': { emoji: '🍽️', labelHe: 'אוכל מתקדם', labelEn: 'Advanced Food', labelAr: 'الطعام المتقدم', labelRu: 'Еда (продв.)' },
    education: { emoji: '🎓', labelHe: 'חינוך', labelEn: 'Education', labelAr: 'التعليم', labelRu: 'Образование' },
    entertainment: { emoji: '🎬', labelHe: 'בידור', labelEn: 'Entertainment', labelAr: 'الترفيه', labelRu: 'Развлечения' },
    environment: { emoji: '🌎', labelHe: 'סביבה', labelEn: 'Environment', labelAr: 'البيئة', labelRu: 'Окружающая среда' },
    relationships: { emoji: '💕', labelHe: 'מערכות יחסים', labelEn: 'Relationships', labelAr: 'العلاقات', labelRu: 'Отношения' },
    hobbies: { emoji: '🎯', labelHe: 'תחביבים', labelEn: 'Hobbies', labelAr: 'الهوايات', labelRu: 'Хобби' },
    city: { emoji: '🏙️', labelHe: 'עיר', labelEn: 'City', labelAr: 'المدينة', labelRu: 'Город' },
    transport: { emoji: '🚇', labelHe: 'תחבורה', labelEn: 'Transport', labelAr: 'المواصلات', labelRu: 'Транспорт' },
    communication: { emoji: '💬', labelHe: 'תקשורת', labelEn: 'Communication', labelAr: 'التواصل', labelRu: 'Общение' },
    idioms: { emoji: '💡', labelHe: 'ביטויים', labelEn: 'Idioms', labelAr: 'التعابير', labelRu: 'Идиомы' },
    // B1
    business: { emoji: '💼', labelHe: 'עסקים', labelEn: 'Business', labelAr: 'الأعمال', labelRu: 'Бизнес' },
    // B2
    media: { emoji: '📺', labelHe: 'תקשורת', labelEn: 'Media', labelAr: 'الإعلام', labelRu: 'СМИ' },
    politics: { emoji: '🏛️', labelHe: 'פוליטיקה', labelEn: 'Politics', labelAr: 'السياسة', labelRu: 'Политика' },
    science: { emoji: '🔬', labelHe: 'מדע', labelEn: 'Science', labelAr: 'العلوم', labelRu: 'Наука' },
    finance: { emoji: '💰', labelHe: 'פיננסים', labelEn: 'Finance', labelAr: 'المالية', labelRu: 'Финансы' },
    psychology: { emoji: '🧠', labelHe: 'פסיכולוגיה', labelEn: 'Psychology', labelAr: 'علم النفس', labelRu: 'Психология' },
    law: { emoji: '⚖️', labelHe: 'משפט', labelEn: 'Law', labelAr: 'القانون', labelRu: 'Право' },
    'abstract-concepts': { emoji: '💭', labelHe: 'מושגים מופשטים', labelEn: 'Abstract Concepts', labelAr: 'المفاهيم المجردة', labelRu: 'Абстрактные понятия' },
    career: { emoji: '📈', labelHe: 'קריירה', labelEn: 'Career', labelAr: 'المهنة', labelRu: 'Карьера' },
    // C1
    academic: { emoji: '🎓', labelHe: 'אקדמי', labelEn: 'Academic', labelAr: 'الأكاديمي', labelRu: 'Академический' },
    literature: { emoji: '📜', labelHe: 'ספרות', labelEn: 'Literature', labelAr: 'الأدب', labelRu: 'Литература' },
    rhetoric: { emoji: '🎤', labelHe: 'רטוריקה', labelEn: 'Rhetoric', labelAr: 'الخطابة', labelRu: 'Риторика' },
    diplomacy: { emoji: '🤝', labelHe: 'דיפלומטיה', labelEn: 'Diplomacy', labelAr: 'الدبلوماسية', labelRu: 'Дипломатия' },
    economics: { emoji: '📊', labelHe: 'כלכלה', labelEn: 'Economics', labelAr: 'الاقتصاد', labelRu: 'Экономика' },
    research: { emoji: '🔍', labelHe: 'מחקר', labelEn: 'Research', labelAr: 'البحث', labelRu: 'Исследования' },
    journalism: { emoji: '📰', labelHe: 'עיתונאות', labelEn: 'Journalism', labelAr: 'الصحافة', labelRu: 'Журналистика' },
    ethics: { emoji: '⚖️', labelHe: 'אתיקה', labelEn: 'Ethics', labelAr: 'الأخلاق', labelRu: 'Этика' },
  };

  const info = categoryInfo[category] || { emoji: '📚', labelHe: category };

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{info.emoji}</span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {lf(info, 'label', uiLang) || category.replace(/-/g, ' ')}
          </h2>
        </div>
        <span className="text-sm text-gray-400">{words.length} {t('wordCount', uiLang)}</span>
      </div>

      {/* Learn All Button */}
      <AnimatedButton
        onClick={() => onLearn(words)}
        variant="primary"
        className="w-full"
      >
        <GraduationCap size={18} className="mr-2" />
        {tReplace('learnCountWords', uiLang, { count: words.length })}
      </AnimatedButton>

      {/* Word List */}
      <div className="space-y-2">
        {words.map(word => (
          <div
            key={word.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700/50 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
            onClick={() => onSelectWord(word)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); speakWordPair(word.word, lf(word, 'translation', uiLang), uiLang); }}
              aria-label="Listen"
              className="shrink-0 w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center"
            >
              <Volume2 size={16} className="text-brand-500" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white">{word.word}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{lf(word, 'translation', uiLang)} - {word.definition}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0 rtl:rotate-180" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helper: get words appropriate for user level ────────
function getWordsForLevel(cefrLevel, allWords) {
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const userLevelIndex = levelOrder.indexOf(cefrLevel || 'A1');
  // Include words from current level and all lower levels
  return allWords.filter(w => {
    const wordLevelIndex = levelOrder.indexOf(w.cefrLevel || 'A1');
    return wordLevelIndex <= userLevelIndex;
  });
}

// ── Main Vocabulary Page ────────────────────────────────
export default function VocabularyPage() {
  const { uiLang } = useTheme();
  const { addXP, progress, updateProgress } = useUserProgress();
  const { dueWords, dueCount, reviewWord, addWord, isLoading } = useSpacedRepetition();
  const { speak } = useSpeechSynthesis();
  const [view, setView] = useState('main'); // main, review, browse, learn, detail
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [learnWords, setLearnWords] = useState([]);
  const [allWordsData, setAllWordsData] = useState({ a1: [], a2: [], b2: [], business: [], c1: [] });

  useEffect(() => {
    Promise.all([
      loadWordData('a1'), loadWordData('a2'), loadWordData('b2'),
      loadWordData('business'), loadWordData('c1')
    ]).then(([a1, a2, b2, business, c1]) => {
      setAllWordsData({ a1, a2, b2, business, c1 });
    }).catch(() => {});
  }, []);

  const ALL_WORDS = useMemo(() => [
    ...allWordsData.a1, ...allWordsData.a2, ...allWordsData.business,
    ...allWordsData.b2, ...allWordsData.c1
  ], [allWordsData]);

  const CATEGORIES = useMemo(() => [...new Set(ALL_WORDS.map(w => w.category))], [ALL_WORDS]);

  const userLevel = progress.cefrLevel || 'A1';
  const availableWords = getWordsForLevel(userLevel, ALL_WORDS);

  const handleAddToVocab = useCallback(async (word) => {
    try {
      await addWord(word.id || word.word, word.word);
    } catch (e) {
      // Word might already exist
    }
  }, [addWord]);

  const handleStartLearn = (words) => {
    setLearnWords(words);
    setView('learn');
  };

  const handleLearnComplete = () => {
    if (addXP) addXP(learnWords.length * 5, 'vocabulary');
    // Increment words learned counter for achievements
    if (updateProgress && learnWords.length > 0) {
      updateProgress({
        totalWordsLearned: (progress.totalWordsLearned || 0) + learnWords.length,
      });
    }
    setView('main');
    setLearnWords([]);
  };

  // Wrap reviewWord to also increment vocabReviews counter for achievements
  const handleReviewWord = useCallback(async (wordId, quality) => {
    const result = await reviewWord(wordId, quality);
    updateProgress({
      vocabReviews: (progress.vocabReviews || 0) + 1,
    });
    return result;
  }, [reviewWord, updateProgress, progress]);

  if (isLoading) return <LoadingSpinner text={t('loading', uiLang)} />;

  // ── Learn Flow ──
  if (view === 'learn' && learnWords.length > 0) {
    return (
      <LearnWordsFlow
        words={learnWords}
        onComplete={handleLearnComplete}
        onBack={() => { setView('main'); setLearnWords([]); }}
        onAddToVocab={handleAddToVocab}
      />
    );
  }

  // ── Review Flow ──
  if (view === 'review') {
    return (
      <div className="pb-24 px-4 pt-4">
        <ReviewSession dueWords={dueWords} onReview={handleReviewWord} onBack={() => setView('main')} ALL_WORDS={ALL_WORDS} />
      </div>
    );
  }

  // ── Category Words ──
  if (view === 'browse' && selectedCategory) {
    return (
      <>
        <CategoryWordsView
          category={selectedCategory}
          onBack={() => { setView('main'); setSelectedCategory(null); }}
          onSelectWord={(word) => setSelectedWord(word)}
          onLearn={(words) => handleStartLearn(words)}
          ALL_WORDS={ALL_WORDS}
        />
        {selectedWord && (
          <WordDetailModal
            word={selectedWord}
            onClose={() => setSelectedWord(null)}
            onSpeak={speak}
            onAddToVocab={handleAddToVocab}
            uiLang={uiLang}
            isInVocab={false}
          />
        )}
      </>
    );
  }

  // ── Main View ──
  return (
    <div className="pb-24 px-4 pt-4 space-y-5">
      <KidsIntro
        id="vocabulary-v4"
        name={progress.displayName}
        emoji="📚"
        title="Speakli's Words!"
        titleHe="המילים של ספיקלי!"
        titleAr="كلمات سبيكلي!"
        titleRu="Слова Спикли!"
        desc="Hi! Let's learn new words together! Let's start!"
        descHe="היי! בואו נלמד יחד מילים חדשות! בואו נתחיל!"
        descAr="مرحباً! دعونا نتعلم كلمات جديدة معاً! هيا نبدأ!"
        descRu="Привет! Давайте вместе учить новые слова! Начнём!"
        uiLang={uiLang}
        gradient="from-blue-500 via-sky-500 to-cyan-500"
        buttonLabel="Let's learn with Speakli!"
        buttonLabelHe="בואו נלמד עם ספיקלי!"
        buttonLabelAr="هيا نتعلم مع سبيكلي!"
        buttonLabelRu="Учимся со Спикли!"
      />
      {/* Quick Learn - Random 5 Words (level-appropriate) */}
      <GlassCard
        variant="strong"
        className="!bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-brand-950/30 dark:to-emerald-950/30 border-brand-200 dark:border-brand-800 cursor-pointer hover:shadow-lg transition-all"
        onClick={() => {
          // Prioritize words at user's current level, mix in some from lower levels
          const currentLevelWords = availableWords.filter(w => w.cefrLevel === userLevel);
          const lowerLevelWords = availableWords.filter(w => w.cefrLevel !== userLevel);
          // Pick 3-4 from current level, 1-2 from lower levels for review
          const shuffledCurrent = shuffle(currentLevelWords);
          const shuffledLower = shuffle(lowerLevelWords);
          const picked = shuffle([
            ...shuffledCurrent.slice(0, lowerLevelWords.length > 0 ? 4 : 5),
            ...shuffledLower.slice(0, 1)
          ]);
          handleStartLearn(picked.slice(0, 5));
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {t('learnNewWords', uiLang)}
              </h3>
              <p className="text-sm text-brand-600 dark:text-brand-400">
                {tReplace('vocabLevelWordsDesc', uiLang, { level: userLevel })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-brand-500">
            <Zap size={16} />
            <span className="text-xs font-bold">+25 XP</span>
          </div>
        </div>
      </GlassCard>

      {/* Review Due Words */}
      {dueCount > 0 && (
        <GlassCard
          variant="strong"
          className="!bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setView('review')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg relative">
                <RotateCcw size={22} className="text-white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {dueCount}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{t('reviewWords', uiLang)}</h3>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  {dueCount} {t('wordsDueReview', uiLang)}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400 rtl:rotate-180" />
          </div>
        </GlassCard>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{availableWords.length}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('vocabAvailable', uiLang)}</p>
        </div>
        <div className="text-center p-3 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{userLevel}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('vocabYourLevel', uiLang)}</p>
        </div>
        <div className="text-center p-3 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{ALL_WORDS.length}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('vocabTotal', uiLang)}</p>
        </div>
      </div>

      {/* Category Browser */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          {t('categories', uiLang)}
        </h2>
        <CategoryBrowser
          onSelectCategory={(cat) => { setSelectedCategory(cat); setView('browse'); }}
          onLearnCategory={(words) => handleStartLearn(words)}
          userLevel={userLevel}
          ALL_WORDS={ALL_WORDS}
          CATEGORIES={CATEGORIES}
        />
      </div>

      {/* Word Detail Modal */}
      {selectedWord && (
        <WordDetailModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onSpeak={speak}
          onAddToVocab={handleAddToVocab}
          uiLang={uiLang}
          isInVocab={false}
        />
      )}
    </div>
  );
}
