import { ClosureStage } from "@/components/ClosureStage";

/** Slide 05 · beat 0: current exception to closure · beat 1: old dues brought forward. */
export function LeakScene({ beat }: { beat: number; onBeat?: (n: number) => void }) {
  return <ClosureStage old={beat >= 1} />;
}
