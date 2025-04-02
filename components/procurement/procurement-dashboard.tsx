"use client"

import { useState } from "react"
import { PurchaseOrderTab } from "@/components/procurement/purchase-order-tab"
import { PurchaseOrderDialog } from "@/components/procurement/purchase-order-dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ProcurementProvider } from "./procurement-context"

export function ProcurementDashboard() {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const handleNewOrder = () => {
    setIsOrderDialogOpen(true)
  }

  return (
    <ProcurementProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold tracking-tight">Procurement</h2>

          <div className="flex items-center gap-2">
            <Button onClick={handleNewOrder} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Order</span>
            </Button>
          </div>
        </div>

        <div className="w-full">
          <PurchaseOrderTab />
        </div>

        {isOrderDialogOpen && <PurchaseOrderDialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen} />}
      </div>
    </ProcurementProvider>
  )
}

