import { useCallback, useEffect, useRef, useState } from "react";
import { activeCue, cuesForTrack, ensureVoiceCues, nextChainTrack } from "@/lib/voiceCues";
import { FULL_VOICE, SCENE_VOICE, trackForSlide, type VoiceTrack } from "@/lib/voiceover";

type CueTarget = { slide: number; beat: number };

type Options = {
  onCue: (target: CueTarget) => void;
  slide: number;
};

function trackById(id: string): VoiceTrack | null {
  if (id === FULL_VOICE.id) return FULL_VOICE;
  const seen = new Map<string, VoiceTrack>();
  for (const t of Object.values(SCENE_VOICE)) seen.set(t.id, t);
  return seen.get(id) ?? null;
}

export function useVoiceover({ slide, onCue }: Options) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const slideRef = useRef(slide);
  const trackRef = useRef<VoiceTrack>(trackForSlide(slide));
  const onCueRef = useRef(onCue);
  const lastCueKeyRef = useRef("");
  const chainRef = useRef(false);
  const modeRef = useRef<"off" | "scene" | "full">("off");
  const expectedSlideRef = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState<VoiceTrack>(() => trackForSlide(slide));
  const [syncing, setSyncing] = useState(false);
  const [cuesReady, setCuesReady] = useState(false);

  slideRef.current = slide;
  onCueRef.current = onCue;
  trackRef.current = track;

  useEffect(() => {
    let cancelled = false;
    void ensureVoiceCues().then(() => {
      if (!cancelled) setCuesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const emitCue = useCallback((target: CueTarget, trackId: string) => {
    const key = `${target.slide}:${target.beat}:${trackId}`;
    if (key === lastCueKeyRef.current) return;
    lastCueKeyRef.current = key;
    expectedSlideRef.current = target.slide;
    setSyncing(true);
    onCueRef.current(target);
  }, []);

  const applyCues = useCallback(
    (time: number, trackId: string) => {
      const cue = activeCue(cuesForTrack(trackId), time);
      if (!cue) return;
      emitCue(cue, trackId);
    },
    [emitCue],
  );

  const startTrack = useCallback(
    async (next: VoiceTrack, mode: "scene" | "full", chain: boolean) => {
      await ensureVoiceCues();
      setCuesReady(true);
      const audio = audioRef.current;
      if (!audio) return;
      modeRef.current = mode;
      chainRef.current = chain;
      lastCueKeyRef.current = "";
      setTrack(next);
      trackRef.current = next;
      setSyncing(true);
      audio.src = next.file;
      audio.currentTime = 0;
      const first = cuesForTrack(next.id)[0];
      if (first) emitCue(first, next.id);
      void audio.play().catch(() => {
        setPlaying(false);
        setSyncing(false);
        modeRef.current = "off";
        expectedSlideRef.current = null;
      });
    },
    [emitCue],
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => {
      if (audio.paused) return;
      applyCues(audio.currentTime, trackRef.current.id);
    };

    const onEnded = () => {
      setPlaying(false);
      if (modeRef.current === "scene" && chainRef.current) {
        const nxt = nextChainTrack(trackRef.current.id);
        const nextTrack = nxt ? trackById(nxt.id) : null;
        if (nextTrack) {
          void startTrack(nextTrack, "scene", true);
          return;
        }
      }
      modeRef.current = "off";
      chainRef.current = false;
      setSyncing(false);
      expectedSlideRef.current = null;
    };

    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
      audioRef.current = null;
    };
  }, [applyCues, startTrack]);

  useEffect(() => {
    if (expectedSlideRef.current === slide) {
      expectedSlideRef.current = null;
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused && modeRef.current !== "off") {
      audio.pause();
      audio.currentTime = 0;
      modeRef.current = "off";
      chainRef.current = false;
      setPlaying(false);
      setSyncing(false);
      lastCueKeyRef.current = "";
      expectedSlideRef.current = null;
    }
    setTrack(trackForSlide(slide));
  }, [slide]);

  const toggleScene = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = trackForSlide(slideRef.current);
    if (!audio.paused && trackRef.current.id === next.id && modeRef.current === "scene") {
      audio.pause();
      modeRef.current = "off";
      chainRef.current = false;
      setSyncing(false);
      expectedSlideRef.current = null;
      return;
    }
    void startTrack(next, "scene", true);
  }, [startTrack]);

  const toggleFull = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused && trackRef.current.id === FULL_VOICE.id) {
      audio.pause();
      modeRef.current = "off";
      setSyncing(false);
      expectedSlideRef.current = null;
      return;
    }
    void startTrack(FULL_VOICE, "full", false);
  }, [startTrack]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    modeRef.current = "off";
    chainRef.current = false;
    setPlaying(false);
    setSyncing(false);
    lastCueKeyRef.current = "";
    expectedSlideRef.current = null;
  }, []);

  return { playing, syncing, cuesReady, track, toggleScene, toggleFull, stop };
}
