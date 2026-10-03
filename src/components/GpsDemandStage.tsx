import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowDown,
  Buildings,
  Calculator,
  Check,
  ClipboardText,
  CloudArrowUp,
  Columns,
  CurrencyInr,
  DownloadSimple,
  EnvelopeSimple,
  Eye,
  FileText,
  PaperPlaneTilt,
  Ruler,
  ShareNetwork,
  Stack,
  WhatsappLogo,
} from "@/lib/icons";
import { AppBar, Phone, ProjectCard } from "@/components/GpsOfflineStage";
import { FlowLink, G, NextButton, PhoneSlot, STAGE_TYPE, StepArrow, StepPill } from "@/components/GpsEstimationStage";
import inspectorPhone from "@/assets/gps-inspector-phone.jpg";
import karnatakaEmblem from "@/assets/karnataka-emblem.png";
import stageBg from "@/assets/current-issues-center-bg-wide.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

const FLOW: { label: [string, string]; Icon: CessIcon; grad: string }[] = [
  { label: ["Survey &", "Measure Site"], Icon: ClipboardText, grad: G.blue },
  { label: ["Estimate", "Value & CESS"], Icon: Calculator, grad: G.green },
  { label: ["Generate", "Demand Notice"], Icon: FileText, grad: G.orange },
  { label: ["Issue to", "Stakeholder"], Icon: PaperPlaneTilt, grad: G.purple },
];

const STEPS: { title: string; grad: string }[] = [
  { title: "Survey & Measurements", grad: "linear-gradient(90deg,#1558c0,#3b8cf0)" },
  { title: "Estimate & CESS", grad: "linear-gradient(90deg,#0f8a4c,#34c77b)" },
  { title: "Demand Notice Preview", grad: "linear-gradient(90deg,#e8650a,#f9a23c)" },
  { title: "Notice Issued", grad: "linear-gradient(90deg,#5b27c4,#9d6bff)" },
];

const SURVEY_ROWS: [string, string][] = [
  ["Construction Type", "Commercial"],
  ["Construction Stage", "RCC Structure"],
  ["Work Status", "Under Construction"],
];

const MEASURE_ROWS: { label: string; value: string; Icon: CessIcon }[] = [
  { label: "Built-up Area (sq.ft)", value: "25,000", Icon: Buildings },
  { label: "Number of Floors", value: "6", Icon: Stack },
  { label: "Plot Area (sq.ft)", value: "40,000", Icon: Ruler },
  { label: "Structure (sq.ft)", value: "25,000", Icon: Columns },
];

const ESTIMATE_ROWS: [string, string][] = [
  ["Unit Rate (₹/sq.ft)", "8,000"],
  ["Built-up Area (sq.ft)", "25,000"],
  ["Applicable CESS Rate", "1%"],
];

const NOTICE_ROWS: [string, string][] = [
  ["Notice No.", "DN-2025-00128"],
  ["Date", "15 Jan 2025"],
  ["To", "M/s ABC Developers"],
  ["Project", "ABC Commercial Complex"],
  ["Location", "Yelahanka, Bengaluru"],
];

const ISSUED_ROWS: [string, string][] = [
  ["Notice No.", "DN-2025-00128"],
  ["Project", "ABC Commercial Complex"],
  ["Demand Amount", "₹ 20,00,000"],
  ["Due Date", "14 Feb 2025"],
];

const ACTIONS: { label: string; Icon: CessIcon }[] = [
  { label: "View Notice", Icon: Eye },
  { label: "Download PDF", Icon: DownloadSimple },
  { label: "Share via Email", Icon: EnvelopeSimple },
  { label: "Share via WhatsApp", Icon: WhatsappLogo },
];

const CAPS: { title: string; body: string; Icon: CessIcon; grad: string }[] = [
  {
    title: "Site Survey",
    body: "Record construction details, stage and measurements.",
    Icon: ClipboardText,
    grad: G.blue,
  },
  {
    title: "Estimate & CESS",
    body: "Estimate construction value and apply the CESS rate.",
    Icon: Calculator,
    grad: G.green,
  },
  {
    title: "On-the-Spot Notice",
    body: "Demand notice with amount and due date, made on site.",
    Icon: FileText,
    grad: G.orange,
  },
  {
    title: "Share & Central Update",
    body: "Notice shared and saved on the Central Platform.",
    Icon: CloudArrowUp,
    grad: G.purple,
  },
];

const OUTCOMES: { title: string; body: string; Icon: CessIcon; grad: string }[] = [
  { title: "Survey and measure", body: "Recorded on site", Icon: ClipboardText, grad: G.blue },
  { title: "Estimate value and CESS", body: "Calculated on the phone", Icon: Calculator, grad: G.green },
  { title: "Digital demand notice", body: "With notice number and due date", Icon: FileText, grad: G.orange },
  { title: "Shared and synced", body: "Stakeholder and Central Platform", Icon: ShareNetwork, grad: G.purple },
];

const EST_VALUE = 200_000_000;
const TOTAL = 2_000_000;
const inr = (n: number) => `₹ ${Math.round(n).toLocaleString("en-IN")}`;

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

/** Poster-style "Survey, Estimation & Demand Notice" stage — one phone per Space: survey, estimate & CESS, notice preview, notice issued. */
export function GpsDemandStage({ step = STEPS.length - 1 }: { step?: number }) {
  const reduce = !!useReducedMotion();
  const active = Math.min(Math.max(step, 0), STEPS.length - 1);

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
            const on = active === i;
            const reached = i <= active;
            return (
              <div key={f.label.join(" ")} className="contents">
                <motion.div
                  className="flex shrink-0 items-center gap-[0.5em]"
                  animate={{ opacity: reached ? 1 : 0.4 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <motion.span
                    className="grid size-[2.5em] shrink-0 place-items-center rounded-full text-[length:var(--gs-16)] text-white shadow-[0_5px_12px_rgba(0,0,0,0.18)] ring-2 ring-white"
                    style={{ background: reached ? f.grad : "#b8c6d8" }}
                    animate={{ scale: on && !reduce ? 1.12 : 1 }}
                    transition={{ duration: 0.35, ease }}
                  >
                    <f.Icon weight="fill" className="size-[50%]" />
                  </motion.span>
                  <span className="text-[length:var(--gs-13)] leading-[1.15] font-bold whitespace-nowrap text-[#123a6e]">
                    {f.label[0]}
                    <br />
                    {f.label[1]}
                  </span>
                </motion.div>
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
          <img src={inspectorPhone} alt="Labour Inspector surveying the site and generating the demand notice" draggable={false} className="size-full object-cover object-[14%_22%]" />
        </motion.div>
        {STEPS.map((s, i) => {
          const shown = i <= active;
          return (
            <div key={s.title} className="contents">
              {shown ? (
                <div className="flex min-h-0 flex-col gap-[2.5%]">
                  <StepPill n={i + 1} title={s.title} grad={s.grad} on={!reduce && active === i} delay={i === 0 ? 0.2 : 0.05} reduce={reduce} />
                  <div className="min-h-0 flex-1">
                    <Phone delay={i === 0 ? 0.3 : 0.12} reduce={reduce}>
                      {i === 0 && <SurveyScreen reduce={reduce} />}
                      {i === 1 && <EstimateCessScreen reduce={reduce} />}
                      {i === 2 && <NoticeScreen reduce={reduce} />}
                      {i === 3 && <IssuedScreen reduce={reduce} />}
                    </Phone>
                  </div>
                </div>
              ) : (
                <PhoneSlot n={i + 1} title={s.title} Icon={FLOW[i].Icon} />
              )}
              {i < STEPS.length - 1 && (i < active ? <StepArrow delay={0.4} reduce={reduce} /> : <span />)}
            </div>
          );
        })}
        <CapsPanel active={active} reduce={reduce} />
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
                <o.Icon weight="fill" className="size-[50%]" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="font-display block text-[length:var(--gs-16)] font-extrabold text-[#123a6e]">{o.title}</span>
                <span className="block text-[length:var(--gs-13)] font-semibold text-[#4d6784]">{o.body}</span>
              </span>
            </motion.div>
            {i < OUTCOMES.length - 1 && (
              <span className="mx-[1.2%] h-[55%] w-px shrink-0 bg-[#d3e2f2]" />
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ScreenSection({ title, Icon, tone }: { title: string; Icon: CessIcon; tone: string }) {
  return (
    <p className="font-display flex shrink-0 items-center gap-[0.7cqh] border-b border-[#e3ecf6] pb-[0.6cqh] text-[2.28cqh] leading-none font-extrabold text-[#123a6e]">
      <Icon weight="fill" className="size-[2.5cqh]" style={{ color: tone }} />
      {title}
    </p>
  );
}

function SurveyScreen({ reduce }: { reduce: boolean }) {
  return (
    <>
      <AppBar title="Survey & Measurements" compact />
      <div className="flex min-h-0 flex-1 flex-col gap-[0.9cqh] px-[4.5%] pt-[1.3cqh] pb-[1.4cqh]">
        <ProjectCard />
        <div className="flex min-h-0 flex-1 flex-col justify-evenly">
          <ScreenSection title="Site Survey" Icon={ClipboardText} tone="#1d66dc" />
          {SURVEY_ROWS.map(([k, v]) => (
            <p key={k} className="flex items-center justify-between gap-[1cqh] text-[1.95cqh] leading-none">
              <span className="font-semibold text-[#5b7390]">{k}</span>
              <span className="text-right font-bold whitespace-nowrap text-[#17365f]">{v}</span>
            </p>
          ))}
          <div className="space-y-[0.5cqh]">
            <p className="flex justify-between text-[1.86cqh] leading-none font-semibold text-[#3f5b7c]">
              Current Progress <span className="font-bold text-[#17365f]">60%</span>
            </p>
            <div className="h-[1cqh] overflow-hidden rounded-full bg-[#dfe7f1]">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#1d66dc,#3b8cf0)]"
                initial={reduce ? false : { width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 1.2, delay: 0.8, ease }}
              />
            </div>
          </div>
          <ScreenSection title="Measurements" Icon={Ruler} tone="#12994f" />
          {MEASURE_ROWS.map((r, i) => (
            <motion.div
              key={r.label}
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 1 + i * 0.1, ease }}
              className="flex items-center gap-[0.8cqh] text-[1.95cqh] leading-none font-semibold"
            >
              <r.Icon weight="fill" className="size-[2.3cqh] shrink-0 text-[#1d4f9a]" />
              <span className="min-w-0 flex-1 text-[#2c4668]">{r.label}</span>
              <span className="w-[34%] shrink-0 rounded-[0.8cqh] bg-white px-[1cqh] py-[0.75cqh] text-right font-bold text-[#17365f] ring-1 ring-[#d3e2f2]">
                {r.value}
              </span>
            </motion.div>
          ))}
        </div>
        <NextButton label="Estimate Value" />
      </div>
    </>
  );
}

function EstimateCessScreen({ reduce }: { reduce: boolean }) {
  const value = useCountUp(EST_VALUE, 0.8, reduce);
  const total = useCountUp(TOTAL, 1.6, reduce);
  return (
    <>
      <AppBar title="Estimate & CESS" />
      <div className="flex min-h-0 flex-1 flex-col gap-[0.9cqh] px-[4.5%] pt-[1.3cqh] pb-[1.4cqh]">
        <ProjectCard />
        <div className="flex min-h-0 flex-1 flex-col justify-evenly">
          <ScreenSection title="Estimation Parameters" Icon={Calculator} tone="#1d66dc" />
          {ESTIMATE_ROWS.map(([k, v]) => (
            <p key={k} className="flex items-center justify-between gap-[1cqh] border-b border-[#eef2f7] pb-[0.7cqh] text-[1.95cqh] leading-none">
              <span className="font-semibold text-[#3f5b7c]">{k}</span>
              <span className="font-bold whitespace-nowrap text-[#17365f]">{v}</span>
            </p>
          ))}
          <div className="flex items-center gap-[1.1cqh] rounded-[1.4cqh] bg-[linear-gradient(135deg,#e6f0fd,#e3f6fb)] px-[1.3cqh] py-[1.1cqh] ring-1 ring-[#cfe0f5]">
            <Buildings weight="fill" className="size-[4.2cqh] shrink-0 text-[#1d66dc]" />
            <div className="min-w-0 flex-1 text-center leading-none">
              <p className="text-[1.74cqh] font-bold text-[#123a6e]">Estimated Construction Value</p>
              <p className="font-display mt-[0.5cqh] text-[2.9cqh] font-black whitespace-nowrap text-[#1552c4] tabular-nums">{inr(value)}</p>
              <p className="mt-[0.4cqh] text-[1.56cqh] font-semibold text-[#5b7390]">(₹ 20.00 Crore)</p>
            </div>
          </div>
          <motion.p
            className="flex items-center justify-center gap-[0.6cqh] text-[1.8cqh] leading-none font-bold text-[#1d66dc]"
            animate={reduce ? undefined : { y: [0, 2, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown weight="bold" className="size-[2.3cqh]" />
            CESS at 1%
          </motion.p>
          <div className="rounded-[1.4cqh] bg-[#e3f6ea] px-[1.3cqh] py-[1.2cqh] text-center ring-1 ring-[#c4e8d1]">
            <p className="text-[1.95cqh] leading-none font-bold text-[#12804a]">Total Demand Amount</p>
            <p className="mt-[0.7cqh] flex items-center justify-center gap-[1cqh]">
              <span className="grid size-[4.4cqh] place-items-center rounded-full bg-[#18a058] text-white">
                <CurrencyInr weight="bold" className="size-[60%]" />
              </span>
              <span className="font-display text-[3.6cqh] leading-none font-black whitespace-nowrap text-[#0f6e3f] tabular-nums">
                {inr(total)}
              </span>
            </p>
            <p className="mt-[0.6cqh] text-[1.6cqh] leading-none font-semibold text-[#5b7390]">(Rupees Twenty Lakh Only)</p>
          </div>
        </div>
        <NextButton label="Generate Demand Notice" />
      </div>
    </>
  );
}

function NoticeScreen({ reduce }: { reduce: boolean }) {
  return (
    <>
      <AppBar title="Demand Notice Preview" compact />
      <div className="flex min-h-0 flex-1 flex-col gap-[0.9cqh] px-[4.5%] pt-[1.3cqh] pb-[1.4cqh]">
        <ProjectCard />
        <div className="relative flex min-h-0 flex-1 flex-col justify-evenly rounded-[1.3cqh] bg-white px-[4.5%] py-[0.8cqh] shadow-[0_2px_10px_rgba(20,50,100,0.08)] ring-1 ring-[#e0e9f4]">
          <div className="flex items-center gap-[1cqh]">
            <img src={karnatakaEmblem} alt="" draggable={false} className="h-[5.4cqh] w-auto shrink-0" />
            <p className="text-[1.56cqh] leading-[1.2] font-extrabold tracking-[0.01em] text-[#123a6e] uppercase">
              Karnataka Building and Other Construction Workers Welfare Board
            </p>
          </div>
          <motion.p
            initial={reduce ? false : { opacity: 0, scale: 1.6, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.45, delay: 0.8, ease }}
            className="rounded-[0.8cqh] bg-[#fde7e7] py-[0.7cqh] text-center font-display text-[2.34cqh] leading-none font-black tracking-[0.04em] text-[#d12a2a] ring-1 ring-[#f6c3c3]"
          >
            DEMAND NOTICE
          </motion.p>
          <div className="space-y-[0.55cqh]">
            {NOTICE_ROWS.map(([k, v]) => (
              <p key={k} className="grid grid-cols-[34%_minmax(0,1fr)] text-[1.74cqh] leading-tight">
                <span className="font-semibold text-[#5b7390]">{k}</span>
                <span className="truncate font-bold text-[#17365f]">: {v}</span>
              </p>
            ))}
          </div>
          <p className="text-[1.56cqh] leading-snug font-semibold text-[#5b7390]">
            As per the assessment conducted, the Labour CESS amount payable is:
          </p>
          <div className="rounded-[1cqh] bg-[#fdecec] py-[0.9cqh] text-center ring-1 ring-[#f6c9c9]">
            <p className="font-display text-[3.36cqh] leading-none font-black text-[#d12a2a]">₹ 20,00,000</p>
            <p className="mt-[0.4cqh] text-[1.5cqh] leading-none font-semibold text-[#6b7b90]">(Rupees Twenty Lakh Only)</p>
          </div>
          <p className="grid grid-cols-[34%_minmax(0,1fr)] text-[1.8cqh] leading-none">
            <span className="font-semibold text-[#5b7390]">Due Date</span>
            <span className="font-bold text-[#17365f]">: 14 Feb 2025</span>
          </p>
        </div>
        <NextButton label="Issue Notice" />
      </div>
    </>
  );
}

function IssuedScreen({ reduce }: { reduce: boolean }) {
  return (
    <>
      <AppBar title="Notice Issued" />
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-[1cqh] px-[4.5%] pt-[1.6cqh] pb-[1.4cqh]">
        <div className="flex shrink-0 flex-col items-center text-center">
          <span className="relative grid size-[9.2cqh] place-items-center rounded-full bg-[#e3f6ea]">
            {!reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full ring-2 ring-[#34c77b]"
                animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: 1.1, ease: "easeOut" }}
              />
            )}
            <motion.span
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 320, damping: 14 }}
              className="grid size-[6.44cqh] place-items-center rounded-full bg-[linear-gradient(135deg,#0f8a4c,#2fc57a)] text-white shadow-[0_6px_14px_rgba(15,138,76,0.35)]"
            >
              <Check weight="bold" className="size-[55%]" />
            </motion.span>
          </span>
          <p className="font-display mt-[1cqh] text-[2.76cqh] leading-tight font-extrabold text-[#0f6e3f]">
            Demand Notice
            <br />
            Generated Successfully
          </p>
        </div>

        <div className="shrink-0 divide-y divide-[#eef2f7] rounded-[1.3cqh] bg-white px-[4%] ring-1 ring-[#e0e9f4]">
          {ISSUED_ROWS.map(([k, v]) => (
            <p key={k} className="grid grid-cols-[38%_minmax(0,1fr)] py-[0.85cqh] text-[1.8cqh] leading-none">
              <span className="font-semibold text-[#5b7390]">{k}</span>
              <span className="font-bold leading-tight text-[#17365f]">{v}</span>
            </p>
          ))}
        </div>

        <div className="flex shrink-0 flex-col gap-[0.8cqh]">
          {ACTIONS.map((a, i) => (
            <motion.p
              key={a.label}
              initial={reduce ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 1.0 + i * 0.12, ease }}
              className="flex items-center gap-[1cqh] rounded-[1cqh] bg-white px-[1.4cqh] py-[1cqh] text-[2.04cqh] leading-none font-bold text-[#1d66dc] ring-1 ring-[#bcd4f5]"
            >
              <a.Icon weight="bold" className="size-[2.53cqh] shrink-0" />
              {a.label}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.6, ease }}
          className="flex shrink-0 items-center gap-[1.1cqh] rounded-[1.3cqh] bg-[#e3f6ea] px-[1.6cqh] py-[1.2cqh] ring-1 ring-[#c4e8d1]"
        >
          <span className="grid size-[4.6cqh] shrink-0 place-items-center rounded-full bg-[#18a058] text-white">
            <CloudArrowUp weight="fill" className="size-[60%]" />
          </span>
          <span className="leading-tight">
            <span className="block text-[2.1cqh] font-extrabold text-[#12804a]">Synced to Central Platform</span>
            <span className="block text-[1.68cqh] font-semibold text-[#5b7390]">15 Jan 2025, 11:25 AM</span>
          </span>
        </motion.div>
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
                className="grid size-[3em] shrink-0 place-items-center rounded-full text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] ring-2 ring-white"
                style={{ background: c.grad }}
                animate={{ scale: on ? 1.08 : 1 }}
                transition={{ duration: 0.35, ease }}
              >
                <c.Icon weight="fill" className="size-[50%]" />
              </motion.span>
              <div className="min-w-0">
                <p className="font-display text-[length:var(--gs-16)] leading-tight font-extrabold text-[#123a6e]">{c.title}</p>
                <p className="mt-[0.3em] leading-snug font-semibold text-[#3f5b7c]">{c.body}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

