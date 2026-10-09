import type { Opportunity } from "@/lib/types";

const TYPE_SLUG: Record<Opportunity["type"], string> = {
  Solar: "solar",
  Wind: "wind",
  Hybrid: "hybrid",
};

/** First three letters from scheme title (Unicode letters only), uppercase, padded with X. */
export function titlePrefixFromSchemeName(name: string): string {
  const letters = [...name.normalize("NFKC")].filter((ch) => /\p{L}/u.test(ch)).join("");
  const head = letters.slice(0, 3).toUpperCase();
  return (head + "XXX").slice(0, 3);
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Public register reference, e.g. `RAJ-solar-01` — title prefix, technology slug, and a running sequence
 * for that prefix + type among existing opportunities.
 */
export function generateOpportunityReference(
  schemeName: string,
  type: Opportunity["type"],
  existing: Pick<Opportunity, "referenceCode">[],
): string {
  const prefix = titlePrefixFromSchemeName(schemeName);
  const slug = TYPE_SLUG[type];
  const pattern = new RegExp(`^${escapeRegExp(prefix)}-${slug}-(\\d+)$`, "i");
  let max = 0;
  for (const o of existing) {
    const ref = o.referenceCode;
    if (!ref) continue;
    const m = ref.match(pattern);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}-${slug}-${String(max + 1).padStart(2, "0")}`;
}

/**
 * Returns persisted reference code when available.
 * Falls back to a deterministic virtual reference for older records
 * that were created before `referenceCode` was introduced.
 */
export function resolveOpportunityReference(
  opportunity: Pick<Opportunity, "id" | "name" | "type" | "referenceCode">,
  all: Pick<Opportunity, "id" | "name" | "type" | "referenceCode">[],
): string {
  const persisted = opportunity.referenceCode?.trim();
  if (persisted) return persisted;

  const prefix = titlePrefixFromSchemeName(opportunity.name);
  const slug = TYPE_SLUG[opportunity.type];
  const comparable = all
    .filter((o) => titlePrefixFromSchemeName(o.name) === prefix && TYPE_SLUG[o.type] === slug)
    .sort((a, b) => a.id.localeCompare(b.id));
  const idx = comparable.findIndex((o) => o.id === opportunity.id);
  const seq = idx >= 0 ? idx + 1 : 1;
  return `${prefix}-${slug}-${String(seq).padStart(2, "0")}`;
}
