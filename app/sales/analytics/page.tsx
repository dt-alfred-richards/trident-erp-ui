import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { SalesAnalyticsTab } from "@/components/dashboard/sales/sales-analytics-tab"

export const metadata: Metadata = {
  title: "Sales Analytics",
  description: "Analyze sales performance, trends, and customer insights",
}

export default function SalesAnalyticsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Sales Analytics" text="Analyze sales performance, trends, and customer insights" />
      <SalesAnalyticsTab />
    </DashboardShell>
  )
}

