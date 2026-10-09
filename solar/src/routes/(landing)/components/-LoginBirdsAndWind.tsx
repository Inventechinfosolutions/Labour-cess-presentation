import { useLayoutEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Bird = {
  id: string;
  top: string;
  size: string;
  duration: string;
  delay: string;
  /** slight vertical bob period */
  bob: string;
  /** wing beat period — faster reads more “alive” */
  flap: string;
  /** staggers flap phase between birds */
  flapDelay: string;
  reverse?: boolean;
  opacity: string;
};

const BIRDS: Bird[] = [
  { id: "a", top: "9%", size: "w-8 h-4", duration: "32s", delay: "0s", bob: "2.4s", flap: "0.38s", flapDelay: "0s", opacity: "0.72" },
  { id: "b", top: "14%", size: "w-6 h-3", duration: "44s", delay: "-12s", bob: "1.9s", flap: "0.44s", flapDelay: "-0.11s", opacity: "0.58" },
  { id: "c", top: "11%", size: "w-7 h-3.5", duration: "38s", delay: "-5s", bob: "2.1s", flap: "0.41s", flapDelay: "-0.22s", opacity: "0.65" },
  { id: "d", top: "18%", size: "w-5 h-2.5", duration: "52s", delay: "-20s", bob: "2.6s", flap: "0.48s", flapDelay: "-0.07s", opacity: "0.48" },
  { id: "e", top: "7%", size: "w-6 h-3", duration: "40s", delay: "-28s", bob: "1.7s", flap: "0.36s", flapDelay: "-0.18s", reverse: true, opacity: "0.55" },
  { id: "f", top: "16%", size: "w-5 h-2.5", duration: "48s", delay: "-8s", bob: "2.2s", flap: "0.46s", flapDelay: "-0.29s", opacity: "0.44" },
];

const WIND_ROWS = 14;

function BirdGlyph({
  className,
  flapPeriod,
  flapDelay,
  reduced,
}: {
  className?: string;
  flapPeriod: string;
  flapDelay: string;
  reduced: boolean;
}) {
  const stroke = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2.15,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  /* Pivot at shoulder (0,0) in the translated group — same CS as the path */
  const wingBase: CSSProperties = { transformOrigin: "0px 0px" };

  const wingL = reduced
    ? wingBase
    : {
        ...wingBase,
        animation: `login-bw-wing-flap-l ${flapPeriod} ease-in-out infinite`,
        animationDelay: flapDelay,
      };

  const wingR = reduced
    ? wingBase
    : {
        ...wingBase,
        animation: `login-bw-wing-flap-r ${flapPeriod} ease-in-out infinite`,
        animationDelay: flapDelay,
      };

  return (
    <svg viewBox="0 0 36 12" className={cn("shrink-0 overflow-visible", className)} aria-hidden>
      {/*
        Body joint at (18, 6.2). Wings in local coords so each rotates around the shoulder for a flap.
      */}
      <g transform="translate(18 6.2)">
        <g className="login-bw-wing-l" style={wingL}>
          <path d="M-16 0 Q-8.5 -5 0 0" {...stroke} />
        </g>
        <g className="login-bw-wing-r" style={wingR}>
          <path d="M16 0 Q8.5 -5 0 0" {...stroke} />
        </g>
      </g>
    </svg>
  );
}

/**
 * Login hero sky: subtle birds + horizontal wind streaks (CSS-only; respects reduced motion).
 */
export function LoginBirdsAndWind({ className }: { className?: string }) {
  const [reduced, setReduced] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <div
      data-login-birds-wind
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        // Upper ~55% only — keep field / form area calmer
        "[mask-image:linear-gradient(to_bottom,black_0%,black_52%,transparent_72%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_52%,transparent_72%)]",
        className,
      )}
    >
      <style>
        {`
        @keyframes login-bw-wind {
          0% { transform: translate3d(-18vw, 0, 0); opacity: 0; }
          8% { opacity: 0.75; }
          92% { opacity: 0.5; }
          100% { transform: translate3d(18vw, 0, 0); opacity: 0; }
        }
        @keyframes login-bw-bird-x {
          0% { transform: translate3d(-12vw, 0, 0); }
          100% { transform: translate3d(105vw, 0, 0); }
        }
        @keyframes login-bw-bird-y {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -5px, 0); }
        }
        /* Wing flaps — mirrored; quicker downstroke, slower upstroke */
        @keyframes login-bw-wing-flap-l {
          0%, 100% { transform: rotate(-14deg); }
          32% { transform: rotate(34deg); }
          100% { transform: rotate(-14deg); }
        }
        @keyframes login-bw-wing-flap-r {
          0%, 100% { transform: rotate(14deg); }
          32% { transform: rotate(-34deg); }
          100% { transform: rotate(14deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .login-bw-wind-streak { animation: none !important; opacity: 0.08 !important; }
          .login-bw-bird-line { animation: none !important; }
          .login-bw-wing-l, .login-bw-wing-r { animation: none !important; }
        }
      `}
      </style>

      {/* Wind: diagonal translucid streaks drifting with the breeze */}
      <div
        className="absolute inset-0 opacity-90 dark:opacity-70"
        style={{
          transform: "rotate(-6deg) scale(1.08)",
          transformOrigin: "50% 20%",
        }}
      >
        {Array.from({ length: WIND_ROWS }, (_, i) => {
          const top = 4 + (i * 6.6) + (i % 3) * 2.1;
          const duration = 7.5 + (i % 5) * 0.65;
          const delay = (i * 0.45) % 4;
          return (
            <div
              key={`wind-${i}`}
              className="login-bw-wind-streak absolute h-px w-[min(38%,180px)] rounded-full"
              style={{
                top: `${top}%`,
                left: `${-5 + (i % 4) * 3}%`,
                background:
                  "linear-gradient(90deg, transparent, color-mix(in srgb, var(--foreground) 16%, transparent), transparent)",
                animation: reduced
                  ? "none"
                  : `login-bw-wind ${duration}s ease-in-out infinite`,
                animationDelay: reduced ? "0s" : `${delay}s`,
                opacity: 0.35,
              }}
            />
          );
        })}
      </div>

      {/* Softer second wind layer (slower, wider) */}
      <div
        className="absolute inset-0 opacity-50 dark:opacity-40"
        style={{
          transform: "rotate(-3deg) scale(1.05)",
          transformOrigin: "30% 15%",
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={`gust-${i}`}
            className="login-bw-wind-streak absolute h-[2px] w-[min(55%,320px)] rounded-full blur-[0.5px]"
            style={{
              top: `${10 + i * 11}%`,
              left: `${-8 + i * 5}%`,
              background:
                "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--primary) 12%, transparent) 45%, transparent 100%)",
              animation: reduced ? "none" : `login-bw-wind ${11 + i * 0.8}s ease-in-out infinite`,
              animationDelay: reduced ? "0s" : `${2 + i * 1.1}s`,
              opacity: 0.25,
            }}
          />
        ))}
      </div>

      {/* Birds — single warm tint; per-bird opacity only for depth */}
      <div className="absolute inset-0 text-amber-900 drop-shadow-[0_1px_1px_color-mix(in_srgb,var(--background)_40%,transparent)] dark:text-amber-100 dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
        {BIRDS.map((b) => (
          <div
            key={b.id}
            className="login-bw-bird-line absolute"
            style={{
              top: b.top,
              left: 0,
              opacity: b.opacity,
              animation: reduced
                ? "none"
                : `login-bw-bird-x ${b.duration} linear infinite`,
              animationDelay: b.delay,
            }}
          >
            <div className={cn(b.reverse && "scale-x-[-1]")}>
              <div
                className="flex items-center"
                style={{
                  animation: reduced ? "none" : `login-bw-bird-y ${b.bob} ease-in-out infinite`,
                }}
              >
                <BirdGlyph
                  className={b.size}
                  flapPeriod={b.flap}
                  flapDelay={b.flapDelay}
                  reduced={reduced}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
