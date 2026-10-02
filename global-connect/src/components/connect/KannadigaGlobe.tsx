import { useEffect, useRef } from "react";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import { useElementSize } from "@/hooks/useElementSize";
import { GLOBE_DOTS } from "@/lib/globeDots";
import { BENGALURU_POINT, KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import { cn } from "@/lib/utils";

type LonLat = [number, number];

const HUB: LonLat = [77.59, 12.97];
const SOURCES: { label: string; at: LonLat; dx?: number }[] = [
  { label: "USA", at: [-74.0, 40.71] },
  { label: "UK", at: [-0.13, 51.5], dx: -22 },
  { label: "Europe", at: [13.4, 52.52], dx: 22 },
  { label: "Middle East", at: [55.3, 25.2] },
  { label: "Singapore", at: [103.8, 1.35] },
  { label: "Japan", at: [139.7, 35.68] },
  { label: "Australia", at: [151.2, -33.87] },
];

const TILT = -14;
const LON_MID = 45;
const LON_SWING = 48;
const SWING_PERIOD = 26;
const HORIZON = Math.PI / 2;
const KA_PATHS = KARNATAKA_DISTRICTS.map((d) => new Path2D(d.d));
const GRATICULE = geoGraticule10();
const ARC_STEPS = 64;

const interpolators = SOURCES.map((s) => geoInterpolate(s.at, HUB));
const arcLengths = SOURCES.map((s) => geoDistance(s.at, HUB));

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Point on a great-circle arc lifted off the surface; hidden only when the sphere itself is in front of it. */
function liftedPoint(projection: GeoProjection, center: LonLat, cx: number, cy: number, p: LonLat, lift: number) {
  const [x, y] = projection(p) ?? [cx, cy];
  const d = geoDistance(p, center);
  return {
    x: cx + (x - cx) * (1 + lift),
    y: cy + (y - cy) * (1 + lift),
    front: Math.cos(d) >= 0 || (1 + lift) * Math.sin(d) >= 1,
  };
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, reduce: boolean, compact: boolean) {
  const r = Math.min(w, h) * 0.4;
  const cx = w / 2;
  const cy = h / 2;
  const lon = reduce ? LON_MID : LON_MID + LON_SWING * Math.sin((t / SWING_PERIOD) * Math.PI * 2);
  const center: LonLat = [lon, -TILT];
  const projection = geoOrthographic().scale(r).translate([cx, cy]).rotate([-lon, TILT]).clipAngle(90);
  const unclipped = geoOrthographic().scale(r).translate([cx, cy]).rotate([-lon, TILT]);
  const path = geoPath(projection, ctx);
  const labels: (() => void)[] = [];

  ctx.clearRect(0, 0, w, h);

  const halo = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.35);
  halo.addColorStop(0, "rgba(255, 207, 107, 0.22)");
  halo.addColorStop(0.35, "rgba(46, 196, 182, 0.12)");
  halo.addColorStop(1, "rgba(46, 196, 182, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);

  const sphere = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
  sphere.addColorStop(0, "#0d5a5e");
  sphere.addColorStop(0.55, "#063238");
  sphere.addColorStop(1, "#021a1e");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = sphere;
  ctx.fill();

  ctx.beginPath();
  path(GRATICULE);
  ctx.strokeStyle = "rgba(255, 215, 122, 0.07)";
  ctx.lineWidth = 0.7;
  ctx.stroke();

  const dotR = compact ? 0.9 : 1.25;
  for (let i = 0; i < GLOBE_DOTS.length; i += 2) {
    const p: LonLat = [GLOBE_DOTS[i], GLOBE_DOTS[i + 1]];
    const d = geoDistance(p, center);
    if (d >= HORIZON) continue;
    const xy = projection(p);
    if (!xy) continue;
    const facing = Math.cos(d);
    ctx.globalAlpha = 0.25 + facing * 0.75;
    ctx.fillStyle = facing > 0.55 ? "#ffd77a" : "#e8b95a";
    ctx.fillRect(xy[0] - dotR, xy[1] - dotR, dotR * 2, dotR * 2);
  }
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 215, 122, 0.35)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  const hubXY = projection(HUB);
  const hubFront = geoDistance(HUB, center) < HORIZON;

  SOURCES.forEach((s, i) => {
    const grow = reduce ? 1 : Math.min(1, Math.max(0, (t - 0.6 - i * 0.18) / 1.2));
    if (grow <= 0) return;
    const interp = interpolators[i];
    const liftMax = Math.min(0.22, 0.06 + arcLengths[i] * 0.09);
    const last = Math.round(ARC_STEPS * grow);

    ctx.save();
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(255, 210, 110, 0.9)";
    ctx.shadowBlur = 8;
    ctx.strokeStyle = "rgba(255, 225, 150, 0.9)";
    ctx.lineWidth = compact ? 1.3 : 1.8;
    ctx.beginPath();
    let pen = false;
    for (let k = 0; k <= last; k++) {
      const f = k / ARC_STEPS;
      const pt = liftedPoint(unclipped, center, cx, cy, interp(f), liftMax * Math.sin(Math.PI * f));
      if (!pt.front) {
        pen = false;
        continue;
      }
      if (pen) ctx.lineTo(pt.x, pt.y);
      else ctx.moveTo(pt.x, pt.y);
      pen = true;
    }
    ctx.stroke();

    if (!reduce && grow >= 1) {
      const cycle = 2.6 + (i % 3) * 0.5;
      const f = ((t + i * 0.45) % cycle) / cycle;
      const pt = liftedPoint(unclipped, center, cx, cy, interp(f), liftMax * Math.sin(Math.PI * f));
      if (pt.front) {
        ctx.fillStyle = "#fff4d1";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, compact ? 2 : 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    const src = projection(s.at);
    if (src && geoDistance(s.at, center) < HORIZON) {
      const fade = Math.min(1, (HORIZON - geoDistance(s.at, center)) * 4);
      ctx.globalAlpha = fade;
      ctx.fillStyle = "rgba(255, 201, 77, 0.25)";
      ctx.beginPath();
      ctx.arc(src[0], src[1], compact ? 5 : 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff1c4";
      ctx.beginPath();
      ctx.arc(src[0], src[1], compact ? 2 : 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      if (!compact) {
        labels.push(() => {
          ctx.globalAlpha = fade;
          ctx.font = "600 12px Manrope, sans-serif";
          const bw = ctx.measureText(s.label).width + 18;
          const lx = src[0] + (s.dx ?? 0);
          const bx = lx - bw / 2;
          const by = src[1] - 32;
          roundRect(ctx, bx, by, bw, 22, 6);
          ctx.fillStyle = "rgba(3, 38, 43, 0.9)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 215, 122, 0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(s.label, lx, by + 11.5);
          ctx.globalAlpha = 1;
        });
      }
    }
  });

  if (hubXY && hubFront) {
    const [hx, hy] = hubXY;
    const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.32);
    glow.addColorStop(0, "rgba(255, 213, 106, 0.55)");
    glow.addColorStop(1, "rgba(255, 185, 56, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(hx, hy, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    if (!reduce) {
      for (let n = 0; n < 2; n++) {
        const ph = ((t + n * 1.4) % 2.8) / 2.8;
        ctx.strokeStyle = `rgba(255, 213, 106, ${0.7 * (1 - ph)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(hx, hy, 6 + ph * r * 0.22, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const pop = reduce ? 1 : Math.min(1, Math.max(0, (t - 0.3) / 0.8));
    const k = (r / 300) * 0.21 * (0.6 + 0.4 * pop) * (0.55 + 0.45 * Math.cos(geoDistance(HUB, center)));
    ctx.save();
    ctx.globalAlpha = pop;
    ctx.translate(hx - BENGALURU_POINT.x * k, hy - BENGALURU_POINT.y * k);
    ctx.scale(k, k);
    ctx.shadowColor = "rgba(255, 200, 90, 0.9)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#f7b733";
    ctx.strokeStyle = "rgba(255, 243, 200, 0.7)";
    ctx.lineWidth = 0.8 / k;
    for (const p of KA_PATHS) {
      ctx.fill(p);
      ctx.stroke(p);
    }
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(hx, hy, compact ? 2.5 : 3.5, 0, Math.PI * 2);
    ctx.fill();

    const capAlpha = reduce ? 1 : Math.min(1, Math.max(0, (t - 1.6) / 0.6));
    if (capAlpha > 0) {
      const ty = hy + 4 + 95 * k;
      const tx = compact ? hx : hx + 24;
      ctx.globalAlpha = capAlpha;
      ctx.textAlign = compact ? "center" : "right";
      ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(255, 200, 90, 0.7)";
      ctx.shadowBlur = 12;
      ctx.letterSpacing = compact ? "2px" : "3.5px";
      ctx.font = `700 ${compact ? 11 : 15}px Sora, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText("KARNATAKA", tx, ty);
      ctx.shadowBlur = 0;
      ctx.letterSpacing = "1px";
      ctx.font = `600 ${compact ? 9 : 11.5}px Manrope, sans-serif`;
      ctx.fillStyle = "#ffd77a";
      ctx.fillText("WHEREVER YOU ARE, YOU BELONG HERE", tx, ty + (compact ? 15 : 21));
      ctx.letterSpacing = "0px";
      ctx.globalAlpha = 1;
    }
  }

  for (const drawLabel of labels) drawLabel();
}

export function KannadigaGlobe({ reduce, className }: { reduce: boolean; className?: string }) {
  const [wrapRef, size] = useElementSize<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const compact = size.w < 480;

    if (reduce) {
      draw(ctx, size.w, size.h, 0, true, compact);
      return;
    }

    let raf = 0;
    let visible = true;
    const start = performance.now();
    const tick = (now: number) => {
      if (visible) draw(ctx, size.w, size.h, (now - start) / 1000, false, compact);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [size, reduce]);

  return (
    <div ref={wrapRef} className={cn("pointer-events-none aspect-square", className)}>
      <canvas ref={canvasRef} className="h-full w-full" aria-label="A globe linking Kannadiga communities around the world to Karnataka" role="img" />
    </div>
  );
}
