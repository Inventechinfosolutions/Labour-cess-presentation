import type { DuplicateMatchScore } from '@/store/types';

/** Display percentage for the duplicate risk meter (qualitative score → bar width). */
export function duplicateMatchPercent(score: DuplicateMatchScore): number {
  if (score === 'HIGH') return 96;
  if (score === 'MEDIUM') return 78;
  return 52;
}
