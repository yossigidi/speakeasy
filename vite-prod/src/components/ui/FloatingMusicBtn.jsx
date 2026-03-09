import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '../../contexts/MusicContext.jsx';

export default function FloatingMusicBtn() {
  const { musicEnabled, toggleMusic } = useMusic();

  return (
    <button
      onClick={toggleMusic}
      aria-label={musicEnabled ? 'Mute music' : 'Unmute music'}
      className="fixed z-50 flex items-center justify-center w-9 h-9 rounded-full
        bg-white/70 dark:bg-gray-800/70 backdrop-blur shadow-md
        text-gray-600 dark:text-gray-300
        active:scale-90 transition-transform"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)', right: 12 }}
    >
      {musicEnabled
        ? <Volume2 size={18} />
        : <VolumeX size={18} className="opacity-50" />}
    </button>
  );
}
