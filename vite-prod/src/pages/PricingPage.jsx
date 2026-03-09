import React, { useState } from 'react';
import { ArrowLeft, Check, X, Crown, Users, Sparkles, Tag } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import useSubscription from '../hooks/useSubscription.js';
import { PLANS, FEATURES } from '../data/subscription-plans.js';
import { t } from '../utils/translations.js';
import GlassCard from '../components/shared/GlassCard.jsx';

export default function PricingPage({ onBack }) {
  const { uiLang, dir } = useTheme();
  const { user } = useAuth();
  const { plan: currentPlan, isPremium } = useSubscription();
  const [interval, setInterval] = useState('month');
  const [loading, setLoading] = useState(null); // 'personal' | 'family' | null
  const [portalLoading, setPortalLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const handleCheckout = async (plan) => {
    if (!user) return;
    setLoading(plan);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan, interval: interval === 'annual' ? 'year' : 'month', promoCode: promoCode.trim() || undefined }),
      });
      const data = await res.json();
      if (data.error === 'Invalid promo code') {
        setPromoError(t('promoCodeInvalid', uiLang));
        setPromoApplied(false);
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  const personalPrice = interval === 'annual' ? PLANS.personal.priceAnnualPerMonth : PLANS.personal.priceMonthly;
  const familyPrice = interval === 'annual' ? PLANS.family.priceAnnualPerMonth : PLANS.family.priceMonthly;
  const savingsPct = Math.round((1 - PLANS.personal.priceAnnualPerMonth / PLANS.personal.priceMonthly) * 100);

  const plans = [
    {
      id: 'free',
      name: t('freePlan', uiLang),
      price: 0,
      icon: Sparkles,
      gradient: 'from-gray-400 to-gray-500',
      features: FEATURES.free,
      isCurrent: currentPlan === 'free' || !currentPlan,
    },
    {
      id: 'personal',
      name: t('personalPlan', uiLang),
      price: personalPrice,
      icon: Crown,
      gradient: 'from-purple-500 to-indigo-600',
      features: FEATURES.premium,
      isCurrent: currentPlan === 'personal',
      popular: true,
    },
    {
      id: 'family',
      name: t('familyPlan', uiLang),
      price: familyPrice,
      icon: Users,
      gradient: 'from-amber-500 to-orange-600',
      features: FEATURES.premium,
      isCurrent: currentPlan === 'family',
      extra: t('familyFeatures', uiLang),
    },
  ];

  return (
    <div className="min-h-screen pb-24 px-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={22} className={`text-gray-700 dark:text-gray-300 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('premium', uiLang)}</h1>
      </div>

      {/* Interval toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setInterval('month')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              interval === 'month'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-500'
            }`}
          >
            {t('monthlyBilling', uiLang)}
          </button>
          <button
            onClick={() => setInterval('annual')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              interval === 'annual'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-500'
            }`}
          >
            {t('annualBilling', uiLang)}
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
              -{savingsPct}%
            </span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        {plans.map((p) => {
          const Icon = p.icon;
          const isFree = p.id === 'free';
          return (
            <GlassCard
              key={p.id}
              variant="strong"
              className={`relative overflow-hidden ${p.popular ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''}`}
            >
              {p.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{p.name}</h3>
                  {p.isCurrent && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
                      {t('currentPlan', uiLang)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isFree ? t('free', uiLang) : `${p.price.toFixed(2)}₪`}
                  </span>
                  {!isFree && (
                    <span className="text-xs text-gray-400 block">{t('perMonth', uiLang)}</span>
                  )}
                </div>
              </div>

              {interval === 'annual' && !isFree && (
                <p className="text-xs text-gray-400 mb-3">
                  {PLANS[p.id].priceAnnualTotal.toFixed(2)}₪ {t('perYear', uiLang)}
                </p>
              )}

              {p.extra && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-3">{p.extra}</p>
              )}

              {/* Feature list */}
              <div className="space-y-1.5 mb-4">
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check size={14} className="text-green-500 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{t(f, uiLang)}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isFree ? (
                p.isCurrent ? null : null
              ) : p.isCurrent ? (
                <button
                  onClick={handleManage}
                  disabled={portalLoading}
                  className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm disabled:opacity-50"
                >
                  {portalLoading ? '...' : t('manageSub', uiLang)}
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout(p.id)}
                  disabled={loading === p.id}
                  className={`w-full py-3 rounded-xl bg-gradient-to-r ${p.gradient} text-white font-bold text-sm shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50`}
                >
                  {loading === p.id ? '...' : t('upgradeNow', uiLang)}
                </button>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Promo Code */}
      {!isPremium && (
        <div className="mt-6">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-1.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 shrink-0">
              <Tag size={18} className="text-purple-500" />
            </div>
            <input
              type="text"
              dir="ltr"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoApplied(false); }}
              placeholder={t('promoCodePlaceholder', uiLang)}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none font-mono tracking-wider px-2"
            />
            {promoCode && (
              <button
                onClick={() => { setPromoApplied(true); setPromoError(''); }}
                className="px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-bold shrink-0 active:scale-95 transition-transform"
              >
                {t('apply', uiLang)}
              </button>
            )}
          </div>
          {promoApplied && !promoError && (
            <p className="text-xs text-green-500 font-medium mt-1.5 px-2">
              {t('promoCodeApplied', uiLang)}
            </p>
          )}
          {promoError && (
            <p className="text-xs text-red-500 font-medium mt-1.5 px-2">{promoError}</p>
          )}
        </div>
      )}
    </div>
  );
}
