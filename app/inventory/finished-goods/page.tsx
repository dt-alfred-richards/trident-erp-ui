"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronDown, ChevronUp } from "lucide-react"
import { AllocationDialog } from "@/components/inventory/allocation-dialog"
import { useToast } from "@/hooks/use-toast"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { AllocationHistory } from "@/components/inventory/allocation-history"
import { Separator } from "@/components/ui/separator"

export default function FinishedGoodsPage() {
  const [showAllocationDialog, setShowAllocationDialog] = useState(false)
  const [showHistory, setShowHistory] = useState(true) // Set to true by default
  const { toast } = useToast()
  const [selectedSku, setSelectedSku] = useState<string | null>(null)

  const handleAllocate = (orderId: string, products: { id: string; quantity: number }[]) => {
    // In a real application, this would call an API to allocate stock
    console.log("Allocating stock to order:", orderId, "Products:", products)

    // Show a success toast
    const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0)
    toast({
      title: "Stock allocation initiated",
      description: `Allocated ${totalUnits} units to order ${orderId}`,
    })
  }

  return (
    <DashboardShell className={"p-6"}>
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Finished Goods Inventory Management</CardTitle>
        <Button
          onClick={() => {
            setSelectedSku(null) // Clear any selected SKU
            setShowAllocationDialog(true)
          }}
          className="ml-auto"
          variant="default"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Allocate Stock
        </Button>
      </CardHeader>

      <div className="space-y-6">
        {/* Inventory Overview */}
        <Card>
          <CardContent className="pt-6">
            <InventoryTable
              onAllocate={(sku) => {
                setSelectedSku(sku)
                setShowAllocationDialog(true)
              }}
            />
          </CardContent>
        </Card>

        {/* Allocation History Section - Now expanded by default */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Allocation History</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide History
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show History
                </>
              )}
            </Button>
          </div>
          <Separator className="my-4" />
          {showHistory && (
            <Card>
              <CardContent className="pt-6">
                <AllocationHistory />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AllocationDialog
        open={showAllocationDialog}
        onOpenChange={setShowAllocationDialog}
        onAllocate={handleAllocate}
        initialSku={selectedSku}
      />
    </DashboardShell>
  )
}

