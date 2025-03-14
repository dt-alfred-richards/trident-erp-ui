import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { SalesDashboard } from "@/components/sales/sales-dashboard"

export const metadata: Metadata = {
  title: "Sales",
  description: "Manage sales orders and customer requests",
}

export default function SalesPage() {
  return (
    <DashboardShell>
      <SalesDashboard />
    </DashboardShell>
  )
}

