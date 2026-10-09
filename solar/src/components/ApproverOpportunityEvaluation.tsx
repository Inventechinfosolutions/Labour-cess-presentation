import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
} from "@/components/DataListPage";
import { SLABadge, StatusBadge } from "@/components/Bits";
import { cn } from "@/lib/utils";
import { db, formatDate, relativeTime, useDbVersion } from "@/lib/hooks";
import { uidLib } from "@/lib/mock-db";
import { listProjectsForApproverOpportunity } from "@/lib/approver-tasks";
import { buildWorkflowAfterFinalApproval, createDefaultExecutionMilestones } from "@/lib/execution-milestones";
import type { Project, User } from "@/lib/types";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Gavel,
  PanelRight,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { OpportunityReadOnlySections } from "@/components/OpportunityReadOnlySections";
import { approverStageLabel, getApproverStage } from "@/components/ProjectDetail";

function docsAllVerified(p: Project) {
  return p.documents.length > 0 && p.documents.every((d) => d.status === "Verified");
}

const sheetSectionClass =
  "rounded-2xl border border-border/55 bg-gradient-to-b from-card via-card to-muted/10 p-3.5 shadow-sm";
const sheetAccentSectionClass =
  "rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/[0.08] via-background to-primary/5 p-3.5 shadow-sm";
const sheetDecisionCardClass =
  "rounded-2xl border border-primary/20 bg-gradient-to-b from-card via-card to-primary/[0.04] p-3.5 shadow-sm";

export function ApproverOpportunityEvaluation({ opportunityId, backTo }: { opportunityId: string; backTo: string }) {
  useDbVersion();
  const o = db.getOpportunity(opportunityId);
  const projects = listProjectsForApproverOpportunity(opportunityId);
  const [panelProjectId, setPanelProjectId] = useState<string | null>(null);
  const [oppOpen, setOppOpen] = useState(false);

  if (!o) {
    return (
      <DataListPageShell>
        <DataListPageHeaderRow
          left={<DataListPageHeading title="Opportunity not found" description="This scheme may have been removed from the demo dataset." />}
          right={
            <Button asChild variant="outline" className="h-10 shrink-0">
              <Link to={backTo}><ArrowLeft className="size-4" aria-hidden />Back</Link>
            </Button>
          }
        />
      </DataListPageShell>
    );
  }

  if (projects.length === 0) {
    return (
      <DataListPageShell>
        <DataListPageHeaderRow
          left={<DataListPageHeading title={o.name} description="No applications are currently at approver stage for this opportunity." />}
          right={
            <Button asChild variant="outline" className="h-10 shrink-0">
              <Link to={backTo}><ArrowLeft className="size-4" aria-hidden />Approver tasks</Link>
            </Button>
          }
        />
      </DataListPageShell>
    );
  }

  const panelProject = panelProjectId ? projects.find((p) => p.id === panelProjectId) : undefined;
  const panelUser = panelProject ? db.findUserById(panelProject.ippId) : undefined;
  const publicRef = o.referenceCode?.trim() || o.code;
  const sendAllotmentFromPage = (projectId: string) => {
    const current = db.getProject(projectId);
    if (!current) return;
    if (!current.approverApprovedAt) {
      toast.error("Approve this application first.");
      return;
    }
    if (current.accessAllotmentSentAt) {
      toast.info("Allotment already sent.");
      return;
    }
    const ts = new Date().toISOString();
    db.saveProject({
      ...current,
      stage: "Access allotment sent — awaiting IPP acceptance",
      accessAllotmentSentAt: ts,
      lastUpdated: ts,
      activity: [
        ...current.activity,
        {
          id: uidLib(),
          user: "Approver",
          role: "approver",
          action: "Sent access allotment to IPP",
          timestamp: ts,
        },
      ],
    });
    db.pushNotification({
      userId: current.ippId,
      title: "Access allotment received",
      message: `Approver has issued access allotment for ${current.name}. Open the project to accept.`,
      type: "info",
      link: `/ipp/projects/${current.id}`,
    });
    toast.success("Access allotment sent.");
  };

  return (
    <DataListPageShell>
      <DataListPageHeaderRow
        left={<DataListPageHeading title="Final approval evaluation" count={projects.length} description={`${publicRef} · ${o.name} — verify and complete staged approval handoff.`} />}
        right={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setOppOpen(true)}>
              <PanelRight className="size-3.5" aria-hidden />
              Scheme details
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to={backTo}><ArrowLeft className="size-3.5" aria-hidden />Tasks</Link>
            </Button>
          </div>
        }
      />

      <div className="app-data-panel overflow-x-auto">
        <table className="app-data-table-grid w-full min-w-[1120px] text-sm">
          <thead>
            <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
              <th className="p-3 text-left w-10">Sl.</th>
              <th className="p-3 text-left">IPP</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Approval stage</th>
              <th className="p-3 text-left">Remarks</th>
              <th className="p-3 text-left">SLA</th>
              <th className="p-3 text-left">Updated</th>
              <th className="p-3 text-right w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => {
              const u = db.findUserById(p.ippId);
              const company = u?.org?.trim() || p.ippName;
              const stage = getApproverStage(p);
              const actionType = stage === "allotment" ? "allotment" : "verify";
              return (
                <tr key={p.id} className="app-data-table-body-row transition">
                  <td className="p-3 text-center tabular-nums text-muted-foreground">{i + 1}</td>
                  <td className="p-3 font-medium">{p.ippName}</td>
                  <td className="p-3 text-muted-foreground">{company}</td>
                  <td className="p-3"><StatusBadge status={p.status} /></td>
                  <td className="p-3"><ApproverStagePill stage={stage} /></td>
                  <td className="p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                    {p.approverApprovalDescription || "—"}
                  </td>
                  <td className="p-3">
                    <SLABadge status={p.slaStatus} />
                    <div className="text-xs text-muted-foreground mt-0.5">Due {formatDate(p.slaDueDate)}</div>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{relativeTime(p.lastUpdated)}</td>
                  <td className="p-3 text-right">
                    {actionType === "allotment" ? (
                      <Button type="button" size="sm" className="h-8" onClick={() => sendAllotmentFromPage(p.id)}>
                        Allotment
                      </Button>
                    ) : (
                      <Button type="button" size="sm" className="h-8" onClick={() => setPanelProjectId(p.id)}>
                        Verify
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Sheet open={!!panelProjectId} onOpenChange={(open) => !open && setPanelProjectId(null)}>
        <SheetContent
          className="overflow-hidden border-l border-primary/15 bg-background/98 p-0 data-[side=right]:w-[96vw] sm:data-[side=right]:w-[84vw] md:data-[side=right]:w-[68vw] lg:data-[side=right]:w-[56vw] xl:data-[side=right]:w-[46vw] sm:data-[side=right]:max-w-none"
          side="right"
        >
          {panelProject ? (
            <div className="flex h-full min-h-0 flex-col px-4 py-4 sm:px-5 sm:py-5">
              <ApproverVerificationPanel p={panelProject} ippUser={panelUser} onClose={() => setPanelProjectId(null)} />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Sheet open={oppOpen} onOpenChange={setOppOpen}>
        <SheetContent className="overflow-y-auto border-l border-primary/15 bg-gradient-to-b from-background via-background to-muted/20 p-0 data-[side=right]:w-[96vw] sm:data-[side=right]:w-[90vw] md:data-[side=right]:w-[84vw] lg:data-[side=right]:w-[76vw] xl:data-[side=right]:w-[70vw] 2xl:data-[side=right]:w-[64vw] sm:data-[side=right]:max-w-none" side="right" showCloseButton>
          <div className="mx-auto max-h-full w-full max-w-6xl overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pb-8 lg:px-8">
            <SheetHeader className="-mx-4 mb-4 border-b border-border/70 bg-background/95 px-4 py-3 text-left sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div className="pr-8">
                <SheetTitle className="text-lg tracking-tight">Full scheme (read-only)</SheetTitle>
                <SheetDescription className="mt-1">Same as published for IPPs — <span className="font-mono font-semibold text-primary">{publicRef}</span>.</SheetDescription>
              </div>
            </SheetHeader>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Reference</p>
                <p className="mt-1 font-mono text-sm font-semibold text-primary">{publicRef}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/70 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Project type</p>
                <p className="mt-1 text-sm font-medium text-foreground">{o.type}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-card/70 px-3 py-2.5">
                <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><Sparkles className="size-3 text-primary" />Application window</p>
                <p className="mt-1 text-xs font-medium text-foreground">{formatDate(o.applicationStartDate ?? o.startDate)} - {formatDate(o.applicationEndDate ?? o.endDate)}</p>
              </div>
            </div>
            <OpportunityReadOnlySections o={o} layout="sheet" />
          </div>
        </SheetContent>
      </Sheet>
    </DataListPageShell>
  );
}

function ApproverVerificationPanel({ p, ippUser, onClose }: { p: Project; ippUser: User | undefined; onClose: () => void }) {
  const company = ippUser?.org?.trim() || p.ippName;
  const [checks, setChecks] = useState({ validated: false, risk: false, sla: false });
  const [remark, setRemark] = useState(p.approverApprovalDescription ?? "");
  const [milestoneDraft, setMilestoneDraft] = useState({ name: "", dueDate: "" });
  const checklistOk = useMemo(() => checks.validated && checks.risk && checks.sla, [checks]);
  const stage = getApproverStage(p);
  const verifiedDocs = p.documents.filter((d) => d.status === "Verified").length;
  const docsTotal = Math.max(1, p.documents.length);
  const doneChecks = [checks.validated, checks.risk, checks.sla].filter(Boolean).length;

  const verifyDoc = (docId: string) => {
    const current = db.getProject(p.id);
    if (!current) return;
    const ts = new Date().toISOString();
    db.saveProject({
      ...current,
      documents: current.documents.map((d) => d.id === docId && (d.status === "Uploaded" || d.status === "Rejected") ? { ...d, status: "Verified" as const } : d),
      lastUpdated: ts,
      activity: [...current.activity, { id: uidLib(), user: "Approver", role: "approver", action: "Verified document", timestamp: ts }],
    });
    toast.success("Document marked as Verified");
  };

  const rejectDoc = (docId: string) => {
    const current = db.getProject(p.id);
    if (!current) return;
    const ts = new Date().toISOString();
    db.saveProject({
      ...current,
      documents: current.documents.map((d) => d.id === docId && (d.status === "Uploaded" || d.status === "Verified") ? { ...d, status: "Rejected" as const, remark: "Rejected by approver — correction required" } : d),
      lastUpdated: ts,
      activity: [...current.activity, { id: uidLib(), user: "Approver", role: "approver", action: "Rejected document", timestamp: ts }],
    });
    toast.success("Document marked as Rejected");
  };

  const rejectApplication = () => {
    const current = db.getProject(p.id);
    if (!current) return;
    if (!remark.trim()) return toast.error("Enter rejection remarks");
    const ts = new Date().toISOString();
    const wf = current.workflow.map((w) => w.role === "approver" && w.status === "current" ? { ...w, status: "completed" as const, completedAt: ts } : w);
    db.saveProject({
      ...current,
      status: "Rejected",
      stage: "Rejected",
      remarks: remark.trim(),
      workflow: wf,
      lastUpdated: ts,
      activity: [...current.activity, { id: uidLib(), user: "Approver", role: "approver", action: "Rejected application (final)", timestamp: ts }],
    });
    db.pushNotification({ userId: current.ippId, title: "Application rejected", message: `${current.name} was rejected at final approval stage.`, type: "error", link: `/ipp/projects/${current.id}` });
    toast.success("Application rejected");
    onClose();
  };

  const approveApplication = () => {
    const current = db.getProject(p.id);
    if (!current) return;
    if (!checklistOk) return toast.error("Complete all approver checklist items first.");
    if (!docsAllVerified(current)) return toast.error("Verify all documents before approval.");
    if (!remark.trim()) return toast.error("Add approval description before approving.");
    const ts = new Date().toISOString();
    db.saveProject({
      ...current,
      status: "Approved",
      stage: "Approved — awaiting access allotment",
      approverApprovedAt: ts,
      approverApprovalDescription: remark.trim(),
      remarks: remark.trim(),
      milestones: [],
      approverMilestonesSubmittedAt: undefined,
      lastUpdated: ts,
      activity: [...current.activity, { id: uidLib(), user: "Approver", role: "approver", action: "Recorded preliminary approval — pending access allotment", timestamp: ts }],
    });
    toast.success("Approval recorded. Send access allotment next.");
  };

  const sendAccessAllotment = () => {
    const current = db.getProject(p.id);
    if (!current) return;
    if (!current.approverApprovedAt) return toast.error("Approve the application first.");
    const ts = new Date().toISOString();
    db.saveProject({
      ...current,
      stage: "Access allotment sent — awaiting IPP acceptance",
      accessAllotmentSentAt: ts,
      lastUpdated: ts,
      activity: [...current.activity, { id: uidLib(), user: "Approver", role: "approver", action: "Sent access allotment to IPP", timestamp: ts }],
    });
    db.pushNotification({ userId: current.ippId, title: "Access allotment received", message: `Approver has issued access allotment for ${current.name}. Open the project to accept.`, type: "info", link: `/ipp/projects/${current.id}` });
    toast.success("Access allotment sent to IPP.");
  };

  const addMilestone = () => {
    const current = db.getProject(p.id);
    if (!current) return;
    if (!current.ippAccessAcceptedAt) {
      toast.error("IPP must accept access allotment first.");
      return;
    }
    const name = milestoneDraft.name.trim();
    if (!name) return toast.error("Enter milestone name");
    if (!milestoneDraft.dueDate) return toast.error("Select due date");
    const id = uidLib();
    db.saveProject({
      ...current,
      milestones: [
        ...current.milestones,
        {
          id,
          name,
          sequence: current.milestones.length + 1,
          dueDate: new Date(`${milestoneDraft.dueDate}T00:00:00`).toISOString(),
          progress: 0,
          status: "Not Started",
          proofs: [
            { id: `${id}_p1`, label: "Site photos / evidence", status: "Missing" },
            { id: `${id}_p2`, label: "Installation proof", status: "Missing" },
            { id: `${id}_p3`, label: "Reports / certificates", status: "Missing" },
          ],
        },
      ],
    });
    setMilestoneDraft({ name: "", dueDate: "" });
  };

  const removeMilestone = (id: string) => {
    const current = db.getProject(p.id);
    if (!current) return;
    db.saveProject({
      ...current,
      milestones: current.milestones.filter((m) => m.id !== id).map((m, i) => ({ ...m, sequence: i + 1 })),
    });
  };

  const seedDefaultMilestones = () => {
    const current = db.getProject(p.id);
    if (!current) return;
    if (!current.ippAccessAcceptedAt) {
      toast.error("IPP must accept access allotment first.");
      return;
    }
    if (current.milestones.length > 0) return toast.error("Milestone list already populated");
    db.saveProject({ ...current, milestones: createDefaultExecutionMilestones() });
  };

  const submitMilestones = () => {
    const current = db.getProject(p.id);
    if (!current) return;
    if (!current.ippAccessAcceptedAt) return toast.error("IPP must accept access allotment first.");
    if (current.milestones.length === 0) return toast.error("Add at least one milestone before submit.");
    const ts = new Date().toISOString();
    db.saveProject({
      ...current,
      status: "In Execution",
      stage: "Execution",
      approverMilestonesSubmittedAt: ts,
      lastUpdated: ts,
      workflow: buildWorkflowAfterFinalApproval(current, ts),
      activity: [...current.activity, { id: uidLib(), user: "Approver", role: "approver", action: "Submitted execution milestones — IPP execution started", timestamp: ts }],
    });
    db.pushNotification({ userId: current.ippId, title: "Execution milestones issued", message: `Approver has submitted execution milestones for ${current.name}.`, type: "success", link: `/ipp/projects/${current.id}` });
    toast.success("Milestones submitted to IPP.");
    onClose();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <SheetHeader className="sticky top-0 z-20 gap-0 border-b border-border/70 bg-background/90 p-0 text-left shadow-[0_6px_20px_-8px_rgba(15,23,42,0.12)] backdrop-blur-md dark:bg-background/85 dark:shadow-black/40">
          <div className="relative px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
            <div
              className="pointer-events-none absolute inset-x-4 top-0 h-[3px] rounded-full bg-gradient-to-r from-emerald-500/80 via-primary to-sky-500/80 sm:inset-x-5"
              aria-hidden
            />
            <div className="flex flex-wrap items-start justify-between gap-3 pr-10">
              <div className="min-w-0 flex-1 space-y-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/[0.09] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary shadow-sm">
                  <Gavel className="size-3.5 opacity-90" aria-hidden />
                  Final approval
                </span>
                <SheetTitle className="text-left text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {p.name}
                </SheetTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border border-border/80 bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
                    <Building2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate">{company}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-card px-2 py-1 text-[11px] font-semibold tabular-nums text-muted-foreground shadow-sm">
                    <Zap className="size-3.5 text-amber-600 dark:text-amber-400" aria-hidden />
                    {p.capacityMW} MW
                  </span>
                  <StatusBadge status={p.status} />
                  <ApproverStagePill stage={stage} />
                </div>
                <SheetDescription className="text-left text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                  Approver verification for <span className="font-medium text-foreground">{p.ippName}</span> — verify
                  documents, complete checklist, then approve or reject.
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 px-1.5 pb-8 pt-3">
          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Approver checklist</p>
              <p className={cn("mt-0.5 text-sm font-bold", checklistOk ? "text-chart-4" : "text-muted-foreground")}>
                {doneChecks} / 3 complete
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Documents</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {verifiedDocs} / {docsTotal} verified
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Stage</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">{approverStageLabel(stage)}</p>
            </div>
          </div>

          <div className={sheetSectionClass}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Uploaded documents</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {p.documents.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-border/45 bg-background/75 px-2.5 py-1.5"
                >
                  <div className="min-w-0">
                    <span className="text-foreground">{d.name}</span>
                    <div className="mt-1 text-xs text-muted-foreground">Status: {d.status}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 px-2 text-[11px]"
                      onClick={() => verifyDoc(d.id)}
                      disabled={d.status === "Missing" || d.status === "Verified"}
                    >
                      <CheckCircle2 className="size-3.5" />
                      Verify
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-7 gap-1 px-2 text-[11px]"
                      onClick={() => rejectDoc(d.id)}
                      disabled={d.status === "Missing" || d.status === "Rejected"}
                    >
                      <XCircle className="size-3.5" />
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={sheetAccentSectionClass}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Approver checklist</h3>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={checks.validated} onCheckedChange={(v) => setChecks((s) => ({ ...s, validated: v === true }))} />
                Officer validation evidence reviewed
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={checks.risk} onCheckedChange={(v) => setChecks((s) => ({ ...s, risk: v === true }))} />
                Risk/compliance review completed
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={checks.sla} onCheckedChange={(v) => setChecks((s) => ({ ...s, sla: v === true }))} />
                SLA and timeline assessment completed
              </label>
            </div>
          </div>

          <div className={sheetSectionClass}>
            <Label htmlFor="approver-remark" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Approval description / remarks
            </Label>
            <Textarea
              id="approver-remark"
              className="mt-2 min-h-[90px]"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Write why this application is approved or rejected"
            />
          </div>

          {stage !== "review" ? (
            <div className={sheetSectionClass}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Approval decisions</h3>
              <div className="mt-2 overflow-x-auto rounded-md border border-border/50 bg-background/60">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="w-12 p-2.5 text-center">Sl. No</th>
                      <th className="p-2.5 text-left">Approval description</th>
                      <th className="w-40 p-2.5 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border/60">
                      <td className="p-2.5 text-center text-xs tabular-nums text-muted-foreground">1</td>
                      <td className="p-2.5 whitespace-pre-wrap text-xs text-foreground">{p.approverApprovalDescription || "—"}</td>
                      <td className="p-2.5">
                        <ApproverStagePill stage={stage} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {stage === "allotment" ? (
            <div className={sheetSectionClass}>
              <h3 className="text-sm font-semibold text-foreground">Send access allotment</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Send this to the IPP. Milestone setup unlocks only after IPP acceptance.
              </p>
              <Button type="button" className="mt-3 rounded-xl shadow-sm" onClick={sendAccessAllotment}>
                Send access allotment
              </Button>
            </div>
          ) : null}

          {stage === "awaitingIpp" ? (
            <div className={sheetSectionClass}>
              <h3 className="text-sm font-semibold text-foreground">Awaiting IPP acceptance</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Access allotment was sent {p.accessAllotmentSentAt ? relativeTime(p.accessAllotmentSentAt) : ""}. Once the
                IPP accepts, milestone creation is enabled.
              </p>
            </div>
          ) : null}

          {stage === "milestones" ? (
            <div className={sheetSectionClass}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Execution milestones</h3>
                {p.milestones.length === 0 ? (
                  <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={seedDefaultMilestones}>
                    Seed defaults
                  </Button>
                ) : null}
              </div>
              {p.milestones.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">No milestones added yet.</p>
              ) : (
                <ul className="mt-2 divide-y rounded-md border border-border/50 bg-background/75 text-sm">
                  {p.milestones.map((m, i) => (
                    <li key={m.id} className="flex items-center justify-between gap-2 p-2.5">
                      <div>
                        <p className="font-medium">
                          <span className="mr-1 text-muted-foreground">{i + 1}.</span>
                          {m.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Due {formatDate(m.dueDate)}</p>
                      </div>
                      <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => removeMilestone(m.id)}>
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 rounded-xl border border-border/55 bg-background/75 p-3">
                <p className="text-[11px] font-semibold text-foreground">Add milestone</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                  <div>
                    <Label htmlFor="ms-name" className="text-[11px] text-muted-foreground">
                      Milestone name
                    </Label>
                    <input
                      id="ms-name"
                      type="text"
                      value={milestoneDraft.name}
                      onChange={(e) => setMilestoneDraft((d) => ({ ...d, name: e.target.value }))}
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ms-due" className="text-[11px] text-muted-foreground">
                      Due date
                    </Label>
                    <input
                      id="ms-due"
                      type="date"
                      value={milestoneDraft.dueDate}
                      onChange={(e) => setMilestoneDraft((d) => ({ ...d, dueDate: e.target.value }))}
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <Button type="button" className="rounded-xl" onClick={addMilestone}>
                    Add
                  </Button>
                </div>
              </div>
              <Button type="button" className="mt-3 rounded-xl shadow-sm" onClick={submitMilestones} disabled={p.milestones.length === 0}>
                Submit milestones to IPP
              </Button>
            </div>
          ) : null}

          <div className={sheetDecisionCardClass}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Decision</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Close the panel or record a final reject / approve while this line is in review.
            </p>
            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border/40 pt-4">
              <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
                Close
              </Button>
              <Button type="button" variant="destructive" className="rounded-xl" onClick={rejectApplication}>
                Reject
              </Button>
              {stage === "review" ? (
                <Button type="button" className="rounded-xl shadow-md shadow-primary/20" onClick={approveApplication}>
                  Approve
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApproverStagePill({ stage }: { stage: ReturnType<typeof getApproverStage> }) {
  const tone: Record<ReturnType<typeof getApproverStage>, string> = {
    review: "border-border bg-muted text-muted-foreground",
    allotment: "border-primary/40 bg-primary/10 text-primary",
    awaitingIpp: "border-chart-3/40 bg-chart-3/10 text-chart-3",
    milestones: "border-chart-3/40 bg-chart-3/10 text-chart-3",
    done: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone[stage]}`}>{approverStageLabel(stage)}</span>;
}
