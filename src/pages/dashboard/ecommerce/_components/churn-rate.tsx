import { churnRateData } from "../_data/churn-rate"
import { ChurnRateChart } from "./churn-rate-chart"
import { ChurnRateSummary } from "./churn-rate-summary"
import { DashboardCard, DashboardCardActionsDropdown } from "./dashboards/dashboard-card"

export function ChurnRate() {
  return (
    <DashboardCard
      title="Churn Rate"
      period={churnRateData.period}
      action={<DashboardCardActionsDropdown />}
      size="sm"
    >
      <ChurnRateSummary data={churnRateData.summary} />
      <ChurnRateChart data={churnRateData.months} />
    </DashboardCard>
  )
}
