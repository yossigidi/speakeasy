import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, CheckCircle, Send, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { t } from '../utils/translations.js';
import GlassCard from '../components/shared/GlassCard.jsx';

const CATEGORIES = ['bug', 'feature', 'account', 'billing', 'other'];

export default function SupportContactPage({ onBack }) {
  const { uiLang } = useTheme();
  const { user } = useAuth();

  const [category, setCategory] = useState('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const categoryLabels = {
    bug: t('bugReport', uiLang),
    feature: t('featureRequest', uiLang),
    account: t('accountIssue', uiLang),
    billing: t('billing', uiLang),
    other: t('other', uiLang),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/support-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'anonymous',
          email: email.trim(),
          name: user?.displayName || email.split('@')[0] || 'User',
          category,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setSent(true);
    } catch (err) {
      console.error('Support ticket error:', err);
      setError(t('error', uiLang));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60">
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('contactSupport', uiLang)}
          </h1>
        </div>

        <GlassCard variant="strong" className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 mb-4 animate-bounce">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('ticketSubmitted', uiLang)}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t('ticketConfirmation', uiLang)}
          </p>
          <button
            onClick={onBack}
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm shadow-lg"
          >
            {t('back', uiLang)}
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60">
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-2">
          <MessageSquare size={22} className="text-emerald-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('contactSupport', uiLang)}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <GlassCard className="!p-3 space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('category', uiLang)}
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  category === cat
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Email */}
        <GlassCard className="!p-3 space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('email', uiLang)}
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full py-2 px-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            required
          />
        </GlassCard>

        {/* Subject */}
        <GlassCard className="!p-3 space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('subject', uiLang)}
          </label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={t('subjectPlaceholder', uiLang)}
            className="w-full py-2 px-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
            required
          />
        </GlassCard>

        {/* Message */}
        <GlassCard className="!p-3 space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t('message', uiLang)}
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={t('messagePlaceholder', uiLang)}
            rows={5}
            className="w-full py-2 px-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            required
          />
        </GlassCard>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={sending || !subject.trim() || !message.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
          {t('sendMessage', uiLang)}
        </button>
      </form>
    </div>
  );
}
