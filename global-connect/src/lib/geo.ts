export type LatLng = [lat: number, lng: number];
export type View = { cx: number; cy: number; s: number };
export type Size = { w: number; h: number };
export type Inset = { l: number; t: number; r: number; b: number };

/** Web Mercator tile size; world coordinates are zoom-0 pixels. */
export const TILE = 256;

export function project([lat, lng]: LatLng): [number, number] {
  const x = ((lng + 180) / 360) * TILE;
  const r = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * TILE;
  return [x, y];
}

/** View that fits all points inside the inset area of a w×h box. */
export function fitPoints(points: LatLng[], size: Size, inset: Inset): View {
  const ps = points.map(project);
  const xs = ps.map((p) => p[0]);
  const ys = ps.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const aw = Math.max(1, size.w - inset.l - inset.r);
  const ah = Math.max(1, size.h - inset.t - inset.b);
  const s = Math.min(aw / Math.max(maxX - minX, 1e-6), ah / Math.max(maxY - minY, 1e-6));
  const areaCx = inset.l + aw / 2;
  const areaCy = inset.t + ah / 2;
  return {
    cx: (minX + maxX) / 2 + (size.w / 2 - areaCx) / s,
    cy: (minY + maxY) / 2 + (size.h / 2 - areaCy) / s,
    s,
  };
}

export function toScreen(view: View, size: Size, at: LatLng): [number, number] {
  const [x, y] = project(at);
  return [(x - view.cx) * view.s + size.w / 2, (y - view.cy) * view.s + size.h / 2];
}
