import { useLayoutEffect, useRef, useState } from "react";

/** Design canvas used when the viewport is smaller than a laptop stage. */
export const SLIDE_DESIGN = {
  w: 1360,
  h: 760,
} as const;

export type FitMode = "fluid" | "scaled";

type FitState = {
  scale: number;
  mode: FitMode;
  frameW: number;
  frameH: number;
};

export function useFitScale(designW = SLIDE_DESIGN.w, designH = SLIDE_DESIGN.h) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<FitState>({
    scale: 1,
    mode: "fluid",
    frameW: designW,
    frameH: designH,
  });

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const update = () => {
      const { width, height } = frame.getBoundingClientRect();
      if (width < 2 || height < 2) return;

      const contain = Math.min(width / designW, height / designH);

      // Laptops & desktops: always fill the stage edge-to-edge (no side gaps).
      // Phones / small tablets: keep a fixed canvas and scale it down.
      const isLargeStage = width >= 1024 || contain >= 0.92;
      if (isLargeStage) {
        setFit({ scale: 1, mode: "fluid", frameW: width, frameH: height });
      } else {
        setFit({
          scale: contain,
          mode: "scaled",
          frameW: width,
          frameH: height,
        });
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(frame);
    window.addEventListener("orientationchange", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", update);
    };
  }, [designW, designH]);

  return { frameRef, designW, designH, ...fit };
}
