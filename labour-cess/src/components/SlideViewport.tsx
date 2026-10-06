import type { CSSProperties, ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { DeviceMobile } from "@/lib/icons";
import { useFitScale } from "@/hooks/useFitScale";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

function subscribeOrientation(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  window.addEventListener("orientationchange", onStoreChange);
  return () => {
    window.removeEventListener("resize", onStoreChange);
    window.removeEventListener("orientationchange", onStoreChange);
  };
}

function getPortrait() {
  return window.innerHeight > window.innerWidth;
}

/**
 * Desktop / laptop: full-bleed fluid stage (no side gaps).
 * Tablet / phone: fixed design canvas scaled to fit.
 */
export function SlideViewport({ children, className, style }: Props) {
  const { frameRef, scale, mode, designW, designH } = useFitScale();
  const isPortrait = useSyncExternalStore(subscribeOrientation, getPortrait, () => false);
  const portraitHint = mode === "scaled" && scale < 0.55 && isPortrait;

  return (
    <div
      ref={frameRef}
      style={style}
      className={cn(
        "relative h-full w-full overflow-hidden",
        "bg-[radial-gradient(900px_420px_at_100%_0%,rgba(20,196,212,0.09),transparent_55%),radial-gradient(700px_380px_at_0%_100%,rgba(11,31,74,0.06),transparent_50%)]",
        className,
      )}
    >
      {mode === "fluid" ? (
        <div className="absolute inset-0 p-2 sm:p-3 md:px-3 md:pt-2.5 md:pb-2">{children}</div>
      ) : (
        <div
          className="absolute top-1/2 left-1/2 will-change-transform"
          style={{
            width: designW,
            height: designH,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <div className="h-full w-full px-3 pt-2.5 pb-1.5">{children}</div>
        </div>
      )}

      {portraitHint ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30 flex justify-center sm:hidden">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-deep/90 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg ring-1 ring-white/15">
            <DeviceMobile weight="bold" className="size-3.5 text-teal-bright" />
            Rotate for the full slide
          </span>
        </div>
      ) : null}
    </div>
  );
}
