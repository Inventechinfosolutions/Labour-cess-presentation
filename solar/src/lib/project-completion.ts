import type { ActivityLog, Milestone, Project } from '@/lib/types'
import { milestoneProgressPercentFromProofs } from '@/lib/execution-milestones'
import { toast } from 'sonner'

/** Keep milestone/progress/activity synchronized after edits.
 * Full-package submission/approval controls when commissioning unlocks. */
export function applyAutoCompletionFromMilestones(
  draft: Project,
  milestones: Milestone[],
  activity: ActivityLog[],
): Project {
  const ts = new Date().toISOString()
  const base: Project = { ...draft, milestones, activity, lastUpdated: ts }

  return base
}


export function downloadProjectCompletionTxt(project: Project, variant: 'summary' | 'milestones') {
  const ts = new Date().toISOString()
  let body: string
  if (variant === 'summary') {
    body = [
      'PMIS — Project completion summary',
      `Generated: ${ts}`,
      '',
      `Project: ${project.name}`,
      `Opportunity: ${project.opportunityName}`,
      `IPP: ${project.ippName}`,
      `Technology: ${project.type} · ${project.capacityMW} MW`,
      `Location: ${project.state}, ${project.district}`,
      `Final status: ${project.status}`,
      `Stage: ${project.stage}`,
      '',
      'This file is a demo export for portfolio records.',
    ].join('\n')
  } else {
    body = [
      'PMIS — Milestone completion index',
      `Project: ${project.name}`,
      '',
      ...project.milestones.map(
        (m, i) =>
          `${i + 1}. ${m.name} — ${m.status} (${milestoneProgressPercentFromProofs(m)}%) — due ${m.dueDate}`,
      ),
    ].join('\n')
  }
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${variant === 'summary' ? 'completion-summary' : 'milestone-index'}-${project.id}.txt`
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Download started')
}
