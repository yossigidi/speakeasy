import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Fullscreen video overlay for adventure intro videos.
 * - autoPlay mode: video starts immediately (muted for iOS) + TTS narration
 * - manual mode: shows Play button, user taps to start video + TTS
 * Gracefully handles missing video files (calls onComplete immediately).
 */
export default function VideoOverlay({ src, narration, onSpeak, onStopSpeaking, onComplete, autoPlay }) {
  const videoRef = useRef(null);
  const finishTimerRef = useRef(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [started, setStarted] = useState(false);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onStopSpeaking?.();
    setFadingOut(true);
    finishTimerRef.current = setTimeout(() => {
      onComplete?.();
    }, 400);
  }, [onComplete, onStopSpeaking]);

  // Cleanup on unmount — stop video + TTS + clear finish timer
  useEffect(() => {
    return () => {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      if (!completedRef.current) {
        onStopSpeaking?.();
      }
    };
  }, [onStopSpeaking]);

  const handleError = useCallback(() => {
    setHasError(true);
    finish();
  }, [finish]);

  const handleEnded = useCallback(() => {
    finish();
  }, [finish]);

  const handleSkip = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    finish();
  }, [finish]);

  // Start video + TTS — must be called from user gesture for iOS audio
  const startPlayback = useCallback(() => {
    if (started) return;
    setStarted(true);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {
        finish();
      });
    }
    if (narration && onSpeak) {
      onSpeak(narration);
    }
  }, [started, finish, narration, onSpeak]);

  if (hasError) return null;

  return (
    <div
      className="fixed inset-0 z-30 bg-black flex items-center justify-center"
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        playsInline
        muted
        preload="auto"
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Play button — user gesture required for unmuted audio on mobile */}
      {!started && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          onClick={startPlayback}
          style={{ cursor: 'pointer', zIndex: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl active:scale-90 transition-transform">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="#1e293b"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      )}

      {/* Skip button */}
      {started && (
        <button
          onClick={(e) => { e.stopPropagation(); handleSkip(); }}
          className="absolute bottom-8 right-6 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-sm active:scale-95 transition-transform"
          style={{ zIndex: 31 }}
        >
          Skip ▶
        </button>
      )}
    </div>
  );
}
