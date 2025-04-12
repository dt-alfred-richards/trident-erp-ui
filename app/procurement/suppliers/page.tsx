"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { SupplierListTab } from "@/components/procurement/supplier-list-tab"
import { ProcurementProvider } from "@/components/procurement/procurement-context"

export default function SuppliersPage() {
  return (
    <ProcurementProvider>
      <DashboardShell>
        <DashboardHeader heading="Supplier List" text="Manage suppliers for raw materials and supplies" />
        <div className="space-y-4">
          <SupplierListTab />
        </div>
      </DashboardShell>
    </ProcurementProvider>
  )
}
