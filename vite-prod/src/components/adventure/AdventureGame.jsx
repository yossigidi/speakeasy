import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { useMusic } from '../../contexts/MusicContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import usePixiApp from '../../hooks/usePixiApp.js';
import PixiEngine from './engine/PixiEngine.js';
import TouchController from './engine/TouchController.js';
import TransitionEffects from './engine/TransitionEffects.js';
import CameraController from './engine/CameraController.js';
import Speakli from './characters/Speakli.js';
import SceneManager from './engine/SceneManager.js';
import ParallaxBackground from './engine/ParallaxBackground.js';
import DialogueSystem from './engine/DialogueSystem.js';
import ParticleSystem from './engine/ParticleSystem.js';
import HUD from './ui/HUD.js';

// Lazy-load world map separately
const WorldMap = React.lazy(() => import('./worlds/WorldMap.js').then(m => ({ default: m.default || m })));

/**
 * React wrapper — mounts the PixiJS canvas, bridges React contexts to pure JS engine.
 */
export default function AdventureGame({ onBack }) {
  const { speak, speakSequence, stopSpeaking } = useSpeech();
  const { progress, addXP, updateProgress } = useUserProgress();
  const { setSection } = useMusic();
  const { uiLang } = useTheme();

  const [showPause, setShowPause] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(true);
  const engineRef = useRef(null);

  // Bridge options from React contexts to engine
  const optionsRef = useRef({});
  optionsRef.current = {
    speak: (text, opts) => speak(text, opts),
    speakSequence: (items, cb) => speakSequence(items, cb),
    stopSpeaking,
    onXP: (amount, source) => addXP(amount, source || 'adventure'),
    onProgress: (data) => updateProgress({ adventure: { ...(progress.adventure || {}), ...data } }),
    adventureProgress: progress.adventure || {},
    uiLang,
    onPause: () => setShowPause(true),
    onWorldMap: () => setShowWorldMap(true),
    onBack,
  };

  const onPixiReady = useCallback((app) => {
    const engine = new PixiEngine(app, optionsRef.current);
    engineRef.current = engine;

    // Subsystems
    engine.touch = new TouchController(app);
    engine.transitions = new TransitionEffects(engine);
    engine.camera = new CameraController(engine);

    // Speakli character
    engine.speakli = new Speakli(engine);
    engine.speakli.setNormalized(0.5, 0.75);

    // Particles (will be configured per-scene)
    engine.particles = new ParticleSystem(engine);

    // Scene manager
    engine.sceneManager = new SceneManager(engine, optionsRef.current);
    engine.sceneManager.dialogue = new DialogueSystem(engine, optionsRef.current);

    // HUD
    engine.hud = new HUD(engine, optionsRef.current);

    // Parallax background
    engine.parallax = new ParallaxBackground(engine);

    // Touch → walk Speakli
    engine.touch.on('tap', ({ nx, ny }) => {
      if (engine.sceneManager.isExerciseActive) return;
      if (engine.sceneManager.isDialogueActive) {
        engine.sceneManager.dialogue.advance();
        return;
      }
      engine.speakli.walkToNorm(nx, ny);
    });

    // Resize handling
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);
    engine._cleanupResize = () => window.removeEventListener('resize', onResize);
  }, []);

  const { containerRef } = usePixiApp(onPixiReady, []);

  // Update options ref on context changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.options = optionsRef.current;
      if (engineRef.current.sceneManager) {
        engineRef.current.sceneManager.options = optionsRef.current;
      }
    }
  }, [uiLang, progress.adventure]);

  // Cleanup
  useEffect(() => {
    return () => {
      try { stopSpeaking(); } catch {}
      if (engineRef.current) {
        try { if (engineRef.current._cleanupResize) engineRef.current._cleanupResize(); } catch {}
        try { engineRef.current.destroy(); } catch {}
        engineRef.current = null;
      }
    };
  }, []);

  // Start a world
  const handleStartWorld = useCallback((worldId) => {
    setShowWorldMap(false);
    if (engineRef.current?.sceneManager) {
      engineRef.current.sceneManager.startWorld(worldId);
    }
  }, []);

  // Pause handlers
  const handleResume = useCallback(() => {
    setShowPause(false);
    if (engineRef.current) engineRef.current.resume();
  }, []);

  const handleQuit = useCallback(() => {
    setShowPause(false);
    stopSpeaking();
    if (onBack) onBack();
  }, [onBack, stopSpeaking]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* PixiJS canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* World map overlay */}
      {showWorldMap && (
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-sky-900 via-sky-800 to-emerald-900 flex flex-col">
          <div className="flex items-center justify-between px-4 pt-safe-top" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl"
            >
              ←
            </button>
            <h1 className="text-white font-black text-lg">
              {uiLang === 'he' ? 'ההרפתקה של ספיקלי' : "Speakli's Adventure"}
            </h1>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            {/* Forest world card */}
            <button
              onClick={() => handleStartWorld('forest')}
              className="w-full max-w-sm rounded-3xl p-6 text-center active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                boxShadow: '0 8px 30px rgba(22, 163, 74, 0.4)',
              }}
            >
              <span className="text-5xl block mb-3">🌲</span>
              <h2 className="text-white font-black text-xl mb-1">
                {uiLang === 'he' ? 'יער הקסמים' : 'The Magic Forest'}
              </h2>
              <p className="text-white/80 text-sm">
                {uiLang === 'he' ? '6 סצנות • פגוש חברים חדשים!' : '6 scenes • Meet new friends!'}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
                <span className="text-white font-bold text-sm">
                  {uiLang === 'he' ? 'התחל!' : 'Start!'}
                </span>
                <span className="text-white">▶</span>
              </div>
            </button>

            {/* Locked worlds */}
            {[
              { emoji: '🌊', nameHe: 'עולם האוקיינוס', nameEn: 'Ocean World' },
              { emoji: '🚀', nameHe: 'עולם החלל', nameEn: 'Space World' },
              { emoji: '🏰', nameHe: 'הטירה הקסומה', nameEn: 'Magic Castle' },
            ].map((w, i) => (
              <div
                key={i}
                className="w-full max-w-sm rounded-3xl p-4 text-center opacity-50"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <span className="text-3xl">{w.emoji}</span>
                <p className="text-white/60 font-bold text-sm mt-1">
                  {uiLang === 'he' ? w.nameHe : w.nameEn}
                </p>
                <p className="text-white/40 text-xs">🔒 {uiLang === 'he' ? 'בקרוב!' : 'Coming soon!'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {showPause && (
        <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center max-w-xs mx-4 space-y-4">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white">
              {uiLang === 'he' ? 'הפסקה' : 'Paused'}
            </h2>
            <button
              onClick={handleResume}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg"
            >
              {uiLang === 'he' ? 'המשך!' : 'Resume!'}
            </button>
            <button
              onClick={() => { setShowPause(false); setShowWorldMap(true); }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-400 to-sky-500 text-white font-bold"
            >
              {uiLang === 'he' ? 'מפת עולמות' : 'World Map'}
            </button>
            <button
              onClick={handleQuit}
              className="w-full py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm"
            >
              {uiLang === 'he' ? 'חזרה הביתה' : 'Back Home'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
