import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DataListPageHeaderRow, DataListPageHeading, DataListPageShell } from "@/components/DataListPage";
import { db, useDbVersion } from "@/lib/hooks";
import { addDaysIso, DEFAULT_COMMISSIONING_DATE_ONLY, nowIso } from "@/lib/dates";
import { resolveIppDocumentRowMeta } from "@/lib/opportunity-ipp-checklist";
import { appPath, cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  MapPin,
  ScrollText,
  Upload,
  Zap,
} from "lucide-react";
import { DocBadge } from "@/components/Bits";
import {
  AppWizardFooterNav,
  AppWizardMobileStepper,
  AppWizardProgressBar,
  AppWizardRail,
  IPP_STEPS,
  useAppWizardRailStagger,
  useAppWizardStageFlip,
} from "./-app-wizard-shell";

export const Route = createFileRoute("/ipp/applications/$id")({
  head: () => ({ meta: [{ title: "Application — PMIS" }] }),
  component: AppForm,
});

function AppForm() {
  useDbVersion();
  const { id } = Route.useParams();
  const p = db.getProject(id);
  const reduceMotion = useReducedMotion();
  const asideIntroRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState(p?.name ?? "");
  const [capacity, setCapacity] = useState(p?.capacityMW ?? 50);
  const [tech, setTech] = useState(p?.type ?? "Solar");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const opportunity = p ? db.getOpportunity(p.opportunityId) : undefined;

  const { stageRef, goNext, goPrev, goToStep } = useAppWizardStageFlip({
    step,
    setStep,
    reduceMotion: Boolean(reduceMotion),
    totalSteps: IPP_STEPS.length,
  });
  useAppWizardRailStagger(asideIntroRef, Boolean(reduceMotion));

  const documentRows = useMemo(() => {
    const docs = p?.documents ?? [];
    return [...docs].sort((a, b) => {
      const ra = resolveIppDocumentRowMeta(a, opportunity);
      const rb = resolveIppDocumentRowMeta(b, opportunity);
      if (ra.mandatory !== rb.mandatory) return ra.mandatory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [p?.documents, opportunity]);

  const termsRows = (opportunity?.termsAndConditions ?? []).filter((r) => r.term.trim());
  const canAdvanceEligibility = termsRows.length === 0 || termsAgreed;

  if (!p) return <AppShell role="ipp"><div className="p-8 text-sm text-muted-foreground">Application not found.</div></AppShell>;
  if (p.status !== "Draft") {
    if (typeof window !== "undefined") window.location.assign(appPath(`/ipp/projects/${id}`));
    return null;
  }

  const saveBasics = () => {
    db.saveProject({ ...p, name, capacityMW: capacity, type: tech as "Solar" | "Wind" | "Hybrid", lastUpdated: nowIso() });
    toast.success("Saved");
  };

  const upload = (docId: string) => {
    db.saveProject({
      ...p,
      documents: p.documents.map((d) => d.id === docId ? { ...d, status: "Uploaded", uploadedAt: nowIso() } : d),
    });
    toast.success("Uploaded");
  };

  const submit = () => {
    const missing = p.documents.filter((d) => d.status === "Missing");
    if (missing.length) {
      toast.message("Submitted with pending documents", {
        description: "The officer may request uploads via a query. You can attach files at any time.",
      });
    }
    db.saveProject({
      ...p,
      status: "Submitted" as const,
      stage: "Pending Officer Assignment",
      submittedAt: nowIso(),
      slaDueDate: addDaysIso(7),
      workflow: [
        { name: "Application Submitted", role: "ipp" as const,      status: "completed" as const, assignee: p.ippName, completedAt: nowIso() },
        { name: "Officer Review",        role: "officer" as const,  status: "current" as const },
        { name: "Final Approval",        role: "approver" as const, status: "pending" as const },
      ],
    });
    toast.success("Application submitted");
    if (typeof window !== "undefined") window.location.assign(appPath(`/ipp/projects/${p.id}`));
  };

  const handleNext = () => { saveBasics(); goNext(); };

  const uploadedCount = p.documents.filter((d) => d.status !== "Missing").length;
  const allMandatoryUploaded = p.documents
    .filter((d) => resolveIppDocumentRowMeta(d, opportunity).mandatory)
    .every((d) => d.status !== "Missing");

  const canNext =
    step === 2 ? canAdvanceEligibility : true;

  return (
    <AppShell role="ipp">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <div>
              <Link
                to="/ipp/applications"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="size-3.5" aria-hidden />
                My Applications
              </Link>
              <DataListPageHeading
                title={p.name || p.opportunityName}
                description={
                  opportunity?.referenceCode
                    ? `${p.opportunityName} · Scheme reference ${opportunity.referenceCode}`
                    : p.opportunityName
                }
              />
            </div>
          }
          right={
            <span className="shrink-0 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              Draft
            </span>
          }
        />

        <AppWizardMobileStepper step={step} onStepClick={goToStep} />

        <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
          {/* ── Sidebar rail ── */}
          <aside ref={asideIntroRef} className="hidden lg:block">
            <AppWizardRail step={step} onStepClick={goToStep} />
          </aside>

          {/* ── Main content ── */}
          <div className="min-w-0 space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-card/95 via-card/80 to-muted/30 p-6 shadow-xl ring-1 ring-primary/[0.07] sm:p-8">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/[0.06] blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-chart-2/[0.07] blur-3xl" />

              <AppWizardProgressBar step={step} reduceMotion={Boolean(reduceMotion)} />

              <div ref={stageRef} className="mt-8">

                {/* Step 0 — Basic Details */}
                {step === 0 ? (
                  <div className="max-w-2xl space-y-5">
                    <div className="space-y-4">
                      <Field label="Project name" hint="optional">
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Leave blank to use opportunity defaults"
                          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </Field>
                      <Field label={`Provided Capacity (${opportunity?.capacityMW ?? "—"} MW)`} hint="optional">
                        <input
                          type="number"
                          value={capacity}
                          onChange={(e) => setCapacity(Number(e.target.value))}
                          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="State">
                          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
                            <MapPin className="size-3.5 shrink-0 opacity-50" aria-hidden />
                            {p.state}
                          </div>
                        </Field>
                        <Field label="District">
                          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
                            <MapPin className="size-3.5 shrink-0 opacity-50" aria-hidden />
                            {p.district}
                          </div>
                        </Field>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Step 1 — Technical Details */}
                {step === 1 ? (
                  <div className="max-w-2xl space-y-5">
                    <div className="space-y-4">
                      <Field label="Technology type" hint="optional">
                        <select
                          value={tech}
                          onChange={(e) => setTech(e.target.value as "Solar" | "Wind" | "Hybrid")}
                          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option>Solar</option>
                          <option>Wind</option>
                          <option>Hybrid</option>
                        </select>
                      </Field>
                      <Field label="Expected commissioning" hint="optional">
                        <div className="relative">
                          <Calendar className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
                          <input
                            type="date"
                            defaultValue={DEFAULT_COMMISSIONING_DATE_ONLY}
                            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-3.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        </div>
                      </Field>
                      <Field label="Land source">
                        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
                          <Zap className="size-3.5 shrink-0 opacity-50" aria-hidden />
                          {db.getOpportunity(p.opportunityId)?.landSource ?? "—"}
                        </div>
                      </Field>
                    </div>
                  </div>
                ) : null}

                {/* Step 2 — Eligibility + Documents + Terms */}
                {step === 2 ? (() => {
                  const eligRows = (opportunity?.eligibility ?? []).filter((r) => r.criterion.trim());
                  return (
                    <div className="space-y-7">

                      {/* ── Eligibility criteria ── */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="size-4 text-primary" aria-hidden />
                          <h3 className="text-sm font-bold text-foreground">Eligibility criteria</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Review the requirements and confirm your organisation meets each criterion before proceeding.
                        </p>
                        {eligRows.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
                            <ClipboardCheck className="mx-auto mb-3 size-8 text-muted-foreground/40" aria-hidden />
                            <p className="text-sm font-semibold text-foreground">No eligibility criteria defined</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              This scheme has no formal eligibility criteria. Refer to the scheme description and document checklist.
                            </p>
                          </div>
                        ) : (
                          <ul className="space-y-2.5">
                            {eligRows.map((row, i) => {
                              const docName = `Eligibility: ${row.criterion.trim()}`;
                              const doc = p.documents.find(d => d.name === docName && (d.ippUploadSource === "eligibility" || resolveIppDocumentRowMeta(d, opportunity).fromEligibility));
                              
                              return (
                                <li
                                  key={i}
                                  className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3.5 transition hover:bg-muted/30"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                      <span
                                        className={cn(
                                          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                                          row.mandatory ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
                                        )}
                                        aria-hidden
                                      >
                                        {i + 1}
                                      </span>
                                      <span className="text-sm font-medium leading-snug text-foreground">{row.criterion.trim()}</span>
                                    </div>
                                    <span
                                      className={cn(
                                        "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                        row.mandatory ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
                                      )}
                                    >
                                      {row.mandatory ? "* Mandatory" : "Optional"}
                                    </span>
                                  </div>
                                  <div className="ml-9 flex items-center justify-between border-t border-border/50 pt-3">
                                    {doc && doc.status !== "Missing" ? (
                                      <div className="flex items-center gap-2">
                                        <DocBadge status={doc.status} />
                                        <span className="text-xs text-muted-foreground">Uploaded</span>
                                      </div>
                                    ) : (
                                      <div className="text-xs text-muted-foreground">No document uploaded</div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (doc) {
                                          upload(doc.id);
                                        } else {
                                          const newId = `doc_${Math.random().toString(36).slice(2, 10)}`;
                                          db.saveProject({
                                            ...p,
                                            documents: [
                                              ...p.documents,
                                              {
                                                id: newId,
                                                name: docName,
                                                status: "Uploaded",
                                                uploadedAt: nowIso(),
                                                ippUploadSource: "eligibility",
                                                ippMandatory: row.mandatory,
                                              }
                                            ],
                                          });
                                          toast.success("Uploaded");
                                        }
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                                    >
                                      <Upload className="size-3.5" aria-hidden />
                                      {doc && doc.status !== "Missing" ? "Re-upload" : "Upload"}
                                    </button>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-4 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Note: </span>
                          Eligibility is assessed by the reviewing officer. Ensure all mandatory criteria are met before submitting your application.
                        </div>
                      </div>



                      {/* Terms & Conditions */}
                      {termsRows.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 border-t border-border/50 pt-5">
                            <ScrollText className="size-4 text-primary" aria-hidden />
                            <h3 className="text-sm font-bold text-foreground">Terms &amp; Conditions</h3>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {termsRows.length}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Read all clauses carefully. You must agree to all terms before proceeding to the next step.
                          </p>
                          <ul className="space-y-2.5">
                            {termsRows.map((r, i) => (
                              <li key={i} className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 flex-1 items-start gap-3">
                                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                      {i + 1}
                                    </span>
                                    <p className="text-sm leading-relaxed text-foreground">{r.term.trim()}</p>
                                  </div>
                                  <span
                                    className={cn(
                                      "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                      r.mandatory ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
                                    )}
                                  >
                                    {r.mandatory ? "* Mandatory" : "Optional"}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>

                          <label
                            className={cn(
                              "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition",
                              termsAgreed
                                ? "border-primary/50 bg-primary/[0.06]"
                                : "border-border/50 bg-muted/20 hover:bg-muted/30",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={termsAgreed}
                              onChange={(e) => setTermsAgreed(e.target.checked)}
                              className="mt-0.5 size-4 accent-primary"
                            />
                            <div className="min-w-0 flex-1">
                              <p className={cn("text-sm font-bold", termsAgreed ? "text-primary" : "text-foreground")}>
                                I have read and agree to all Terms &amp; Conditions
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                By checking this box, you confirm you have read, understood, and will abide by all the terms and conditions listed above.
                              </p>
                            </div>
                            {termsAgreed ? (
                              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                            ) : null}
                          </label>
                        </div>
                      ) : null}
                    </div>
                  );
                })() : null}

                {/* Step 3 — Documents */}
                {step === 3 ? (
                  <div className="space-y-5">
                    <p className="text-xs text-muted-foreground">
                      Upload each required file. Items marked <span className="font-bold text-destructive">*</span> are mandatory.
                    </p>
                    <div className="divide-y overflow-hidden rounded-xl border border-border/60">
                      {documentRows.filter(d => !resolveIppDocumentRowMeta(d, opportunity).fromEligibility).map((d) => {
                        const meta = resolveIppDocumentRowMeta(d, opportunity);
                        return (
                          <div key={d.id} className="flex flex-wrap items-center gap-3 bg-card px-4 py-3.5 transition hover:bg-muted/20">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.06] text-primary">
                              <FileText className="size-4" aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-1 text-sm font-medium leading-snug">
                                {meta.mandatory ? <span className="text-destructive" aria-hidden>*</span> : null}
                                <span className="break-words text-foreground">{d.name}</span>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", meta.mandatory ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>
                                  {meta.mandatory ? "Mandatory" : "Optional"}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Scheme checklist</span>
                              </div>
                            </div>
                            <DocBadge status={d.status} />
                            {d.status === "Missing" || d.status === "Rejected" ? (
                              <button
                                type="button"
                                onClick={() => upload(d.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
                              >
                                <Upload className="size-3.5" aria-hidden />
                                Upload
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Step 4 — Review & Submit */}
                {step === 4 ? (
                  <div className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <SummaryCard label="Project" value={name || p.opportunityName} />
                      <SummaryCard label="Capacity" value={`${capacity} MW`} />
                      <SummaryCard label="Technology type" value={tech} />
                      <SummaryCard label="Opportunity" value={p.opportunityName} />
                      {opportunity?.referenceCode ? (
                        <SummaryCard label="Scheme reference" value={<span className="font-mono text-sm">{opportunity.referenceCode}</span>} />
                      ) : null}
                      <SummaryCard
                        label="Documents uploaded"
                        value={
                          <span className={cn("font-bold", allMandatoryUploaded ? "text-primary" : "text-amber-500")}>
                            {uploadedCount}/{p.documents.length}
                            {!allMandatoryUploaded ? " · some mandatory docs missing" : ""}
                          </span>
                        }
                      />
                    </div>

                    {!allMandatoryUploaded ? (
                      <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
                        <div>
                          <p className="text-sm font-semibold text-foreground">Some mandatory documents are missing</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            You can still submit. The officer may raise a query, and you can upload documents at any time.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">What happens next: </span>
                      SLA review starts after submission. If the officer raises a query, you can upload documents or correct details and resubmit.
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 transition hover:bg-muted/30">
                      <input type="checkbox" id="declare" className="mt-0.5 size-4 accent-primary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Declaration (optional)</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          I confirm that all information provided in this application is accurate and complete to the best of my knowledge.
                        </p>
                      </div>
                    </label>

                    <AppWizardFooterNav
                      step={step}
                      totalSteps={IPP_STEPS.length}
                      canNext={canNext}
                      onPrev={goPrev}
                      onNext={handleNext}
                      onSaveDraft={saveBasics}
                      onSubmit={submit}
                    />
                  </div>
                ) : null}

                {/* Footer nav for non-last steps */}
                {step < IPP_STEPS.length - 1 ? (
                  <AppWizardFooterNav
                    step={step}
                    totalSteps={IPP_STEPS.length}
                    canNext={canNext}
                    onPrev={goPrev}
                    onNext={handleNext}
                    onSaveDraft={saveBasics}
                    onSubmit={submit}
                  />
                ) : null}

              </div>
            </div>
          </div>
        </div>
      </DataListPageShell>
    </AppShell>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-1.5">
        <label className="text-sm font-semibold text-foreground">{label}</label>
        {hint ? <span className="text-xs text-muted-foreground">({hint})</span> : null}
      </div>
      {children}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
