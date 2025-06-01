import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProductionDashboard } from "@/components/production/production-dashboard"
import { ProductionProvider } from "@/components/production/production-context"
import { BomProvider } from "@/components/bom/bom-context"

export const metadata: Metadata = {
  title: "Production",
  description: "Manage production orders and track progress",
}

export default function ProductionPage() {
  return (
    <BomProvider>
      <ProductionProvider>
        <DashboardShell>
          <DashboardHeader heading="Production Dashboard" text="Manage production orders and track progress" />
          <ProductionDashboard />
        </DashboardShell>
      </ProductionProvider>
    </BomProvider>
  )
}
