import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowRight,
  CheckCircle,
  Files,
  Hourglass,
  Lightning,
  LinkBreak,
  Lock,
  MapTrifold,
  Plugs,
  Scales,
  ShieldCheck,
  User,
  UsersThree,
  WarningCircle,
} from "@/lib/icons";
import { STAGE_TYPE } from "@/components/GpsEstimationStage";

const ease = [0.22, 1, 0.36, 1] as const;

type Owner = "Board" | "CMS" | "KSDC";

const OWNER_COLOR: Record<Owner, string> = {
  Board: "#1b3f7a",
  CMS: "#c8102e",
  KSDC: "#0e8f9c",
};

type Risk = {
  title: string;
  impact: string;
  plan: string[];
  owners: Owner[];
  handover?: boolean;
  rfp?: boolean;
  Icon: CessIcon;
};

type Theme = { name: string; line: string; Icon: CessIcon; color: string; soft: string; risks: Risk[] };

const THEMES: Theme[] = [
  {
    name: "Agencies & Links",
    line: "Agencies must report and link on time.",
    Icon: Plugs,
    color: "#1d66dc",
    soft: "#e8f1fd",
    risks: [
      {
        title: "Agencies do not report or link",
        impact: "CESS may go uncollected",
        plan: ["Government order makes reporting mandatory", "Regular dues statements (DCB)", "Agency scorecards and escalation"],
        owners: ["Board", "CMS"],
        rfp: true,
        Icon: LinkBreak,
      },
      {
        title: "Agency systems are not ready",
        impact: "Phase 3 may slip",
        plan: ["Link through KMDS, e-Swathu, Panchatantra", "Periodic file transfer meanwhile", "Track each dependency"],
        owners: ["CMS"],
        Icon: Plugs,
      },
      {
        title: "KSK link access is delayed",
        impact: "Payment updates are delayed",
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
    color: "#6b35d6",
    soft: "#f0eafd",
    risks: [
      {
        title: "CESS business rules are unclear",
        impact: "Wrong demands lead to appeals",
        plan: ["Signed business rules in the SRS", "All rates and slabs can be changed", "Later changes through change control"],
        owners: ["Board", "CMS"],
        Icon: Scales,
      },
      {
        title: "Duplicate or mismatched projects",
        impact: "Double demand or missed project",
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
    color: "#0f8a4c",
    soft: "#e5f6ec",
    risks: [
      {
        title: "Officers do not use the system",
        impact: "Paper process continues",
        plan: ["Kannada and English screens", "Mobile app works offline", "Training for about 2,000 users", "On-site helpdesk"],
        owners: ["CMS"],
        rfp: true,
        Icon: UsersThree,
      },
      {
        title: "Map data or imagery is delayed",
        impact: "Territory map stays incomplete",
        plan: ["KSRSAC and Bhuvan layers requested in Month 1", "District-by-district rollout", "GPS field points fill gaps"],
        owners: ["Board", "CMS"],
        rfp: true,
        Icon: MapTrifold,
      },
      {
        title: "Key team members leave",
        impact: "Knowledge is lost",
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
    color: "#e0650a",
    soft: "#fdf0e3",
    risks: [
      {
        title: "System downtime or failure",
        impact: "Collections stop",
        plan: ["Disaster recovery site at KSDC", "Data loss under 1 hour", "Service back within 4 hours", "24×7 monitoring and drills"],
        owners: ["KSDC", "CMS"],
        rfp: true,
        Icon: Lightning,
      },
      {
        title: "Security and privacy of data",
        impact: "Legal and reputation risk",
        plan: ["Aadhaar kept only where permitted", "Data is encrypted", "CERT-In security audit before go-live", "DPDP Act compliance"],
        owners: ["CMS"],
        Icon: Lock,
      },
    ],
  },
];

const TOTAL = THEMES.reduce((n, t) => n + t.risks.length, 0);
const SEGMENTS = THEMES.flatMap((t, ti) => t.risks.map(() => ({ ti, color: t.color })));
const OWNER_COUNT = (["CMS", "Board", "KSDC"] as Owner[]).map((o) => ({
  o,
  n: THEMES.reduce((n, t) => n + t.risks.filter((r) => r.owners.includes(o)).length, 0),
}));

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
        className="relative grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_10%] gap-y-[1.2%] overflow-hidden rounded-xl px-[1.2%] pt-[1.2%] pb-[0.9%] text-[#122b50] ring-1 ring-white/80"
        style={{
          ...STAGE_TYPE,
          background:
            "radial-gradient(60% 70% at 50% 45%, rgba(255,255,255,0.95) 0%, rgba(240,246,253,0.6) 55%, transparent 100%), linear-gradient(180deg,#f3f8fe 0%,#e9f2fb 100%)",
        }}
      >
        <SoftRings color={theme.color} />

        <div className="relative grid min-h-0 grid-cols-[18%_minmax(0,1fr)_20%] gap-x-[1.4%]">
          <ThemeRail active={active} reduce={reduce} />
          <RiskBoard key={active} theme={theme} reduce={reduce} />
          <CoverRing covered={covered} active={active} reduce={reduce} />
        </div>

        <FooterBand last={last} active={active} reduce={reduce} />
      </div>
    </div>
  );
}

function SoftRings({ color }: { color: string }) {
  return (
    <svg aria-hidden viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 size-full">
      {[150, 240, 330].map((r, i) => (
        <motion.circle
          key={r}
          cx="500"
          cy="290"
          r={r}
          fill="none"
          animate={{ stroke: color }}
          transition={{ duration: 0.8 }}
          strokeOpacity={0.07 - i * 0.015}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

function ThemeRail({ active, reduce }: { active: number; reduce: boolean }) {
  return (
    <div className="relative flex min-h-0 flex-col justify-evenly py-[4%] text-[length:var(--gs-16)]">
      <span aria-hidden className="absolute top-[12%] bottom-[12%] left-[1.6em] w-[3px] rounded-full bg-[#d5e0ec]" />
      <motion.span
        aria-hidden
        className="absolute top-[12%] left-[1.6em] w-[3px] origin-top rounded-full"
        style={{ background: `linear-gradient(180deg, ${THEMES[0].color}, ${THEMES[active].color})` }}
        initial={false}
        animate={{ height: `${(active / (THEMES.length - 1)) * 76}%` }}
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
            animate={{ opacity: reached ? 1 : 0.5, x: 0 }}
            transition={{ duration: 0.45, delay: reduce ? 0 : 0.1 + i * 0.08, ease }}
            className="relative flex items-center gap-[0.7em] rounded-full py-[0.35em] pr-[0.8em] pl-[0.1em]"
            style={{ background: on ? `linear-gradient(90deg, ${t.soft}, rgba(255,255,255,0))` : undefined }}
          >
            {on && !reduce && (
              <motion.span
                aria-hidden
                className="absolute top-1/2 left-[0.1em] size-[3em] -translate-y-1/2 rounded-full"
                style={{ boxShadow: `0 0 0 3px ${t.color}` }}
                animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <motion.span
              className="relative z-[1] grid size-[3em] shrink-0 place-items-center rounded-full text-white ring-4 ring-white"
              animate={{
                background: reached ? t.color : "#c7d3e2",
                scale: on && !reduce ? 1.06 : 1,
                boxShadow: reached ? `0 8px 18px ${t.color}55` : "0 4px 10px rgba(20,50,90,0.12)",
              }}
              transition={{ duration: 0.45, ease }}
            >
              <t.Icon weight="fill" className="size-[48%]" />
              {done && (
                <span className="absolute -right-[0.25em] -bottom-[0.15em] grid size-[1.25em] place-items-center rounded-full bg-white text-[#16a34a]">
                  <CheckCircle weight="fill" className="size-full" />
                </span>
              )}
            </motion.span>
            <span className="min-w-0 leading-tight">
              <span className="font-display block text-[length:var(--gs-12)] font-extrabold tracking-[0.06em] uppercase" style={{ color: reached ? t.color : "#8da2bb" }}>
                Theme {i + 1}
              </span>
              <span className="font-display block text-[length:var(--gs-16)] font-extrabold text-[#123a6e]">{t.name}</span>
              <span className="block text-[length:var(--gs-12)] font-semibold text-[#5b7390]">
                {t.risks.length} risks · {done ? "covered" : on ? "now" : "next"}
              </span>
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function RiskBoard({ theme, reduce }: { theme: Theme; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white/92 text-[length:var(--gs-18)] shadow-[0_14px_34px_rgba(20,60,120,0.12)] ring-1 ring-[#dbe6f3] backdrop-blur-sm"
      style={{ borderTop: `4px solid ${theme.color}` }}
    >
      <div className="flex shrink-0 items-center gap-[0.8em] px-[2.4%] pt-[1.6%] pb-[1.2%]" style={{ background: `linear-gradient(90deg, ${theme.soft} 0%, #ffffff 65%)` }}>
        <span className="grid size-[2.6em] shrink-0 place-items-center rounded-xl text-white" style={{ background: theme.color, boxShadow: `0 6px 14px -4px ${theme.color}aa` }}>
          <theme.Icon weight="fill" className="size-[52%]" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="font-display block text-[length:var(--gs-20)] font-extrabold text-[#123a6e]">{theme.name}</span>
          <span className="block text-[length:var(--gs-16)] font-semibold text-[#4d6784]">{theme.line}</span>
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-[33%_6%_minmax(0,1fr)_16%] gap-x-[1.2%] border-y border-[#e6eef7] bg-[#f6f9fd] px-[2.4%] py-[0.6%] text-[length:var(--gs-13)] font-extrabold tracking-[0.06em] text-[#5b7390] uppercase">
        <span>Risk · Impact on the Board</span>
        <span />
        <span>Mitigation</span>
        <span>Owner</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-evenly px-[2.4%]">
        {theme.risks.map((r, i) => (
          <RiskRow key={r.title} risk={r} theme={theme} i={i} reduce={reduce} />
        ))}
      </div>
    </motion.div>
  );
}

function RiskRow({ risk, theme, i, reduce }: { risk: Risk; theme: Theme; i: number; reduce: boolean }) {
  const d = 0.3 + i * 0.45;
  const at = (delay: number, x = 0, y = 0) => (reduce ? {} : { initial: { opacity: 0, x, y }, animate: { opacity: 1, x: 0, y: 0 }, transition: { duration: 0.4, delay, ease } });
  return (
    <div className="grid min-h-0 grid-cols-[33%_6%_minmax(0,1fr)_16%] items-center gap-x-[1.2%] border-t border-[#eef2f8] py-[1.4%] first:border-t-0">
      <motion.div {...at(d, -10)} className="flex min-w-0 items-center gap-[0.7em]">
        <span className="grid size-[2.7em] shrink-0 place-items-center rounded-full bg-[#fdeaec] text-[#d9203f] shadow-[0_4px_10px_rgba(217,32,63,0.18)] ring-2 ring-white">
          <risk.Icon weight="fill" className="size-[50%]" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="font-display block text-[length:var(--gs-20)] font-extrabold text-[#123a6e]">
            {risk.title}
            {risk.rfp && (
              <span className="ml-[0.4em] inline-block rounded-full bg-[#eef3fa] px-[0.5em] py-[0.05em] align-middle font-sans text-[length:var(--gs-13)] font-bold text-[#4d6784] ring-1 ring-[#d7e3f1]">
                RFP 12.7
              </span>
            )}
          </span>
          <span className="mt-[0.35em] flex items-center gap-[0.3em] text-[length:var(--gs-16)] font-bold text-[#c0283f]">
            <WarningCircle weight="fill" className="size-[1.15em] shrink-0" />
            {risk.impact}
          </span>
        </span>
      </motion.div>

      <Guard color={theme.color} delay={d + 0.25} reduce={reduce} />

      <div className="flex min-w-0 flex-wrap gap-[0.45em]">
        {risk.plan.map((p, k) => (
          <motion.span
            key={p}
            {...at(d + 0.45 + k * 0.08, 8)}
            className="inline-flex items-center gap-[0.35em] rounded-full px-[0.75em] py-[0.35em] text-[length:var(--gs-16)] leading-tight font-semibold text-[#17365f]"
            style={{ background: theme.soft }}
          >
            <CheckCircle weight="fill" className="size-[1.15em] shrink-0" style={{ color: theme.color }} />
            {p}
          </motion.span>
        ))}
      </div>

      <motion.div {...at(d + 0.75, 0, 6)} className="flex items-center gap-[0.3em] whitespace-nowrap">
        {risk.owners.map((o, k) => (
          <span key={o} className="contents">
            {k > 0 &&
              (risk.handover ? (
                <ArrowRight weight="bold" className="size-[1em] text-[#8da2bb]" />
              ) : (
                <span className="text-[length:var(--gs-16)] font-bold text-[#8da2bb]">+</span>
              ))}
            <OwnerBadge o={o} big />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function OwnerBadge({ o, big }: { o: Owner; big?: boolean }) {
  return (
    <span className={`rounded-full px-[0.65em] py-[0.2em] font-extrabold ${big ? "text-[length:var(--gs-16)]" : "text-[length:var(--gs-13)]"} text-white shadow-[0_3px_8px_rgba(20,40,80,0.18)]`} style={{ background: OWNER_COLOR[o] }}>
      {o}
    </span>
  );
}

function Guard({ color, delay, reduce }: { color: string; delay: number; reduce: boolean }) {
  return (
    <div className="relative flex h-full items-center justify-center">
      <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full" style={{ background: `linear-gradient(90deg, #f3a3b0, ${color})` }} />
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute top-1/2 size-[0.45em] -translate-y-1/2 rounded-full"
          style={{ background: color }}
          animate={{ left: ["0%", "92%"], opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: delay + 0.6, repeatDelay: 2.4, ease: "easeInOut" }}
        />
      )}
      <motion.span
        className="relative z-[1] grid size-[2.1em] place-items-center rounded-full bg-white ring-2"
        style={{ color, ["--tw-ring-color" as string]: color, boxShadow: `0 4px 12px ${color}44` }}
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={reduce ? undefined : { type: "spring", stiffness: 320, damping: 16, delay }}
      >
        <ShieldCheck weight="fill" className="size-[58%]" />
      </motion.span>
    </div>
  );
}

function CoverRing({ covered, active, reduce }: { covered: number; active: number; reduce: boolean }) {
  const r = 50;
  const c = 2 * Math.PI * r;
  const seg = (c * 24) / 360;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease }}
      className="flex min-h-0 flex-col items-center gap-[4%] rounded-2xl bg-white/80 px-[7%] py-[6%] text-[length:var(--gs-16)] shadow-[0_14px_34px_rgba(20,60,120,0.1)] ring-1 ring-[#dbe6f3] backdrop-blur-sm"
    >
      <p className="font-display text-[length:var(--gs-18)] font-extrabold text-[#123a6e]">Risk Cover</p>
      <div className="relative aspect-square w-[86%] max-w-full">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          {SEGMENTS.map((s, i) => {
            const on = i < covered;
            return (
              <motion.circle
                key={i}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${seg} ${c - seg}`}
                transform={`rotate(${i * 36 + 6} 60 60)`}
                initial={false}
                animate={{ stroke: on ? s.color : "#dfe7f1", opacity: on ? 1 : 0.9 }}
                transition={{ duration: reduce ? 0 : 0.4, delay: reduce || !on || s.ti !== active ? 0 : 0.4 + (i - (covered - THEMES[active].risks.length)) * 0.25 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center leading-none">
            <ShieldCheck weight="fill" className="size-[2.2em] text-[#16a34a]" />
            <span className="font-display mt-[0.2em] text-[length:var(--gs-20)] font-black text-[#123a6e]">
              <span className="text-[1.5em]">{covered}</span> / {TOTAL}
            </span>
            <span className="mt-[0.25em] text-[length:var(--gs-12)] font-bold text-[#5b7390]">risks covered</span>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-[0.55em]">
        <p className="text-[length:var(--gs-12)] font-extrabold tracking-[0.06em] text-[#5b7390] uppercase">Who owns them</p>
        {OWNER_COUNT.map(({ o, n }) => (
          <p key={o} className="flex items-center justify-between gap-[0.5em]">
            <OwnerBadge o={o} />
            <span className="text-[length:var(--gs-13)] font-semibold text-[#3f5b7c]">
              {n === TOTAL ? `All ${n} risks` : `${n} ${n === 1 ? "risk" : "risks"}`}
            </span>
          </p>
        ))}
      </div>
    </motion.div>
  );
}

const CHAIN: { label: string; Icon: CessIcon; c: string }[] = [
  { label: "Risk named", Icon: WarningCircle, c: "#d9203f" },
  { label: "Plan ready", Icon: ShieldCheck, c: "#1d66dc" },
  { label: "Owner fixed", Icon: User, c: "#0f8a4c" },
];

function FooterBand({ last, active, reduce }: { last: boolean; active: number; reduce: boolean }) {
  return (
    <div className="relative flex min-h-0 items-center gap-[2%] rounded-2xl bg-white/88 px-[1.6%] text-[length:var(--gs-14)] shadow-[0_10px_26px_rgba(20,50,90,0.1)] ring-1 ring-[#dbe6f3] backdrop-blur-[3px]">
      <div className="flex shrink-0 items-center gap-[0.6em]">
        {CHAIN.map((s, i) => (
          <span key={s.label} className="contents">
            {i > 0 && <ArrowRight weight="bold" className="size-[1em] text-[#9fb2c8]" />}
            <span className="flex items-center gap-[0.4em] font-bold text-[#123a6e]">
              <span className="grid size-[2em] place-items-center rounded-full text-white" style={{ background: s.c }}>
                <s.Icon weight="fill" className="size-[55%]" />
              </span>
              {s.label}
            </span>
          </span>
        ))}
      </div>
      <div className="flex h-[68%] min-w-0 flex-1 items-center rounded-xl bg-[#e9f7ef] px-[1.6%] ring-1 ring-[#c9ebd6]">
        {last ? (
          <motion.p
            initial={reduce ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.4, ease }}
            className="flex min-w-0 items-center gap-[0.6em] text-[length:var(--gs-16)] font-extrabold text-[#123a6e]"
          >
            <CheckCircle weight="fill" className="size-[1.5em] shrink-0 text-[#16a34a]" />
            Every risk has a plan and a named owner.
          </motion.p>
        ) : (
          <p className="font-semibold text-[#3f6b55]">
            Theme {active + 1} of {THEMES.length} · {THEMES[active].name}
          </p>
        )}
      </div>
      {last && (
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.8, ease }}
          className="flex shrink-0 items-center gap-[0.4em] rounded-full bg-[#eef3fa] px-[0.9em] py-[0.4em] font-bold text-[#1d4f9a] ring-1 ring-[#d7e3f1]"
        >
          Next · Thank you
          <ArrowRight weight="bold" className="size-[1em]" />
        </motion.span>
      )}
    </div>
  );
}
