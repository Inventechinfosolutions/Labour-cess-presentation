import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/AppShell'
import { ProjectDetailPage } from '@/components/ProjectDetail'

export const Route = createFileRoute('/approver/projects/$id')({
  head: () => ({ meta: [{ title: 'Project — PMIS' }] }),
  component: ApproverProjectByIdPage,
})

function ApproverProjectByIdPage() {
  const { id } = Route.useParams()
  return (
    <AppShell role="approver">
      <ProjectDetailPage
        projectId={id}
        viewerRole="approver"
        backTo="/approver/queue"
        backLabel="Approval Queue"
      />
    </AppShell>
  )
}
