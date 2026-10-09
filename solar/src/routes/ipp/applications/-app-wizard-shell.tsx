import gsap from "gsap";
import {
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Settings2,
  UserCheck,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useLayoutEffect, useRef, type ComponentType, type RefObject } from "react";
import { cn } from "@/lib/utils";

export const IPP_STEPS = [
  { id: 0, title: "Basic Details",     description: "Project name, capacity, location" },
  { id: 1, title: "Technical Details", description: "Technology type, commissioning date, land source" },
  { id: 2, title: "Eligibility",       description: "Review eligibility criteria and agree to terms" },
  { id: 3, title: "Documents",         description: "Upload required scheme documents" },
  { id: 4, title: "Review & Submit",   description: "Check your application and submit" },
] as const;

const IPP_STEP_ICONS: readonly ComponentType<{ className?: string; "aria-hidden"?: boolean }>[] = [
  UserCheck,
  Settings2,
  ClipboardCheck,
  FileText,
  CheckCircle2,
];

export function AppWizardRail({
  step,
  onStepClick,
}: {
  step: number;
  onStepClick: (i: number) => void;
}) {
  return (
    <nav
      aria-label="Application steps"
      className="cw-rail flex flex-col gap-0 rounded-2xl border border-primary/10 bg-gradient-to-b from-card/95 to-muted/20 p-2 shadow-lg ring-1 ring-primary/[0.06] lg:p-3"
    >
      {IPP_STEPS.map((s, i) => {
        const Icon = IPP_STEP_ICONS[i]!;
        const done = i < step;
        const current = i === step;
        return (
          <button
            key={s.id}
            type="button"
            title={`Go to: ${s.title}`}
            onClick={() => onStepClick(i)}
            className={cn(
              "cw-rail-item group relative flex w-full min-w-0 items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors lg:px-3 lg:py-3",
              done && "hover:bg-primary/[0.08]",
              current && "bg-primary/[0.12] shadow-inner ring-1 ring-primary/20",
              !done && !current && "opacity-75 hover:bg-muted/40 hover:opacity-100",
            )}
          >
            {i < IPP_STEPS.length - 1 ? (
              <span
                className={cn(
                  "absolute left-[1.35rem] top-[2.35rem] hidden h-[calc(100%-0.25rem)] w-px lg:block",
                  done ? "bg-primary/35" : "bg-border/60",
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-xl border text-[11px] font-bold shadow-sm transition-transform duration-200",
                done && "border-primary/30 bg-primary text-white",
                current &&
                  "scale-[1.03] border-primary/40 bg-gradient-to-br from-chart-3 to-primary text-white shadow-md ring-2 ring-primary/25",
                !done && !current && "border-border/70 bg-muted/50 text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" strokeWidth={2.5} aria-hidden /> : <Icon className="size-4" aria-hidden />}
            </span>
            <span className="min-w-0 flex-1 pt-0.5">
              <span className="block text-[11px] font-semibold leading-tight text-foreground lg:text-xs">{s.title}</span>
              <span className="mt-0.5 hidden text-[10px] leading-snug text-muted-foreground lg:line-clamp-2 lg:block">
                {s.description}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function AppWizardMobileStepper({
  step,
  onStepClick,
}: {
  step: number;
  onStepClick: (i: number) => void;
}) {
  return (
    <div className="cw-rail cw-rail--mobile lg:hidden">
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {IPP_STEPS.map((s, i) => {
          const Icon = IPP_STEP_ICONS[i]!;
          const done = i < step;
          const current = i === step;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onStepClick(i)}
              className={cn(
                "cw-rail-item flex w-[min(100%,11rem)] shrink-0 snap-center flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-all",
                done && "border-primary/35 bg-primary/10",
                current && "border-primary bg-primary/15 shadow-md ring-2 ring-primary/25",
                !done && !current && "border-border/70 bg-muted/30",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg border text-[10px] font-bold",
                  done && "border-primary/25 bg-primary text-white",
                  current && "border-primary/30 bg-gradient-to-br from-chart-3 to-primary text-white",
                  !done && !current && "border-border/60 bg-background text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : <Icon className="size-3.5" aria-hidden />}
              </span>
              <span className="line-clamp-2 text-[9px] font-semibold leading-tight text-foreground">{s.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AppWizardProgressBar({
  step,
  reduceMotion,
}: {
  step: number;
  reduceMotion: boolean;
}) {
  const fillRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    const target = (step + 1) / IPP_STEPS.length;
    gsap.set(el, { transformOrigin: "left center" });
    if (reduceMotion) {
      gsap.set(el, { scaleX: target });
      return;
    }
    gsap.to(el, { scaleX: target, duration: 0.65, ease: "power2.inOut" });
  }, [step, reduceMotion]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span>Progress</span>
        <span className="tabular-nums text-foreground/80">
          Step {step + 1} / {IPP_STEPS.length}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted/80 ring-1 ring-border/60">
        <div
          ref={fillRef}
          className="h-full w-full rounded-full bg-gradient-to-r from-chart-3 via-primary to-chart-2 shadow-sm"
          style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
        />
      </div>
    </div>
  );
}

export function useAppWizardRailStagger(containerRef: RefObject<HTMLElement | null>, reduceMotion: boolean) {
  useLayoutEffect(() => {
    if (reduceMotion || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".cw-rail-item", {
        opacity: 0,
        y: 10,
        stagger: 0.055,
        duration: 0.36,
        ease: "power2.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, [containerRef, reduceMotion]);
}

const STAGE_FLIP_OUT = 0.48;
const STAGE_FLIP_IN = 0.64;
const STAGE_FLIP_ROTATION = 56;

export function useAppWizardStageFlip({
  step,
  setStep,
  reduceMotion,
  totalSteps,
}: {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  reduceMotion: boolean;
  totalSteps: number;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const prevStepRef = useRef(step);
  const didBootRef = useRef(false);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    if (reduceMotion) {
      gsap.set(el, { clearProps: "transform,opacity,visibility" });
      prevStepRef.current = step;
      didBootRef.current = true;
      return;
    }

    if (!didBootRef.current) {
      didBootRef.current = true;
      gsap.set(el, {
        transformPerspective: 1400,
        transformStyle: "preserve-3d",
        rotationY: 0,
        autoAlpha: 1,
        force3D: true,
      });
      prevStepRef.current = step;
      return;
    }

    const prev = prevStepRef.current;
    if (prev === step) return;

    const forward = step > prev;
    prevStepRef.current = step;
    gsap.killTweensOf(el);

    gsap.fromTo(
      el,
      {
        rotationY: forward ? STAGE_FLIP_ROTATION : -STAGE_FLIP_ROTATION,
        autoAlpha: 0.28,
        transformPerspective: 1400,
        force3D: true,
      },
      {
        rotationY: 0,
        autoAlpha: 1,
        duration: STAGE_FLIP_IN,
        ease: "sine.out",
        overwrite: "auto",
      },
    );
  }, [step, reduceMotion]);

  const goToStep = useCallback(
    (i: number) => {
      if (i === step) return;
      const el = stageRef.current;
      if (el) {
        gsap.killTweensOf(el);
        if (!reduceMotion) {
          gsap.set(el, {
            rotationY: 0,
            autoAlpha: 1,
            transformPerspective: 1400,
            force3D: true,
          });
        }
      }
      setStep(i);
    },
    [step, reduceMotion, setStep],
  );

  const goNext = useCallback(() => {
    if (step >= totalSteps - 1) return;
    const el = stageRef.current;
    if (reduceMotion || !el) {
      setStep((s) => Math.min(totalSteps - 1, s + 1));
      return;
    }
    if (gsap.isTweening(el)) return;
    gsap.to(el, {
      rotationY: -STAGE_FLIP_ROTATION,
      autoAlpha: 0,
      duration: STAGE_FLIP_OUT,
      ease: "power2.inOut",
      transformPerspective: 1400,
      transformOrigin: "50% 50%",
      force3D: true,
      overwrite: "auto",
      onComplete: () => {
        setStep((s) => Math.min(totalSteps - 1, s + 1));
      },
    });
  }, [step, totalSteps, reduceMotion, setStep]);

  const goPrev = useCallback(() => {
    if (step <= 0) return;
    const el = stageRef.current;
    if (reduceMotion || !el) {
      setStep((s) => Math.max(0, s - 1));
      return;
    }
    if (gsap.isTweening(el)) return;
    gsap.to(el, {
      rotationY: STAGE_FLIP_ROTATION,
      autoAlpha: 0,
      duration: STAGE_FLIP_OUT,
      ease: "power2.inOut",
      transformPerspective: 1400,
      transformOrigin: "50% 50%",
      force3D: true,
      overwrite: "auto",
      onComplete: () => {
        setStep((s) => Math.max(0, s - 1));
      },
    });
  }, [step, reduceMotion, setStep]);

  return { stageRef, goNext, goPrev, goToStep };
}

export function AppWizardFooterNav({
  step,
  totalSteps,
  canNext,
  onPrev,
  onNext,
  onSaveDraft,
  onSubmit,
}: {
  step: number;
  totalSteps: number;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  const last = step === totalSteps - 1;

  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-primary/10 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onPrev}
        disabled={step === 0}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-border/70 bg-background px-4 text-sm font-medium transition hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
      >
        Previous
      </button>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {last ? (
          <>
            <button
              type="button"
              onClick={onSaveDraft}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border/70 bg-background px-4 text-sm font-medium transition hover:bg-muted/50"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canNext}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-chart-2 px-6 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
            >
              <CheckCircle2 className="size-4" aria-hidden />
              Submit application
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
          >
            Continue
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}
