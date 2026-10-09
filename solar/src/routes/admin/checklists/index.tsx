import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileCheck2,
  FileText,
  Filter,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Wind,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
} from "@/components/DataListPage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  PROJECT_TYPE_CHECKLIST_DOC_NAMES,
  PROJECT_TYPE_CHECKLIST_LABELS,
} from "@/lib/project-type-document-checklists";
import type { Opportunity } from "@/lib/types";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { metricTileToneAt } from "@/lib/dashboard-kpi-icon";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

const PROJECT_TYPES = ["Solar", "Wind", "Hybrid"] as const;

type ProjectType = Opportunity["type"];
type ChecklistDoc = { id: string; name: string; mandatory: boolean };
type ChecklistMap = Record<ProjectType, ChecklistDoc[]>;

const TYPE_META: Record<ProjectType, { icon: LucideIcon; tone: string; tag: string }> = {
  Solar: { icon: Sun, tone: "task-tone-milestone", tag: "Photovoltaic" },
  Wind: { icon: Wind, tone: "task-tone-allotment", tag: "Onshore / Offshore" },
  Hybrid: { icon: Zap, tone: "task-tone-waiting", tag: "Solar + Wind" },
};

export const Route = createFileRoute("/admin/checklists/")({
  head: () => ({ meta: [{ title: "Document checklists — PMIS" }] }),
  component: ChecklistsPage,
});

function ChecklistsPage() {
  const reduceMotion = useReducedMotion();
  const [docsByType, setDocsByType] = useState<ChecklistMap>(() => ({
    Solar: PROJECT_TYPE_CHECKLIST_DOC_NAMES.Solar.map((name, i) => ({ id: `sol_${i}`, name, mandatory: true })),
    Wind: PROJECT_TYPE_CHECKLIST_DOC_NAMES.Wind.map((name, i) => ({ id: `wnd_${i}`, name, mandatory: true })),
    Hybrid: PROJECT_TYPE_CHECKLIST_DOC_NAMES.Hybrid.map((name, i) => ({ id: `hyb_${i}`, name, mandatory: true })),
  }));
  const [draftByType, setDraftByType] = useState<Record<ProjectType, string>>({
    Solar: "",
    Wind: "",
    Hybrid: "",
  });
  const [mandatoryByType, setMandatoryByType] = useState<Record<ProjectType, boolean>>({
    Solar: true,
    Wind: true,
    Hybrid: true,
  });
  const [activeType, setActiveType] = useState<ProjectType>("Solar");
  const [filterMode, setFilterMode] = useState<"all" | "required" | "optional">("all");

  const sets = useMemo(
    () =>
      PROJECT_TYPES.map((type) => ({
        type,
        name: PROJECT_TYPE_CHECKLIST_LABELS[type],
        docs: docsByType[type],
      })),
    [docsByType],
  );

  const addDoc = (type: ProjectType) => {
    const text = draftByType[type].trim();
    if (!text) return;
    setDocsByType((prev) => ({
      ...prev,
      [type]: [
        ...prev[type],
        { id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: text, mandatory: mandatoryByType[type] },
      ],
    }));
    setDraftByType((prev) => ({ ...prev, [type]: "" }));
    setMandatoryByType((prev) => ({ ...prev, [type]: true }));
  };

  const removeDoc = (type: ProjectType, id: string) => {
    setDocsByType((prev) => ({
      ...prev,
      [type]: prev[type].filter((d) => d.id !== id),
    }));
  };

  const toggleMandatory = (type: ProjectType, id: string) => {
    setDocsByType((prev) => ({
      ...prev,
      [type]: prev[type].map((d) => (d.id === id ? { ...d, mandatory: !d.mandatory } : d)),
    }));
  };

  const allDocs = Object.values(docsByType).flat();
  const totalCount = allDocs.length;
  const mandatoryCount = allDocs.filter((d) => d.mandatory).length;
  const optionalCount = totalCount - mandatoryCount;

  const activeSet = sets.find((s) => s.type === activeType)!;
  const activeMeta = TYPE_META[activeType];
  const ActiveIcon = activeMeta.icon;

  const filteredDocs = activeSet.docs.filter((d) => {
    if (filterMode === "required") return d.mandatory;
    if (filterMode === "optional") return !d.mandatory;
    return true;
  });

  return (
    <AppShell role="admin">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Document checklists"
              count={sets.length}
              description="Curate the evidence pack each project type must satisfy. Required documents block progression; optional ones support evaluation."
            />
          }
        />

        {/* KPI strip */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Checklist summary metrics">
          {(
            [
              {
                key: "types",
                label: "Project types",
                value: sets.length,
                footerBadge: "Bundles",
                footer: "Solar · Wind · Hybrid",
                icon: FileCheck2,
              },
              {
                key: "rows",
                label: "Total documents",
                value: totalCount,
                footerBadge: "Catalogue",
                footer: "Rows across every bundle",
                icon: FileText,
              },
              {
                key: "req",
                label: "Required",
                value: mandatoryCount,
                footerBadge: "Blocking",
                footer: "Mandatory IPP uploads",
                icon: ShieldCheck,
              },
              {
                key: "opt",
                label: "Optional",
                value: optionalCount,
                footerBadge: "Supporting",
                footer: "Non-blocking evidence",
                icon: Sparkles,
              },
            ] as const
          ).map((tile, i) => {
            const Icon = tile.icon;
            return (
              <MotionMetricCard
                key={tile.key}
                label={tile.label}
                value={tile.value}
                icon={Icon}
                iconTone={metricTileToneAt(i)}
                footer={tile.footer}
                footerBadge={tile.footerBadge}
                active={i === 0}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: reduceMotion ? 0 : i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })}
        </div>

        {/* Type tab strip */}
        <div className="grid gap-3 sm:grid-cols-3">
          {sets.map((s, i) => {
            const meta = TYPE_META[s.type];
            const Icon = meta.icon;
            const active = s.type === activeType;
            const reqs = s.docs.filter((d) => d.mandatory).length;
            return (
              <motion.button
                key={s.type}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setActiveType(s.type);
                  setFilterMode("all");
                }}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.08 + i * 0.05 }}
                className={cn("task-kpi text-left", meta.tone)}
                data-active={active}
              >
                <div className="flex items-start gap-3">
                  <span className="task-kpi-icon flex size-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold tracking-tight text-foreground">{s.name}</p>
                      {active ? <CheckCircle2 className="size-4 shrink-0 text-foreground/55" aria-hidden /> : null}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{meta.tag}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                      <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 tabular-nums text-foreground/80">
                        {s.docs.length} docs
                      </span>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 tabular-nums text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                        {reqs} required
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Active checklist editor */}
        <motion.section
          key={activeType}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-lg shadow-black/[0.04] ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20"
        >
          {/* Header banner */}
          <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/[0.07] via-card to-chart-2/[0.05] px-5 py-4 sm:px-6 sm:py-5">
            <div
              className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={cn("task-kpi-icon flex size-11 shrink-0 items-center justify-center rounded-xl", activeMeta.tone)}>
                  <ActiveIcon className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">{activeSet.name}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {activeSet.docs.length} document{activeSet.docs.length === 1 ? "" : "s"} ·{" "}
                    {activeSet.docs.filter((d) => d.mandatory).length} required ·{" "}
                    {activeSet.docs.filter((d) => !d.mandatory).length} optional
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 p-0.5 text-[11px] shadow-sm backdrop-blur">
                {(["all", "required", "optional"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFilterMode(m)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold capitalize transition-colors",
                      filterMode === m
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Filter className="size-3" aria-hidden />
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add row */}
          <div className="border-b border-border/50 bg-muted/15 px-5 py-4 sm:px-6">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Add document to {activeType.toLowerCase()} checklist</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Input
                value={draftByType[activeType]}
                onChange={(e) => setDraftByType((prev) => ({ ...prev, [activeType]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDoc(activeType);
                  }
                }}
                placeholder="e.g. Grid connectivity approval"
                className="h-10 min-w-[16rem] flex-1 rounded-xl bg-background"
                aria-label={`Add ${activeType} checklist document`}
              />
              <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground shadow-sm">
                <Checkbox
                  checked={mandatoryByType[activeType]}
                  onCheckedChange={(v) => setMandatoryByType((prev) => ({ ...prev, [activeType]: v === true }))}
                />
                Required
              </label>
              <Button type="button" className="h-10 gap-1.5 rounded-xl shadow-sm" onClick={() => addDoc(activeType)}>
                <Plus className="size-4" aria-hidden />
                Add document
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="px-5 py-4 sm:px-6">
            {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-10 text-center">
                <FileText className="size-7 text-muted-foreground/70" aria-hidden />
                <p className="text-sm font-medium text-foreground">No documents in this view</p>
                <p className="text-xs text-muted-foreground">
                  {filterMode === "all"
                    ? "Add your first document above."
                    : `No ${filterMode} documents — change filter to see all.`}
                </p>
              </div>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                <AnimatePresence initial={false}>
                  {filteredDocs.map((d, i) => (
                    <motion.li
                      key={d.id}
                      layout
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                      transition={{ duration: 0.22, delay: reduceMotion ? 0 : Math.min(i * 0.02, 0.18) }}
                      className="group flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-3 text-sm shadow-sm transition hover:border-primary/30 hover:shadow-md"
                    >
                      <div className="flex min-w-0 items-start gap-2.5">
                        <span
                          className={cn(
                            "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
                            d.mandatory
                              ? "bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground",
                          )}
                          aria-hidden
                        >
                          <FileCheck2 className="size-3.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="break-words font-medium text-foreground">{d.name}</p>
                          <button
                            type="button"
                            onClick={() => toggleMandatory(activeType, d.id)}
                            className={cn(
                              "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase transition-colors",
                              d.mandatory
                                ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-300"
                                : "bg-muted text-muted-foreground hover:bg-muted/80",
                            )}
                            aria-label={`Toggle ${d.name} requirement`}
                          >
                            {d.mandatory ? "Required" : "Optional"}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 shrink-0 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeDoc(activeType, d.id)}
                        aria-label={`Remove ${d.name}`}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </motion.section>
      </DataListPageShell>
    </AppShell>
  );
}
