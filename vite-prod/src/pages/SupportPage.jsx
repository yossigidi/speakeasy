import React from 'react';
import { HelpCircle, MessageSquare, FileText, Ticket, ChevronLeft } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { t } from '../utils/translations.js';
import GlassCard from '../components/shared/GlassCard.jsx';

const menuItems = [
  {
    key: 'faq',
    icon: FileText,
    page: 'support-faq',
    gradient: 'from-teal-400 to-emerald-500',
    color: 'text-teal-500',
  },
  {
    key: 'contactSupport',
    icon: MessageSquare,
    page: 'support-contact',
    gradient: 'from-emerald-400 to-teal-500',
    color: 'text-emerald-500',
  },
  {
    key: 'myTickets',
    icon: Ticket,
    page: 'support-tickets',
    gradient: 'from-cyan-400 to-teal-500',
    color: 'text-cyan-500',
  },
];

export default function SupportPage({ onNavigate, onBack }) {
  const { uiLang } = useTheme();

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60">
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
            <HelpCircle size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('helpCenter', uiLang)}
          </h1>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map(({ key, icon: Icon, page, gradient, color }) => (
          <GlassCard key={key} className="cursor-pointer" onClick={() => onNavigate(page)}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">{t(key, uiLang)}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t(`${key}Desc`, uiLang)}</p>
              </div>
              <ChevronLeft size={18} className={`${color} ${uiLang === 'he' ? '' : 'rotate-180'}`} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
