import type { PathwayId } from "@/lib/pathways";

/** Horizon pathway colours (each pathway keeps one colour across every Horizon section). */
export const HZ_COLOR: Record<PathwayId, { c: string; soft: string }> = {
  invest: { c: "#1ea765", soft: "#e8f7ef" },
  connect: { c: "#2f6fe0", soft: "#e9f0fd" },
  talent: { c: "#7b3fe4", soft: "#f1eafd" },
  partner: { c: "#f0562e", soft: "#feede8" },
  discover: { c: "#f5a915", soft: "#fef5e3" },
};

export const HZ_TEAL = { c: "#12a3a0", soft: "#e4f6f5" };
