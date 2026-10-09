import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers3,
  ListChecks,
  Pencil,
  Plus,
  Sun,
  Trash2,
  Wand2,
  Wind,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
} from "@/components/DataListPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { metricTileToneAt } from "@/lib/dashboard-kpi-icon";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

export const Route = createFileRoute("/admin/project-types/")({
  head: () => ({ meta: [{ title: "Project types — PMIS" }] }),
  component: ProjectTypesPage,
});

type Template = {
  id: string;
  name: string;
  milestones: number;
  checklist: number;
};

const SEED: Template[] = [
  { id: "pt-1", name: "Solar PV — utility scale", milestones: 5, checklist: 6 },
  { id: "pt-2", name: "Onshore wind", milestones: 6, checklist: 7 },
  { id: "pt-3", name: "Solar–wind hybrid", milestones: 6, checklist: 8 },
  { id: "pt-4", name: "Rooftop solar — aggregated", milestones: 4, checklist: 4 },
];

/** Presets for “Sample data” in the add/edit sheet (demo / QA). */
const SAMPLE_TEMPLATE_PRESETS: readonly Pick<Template, "name" | "milestones" | "checklist">[] = [
  { name: "Floating solar — reservoir pilot", milestones: 6, checklist: 7 },
  { name: "Battery energy storage (BESS) add-on", milestones: 5, checklist: 9 },
  { name: "Green hydrogen — electrolyzer block", milestones: 7, checklist: 10 },
  { name: "Agri-PV — dual-use canopy", milestones: 5, checklist: 6 },
  { name: "Offshore wind — demonstration", milestones: 8, checklist: 12 },
];

const TONES = ["task-tone-milestone", "task-tone-allotment", "task-tone-waiting", "task-tone-query"] as const;

function pickIcon(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("hybrid")) return Zap;
  if (n.includes("wind")) return Wind;
  if (n.includes("solar") || n.includes("rooftop") || n.includes("pv")) return Sun;
  return Layers3;
}

function ProjectTypesPage() {
  const reduceMotion = useReducedMotion();
  const [types, setTypes] = useState<Template[]>(SEED);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Template | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("edit");

  const openEdit = (t: Template) => {
    setMode("edit");
    setDraft({ ...t });
    setOpen(true);
  };

  const openCreate = () => {
    setMode("create");
    setDraft({
      id: `pt-${Date.now()}`,
      name: "",
      milestones: 5,
      checklist: 5,
    });
    setOpen(true);
  };

  const applySampleTemplate = () => {
    if (!draft) return;
    const pick = SAMPLE_TEMPLATE_PRESETS[Math.floor(Math.random() * SAMPLE_TEMPLATE_PRESETS.length)];
    setDraft({
      ...draft,
      id: draft.id,
      name: pick.name,
      milestones: pick.milestones,
      checklist: pick.checklist,
    });
    toast.success("Sample template values applied — edit if needed, then save.");
  };

  const removeType = (id: string) => {
    setTypes((prev) => {
      if (prev.length <= 1) {
        toast.error("At least one project type is required.");
        return prev;
      }
      return prev.filter((x) => x.id !== id);
    });
    toast.success("Project type removed.");
  };

  const save = () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      toast.error("Please enter project type name.");
      return;
    }
    if (draft.milestones < 1 || draft.checklist < 1) {
      toast.error("Milestones and checklist count must be at least 1.");
      return;
    }
    if (mode === "create") {
      setTypes((prev) => [{ ...draft, name: draft.name.trim() }, ...prev]);
      toast.success("Project type added.");
    } else {
      setTypes((prev) =>
        prev.map((x) =>
          x.id === draft.id ? { ...draft, name: draft.name.trim() } : x,
        ),
      );
      toast.success("Project type updated.");
    }
    setOpen(false);
    setDraft(null);
  };

  const stats = useMemo(() => {
    const totalMilestones = types.reduce((sum, t) => sum + t.milestones, 0);
    const totalChecklist = types.reduce((sum, t) => sum + t.checklist, 0);
    const avgMilestones = types.length ? Math.round((totalMilestones / types.length) * 10) / 10 : 0;
    return { totalMilestones, totalChecklist, avgMilestones };
  }, [types]);

  return (
    <AppShell role="admin">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Project types"
              count={types.length}
              description="Design milestone and document templates that opportunities inherit on creation."
            />
          }
          right={
            <Button type="button" className="h-10 gap-1.5 rounded-xl shadow-sm" onClick={openCreate}>
              <Plus className="size-4" aria-hidden />
              Add project type
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Project type summary metrics">
          {(
            [
              {
                key: "tpl",
                label: "Templates",
                value: types.length,
                footerBadge: "Active",
                footer: "Types in the catalogue",
                icon: Layers3,
              },
              {
                key: "ms",
                label: "Total milestones",
                value: stats.totalMilestones,
                footerBadge: "Depth",
                footer: `~${stats.avgMilestones} avg per template`,
                icon: ListChecks,
              },
              {
                key: "cl",
                label: "Checklist rows",
                value: stats.totalChecklist,
                footerBadge: "Documents",
                footer: "Summed across templates",
                icon: FileText,
              },
              {
                key: "live",
                label: "Live",
                value: types.length,
                footerBadge: "Officers",
                footer: "Available in opportunity setup",
                icon: CheckCircle2,
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {types.map((t, i) => {
              const tone = TONES[i % TONES.length];
              const Icon = pickIcon(t.name);
              return (
                <motion.article
                  key={t.id}
                  layout
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.32, delay: reduceMotion ? 0 : Math.min(i * 0.05, 0.25) }}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-lg shadow-black/[0.04] ring-1 ring-foreground/[0.04] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-card/70",
                    tone,
                  )}
                >
                  {/* tonal top accent */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute -right-12 -top-14 size-44 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-3xl transition group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="relative p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="task-kpi-icon flex size-12 shrink-0 items-center justify-center rounded-xl">
                          <Icon className="size-5.5" aria-hidden />
                        </span>
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shadow-sm">
                            <Layers3 className="size-3" aria-hidden />
                            Template
                          </span>
                          <h2 className="mt-1.5 line-clamp-2 text-base font-semibold tracking-tight text-foreground">
                            {t.name}
                          </h2>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeType(t.id)}
                        aria-label={`Delete ${t.name}`}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <ListChecks className="size-3" aria-hidden />
                          Milestones
                        </div>
                        <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{t.milestones}</p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <FileText className="size-3" aria-hidden />
                          Checklist
                        </div>
                        <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{t.checklist}</p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4 h-9 w-full justify-between gap-1.5 rounded-xl border-primary/25 bg-background/60 text-primary shadow-sm hover:border-primary/40 hover:bg-primary/[0.06]"
                      onClick={() => openEdit(t)}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Pencil className="size-3.5" aria-hidden />
                        Edit template
                      </span>
                      <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>

          {/* Add template CTA card */}
          <motion.button
            type="button"
            onClick={openCreate}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: reduceMotion ? 0 : Math.min(types.length * 0.05, 0.3) }}
            className="group relative flex min-h-[220px] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/20 p-6 text-center transition hover:border-primary/40 hover:bg-primary/[0.04]"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.07] text-primary transition group-hover:scale-110">
              <Plus className="size-6" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-foreground">New project type</p>
            <p className="max-w-[14rem] text-xs text-muted-foreground">
              Define a template with its own milestone count and document checklist.
            </p>
          </motion.button>
        </div>
      </DataListPageShell>

      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setDraft(null); }}>
        <SheetContent
          side="right"
          showCloseButton
          className={cn(
            "flex h-full w-[min(100%,440px)] flex-col gap-0 overflow-hidden border-l border-border/70 p-0 sm:max-w-[440px]",
            "bg-gradient-to-b from-card via-card to-muted/25 shadow-2xl shadow-primary/[0.06]",
          )}
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.12] via-primary/[0.04] to-transparent"
            aria-hidden
          />
          <SheetHeader className="relative z-[1] space-y-0 border-b border-border/60 bg-card/90 px-6 pb-5 pt-14 backdrop-blur-md">
            <div className="flex gap-4">
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-md shadow-primary/10",
                  mode === "create"
                    ? "bg-gradient-to-br from-primary/20 via-primary/10 to-chart-2/15 ring-primary/20"
                    : "bg-gradient-to-br from-chart-2/15 via-muted/80 to-primary/10 ring-border/60",
                )}
              >
                {mode === "create" ? (
                  <Plus className="size-6 text-primary" aria-hidden />
                ) : (
                  <Pencil className="size-5 text-primary" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    mode === "create"
                      ? "border-primary/25 bg-primary/[0.08] text-primary"
                      : "border-border/70 bg-muted/60 text-muted-foreground",
                  )}
                >
                  {mode === "create" ? "New template" : "Edit catalogue"}
                </span>
                <SheetTitle className="mt-2.5 font-heading text-xl font-semibold tracking-tight text-foreground">
                  {mode === "create" ? "Add project type" : "Edit project type"}
                </SheetTitle>
                <SheetDescription className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  Set how many workflow milestones and document checklist rows new opportunities inherit from this template.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {draft ? (
            <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-fit gap-1.5 rounded-xl border border-border/80 bg-background/90 shadow-sm hover:bg-background"
                onClick={applySampleTemplate}
              >
                <Wand2 className="size-3.5 text-primary" aria-hidden />
                Fill sample data
              </Button>

              <Separator className="my-5 bg-border/70" />

              <div className="space-y-5 rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm backdrop-blur-sm">
                <div className="space-y-2">
                  <Label htmlFor="tpl-name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Display name
                  </Label>
                  <Input
                    id="tpl-name"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="e.g. Floating solar — pilot"
                    className={cn(
                      "h-11 rounded-xl border-border/80 bg-background/90 text-[15px] shadow-inner",
                      !draft.name.trim() && "border-destructive/45 ring-1 ring-destructive/15",
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="tpl-ms" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <ListChecks className="size-3.5 text-primary" aria-hidden />
                      Milestones
                    </Label>
                    <Input
                      id="tpl-ms"
                      type="number"
                      min={1}
                      max={20}
                      value={draft.milestones}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        const milestones = Number.isFinite(raw) ? Math.min(20, Math.max(1, Math.round(raw))) : 1;
                        setDraft({ ...draft, milestones });
                      }}
                      className="h-11 rounded-xl border-border/80 bg-background/90 tabular-nums shadow-inner"
                    />
                    <p className="text-[11px] text-muted-foreground">1–20 gates in the workflow.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tpl-cl" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <FileText className="size-3.5 text-primary" aria-hidden />
                      Checklist
                    </Label>
                    <Input
                      id="tpl-cl"
                      type="number"
                      min={1}
                      max={30}
                      value={draft.checklist}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        const checklist = Number.isFinite(raw) ? Math.min(30, Math.max(1, Math.round(raw))) : 1;
                        setDraft({ ...draft, checklist });
                      }}
                      className="h-11 rounded-xl border-border/80 bg-background/90 tabular-nums shadow-inner"
                    />
                    <p className="text-[11px] text-muted-foreground">1–30 document rows.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4">
                <div className="flex flex-1 flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-3 py-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</span>
                  <span className="text-lg font-bold tabular-nums text-foreground">{draft.milestones}</span>
                  <span className="text-[11px] text-muted-foreground">milestones</span>
                </div>
                <div className="flex flex-1 flex-col gap-1 rounded-xl border border-border/50 bg-background/60 px-3 py-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Preview</span>
                  <span className="text-lg font-bold tabular-nums text-foreground">{draft.checklist}</span>
                  <span className="text-[11px] text-muted-foreground">checklist items</span>
                </div>
              </div>
            </div>
          ) : null}

          <SheetFooter className="z-[1] mt-0 flex-shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t border-border/70 bg-muted/20 px-6 py-4 backdrop-blur-md">
            <Button type="button" variant="outline" className="min-w-[6rem] rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="min-w-[8.5rem] rounded-xl bg-primary font-semibold shadow-md shadow-primary/15" onClick={save} disabled={!draft}>
              {mode === "create" ? "Create type" : "Save template"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
