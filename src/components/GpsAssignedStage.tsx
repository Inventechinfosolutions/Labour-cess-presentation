import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowRight,
  Bank,
  Bell,
  Buildings,
  CalendarBlank,
  CaretRight,
  ClipboardText,
  DeviceMobile,
  FileText,
  House,
  IdentificationCard,
  List,
  MagnifyingGlass,
  MapPin,
  MapTrifold,
  PencilSimple,
  User,
  UsersThree,
  WifiSlash,
} from "@/lib/icons";
import { stageFont } from "@/lib/stageFont";
import inspectorPhone from "@/assets/gps-inspector-phone.jpg";
import abcPhoto from "@/assets/prj-site-photo.jpg";
import xyzPhoto from "@/assets/mw-src-boards.jpg";
import metroPhoto from "@/assets/dn-thumb-metro.jpg";
import stageBg from "@/assets/current-issues-center-bg-wide.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

const FLOW: { label: [string, string?]; Icon: CessIcon; color: string }[] = [
  { label: ["Assigned by", "Department"], Icon: UsersThree, color: "#1b3f7a" },
  { label: ["View in App"], Icon: DeviceMobile, color: "#1f6fd8" },
  { label: ["Go to Site"], Icon: MapPin, color: "#e0302f" },
];

const CAPS: { title: string; body: string; Icon: CessIcon; grad: string }[] = [
  {
    title: "Assigned Projects",
    body: "View projects allocated to the field officer",
    Icon: ClipboardText,
    grad: "linear-gradient(135deg,#1558c0,#3b8cf0)",
  },
  {
    title: "Project Details",
    body: "Access project and location information",
    Icon: FileText,
    grad: "linear-gradient(135deg,#0f8a4c,#2fc57a)",
  },
  {
    title: "Site Location",
    body: "View the project location before visiting",
    Icon: MapPin,
    grad: "linear-gradient(135deg,#e06a06,#f7a23a)",
  },
  {
    title: "Assessment Workspace",
    body: "Start and manage field assessment for the project",
    Icon: PencilSimple,
    grad: "linear-gradient(135deg,#6b35d6,#9d6bff)",
  },
  {
    title: "Offline Ready",
    body: "Continue field work even when connectivity is unavailable*",
    Icon: WifiSlash,
    grad: "linear-gradient(135deg,#d61f45,#f5577a)",
  },
];

const ABC_ROWS: { Icon: CessIcon; text: string }[] = [
  { Icon: IdentificationCard, text: "Project ID: PRJ-000245" },
  { Icon: MapPin, text: "Yelahanka, Bengaluru" },
  { Icon: Buildings, text: "Commercial Building" },
  { Icon: Bank, text: "Urban Development Dept." },
  { Icon: CalendarBlank, text: "Assigned Date: 15 Jan 2025" },
];

const MORE: { name: string; id: string; place: string; photo: string; badge: string; tone: string }[] = [
  {
    name: "XYZ Apartments",
    id: "PRJ-000312",
    place: "Jakkur, Bengaluru",
    photo: xyzPhoto,
    badge: "In Progress",
    tone: "bg-[#e3eefe] text-[#1d5fc6]",
  },
  {
    name: "Metro Station",
    id: "PRJ-000289",
    place: "Mahalakshmi, Bengaluru",
    photo: metroPhoto,
    badge: "Assigned",
    tone: "bg-[#dcf3e6] text-[#12804a]",
  },
];

const TABS = ["All (5)", "Assigned (3)", "In Progress (1)", "Completed (1)"];

const NAV: { label: string; Icon: CessIcon }[] = [
  { label: "Projects", Icon: House },
  { label: "Map", Icon: MapTrifold },
  { label: "Notifications", Icon: Bell },
  { label: "Profile", Icon: User },
];

const STAGE_TYPE = {
  containerType: "size",
  "--gp-26": stageFont(36, 14),
  "--gp-22": stageFont(22, 11),
  "--gp-20": stageFont(20, 10),
  "--gp-17": stageFont(17, 8.5),
  "--gp-15": stageFont(15, 7.5),
  "--gp-13": stageFont(13, 6.5),
  "--gp-12": stageFont(12, 6),
} as CSSProperties;

/** Poster-style "Field Officer Mobile App" stage — assigned projects on the officer's phone. */
export function GpsAssignedStage() {
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setFocus((f) => (f + 1) % CAPS.length), 2200);
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
      className="relative grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_10%] overflow-hidden text-[#122b50]"
      style={{
        ...STAGE_TYPE,
        background: `linear-gradient(180deg, rgba(238,245,253,0.25) 0%, rgba(238,245,253,0.05) 60%), url(${stageBg}) 70% bottom / cover no-repeat, #eef5fd`,
      }}
    >
      {/* Inspector on site — left backdrop */}
      <motion.img
        src={inspectorPhone}
        alt="Labour Inspector checking assigned projects on the field app at a construction site"
        draggable={false}
        initial={reduce ? false : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease }}
        className="pointer-events-none absolute inset-y-0 left-0 h-full w-[52%] object-cover object-[center_30%] select-none"
        style={{
          maskImage: "linear-gradient(90deg,#000 0%,#000 62%,rgba(0,0,0,0.55) 80%,transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg,#000 0%,#000 62%,rgba(0,0,0,0.55) 80%,transparent 100%)",
        }}
      />

      <div className="relative grid min-h-0 grid-cols-[35%_28%_minmax(0,1fr)] gap-x-[1.6%] px-[1.4%] pt-[1.2%] pb-[1%]">
        {/* On-site chip */}
        <div className="relative min-h-0">
          <motion.span
            {...rise(0.5, -10, 0)}
            className="absolute top-[3%] left-[3%] flex items-center gap-[0.5em] rounded-full bg-white/92 px-[0.9em] py-[0.45em] text-[length:var(--gp-13)] leading-none font-bold text-[#123a6e] shadow-[0_6px_16px_rgba(10,30,70,0.2)] backdrop-blur-sm"
          >
            <motion.span
              className="size-[0.6em] rounded-full bg-[#18a058]"
              animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            On Site
            <span className="font-semibold text-[#4d6784]">· Yelahanka, Bengaluru</span>
          </motion.span>
        </div>

        {/* Phone mockup */}
        <div className="flex min-h-0 items-center justify-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease }}
            className="relative aspect-[9/18.6] h-full max-h-full rounded-[7cqh] bg-[linear-gradient(145deg,#2a2f3a,#0c0f16)] p-[2.2cqh] shadow-[0_30px_60px_rgba(8,20,50,0.45),inset_0_0_0_2px_rgba(255,255,255,0.08)] [container-type:size]"
          >
            <PhoneScreen reduce={!!reduce} />
          </motion.div>
        </div>

        {/* Flow + key capabilities */}
        <div className="flex min-h-0 flex-col gap-[3%]">
          <motion.div {...rise(0.3, 0, -8)} className="flex items-start justify-between px-[3%] pt-[1%]">
            {FLOW.map((f, i) => (
              <div key={f.label[0]} className="contents">
                <div className="flex flex-col items-center gap-[0.35em] text-center">
                  <span
                    className="grid size-[2.6em] place-items-center rounded-2xl bg-white text-[length:var(--gp-15)] shadow-[0_6px_14px_rgba(20,50,100,0.16)] ring-1 ring-[#d7e5f4]"
                    style={{ color: f.color }}
                  >
                    <f.Icon weight="fill" className="size-[58%]" />
                  </span>
                  <span className="text-[length:var(--gp-13)] leading-[1.15] font-bold text-[#123a6e]">
                    {f.label[0]}
                    {f.label[1] && <br />}
                    {f.label[1]}
                  </span>
                </div>
                {i < FLOW.length - 1 && (
                  <span className="relative mt-[1.2em] flex h-[2px] flex-1 items-center bg-[#9cc0ee] text-[length:var(--gp-15)]">
                    <ArrowRight weight="bold" className="absolute -right-[0.3em] size-[0.9em] text-[#3b82f6]" />
                    {!reduce && (
                      <motion.span
                        className="absolute size-[0.45em] rounded-full bg-[#1f6fd8]"
                        animate={{ left: ["0%", "90%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 + i * 0.75, repeatDelay: 0.6 }}
                      />
                    )}
                  </span>
                )}
              </div>
            ))}
          </motion.div>

          <motion.div
            {...rise(0.45, 20, 0)}
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white/80 shadow-[0_16px_40px_rgba(20,60,120,0.16)] ring-1 ring-[#d3e3f4] backdrop-blur-sm"
          >
            <div
              className="font-display w-[58%] bg-[linear-gradient(90deg,#1450b8,#2f7ff0)] py-[2.6%] pr-[6%] pl-[5%] text-[length:var(--gp-22)] leading-none font-extrabold text-white"
              style={{ clipPath: "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)" }}
            >
              Key Capabilities
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-around px-[4%] py-[2%]">
              {CAPS.map((c, i) => {
                const on = !reduce && focus === i;
                return (
                  <motion.div
                    key={c.title}
                    initial={reduce ? false : { opacity: 0, x: 16 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      backgroundColor: on ? "rgba(31,111,216,0.07)" : "rgba(31,111,216,0)",
                    }}
                    transition={{ duration: 0.45, delay: on ? 0 : 0.6 + i * 0.09, ease }}
                    className="flex items-center gap-[4%] rounded-xl border-b border-[#e3ecf6] px-[2.5%] py-[2%] last:border-0"
                  >
                    <motion.span
                      className="grid aspect-square w-[12.5%] max-w-[64px] shrink-0 place-items-center rounded-full text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] ring-2 ring-white"
                      style={{ background: c.grad }}
                      animate={{ scale: on ? 1.1 : 1 }}
                      transition={{ duration: 0.35, ease }}
                    >
                      <c.Icon weight="bold" className="size-[48%]" />
                    </motion.span>
                    <span className="min-w-0">
                      <span className="font-display block text-[length:var(--gp-17)] leading-tight font-extrabold text-[#123a6e]">
                        {c.title}
                      </span>
                      <span className="mt-[0.15em] block text-[length:var(--gp-13)] leading-snug font-semibold text-[#4d6784]">
                        {c.body}
                      </span>
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <p className="px-[5%] pb-[2.2%] text-right text-[length:var(--gp-12)] font-semibold text-[#6b7f99] italic">
              * Proposed solution capability
            </p>
          </motion.div>
        </div>
      </div>

      {/* Key message band */}
      <motion.div
        {...rise(0.9, 0, 12)}
        className="relative flex min-h-0 items-center gap-[1.6%] overflow-hidden px-[2.4%] text-white shadow-[0_-6px_18px_rgba(10,30,80,0.22),inset_0_1px_0_rgba(255,255,255,0.35)]"
        style={{
          background:
            "radial-gradient(120% 160% at 85% -40%, rgba(120,180,255,0.45), transparent 55%), linear-gradient(180deg,#2a6fe0 0%,#1450c0 42%,#0b3c9e 100%)",
        }}
      >
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent)]" />
        <span className="relative grid aspect-[0.8/1] h-[72%] shrink-0 place-items-center">
          <DeviceMobile weight="regular" className="size-full" />
          <MapPin weight="regular" className="absolute top-[30%] left-1/2 size-[42%] -translate-x-1/2" />
        </span>
        <span aria-hidden className="h-[52%] w-px bg-white/45" />
        <p className="font-display relative text-[length:var(--gp-26)] leading-tight font-semibold tracking-[-0.01em] whitespace-nowrap">
          <span className="font-extrabold text-[#ffc629]">One mobile workspace</span> for field officers to access and manage
          their assigned projects.
        </p>
      </motion.div>
    </div>
  );
}

function PhoneScreen({ reduce }: { reduce: boolean }) {
  const item = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease },
        };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[5cqh] bg-[#f3f7fc] text-[#17365f]">
      {/* Status bar + app bar */}
      <div className="bg-[linear-gradient(180deg,#1552c4,#1d66dc)] px-[5%] pt-[1.54cqh] pb-[2.05cqh] text-white">
        <div className="flex items-center justify-between text-[2.05cqh] leading-none font-bold">
          <span>9:41</span>
          <span className="h-[1.9cqh] w-[26%] rounded-full bg-black/85" />
          <span className="tracking-[0.1em]">▮▮▮</span>
        </div>
        <div className="mt-[2.05cqh] flex items-center justify-between">
          <List weight="bold" className="size-[3.33cqh]" />
          <span className="font-display text-[2.69cqh] leading-none font-extrabold">My Assigned Projects</span>
          <span className="relative">
            <Bell weight="fill" className="size-[3.20cqh]" />
            <motion.span
              className="absolute -top-[0.7cqh] -right-[0.7cqh] grid size-[2.18cqh] place-items-center rounded-full bg-[#ef3b3b] text-[1.41cqh] leading-none font-bold"
              animate={reduce ? undefined : { scale: [1, 1.25, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: 1.4 }}
            >
              3
            </motion.span>
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[1.41cqh] px-[4.5%] pt-[1.66cqh]">
        <div className="flex items-center gap-[1.02cqh] rounded-[1.2cqh] bg-white px-[1.54cqh] py-[1.28cqh] text-[1.86cqh] leading-none font-semibold text-[#8093ab] ring-1 ring-[#dbe5f1]">
          <MagnifyingGlass weight="bold" className="size-[2.18cqh]" />
          Search projects...
        </div>
        <div className="flex justify-between border-b border-[#dbe5f1] text-[1.66cqh] leading-none font-bold whitespace-nowrap">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={
                i === 0 ? "border-b-2 border-[#1d66dc] pb-[1.02cqh] text-[#1d66dc]" : "pb-[1.02cqh] text-[#6b7f99]"
              }
            >
              {t}
            </span>
          ))}
        </div>

        {/* Highlighted ABC card */}
        <motion.div
          {...item(0.7)}
          className="rounded-[1.6cqh] bg-[#eaf3ff] p-[1.54cqh] shadow-[0_4px_12px_rgba(29,102,220,0.14)] ring-[1.5px] ring-[#9cc3f5]"
        >
          <div className="flex gap-[1.54cqh]">
            <img src={abcPhoto} alt="" draggable={false} className="aspect-[1/1.05] w-[36%] shrink-0 rounded-[1cqh] object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-[0.77cqh]">
                <p className="font-display text-[2.18cqh] leading-tight font-extrabold text-[#0f2e63]">ABC Commercial Complex</p>
                <CaretRight weight="bold" className="mt-[0.38cqh] size-[2.18cqh] shrink-0 text-[#1d66dc]" />
              </div>
              <span className="mt-[0.77cqh] inline-block rounded-[0.6cqh] bg-[#dcf3e6] px-[1.15cqh] py-[0.45cqh] text-[1.54cqh] leading-none font-bold text-[#12804a]">
                Assigned
              </span>
              <ul className="mt-[0.90cqh] space-y-[0.58cqh]">
                {ABC_ROWS.map((r) => (
                  <li key={r.text} className="flex items-center gap-[0.77cqh] text-[1.56cqh] leading-none font-semibold text-[#3f5b7c]">
                    <r.Icon weight="fill" className="size-[1.79cqh] shrink-0 text-[#1d4f9a]" />
                    <span className="truncate">{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <motion.div
            className="relative mt-[1.41cqh] flex items-center justify-center gap-[0.77cqh] overflow-hidden rounded-[1cqh] bg-[#1d66dc] py-[1.28cqh] text-[1.86cqh] leading-none font-bold text-white"
            animate={reduce ? undefined : { boxShadow: ["0 0 0 0 rgba(29,102,220,0)", "0 0 0 5px rgba(29,102,220,0.22)", "0 0 0 0 rgba(29,102,220,0)"] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }}
          >
            View Project <ArrowRight weight="bold" className="size-[1.92cqh]" />
          </motion.div>
        </motion.div>

        {MORE.map((m, i) => (
          <motion.div
            key={m.name}
            {...item(0.85 + i * 0.1)}
            className="flex items-center gap-[1.54cqh] rounded-[1.4cqh] bg-white p-[1.28cqh] shadow-[0_2px_8px_rgba(20,50,100,0.08)] ring-1 ring-[#e0e9f4]"
          >
            <img src={m.photo} alt="" draggable={false} className="aspect-[1.25/1] w-[30%] shrink-0 rounded-[0.9cqh] object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-[1.02cqh] gap-y-[0.4cqh]">
                <p className="text-[1.92cqh] leading-tight font-extrabold text-[#0f2e63]">{m.name}</p>
                <span className={`shrink-0 rounded-[0.6cqh] px-[1.02cqh] py-[0.38cqh] text-[1.41cqh] leading-none font-bold ${m.tone}`}>
                  {m.badge}
                </span>
              </div>
              <p className="mt-[0.64cqh] flex items-center gap-[0.64cqh] text-[1.54cqh] leading-none font-semibold text-[#3f5b7c]">
                <IdentificationCard weight="fill" className="size-[1.66cqh] text-[#1d4f9a]" />
                Project ID: {m.id}
              </p>
              <p className="mt-[0.58cqh] flex items-center gap-[0.64cqh] text-[1.54cqh] leading-none font-semibold text-[#3f5b7c]">
                <MapPin weight="fill" className="size-[1.66cqh] text-[#1d4f9a]" />
                {m.place}
              </p>
            </div>
            <CaretRight weight="bold" className="size-[2.05cqh] shrink-0 text-[#1d66dc]" />
          </motion.div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="mt-[1.28cqh] grid grid-cols-4 border-t border-[#dbe5f1] bg-white px-[3%] pt-[1.28cqh] pb-[1.79cqh]">
        {NAV.map((n, i) => (
          <span
            key={n.label}
            className={`flex flex-col items-center gap-[0.51cqh] text-[1.47cqh] leading-none font-bold ${i === 0 ? "text-[#1d66dc]" : "text-[#7b8ea8]"}`}
          >
            <n.Icon weight={i === 0 ? "fill" : "regular"} className="size-[2.82cqh]" />
            {n.label}
          </span>
        ))}
      </div>
    </div>
  );
}
