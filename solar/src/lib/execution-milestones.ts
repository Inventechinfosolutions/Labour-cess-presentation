import type { Milestone, MilestoneProof, MilestoneStatus, Project, WorkflowStep } from '@/lib/types'
import { uidLib } from '@/lib/mock-db'

function addDaysIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/** Default proof slots per milestone (execution phase) */
export function createProofSlotsForMilestone(milestoneId: string): MilestoneProof[] {
  return [
    { id: `${milestoneId}_p1`, label: 'Site photos / evidence', status: 'Missing' },
    { id: `${milestoneId}_p2`, label: 'Installation proof', status: 'Missing' },
    { id: `${milestoneId}_p3`, label: 'Reports / certificates', status: 'Missing' },
  ]
}

export function ensureMilestoneProofs(milestones: Milestone[]): Milestone[] {
  return milestones.map((m) => ({
    ...m,
    proofs: m.proofs && m.proofs.length > 0 ? m.proofs : createProofSlotsForMilestone(m.id),
  }))
}

/** Progress % from proof uploads only — each Uploaded/Verified proof counts equally (100% when all done). */
export function milestoneProgressPercentFromProofs(m: Pick<Milestone, 'proofs'>): number {
  const proofs = m.proofs ?? []
  if (proofs.length === 0) return 0
  const done = proofs.filter((pr) => pr.status === 'Uploaded' || pr.status === 'Verified').length
  return Math.round((done / proofs.length) * 100)
}

/** Standard execution milestones created when the approver grants final approval */
export function createDefaultExecutionMilestones(): Milestone[] {
  const defs = [
    { name: 'Site setup', days: 30 },
    { name: 'Equipment installation', days: 90 },
    { name: 'Testing & commissioning', days: 150 },
  ]
  return defs.map((m, i) => {
    const id = uidLib()
    return {
      id,
      name: m.name,
      sequence: i + 1,
      dueDate: addDaysIso(m.days),
      progress: 0,
      status: 'Not Started' as MilestoneStatus,
      proofs: createProofSlotsForMilestone(id),
    }
  })
}

/** Marks approver step complete and opens the IPP execution phase */
export function buildWorkflowAfterFinalApproval(p: Project, completedAt: string): WorkflowStep[] {
  const withoutExec = p.workflow.filter((w) => w.name !== 'Execution')
  const mapped = withoutExec.map((w) => {
    if (w.role === 'approver' && w.status === 'current') {
      return {
        ...w,
        status: 'completed' as const,
        completedAt,
        assignee: w.assignee,
      }
    }
    return w
  })
  return [
    ...mapped,
    {
      name: 'Execution',
      role: 'ipp' as const,
      status: 'current' as const,
      assignee: p.ippName,
    },
  ]
}
