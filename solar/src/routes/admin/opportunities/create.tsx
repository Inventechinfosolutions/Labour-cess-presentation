import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { format, parse } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Plus,
  ScrollText,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
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
import { uidLib } from "@/lib/mock-db";
import {
  getDefaultDocumentChecklistForProjectType,
  PROJECT_TYPE_CHECKLIST_LABELS,
} from "@/lib/project-type-document-checklists";
import type { Opportunity, OpportunityEligibilityRow, TermsAndConditionsRow } from "@/lib/types";
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

export const Route = createFileRoute("/admin/opportunities/create")({
  head: () => ({ meta: [{ title: "Create opportunity — PMIS" }] }),
  component: CreateOpportunity,
});

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


function CreateOpportunity() {
  useDbVersion();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const asideIntroRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [persistedId, setPersistedId] = useState<string | null>(null);
  const { stageRef, goNext, goPrev, goToStep } = useWizardStageFlip({
    step,
    setStep,
    reduceMotion: Boolean(reduceMotion),
    totalSteps: STEPS.length,
  });
  useWizardRailStagger(asideIntroRef, Boolean(reduceMotion));

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<Opportunity["type"]>("Solar");
  const [identityDescription, setIdentityDescription] = useState("");

  const [minMw, setMinMw] = useState(10);
  const [maxMw, setMaxMw] = useState(100);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationType, setLocationType] = useState<"Fixed" | "Flexible">("Flexible");

  const defaultStart = useMemo(() => addDaysDateOnly(0), []);
  const defaultEnd = useMemo(() => addDaysDateOnly(60), []);
  const [appStart, setAppStart] = useState(defaultStart);
  const [appEnd, setAppEnd] = useState(defaultEnd);
  const [approvalDays, setApprovalDays] = useState(45);
  const [landSource, setLandSource] = useState<Opportunity["landSource"]>("IPP Provided");
  const [fixedLandAddress, setFixedLandAddress] = useState("");
  const [fixedLandDocName, setFixedLandDocName] = useState("");
  const landFileInputRef = useRef<HTMLInputElement>(null);

  const [eligibility, setEligibility] = useState<OpportunityEligibilityRow[]>([
    { criterion: "Minimum net worth", mandatory: true },
    { criterion: "Technical experience (EPC / O&M)", mandatory: true },
    { criterion: "Land control (IPP model)", mandatory: false },
  ]);

  const schemeDocuments = useMemo(() => getDefaultDocumentChecklistForProjectType(type), [type]);

  const [termsRows, setTermsRows] = useState<TermsAndConditionsRow[]>([
    { term: "The applicant must comply with all applicable central and state laws, regulations, and guidelines governing renewable energy projects.", mandatory: true },
    { term: "The applicant shall not sublet, transfer, or assign the scheme benefits to any third party without prior written approval from the nodal authority.", mandatory: true },
    { term: "All documents submitted as part of the application must be authentic. Any misrepresentation will result in immediate disqualification and may attract legal action.", mandatory: true },
    { term: "The applicant agrees to commission the project within the timeline specified in the scheme guidelines, failing which penalties as prescribed shall apply.", mandatory: true },
    { term: "The applicant acknowledges that the nodal authority reserves the right to amend, suspend, or cancel the scheme at any time, subject to due notice.", mandatory: false },
  ]);

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

  const updateTermsRow = (index: number, patch: Partial<TermsAndConditionsRow>) => {
    setTermsRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addTermsRow = () => {
    setTermsRows((rows) => [...rows, { term: "", mandatory: false }]);
  };

  const removeTermsRow = (index: number) => {
    setTermsRows((rows) => rows.filter((_, i) => i !== index));
  };

  /** One-click sample payload for QA / demos (matches validation on every step). */
  const fillDemoData = useCallback(() => {
    const start = addDaysDateOnly(-7);
    const end = addDaysDateOnly(92);
    setName("GreenPower Wind 25 MW");
    setCode("RE-WND-2026-GP25");
    setType("Wind");
    setIdentityDescription(
      "Coastal onshore wind tranche for IPPs with demonstrated EPC capability. Focus on 25 MW single-site or clustered turbines with grid connection to the Bhuj–Mundra corridor. Aligns with state RE purchase obligations and includes expedited land-bank coordination where department parcels apply.",
    );
    setMinMw(5);
    setMaxMw(25);
    setState("Gujarat");
    setDistrict("Kutch");
    setLocationAddress(
      "Nodal pooling substation zone — Bhuj–Mundra RE corridor, near 400 kV export header, Gujarat 370001",
    );
    setLocationType("Flexible");
    setLandSource("Department Provided");
    setFixedLandAddress("");
    setFixedLandDocName("");
    if (landFileInputRef.current) landFileInputRef.current.value = "";
    setAppStart(start);
    setAppEnd(end);
    setApprovalDays(48);
    setEligibility([
      {
        criterion: "Audited net worth ≥ ₹10 crore or parent company guarantee acceptable to nodal agency.",
        mandatory: true,
      },
      {
        criterion: "Wind EPC / OEM tie-up for turbines ≥ 2 MW at IEC-compliant wind class.",
        mandatory: true,
      },
      {
        criterion: "Land control letter or nodal land-bank allotment within 180 days of LOA.",
        mandatory: true,
      },
      { criterion: "Grid connectivity study or STU no-objection (draft acceptable at application).", mandatory: false },
    ]);
    setTermsRows([
      {
        term: "The applicant shall comply with all Central Electricity Authority (CEA) and state grid code requirements for wind integration.",
        mandatory: true,
      },
      {
        term: "Commissioning shall be completed within the timeline notified in the award letter; delay liquidated damages apply as per policy.",
        mandatory: true,
      },
      {
        term: "The nodal authority may verify land documents and turbine supply contracts at any milestone before COD.",
        mandatory: true,
      },
      {
        term: "Bank guarantees or performance securities may be substituted only with prior written approval.",
        mandatory: false,
      },
    ]);
    toast.success("Demo data filled — step through or publish when ready.");
  }, []);

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
    const id = persistedId ?? `opp_${uidLib()}`;
    const documents = getDefaultDocumentChecklistForProjectType(type)
      .filter((d) => d.name.trim().length > 0)
      .map((d) => ({ name: d.name.trim(), mandatory: d.mandatory }));
    const resolvedLandSource: Opportunity["landSource"] =
      locationType === "Fixed" ? "Department Provided" : landSource;

    const othersForRef = db.listOpportunities().filter((x) => x.id !== id);
    const referenceCode =
      status === "Published" ? generateOpportunityReference(name.trim(), type, othersForRef) : undefined;

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
      termsAndConditions: termsRows.filter((r) => r.term.trim()).length > 0
        ? termsRows.filter((r) => r.term.trim())
        : undefined,
    };
  };

  const persist = (o: Opportunity) => {
    db.saveOpportunity(o);
    setPersistedId(o.id);
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
                title="Create Opportunity"
                description="Complete five steps to publish an opportunity."
              />
            </div>
          }
          right={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-full border-primary/25 bg-background/80 text-xs font-semibold shadow-sm"
                onClick={fillDemoData}
              >
                <Wand2 className="size-3.5 text-primary" aria-hidden />
                Fill demo data
              </Button>
              <span className="shrink-0 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Draft
              </span>
            </div>
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

                <div className="border-t border-primary/10 pt-6">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Terms &amp; conditions</span>
                    <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={addTermsRow}>
                      <Plus className="size-3.5" aria-hidden />
                      Add row
                    </Button>
                  </div>
                  <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
                    Scheme-specific terms that applicants (IPPs) must accept before submitting. Mark a term as
                    mandatory to require explicit consent on the application form.
                  </p>
                  <div className="app-data-panel overflow-x-auto">
                    <table className="app-data-table-grid w-full min-w-[360px] text-left text-sm">
                      <thead>
                        <tr className="app-data-table-head-row text-[10px] font-semibold uppercase tracking-wide">
                          <th className="px-3 py-2">Term / clause</th>
                          <th className="px-3 py-2">Mandatory</th>
                          <th className="w-10 px-2 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {termsRows.map((row, i) => (
                          <tr key={i} className="app-data-table-body-row transition">
                            <td className="p-2 align-top">
                              <Textarea
                                value={row.term}
                                onChange={(e) => updateTermsRow(i, { term: e.target.value })}
                                placeholder="Term or clause"
                                rows={2}
                                className="min-h-[3.25rem] resize-y bg-background text-xs leading-snug"
                              />
                            </td>
                            <td className="p-2">
                              <label className="flex cursor-pointer items-center gap-2 text-xs">
                                <Checkbox
                                  checked={row.mandatory}
                                  onCheckedChange={(c) => updateTermsRow(i, { mandatory: c === true })}
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
                                onClick={() => removeTermsRow(i)}
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
              <div className="space-y-5">

                {/* ── Readiness banner ── */}
                {(() => {
                  const checks = [
                    { label: "Scheme identity", ok: name.trim().length > 2 && code.trim().length > 1, step: 0 },
                    { label: "Location & capacity", ok: locationOk && landOk, step: 1 },
                    { label: "Eligibility & docs", ok: schemeDocuments.some((d) => d.name.trim()), step: 2 },
                    { label: "Application window", ok: windowValid && approvalDays > 0, step: 3 },
                  ];
                  const allOk = checks.every((c) => c.ok);
                  return (
                    <div className={cn(
                      "flex items-start gap-4 rounded-2xl border p-5",
                      allOk
                        ? "border-primary/25 bg-gradient-to-r from-primary/[0.07] via-primary/[0.04] to-transparent"
                        : "border-destructive/20 bg-gradient-to-r from-destructive/[0.06] via-destructive/[0.03] to-transparent",
                    )}>
                      <div className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl shadow-md",
                        allOk ? "bg-gradient-to-br from-chart-3 to-primary" : "bg-gradient-to-br from-destructive/80 to-destructive",
                      )}>
                        {allOk
                          ? <Sparkles className="size-5 text-white" aria-hidden />
                          : <AlertCircle className="size-5 text-white" aria-hidden />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground">
                          {allOk ? "All sections complete — ready to publish!" : "Some sections need attention"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {allOk
                            ? "Review the summary below and click Publish to go live on the national register."
                            : "Click any incomplete item below to jump back and fix it before publishing."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {checks.map((c) => (
                            <button
                              key={c.label}
                              type="button"
                              onClick={() => goToStep(c.step)}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors hover:opacity-80",
                                c.ok
                                  ? "border-primary/25 bg-primary/10 text-primary"
                                  : "border-destructive/30 bg-destructive/10 text-destructive",
                              )}
                            >
                              {c.ok
                                ? <CheckCircle2 className="size-3" aria-hidden />
                                : <AlertCircle className="size-3" aria-hidden />}
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Step 1: Scheme identity ── */}
                <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-primary/[0.04]">
                  <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/70 to-muted/10 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-3 to-primary text-[11px] font-bold text-white shadow-sm">
                        1
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-tight text-foreground">{STEPS[0].title}</p>
                        <p className="text-[11px] text-muted-foreground">{STEPS[0].description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep(0)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <Eye className="size-3.5" aria-hidden /> Edit
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold leading-tight text-foreground">{name.trim() || "—"}</h2>
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {type}
                          </span>
                          {code.trim() ? (
                            <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                              {code.trim().toUpperCase()}
                            </span>
                          ) : null}
                        </div>
                        {identityDescription.trim() ? (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{identityDescription.trim()}</p>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground/60 italic">No description provided.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── Step 2 + Step 4 side by side ── */}
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Location & capacity */}
                  <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-primary/[0.04]">
                    <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/70 to-muted/10 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-3 to-primary text-[11px] font-bold text-white shadow-sm">
                          2
                        </span>
                        <div>
                          <p className="text-sm font-semibold leading-tight text-foreground">{STEPS[1].title}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        <Eye className="size-3.5" aria-hidden /> Edit
                      </button>
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="grid grid-cols-2 gap-3">
                        <ReviewField label="State / UT">{state.trim() || "—"}</ReviewField>
                        <ReviewField label="District">{district.trim() || "—"}</ReviewField>
                      </div>
                      {locationAddress.trim() ? (
                        <ReviewField label="Address">
                          <span className="whitespace-pre-wrap text-xs leading-relaxed">{locationAddress.trim()}</span>
                        </ReviewField>
                      ) : null}
                      <div className="grid grid-cols-2 gap-3">
                        <ReviewField label="Capacity">
                          <span className="tabular-nums font-semibold">{minMw}–{maxMw} MW</span>
                        </ReviewField>
                        <ReviewField label="Location mode">{locationType}</ReviewField>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Land</p>
                        {locationType === "Fixed" ? (
                          <div className="mt-1.5 space-y-1.5">
                            <ReviewField label="Site address">
                              <span className="whitespace-pre-wrap text-xs">{fixedLandAddress.trim() || "—"}</span>
                            </ReviewField>
                            <ReviewField label="Supporting file">{fixedLandDocName.trim() || "None attached"}</ReviewField>
                          </div>
                        ) : (
                          <div className="mt-1.5 space-y-1.5">
                            <ReviewField label="Source">
                              {landSource === "IPP Provided" ? "IPP provided" : "Department provided"}
                            </ReviewField>
                            {landSource === "Department Provided" ? (
                              <ReviewField label="Nodal reference">{departmentFixedSummary}</ReviewField>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Application window */}
                  <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-primary/[0.04]">
                    <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/70 to-muted/10 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-3 to-primary text-[11px] font-bold text-white shadow-sm">
                          4
                        </span>
                        <div>
                          <p className="text-sm font-semibold leading-tight text-foreground">{STEPS[3].title}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => goToStep(3)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        <Eye className="size-3.5" aria-hidden /> Edit
                      </button>
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="grid grid-cols-2 gap-3">
                        <ReviewField label="Opens">{appStart || "—"}</ReviewField>
                        <ReviewField label="Closes">{appEnd || "—"}</ReviewField>
                      </div>
                      <ReviewField label="Approval timeline">
                        <span className="tabular-nums font-semibold">{approvalDays > 0 ? `${approvalDays} days` : "—"}</span>
                      </ReviewField>
                      {windowValid ? (
                        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.05] px-3 py-2 text-xs font-medium text-primary">
                          <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                          Window dates are valid
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/[0.06] px-3 py-2 text-xs font-medium text-destructive">
                          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
                          End date must be on or after start date
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* ── Step 3: Eligibility, Documents & Terms ── */}
                <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm ring-1 ring-primary/[0.04]">
                  <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-muted/70 to-muted/10 px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-chart-3 to-primary text-[11px] font-bold text-white shadow-sm">
                        3
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-tight text-foreground">{STEPS[2].title}</p>
                        <p className="text-[11px] text-muted-foreground">{STEPS[2].description}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <Eye className="size-3.5" aria-hidden /> Edit
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="grid gap-6 md:grid-cols-3">

                      {/* Eligibility */}
                      <div>
                        <div className="mb-3 flex items-center gap-1.5">
                          <ClipboardList className="size-3.5 shrink-0 text-primary" aria-hidden />
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Eligibility</span>
                          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {eligibility.filter((r) => r.criterion.trim()).length}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {eligibility.filter((r) => r.criterion.trim()).length === 0 ? (
                            <li className="text-xs text-muted-foreground italic">No criteria added.</li>
                          ) : (
                            eligibility.filter((r) => r.criterion.trim()).map((row, i) => (
                              <li key={i} className="rounded-lg border border-border/50 bg-muted/25 p-2.5">
                                <p className="text-xs font-medium leading-snug text-foreground">{row.criterion.trim()}</p>
                                <span className={cn(
                                  "mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase",
                                  row.mandatory ? "text-primary" : "text-muted-foreground",
                                )}>
                                  {row.mandatory ? <Check className="size-2.5" aria-hidden /> : null}
                                  {row.mandatory ? "Mandatory" : "Optional"}
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      {/* Documents */}
                      <div>
                        <div className="mb-3 flex items-center gap-1.5">
                          <FileText className="size-3.5 shrink-0 text-primary" aria-hidden />
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Documents</span>
                          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {schemeDocuments.filter((d) => d.name.trim()).length}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {schemeDocuments.filter((d) => d.name.trim()).length === 0 ? (
                            <li className="text-xs text-muted-foreground italic">—</li>
                          ) : (
                            schemeDocuments.filter((d) => d.name.trim()).map((d, i) => (
                              <li key={i} className="flex items-start justify-between gap-2 rounded-lg border border-border/50 bg-muted/25 p-2.5">
                                <span className="min-w-0 break-words text-xs font-medium text-foreground">{d.name.trim()}</span>
                                <span className={cn(
                                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                                  d.mandatory ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                                )}>
                                  {d.mandatory ? "Req." : "Opt."}
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                      {/* Terms & conditions */}
                      <div>
                        <div className="mb-3 flex items-center gap-1.5">
                          <ScrollText className="size-3.5 shrink-0 text-primary" aria-hidden />
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Terms</span>
                          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {termsRows.filter((r) => r.term.trim()).length}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {termsRows.filter((r) => r.term.trim()).length === 0 ? (
                            <li className="text-xs text-muted-foreground italic">—</li>
                          ) : (
                            termsRows.filter((r) => r.term.trim()).map((r, i) => (
                              <li key={i} className="rounded-lg border border-border/50 bg-muted/25 p-2.5">
                                <p className="line-clamp-3 text-xs font-medium leading-snug text-foreground">{r.term.trim()}</p>
                                <span className={cn(
                                  "mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase",
                                  r.mandatory ? "text-primary" : "text-muted-foreground",
                                )}>
                                  {r.mandatory ? <Check className="size-2.5" aria-hidden /> : null}
                                  {r.mandatory ? "Mandatory" : "Optional"}
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>

                    </div>
                  </div>
                </section>

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
