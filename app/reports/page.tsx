import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ReportsDashboard } from "@/components/reports/reports-dashboard"
import { LogisticsProvider } from "@/hooks/use-logistics-data"
import { HrProvider } from "../hr/hr-context"

export const metadata: Metadata = {
  title: "Reports & Analytics",
  description: "View reports and analytics",
}

export default function ReportsPage() {
  return (
    <DashboardShell>
      <LogisticsProvider>
        <HrProvider>
          <DashboardHeader heading="Reports & Analytics" text="View reports and analytics" />
          <ReportsDashboard />
        </HrProvider>
      </LogisticsProvider>
    </DashboardShell>
  )
}
