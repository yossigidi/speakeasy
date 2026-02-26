import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Ticket, Bug, Lightbulb, User, CreditCard, MoreHorizontal, Inbox } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { t } from '../utils/translations.js';
import GlassCard from '../components/shared/GlassCard.jsx';

const CATEGORY_ICONS = {
  bug: Bug,
  feature: Lightbulb,
  account: User,
  billing: CreditCard,
  other: MoreHorizontal,
};

const STATUS_STYLES = {
  open: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  responded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

export default function SupportTicketsPage({ onBack }) {
  const { uiLang } = useTheme();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState(null);

  useEffect(() => {
    if (!user?.uid || !window.firestore || !window.db) {
      setLoading(false);
      return;
    }

    const { collection, query, where, orderBy, onSnapshot } = window.firestore;
    const ticketsRef = collection(window.db, 'support-tickets');
    const q = query(ticketsRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTickets(list);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsub();
  }, [user?.uid]);

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString(uiLang === 'he' ? 'he-IL' : 'en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60">
          <ChevronLeft size={20} className={`text-gray-600 dark:text-gray-300 ${uiLang === 'he' ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center gap-2">
          <Ticket size={22} className="text-cyan-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('myTickets', uiLang)}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <GlassCard variant="strong" className="text-center py-10">
          <Inbox size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-400 dark:text-gray-500 text-sm">{t('noTickets', uiLang)}</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const CatIcon = CATEGORY_ICONS[ticket.category] || MoreHorizontal;
            const isOpen = expandedTicket === ticket.id;
            const statusKey = ticket.status || 'open';

            return (
              <GlassCard key={ticket.id} className="!p-0 overflow-hidden">
                <button
                  onClick={() => setExpandedTicket(prev => prev === ticket.id ? null : ticket.id)}
                  className="w-full p-3.5 text-start"
                >
                  <div className="flex items-center gap-3">
                    <CatIcon size={18} className="text-teal-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate flex-1">
                          {ticket.subject}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[statusKey]}`}>
                          {t(statusKey, uiLang)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</p>
                    </div>
                    {isOpen
                      ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                      : <ChevronDown size={16} className="text-gray-400 shrink-0" />
                    }
                  </div>
                </button>

                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? 500 : 0, opacity: isOpen ? 1 : 0 }}
                >
                  <div className="px-3.5 pb-3.5 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {ticket.message}
                    </p>

                    {ticket.replies && ticket.replies.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                          {t('replies', uiLang)}
                        </h4>
                        {ticket.replies.map((reply, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg text-sm ${
                              reply.fromAdmin
                                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-200'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-60">
                              {reply.fromAdmin ? 'Speakli' : t('you', uiLang)}
                            </p>
                            <p className="leading-relaxed">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
