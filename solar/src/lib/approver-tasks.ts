import type { Project, SLAStatus } from "@/lib/types";
import { db } from "@/lib/mock-db";
import { resolveOpportunityReference } from "@/lib/opportunity-reference";

export type ApproverOpportunityTask = {
  opportunityId: string;
  ref: string;
  displayTitle: string;
  projectCount: number;
  slaDueDate: string;
  slaStatus: SLAStatus;
  latestUpdatedAt: string;
};

function isWithApprover(p: Project) {
  const approverCurrent = p.workflow.some((w) => w.role === "approver" && w.status === "current");
  const milestoneSetupPending = !!p.ippAccessAcceptedAt && !p.approverMilestonesSubmittedAt;
  return approverCurrent || milestoneSetupPending;
}

function worstSlaStatus(projects: Project[]): SLAStatus {
  if (projects.some((p) => p.slaStatus === "Breached")) return "Breached";
  if (projects.some((p) => p.slaStatus === "At Risk")) return "At Risk";
  return "On Track";
}

export function listApproverOpportunityTasks(): ApproverOpportunityTask[] {
  const opps = db.listOpportunities();
  const byOpp = new Map<string, Project[]>();
  for (const p of db.listProjects()) {
    if (!isWithApprover(p)) continue;
    const list = byOpp.get(p.opportunityId) ?? [];
    list.push(p);
    byOpp.set(p.opportunityId, list);
  }

  const out: ApproverOpportunityTask[] = [];
  for (const [opportunityId, projects] of byOpp) {
    const opp = opps.find((o) => o.id === opportunityId);
    if (!opp) continue;
    const sortedDue = [...projects].sort((a, b) => new Date(a.slaDueDate).getTime() - new Date(b.slaDueDate).getTime());
    const latestUpdatedAt = [...projects].sort(
      (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    )[0].lastUpdated;
    const hasMilestoneSetupTask = projects.some(
      (p) => !!p.ippAccessAcceptedAt && !p.approverMilestonesSubmittedAt,
    );
    const ref = resolveOpportunityReference(opp, opps);
    out.push({
      opportunityId,
      ref,
      displayTitle: hasMilestoneSetupTask
        ? `Create milestones for opportunity ${ref}`
        : `Final approval for opportunity ${ref}`,
      projectCount: projects.length,
      slaDueDate: sortedDue[0].slaDueDate,
      slaStatus: worstSlaStatus(projects),
      latestUpdatedAt,
    });
  }
  return out.sort((a, b) => new Date(b.latestUpdatedAt).getTime() - new Date(a.latestUpdatedAt).getTime());
}

export function listProjectsForApproverOpportunity(opportunityId: string): Project[] {
  return db
    .listProjects()
    .filter((p) => p.opportunityId === opportunityId && isWithApprover(p))
    .sort((a, b) => a.ippName.localeCompare(b.ippName));
}
