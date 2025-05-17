import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import DashboardPage from "@/app/dashboard/dashboard-page"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dhaara ERP Dashboard",
}

export default function Home() {
  return (
    <DashboardShell>
      <DashboardPage />
    </DashboardShell>
  )
}
