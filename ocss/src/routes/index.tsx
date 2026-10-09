import { createFileRoute } from '@tanstack/react-router'
import { KpiStrip } from '@/components/dashboard/kpi-strip'
import { ClaimsFunnel } from '@/components/dashboard/claims-funnel'
import { FinancialSummary } from '@/components/dashboard/financial-summary'
import { TerritorySection } from '@/components/dashboard/territory-section'
import { ChartsSection } from '@/components/dashboard/charts-section'
import {
  SafetyChecksChart,
} from '@/components/dashboard/requirement-insights'

export const Route = createFileRoute('/')({
  component: ExecutiveDashboard,
})

function ExecutiveDashboard() {
  return (
    <main className="mx-auto w-full max-w-[1600px] min-w-0 space-y-4 overflow-x-clip px-3 pt-3 pb-24 sm:px-5 sm:pt-4 lg:px-6 lg:pb-8">
      <div id="section-overview" className="scroll-mt-20 space-y-4">
        <KpiStrip />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.2fr)] lg:items-stretch">
        <div id="section-claims" className="scroll-mt-20 min-w-0 h-full">
          <ClaimsFunnel className="h-full" />
        </div>
        <div id="section-map" className="scroll-mt-20 min-w-0 h-full">
          <TerritorySection className="h-full" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <div id="section-payments" className="scroll-mt-20 min-w-0 h-full">
          <FinancialSummary className="h-full" />
        </div>
        <div id="section-safety" className="scroll-mt-20 min-w-0 h-full">
          <SafetyChecksChart className="h-full" />
        </div>
      </div>

      {/* <RequirementInsights /> */}

      <ChartsSection />
    </main>
  )
}
