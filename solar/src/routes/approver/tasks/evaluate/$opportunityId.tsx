import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ApproverOpportunityEvaluation } from "@/components/ApproverOpportunityEvaluation";

export const Route = createFileRoute("/approver/tasks/evaluate/$opportunityId")({
  head: () => ({ meta: [{ title: "Approver evaluation — PMIS" }] }),
  component: ApproverEvaluatePage,
});

function ApproverEvaluatePage() {
  const { opportunityId } = Route.useParams();
  return (
    <AppShell role="approver">
      <div className="mb-3">
        <Button type="button" variant="ghost" size="sm" asChild className="gap-1.5 h-8 -ml-1 text-muted-foreground">
          <Link to="/approver/tasks">
            <ArrowLeft className="size-3.5" />
            Back to approver tasks
          </Link>
        </Button>
      </div>
      <ApproverOpportunityEvaluation opportunityId={opportunityId} backTo="/approver/tasks" />
    </AppShell>
  );
}
