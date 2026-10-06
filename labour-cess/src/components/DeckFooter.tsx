import { CaretLeft, CaretRight } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SCENES, type SceneMeta } from "@/lib/deck";
import { cn } from "@/lib/utils";

type Props = {
  slide: number;
  beat: number;
  scene: SceneMeta;
  onGoTo: (slide: number, beat?: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function DeckFooter({ slide, beat, scene, onGoTo, onPrev, onNext }: Props) {
  const beatPct = ((beat + 1) / scene.beats) * 100;

  return (
    <footer
      className="z-20 flex h-12 shrink-0 items-center gap-2 bg-navy-deep px-2 text-white/80 sm:h-14 sm:gap-3 sm:px-3"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <nav aria-label="Scenes" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SCENES.map((s, i) => {
          const current = i === slide;
          return (
            <button
              key={s.id}
              type="button"
              title={s.title}
              onClick={() => onGoTo(i, 0)}
              className={cn(
                "flex h-8 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold tracking-wide transition-all",
                current
                  ? "bg-teal-bright px-2.5 text-navy-deep shadow-[0_0_0_4px_rgba(20,196,212,0.18)] sm:px-3"
                  : i < slide
                    ? "size-7 bg-teal-bright/25 text-teal-bright hover:bg-teal-bright/40 sm:size-8"
                    : "size-7 bg-white/10 text-white/45 hover:bg-white/18 hover:text-white/80 sm:size-8",
                i === 0 && !current && "rounded-md",
              )}
            >
              {current ? (
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <span className="opacity-70">{i === 0 ? "•" : String(i).padStart(2, "0")}</span>
                  <span className="max-w-[5.5rem] truncate sm:max-w-none">{s.nav}</span>
                </span>
              ) : i === 0 ? (
                "•"
              ) : (
                String(i).padStart(2, "0")
              )}
            </button>
          );
        })}
      </nav>

      <div className="w-[4.25rem] shrink-0 sm:w-36">
        <div className="mb-1 flex items-center justify-between text-[9px] font-bold tracking-[0.12em] text-white/50 uppercase">
          <span className="hidden sm:inline">Beat</span>
          <span className="text-teal-bright">
            {beat + 1}/{scene.beats}
          </span>
        </div>
        <Progress value={beatPct} className="h-1.5 bg-white/15" />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-white hover:bg-white/10"
          onClick={onPrev}
          title="Previous beat"
        >
          <CaretLeft weight="bold" className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-white hover:bg-white/10"
          onClick={onNext}
          title="Next beat"
        >
          <CaretRight weight="bold" className="size-4" />
        </Button>
        <span className="ml-1 hidden items-center gap-1.5 text-[10px] text-white/45 lg:flex">
          <Kbd>→</Kbd> beat
          <Kbd>O</Kbd> overview
          <Kbd>F</Kbd> full
        </span>
      </div>
    </footer>
  );
}
function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-bold text-white/80">
      {children}
    </kbd>
  );
}

