import { ProblemStage } from "@/components/ProblemStage";
import { MiddlewareStage } from "@/components/MiddlewareStage";
import { ProjectRecordStage } from "@/components/ProjectRecordStage";

/** Beat 0: Problem Statement · Beat 1: Smart Middleware · Beat 2: Match Project Information. */
export function ProblemScene({ beat }: { beat: number; onBeat?: (n: number) => void }) {
  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr] gap-2">
      {beat < 1 ? <ProblemStage beat={beat} /> : beat === 1 ? <MiddlewareStage /> : <ProjectRecordStage />}
    </div>
  );
}
