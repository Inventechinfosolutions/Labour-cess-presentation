import { BASE_ZOOM } from "@/scenes/gisTerritoryData";

/** View centre in zoom-10 Web Mercator pixels; `s` = screen pixels per zoom-10 pixel. */
export type TileView = { cx: number; cy: number; s: number };
export type TileSize = { w: number; h: number };
export type TileService = "map" | "satellite" | "labels" | "roads";

const SERVICE: Record<TileService, string> = {
  map: "World_Street_Map",
  satellite: "World_Imagery",
  labels: "Reference/World_Boundaries_and_Places",
  roads: "Reference/World_Transportation",
};

export function TileLayer({ view, size, z, service }: { view: TileView; size: TileSize; z: number; service: TileService }) {
  const tw = 256 / 2 ** (z - BASE_ZOOM);
  const x0 = view.cx - size.w / (2 * view.s);
  const y0 = view.cy - size.h / (2 * view.s);
  const tiles: { x: number; y: number }[] = [];
  for (let x = Math.floor(x0 / tw) - 1; x <= Math.floor((x0 + size.w / view.s) / tw) + 1; x++) {
    for (let y = Math.floor(y0 / tw) - 1; y <= Math.floor((y0 + size.h / view.s) / tw) + 1; y++) tiles.push({ x, y });
  }
  return (
    <>
      {tiles.map(({ x, y }) => (
        <img
          key={`${service}-${z}-${x}-${y}`}
          src={`https://server.arcgisonline.com/ArcGIS/rest/services/${SERVICE[service]}/MapServer/tile/${z}/${y}/${x}`}
          alt=""
          draggable={false}
          className="pointer-events-none absolute max-w-none select-none"
          style={{
            left: (x * tw - x0) * view.s,
            top: (y * tw - y0) * view.s,
            width: tw * view.s + 0.6,
            height: tw * view.s + 0.6,
          }}
        />
      ))}
    </>
  );
}
