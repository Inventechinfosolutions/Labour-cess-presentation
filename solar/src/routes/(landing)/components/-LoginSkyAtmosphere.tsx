import { cn } from "@/lib/utils";

/**
 * Sky wash: warm sun disc + soft god-rays (light / dark tuned). Sits above harvest canvas.
 */
export function LoginSkyAtmosphere({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {/* Sun core + corona (upper-left, morning field light) */}
      <div
        className="absolute -left-[min(18%,120px)] -top-[min(22%,140px)] h-[min(72vmin,560px)] w-[min(72vmin,560px)] rounded-full bg-[radial-gradient(circle_at_42%_42%,#fffdf5_0%,#fff4d6_8%,#ffe8b8_22%,rgba(255,200,120,0.35)_42%,rgba(255,180,90,0.12)_58%,transparent_72%)] opacity-[0.95] blur-[0.5px] dark:bg-[radial-gradient(circle_at_42%_42%,rgba(253,230,138,0.55)_0%,rgba(251,191,36,0.22)_28%,rgba(245,158,11,0.08)_48%,transparent_68%)] dark:opacity-90"
      />
      <div
        className="absolute left-[min(4%,32px)] top-[min(6%,48px)] h-[min(38vmin,300px)] w-[min(38vmin,300px)] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(255,250,235,0.45)_35%,transparent_62%)] opacity-80 mix-blend-soft-light dark:bg-[radial-gradient(circle_at_center,rgba(254,243,199,0.35)_0%,transparent_55%)] dark:mix-blend-screen dark:opacity-70"
      />

      {/* Crepuscular rays — masked so only sky band glows */}
      <div
        className="absolute -left-[40%] -top-[35%] h-[160vmin] w-[160vmin] opacity-[0.28] dark:opacity-[0.14]"
        style={{
          background:
            "repeating-conic-gradient(from 215deg at 50% 50%, transparent 0deg 10deg, rgba(255,248,220,0.22) 10deg 11deg, transparent 11deg 22deg)",
          maskImage: "radial-gradient(ellipse 42% 38% at 38% 32%, black 0%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse 42% 38% at 38% 32%, black 0%, transparent 72%)",
        }}
      />
      <div
        className="absolute -left-[25%] -top-[20%] h-[120vmin] w-[120vmin] opacity-[0.18] blur-[1px] dark:opacity-[0.1]"
        style={{
          background:
            "repeating-conic-gradient(from 205deg at 50% 50%, transparent 0deg 14deg, rgba(255,235,190,0.35) 14deg 15.5deg, transparent 15.5deg 32deg)",
          maskImage: "radial-gradient(ellipse 50% 45% at 36% 34%, black 0%, transparent 68%)",
          WebkitMaskImage: "radial-gradient(ellipse 50% 45% at 36% 34%, black 0%, transparent 68%)",
        }}
      />

      {/* Horizon bloom */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-amber-100/25 via-transparent to-transparent dark:from-amber-500/[0.07] dark:via-transparent" />
    </div>
  );
}
