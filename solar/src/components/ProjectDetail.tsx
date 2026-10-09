import { Link, useRouterState } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  CalendarClock,
  Check,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  FileText,
  GitBranch,
  History,
  Layers,
  ListChecks,
  MapPin,
  Send,
  Sparkles,
  Sun,
  TrendingUp,
  User,
  Wind,
  Zap,
} from 'lucide-react'
import { useLayoutEffect, useState } from 'react'
import { toast } from 'sonner'
import type { DocStatus, Project, Role, WorkflowStep } from '@/lib/types'
import { uidLib } from '@/lib/mock-db'
import {
  buildWorkflowAfterFinalApproval,
  createDefaultExecutionMilestones,
  milestoneProgressPercentFromProofs,
} from '@/lib/execution-milestones'
import { downloadProjectCompletionTxt } from '@/lib/project-completion'
import { db, formatDate, relativeTime, useDbVersion } from '@/lib/hooks'
import { ExecutionMilestonesBlock } from '@/components/ExecutionMilestonesBlock'
import { DocBadge, MilestoneBadge, SLABadge, StatusBadge } from '@/components/Bits'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ViewerRole = Extract<Role, 'ipp' | 'officer' | 'approver' | 'management'>

type MetricAccent = 'emerald' | 'sky' | 'violet' | 'amber'

function ProjectMetricCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: LucideIcon
  accent: MetricAccent
}) {
  const bar = {
    emerald: 'border-t-emerald-500',
    sky: 'border-t-sky-500',
    violet: 'border-t-violet-500',
    amber: 'border-t-amber-500',
  }[accent]
  const iconBg = {
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
  }[accent]

  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
        'border-t-[3px]',
        bar,
      )}
    >
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-inner',
          iconBg,
        )}
      >
        <Icon className="size-5" strokeWidth={2} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-sm font-bold leading-snug text-foreground">{value}</p>
      </div>
    </div>
  )
}

function calendarDaysUntilEndOfDay(isoDate: string): number {
  const target = new Date(isoDate)
  if (Number.isNaN(target.getTime())) return NaN
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  return Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86400000)
}

type ActivityAccent = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose'

function activityVisual(
  action: string,
  role: Role,
): { Icon: LucideIcon; accent: ActivityAccent; kind: string } {
  const a = action.toLowerCase()
  if (a.includes('reject') || a.includes('issue raised')) {
    return { Icon: AlertTriangle, accent: 'rose', kind: 'Risk' }
  }
  if (a.includes('query') || a.includes('raised query')) {
    return { Icon: AlertTriangle, accent: 'amber', kind: 'Query' }
  }
  if (a.includes('approv') || a.includes('verified') || a.includes('commission')) {
    return { Icon: CheckCircle2, accent: 'emerald', kind: 'Approval' }
  }
  if (
    a.includes('submit') ||
    a.includes('upload') ||
    a.includes('resubmit') ||
    a.includes('sent access') ||
    a.includes('sent execution')
  ) {
    return { Icon: Send, accent: 'sky', kind: 'Submission' }
  }
  if (a.includes('milestone') || a.includes('progress')) {
    return { Icon: ListChecks, accent: 'violet', kind: 'Delivery' }
  }
  if (a.includes('forward') || a.includes('started review') || a.includes('started')) {
    return { Icon: GitBranch, accent: 'amber', kind: 'Routing' }
  }
  if (role === 'officer') return { Icon: User, accent: 'sky', kind: 'Officer' }
  if (role === 'approver') return { Icon: User, accent: 'violet', kind: 'Approver' }
  if (role === 'ipp') return { Icon: User, accent: 'emerald', kind: 'IPP' }
  return { Icon: History, accent: 'amber', kind: 'Update' }
}

function documentIconTileClass(status: DocStatus): string {
  return {
    Verified:
      'border-emerald-400/55 bg-emerald-500/[0.13] text-emerald-700 shadow-sm shadow-emerald-500/10 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-400',
    Uploaded:
      'border-sky-400/55 bg-sky-500/[0.13] text-sky-700 shadow-sm shadow-sky-500/10 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-300',
    Rejected:
      'border-rose-400/55 bg-rose-500/[0.12] text-rose-700 shadow-sm shadow-rose-500/10 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-400',
    Missing:
      'border-amber-400/55 bg-amber-500/[0.12] text-amber-900 shadow-sm shadow-amber-500/10 dark:border-amber-500/40 dark:bg-amber-500/12 dark:text-amber-300',
  }[status]
}

function activityAccentClasses(accent: ActivityAccent) {
  return {
    emerald: {
      border: 'border-t-emerald-500',
      iconBg: 'bg-emerald-500',
      pill:
        'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100',
    },
    sky: {
      border: 'border-t-sky-500',
      iconBg: 'bg-sky-500',
      pill: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-100',
    },
    violet: {
      border: 'border-t-violet-500',
      iconBg: 'bg-violet-500',
      pill:
        'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-100',
    },
    amber: {
      border: 'border-t-amber-500',
      iconBg: 'bg-amber-500',
      pill:
        'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100',
    },
    rose: {
      border: 'border-t-rose-500',
      iconBg: 'bg-rose-500',
      pill: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-100',
    },
  }[accent]
}

export function ProjectDetailPage({
  projectId,
  viewerRole,
  backTo,
  backLabel,
}: {
  projectId: string
  viewerRole: ViewerRole
  backTo: string
  backLabel: string
}) {
  useDbVersion()
  const p = db.getProject(projectId)
  const oppRef = p ? db.getOpportunity(p.opportunityId)?.referenceCode : undefined
  const [remark, setRemark] = useState('')
  const [resolutionNote, setResolutionNote] = useState('')
  const [commissioningNote, setCommissioningNote] = useState('')
  const [officerCommIssueNote, setOfficerCommIssueNote] = useState('')
  const [ippAllotmentRemark, setIppAllotmentRemark] = useState('')
  const [approverChecks, setApproverChecks] = useState({
    validated: false,
    risk: false,
    sla: false,
  })
  const [milestoneDraft, setMilestoneDraft] = useState<{ name: string; dueDate: string }>({
    name: '',
    dueDate: '',
  })

  const hash = useRouterState({ select: (s) => s.location.hash })
  const [milestonesJumpHighlight, setMilestonesJumpHighlight] = useState(false)

  useLayoutEffect(() => {
    if (!p || viewerRole !== 'officer') return
    const anchor = (hash ?? '').replace(/^#/, '')
    if (anchor !== 'officer-actions') return
    const t = window.setTimeout(() => {
      document.getElementById('officer-actions')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(t)
  }, [hash, viewerRole, p?.id, p?.status])

  useLayoutEffect(() => {
    if (!p) return
    const anchor = (hash ?? '').replace(/^#/, '')
    if (anchor !== 'milestones') return
    const t = window.setTimeout(() => {
      document.getElementById('milestones')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMilestonesJumpHighlight(true)
      window.setTimeout(() => setMilestonesJumpHighlight(false), 1600)
    }, 80)
    return () => window.clearTimeout(t)
  }, [hash, p?.id, p?.status])

  if (!p) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Project not found.
      </div>
    )
  }

  const awaitingApproverFinal =
    (p.status === 'Under Review' || p.status === 'Approved') &&
    p.workflow.some((w) => w.role === 'approver' && w.status === 'current')

  // Approver flow stage helpers
  const approverStage: 'review' | 'allotment' | 'awaitingIpp' | 'milestones' | 'done' =
    !p.approverApprovedAt
      ? 'review'
      : !p.accessAllotmentSentAt
      ? 'allotment'
      : !p.ippAccessAcceptedAt
      ? 'awaitingIpp'
      : !p.approverMilestonesSubmittedAt
      ? 'milestones'
      : 'done'

  const save = (next: Project) => {
    db.saveProject(next)
    toast.success('Updated')
  }

  const persistProject = (next: Project, quiet?: boolean) => {
    const prev = db.getProject(next.id)
    db.saveProject(next)
    if (quiet) return
    if (prev?.status === 'In Execution' && next.status === 'Completed') {
      toast.success('All milestones approved — project completed')
    } else {
      toast.success('Updated')
    }
  }

  const officerRecordFinalClosure = () => {
    const ts = new Date().toISOString()
    save({
      ...p,
      officerClosureAt: ts,
      stage: 'Project closed (officer)',
      lastUpdated: ts,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Officer',
          role: 'officer',
          action: 'Recorded final verification — project marked closed',
          timestamp: ts,
        },
      ],
    })
  }

  // ── Commissioning workflow actions ──────────────────────────────────────────

  const ippSubmitForCommissioning = () => {
    const ts = new Date().toISOString()
    const wf = [
      ...p.workflow,
      {
        name: 'Commissioning Review',
        role: 'officer' as const,
        status: 'current' as const,
        assignee: p.assignedOfficer ?? 'Officer',
      },
    ]
    save({
      ...p,
      status: 'Commissioning Submitted',
      stage: 'Commissioning Submitted — awaiting officer final check',
      commissioningSubmittedAt: ts,
      commissioningNote: commissioningNote.trim() || undefined,
      lastUpdated: ts,
      workflow: wf,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: p.ippName,
          role: 'ipp',
          action: 'Submitted for final commissioning review',
          timestamp: ts,
        },
      ],
    })
    setCommissioningNote('')
    toast.success('Submitted for commissioning — awaiting officer final check')
  }

  const officerCommission = () => {
    const ts = new Date().toISOString()
    const wf = p.workflow.map((w) =>
      w.name === 'Commissioning Review' && w.status === 'current'
        ? { ...w, status: 'completed' as const, completedAt: ts }
        : w,
    )
    save({
      ...p,
      status: 'Commissioned',
      stage: 'Commissioned',
      commissionedAt: ts,
      lastUpdated: ts,
      workflow: wf,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Officer',
          role: 'officer',
          action: 'Final verification passed — project Commissioned 🎉',
          timestamp: ts,
        },
      ],
    })
    toast.success('Project commissioned! 🎉')
  }

  const officerRaiseCommissioningIssue = () => {
    const note = officerCommIssueNote.trim()
    if (!note) return toast.error('Describe the issue before raising it')
    const ts = new Date().toISOString()
    save({
      ...p,
      status: 'Ready for Commissioning',
      stage: 'Commissioning issue raised — IPP to fix and resubmit',
      commissioningIssueNote: note,
      lastUpdated: ts,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Officer',
          role: 'officer',
          action: `Commissioning issue raised: ${note}`,
          timestamp: ts,
        },
      ],
    })
    setOfficerCommIssueNote('')
    toast.warning('Issue raised — IPP must fix and resubmit for commissioning')
  }


  const officerStartReview = () => {
    save({
      ...p,
      status: 'Under Review',
      stage: 'Officer review',
      lastUpdated: new Date().toISOString(),
      assignedOfficer: p.assignedOfficer ?? 'Officer',
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Officer',
          role: 'officer',
          action: 'Started review',
          timestamp: new Date().toISOString(),
        },
      ],
    })
  }

  const officerRaiseQuery = () => {
    if (!remark.trim()) return toast.error('Enter a query message')
    const ts = new Date().toISOString()
    const q = {
      id: uidLib(),
      message: remark,
      raisedBy: 'Officer',
      raisedAt: ts,
      status: 'Open' as const,
    }
    save({
      ...p,
      status: 'Query Raised',
      stage: 'Awaiting IPP response',
      queries: [...p.queries, q],
      lastUpdated: ts,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Officer',
          role: 'officer',
          action: 'Raised query',
          timestamp: ts,
        },
      ],
    })
    setRemark('')
  }

  const officerVerifyDocument = (docId: string) => {
    save({
      ...p,
      documents: p.documents.map((d) =>
        d.id === docId && d.status === 'Uploaded' ? { ...d, status: 'Verified' as const } : d,
      ),
      lastUpdated: new Date().toISOString(),
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Officer',
          role: 'officer',
          action: 'Verified document',
          timestamp: new Date().toISOString(),
        },
      ],
    })
  }

  const officerRejectDocument = (docId: string) => {
    save({
      ...p,
      documents: p.documents.map((d) =>
        d.id === docId && (d.status === 'Uploaded' || d.status === 'Verified')
          ? { ...d, status: 'Rejected' as const, remark: 'Rejected by officer — replacement required' }
          : d,
      ),
      lastUpdated: new Date().toISOString(),
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Officer',
          role: 'officer',
          action: 'Rejected a document',
          timestamp: new Date().toISOString(),
        },
      ],
    })
  }

  const documentsReadyForOfficerApproval = () => {
    if (p.documents.some((d) => d.status === 'Missing')) return false
    if (p.documents.some((d) => d.status === 'Uploaded')) return false
    if (p.documents.some((d) => d.status === 'Rejected')) return false
    return p.documents.length === 0 || p.documents.every((d) => d.status === 'Verified')
  }

  const officerForwardToApprover = () => {
    if (!documentsReadyForOfficerApproval()) {
      if (p.documents.some((d) => d.status === 'Missing'))
        return toast.error('Documents are still missing — raise a query or wait for IPP')
      if (p.documents.some((d) => d.status === 'Uploaded'))
        return toast.error('Mark each uploaded file as Verified (or reject the document) before forwarding')
      if (p.documents.some((d) => d.status === 'Rejected'))
        return toast.error('Rejected documents on file — raise a query or reject the application')
    }
    const hasApproverStep = p.workflow.some((w) => w.role === 'approver')
    if (!hasApproverStep) {
      return toast.error('This application has no approver stage in workflow')
    }
    const ts = new Date().toISOString()
    const wf = p.workflow
      .filter((w) => w.name !== 'Execution')
      .map((w) => {
        if (w.role === 'officer' && w.status === 'current') {
          return {
            ...w,
            status: 'completed' as const,
            completedAt: ts,
            assignee: w.assignee ?? 'Officer',
          }
        }
        if (w.role === 'approver' && w.status === 'pending') {
          return { ...w, status: 'current' as const, assignee: w.assignee }
        }
        return w
      })
    save({
      ...p,
      status: 'Under Review',
      stage: 'Pending final approval (approver)',
      lastUpdated: ts,
      workflow: wf,
      remarks: remark.trim() || p.remarks,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Officer',
          role: 'officer',
          action: 'Forwarded application for final approval (approver)',
          timestamp: ts,
        },
      ],
    })
    setRemark('')
  }

  const officerRejectApplication = () => {
    if (!remark.trim()) return toast.error('Enter rejection remarks')
    const ts = new Date().toISOString()
    save({
      ...p,
      status: 'Rejected',
      stage: 'Rejected',
      lastUpdated: ts,
      remarks: remark,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Officer',
          role: 'officer',
          action: 'Rejected application',
          timestamp: ts,
        },
      ],
    })
    setRemark('')
  }

  const ippUploadMissingDemo = (docId: string) => {
    save({
      ...p,
      documents: p.documents.map((d) =>
        d.id === docId ? { ...d, status: 'Uploaded' as const, uploadedAt: new Date().toISOString() } : d,
      ),
      lastUpdated: new Date().toISOString(),
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: p.ippName,
          role: 'ipp',
          action: 'Uploaded revised document',
          timestamp: new Date().toISOString(),
        },
      ],
    })
  }

  const ippResolveAndResubmit = () => {
    const open = p.queries.filter((q) => q.status === 'Open')
    if (!open.length) return toast.error('No open query to resolve')
    const ts = new Date().toISOString()
    const updatedQueries = p.queries.map((q) =>
      q.status === 'Open'
        ? {
            ...q,
            status: 'Closed' as const,
            response:
              resolutionNote.trim() ||
              'Uploaded missing documents and corrected application details as requested.',
            respondedAt: ts,
          }
        : q,
    )
    const updatedDocs = p.documents.map((d) =>
      d.status === 'Missing' || d.status === 'Rejected'
        ? { ...d, status: 'Uploaded' as const, uploadedAt: ts }
        : d,
    )
    save({
      ...p,
      status: 'Under Review',
      stage: 'Officer review (response received)',
      queries: updatedQueries,
      documents: updatedDocs,
      lastUpdated: ts,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: p.ippName,
          role: 'ipp',
          action: 'Resolved query and resubmitted application',
          timestamp: ts,
        },
      ],
    })
    setResolutionNote('')
    toast.success('Application resubmitted to the officer')
  }

  const officerDocsAllVerified = () =>
    p.documents.length > 0 && p.documents.every((d) => d.status === 'Verified')

  const approverDecision = (status: 'Approved' | 'Rejected') => {
    const ts = new Date().toISOString()
    if (status === 'Rejected') {
      const wf = p.workflow.map((w) =>
        w.role === 'approver' && w.status === 'current'
          ? { ...w, status: 'completed' as const, completedAt: ts, assignee: w.assignee }
          : w,
      )
      save({
        ...p,
        status: 'Rejected',
        stage: 'Rejected',
        lastUpdated: ts,
        workflow: wf,
        remarks: remark.trim() || p.remarks,
        activity: [
          ...p.activity,
          {
            id: uidLib(),
            user: 'Approver',
            role: 'approver',
            action: 'Rejected application (final)',
            timestamp: ts,
          },
        ],
      })
      setRemark('')
      setApproverChecks({ validated: false, risk: false, sla: false })
      return
    }

    if (!approverChecks.validated || !approverChecks.risk || !approverChecks.sla) {
      return toast.error('Complete the quick review checklist before final approval')
    }

    if (!remark.trim()) {
      return toast.error('Add an approval description before approving')
    }

    save({
      ...p,
      status: 'Approved',
      stage: 'Approved — awaiting access allotment',
      lastUpdated: ts,
      approverApprovedAt: ts,
      approverApprovalDescription: remark.trim(),
      remarks: remark.trim() || p.remarks,
      milestones: [],
      approverMilestonesSubmittedAt: undefined,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Approver',
          role: 'approver',
          action: 'Recorded preliminary approval — pending access allotment',
          timestamp: ts,
        },
      ],
    })
    setRemark('')
    setApproverChecks({ validated: false, risk: false, sla: false })
  }

  // ── Step B: Approver sends Access Allotment to IPP ─────────────────
  const approverSendAccessAllotment = () => {
    if (!p.approverApprovedAt) return toast.error('Approve the application first')
    const ts = new Date().toISOString()
    save({
      ...p,
      stage: 'Access allotment sent — awaiting IPP acceptance',
      lastUpdated: ts,
      accessAllotmentSentAt: ts,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Approver',
          role: 'approver',
          action: 'Sent access allotment to IPP',
          timestamp: ts,
        },
      ],
    })
    db.pushNotification({
      userId: p.ippId,
      title: 'Access allotment received',
      message: `Approver has issued access allotment for ${p.name}. Open the project to accept.`,
      type: 'info',
      link: `/ipp/projects/${p.id}`,
    })
  }

  // ── Step C: IPP accepts Access Allotment ───────────────────────────
  const ippAcceptAccessAllotment = () => {
    if (!p.accessAllotmentSentAt) return toast.error('Allotment not yet sent')
    const note = ippAllotmentRemark.trim()
    const ts = new Date().toISOString()
    save({
      ...p,
      stage: 'IPP accepted — awaiting milestone setup',
      lastUpdated: ts,
      ippAccessAcceptedAt: ts,
      remarks: note ? [p.remarks, `IPP allotment response: ${note}`].filter(Boolean).join('\n') : p.remarks,
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: p.ippName,
          role: 'ipp',
          action: note ? `Accepted access allotment (${note})` : 'Accepted access allotment',
          timestamp: ts,
        },
      ],
    })
    setIppAllotmentRemark('')
    const approverUser = db.listUsers().find((u) => u.role === 'approver')
    if (approverUser) {
      db.pushNotification({
        userId: approverUser.id,
        title: 'Milestone setup task ready',
        message: `${p.ippName} accepted access allotment for ${p.name}. You can now create and submit milestones.`,
        type: 'info',
        link: `/approver/projects/${p.id}`,
      })
    }
  }

  const ippRejectAccessAllotment = () => {
    if (!p.accessAllotmentSentAt) return toast.error('Allotment not yet sent')
    const note = ippAllotmentRemark.trim()
    if (!note) return toast.error('Add remark before rejecting allotment')
    const ts = new Date().toISOString()
    save({
      ...p,
      stage: 'Access allotment rejected by IPP',
      accessAllotmentSentAt: undefined,
      ippAccessAcceptedAt: undefined,
      lastUpdated: ts,
      remarks: [p.remarks, `IPP rejected allotment: ${note}`].filter(Boolean).join('\n'),
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: p.ippName,
          role: 'ipp',
          action: `Rejected access allotment (${note})`,
          timestamp: ts,
        },
      ],
    })
    setIppAllotmentRemark('')
    const approverUser = db.listUsers().find((u) => u.role === 'approver')
    if (approverUser) {
      db.pushNotification({
        userId: approverUser.id,
        title: 'IPP rejected access allotment',
        message: `${p.ippName} rejected access allotment for ${p.name}.`,
        type: 'warning',
        link: `/approver/projects/${p.id}`,
      })
    }
  }

  // ── Step D: Approver edits and submits execution milestones ────────
  const approverAddMilestone = (name: string, dueDate: string) => {
    if (!p.ippAccessAcceptedAt) return toast.error('IPP must accept access allotment first')
    const trimmed = name.trim()
    if (!trimmed) return toast.error('Enter a milestone name')
    if (!dueDate) return toast.error('Pick a due date')
    const id = uidLib()
    const next: Project = {
      ...p,
      milestones: [
        ...p.milestones,
        {
          id,
          name: trimmed,
          sequence: p.milestones.length + 1,
          dueDate: new Date(`${dueDate}T00:00:00`).toISOString(),
          progress: 0,
          status: 'Not Started',
          proofs: [
            { id: `${id}_p1`, label: 'Site photos / evidence', status: 'Missing' },
            { id: `${id}_p2`, label: 'Installation proof', status: 'Missing' },
            { id: `${id}_p3`, label: 'Reports / certificates', status: 'Missing' },
          ],
        },
      ],
    }
    save(next)
  }

  const approverRemoveMilestone = (id: string) => {
    save({
      ...p,
      milestones: p.milestones
        .filter((m) => m.id !== id)
        .map((m, i) => ({ ...m, sequence: i + 1 })),
    })
  }

  const approverSeedDefaultMilestones = () => {
    if (!p.ippAccessAcceptedAt) return toast.error('IPP must accept access allotment first')
    if (p.milestones.length > 0) return toast.error('Milestone list already populated')
    save({ ...p, milestones: createDefaultExecutionMilestones() })
  }

  const approverSubmitMilestones = () => {
    if (!p.ippAccessAcceptedAt) return toast.error('IPP must accept access allotment first')
    if (p.milestones.length === 0) return toast.error('Add at least one milestone before submitting')
    const ts = new Date().toISOString()
    save({
      ...p,
      status: 'In Execution',
      stage: 'Execution',
      lastUpdated: ts,
      approverMilestonesSubmittedAt: ts,
      fullMilestonesSubmittedAt: undefined,
      fullMilestonesApprovedAt: undefined,
      workflow: buildWorkflowAfterFinalApproval(p, ts),
      activity: [
        ...p.activity,
        {
          id: uidLib(),
          user: 'Approver',
          role: 'approver',
          action: 'Submitted execution milestones — IPP execution started',
          timestamp: ts,
        },
      ],
    })
    db.pushNotification({
      userId: p.ippId,
      title: 'Execution milestones issued',
      message: `Approver has submitted execution milestones for ${p.name}.`,
      type: 'success',
      link: `/ipp/projects/${p.id}`,
    })
  }

  const slaDaysLeft = calendarDaysUntilEndOfDay(p.slaDueDate)
  const TechIcon = p.type === 'Wind' ? Wind : p.type === 'Hybrid' ? Layers : Sun
  const milestoneTotal = p.milestones.length
  const milestoneDone = p.milestones.filter((m) => m.status === 'Completed' || m.status === 'Verified').length
  const milestoneSubmitted = p.milestones.filter((m) => m.status === 'Submitted').length
  const milestoneAvgProgress = milestoneTotal
    ? Math.round(
        p.milestones.reduce((sum, m) => sum + milestoneProgressPercentFromProofs(m), 0) / milestoneTotal,
      )
    : 0

  return (
    <div className="space-y-6">
      <Link to={backTo} className="text-sm text-muted-foreground hover:text-foreground">
        ← {backLabel}
      </Link>

      {viewerRole === 'management' ? (
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/[0.08] px-4 py-3 text-sm text-sky-950 dark:bg-sky-950/40 dark:text-sky-50">
          <p className="font-semibold text-foreground">Read-only programme view</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Workflow, documents, milestones, queries, and the full activity timeline — no actions available from this
            role.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={p.status} />
            <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/12 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
              {p.type}
            </span>
            <SLABadge status={p.slaStatus} />
            {p.submittedAt ? (
              <span className="text-xs text-muted-foreground">Submitted {relativeTime(p.submittedAt)}</span>
            ) : null}
          </div>
          <div>
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {p.name}
            </h1>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
              <span>{p.opportunityName}</span>
              {oppRef ? (
                <span className="font-mono text-xs tabular-nums">
                  <span className="text-border">·</span>{' '}
                  <span className="text-muted-foreground">Reference </span>
                  <span className="font-semibold text-foreground">{oppRef}</span>
                </span>
              ) : null}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ProjectMetricCard
              label="Capacity"
              value={`${p.capacityMW} MW`}
              icon={Zap}
              accent="emerald"
            />
            <ProjectMetricCard
              label="Location"
              value={`${p.district}, ${p.state}`}
              icon={MapPin}
              accent="sky"
            />
            <ProjectMetricCard label="Technology" value={p.type} icon={TechIcon} accent="violet" />
            <ProjectMetricCard
              label="SLA due"
              value={formatDate(p.slaDueDate)}
              icon={CalendarClock}
              accent="amber"
            />
          </div>
        </div>

        <aside className="w-full shrink-0 lg:w-80">
          <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CalendarClock className="size-5 shrink-0" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em]">SLA target</span>
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">Due date</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-foreground">{formatDate(p.slaDueDate)}</p>
            {!Number.isNaN(slaDaysLeft) ? (
              <span
                className={cn(
                  'mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold',
                  slaDaysLeft >= 0
                    ? 'border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-700 dark:bg-sky-950/70 dark:text-sky-100'
                    : 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100',
                )}
              >
                {slaDaysLeft >= 0
                  ? `${slaDaysLeft} day${slaDaysLeft === 1 ? '' : 's'} left`
                  : `${Math.abs(slaDaysLeft)} day${Math.abs(slaDaysLeft) === 1 ? '' : 's'} overdue`}
              </span>
            ) : null}
            <p className="mt-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              Last activity refresh · {relativeTime(p.lastUpdated)}
            </p>
          </div>
        </aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-border/80 border-t-[3px] border-t-sky-500 bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="border-b border-border/60 bg-muted/35 px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-lg border border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                <GitBranch className="size-4" aria-hidden />
              </span>
              Workflow
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Desk sequence — completed steps lock in; the highlighted stage is active now.
            </p>
          </div>
          <div className="p-5">
            <ol className="space-y-0">
              {p.workflow.map((w, i) => (
                <WorkflowTimelineRow
                  key={w.name}
                  step={w}
                  isLast={i === p.workflow.length - 1}
                />
              ))}
            </ol>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/80 border-t-[3px] border-t-violet-500 bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="border-b border-border/60 bg-muted/35 px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300">
                <FileText className="size-4" aria-hidden />
              </span>
              Documents
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {p.documents.length === 1
                ? '1 file in the application packet'
                : `${p.documents.length} files in the application packet`}
            </p>
          </div>
          <ul className="divide-y divide-border/50">
            {p.documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-muted/25 sm:px-5"
              >
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-inner',
                    documentIconTileClass(d.status),
                  )}
                >
                  <FileText className="size-[18px]" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                </div>
                <DocBadge status={d.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {viewerRole === 'management' && p.queries.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-border/80 border-t-[3px] border-t-amber-500 bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="border-b border-border/60 bg-muted/35 px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="size-4" aria-hidden />
              </span>
              Queries & responses
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Officer–IPP query thread preserved on record.
            </p>
          </div>
          <ul className="divide-y divide-border/50 px-5 py-2 text-sm">
            {p.queries.map((q) => (
              <li key={q.id} className="space-y-2 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    From {q.raisedBy}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {q.status === 'Open' ? 'Open' : 'Closed'} · {relativeTime(q.raisedAt)}
                  </span>
                </div>
                <p className="font-medium text-foreground">{q.message}</p>
                {q.response ? (
                  <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2 text-xs">
                    <p className="font-semibold text-muted-foreground">IPP response</p>
                    <p className="mt-1 text-foreground">{q.response}</p>
                    {q.respondedAt ? (
                      <p className="mt-1 text-[10px] text-muted-foreground">{relativeTime(q.respondedAt)}</p>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {p.approverMilestonesSubmittedAt && p.milestones.length > 0 ? (
        <section
          id="milestones"
          className={cn(
            "overflow-hidden rounded-3xl border border-border/80 border-t-[3px] border-t-emerald-500 bg-card shadow-sm ring-1 ring-black/[0.04] transition-shadow duration-500 dark:ring-white/[0.06]",
            milestonesJumpHighlight ? "shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_35%,transparent)]" : "",
          )}
        >
          <div className="relative border-b border-border/60 bg-gradient-to-br from-emerald-500/[0.10] via-card to-primary/[0.06] px-5 py-6 sm:px-6">
            <div
              className="pointer-events-none absolute -right-14 -top-16 size-52 rounded-full bg-emerald-500/20 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-20 -left-12 size-44 rounded-full bg-primary/15 blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-wrap items-start justify-between gap-5">
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md ring-1 ring-emerald-500/30">
                    <ListChecks className="size-5" aria-hidden />
                  </span>
                  <span className="bg-gradient-to-r from-foreground via-emerald-700 to-primary bg-clip-text text-transparent dark:via-emerald-400">
                    Milestone command center
                  </span>
                </h2>
                <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                  Plan, update, and submit delivery proofs from one workspace. Officers review this same checklist and push
                  feedback directly on each milestone.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="group/stat rounded-2xl border border-emerald-500/35 bg-gradient-to-br from-emerald-500/[0.10] to-emerald-500/[0.04] px-3.5 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Milestones</p>
                      <span className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 transition-transform group-hover/stat:scale-110 dark:text-emerald-400">
                        <ListChecks className="size-3.5" aria-hidden />
                      </span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold tabular-nums text-foreground">
                      {milestoneDone} <span className="text-sm text-muted-foreground">/ {milestoneTotal}</span>
                    </p>
                  </div>
                  <div className="group/stat rounded-2xl border border-sky-500/35 bg-gradient-to-br from-sky-500/[0.10] to-sky-500/[0.04] px-3.5 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">In review</p>
                      <span className="flex size-6 items-center justify-center rounded-lg bg-sky-500/15 text-sky-700 transition-transform group-hover/stat:scale-110 dark:text-sky-400">
                        <Clock className="size-3.5" aria-hidden />
                      </span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold tabular-nums text-foreground">{milestoneSubmitted}</p>
                  </div>
                  <div className="group/stat rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/[0.10] to-primary/[0.04] px-3.5 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Avg progress</p>
                      <span className="flex size-6 items-center justify-center rounded-lg bg-primary/15 text-primary transition-transform group-hover/stat:scale-110">
                        <TrendingUp className="size-3.5" aria-hidden />
                      </span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold tabular-nums text-foreground">{milestoneAvgProgress}%</p>
                  </div>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[10.5px] font-semibold text-muted-foreground backdrop-blur">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  Submit each milestone after all proofs are uploaded.
                </div>
              </div>

              {/* Big animated progress ring */}
              <div className="relative flex shrink-0 items-center justify-center self-center">
                <svg width={108} height={108} viewBox="0 0 108 108" className="-rotate-90">
                  <circle cx={54} cy={54} r={48} fill="none" stroke="color-mix(in srgb, currentColor 14%, transparent)" strokeWidth={9} className="text-muted-foreground" />
                  <circle
                    cx={54}
                    cy={54}
                    r={48}
                    fill="none"
                    stroke={milestoneAvgProgress >= 100 ? 'rgb(16 185 129)' : 'var(--primary)'}
                    strokeWidth={9}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 - (Math.max(0, Math.min(100, milestoneAvgProgress)) / 100) * (2 * Math.PI * 48)}
                    style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{milestoneAvgProgress}%</span>
                  <span className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">Average</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-b border-border/50 bg-muted/20 px-5 py-2.5 sm:px-6">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Tip:</span> Use status + proof checklist in each card, then
              submit for officer verification.
            </p>
          </div>
          {(p.status === 'In Execution' || p.status === 'Ready for Commissioning' || p.status === 'Commissioning Submitted' || p.status === 'Commissioned') && (viewerRole === 'ipp' || viewerRole === 'officer') ? (
            <div className="p-5 sm:p-6">
              <ExecutionMilestonesBlock project={p} viewerRole={viewerRole} persist={persistProject} />
            </div>
          ) : (
            <ul className="divide-y divide-border/60 px-5 py-4 text-sm sm:px-6">
              {p.milestones.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span className="font-medium">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <MilestoneBadge status={m.status} />
                    <span className="text-xs text-muted-foreground">Due {formatDate(m.dueDate)}</span>
                    <span className="text-xs text-muted-foreground">
                      {milestoneProgressPercentFromProofs(m)}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {/* ── Officer: Commissioning Submitted — final check ─────────── */}
      {viewerRole === 'officer' && p.status === 'Commissioning Submitted' && (
        <section
          id="officer-commissioning"
          className="scroll-mt-24 rounded-xl border border-chart-4/30 bg-card p-5 space-y-5"
        >
          <div>
            <h2 className="font-semibold text-base">🔍 Final Commissioning Check</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              The IPP has submitted for final commissioning. Verify that all milestones are complete, final documents
              are in order, and the project is actually ready to commission.
            </p>
          </div>

          {/* IPP note */}
          {p.commissioningNote && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">IPP note</p>
              <p className="mt-1">{p.commissioningNote}</p>
            </div>
          )}

          {/* Checklist */}
          <div className="rounded-lg border bg-muted/25 p-4 space-y-3">
            <h3 className="text-sm font-semibold">Verify before commissioning</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-chart-4">✔</span>
                <span>All execution milestones are in <strong>Completed</strong> or <strong>Verified</strong> status</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-chart-4">✔</span>
                <span>Final documents have been uploaded by the IPP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-chart-4">✔</span>
                <span>Physical site inspection / confirmation complete (if applicable)</span>
              </li>
            </ul>
          </div>

          {/* Commission button */}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={officerCommission}>
              ✅ Commission Project
            </Button>
          </div>

          {/* Raise issue */}
          <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <h3 className="text-sm font-semibold text-destructive">Raise an issue instead</h3>
            <p className="text-xs text-muted-foreground">
              If the project is not ready, raise an issue. The IPP will be sent back to fix and resubmit.
            </p>
            <textarea
              value={officerCommIssueNote}
              onChange={(e) => setOfficerCommIssueNote(e.target.value)}
              rows={3}
              placeholder="Describe what needs to be corrected or completed before commissioning can be approved"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <Button type="button" variant="destructive" onClick={officerRaiseCommissioningIssue}>
              Raise Issue
            </Button>
          </div>
        </section>
      )}

      {/* ── Officer: Commissioned state ─────────────────────────────── */}
      {viewerRole === 'officer' && p.status === 'Commissioned' && (
        <section className="rounded-xl border border-chart-4/30 bg-gradient-to-br from-chart-4/10 to-card p-5 text-sm shadow space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <h2 className="font-semibold text-base">Project Commissioned</h2>
          </div>
          <p className="text-muted-foreground text-xs">
            You have recorded final commissioning. This project is officially closed.
          </p>
          {p.commissionedAt && (
            <p className="text-[11px] text-muted-foreground">Commissioned on {formatDate(p.commissionedAt)}</p>
          )}
        </section>
      )}

      {viewerRole === 'officer' && awaitingApproverFinal && (
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm">
          <h2 className="font-semibold text-foreground">Awaiting senior approver</h2>
          <p className="mt-1 text-muted-foreground">
            You have forwarded this application for final approval. The approver will grant execution or reject; no
            further officer action is required here until the decision is recorded.
          </p>
        </section>
      )}

      {viewerRole === 'officer' &&
        (p.status === 'Submitted' ||
          p.status === 'Query Raised' ||
          (p.status === 'Under Review' && !awaitingApproverFinal)) && (
          <section
            id="officer-actions"
            className="scroll-mt-24 rounded-xl border bg-card p-5 space-y-5"
          >
            <h2 className="font-semibold">Officer actions</h2>
            {p.status === 'Submitted' ? (
              <Button type="button" onClick={officerStartReview}>
                Start review
              </Button>
            ) : null}

            {p.status === 'Under Review' ? (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <h3 className="text-sm font-medium">Document verification</h3>
                <p className="text-xs text-muted-foreground">
                  After IPP resubmits, confirm each file is acceptable. Use Verified when correct; reject a file if it
                  must be replaced. Forward to the approver only when every file is Verified and none are missing.
                </p>
                <ul className="divide-y rounded-md border bg-card text-sm">
                  {p.documents.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5">
                      <span className="min-w-0 flex-1 font-medium">{d.name}</span>
                      <DocBadge status={d.status} />
                      <div className="flex flex-wrap gap-1.5">
                        {d.status === 'Uploaded' ? (
                          <>
                            <Button type="button" size="sm" variant="default" onClick={() => officerVerifyDocument(d.id)}>
                              Mark verified
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => officerRejectDocument(d.id)}
                            >
                              Reject file
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    variant="default"
                    onClick={officerForwardToApprover}
                    disabled={!documentsReadyForOfficerApproval()}
                  >
                    Forward to approver (final approval)
                  </Button>
                  <Button type="button" variant="destructive" onClick={officerRejectApplication}>
                    Reject application
                  </Button>
                </div>
                {!documentsReadyForOfficerApproval() ? (
                  <p className="text-[11px] text-chart-3">
                    Forward stays disabled until there are no Missing or Uploaded files, and no Rejected files. Use Mark
                    verified after each upload is correct, or Reject file / raise a query if not.
                  </p>
                ) : null}
                <p className="text-[11px] text-muted-foreground">
                  Forwarding sends the packet to the senior approver after your document checks. Reject application
                  requires remarks below. You can raise a query at any time instead.
                </p>
              </div>
            ) : null}

            <div>
              <label className="text-sm font-medium">Query or rejection remarks</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                rows={3}
                placeholder={
                  p.status === 'Query Raised'
                    ? 'Describe missing items or mismatches for the IPP'
                    : 'Optional note when forwarding; required for application rejection'
                }
              />
              <Button type="button" className="mt-2" variant="secondary" onClick={officerRaiseQuery}>
                Raise query
              </Button>
            </div>
          </section>
        )}

      {viewerRole === 'officer' && p.status === 'Rejected' && (
        <section
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm"
          aria-label="Application rejected"
        >
          <h2 className="font-semibold text-foreground">Application rejected</h2>
          <p className="mt-2 text-muted-foreground">
            This application was rejected (by officer or approver). Outcomes are shown on this project page and in
            queues — there is no separate rejection screen.
          </p>
          {p.remarks ? (
            <p className="mt-2 rounded-md border bg-card p-2 text-xs text-foreground">
              <span className="font-medium">Remarks: </span>
              {p.remarks}
            </p>
          ) : null}
        </section>
      )}

      {viewerRole === 'officer' && p.status === 'Completed' && (
        <section className="rounded-xl border bg-card p-5 text-sm">
          <h2 className="font-semibold text-base">Final verification and closure</h2>
          {p.officerClosureAt ? (
            <p className="mt-2 text-muted-foreground">
              Project marked closed on <span className="font-medium text-foreground">{formatDate(p.officerClosureAt)}</span>.
              Records remain available in the queue and management dashboards.
            </p>
          ) : (
            <>
              <p className="mt-2 text-muted-foreground">
                All milestones are verified and the project is <strong className="text-foreground">Completed</strong>.
                Record final verification to close the file on your side.
              </p>
              <Button type="button" className="mt-4" onClick={officerRecordFinalClosure}>
                Mark project closed
              </Button>
            </>
          )}
        </section>
      )}

      {viewerRole === 'approver' && p.workflow.some((w) => w.role === 'approver' && w.status === 'current') && (
        <section className="rounded-xl border border-primary/20 bg-card p-5 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-lg">Final approval evaluation</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Approver flow: record approval description → send access allotment to IPP → wait for IPP acceptance →
                set up execution milestones → submit.
              </p>
            </div>
            <ApproverStageBadge stage={approverStage} />
          </div>

          {/* Always-visible packet recap */}
          <div className="rounded-lg border bg-muted/25 p-4">
            <h3 className="text-sm font-semibold text-foreground">Application packet</h3>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">IPP</dt>
                <dd className="font-medium">{p.ippName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Technology / capacity</dt>
                <dd className="font-medium">
                  {p.type} · {p.capacityMW} MW
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Location</dt>
                <dd className="font-medium">
                  {p.state}, {p.district}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">SLA</dt>
                <dd className="flex items-center gap-2 font-medium">
                  <SLABadge status={p.slaStatus} />
                  <span className="text-muted-foreground">Due {formatDate(p.slaDueDate)}</span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Officer document validation</dt>
                <dd className="mt-0.5 text-foreground">
                  {officerDocsAllVerified()
                    ? 'All listed documents are marked Verified — officer validation complete.'
                    : 'Review document statuses in the list above; not all files are Verified.'}
                </dd>
              </div>
            </dl>
          </div>

          {/* ── Stage 1: Review + Approve ────────────────────────── */}
          {approverStage === 'review' && (
            <>
              <div className="rounded-lg border bg-muted/25 p-4">
                <h3 className="text-sm font-semibold text-foreground">Quick review checklist</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Confirm each item before approval (required to unlock the Approve button).
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <input
                      id="ap-chk-val"
                      type="checkbox"
                      checked={approverChecks.validated}
                      onChange={(e) => setApproverChecks((c) => ({ ...c, validated: e.target.checked }))}
                      className="size-4 rounded border"
                    />
                    <label htmlFor="ap-chk-val">Officer validation and documents are acceptable</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input
                      id="ap-chk-risk"
                      type="checkbox"
                      checked={approverChecks.risk}
                      onChange={(e) => setApproverChecks((c) => ({ ...c, risk: e.target.checked }))}
                      className="size-4 rounded border"
                    />
                    <label htmlFor="ap-chk-risk">No material policy or delivery risk identified</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input
                      id="ap-chk-sla"
                      type="checkbox"
                      checked={approverChecks.sla}
                      onChange={(e) => setApproverChecks((c) => ({ ...c, sla: e.target.checked }))}
                      className="size-4 rounded border"
                    />
                    <label htmlFor="ap-chk-sla">SLA posture is understood and acceptable</label>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-muted/25 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Approval description</h3>
                <label className="text-sm font-medium" htmlFor="approver-remarks">
                  Why are you approving (or rejecting)?
                </label>
                <textarea
                  id="approver-remarks"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Capture the rationale, conditions, risk notes, or rejection reasons"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  rows={3}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => approverDecision('Approved')}
                    disabled={
                      !approverChecks.validated ||
                      !approverChecks.risk ||
                      !approverChecks.sla ||
                      !remark.trim()
                    }
                  >
                    Approve
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => approverDecision('Rejected')}>
                    Reject application
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Approving records the description below in the approval table. The IPP is not notified yet — use
                  Send Access Allotment afterwards.
                </p>
              </div>
            </>
          )}

          {/* ── Approval decisions table (visible from stage 2 onwards) ── */}
          {approverStage !== 'review' && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Approval decisions</h3>
                {p.approverApprovedAt ? (
                  <span className="text-[11px] text-muted-foreground">
                    Recorded {relativeTime(p.approverApprovedAt)}
                  </span>
                ) : null}
              </div>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="w-12 p-2.5 text-center">Sl. No</th>
                      <th className="p-2.5 text-left">Approval description</th>
                      <th className="w-44 p-2.5 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border/60">
                      <td className="p-2.5 text-center text-xs tabular-nums text-muted-foreground">1</td>
                      <td className="p-2.5">
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                          {p.approverApprovalDescription || '—'}
                        </p>
                      </td>
                      <td className="p-2.5">
                        <ApproverStageBadge stage={approverStage} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Stage 2: Send Access Allotment ─────────────────────── */}
          {approverStage === 'allotment' && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Send Access Allotment</h3>
              <p className="text-xs text-muted-foreground">
                Once you click Send Access Allotment, the IPP receives a notification and can accept the offer from
                their project workspace. Milestone setup unlocks only after the IPP accepts.
              </p>
              <div>
                <Button type="button" onClick={approverSendAccessAllotment}>
                  Send Access Allotment
                </Button>
              </div>
            </div>
          )}

          {/* ── Stage 3: Awaiting IPP acceptance ───────────────────── */}
          {approverStage === 'awaitingIpp' && (
            <div className="rounded-lg border border-chart-3/25 bg-chart-3/5 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Awaiting IPP acceptance</h3>
              <p className="text-xs text-muted-foreground">
                Access allotment was sent {p.accessAllotmentSentAt ? relativeTime(p.accessAllotmentSentAt) : ''}. The
                IPP must accept before you can submit execution milestones.
              </p>
            </div>
          )}

          {/* ── Stage 4: Milestone setup ───────────────────────────── */}
          {approverStage === 'milestones' && (
            <div className="rounded-lg border bg-muted/25 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Execution milestones</h3>
                {p.milestones.length === 0 ? (
                  <Button type="button" size="sm" variant="outline" onClick={approverSeedDefaultMilestones}>
                    Seed default milestones
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Add or remove milestones for the IPP's execution phase. Submitting issues these milestones to the IPP
                and starts execution.
              </p>

              {p.milestones.length === 0 ? (
                <p className="rounded-md border border-dashed bg-background/50 p-3 text-xs text-muted-foreground">
                  No milestones yet. Add a custom milestone below or seed the defaults.
                </p>
              ) : (
                <ul className="divide-y rounded-md border bg-card text-sm">
                  {p.milestones.map((m, i) => (
                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          <span className="mr-1 text-muted-foreground">{i + 1}.</span>
                          {m.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Due {formatDate(m.dueDate)}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => approverRemoveMilestone(m.id)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="rounded-md border bg-background p-3 space-y-3">
                <p className="text-xs font-semibold text-foreground">Add milestone</p>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                  <div>
                    <label className="text-[11px] text-muted-foreground" htmlFor="ms-name">
                      Milestone name
                    </label>
                    <input
                      id="ms-name"
                      type="text"
                      value={milestoneDraft.name}
                      onChange={(e) => setMilestoneDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="e.g. Site setup"
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground" htmlFor="ms-date">
                      Due date
                    </label>
                    <input
                      id="ms-date"
                      type="date"
                      value={milestoneDraft.dueDate}
                      onChange={(e) => setMilestoneDraft((d) => ({ ...d, dueDate: e.target.value }))}
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      approverAddMilestone(milestoneDraft.name, milestoneDraft.dueDate)
                      setMilestoneDraft({ name: '', dueDate: '' })
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  onClick={approverSubmitMilestones}
                  disabled={p.milestones.length === 0}
                >
                  Submit milestones to IPP
                </Button>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Submitting publishes milestones to IPP in the milestone workspace and moves the project to{' '}
                  <strong className="text-foreground">In Execution</strong>.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── IPP: Access allotment received — accept ──────────────────── */}
      {viewerRole === 'ipp' && p.accessAllotmentSentAt && !p.ippAccessAcceptedAt && (
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Access allotment received</h2>
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
              Action required
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            The approver has issued access allotment for this project. Review the approval description and respond with
            Accept or Reject, with your remark.
          </p>
          {p.approverApprovalDescription ? (
            <div className="rounded-md border bg-card p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Approval description
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{p.approverApprovalDescription}</p>
            </div>
          ) : null}
          <div className="space-y-2">
            <label htmlFor="ipp-allotment-remark" className="text-xs font-medium text-muted-foreground">
              IPP remark
            </label>
            <textarea
              id="ipp-allotment-remark"
              value={ippAllotmentRemark}
              onChange={(e) => setIppAllotmentRemark(e.target.value)}
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Write your acceptance/rejection remark"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={ippAcceptAccessAllotment}>
                Accept access allotment
              </Button>
              <Button type="button" variant="outline" onClick={ippRejectAccessAllotment}>
                Reject access allotment
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── IPP: Accepted, awaiting milestone setup ──────────────────── */}
      {viewerRole === 'ipp' &&
        p.ippAccessAcceptedAt &&
        !p.approverMilestonesSubmittedAt && (
          <section className="rounded-xl border border-chart-3/25 bg-chart-3/5 p-5 text-sm">
            <h2 className="font-semibold text-foreground">Access allotment accepted</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              You accepted on {formatDate(p.ippAccessAcceptedAt)}. The approver is preparing your execution
              milestones — they will appear here once submitted.
            </p>
          </section>
        )}

      {viewerRole === 'ipp' && p.status === 'Query Raised' && p.queries.some((q) => q.status === 'Open') && (
        <section className="rounded-xl border border-chart-3/30 bg-chart-3/5 p-5 space-y-4">
          <h2 className="font-semibold">Officer query</h2>
          <ul className="space-y-3 text-sm">
            {p.queries
              .filter((q) => q.status === 'Open')
              .map((q) => (
                <li key={q.id} className="rounded-lg border bg-card p-3">
                  <p className="text-muted-foreground text-xs">From {q.raisedBy}</p>
                  <p className="mt-1 font-medium text-foreground">{q.message}</p>
                </li>
              ))}
          </ul>
          <div>
            <p className="text-sm font-medium">Documents</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload any missing files the officer asked for.
            </p>
            <ul className="mt-2 divide-y rounded-lg border text-sm">
              {p.documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 p-2">
                  <span>{d.name}</span>
                  <div className="flex items-center gap-2">
                    <DocBadge status={d.status} />
                    {d.status === 'Missing' || d.status === 'Rejected' ? (
                      <Button type="button" size="sm" variant="secondary" onClick={() => ippUploadMissingDemo(d.id)}>
                        Upload
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="ipp-resolution-note">
              Response note (optional)
            </label>
            <textarea
              id="ipp-resolution-note"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Summarise corrections or uploads for the officer"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <div>
            <Button type="button" onClick={ippResolveAndResubmit}>
              Resolve query and resubmit to officer
            </Button>
          </div>
        </section>
      )}

      {viewerRole === 'ipp' &&
        p.status === 'Under Review' &&
        p.queries.length > 0 &&
        !p.queries.some((q) => q.status === 'Open') && (
          <section className="rounded-xl border border-chart-4/25 bg-chart-4/5 p-4 text-sm">
            <p className="font-medium text-foreground">Query resolved — sent back to the officer</p>
            <p className="mt-1 text-muted-foreground">
              The officer will verify uploaded documents, then forward to the senior approver for final approval (or
              reject / raise another query).
            </p>
          </section>
        )}

      {/* ── IPP: In Execution info ─────────────────────────────────── */}
      {viewerRole === 'ipp' && p.status === 'In Execution' && (
        <section className="relative overflow-hidden rounded-2xl border border-chart-4/35 bg-gradient-to-br from-chart-4/[0.14] via-chart-4/6 to-card p-5 shadow-md ring-1 ring-chart-4/20 md:p-6">
          <div
            className="pointer-events-none absolute -right-16 -top-12 size-48 rounded-full bg-chart-4/25 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-chart-4/20 text-chart-4 shadow-inner ring-4 ring-chart-4/15">
              <Zap className="size-7" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-chart-4/35 bg-chart-4/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-chart-4">
                  <Sparkles className="size-3" aria-hidden />
                  In execution
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Final approval granted — you are cleared to deliver
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Milestones were issued with your packet. Update progress, attach proofs on each milestone, and keep
                  dates realistic — officers verify delivery against this plan.
                </p>
              </div>
              <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <li className="flex gap-2 rounded-lg border border-chart-4/20 bg-background/60 px-3 py-2 backdrop-blur-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-chart-4" aria-hidden />
                  <span>Log milestone progress as work completes</span>
                </li>
                <li className="flex gap-2 rounded-lg border border-chart-4/20 bg-background/60 px-3 py-2 backdrop-blur-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-chart-4" aria-hidden />
                  <span>Upload evidence officers can audit quickly</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ── IPP: Ready for Commissioning — submit button ───────────── */}
      {viewerRole === 'ipp' && p.status === 'Ready for Commissioning' && (
        <section className="rounded-xl border border-chart-4/40 bg-gradient-to-br from-chart-4/10 via-card to-card p-5 shadow space-y-4">
          <div>
            <p className="text-base font-bold text-foreground">🏁 All milestones verified — Ready for Commissioning</p>
            <p className="mt-1 text-xs text-muted-foreground">
              All execution milestones are complete. Confirm the project is fully done, optionally upload final
              documents, then submit for the officer's final commissioning check.
            </p>
          </div>
          {p.commissioningIssueNote && (
            <div className="rounded-md border border-destructive/30 bg-destructive/8 p-3 text-sm">
              <p className="font-semibold text-destructive">⚠ Officer raised an issue</p>
              <p className="mt-1 text-xs text-muted-foreground">{p.commissioningIssueNote}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Address the issue below and resubmit for commissioning.
              </p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium" htmlFor="ipp-comm-note">
              Confirmation note <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="ipp-comm-note"
              value={commissioningNote}
              onChange={(e) => setCommissioningNote(e.target.value)}
              placeholder="Confirm project completion status, list any final uploads, or add a handover note for the officer"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <Button type="button" onClick={ippSubmitForCommissioning}>
            Submit for Final Commissioning
          </Button>
        </section>
      )}

      {/* ── IPP: Commissioning Submitted — awaiting officer ────────── */}
      {viewerRole === 'ipp' && p.status === 'Commissioning Submitted' && (
        <section className="rounded-xl border border-primary/25 bg-primary/5 p-5 text-sm space-y-2">
          <p className="font-semibold text-foreground">⏳ Commissioning submitted — awaiting officer final check</p>
          <p className="text-muted-foreground text-xs">
            Your request has been sent to the officer for a final verification.
            The project will be officially <strong className="text-foreground">Commissioned</strong> once approved.
          </p>
          {p.commissioningNote && (
            <p className="rounded-md border bg-card p-2 text-xs">
              <span className="font-medium">Your note: </span>{p.commissioningNote}
            </p>
          )}
          {p.commissioningSubmittedAt && (
            <p className="text-[11px] text-muted-foreground">Submitted {relativeTime(p.commissioningSubmittedAt)}</p>
          )}
        </section>
      )}

      {/* ── IPP: Commissioned 🎉 ────────────────────────────────────── */}
      {viewerRole === 'ipp' && p.status === 'Commissioned' && (
        <section className="rounded-xl border border-chart-4/40 bg-gradient-to-br from-chart-4/15 to-card p-5 text-sm shadow space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <p className="text-lg font-bold text-foreground">Project Commissioned!</p>
          </div>
          <p className="text-xs text-muted-foreground">
            The officer has completed the final verification. This project is officially commissioned and closed.
          </p>
          {p.commissionedAt && (
            <p className="text-[11px] text-muted-foreground">Commissioned on {formatDate(p.commissionedAt)}</p>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="default" size="sm" onClick={() => downloadProjectCompletionTxt(p, 'summary')}>
              Download completion summary
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => downloadProjectCompletionTxt(p, 'milestones')}>
              Download milestone index
            </Button>
          </div>
        </section>
      )}

      {/* ── IPP: Legacy Completed state ─────────────────────────────── */}
      {viewerRole === 'ipp' && p.status === 'Completed' && (
        <section className="rounded-xl border border-chart-4/35 bg-gradient-to-br from-chart-4/10 to-card p-5 text-sm shadow-sm">
          <p className="text-lg font-semibold text-foreground">Project completed</p>
          <p className="mt-1 text-xs text-muted-foreground">
            All execution milestones were verified. Download portfolio reports for your records.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="default" size="sm" onClick={() => downloadProjectCompletionTxt(p, 'summary')}>
              Download completion summary
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadProjectCompletionTxt(p, 'milestones')}
            >
              Download milestone index
            </Button>
          </div>
        </section>
      )}


      {viewerRole === 'ipp' && p.status === 'Rejected' && (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-foreground">Application rejected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The authority recorded a rejection. Review remarks below; there is no separate rejection screen.
          </p>
          {p.remarks ? <p className="mt-2 text-xs text-foreground">Remarks: {p.remarks}</p> : null}
        </section>
      )}

      {(viewerRole === 'ipp' || viewerRole === 'management') && (
        <section className="overflow-hidden rounded-2xl border border-border/80 border-t-[3px] border-t-emerald-500 bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          <div className="border-b border-border/60 bg-muted/35 px-5 py-4">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <History className="size-4" aria-hidden />
              </span>
              Activity journey
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {viewerRole === 'management'
                ? 'Full programme timeline from submission through delivery — oldest events first.'
                : 'Timeline from first submission through each milestone — colour shows what happened at each step.'}
            </p>
          </div>
          <div className="p-4 sm:p-6">
            {(() => {
              const journey = viewerRole === 'management' ? p.activity : p.activity.slice(-12)
              if (journey.length === 0) {
                return <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              }
              return (
                <ul className="relative space-y-0">
                  {journey.map((a, i, arr) => {
                    const { Icon, accent, kind } = activityVisual(a.action, a.role)
                    const tone = activityAccentClasses(accent)
                    const isLast = i === arr.length - 1
                    const isFirst = i === 0
                    return (
                      <li
                        key={a.id}
                        className={cn('relative flex items-start gap-4', !isLast && 'pb-8')}
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full text-white shadow-md ring-4 ring-card',
                              tone.iconBg,
                              isLast &&
                                'ring-emerald-500/35 shadow-lg shadow-emerald-500/15 dark:ring-emerald-400/40',
                            )}
                          >
                            <Icon className="size-5" strokeWidth={2} aria-hidden />
                          </div>
                          {!isLast ? (
                            <div
                              className={cn(
                                'mt-1.5 w-px flex-1 min-h-[32px]',
                                isFirst
                                  ? 'bg-gradient-to-b from-emerald-400/55 to-border dark:from-emerald-600/50'
                                  : 'bg-border',
                              )}
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <div
                          className={cn(
                            'relative min-w-0 flex-1 rounded-xl border bg-muted/15 px-4 py-3.5 shadow-sm',
                            'border-border/70',
                            isLast &&
                              'border-emerald-500/40 bg-emerald-500/[0.07] shadow-md dark:bg-emerald-500/12',
                          )}
                        >
                          {isLast ? (
                            <span className="absolute -right-1 -top-2 inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm dark:bg-emerald-500">
                              <Sparkles className="size-2.5" aria-hidden />
                              Latest
                            </span>
                          ) : null}
                          {isFirst ? (
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
                              Journey begins
                            </p>
                          ) : null}
                          <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                {a.user}
                              </p>
                              <p className="mt-1 text-sm font-bold leading-snug text-foreground">{a.action}</p>
                            </div>
                            <time
                              className={cn(
                                'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                                tone.pill,
                              )}
                              dateTime={a.timestamp}
                            >
                              {relativeTime(a.timestamp)}
                            </time>
                          </div>
                          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                            <span className={cn('rounded-md px-2 py-0.5', tone.pill)}>{kind}</span>
                            <span className="text-border">·</span>
                            <span className="text-muted-foreground">{roleLabel(a.role)}</span>
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )
            })()}
          </div>
        </section>
      )}
    </div>
  )
}

function WorkflowTimelineRow({ step, isLast }: { step: WorkflowStep; isLast: boolean }) {
  const done = step.status === 'completed'
  const current = step.status === 'current'

  const statusLabel =
    step.status === 'completed' ? 'Done' : step.status === 'current' ? 'Active' : 'Queued'

  const Icon = done ? CheckCircle2 : current ? CircleDot : Circle

  return (
    <li className="flex items-stretch gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-full border-2 shadow-sm',
            done &&
              'border-emerald-500/55 bg-emerald-500/[0.14] text-emerald-700 shadow-emerald-500/15 dark:border-emerald-400/45 dark:bg-emerald-500/18 dark:text-emerald-400',
            current &&
              'border-sky-600 bg-sky-500/18 text-sky-700 shadow-md shadow-sky-500/10 ring-[3px] ring-sky-500/25 dark:border-sky-400 dark:bg-sky-500/20 dark:text-sky-300 dark:ring-sky-400/30',
            !done &&
              !current &&
              'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-400',
          )}
        >
          <Icon className={cn('size-4', current && 'drop-shadow-sm')} strokeWidth={done ? 2.25 : 2} aria-hidden />
        </div>
        {!isLast ? (
          <div
            className={cn(
              'mt-2 w-px flex-1 min-h-[28px]',
              done && 'bg-emerald-400/35 dark:bg-emerald-600/45',
              current && !done && 'bg-gradient-to-b from-sky-400/45 to-border dark:from-sky-500/40 dark:to-border',
              !done && !current && 'bg-border dark:bg-border',
            )}
            aria-hidden
          />
        ) : null}
      </div>
      <div className={cn('min-w-0 flex-1 pb-8 pt-0.5', isLast && 'pb-2')}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold leading-snug text-foreground">{step.name}</p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              {step.role}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              done &&
                'border-emerald-500/35 bg-emerald-500/12 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300',
              current &&
                'border-sky-500/40 bg-sky-500/14 text-sky-800 dark:border-sky-400/45 dark:bg-sky-500/18 dark:text-sky-200',
              !done &&
                !current &&
                'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400',
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </li>
  )
}

function roleLabel(role: Role) {
  const map: Record<Role, string> = {
    ipp: 'IPP',
    officer: 'Officer',
    approver: 'Approver',
    admin: 'Admin',
    management: 'Management',
  }
  return map[role] ?? role
}

function ApproverStageBadge({
  stage,
}: {
  stage: 'review' | 'allotment' | 'awaitingIpp' | 'milestones' | 'done'
}) {
  const map = {
    review: { label: 'Pending review', tone: 'border-border bg-muted text-muted-foreground' },
    allotment: { label: 'Approved', tone: 'border-primary/40 bg-primary/10 text-primary' },
    awaitingIpp: { label: 'Allotment sent', tone: 'border-chart-3/40 bg-chart-3/10 text-chart-3' },
    milestones: { label: 'IPP accepted', tone: 'border-chart-3/40 bg-chart-3/10 text-chart-3' },
    done: { label: 'Completed', tone: 'border-chart-4/40 bg-chart-4/10 text-chart-4' },
  }[stage]
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map.tone}`}
    >
      {map.label}
    </span>
  )
}

export function getApproverStage(
  p: Pick<
    Project,
    | 'approverApprovedAt'
    | 'accessAllotmentSentAt'
    | 'ippAccessAcceptedAt'
    | 'approverMilestonesSubmittedAt'
  >,
): 'review' | 'allotment' | 'awaitingIpp' | 'milestones' | 'done' {
  if (!p.approverApprovedAt) return 'review'
  if (!p.accessAllotmentSentAt) return 'allotment'
  if (!p.ippAccessAcceptedAt) return 'awaitingIpp'
  if (!p.approverMilestonesSubmittedAt) return 'milestones'
  return 'done'
}

export function approverStageLabel(stage: ReturnType<typeof getApproverStage>) {
  return {
    review: 'Pending review',
    allotment: 'Approved',
    awaitingIpp: 'Allotment sent',
    milestones: 'IPP accepted',
    done: 'Completed',
  }[stage]
}
