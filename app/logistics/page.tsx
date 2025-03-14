import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { LogisticsDashboard } from "@/components/logistics/logistics-dashboard"

export const metadata: Metadata = {
  title: "Logistics",
  description: "Manage order dispatch and delivery",
}

export default function LogisticsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Logistics Dashboard" text="Manage order dispatch and delivery" />
      <LogisticsDashboard />
    </DashboardShell>
  )
}

