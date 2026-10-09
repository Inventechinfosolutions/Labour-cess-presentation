import type { Project, SLAStatus } from "@/lib/types";
import { db } from "@/lib/mock-db";
import { resolveOpportunityReference } from "@/lib/opportunity-reference";

const TASK_STATUSES: Project["status"][] = ["Submitted", "Under Review", "Query Raised"];

export type OfficerOpportunityTask = {
  opportunityId: string;
  /** Shown in task list and title, e.g. public reference or scheme code */
  ref: string;
  displayTitle: string;
  projectCount: number;
  slaDueDate: string;
  slaStatus: SLAStatus;
  taskStatusLabel: string;
  latestUpdatedAt: string;
};

function worstSlaStatus(projects: Project[]): SLAStatus {
  if (projects.some((p) => p.slaStatus === "Breached")) return "Breached";
  if (projects.some((p) => p.slaStatus === "At Risk")) return "At Risk";
  return "On Track";
}

function taskStatusLabel(projects: Project[]): string {
  const hasQueryResponseReceived = projects.some(
    (p) => p.status === "Under Review" && p.queries.some((q) => q.status === "Closed"),
  );
  if (projects.some((p) => p.status === "Query Raised")) return "Query open";
  if (hasQueryResponseReceived) return "Query response received";
  if (projects.some((p) => p.status === "Under Review")) return "Under review";
  if (projects.some((p) => p.status === "Submitted")) return "Pending review";
  return "—";
}

/**
 * One row per published opportunity that has at least one application in an officer-reviewable state.
 */
export function listOfficerOpportunityTasks(): OfficerOpportunityTask[] {
  const opps = db.listOpportunities();
  const published = new Set(opps.filter((o) => o.status === "Published").map((o) => o.id));
  const byOpp = new Map<string, Project[]>();
  for (const p of db.listProjects()) {
    if (!TASK_STATUSES.includes(p.status)) continue;
    if (!published.has(p.opportunityId)) continue;
    const list = byOpp.get(p.opportunityId) ?? [];
    list.push(p);
    byOpp.set(p.opportunityId, list);
  }
  const out: OfficerOpportunityTask[] = [];
  for (const [opportunityId, projects] of byOpp) {
    const o = opps.find((x) => x.id === opportunityId);
    if (!o) continue;
    const ref = resolveOpportunityReference(o, opps);
    const sorted = [...projects].sort((a, b) => new Date(a.slaDueDate).getTime() - new Date(b.slaDueDate).getTime());
    const latestUpdatedAt = [...projects].sort(
      (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    )[0].lastUpdated;
    out.push({
      opportunityId,
      ref,
      displayTitle: `Evaluation for opportunity ${ref}`,
      projectCount: projects.length,
      slaDueDate: sorted[0].slaDueDate,
      slaStatus: worstSlaStatus(projects),
      taskStatusLabel: taskStatusLabel(projects),
      latestUpdatedAt,
    });
  }
  // Newest task groups first (recently created/submitted/updated at top).
  return out.sort((a, b) => new Date(b.latestUpdatedAt).getTime() - new Date(a.latestUpdatedAt).getTime());
}

export function listProjectsForOpportunityEvaluation(opportunityId: string): Project[] {
  return db
    .listProjects()
    .filter((p) => p.opportunityId === opportunityId && TASK_STATUSES.includes(p.status))
    .sort((a, b) => a.ippName.localeCompare(b.ippName));
}
