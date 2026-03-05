import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { t } from '../../utils/translations.js';

const DISMISS_KEY = 'speakli_install_dismissed';
const DISMISS_DAYS = 7;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isDismissed() {
  try {
    const val = localStorage.getItem(DISMISS_KEY);
    if (!val) return false;
    return Date.now() - Number(val) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

export default function InstallBanner({ hasBottomNav }) {
  const { uiLang, darkMode } = useTheme();
  const [show, setShow] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const deferredPromptRef = useRef(null);

  // Check if app is already installed (native / TWA / PWA)
  const checkInstalled = useCallback(async () => {
    if (isStandalone()) return true;
    if (document.referrer.includes('android-app://')) return true;
    try {
      if ('getInstalledRelatedApps' in navigator) {
        const apps = await navigator.getInstalledRelatedApps();
        if (apps.length > 0) return true;
      }
    } catch {}
    return false;
  }, []);

  useEffect(() => {
    if (!isMobile() || isDismissed()) return;

    let cancelled = false;

    // Android: listen for beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      if (!cancelled) setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Auto-hide on install
    const handleInstalled = () => { setShow(false); };
    window.addEventListener('appinstalled', handleInstalled);

    // iOS: show immediately if not installed
    (async () => {
      const installed = await checkInstalled();
      if (installed || cancelled) return;
      if (isIOS()) setShow(true);
    })();

    return () => {
      cancelled = true;
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [checkInstalled]);

  const handleInstall = async () => {
    if (isIOS()) {
      setShowIOSModal(true);
      return;
    }
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    deferredPromptRef.current = null;
  };

  const handleDismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setShow(false);
  };

  if (!show) return null;

  const bottomOffset = hasBottomNav ? '72px' : '16px';

  return (
    <>
      {/* Banner */}
      <div
        className="fixed left-3 right-3 z-[45] slide-in-up"
        style={{ bottom: `calc(${bottomOffset} + env(safe-area-inset-bottom, 0px))` }}
      >
        <div
          className={`flex items-center gap-3 rounded-2xl p-3 shadow-xl border ${
            darkMode
              ? 'bg-gray-900/80 border-white/10 text-white'
              : 'bg-white/80 border-gray-200/60 text-gray-900'
          }`}
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          {/* App icon */}
          <img
            src="/images/speakli-icon.webp"
            alt="Speakli"
            className="w-12 h-12 rounded-xl shrink-0"
          />

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight truncate">
              {t('installApp', uiLang)}
            </p>
            <p className={`text-xs leading-tight mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('installAppDesc', uiLang)}
            </p>
          </div>

          {/* Install button */}
          <button
            onClick={handleInstall}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 active:scale-95 transition-transform"
          >
            {t('installButton', uiLang)}
          </button>

          {/* Dismiss X */}
          <button
            onClick={handleDismiss}
            className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full ${
              darkMode ? 'text-gray-500 hover:bg-white/10' : 'text-gray-400 hover:bg-gray-100'
            }`}
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => setShowIOSModal(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Sheet */}
          <div
            className={`relative w-full max-w-md rounded-t-3xl p-6 pb-10 slide-in-up ${
              darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}
            style={{ paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-center mb-5">
              {t('installIOSTitle', uiLang)}
            </h3>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {t('installIOSStep1', uiLang)}
                    {' '}
                    <svg className="inline w-5 h-5 -mt-0.5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h3v2H6v11h12V10h-3V8h3a2 2 0 012 2z"/>
                    </svg>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</span>
                <p className="text-sm font-medium flex-1">{t('installIOSStep2', uiLang)}</p>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                <p className="text-sm font-medium flex-1">{t('installIOSStep3', uiLang)}</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 active:scale-95 transition-transform"
            >
              {t('installIOSGotIt', uiLang)}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
