import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { ClientListDashboard } from "@/components/sales/client-list-dashboard"

export const metadata: Metadata = {
  title: "Client List",
  description: "Manage client information and relationships",
}

export default function ClientListPage() {
  return (
    <DashboardShell>
      <ClientListDashboard />
    </DashboardShell>
  )
}
