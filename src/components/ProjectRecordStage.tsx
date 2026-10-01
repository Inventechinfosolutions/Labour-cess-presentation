import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowsLeftRight,
  Bank,
  Buildings,
  ChartBar,
  CheckCircle,
  Clock,
  Coins,
  CurrencyInr,
  DownloadSimple,
  Factory,
  FileText,
  Files,
  HardHat,
  Lightning,
  LinkSimple,
  MagnifyingGlass,
  MapPin,
  ShieldCheck,
  Shuffle,
  Stack,
  UsersThree,
} from "@/lib/icons";
import { stageFont } from "@/lib/stageFont";
import { FilePacket } from "@/components/MiddlewareStage";
import sitePhoto from "@/assets/prj-site-photo.jpg";
import { BENGALURU_POINT, KARNATAKA_DISTRICTS, KARNATAKA_VIEWBOX } from "@/lib/karnatakaMap";
import stageBg from "@/assets/mw-stage-bg.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

const SOURCES: { title: string; lines: string[]; Icon: CessIcon; color: string; grad: string }[] = [
  {
    title: "Government Departments",
    lines: ["Project / Tender data", "Approvals / Permits", "Construction details"],
    Icon: Bank,
    color: "#1f6fd8",
    grad: "linear-gradient(135deg,#0a3f8f,#2a7fe6)",
  },
  {
    title: "ULBs & Planning Authorities",
    lines: ["Building plan approvals", "Land use / property details", "Project information"],
    Icon: Buildings,
    color: "#e0800b",
    grad: "linear-gradient(135deg,#b35900,#f39a1e)",
  },
  {
    title: "Boards & Corporations",
    lines: ["Project data", "Infrastructure works", "Construction contracts"],
    Icon: Factory,
    color: "#7041d9",
    grad: "linear-gradient(135deg,#4a1ea6,#8b5cf6)",
  },
  {
    title: "Utilities & Infrastructure Providers",
    lines: ["Project information", "Utility connection data", "Construction activity indicators"],
    Icon: Lightning,
    color: "#169c57",
    grad: "linear-gradient(135deg,#0b6b3a,#22b86a)",
  },
  {
    title: "CESS Collection Agencies",
    lines: ["CESS deduction data", "Collection / remittance data", "Payment / transaction details"],
    Icon: UsersThree,
    color: "#e43a70",
    grad: "linear-gradient(135deg,#a3164a,#f0507f)",
  },
  {
    title: "Builders / Contractors",
    lines: ["Project / registration details", "Construction information", "Supporting documents"],
    Icon: HardHat,
    color: "#d69108",
    grad: "linear-gradient(135deg,#9a6400,#f0b429)",
  },
];

const STEPS: { label: string; Icon: CessIcon }[] = [
  { label: "Receive Data", Icon: DownloadSimple },
  { label: "Validate Data", Icon: CheckCircle },
  { label: "Map & Transform", Icon: Shuffle },
  { label: "Identify / Match Project", Icon: LinkSimple },
  { label: "Route to Platform", Icon: ArrowsLeftRight },
];

const IDENTITY: { Icon: CessIcon; text: string }[] = [
  { Icon: MapPin, text: "Bengaluru, Karnataka" },
  { Icon: Buildings, text: "Commercial" },
  { Icon: CurrencyInr, text: "20.00 Crore" },
  { Icon: Bank, text: "Urban Development Department" },
];

const TABS: { label: string; Icon: CessIcon; grad: string }[] = [
  { label: "Project Details", Icon: FileText, grad: "linear-gradient(135deg,#1558c0,#3b8cf0)" },
  { label: "CESS Deductions", Icon: Coins, grad: "linear-gradient(135deg,#c81e55,#f25584)" },
  { label: "Remittances", Icon: ArrowUpRight, grad: "linear-gradient(135deg,#0f8a4c,#2fc57a)" },
  { label: "Documents", Icon: Files, grad: "linear-gradient(135deg,#6b35d6,#9d6bff)" },
  { label: "Audit Trail", Icon: Clock, grad: "linear-gradient(135deg,#e06a06,#f7a23a)" },
];

const SUMMARY: [string, string][] = [
  ["Project ID", "PRJ-000245"],
  ["Project Name", "ABC Commercial Complex"],
  ["Location", "Bengaluru, Karnataka"],
  ["Project Type", "Commercial Building"],
  ["Estimated Cost", "₹ 20.00 Crore"],
  ["Developer", "ABC Constructions Pvt Ltd"],
  ["Department", "Urban Development Dept."],
  ["Timeline", "Jan 2025 – Dec 2026"],
  ["Source Systems", "e-Procurement, ULB"],
];

const PANELS: {
  title: string;
  tag?: string;
  Icon: CessIcon;
  color: string;
  grad: string;
  fields: [string, string][];
  listTitle: string;
  list: string[];
}[] = [
  {
    title: "Project Information",
    tag: "Initial / Periodic",
    Icon: FileText,
    color: "#1f6fd8",
    grad: "linear-gradient(135deg,#1558c0,#3b8cf0)",
    fields: [
      ["Source Agency", "Urban Development Dept."],
      ["Source System", "e-Procurement"],
      ["Reference No.", "TENDER-2025-00123"],
      ["Project Value", "₹ 20.00 Crore"],
      ["Approval / Permit", "BP-2025-4567"],
      ["Received Date", "15 Jan 2025"],
    ],
    listTitle: "Typical Data",
    list: [
      "Project / Tender data",
      "Approval / Permit data",
      "Project type",
      "Location / Land details",
      "Estimated cost",
      "Contractor / Developer",
    ],
  },
  {
    title: "CESS Deduction Details",
    tag: "Periodic",
    Icon: Coins,
    color: "#e0336a",
    grad: "linear-gradient(135deg,#c81e55,#f25584)",
    fields: [
      ["Deducting Agency", "Public Works Department"],
      ["Source System", "Treasury System"],
      ["Deduction Date", "15 Mar 2025"],
      ["Deduction Amount", "₹ 25,00,000"],
      ["Transaction Ref.", "TXN-20250315-7890"],
      ["Received Date", "16 Mar 2025"],
    ],
    listTitle: "Typical Data",
    list: [
      "Deducting agency",
      "Deduction amount",
      "Deduction date",
      "Transaction reference",
      "Project reference",
      "Period (month / quarter)",
    ],
  },
  {
    title: "Remittance Details",
    tag: "Periodic",
    Icon: ArrowUpRight,
    color: "#139a55",
    grad: "linear-gradient(135deg,#0f8a4c,#2fc57a)",
    fields: [
      ["Remitting Agency", "Public Works Department"],
      ["Source System", "Bank / Treasury"],
      ["Remittance Date", "10 Apr 2025"],
      ["Remittance Amount", "₹ 25,00,000"],
      ["Bank Reference", "BRN-20250410-4567"],
      ["Received Date", "11 Apr 2025"],
    ],
    listTitle: "Typical Data",
    list: [
      "Remitting agency",
      "Remittance amount",
      "Remittance date",
      "Bank / transaction ref.",
      "Project reference",
      "Period (month / quarter)",
    ],
  },
  {
    title: "Documents & Supporting Information",
    Icon: Files,
    color: "#7041d9",
    grad: "linear-gradient(135deg,#6b35d6,#9d6bff)",
    fields: [
      ["Document Type", "Building Plan Approval"],
      ["Document No.", "BP-2025-4567"],
      ["Uploaded By", "Urban Development Dept."],
      ["Uploaded Date", "15 Jan 2025"],
      ["Source", "Integration / Portal"],
    ],
    listTitle: "Typical Documents",
    list: [
      "Approvals / permits",
      "Tender documents",
      "Contracts",
      "Deduction / remittance proofs",
      "Photos / site documents",
      "Correspondence",
    ],
  },
];

const OUTCOMES: { text: string; Icon: CessIcon; grad: string }[] = [
  { text: "One project record consolidating data from multiple sources", Icon: Stack, grad: "linear-gradient(135deg,#0e8f86,#2cc7b4)" },
  { text: "All CESS information linked to the project", Icon: LinkSimple, grad: "linear-gradient(135deg,#6b35d6,#9d6bff)" },
  { text: "Validated, consistent and traceable data", Icon: ShieldCheck, grad: "linear-gradient(135deg,#e06a06,#f7a23a)" },
  { text: "Ready for CESS assessment, tracking and reconciliation", Icon: MagnifyingGlass, grad: "linear-gradient(135deg,#1558c0,#3b8cf0)" },
  { text: "Complete project history and audit trail", Icon: ChartBar, grad: "linear-gradient(135deg,#c81e55,#f25584)" },
];

const STAGE_TYPE = {
  containerType: "size",
  "--pr-26": stageFont(26, 12),
  "--pr-20": stageFont(20, 10),
  "--pr-17": stageFont(17, 8.5),
  "--pr-15": stageFont(15, 7.5),
  "--pr-14": stageFont(14, 7),
  "--pr-13": stageFont(13, 6.5),
  "--pr-12": stageFont(12, 6),
  "--pr-11": stageFont(11, 5.5),
} as CSSProperties;

type Branch = { d: string; color: string };

/** Poster-style "From Integrated Data to a Project-Linked Record" stage. */
export function ProjectRecordStage() {
  const reduce = useReducedMotion();
  const linkRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const a = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1300);
    const b = window.setInterval(() => setFocus((f) => (f + 1) % PANELS.length), 2400);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [reduce]);

  useLayoutEffect(() => {
    const link = linkRef.current;
    const card = cardRef.current;
    if (!link || !card) return;
    const sync = () => {
      const l = link.getBoundingClientRect();
      if (!l.width) return;
      // SlideViewport may scale the canvas; convert screen px back to layout px.
      const k = link.offsetWidth / l.width;
      const c = card.getBoundingClientRect();
      const w = link.offsetWidth;
      const y0 = (c.top + c.height * 0.5 - l.top) * k;
      const next: Branch[] = [];
      PANELS.forEach((p, i) => {
        const el = panelRefs.current[i];
        if (!el) return;
        const r = el.getBoundingClientRect();
        const y = (r.top + r.height / 2 - l.top) * k;
        next.push({
          d: `M 0 ${y0} C ${w * 0.55} ${y0}, ${w * 0.35} ${y}, ${w - 3} ${y}`,
          color: p.color,
        });
      });
      setBranches(next);
    };
    sync();
    const timers = [700, 1500].map((ms) => window.setTimeout(sync, ms));
    const ro = new ResizeObserver(sync);
    ro.observe(link);
    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

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
      className="relative grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_10.5%] gap-y-[1%] overflow-hidden px-[0.9%] pt-[0.8%] pb-[0.7%] text-[#122b50]"
      style={{
        ...STAGE_TYPE,
        background: `radial-gradient(circle at 52% 45%, rgba(48,155,255,0.12), transparent 34%), url(${stageBg}) center bottom / cover no-repeat, #f2f8ff`,
      }}
    >
      <div className="grid min-h-0 grid-cols-[23.5%_15.5%_minmax(0,1fr)_3.4%_31%]">
        {/* Left — integrated sources */}
        <div className="flex min-h-0 flex-col gap-[1.6%]">
          <motion.div
            {...rise(0, -14, 0)}
            className="mr-[9%] rounded-xl bg-[linear-gradient(135deg,#0d3f8a,#1f6fd8)] px-[5%] py-[2.2%] text-white shadow-[0_6px_16px_rgba(20,70,150,0.25)]"
          >
            <p className="font-display text-[length:var(--pr-17)] leading-tight font-extrabold">
              Data from Integrated Sources
            </p>
            <p className="text-[length:var(--pr-13)] leading-tight font-semibold text-white/80">(from Slide 1)</p>
          </motion.div>
          {SOURCES.map((s, i) => (
            <motion.div key={s.title} {...rise(0.08 + i * 0.07, -18, 0)} className="flex min-h-0 flex-1 items-center">
              <div
                className="flex h-full min-w-0 flex-1 items-center gap-[4%] rounded-xl border-[1.5px] bg-white px-[4%]"
                style={{
                  borderColor: `${s.color}99`,
                  background: `linear-gradient(90deg,${s.color}3d 0%,${s.color}14 75%),#ffffff`,
                  boxShadow: `0 5px 14px ${s.color}33, inset 0 1px 0 rgba(255,255,255,0.8)`,
                }}
              >
                <span
                  className="grid aspect-square w-[18%] max-w-[50px] shrink-0 place-items-center rounded-full text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)] ring-2 ring-white"
                  style={{ background: s.grad }}
                >
                  <s.Icon weight="fill" className="size-[54%]" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[length:var(--pr-15)] leading-[1.12] font-extrabold text-[#123a6e]">
                    {s.title}
                  </h3>
                  <ul className="mt-[2px]">
                    {s.lines.map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-[0.4em] text-[length:var(--pr-12)] leading-[1.28] font-semibold text-[#4d6784]"
                      >
                        <span className="mt-[0.5em] size-[0.38em] shrink-0 rounded-full" style={{ background: s.color }} />
                        <span className="min-w-0">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <FlowArrow color={s.color} delay={0.4 + i * 0.28} reduce={!!reduce} />
            </motion.div>
          ))}
        </div>

        {/* Smart Middleware pipeline */}
        <div className="flex min-h-0 items-stretch">
          <motion.div
            {...rise(0.2, 0, 12)}
            className="my-[6%] flex min-w-0 flex-1 flex-col rounded-2xl bg-[linear-gradient(180deg,#123f86_0%,#0b2b62_100%)] px-[6%] py-[5%] text-white shadow-[0_14px_34px_rgba(10,40,100,0.32)] ring-2 ring-white/80"
          >
            <div className="text-center">
              <p className="font-display text-[length:var(--pr-17)] leading-tight font-extrabold">Smart Middleware</p>
              <p className="text-[length:var(--pr-13)] font-semibold text-white/75">(Integration Engine)</p>
            </div>
            <div className="mt-[8%] flex min-h-0 flex-1 flex-col justify-between">
              {STEPS.map((st, i) => {
                const on = !reduce && step === i;
                return (
                  <div key={st.label} className="flex flex-col items-center">
                    {i > 0 && (
                      <ArrowDown
                        weight="bold"
                        className="-mt-[2%] mb-[4%] size-[1.05em] text-[length:var(--pr-14)] text-[#7fb8ff]"
                      />
                    )}
                    <motion.div
                      className="flex w-full items-center gap-[7%] rounded-xl bg-white px-[7%] py-[7%] text-[#123a6e]"
                      animate={{
                        scale: on ? 1.05 : 1,
                        boxShadow: on
                          ? "0 0 0 2.5px #f5b21b, 0 0 18px rgba(245,178,27,0.65)"
                          : "0 0 0 0px rgba(245,178,27,0), 0 4px 10px rgba(0,0,0,0.18)",
                      }}
                      transition={{ duration: 0.35, ease }}
                    >
                      <span className="grid aspect-square w-[24%] shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#1558c0,#3b8cf0)] text-white">
                        <st.Icon weight="bold" className="size-[55%]" />
                      </span>
                      <span className="text-[length:var(--pr-13)] leading-[1.15] font-bold">{st.label}</span>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <div className="mt-[8%] border-t border-white/20 pt-[6%] text-center text-[length:var(--pr-12)] leading-[1.5] font-semibold whitespace-pre text-white/85">
              {"API  |  File  |  REST  |  SOAP\nPortal  |  Manual"}
            </div>
          </motion.div>
          <BigArrow reduce={!!reduce} />
        </div>

        {/* Project 360 — one record */}
        <motion.div
          ref={cardRef}
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_rgba(20,70,140,0.2)] ring-2 ring-[#2b7de0]/40"
        >
          <div className="bg-[linear-gradient(135deg,#0b3a82,#1f6fd1)] px-[4%] py-[1.8%] text-center text-white">
            <h2 className="font-display text-[length:var(--pr-26)] leading-tight font-extrabold tracking-[0.02em]">
              PROJECT 360
            </h2>
            <p className="text-[length:var(--pr-14)] leading-tight font-semibold text-white/85">
              One Project Record for all related information
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-[2.2%] px-[3.2%] pt-[2.6%] pb-[3%]">
            <div className="grid h-[31%] min-h-0 grid-cols-[48%_minmax(0,1fr)] gap-[4%]">
              <motion.img
                src={sitePhoto}
                alt="ABC Commercial Complex under construction"
                draggable={false}
                {...rise(0.5, 0, 0)}
                className="h-full w-full rounded-xl object-cover shadow-[0_6px_16px_rgba(20,50,90,0.22)]"
              />
              <motion.div {...rise(0.6, 10, 0)} className="flex min-w-0 flex-col justify-center gap-[5%]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-[length:var(--pr-17)] font-extrabold text-[#123a6e]">PRJ-000245</span>
                  <span className="flex items-center gap-[0.35em] rounded-md bg-[#18a058] px-[0.7em] py-[0.25em] text-[length:var(--pr-12)] leading-none font-bold text-white">
                    <motion.span
                      className="size-[0.45em] rounded-full bg-white"
                      animate={reduce ? undefined : { opacity: [1, 0.25, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                    Active
                  </span>
                </div>
                <p className="text-[length:var(--pr-15)] leading-tight font-extrabold text-[#1a3f70]">ABC Commercial Complex</p>
                {IDENTITY.map((row) => (
                  <p
                    key={row.text}
                    className="flex items-center gap-[0.55em] text-[length:var(--pr-13)] leading-tight font-semibold text-[#3f5b7c]"
                  >
                    <row.Icon weight="fill" className="size-[1.15em] shrink-0 text-[#1f5fb8]" />
                    <span className="min-w-0">{row.text}</span>
                  </p>
                ))}
              </motion.div>
            </div>

            <div className="grid h-[13%] min-h-0 grid-cols-5 gap-[1.8%]">
              {TABS.map((t, i) => {
                const on = !reduce && i < PANELS.length && focus === i;
                return (
                  <motion.div
                    key={t.label}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: on ? -3 : 0, scale: on ? 1.05 : 1 }}
                    transition={{ duration: 0.4, delay: on ? 0 : 0.75 + i * 0.07, ease }}
                    className="flex min-w-0 flex-col items-center justify-center gap-[8%] rounded-lg px-[3%] text-center text-white shadow-[0_5px_12px_rgba(20,40,90,0.2)]"
                    style={{
                      background: t.grad,
                      outline: on ? "2.5px solid #f5b21b" : "2.5px solid transparent",
                      outlineOffset: 1.5,
                    }}
                  >
                    <t.Icon weight="bold" className="size-[1.55em] text-[length:var(--pr-14)]" />
                    <span className="text-[length:var(--pr-11)] leading-[1.1] font-bold">{t.label}</span>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              {...rise(0.9, 0, 10)}
              className="grid min-h-0 flex-1 grid-cols-[63%_minmax(0,1fr)] gap-[3%] rounded-xl border border-[#d6e4f3] bg-[#fbfdff] p-[2.6%]"
            >
              <div className="flex min-h-0 flex-col">
                <h4 className="font-display text-[length:var(--pr-15)] leading-tight font-extrabold text-[#123a6e]">
                  Project Summary
                </h4>
                <dl className="mt-[2.5%] flex min-h-0 flex-1 flex-col justify-between">
                  {SUMMARY.map(([k, v]) => (
                    <div
                      key={k}
                      className="grid grid-cols-[35%_minmax(0,1fr)] gap-[3%] border-b border-dashed border-[#dbe6f2] pb-[1%] text-[length:var(--pr-12)] leading-[1.2] last:border-0"
                    >
                      <dt className="font-semibold text-[#5b7390]">{k}</dt>
                      <dd className="font-bold text-[#17365f]">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="flex min-h-0 flex-col overflow-hidden rounded-lg bg-[linear-gradient(90deg,#a9cdee_0%,#cfe3f6_40%,#e3eefa_100%)] ring-1 ring-[#d6e4f3]">
                <div className="m-[4%] mb-0 flex items-start gap-[0.4em] rounded-md bg-white/92 px-[0.6em] py-[0.4em] shadow-sm">
                  <MapPin weight="fill" className="mt-[0.1em] size-[1.2em] shrink-0 text-[length:var(--pr-12)] text-[#e0302f]" />
                  <span className="text-[length:var(--pr-11)] leading-[1.2]">
                    <b className="block text-[#123a6e]">Project Location</b>
                    <span className="font-semibold text-[#4d6784]">Bengaluru, Karnataka</span>
                  </span>
                </div>
                <KarnatakaMap reduce={!!reduce} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Branch links: record → detail panels */}
        <div ref={linkRef} className="relative min-h-0">
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <defs>
              {branches.map((b, i) => (
                <marker
                  key={i}
                  id={`pr-arrow-${i}`}
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M0 0 L10 5 L0 10 z" fill={b.color} />
                </marker>
              ))}
            </defs>
            {branches.map((b, i) => (
              <g key={i}>
                <motion.path
                  d={b.d}
                  fill="none"
                  stroke={b.color}
                  strokeLinecap="round"
                  markerEnd={`url(#pr-arrow-${i})`}
                  initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1, strokeWidth: !reduce && focus === i ? 3.6 : 2.4 }}
                  transition={{ duration: 0.8, delay: reduce ? 0 : 0.9 + i * 0.1, ease }}
                />
                {!reduce && (
                  <g opacity={0}>
                    <g transform="scale(0.8)">
                      <FilePacket color={b.color} />
                    </g>
                    <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${1.6 + i * 0.6}s`} path={b.d} />
                    <set attributeName="opacity" to="1" begin={`${1.6 + i * 0.6}s`} />
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Right — linked detail panels */}
        <div className="flex min-h-0 flex-col gap-[1.6%]">
          {PANELS.map((p, i) => {
            const on = !reduce && focus === i;
            return (
              <motion.div
                key={p.title}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                initial={reduce ? false : { opacity: 0, x: 20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  boxShadow: on
                    ? `0 0 0 2px ${p.color}, 0 10px 24px ${p.color}40`
                    : `0 0 0 1.5px ${p.color}55, 0 5px 14px rgba(20,50,90,0.1)`,
                }}
                transition={{ duration: 0.5, delay: on ? 0 : 1 + i * 0.1, ease }}
                className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white"
              >
                <div
                  className="flex items-center gap-[2.5%] px-[3%] py-[1.4%]"
                  style={{ background: `linear-gradient(90deg,${p.color}52 0%,${p.color}1a 100%)` }}
                >
                  <span
                    className="grid size-[1.9em] shrink-0 place-items-center rounded-full text-[length:var(--pr-15)] text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)] ring-2 ring-white"
                    style={{ background: p.grad }}
                  >
                    <p.Icon weight="bold" className="size-[55%]" />
                  </span>
                  <h3 className="font-display text-[length:var(--pr-15)] leading-tight font-extrabold text-[#123a6e]">
                    {p.title}
                  </h3>
                  {p.tag && (
                    <span className="text-[length:var(--pr-12)] font-bold whitespace-nowrap" style={{ color: p.color }}>
                      ({p.tag})
                    </span>
                  )}
                </div>
                <div className="grid min-h-0 flex-1 grid-cols-[60%_minmax(0,1fr)] gap-[3%] px-[3%] py-[1.2%]">
                  <dl className="flex min-h-0 flex-col justify-around">
                    {p.fields.map(([k, v]) => (
                      <div
                        key={k}
                        className="grid grid-cols-[43%_minmax(0,1fr)] gap-[3%] text-[length:var(--pr-11)] leading-[1.15]"
                      >
                        <dt className="font-semibold text-[#5b7390]">{k}</dt>
                        <dd className="truncate font-bold text-[#17365f]">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex min-h-0 flex-col justify-center border-l border-[#e1eaf4] pl-[6%]">
                    <p className="text-[length:var(--pr-12)] leading-tight font-extrabold" style={{ color: p.color }}>
                      {p.listTitle}
                    </p>
                    <ul className="mt-[3%]">
                      {p.list.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-[0.4em] text-[length:var(--pr-11)] leading-[1.28] font-semibold text-[#3f5b7c]"
                        >
                          <span className="mt-[0.45em] size-[0.36em] shrink-0 rounded-full" style={{ background: p.color }} />
                          <span className="min-w-0">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Key outcomes band */}
      <motion.div
        {...rise(1.2, 0, 12)}
        className="flex min-h-0 items-stretch overflow-hidden rounded-xl bg-white shadow-[0_8px_22px_rgba(20,50,90,0.12)] ring-1 ring-[#d3e2f2]"
      >
        <div
          className="font-display flex w-[13%] shrink-0 items-center bg-[linear-gradient(135deg,#0b3a82,#1f6fd1)] pr-[2.2%] pl-[2%] text-[length:var(--pr-20)] leading-tight font-extrabold text-white"
          style={{ clipPath: "polygon(0 0, 86% 0, 100% 50%, 86% 100%, 0 100%)" }}
        >
          Key Outcomes
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-5">
          {OUTCOMES.map((o, i) => (
            <motion.div
              key={o.text}
              {...rise(1.35 + i * 0.08, 0, 8)}
              className="flex min-w-0 items-center gap-[5%] border-l border-[#e3ecf6] px-[5%] first:border-0"
            >
              <span
                className="grid aspect-square h-[62%] shrink-0 place-items-center rounded-full text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
                style={{ background: o.grad }}
              >
                <o.Icon weight="bold" className="size-[52%]" />
              </span>
              <span className="text-[length:var(--pr-13)] leading-[1.22] font-bold text-[#17365f]">{o.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const DISTRICT_TINTS = ["#5f9de0", "#5dbd87", "#e2ab45", "#9b82e0", "#e67c9b", "#4fb8c1"];

function KarnatakaMap({ reduce }: { reduce: boolean }) {
  const { x, y } = BENGALURU_POINT;
  return (
    <svg
      viewBox={KARNATAKA_VIEWBOX}
      role="img"
      aria-label="Map of Karnataka with the project location at Bengaluru"
      className="min-h-0 w-full flex-1 px-[6%] py-[5%]"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="pr-ka-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#1d4f8f" floodOpacity="0.28" />
        </filter>
      </defs>
      <motion.g
        filter="url(#pr-ka-shadow)"
        initial={reduce ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 1, ease }}
        style={{ transformOrigin: "50% 50%", transformBox: "fill-box" }}
      >
        {KARNATAKA_DISTRICTS.map((dist, i) => {
          const home = dist.name === "Bengaluru Urban";
          return (
            <path
              key={dist.name}
              d={dist.d}
              fill={home ? "#0b2c63" : DISTRICT_TINTS[i % DISTRICT_TINTS.length]}
              stroke="#ffffff"
              strokeWidth={home ? 1.6 : 1.1}
              strokeLinejoin="round"
            >
              <title>{dist.name}</title>
            </path>
          );
        })}
      </motion.g>
      {!reduce && (
        <motion.circle
          cx={x}
          cy={y}
          fill="none"
          stroke="#e0302f"
          strokeWidth={3}
          initial={{ r: 6, opacity: 0.85 }}
          animate={{ r: [6, 34], opacity: [0.85, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 1.6 }}
        />
      )}
      <motion.g
        initial={reduce ? false : { opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 1.5, ease }}
      >
        <g transform={`translate(${x} ${y}) scale(1.9)`} style={{ filter: "drop-shadow(0 3px 3px rgba(120,20,20,0.35))" }}>
          <path d="M0 0 C-3 -6 -10 -11 -10 -18 A10 10 0 1 1 10 -18 C10 -11 3 -6 0 0 Z" fill="#e0302f" stroke="#fff" strokeWidth={1.3} />
          <circle cx={0} cy={-18} r={4} fill="#fff" />
        </g>
      </motion.g>
    </svg>
  );
}

function FlowArrow({ color, delay, reduce }: { color: string; delay: number; reduce: boolean }) {
  return (
    <span className="relative flex h-[22%] w-[9%] shrink-0 items-center pl-[1.5%]">
      <span className="h-[3px] flex-1 rounded-full" style={{ background: color }} />
      <span className="size-0 border-y-[5px] border-l-[8px] border-y-transparent" style={{ borderLeftColor: color }} />
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-white"
          style={{ boxShadow: `0 0 0 2px ${color}` }}
          animate={{ left: ["4%", "72%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, delay, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
        />
      )}
    </span>
  );
}

function BigArrow({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative flex w-[16%] shrink-0 items-center justify-center">
      <svg viewBox="0 0 40 56" className="w-[86%] overflow-visible drop-shadow-[0_6px_10px_rgba(20,90,200,0.35)]">
        <defs>
          <linearGradient id="pr-big-arrow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3b8cf0" />
            <stop offset="1" stopColor="#1558c0" />
          </linearGradient>
        </defs>
        <path d="M0 16 H20 V2 L40 28 L20 54 V40 H0 Z" fill="url(#pr-big-arrow)" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
      </svg>
      {!reduce && (
        <motion.span
          aria-hidden
          className="absolute top-1/2 h-[3%] w-[22%] -translate-y-1/2 rounded-full bg-white/85"
          animate={{ left: ["8%", "55%"], opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.4, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
