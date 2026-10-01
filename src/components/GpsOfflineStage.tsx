import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowLeft,
  ArrowsClockwise,
  Calculator,
  Camera,
  CellSignalFull,
  Check,
  ClipboardText,
  CloudArrowUp,
  Database,
  DeviceMobile,
  DotsThreeVertical,
  FileText,
  MapPin,
  Receipt,
  ShieldCheck,
  VideoCamera,
  WifiSlash,
} from "@/lib/icons";
import { stageFont } from "@/lib/stageFont";
import inspectorPhone from "@/assets/gps-inspector-phone.jpg";
import abcPhoto from "@/assets/prj-site-photo.jpg";
import deviceStore from "@/assets/gps-device-store.png";
import centralCloud from "@/assets/gps-central-cloud.png";
import stageBg from "@/assets/current-issues-center-bg-wide.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

const G = {
  red: "linear-gradient(135deg,#d9203f,#ff5a72)",
  green: "linear-gradient(135deg,#0f8a4c,#2fc57a)",
  blue: "linear-gradient(135deg,#1558c0,#3b8cf0)",
  purple: "linear-gradient(135deg,#6b35d6,#9d6bff)",
  orange: "linear-gradient(135deg,#e06a06,#f7a23a)",
};

const FLOW: { label: [string, string]; Icon: CessIcon; grad: string }[] = [
  { label: ["No", "Network"], Icon: WifiSlash, grad: G.red },
  { label: ["Capture &", "Assess"], Icon: ClipboardText, grad: G.green },
  { label: ["Store", "Securely"], Icon: Database, grad: G.blue },
  { label: ["Network", "Available"], Icon: CellSignalFull, grad: G.green },
  { label: ["Sync to", "Central Platform"], Icon: CloudArrowUp, grad: G.purple },
];

const ASSESS_ROWS: { label: string; value: string; Icon: CessIcon }[] = [
  { label: "GPS Location", value: "Saved", Icon: MapPin },
  { label: "Site Photos", value: "8 Captured", Icon: Camera },
  { label: "Site Video", value: "2 Recorded", Icon: VideoCamera },
  { label: "Survey Details", value: "Saved", Icon: FileText },
  { label: "Estimation", value: "Draft Saved", Icon: Calculator },
  { label: "Demand Notice", value: "Draft Saved", Icon: Receipt },
];

const STORED: { label: string; Icon: CessIcon; color: string }[] = [
  { label: "GPS Location", Icon: MapPin, color: "#e0302f" },
  { label: "Photos", Icon: Camera, color: "#12994f" },
  { label: "Videos", Icon: VideoCamera, color: "#7c3aed" },
  { label: "Survey Information", Icon: FileText, color: "#e57a0c" },
  { label: "Estimation Details", Icon: Calculator, color: "#1d66dc" },
];

const STORE_CHECKS = ["All data stored securely", "Linked to the project", "Timestamps maintained", "No data loss"];

const SYNC_ROWS: { label: string; state: "done" | "active" | "wait" }[] = [
  { label: "Photos (8)", state: "done" },
  { label: "Videos (2)", state: "done" },
  { label: "Survey Details", state: "done" },
  { label: "Estimation Data", state: "active" },
  { label: "Documents", state: "wait" },
];

const CENTRAL_CHECKS = [
  "Location data",
  "Photos & videos",
  "Survey information",
  "Estimation details",
  "All evidence linked to the project",
];

const OUTCOMES: { title: string; body: string; Icon: CessIcon; grad: string }[] = [
  { title: "Works Offline", body: "Capture and assess even without network", Icon: WifiSlash, grad: G.red },
  { title: "Secure Local Storage", body: "Data stored safely on device with project linkage", Icon: ShieldCheck, grad: G.green },
  { title: "Automatic / Manual Sync", body: "Upload when network is available", Icon: ArrowsClockwise, grad: G.orange },
  { title: "Complete Field Assessment", body: "No interruption to site work", Icon: DeviceMobile, grad: G.blue },
];

const STAGE_TYPE = {
  containerType: "size",
  "--go-20": stageFont(20, 10),
  "--go-18": stageFont(18, 9),
  "--go-16": stageFont(16, 8),
  "--go-14": stageFont(14, 7),
  "--go-13": stageFont(13, 6.5),
  "--go-12": stageFont(12, 6),
} as CSSProperties;

/** Poster-style "Offline Field Assessment" stage — capture offline, store on device, sync when online. */
export function GpsOfflineStage() {
  const reduce = !!useReducedMotion();
  const [flowStep, setFlowStep] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setFlowStep((s) => (s + 1) % FLOW.length), 1600);
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
      className="relative grid h-full min-h-0 w-full grid-rows-[13%_minmax(0,1fr)_11%] gap-y-[1%] overflow-hidden pb-[0.8%] text-[#122b50]"
      style={{
        ...STAGE_TYPE,
        background: `linear-gradient(180deg, rgba(238,245,253,0.35) 0%, rgba(238,245,253,0.1) 60%), url(${stageBg}) 70% bottom / cover no-repeat, #eef5fd`,
      }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease }}
        className="pointer-events-none absolute bottom-[12%] left-0 h-[68%] w-[20.5%] select-none"
        style={{
          maskImage: "linear-gradient(90deg,#000 0%,#000 90%,transparent 100%), linear-gradient(180deg,transparent 0%,#000 14%,#000 88%,transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg,#000 0%,#000 90%,transparent 100%), linear-gradient(180deg,transparent 0%,#000 14%,#000 88%,transparent 100%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <img
          src={inspectorPhone}
          alt="Labour Inspector continuing the assessment without mobile network"
          draggable={false}
          className="size-full object-cover object-[18%_20%]"
        />
      </motion.div>

      {/* Row 1 — No Network chip + journey flow */}
      <div className="relative flex min-h-0 items-stretch justify-between gap-[2%] px-[1.4%] pt-[1%]">
        <motion.div
          {...rise(0.3, -12, 0)}
          className="flex items-center gap-[0.7em] self-center rounded-2xl bg-white/92 px-[1em] py-[0.6em] text-[length:var(--go-16)] shadow-[0_10px_24px_rgba(20,50,90,0.18)] ring-1 ring-[#dde8f4]"
        >
          <span className="relative grid size-[2.4em] place-items-center rounded-full bg-[#1d2636] text-white">
            <WifiSlash weight="bold" className="size-[55%] text-[#ff6b6b]" />
            {!reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full ring-2 ring-[#ff6b6b]"
                animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </span>
          <span className="leading-tight">
            <span className="font-display block font-extrabold text-[#123a6e]">No Network</span>
            <span className="block text-[length:var(--go-13)] font-semibold text-[#4d6784]">Continue working offline</span>
          </span>
        </motion.div>

        <motion.div
          {...rise(0.35, 0, -8)}
          className="flex w-[56%] items-center rounded-2xl bg-white/92 px-[2.2%] shadow-[0_10px_28px_rgba(20,60,120,0.14)] ring-1 ring-[#d7e5f4]"
        >
          {FLOW.map((f, i) => {
            const on = !reduce && flowStep === i;
            return (
              <div key={f.label.join(" ")} className="contents">
                <div className="flex shrink-0 items-center gap-[0.5em]">
                  <motion.span
                    className="grid size-[2.5em] shrink-0 place-items-center rounded-full text-[length:var(--go-16)] text-white shadow-[0_5px_12px_rgba(0,0,0,0.18)] ring-2 ring-white"
                    style={{ background: f.grad }}
                    animate={{ scale: on ? 1.12 : 1 }}
                    transition={{ duration: 0.35, ease }}
                  >
                    <f.Icon weight="fill" className="size-[50%]" />
                  </motion.span>
                  <span className="text-[length:var(--go-13)] leading-[1.15] font-bold whitespace-nowrap text-[#123a6e]">
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

      {/* Row 2 — offline assess → device store → sync → Central Platform */}
      <div className="relative grid min-h-0 grid-cols-[19%_18%_3%_minmax(0,1fr)_3%_18%_3%_17%] items-center px-[1.4%]">
        <div />
        <Phone delay={0.25} reduce={reduce}>
          <AssessScreen reduce={reduce} />
        </Phone>
        <Packets delay={1.4} reduce={reduce} tone="#f39a1e" />
        <StorePanel reduce={reduce} />
        <Packets delay={2.6} reduce={reduce} tone="#1d66dc" />
        <Phone delay={0.45} reduce={reduce}>
          <SyncScreen reduce={reduce} />
        </Phone>
        <Packets delay={3.4} reduce={reduce} tone="#12994f" />
        <CentralPanel reduce={reduce} />
      </div>

      {/* Row 3 — outcomes */}
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
              <span className="font-display block text-[length:var(--go-16)] leading-tight font-extrabold text-[#123a6e]">
                {o.title}
              </span>
              <span className="block text-[length:var(--go-13)] leading-snug font-semibold text-[#4d6784]">{o.body}</span>
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function FlowLink({ delay, reduce }: { delay: number; reduce: boolean }) {
  return (
    <span className="relative mx-[1.4%] flex h-[2px] min-w-[1em] flex-1 items-center bg-[#9cc0ee] text-[length:var(--go-16)]">
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

/** Chunky blue arrow with moving data packets between columns. */
function Packets({ delay, reduce, tone }: { delay: number; reduce: boolean; tone: string }) {
  return (
    <div className="relative flex h-[10%] items-center justify-center">
      <span className="absolute inset-x-[8%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#3b82f6]/35" />
      <svg viewBox="0 0 24 24" className="relative z-[1] ml-auto h-[60%] w-auto text-[#1d66dc]" aria-hidden>
        <path d="M6 3 L18 12 L6 21 Z" fill="currentColor" />
      </svg>
      {!reduce &&
        [0, 0.55].map((d) => (
          <motion.span
            key={d}
            className="absolute top-1/2 size-[18%] min-h-[6px] min-w-[6px] -translate-y-1/2 rounded-[2px] shadow-[0_0_6px_rgba(0,0,0,0.2)]"
            style={{ background: tone }}
            animate={{ left: ["4%", "74%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: delay + d, repeatDelay: 0.6, ease: "easeInOut" }}
          />
        ))}
    </div>
  );
}

export function Phone({ delay, reduce, children }: { delay: number; reduce: boolean; children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center py-[2%]">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay, ease }}
        className="relative aspect-[9/18.6] h-full max-h-full max-w-full rounded-[7cqh] bg-[linear-gradient(145deg,#2a2f3a,#0c0f16)] p-[2cqh] shadow-[0_26px_52px_rgba(8,20,50,0.42),inset_0_0_0_2px_rgba(255,255,255,0.08)] [container-type:size]"
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[5cqh] bg-[#f3f7fc] text-[#17365f]">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function AppBar({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className="shrink-0 bg-[linear-gradient(180deg,#1552c4,#1d66dc)] px-[5%] pt-[1.4cqh] pb-[1.8cqh] text-white">
      <div className="flex items-center justify-between text-[2.24cqh] leading-none font-bold">
        <span>9:41</span>
        <span className="h-[2.3cqh] w-[26%] rounded-full bg-black/85" />
        <span className="tracking-[0.1em]">▮▮▮</span>
      </div>
      <div className="mt-[1.8cqh] flex items-center justify-between">
        <ArrowLeft weight="bold" className="size-[2.8cqh]" />
        <span className={`font-display leading-none font-extrabold whitespace-nowrap ${compact ? "text-[2.3cqh]" : "text-[2.83cqh]"}`}>{title}</span>
        <DotsThreeVertical weight="bold" className="size-[2.8cqh]" />
      </div>
    </div>
  );
}

export function ProjectCard() {
  return (
    <div className="flex shrink-0 gap-[1.2cqh] rounded-[1.5cqh] bg-white p-[1.1cqh] shadow-[0_2px_8px_rgba(20,50,100,0.08)] ring-1 ring-[#e0e9f4]">
      <img src={abcPhoto} alt="" draggable={false} className="aspect-[4/3] w-[32%] shrink-0 rounded-[1cqh] object-cover" />
      <div className="min-w-0 space-y-[0.6cqh]">
        <p className="font-display text-[2.24cqh] leading-tight font-extrabold text-[#0f2e63]">ABC Commercial Complex</p>
        <p className="text-[1.89cqh] leading-none font-semibold text-[#3f5b7c]">Yelahanka, Bengaluru</p>
        <p className="text-[1.89cqh] leading-none font-semibold text-[#3f5b7c]">PRJ-000245</p>
      </div>
    </div>
  );
}

function AssessScreen({ reduce }: { reduce: boolean }) {
  return (
    <>
      <AppBar title="Field Assessment" />
      <div className="flex min-h-0 flex-1 flex-col gap-[1.1cqh] px-[4.5%] pt-[1.3cqh] pb-[1.4cqh]">
        <ProjectCard />

        <div className="shrink-0 rounded-[1.4cqh] bg-[#fdeedd] px-[4%] py-[1.1cqh] text-center ring-1 ring-[#f7d2a8]">
          <p className="flex items-center justify-center gap-[0.8cqh] font-display text-[2.71cqh] leading-none font-extrabold text-[#c2410c]">
            <WifiSlash weight="bold" className="size-[2.5cqh] text-[#e0302f]" />
            OFFLINE MODE
          </p>
          <p className="mt-[0.7cqh] text-[1.71cqh] leading-snug font-semibold text-[#5b4a3a]">
            You can continue assessment.
            <br />
            Data will be saved on your device.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-[1.4cqh] bg-white px-[4%] py-[0.9cqh] ring-1 ring-[#e0e9f4]">
          <p className="font-display text-[2.18cqh] leading-none font-extrabold text-[#123a6e]">Assessment in Progress</p>
          <div className="mt-[0.6cqh] flex flex-1 flex-col justify-evenly">
            {ASSESS_ROWS.map((r, i) => (
              <div key={r.label} className="flex items-center gap-[0.9cqh] text-[1.83cqh] leading-none font-semibold">
                <r.Icon weight="fill" className="size-[2cqh] shrink-0 text-[#1d66dc]" />
                <span className="flex-1 text-[#2c4668]">{r.label}</span>
                <motion.span
                  initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.9 + i * 0.22, type: "spring", stiffness: 320, damping: 18 }}
                  className="flex w-[42%] items-center gap-[0.5cqh] rounded-[0.7cqh] bg-[#e3f6ea] px-[0.7cqh] py-[0.45cqh] font-bold whitespace-nowrap text-[#12804a]"
                >
                  <span className="grid size-[1.7cqh] shrink-0 place-items-center rounded-full bg-[#18a058] text-white">
                    <Check weight="bold" className="size-[70%]" />
                  </span>
                  {r.value}
                </motion.span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-[1cqh] rounded-[1.4cqh] bg-[#fdeedd] px-[4%] py-[0.9cqh] ring-1 ring-[#f7d2a8]">
          <Database weight="fill" className="size-[3.2cqh] shrink-0 text-[#f08a12]" />
          <div className="leading-tight">
            <p className="text-[2.01cqh] font-extrabold text-[#c2410c]">12 items waiting for sync</p>
            <p className="text-[1.59cqh] font-semibold text-[#5b4a3a]">Data is securely stored on this device.</p>
          </div>
        </div>

        <motion.div
          className="flex shrink-0 items-center justify-center gap-[0.8cqh] rounded-[1.3cqh] bg-[#1d66dc] py-[1.4cqh] text-[2.48cqh] leading-none font-bold text-white"
          animate={reduce ? undefined : { boxShadow: ["0 0 0 0 rgba(29,102,220,0)", "0 0 0 5px rgba(29,102,220,0.22)", "0 0 0 0 rgba(29,102,220,0)"] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 2 }}
        >
          <CloudArrowUp weight="fill" className="size-[2.5cqh]" />
          Sync When Online
        </motion.div>
      </div>
    </>
  );
}

function SyncScreen({ reduce }: { reduce: boolean }) {
  return (
    <>
      <AppBar title="Sync Data" />
      <div className="flex min-h-0 flex-1 flex-col gap-[1.2cqh] px-[4.5%] pt-[1.3cqh] pb-[1.4cqh]">
        <ProjectCard />

        <div className="flex shrink-0 flex-col items-center pt-[0.8cqh] text-center">
          <span className="relative grid size-[11cqh] place-items-center rounded-full bg-[#e3eefc]">
            {!reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full ring-2 ring-[#3b8cf0]"
                animate={{ scale: [1, 1.3], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <span className="grid size-[7.4cqh] place-items-center rounded-full bg-[linear-gradient(135deg,#1558c0,#3b8cf0)] text-white shadow-[0_6px_14px_rgba(29,102,220,0.35)]">
              <motion.span
                animate={reduce ? undefined : { y: [2, -2, 2] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="grid place-items-center"
              >
                <CloudArrowUp weight="fill" className="size-[4cqh]" />
              </motion.span>
            </span>
          </span>
          <p className="font-display mt-[1.2cqh] text-[2.95cqh] leading-none font-extrabold text-[#123a6e]">Syncing Data...</p>
          <p className="mt-[0.7cqh] text-[1.71cqh] leading-none font-semibold text-[#5b7390]">
            Uploading 12 items to Central Platform.
          </p>
          <div className="mt-[1.3cqh] h-[1.3cqh] w-full overflow-hidden rounded-full bg-[#dfe7f1]">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#18a058,#34c77b)]"
              initial={reduce ? false : { width: "0%" }}
              animate={{ width: "67%" }}
              transition={{ duration: 1.6, delay: 1.2, ease }}
            />
          </div>
          <p className="mt-[0.8cqh] text-[1.77cqh] leading-none font-bold text-[#3f5b7c]">8 of 12 items uploaded</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-evenly rounded-[1.4cqh] bg-white px-[4%] ring-1 ring-[#e0e9f4]">
          {SYNC_ROWS.map((r, i) => (
            <motion.div
              key={r.label}
              initial={reduce ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 1.5 + i * 0.15, ease }}
              className="flex items-center gap-[0.9cqh] text-[1.89cqh] leading-none font-semibold"
            >
              {r.state === "done" ? (
                <span className="grid size-[2.1cqh] shrink-0 place-items-center rounded-full bg-[#18a058] text-white">
                  <Check weight="bold" className="size-[70%]" />
                </span>
              ) : r.state === "active" ? (
                <motion.span
                  className="grid size-[2.1cqh] shrink-0 place-items-center rounded-full bg-[#1d66dc] text-white"
                  animate={reduce ? undefined : { rotate: 360 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                >
                  <ArrowsClockwise weight="bold" className="size-[70%]" />
                </motion.span>
              ) : (
                <span className="size-[2.1cqh] shrink-0 rounded-full border-2 border-[#b7c4d4]" />
              )}
              <span className="flex-1 text-[#2c4668]">{r.label}</span>
              <span
                className={`text-[1.71cqh] font-bold ${r.state === "done" ? "text-[#12804a]" : r.state === "active" ? "text-[#1d66dc]" : "text-[#8a9ab0]"}`}
              >
                {r.state === "done" ? "Completed" : r.state === "active" ? "Uploading..." : "Pending..."}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

function StorePanel({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.55, ease }}
      className="flex h-[86%] min-h-0 flex-col overflow-hidden rounded-2xl bg-white/92 shadow-[0_14px_34px_rgba(20,60,120,0.16)] ring-1 ring-[#d3e3f4] backdrop-blur-sm"
    >
      <div className="font-display shrink-0 bg-[linear-gradient(90deg,#1450b8,#2f7ff0)] px-[6%] py-[0.85em] text-center text-[length:var(--go-18)] leading-none font-extrabold text-white">
        Stored Securely on Device
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center px-[6%] pt-[0.8em] pb-[1em] text-[length:var(--go-14)]">
        <motion.img
          src={deviceStore}
          alt=""
          draggable={false}
          className="h-[9em] w-auto"
          animate={reduce ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="h-[1.2em] w-[80%] shrink-0 text-[#6ea3ea]" aria-hidden>
          <path d="M50 0 V5 M16.7 5 H83.3 M16.7 5 V10 M50 5 V10 M83.3 5 V10" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.6 1.2" vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="grid w-full shrink-0 grid-cols-6 gap-y-[0.7em] pt-[0.2em]">
          {STORED.map((s, i) => (
            <motion.div
              key={s.label}
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.3 + i * 0.12, ease }}
              className={`col-span-2 flex flex-col items-center gap-[0.25em] text-center ${i === 3 ? "col-start-2" : ""}`}
            >
              <s.Icon weight="fill" className="size-[2.3em]" style={{ color: s.color }} />
              <span className="text-[length:var(--go-12)] leading-tight font-bold text-[#123a6e]">{s.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-auto w-full space-y-[0.55em] rounded-xl bg-[#e6f6ec] px-[7%] py-[0.8em] ring-1 ring-[#c4e8d1]">
          {STORE_CHECKS.map((c, i) => (
            <motion.p
              key={c}
              initial={reduce ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 2 + i * 0.12, ease }}
              className="flex items-center gap-[0.6em] text-[length:var(--go-13)] leading-none font-semibold text-[#1c5a38]"
            >
              <span className="grid size-[1.3em] shrink-0 place-items-center rounded-full bg-[#18a058] text-white">
                <Check weight="bold" className="size-[70%]" />
              </span>
              {c}
            </motion.p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CentralPanel({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.7, ease }}
      className="flex h-[80%] min-h-0 flex-col items-center rounded-2xl bg-white/92 px-[7%] py-[1em] text-[length:var(--go-14)] shadow-[0_14px_34px_rgba(20,60,120,0.16)] ring-1 ring-[#d3e3f4] backdrop-blur-sm"
    >
      <p className="font-display text-center text-[length:var(--go-20)] leading-tight font-extrabold text-[#123a6e]">Central Platform</p>
      <div className="relative mt-[0.4em] grid h-[10.5em] w-full shrink-0 place-items-center">
        <span className="absolute inset-y-0 left-1/2 aspect-square -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#e2eefc_0%,#f2f7fe_55%,transparent_70%)]" />
        <motion.img
          src={centralCloud}
          alt=""
          draggable={false}
          className="absolute inset-0 m-auto h-full w-auto"
          animate={reduce ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <p className="mt-[0.4em] text-center text-[length:var(--go-14)] leading-snug font-semibold text-[#3f5b7c]">
        Project records updated automatically
      </p>
      <div className="mt-[0.7em] flex w-full flex-1 flex-col justify-evenly border-t border-[#e0e9f4] pt-[0.5em]">
        {CENTRAL_CHECKS.map((c, i) => (
          <motion.p
            key={c}
            initial={reduce ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 3.6 + i * 0.15, ease }}
            className="flex items-start gap-[0.6em] text-[length:var(--go-13)] leading-tight font-semibold text-[#2c4668]"
          >
            <span className="grid size-[1.35em] shrink-0 place-items-center rounded-full bg-[#18a058] text-white">
              <Check weight="bold" className="size-[70%]" />
            </span>
            {c}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}
