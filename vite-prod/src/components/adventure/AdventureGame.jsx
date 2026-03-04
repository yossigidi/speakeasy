import React, { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSpeech } from '../../contexts/SpeechContext.jsx';
import { useUserProgress } from '../../contexts/UserProgressContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
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
import VideoOverlay from './ui/VideoOverlay.jsx';
import AchievementToast from '../gamification/AchievementToast.jsx';
import { WORLDS } from '../../data/adventure/worlds.js';
import achievementsData from '../../data/achievements.json';

// Lazy-load world map separately
const WorldMap = React.lazy(() => import('./worlds/WorldMap.js').then(m => ({ default: m.default || m })));

/**
 * React wrapper — mounts the PixiJS canvas, bridges React contexts to pure JS engine.
 */
export default function AdventureGame({ onBack }) {
  const { speak, speakSequence, stopSpeaking } = useSpeech();
  const { progress, addXP, updateProgress, activeChildId } = useUserProgress();
  const { user } = useAuth();
  const { setSection } = useMusic();
  const { uiLang } = useTheme();

  const [showPause, setShowPause] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(true);
  const [videoSrc, setVideoSrc] = useState(null);
  const [achievementToast, setAchievementToast] = useState(null);
  const engineRef = useRef(null);
  const videoResolveRef = useRef(null);
  const grantedAchievementsRef = useRef(new Set());

  // Write achievement to Firestore + show toast
  const handleAchievement = useCallback((achievementId) => {
    // Prevent duplicate grants in same session
    if (grantedAchievementsRef.current.has(achievementId)) return;
    grantedAchievementsRef.current.add(achievementId);

    const uid = user?.uid;
    if (!uid) return;

    const achPath = activeChildId
      ? ['childProfiles', activeChildId, 'achievements', achievementId]
      : ['users', uid, 'achievements', achievementId];

    try {
      const docRef = window.firestore.doc(window.db, ...achPath);
      window.firestore.setDoc(docRef, {
        unlockedAt: window.firestore.serverTimestamp(),
      }, { merge: true }).catch(() => {});
    } catch {}

    // Show toast
    const achData = achievementsData.find(a => a.id === achievementId);
    if (achData) {
      setAchievementToast({
        title: uiLang === 'he' ? achData.titleHe : achData.title,
        description: uiLang === 'he' ? achData.descriptionHe : achData.description,
        icon: achData.icon,
      });
    }
  }, [user, activeChildId, uiLang]);

  // Scene video callback — returns a Promise that resolves when video completes/skips
  const handleSceneVideo = useCallback((src) => {
    return new Promise((resolve) => {
      videoResolveRef.current = resolve;
      setVideoSrc(src);
    });
  }, []);

  const handleVideoComplete = useCallback(() => {
    setVideoSrc(null);
    if (videoResolveRef.current) {
      videoResolveRef.current();
      videoResolveRef.current = null;
    }
  }, []);

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
    onSceneVideo: handleSceneVideo,
    onAchievement: handleAchievement,
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

  // Start a world (with optional world intro video)
  const handleStartWorld = useCallback((worldId) => {
    const worldDef = WORLDS.find(w => w.id === worldId);
    const worldProgress = progress.adventure?.worldProgress || {};
    const hasStarted = (worldProgress[worldId]?.scenesCompleted || 0) > 0;

    // Play world intro video on first visit only
    if (worldDef?.introVideo && !hasStarted) {
      setShowWorldMap(false);
      // Show world intro video, then start the world
      videoResolveRef.current = () => {
        videoResolveRef.current = null;
        if (engineRef.current?.sceneManager) {
          engineRef.current.sceneManager.startWorld(worldId);
        }
      };
      setVideoSrc(worldDef.introVideo);
    } else {
      setShowWorldMap(false);
      if (engineRef.current?.sceneManager) {
        engineRef.current.sceneManager.startWorld(worldId);
      }
    }
  }, [progress.adventure]);

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

  return createPortal(
    <div className="bg-black" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 99999, overflow: 'hidden' }}>
      {/* PixiJS canvas container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      />

      {/* Video intro overlay */}
      {videoSrc && (
        <VideoOverlay src={videoSrc} onComplete={handleVideoComplete} />
      )}

      {/* Achievement toast */}
      {achievementToast && (
        <AchievementToast
          achievement={achievementToast}
          onDismiss={() => setAchievementToast(null)}
        />
      )}

      {/* World map overlay */}
      {showWorldMap && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, background: 'linear-gradient(to bottom, #0c4a6e, #075985, #064e3b)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="flex items-center justify-between px-4 shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
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

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 24px', WebkitOverflowScrolling: 'touch' }}>
            {[
              { id: 'forest', emoji: '🌲', nameHe: 'יער הקסמים', nameEn: 'The Magic Forest', gradient: ['#22c55e', '#16a34a', '#15803d'], shadow: 'rgba(22, 163, 74, 0.4)', scenes: 6, requiresWorld: null },
              { id: 'ocean', emoji: '🌊', nameHe: 'עולם האוקיינוס', nameEn: 'Ocean World', gradient: ['#0ea5e9', '#0284c7', '#0369a1'], shadow: 'rgba(14, 165, 233, 0.4)', scenes: 6, requiresWorld: 'forest' },
              { id: 'space', emoji: '🚀', nameHe: 'עולם החלל', nameEn: 'Space World', gradient: ['#6366f1', '#4f46e5', '#4338ca'], shadow: 'rgba(99, 102, 241, 0.4)', scenes: 6, requiresWorld: 'ocean' },
              { id: 'castle', emoji: '🏰', nameHe: 'הטירה הקסומה', nameEn: 'Magic Castle', gradient: ['#f59e0b', '#d97706', '#b45309'], shadow: 'rgba(245, 158, 11, 0.4)', scenes: 6, requiresWorld: 'space' },
            ].map((world) => {
              const worldProgress = progress.adventure?.worldProgress || {};
              const requiredCompleted = world.requiresWorld
                ? (worldProgress[world.requiresWorld]?.scenesCompleted || 0)
                : Infinity;
              const requiredTotal = world.requiresWorld ? 6 : 0;
              const isUnlocked = !world.requiresWorld || requiredCompleted >= requiredTotal;
              const myCompleted = worldProgress[world.id]?.scenesCompleted || 0;
              const hasStarted = myCompleted > 0;
              const isComplete = myCompleted >= world.scenes;

              // Worlds with no scenes file yet (space, castle)
              const hasContent = true; // All 4 worlds now have content

              if (isUnlocked && hasContent) {
                return (
                  <button
                    key={world.id}
                    onClick={() => handleStartWorld(world.id)}
                    className="w-full max-w-sm rounded-3xl p-6 text-center active:scale-95 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${world.gradient[0]} 0%, ${world.gradient[1]} 50%, ${world.gradient[2]} 100%)`,
                      boxShadow: `0 8px 30px ${world.shadow}`,
                    }}
                  >
                    <span className="text-5xl block mb-3">{world.emoji}</span>
                    <h2 className="text-white font-black text-xl mb-1">
                      {uiLang === 'he' ? world.nameHe : world.nameEn}
                    </h2>
                    <p className="text-white/80 text-sm">
                      {isComplete
                        ? (uiLang === 'he' ? `הושלם! ${world.scenes}/${world.scenes}` : `Complete! ${world.scenes}/${world.scenes}`)
                        : hasStarted
                          ? (uiLang === 'he' ? `${myCompleted}/${world.scenes} הושלמו` : `${myCompleted}/${world.scenes} completed`)
                          : (uiLang === 'he' ? `${world.scenes} סצנות • פגוש חברים חדשים!` : `${world.scenes} scenes • Meet new friends!`)
                      }
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
                      <span className="text-white font-bold text-sm">
                        {isComplete
                          ? (uiLang === 'he' ? 'שחק שוב!' : 'Play again!')
                          : hasStarted
                            ? (uiLang === 'he' ? 'המשך!' : 'Continue!')
                            : (uiLang === 'he' ? 'התחל!' : 'Start!')
                        }
                      </span>
                      <span className="text-white">▶</span>
                    </div>
                  </button>
                );
              }

              // Locked world
              return (
                <div
                  key={world.id}
                  className="w-full max-w-sm rounded-3xl p-4 text-center opacity-50"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <span className="text-3xl">{world.emoji}</span>
                  <p className="text-white/60 font-bold text-sm mt-1">
                    {uiLang === 'he' ? world.nameHe : world.nameEn}
                  </p>
                  <p className="text-white/40 text-xs">
                    {uiLang === 'he' ? 'בקרוב!' : 'Coming soon!'}
                  </p>
                </div>
              );
            })}
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
    </div>,
    document.body
  );
}
