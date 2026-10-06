/** Indian English video speech tracks (public/audio). Source: scripts/voice-script.md */

const AUDIO = `${import.meta.env.BASE_URL}audio/`;

export type VoiceTrack = {
  id: string;
  file: string;
  title: string;
};

/** Scene index → voiceover for that slide */
export const SCENE_VOICE: Record<number, VoiceTrack> = {
  0: {
    id: "02-product",
    file: AUDIO + "02-product.mp3",
    title: "Product introduction",
  },
  1: {
    id: "01-problem",
    file: AUDIO + "01-problem.mp3",
    title: "Problem",
  },
  2: {
    id: "03a-assess",
    file: AUDIO + "03a-assess.mp3",
    title: "Assessment workflow",
  },
  3: {
    id: "03b-gps-field-app",
    file: AUDIO + "03b-gps-field-app.mp3",
    title: "Field Mobile App (GPS)",
  },
  4: {
    id: "03c-gis-territory-map",
    file: AUDIO + "03c-gis-territory-map.mp3",
    title: "Territory map (GIS)",
  },
  5: {
    id: "03d-compare-records",
    file: AUDIO + "03d-compare-records.mp3",
    title: "Compare project records",
  },
};

export const FULL_VOICE: VoiceTrack = {
  id: "00-full-video-speech",
  file: AUDIO + "00-full-video-speech.mp3",
  title: "Full video speech",
};

export function trackForSlide(slide: number): VoiceTrack {
  return SCENE_VOICE[slide] ?? FULL_VOICE;
}
