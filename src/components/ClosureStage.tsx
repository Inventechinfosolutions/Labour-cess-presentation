import { useEffect, useState, type ReactNode } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowsClockwise,
  Bank,
  Bell,
  Buildings,
  CalendarBlank,
  CaretDown,
  CaretRight,
  Check,
  CheckCircle,
  ClipboardText,
  Clock,
  DeviceMobile,
  EnvelopeSimple,
  Eye,
  FileText,
  House,
  MagnifyingGlass,
  PencilSimple,
  SealCheck,
  ShieldCheck,
  User,
  UsersThree,
  Wallet,
  WarningCircle,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Gloss, Orb3D, slab3D, tileStyle } from "@/components/Depth";
import siteThumb from "@/assets/prj-site-photo.jpg";
import imgDetect from "@/assets/closure-detect.jpg";
import imgAssign from "@/assets/closure-assign.jpg";
import imgResolve from "@/assets/closure-resolve.jpg";
import imgVerify from "@/assets/closure-verify.jpg";
import imgOffice from "@/assets/closure-office.jpg";
import imgOffice2 from "@/assets/closure-office-2.jpg";

const INK = "#0b2462";
const RED = "#e5484d";
const ease = [0.22, 1, 0.36, 1] as const;

const STEPS_AT = 2.1;
const STEP_GAP = 0.16;
const CYCLE_AT = 4.4;

type Step = {
  n: string;
  title: string;
  sub: string;
  text: string;
  c: string;
  soft: string;
  Icon: CessIcon;
  img: string;
  screen: "right" | "centre";
};

const STEPS: Step[] = [
  {
    n: "1",
    title: "DETECT",
    sub: "Potential exception found",
    text: "The platform flags a potential exception. It uses data checks and rules.",
    c: "#e5484d",
    soft: "#fff1f1",
    Icon: WarningCircle,
    img: imgDetect,
    screen: "right",
  },
  {
    n: "2",
    title: "NOTIFY",
    sub: "Alert and reminder",
    text: "An alert and a reminder go to the officer and the agency.",
    c: "#f59e0b",
    soft: "#fff7e8",
    Icon: Bell,
    img: imgOffice,
    screen: "centre",
  },
  {
    n: "3",
    title: "ASSIGN",
    sub: "Route to the officer",
    text: "The case goes to the officer for that territory and role.",
    c: "#2f7df0",
    soft: "#edf4ff",
    Icon: UsersThree,
    img: imgAssign,
    screen: "right",
  },
  {
    n: "4",
    title: "RESOLVE",
    sub: "Follow up and act",
    text: "The officer follows up with the agency. The reply and papers are saved.",
    c: "#8b5cf6",
    soft: "#f4f0ff",
    Icon: ClipboardText,
    img: imgResolve,
    screen: "right",
  },
  {
    n: "5",
    title: "VERIFY",
    sub: "Check and match",
    text: "The remittance is verified. It is matched with Board records.",
    c: "#0ea5b7",
    soft: "#e9f9fb",
    Icon: ShieldCheck,
    img: imgVerify,
    screen: "right",
  },
  {
    n: "6",
    title: "CLOSE",
    sub: "Exception closed",
    text: "The case is closed. Full history stays on the project file.",
    c: "#16a34a",
    soft: "#ecfaf1",
    Icon: CheckCircle,
    img: imgOffice2,
    screen: "centre",
  },
];

const KPIS: { title: string; value: string; Icon: CessIcon; c: string; hot?: boolean }[] = [
  { title: "Total Projects", value: "1,248", Icon: Buildings, c: "#2f7df0" },
  { title: "Total CESS Due", value: "₹ 482 Cr", Icon: FileText, c: "#8b5cf6" },
  { title: "Total Remitted", value: "₹ 368 Cr", Icon: Wallet, c: "#16a34a" },
  { title: "Open Exceptions", value: "24", Icon: WarningCircle, c: RED, hot: true },
];

const ROWS: { project: string; agency: string; type: string; amount: string; status: "Open" | "In Review"; on?: boolean }[] = [
  { project: "ABC Commercial Complex", agency: "BDA", type: "Remittance Overdue", amount: "₹ 24,50,000", status: "Open", on: true },
  { project: "XYZ Housing Project", agency: "BBMP", type: "Amount Mismatch", amount: "₹ 12,30,000", status: "Open" },
  { project: "Metro Extension", agency: "BMRCL", type: "Unmatched Record", amount: "₹ 8,75,000", status: "Open" },
  { project: "Tech Park Phase 3", agency: "KIADB", type: "Assessment Not Filed", amount: "₹ 15,60,000", status: "In Review" },
];

const NAV: { label: string; Icon: CessIcon; badge?: string }[] = [
  { label: "Dashboard", Icon: House },
  { label: "Projects", Icon: Buildings },
  { label: "Assessments", Icon: ClipboardText },
  { label: "Collections", Icon: Wallet },
  { label: "Remittances", Icon: Bank },
  { label: "Exceptions", Icon: WarningCircle, badge: "24" },
  { label: "Reports", Icon: FileText },
];

const DETAILS: { k: string; v: string; hot?: boolean }[] = [
  { k: "Agency", v: "BDA" },
  { k: "Location", v: "Bengaluru Urban" },
  { k: "CESS Deducted", v: "₹ 24,50,000" },
  { k: "Remitted", v: "₹ 0" },
  { k: "Outstanding", v: "₹ 24,50,000", hot: true },
  { k: "Due Date", v: "10 Aug 2025", hot: true },
  { k: "Status", v: "Open", hot: true },
];

const ACTIONS: { label: string; Icon: CessIcon; primary?: boolean }[] = [
  { label: "Take Action", Icon: ShieldCheck, primary: true },
  { label: "View Documents", Icon: FileText },
  { label: "View History", Icon: Clock },
  { label: "Add Remarks", Icon: PencilSimple },
];

export function ClosureStage() {
  const reduce = !!useReducedMotion();
  const active = useCycle(reduce);

  return (
    <div className="relative grid h-full min-h-0 grid-rows-[minmax(0,40fr)_minmax(0,50fr)_auto] gap-3.5 text-[#23395f]">
      <div className="grid min-h-0 grid-cols-[minmax(0,1.32fr)_34px_minmax(0,0.92fr)] items-stretch">
        <DashboardCard reduce={reduce} />
        <FlowArrow reduce={reduce} />
        <DetailsCard reduce={reduce} />
      </div>

      <div className="relative min-h-0">
        <DownElbow reduce={reduce} />
        <div className="grid h-full min-h-0 grid-cols-6 gap-3.5">
          {STEPS.map((s, i) => (
            <StepCard key={s.n} step={s} index={i} active={active === i} reduce={reduce} />
          ))}
        </div>
      </div>

      <EscalationBar reduce={reduce} />
    </div>
  );
}

function useCycle(reduce: boolean) {
  const [active, setActive] = useState(-1);
  useEffect(() => {
    if (reduce) return;
    let i = -1;
    let iv = 0;
    const start = window.setTimeout(() => {
      iv = window.setInterval(() => {
        i = (i + 1) % STEPS.length;
        setActive(i);
      }, 1700);
    }, CYCLE_AT * 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(iv);
    };
  }, [reduce]);
  return active;
}

function useCount(target: number, reduce: boolean, delay: number) {
  const [v, setV] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) return setV(target);
    const c = animate(0, target, { duration: 1.2, delay, ease, onUpdate: setV });
    return () => c.stop();
  }, [target, reduce, delay]);
  return v;
}

function CountText({ value, reduce, delay }: { value: string; reduce: boolean; delay: number }) {
  const m = value.match(/^(\D*)([\d,]+)(.*)$/);
  const n = useCount(m ? Number(m[2].replace(/,/g, "")) : 0, reduce, delay);
  if (!m) return <>{value}</>;
  return (
    <>
      {m[1]}
      {Math.round(n).toLocaleString("en-IN")}
      {m[3]}
    </>
  );
}

/* ------------------------------------------------------------------ dashboard */

function Card({ children, className, delay, reduce, from = "left" }: { children: ReactNode; className?: string; delay: number; reduce: boolean; from?: "left" | "right" }) {
  return (
    <motion.section
      className={cn(
        "relative min-h-0 overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_60%,#f4f8fd_100%)] shadow-[inset_0_1px_0_#ffffff,0_3px_0_#dce7f4,0_16px_30px_-12px_rgba(22,60,120,0.28)] ring-1 ring-[#e2ecf7]",
        className,
      )}
      initial={reduce ? false : { opacity: 0, x: from === "left" ? -22 : 22 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </motion.section>
  );
}

function DashboardCard({ reduce }: { reduce: boolean }) {
  return (
    <Card reduce={reduce} delay={0} className="grid grid-cols-[136px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col bg-[linear-gradient(180deg,#0a2a63_0%,#06204d_60%,#041a40_100%)] px-2 py-2.5 text-white">
        <span className="mb-1.5 flex items-center gap-1 px-1 text-[8.5px] font-extrabold tracking-[0.08em] whitespace-nowrap text-[#8fb4ec] uppercase">
          <CaretRight weight="bold" className="size-3 rotate-180" />
          Central Platform
        </span>
        <nav className="flex flex-col gap-[3px]">
          {NAV.map((n, i) => (
            <span
              key={n.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-[5px] text-[10px] font-semibold",
                i === 0 ? "bg-[linear-gradient(90deg,#2f7df0,#1f5fd6)] shadow-[0_5px_14px_rgba(31,95,214,0.45)]" : "text-[#c9dafa]",
              )}
            >
              <n.Icon weight={i === 0 ? "fill" : "regular"} className="size-3.5 shrink-0" />
              <span className="truncate">{n.label}</span>
              {n.badge ? (
                <motion.span
                  className="ml-auto grid h-4 min-w-4 place-items-center rounded-full bg-[#ef4444] px-1 text-[8px] font-black"
                  animate={reduce ? undefined : { scale: [1, 1.18, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: 1 }}
                >
                  {n.badge}
                </motion.span>
              ) : null}
            </span>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-0 flex-col gap-2 p-2.5">
        <header className="flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-black" style={{ color: INK }}>
            CESS Compliance Dashboard
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-[9px] font-bold ring-1 ring-[#dbe7f5]" style={{ color: INK }}>
            <CalendarBlank weight="bold" className="size-3 text-[#2f7df0]" />
            01 Apr 2024 – 30 Sep 2025
            <CaretDown weight="bold" className="size-2.5" />
          </span>
        </header>

        <div className="grid grid-cols-4 gap-2">
          {KPIS.map((k, i) => (
            <motion.div
              key={k.title}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5"
              style={{ background: k.hot ? "linear-gradient(180deg,#fff5f5,#ffe6e7)" : "#fff", boxShadow: slab3D(k.c) }}
              initial={reduce ? false : { opacity: 0, y: 10, rotateX: -25 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease }}
            >
              <Orb3D c={k.c} Icon={k.Icon} className="size-7" iconClassName="size-3.5" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[8.5px] font-semibold text-[#64748b]">{k.title}</span>
                <b className="block text-[15px] font-black" style={{ color: k.hot ? RED : INK }}>
                  <CountText value={k.value} reduce={reduce} delay={0.3 + i * 0.08} />
                </b>
              </span>
            </motion.div>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-white/90 p-2 ring-1 ring-[#e2ecf7]">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <b className="text-[11.5px] font-black" style={{ color: INK }}>
              Recent Exceptions
            </b>
            <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-[#f5f8fc] px-2 py-1 text-[8.5px] text-[#94a3b8] ring-1 ring-[#e8eef6]">
              <MagnifyingGlass className="size-3" />
              Search project, agency or type
            </span>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#2f7df0]">
              View All <CaretRight weight="bold" className="size-2.5" />
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg ring-1 ring-[#eef2f8]">
            <div className="grid grid-cols-[1.6fr_0.6fr_1.3fr_0.9fr_0.6fr_0.6fr] bg-[#f1f7ff] px-2 py-1 text-[8.5px] font-black text-[#183b70]">
              <span>Project Name</span>
              <span>Agency</span>
              <span>Exception Type</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {ROWS.map((r, i) => (
              <motion.div
                key={r.project}
                className={cn(
                  "relative grid grid-cols-[1.6fr_0.6fr_1.3fr_0.9fr_0.6fr_0.6fr] items-center border-t border-[#eef2f8] px-2 py-[5px] text-[9px]",
                  r.on && "bg-[#fff3f4]",
                )}
                initial={reduce ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.5 + i * 0.07 }}
              >
                {r.on && !reduce ? (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-[#f3a3a6]"
                    animate={{ opacity: [0, 1, 0.4, 1] }}
                    transition={{ delay: 0.95, duration: 1.4 }}
                  />
                ) : r.on ? (
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-[#f3a3a6]" />
                ) : null}
                <b className="truncate font-bold text-[#17366b]">{r.project}</b>
                <span className="text-[#475569]">{r.agency}</span>
                <span className="truncate text-[#475569]">{r.type}</span>
                <b className="font-bold text-[#17366b]">{r.amount}</b>
                <span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-[1px] text-[8px] font-black",
                      r.status === "Open" ? "bg-[#fee2e2] text-[#dc2626]" : "bg-[#ffedd5] text-[#ea580c]",
                    )}
                  >
                    {r.status}
                  </span>
                </span>
                <span className="relative">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-[2px] text-[8.5px] font-black",
                      r.on ? "bg-[#2f7df0] text-white shadow-[0_3px_8px_rgba(47,125,240,0.45)]" : "bg-white text-[#2f7df0] ring-1 ring-[#dbe7f5]",
                    )}
                  >
                    View
                  </span>
                  {r.on ? <Pointer reduce={reduce} /> : null}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function Pointer({ reduce }: { reduce: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute top-[9px] left-[22px] z-10"
      initial={reduce ? false : { x: 40, y: 30, opacity: 0 }}
      animate={reduce ? undefined : { x: [40, 0, 0], y: [30, 0, 0], opacity: [0, 1, 1], scale: [1, 1, 0.82, 1] }}
      transition={{ delay: 0.9, duration: 1, times: [0, 0.6, 1] }}
    >
      {!reduce && (
        <motion.span
          className="absolute -top-1 -left-1 size-3 rounded-full bg-[#2f7df0]/40"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2.4], opacity: [0.8, 0] }}
          transition={{ delay: 1.6, duration: 0.6 }}
        />
      )}
      <svg viewBox="0 0 16 20" className="relative size-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]">
        <path d="M1 1 L1 15 L5 11.5 L8 18 L10.5 17 L7.6 10.6 L13 10.6 Z" fill="#fff" stroke="#0b2462" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </motion.span>
  );
}

function FlowArrow({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 34 20" className="w-full overflow-visible">
        <motion.path
          d="M2 10 H26"
          stroke="#2f7df0"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="4 4"
          fill="none"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.45, duration: 0.4 }}
        />
        <motion.path
          d="M24 4 L32 10 L24 16"
          stroke="#2f7df0"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={reduce ? false : { opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.8, duration: 0.25 }}
        />
        {!reduce && (
          <circle r="2.6" fill="#2f7df0">
            <animateMotion dur="1.4s" begin="2.2s" repeatCount="indefinite" path="M2 10 H28" />
          </circle>
        )}
      </svg>
    </div>
  );
}

function DetailsCard({ reduce }: { reduce: boolean }) {
  return (
    <Card reduce={reduce} delay={1.65} from="right" className="flex flex-col">
      <header className="relative flex shrink-0 items-center justify-between overflow-hidden bg-[linear-gradient(180deg,#1a4bb0_0%,#123a8f_45%,#0b2462_100%)] px-3 py-2 text-white">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0))]" />
        <b className="relative text-[13px] font-black">Exception Details</b>
        <span className="relative font-mono text-[9px] text-[#a9c4f0]">PRJ-000245</span>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)_minmax(0,0.85fr)] gap-2.5 p-2.5">
        <div className="relative min-h-0 overflow-hidden rounded-xl shadow-[0_8px_16px_-6px_rgba(11,36,98,0.45)] ring-2 ring-white">
          <img src={siteThumb} alt="ABC Commercial Complex site" className="h-full w-full object-cover" draggable={false} />
          <span className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(6,20,52,0.75),transparent)] px-2 pt-4 pb-1 text-[8.5px] font-bold text-white">
            Site photo · 15 Jan 2025
          </span>
        </div>
        <div className="flex min-h-0 flex-col">
          <b className="text-[13px] leading-tight font-black" style={{ color: INK }}>
            ABC Commercial Complex
          </b>
          <motion.span
            className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-[#fff1f1] px-1.5 py-[3px] text-[9.5px] font-black text-[#dc2626] ring-1 ring-[#fecaca]"
            animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 2.4 }}
          >
            <WarningCircle weight="fill" className="size-3.5" />
            Remittance Overdue
          </motion.span>
          <dl className="mt-1.5 flex min-h-0 flex-1 flex-col justify-between">
            {DETAILS.map((d, i) => (
              <motion.div
                key={d.k}
                className="grid grid-cols-[86px_minmax(0,1fr)] text-[9.5px]"
                initial={reduce ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.9 + i * 0.05, duration: 0.3 }}
              >
                <dt className={cn("font-semibold", d.hot ? "font-extrabold text-[#17366b]" : "text-[#64748b]")}>{d.k}</dt>
                <dd className={cn("truncate font-bold", d.hot ? "text-[#dc2626]" : "text-[#17366b]")}>: {d.v}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
        <div className="flex min-h-0 flex-col justify-center gap-1.5 border-l border-[#eef2f8] pl-2.5">
          {ACTIONS.map((a, i) => (
            <motion.span
              key={a.label}
              className={cn(
                "relative flex items-center gap-1.5 overflow-hidden rounded-lg px-2 py-[7px] text-[9.5px] font-black",
                a.primary ? "text-white" : "bg-white text-[#17366b] ring-1 ring-[#dbe7f5]",
              )}
              style={a.primary ? { ...tileStyle("#2f7df0") } : undefined}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 + i * 0.06, duration: 0.3 }}
            >
              {a.primary ? <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.3),transparent)]" /> : null}
              <a.Icon weight={a.primary ? "fill" : "bold"} className="relative size-3.5 shrink-0" />
              <span className="relative truncate">{a.label}</span>
            </motion.span>
          ))}
        </div>
      </div>
    </Card>
  );
}

function DownElbow({ reduce }: { reduce: boolean }) {
  return (
    <svg aria-hidden className="pointer-events-none absolute -top-3.5 right-[27%] z-10 h-3.5 w-4 overflow-visible" viewBox="0 0 16 14">
      <motion.path
        d="M8 -2 V10"
        stroke="#2f7df0"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: STEPS_AT - 0.2, duration: 0.25 }}
      />
      <motion.path
        d="M3 7 L8 13 L13 7"
        stroke="#2f7df0"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STEPS_AT, duration: 0.2 }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ lifecycle */

function StepCard({ step, index, active, reduce }: { step: Step; index: number; active: boolean; reduce: boolean }) {
  const delay = STEPS_AT + index * STEP_GAP;
  return (
    <motion.div
      className="relative min-h-0"
      initial={reduce ? false : { opacity: 0, y: 22, rotateX: -18 }}
      animate={{ opacity: 1, y: active ? -4 : 0, rotateX: 0 }}
      transition={{ duration: 0.5, delay: active ? 0 : delay, ease }}
      style={{ transformPerspective: 800 }}
    >
      <div
        className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white transition-shadow duration-300"
        style={{
          boxShadow: active
            ? `inset 0 1px 0 #fff, 0 0 0 2px ${step.c}, 0 4px 0 ${step.c}55, 0 20px 30px -12px ${step.c}88`
            : `inset 0 1px 0 #fff, 0 0 0 1px ${step.c}26, 0 3px 0 ${step.c}33, 0 14px 24px -12px rgba(22,60,120,0.3)`,
        }}
      >
        <header className="flex shrink-0 items-center gap-2 px-2 py-1.5" style={{ background: `linear-gradient(180deg, ${step.soft}, #fff)` }}>
          <span className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full text-[15px] font-black text-white" style={orbStyleLite(step.c)}>
            <Gloss />
            <span className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">{step.n}</span>
          </span>
          <span className="min-w-0 leading-tight">
            <b className="block text-[13px] font-black tracking-wide" style={{ color: step.c }}>
              {step.title}
            </b>
            <span className="block truncate text-[9px] font-bold text-[#17366b]">{step.sub}</span>
          </span>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <img src={step.img} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-cover object-[20%_center]" />
          <span className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,36,98,0.18),transparent_45%)]" />
          <ScreenMock step={step} index={index} reduce={reduce} delay={delay + 0.25} />
        </div>

        <p className="shrink-0 px-2 py-1.5 text-[10px] leading-snug font-semibold text-[#17366b]">{step.text}</p>
      </div>

      {index < STEPS.length - 1 ? (
        <motion.span
          className="absolute top-[52%] -right-[15px] z-20 grid size-[22px] -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_4px_10px_rgba(11,36,98,0.25)]"
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 380, damping: 16 }}
        >
          <span className="grid size-4 place-items-center rounded-full text-white" style={{ background: `linear-gradient(90deg, ${step.c}, ${STEPS[index + 1].c})` }}>
            <CaretRight weight="bold" className="size-2.5" />
          </span>
        </motion.span>
      ) : null}
    </motion.div>
  );
}

function orbStyleLite(c: string) {
  return {
    background: `radial-gradient(circle at 34% 28%, color-mix(in srgb, ${c} 40%, #fff) 0%, ${c} 50%, color-mix(in srgb, ${c} 62%, #000) 100%)`,
    boxShadow: `inset 0 -3px 5px rgba(0,0,0,0.25), inset 0 2px 3px rgba(255,255,255,0.5), 0 5px 10px -3px color-mix(in srgb, ${c} 65%, transparent)`,
  };
}

function ScreenMock({ step, index, reduce, delay }: { step: Step; index: number; reduce: boolean; delay: number }) {
  const centre = step.screen === "centre";
  return (
    <motion.div
      className={cn("absolute top-1/2 -translate-y-[56%]", centre ? "left-1/2 w-[82%] -translate-x-1/2" : "right-[4%] w-[66%]")}
      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease }}
    >
      <span aria-hidden className="absolute top-full left-1/2 h-[9px] w-[14%] -translate-x-1/2 bg-[linear-gradient(90deg,#1e293b,#475569,#1e293b)]" />
      <span aria-hidden className="absolute top-[calc(100%+8px)] left-1/2 h-[3px] w-[38%] -translate-x-1/2 rounded-full bg-[#334155] shadow-[0_3px_6px_rgba(0,0,0,0.35)]" />
      <div className="aspect-[4/3] overflow-hidden rounded-md bg-[#0f172a] p-[3px] shadow-[0_12px_22px_-6px_rgba(0,0,0,0.6)]">
      <div className="flex h-full flex-col overflow-hidden rounded-[4px] bg-white px-1.5 py-1 text-[7px] leading-tight text-[#17366b]">
        {index === 0 && <DetectScreen />}
        {index === 1 && <NotifyScreen reduce={reduce} delay={delay} />}
        {index === 2 && <AssignScreen />}
        {index === 3 && <ResolveScreen reduce={reduce} delay={delay} />}
        {index === 4 && <VerifyScreen />}
        {index === 5 && <CloseScreen reduce={reduce} delay={delay} />}
      </div>
      </div>
    </motion.div>
  );
}

function DetectScreen() {
  return (
    <div className="flex h-full flex-col justify-center gap-[3px]">
      <span className="flex items-center gap-1">
        <WarningCircle weight="fill" className="size-3.5 shrink-0 text-[#dc2626]" />
        <b className="text-[8px] font-black text-[#dc2626]">Remittance Overdue</b>
      </span>
      <span className="font-semibold">ABC Commercial Complex</span>
      <b className="text-[9.5px] font-black">₹ 24,50,000</b>
      <span className="font-semibold text-[#64748b]">Due: 10 Aug 2025</span>
    </div>
  );
}

function NotifyScreen({ reduce, delay }: { reduce: boolean; delay: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[3px] text-center">
      <span className="relative">
        <EnvelopeSimple weight="fill" className="size-4 text-[#2f7df0]" />
        <motion.span
          className="absolute -top-1 -right-1.5 grid size-2.5 place-items-center rounded-full bg-[#ef4444] text-[6px] font-black text-white"
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: "spring", stiffness: 500, damping: 12 }}
        >
          1
        </motion.span>
      </span>
      <b className="text-[8.5px] font-black" style={{ color: INK }}>
        Alert Sent
      </b>
      <span className="font-semibold">Remittance overdue for ABC Commercial Complex.</span>
      <span className="mt-0.5 flex gap-2 text-[6.5px] font-bold text-[#2f7df0]">
        {[
          { l: "Email", I: EnvelopeSimple },
          { l: "SMS", I: DeviceMobile },
          { l: "In-App", I: Bell },
        ].map(({ l, I }) => (
          <span key={l} className="flex flex-col items-center">
            <I weight="fill" className="size-2.5" />
            {l}
          </span>
        ))}
      </span>
    </div>
  );
}

function AssignScreen() {
  return (
    <div className="flex h-full flex-col gap-[2px]">
      <b className="text-[7.5px] font-black text-[#2f7df0]">Assign Exception</b>
      {[
        ["Project", "ABC Commercial"],
        ["Agency", "BDA"],
        ["Territory", "Bengaluru Urban"],
      ].map(([k, v]) => (
        <span key={k} className="grid grid-cols-[34px_1fr] gap-0.5">
          <span className="text-[#64748b]">{k}</span>
          <b className="truncate font-bold">{v}</b>
        </span>
      ))}
      <span className="flex items-center gap-1 rounded bg-[#edf4ff] px-1 py-[1px]">
        <User weight="fill" className="size-2.5 text-[#2f7df0]" />
        <b className="font-black">R. Kumar</b>
      </span>
      <span className="mt-auto rounded bg-[#2f7df0] py-[1px] text-center text-[7px] font-black text-white">Assign</span>
    </div>
  );
}

function ResolveScreen({ reduce, delay }: { reduce: boolean; delay: number }) {
  const items = ["Agency contacted", "Details requested", "Reply received", "Papers uploaded"];
  return (
    <div className="flex h-full flex-col gap-[2px]">
      <b className="text-[7.5px] font-black text-[#8b5cf6]">Action in Progress</b>
      {items.map((t, i) => (
        <motion.span
          key={t}
          className="flex items-center gap-1"
          initial={reduce ? false : { opacity: 0, x: 4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.2 + i * 0.12 }}
        >
          <span className={cn("grid size-2.5 shrink-0 place-items-center rounded-full text-white", i < 3 ? "bg-[#16a34a]" : "bg-[#cbd5e1]")}>
            <Check weight="bold" className="size-1.5" />
          </span>
          <span className="truncate font-semibold">{t}</span>
        </motion.span>
      ))}
    </div>
  );
}

function VerifyScreen() {
  return (
    <div className="flex h-full flex-col gap-[2px]">
      <b className="text-[7.5px] font-black text-[#0e7490]">Verify Remittance</b>
      <span className="flex items-center gap-1 font-black text-[#16a34a]">
        <CheckCircle weight="fill" className="size-3" />
        Payment Received
      </span>
      {[
        ["Amount", "₹ 24,50,000"],
        ["Date", "20 Aug 2025"],
        ["Ref.", "RTGS/098765"],
      ].map(([k, v]) => (
        <span key={k} className="grid grid-cols-[28px_1fr] gap-0.5">
          <span className="text-[#64748b]">{k}</span>
          <b className="truncate font-bold">{v}</b>
        </span>
      ))}
      <span className="mt-auto rounded bg-[#16a34a] py-[1px] text-center text-[7px] font-black text-white">Mark as Verified</span>
    </div>
  );
}

function CloseScreen({ reduce, delay }: { reduce: boolean; delay: number }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-[3px] text-center">
      <motion.span
        className="grid size-6 place-items-center rounded-full text-white"
        style={orbStyleLite("#16a34a")}
        initial={reduce ? false : { scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: delay + 0.3, type: "spring", stiffness: 380, damping: 14 }}
      >
        <SealCheck weight="fill" className="size-4" />
      </motion.span>
      <b className="text-[8.5px] font-black text-[#15803d]">Exception Closed</b>
      <span className="font-semibold">ABC Commercial Complex. Remittance verified and closed.</span>
    </div>
  );
}

/* ------------------------------------------------------------------ escalation */

function EscalationBar({ reduce }: { reduce: boolean }) {
  const at = STEPS_AT + STEPS.length * STEP_GAP + 0.3;
  return (
    <motion.section
      className="relative flex items-center gap-3 rounded-2xl bg-[linear-gradient(90deg,#fff1f1_0%,#ffffff_45%,#fff1f1_100%)] px-3 py-2 shadow-[inset_0_1px_0_#fff,0_3px_0_#fde2e2,0_12px_22px_-12px_rgba(229,72,77,0.4)] ring-1 ring-[#fde2e2]"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: at, duration: 0.45, ease }}
    >
      <span className="flex shrink-0 items-center gap-2">
        <span className="relative">
          <Orb3D c={RED} Icon={Clock} className="size-9" iconClassName="size-5" />
          {!reduce && (
            <motion.span
              className="absolute inset-0 rounded-full ring-2 ring-[#e5484d]"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: at + 0.4 }}
            />
          )}
        </span>
        <span className="leading-tight">
          <b className="block text-[13px] font-black tracking-wide text-[#dc2626]">ESCALATION</b>
          <span className="block text-[9.5px] font-semibold text-[#17366b]">If no action within the set timeline</span>
        </span>
      </span>

      <Dash reduce={reduce} delay={at + 0.3} />
      <EscChip Icon={UsersThree} top="Escalate to" bottom="Higher Authority" reduce={reduce} delay={at + 0.55} />
      <Dash reduce={reduce} delay={at + 0.7} />
      <EscChip Icon={ArrowsClockwise} top="Follow up" bottom="and Monitor" reduce={reduce} delay={at + 0.9} />
      <Dash reduce={reduce} delay={at + 1.05} />

      <motion.span
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#fee2e2] px-3 py-1.5 text-[9.5px] font-black text-[#dc2626]"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: at + 1.2, duration: 0.3 }}
      >
        <Eye weight="bold" className="size-3.5" />
        Timeline tracked
      </motion.span>

      <svg aria-hidden className="pointer-events-none absolute -top-3.5 right-[7.5%] h-3.5 w-4 overflow-visible" viewBox="0 0 16 14">
        <motion.path
          d="M8 14 V2"
          stroke={RED}
          strokeWidth="2"
          strokeDasharray="3 3"
          fill="none"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: at + 1.3, duration: 0.3 }}
        />
        <path d="M3 6 L8 0 L13 6" stroke={RED} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </motion.section>
  );
}

function Dash({ reduce, delay }: { reduce: boolean; delay: number }) {
  return (
    <span aria-hidden className="flex min-w-6 flex-1 items-center">
      <motion.span
        className="h-0 flex-1 origin-left border-t-2 border-dashed border-[#f19a9d]"
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay, duration: 0.4 }}
      />
      <CaretRight weight="bold" className="-ml-1 size-3.5 shrink-0 text-[#e5484d]" />
    </span>
  );
}

function EscChip({ Icon, top, bottom, reduce, delay }: { Icon: CessIcon; top: string; bottom: string; reduce: boolean; delay: number }) {
  return (
    <motion.span
      className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-1.5 shadow-[0_2px_0_#fde2e2,0_8px_14px_-8px_rgba(229,72,77,0.45)] ring-1 ring-[#fde2e2]"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease }}
    >
      <span className="relative grid size-7 place-items-center overflow-hidden rounded-lg text-white" style={tileStyle(RED)}>
        <Icon weight="fill" className="relative size-4" />
      </span>
      <span className="text-[10.5px] leading-tight font-black text-[#17366b]">
        {top}
        <br />
        {bottom}
      </span>
    </motion.span>
  );
}