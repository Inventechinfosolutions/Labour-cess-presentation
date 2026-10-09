import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";
import { forwardRef, type CSSProperties } from "react";
import heroWindmill from "@/assets/9789882-uhd_3840_2160_30fps.mp4";
import heroSolar from "@/assets/hero-solar.jpg";
import heroWind from "@/assets/hero-wind.jpg";
import { cn } from "@/lib/utils";

const ambientBg: Record<"wind" | "solar", CSSProperties> = {
  wind: { backgroundImage: `url(${heroWind})` },
  solar: { backgroundImage: `url(${heroSolar})` },
};

const heroVideoClass =
  "absolute inset-0 h-full min-h-full w-full min-w-full object-cover object-center will-change-transform transform-gpu backface-hidden brightness-[1.05] contrast-[1.08] saturate-[1.12]";

const HeroBackdropVideo = forwardRef<HTMLVideoElement, { autoPlay: boolean; className?: string }>(
  function HeroBackdropVideo({ autoPlay, className }, ref) {
    return (
      <video
        ref={ref}
        aria-hidden
        className={cn(heroVideoClass, className)}
        src={heroWindmill}
        autoPlay={autoPlay}
        muted
        loop={autoPlay}
        playsInline
        preload={autoPlay ? "auto" : "metadata"}
      />
    );
  },
);

export const HeroParallaxVideo = forwardRef<
  HTMLVideoElement,
  {
    parallaxY: MotionValue<number>;
    parallaxScale?: MotionValue<number>;
    className?: string;
  }
>(function HeroParallaxVideo({ parallaxY, parallaxScale, className }, ref) {
  return (
    <motion.div
      aria-hidden
      className={cn(
        "absolute inset-[-18%] overflow-hidden will-change-transform transform-gpu backface-hidden",
        className,
      )}
      style={{
        y: parallaxY,
        ...(parallaxScale ? { scale: parallaxScale } : {}),
      }}
    >
      <HeroBackdropVideo
        ref={ref}
        autoPlay
        className="left-1/2 top-1/2 h-[118%] min-h-[118%] w-[118%] min-w-[118%] -translate-x-1/2 -translate-y-1/2"
      />
    </motion.div>
  );
});

export const HeroStaticVideo = forwardRef<HTMLVideoElement, { className?: string }>(function HeroStaticVideo(
  { className },
  ref,
) {
  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden", className)}>
      <HeroBackdropVideo
        ref={ref}
        autoPlay={false}
        className="left-1/2 top-1/2 h-[112%] min-h-[112%] w-[112%] min-w-[112%] -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
});

/** `marketing` = lighter wash so photography stays crisp; `auth` = stronger tint for login panel. */
export function HeroGradientOverlay({ variant = "auth" }: { variant?: "marketing" | "auth" }) {
  if (variant === "marketing") {
    return (
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* Let the photo read clearly; darken mostly where headline sits (bright sun corner). */}
        <div
          className={cn(
            "absolute inset-0",
            "bg-gradient-to-b from-foreground/45 via-foreground/30 to-primary/25",
            "md:bg-gradient-to-br md:from-foreground/40 md:via-primary/32 md:to-chart-3/22",
          )}
        />
        <div className="absolute inset-y-0 left-0 w-[min(100%,560px)] bg-gradient-to-r from-foreground/50 via-foreground/20 to-transparent md:from-foreground/45 md:via-foreground/15" />
      </div>
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        /* Top/edges darkened for legibility; bottom fades out so the video is not milky / white-washed. */
        "bg-gradient-to-b from-foreground/70 via-foreground/45 to-transparent",
        "md:bg-gradient-to-br md:from-foreground/65 md:via-primary/45 md:to-transparent",
      )}
    />
  );
}

export function HeroBottomScrim({ variant = "auth" }: { variant?: "marketing" | "auth" }) {
  const fade = variant === "marketing" ? "from-foreground/25" : "from-foreground/40";
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t to-transparent md:h-32", fade)}
    />
  );
}

/** Faint solar/wind photography for light content bands (sits under scrims). */
export function RenewableAmbientLayer({
  className,
  variant = "wind",
}: {
  className?: string;
  variant?: keyof typeof ambientBg;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-[-12%] bg-cover bg-[center_25%] bg-no-repeat opacity-[0.14] saturate-[0.9] max-md:opacity-[0.11] max-md:bg-[center_40%]",
        className,
      )}
      style={ambientBg[variant]}
    />
  );
}
