import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Delete } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useChildAuth } from '../contexts/ChildAuthContext.jsx';
import { t } from '../utils/translations.js';

export default function ChildLoginPage({ onBack }) {
  const { uiLang, dir } = useTheme();
  const { loginChild, fetchChildrenByCode, checkRateLimit } = useChildAuth();

  const [step, setStep] = useState(1); // 1: family code, 2: select child, 3: PIN
  const [familyCode, setFamilyCode] = useState('');
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('childJoin');
    if (code) {
      setFamilyCode(code.toUpperCase());
    }
  }, []);

  // Step 1: Submit family code
  const handleCodeSubmit = useCallback(async () => {
    if (familyCode.length !== 6) return;
    setLoading(true);
    setError('');

    const result = await fetchChildrenByCode(familyCode.toUpperCase());
    if (result.success) {
      if (result.children.length === 0) {
        setError(t('noChildrenFound', uiLang));
      } else {
        setChildrenList(result.children);
        setStep(2);
      }
    } else if (result.error === 'authFailed') {
      setError(uiLang === 'he' ? 'שגיאת חיבור. נסה שוב.' : 'Connection error. Try again.');
    } else {
      setError(t('invalidFamilyCode', uiLang));
    }
    setLoading(false);
  }, [familyCode, fetchChildrenByCode, uiLang]);

  // Step 2: Select child
  const handleSelectChild = useCallback((child) => {
    setSelectedChild(child);
    setPin('');
    setError('');
    setStep(3);
  }, []);

  // Step 3: Enter PIN digit
  const handlePinDigit = useCallback((digit) => {
    if (pin.length >= 4) return;
    setPin(prev => prev + digit);
  }, [pin]);

  const handlePinDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  }, []);

  // Auto-submit when PIN is 4 digits
  useEffect(() => {
    if (pin.length !== 4 || !selectedChild) return;

    const rl = checkRateLimit();
    if (rl.locked) {
      setError(t('tooManyAttempts', uiLang));
      return;
    }

    setLoading(true);
    setError('');

    loginChild(familyCode.toUpperCase(), selectedChild.childId, selectedChild.name, pin)
      .then(result => {
        if (!result.success) {
          setPin('');
          if (result.error === 'tooManyAttempts') {
            setError(t('tooManyAttempts', uiLang));
          } else {
            setError(t('invalidPin', uiLang));
          }
        }
        // On success, the ChildAuthProvider state change will trigger re-render in App.jsx
      })
      .finally(() => setLoading(false));
  }, [pin, selectedChild, familyCode, loginChild, checkRateLimit, uiLang]);

  const isRTL = dir === 'rtl';

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950 flex flex-col">
      {/* Top bar */}
      <div className="p-4">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : onBack()}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
          <span className="text-sm">{t('back', uiLang)}</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Step 1: Family Code */}
        {step === 1 && (
          <div className="w-full max-w-sm animate-fade-in text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mb-6 shadow-xl">
              <span className="text-3xl">👨‍👩‍👧‍👦</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('enterFamilyCode', uiLang)}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
              {t('childLoginDesc', uiLang)}
            </p>

            <input
              type="text"
              value={familyCode}
              onChange={e => setFamilyCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              autoFocus
              className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 rounded-2xl bg-white/50 dark:bg-white/5 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none transition-all"
            />

            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}

            <button
              onClick={handleCodeSubmit}
              disabled={familyCode.length !== 6 || loading}
              className="w-full mt-6 py-4 rounded-2xl font-bold text-white text-lg bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 shadow-lg shadow-teal-500/25 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? t('loading', uiLang) : t('continue', uiLang)}
            </button>
          </div>
        )}

        {/* Step 2: Select Child */}
        {step === 2 && (
          <div className="w-full max-w-sm animate-fade-in text-center">
            <h2 className="text-2xl font-bold mb-2">{t('selectYourProfile', uiLang)}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
              {t('enterFamilyCode', uiLang)}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {childrenList.map(child => (
                <button
                  key={child.childId}
                  onClick={() => handleSelectChild(child)}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl glass-card border-2 border-transparent hover:border-indigo-400 active:scale-[0.95] transition-all"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${child.avatarColor} flex items-center justify-center text-3xl shadow-lg`}>
                    {child.avatar}
                  </div>
                  <span className="font-bold text-lg">{child.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: PIN Entry */}
        {step === 3 && selectedChild && (
          <div className="w-full max-w-sm animate-fade-in text-center">
            {/* Selected child avatar */}
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${selectedChild.avatarColor} flex items-center justify-center text-4xl shadow-xl mb-4`}>
              {selectedChild.avatar}
            </div>
            <h2 className="text-xl font-bold mb-1">{selectedChild.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
              {t('enterYourPin', uiLang)}
            </p>

            {/* PIN dots */}
            <div className="flex justify-center gap-4 mb-8" dir="ltr">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-full transition-all duration-200 ${
                    i < pin.length
                      ? 'bg-indigo-500 scale-110'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-4 animate-pulse">{error}</p>
            )}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button
                  key={n}
                  onClick={() => handlePinDigit(String(n))}
                  disabled={loading || pin.length >= 4}
                  className="h-16 rounded-2xl text-2xl font-bold bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 active:scale-[0.93] transition-all disabled:opacity-50"
                >
                  {n}
                </button>
              ))}
              <div /> {/* Empty cell */}
              <button
                onClick={() => handlePinDigit('0')}
                disabled={loading || pin.length >= 4}
                className="h-16 rounded-2xl text-2xl font-bold bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 active:scale-[0.93] transition-all disabled:opacity-50"
              >
                0
              </button>
              <button
                onClick={handlePinDelete}
                disabled={loading || pin.length === 0}
                className="h-16 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-[0.93] transition-all disabled:opacity-50"
              >
                <Delete size={24} className="text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
