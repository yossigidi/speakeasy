import React from 'react';
import { t } from '../../../utils/translations.js';

/**
 * React-rendered pause overlay (alternative to in-canvas pause).
 * Used when we need React UI components over the PixiJS canvas.
 */
export default function PauseOverlay({ onResume, onWorldMap, onQuit, uiLang }) {
  return (
    <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center animate-fade-in">
      <div
        className="rounded-3xl p-8 text-center max-w-xs mx-4 space-y-4"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(241,245,249,0.95))',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div className="text-5xl mb-2">⏸️</div>
        <h2 className="text-2xl font-black text-gray-800">
          {t('advPaused', uiLang)}
        </h2>

        <button
          onClick={onResume}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          {t('advResume', uiLang)}
        </button>

        <button
          onClick={onWorldMap}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-400 to-sky-500 text-white font-bold shadow-md active:scale-95 transition-transform"
        >
          {t('advWorldMap', uiLang)}
        </button>

        <button
          onClick={onQuit}
          className="w-full py-2.5 rounded-2xl bg-gray-100 text-gray-600 font-medium text-sm active:scale-95 transition-transform"
        >
          {t('advBackHome', uiLang)}
        </button>
      </div>
    </div>
  );
}
