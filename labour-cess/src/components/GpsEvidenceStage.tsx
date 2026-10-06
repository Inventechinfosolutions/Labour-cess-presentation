import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Camera,
  CheckCircle,
  CloudArrowUp,
  Crosshair,
  FileText,
  IdentificationCard,
  Images,
  MapPin,
  ShieldCheck,
  User,
  VideoCamera,
} from "@/lib/icons";
import { stageFont } from "@/lib/stageFont";
import inspectorPhone from "@/assets/gps-inspector-phone.jpg";
import abcPhoto from "@/assets/prj-site-photo.jpg";
import rebarPhoto from "@/assets/est-cap-rcc.jpg";
import excavationPhoto from "@/assets/gps-ev-excavation.jpg";
import satelliteMap from "@/assets/gps-satellite-map.jpg";
import stageBg from "@/assets/current-issues-center-bg-wide.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

const FLOW: { label: [string, string]; Icon: CessIcon; grad: string }[] = [
  { label: ["Navigate", "to Project"], Icon: MapPin, grad: "linear-gradient(135deg,#0f8a4c,#2fc57a)" },
  { label: ["Capture", "Location"], Icon: Camera, grad: "linear-gradient(135deg,#e06a06,#f7a23a)" },
  { label: ["Capture", "Evidence"], Icon: Images, grad: "linear-gradient(135deg,#6b35d6,#9d6bff)" },
  { label: ["Save to", "Project"], Icon: CloudArrowUp, grad: "linear-gradient(135deg,#1558c0,#3b8cf0)" },
];

const KINDS: { title: string; body: string; Icon: CessIcon; grad: string; tint: string }[] = [
  {
    title: "GPS Location",
    body: "Capture exact site location with timestamp",
    Icon: MapPin,
    grad: "linear-gradient(135deg,#0f8a4c,#2fc57a)",
    tint: "#eaf7f0",
  },
  {
    title: "Photos",
    body: "Capture site images with auto location tag",
    Icon: Camera,
    grad: "linear-gradient(135deg,#e06a06,#f7a23a)",
    tint: "#fdf3e7",
  },
  {
    title: "Videos",
    body: "Record site videos with timestamp",
    Icon: VideoCamera,
    grad: "linear-gradient(135deg,#6b35d6,#9d6bff)",
    tint: "#f1ecfd",
  },
  {
    title: "Documents",
    body: "Attach relevant documents on site",
    Icon: FileText,
    grad: "linear-gradient(135deg,#1558c0,#3b8cf0)",
    tint: "#e9f1fd",
  },
];

const EVIDENCE: { photo: string; time: string; coords: string }[] = [
  { photo: abcPhoto, time: "15 Jan 2025, 10:42 AM", coords: "13.0827° N, 77.5871° E" },
  { photo: rebarPhoto, time: "15 Jan 2025, 10:43 AM", coords: "13.0828° N, 77.5872° E" },
  { photo: excavationPhoto, time: "15 Jan 2025, 10:45 AM", coords: "13.0826° N, 77.5869° E" },
];

const OUTCOMES: { title: string; body: string; Icon: CessIcon; grad: string }[] = [
  {
    title: "Accurate Location Capture",
    body: "GPS coordinates with timestamp",
    Icon: Crosshair,
    grad: "linear-gradient(135deg,#1558c0,#3b8cf0)",
  },
  {
    title: "Photo & Video Evidence",
    body: "Capture and store with auto tags",
    Icon: Camera,
    grad: "linear-gradient(135deg,#e06a06,#f7a23a)",
  },
  {
    title: "Complete Documentation",
    body: "Keep all evidence linked to project",
    Icon: FileText,
    grad: "linear-gradient(135deg,#6b35d6,#9d6bff)",
  },
  {
    title: "Reliable & Verifiable",
    body: "Every observation is linked with project, location and time",
    Icon: ShieldCheck,
    grad: "linear-gradient(135deg,#0f8a4c,#2fc57a)",
  },
];

const GPS_ROWS: [string, string][] = [
  ["Latitude", "13.0827° N"],
  ["Longitude", "77.5871° E"],
  ["Timestamp", "15 Jan 2025, 10:42 AM"],
  ["Accuracy", "5 meters"],
];

const APP_TABS: { label: string; Icon: CessIcon }[] = [
  { label: "Location", Icon: MapPin },
  { label: "Photos", Icon: Camera },
  { label: "Videos", Icon: VideoCamera },
  { label: "Documents", Icon: FileText },
];

const STAGE_TYPE = {
  containerType: "size",
  "--ge-22": stageFont(22, 11),
  "--ge-18": stageFont(18, 9),
  "--ge-16": stageFont(16, 8),
  "--ge-14": stageFont(14, 7),
  "--ge-13": stageFont(13, 6.5),
  "--ge-12": stageFont(12, 6),
} as CSSProperties;

/** Poster-style "Location & Evidence Capture" stage — GPS, photos, videos and documents on site. */
export function GpsEvidenceStage() {
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setFocus((f) => (f + 1) % KINDS.length), 2200);
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
      className="relative grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_11%] gap-y-[1%] overflow-hidden pb-[0.8%] text-[#122b50]"
      style={{
        ...STAGE_TYPE,
        background: `linear-gradient(180deg, rgba(238,245,253,0.25) 0%, rgba(238,245,253,0.05) 60%), url(${stageBg}) 70% bottom / cover no-repeat, #eef5fd`,
      }}
    >
      <motion.img
        src={inspectorPhone}
        alt="Labour Inspector capturing site location and evidence on the field app"
        draggable={false}
        initial={reduce ? false : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease }}
        className="pointer-events-none absolute inset-y-0 left-0 h-full w-[46%] object-cover object-[center_30%] select-none"
        style={{
          maskImage: "linear-gradient(90deg,#000 0%,#000 60%,rgba(0,0,0,0.5) 80%,transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg,#000 0%,#000 60%,rgba(0,0,0,0.5) 80%,transparent 100%)",
        }}
      />

      <div className="relative grid min-h-0 grid-cols-[29%_25%_minmax(0,1fr)] gap-x-[1.6%] px-[1.4%] pt-[1.2%]">
        <div />

        {/* Phone */}
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

        {/* Right column */}
        <div className="flex min-h-0 flex-col gap-[2.2%]">
          <motion.div
            {...rise(0.3, 0, -8)}
            className="flex items-start rounded-2xl bg-white/90 px-[4%] py-[2.2%] shadow-[0_10px_28px_rgba(20,60,120,0.14)] ring-1 ring-[#d7e5f4]"
          >
            {FLOW.map((f, i) => (
              <div key={f.label.join(" ")} className="contents">
                <div className="flex flex-col items-center gap-[0.35em] text-center">
                  <span
                    className="grid size-[2.9em] place-items-center rounded-full text-[length:var(--ge-18)] text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] ring-2 ring-white"
                    style={{ background: f.grad }}
                  >
                    <f.Icon weight="fill" className="size-[50%]" />
                  </span>
                  <span className="text-[length:var(--ge-14)] leading-[1.15] font-bold text-[#123a6e]">
                    {f.label[0]}
                    <br />
                    {f.label[1]}
                  </span>
                </div>
                {i < FLOW.length - 1 && (
                  <span className="relative mx-[2%] mt-[1.35em] flex h-[2px] flex-1 items-center bg-[#9cc0ee] text-[length:var(--ge-16)]">
                    <ArrowRight weight="bold" className="absolute -right-[0.3em] size-[0.9em] text-[#3b82f6]" />
                    {!reduce && (
                      <motion.span
                        className="absolute size-[0.45em] rounded-full bg-[#1f6fd8]"
                        animate={{ left: ["0%", "88%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: 0.8 + i * 0.7, repeatDelay: 0.8 }}
                      />
                    )}
                  </span>
                )}
              </div>
            ))}
          </motion.div>

          <Panel title="Capture Site Evidence" delay={0.45} reduce={!!reduce} className="flex-[1.05]">
            <div className="grid h-full grid-cols-4 gap-[2.2%]">
              {KINDS.map((k, i) => {
                const on = !reduce && focus === i;
                return (
                  <motion.div
                    key={k.title}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: on ? -3 : 0, boxShadow: on ? "0 10px 22px rgba(20,60,120,0.18)" : "0 2px 6px rgba(20,60,120,0.06)" }}
                    transition={{ duration: 0.45, delay: on ? 0 : 0.6 + i * 0.08, ease }}
                    className="flex min-h-0 flex-col items-center justify-center gap-[5%] rounded-xl px-[5%] text-center ring-1 ring-[#e0eaf5]"
                    style={{ background: k.tint }}
                  >
                    <motion.span
                      className="grid aspect-square w-[46%] max-w-[64px] place-items-center rounded-full text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] ring-2 ring-white"
                      style={{ background: k.grad }}
                      animate={{ scale: on ? 1.08 : 1 }}
                      transition={{ duration: 0.35, ease }}
                    >
                      <k.Icon weight="fill" className="size-[48%]" />
                    </motion.span>
                    <span className="font-display text-[length:var(--ge-18)] leading-tight font-extrabold text-[#123a6e]">
                      {k.title}
                    </span>
                    <span className="text-[length:var(--ge-14)] leading-snug font-semibold text-[#4d6784]">{k.body}</span>
                  </motion.div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Evidence with Auto Details" delay={0.6} reduce={!!reduce} className="flex-1">
            <div className="grid h-full grid-cols-3 gap-[2.2%]">
              {EVIDENCE.map((e, i) => (
                <motion.div
                  key={e.time}
                  initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 + i * 0.25, ease }}
                  className="relative min-h-0 overflow-hidden rounded-lg shadow-[0_6px_14px_rgba(20,50,90,0.2)]"
                >
                  <img src={e.photo} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                  {!reduce && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 bg-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.85, 0] }}
                      transition={{ duration: 0.5, delay: 1.1 + i * 0.25 }}
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 space-y-[0.3em] bg-[linear-gradient(180deg,rgba(8,16,32,0.35),rgba(8,16,32,0.82))] px-[6%] py-[5%] text-[length:var(--ge-13)] leading-none font-semibold text-white">
                    <p className="flex items-center gap-[0.45em] whitespace-nowrap">
                      <Camera weight="fill" className="size-[1.15em] shrink-0" />
                      {e.time}
                    </p>
                    <p className="flex items-center gap-[0.45em] whitespace-nowrap">
                      <MapPin weight="fill" className="size-[1.15em] shrink-0" />
                      {e.coords}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Outcomes strip */}
      <motion.div
        {...rise(1.1, 0, 12)}
        className="relative mx-[1.4%] grid min-h-0 grid-cols-4 rounded-2xl bg-white/92 shadow-[0_10px_26px_rgba(20,50,90,0.14)] ring-1 ring-[#d3e2f2] backdrop-blur-sm"
      >
        {OUTCOMES.map((o, i) => (
          <motion.div
            key={o.title}
            {...rise(1.25 + i * 0.08, 0, 8)}
            className="flex min-w-0 items-center gap-[5%] border-l border-[#e3ecf6] px-[4%] first:border-0"
          >
            <span
              className="grid aspect-square h-[62%] shrink-0 place-items-center rounded-full text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)]"
              style={{ background: o.grad }}
            >
              <o.Icon weight="bold" className="size-[50%]" />
            </span>
            <span className="min-w-0">
              <span className="font-display block text-[length:var(--ge-16)] leading-tight font-extrabold text-[#123a6e]">
                {o.title}
              </span>
              <span className="block text-[length:var(--ge-13)] leading-snug font-semibold text-[#4d6784]">{o.body}</span>
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function Panel({
  title,
  delay,
  reduce,
  className,
  children,
}: {
  title: string;
  delay: number;
  reduce: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay, ease }}
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white/85 shadow-[0_12px_32px_rgba(20,60,120,0.14)] ring-1 ring-[#d3e3f4] backdrop-blur-sm ${className ?? ""}`}
    >
      <div
        className="font-display w-[52%] bg-[linear-gradient(90deg,#1450b8,#2f7ff0)] py-[2%] pr-[6%] pl-[4%] text-[length:var(--ge-18)] leading-none font-extrabold whitespace-nowrap text-white"
        style={{ clipPath: "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)" }}
      >
        {title}
      </div>
      <div className="min-h-0 flex-1 p-[2.4%]">{children}</div>
    </motion.div>
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
      <div className="bg-[linear-gradient(180deg,#1552c4,#1d66dc)] px-[5%] pt-[1.5cqh] pb-[2cqh] text-white">
        <div className="flex items-center justify-between text-[2cqh] leading-none font-bold">
          <span>9:41</span>
          <span className="h-[2.4cqh] w-[26%] rounded-full bg-black/85" />
          <span className="tracking-[0.1em]">▮▮▮</span>
        </div>
        <div className="mt-[2cqh] flex items-center justify-between">
          <ArrowLeft weight="bold" className="size-[3cqh]" />
          <span className="font-display text-[2.6cqh] leading-none font-extrabold">Project Site</span>
          <Bell weight="fill" className="size-[3cqh]" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-[1.3cqh] px-[4.5%] pt-[1.5cqh] pb-[1.6cqh]">
        <motion.div {...item(0.6)} className="flex gap-[1.3cqh] rounded-[1.6cqh] bg-white p-[1.2cqh] shadow-[0_2px_8px_rgba(20,50,100,0.08)] ring-1 ring-[#e0e9f4]">
          <img src={abcPhoto} alt="" draggable={false} className="aspect-square w-[30%] shrink-0 rounded-[1cqh] object-cover" />
          <div className="min-w-0 space-y-[0.7cqh]">
            <p className="font-display text-[2.3cqh] leading-tight font-extrabold text-[#0f2e63]">ABC Commercial Complex</p>
            <p className="flex items-center gap-[0.6cqh] text-[1.8cqh] leading-none font-semibold text-[#3f5b7c]">
              <MapPin weight="fill" className="size-[2cqh] text-[#1d4f9a]" />
              Yelahanka, Bengaluru
            </p>
            <p className="flex items-center gap-[0.6cqh] text-[1.8cqh] leading-none font-semibold text-[#3f5b7c]">
              <IdentificationCard weight="fill" className="size-[2cqh] text-[#1d4f9a]" />
              PRJ-000245
            </p>
            <p className="flex items-center gap-[0.6cqh] text-[1.8cqh] leading-none font-semibold text-[#3f5b7c]">
              <User weight="fill" className="size-[2cqh] text-[#1d4f9a]" />
              Officer: R. Kumar
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-4 rounded-[1.2cqh] bg-white ring-1 ring-[#e0e9f4]">
          {APP_TABS.map((t, i) => (
            <span
              key={t.label}
              className={`flex flex-col items-center gap-[0.4cqh] py-[0.9cqh] text-[1.6cqh] leading-none font-bold ${i === 0 ? "rounded-[1.2cqh] bg-[#e7f0fd] text-[#1d66dc]" : "text-[#7b8ea8]"}`}
            >
              <t.Icon weight="fill" className="size-[2.4cqh]" />
              {t.label}
            </span>
          ))}
        </div>

        {/* Satellite map with captured pin */}
        <div className="relative h-[30%] shrink-0 overflow-hidden rounded-[1.4cqh] ring-1 ring-[#d5e2f1]">
          <img src={satelliteMap} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          <span
            aria-hidden
            className="absolute top-[58%] left-1/2 aspect-square h-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b8cf0]/30 ring-1 ring-[#8fc0ff]"
          />
          {!reduce &&
            [0, 0.9].map((d) => (
              <motion.span
                key={d}
                aria-hidden
                className="absolute top-[58%] left-1/2 aspect-square h-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b8cf0]/35 ring-2 ring-[#3b8cf0]/60"
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: [0.2, 1.2], opacity: [0.9, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 1.4 + d, ease: "easeOut" }}
              />
            ))}
          <motion.span
            className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-full"
            initial={reduce ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1, ease }}
          >
            <MapPin weight="fill" className="size-[4.2cqh] text-[#e0302f] drop-shadow-[0_3px_3px_rgba(0,0,0,0.35)]" />
          </motion.span>
          <motion.span
            initial={reduce ? false : { opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.5, type: "spring", stiffness: 320, damping: 18 }}
            className="absolute top-[8%] left-1/2 flex -translate-x-1/2 items-center gap-[0.6cqh] rounded-[0.9cqh] bg-white px-[1cqh] py-[0.6cqh] text-[1.6cqh] leading-none font-bold whitespace-nowrap text-[#123a6e] shadow-[0_3px_8px_rgba(0,0,0,0.2)]"
          >
            <CheckCircle weight="fill" className="size-[1.7cqh] text-[#18a058]" />
            GPS Location Captured
          </motion.span>
        </div>

        <dl className="flex flex-1 flex-col justify-evenly text-[2cqh] leading-none">
          {GPS_ROWS.map(([k, v], i) => (
            <motion.div key={k} {...item(1.6 + i * 0.1)} className="grid grid-cols-[36%_minmax(0,1fr)]">
              <dt className="font-semibold text-[#5b7390]">{k}</dt>
              <dd className="font-bold text-[#17365f]">: {v}</dd>
            </motion.div>
          ))}
          <motion.div {...item(2)} className="grid grid-cols-[36%_minmax(0,1fr)] items-center">
            <dt className="font-semibold text-[#5b7390]">Status</dt>
            <dd className="flex items-center gap-[0.5cqh] font-bold">
              :
              <span className="flex items-center gap-[0.5cqh] rounded-[0.7cqh] bg-[#dcf3e6] px-[0.9cqh] py-[0.45cqh] text-[#12804a]">
                <CheckCircle weight="fill" className="size-[1.6cqh]" />
                Captured
              </span>
            </dd>
          </motion.div>
        </dl>

        <motion.div
          className="flex items-center justify-center gap-[0.8cqh] rounded-[1.3cqh] bg-[#1d66dc] py-[1.6cqh] text-[2.3cqh] leading-none font-bold text-white"
          animate={reduce ? undefined : { boxShadow: ["0 0 0 0 rgba(29,102,220,0)", "0 0 0 6px rgba(29,102,220,0.22)", "0 0 0 0 rgba(29,102,220,0)"] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 2.2 }}
        >
          Capture Evidence <ArrowRight weight="bold" className="size-[2cqh]" />
        </motion.div>
      </div>
    </div>
  );
}
