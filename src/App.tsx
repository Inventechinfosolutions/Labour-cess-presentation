import { CornersOut, Question, SquaresFour } from "@/lib/icons";
import { DeckFooter } from "@/components/DeckFooter";
import { KaMark } from "@/components/SlideKit";
import { SlideViewport } from "@/components/SlideViewport";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePresenter } from "@/hooks/usePresenter";
import { SCENES } from "@/lib/deck";
import { cn } from "@/lib/utils";
import { AssessScene } from "@/scenes/AssessScene";
import { CommandScene } from "@/scenes/CommandScene";
import { CoreScene } from "@/scenes/CoreScene";
import { LeakScene } from "@/scenes/LeakScene";
import { GisScene } from "@/scenes/GisScene";
import { GpsScene } from "@/scenes/GpsScene";
import { ProblemScene } from "@/scenes/ProblemScene";
import { TitleScene } from "@/scenes/TitleScene";

export default function App() {
  const p = usePresenter();

  return (
    <div
      className="flex h-full flex-col bg-background"
      onClick={() => p.next()}
      onDoubleClick={(e) => {
        e.preventDefault();
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }}
    >
      <header
        className="z-20 flex h-12 shrink-0 items-center gap-2 bg-linear-to-b from-navy-deep to-navy px-2.5 text-white sm:h-14 sm:gap-4 sm:px-4"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <KaMark className="size-8 shrink-0 sm:size-10" />
          <span className="min-w-0">
            <span className="font-display block truncate text-[11px] leading-tight font-bold sm:text-[13px]">
              <span className="sm:hidden">KBOCWWB · Labour CESS</span>
              <span className="hidden sm:inline">
                Karnataka Building And Other Construction Workers Welfare Board
              </span>
            </span>
            <small className="mt-0.5 block font-sans text-[9px] font-medium tracking-[0.1em] text-white/70 uppercase sm:text-[10px]">
              Government of Karnataka
            </small>
          </span>
        </div>
        <div className="hidden max-w-[28%] truncate text-sm font-semibold opacity-90 md:block">{p.scene.title}</div>
        <div className="rounded-full bg-white/10 px-2 py-1 font-display text-[10px] tracking-widest sm:px-3 sm:text-xs">
          {p.slide === 0 ? "Opening" : `${String(p.slide).padStart(2, "0")} / ${String(SCENES.length - 1).padStart(2, "0")}`}
        </div>
        <Button variant="ghost" size="icon" className="size-8 shrink-0 text-white hover:bg-white/10 sm:size-9" onClick={() => p.setOverview(true)}>
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

      <main className="relative min-h-0 flex-1">
        {p.slide === 0 ? (
          <TitleScene />
        ) : (
          <SlideViewport>
            {p.slide === 1 && <ProblemScene beat={p.beat} onBeat={(n) => p.goTo(1, n)} />}
            {p.slide === 2 && <AssessScene beat={p.beat} onBeat={(n) => p.goTo(2, n)} />}
            {p.slide === 3 && <GpsScene beat={p.beat} />}
            {p.slide === 4 && <GisScene beat={p.beat} onBeat={(n) => p.goTo(4, n)} />}
            {p.slide === 5 && <LeakScene beat={p.beat} />}
            {p.slide === 6 && <CommandScene beat={p.beat} />}
            {p.slide === 7 && <CoreScene beat={p.beat} />}
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
