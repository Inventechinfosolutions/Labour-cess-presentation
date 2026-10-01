import { TILE, type Size, type View } from "@/lib/geo";

/** Raster web-map tiles for a view; wraps around the date line. `url` uses {z} {x} {y}. */
export function WorldTiles({
  view,
  size,
  url,
  maxZoom,
  className,
}: {
  view: View;
  size: Size;
  url: string;
  maxZoom: number;
  className?: string;
}) {
  const z = Math.max(0, Math.min(maxZoom, Math.floor(Math.log2(view.s) + 0.5)));
  const n = 2 ** z;
  const tilePx = (TILE * view.s) / n;
  const left = view.cx - size.w / (2 * view.s);
  const top = view.cy - size.h / (2 * view.s);
  const tx0 = Math.floor((left * n) / TILE);
  const tx1 = Math.floor(((left + size.w / view.s) * n) / TILE);
  const ty0 = Math.max(0, Math.floor((top * n) / TILE));
  const ty1 = Math.min(n - 1, Math.floor(((top + size.h / view.s) * n) / TILE));

  const tiles = [];
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const x = ((tx % n) + n) % n;
      tiles.push(
        <img
          key={`${z}-${tx}-${ty}`}
          src={url.replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(ty))}
          alt=""
          draggable={false}
          className="absolute max-w-none select-none"
          style={{
            left: Math.floor(((tx * TILE) / n - left) * view.s),
            top: Math.floor(((ty * TILE) / n - top) * view.s),
            width: Math.ceil(tilePx) + 1,
            height: Math.ceil(tilePx) + 1,
          }}
        />,
      );
    }
  }

  return <div className={className ?? "pointer-events-none absolute inset-0 overflow-hidden"}>{tiles}</div>;
}
