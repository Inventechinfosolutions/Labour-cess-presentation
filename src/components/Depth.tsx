import type { CSSProperties } from "react";
import type { CessIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function orbStyle(c: string): CSSProperties {
  return {
    background: `radial-gradient(circle at 34% 28%, color-mix(in srgb, ${c} 40%, #fff) 0%, ${c} 48%, color-mix(in srgb, ${c} 62%, #000) 100%)`,
    boxShadow: `inset 0 -3px 5px rgba(0,0,0,0.28), inset 0 2px 3px rgba(255,255,255,0.5), 0 7px 12px -3px color-mix(in srgb, ${c} 65%, transparent), 0 2px 3px rgba(15,35,70,0.18)`,
  };
}

export function tileStyle(c: string): CSSProperties {
  return {
    background: `linear-gradient(160deg, color-mix(in srgb, ${c} 45%, #fff) 0%, ${c} 55%, color-mix(in srgb, ${c} 70%, #000) 100%)`,
    boxShadow: `inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -2px 3px rgba(0,0,0,0.22), 0 2px 0 color-mix(in srgb, ${c} 55%, #000), 0 6px 10px -3px color-mix(in srgb, ${c} 55%, transparent)`,
  };
}

export function slab3D(c: string) {
  return `inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -2px 0 color-mix(in srgb, ${c} 18%, transparent), 0 3px 0 0 color-mix(in srgb, ${c} 32%, #fff), 0 12px 18px -8px color-mix(in srgb, ${c} 50%, transparent), 0 2px 4px rgba(22,60,120,0.08)`;
}

export function Gloss() {
  return (
    <span className="pointer-events-none absolute top-[7%] left-[20%] h-[38%] w-[56%] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,255,255,0))]" />
  );
}

export function Orb3D({ c, Icon, className, iconClassName }: { c: string; Icon: CessIcon; className?: string; iconClassName?: string }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center rounded-full text-white", className)} style={orbStyle(c)}>
      <Gloss />
      <Icon weight="fill" className={cn("relative drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.35)]", iconClassName)} />
    </span>
  );
}
