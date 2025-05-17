import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { HRDashboard } from "@/components/hr/hr-dashboard"

export const metadata: Metadata = {
  title: "Human Resources",
  description: "Manage employees, attendance, payroll and leave management",
}

export default function HRPage() {
  return (
    <DashboardShell>
      <HRDashboard />
    </DashboardShell>
  )
}
