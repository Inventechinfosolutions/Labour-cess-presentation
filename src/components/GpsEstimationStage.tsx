import { useEffect, useState, type CSSProperties } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowDown,
  ArrowRight,
  Buildings,
  Calculator,
  CaretDown,
  CaretRight,
  ClipboardText,
  Columns,
  CurrencyInr,
  List,
  PaintRoller,
  Plus,
  Ruler,
  Wrench,
} from "@/lib/icons";
import { stageFont } from "@/lib/stageFont";
import { AppBar, Phone, ProjectCard } from "@/components/GpsOfflineStage";
import inspectorPhone from "@/assets/gps-inspector-phone.jpg";
import stageBg from "@/assets/current-issues-center-bg-wide.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

export const G = {
  red: "linear-gradient(135deg,#d9203f,#ff5a72)",
  green: "linear-gradient(135deg,#0f8a4c,#2fc57a)",
  blue: "linear-gradient(135deg,#1558c0,#3b8cf0)",
  purple: "linear-gradient(135deg,#6b35d6,#9d6bff)",
  orange: "linear-gradient(135deg,#e06a06,#f7a23a)",
};

const FLOW: { label: [string, string]; Icon: CessIcon; grad: string }[] = [
  { label: ["Survey", "Site Details"], Icon: ClipboardText, grad: G.blue },
  { label: ["Record", "Measurements"], Icon: Ruler, grad: G.green },
  { label: ["Estimate", "Construction Value"], Icon: Calculator, grad: G.blue },
  { label: ["Calculate", "CESS Amount"], Icon: CurrencyInr, grad: G.orange },
];

const STEPS: { title: string; grad: string }[] = [
  { title: "Site Survey", grad: "linear-gradient(90deg,#e8650a,#f9a23c)" },
  { title: "Record Measurements", grad: "linear-gradient(90deg,#1558c0,#22a6e8)" },
  { title: "Estimate Construction Value", grad: "linear-gradient(90deg,#5b27c4,#9d6bff)" },
  { title: "CESS Calculation", grad: "linear-gradient(90deg,#0f8a4c,#34c77b)" },
];

const SURVEY_FIELDS: [string, string][] = [
  ["Construction Type", "Commercial"],
  ["Construction Stage", "RCC Structure"],
  ["Work Status", "Under Construction"],
  ["Sanctioned Plan", "Yes"],
];

const BUILDING_FIELDS: [string, string][] = [
  ["Built-up Area (sq.ft)", "25,000"],
  ["Number of Floors", "6"],
  ["Plot Area (sq.ft)", "40,000"],
];

const QUANTITY_FIELDS: { label: string; value: string; Icon: CessIcon }[] = [
  { label: "Plinth Area (sq.ft)", value: "25,000", Icon: Buildings },
  { label: "Structure (sq.ft)", value: "25,000", Icon: Columns },
  { label: "Finishing (sq.ft)", value: "10,000", Icon: PaintRoller },
];

const ESTIMATE_FIELDS: [string, string][] = [
  ["Unit Rate (₹/sq.ft)", "8,000"],
  ["Built-up Area (sq.ft)", "25,000"],
  ["Number of Floors", "6"],
  ["Other Charges (%)", "5"],
];

const CAPS: { title: string; items: string[]; Icon: CessIcon; grad: string }[] = [
  {
    title: "Survey",
    items: ["Record construction details", "Capture current construction stage", "Record work and measurement details"],
    Icon: ClipboardText,
    grad: G.green,
  },
  {
    title: "Estimation",
    items: ["Update estimation details", "Calculate estimated construction value", "Support assessment of the site"],
    Icon: Calculator,
    grad: G.orange,
  },
  {
    title: "CESS Calculation",
    items: ["Apply the applicable CESS rules", "Generate assessment amount", "Prepare details for demand notice"],
    Icon: CurrencyInr,
    grad: G.purple,
  },
];

const OUTCOMES: { title: string; body: string; Icon: CessIcon; grad: string }[] = [
  { title: "Field observations", body: "from site survey", Icon: Wrench, grad: G.red },
  { title: "Measured information", body: "and construction details", Icon: List, grad: G.blue },
  { title: "Estimated construction", body: "value", Icon: Calculator, grad: G.orange },
  { title: "Labour CESS", body: "assessment", Icon: CurrencyInr, grad: G.green },
];

const EST_VALUE = 200_000_000;
const CESS_VALUE = 2_000_000;
const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

export const STAGE_TYPE = {
  containerType: "size",
  "--gs-20": stageFont(20, 10),
  "--gs-18": stageFont(18, 9),
  "--gs-16": stageFont(16, 8),
  "--gs-14": stageFont(14, 7),
  "--gs-13": stageFont(13, 6.5),
  "--gs-12": stageFont(12, 6),
} as CSSProperties;

function useCountUp(target: number, delay: number, reduce: boolean) {
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, { duration: 1.4, delay, ease, onUpdate: setValue });
    return () => controls.stop();
  }, [target, delay, reduce]);
  return value;
}

/** Poster-style "Survey & Construction Estimation" stage — survey, measure, estimate, calculate CESS. */
export function GpsEstimationStage() {
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setActive((s) => (s + 1) % STEPS.length), 2400);
    return () => clearInterval(t);
  }, [reduce]);

  const rise = (delay: number, x = 0, y = 10) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, x, y },
          animate: { opacity: 1, x: 0, y: 0 },
          transition: { duration: 0.55, delay, ease },
        };

  return (
    <div
      className="relative grid h-full min-h-0 w-full grid-rows-[12%_minmax(0,1fr)_11%] gap-y-[1%] overflow-hidden pb-[0.8%] text-[#122b50]"
      style={{
        ...STAGE_TYPE,
        background: `linear-gradient(180deg, rgba(238,245,253,0.35) 0%, rgba(238,245,253,0.1) 60%), url(${stageBg}) 70% bottom / cover no-repeat, #eef5fd`,
      }}
    >

      {/* Row 1 — four-step journey */}
      <div className="relative flex min-h-0 items-stretch justify-end px-[1.4%] pt-[1%]">
        <motion.div
          {...rise(0.3, 0, -8)}
          className="flex w-[50%] items-center rounded-2xl bg-white/92 px-[2.4%] shadow-[0_10px_28px_rgba(20,60,120,0.14)] ring-1 ring-[#d7e5f4]"
        >
          {FLOW.map((f, i) => {
            const on = !reduce && active === i;
            return (
              <div key={f.label.join(" ")} className="contents">
                <div className="flex shrink-0 items-center gap-[0.5em]">
                  <motion.span
                    className="grid size-[2.5em] shrink-0 place-items-center rounded-full text-[length:var(--gs-16)] text-white shadow-[0_5px_12px_rgba(0,0,0,0.18)] ring-2 ring-white"
                    style={{ background: f.grad }}
                    animate={{ scale: on ? 1.12 : 1 }}
                    transition={{ duration: 0.35, ease }}
                  >
                    <f.Icon weight="fill" className="size-[50%]" />
                  </motion.span>
                  <span className="text-[length:var(--gs-13)] leading-[1.15] font-bold whitespace-nowrap text-[#123a6e]">
                    {f.label[0]}
                    <br />
                    {f.label[1]}
                  </span>
                </div>
                {i < FLOW.length - 1 && <FlowLink delay={0.6 + i * 0.5} reduce={reduce} />}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Row 2 — four phones + capabilities */}
      <div className="relative grid min-h-0 grid-cols-[13%_15%_2%_15%_2%_15%_2%_15%_minmax(0,1fr)] px-[1.4%]">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease }}
          className="pointer-events-none relative -ml-[10%] h-full min-h-0 select-none"
          style={{
            maskImage: "linear-gradient(90deg,#000 0%,#000 88%,transparent 100%), linear-gradient(180deg,transparent 0%,#000 12%,#000 90%,transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg,#000 0%,#000 88%,transparent 100%), linear-gradient(180deg,transparent 0%,#000 12%,#000 90%,transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          <img src={inspectorPhone} alt="Labour Inspector recording survey and measurements on site" draggable={false} className="size-full object-cover object-[14%_22%]" />
        </motion.div>
        {STEPS.map((s, i) => (
          <div key={s.title} className="contents">
            <div className="flex min-h-0 flex-col gap-[2.5%]">
              <StepPill n={i + 1} title={s.title} grad={s.grad} on={!reduce && active === i} delay={0.2 + i * 0.12} reduce={reduce} />
              <div className="min-h-0 flex-1">
                <Phone delay={0.3 + i * 0.15} reduce={reduce}>
                  {i === 0 && <SurveyScreen reduce={reduce} />}
                  {i === 1 && <MeasureScreen />}
                  {i === 2 && <EstimateScreen reduce={reduce} />}
                  {i === 3 && <CessScreen reduce={reduce} />}
                </Phone>
              </div>
            </div>
            {i < STEPS.length - 1 && <StepArrow delay={0.9 + i * 0.45} reduce={reduce} />}
          </div>
        ))}
        <CapsPanel active={reduce ? -1 : [0, 0, 1, 2][active]} reduce={reduce} />
      </div>

      {/* Row 3 — outcome chain */}
      <motion.div
        {...rise(1.1, 0, 12)}
        className="relative mx-[1.4%] flex min-h-0 items-center rounded-2xl bg-white/92 px-[2%] shadow-[0_10px_26px_rgba(20,50,90,0.14)] ring-1 ring-[#d3e2f2] backdrop-blur-sm"
      >
        {OUTCOMES.map((o, i) => (
          <div key={o.title} className="contents">
            <motion.div {...rise(1.25 + i * 0.12, 0, 8)} className="flex h-full min-w-0 flex-1 items-center gap-[5%]">
              <span
                className="grid aspect-square h-[62%] shrink-0 place-items-center rounded-full text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
                style={{ background: o.grad }}
              >
                <o.Icon weight="bold" className="size-[50%]" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="font-display block text-[length:var(--gs-18)] font-extrabold text-[#123a6e]">{o.title}</span>
                <span className="font-display block text-[length:var(--gs-18)] font-extrabold text-[#123a6e]">{o.body}</span>
              </span>
            </motion.div>
            {i < OUTCOMES.length - 1 && (
              <ArrowRight weight="bold" className="mx-[1.5%] size-[length:var(--gs-20)] shrink-0 text-[#9fb2c8]" />
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function FlowLink({ delay, reduce }: { delay: number; reduce: boolean }) {
  return (
    <span className="relative mx-[1.6%] flex h-[2px] min-w-[1em] flex-1 items-center bg-[#9cc0ee] text-[length:var(--gs-16)]">
      <span className="absolute -right-[0.1em] size-0 border-y-[0.3em] border-l-[0.45em] border-y-transparent border-l-[#1d66dc]" />
      {!reduce && (
        <motion.span
          className="absolute size-[0.4em] rounded-full bg-[#1f6fd8]"
          animate={{ left: ["0%", "85%"], opacity: [0, 1, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, delay, repeatDelay: 1.2 }}
        />
      )}
    </span>
  );
}

export function StepPill({
  n,
  title,
  grad,
  on,
  delay,
  reduce,
}: {
  n: number;
  title: string;
  grad: string;
  on: boolean;
  delay: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0, scale: on ? 1.04 : 1 }}
      transition={{ duration: 0.45, delay: on ? 0 : delay, ease }}
      className="flex shrink-0 items-center gap-[0.5em] rounded-full py-[0.35em] pr-[0.9em] pl-[0.35em] text-[length:var(--gs-14)] text-white shadow-[0_6px_16px_rgba(20,50,90,0.22)]"
      style={{ background: grad }}
    >
      <span className="font-display grid size-[1.9em] shrink-0 place-items-center rounded-full bg-white/20 text-[1.1em] font-black ring-2 ring-white">
        {n}
      </span>
      <span className="font-display truncate leading-tight font-extrabold">{title}</span>
    </motion.div>
  );
}

export function StepArrow({ delay, reduce }: { delay: number; reduce: boolean }) {
  return (
    <div className="relative flex items-center justify-center pt-[40%]">
      <div className="relative flex h-[3%] w-full items-center">
        <span className="absolute inset-x-[10%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#3b82f6]/35" />
        <svg viewBox="0 0 24 24" className="relative z-[1] ml-auto h-[180%] w-auto text-[#1d66dc]" aria-hidden>
          <path d="M6 3 L18 12 L6 21 Z" fill="currentColor" />
        </svg>
        {!reduce && (
          <motion.span
            className="absolute top-1/2 size-[6px] -translate-y-1/2 rounded-[2px] bg-[#1d66dc]"
            animate={{ left: ["6%", "70%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay, repeatDelay: 0.8, ease: "easeInOut" }}
          />
        )}
      </div>
    </div>
  );
}

export function NextButton({ label = "Next", arrow = true }: { label?: string; arrow?: boolean }) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-[0.8cqh] rounded-[1.3cqh] bg-[linear-gradient(90deg,#1552c4,#1f7af0)] py-[1.5cqh] text-[2.64cqh] leading-none font-bold text-white shadow-[0_4px_10px_rgba(29,102,220,0.3)]">
      {label}
      {arrow && <ArrowRight weight="bold" className="size-[2.53cqh]" />}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p className="flex items-center justify-between border-b border-[#e3ecf6] pb-[0.6cqh] font-display text-[2.4cqh] leading-none font-extrabold text-[#123a6e]">
      {title}
      <CaretRight weight="bold" className="size-[2.07cqh] text-[#3b82f6]" />
    </p>
  );
}

function InputRow({ label, value, Icon }: { label: string; value: string; Icon?: CessIcon }) {
  return (
    <div className="flex items-center gap-[0.8cqh] text-[2.04cqh] leading-none font-semibold">
      {Icon && <Icon weight="fill" className="size-[2.42cqh] shrink-0 text-[#1d4f9a]" />}
      <span className="min-w-0 flex-1 text-[#2c4668]">{label}</span>
      <span className="w-[38%] shrink-0 rounded-[0.8cqh] bg-white px-[1cqh] py-[0.9cqh] text-right font-bold text-[#17365f] ring-1 ring-[#d3e2f2]">
        {value}
      </span>
    </div>
  );
}

function SurveyScreen({ reduce }: { reduce: boolean }) {
  return (
    <>
      <AppBar title="Construction Assessment" compact />
      <div className="flex min-h-0 flex-1 flex-col gap-[1cqh] px-[4.5%] pt-[1.3cqh] pb-[1.4cqh]">
        <ProjectCard />
        <p className="shrink-0 rounded-[1cqh] bg-[#e3f6ea] py-[0.9cqh] text-center font-display text-[2.28cqh] leading-none font-extrabold text-[#12804a]">
          Site Survey
        </p>
        <div className="flex min-h-0 flex-1 flex-col justify-evenly">
          {SURVEY_FIELDS.map(([k, v]) => (
            <div key={k} className="space-y-[0.5cqh]">
              <p className="text-[1.86cqh] leading-none font-semibold text-[#3f5b7c]">{k}</p>
              <p className="flex items-center justify-between rounded-[0.9cqh] bg-white px-[1.2cqh] py-[0.9cqh] text-[2.1cqh] leading-none font-bold text-[#17365f] ring-1 ring-[#d3e2f2]">
                {v}
                <CaretDown weight="bold" className="size-[1.95cqh] text-[#3b82f6]" />
              </p>
            </div>
          ))}
          <div className="space-y-[0.6cqh]">
            <p className="flex justify-between text-[1.86cqh] leading-none font-semibold text-[#3f5b7c]">
              Current Progress <span className="font-bold text-[#17365f]">60%</span>
            </p>
            <div className="h-[1cqh] overflow-hidden rounded-full bg-[#dfe7f1]">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#1d66dc,#3b8cf0)]"
                initial={reduce ? false : { width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 1.2, delay: 1, ease }}
              />
            </div>
          </div>
        </div>
        <NextButton />
      </div>
    </>
  );
}

function MeasureScreen() {
  return (
    <>
      <AppBar title="Site Measurements" />
      <div className="flex min-h-0 flex-1 flex-col gap-[1cqh] px-[4.5%] pt-[1.3cqh] pb-[1.4cqh]">
        <ProjectCard />
        <div className="flex min-h-0 flex-1 flex-col justify-evenly">
          <SectionTitle title="Building Details" />
          {BUILDING_FIELDS.map(([k, v]) => (
            <InputRow key={k} label={k} value={v} />
          ))}
          <SectionTitle title="Work Quantity" />
          {QUANTITY_FIELDS.map((q) => (
            <InputRow key={q.label} label={q.label} value={q.value} Icon={q.Icon} />
          ))}
          <p className="flex items-center gap-[0.5cqh] text-[1.98cqh] leading-none font-bold text-[#1d66dc]">
            <Plus weight="bold" className="size-[2.07cqh]" />
            Add More Items
          </p>
        </div>
        <NextButton />
      </div>
    </>
  );
}

function EstimateScreen({ reduce }: { reduce: boolean }) {
  const value = useCountUp(EST_VALUE, 1.6, reduce);
  return (
    <>
      <AppBar title="Estimation Details" />
      <div className="flex min-h-0 flex-1 flex-col gap-[1cqh] px-[4.5%] pt-[1.3cqh] pb-[1.4cqh]">
        <ProjectCard />
        <div className="flex min-h-0 flex-1 flex-col justify-evenly">
          <SectionTitle title="Estimation Parameters" />
          {ESTIMATE_FIELDS.map(([k, v]) => (
            <InputRow key={k} label={k} value={v} />
          ))}
          <div className="flex items-center gap-[1.2cqh] rounded-[1.4cqh] bg-[linear-gradient(135deg,#e6f0fd,#e3f6fb)] px-[1.4cqh] py-[1.6cqh] ring-1 ring-[#cfe0f5]">
            <Buildings weight="fill" className="size-[4.83cqh] shrink-0 text-[#1d66dc]" />
            <div className="min-w-0 text-center leading-none">
              <p className="text-[1.8cqh] font-bold text-[#123a6e]">Estimated Construction Value</p>
              <p className="font-display mt-[0.6cqh] text-[3.24cqh] font-black whitespace-nowrap text-[#1552c4] tabular-nums">
                {inr(value)}
              </p>
              <p className="mt-[0.5cqh] text-[1.68cqh] font-semibold text-[#5b7390]">(₹ 20.00 Crore)</p>
            </div>
          </div>
        </div>
        <NextButton />
      </div>
    </>
  );
}

function CessScreen({ reduce }: { reduce: boolean }) {
  const cess = useCountUp(CESS_VALUE, 2.6, reduce);
  return (
    <>
      <AppBar title="CESS Assessment" />
      <div className="flex min-h-0 flex-1 flex-col gap-[0.9cqh] px-[4.5%] pt-[1.3cqh] pb-[1.4cqh]">
        <ProjectCard />
        <div className="shrink-0 rounded-[1.4cqh] bg-[#e3f6ea] px-[1.4cqh] py-[1cqh] text-center ring-1 ring-[#c4e8d1]">
          <p className="text-[1.8cqh] leading-none font-bold text-[#12804a]">Estimated Construction Value</p>
          <p className="mt-[0.6cqh] flex items-center justify-center gap-[1cqh]">
            <Buildings weight="fill" className="size-[3.91cqh] text-[#12994f]" />
            <span className="leading-none">
              <span className="font-display block text-[3.0cqh] font-black text-[#123a6e]">₹ 20,00,00,000</span>
              <span className="block text-[1.56cqh] font-semibold text-[#5b7390]">(₹ 20.00 Crore)</span>
            </span>
          </p>
        </div>
        <motion.span
          className="flex shrink-0 justify-center text-[#1d66dc]"
          animate={reduce ? undefined : { y: [0, 3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown weight="bold" className="size-[2.99cqh]" />
        </motion.span>
        <div className="shrink-0 rounded-[1.4cqh] bg-[#fdeedd] px-[1.4cqh] py-[1cqh] text-center ring-1 ring-[#f7d2a8]">
          <p className="text-[1.8cqh] leading-none font-bold text-[#c2410c]">Applicable Labour CESS</p>
          <p className="mt-[0.6cqh] flex items-center justify-center gap-[1cqh]">
            <span className="grid size-[3.91cqh] place-items-center rounded-full bg-[#f08a12] text-white">
              <CurrencyInr weight="bold" className="size-[60%]" />
            </span>
            <span className="leading-none">
              <span className="font-display block text-[3.0cqh] font-black whitespace-nowrap text-[#b4410a] tabular-nums">
                {inr(cess)}
              </span>
              <span className="block text-[1.56cqh] font-semibold text-[#5b7390]">(₹ 20.00 Lakh)</span>
            </span>
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-evenly">
          <p className="font-display text-[2.22cqh] leading-none font-extrabold text-[#123a6e]">Calculation Summary</p>
          {[
            ["CESS Rate (Example)", "1%"],
            ["Estimated Value", "₹ 20,00,00,000"],
            ["CESS Amount", "₹ 20,00,000"],
          ].map(([k, v]) => (
            <p key={k} className="flex justify-between border-b border-[#e3ecf6] pb-[0.5cqh] text-[1.8cqh] leading-none">
              <span className="font-semibold text-[#5b7390]">{k}</span>
              <span className="font-bold text-[#17365f]">{v}</span>
            </p>
          ))}
          <p className="text-[1.44cqh] leading-snug font-semibold text-[#7b8ea8]">
            * Example values for illustration only. Actual calculation follows the Board's rules.
          </p>
        </div>
        <NextButton label="Save Assessment" arrow={false} />
      </div>
    </>
  );
}

function CapsPanel({ active, reduce }: { active: number; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.7, ease }}
      className="ml-[8%] flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white/92 text-[length:var(--gs-13)] shadow-[0_14px_34px_rgba(20,60,120,0.16)] ring-1 ring-[#d3e3f4] backdrop-blur-sm"
    >
      <div className="font-display shrink-0 bg-[linear-gradient(90deg,#1450b8,#2f7ff0)] px-[8%] py-[0.8em] text-[length:var(--gs-20)] leading-none font-extrabold text-white">
        Key Capabilities
      </div>
      <div className="flex min-h-0 flex-1 flex-col divide-y divide-[#e3ecf6]">
        {CAPS.map((c, i) => {
          const on = active === i;
          return (
            <motion.div
              key={c.title}
              initial={reduce ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0, backgroundColor: on ? "rgba(231,240,253,0.9)" : "rgba(255,255,255,0)" }}
              transition={{ duration: 0.4, delay: on ? 0 : 0.9 + i * 0.12, ease }}
              className="flex min-h-0 flex-1 items-center gap-[7%] px-[7%]"
            >
              <motion.span
                className="grid size-[3.2em] shrink-0 place-items-center rounded-full text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] ring-2 ring-white"
                style={{ background: c.grad }}
                animate={{ scale: on ? 1.08 : 1 }}
                transition={{ duration: 0.35, ease }}
              >
                <c.Icon weight="fill" className="size-[50%]" />
              </motion.span>
              <div className="min-w-0">
                <p className="font-display text-[length:var(--gs-18)] leading-tight font-extrabold text-[#123a6e]">{c.title}</p>
                <ul className="mt-[0.35em] space-y-[0.25em] leading-snug font-semibold text-[#3f5b7c]">
                  {c.items.map((it) => (
                    <li key={it} className="flex gap-[0.4em]">
                      <span className="mt-[0.5em] size-[0.35em] shrink-0 rounded-full bg-[#3b82f6]" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
