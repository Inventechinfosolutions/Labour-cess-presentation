import { useEffect, useRef, useState } from "react";
import type { TileSize, TileView } from "@/components/TileLayer";
import { project } from "@/scenes/gisTerritoryData";

export type LatLngBounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };
export type Inset = { l: number; t: number; r: number; b: number };

/** Scale that fits `b` into the free area of `size` left by `inset`. */
export function fitScale(b: LatLngBounds, size: TileSize, inset: Inset) {
  const [x0, y1] = project([b.minLat, b.minLng]);
  const [x1, y0] = project([b.maxLat, b.maxLng]);
  const aw = Math.max(size.w - inset.l - inset.r, 1);
  const ah = Math.max(size.h - inset.t - inset.b, 1);
  return Math.min(aw / (x1 - x0), ah / (y1 - y0));
}

export function fitBounds(b: LatLngBounds, size: TileSize, inset: Inset): TileView {
  const [x0, y1] = project([b.minLat, b.minLng]);
  const [x1, y0] = project([b.maxLat, b.maxLng]);
  const aw = Math.max(size.w - inset.l - inset.r, 1);
  const ah = Math.max(size.h - inset.t - inset.b, 1);
  const s = fitScale(b, size, inset);
  const sx = inset.l + aw / 2;
  const sy = inset.t + ah / 2;
  return { cx: (x0 + x1) / 2 - (sx - size.w / 2) / s, cy: (y0 + y1) / 2 - (sy - size.h / 2) / s, s };
}

/** Eases the view to `target` — pan and zoom together, zoom in log space. */
export function useFlyView(target: TileView | null, reduce: boolean, duration = 1100) {
  const [view, setView] = useState<TileView | null>(null);
  const viewRef = useRef<TileView | null>(null);

  useEffect(() => {
    if (!target) return;
    const from = viewRef.current;
    if (!from || reduce) {
      viewRef.current = target;
      setView(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
      const next = {
        cx: from.cx + (target.cx - from.cx) * e,
        cy: from.cy + (target.cy - from.cy) * e,
        s: from.s * (target.s / from.s) ** e,
      };
      viewRef.current = next;
      setView(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduce, duration]);

  return view;
}
