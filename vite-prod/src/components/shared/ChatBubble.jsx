import React from 'react';
import { Volume2 } from 'lucide-react';
import { t } from '../../utils/translations.js';
import SpeakliAvatar from '../kids/SpeakliAvatar.jsx';

export default function ChatBubble({ role, content, corrections, isChild, uiLang, onPlayAudio }) {
  const isAI = role === 'assistant';
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-3`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        isAI
          ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700'
          : 'bg-gradient-to-br from-brand-500 to-emerald-500 text-white'
      }`}>
        {isAI && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
              {isChild ? <><SpeakliAvatar mode="idle" size="xs" shadow={false} glow={false} /> Speakli</> : <><img src="/images/emma-avatar.webp" alt="Emma" className="inline-block w-6 h-6 rounded-full" /> Emma</>}
            </span>
            {onPlayAudio && (
              <button onClick={onPlayAudio} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Volume2 size={14} className="text-brand-500" />
              </button>
            )}
          </div>
        )}
        <p className={`text-sm leading-relaxed ${isAI ? 'text-gray-800 dark:text-gray-200' : 'text-white'}`}>
          {content}
        </p>
        {corrections && corrections.length > 0 && (
          <div className="mt-2 space-y-1.5 border-t border-gray-200 dark:border-gray-600 pt-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{t('corrections', uiLang)}</span>
            {corrections.map((c, i) => (
              <div key={i} className="text-xs bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 py-1.5">
                <span className="text-red-500 line-through">{c.wrong}</span>
                {' \u2192 '}
                <span className="text-green-600 dark:text-green-400 font-semibold">{c.correct}</span>
                {c.explanation && <p className="text-gray-500 dark:text-gray-400 mt-0.5">{c.explanation}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
