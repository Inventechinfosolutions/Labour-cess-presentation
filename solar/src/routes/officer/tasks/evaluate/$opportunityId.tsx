import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { OfficerOpportunityEvaluation } from "@/components/OfficerOpportunityEvaluation";

export const Route = createFileRoute("/officer/tasks/evaluate/$opportunityId")({
  head: () => ({ meta: [{ title: "Evaluate opportunity — PMIS" }] }),
  component: OfficerEvaluateOpp,
});

function OfficerEvaluateOpp() {
  const { opportunityId } = Route.useParams();
  return (
    <AppShell role="officer">
      <OfficerOpportunityEvaluation opportunityId={opportunityId} backTo="/officer/tasks" />
    </AppShell>
  );
}
