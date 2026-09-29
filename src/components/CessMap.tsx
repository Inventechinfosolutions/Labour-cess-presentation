import { Map3DView } from "@/components/Map3DView";
import { googleEmbedSrc, mapLabel, type MapKind, type Pin } from "@/lib/maps";
import { hasMaps3dKey } from "@/lib/maps3d";
import { cn } from "@/lib/utils";

type Props = {
  kind: MapKind;
  className?: string;
  active?: boolean;
  pin?: Pin;
  /** Photorealistic / satellite site view. */
  satellite?: boolean;
  zoom?: number;
  /** Soft CSS pin pulse over the iframe centre (2D embed only). */
  showPulse?: boolean;
};

/** Animated pin overlay on Google embed maps — CSS, not the iframe marker. */
function EmbedPinPulse({ color = "#14c4d4" }: { color?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" aria-hidden>
      <div className="relative size-16">
        <span className="embed-pin-ring absolute top-1/2 left-1/2 size-12 rounded-full opacity-40" style={{ background: color }} />
        <span
          className="embed-pin-ring absolute top-1/2 left-1/2 size-12 rounded-full opacity-30"
          style={{ background: color, animationDelay: "0.65s" }}
        />
        <span className="embed-pin-bob absolute top-[42%] left-1/2">
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
            <path
              d="M14 1.5c-6.2 0-11.2 4.9-11.2 11.5 0 8.2 11.2 18.8 11.2 18.8s11.2-10.6 11.2-18.8C25.2 6.4 20.2 1.5 14 1.5z"
              fill={color}
              stroke="#fff"
              strokeWidth="1.6"
            />
            <circle cx="14" cy="11.5" r="3.8" fill="#fff" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export function CessMap({
  kind,
  className,
  active = true,
  pin,
  satellite = false,
  zoom,
  showPulse = true,
}: Props) {
  const use3d = Boolean(active && satellite && pin && hasMaps3dKey());
  const src = googleEmbedSrc(kind, pin, { satellite, zoom });

  return (
    <div
      className={cn("relative h-full min-h-0 w-full overflow-hidden rounded-xl bg-mist", className)}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {use3d && pin ? (
        <Map3DView
          lat={pin.latlng[0]}
          lng={pin.latlng[1]}
          label={pin.name}
          mode="HYBRID"
          range={850}
          tilt={58}
          heading={24}
          orbit
          className="rounded-none"
        />
      ) : active ? (
        <>
          <iframe
            key={src}
            title={`Google Map · ${pin?.name ?? mapLabel(kind)}${satellite ? " · Satellite" : ""}`}
            src={src}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {showPulse ? <EmbedPinPulse color={pin?.color ?? "#14c4d4"} /> : null}
          {satellite && !hasMaps3dKey() ? (
            <div className="pointer-events-none absolute top-3 left-3 z-20 rounded-full bg-navy/85 px-2.5 py-1 text-[8px] font-extrabold tracking-wide text-teal-bright uppercase shadow-sm">
              2D satellite · add API key for 3D
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
