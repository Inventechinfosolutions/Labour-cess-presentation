import type { Document, Opportunity } from "./types";

export type IppChecklistRow = {
  name: string;
  mandatory: boolean;
  fromEligibility: boolean;
};

/** Scheme document checklist and eligibility criteria. */
export function buildIppUploadChecklist(opp: Opportunity): IppChecklistRow[] {
  const out: IppChecklistRow[] = [];
  const seen = new Set<string>();

  for (const elig of opp.eligibility ?? []) {
    const name = `Eligibility: ${elig.criterion}`.trim();
    if (!name) continue;
    const k = name.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ name, mandatory: elig.mandatory, fromEligibility: true });
  }

  for (const d of opp.documents ?? []) {
    const name = d.name.trim();
    if (!name) continue;
    const k = name.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ name, mandatory: d.mandatory, fromEligibility: false });
  }
  return out;
}

/** Row labels for UI: works for new drafts (ipp* fields) and older saved projects. */
export function resolveIppDocumentRowMeta(d: Document, opp: Opportunity | undefined): {
  mandatory: boolean;
  fromEligibility: boolean;
} {
  const checklist = opp ? buildIppUploadChecklist(opp) : [];
  const row = checklist.find((c) => c.name.toLowerCase() === d.name.trim().toLowerCase());
  const mandatory = d.ippMandatory ?? row?.mandatory ?? false;
  const fromEligibility =
    d.ippUploadSource === "eligibility" || (d.ippUploadSource === undefined && row?.fromEligibility === true);
  return { mandatory, fromEligibility };
}
