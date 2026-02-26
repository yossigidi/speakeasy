import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { t } from '../utils/translations.js';
import GlassCard from '../components/shared/GlassCard.jsx';

const FAQ_DATA = [
  {
    category: 'general',
    items: [
      { q: 'faqWhatIsSpeakli', a: 'faqWhatIsSpeakliA' },
      { q: 'faqIsFree', a: 'faqIsFreeA' },
      { q: 'faqWhatAge', a: 'faqWhatAgeA' },
      { q: 'faqOffline', a: 'faqOfflineA' },
    ],
  },
  {
    category: 'account',
    items: [
      { q: 'faqChangeEmail', a: 'faqChangeEmailA' },
      { q: 'faqDeleteAccount', a: 'faqDeleteAccountA' },
      { q: 'faqForgotPassword', a: 'faqForgotPasswordA' },
    ],
  },
  {
    category: 'learning',
    items: [
      { q: 'faqChangeLevel', a: 'faqChangeLevelA' },
      { q: 'faqHowXP', a: 'faqHowXPA' },
      { q: 'faqStreak', a: 'faqStreakA' },
      { q: 'faqChildMode', a: 'faqChildModeA' },
    ],
  },
  {
    category: 'technical',
    items: [
      { q: 'faqAudioNotWorking', a: 'faqAudioNotWorkingA' },
      { q: 'faqMicNotWorking', a: 'faqMicNotWorkingA' },
      { q: 'faqAppSlow', a: 'faqAppSlowA' },
      { q: 'faqBrowserSupport', a: 'faqBrowserSupportA' },
    ],
  },
];

const CATEGORY_LABELS = {
  general: 'faqCatGeneral',
  account: 'faqCatAccount',
  learning: 'faqCatLearning',
  technical: 'faqCatTechnical',
};

export default function SupportFAQPage({ onBack }) {
  const { uiLang } = useTheme();
  const [search, setSearch] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return FAQ_DATA;
    const q = search.toLowerCase();
    return FAQ_DATA.map(cat => ({
      ...cat,
      items: cat.items.filter(
        item =>
          t(item.q, uiLang).toLowerCase().includes(q) ||
          t(item.a, uiLang).toLowerCase().includes(q)
      ),
    })).filter(cat => cat.items.length > 0);
  }, [search, uiLang]);

  const toggleItem = (key) => {
    setExpandedItem(prev => (prev === key ? null : key));
  };

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60">
          <ChevronLeft size={20} className={`text-gray-600 dark:text-gray-300 ${uiLang === 'he' ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center gap-2">
          <HelpCircle size={22} className="text-teal-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('faq', uiLang)}
          </h1>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute top-3 text-gray-400" style={{ [uiLang === 'he' ? 'right' : 'left']: 12 }} />
        <input
          type="text"
          placeholder={t('searchFAQ', uiLang)}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full py-2.5 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          style={{ [uiLang === 'he' ? 'paddingRight' : 'paddingLeft']: 40, [uiLang === 'he' ? 'paddingLeft' : 'paddingRight']: 12 }}
        />
      </div>

      {/* FAQ Categories */}
      {filtered.map(cat => (
        <div key={cat.category} className="space-y-2">
          <h3 className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide px-1">
            {t(CATEGORY_LABELS[cat.category], uiLang)}
          </h3>
          {cat.items.map(item => {
            const key = item.q;
            const isOpen = expandedItem === key;
            return (
              <GlassCard key={key} className="!p-0 overflow-hidden">
                <button
                  onClick={() => toggleItem(key)}
                  className="w-full flex items-center justify-between p-3.5 text-start"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm flex-1">
                    {t(item.q, uiLang)}
                  </span>
                  {isOpen
                    ? <ChevronUp size={18} className="text-teal-500 shrink-0 ml-2" />
                    : <ChevronDown size={18} className="text-gray-400 shrink-0 ml-2" />
                  }
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? 300 : 0, opacity: isOpen ? 1 : 0 }}
                >
                  <div className="px-3.5 pb-3.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-3">
                    {t(item.a, uiLang)}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <HelpCircle size={40} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">{t('noResults', uiLang)}</p>
        </div>
      )}
    </div>
  );
}
