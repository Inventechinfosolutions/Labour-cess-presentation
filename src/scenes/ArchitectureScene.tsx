import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowRight,
  ArrowsClockwise,
  Bank,
  Broadcast,
  Buildings,
  Calculator,
  CaretRight,
  ChartBar,
  CheckCircle,
  ClipboardText,
  CloudArrowUp,
  Coins,
  Cpu,
  Cube,
  CurrencyInr,
  Database,
  DeviceMobile,
  FileText,
  GearSix,
  Globe,
  HardHat,
  IdentificationCard,
  Lightning,
  Lock,
  MagnifyingGlass,
  Monitor,
  Plugs,
  Receipt,
  Scales,
  Scroll,
  ShieldCheck,
  Stack,
  TreeStructure,
  User,
  UsersThree,
} from "@/lib/icons";
import { STAGE_TYPE } from "@/components/GpsEstimationStage";
import artChannels from "@/assets/arch-channels.jpg";
import artSecurity from "@/assets/arch-security.jpg";
import artMicro from "@/assets/arch-micro.jpg";
import artInfra from "@/assets/arch-infra.jpg";
import artLock from "@/assets/sec-lock.jpg";
import artUsers from "@/assets/sec-users.jpg";
import stageBg from "@/assets/arch-stage-bg.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

const GOLD = "#c08a12";
const INK = "#123a6e";
const MUTED = "#5b7390";

type Panel = { title: string; sub: string; Icon: CessIcon; color: string; soft: string };

const PANELS: Panel[] = [
  { title: "Solution Architecture", sub: "Layered, custom-built microservices with governed integrations and SDC hosting.", Icon: Stack, color: "#1d66dc", soft: "#e3eefc" },
  { title: "Technology Stack", sub: "Open, modern technologies across web, services, mobile and platform.", Icon: Cube, color: "#6b35d6", soft: "#eee7fd" },
  { title: "Security & Access Control", sub: "Single sign-in, post-based roles and a full audit of every action.", Icon: ShieldCheck, color: "#0f8a4c", soft: "#e1f5e9" },
];

type Item = { label: string; Icon: CessIcon };
type Layer = {
  n: number;
  name: string;
  desc: string;
  kind: "tiles" | "chips" | "boxes" | "pills";
  items: Item[];
  note?: string;
  NoteIcon?: CessIcon;
  art?: string;
  color: string;
};

const LAYERS: Layer[] = [
  {
    n: 1,
    name: "Channels",
    desc: "Multi-channel access for all stakeholders",
    kind: "tiles",
    items: [
      { label: "Web", Icon: Globe },
      { label: "Mobile", Icon: DeviceMobile },
      { label: "Portal", Icon: Monitor },
      { label: "API Gateway", Icon: GearSix },
    ],
    art: artChannels,
    color: "#1d66dc",
  },
  {
    n: 2,
    name: "Security",
    desc: "Identity, access and audit management",
    kind: "tiles",
    items: [
      { label: "Keycloak", Icon: ShieldCheck },
      { label: "JWT", Icon: IdentificationCard },
      { label: "RBAC", Icon: UsersThree },
      { label: "Audit Trails", Icon: MagnifyingGlass },
    ],
    art: artSecurity,
    color: "#e11d48",
  },
  {
    n: 3,
    name: "Microservices",
    desc: "Independent services for key business functions",
    kind: "chips",
    items: [
      { label: "Registry", Icon: ClipboardText },
      { label: "Cess Computation", Icon: Calculator },
      { label: "Collection", Icon: Coins },
      { label: "Remittance", Icon: CurrencyInr },
      { label: "DCB / Reconciliation", Icon: Scales },
      { label: "Analytics", Icon: ChartBar },
    ],
    note: "Kafka message bus connects all services",
    NoteIcon: Broadcast,
    art: artMicro,
    color: "#6b35d6",
  },
  {
    n: 4,
    name: "Data",
    desc: "Reliable and scalable data management",
    kind: "boxes",
    items: [
      { label: "MySQL", Icon: Database },
      { label: "Redis", Icon: Stack },
      { label: "Data Pool (analytics mirror)", Icon: Database },
    ],
    note: "Projects, payments, inspections and GIS",
    NoteIcon: CheckCircle,
    color: "#0f8a4c",
  },
  {
    n: 5,
    name: "Infrastructure",
    desc: "Hosted on Karnataka State Data Centre (SDC)",
    kind: "pills",
    items: [
      { label: "Karnataka State Data Centre (SDC)", Icon: Buildings },
      { label: "Disaster Recovery", Icon: CloudArrowUp },
    ],
    art: artInfra,
    color: GOLD,
  },
];

const AGENCIES: Item[] = [
  { label: "KSK", Icon: Buildings },
  { label: "eProc", Icon: FileText },
  { label: "Khajane 2.0", Icon: Bank },
  { label: "NIRMANA", Icon: HardHat },
  { label: "GST", Icon: Receipt },
  { label: "100+ Agencies", Icon: Globe },
];

const STACK: { name: string; desc: string; items: string[]; badge?: string; Icon: CessIcon; color: string }[] = [
  { name: "Frontend", desc: "Modern & responsive user experience", items: ["React", "Vite", "TanStack (Query / Router / Table)", "Tailwind CSS", "shadcn/ui", "Zod validation"], Icon: Monitor, color: "#1d66dc" },
  { name: "Backend", desc: "Robust microservices and event-driven", items: ["Java", "Spring Boot microservices", "Keycloak (IAM)", "MySQL", "Redis", "Kafka"], Icon: GearSix, color: "#6b35d6" },
  { name: "Mobile", desc: "Field operations and inspector tools", items: ["Field-inspector assessment app", "Board-staff app", "GPS, image & video capture", "Offline"], Icon: DeviceMobile, color: "#0d9488" },
  { name: "Platform", desc: "Containerised and scalable deployment", items: ["Kubernetes", "Containerised", "CI/CD", "Deployed on Karnataka SDC + DR"], badge: "SDC + DR", Icon: Cube, color: "#e8650a" },
  { name: "Security", desc: "Identity, access control and data protection", items: ["OIDC / OAuth2", "JWT", "RBAC", "Encryption (rest & transit)", "Full audit"], badge: "IT Act compliant", Icon: ShieldCheck, color: "#e11d48" },
];

type Node = { label: string; note?: string; Icon: CessIcon; color: string };

const AUTH: Node[] = [
  { label: "User", Icon: User, color: GOLD },
  { label: "Keycloak", note: "OIDC / OAuth2 · 2FA", Icon: Lock, color: "#e11d48" },
  { label: "JWT Token", note: "Signed · roles & scope", Icon: Scroll, color: "#e8650a" },
  { label: "Microservice", Icon: Cpu, color: "#1d66dc" },
];

const POST_MODEL: Node[] = [
  { label: "Person", Icon: User, color: GOLD },
  { label: "Post / Designation", note: "Scope from territory + department", Icon: IdentificationCard, color: "#e11d48" },
  { label: "Role", Icon: UsersThree, color: "#e8650a" },
  { label: "Permissions", Icon: ShieldCheck, color: "#1d66dc" },
];

const BADGES: { label: string; note: string; Icon: CessIcon }[] = [
  { label: "ALC/LO Officer Mapping", note: "KSK-aligned", Icon: TreeStructure },
  { label: "Immutable Audit", note: "Timestamped", Icon: Scroll },
  { label: "IT Act Compliant", note: "Secure & Governed", Icon: Scales },
];

const FACTS: Item[] = [
  { label: "Custom-built · no COTS or licensing", Icon: Cube },
  { label: "Hosted on Karnataka SDC with DR", Icon: Buildings },
  { label: "REST APIs behind an API gateway", Icon: Plugs },
  { label: "Single governed gateway to 100+ agencies", Icon: UsersThree },
  { label: "Full source code and data owned by KBOCWWB", Icon: ShieldCheck },
];

const PANEL_SHELL =
  "relative flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white/75 p-[1.1%] backdrop-blur-[2px] shadow-[0_14px_32px_-12px_rgba(20,60,120,0.28)] ring-1 ring-white";

/** Architecture, technology stack and security on one screen — one panel per Space. */
export function ArchitectureScene({ beat }: { beat: number }) {
  const reduce = !!useReducedMotion();
  const active = Math.min(Math.max(beat, 0), PANELS.length - 1);

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr]">
      <div
        className="relative grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_8%] gap-y-[1.2%] overflow-hidden rounded-xl p-[1%] text-[#122b50] ring-1 ring-white/80"
        style={{
          ...STAGE_TYPE,
          background: `linear-gradient(180deg, rgba(238,245,253,0.25) 0%, rgba(238,245,253,0) 45%, rgba(230,240,251,0.2) 100%), url(${stageBg}) center bottom / cover no-repeat, #eef5fd`,
        }}
      >
        <div className="grid min-h-0 grid-cols-[1.02fr_1fr] gap-x-[1%]">
          <Reveal shown panel={PANELS[0]} reduce={reduce} className="p-[1.6%]">
            <ArchitecturePanel reduce={reduce} />
          </Reveal>

          <div className="grid min-h-0 grid-rows-[1fr_0.98fr] gap-y-[1.6%]">
            <Reveal shown={active >= 1} panel={PANELS[1]} reduce={reduce} className="p-[2%]">
              <StackPanel reduce={reduce} />
            </Reveal>
            <Reveal shown={active >= 2} panel={PANELS[2]} reduce={reduce} className="p-[2%]">
              <SecurityPanel reduce={reduce} />
            </Reveal>
          </div>
        </div>

        <FactsBar reduce={reduce} />
      </div>
    </div>
  );
}

function Reveal({
  shown,
  panel,
  reduce,
  className,
  children,
}: {
  shown: boolean;
  panel: Panel;
  reduce: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (!shown) {
    return (
      <div className="flex min-h-0 flex-col items-center justify-center gap-[0.5em] rounded-2xl border-2 border-dashed border-[#c3d4e8] bg-white/40 text-[length:var(--gs-16)]">
        <panel.Icon weight="fill" className="size-[3em] text-[#c3d4e8]" />
        <span className="font-display font-extrabold text-[#a9bdd4]">{panel.title}</span>
      </div>
    );
  }
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className={`${PANEL_SHELL} ${className ?? ""}`}
    >
      <PanelHead panel={panel} />
      {children}
    </motion.section>
  );
}

function PanelHead({ panel }: { panel: Panel }) {
  return (
    <div className="mb-[0.6em] flex shrink-0 items-start gap-[0.7em] text-[length:var(--gs-16)]">
      <span
        className="grid size-[2.3em] shrink-0 place-items-center rounded-full text-white shadow-[0_6px_14px_-4px_rgba(20,60,120,0.4)]"
        style={{ background: `linear-gradient(135deg, ${panel.color}cc, ${panel.color})`, boxShadow: `0 0 0 4px ${panel.soft}` }}
      >
        <panel.Icon weight="fill" className="size-[52%]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[length:var(--gs-20)] leading-tight font-extrabold" style={{ color: INK }}>
          {panel.title}
        </p>
        <p className="mt-[0.15em] text-[length:var(--gs-12)] leading-snug font-semibold" style={{ color: MUTED }}>
          {panel.sub}
        </p>
      </div>
      <span className="grid size-[1.7em] shrink-0 place-items-center rounded-full bg-white text-[#5b7390] shadow-[0_2px_6px_rgba(20,60,120,0.15)] ring-1 ring-[#e3ecf6]">
        <CaretRight weight="bold" className="size-[50%]" />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ architecture */

function ArchitecturePanel({ reduce }: { reduce: boolean }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_17%] gap-x-[2.5%]">
      <div className="relative grid min-h-0 grid-rows-5 gap-y-[1.6%] pl-[4.5%]">
        <div aria-hidden className="absolute top-[1%] bottom-[1%] left-[1.2%] flex w-[2%] flex-col items-center">
          <span className="size-[6px] rounded-full bg-[#7ea6d8]" />
          <span className="w-[2px] flex-1 bg-[linear-gradient(180deg,#1d66dc55,#c08a1255)]" />
          <span className="absolute top-1/2 -translate-y-1/2 -rotate-90 bg-white px-[0.4em] text-[length:var(--gs-12)] font-extrabold tracking-[0.2em] whitespace-nowrap text-[#4f6f99]">
            5 LAYERS
          </span>
          <span className="size-[6px] rounded-full bg-[#7ea6d8]" />
        </div>
        {LAYERS.map((l, k) => (
          <LayerRow key={l.n} layer={l} delay={0.15 + k * 0.1} reduce={reduce} />
        ))}
      </div>
      <Gateway reduce={reduce} />
    </div>
  );
}

function LayerRow({ layer: l, delay, reduce }: { layer: Layer; delay: number; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay, ease }}
      className="grid min-h-0 grid-cols-[29%_minmax(0,1fr)] items-stretch gap-x-[2%] overflow-hidden rounded-xl p-[0.6%]"
      style={{ background: `linear-gradient(90deg, ${l.color}14 0%, ${l.color}06 100%)`, boxShadow: `inset 3px 0 0 ${l.color}` }}
    >
      <div className="flex min-w-0 items-center gap-[0.5em] pl-[0.5em]">
        <span
          className="font-display grid size-[2.2em] shrink-0 place-items-center rounded-full text-[length:var(--gs-14)] font-black text-white"
          style={{ background: `linear-gradient(135deg, ${l.color}bb, ${l.color})`, boxShadow: `0 4px 10px -3px ${l.color}aa` }}
        >
          {String(l.n).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <p className="font-display text-[length:var(--gs-16)] leading-[1.1] font-extrabold" style={{ color: INK }}>
            {l.name}
            <br />
            Layer
          </p>
          <p className="mt-[0.2em] text-[length:var(--gs-12)] leading-tight font-semibold" style={{ color: MUTED }}>
            {l.desc}
          </p>
        </div>
      </div>

      <div
        className="relative flex min-w-0 items-center overflow-hidden rounded-lg bg-white/70 px-[0.7em] py-[0.3em]"
        style={{ boxShadow: `inset 0 0 0 1px ${l.color}40` }}
      >
        <div className={`relative z-10 min-w-0 ${l.art ? "w-[74%]" : "w-full"}`}>
          <LayerItems layer={l} />
          {l.note && l.NoteIcon && (
            <p className="mt-[0.3em] flex items-center gap-[0.35em] text-[length:var(--gs-12)] leading-tight font-bold" style={{ color: l.color }}>
              <l.NoteIcon weight="fill" className="size-[1.15em] shrink-0" />
              {l.note}
            </p>
          )}
        </div>
        {l.art && (
          <img
            src={l.art}
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute top-1/2 right-[1%] h-[112%] w-[26%] -translate-y-1/2 object-contain mix-blend-multiply select-none"
          />
        )}
      </div>
    </motion.div>
  );
}

function LayerItems({ layer: l }: { layer: Layer }) {
  if (l.kind === "tiles") {
    return (
      <div className="flex items-start gap-[0.9em]">
        {l.items.map((it) => (
          <span key={it.label} className="flex min-w-0 flex-col items-center gap-[0.25em]">
            <span className="grid size-[2.3em] place-items-center rounded-lg bg-white text-[length:var(--gs-16)] shadow-[0_3px_8px_-2px_rgba(20,60,120,0.18)] ring-1" style={{ color: l.color, ["--tw-ring-color" as string]: `${l.color}30` }}>
              <it.Icon weight="fill" className="size-[55%]" />
            </span>
            <span className="text-[length:var(--gs-13)] leading-none font-bold whitespace-nowrap" style={{ color: INK }}>
              {it.label}
            </span>
          </span>
        ))}
      </div>
    );
  }
  if (l.kind === "chips") {
    return (
      <div className="flex flex-wrap gap-[0.3em]">
        {l.items.map((it) => (
          <span
            key={it.label}
            className="flex items-center gap-[0.3em] rounded-md bg-white px-[0.45em] py-[0.2em] text-[length:var(--gs-13)] leading-tight font-bold whitespace-nowrap shadow-[0_2px_5px_-2px_rgba(20,60,120,0.15)] ring-1"
            style={{ color: INK, ["--tw-ring-color" as string]: `${l.color}30` }}
          >
            <it.Icon weight="fill" className="size-[1.15em] shrink-0" style={{ color: l.color }} />
            {it.label}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className={`flex gap-[0.45em] ${l.kind === "pills" ? "flex-col items-start" : "flex-wrap"}`}>
      {l.items.map((it) => (
        <span
          key={it.label}
          className="flex items-center gap-[0.45em] rounded-lg bg-white px-[0.6em] py-[0.3em] text-[length:var(--gs-13)] leading-tight font-bold shadow-[0_3px_8px_-3px_rgba(20,60,120,0.2)] ring-1"
          style={{ color: INK, ["--tw-ring-color" as string]: `${l.color}35` }}
        >
          <span className="grid size-[1.7em] shrink-0 place-items-center rounded-md" style={{ background: `${l.color}18`, color: l.color }}>
            <it.Icon weight="fill" className="size-[62%]" />
          </span>
          {it.label}
        </span>
      ))}
    </div>
  );
}

function Gateway({ reduce }: { reduce: boolean }) {
  const above = AGENCIES.slice(0, 3);
  const below = AGENCIES.slice(3);
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.8, ease }}
      className="relative flex min-h-0 flex-col justify-between py-[8%] text-[length:var(--gs-14)]"
    >
      <span aria-hidden className="absolute top-[9%] bottom-[9%] left-[1em] w-[2px] -translate-x-1/2" style={{ background: `linear-gradient(180deg, ${GOLD}55, ${GOLD}, ${GOLD}55)` }} />
      {!reduce &&
        (["10%", "88%"] as const).map((end, k) => (
          <motion.span
            key={end}
            aria-hidden
            className="absolute left-[1em] size-[7px] -translate-x-1/2 rounded-full"
            style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
            animate={{ top: ["50%", end], opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 1.6 + k * 0.9 }}
          />
        ))}

      {above.map((a, k) => (
        <Agency key={a.label} agency={a} delay={1 + k * 0.08} reduce={reduce} />
      ))}

      <div className="relative flex items-center gap-[0.4em]">
        <span className="relative z-10 grid size-[2em] shrink-0 place-items-center rounded-full text-white" style={{ background: "linear-gradient(135deg,#f7a23a,#e06a06)", boxShadow: "0 0 0 3px #fff, 0 6px 14px -4px rgba(224,106,6,0.6)" }}>
          <Plugs weight="fill" className="size-[55%]" />
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full"
              animate={{ boxShadow: ["0 0 0 0 rgba(224,106,6,0.45)", "0 0 0 10px rgba(224,106,6,0)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
            />
          )}
        </span>
        <span className="font-display min-w-0 text-[length:var(--gs-12)] leading-[1.1] font-extrabold text-[#8a4a04]">
          Smart
          <br />
          Middleware
          <br />
          Gateway
        </span>
      </div>

      {below.map((a, k) => (
        <Agency key={a.label} agency={a} delay={1.25 + k * 0.08} reduce={reduce} />
      ))}
    </motion.div>
  );
}

function Agency({ agency: a, delay, reduce }: { agency: Item; delay: number; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay, ease }}
      className="relative flex items-center gap-[0.4em]"
    >
      <span className="relative z-10 grid size-[2em] shrink-0 place-items-center rounded-full bg-[#fff6df] ring-2" style={{ color: GOLD, ["--tw-ring-color" as string]: `${GOLD}99` }}>
        <a.Icon weight="fill" className="size-[55%]" />
      </span>
      <span className="font-display min-w-0 text-[length:var(--gs-13)] leading-tight font-extrabold text-[#6b4a05]">{a.label}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ technology stack */

function StackPanel({ reduce }: { reduce: boolean }) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-5 gap-x-[1.6%] pt-[1.2%]">
      {STACK.map((s, k) => (
        <motion.div
          key={s.name}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 + k * 0.08, ease }}
          className="relative flex min-h-0 min-w-0 flex-col rounded-xl px-[6%] pt-[0.5em] pb-[0.4em]"
          style={{
            background: `linear-gradient(180deg, ${s.color}14 0%, #ffffff 42%)`,
            boxShadow: `inset 0 3px 0 ${s.color}, inset 0 0 0 1px ${s.color}26`,
          }}
        >
          {s.badge && (
            <span className="absolute -top-[0.85em] right-[6%] rounded-full bg-[#fff3d1] px-[0.55em] py-[0.1em] text-[length:var(--gs-12)] leading-snug font-extrabold whitespace-nowrap text-[#8a5a00] uppercase shadow-[0_2px_6px_rgba(192,138,18,0.25)] ring-1 ring-[#f0c14a]">
              {s.badge}
            </span>
          )}
          <span className="mx-auto grid size-[2.1em] shrink-0 place-items-center rounded-full text-[length:var(--gs-14)] text-white" style={{ background: `linear-gradient(135deg, ${s.color}bb, ${s.color})`, boxShadow: `0 4px 10px -3px ${s.color}aa` }}>
            <s.Icon weight="fill" className="size-[52%]" />
          </span>
          <p className="font-display mt-[0.25em] text-center text-[length:var(--gs-16)] leading-tight font-extrabold" style={{ color: s.color }}>
            {s.name}
          </p>
          <p className="mt-[0.15em] text-center text-[length:var(--gs-12)] leading-tight font-semibold" style={{ color: MUTED }}>
            {s.desc}
          </p>
          <ul className="mt-[0.4em] flex min-h-0 flex-col gap-[0.25em] border-t pt-[0.4em]" style={{ borderColor: `${s.color}26` }}>
            {s.items.map((it) => (
              <li key={it} className="flex items-start gap-[0.35em] text-[length:var(--gs-13)] leading-tight font-semibold text-[#17365f]">
                <s.Icon weight="fill" className="mt-[0.05em] size-[1.1em] shrink-0" style={{ color: s.color }} />
                {it}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ security */

function FlowBox({ title, Icon, steps, delay, reduce }: { title: string; Icon: CessIcon; steps: Node[]; delay: number; reduce: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-[0.35em] rounded-xl bg-white px-[0.8em] py-[0.4em] ring-1 ring-[#e0eaf5]">
      <p className="font-display flex items-center gap-[0.4em] text-[length:var(--gs-14)] leading-tight font-extrabold" style={{ color: INK }}>
        <Icon weight="fill" className="size-[1.2em] text-[#1d66dc]" />
        {title}
      </p>
      <div className="relative grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start">
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute top-[0.95em] size-[7px] -translate-y-1/2 rounded-full bg-[#1d66dc] shadow-[0_0_8px_#1d66dc]"
            animate={{ left: ["12%", "88%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: delay + 0.6 }}
          />
        )}
        {steps.flatMap((s, k) => {
          const node = (
            <motion.div
              key={s.label}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: delay + k * 0.1, ease }}
              className="flex min-w-0 flex-col items-center gap-[0.15em] text-center"
            >
              <span className="grid size-[1.9em] place-items-center rounded-full bg-white text-[length:var(--gs-16)] ring-2" style={{ color: s.color, ["--tw-ring-color" as string]: s.color, background: `${s.color}10` }}>
                <s.Icon weight="fill" className="size-[52%]" />
              </span>
              <span className="font-display text-[length:var(--gs-13)] leading-tight font-extrabold" style={{ color: INK }}>
                {s.label}
              </span>
              {s.note && <span className="text-[length:var(--gs-12)] leading-tight font-semibold" style={{ color: MUTED }}>{s.note}</span>}
            </motion.div>
          );
          return k === 0
            ? [node]
            : [<ArrowRight key={`${s.label}-arrow`} weight="bold" className="mt-[0.55em] size-[1.2em] text-[length:var(--gs-14)]" style={{ color: steps[k - 1].color }} />, node];
        })}
      </div>
    </div>
  );
}

function NoteBox({ lines, art, delay, reduce }: { lines: { text: string; Icon: CessIcon }[]; art: string; delay: number; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease }}
      className="relative flex min-h-0 flex-1 items-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#f4f9ff,#e9f2fd)] px-[0.7em] py-[0.4em] ring-1 ring-[#dbe8f6]"
    >
      <div className="relative z-10 flex w-[62%] flex-col gap-[0.35em]">
        {lines.map((l) => (
          <span key={l.text} className="flex items-start gap-[0.35em] text-[length:var(--gs-12)] leading-tight font-semibold text-[#17365f]">
            <l.Icon weight="fill" className="mt-[0.05em] size-[1.15em] shrink-0 text-[#16a34a]" />
            {l.text}
          </span>
        ))}
      </div>
      <img src={art} alt="" aria-hidden draggable={false} className="pointer-events-none absolute right-[3%] bottom-[6%] h-[88%] w-[36%] object-contain mix-blend-multiply select-none" />
    </motion.div>
  );
}

function SecurityPanel({ reduce }: { reduce: boolean }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[0.5em]">
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_30%] gap-x-[2%]">
        <div className="flex min-h-0 flex-col gap-[0.45em]">
          <FlowBox title="Authentication Flow" Icon={Lock} steps={AUTH} delay={0.2} reduce={reduce} />
          <FlowBox title="Post / Designation Model" Icon={UsersThree} steps={POST_MODEL} delay={0.5} reduce={reduce} />
        </div>
        <div className="flex min-h-0 flex-col gap-[0.45em]">
          <NoteBox
            lines={[
              { text: "Keycloak and JWT handle sign-in and permissions.", Icon: CheckCircle },
              { text: "Portal logins use two-factor.", Icon: CheckCircle },
            ]}
            art={artLock}
            delay={0.6}
            reduce={reduce}
          />
          <NoteBox
            lines={[
              { text: "On transfer, access re-points automatically.", Icon: ArrowsClockwise },
              { text: "Access attaches to the office, not the person.", Icon: CheckCircle },
            ]}
            art={artUsers}
            delay={0.75}
            reduce={reduce}
          />
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-x-[2%]">
        {BADGES.map((b, k) => (
          <motion.div
            key={b.label}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.9 + k * 0.08, ease }}
            className="flex items-center gap-[0.5em] rounded-xl bg-[linear-gradient(135deg,#fffaf0,#fff2d6)] px-[0.6em] py-[0.35em] ring-1 ring-[#f0d89a]"
          >
            <span className="grid size-[2em] shrink-0 place-items-center rounded-lg text-white" style={{ background: `linear-gradient(135deg, #e0a83a, ${GOLD})` }}>
              <b.Icon weight="fill" className="size-[55%]" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="font-display block text-[length:var(--gs-12)] font-extrabold text-[#6b4a05]">{b.label}</span>
              <span className="block text-[length:var(--gs-12)] font-semibold text-[#8a6a2a]">{b.note}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ key facts */

function FactsBar({ reduce }: { reduce: boolean }) {
  return (
    <div className="flex min-h-0 items-stretch gap-[0.8%] overflow-hidden rounded-2xl bg-white/88 p-[0.4%] backdrop-blur-[3px] shadow-[0_8px_22px_-10px_rgba(20,60,120,0.3)] ring-1 ring-white">
      <span className="font-display flex shrink-0 items-center gap-[0.5em] rounded-xl bg-[linear-gradient(135deg,#123a8a,#0b2462)] px-[1.4%] text-[length:var(--gs-14)] font-extrabold tracking-wider text-white">
        <Lightning weight="fill" className="size-[1.2em] text-[#fbbf24]" />
        KEY FACTS
      </span>
      {FACTS.map((f, k) => (
        <motion.span
          key={f.label}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 + k * 0.08, ease }}
          className="flex min-w-0 flex-1 items-center gap-[0.5em] border-l border-[#e3ecf6] px-[0.8%] text-[length:var(--gs-12)] leading-tight font-bold text-[#17365f]"
        >
          <span className="grid size-[1.9em] shrink-0 place-items-center rounded-full bg-[#e6f0fd] text-[#1d66dc]">
            <f.Icon weight="fill" className="size-[55%]" />
          </span>
          {f.label}
        </motion.span>
      ))}
    </div>
  );
}
