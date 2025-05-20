import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { ClientListDashboard } from "@/components/sales/client-list-dashboard"
import { ClientProvider } from "./client-context"

export const metadata: Metadata = {
  title: "Client List",
  description: "Manage client information and relationships",
}

export default function ClientListPage() {
  return (
    <DashboardShell>
      <ClientProvider>
        <ClientListDashboard />
      </ClientProvider>
    </DashboardShell>
  )
}
