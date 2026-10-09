import type { Opportunity } from "./types";

/** Canonical document names per project type (admin Document checklists screen). */
export const PROJECT_TYPE_CHECKLIST_DOC_NAMES: Record<Opportunity["type"], readonly string[]> = {
  Solar: [
    "Company registration",
    "Technical capability",
    "Financial statements (3 yrs)",
    "Past project experience",
  ],
  Wind: [
    "Company registration",
    "Wind resource assessment",
    "Land title / lease",
    "Environmental clearance",
  ],
  Hybrid: [
    "Company registration",
    "Technical capability",
    "Financial statements",
    "Hybrid plant experience",
  ],
};

export const PROJECT_TYPE_CHECKLIST_LABELS: Record<Opportunity["type"], string> = {
  Solar: "Solar — standard",
  Wind: "Wind — standard",
  Hybrid: "Hybrid — standard",
};

/** Default IPP upload rows for new opportunities when an admin picks a project type. */
export function getDefaultDocumentChecklistForProjectType(
  projectType: Opportunity["type"],
): { name: string; mandatory: boolean }[] {
  return PROJECT_TYPE_CHECKLIST_DOC_NAMES[projectType].map((name) => ({ name, mandatory: true }));
}
