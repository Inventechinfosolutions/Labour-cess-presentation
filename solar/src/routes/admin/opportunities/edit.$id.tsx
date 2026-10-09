import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format, parse } from "date-fns";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  ClipboardList,
  Eye,
  FileText,
  MapPin,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { DataListPageHeaderRow, DataListPageHeading, DataListPageShell } from "@/components/DataListPage";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { addDaysDateOnly, nowIso } from "@/lib/dates";
import { generateOpportunityReference } from "@/lib/opportunity-reference";
import { db, useDbVersion } from "@/lib/hooks";

import {
  getDefaultDocumentChecklistForProjectType,
  PROJECT_TYPE_CHECKLIST_LABELS,
} from "@/lib/project-type-document-checklists";
import type { Opportunity, OpportunityEligibilityRow } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CreateWizardFooterNav,
  CreateWizardMobileStepper,
  CreateWizardProgressBar,
  CreateWizardRail,
  STEPS,
  useWizardRailStagger,
  useWizardStageFlip,
} from "./-create-wizard-shell";

export const Route = createFileRoute("/admin/opportunities/edit/$id")({
  head: () => ({ meta: [{ title: "Edit opportunity — PMIS" }] }),
  component: EditOpportunity,
});

function getShortIsoDate(d?: string) {
   if(!d) return "";
   return d.split('T')[0];
}

function toIsoStartDay(dateOnly: string) {
  if (!dateOnly) return nowIso();
  return new Date(`${dateOnly}T00:00:00`).toISOString();
}

function toIsoEndDay(dateOnly: string) {
  if (!dateOnly) return nowIso();
  return new Date(`${dateOnly}T23:59:59`).toISOString();
}

function parseYmd(value: string): Date | undefined {
  if (!value) return undefined;
  const d = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function DateCalendarField({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseYmd(value), [value]);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-full justify-start gap-2 rounded-md border-input px-3 font-normal shadow-xs",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4 shrink-0 opacity-60" aria-hidden />
            <span className="tabular-nums">{value || "Pick a date"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            defaultMonth={selected}
            selected={selected}
            onSelect={(d) => {
              if (d) {
                onChange(format(d, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ReviewField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="break-words text-foreground">{children}</div>
    </div>
  );
}

function ReviewSummaryCard({
  stepNumber,
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  stepNumber: number;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex min-h-[280px] flex-col rounded-2xl border border-border/60 bg-gradient-to-b from-card/98 to-muted/15 p-4 shadow-md",
        "ring-1 ring-primary/[0.06] transition-colors hover:border-primary/25 dark:from-card/90 dark:to-muted/10",
        className,
      )}
    >
      <header className="shrink-0 border-b border-border/50 pb-3">
        <div className="flex items-start gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-muted text-sm font-bold tabular-nums text-foreground shadow-sm dark:border-primary/20 dark:bg-muted dark:text-foreground"
            aria-hidden
          >
            {stepNumber}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Eye className="size-3 opacity-70" aria-hidden />
              View only
            </div>
            <div className="mt-1 flex items-start gap-2">
              <Icon className="mt-0.5 size-4 shrink-0 text-primary opacity-90" aria-hidden />
              <div className="min-w-0">
                <h2 className="text-sm font-semibold leading-tight text-foreground">{title}</h2>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{description}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-0.5 text-[13px] leading-snug">{children}</div>
    </article>
  );
}

function EditOpportunity() {
  useDbVersion();
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const existing = useMemo(() => db.getOpportunity(id), [id]);

  const reduceMotion = useReducedMotion();
  const asideIntroRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const { stageRef, goNext, goPrev, goToStep } = useWizardStageFlip({
    step,
    setStep,
    reduceMotion: Boolean(reduceMotion),
    totalSteps: STEPS.length,
  });
  useWizardRailStagger(asideIntroRef, Boolean(reduceMotion));

  const [name, setName] = useState(existing?.name || "");
  const [code, setCode] = useState(existing?.code || "");
  const [type, setType] = useState<Opportunity["type"]>(existing?.type || "Solar");
  const [identityDescription, setIdentityDescription] = useState(existing?.description || "");

  const [minMw, setMinMw] = useState(existing?.capacityMinMW || 10);
  const [maxMw, setMaxMw] = useState(existing?.capacityMW || 100);
  const [state, setState] = useState(existing?.state || "");
  const [district, setDistrict] = useState(existing?.district || "");
  const [locationAddress, setLocationAddress] = useState(existing?.locationAddress || "");
  const [locationType, setLocationType] = useState<"Fixed" | "Flexible">(existing?.locationType || "Flexible");

  const [appStart, setAppStart] = useState(getShortIsoDate(existing?.applicationStartDate) || getShortIsoDate(existing?.startDate) || addDaysDateOnly(0));
  const [appEnd, setAppEnd] = useState(getShortIsoDate(existing?.applicationEndDate) || getShortIsoDate(existing?.endDate) || addDaysDateOnly(60));
  const [approvalDays, setApprovalDays] = useState(existing?.approvalTimelineDays || 45);
  const [landSource, setLandSource] = useState<Opportunity["landSource"]>(existing?.landSource || "IPP Provided");
  const [fixedLandAddress, setFixedLandAddress] = useState(existing?.fixedSiteAddress || "");
  const [fixedLandDocName, setFixedLandDocName] = useState(existing?.fixedSiteSupportDocName || "");
  const landFileInputRef = useRef<HTMLInputElement>(null);

  const [eligibility, setEligibility] = useState<OpportunityEligibilityRow[]>(
    existing?.eligibility && existing.eligibility.length > 0 
      ? existing.eligibility 
      : [
        { criterion: "Minimum net worth", mandatory: true },
        { criterion: "Technical experience (EPC / O&M)", mandatory: true },
        { criterion: "Land control (IPP model)", mandatory: false },
      ]
  );

  const schemeDocuments = useMemo(() => getDefaultDocumentChecklistForProjectType(type), [type]);

  const [slaReviewDays] = useState(existing?.slaReviewDays || 7);
  const [slaApprovalDays] = useState(existing?.slaApprovalDays || 5);

  if (!existing) {
    return <AppShell role="admin"><p className="p-4">Opportunity not found.</p></AppShell>;
  }

  const departmentFixedSummary =
    locationType === "Flexible" && landSource === "Department Provided"
      ? [state, district].filter(Boolean).join(" · ") ||
        "Select state and district under Location & capacity to pin the land bank site."
      : "";

  const updateEligibility = (index: number, patch: Partial<OpportunityEligibilityRow>) => {
    setEligibility((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addEligibilityRow = () => {
    setEligibility((rows) => [...rows, { criterion: "", mandatory: false }]);
  };

  const removeEligibilityRow = (index: number) => {
    setEligibility((rows) => rows.filter((_, i) => i !== index));
  };

  const windowValid = Boolean(
    appStart &&
      appEnd &&
      new Date(appEnd).getTime() >= new Date(appStart).getTime(),
  );

  const locationOk = Boolean(
    state &&
      district &&
      locationAddress.trim().length > 2 &&
      minMw > 0 &&
      maxMw >= minMw,
  );
  const landOk =
    locationType === "Flexible" ||
    (locationType === "Fixed" && fixedLandAddress.trim().length > 4);

  const canNext =
    step === 0
      ? name.trim().length > 2 && code.trim().length > 1 && identityDescription.trim().length > 8
      : step === 1
        ? locationOk && landOk
        : step === 2
          ? schemeDocuments.some((d) => d.name.trim().length > 0)
          : step === 3
            ? windowValid && approvalDays > 0
            : schemeDocuments.some((d) => d.name.trim().length > 0);

  const buildOpportunity = (status: "Draft" | "Published"): Opportunity => {
    const id = existing.id;
    const documents = getDefaultDocumentChecklistForProjectType(type)
      .filter((d) => d.name.trim().length > 0)
      .map((d) => ({ name: d.name.trim(), mandatory: d.mandatory }));
    const resolvedLandSource: Opportunity["landSource"] =
      locationType === "Fixed" ? "Department Provided" : landSource;

    const othersForRef = db.listOpportunities().filter((x) => x.id !== id);
    const referenceCode =
      status === "Published" ? (existing.referenceCode || generateOpportunityReference(name.trim(), type, othersForRef)) : undefined;

    return {
      id,
      code: code.trim().toUpperCase(),
      referenceCode,
      name: name.trim(),
      type,
      capacityMW: maxMw,
      capacityMinMW: minMw,
      state: state.trim(),
      district: district.trim(),
      locationAddress: locationAddress.trim() || undefined,
      locationType,
      startDate: toIsoStartDay(appStart),
      endDate: toIsoEndDay(appEnd),
      status,
      description: identityDescription.trim(),
      landSource: resolvedLandSource,
      documents,
      applicationStartDate: appStart,
      applicationEndDate: appEnd,
      approvalTimelineDays: approvalDays,
      departmentFixedLocationSummary:
        locationType === "Flexible" && landSource === "Department Provided"
          ? departmentFixedSummary || undefined
          : undefined,
      fixedSiteAddress: locationType === "Fixed" ? fixedLandAddress.trim() || undefined : undefined,
      fixedSiteSupportDocName: locationType === "Fixed" ? fixedLandDocName || undefined : undefined,
      eligibility: eligibility.filter((r) => r.criterion.trim()),
      slaReviewDays: slaReviewDays || undefined,
      slaApprovalDays: slaApprovalDays || undefined,
    };
  };

  const persist = (o: Opportunity) => {
    db.saveOpportunity(o);
  };

  const saveDraft = () => {
    if (!name.trim() || !code.trim()) {
      toast.error("Scheme title and code are required to save a draft");
      return;
    }
    const o = buildOpportunity("Draft");
    persist(o);
    toast.success("Draft saved — you can resume from the opportunity register");
  };

  const publish = () => {
    if (!name.trim() || !code.trim()) return toast.error("Name and code are required");
    const o = buildOpportunity("Published");
    persist(o);
    toast.success(
      o.referenceCode
        ? `Published — public reference ${o.referenceCode}`
        : "Opportunity published to the national register",
    );
    navigate({ to: "/admin/opportunities" });
  };

  return (
    <AppShell role="admin">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <div>
              <Link
                to="/admin/opportunities"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                Back to register
              </Link>
              <DataListPageHeading
                title={`Edit — ${existing.name || "Opportunity"}`}
                description="Review and modify the details. Changes to published schemes update the registry instantly."
              />
            </div>
          }
          right={
            <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {existing.status}
            </span>
          }
        />

        <CreateWizardMobileStepper step={step} onStepClick={goToStep} />

        <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
          {/* ── Sidebar rail ── */}
          <aside ref={asideIntroRef} className="hidden lg:block">
            <CreateWizardRail step={step} onStepClick={goToStep} />
          </aside>

          {/* ── Main content ── */}
          <div className="min-w-0 space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-card/95 via-card/80 to-muted/30 p-6 shadow-xl ring-1 ring-primary/[0.07] sm:p-8">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/[0.06] blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-chart-2/[0.07] blur-3xl" />

              <CreateWizardProgressBar step={step} reduceMotion={Boolean(reduceMotion)} />

              <div ref={stageRef} className="mt-8">
            {step === 0 ? (
              <div className="mx-auto grid max-w-3xl gap-6">
                <div className="rounded-xl border border-border/50 bg-muted/10 p-4 shadow-sm sm:p-5">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Identifiers
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="opp-name">Project title</Label>
                      <Input
                        id="opp-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Tranche-VII Grid-Connected Solar (Gujarat)"
                        className="bg-background"
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="opp-code">Official scheme code</Label>
                      <Input
                        id="opp-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g. RE-SOL-2026-GJ-07"
                        className="bg-background font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-muted/10 p-4 shadow-sm sm:p-5">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Narrative & classification
                  </p>
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_11.5rem] lg:items-start">
                    <div className="min-w-0 space-y-2">
                      <Label htmlFor="opp-desc">Description</Label>
                      <Textarea
                        id="opp-desc"
                        rows={4}
                        value={identityDescription}
                        onChange={(e) => setIdentityDescription(e.target.value)}
                        placeholder="Objectives, tranche context, and who should apply…"
                        className="min-h-[7.5rem] resize-y bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-2 lg:pt-0">
                      <Label htmlFor="opp-type">Project type</Label>
                      <select
                        id="opp-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as Opportunity["type"])}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring lg:max-w-none"
                      >
                        <option value="Solar">Solar</option>
                        <option value="Wind">Wind</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="mx-auto grid max-w-4xl gap-6">
                <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
                  <div className="rounded-xl border border-border/50 bg-muted/10 p-4 shadow-sm sm:p-5">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Location
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                      <div className="min-w-0 space-y-2">
                        <Label htmlFor="opp-state">State / UT</Label>
                        <Input
                          id="opp-state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="e.g. Gujarat"
                          className="bg-background"
                        />
                      </div>
                      <div className="min-w-0 space-y-2">
                        <Label htmlFor="opp-district">District</Label>
                        <Input
                          id="opp-district"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="e.g. Kutch"
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="opp-location-address">Address</Label>
                      <Textarea
                        id="opp-location-address"
                        rows={3}
                        value={locationAddress}
                        onChange={(e) => setLocationAddress(e.target.value)}
                        placeholder="Building, street, landmark, PIN…"
                        className="min-h-[5.5rem] resize-y bg-background text-sm"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-muted/10 p-4 shadow-sm sm:p-5">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Capacity & site model
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                      <div className="min-w-0 space-y-2">
                        <Label htmlFor="opp-min">Capacity — min (MW)</Label>
                        <Input
                          id="opp-min"
                          type="number"
                          min={1}
                          value={minMw}
                          onChange={(e) => setMinMw(Number(e.target.value))}
                          className="bg-background tabular-nums"
                        />
                      </div>
                      <div className="min-w-0 space-y-2">
                        <Label htmlFor="opp-max">Capacity — max (MW)</Label>
                        <Input
                          id="opp-max"
                          type="number"
                          min={1}
                          value={maxMw}
                          onChange={(e) => setMaxMw(Number(e.target.value))}
                          className="bg-background tabular-nums"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label>Location type</Label>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {(["Fixed", "Flexible"] as const).map((lt) => (
                          <label
                            key={lt}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2",
                              locationType === lt
                                ? "border-primary bg-primary/[0.08]"
                                : "border-border/80 bg-muted/20 hover:bg-muted/40",
                            )}
                          >
                            <input
                              type="radio"
                              name="loc-type"
                              checked={locationType === lt}
                              onChange={() => setLocationType(lt)}
                              className="accent-primary"
                            />
                            {lt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-muted/10 p-4 shadow-sm sm:p-5">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Land sourcing
                  </p>
                  {locationType === "Fixed" ? (
                    <div>
                      <div className="space-y-2">
                        <Label htmlFor="fixed-land-addr">Location address</Label>
                        <Textarea
                          id="fixed-land-addr"
                          rows={3}
                          value={fixedLandAddress}
                          onChange={(e) => setFixedLandAddress(e.target.value)}
                          placeholder="Full postal address or site coordinates for the fixed parcel…"
                          className="resize-y bg-background text-sm"
                        />
                      </div>
                      <div className="mt-3 space-y-2">
                        <Label className="text-muted-foreground">Supporting document (optional)</Label>
                        <input
                          ref={landFileInputRef}
                          type="file"
                          className="sr-only"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            setFixedLandDocName(f ? f.name : "");
                          }}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => landFileInputRef.current?.click()}
                          >
                            <Upload className="size-3.5" aria-hidden />
                            Choose file
                          </Button>
                          {fixedLandDocName ? (
                            <span className="text-xs text-muted-foreground">{fixedLandDocName}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No file selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="space-y-2">
                        <Label htmlFor="opp-land">Land source</Label>
                        <select
                          id="opp-land"
                          value={landSource}
                          onChange={(e) => setLandSource(e.target.value as Opportunity["landSource"])}
                          className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="IPP Provided">IPP provided</option>
                          <option value="Department Provided">Department provided</option>
                        </select>
                      </div>
                      {landSource === "Department Provided" ? (
                        <div className="mt-3 rounded-lg border border-primary/15 bg-primary/[0.04] p-3 text-sm">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Nodal reference
                          </div>
                          <p className="mt-1 font-medium text-foreground">{departmentFixedSummary}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            Site reference uses the state and district from this step.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid max-w-3xl gap-4">
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timeline</div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <DateCalendarField
                      label="Application start"
                      id="opp-app-start"
                      value={appStart}
                      onChange={setAppStart}
                    />
                    <DateCalendarField
                      label="Application end"
                      id="opp-app-end"
                      value={appEnd}
                      onChange={setAppEnd}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="opp-approval-days">Approval timeline (days)</Label>
                      <Input
                        id="opp-approval-days"
                        type="number"
                        min={1}
                        max={730}
                        value={approvalDays}
                        onChange={(e) => setApprovalDays(Number(e.target.value))}
                        className="bg-background tabular-nums"
                      />
                    </div>
                  </div>
                  {!windowValid ? (
                    <p className="mt-2 text-xs text-destructive">End date must be on or after start date.</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid max-w-3xl gap-8">
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Eligibility</span>
                    <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={addEligibilityRow}>
                      <Plus className="size-3.5" aria-hidden />
                      Add row
                    </Button>
                  </div>
                  <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                    Criteria describe who may apply. Evidence uploads follow the{" "}
                    <span className="font-medium text-foreground">{PROJECT_TYPE_CHECKLIST_LABELS[type]}</span> bundle
                    for project type <span className="font-medium text-foreground">{type}</span> (Admin → Document
                    checklists; IPPs upload only those files).
                  </p>
                  {schemeDocuments.some((d) => d.name.trim()) ? (
                    <div className="mb-4 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Evidence IPPs upload (from checklist)
                      </div>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {schemeDocuments
                          .filter((d) => d.name.trim())
                          .map((d, i) => (
                            <li
                              key={`${d.name}-${i}`}
                              className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border/60 bg-background/90 px-2 py-1 text-xs text-foreground"
                            >
                              <span className="min-w-0 break-words">{d.name.trim()}</span>
                              {d.mandatory ? (
                                <span className="shrink-0 text-[10px] font-semibold uppercase text-destructive">Req.</span>
                              ) : (
                                <span className="shrink-0 text-[10px] font-semibold uppercase text-muted-foreground">
                                  Opt.
                                </span>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="app-data-panel overflow-x-auto">
                    <table className="app-data-table-grid w-full min-w-[360px] text-left text-sm">
                      <thead>
                        <tr className="app-data-table-head-row text-[10px] font-semibold uppercase tracking-wide">
                          <th className="px-3 py-2">Criterion</th>
                          <th className="px-3 py-2">Mandatory criterion</th>
                          <th className="w-10 px-2 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {eligibility.map((row, i) => (
                          <tr key={i} className="app-data-table-body-row transition">
                            <td className="p-2 align-top">
                              <Textarea
                                value={row.criterion}
                                onChange={(e) => updateEligibility(i, { criterion: e.target.value })}
                                placeholder="Criterion"
                                rows={2}
                                className="min-h-[3.25rem] resize-y bg-background text-xs leading-snug"
                              />
                            </td>
                            <td className="p-2">
                              <label className="flex cursor-pointer items-center gap-2 text-xs">
                                <Checkbox
                                  checked={row.mandatory}
                                  onCheckedChange={(c) => updateEligibility(i, { mandatory: c === true })}
                                />
                                Yes
                              </label>
                            </td>
                            <td className="p-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeEligibilityRow(i)}
                                aria-label="Remove row"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : null}

            {step === 4 ? (
              <div>
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Summary by stage
                  </p>
                  <div className="grid auto-rows-fr gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
                  <ReviewSummaryCard
                    stepNumber={1}
                    title={STEPS[0].title}
                    description={STEPS[0].description}
                    icon={FileText}
                  >
                    <div className="flex flex-col gap-2.5">
                      <ReviewField label="Project title">{name.trim() || "—"}</ReviewField>
                      <ReviewField label="Scheme code">
                        <span className="font-mono text-xs">{code.trim() || "—"}</span>
                      </ReviewField>
                      <ReviewField label="Project type">{type}</ReviewField>
                      <ReviewField label="Description">
                        <span className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                          {identityDescription.trim() || "—"}
                        </span>
                      </ReviewField>
                    </div>
                  </ReviewSummaryCard>

                  <ReviewSummaryCard
                    stepNumber={2}
                    title={STEPS[1].title}
                    description={STEPS[1].description}
                    icon={MapPin}
                  >
                    <div className="flex flex-col gap-2.5">
                      <ReviewField label="State / UT">{state.trim() || "—"}</ReviewField>
                      <ReviewField label="District">{district.trim() || "—"}</ReviewField>
                      <ReviewField label="Address">
                        <span className="whitespace-pre-wrap text-xs leading-relaxed">
                          {locationAddress.trim() || "—"}
                        </span>
                      </ReviewField>
                      <ReviewField label="Capacity">
                        <span className="tabular-nums">
                          {minMw}–{maxMw} MW
                        </span>
                      </ReviewField>
                      <ReviewField label="Location mode">{locationType}</ReviewField>
                      <div className="border-t border-border/50 pt-2.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Land
                        </div>
                        {locationType === "Fixed" ? (
                          <>
                            <ReviewField label="Site address">
                              <span className="whitespace-pre-wrap text-xs leading-relaxed">
                                {fixedLandAddress.trim() || "—"}
                              </span>
                            </ReviewField>
                            <ReviewField label="Supporting file">{fixedLandDocName.trim() || "None attached"}</ReviewField>
                          </>
                        ) : (
                          <>
                            <ReviewField label="Land source">
                              {landSource === "IPP Provided" ? "IPP provided" : "Department provided"}
                            </ReviewField>
                            {landSource === "Department Provided" ? (
                              <ReviewField label="Nodal reference">{departmentFixedSummary}</ReviewField>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  </ReviewSummaryCard>

                  <ReviewSummaryCard
                    stepNumber={3}
                    title={STEPS[2].title}
                    description={STEPS[2].description}
                    icon={ClipboardList}
                    className="md:col-span-2 xl:col-span-3"
                  >
                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Eligibility
                        </div>
                        <ul className="mt-2 space-y-2.5">
                          {eligibility.filter((r) => r.criterion.trim()).length === 0 ? (
                            <li className="text-xs text-muted-foreground">No eligibility rows.</li>
                          ) : (
                            eligibility
                              .filter((r) => r.criterion.trim())
                              .map((row, i) => (
                                <li
                                  key={i}
                                  className="rounded-md border border-border/60 bg-muted/25 px-2.5 py-2 text-xs leading-snug"
                                >
                                  <div className="whitespace-pre-wrap font-medium text-foreground">
                                    {row.criterion.trim() || "—"}
                                  </div>
                                  <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                    {row.mandatory ? (
                                      <>
                                        <Check className="size-3 text-primary" aria-hidden />
                                        Mandatory criterion
                                      </>
                                    ) : (
                                      "Optional criterion"
                                    )}
                                  </div>
                                </li>
                              ))
                          )}
                        </ul>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Document checklist
                          </div>
                          <ul className="mt-1.5 space-y-1.5">
                            {schemeDocuments.filter((d) => d.name.trim()).length === 0 ? (
                              <li className="text-xs text-muted-foreground">—</li>
                            ) : (
                              schemeDocuments
                                .filter((d) => d.name.trim())
                                .map((d, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start justify-between gap-2 rounded-md border border-border/55 bg-muted/20 px-2 py-1.5 text-xs"
                                  >
                                    <span className="min-w-0 break-words font-medium">{d.name.trim()}</span>
                                    <span
                                      className={cn(
                                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                                        d.mandatory
                                          ? "bg-primary/15 text-primary"
                                          : "bg-muted text-muted-foreground",
                                      )}
                                    >
                                      {d.mandatory ? "Required" : "Optional"}
                                    </span>
                                  </li>
                                ))
                            )}
                          </ul>
                        </div>
                        <div className="border-t border-border/50 pt-2">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            SLA (indicative)
                          </div>
                          <p className="mt-1 tabular-nums text-xs text-foreground">
                            Review <span className="font-medium">{slaReviewDays}</span> days · Approval{" "}
                            <span className="font-medium">{slaApprovalDays}</span> days
                          </p>
                        </div>
                      </div>
                    </div>
                  </ReviewSummaryCard>

                  <ReviewSummaryCard
                    stepNumber={4}
                    title={STEPS[3].title}
                    description={STEPS[3].description}
                    icon={CalendarIcon}
                  >
                    <div className="flex flex-col gap-2.5">
                      <ReviewField label="Application opens">{appStart || "—"}</ReviewField>
                      <ReviewField label="Application closes">{appEnd || "—"}</ReviewField>
                      <ReviewField label="Approval timeline">
                        <span className="tabular-nums">{approvalDays > 0 ? `${approvalDays} days` : "—"}</span>
                      </ReviewField>
                      {!windowValid ? (
                        <p className="text-xs text-destructive">Window dates need correction.</p>
                      ) : null}
                    </div>
                  </ReviewSummaryCard>
                  </div>
                </div>
            ) : null}
              </div>
            </div>

            <CreateWizardFooterNav
              step={step}
              totalSteps={STEPS.length}
              canNext={canNext}
              onPrev={goPrev}
              onNext={goNext}
              onSaveDraft={saveDraft}
              onPublish={publish}
            />
          </div>
        </div>
      </DataListPageShell>
    </AppShell>
  );
}
