import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProcurementDashboard } from "@/components/procurement/procurement-dashboard"

export const metadata: Metadata = {
  title: "Procurement",
  description: "Manage purchase orders and goods receiving for raw materials and supplies",
}

export default function ProcurementPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Procurement"
        text="Manage purchase orders and goods receiving for raw materials and supplies"
      />
      <ProcurementDashboard />
    </DashboardShell>
  )
}

