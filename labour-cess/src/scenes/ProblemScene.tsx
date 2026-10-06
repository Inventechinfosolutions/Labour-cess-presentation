import { ProblemStage } from "@/components/ProblemStage";
import { PlatformModulesStage } from "@/components/PlatformModulesStage";
import { MiddlewareStage } from "@/components/MiddlewareStage";
import { ProjectRecordStage } from "@/components/ProjectRecordStage";

/** Beat 0: Problem Statement · Beat 1: 17 Modules Connected · Beat 2: Smart Middleware · Beat 3: Match Project Information. */
export function ProblemScene({ beat }: { beat: number; onBeat?: (n: number) => void }) {
  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr] gap-2">
      {beat < 1 ? (
        <ProblemStage beat={beat} />
      ) : beat === 1 ? (
        <PlatformModulesStage />
      ) : beat === 2 ? (
        <MiddlewareStage />
      ) : (
        <ProjectRecordStage />
      )}
    </div>
  );
}
