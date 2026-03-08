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
import { Lock } from 'lucide-react';
import { t, tReplace, lf, RTL_LANGS } from '../../utils/translations.js';
import useContentGate from '../../hooks/useContentGate.js';
import PaywallModal from '../subscription/PaywallModal.jsx';

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
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [videoData, setVideoData] = useState({
    src: '/videos/adventure/welcome.mp4',
    narration: t('adventureWelcomeNarration', uiLang),
    autoPlay: true,
  });
  const [achievementToast, setAchievementToast] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const { isLocked: isContentLocked } = useContentGate();
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
        title: lf(achData, 'title', uiLang),
        description: lf(achData, 'description', uiLang),
        icon: achData.icon,
      });
    }
  }, [user, activeChildId, uiLang]);

  // Scene video callback — returns a Promise that resolves when video completes/skips
  // Accepts string (legacy) or { src, narration } object
  const handleSceneVideo = useCallback((videoInfo) => {
    return new Promise((resolve) => {
      videoResolveRef.current = resolve;
      if (typeof videoInfo === 'string') {
        setVideoData({ src: videoInfo, narration: null, autoPlay: true });
      } else {
        setVideoData({ autoPlay: true, ...videoInfo });
      }
    });
  }, []);

  const handleVideoComplete = useCallback(() => {
    const hadResolver = !!videoResolveRef.current;
    setVideoData(null);
    stopSpeaking();
    if (videoResolveRef.current) {
      videoResolveRef.current();
      videoResolveRef.current = null;
    }
    // If no resolver was set, this was the welcome video — show world map
    if (!hadResolver) {
      setShowWorldMap(true);
    }
  }, [stopSpeaking]);

  const childLevel = progress.curriculumLevel || progress.childLevel || 1;

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
    childLevel,
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
      if (engineRef.current.sceneManager?.dialogue) {
        engineRef.current.sceneManager.dialogue.options = optionsRef.current;
      }
      if (engineRef.current.hud) {
        engineRef.current.hud.options = optionsRef.current;
      }
    }
  });

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
    // Prevent double-tap: if a video is already queued, ignore
    if (videoResolveRef.current) return;

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
      setVideoData({ src: worldDef.introVideo, narration: worldDef.videoNarration || null, autoPlay: true });
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
    setVideoData(null);
    videoResolveRef.current = null; // Discard — don't call (it triggers startWorld)
    stopSpeaking();
    if (engineRef.current?.sceneManager) {
      try { engineRef.current.sceneManager.stop(); } catch {}
    }
    if (onBack) onBack();
  }, [onBack, stopSpeaking]);

  return createPortal(
    <div className="bg-black" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: 99999, overflow: 'hidden' }}>
      {/* PixiJS canvas container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      />

      {/* Back button during gameplay (not on world map or video) */}
      {!showWorldMap && !videoData && !showPause && (
        <button
          onClick={() => setShowPause(true)}
          className="absolute z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-lg active:scale-90 transition-transform"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)', left: RTL_LANGS.includes(uiLang) ? 'auto' : '12px', right: RTL_LANGS.includes(uiLang) ? '12px' : 'auto' }}
        >
          {RTL_LANGS.includes(uiLang) ? '→' : '←'}
        </button>
      )}

      {/* Video intro overlay */}
      {videoData && (
        <VideoOverlay
          src={videoData.src}
          narration={videoData.narration}
          autoPlay={videoData.autoPlay}
          onSpeak={(text) => speak(text, { lang: uiLang })}
          onStopSpeaking={stopSpeaking}
          onComplete={handleVideoComplete}
        />
      )}

      {/* Achievement toast */}
      {achievementToast && (
        <AchievementToast
          achievement={achievementToast}
          onDismiss={() => setAchievementToast(null)}
        />
      )}

      {/* World map overlay — card style like Talking World */}
      {showWorldMap && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, background: 'linear-gradient(to bottom, #f0fdf4, #ecfdf5, #f0f9ff)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="flex items-center justify-between px-4 shrink-0" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
            <button
              onClick={handleQuit}
              className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-gray-700 text-xl"
            >
              {RTL_LANGS.includes(uiLang) ? '→' : '←'}
            </button>
            <h1 className="text-gray-800 font-black text-lg">
              {t('adventureTitle', uiLang)}
            </h1>
            <div className="w-10" />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', WebkitOverflowScrolling: 'touch' }}>
            <div className="space-y-4 max-w-lg mx-auto">
              {WORLDS.map((world, worldIdx) => {
                const worldProg = progress.adventure?.worldProgress || {};
                const requiredCompleted = world.requiresWorld
                  ? (worldProg[world.requiresWorld]?.scenesCompleted || 0)
                  : Infinity;
                const requiredTotal = world.requiresWorld ? 6 : 0;
                const isPremiumLocked = isContentLocked('adventureWorlds', worldIdx);
                const isUnlocked = !isPremiumLocked && (!world.requiresWorld || requiredCompleted >= requiredTotal);
                const myCompleted = worldProg[world.id]?.scenesCompleted || 0;
                const isComplete = myCompleted >= world.scenes;
                const locked = !isUnlocked;

                const langKey = { he: 'nameHe', ar: 'nameAr', ru: 'nameRu' }[uiLang] || 'nameEn';
                const worldName = world[langKey] || world.nameEn;

                return (
                  <button
                    key={world.id}
                    onClick={() => {
                      if (isPremiumLocked) { setShowPaywall(true); return; }
                      if (locked) return;
                      handleStartWorld(world.id);
                    }}
                    disabled={locked && !isPremiumLocked}
                    className={`w-full rounded-3xl overflow-hidden text-left transition-all duration-300 relative ${
                      locked ? 'opacity-50 grayscale' : 'active:scale-[0.97]'
                    }`}
                  >
                    <div
                      className="w-full rounded-3xl p-5 relative overflow-hidden"
                      style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.55)), url(${world.bg}) center/cover` }}
                    >
                      {/* World icon badge */}
                      <img
                        src={world.icon}
                        alt=""
                        className="absolute top-3 right-3 w-14 h-14 rounded-full object-cover border-2 border-white/40 shadow-lg"
                      />

                      {locked && (
                        <div className="absolute top-5 right-5 bg-black/40 rounded-full p-1.5 z-10">
                          <Lock size={14} className="text-white" />
                        </div>
                      )}

                      {isComplete && (
                        <div className="absolute top-3 left-3 bg-yellow-400 rounded-full px-2 py-0.5 text-xs font-bold text-yellow-900">
                          ⭐ {t('adventureComplete', uiLang) || 'Complete'}
                        </div>
                      )}

                      <div className="relative z-10 mt-8">
                        <h3 className="text-white font-black text-xl">
                          {worldName}
                        </h3>
                        <p className="text-white/70 text-sm font-medium mt-1">
                          {locked
                            ? (isPremiumLocked ? 'Premium' : t('comingSoon', uiLang))
                            : isComplete
                              ? tReplace('worldComplete', uiLang, { done: world.scenes, total: world.scenes })
                              : myCompleted > 0
                                ? tReplace('worldProgress', uiLang, { done: myCompleted, total: world.scenes })
                                : tReplace('worldNew', uiLang, { scenes: world.scenes })
                          }
                        </p>

                        {/* NPC character preview */}
                        {!locked && world.npcImages && (
                          <div className="flex gap-2 mt-3">
                            {world.npcImages.map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt=""
                                className={`w-10 h-10 rounded-full object-cover border-2 ${
                                  i < myCompleted ? 'border-yellow-300 shadow-md' : 'border-white/30 opacity-70'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Premium paywall */}
      {showPaywall && <PaywallModal feature="adventureWorlds" onClose={() => setShowPaywall(false)} onNavigate={() => {}} />}

      {/* Pause overlay */}
      {showPause && (
        <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center max-w-xs mx-4 space-y-4">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white">
              {t('adventurePaused', uiLang)}
            </h2>
            <button
              onClick={handleResume}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-lg"
            >
              {t('adventureResume', uiLang)}
            </button>
            <button
              onClick={() => {
                setShowPause(false);
                if (engineRef.current?.sceneManager) {
                  try { engineRef.current.sceneManager.stop(); } catch {}
                }
                setShowWorldMap(true);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-400 to-sky-500 text-white font-bold"
            >
              {t('adventureWorldMap', uiLang)}
            </button>
            <button
              onClick={handleQuit}
              className="w-full py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm"
            >
              {t('backHome', uiLang)}
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
