import { LOOP_PALETTES } from "@/lib/outcomes";
import { useTheme } from "@/theme/context";

export function usePalette(): readonly string[] {
  const { theme } = useTheme();
  return LOOP_PALETTES[theme];
}
