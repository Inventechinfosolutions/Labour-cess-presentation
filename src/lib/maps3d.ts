import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

let configured = false;
let maps3dPromise: Promise<google.maps.Maps3DLibrary> | null = null;

/** True when a Maps JavaScript API key is available for photorealistic 3D. */
export function hasMaps3dKey() {
  return Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim());
}

/**
 * Configure and load Photorealistic 3D Maps (`maps3d` / `gmp-map-3d`).
 * Requires Maps JavaScript API enabled + `VITE_GOOGLE_MAPS_API_KEY`.
 */
export async function loadMaps3d() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    throw new Error("Missing VITE_GOOGLE_MAPS_API_KEY for photorealistic 3D Maps.");
  }

  if (!configured) {
    setOptions({
      key,
      // Preview 3D Maps (`gmp-map-3d`) is available on the beta channel.
      v: "beta",
    });
    configured = true;
  }

  if (!maps3dPromise) {
    maps3dPromise = importLibrary("maps3d");
  }
  return maps3dPromise;
}
