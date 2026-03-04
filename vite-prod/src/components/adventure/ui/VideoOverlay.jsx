import React, { useRef, useState, useCallback } from 'react';

/**
 * Fullscreen video overlay for adventure intro videos.
 * Shows a Play button first (required by iOS for unmuted audio),
 * then plays the video with sound + TTS narration.
 * Gracefully handles missing video files (calls onComplete immediately).
 */
export default function VideoOverlay({ src, narration, onSpeak, onComplete }) {
  const videoRef = useRef(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [waitingToPlay, setWaitingToPlay] = useState(true);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFadingOut(true);
    setTimeout(() => {
      onComplete?.();
    }, 400);
  }, [onComplete]);

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

  // User taps Play — start video + TTS narration
  const handlePlay = useCallback(() => {
    setWaitingToPlay(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        finish();
      });
    }
    // Speak narration alongside video
    if (narration && onSpeak) {
      onSpeak(narration);
    }
  }, [finish, narration, onSpeak]);

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
        preload="auto"
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Play button — shown before video starts */}
      {waitingToPlay && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          onClick={handlePlay}
          style={{ cursor: 'pointer' }}
        >
          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform">
            <span className="text-white text-4xl ml-1">▶</span>
          </div>
          <p className="text-white/70 text-sm font-medium">Tap to play</p>
        </div>
      )}

      {/* Skip button */}
      {!waitingToPlay && (
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
