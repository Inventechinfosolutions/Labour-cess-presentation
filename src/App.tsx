import { CornersOut, Pause, Question, SpeakerHigh, SquaresFour } from "@/lib/icons";
import { DeckFooter } from "@/components/DeckFooter";
import { KaMark } from "@/components/SlideKit";
import { SlideViewport } from "@/components/SlideViewport";
import assessStageBg from "@/assets/assess-stage-bg.jpg";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePresenter } from "@/hooks/usePresenter";
import { useVoiceover } from "@/hooks/useVoiceover";
import { SCENES } from "@/lib/deck";
import { FULL_VOICE } from "@/lib/voiceover";
import { cn } from "@/lib/utils";
import headerSkyline from "@/assets/header-skyline-band.jpg";
import { ArchitectureScene } from "@/scenes/ArchitectureScene";
import { AssessScene } from "@/scenes/AssessScene";
import { CoreScene } from "@/scenes/CoreScene";
import { LeakScene } from "@/scenes/LeakScene";
import { MilestonesScene } from "@/scenes/MilestonesScene";
import { GisScene } from "@/scenes/GisScene";
import { GpsScene } from "@/scenes/GpsScene";
import { ProblemScene } from "@/scenes/ProblemScene";
import { RisksScene } from "@/scenes/RisksScene";
import { ThanksScene } from "@/scenes/ThanksScene";
import { TitleScene } from "@/scenes/TitleScene";
import { useEffect, type ReactNode } from "react";

const FIELD_DEMAND_HEAD = {
  title: (
    <>
      Survey, Estimation &amp;{" "}
      <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Demand Notice</span>
    </>
  ),
  titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
};

const ARCH_HEAD = {
  title: (
    <>
      Architecture,{" "}
      <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Technology &amp; Security</span>
      <span className="mt-[0.45em] block font-sans text-[0.42em] font-medium tracking-[0.06em] text-white/85 normal-case">
        Scalable&nbsp;&nbsp;·&nbsp;&nbsp;Secure&nbsp;&nbsp;·&nbsp;&nbsp;Integrated&nbsp;&nbsp;·&nbsp;&nbsp;Citizen Centric
      </span>
    </>
  ),
  titleClass: "text-[length:clamp(15px,min(1.95vw,3.6vh),32px)] tracking-[-0.02em]",
};

const PLAN_HEAD = {
  title: (
    <>
      Project Delivery{" "}
      <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Milestones</span>
      <span className="mt-[0.45em] block font-sans text-[0.42em] font-medium tracking-[0.06em] text-white/85 normal-case">
        From Planning to Impact&nbsp;&nbsp;·&nbsp;&nbsp;Transparent Governance&nbsp;&nbsp;·&nbsp;&nbsp;Empowering Workers
      </span>
    </>
  ),
  titleClass: ARCH_HEAD.titleClass,
};

const RISK_HEAD = {
  title: (
    <>
      Risks &amp; Their{" "}
      <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Mitigation</span>
      <span className="mt-[0.45em] block font-sans text-[0.42em] font-medium tracking-[0.06em] text-white/85 normal-case">
        Each Risk&nbsp;&nbsp;·&nbsp;&nbsp;A Clear Plan&nbsp;&nbsp;·&nbsp;&nbsp;A Named Owner
      </span>
    </>
  ),
  titleClass: ARCH_HEAD.titleClass,
};

/** Poster-style header title per slide/beat (key: "slide/beat"). */
const POSTER_HEAD: Record<string, { title: ReactNode; titleClass: string }> = {
  "7/0": ARCH_HEAD,
  "7/1": ARCH_HEAD,
  "7/2": ARCH_HEAD,
  "8/0": PLAN_HEAD,
  "8/1": PLAN_HEAD,
  "8/2": PLAN_HEAD,
  "8/3": PLAN_HEAD,
  "8/4": PLAN_HEAD,
  "9/0": RISK_HEAD,
  "9/1": RISK_HEAD,
  "9/2": RISK_HEAD,
  "9/3": RISK_HEAD,
  "1/0": {
    title: (
      <>
        CURRENT <span className="text-[#ff2935]">ISSUES</span>
      </>
    ),
    titleClass: "text-[length:clamp(18px,min(2.5vw,4.6vh),40px)] tracking-[-0.04em]",
  },
  "1/1": {
    title: (
      <>
        Smart Middleware &amp; CESS{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Self-Service Portal</span>
      </>
    ),
    titleClass: "text-[length:clamp(15px,min(1.95vw,3.6vh),32px)] tracking-[-0.02em] whitespace-nowrap",
  },
  "1/2": {
    title: (
      <>
        CESS Integrated{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Agencies</span>
      </>
    ),
    titleClass: "text-[length:clamp(15px,min(1.95vw,3.6vh),32px)] tracking-[-0.02em]",
  },
  "3/0": {
    title: (
      <>
        Field Officer{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Mobile App</span>
      </>
    ),
    titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
  },
  "3/1": {
    title: (
      <>
        Location &amp;{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Evidence Capture</span>
      </>
    ),
    titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
  },
  "3/2": FIELD_DEMAND_HEAD,
  "3/3": FIELD_DEMAND_HEAD,
  "3/4": FIELD_DEMAND_HEAD,
  "3/5": FIELD_DEMAND_HEAD,
  "3/6": {
    title: (
      <>
        Offline Field{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Assessment</span>
      </>
    ),
    titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
  },
  "4/0": {
    title: (
      <>
        Project{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Location</span>
      </>
    ),
    titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
  },
  "4/1": {
    title: (
      <>
        Project Territory{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Map</span>
      </>
    ),
    titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
  },
  "4/2": {
    title: (
      <>
        Mapped Responsible{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Officer</span>
      </>
    ),
    titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
  },
  "4/3": {
    title: (
      <>
        Department &amp; Territory-wise Project{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Status</span>
      </>
    ),
    titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
  },
  "4/4": {
    title: (
      <>
        MIS{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Dashboard</span>
      </>
    ),
    titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
  },
  "5/0": {
    title: (
      <>
        CESS Exception to{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Closure</span>
      </>
    ),
    titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
  },
  "5/1": {
    title: (
      <>
        Old CESS Dues{" "}
        <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">Brought Forward</span>
      </>
    ),
    titleClass: "text-[length:clamp(16px,min(2.2vw,4vh),36px)] tracking-[-0.02em]",
  },
};

/** Gold-highlighted ending of each scene title in the poster header (key: scene id). */
const TITLE_HIGHLIGHT: Record<string, string> = {
  title: "Tracking & Monitoring",
  problem: "One Project File",
  assess: "Lifecycle",
  gps: "Mobile App",
  gis: "Map",
  leak: "Closure",
  core: "Management Platform",
  arch: "Technology & Security",
  plan: "Milestones",
};

function scenePoster(id: string, title: string) {
  const mark = TITLE_HIGHLIGHT[id];
  const cut = mark && title.endsWith(mark) ? title.length - mark.length : title.length;
  const lead = title.slice(0, cut).trim();
  return {
    title: (
      <>
        {lead && `${lead} `}
        {cut < title.length && (
          <span className="rounded-md bg-[#f5b21b] px-[0.25em] py-[0.04em] whitespace-nowrap text-navy-deep">{title.slice(cut)}</span>
        )}
      </>
    ),
    titleClass: "text-[length:clamp(15px,min(1.95vw,3.6vh),32px)] tracking-[-0.02em]",
  };
}

export default function App() {
  const p = usePresenter();
  const poster = POSTER_HEAD[`${p.slide}/${p.beat}`] ?? scenePoster(p.scene.id, p.scene.title);
  const voice = useVoiceover({
    slide: p.slide,
    onCue: ({ slide, beat }) => p.goTo(slide, beat),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        voice.toggleScene();
      }
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        voice.toggleFull();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [voice.toggleScene, voice.toggleFull]);

  return (
    <div
      className="flex h-full flex-col bg-background"
      onClick={() => {
        if (voice.playing) return;
        p.next();
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }}
    >
      {p.slide !== 0 && p.scene.id !== "thanks" && (
      <header
        className="relative isolate z-20 flex h-14 shrink-0 items-center gap-2 overflow-hidden bg-linear-to-b from-navy-deep to-navy px-2.5 text-white sm:h-[clamp(4.75rem,min(6vw,10vh),6.25rem)] sm:gap-4 sm:px-4 [&_button]:drop-shadow-[0_1px_3px_rgba(4,12,40,0.85)]"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <img
          src={headerSkyline}
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 -z-10 h-full w-auto max-w-none"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.6) 28%, #000 55%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.6) 28%, #000 55%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-[45%] bg-[linear-gradient(180deg,rgba(9,22,66,0.45)_0%,rgba(9,22,66,0.1)_50%,rgba(9,22,66,0)_100%)]"
        />
        <div className="flex shrink-0 items-center gap-2 max-sm:flex-none sm:gap-3">
          <KaMark className="size-9 shrink-0 sm:size-[clamp(2.25rem,min(3vw,5vh),3rem)]" />
          <span className="min-w-0 max-sm:hidden">
            <span className="font-display block truncate text-[length:clamp(11px,min(0.8vw,1.4vh),13px)] leading-tight font-bold">
              <span className="sm:hidden">KBOCWWB · Labour CESS</span>
              <span className="hidden sm:inline">
                Karnataka Building And Other
                <br />
                Construction Workers Welfare Board
              </span>
            </span>
            <small className="mt-0.5 block font-sans text-[length:clamp(9px,min(0.62vw,1.1vh),10px)] font-medium tracking-[0.1em] text-white/70 uppercase">
              Government of Karnataka
            </small>
          </span>
        </div>
        <div className="min-w-0 flex-1 px-1 text-center sm:px-2">
          <div className={cn(poster.titleClass, "font-display leading-none font-black uppercase")}>{poster.title}</div>
        </div>
        <div className="rounded-full bg-navy-deep/60 px-2 py-1 font-display text-[10px] tracking-widest ring-1 ring-white/15 backdrop-blur-sm sm:px-3 sm:text-xs">
          {p.slide === 0 ? "Opening" : `${String(p.slide).padStart(2, "0")} / ${String(SCENES.length - 2).padStart(2, "0")}`}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-8 shrink-0 text-white hover:bg-white/10 sm:size-9",
            voice.playing && "bg-teal-bright/25 text-teal-bright",
          )}
          title={
            voice.playing
              ? `Pause · ${voice.track.title}${voice.syncing ? " · slides follow voice" : ""}`
              : "Play scene voice + auto-advance (V)"
          }
          onClick={() => voice.toggleScene()}
        >
          {voice.playing ? <Pause weight="fill" className="size-4" /> : <SpeakerHigh weight="bold" className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "hidden size-8 shrink-0 text-white/80 hover:bg-white/10 sm:inline-flex sm:size-9",
            voice.playing && voice.track.id === FULL_VOICE.id && "bg-teal-bright/25 text-teal-bright",
          )}
          title={`Full video speech + auto-advance (B) · ${FULL_VOICE.title}`}
          onClick={() => voice.toggleFull()}
        >
          <span className="font-display text-[10px] font-extrabold tracking-wide">VO</span>
        </Button>        <Button variant="ghost" size="icon" className="size-8 shrink-0 text-white hover:bg-white/10 sm:size-9" onClick={() => p.setOverview(true)}>
          <SquaresFour weight="bold" className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden size-8 shrink-0 text-white hover:bg-white/10 sm:inline-flex sm:size-9"
          onClick={() => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
            else document.exitFullscreen().catch(() => {});
          }}
        >
          <CornersOut weight="bold" className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8 shrink-0 text-white hover:bg-white/10 sm:size-9" onClick={() => p.setHelp(true)}>
          <Question weight="bold" className="size-4" />
        </Button>
      </header>
      )}

      <main className="relative min-h-0 flex-1">
        {p.slide === 0 ? (
          <TitleScene />
        ) : (
          <SlideViewport
            className={poster ? "bg-[linear-gradient(180deg,#e8f4fd_0%,#e6f1fb_55%,#e3f0fb_100%)]" : undefined}
            style={
              p.slide === 2
                ? {
                    background: `linear-gradient(180deg, rgba(232,244,253,0.4) 0%, rgba(232,244,253,0.25) 60%, rgba(214,232,248,0.45) 100%), url(${assessStageBg}) center 60% / cover no-repeat`,
                  }
                : undefined
            }
          >
            {p.slide === 1 && <ProblemScene beat={p.beat} onBeat={(n) => p.goTo(1, n)} />}
            {p.slide === 2 && <AssessScene beat={p.beat} onBeat={(n) => p.goTo(2, n)} />}
            {p.slide === 3 && <GpsScene beat={p.beat} />}
            {p.slide === 4 && <GisScene beat={p.beat} onBeat={(n) => p.goTo(4, n)} />}
            {p.slide === 5 && <LeakScene beat={p.beat} onBeat={(n) => p.goTo(5, n)} />}
            {p.slide === 6 && <CoreScene beat={p.beat} onBeat={(n) => p.goTo(6, n)} />}
            {p.slide === 7 && <ArchitectureScene beat={p.beat} />}
            {p.slide === 8 && <MilestonesScene beat={p.beat} />}
            {p.slide === 9 && <RisksScene beat={p.beat} />}
            {p.slide === 10 && <ThanksScene />}
          </SlideViewport>
        )}
      </main>

      <DeckFooter
        slide={p.slide}
        beat={p.beat}
        scene={p.scene}
        onGoTo={p.goTo}
        onPrev={p.prev}
        onNext={p.next}
      />

      <Dialog open={p.overview} onOpenChange={p.setOverview}>
        <DialogContent className="max-h-[80vh] w-[min(1100px,94vw)] overflow-auto bg-navy-deep/95" onClick={(e) => e.stopPropagation()}>
          <DialogTitle className="mb-4">Jump to a scene</DialogTitle>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => p.goTo(i, 0)}
                className={cn(
                  "min-h-24 rounded-2xl border border-white/10 bg-white/10 p-3 text-left text-white sm:min-h-28 sm:p-4",
                  i === p.slide && "ring-2 ring-teal-bright",
                )}
              >
                <span className="block text-[11px] tracking-widest text-teal-bright">{i === 0 ? "Open" : String(i).padStart(2, "0")}</span>
                <span className="font-display mt-2 block text-base sm:text-lg">{s.title}</span>
                <span className="mt-2 block text-xs text-white/60 sm:text-sm">{s.kicker}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={p.help} onOpenChange={p.setHelp}>
        <DialogContent className="w-[min(520px,94vw)]" onClick={(e) => e.stopPropagation()}>
          <DialogTitle>Presenter controls</DialogTitle>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {[
                ["→ · Space · Click", "Next beat, then next scene"],
                ["← · Backspace", "Previous beat / scene"],
                ["V · Speaker", "Play voice — slides/beats follow the speech"],
                ["B · VO", "Full video speech with auto-advance (~8 min)"],
                ["Manual navigate", "Stops voice (Space / arrows / scene pills)"],
                ["O · Esc", "Slide overview"],
                ["F · Double-click", "Fullscreen"],
                ["0–9", "Jump to scene"],
                ["? · H", "This help"],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-white/10">
                  <td className="w-36 py-2 align-top font-bold text-teal-bright sm:w-44">{k}</td>
                  <td className="py-2">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
