import { createFileRoute, notFound } from "@tanstack/react-router"
import { FileStack, Wallet } from "lucide-react"
import { claimRecords } from "@/data/kpi-drilldown-data"
import { formatINR } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { IdentityPanel, InvestmentList } from "@/components/drilldown/person-bits"
import {
  PageHero,
  PageShell,
  SectionCard,
  SparkStatCard,
} from "@/components/drilldown/page-shell"

export const Route = createFileRoute("/claims/$claimId")({
  component: ClaimDetailPage,
})

function ClaimDetailPage() {
  const { claimId } = Route.useParams()
  const claim = claimRecords.find((c) => c.id === claimId)
  if (!claim) throw notFound()

  const deposited = claim.investments.reduce((s, i) => s + i.invested, 0)
  const returns = claim.investments.reduce((s, i) => s + i.returnsTaken, 0)

  return (
    <PageShell>
      <PageHero
        eyebrow="Settlement"
        title="Claim detail"
        description={`${claim.claimId} — schemes, deposit amounts, and returns already received.`}
        icon={FileStack}
        backTo="/claims"
        backLabel="All claims"
        accent="#3b82f6"
        actions={
          <Badge variant="secondary" className="mt-1 px-3 py-1 text-xs">
            {claim.status}
          </Badge>
        }
      />

      <IdentityPanel
        className="shadow-[0_1px_4px_rgba(15,23,42,0.02)]"
        name={claim.name}
        customerId={claim.customerId}
        pan={claim.pan}
        aadhaar={claim.aadhaar}
        district={claim.district}
        accent="#3b82f6"
        extra={[{ label: "Claim ID", value: claim.claimId }]}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SparkStatCard
          id={`${claim.id}-amt`}
          label="Claim amount"
          value={formatINR(claim.claimAmount, false)}
          tone="blue"
          icon={FileStack}
          spark={[40, 50, 58, 66, 75, 88, 100]}
        />
        <SparkStatCard
          id={`${claim.id}-dep`}
          label="Total deposits"
          value={formatINR(deposited, false)}
          tone="gold"
          icon={Wallet}
          spark={[35, 45, 55, 62, 72, 85, 100]}
        />
        <SparkStatCard
          id={`${claim.id}-ret`}
          label="Returns received"
          value={formatINR(returns, false)}
          tone="success"
          icon={Wallet}
          spark={[8, 16, 28, 40, 55, 70, 82]}
        />
      </div>

      <SectionCard
        title="Deposits behind this claim"
        description="Fraudulent entity, scheme, deposit amount, and returns already received"
      >
        <InvestmentList investments={claim.investments} />
      </SectionCard>
    </PageShell>
  )
}
