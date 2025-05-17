import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { SupplierListTab } from "@/components/procurement/supplier-list-tab"

export const metadata: Metadata = {
  title: "Supplier List",
  description: "Manage suppliers for raw materials and supplies",
}

export default function SuppliersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Supplier List" text="Manage suppliers for raw materials and supplies" />
      <div className="space-y-4">
        <SupplierListTab />
      </div>
    </DashboardShell>
  )
}
