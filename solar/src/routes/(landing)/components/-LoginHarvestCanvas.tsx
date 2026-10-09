import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export type LoginHarvestVariant = "blue" | "green";

type Palette = {
  gradient: string;
  windmill: string;
  hueMin: number;
  hueMax: number;
  /** Natural grass: muted sat/light so blades look like sunlit turf, not plastic. */
  strokeSat?: readonly [number, number];
  strokeLight?: readonly [number, number];
};

const PALETTES: Record<LoginHarvestVariant, Palette> = {
  blue: {
    gradient: "linear-gradient(to bottom, #ffffff, #e0f2fe)",
    windmill: "rgb(224, 242, 254)",
    hueMin: 200,
    hueMax: 225,
  },
  green: {
    // Use srgb for mixes: oklch mixing white↔primary can cut through pink hues; srgb keeps the CTA blue‑violet tint.
    gradient:
      "linear-gradient(to bottom, color-mix(in srgb, var(--background) 82%, var(--primary) 18%) 0%, var(--background) 20%, var(--background) 52%, color-mix(in srgb, var(--background) 88%, var(--primary) 12%) 72%, color-mix(in srgb, var(--background) 72%, var(--primary) 18%) 86%, color-mix(in srgb, var(--primary) 12%, #cddfcb) 100%)",
    /** Fallback before CSS resolves (green variant uses primary mix at runtime). */
    windmill: "rgb(250, 248, 232)",
    // Blades: yellow-green → spring grass (outdoor daylight)
    hueMin: 88,
    hueMax: 108,
    strokeSat: [16, 30],
    strokeLight: [34, 46],
  },
};

export type LoginHarvestFit = "viewport" | "container";

/**
 * Full-viewport canvas inspired by harvest.js (windmills + field curves).
 * `green`: primary wash at the top (CTA color), plain middle, turf + primary at the bottom.
 * `fit="container"`: size to the canvas parent (e.g. footer band) instead of the window.
 */
export function LoginHarvestCanvas({
  className,
  variant = "green",
  fit = "viewport",
}: {
  className?: string;
  variant?: LoginHarvestVariant;
  fit?: LoginHarvestFit;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const raw = el.getContext("2d");
    if (!raw) return;
    const ctx: CanvasRenderingContext2D = raw;

    const palette = PALETTES[variant];

    /** Windmills only: tint with primary (resolved RGB for canvas `fillStyle`). */
    function windmillFillColor(): string {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:absolute;visibility:hidden;pointer-events:none;color:color-mix(in srgb, var(--primary) 18%, var(--background))";
      document.documentElement.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return resolved || palette.windmill;
    }
    const windmillFill = variant === "green" ? windmillFillColor() : palette.windmill;

    function readSize(): { w: number; h: number } {
      if (fit === "container") {
        const parent = el?.parentElement;
        if (parent) {
          const w = Math.max(1, parent.clientWidth);
          const h = Math.max(1, parent.clientHeight);
          return { w, h };
        }
      }
      return { w: Math.max(1, window.innerWidth), h: Math.max(1, window.innerHeight) };
    }

    const initial = readSize();
    let X = (el.width = initial.w);
    let Y = (el.height = initial.h);
    let shapeNum = 1500;
    let windmillNum = 5;
    let xSplit = X / 4;

    function syncLayoutParams() {
      if (X < 768) {
        shapeNum = 700;
        windmillNum = 3;
        xSplit = X / 2;
      } else {
        shapeNum = 1500;
        windmillNum = 5;
        xSplit = X / 4;
      }
      if (fit === "container") {
        const cap = Math.max(160, Math.floor((X * Y) / 2000));
        shapeNum = Math.min(shapeNum, cap);
        if (Y < 380) windmillNum = Math.min(windmillNum, 2);
        else if (Y < 520) windmillNum = Math.min(windmillNum, 3);
      }
    }
    syncLayoutParams();

    class Shape {
      ctx: CanvasRenderingContext2D;
      x: number;
      y: number;
      i: number;
      r: number;
      c: number;
      sat: number;
      light: number;
      a: number;
      rad: number;

      constructor(c: CanvasRenderingContext2D, x: number, y: number, i: number) {
        this.ctx = c;
        this.x = x;
        this.y = y;
        this.i = i;
        this.r = rand(50, 150);
        this.c = rand(palette.hueMin, palette.hueMax);
        this.sat = palette.strokeSat
          ? rand(palette.strokeSat[0], palette.strokeSat[1])
          : 70;
        this.light = palette.strokeLight
          ? rand(palette.strokeLight[0], palette.strokeLight[1])
          : 68;
        this.a = i;
        this.rad = (this.a * Math.PI) / 180;
      }

      draw() {
        const c = this.ctx;
        c.save();
        c.lineWidth = palette.strokeSat != null ? 0.95 : 1;
        c.strokeStyle = `hsl(${this.c}, ${this.sat}%, ${this.light}%)`;
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.quadraticCurveTo(
          Math.cos(this.rad) * 10 + this.x,
          this.y - this.r / 2,
          Math.sin(this.rad) * 10 + this.x,
          this.y - this.r,
        );
        c.stroke();
        c.restore();
      }

      updateParams() {
        this.a += 1;
        this.rad = (this.a * Math.PI) / 180;
      }

      render() {
        this.updateParams();
        this.draw();
      }
    }

    class Windmill {
      ctx: CanvasRenderingContext2D;
      x: number;
      y: number;
      r: number;
      a: number;
      rad: number;
      inA: number;

      constructor(c: CanvasRenderingContext2D, x: number, y: number) {
        this.ctx = c;
        this.x = x;
        this.y = y;
        this.r = Y / 5;
        this.a = 0;
        this.rad = (this.a * Math.PI) / 180;
        this.inA = 1;
      }

      draw() {
        const c = this.ctx;
        const fill = windmillFill;
        c.save();
        c.fillStyle = fill;
        c.translate(this.x, this.y);
        c.rotate(this.rad);
        c.translate(-this.x, -this.y);
        for (let i = 0; i < 3; i++) {
          c.translate(this.x, this.y);
          c.rotate((120 * Math.PI) / 180);
          c.translate(-this.x, -this.y);
          c.fillRect(this.x, this.y - this.r / 10 / 2, this.r, this.r / 10);
        }
        c.restore();
        c.save();
        c.fillStyle = fill;
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(this.x + this.r / 10, Y - Y / 3);
        c.lineTo(this.x - this.r / 10, Y - Y / 3);
        c.closePath();
        c.fill();
        c.restore();
      }

      updateParams() {
        this.a += this.inA;
        this.rad = (this.a * Math.PI) / 180;
      }

      render() {
        this.updateParams();
        this.draw();
      }
    }

    let shapes: Shape[] = [];
    let windmills: Windmill[] = [];

    function buildScene() {
      shapes = [];
      windmills = [];
      syncLayoutParams();
      for (let i = 0; i < windmillNum; i++) {
        windmills.push(new Windmill(ctx, xSplit * i, rand(Y / 10, Y / 2)));
      }
      for (let i = 0; i < shapeNum; i++) {
        shapes.push(new Shape(ctx, rand(0, X), rand(Y - Y / 5, Y), i));
      }
    }

    buildScene();

    let raf = 0;

    function drawScene() {
      ctx.clearRect(0, 0, X, Y);
      for (let i = 0; i < shapes.length; i++) {
        shapes[i].render();
      }
      for (let i = 0; i < windmills.length; i++) {
        windmills[i].render();
      }
    }

    function loop() {
      drawScene();
      raf = requestAnimationFrame(loop);
    }

    function onResize() {
      const node = canvasRef.current;
      if (!node) return;
      cancelAnimationFrame(raf);
      const { w, h } = readSize();
      X = node.width = w;
      Y = node.height = h;
      buildScene();
      drawScene();
      raf = requestAnimationFrame(loop);
    }

    let resizeObserver: ResizeObserver | null = null;
    if (fit === "container") {
      const parent = el.parentElement;
      if (parent) {
        resizeObserver = new ResizeObserver(() => onResize());
        resizeObserver.observe(parent);
      }
    } else {
      window.addEventListener("resize", onResize);
    }

    drawScene();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      if (fit !== "container") window.removeEventListener("resize", onResize);
    };
  }, [variant, fit]);

  const palette = PALETTES[variant];

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 block min-h-full w-full",
        "opacity-100 dark:opacity-[0.28]",
        className,
      )}
      style={{ background: palette.gradient }}
    />
  );
}
