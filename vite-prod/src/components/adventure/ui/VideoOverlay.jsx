import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Fullscreen video overlay for adventure intro videos.
 * Plays an MP4 over the PixiJS canvas, with skip button.
 * Gracefully handles missing video files (calls onComplete immediately).
 */
export default function VideoOverlay({ src, onComplete }) {
  const videoRef = useRef(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [hasError, setHasError] = useState(false);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setFadingOut(true);
    setTimeout(() => {
      onComplete?.();
    }, 400);
  }, [onComplete]);

  // Handle video errors (missing file, etc.) — skip gracefully
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

  // Auto-play on mount
  useEffect(() => {
    if (videoRef.current && !hasError) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked or file missing — skip
        finish();
      });
    }
  }, [hasError, finish]);

  if (hasError) return null;

  return (
    <div
      className="fixed inset-0 z-30 bg-black flex items-center justify-center"
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.4s ease-out',
      }}
      onClick={handleSkip}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        playsInline
        muted
        autoPlay
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Skip button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleSkip(); }}
        className="absolute bottom-8 right-6 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-sm active:scale-95 transition-transform"
        style={{ zIndex: 31 }}
      >
        Skip ▶
      </button>
    </div>
  );
}
