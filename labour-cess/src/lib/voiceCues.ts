import { SCENES } from "@/lib/deck";

/** Absolute or track-relative cue from public/audio/cues.json */
export type VoiceCue = {
  at: number;
  slide: number;
  beat: number;
  marker?: string;
};

type CuesFile = {
  chain?: { id: string; startSlide: number }[];
  tracks: Record<string, VoiceCue[]>;
};

const FALLBACK_CHAIN: { id: string; startSlide: number }[] = [
  { id: "01-problem", startSlide: 1 },
  { id: "02-product", startSlide: 0 },
  { id: "03a-assess", startSlide: 2 },
  { id: "03b-gps-field-app", startSlide: 3 },
  { id: "03c-gis-territory-map", startSlide: 4 },
  { id: "03d-compare-records", startSlide: 5 },
];

let cache: CuesFile | null = null;
let loadPromise: Promise<CuesFile> | null = null;

function fallbackCues(trackId: string): VoiceCue[] {
  const chainHit = FALLBACK_CHAIN.find((c) => c.id === trackId);
  if (chainHit) return [{ at: 0, slide: chainHit.startSlide, beat: 0, marker: "fallback" }];
  if (trackId === "00-full-video-speech") return [{ at: 0, slide: 1, beat: 0, marker: "fallback" }];
  return [{ at: 0, slide: 0, beat: 0, marker: "fallback" }];
}

export async function ensureVoiceCues(): Promise<void> {
  if (cache) return;
  if (!loadPromise) {
    loadPromise = fetch(`${import.meta.env.BASE_URL}audio/cues.json`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`cues.json ${res.status}`);
        return (await res.json()) as CuesFile;
      })
      .then((data) => {
        cache = data;
        return data;
      })
      .catch(() => {
        cache = { chain: FALLBACK_CHAIN, tracks: {} };
        return cache;
      });
  }
  await loadPromise;
}

export function cuesForTrack(trackId: string): VoiceCue[] {
  const list = cache?.tracks?.[trackId];
  if (list?.length) return list;
  return fallbackCues(trackId);
}

/** Latest cue at or before `time` (seconds). */
export function activeCue(cues: VoiceCue[], time: number): VoiceCue | null {
  if (!cues.length) return null;
  let best: VoiceCue | null = null;
  for (const c of cues) {
    if (c.at <= time + 0.05) best = c;
    else break;
  }
  return best;
}

export function getVoiceChain(): { id: string; startSlide: number }[] {
  return cache?.chain?.length ? cache.chain : FALLBACK_CHAIN;
}

export function nextChainTrack(currentId: string): { id: string; startSlide: number } | null {
  const chain = getVoiceChain();
  const i = chain.findIndex((t) => t.id === currentId);
  if (i < 0 || i >= chain.length - 1) return null;
  return chain[i + 1];
}

/** @deprecated kept for typing consumers; prefer cues.json */
export const VOICE_CHAIN = FALLBACK_CHAIN;

export function sceneIdToIndex(id: string): number {
  return SCENES.findIndex((s) => s.id === id);
}
