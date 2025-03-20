import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { BomDashboard } from "@/components/bom/bom-dashboard"

export const metadata: Metadata = {
  title: "Bill of Materials",
  description: "Manage product BOMs and component requirements",
}

export default function BomPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Bill of Materials" text="Manage product BOMs and component requirements" />
      <BomDashboard />
    </DashboardShell>
  )
}

