import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DataListPageShell } from "@/components/DataListPage";
import { ProjectDetailPage } from "@/components/ProjectDetail";

export const Route = createFileRoute("/management/projects/$id")({
  head: () => ({ meta: [{ title: "Application — PMIS" }] }),
  component: ManagementProjectViewPage,
});

function ManagementProjectViewPage() {
  const { id } = Route.useParams();
  return (
    <AppShell role="management">
      <DataListPageShell>
        <ProjectDetailPage
          projectId={id}
          viewerRole="management"
          backTo="/management/projects"
          backLabel="All projects"
        />
      </DataListPageShell>
    </AppShell>
  );
}
