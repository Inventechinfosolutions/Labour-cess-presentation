import { useEffect, useRef, useState } from "react";
import { hasMaps3dKey, loadMaps3d } from "@/lib/maps3d";
import { cn } from "@/lib/utils";

type Props = {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
  /** Camera distance from the site (metres). */
  range?: number;
  tilt?: number;
  heading?: number;
  /** Prefer HYBRID for street names; SATELLITE for clean photorealism. */
  mode?: "HYBRID" | "SATELLITE";
  /** Soft orbit after the fly-in (presenter polish). */
  orbit?: boolean;
};

/**
 * Photorealistic 3D Maps via Maps JavaScript API `maps3d` (`gmp-map-3d`).
 * Falls back to a mist panel if the API key is missing or the library fails.
 */
export function Map3DView({
  lat,
  lng,
  label,
  className,
  range = 900,
  tilt = 58,
  heading = 28,
  mode = "HYBRID",
  orbit = true,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    hasMaps3dKey() ? "loading" : "error",
  );
  const [errorHint, setErrorHint] = useState(
    hasMaps3dKey() ? "" : "Add VITE_GOOGLE_MAPS_API_KEY to enable photorealistic 3D Maps.",
  );

  useEffect(() => {
    if (!hasMaps3dKey()) {
      setStatus("error");
      setErrorHint("Add VITE_GOOGLE_MAPS_API_KEY to enable photorealistic 3D Maps.");
      return;
    }

    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let map: google.maps.maps3d.Map3DElement | null = null;
    let onEnd: ((event: Event) => void) | null = null;

    setStatus("loading");

    (async () => {
      try {
        const { Map3DElement, MapMode, Marker3DElement, AltitudeMode } = await loadMaps3d();
        if (cancelled || !host) return;

        const mapMode = mode === "SATELLITE" ? MapMode.SATELLITE : MapMode.HYBRID;
        map = new Map3DElement({
          center: { lat, lng, altitude: 80 },
          range,
          tilt,
          heading,
          mode: mapMode,
          defaultUIHidden: true,
        });
        map.style.width = "100%";
        map.style.height = "100%";
        map.style.display = "block";
        host.replaceChildren(map);

        const marker = new Marker3DElement({
          position: { lat, lng, altitude: 40 },
          altitudeMode: AltitudeMode.RELATIVE_TO_GROUND,
          extruded: true,
          label: label ?? "Site",
        });
        map.append(marker);

        map.flyCameraTo({
          endCamera: {
            center: { lat, lng, altitude: 80 },
            range,
            tilt,
            heading,
          },
          durationMillis: 1600,
        });

        if (orbit) {
          onEnd = (event: Event) => {
            const detail = (event as CustomEvent<{ type?: string }>).detail;
            if (detail?.type !== "flyCameraTo" || !map || cancelled) return;
            if (onEnd) map.removeEventListener("gmp-animationend", onEnd);
            map.flyCameraAround({
              camera: {
                center: { lat, lng, altitude: 80 },
                range,
                tilt,
                heading,
              },
              durationMillis: 28000,
              rounds: 1,
            });
          };
          map.addEventListener("gmp-animationend", onEnd);
        }

        if (!cancelled) setStatus("ready");
      } catch (err) {
        console.error("[Map3DView]", err);
        if (!cancelled) {
          setStatus("error");
          setErrorHint("Photorealistic 3D Maps could not load. Check the Maps JavaScript API key.");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (map && onEnd) map.removeEventListener("gmp-animationend", onEnd);
      host.replaceChildren();
    };
  }, [lat, lng, label, range, tilt, heading, mode, orbit]);

  return (
    <div className={cn("relative h-full min-h-0 w-full overflow-hidden bg-[#0b1f4a]", className)}>
      <div ref={hostRef} className="absolute inset-0" />
      {status === "loading" ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-navy/40 backdrop-blur-[2px]">
          <div className="rounded-full bg-white/95 px-3.5 py-2 text-[11px] font-extrabold tracking-wide text-navy uppercase shadow-lg">
            Loading 3D site view…
          </div>
        </div>
      ) : null}
      {status === "error" ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-mist px-6 text-center">
          <div className="max-w-sm">
            <div className="text-[10px] font-extrabold tracking-[0.14em] text-teal uppercase">Photorealistic 3D Maps</div>
            <b className="mt-1 block text-[14px] text-navy">gmp-map-3d needs an API key</b>
            <p className="mt-1.5 text-[12px] font-semibold text-muted-foreground">{errorHint}</p>
            <p className="mt-2 font-mono text-[10px] text-navy/70">VITE_GOOGLE_MAPS_API_KEY=…</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
