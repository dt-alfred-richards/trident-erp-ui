import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure system settings and preferences",
}

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Configure system settings and preferences" />
      <div className="grid gap-4">
        <div className="h-[400px] flex items-center justify-center text-muted-foreground border rounded-lg">
          Settings module content will be displayed here
        </div>
      </div>
    </DashboardShell>
  )
}

