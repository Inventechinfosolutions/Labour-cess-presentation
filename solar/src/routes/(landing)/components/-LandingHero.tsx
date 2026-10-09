import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Pause, Play, Sun } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroBottomScrim, HeroGradientOverlay, HeroParallaxVideo, HeroStaticVideo } from "./-HeroBackdrop";
import { fadeUp, staggerParent } from "./-LandingMotion";

const springScroll = { stiffness: 40, damping: 30, mass: 0.5 } as const;

const HERO_LINES = [
  { text: "PMIS for solar & wind", className: "whitespace-normal sm:whitespace-nowrap" as const },
  { text: "approvals, end to end.", className: "" as const },
] as const;

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const off = reduceMotion === true;
  const [videoPaused, setVideoPaused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgYRaw = useTransform(scrollYProgress, [0, 1], [0, off ? 0 : 220]);
  const bgScaleRaw = useTransform(scrollYProgress, [0, 1], [1, off ? 1 : 1.08]);
  const bgY = useSpring(bgYRaw, springScroll);
  const bgScale = useSpring(bgScaleRaw, springScroll);
  const copyYRaw = useTransform(scrollYProgress, [0, 0.32], [0, off ? 0 : 56]);
  const copyY = useSpring(copyYRaw, springScroll);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const sync = () => setVideoPaused(el.paused);
    sync();
    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);
    return () => {
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", sync);
    };
  }, [off]);

  const toggleVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative left-1/2 min-h-[100svh] w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-foreground/35 text-primary-foreground shadow-inner"
      aria-label="Hero"
    >
      <div className="absolute inset-0 bg-foreground/35" aria-hidden />

      {off ? (
        <HeroStaticVideo ref={videoRef} className="absolute inset-[-12%] scale-[1.06]" />
      ) : (
        <HeroParallaxVideo ref={videoRef} parallaxY={bgY} parallaxScale={bgScale} />
      )}

      <HeroGradientOverlay variant="marketing" />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(58vh,520px)] bg-gradient-to-t from-[color-mix(in_oklch,var(--foreground)_55%,transparent)] via-[color-mix(in_oklch,var(--foreground)_35%,transparent)] to-transparent"
        aria-hidden
      />
      <HeroBottomScrim variant="marketing" />

      {!off ? (
        <div className="absolute right-5 top-[calc(4.5rem+env(safe-area-inset-top))] z-[3] md:right-10 md:top-[calc(5rem+env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={toggleVideo}
            className="flex size-10 items-center justify-center rounded-full border border-primary-foreground/20 bg-[color-mix(in_oklch,var(--foreground)_40%,transparent)] text-primary-foreground backdrop-blur-md transition-colors hover:bg-[color-mix(in_oklch,var(--foreground)_50%,transparent)] md:size-11"
            aria-pressed={!videoPaused}
            aria-label={videoPaused ? "Play background video" : "Pause background video"}
          >
            {videoPaused ? <Play className="size-4 pl-0.5" aria-hidden /> : <Pause className="size-4 fill-current" aria-hidden />}
          </button>
        </div>
      ) : null}

      <div className="relative z-[2] box-border flex min-h-[100svh] w-full max-w-[100vw] flex-col justify-end px-5 pb-[max(2.25rem,env(safe-area-inset-bottom))] pt-32 sm:px-6 md:px-12 md:pb-12 lg:px-16 lg:pb-14">
        <motion.div
          className="relative mx-auto flex w-full max-w-[1800px] flex-col gap-6 md:min-h-0 md:flex-row md:items-end md:justify-between md:gap-8 lg:gap-10"
          style={off ? undefined : { y: copyY }}
        >
          <motion.div
            className="w-full min-w-0 max-w-[20rem] pr-0 text-left md:max-w-[min(40rem,52vw)] md:pr-2 lg:max-w-[min(48rem,46%)]"
            variants={staggerParent(0.1, 0.04)}
            initial={off ? undefined : "hidden"}
            animate={off ? undefined : "show"}
          >
            <p className="mb-1 flex items-center gap-2 text-[0.7rem] font-normal uppercase leading-none tracking-[0.18em] text-primary-foreground/80 md:mb-2 md:text-xs md:tracking-[0.2em]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-primary-foreground/12 ring-1 ring-primary-foreground/20">
                <Sun className="h-3 w-3" aria-hidden />
              </span>
              PMIS · RENEWABLES
            </p>
            <h1 className="m-0 text-pretty text-[2.1rem] font-semibold leading-[1.04] tracking-[-0.038em] text-primary-foreground [text-shadow:0_2px_36px_color-mix(in_oklch,var(--foreground)_45%,transparent),0_1px_2px_color-mix(in_oklch,var(--foreground)_35%,transparent)] sm:text-5xl md:text-6xl md:leading-[1.02] lg:text-[3.5rem] xl:text-[3.75rem]">
              {HERO_LINES.map((line) => (
                <motion.span key={line.text} variants={fadeUp(0, 20)} className={["block", line.className].filter(Boolean).join(" ")}>
                  {line.text}
                </motion.span>
              ))}
            </h1>
          </motion.div>

          <div className="mt-auto flex w-full min-w-0 shrink-0 justify-end self-end md:mt-0 md:w-auto md:flex-none md:shrink-0 md:items-end md:pb-0.5">
            <Link
              to="/register"
              className="inline-flex h-10 min-h-10 w-auto min-w-[7.25rem] items-center justify-center rounded-full border border-primary-foreground/15 bg-primary px-8 text-[0.9rem] font-medium text-primary-foreground shadow-[0_12px_40px_color-mix(in_oklch,var(--foreground)_30%,transparent)] backdrop-blur-sm transition hover:brightness-110 active:brightness-90"
            >
              <motion.span whileHover={off ? undefined : { scale: 1.05 }} whileTap={off ? undefined : { scale: 0.95 }}>
                Register
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
