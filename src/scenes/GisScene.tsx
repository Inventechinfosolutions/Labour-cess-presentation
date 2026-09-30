import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  Bank,
  Buildings,
  CalendarBlank,
  CaretRight,
  CheckCircle,
  CornersOut,
  Crosshair,
  EnvelopeSimple,
  GpsFix,
  MapPin,
  MapTrifold,
  Minus,
  Phone,
  Plus,
  SquaresFour,
  Stack,
  StackSimple,
  TreeStructure,
  User,
  UsersThree,
  X,
} from "@/lib/icons";
import { TerritoryWorkspace } from "@/scenes/GisTerritoryWorkspace";
import { MisDashboard } from "@/scenes/GisMisDashboard";
import { StoryMap } from "@/scenes/GisStoryMap";
import { Reveal, SlideTitle } from "@/components/SlideKit";
import { HEX } from "@/lib/palette";
import {
  CESS_SITES,
  CESS_VALUES,
} from "@/lib/gisGeometry";
import { cn } from "@/lib/utils";
import abcSite from "@/assets/abc-site.png";
import inspectorPhoto from "@/assets/inspector-r-kumar.jpg";
import problemStageBg from "@/assets/problem-stage-bg.png";

/**
 * Scene 4 — field location → territory → officers → nearby →
 * GPS field assessment + CESS status → territory dashboard → next (exceptions).
 */

const COORDS = "12.9616° N, 77.6973° E";
const LAT = "12.9616° N";
const LNG = "77.6973° E";
const PROJECT_NAME = "ABC Commercial Complex";
const PROJECT_ID = "PRJ-000245";

/** Fewer pins on the map — one of each main CESS status, clickable. */
const MAP_SITE_IDS = ["abc", "tech", "maple", "orion", "sky", "jaya"] as const;
const MAP_SITES = MAP_SITE_IDS.map((id) => CESS_SITES.find((s) => s.id === id)).filter(
  (s): s is (typeof CESS_SITES)[number] => Boolean(s),
);

const PROJECT_ROWS: { label: string; value: string; Icon: CessIcon }[] = [
  { label: "Project Type", value: "Commercial", Icon: Buildings },
  { label: "Address", value: "Marathahalli, Bengaluru", Icon: MapPin },
  { label: "GPS Location", value: COORDS, Icon: Crosshair },
  { label: "Construction Stage", value: "RCC Structure", Icon: StackSimple },
  { label: "Captured On", value: "15 Jan 2025, 10:42 AM", Icon: CalendarBlank },
  { label: "Captured By", value: "R. Kumar", Icon: User },
];

type RegionGlyphKind = "state" | "division" | "district" | "taluk" | "ulb" | "ward" | "boundary";

const TERRITORY_ROWS: { label: string; value: string; glyph: RegionGlyphKind; color: string }[] = [
  { label: "State", value: "Karnataka", glyph: "state", color: "#8b3fe0" },
  { label: "Board Zone", value: "East Zone", glyph: "division", color: "#ec5f9c" },
  { label: "District", value: "Bengaluru Urban", glyph: "district", color: "#1f6fe5" },
  { label: "Taluk", value: "Bengaluru East Taluk", glyph: "taluk", color: "#f5a524" },
  { label: "ULB / Local Area", value: "BBMP East (Mahadevapura)", glyph: "ulb", color: "#16a34a" },
  { label: "Ward", value: "Ward No. 86", glyph: "ward", color: "#ec4899" },
  { label: "GIS Boundary", value: "Marathahalli Ward Boundary", glyph: "boundary", color: "#1f6fe5" },
];

const OFFICE_NAME = "BBMP East Zone Office";

const OFFICE_ROWS: { label: string; value: string; Icon: CessIcon; phone?: string }[] = [
  { label: "Department", value: "Labour Department", Icon: Bank },
  { label: "Office", value: OFFICE_NAME, Icon: TreeStructure },
  { label: "Reporting Officer", value: "Assistant Labour Commissioner", Icon: User },
  { label: "Field Inspector", value: "R. Kumar", Icon: UsersThree, phone: "+91 98765 43210" },
  { label: "Email", value: "r.kumar@labour.karnataka.gov.in", Icon: EnvelopeSimple },
  { label: "Office Contact", value: "+91 80 2345 6789", Icon: Phone },
  { label: "Office Address", value: "BBMP Mahadevapura Zone Office, Marathahalli, Bengaluru - 560037", Icon: MapPin },
];

const BEAT_HEAD: readonly {
  kicker: string;
  title: string;
  support?: string;
  step: string;
  accent: string;
}[] = [
  {
    kicker: "Government of Karnataka · Labour CESS",
    title: "Project Location",
    step: "01 · Location",
    accent: "#1a4e8a",
  },
  {
    kicker: "Territory · MIS & GIS",
    title: "Project Territory Map",
    step: "02 · Territory",
    accent: HEX.teal,
  },
  {
    kicker: "Territory · MIS & GIS",
    title: "Mapped Responsible Officer",
    step: "03 · Officers",
    accent: HEX.goldDeep,
  },
  {
    kicker: "Territory · MIS & GIS",
    title: "Territory-wise Project Status",
    support: "Pick a territory. See its projects, field visits, evidence, and CESS status.",
    step: "04 · Territory map",
    accent: "#c45c26",
  },
  {
    kicker: "Territory · MIS & GIS",
    title: "MIS Dashboard",
    step: "05 · Dashboard",
    accent: HEX.navy,
  },
];

type MapMode = "gps" | "hierarchy" | "people" | "context" | "status" | "dashboard";

function mapMode(beat: number): MapMode {
  if (beat <= 0) return "gps";
  if (beat === 1) return "hierarchy";
  if (beat === 2) return "people";
  if (beat === 3) return "context";
  return "dashboard";
}

const CESS_COUNTS = CESS_VALUES.map((value) => ({
  ...value,
  count: CESS_SITES.filter((site) => site.status === value.id).length,
}));

export function GisScene({ beat }: { beat: number; onBeat: (n: number) => void }) {
  const [mapPin, setMapPin] = useState("abc");
  /** Field Location opens the site dossier immediately — no pin click required. */
  const [pinOpen, setPinOpen] = useState(true);
  const reduce = useReducedMotion();
  const head = BEAT_HEAD[Math.min(beat, BEAT_HEAD.length - 1)];
  const mode = mapMode(beat);
  const showKey = beat >= 4;
  useEffect(() => {
    if (mode === "gps") {
      setMapPin("abc");
      setPinOpen(true);
      return;
    }
    if (mode === "hierarchy" || mode === "people") {
      setMapPin("abc");
      setPinOpen(false);
      return;
    }
    if (mode === "context") {
      setMapPin("tech");
      setPinOpen(true);
      return;
    }
    if (mode === "status") {
      setMapPin("abc");
      setPinOpen(true);
      return;
    }
    setPinOpen(false);
  }, [mode]);

  const pickPin = (id: string) => {
    if (!id) {
      setPinOpen(false);
      return;
    }
    if (mode === "context" || mode === "status") {
      setMapPin(id);
      setPinOpen(true);
      return;
    }
    if (pinOpen && mapPin === id) {
      setPinOpen(false);
      return;
    }
    setMapPin(id);
    setPinOpen(true);
  };

  const mapShowPopup = pinOpen;

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-2" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="relative flex min-h-0 h-full flex-col overflow-hidden rounded-2xl shadow-[0_12px_36px_rgba(7,20,51,0.1)] ring-1 ring-navy/8">
        <img
          src={problemStageBg}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-[center_40%] select-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `
              linear-gradient(165deg, rgba(247,250,253,0.78) 0%, rgba(232,235,240,0.5) 45%, rgba(228,234,243,0.68) 100%),
              radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.28) 0%, transparent 65%)
            `,
          }}
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-2 p-2">
          <GisBeatHeader head={head} beat={beat} reduce={!!reduce} />

          <div className="relative min-h-0 flex-1 overflow-hidden">
            {mode === "context" ? (
              <TerritoryWorkspace reduce={!!reduce} />
            ) : mode === "dashboard" ? (
              <MisDashboard reduce={!!reduce} />
            ) : (
              <MapStage
                mode={mode}
                reduce={!!reduce}
                pin={mapPin}
                onPin={pickPin}
                showPopup={mapShowPopup}
              />
            )}
          </div>
        </div>
      </div>

      <StoryFooter showKey={showKey} beat={beat} />
    </div>
  );
}

function GisBeatHeader({
  head,
  beat,
  reduce,
}: {
  head: (typeof BEAT_HEAD)[number];
  beat: number;
  reduce: boolean;
}) {

  return (
    <div className="flex shrink-0 flex-col gap-1 px-1">
      <motion.div
        key={head.step + beat}
        className="text-center"
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <SlideTitle>{head.title}</SlideTitle>
        {head.support ? (
          <p className="mx-auto mt-1 max-w-[40rem] text-[12px] font-semibold text-muted-foreground">{head.support}</p>
        ) : null}
      </motion.div>
    </div>
  );
}

function MapStage({
  mode,
  reduce,
  compact = false,
  bare = false,
  pin,
  onPin,
  showPopup = true,
}: {
  mode: MapMode;
  reduce: boolean;
  compact?: boolean;
  /** Map only — no compact chrome (legend / zoom / mini map). */
  bare?: boolean;
  pin: string;
  onPin: (id: string) => void;
  /** When true with a pin — open site facts on the map (no satellite dive). */
  showPopup?: boolean;
}) {
  const selected = MAP_SITES.find((s) => s.id === pin);
  const pinActive = Boolean(showPopup && pin && selected);
  /** Field dossier stacks through Officers; Nearby keeps the map clear for pin cards. */
  const showFieldDossier =
    Boolean(selected) &&
    ((mode === "gps" && pinActive) || mode === "hierarchy" || mode === "people");
  const showTerritoryUnder =
    Boolean(selected) && (mode === "hierarchy" || mode === "people");
  const showOfficersUnder = mode === "people" && Boolean(selected);
  const dossierSite = selected;
  const showGpsFacts = mode === "gps" && pinActive && selected;
  const showCompactChrome = compact && !bare;
  const plaqueRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative h-full min-h-0 overflow-hidden rounded-2xl bg-white/40 shadow-[0_12px_32px_rgba(7,20,51,0.12)] ring-1 ring-white/60 backdrop-blur-[1px]",
        compact && "absolute inset-0 h-auto rounded-none shadow-none ring-0",
      )}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <StoryMap
        mode={mode === "hierarchy" || mode === "people" ? mode : "gps"}
        reduce={reduce}
        obstacleRef={plaqueRef}
        obstacleKey={`${mode}-${showFieldDossier ? "cards" : "none"}`}
      />
      {showFieldDossier && dossierSite ? (
        <LocationFactPlaque
          cardsRef={plaqueRef}
          site={dossierSite}
          reduce={reduce}
          showTerritory={showTerritoryUnder}
          showOfficers={showOfficersUnder}
          onClose={mode === "gps" ? () => onPin("") : undefined}
        />
      ) : null}

      {!reduce && mode !== "gps" && mode !== "hierarchy" && mode !== "people" && mode !== "context" && !compact ? (
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/20"
          animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      {showCompactChrome ? (
        <div className="pointer-events-none absolute top-2 left-2 z-20 w-[148px]">
          <div
            className="overflow-hidden rounded-xl bg-white/96 backdrop-blur-md ring-1 ring-navy/10"
            style={{
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.95) inset, 0 3px 0 0 rgba(11,31,74,0.07), 0 10px 22px rgba(7,20,51,0.14)",
            }}
          >
            <div className="flex items-center justify-between gap-1.5 border-b border-navy/6 bg-linear-to-b from-[#f7fafd] to-white px-2 py-1.5">
              <div>
                <div className="text-[6.5px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">Total Projects</div>
                <b className="font-display text-[18px] leading-none text-navy">{CESS_SITES.length}</b>
              </div>
              <span
                className="relative grid size-7 place-items-center rounded-lg text-teal-bright ring-2 ring-white"
                style={{
                  background: "radial-gradient(circle at 32% 26%, #3d5f9a 0%, #12305f 48%, #0b1f4a 100%)",
                  boxShadow: "0 2px 0 0 rgba(7,20,51,0.2), 0 1px 0 rgba(255,255,255,0.4) inset",
                }}
              >
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-lg bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent)]" />
                <Buildings weight="fill" className="relative z-[1] size-3" />
              </span>
            </div>
            <ul className="space-y-px px-1 py-1">
              {CESS_COUNTS.map((row) => (
                <li key={row.id} className="flex items-center gap-1 rounded-lg px-1 py-0.5">
                  <span
                    className="size-2 shrink-0 rounded-full ring-1 ring-white"
                    style={{
                      background: row.color,
                      boxShadow: `0 1px 0 0 rgba(7,20,51,0.15)`,
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[8px] font-bold text-navy">{row.label}</span>
                  <b className="font-mono text-[9px] text-navy">{row.count}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {showCompactChrome ? (
        <>
          <div className="pointer-events-none absolute top-2 right-2 z-20 flex flex-col gap-1">
            {[
              { Icon: Plus, key: "in" },
              { Icon: Minus, key: "out" },
              { Icon: Crosshair, key: "loc" },
            ].map(({ Icon, key }) => (
              <span
                key={key}
                className="grid size-7 place-items-center rounded-lg bg-white/96 text-navy ring-1 ring-navy/10 backdrop-blur-sm"
                style={{
                  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 0 0 rgba(11,31,74,0.08), 0 6px 12px rgba(7,20,51,0.12)",
                }}
              >
                <Icon weight="bold" className="size-3" />
              </span>
            ))}
            <span
              className="mt-0.5 inline-flex items-center gap-1 rounded-lg bg-white/96 px-1.5 py-1 text-[7px] font-extrabold text-navy ring-1 ring-navy/10 backdrop-blur-sm"
              style={{
                boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 0 0 rgba(11,31,74,0.08), 0 6px 12px rgba(7,20,51,0.12)",
              }}
            >
              <Stack weight="fill" className="size-2.5 text-[#1a4e8a]" />
              Layers
            </span>
          </div>

          <div
            className="pointer-events-none absolute right-2 bottom-2 z-20 overflow-hidden rounded-xl bg-white/96 ring-1 ring-navy/10 backdrop-blur-sm"
            style={{
              boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 3px 0 0 rgba(11,31,74,0.07), 0 8px 18px rgba(7,20,51,0.14)",
            }}
          >
            <div className="relative h-[52px] w-[76px] bg-linear-to-br from-[#eef3f9] via-[#d7e4f2] to-[#b8c9dc]">
              <svg viewBox="0 0 100 76" className="absolute inset-0 h-full w-full" aria-hidden>
                <path d="M8 62 L20 30 L38 38 L52 16 L72 28 L90 20 L90 68 L8 68 Z" fill="#c5d4e6" stroke="#9eb4cc" strokeWidth="0.9" />
                <path d="M40 58 L52 22 L72 30 L84 50 L66 62 Z" fill="#1a4e8a" opacity="0.9" />
                <path d="M40 58 L52 22 L72 30 L84 50 L66 62 Z" fill="none" stroke="#0b1f4a" strokeWidth="1.1" />
                <circle cx="58" cy="40" r="2.5" fill="#14c4d4" stroke="#fff" strokeWidth="1" />
              </svg>
              <span className="absolute top-0.5 right-0.5 grid size-3 place-items-center rounded bg-white/90 text-navy/50 ring-1 ring-navy/10">
                <CornersOut weight="bold" className="size-2" />
              </span>
              <span className="absolute inset-x-1 bottom-0.5 rounded bg-white/90 px-0.5 py-px text-center text-[6px] font-extrabold tracking-wide text-navy uppercase">
                BBMP East
              </span>
            </div>
          </div>
        </>
      ) : null}

      {mode === "gps" && !showGpsFacts ? (
        <div className="absolute inset-x-0 bottom-3 z-30 flex justify-center px-3">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: [0, -3, 0] }}
            transition={
              reduce
                ? undefined
                : { opacity: { duration: 0.35 }, y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }
            }
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPin("abc");
              }}
              className="group inline-flex items-center gap-2.5 rounded-full bg-navy px-4 py-2.5 text-left shadow-[0_12px_32px_rgba(7,20,51,0.28)] ring-1 ring-teal-bright/40 transition hover:bg-navy-deep"
            >
              <span className="relative grid size-9 place-items-center rounded-full bg-teal-bright text-navy shadow-[0_2px_0_0_rgba(7,20,51,0.25)]">
                <MapPin weight="fill" className="size-4" />
                {!reduce ? (
                  <motion.span
                    aria-hidden
                    className="absolute inset-[-4px] rounded-full border border-teal-bright/60"
                    animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block text-[8px] font-extrabold tracking-[0.14em] text-teal-bright uppercase">
                  Field visit location
                </span>
                <b className="block text-[12px] text-white">Open the site dossier</b>
              </span>
              <span className="ml-1 grid size-7 place-items-center rounded-full bg-white/10 text-teal-bright ring-1 ring-white/15 transition group-hover:bg-white/15">
                <CaretRight weight="bold" className="size-3.5" />
              </span>
            </button>
          </motion.div>
        </div>
      ) : null}

      {mode === "gps" && !showGpsFacts ? (
        <div className="pointer-events-none absolute top-3 left-3 z-20 max-w-[240px]">
          <div
            className="overflow-hidden rounded-[20px] bg-white/95 shadow-[0_14px_34px_rgba(7,20,51,0.16)] ring-1 ring-navy/10 backdrop-blur-md"
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.95) inset, 0 14px 34px rgba(7,20,51,0.16)" }}
          >
            <div className="relative h-[54px] overflow-hidden">
              <img src={abcSite} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-[center_30%]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,51,0.75),rgba(7,20,51,0.25))]" />
              <div className="absolute inset-x-2.5 bottom-2 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-teal-bright text-navy ring-2 ring-white/80">
                  <GpsFix weight="fill" className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[7.5px] font-extrabold tracking-[0.14em] text-teal-bright uppercase">ABC · GPS</div>
                  <b className="block truncate text-[12px] leading-tight text-white">{PROJECT_NAME}</b>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-2">
              <Crosshair weight="bold" className="size-3.5 shrink-0 text-[#1a4e8a]" />
              <span className="min-w-0 font-mono text-[10px] font-bold text-navy">{COORDS}</span>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "gps" && !showGpsFacts && !reduce ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
          {[
            "left-3 top-3 border-l-2 border-t-2 rounded-tl-md",
            "right-3 top-3 border-r-2 border-t-2 rounded-tr-md",
            "left-3 bottom-3 border-l-2 border-b-2 rounded-bl-md",
            "right-3 bottom-3 border-r-2 border-b-2 rounded-br-md",
          ].map((cls) => (
            <span key={cls} className={cn("absolute size-6 border-teal/35", cls)} />
          ))}
        </div>
      ) : null}

      {mode === "status" && !compact ? (
        <div className="pointer-events-none absolute right-3 bottom-3 z-20 overflow-hidden rounded-xl bg-white/96 px-3 py-2.5 shadow-[0_10px_28px_rgba(7,20,51,0.16)] ring-1 ring-navy/10">
          <div className="text-[8px] font-extrabold tracking-wide text-navy uppercase">Project status</div>
          <ul className="mt-1.5 space-y-1">
            {CESS_COUNTS.map((row) => (
              <li key={row.id} className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: row.color }} />
                <span className="text-[10px] font-bold text-navy">{row.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {mode === "hierarchy" && !compact ? (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
            {[
              "left-3 top-3 border-l-2 border-t-2 rounded-tl-md",
              "right-3 top-3 border-r-2 border-t-2 rounded-tr-md",
              "left-3 bottom-3 border-l-2 border-b-2 rounded-bl-md",
              "right-3 bottom-3 border-r-2 border-b-2 rounded-br-md",
            ].map((cls) => (
              <span key={cls} className={cn("absolute size-7 border-teal/40", cls)} />
            ))}
          </div>

          <div className="pointer-events-none absolute top-3 right-3 z-20">
            <div
              className="relative grid size-[72px] place-items-center overflow-hidden rounded-full bg-white/96 ring-1 ring-navy/10 backdrop-blur-md"
              style={{
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.95) inset, 0 10px 24px rgba(7,20,51,0.14), 0 0 0 1px rgba(20,196,212,0.2)",
              }}
            >
              <svg viewBox="0 0 72 72" className="absolute inset-0 size-full" aria-hidden>
                <circle cx="36" cy="36" r="33" fill="none" stroke={`${HEX.navy}18`} strokeWidth="1" />
                <circle cx="36" cy="36" r="24" fill={`${HEX.teal}12`} stroke={HEX.teal} strokeWidth="1.2" opacity="0.7" />
                <path d="M36 10 L40 36 L36 32 L32 36 Z" fill={HEX.navy} />
                <path d="M36 62 L32 36 L36 40 L40 36 Z" fill={`${HEX.navy}55`} />
                <path d="M10 36 L36 32 L32 36 L36 40 Z" fill={`${HEX.navy}40`} />
                <path d="M62 36 L36 40 L40 36 L36 32 Z" fill={`${HEX.navy}40`} />
                <circle cx="36" cy="36" r="3.2" fill={HEX.teal} stroke="#fff" strokeWidth="1.2" />
              </svg>
              <span className="relative z-[1] mt-[-34px] text-[8px] font-extrabold tracking-wide text-navy">N</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Field visit dossier — Territory and Officers stack under the same plaque. */
function LocationFactPlaque({
  cardsRef,
  site,
  reduce,
  onClose,
  showTerritory = false,
  showOfficers = false,
}: {
  cardsRef?: RefObject<HTMLDivElement | null>;
  site: (typeof CESS_SITES)[number];
  reduce: boolean;
  onClose?: () => void;
  showTerritory?: boolean;
  showOfficers?: boolean;
}) {
  const stacked = showTerritory || showOfficers;
  const deepStack = showOfficers;

  return (
    <AnimatePresence>
      <motion.div
        className="pointer-events-none absolute inset-0 z-30"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        transition={{ duration: 0.28 }}
      >
        {/* Soft survey-frame corners — no dark map veil */}
        <div aria-hidden className="absolute inset-4">
          {[
            "left-0 top-0 border-l-2 border-t-2 rounded-tl-lg",
            "right-0 top-0 border-r-2 border-t-2 rounded-tr-lg",
            "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-lg",
            "right-0 bottom-0 border-r-2 border-b-2 rounded-br-lg",
          ].map((cls) => (
            <span
              key={cls}
              className={cn(
                "absolute size-7",
                deepStack ? "border-gold/50" : stacked ? "border-teal/45" : "border-teal/40",
                cls,
              )}
            />
          ))}
        </div>

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: deepStack
              ? "radial-gradient(ellipse 44% 40% at 22% 22%, rgba(212,168,75,0.14) 0%, transparent 70%)"
              : stacked
                ? "radial-gradient(ellipse 42% 38% at 24% 28%, rgba(20,196,212,0.14) 0%, transparent 68%)"
                : "radial-gradient(ellipse 40% 36% at 26% 40%, rgba(20,196,212,0.08) 0%, transparent 65%)",
          }}
        />

        {!reduce && !stacked ? (
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[18%] bg-[linear-gradient(180deg,rgba(20,196,212,0.1),transparent)]"
            initial={{ y: "-40%", opacity: 0 }}
            animate={{ y: ["-40%", "280%"], opacity: [0, 0.35, 0] }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        ) : null}

        <motion.div
          ref={cardsRef}
          layout={!reduce}
          className={cn(
            "pointer-events-auto absolute top-3 left-3 z-10 flex max-h-[calc(100%-1.25rem)]",
            !stacked
              ? "w-[min(318px,calc(100%-1.5rem))] flex-col"
              : showOfficers
                ? "w-[min(1116px,calc(100%-1.5rem))] items-start gap-3"
                : "w-[min(712px,calc(100%-1.5rem))] items-start gap-3",
          )}
          initial={reduce ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={cn(
              "relative min-h-0 overflow-hidden rounded-[18px] bg-white/96 ring-1 ring-[#1476e8]/25 backdrop-blur-md",
              stacked && "w-[318px] shrink-0",
            )}
            style={{
              boxShadow: deepStack
                ? "0 1px 0 rgba(255,255,255,0.95) inset, 0 16px 40px rgba(7,20,51,0.18), 0 0 0 1px rgba(212,168,75,0.32)"
                : stacked
                  ? "0 1px 0 rgba(255,255,255,0.95) inset, 0 14px 36px rgba(7,20,51,0.16), 0 0 0 1px rgba(20,196,212,0.28)"
                  : "0 1px 0 rgba(255,255,255,0.95) inset, 0 10px 28px rgba(7,20,51,0.12), 0 0 0 1px rgba(26,78,138,0.12)",
            }}
          >
            <div className="max-h-[inherit] overflow-y-auto overscroll-contain">
              {/* Numbered header band */}
              <div
                className={cn(
                  "flex items-center gap-2.5 bg-[linear-gradient(90deg,#0f5fcf_0%,#1476e8_60%,#2f8af0_100%)] px-3 text-white",
                  "py-2.5",
                )}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[13px] font-extrabold text-[#0f5fcf] shadow-[0_2px_6px_rgba(7,20,51,0.25)]">
                  1
                </span>
                <b className="font-display min-w-0 flex-1 truncate text-[13.5px] leading-tight">
                  Project Details with GPS Location
                </b>
                {onClose ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/40 transition hover:bg-white/30"
                    aria-label="Close site details"
                  >
                    <X weight="bold" className="size-3" />
                  </button>
                ) : null}
              </div>

              {/* Photo + name */}
              <div className={"flex items-center gap-3 px-3 pt-3 pb-2"}>
                <motion.div
                  className={cn(
                    "relative shrink-0 overflow-hidden rounded-xl shadow-[0_6px_14px_rgba(7,20,51,0.16)] ring-1 ring-navy/10",
                    "h-[86px] w-[122px]",
                  )}
                  initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: reduce ? 0 : 0.1 }}
                >
                  <img
                    src={abcSite}
                    alt="ABC Commercial Complex under construction"
                    className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
                  />
                  <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-[#f5a524] px-2 py-0.5 text-[9.5px] font-bold text-[#7a3d00] shadow-sm">
                    <MapPin weight="fill" className="size-3 text-[#e0453c]" />
                    On Map
                  </span>
                </motion.div>
                <div className="min-w-0 flex-1">
                  <b
                    className={cn(
                      "font-display block leading-tight text-navy",
                      "text-[15px]",
                    )}
                  >
                    {site.fullName}
                  </b>
                  <motion.span
                    className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#dcf5e6] px-2 py-0.5 text-[10px] font-bold text-[#15803d] ring-1 ring-[#16a34a]/25"
                    initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 20, delay: reduce ? 0 : 0.3 }}
                  >
                    <CheckCircle weight="fill" className="size-3.5 text-[#16a34a]" />
                    GPS Captured
                  </motion.span>
                  <div className="mt-1 font-mono text-[10.5px] font-semibold text-navy/70">{PROJECT_ID}</div>
                </div>
              </div>

              <div className="px-3 pb-2">
                {PROJECT_ROWS.map((row, i) => (
                  <motion.div
                    key={row.label}
                    className="grid grid-cols-[18px_112px_8px_minmax(0,1fr)] items-center py-[3px] text-[10.5px]"
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, delay: reduce ? 0 : 0.35 + i * 0.06 }}
                  >
                    <row.Icon weight="fill" className="size-3.5 text-[#1476e8]" />
                    <span className="text-navy/75">{row.label}</span>
                    <span className="text-navy/50">:</span>
                    <b className="truncate font-semibold text-navy">{row.value}</b>
                  </motion.div>
                ))}
              </div>

              <div className="px-3 pt-1 pb-3">
                <MiniGpsMap reduce={reduce} />
              </div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {stacked ? (
              <motion.div
                key="assigned-territory"
                className="min-w-0 flex-1"
                initial={reduce ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.15 }}
              >
                <AssignedTerritoryCard reduce={reduce} />
              </motion.div>
            ) : null}
            {showOfficers ? (
              <motion.div
                key="assigned-office"
                className="min-w-0 flex-1"
                initial={reduce ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.2 }}
              >
                <AssignedOfficeCard reduce={reduce} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Office card on the Responsible Officers beat — department, officials and contacts. */
function AssignedOfficeCard({ reduce }: { reduce: boolean }) {
  return (
    <div
      className="overflow-hidden rounded-[18px] bg-white/96 ring-1 ring-[#f97316]/25 backdrop-blur-md"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.95) inset, 0 12px 32px rgba(7,20,51,0.14)" }}
    >
      <div className="flex items-center gap-2.5 bg-[linear-gradient(90deg,#e8590c_0%,#f97316_65%,#fb8a3c_100%)] px-3 py-2.5 text-white">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[13px] font-extrabold text-[#e8590c] shadow-[0_2px_6px_rgba(7,20,51,0.25)]">
          3
        </span>
        <b className="font-display min-w-0 flex-1 truncate text-[13.5px] leading-tight">Assigned Office Details</b>
      </div>

      <div className="relative px-3 pt-3 pb-3">
        <motion.div
          aria-hidden
          className="absolute top-2 right-2"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: reduce ? 0 : 0.3 }}
        >
          <OfficeBuildingArt />
        </motion.div>

        <div className="mb-2 flex items-center gap-2.5 pr-[84px]">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff1e6] text-[#f97316]">
            <Buildings weight="fill" className="size-5" />
          </span>
          <div className="min-w-0">
            <b className="font-display block text-[14px] leading-tight text-navy">Assigned Office</b>
            <span className="block text-[10.5px] leading-tight text-navy/60">Department and Responsible Officials</span>
          </div>
        </div>

        {OFFICE_ROWS.map((row, i) => (
          <motion.div
            key={row.label}
            className="grid grid-cols-[20px_96px_8px_minmax(0,1fr)] items-start py-[3.5px] text-[10.5px] leading-snug"
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, delay: reduce ? 0 : 0.35 + i * 0.07 }}
          >
            <row.Icon weight="fill" className="mt-px size-3.5 text-navy" />
            <span className="text-navy/75">{row.label}</span>
            <span className="text-navy/50">:</span>
            <span className="min-w-0 font-semibold break-words text-navy">
              {row.value}
              {row.phone ? (
                <span className="ml-2 inline-flex items-center gap-1 whitespace-nowrap">
                  <Phone weight="fill" className="size-3 text-navy" />
                  {row.phone}
                </span>
              ) : null}
            </span>
          </motion.div>
        ))}

        <motion.div
          className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-dashed border-[#16a34a]/35 bg-[#e7f6ee] px-2.5 py-2"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduce ? 0 : 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <UsersThree weight="fill" className="size-7 shrink-0 text-[#15803d]" />
          <div className="min-w-0 flex-1 leading-tight">
            <span className="block text-[9.5px] text-navy/70">This project is assigned to</span>
            <b className="block text-[11.5px] text-navy">{OFFICE_NAME}</b>
            <span className="block text-[9.5px] text-navy/70">for assessment and follow-up</span>
          </div>
          <motion.div
            className="flex shrink-0 items-center gap-2 rounded-lg bg-[#15803d] py-1.5 pr-2.5 pl-1.5 text-white shadow-[0_6px_14px_rgba(21,128,61,0.3)]"
            initial={reduce ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 18, delay: reduce ? 0 : 1.2 }}
          >
            <img src={inspectorPhoto} alt="R. Kumar" className="size-7 rounded-full object-cover ring-2 ring-white/80" />
            <span className="leading-tight">
              <b className="block text-[11px]">R. Kumar</b>
              <span className="block text-[9px] opacity-90">Field Inspector</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function OfficeBuildingArt() {
  return (
    <svg viewBox="0 0 84 64" className="h-[58px] w-[76px]">
      <circle cx="44" cy="30" r="28" fill="#dbeafe" />
      <rect x="22" y="14" width="30" height="44" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      <rect x="46" y="22" width="18" height="36" rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
      {[0, 1, 2, 3, 4].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`a${r}${c}`} x={25 + c * 9} y={18 + r * 7.5} width="6" height="4.5" rx="0.6" fill="#1e3a8a" opacity="0.8" />
        )),
      )}
      {[0, 1, 2, 3].map((r) =>
        [0, 1].map((c) => (
          <rect key={`b${r}${c}`} x={49 + c * 7} y={26 + r * 7.5} width="4.5" height="4.5" rx="0.6" fill="#1e3a8a" opacity="0.7" />
        )),
      )}
      <rect x="33" y="50" width="8" height="8" fill="#0f172a" opacity="0.7" />
      <circle cx="14" cy="50" r="7" fill="#22a05a" />
      <rect x="13" y="54" width="2" height="5" fill="#7c4a1e" />
      <circle cx="72" cy="50" r="6.5" fill="#22a05a" />
      <rect x="71" y="54" width="2" height="5" fill="#7c4a1e" />
      <rect x="4" y="58" width="78" height="2" rx="1" fill="#94a3b8" opacity="0.6" />
    </svg>
  );
}

const REGION_BLOBS: Record<Exclude<RegionGlyphKind, "ward" | "boundary">, string> = {
  state: "M9 1c2 1 1 3 3 4s3 2 2 4 1 3-1 5-2 4-4 5-3-2-4-4-2-3-1-5 1-3 2-5 2-3 3-4z",
  division: "M4 5c2-3 6-3 8-1s5 1 5 4-1 5-3 7-6 3-8 1-4-3-4-6 0-3 2-5z",
  district: "M6 2c3 0 4 2 6 2s5 2 5 5-2 4-2 6-3 3-6 3-5-2-6-5 0-4 0-6 1-5 3-5z",
  taluk: "M10 2c2 0 2 2 4 2s3 2 2 4 2 2 1 4-2 2-3 4-2 2-4 1-3 1-4-1-3-2-2-4-2-2-1-4 2-2 2-4 2-2 5-2z",
  ulb: "M5 3c3-1 5 1 7 0s5 1 4 4-3 3-2 5 0 5-3 5-4-2-6-1-4-1-3-4 1-4 0-6 0-3 3-3z",
};

function RegionGlyph({ kind, color }: { kind: RegionGlyphKind; color: string }) {
  if (kind === "ward") {
    return (
      <svg aria-hidden viewBox="0 0 20 20" className="size-[18px]">
        {[
          [2, 2],
          [11, 2],
          [2, 11],
          [11, 11],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="7" height="7" rx="1.6" fill={`${color}33`} stroke={color} strokeWidth="1.6" />
        ))}
      </svg>
    );
  }
  if (kind === "boundary") {
    return (
      <svg aria-hidden viewBox="0 0 20 20" className="size-[18px]">
        <rect x="2" y="2" width="16" height="16" rx="3" fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="3 2.4" />
      </svg>
    );
  }
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="size-[18px]">
      <path d={REGION_BLOBS[kind]} fill={color} />
    </svg>
  );
}

/** Territory card beside the project card — jurisdiction rows + nested boundary map. */
function AssignedTerritoryCard({ reduce }: { reduce: boolean }) {
  return (
    <div
      className="overflow-hidden rounded-[18px] bg-white/96 ring-1 ring-[#16a34a]/25 backdrop-blur-md"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.95) inset, 0 12px 32px rgba(7,20,51,0.14)" }}
    >
      <div className="flex items-center gap-2.5 bg-[linear-gradient(90deg,#11703a_0%,#16a34a_65%,#22b35a_100%)] px-3 py-2.5 text-white">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[13px] font-extrabold text-[#11703a] shadow-[0_2px_6px_rgba(7,20,51,0.25)]">
          2
        </span>
        <b className="font-display min-w-0 flex-1 truncate text-[13.5px] leading-tight">Assigned GIS Territory</b>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_118px] gap-3 px-3 pt-3 pb-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e8f1fd] text-[#1476e8]">
              <MapTrifold weight="fill" className="size-5" />
            </span>
            <div className="min-w-0">
              <b className="font-display block text-[14px] leading-tight text-navy">Assigned Territory</b>
              <span className="block text-[10.5px] text-navy/60">Administrative Jurisdiction</span>
            </div>
          </div>

          {TERRITORY_ROWS.map((row, i) => (
            <motion.div
              key={row.label}
              className="grid grid-cols-[22px_88px_8px_minmax(0,1fr)] items-start py-[4px] text-[10.5px] leading-snug"
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, delay: reduce ? 0 : 0.3 + i * 0.07 }}
            >
              <RegionGlyph kind={row.glyph} color={row.color} />
              <span className="pt-px text-navy/75">{row.label}</span>
              <span className="pt-px text-navy/50">:</span>
              <b className="pt-px font-semibold text-navy">{row.value}</b>
            </motion.div>
          ))}
        </div>

        <TerritoryBoundaryMap reduce={reduce} />
      </div>
    </div>
  );
}

/** District → taluk → ward boundaries draw in one after another, then the ward pin drops. */
function TerritoryBoundaryMap({ reduce }: { reduce: boolean }) {
  const layers = [
    {
      d: "M24 34C38 22 50 30 60 24S88 28 94 40S108 60 102 76S96 100 104 116S110 146 100 164S92 196 76 210S50 226 36 214S16 196 18 176S8 150 16 130S12 100 18 86S8 50 24 34Z",
      fill: "#3b82f6",
      fillOpacity: 0.3,
      stroke: "#60a5fa",
    },
    {
      d: "M30 70C42 58 52 64 62 58S86 64 90 76S98 96 94 110S98 138 90 152S74 172 62 172S40 170 32 158S20 140 24 124S18 84 30 70Z",
      fill: "#a855f7",
      fillOpacity: 0.45,
      stroke: "#c084fc",
    },
    {
      d: "M38 134C50 124 62 130 72 126S92 132 96 146S98 170 88 184S70 200 56 198S36 192 34 176S26 144 38 134Z",
      fill: "#ec4899",
      fillOpacity: 0.55,
      stroke: "#f9a8d4",
    },
  ];
  return (
    <div className="relative min-h-[236px] overflow-hidden rounded-xl bg-[linear-gradient(160deg,#3d5236_0%,#2a3b27_55%,#34482f_100%)] ring-1 ring-navy/15">
      <svg aria-hidden viewBox="0 0 118 236" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {[
          [14, 18, 10, "#4f6b43"],
          [96, 30, 14, "#26351f"],
          [20, 110, 12, "#51703f"],
          [100, 120, 10, "#26351f"],
          [60, 214, 16, "#4a6340"],
          [8, 214, 10, "#2c3d27"],
          [110, 200, 12, "#4f6b43"],
        ].map(([cx, cy, r, fill]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={fill as string} opacity="0.7" />
        ))}
        <path d="M0 96C30 90 60 104 118 92" fill="none" stroke="#c9b37a" strokeWidth="1" opacity="0.55" />
        <path d="M70 0C66 60 80 140 64 236" fill="none" stroke="#c9b37a" strokeWidth="1" opacity="0.5" />
        {layers.map((layer, i) => (
          <motion.path
            key={layer.d}
            d={layer.d}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth="1.8"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0, fillOpacity: 0 }}
            animate={{ pathLength: 1, fillOpacity: layer.fillOpacity }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.35 + i * 0.45, ease: "easeInOut" }}
            style={reduce ? { fillOpacity: layer.fillOpacity } : undefined}
          />
        ))}
      </svg>

      <span className="absolute top-2.5 left-1/2 -translate-x-1/2 rounded-md bg-navy/55 px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-white">
        Bengaluru Urban
      </span>
      <motion.span
        className="absolute top-[36%] left-1/2 -translate-x-1/2 text-center text-[9.5px] leading-tight font-bold whitespace-nowrap text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: reduce ? 0 : 0.9 }}
      >
        Bengaluru East
        <br />
        Taluk
      </motion.span>
      <motion.span
        className="absolute top-[64%] left-1/2 inline-flex -translate-x-1/2 items-center gap-0.5 rounded-md bg-white px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-navy shadow-md"
        initial={reduce ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 16, delay: reduce ? 0 : 1.5 }}
      >
        <MapPin weight="fill" className="size-3.5 text-[#e0453c]" />
        Ward No. 86
      </motion.span>
    </div>
  );
}

/** Small drawn map under the project card — pin drops onto the captured GPS point. */
function MiniGpsMap({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative h-[108px] overflow-hidden rounded-xl bg-[#dfe8d2] ring-1 ring-navy/10">
      <svg aria-hidden viewBox="0 0 300 108" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <rect width="300" height="108" fill="#dfe8d2" />
        <path d="M0 0h70l-12 38H0z" fill="#c9d9b4" />
        <path d="M210 70l90-8v46h-104z" fill="#c9d9b4" />
        <path d="M232 0h68v34l-58 6z" fill="#d7cfb8" />
        {[
          [96, 10, 26, 14],
          [128, 8, 20, 18],
          [100, 30, 18, 12],
          [178, 16, 24, 16],
          [184, 40, 16, 12],
          [88, 70, 22, 14],
          [118, 84, 18, 14],
          [196, 78, 22, 16],
          [22, 60, 24, 16],
          [52, 82, 20, 14],
          [250, 44, 22, 12],
        ].map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="1.5" fill="#b9bfc4" opacity="0.75" />
        ))}
        <path d="M-10 52C60 44 110 64 160 56S250 40 310 50" fill="none" stroke="#f3b25a" strokeWidth="4" />
        <path d="M140 -10C150 30 146 70 160 118" fill="none" stroke="#f3b25a" strokeWidth="3.5" />
        <path d="M0 96C80 90 150 100 300 88" fill="none" stroke="#ffffff" strokeWidth="2.5" />
        <path d="M76 -10L64 118" fill="none" stroke="#ffffff" strokeWidth="2" />
        <path d="M226 -10L236 118" fill="none" stroke="#ffffff" strokeWidth="2" />
      </svg>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[38%]">
        <span className="relative grid size-[62px] place-items-center rounded-full border-2 border-[#1476e8] bg-[#1476e8]/25">
          {!reduce ? (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border-2 border-[#1476e8]"
              animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
          <span className="size-3.5 rounded-full bg-[#1476e8] ring-2 ring-white" />
        </span>
        <motion.span
          className="absolute -top-[20px] left-1/2 -translate-x-1/2"
          initial={reduce ? false : { y: -26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 16, delay: reduce ? 0 : 0.7 }}
        >
          <MapPin weight="fill" className="size-8 text-[#e0453c] drop-shadow-[0_3px_3px_rgba(7,20,51,0.35)]" />
        </motion.span>
      </div>

      <div className="absolute bottom-2 left-2 rounded-lg bg-white/95 px-2 py-1 text-[9.5px] leading-snug text-navy shadow-sm ring-1 ring-navy/10">
        <div>Lat: {LAT}</div>
        <div>Long: {LNG}</div>
      </div>

      <div className="absolute top-2 right-2 flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-navy/10">
        <span className="grid size-6 place-items-center border-b border-navy/10 text-navy">
          <Plus weight="bold" className="size-3" />
        </span>
        <span className="grid size-6 place-items-center text-navy">
          <Minus weight="bold" className="size-3" />
        </span>
      </div>
      <span className="absolute right-2 bottom-2 grid size-6 place-items-center rounded-lg bg-white text-[#1476e8] shadow-sm ring-1 ring-navy/10">
        <Crosshair weight="bold" className="size-3.5" />
      </span>
    </div>
  );
}

function StoryFooter({
  showKey,
  beat,
}: {
  showKey: boolean;
  beat: number;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-1.5">
      {showKey ? (
        <Reveal beat={beat} at={4}>
          <div className="rounded-xl bg-ok-soft/80 px-3 py-1.5 shadow-sm ring-1 ring-ok/25">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] font-extrabold tracking-[0.12em] text-ok uppercase">Key message</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-navy shadow-sm">
                <GpsFix weight="fill" className="size-3.5 text-teal" />
                GPS shows the place
              </span>
              <span className="text-[11px] font-extrabold text-ok/40">→</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-1 text-[11px] font-bold text-teal-bright">
                <MapTrifold weight="fill" className="size-3.5" />
                Territory shows path and officer
              </span>
              <span className="text-[11px] font-extrabold text-ok/40">→</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ok px-2.5 py-1 text-[11px] font-bold text-white">
                <SquaresFour weight="fill" className="size-3.5" />
                MIS dashboard watches all projects
              </span>
            </div>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}

