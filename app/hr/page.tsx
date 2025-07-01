import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { HRDashboard } from "@/components/hr/hr-dashboard"
import { HrProvider } from "./hr-context"
import { PayrollProvider } from "./payroll-context"

export const metadata: Metadata = {
  title: "Human Resources",
  description: "Manage employees, attendance, payroll and leave management",
}

export default function HRPage() {
  return (
    <HrProvider>
      <PayrollProvider>
        <DashboardShell>
          <HRDashboard />
        </DashboardShell>
      </PayrollProvider>
    </HrProvider>
  )
}
