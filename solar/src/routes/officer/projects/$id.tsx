import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/AppShell'
import { ProjectDetailPage } from '@/components/ProjectDetail'

export const Route = createFileRoute('/officer/projects/$id')({
  head: () => ({ meta: [{ title: 'Project — PMIS' }] }),
  component: OfficerProjectByIdPage,
})

function OfficerProjectByIdPage() {
  const { id } = Route.useParams()
  return (
    <AppShell role="officer">
      <ProjectDetailPage
        projectId={id}
        viewerRole="officer"
        backTo="/officer/queue"
        backLabel="Application Queue"
      />
    </AppShell>
  )
}
