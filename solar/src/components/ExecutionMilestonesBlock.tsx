import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileCheck2,
  FileText,
  Lock,
  Rocket,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { DocStatus, Milestone, MilestoneStatus, Project, Role } from '@/lib/types'
import { ensureMilestoneProofs, milestoneProgressPercentFromProofs } from '@/lib/execution-milestones'
import { applyAutoCompletionFromMilestones } from '@/lib/project-completion'
import { uidLib } from '@/lib/mock-db'
import { formatDate } from '@/lib/hooks'
import { DocBadge, MilestoneBadge } from '@/components/Bits'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/** Animated SVG progress ring used inside each milestone card. */
function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  tone = 'primary',
}: {
  value: number
  size?: number
  stroke?: number
  tone?: 'primary' | 'emerald' | 'sky' | 'violet' | 'rose' | 'amber'
}) {
  const v = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (v / 100) * c
  const stroke1 =
    tone === 'emerald' ? 'rgb(16 185 129)'
      : tone === 'sky' ? 'rgb(2 132 199)'
        : tone === 'violet' ? 'rgb(124 58 237)'
          : tone === 'rose' ? 'rgb(244 63 94)'
            : tone === 'amber' ? 'rgb(245 158 11)'
              : 'var(--primary)'
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in srgb, currentColor 14%, transparent)"
          strokeWidth={stroke}
          className="text-muted-foreground"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke1}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums tracking-tight text-foreground">
        {v}<span className="ml-px text-[9px] text-muted-foreground">%</span>
      </span>
    </div>
  )
}

type ExecutionViewer = 'ipp' | 'officer'

const ACCENT_STYLES = [
  {
    top: 'border-t-emerald-500',
    heroBg: 'bg-emerald-600 shadow-emerald-500/25 dark:bg-emerald-600',
    heroRing: 'ring-emerald-500/20',
    wash: 'from-emerald-500/[0.07] via-transparent to-transparent',
    label: 'text-emerald-800 dark:text-emerald-300',
    progressTint: '[&_[data-slot=progress-indicator]]:bg-emerald-600 dark:[&_[data-slot=progress-indicator]]:bg-emerald-500',
    submitRing: 'shadow-emerald-500/15',
  },
  {
    top: 'border-t-sky-500',
    heroBg: 'bg-sky-600 shadow-sky-500/25 dark:bg-sky-600',
    heroRing: 'ring-sky-500/20',
    wash: 'from-sky-500/[0.07] via-transparent to-transparent',
    label: 'text-sky-900 dark:text-sky-300',
    progressTint: '[&_[data-slot=progress-indicator]]:bg-sky-600 dark:[&_[data-slot=progress-indicator]]:bg-sky-500',
    submitRing: 'shadow-sky-500/15',
  },
  {
    top: 'border-t-violet-500',
    heroBg: 'bg-violet-600 shadow-violet-500/25 dark:bg-violet-600',
    heroRing: 'ring-violet-500/20',
    wash: 'from-violet-500/[0.07] via-transparent to-transparent',
    label: 'text-violet-900 dark:text-violet-300',
    progressTint:
      '[&_[data-slot=progress-indicator]]:bg-violet-600 dark:[&_[data-slot=progress-indicator]]:bg-violet-500',
    submitRing: 'shadow-violet-500/15',
  },
] as const

function proofIconTileClass(status: DocStatus): string {
  return {
    Verified:
      'border-emerald-400/55 bg-emerald-500/[0.13] text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-400',
    Uploaded:
      'border-sky-400/55 bg-sky-500/[0.13] text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-300',
    Rejected:
      'border-rose-400/55 bg-rose-500/[0.12] text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-400',
    Missing:
      'border-amber-400/55 bg-amber-500/[0.12] text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/12 dark:text-amber-300',
  }[status]
}

function proofsAttachedCount(proofs: { status: DocStatus }[]): { done: number; total: number } {
  const total = proofs.length
  const done = proofs.filter((pr) => pr.status === 'Uploaded' || pr.status === 'Verified').length
  return { done, total }
}

function logActivity(user: string, role: Role, action: string) {
  return {
    id: uidLib(),
    user,
    role,
    action,
    timestamp: new Date().toISOString(),
  }
}

function resetProofs(m: Milestone): Milestone {
  const proofs = (m.proofs ?? []).map((pr) => ({ ...pr, status: 'Missing' as const, uploadedAt: undefined }))
  const next = { ...m, proofs }
  return { ...next, progress: milestoneProgressPercentFromProofs(next) }
}

export function ExecutionMilestonesBlock({
  project: p,
  viewerRole,
  persist,
}: {
  project: Project
  viewerRole: ExecutionViewer
  /** Pass `quiet` to skip success toast for silent saves */
  persist: (next: Project, quiet?: boolean) => void
}) {
  const [msRemarks, setMsRemarks] = useState<Record<string, string>>({})

  const baseMilestones = (): Milestone[] => ensureMilestoneProofs(p.milestones)

  const patchMilestones = (
    mapFn: (m: Milestone) => Milestone,
    act?: { user: string; role: Role; action: string },
    quiet?: boolean,
  ) => {
    const nextMs = baseMilestones().map(mapFn)
    const milestonesChanged = JSON.stringify(nextMs) !== JSON.stringify(baseMilestones())
    const baseActivity = act ? [...p.activity, logActivity(act.user, act.role, act.action)] : p.activity
    const merged: Project = {
      ...p,
      milestones: nextMs,
      activity: baseActivity,
      fullMilestonesSubmittedAt: milestonesChanged ? undefined : p.fullMilestonesSubmittedAt,
      fullMilestonesApprovedAt: milestonesChanged ? undefined : p.fullMilestonesApprovedAt,
      lastUpdated: new Date().toISOString(),
    }
    const final = applyAutoCompletionFromMilestones(merged, nextMs, merged.activity)
    persist(final, quiet)
  }

  const ippSetStatus = (milestoneId: string, status: MilestoneStatus) => {
    if (status === 'Submitted' || status === 'Completed' || status === 'Verified') return
    patchMilestones(
      (m) => (m.id === milestoneId ? { ...m, status } : m),
      {
        user: p.ippName,
        role: 'ipp',
        action: `Set milestone status to ${status}`,
      },
      false,
    )
  }

  const ippUploadProof = (milestoneId: string, proofId: string) => {
    const ts = new Date().toISOString()
    patchMilestones((m) => {
      if (m.id !== milestoneId) return m
      const proofs = (m.proofs ?? []).map((pr) =>
        pr.id === proofId ? { ...pr, status: 'Uploaded' as const, uploadedAt: ts } : pr,
      )
      const withProofs: Milestone = { ...m, proofs }
      const progress = milestoneProgressPercentFromProofs(withProofs)
      const hasUpload = proofs.some((pr) => pr.status === 'Uploaded' || pr.status === 'Verified')
      const status =
        m.status === 'Not Started' && hasUpload ? ('In Progress' as const) : m.status
      return { ...withProofs, progress, status }
    }, { user: p.ippName, role: 'ipp', action: 'Uploaded milestone proof' })
  }

  const ippSubmitMilestoneForVerification = (milestoneId: string) => {
    const ms = baseMilestones().find((m) => m.id === milestoneId)
    if (!ms) return
    if (ms.status === 'Submitted') return toast.info('Already submitted for verification')
    if (ms.status === 'Completed' || ms.status === 'Verified') return toast.info('Milestone already closed out')
    if (ms.status !== 'Not Started' && ms.status !== 'In Progress') return
    const proofs = ms.proofs ?? []
    if (proofs.some((pr) => pr.status === 'Missing')) {
      return toast.error('Upload all proof documents before submitting')
    }
    patchMilestones(
      (m) => (m.id === milestoneId ? { ...m, status: 'Submitted' as const, officerNote: undefined } : m),
      { user: p.ippName, role: 'ipp', action: 'Submitted milestone for officer verification' },
    )
  }

  const officerApproveMilestone = (milestoneId: string) => {
    patchMilestones(
      (m) => (m.id === milestoneId ? { ...m, status: 'Completed' as const, officerNote: undefined } : m),
      { user: 'Officer', role: 'officer', action: 'Approved milestone (execution)' },
    )
  }

  const officerRejectMilestone = (milestoneId: string) => {
    patchMilestones(
      (m) =>
        m.id === milestoneId
          ? resetProofs({
              ...m,
              status: 'In Progress' as const,
              officerNote: 'Milestone returned — please address officer findings and resubmit.',
            })
          : m,
      { user: 'Officer', role: 'officer', action: 'Rejected milestone (execution)' },
    )
  }

  const officerAskCorrection = (milestoneId: string) => {
    const note = (msRemarks[milestoneId] ?? '').trim()
    if (!note) return toast.error('Enter correction instructions for the IPP')
    patchMilestones(
      (m) =>
        m.id === milestoneId
          ? resetProofs({
              ...m,
              status: 'In Progress' as const,
              officerNote: note,
            })
          : m,
      { user: 'Officer', role: 'officer', action: 'Requested milestone correction' },
    )
    setMsRemarks((r) => ({ ...r, [milestoneId]: '' }))
  }

  const milestones = baseMilestones()
  const allMilestonesCompleted =
    milestones.length > 0 && milestones.every((m) => m.status === 'Completed' || m.status === 'Verified')
  const fullSubmissionPendingApproval = !!p.fullMilestonesSubmittedAt && !p.fullMilestonesApprovedAt
  const fullSubmissionApproved = !!p.fullMilestonesApprovedAt

  const ippSubmitFullMilestones = () => {
    if (!allMilestonesCompleted) {
      toast.error('Complete all milestones before submitting the full package')
      return
    }
    if (p.fullMilestonesSubmittedAt && !p.fullMilestonesApprovedAt) {
      toast.info('Full milestone package is already with the officer')
      return
    }
    const ts = new Date().toISOString()
    persist(
      {
        ...p,
        fullMilestonesSubmittedAt: ts,
        fullMilestonesApprovedAt: undefined,
        lastUpdated: ts,
        activity: [
          ...p.activity,
          logActivity(p.ippName, 'ipp', 'Submitted full milestone package for officer approval'),
        ],
      },
      false,
    )
  }

  const officerApproveFullMilestones = () => {
    if (!allMilestonesCompleted) return toast.error('All milestones must be completed before approval')
    const ts = new Date().toISOString()
    const workflow = p.workflow.map((w) =>
      w.name === 'Execution' && w.status === 'current'
        ? { ...w, status: 'completed' as const, completedAt: ts, assignee: w.assignee }
        : w,
    )
    persist(
      {
        ...p,
        status: 'Ready for Commissioning',
        stage: 'Ready for Commissioning',
        fullMilestonesApprovedAt: ts,
        lastUpdated: ts,
        workflow,
        activity: [...p.activity, logActivity('Officer', 'officer', 'Approved full milestone package')],
      },
      false,
    )
  }

  const reduceMotion = useReducedMotion()
  const overallDone = milestones.filter((m) => m.status === 'Completed' || m.status === 'Verified').length
  const overallPct = milestones.length ? Math.round((overallDone / milestones.length) * 100) : 0

  return (
    <div className="space-y-6">
      {viewerRole === 'officer' ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/[0.07] via-card to-card p-4 shadow-sm"
        >
          <div className="pointer-events-none absolute -right-12 -top-14 size-44 rounded-full bg-sky-500/15 blur-3xl" aria-hidden />
          <div className="relative flex gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-md ring-1 ring-sky-500/30">
              <ShieldCheck className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <p className="text-sm font-semibold text-foreground">Officer desk</p>
              <p>
                Review progress and proofs. <strong className="text-foreground">Approve</strong> when satisfied,{' '}
                <strong className="text-foreground">Reject</strong> to send the milestone back, or{' '}
                <strong className="text-foreground">Ask correction</strong> with clear instructions — proofs reset for a clean
                re-upload.
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Mini horizontal progression rail */}
      {milestones.length > 1 ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5"
          aria-hidden
        >
          <div className="absolute left-6 right-6 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-border/70" />
          <motion.div
            className="absolute left-6 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 via-primary to-chart-2"
            initial={{ width: 0 }}
            animate={{ width: `calc(${Math.max(overallPct, 2)}% * 0.92)` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="relative flex items-center justify-between">
            {milestones.map((m, mi) => {
              const done = m.status === 'Completed' || m.status === 'Verified'
              const submitted = m.status === 'Submitted'
              const inProgress = m.status === 'In Progress'
              return (
                <motion.div
                  key={m.id}
                  initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                  animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.32, delay: 0.08 + mi * 0.05 }}
                  className="relative flex flex-col items-center gap-1.5"
                >
                  <span
                    className={cn(
                      'z-[1] flex size-8 items-center justify-center rounded-full text-[11px] font-bold tabular-nums shadow-sm ring-2 ring-card transition-colors',
                      done ? 'bg-emerald-500 text-white'
                        : submitted ? 'bg-sky-500 text-white'
                          : inProgress ? 'bg-amber-500 text-white'
                            : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {done ? <CheckCircle2 className="size-4" /> : m.sequence}
                  </span>
                  <span className="hidden text-[10px] font-medium text-muted-foreground sm:inline">M{m.sequence}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      ) : null}

      <ul className="space-y-5">
        {milestones.map((m, mi) => {
          const accent = ACCENT_STYLES[mi % ACCENT_STYLES.length]!
          const ippEditable = viewerRole === 'ipp' && (m.status === 'Not Started' || m.status === 'In Progress')
          const ippShowSubmit = viewerRole === 'ipp' && (m.status === 'Not Started' || m.status === 'In Progress')
          const officerActive = viewerRole === 'officer' && m.status === 'Submitted'
          const proofs = m.proofs ?? []
          const { done: proofsDone, total: proofsTotal } = proofsAttachedCount(proofs)
          const proofsBlockingSubmit = proofs.some((pr) => pr.status === 'Missing')
          const deliveryProgress = milestoneProgressPercentFromProofs(m)
          const isDone = m.status === 'Completed' || m.status === 'Verified'
          const isSubmitted = m.status === 'Submitted'

          const ringTone: 'emerald' | 'sky' | 'violet' | 'rose' | 'amber' | 'primary' =
            isDone ? 'emerald'
              : isSubmitted ? 'sky'
                : m.status === 'In Progress' ? 'amber'
                  : m.officerNote ? 'rose'
                    : (['emerald', 'sky', 'violet'][mi % 3] as 'emerald' | 'sky' | 'violet')

          const statusSelectValue =
            m.status === 'Not Started' || m.status === 'In Progress' ? m.status : 'In Progress'

          return (
            <motion.li
              key={m.id}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.08 + mi * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              className={cn(
                'group/card relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-md ring-1 ring-black/[0.04] transition-shadow duration-300 hover:shadow-lg dark:ring-white/[0.06]',
                'border-t-[3px]',
                accent.top,
              )}
            >
              {/* Decorative ambient blob */}
              <div
                className={cn(
                  'pointer-events-none absolute -right-16 -top-20 size-60 rounded-full opacity-50 blur-3xl transition-opacity duration-500 group-hover/card:opacity-80',
                  ringTone === 'emerald' ? 'bg-emerald-500/15'
                    : ringTone === 'sky' ? 'bg-sky-500/15'
                      : ringTone === 'violet' ? 'bg-violet-500/15'
                        : ringTone === 'rose' ? 'bg-rose-500/15'
                          : ringTone === 'amber' ? 'bg-amber-500/15'
                            : 'bg-primary/15',
                )}
                aria-hidden
              />

              {/* Header */}
              <div
                className={cn(
                  'relative border-b border-border/60 bg-gradient-to-br px-5 py-5 sm:px-6 sm:py-6',
                  accent.wash,
                  'via-card to-muted/15',
                )}
              >
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <motion.div
                      initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
                      animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                      transition={{ duration: 0.45, delay: 0.12, type: 'spring', stiffness: 220, damping: 18 }}
                      className={cn(
                        'flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-lg ring-2',
                        accent.heroBg,
                        accent.heroRing,
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Step</span>
                      <span className="text-xl font-bold tabular-nums leading-none">{m.sequence}</span>
                    </motion.div>
                    <div className="min-w-0 pt-0.5">
                      <p className={cn('text-[10px] font-bold uppercase tracking-[0.14em]', accent.label)}>
                        Milestone {m.sequence}
                      </p>
                      <h3 className="mt-1 text-balance text-lg font-bold tracking-tight text-foreground sm:text-xl">
                        {m.name}
                      </h3>
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 backdrop-blur">
                          <Calendar className="size-3 shrink-0 opacity-80" aria-hidden />
                          Due <span className="font-semibold text-foreground">{formatDate(m.dueDate)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 backdrop-blur">
                          <ClipboardCheck className="size-3 shrink-0 opacity-80" aria-hidden />
                          <span className="font-semibold text-foreground tabular-nums">{proofsDone}/{proofsTotal}</span> proofs
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <ProgressRing value={deliveryProgress} size={64} stroke={6} tone={ringTone} />
                    <div className="flex flex-col items-end gap-1.5">
                      <MilestoneBadge status={m.status} />
                      {ippEditable && proofsBlockingSubmit ? (
                        <span className="max-w-[12rem] text-right text-[10px] font-medium leading-snug text-amber-800 dark:text-amber-300">
                          <Lock className="mr-0.5 inline size-3 align-[-2px]" aria-hidden />
                          Upload all proofs to enable submission
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-5 px-5 py-5 sm:px-6">
                {/* Inline status row + work-status select for IPP */}
                {ippEditable ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-3.5 text-primary" aria-hidden />
                      <Label htmlFor={`ms-status-${m.id}`} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Work status
                      </Label>
                    </div>
                    <Select value={statusSelectValue} onValueChange={(v) => ippSetStatus(m.id, v as MilestoneStatus)}>
                      <SelectTrigger id={`ms-status-${m.id}`} className="h-9 w-auto min-w-[10rem] rounded-xl border-border/60 bg-background">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not started</SelectItem>
                        <SelectItem value="In Progress">In progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                {/* Officer feedback callout (animated) */}
                <AnimatePresence>
                  {m.officerNote ? (
                    <motion.div
                      key={m.officerNote}
                      initial={reduceMotion ? false : { opacity: 0, y: -6, height: 0 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0, height: 'auto' }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-500/[0.10] to-amber-500/[0.04] px-4 py-3 text-sm shadow-sm dark:bg-amber-500/10"
                    >
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200">
                        <ShieldCheck className="size-3" aria-hidden />
                        Officer feedback
                      </p>
                      <p className="mt-1.5 leading-relaxed text-foreground">{m.officerNote}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Proof checklist */}
                <div>
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileCheck2 className="size-3.5" aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Proof checklist</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Each item needs an upload before you can submit this milestone.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                      <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
                      <span className="tabular-nums text-foreground">{proofsDone}</span>
                      <span className="text-muted-foreground">/ {proofsTotal} ready</span>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-2">
                    <AnimatePresence initial={false}>
                      {proofs.map((pr, pri) => {
                        const isVerified = pr.status === 'Verified'
                        const isUploaded = pr.status === 'Uploaded'
                        const isRejected = pr.status === 'Rejected'
                        return (
                          <motion.li
                            key={pr.id}
                            layout
                            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                            exit={reduceMotion ? undefined : { opacity: 0, x: 8 }}
                            transition={{ duration: 0.28, delay: reduceMotion ? 0 : 0.04 + pri * 0.04, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={reduceMotion ? undefined : { y: -1 }}
                            className={cn(
                              'group/proof relative flex flex-wrap items-center gap-3 overflow-hidden rounded-2xl border bg-card px-3 py-3 shadow-sm transition-colors sm:flex-nowrap sm:px-4',
                              isVerified ? 'border-emerald-400/50'
                                : isUploaded ? 'border-sky-400/50'
                                  : isRejected ? 'border-rose-400/50'
                                    : 'border-border/60 hover:border-primary/35',
                            )}
                          >
                            {/* Status accent bar */}
                            {isVerified || isUploaded ? (
                              <motion.span
                                initial={reduceMotion ? false : { scaleY: 0 }}
                                animate={reduceMotion ? undefined : { scaleY: 1 }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                  'absolute inset-y-0 left-0 w-[3px] origin-top rounded-r-full',
                                  isVerified ? 'bg-emerald-500' : 'bg-sky-500',
                                )}
                                aria-hidden
                              />
                            ) : null}
                            <motion.div
                              initial={false}
                              animate={isVerified ? { scale: [1, 1.12, 1] } : {}}
                              transition={{ duration: 0.5 }}
                              className={cn(
                                'flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-inner transition-colors',
                                proofIconTileClass(pr.status),
                              )}
                            >
                              {isVerified ? (
                                <CheckCircle2 className="size-[18px]" strokeWidth={2.4} aria-hidden />
                              ) : isRejected ? (
                                <X className="size-[18px]" strokeWidth={2.4} aria-hidden />
                              ) : (
                                <FileText className="size-[18px]" strokeWidth={2} aria-hidden />
                              )}
                            </motion.div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-snug text-foreground">{pr.label}</p>
                              {pr.uploadedAt ? (
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                  Uploaded {formatDate(pr.uploadedAt)}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                              <DocBadge status={pr.status} />
                              {viewerRole === 'ipp' && ippEditable && (pr.status === 'Missing' || pr.status === 'Rejected') ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="gap-1.5 rounded-xl shadow-sm transition-transform hover:scale-[1.02]"
                                  onClick={() => ippUploadProof(m.id, pr.id)}
                                >
                                  <Upload className="size-3.5" aria-hidden />
                                  Upload
                                </Button>
                              ) : null}
                            </div>
                          </motion.li>
                        )
                      })}
                    </AnimatePresence>
                  </ul>
                </div>

                {/* Submit CTA */}
                {viewerRole === 'ipp' && ippShowSubmit ? (
                  <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <motion.div
                      whileHover={reduceMotion || proofsBlockingSubmit ? undefined : { scale: 1.02 }}
                      whileTap={proofsBlockingSubmit ? undefined : { scale: 0.97 }}
                      className="relative inline-block"
                    >
                      {!proofsBlockingSubmit ? (
                        <span
                          className="pointer-events-none absolute inset-0 -z-[1] rounded-xl"
                          style={{
                            boxShadow: '0 0 0 0 color-mix(in srgb, var(--primary) 60%, transparent)',
                            animation: reduceMotion ? undefined : 'msSubmitPulse 1.8s ease-out infinite',
                          }}
                          aria-hidden
                        />
                      ) : null}
                      <Button
                        type="button"
                        size="lg"
                        disabled={proofsBlockingSubmit}
                        className={cn(
                          'gap-2 rounded-xl px-5 shadow-lg',
                          accent.submitRing,
                          !proofsBlockingSubmit && 'bg-gradient-to-r from-primary to-chart-2 hover:opacity-95',
                        )}
                        onClick={() => ippSubmitMilestoneForVerification(m.id)}
                      >
                        <SendHorizontal className="size-4" aria-hidden />
                        Submit milestone for verification
                      </Button>
                    </motion.div>
                    {proofsBlockingSubmit ? (
                      <p className="max-w-md text-xs text-muted-foreground">
                        <Lock className="mr-1 inline size-3 align-[-2px]" aria-hidden />
                        Finish every proof upload above — the button unlocks automatically when nothing is{' '}
                        <span className="font-medium text-foreground">Missing</span>.
                      </p>
                    ) : (
                      <p className="max-w-md text-xs text-muted-foreground">
                        <Rocket className="mr-1 inline size-3 align-[-2px] text-primary" aria-hidden />
                        Sends this milestone to the officer queue. You can still update progress until then if this button
                        stays available.
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Officer verification block */}
                <AnimatePresence>
                  {officerActive ? (
                    <motion.div
                      initial={reduceMotion ? false : { opacity: 0, y: 8, height: 0 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0, height: 'auto' }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: 8, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/[0.07] to-muted/20 p-4 shadow-inner">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <ShieldCheck className="size-4 text-sky-600 dark:text-sky-400" aria-hidden />
                          Officer verification
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="sm" className="gap-1.5 rounded-xl shadow-sm" onClick={() => officerApproveMilestone(m.id)}>
                            <CheckCircle2 className="size-3.5" aria-hidden />
                            Approve milestone
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="rounded-xl shadow-sm"
                            onClick={() => officerRejectMilestone(m.id)}
                          >
                            Reject milestone
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`off-correction-${m.id}`} className="text-xs text-muted-foreground">
                            Correction instructions
                          </Label>
                          <textarea
                            id={`off-correction-${m.id}`}
                            value={msRemarks[m.id] ?? ''}
                            onChange={(e) => setMsRemarks((r) => ({ ...r, [m.id]: e.target.value }))}
                            rows={3}
                            className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                            placeholder='Required for "Ask correction" — be specific for the IPP'
                          />
                          <Button type="button" size="sm" variant="secondary" className="rounded-xl" onClick={() => officerAskCorrection(m.id)}>
                            Ask correction
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* IPP submitted waiting state */}
                {viewerRole === 'ipp' && m.status === 'Submitted' ? (
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-muted-foreground"
                  >
                    <Clock className="mt-0.5 size-4 shrink-0 animate-pulse text-primary" aria-hidden />
                    <span>This milestone is <strong className="text-foreground">queued for officer review</strong>. You will see officer feedback here if they ask for changes.</span>
                  </motion.div>
                ) : null}

                {/* Verified / completed celebration */}
                {isDone ? (
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                    animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3 rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/[0.10] to-emerald-500/[0.04] px-4 py-3 text-sm font-medium text-emerald-950 dark:bg-emerald-500/10 dark:text-emerald-100"
                  >
                    <motion.span
                      initial={reduceMotion ? false : { rotate: -20, scale: 0.7 }}
                      animate={reduceMotion ? undefined : { rotate: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md"
                    >
                      <CheckCircle2 className="size-4" aria-hidden />
                    </motion.span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">Milestone verified</p>
                      <p className="text-xs text-muted-foreground">Marked completed on the project record.</p>
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </motion.li>
          )
        })}
      </ul>

      {/* Pulse animation keyframes (scoped) */}
      <style>{`
        @keyframes msSubmitPulse {
          0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 55%, transparent); }
          70% { box-shadow: 0 0 0 14px color-mix(in srgb, var(--primary) 0%, transparent); }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
      `}</style>

      {viewerRole === 'ipp' ? (
        <section className="rounded-xl border border-border/70 bg-muted/20 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground">Full milestone submission</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Submit the full milestone package only after all milestones are completed and verified.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={ippSubmitFullMilestones}
              disabled={!allMilestonesCompleted || fullSubmissionPendingApproval || fullSubmissionApproved}
            >
              Submit full milestones
            </Button>
            {!allMilestonesCompleted ? (
              <span className="text-xs text-muted-foreground">
                Locked until all milestones are completed.
              </span>
            ) : fullSubmissionPendingApproval ? (
              <span className="text-xs text-muted-foreground">
                Submitted to officer; waiting for approval.
              </span>
            ) : fullSubmissionApproved ? (
              <span className="text-xs text-emerald-700 dark:text-emerald-400">
                Approved by officer.
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Unlocked and ready to submit.</span>
            )}
          </div>
        </section>
      ) : null}

      {viewerRole === 'officer' && fullSubmissionPendingApproval ? (
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground">Full milestone package submitted</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            IPP has submitted all milestones for full review. Approve to unlock commissioning submission for IPP.
          </p>
          <div className="mt-3">
            <Button type="button" onClick={officerApproveFullMilestones}>
              Approve full milestone package
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
