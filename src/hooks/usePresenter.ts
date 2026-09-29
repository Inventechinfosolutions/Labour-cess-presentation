import { useCallback, useEffect, useState } from "react";
import { SCENES } from "@/lib/deck";

function parseHash() {
  const m = location.hash.match(/^#(\d+)(?:\/(\d+))?$/);
  if (!m) return { slide: 0, beat: 0 };
  const slide = Math.max(0, Math.min(SCENES.length - 1, Number(m[1])));
  const beat = Math.max(0, Math.min(SCENES[slide].beats - 1, Number(m[2] || 0)));
  return { slide, beat };
}

export function usePresenter() {
  const start = parseHash();
  const [slide, setSlide] = useState(start.slide);
  const [beat, setBeat] = useState(start.beat);
  const [overview, setOverview] = useState(false);
  const [help, setHelp] = useState(false);

  const goTo = useCallback((s: number, b = 0) => {
    const next = Math.max(0, Math.min(SCENES.length - 1, s));
    const max = SCENES[next].beats;
    setSlide(next);
    setBeat(Math.max(0, Math.min(max - 1, b)));
    setOverview(false);
    setHelp(false);
  }, []);

  const next = useCallback(() => {
    if (overview || help) return;
    const max = SCENES[slide].beats;
    if (beat < max - 1) setBeat(beat + 1);
    else if (slide < SCENES.length - 1) goTo(slide + 1, 0);
  }, [beat, goTo, help, overview, slide]);

  const prev = useCallback(() => {
    if (overview || help) return;
    if (beat > 0) setBeat(beat - 1);
    else if (slide > 0) goTo(slide - 1, SCENES[slide - 1].beats - 1);
  }, [beat, goTo, help, overview, slide]);

  useEffect(() => {
    const hash = `#${slide}/${beat}`;
    if (location.hash !== hash) history.replaceState(null, "", hash);
  }, [slide, beat]);

  useEffect(() => {
    const applyHash = () => {
      const m = location.hash.match(/^#(\d+)(?:\/(\d+))?$/);
      if (!m) return;
      goTo(Number(m[1]), Number(m[2] || 0));
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      if (key === "Escape") {
        if (help) {
          setHelp(false);
          return;
        }
        setOverview((v) => !v);
        return;
      }
      if (key === "o" || key === "O") {
        e.preventDefault();
        setHelp(false);
        setOverview((v) => !v);
        return;
      }
      if (key === "?" || key === "h" || key === "H") {
        e.preventDefault();
        setHelp((v) => !v);
        return;
      }
      if (key === "f" || key === "F") {
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
        return;
      }
      if (overview || help) return;
      if (key === "ArrowRight" || key === " " || key === "PageDown" || key === "Enter") {
        e.preventDefault();
        next();
      } else if (key === "ArrowLeft" || key === "PageUp" || key === "Backspace") {
        e.preventDefault();
        prev();
      } else if (key === "Home") {
        e.preventDefault();
        goTo(0, 0);
      } else if (key === "End") {
        e.preventDefault();
        goTo(SCENES.length - 1, 0);
      } else if (/^[0-9]$/.test(key)) {
        goTo(Number(key), 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, help, next, overview, prev]);

  return {
    slide,
    beat,
    overview,
    help,
    scene: SCENES[slide],
    goTo,
    next,
    prev,
    setOverview,
    setHelp,
    setBeat,
  };
}
