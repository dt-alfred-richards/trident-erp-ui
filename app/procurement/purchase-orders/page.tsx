"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProcurementProvider } from "@/components/procurement/procurement-context"
import { PurchaseOrderTab } from "@/components/procurement/purchase-order-tab"

export default function PurchaseOrdersPage() {
  return (
    <DashboardShell>
      <ProcurementProvider>
        <DashboardHeader heading="Purchase Orders" text="Manage purchase orders for raw materials and supplies" />
        <div className="space-y-4">
          <PurchaseOrderTab />
        </div>
      </ProcurementProvider>
    </DashboardShell>
  )
}
