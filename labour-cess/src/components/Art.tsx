import abcSite from "@/assets/abc-site.png";
import abcIntake from "@/assets/abc-intake.png";
import { HEX } from "@/lib/palette";
import { cn } from "@/lib/utils";

export function SiteArt({ className }: { className?: string }) {
  return (
    <img
      src={abcSite}
      alt=""
      aria-hidden
      className={cn("block h-full w-full object-cover object-[center_35%]", className)}
    />
  );
}

export function InspectorArt({ className }: { className?: string }) {
  return (
    <svg className={cn("h-full w-full", className)} viewBox="0 0 220 320" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <rect width="220" height="320" fill={HEX.mist} />
      <rect x="0" y="250" width="220" height="70" fill={HEX.navyMid} />
      <ellipse cx="110" cy="92" rx="36" ry="40" fill={HEX.goldSoft} />
      <path d="M74 78h72c6 0 10-18-4-30-12-10-52-10-64 0-14 12-10 30-4 30z" fill={HEX.paper} />
      <rect x="86" y="70" width="48" height="10" rx="3" fill={HEX.muted} />
      <path d="M58 148c8-22 28-34 52-34s44 12 52 34l8 92H50z" fill={HEX.navy} />
      <path d="M64 168l-2 48 96 0-2-48c-8 10-28 16-46 16s-38-6-46-16z" fill={HEX.gold} />
      <rect x="72" y="176" width="76" height="10" fill={HEX.navyDeep} />
      <text x="110" y="185" textAnchor="middle" fontSize="7" fontWeight="800" fill={HEX.paper}>
        LABOUR INSPECTOR
      </text>
      <rect x="138" y="186" width="52" height="70" rx="8" fill={HEX.navyDeep} />
      <rect x="144" y="194" width="40" height="52" rx="4" fill={HEX.tealBright} />
      <circle cx="82" cy="300" r="16" fill={HEX.navyInk} />
      <circle cx="138" cy="300" r="16" fill={HEX.navyInk} />
      <path d="M66 248h88v36H66z" fill={HEX.navyMid} />
    </svg>
  );
}

export function NoticeArt({ className }: { className?: string }) {
  return (
    <svg className={cn("h-full w-full", className)} viewBox="0 0 240 300" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <rect width="240" height="300" fill={HEX.mist} />
      <rect x="28" y="22" width="184" height="256" rx="8" fill={HEX.paper} stroke={HEX.navy} strokeWidth="2" />
      <rect x="28" y="22" width="184" height="36" fill={HEX.navy} />
      <text x="120" y="45" textAnchor="middle" fontSize="10" fontWeight="800" fill={HEX.tealBright}>
        KARNATAKA LABOUR CESS
      </text>
      <text x="120" y="82" textAnchor="middle" fontSize="14" fontWeight="800" fill={HEX.navy}>
        DEMAND NOTICE
      </text>
      <rect x="48" y="96" width="144" height="8" rx="2" fill={HEX.gold} />
      <rect x="48" y="172" width="144" height="48" rx="6" fill={HEX.okSoft} />
      <text x="120" y="192" textAnchor="middle" fontSize="9" fill={HEX.teal}>
        LCD-2025-000456
      </text>
      <text x="120" y="208" textAnchor="middle" fontSize="11" fontWeight="800" fill={HEX.navy}>
        Generated
      </text>
      <rect x="70" y="232" width="100" height="22" rx="4" fill={HEX.ok} />
      <text x="120" y="247" textAnchor="middle" fontSize="9" fontWeight="800" fill={HEX.paper}>
        ISSUE TO BUILDER
      </text>
    </svg>
  );
}

export function CalcArt({ className }: { className?: string }) {
  return (
    <svg className={cn("h-full w-full", className)} viewBox="0 0 240 300" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <rect width="240" height="300" fill={HEX.mist} />
      <rect x="36" y="36" width="168" height="228" rx="14" fill={HEX.navy} />
      <rect x="48" y="50" width="144" height="44" rx="8" fill={HEX.navyDeep} />
      <text x="184" y="78" textAnchor="end" fontSize="16" fontWeight="800" fill={HEX.tealBright}>
        CESS
      </text>
      <g fill={HEX.navyMid}>
        <rect x="48" y="108" width="40" height="32" rx="6" />
        <rect x="100" y="108" width="40" height="32" rx="6" />
        <rect x="152" y="108" width="40" height="32" rx="6" />
        <rect x="48" y="150" width="40" height="32" rx="6" />
        <rect x="100" y="150" width="40" height="32" rx="6" />
        <rect x="152" y="150" width="40" height="32" rx="6" />
        <rect x="48" y="192" width="40" height="32" rx="6" />
        <rect x="100" y="192" width="40" height="32" rx="6" />
      </g>
      <rect x="152" y="192" width="40" height="52" rx="6" fill={HEX.teal} />
    </svg>
  );
}

export function FloorsArt({ className }: { className?: string }) {
  return (
    <svg className={cn("h-full w-full", className)} viewBox="0 0 240 300" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <rect width="240" height="300" fill={HEX.mist} />
      <polygon points="120,40 190,70 190,250 120,220" fill={HEX.navyMid} />
      <polygon points="50,70 120,40 120,220 50,250" fill={HEX.goldSoft} />
      <polygon points="58,140 114,118 114,210 58,232" fill={HEX.teal} />
      <polygon points="50,70 120,40 190,70 120,100" fill={HEX.mist} />
      <text x="120" y="280" textAnchor="middle" fontSize="12" fontWeight="800" fill={HEX.navy}>
        G + 10 · as built
      </text>
    </svg>
  );
}

export function AbcComplex({ className }: { className?: string }) {
  return (
    <img
      src={abcIntake}
      alt=""
      aria-hidden
      className={cn("block h-full w-full object-cover object-[center_40%]", className)}
    />
  );
}
