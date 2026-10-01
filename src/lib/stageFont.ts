/**
 * Stage-relative type scale. Sizes are tuned for a 1677×865 desktop stage and shrink with
 * the stage's own width/height (laptop windows, scaled tablet/phone canvas), within min/max.
 * The element using these values (or an ancestor) must set `container-type: size`.
 */
export function stageFont(px: number, min: number) {
  return `clamp(${min}px, min(${((px * 100) / 1677).toFixed(3)}cqw, ${((px * 100) / 865).toFixed(3)}cqh), ${px}px)`;
}
