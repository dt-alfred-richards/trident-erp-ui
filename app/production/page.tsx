import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProductionDashboard } from "@/components/production/production-dashboard"
import { FinishProvider } from "../inventory/finished-goods/context"

export const metadata: Metadata = {
  title: "Production",
  description: "Manage production orders and track progress",
}

export default function ProductionPage() {
  return (
    <FinishProvider>
      <DashboardShell>
        <DashboardHeader heading="Production Dashboard" text="Manage production orders and track progress" />
        <ProductionDashboard />
      </DashboardShell>
    </FinishProvider>
  )
}

