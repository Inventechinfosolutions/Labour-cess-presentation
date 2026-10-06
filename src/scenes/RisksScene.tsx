import { useState, type SyntheticEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowRight,
  ArrowsClockwise,
  Bank,
  ChartBar,
  CheckCircle,
  ClipboardText,
  Database,
  Files,
  GearSix,
  Hourglass,
  Lightning,
  LinkBreak,
  LinkSimple,
  Lock,
  MapTrifold,
  Plugs,
  Scales,
  ShieldCheck,
  User,
  UsersThree,
  WarningCircle,
  X,
} from "@/lib/icons";
import { STAGE_TYPE } from "@/components/GpsEstimationStage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import integrationImg from "@/assets/plan-integration.jpg";
import rulesImg from "@/assets/plan-srs.jpg";
import peopleImg from "@/assets/plan-training.jpg";
import safetyImg from "@/assets/arch-security.jpg";
import stageBg from "@/assets/current-issues-center-bg-wide.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

type Owner = "Board" | "CMS" | "KSDC";

const OWNER_COLOR: Record<Owner, string> = {
  Board: "#1b3f7a",
  CMS: "#c8102e",
  KSDC: "#0e8f9c",
};

const OWNER_ICON: Record<Owner, CessIcon> = {
  Board: Bank,
  CMS: GearSix,
  KSDC: Database,
};

const ROW_ACCENT = ["#d9203f", "#ea6a0c", "#7c4ddb"];

type Risk = {
  title: string;
  impact: string;
  plan: string[];
  owners: Owner[];
  handover?: boolean;
  rfp?: boolean;
  Icon: CessIcon;
};

type Theme = {
  name: string;
  line: string;
  Icon: CessIcon;
  Badge: CessIcon;
  image: string;
  color: string;
  soft: string;
  risks: Risk[];
};

const THEMES: Theme[] = [
  {
    name: "Agencies & Links",
    line: "Agencies must report and link on time.",
    Icon: Plugs,
    Badge: LinkSimple,
    image: integrationImg,
    color: "#1d66dc",
    soft: "#e8f1fd",
    risks: [
      {
        title: "Agencies do not report or link",
        impact: "CESS may go uncollected, leading to revenue loss.",
        plan: ["Government order makes reporting mandatory", "Regular dues statements (DCB)", "Agency scorecards and escalation"],
        owners: ["Board", "CMS"],
        rfp: true,
        Icon: LinkBreak,
      },
      {
        title: "Agency systems are not ready",
        impact: "Phase 3 may slip, affecting timelines and data flow.",
        plan: ["Link through KMDS, e-Swathu, Panchatantra", "Periodic file transfer meanwhile", "Track each dependency"],
        owners: ["CMS"],
        Icon: Plugs,
      },
      {
        title: "KSK link access is delayed",
        impact: "Payment updates are delayed, affecting reconciliation.",
        plan: ["KSK link details and test setup in Month 1", "Practice links so our build never waits"],
        owners: ["Board", "CMS"],
        handover: true,
        Icon: Hourglass,
      },
    ],
  },
  {
    name: "Rules & Data",
    line: "Rules must be clear. Data must be clean.",
    Icon: Scales,
    Badge: ClipboardText,
    image: rulesImg,
    color: "#6b35d6",
    soft: "#f0eafd",
    risks: [
      {
        title: "CESS business rules are unclear",
        impact: "Wrong demands may lead to appeals and delays.",
        plan: ["Signed business rules in the SRS", "All rates and slabs can be changed", "Later changes through change control"],
        owners: ["Board", "CMS"],
        Icon: Scales,
      },
      {
        title: "Duplicate or mismatched projects",
        impact: "A project may be billed twice or missed.",
        plan: ["Details checked before they come in", "Match by location, plan number, GSTIN", "Officer review for exceptions"],
        owners: ["CMS"],
        rfp: true,
        Icon: Files,
      },
    ],
  },
  {
    name: "People & Maps",
    line: "Officers must use it. Maps must be ready.",
    Icon: UsersThree,
    Badge: MapTrifold,
    image: peopleImg,
    color: "#0f8a4c",
    soft: "#e5f6ec",
    risks: [
      {
        title: "Officers do not use the system",
        impact: "The paper process continues and data stays scattered.",
        plan: ["Kannada and English screens", "Mobile app works offline", "Training for about 2,000 users", "On-site helpdesk"],
        owners: ["CMS"],
        rfp: true,
        Icon: UsersThree,
      },
      {
        title: "Map data or imagery is delayed",
        impact: "The territory map stays incomplete in some districts.",
        plan: ["KSRSAC and Bhuvan layers requested in Month 1", "District-by-district rollout", "GPS field points fill gaps"],
        owners: ["Board", "CMS"],
        rfp: true,
        Icon: MapTrifold,
      },
      {
        title: "Key team members leave",
        impact: "Knowledge is lost and support slows down.",
        plan: ["Named backup for each role", "Written operating guides", "Kannada-speaking on-site team"],
        owners: ["CMS"],
        Icon: User,
      },
    ],
  },
  {
    name: "Safety & Continuity",
    line: "The service must stay up and stay safe.",
    Icon: ShieldCheck,
    Badge: Lock,
    image: safetyImg,
    color: "#e0650a",
    soft: "#fdf0e3",
    risks: [
      {
        title: "System downtime or failure",
        impact: "Collections stop until the service is restored.",
        plan: ["Disaster recovery site at KSDC", "Data loss under 1 hour", "Service back within 4 hours", "24×7 monitoring and drills"],
        owners: ["KSDC", "CMS"],
        rfp: true,
        Icon: Lightning,
      },
      {
        title: "Security and privacy of data",
        impact: "The Board faces legal and reputation risk.",
        plan: ["Aadhaar kept only where permitted", "Data is encrypted", "CERT-In security audit before go-live", "DPDP Act compliance"],
        owners: ["CMS"],
        Icon: Lock,
      },
    ],
  },
];

const TOTAL = THEMES.reduce((n, t) => n + t.risks.length, 0);
const OWNER_COUNT = (["CMS", "Board", "KSDC"] as Owner[]).map((o) => ({
  o,
  n: THEMES.reduce((n, t) => n + t.risks.filter((r) => r.owners.includes(o)).length, 0),
}));

const RING_COLORS = Array.from({ length: TOTAL }, (_, i) => {
  const t = i / (TOTAL - 1);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(29, 20)}, ${mix(102, 184)}, ${mix(220, 166)})`;
});

const stop = (e: SyntheticEvent) => e.stopPropagation();

/** Risks and mitigation — one theme per Space; each risk shows its impact, its plan and its owner. */
export function RisksScene({ beat }: { beat: number }) {
  const reduce = !!useReducedMotion();
  const active = Math.min(Math.max(beat, 0), THEMES.length - 1);
  const theme = THEMES[active];
  const covered = THEMES.slice(0, active + 1).reduce((n, t) => n + t.risks.length, 0);
  const last = active === THEMES.length - 1;

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr] gap-2">
      <div
        className="relative grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_10%] gap-y-[1.4%] overflow-hidden rounded-xl px-[1.2%] pt-[1.2%] pb-[0.9%] text-[#122b50] ring-1 ring-white/80"
        style={{
          ...STAGE_TYPE,
          background: `linear-gradient(180deg, rgba(243,248,254,0.55) 0%, rgba(243,248,254,0.25) 55%, rgba(243,248,254,0.1) 100%), url(${stageBg}) center bottom / cover no-repeat, #eef5fd`,
        }}
      >
        <div className="relative grid min-h-0 grid-cols-[15.5%_minmax(0,1fr)_21%] gap-x-[1.2%]">
          <ThemeRail active={active} reduce={reduce} />
          <RiskBoard key={active} theme={theme} reduce={reduce} />
          <div className="flex min-h-0 flex-col gap-[3%]">
            <CoverCard covered={covered} active={active} reduce={reduce} />
            <OwnersCard reduce={reduce} />
          </div>
        </div>

        <FooterBand last={last} active={active} reduce={reduce} />
      </div>
    </div>
  );
}

function ThemeRail({ active, reduce }: { active: number; reduce: boolean }) {
  return (
    <div className="relative flex min-h-0 flex-col text-[length:var(--gs-16)]">
      <div className="relative flex h-[68%] flex-col justify-between pt-[4%]">
        <span aria-hidden className="absolute top-[2.2em] bottom-[1.6em] left-[1.75em] w-[2px] rounded-full bg-[#d5e0ec]" />
        <motion.span
          aria-hidden
          className="absolute top-[2.2em] left-[1.75em] w-[2px] origin-top rounded-full"
          style={{ background: `linear-gradient(180deg, ${THEMES[0].color}, ${THEMES[active].color})` }}
          initial={false}
          animate={{ height: `calc(${(active / (THEMES.length - 1)) * 100}% - ${(active / (THEMES.length - 1)) * 3.8}em)` }}
          transition={{ duration: reduce ? 0 : 0.7, ease }}
        />
        {THEMES.map((t, i) => {
          const on = i === active;
          const done = i < active;
          const reached = i <= active;
          return (
            <motion.div
              key={t.name}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: reduce ? 0 : 0.1 + i * 0.08, ease }}
              className={`relative flex items-center gap-[0.65em] rounded-2xl py-[0.5em] pr-[0.6em] pl-[0.45em] ${on ? "bg-white shadow-[0_10px_24px_rgba(20,60,120,0.12)] ring-1 ring-[#dbe6f3]" : ""}`}
            >
              {on && !reduce && (
                <motion.span
                  aria-hidden
                  className="absolute top-1/2 left-[0.45em] size-[2.6em] -translate-y-1/2 rounded-full"
                  style={{ boxShadow: `0 0 0 3px ${t.color}` }}
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <motion.span
                className="relative z-[1] grid size-[2.6em] shrink-0 place-items-center rounded-full text-white ring-[3px] ring-white"
                animate={{
                  background: reached ? t.color : "#c3cfde",
                  boxShadow: reached ? `0 8px 18px ${t.color}55` : "0 4px 10px rgba(20,50,90,0.12)",
                }}
                transition={{ duration: 0.45, ease }}
              >
                <t.Icon weight="fill" className="size-[46%]" />
                {done && (
                  <span className="absolute -right-[0.25em] -bottom-[0.15em] grid size-[1.15em] place-items-center rounded-full bg-white text-[#16a34a]">
                    <CheckCircle weight="fill" className="size-full" />
                  </span>
                )}
              </motion.span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[length:var(--gs-12)] font-extrabold tracking-[0.06em] uppercase" style={{ color: reached ? t.color : "#8da2bb" }}>
                  Theme {i + 1}
                </span>
                <span className={`font-display block text-[length:var(--gs-16)] font-extrabold ${reached ? "text-[#123a6e]" : "text-[#5b7390]"}`}>{t.name}</span>
                <span className="block text-[length:var(--gs-12)] font-semibold text-[#6b819b]">
                  {t.risks.length} risks · {done ? "covered" : on ? "now" : "next"}
                </span>
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function RiskBoard({ theme, reduce }: { theme: Theme; reduce: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const picked = open === null ? null : theme.risks[open];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white/92 text-[length:var(--gs-16)] shadow-[0_14px_34px_rgba(20,60,120,0.12)] ring-1 ring-[#dbe6f3] backdrop-blur-sm"
    >
      <Banner theme={theme} reduce={reduce} />

      <div className="grid shrink-0 grid-cols-[40%_minmax(0,1fr)_17%] gap-x-[1.6%] px-[2.2%] py-[0.9%] text-[length:var(--gs-12)] font-extrabold tracking-[0.07em] text-[#5b7390] uppercase">
        <span className="pl-[1.2em]">Risk &amp; Impact</span>
        <span className="pl-[1.6em]">Mitigation Plan</span>
        <span className="text-center">Owner &amp; Details</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[1.6%] px-[2.2%] pb-[2%]">
        {theme.risks.map((r, i) => (
          <RiskRow key={r.title} risk={r} theme={theme} i={i} reduce={reduce} onOpen={() => setOpen(i)} />
        ))}
      </div>

      <div className="contents" onClick={stop} onKeyDown={stop}>
        <Dialog open={picked !== null} onOpenChange={(v) => !v && setOpen(null)}>
          <DialogContent className="w-[min(560px,92vw)] bg-white p-0 text-[#123a6e] ring-1 ring-[#dbe6f3]">
            {picked && open !== null && <RiskDetail risk={picked} theme={theme} i={open} onClose={() => setOpen(null)} />}
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}

function Banner({ theme, reduce }: { theme: Theme; reduce: boolean }) {
  return (
    <div className="relative h-[19%] shrink-0 overflow-hidden" style={{ background: `linear-gradient(90deg, ${theme.soft} 0%, #f4f8fe 45%, #ffffff 100%)` }}>
      <motion.img
        src={theme.image}
        alt=""
        aria-hidden
        className="absolute top-0 right-[11%] h-full w-[36%] object-contain object-right mix-blend-multiply"
        initial={reduce ? false : { opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease }}
      />
      <div className="relative z-[1] flex h-full items-center gap-[0.9em] pl-[3%]">
        <motion.span
          className="grid aspect-square h-[62%] shrink-0 place-items-center rounded-full text-white ring-[4px] ring-white"
          style={{ background: theme.color, boxShadow: `0 10px 22px -6px ${theme.color}aa` }}
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={reduce ? undefined : { type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
        >
          <theme.Icon weight="fill" className="size-[48%]" />
        </motion.span>
        <span className="min-w-0 leading-tight">
          <span className="font-display block text-[length:calc(var(--gs-20)*1.3)] font-extrabold text-[#123a6e]">{theme.name}</span>
          <span className="mt-[0.2em] block text-[length:var(--gs-16)] font-semibold text-[#4d6784]">{theme.line}</span>
        </span>
      </div>
      <motion.span
        aria-hidden
        className="absolute right-[4%] bottom-[28%] z-[1] grid aspect-square h-[38%] place-items-center rounded-full bg-[#1b4f9e] text-white ring-[3px] ring-white shadow-[0_8px_18px_rgba(20,60,120,0.3)]"
        initial={reduce ? false : { scale: 0 }}
        animate={reduce ? { scale: 1 } : { scale: 1, y: [0, -4, 0] }}
        transition={reduce ? undefined : { scale: { type: "spring", stiffness: 320, damping: 16, delay: 0.5 }, y: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
      >
        <theme.Badge weight="bold" className="size-[50%]" />
      </motion.span>
    </div>
  );
}

function RiskRow({ risk, theme, i, reduce, onOpen }: { risk: Risk; theme: Theme; i: number; reduce: boolean; onOpen: () => void }) {
  const accent = ROW_ACCENT[i % ROW_ACCENT.length];
  const d = 0.3 + i * 0.4;
  const at = (delay: number, x = 0, y = 0) => (reduce ? {} : { initial: { opacity: 0, x, y }, animate: { opacity: 1, x: 0, y: 0 }, transition: { duration: 0.4, delay, ease } });
  const pairs = risk.plan.length > 3 && theme.risks.length > 2;
  const lines = pairs ? [risk.plan.slice(0, 2), risk.plan.slice(2)] : risk.plan.map((p) => [p]);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[40%_minmax(0,1fr)_17%] gap-x-[1.6%]">
      <motion.div
        {...at(d, -12)}
        className="relative flex min-w-0 items-center gap-[0.8em] overflow-hidden rounded-xl py-[0.5em] pr-[0.8em] pl-[1.1em] shadow-[0_6px_16px_rgba(20,50,90,0.07)] ring-1"
        style={{ background: `linear-gradient(90deg, ${accent}12 0%, #ffffff 75%)`, ["--tw-ring-color" as string]: `${accent}2e` }}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-[4px]" style={{ background: accent }} />
        <span
          className="grid size-[3em] shrink-0 place-items-center rounded-full ring-4 ring-white"
          style={{ background: `${accent}1c`, color: accent, boxShadow: `0 6px 14px ${accent}30` }}
        >
          <risk.Icon weight="fill" className="size-[48%]" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="flex flex-wrap items-center gap-[0.35em]">
            <span className="rounded-md px-[0.5em] py-[0.1em] text-[length:var(--gs-12)] font-extrabold tracking-[0.04em] text-white uppercase" style={{ background: accent }}>
              Risk {i + 1}
            </span>
            {risk.rfp && (
              <span className="rounded-md bg-[#eef3fa] px-[0.5em] py-[0.1em] text-[length:var(--gs-12)] font-bold text-[#4d6784] ring-1 ring-[#d7e3f1]">RFP 12.7</span>
            )}
          </span>
          <span className="font-display mt-[0.3em] block text-[length:var(--gs-18)] font-extrabold text-[#123a6e]">{risk.title}</span>
          <span className="mt-[0.25em] block text-[length:var(--gs-14)] leading-snug font-semibold text-[#c0283f]">{risk.impact}</span>
        </span>
      </motion.div>

      <div className="relative flex min-w-0 items-stretch">
        <span aria-hidden className="w-[1.6em] shrink-0" />
        <motion.span
          aria-hidden
          className="absolute inset-y-0 right-0 left-[1.6em] rounded-xl ring-1"
          style={{ background: `${accent}0b`, ["--tw-ring-color" as string]: `${accent}24` }}
          {...at(d + 0.2, 8)}
        />
        <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-[0.45em] py-[0.5em] pr-[0.6em] pl-[0.6em]">
          {lines.map((line, k) => (
            <div key={line[0]} className="relative flex min-w-0 items-center gap-[0.4em]">
              <motion.span
                aria-hidden
                className="absolute top-1/2 left-[-1.45em] z-[1] size-[0.75em] -translate-y-1/2 rounded-full bg-white ring-[2.5px]"
                style={{ ["--tw-ring-color" as string]: theme.color }}
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={reduce ? undefined : { type: "spring", stiffness: 380, damping: 18, delay: d + 0.3 + k * 0.1 }}
              />
              {k < lines.length - 1 && (
                <span aria-hidden className="absolute top-1/2 left-[calc(-1.45em+0.33em)] h-[calc(100%+0.45em)] w-[2px]" style={{ background: `${theme.color}55` }} />
              )}
              {line.map((p, m) => (
                <motion.span
                  key={p}
                  {...at(d + 0.4 + (k * line.length + m) * 0.08, 8)}
                  className={`inline-flex min-w-0 items-center gap-[0.4em] rounded-full bg-white px-[0.7em] py-[0.3em] text-[length:var(--gs-14)] leading-tight font-semibold text-[#17365f] shadow-[0_2px_6px_rgba(20,50,90,0.06)] ring-1 ring-[#e3ebf5] ${pairs ? "flex-1" : ""}`}
                >
                  <CheckCircle weight="fill" className="size-[1.2em] shrink-0" style={{ color: theme.color }} />
                  {p}
                </motion.span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <motion.div {...at(d + 0.7, 0, 6)} className="flex min-w-0 flex-col items-center justify-center gap-[0.7em]">
        <Owners risk={risk} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="inline-flex items-center gap-[0.4em] rounded-full bg-white px-[0.9em] py-[0.35em] text-[length:var(--gs-13)] font-bold whitespace-nowrap text-[#1d4f9a] shadow-[0_4px_10px_rgba(20,60,120,0.1)] ring-1 ring-[#cfdcee] transition hover:bg-[#f1f6fd] hover:ring-[#1d66dc]"
        >
          View Details
          <ArrowRight weight="bold" className="size-[1em]" />
        </button>
      </motion.div>
    </div>
  );
}

function Owners({ risk }: { risk: Risk }) {
  return (
    <span className="flex items-center gap-[0.35em] whitespace-nowrap">
      {risk.owners.map((o, k) => (
        <span key={o} className="contents">
          {k > 0 &&
            (risk.handover ? (
              <ArrowRight weight="bold" className="size-[1em] text-[#8da2bb]" />
            ) : (
              <span className="text-[length:var(--gs-14)] font-bold text-[#8da2bb]">+</span>
            ))}
          <OwnerBadge o={o} />
        </span>
      ))}
    </span>
  );
}

function OwnerBadge({ o }: { o: Owner }) {
  return (
    <span className="rounded-md px-[0.7em] py-[0.25em] text-[length:var(--gs-13)] font-extrabold text-white shadow-[0_3px_8px_rgba(20,40,80,0.18)]" style={{ background: OWNER_COLOR[o] }}>
      {o}
    </span>
  );
}

function RiskDetail({ risk, theme, i, onClose }: { risk: Risk; theme: Theme; i: number; onClose: () => void }) {
  const accent = ROW_ACCENT[i % ROW_ACCENT.length];
  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="relative flex items-center gap-4 px-6 pt-6 pb-4" style={{ background: `linear-gradient(90deg, ${accent}14 0%, #ffffff 80%)` }}>
        <span className="grid size-12 shrink-0 place-items-center rounded-full ring-4 ring-white" style={{ background: `${accent}1c`, color: accent }}>
          <risk.Icon weight="fill" className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-extrabold tracking-wide uppercase">
            <span className="rounded px-2 py-0.5 text-white" style={{ background: accent }}>
              Risk {i + 1}
            </span>
            <span style={{ color: theme.color }}>{theme.name}</span>
          </p>
          <DialogTitle className="mt-1 text-xl font-extrabold text-[#123a6e]">{risk.title}</DialogTitle>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-[#5b7390] hover:bg-[#eef3fa]"
        >
          <X weight="bold" className="size-4" />
        </button>
      </div>
      <div className="space-y-4 px-6 pt-2 pb-6 text-sm">
        <p className="flex items-start gap-2 font-semibold text-[#c0283f]">
          <WarningCircle weight="fill" className="mt-0.5 size-4 shrink-0" />
          {risk.impact}
        </p>
        <div>
          <p className="mb-2 text-xs font-extrabold tracking-wide text-[#5b7390] uppercase">Mitigation plan</p>
          <ul className="space-y-1.5">
            {risk.plan.map((p) => (
              <li key={p} className="flex items-center gap-2 rounded-lg bg-[#f5f8fd] px-3 py-2 font-semibold text-[#17365f]">
                <CheckCircle weight="fill" className="size-4 shrink-0" style={{ color: theme.color }} />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6eef7] pt-4">
          <span className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-[#5b7390] uppercase">
            Owner
            <Owners risk={risk} />
          </span>
          {risk.rfp && (
            <span className="rounded-md bg-[#eef3fa] px-2 py-1 text-xs font-bold text-[#4d6784] ring-1 ring-[#d7e3f1]">Listed in RFP section 12.7</span>
          )}
        </div>
      </div>
    </div>
  );
}

function CoverCard({ covered, active, reduce }: { covered: number; active: number; reduce: boolean }) {
  const r = 47;
  const c = 2 * Math.PI * r;
  const seg = (c * 26) / 360;
  const start = covered - THEMES[active].risks.length;
  const pct = Math.round((covered / TOTAL) * 100);
  const stats = [
    { n: String(covered), label: "Covered", c: "#16a34a", bg: "#eaf7ef", ring: "#c9ebd6" },
    { n: `${active + 1}/${THEMES.length}`, label: "Themes", c: "#1d66dc", bg: "#ebf2fd", ring: "#cfe0f8" },
    { n: String(TOTAL - covered), label: "Next", c: "#d9203f", bg: "#fdeef0", ring: "#f6cfd6" },
  ];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease }}
      className="flex min-h-0 flex-[1.9] flex-col gap-[4%] rounded-2xl bg-white/90 px-[7%] py-[6%] text-[length:var(--gs-16)] shadow-[0_14px_34px_rgba(20,60,120,0.1)] ring-1 ring-[#dbe6f3] backdrop-blur-sm"
    >
      <div className="flex shrink-0 items-center justify-between gap-[0.5em]">
        <span className="font-display flex items-center gap-[0.4em] text-[length:var(--gs-18)] font-extrabold text-[#123a6e]">
          <ChartBar weight="fill" className="size-[1.1em] text-[#1d66dc]" />
          Risk Cover
        </span>
        <span className="rounded-full bg-[#f1f5fb] px-[0.7em] py-[0.2em] text-[length:var(--gs-12)] font-bold text-[#4d6784] ring-1 ring-[#dbe6f3]">All themes</span>
      </div>

      <div className="relative min-h-0 flex-1">
        <svg viewBox="0 0 120 120" className="absolute inset-0 m-auto aspect-square h-full max-w-full -rotate-90">
          {RING_COLORS.map((color, i) => {
            const on = i < covered;
            const rot = `rotate(${i * 36 + 5} 60 60)`;
            return (
              <g key={i}>
                <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e9f2" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${seg} ${c - seg}`} transform={rot} />
                <motion.circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={`${seg} ${c - seg}`}
                  transform={rot}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.4, delay: reduce || !on || i < start ? 0 : 0.5 + (i - start) * 0.25 }}
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center leading-none">
            <ShieldCheck weight="fill" className="size-[1.8em] text-[#16a34a]" />
            <span className="font-display mt-[0.15em] text-[length:var(--gs-20)] font-black text-[#123a6e]">
              <span className="text-[1.6em]">{covered}</span> / {TOTAL}
            </span>
            <span className="mt-[0.3em] text-[length:var(--gs-12)] font-bold text-[#5b7390]">risks covered</span>
            <span className="font-display mt-[0.35em] text-[length:var(--gs-18)] font-extrabold text-[#123a6e]">{pct}%</span>
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-[0.45em]">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center rounded-lg py-[0.4em] ring-1" style={{ background: s.bg, ["--tw-ring-color" as string]: s.ring }}>
            <motion.span
              key={s.n}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.4 }}
              className="font-display text-[length:var(--gs-20)] leading-none font-black"
              style={{ color: s.c }}
            >
              {s.n}
            </motion.span>
            <span className="mt-[0.25em] text-[length:var(--gs-12)] font-bold text-[#3f5b7c]">{s.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OwnersCard({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease }}
      className="flex min-h-0 flex-1 flex-col justify-evenly gap-[0.5em] rounded-2xl bg-white/90 px-[7%] py-[5%] text-[length:var(--gs-14)] shadow-[0_14px_34px_rgba(20,60,120,0.1)] ring-1 ring-[#dbe6f3] backdrop-blur-sm"
    >
      <p className="flex items-center justify-between">
        <span className="font-display text-[length:var(--gs-16)] font-extrabold text-[#123a6e]">Who owns them</span>
        <span className="text-[length:var(--gs-12)] font-bold text-[#5b7390]">All {TOTAL} risks</span>
      </p>
      {OWNER_COUNT.map(({ o, n }, i) => {
        const Icon = OWNER_ICON[o];
        return (
          <div key={o} className="flex items-center gap-[0.6em]">
            <span className="grid size-[2.1em] shrink-0 place-items-center rounded-full text-white ring-2 ring-white shadow-[0_4px_10px_rgba(20,40,80,0.18)]" style={{ background: OWNER_COLOR[o] }}>
              <Icon weight="fill" className="size-[52%]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[length:var(--gs-13)] font-extrabold text-[#123a6e]">{o}</span>
              <span className="mt-[0.25em] block h-[0.4em] overflow-hidden rounded-full bg-[#e6edf6]">
                <motion.span
                  className="block h-full rounded-full"
                  style={{ background: OWNER_COLOR[o] }}
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${(n / TOTAL) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + i * 0.12, ease }}
                />
              </span>
            </span>
            <span className="shrink-0 text-[length:var(--gs-12)] font-bold text-[#3f5b7c]">
              {n} {n === 1 ? "risk" : "risks"}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}

const CHAIN: { label: string; Icon: CessIcon; c: string }[] = [
  { label: "Risk named", Icon: WarningCircle, c: "#d9203f" },
  { label: "Plan ready", Icon: ShieldCheck, c: "#1d66dc" },
  { label: "Owner fixed", Icon: User, c: "#0f8a4c" },
];

function FooterBand({ last, active, reduce }: { last: boolean; active: number; reduce: boolean }) {
  const theme = THEMES[active];
  return (
    <div className="relative flex min-h-0 items-center gap-[1.8%] rounded-2xl bg-white/90 px-[1.4%] text-[length:var(--gs-14)] shadow-[0_10px_26px_rgba(20,50,90,0.1)] ring-1 ring-[#dbe6f3] backdrop-blur-[3px]">
      <span className="flex shrink-0 items-center gap-[0.5em]">
        <span className="grid size-[2.2em] place-items-center rounded-lg bg-[#e8f1fd] text-[#1d66dc] ring-1 ring-[#cfe0f8]">
          <ArrowsClockwise weight="bold" className="size-[55%]" />
        </span>
        <span className="font-display font-extrabold text-[#123a6e]">Risk Status Flow</span>
      </span>
      <div className="flex shrink-0 items-center gap-[0.6em]">
        {CHAIN.map((s, i) => (
          <span key={s.label} className="contents">
            {i > 0 && <ArrowRight weight="bold" className="size-[1em] text-[#9fb2c8]" />}
            <motion.span
              className="flex items-center gap-[0.4em] font-bold text-[#123a6e]"
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.6 + i * 0.15 }}
            >
              <span className="grid size-[1.9em] place-items-center rounded-full text-white" style={{ background: s.c }}>
                <s.Icon weight="fill" className="size-[55%]" />
              </span>
              {s.label}
            </motion.span>
          </span>
        ))}
      </div>

      <motion.div
        key={active}
        initial={reduce ? false : { opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: last ? 1.4 : 0.9, ease }}
        className="flex h-[74%] min-w-0 flex-1 items-center gap-[0.7em] rounded-xl bg-[#ecf8f1] px-[1.4%] ring-1 ring-[#c9ebd6]"
      >
        <span className="grid size-[2.1em] shrink-0 place-items-center rounded-lg bg-white text-[#16a34a] ring-1 ring-[#bfe5cd]">
          {last ? <CheckCircle weight="fill" className="size-[60%]" /> : <ClipboardText weight="fill" className="size-[55%]" />}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-extrabold text-[#123a6e]">
            {last ? "Every risk has a plan and a named owner." : `Theme ${active + 1} of ${THEMES.length} · ${theme.name}`}
          </span>
          <span className="block truncate text-[length:var(--gs-12)] font-semibold text-[#3f6b55]">
            {last ? `${TOTAL} risks · ${THEMES.length} themes · Named owners` : `${theme.risks.length} risks identified · Clear mitigation plan · Named owners`}
          </span>
        </span>
      </motion.div>
    </div>
  );
}
