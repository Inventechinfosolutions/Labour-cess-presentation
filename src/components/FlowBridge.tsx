import type { CessIcon } from "@/lib/icons";
import { Bank, Blueprint, Buildings, ClipboardText, FileText } from "@/lib/icons";
import { cn } from "@/lib/utils";

type Step = { label: string; Icon: CessIcon };

const SITE_STEPS: Step[] = [
  { label: "Permit", Icon: FileText },
  { label: "ULB", Icon: Bank },
  { label: "Site", Icon: Buildings },
];

const CESS_STEPS: Step[] = [
  { label: "Enter", Icon: Blueprint },
  { label: "Details", Icon: FileText },
  { label: "Assess", Icon: ClipboardText },
];

export function FlowBridge({
  variant,
}: {
  variant: "site" | "cess";
}) {
  const site = variant === "site";
  const steps = site ? SITE_STEPS : CESS_STEPS;
  const kicker = site ? "Into the site" : "Into the application";
  const to = site ? "Project" : "CESS";

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[24px] text-white shadow-[0_16px_40px_rgba(7,20,51,0.22)]",
        site
          ? "bg-linear-to-b from-navy via-navy-mid to-teal"
          : "bg-linear-to-b from-navy-mid via-navy to-navy-deep",
      )}
    >
      <div className="pointer-events-none absolute inset-y-14 left-1/2 w-px -translate-x-1/2 bg-linear-to-b from-teal-bright/20 via-teal-bright to-teal-bright/20 opacity-80" />
      <div className="pointer-events-none absolute inset-y-14 left-1/2 w-[3px] -translate-x-1/2 overflow-hidden">
        <i className="absolute left-0 h-14 w-full rounded-full bg-white/85 [animation:gap-drop_2s_linear_infinite]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-1.5 pt-3">
        <div className="stagger-in text-center text-[8px] font-extrabold tracking-[0.16em] text-teal-bright uppercase">{kicker}</div>
        <div className="stagger-in mt-1 h-px w-8 bg-linear-to-r from-teal-bright/0 via-teal-bright to-teal-bright/0" style={{ animationDelay: "80ms" }} />
      </div>

      <div className="relative z-10 mt-1 flex min-h-0 flex-1 flex-col justify-evenly px-1 pb-1">
        {steps.map((item, i) => (
          <div
            key={item.label}
            className="stagger-in flex flex-col items-center gap-1"
            style={{ animationDelay: `${140 + i * 140}ms` }}
          >
            <div className="relative flex h-11 w-full items-center justify-center">
              <span className="gap-flow-y absolute top-0 text-[11px] font-black text-teal-bright" style={{ animationDelay: `${i * 180}ms` }}>
                ↓
              </span>
              <span
                className="gap-node relative z-10 grid size-9 place-items-center rounded-full border border-white/20 bg-navy text-teal-bright shadow-[0_0_0_4px_rgba(7,20,51,0.55)]"
                style={{ animationDelay: `${i * 220}ms` }}
              >
                <item.Icon weight="duotone" className="size-4" />
              </span>
            </div>
            <span className="text-[8px] font-bold tracking-wide text-white/80">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="relative z-10 px-1.5 pb-2.5">
        <div className="stagger-in gap-pulse rounded-2xl bg-primary py-1.5 text-center shadow-[0_0_0_1px_rgba(20,196,212,0.35)]" style={{ animationDelay: "560ms" }}>
          <div className="font-display text-[9px] font-extrabold tracking-[0.16em]">{to}</div>
          <div className="mt-0.5 flex justify-center gap-0.5 text-xs font-black text-white/90">
            <span className="gap-flow-y" style={{ animationDelay: "0ms" }}>
              ↓
            </span>
            <span className="gap-flow-y" style={{ animationDelay: "180ms" }}>
              ↓
            </span>
            <span className="gap-flow-y" style={{ animationDelay: "360ms" }}>
              ↓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
