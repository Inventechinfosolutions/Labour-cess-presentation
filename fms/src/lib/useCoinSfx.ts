import { useCallback, useEffect, useRef, useState } from 'react';
import { fmsAudio } from '@/lib/assets';

const KEY = 'rguhs-fms-sfx';

/**
 * Tiny hook for the bundled coin SFX. Plays only after user interaction
 * (browsers block autoplay otherwise). Volume defaults low so it never
 * startles. Per-call rate limit prevents click-spam.
 */
export function useCoinSfx() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayed = useRef(0);
  const [enabled, setEnabledState] = useState<boolean>(() => {
    try { return localStorage.getItem(KEY) !== '0'; } catch { return true; }
  });

  useEffect(() => {
    const a = new Audio(fmsAudio.coins);
    a.preload = 'auto';
    a.volume = 0.35;
    audioRef.current = a;
    return () => {
      try { a.pause(); a.src = ''; } catch (_) {}
      audioRef.current = null;
    };
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (_) {}
  }, []);

  const play = useCallback(() => {
    if (!enabled) return;
    const now = Date.now();
    // Throttle: at most once every 600ms
    if (now - lastPlayed.current < 600) return;
    lastPlayed.current = now;
    const a = audioRef.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      void a.play();
    } catch (_) {
      /* ignore — autoplay block etc. */
    }
  }, [enabled]);

  return { play, enabled, setEnabled };
}
