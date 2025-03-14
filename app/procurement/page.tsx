import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProcurementDashboard } from "@/components/procurement/procurement-dashboard"

export const metadata: Metadata = {
  title: "Procurement",
  description: "Manage raw material sourcing, supplier management, and inventory replenishment",
}

export default function ProcurementPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Procurement Dashboard"
        text="Manage raw material sourcing, supplier management, and inventory replenishment"
      />
      <ProcurementDashboard />
    </DashboardShell>
  )
}

