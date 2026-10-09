import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/AppShell'
import { ProjectDetailPage } from '@/components/ProjectDetail'

export const Route = createFileRoute('/ipp/projects/$id')({
  head: () => ({ meta: [{ title: 'Project — PMIS' }] }),
  component: IppProjectByIdPage,
})

function IppProjectByIdPage() {
  const { id } = Route.useParams()
  return (
    <AppShell role="ipp">
      <ProjectDetailPage
        projectId={id}
        viewerRole="ipp"
        backTo="/ipp/applications"
        backLabel="My Applications"
      />
    </AppShell>
  )
}
