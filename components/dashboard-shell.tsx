import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return <div className="flex min-h-screen flex-col space-y-6 p-6 overflow-auto">{children}</div>
}

