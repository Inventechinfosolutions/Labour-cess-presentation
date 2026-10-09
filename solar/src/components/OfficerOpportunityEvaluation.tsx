import { useCallback, useMemo, useState, type ComponentType } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { DataListPageShell } from "@/components/DataListPage";
import { StatusBadge } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { OpportunityReadOnlySections } from "@/components/OpportunityReadOnlySections";
import { db, formatDate, useDbVersion } from "@/lib/hooks";
import { listProjectsForOpportunityEvaluation } from "@/lib/officer-tasks";
import { uidLib } from "@/lib/mock-db";
import type { Opportunity, Project, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildIppUploadChecklist } from "@/lib/opportunity-ipp-checklist";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Layers,
  Mail,
  MapPin,
  SendHorizontal,
  Sparkles,
  Tag,
  User2,
  XCircle,
  Zap,
} from "lucide-react";

function documentsReady(p: Project) {
  if (p.documents.some((d) => d.status === "Missing")) return false;
  if (p.documents.some((d) => d.status === "Uploaded")) return false;
  if (p.documents.some((d) => d.status === "Rejected")) return false;
  return p.documents.length === 0 || p.documents.every((d) => d.status === "Verified");
}

function forwardProject(p: Project, extraRemark: string) {
  const hasApprover = p.workflow.some((w) => w.role === "approver");
  if (!hasApprover) return { ok: false as const, reason: "No approver stage" };
  if (!documentsReady(p)) return { ok: false as const, reason: "Documents not verified" };
  const ts = new Date().toISOString();
  const wf = p.workflow
    .filter((w) => w.name !== "Execution")
    .map((w) => {
      if (w.role === "officer" && w.status === "current") {
        return { ...w, status: "completed" as const, completedAt: ts, assignee: w.assignee ?? "Officer" };
      }
      if (w.role === "approver" && w.status === "pending") {
        return { ...w, status: "current" as const, assignee: w.assignee };
      }
      return w;
    });
  const mergedRemark = [p.remarks, extraRemark].filter(Boolean).join("\n");
  return {
    ok: true as const,
    project: {
      ...p,
      status: "Under Review" as const,
      stage: "Pending final approval (approver)",
      lastUpdated: ts,
      workflow: wf,
      remarks: mergedRemark,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: "Officer",
          role: "officer" as const,
          action: "Forwarded for final approval from opportunity evaluation",
          timestamp: ts,
        },
      ],
    } satisfies Project,
  };
}

function lineReviewLabel(v: Project["officerLineReview"] | undefined) {
  if (v === "Approved") return "Approved";
  if (v === "Rejected") return "Rejected";
  return "Pending";
}

function lineReviewClass(v: Project["officerLineReview"] | undefined) {
  if (v === "Approved") return "text-chart-4";
  if (v === "Rejected") return "text-destructive";
  return "text-muted-foreground";
}

function evalShellCardClass(extra?: string) {
  return cn(
    "rounded-3xl border border-border/50 bg-card/85 shadow-lg shadow-black/5 ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20",
    extra,
  );
}

/** Reference-style metric tile: colored top accent + square icon well (IPP opportunity header pattern). */
function SchemeMetricTile({
  accentClass,
  iconBgClass,
  icon: Icon,
  label,
  value,
  hint,
}: {
  accentClass: string;
  iconBgClass: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card pt-0 shadow-[0_1px_2px_rgba(15,23,42,0.06)] dark:shadow-black/20",
        accentClass,
      )}
    >
      <div className="flex gap-3 p-4 pt-[15px]">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg shadow-inner [&>svg]:size-5",
            iconBgClass,
          )}
        >
          <Icon className="text-white" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-sm font-bold leading-snug tracking-tight text-foreground">{value}</p>
          {hint ? <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

const DOC_ALIASES: Record<string, string> = {
  "Company Registration": "Registration certificate",
  "Financial Statements (3 yrs)": "Financial documents",
  "Financial Statements": "Financial documents",
  "Technical Capability": "Technical proposal",
  "Past Project Experience": "Past projects",
};

export function OfficerOpportunityEvaluation({ opportunityId, backTo }: { opportunityId: string; backTo: string }) {
  useDbVersion();
  const navigate = useNavigate();
  const [, bump] = useState(0);
  const refresh = useCallback(() => bump((n) => n + 1), []);
  const o: Opportunity | undefined = db.getOpportunity(opportunityId);
  const projects = listProjectsForOpportunityEvaluation(opportunityId);
  const schemeDates = useMemo(() => {
    if (!o) return { start: "", end: "", daysLeft: 0 };
    const start = o.applicationStartDate ?? o.startDate;
    const end = o.applicationEndDate ?? o.endDate;
    const endDt = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDt.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((endDt.getTime() - today.getTime()) / 86400000);
    return { start, end, daysLeft };
  }, [o]);
  const [ippPanelId, setIppPanelId] = useState<string | null>(null);
  const [oppOpen, setOppOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [wantsForward, setWantsForward] = useState(false);
  const [forwardSuccessOpen, setForwardSuccessOpen] = useState(false);
  const [forwardedCount, setForwardedCount] = useState(0);

  const ippPanelProject = ippPanelId ? projects.find((p) => p.id === ippPanelId) : undefined;
  const ippUser = ippPanelProject ? db.findUserById(ippPanelProject.ippId) : undefined;

  const setLineReview = (projectId: string, officerLineReview: "Pending" | "Approved" | "Rejected") => {
    const p = db.getProject(projectId);
    if (!p) return;
    db.saveProject({ ...p, officerLineReview });
    refresh();
  };

  const setShortlist = (projectId: string, v: boolean) => {
    const p = db.getProject(projectId);
    if (!p) return;
    db.saveProject({ ...p, officerForwardShortlist: v });
    refresh();
  };

  const savePresentComment = (projectId: string, comment: string) => {
    const p = db.getProject(projectId);
    if (!p) return;
    db.saveProject({
      ...p,
      remarks: comment.trim(),
      lastUpdated: new Date().toISOString(),
    });
    refresh();
  };

  const verifyDocument = (projectId: string, docId: string) => {
    const p = db.getProject(projectId);
    if (!p) return;
    const ts = new Date().toISOString();
    db.saveProject({
      ...p,
      documents: p.documents.map((d) =>
        d.id === docId && (d.status === "Uploaded" || d.status === "Rejected")
          ? { ...d, status: "Verified" as const, remark: undefined }
          : d,
      ),
      lastUpdated: ts,
      activity: [
        ...p.activity,
        { id: uidLib(), user: "Officer", role: "officer", action: "Verified document from evaluation panel", timestamp: ts },
      ],
    });
    refresh();
  };

  const rejectDocument = (projectId: string, docId: string) => {
    const p = db.getProject(projectId);
    if (!p) return;
    const ts = new Date().toISOString();
    db.saveProject({
      ...p,
      documents: p.documents.map((d) =>
        d.id === docId && (d.status === "Uploaded" || d.status === "Verified")
          ? { ...d, status: "Rejected" as const, remark: "Rejected by officer — reupload required." }
          : d,
      ),
      lastUpdated: ts,
      activity: [
        ...p.activity,
        { id: uidLib(), user: "Officer", role: "officer", action: "Rejected document from evaluation panel", timestamp: ts },
      ],
    });
    refresh();
  };

  const raiseQuery = (projectId: string, message: string) => {
    const p = db.getProject(projectId);
    if (!p) return;
    const clean = message.trim();
    if (!clean) {
      toast.error("Enter query details before submitting.");
      return;
    }
    const ts = new Date().toISOString();
    db.saveProject({
      ...p,
      status: "Query Raised",
      stage: "Awaiting IPP response",
      lastUpdated: ts,
      officerForwardShortlist: false,
      officerLineReview: "Pending",
      queries: [
        ...p.queries,
        {
          id: uidLib(),
          message: clean,
          raisedBy: "Officer",
          raisedAt: ts,
          status: "Open",
        },
      ],
      activity: [
        ...p.activity,
        { id: uidLib(), user: "Officer", role: "officer", action: "Raised query from evaluation panel", timestamp: ts },
      ],
    });
    db.pushNotification({
      userId: p.ippId,
      title: "Officer query raised",
      message: `Officer raised a query on ${p.name}. Please review and respond with updated details/documents.`,
      type: "warning",
      link: `/ipp/projects/${p.id}`,
    });
    refresh();
    toast.success("Query raised and shared with IPP.");
  };

  const handleSubmit = () => {
    if (!o) return;
    const r = remarks.trim();
    if (wantsForward) {
      const want = projects.filter((p) => p.officerForwardShortlist);
      if (!want.length) {
        toast.error("Select at least one application to forward, or turn off “Forward to approver”.");
        return;
      }
      const notApproved = want.filter((p) => p.officerLineReview !== "Approved");
      if (notApproved.length) {
        toast.error("Mark each shortlisted line as Approved in the IPP panel before forwarding.");
        return;
      }
      for (const p of want) {
        const res = forwardProject(p, r);
        if (!res.ok) {
          toast.error(`${p.name}: ${res.reason}`);
          return;
        }
        db.saveProject({
          ...res.project,
          officerForwardShortlist: false,
        });
      }
      if (r) {
        for (const p of projects) {
          if (want.some((w) => w.id === p.id)) continue;
          const ts = new Date().toISOString();
          db.saveProject({
            ...p,
            activity: [
              ...p.activity,
              {
                id: uidLib(),
                user: "Officer",
                role: "officer",
                action: `Officer batch remarks: ${r}`,
                timestamp: ts,
              },
            ],
            lastUpdated: ts,
          });
        }
      }
      setForwardedCount(want.length);
      setForwardSuccessOpen(true);
    } else {
      if (r) {
        const ts = new Date().toISOString();
        for (const p of projects) {
          db.saveProject({
            ...p,
            lastUpdated: ts,
            activity: [
              ...p.activity,
              {
                id: uidLib(),
                user: "Officer",
                role: "officer",
                action: `Officer batch remarks: ${r}`,
                timestamp: ts,
              },
            ],
          });
        }
        toast.success("Remarks saved on all applications in this task.");
      } else {
        toast.info("Per-line actions in the IPP panel are already saved. Add batch remarks here if you need a single note on every line.");
      }
    }
    setRemarks("");
    setWantsForward(false);
    refresh();
  };

  if (!o) {
    return (
      <DataListPageShell>
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-b from-muted/40 via-background to-background p-6 shadow-inner sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-destructive/10 to-transparent" aria-hidden />
          <div className="relative mx-auto max-w-lg text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-sm">
              <Layers className="size-7" aria-hidden />
            </div>
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">Opportunity not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This scheme may have been removed from the demo dataset.
            </p>
            <Button asChild className="mt-6 rounded-xl shadow-sm">
              <Link to={backTo}>
                <ArrowLeft className="size-4" aria-hidden />
                Back to tasks
              </Link>
            </Button>
          </div>
        </div>
      </DataListPageShell>
    );
  }

  if (projects.length === 0) {
    return (
      <DataListPageShell>
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-b from-muted/40 via-background to-background p-6 shadow-inner sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.08] to-transparent" aria-hidden />
          <div className="relative mx-auto max-w-lg text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
              <ClipboardList className="size-7" aria-hidden />
            </div>
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">{o.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No open applications for this opportunity in the officer task queue. Lines may have moved to approval or
              been closed.
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-xl">
              <Link to={backTo}>
                <ArrowLeft className="size-4" aria-hidden />
                Back to tasks
              </Link>
            </Button>
          </div>
        </div>
      </DataListPageShell>
    );
  }

  const publicRef = o.referenceCode?.trim() || o.code;

  const capacityLabel =
    o.capacityMinMW != null ? `${o.capacityMinMW}–${o.capacityMW} MW` : `Up to ${o.capacityMW} MW`;
  const locationLabel = [o.state, o.district].filter(Boolean).join(", ");
  const landSummary =
    o.landSource === "Department Provided"
      ? (o.departmentFixedLocationSummary?.trim() ??
          "Department-provided land bank — coordinates are issued when plots are allocated.")
      : o.fixedSiteAddress?.trim()
        ? `IPP-provided site: ${o.fixedSiteAddress}`
        : "Land sourced by IPP — verify coordinates against eligibility uploads.";
  const startD = new Date(schemeDates.start);
  const endD = new Date(schemeDates.end);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  startD.setHours(0, 0, 0, 0);
  endD.setHours(0, 0, 0, 0);
  const applicationsOpen = o.status === "Published" && today >= startD && today <= endD;
  const applicationsUpcoming = o.status === "Published" && today < startD;

  const daysLeftDisplay =
    schemeDates.daysLeft >= 0 ? `${schemeDates.daysLeft} days left` : "Window closed";

  return (
    <DataListPageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {applicationsOpen ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  <span className="size-1.5 shrink-0 rounded-full bg-white" aria-hidden />
                  Open
                </span>
              ) : applicationsUpcoming ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  Upcoming
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                  Closed
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                  o.type === "Solar" &&
                    "bg-orange-100 text-orange-900 dark:bg-orange-950/40 dark:text-orange-100",
                  o.type === "Wind" && "bg-sky-100 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
                  o.type === "Hybrid" &&
                    "bg-violet-100 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
                )}
              >
                <Tag className="size-3.5 opacity-90" aria-hidden />
                {o.type}
              </span>
              {o.status === "Published" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-900 dark:bg-emerald-950/45 dark:text-emerald-100">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  Published
                </span>
              ) : o.status === "Draft" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                  Draft
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                  Closed
                </span>
              )}
            </div>
            <p className="font-mono text-xs tabular-nums text-muted-foreground sm:text-right">
              {o.code} · {publicRef}
            </p>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{o.name}</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Verify documents per line, record approvals or queries, then shortlist rows for forwarding — or submit batch
            remarks only.
          </p>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SchemeMetricTile
                  accentClass="border-t-[3px] border-t-emerald-500"
                  iconBgClass="bg-emerald-600 text-white"
                  icon={Zap}
                  label="Capacity"
                  value={capacityLabel}
                />
                <SchemeMetricTile
                  accentClass="border-t-[3px] border-t-sky-500"
                  iconBgClass="bg-sky-600 text-white"
                  icon={MapPin}
                  label="Location"
                  value={locationLabel || "—"}
                />
                <SchemeMetricTile
                  accentClass="border-t-[3px] border-t-violet-500"
                  iconBgClass="bg-violet-600 text-white"
                  icon={Sparkles}
                  label="Type"
                  value={o.type}
                />
                <SchemeMetricTile
                  accentClass="border-t-[3px] border-t-amber-500"
                  iconBgClass="bg-amber-500 text-white"
                  icon={Calendar}
                  label="Days left"
                  value={daysLeftDisplay}
                />
              </div>

              <div className="flex gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-inner">
                  <MapPin className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-emerald-800 dark:text-emerald-300">
                    Land
                  </p>
                  <p className="mt-1 text-sm leading-snug text-foreground">{landSummary}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
                <div className="flex gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-inner">
                    <Calendar className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Apply by
                    </p>
                    <p className="text-lg font-bold tabular-nums tracking-tight text-foreground">
                      {formatDate(schemeDates.end)}
                    </p>
                    <p className="text-xs text-muted-foreground">Opens {formatDate(schemeDates.start)}</p>
                    <div className="mt-2">
                      {schemeDates.daysLeft >= 0 ? (
                        <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-900 dark:bg-sky-950/50 dark:text-sky-100">
                          {schemeDates.daysLeft} days left
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Window ended
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                size="lg"
                className="h-12 w-full gap-2 rounded-xl text-base font-semibold shadow-md"
                onClick={() => setOppOpen(true)}
              >
                <Sparkles className="size-5" aria-hidden />
                Scheme details
                <ArrowRight className="size-5 opacity-90" aria-hidden />
              </Button>

              <Link
                to={backTo}
                className="inline-flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4 shrink-0" aria-hidden />
                Back to tasks
              </Link>
            </div>
          </div>

        <section aria-labelledby="ipp-list-heading" className="relative space-y-0">
          <div className={evalShellCardClass("overflow-hidden p-0")}>
            <div className="border-b border-border/60 bg-gradient-to-r from-muted/50 via-card/50 to-primary/[0.06] px-4 py-4 sm:px-5">
              <h2 id="ipp-list-heading" className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                IPP application lines
              </h2>
              <p className="mt-0.5 max-w-3xl text-xs text-muted-foreground">
                Open an applicant name or <span className="font-medium text-foreground">View</span> to launch the
                verification drawer — verify uploads, raise queries, then shortlist rows you intend to forward.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-11 px-3 py-2.5 text-center tabular-nums">Sl.</th>
                    <th className="px-4 py-2.5">IPP / applicant</th>
                    <th className="px-3 py-2.5">Company</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Line review</th>
                    <th className="px-3 py-2.5">Present comment</th>
                    <th className="px-3 py-2.5">Details</th>
                    <th className="w-24 px-3 py-2.5 text-center">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => {
                    const u = db.findUserById(p.ippId);
                    const company = u?.org?.trim() || p.ippName;
                    return (
                      <tr key={p.id} className="app-data-table-body-row transition">
                        <td className="px-3 py-3 text-center text-xs tabular-nums text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setIppPanelId(p.id)}
                            className="text-left font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            {p.ippName}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{company}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className={cn("px-3 py-3 text-sm font-medium", lineReviewClass(p.officerLineReview))}>
                          {lineReviewLabel(p.officerLineReview)}
                        </td>
                        <td className="max-w-[14rem] px-3 py-3 text-xs text-muted-foreground">
                          <span className="line-clamp-2">{p.remarks?.trim() ? p.remarks.trim() : "—"}</span>
                        </td>
                        <td className="px-3 py-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg border-primary/25 text-xs font-semibold text-primary hover:bg-primary/10"
                            onClick={() => setIppPanelId(p.id)}
                          >
                            Open
                            <ExternalLink className="size-3.5 opacity-80" />
                          </Button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Checkbox
                            id={`s-${p.id}`}
                            checked={!!p.officerForwardShortlist}
                            onCheckedChange={(c) => setShortlist(p.id, c === true)}
                            aria-label={`Shortlist ${p.name} for forward`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section
          className={evalShellCardClass(
            "overflow-hidden border-primary/25 bg-gradient-to-br from-primary/[0.05] via-card to-background p-0",
          )}
          aria-label="Officer sign-off"
        >
          <div className="border-b border-primary/15 bg-gradient-to-r from-primary/12 via-primary/[0.04] to-chart-2/15 px-4 py-3.5 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary shadow-sm">
                <SendHorizontal className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight text-foreground">Batch sign-off</p>
                <p className="text-xs text-muted-foreground">
                  Forward every shortlisted &amp; approved line, or save remarks across the task without forwarding.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-4 sm:p-5">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 shadow-inner">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="wants-forward"
                  checked={wantsForward}
                  onCheckedChange={(c) => setWantsForward(c === true)}
                  className="mt-0.5"
                />
                <div className="min-w-0">
                  <Label htmlFor="wants-forward" className="cursor-pointer text-sm font-semibold text-foreground">
                    Forward selected lines to approver
                  </Label>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Requires documents verified and line marked <span className="font-medium text-foreground">Approved</span>{" "}
                    in the drawer. Turn off to append batch remarks only.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-remarks" className="text-sm font-semibold">
                Batch remarks
              </Label>
              <Textarea
                id="batch-remarks"
                className="min-h-[108px] rounded-xl border-border/80 bg-background/80 shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-primary/30"
                placeholder="Optional note recorded on every line when you submit (e.g. cohort-level observations)…"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/50 pt-4">
              <Button type="button" variant="outline" className="rounded-xl" asChild>
                <Link to={backTo}>Close</Link>
              </Button>
              <Button type="button" className="rounded-xl gap-2 shadow-md shadow-primary/20" onClick={handleSubmit}>
                <SendHorizontal className="size-4" aria-hidden />
                Submit
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={forwardSuccessOpen} onOpenChange={setForwardSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forward completed</DialogTitle>
            <DialogDescription>
              {forwardedCount === 1
                ? "Application is forwarded successfully to approver."
                : `${forwardedCount} applications are forwarded successfully to approver.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setForwardSuccessOpen(false);
                navigate({ to: "/officer/queries" });
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IPP side panel (verification) */}
      <Sheet open={!!ippPanelId} onOpenChange={(v) => !v && setIppPanelId(null)}>
        <SheetContent
          className="overflow-hidden border-l border-primary/15 bg-background/98 p-0 data-[side=right]:w-[96vw] sm:data-[side=right]:w-[84vw] md:data-[side=right]:w-[68vw] lg:data-[side=right]:w-[56vw] xl:data-[side=right]:w-[46vw] sm:data-[side=right]:max-w-none"
          side="right"
        >
          {ippPanelProject && o ? (
            <div className="flex h-full min-h-0 flex-col px-4 py-4 sm:px-5 sm:py-5">
              <IppVerificationBody
                o={o}
                p={ippPanelProject}
                ippUser={ippUser}
                onClose={() => setIppPanelId(null)}
                onLineReview={setLineReview}
                onVerifyDocument={verifyDocument}
                onRejectDocument={rejectDocument}
                onRaiseQuery={raiseQuery}
                onSavePresentComment={savePresentComment}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Admin scheme (read-only) */}
      <Sheet open={oppOpen} onOpenChange={setOppOpen}>
        <SheetContent
          className="overflow-y-auto border-l border-primary/15 bg-gradient-to-b from-background via-background to-muted/20 p-0 data-[side=right]:w-[96vw] sm:data-[side=right]:w-[90vw] md:data-[side=right]:w-[84vw] lg:data-[side=right]:w-[76vw] xl:data-[side=right]:w-[70vw] 2xl:data-[side=right]:w-[64vw] sm:data-[side=right]:max-w-none"
          side="right"
          showCloseButton
        >
          {o ? (
            <div className="mx-auto max-h-full w-full max-w-6xl overflow-y-auto px-4 pb-6 pt-4 sm:px-6 sm:pb-8 lg:px-8">
              <SheetHeader className="-mx-4 mb-4 border-b border-border/70 bg-background/95 px-4 py-3 text-left sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="pr-8">
                  <SheetTitle className="text-lg tracking-tight">Full scheme (read-only)</SheetTitle>
                  <SheetDescription className="mt-1">
                    Same as published for IPPs —{" "}
                    <span className="font-mono font-semibold text-primary">{publicRef}</span>.
                  </SheetDescription>
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
                  <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="size-3 text-primary" />
                    Application window
                  </p>
                  <p className="mt-1 text-xs font-medium text-foreground">
                    {formatDate(o.applicationStartDate ?? o.startDate)} - {formatDate(o.applicationEndDate ?? o.endDate)}
                  </p>
                </div>
              </div>
              <OpportunityReadOnlySections o={o} layout="sheet" />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </DataListPageShell>
  );
}

function IppVerificationBody({
  o,
  p,
  ippUser,
  onClose,
  onLineReview,
  onVerifyDocument,
  onRejectDocument,
  onRaiseQuery,
  onSavePresentComment,
}: {
  o: Opportunity;
  p: Project;
  ippUser: User | undefined;
  onClose: () => void;
  onLineReview: (id: string, a: "Pending" | "Approved" | "Rejected") => void;
  onVerifyDocument: (projectId: string, docId: string) => void;
  onRejectDocument: (projectId: string, docId: string) => void;
  onRaiseQuery: (projectId: string, message: string) => void;
  onSavePresentComment: (projectId: string, comment: string) => void;
}) {
  const company = ippUser?.org?.trim() || p.ippName;
  const readOnlyView =
    p.status === "Under Review" &&
    p.workflow.some((w) => w.role === "approver" && w.status === "current");
  const checklist = buildIppUploadChecklist(o);
  const elig = (o.eligibility ?? []).filter((r) => r.criterion?.trim());
  const [queryOpen, setQueryOpen] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [lineComment, setLineComment] = useState(p.remarks ?? "");
  const [detailChecks, setDetailChecks] = useState({
    company: false,
    locationCapacity: false,
    eligibility: false,
  });

  const doneDetails = Object.values(detailChecks).filter(Boolean).length;
  const verifiedDocs = p.documents.filter((d) => d.status === "Verified").length;
  const docsTotal = Math.max(1, p.documents.length);

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
                  <ClipboardList className="size-3.5 opacity-90" aria-hidden />
                  Line verification
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
                </div>
                <SheetDescription className="text-left text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                  Review uploads and checklist items, then{" "}
                  <span className="font-medium text-foreground">approve</span>,{" "}
                  <span className="font-medium text-foreground">reject</span>,{" "}
                  <span className="font-medium text-foreground">keep pending</span>, or{" "}
                  <span className="font-medium text-foreground">raise a query</span>.
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>
        <div className="space-y-4 px-1.5 pb-8 pt-3">
        {readOnlyView ? (
          <div className="rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2.5 text-xs text-primary">
            This application is under approver review. Officer view is read-only for this line.
          </div>
        ) : null}

        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Line review</p>
            <p className={cn("mt-0.5 text-sm font-bold", lineReviewClass(p.officerLineReview))}>
              {lineReviewLabel(p.officerLineReview)}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Documents</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">
              {verifiedDocs} / {docsTotal} verified
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Checks</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">
              {doneDetails} / {Object.keys(detailChecks).length} done
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/55 bg-gradient-to-b from-card via-card to-muted/10 p-3.5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company & applicant</h3>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/45 px-2 py-1 text-muted-foreground">
                <User2 className="size-3.5" aria-hidden />
                Applicant
              </span>
              <span className="ml-2 font-medium text-foreground">{p.ippName}</span>
            </li>
            <li>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/45 px-2 py-1 text-muted-foreground">
                <Building2 className="size-3.5" aria-hidden />
                Company
              </span>
              <span className="ml-2 font-medium text-foreground">{company}</span>
            </li>
            {ippUser?.email ? (
              <li>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/45 px-2 py-1 text-muted-foreground">
                  <Mail className="size-3.5" aria-hidden />
                  Email
                </span>
                <span className="ml-2 text-foreground">{ippUser.email}</span>
              </li>
            ) : null}
            <li>
              <span className="text-muted-foreground">Proposed project:</span> {p.name} — {p.capacityMW} MW {p.type}
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border/55 bg-gradient-to-b from-card via-card to-muted/10 p-3.5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Uploaded documents</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {p.documents.length === 0 ? (
              <li className="text-muted-foreground">No document rows in this application.</li>
            ) : (
              p.documents.map((d) => (
                <li key={d.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-border/45 bg-background/75 px-2.5 py-1.5">
                  <div className="min-w-0">
                    <span className="text-foreground">
                      {DOC_ALIASES[d.name] ?? d.name} <span className="text-muted-foreground">({d.name})</span>
                    </span>
                    <div className="mt-1 text-xs text-muted-foreground">Status: {d.status}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 px-2 text-[11px]"
                      onClick={() => onVerifyDocument(p.id, d.id)}
                      disabled={readOnlyView || d.status === "Missing" || d.status === "Verified"}
                    >
                      <CheckCircle2 className="size-3.5" />
                      Verify
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-7 gap-1 px-2 text-[11px]"
                      onClick={() => onRejectDocument(p.id, d.id)}
                      disabled={readOnlyView || d.status === "Missing" || d.status === "Rejected"}
                    >
                      <XCircle className="size-3.5" />
                      Reject
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/55 bg-gradient-to-b from-card via-card to-muted/10 p-3.5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scheme document checklist</h3>
          <p className="text-xs text-muted-foreground">Expected uploads for this opportunity (reference).</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {checklist.map((c, i) => (
              <li key={i} className="flex gap-2">
                <FileText className="mt-0.5 size-3.5 shrink-0" />
                {c.name}
                {c.mandatory ? " *" : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border/55 bg-gradient-to-b from-card to-muted/10 p-3.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Eligibility criteria</h3>
          {elig.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No structured table — use full scheme details.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {elig.map((r, i) => (
                <li key={i} className="rounded-xl border border-border/45 bg-background/75 px-3 py-2 text-sm">
                  <div className="font-medium text-foreground">{r.criterion}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/[0.08] via-background to-primary/5 p-3.5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Officer verification checklist</h3>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={detailChecks.company}
                disabled={readOnlyView}
                onCheckedChange={(v) => setDetailChecks((s) => ({ ...s, company: v === true }))}
              />
              Company and contact details verified
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={detailChecks.locationCapacity}
                disabled={readOnlyView}
                onCheckedChange={(v) => setDetailChecks((s) => ({ ...s, locationCapacity: v === true }))}
              />
              Location and capacity details verified
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={detailChecks.eligibility}
                disabled={readOnlyView}
                onCheckedChange={(v) => setDetailChecks((s) => ({ ...s, eligibility: v === true }))}
              />
              Eligibility criteria reviewed
            </label>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-border/55 bg-background/75 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Details verified</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {doneDetails} / {Object.keys(detailChecks).length}
              </p>
            </div>
            <div className="rounded-xl border border-border/55 bg-background/75 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Documents verified</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {verifiedDocs} / {docsTotal}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-card via-card to-primary/[0.04] p-3.5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line decision</h3>
          <div className="mt-2">
            <Label htmlFor={`line-comment-${p.id}`} className="text-[11px] text-muted-foreground">
              Present comment
            </Label>
            <Textarea
              id={`line-comment-${p.id}`}
              className="mt-1 min-h-[80px]"
              value={lineComment}
              readOnly={readOnlyView}
              onChange={(e) => setLineComment(e.target.value)}
              placeholder="Officer line-level comment for this IPP application"
            />
            <div className="mt-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={readOnlyView}
                onClick={() => {
                  onSavePresentComment(p.id, lineComment);
                  toast.success("Present comment saved.");
                }}
              >
                Save comment
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                "border-amber-300/70 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20",
                p.officerLineReview === "Pending" && "ring-1 ring-amber-400/50",
              )}
              disabled={readOnlyView}
              onClick={() => setQueryOpen(true)}
            >
              Write query
            </Button>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  "border-emerald-300/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20",
                  p.officerLineReview === "Approved" && "ring-1 ring-emerald-400/50",
                )}
                disabled={readOnlyView}
                onClick={() => {
                  onLineReview(p.id, "Approved");
                  onClose();
                }}
              >
                Approve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  "border-red-300/70 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20",
                  p.officerLineReview === "Rejected" && "ring-1 ring-red-400/50",
                )}
                disabled={readOnlyView}
                onClick={() => onLineReview(p.id, "Rejected")}
              >
                Reject
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  "border-primary/35 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                  (p.officerLineReview == null || p.officerLineReview === "Pending") && "ring-1 ring-primary/35",
                )}
                disabled={readOnlyView}
                onClick={() => onLineReview(p.id, "Pending")}
              >
                Keep pending
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>

      <Dialog open={queryOpen} onOpenChange={setQueryOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Raise query to IPP</DialogTitle>
            <DialogDescription>
              Ask for missing details/documents. The application moves to Query Raised after submit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="officer-query-note">Query details</Label>
            <Textarea
              id="officer-query-note"
              className="min-h-[120px]"
              placeholder="Write clear instructions for IPP (what is missing, what to reupload, and any deadline notes)."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setQueryOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onRaiseQuery(p.id, queryText);
                if (!queryText.trim()) return;
                setQueryText("");
                setQueryOpen(false);
              }}
            >
              Submit query
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
