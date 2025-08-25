import { customerInsightsData } from "../_data/customer-insights"


import { CustomerInsightList } from "./customer-insight-list"
import { DashboardCard, DashboardCardActionsDropdown } from "./dashboards/dashboard-card"

export function CustomerInsights() {
  return (
    <DashboardCard
      title="Customer Insights"
      period={customerInsightsData.period}
      action={<DashboardCardActionsDropdown />}
      size="xs"
      className="md:col-span-3"
      contentClassName="justify-center"
    >
      <CustomerInsightList data={customerInsightsData} />
    </DashboardCard>
  )
}
