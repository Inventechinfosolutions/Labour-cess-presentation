import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db, relativeTime } from "@/lib/hooks";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";

function tileGlassClass(extra?: string) {
  return cn(
    "rounded-3xl border border-border/50 bg-card/80 shadow-lg shadow-black/5 ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20",
    extra,
  );
}

function notificationMarqueeIcon(n: Notification): { Icon: LucideIcon; tone: string } {
  const Icon: LucideIcon =
    n.type === "error"
      ? XCircle
      : n.type === "warning"
        ? AlertCircle
        : n.type === "success"
          ? CheckCircle2
          : Info;
  const tone =
    n.type === "error"
      ? "border-destructive/30 bg-destructive/12 text-destructive"
      : n.type === "warning"
        ? "border-amber-500/25 bg-amber-500/15 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300"
        : n.type === "success"
          ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300"
          : "border-primary/25 bg-primary/10 text-primary";
  return { Icon, tone };
}

export function NotificationMarqueeTile({ n }: { n: Notification }) {
  const { Icon, tone } = notificationMarqueeIcon(n);
  const inner = (
    <Card
      className={cn(
        tileGlassClass("transition-[border-color,box-shadow] duration-300"),
        "py-0 hover:border-primary/25 hover:shadow-lg",
        n.read ? "opacity-[0.97]" : "border-primary/20 bg-primary/[0.04]",
      )}
    >
      <CardHeader className="flex flex-row items-start gap-2.5 space-y-0 px-3 py-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border", tone)}>
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <CardTitle className="text-xs font-semibold leading-snug line-clamp-2">{n.title}</CardTitle>
          <CardDescription className="line-clamp-2 text-[0.65rem] leading-relaxed">{n.message}</CardDescription>
          <p className="text-[0.6rem] tabular-nums text-muted-foreground">{relativeTime(n.createdAt)}</p>
        </div>
        <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
      </CardHeader>
    </Card>
  );

  const wrap =
    "group block w-[min(88vw,15.5rem)] shrink-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-[16.75rem] md:w-[17.5rem] lg:w-[clamp(17.75rem,19vw,20.5rem)]";

  if (n.link) {
    return (
      <Link to={n.link} className={wrap} onClick={() => db.markNotificationRead(n.id)}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={cn(wrap, "cursor-pointer text-left")}
      onClick={() => db.markNotificationRead(n.id)}
      aria-label={`Dismiss notification: ${n.title}`}
    >
      {inner}
    </button>
  );
}

function notificationTileKeys(blockId: "a" | "b", cycleIdx: number, n: Notification) {
  return `${n.id}-${blockId}-c${cycleIdx}`;
}

/** Horizontal GSAP marquee; repeats the feed until it spans the viewport so wide layouts stay filled. Uses a static grid when motion is reduced. */
export function NotificationMarqueeStrip({
  notifications,
  reduced,
}: {
  notifications: Notification[];
  reduced: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const animKey = useMemo(() => notifications.map((x) => x.id).join("\0"), [notifications]);
  /** Tile cycles concatenated inside one marquee block until width ≥ viewport (avoids empty gutter on wide desktop). */
  const [repeatCycles, setRepeatCycles] = useState(2);

  useEffect(() => {
    setRepeatCycles(2);
  }, [animKey]);

  useLayoutEffect(() => {
    if (reduced || notifications.length === 0) return;
    const viewport = viewportRef.current;
    const block = blockRef.current;
    if (!viewport || !block) return;

    const adjustWidth = () => {
      const cw = viewport.clientWidth;
      const bw = block.offsetWidth;
      if (cw < 1 || bw < 1) return;
      setRepeatCycles((prev) => {
        if (prev >= 28) return prev;
        if (bw >= cw * 1.02) return prev;
        return prev + 1;
      });
    };

    adjustWidth();
    const ro = new ResizeObserver(() => adjustWidth());
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [reduced, animKey, notifications.length, repeatCycles]);

  useLayoutEffect(() => {
    if (reduced || notifications.length === 0) return;
    const track = trackRef.current;
    const block = blockRef.current;
    if (!track || !block) return;

    const run = () => {
      tweenRef.current?.kill();
      const w = block.offsetWidth;
      if (w < 1) return;
      gsap.set(track, { x: 0, y: 0 });
      tweenRef.current = gsap.to(track, {
        x: -w,
        y: 0,
        duration: Math.max(18, w / 55),
        ease: "none",
        repeat: -1,
      });
    };

    run();
    const ro = new ResizeObserver(run);
    ro.observe(block);
    return () => {
      ro.disconnect();
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
  }, [reduced, animKey, notifications.length, repeatCycles]);

  const pauseMarquee = () => tweenRef.current?.pause();
  const resumeMarquee = () => tweenRef.current?.resume();

  if (notifications.length === 0) return null;

  if (reduced) {
    return (
      <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {notifications.map((n) => (
          <NotificationMarqueeTile key={n.id} n={n} />
        ))}
      </div>
    );
  }

  const blockRows = (blockId: "a" | "b") =>
    Array.from({ length: repeatCycles }, (_, cycleIdx) =>
      notifications.map((n) => (
        <NotificationMarqueeTile key={notificationTileKeys(blockId, cycleIdx, n)} n={n} />
      )),
    ).flat();

  return (
    <div
      className="relative overflow-hidden py-1"
      onPointerEnter={pauseMarquee}
      onPointerLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resumeMarquee();
      }}
      onFocusCapture={pauseMarquee}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resumeMarquee();
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-muted/50 to-transparent sm:w-12 dark:from-background/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-muted/50 to-transparent sm:w-12 dark:from-background/80"
        aria-hidden
      />
      <div ref={viewportRef} className="relative w-full min-w-0 overflow-x-hidden overflow-y-visible py-1">
        <div ref={trackRef} className="flex w-max flex-row flex-nowrap gap-3 will-change-transform">
          <div ref={blockRef} className="flex flex-row flex-nowrap gap-3">
            {blockRows("a")}
          </div>
          <div className="flex flex-row flex-nowrap gap-3">{blockRows("b")}</div>
        </div>
      </div>
    </div>
  );
}
