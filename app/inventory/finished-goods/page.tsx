"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronDown, ChevronUp, RefreshCw, AlertTriangle } from "lucide-react"
import { AllocationDialog } from "@/components/inventory/allocation-dialog"
import { useToast } from "@/hooks/use-toast"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { AllocationHistory } from "@/components/inventory/allocation-history"
import { Separator } from "@/components/ui/separator"
import { UpdateInventoryDialog } from "@/components/inventory/update-inventory-dialog"
import { WastageSummaryDialog, type WastageData } from "@/components/inventory/wastage-summary-dialog"
import { useInventory } from "@/app/inventory-context"
import { OrderProvider, useOrders } from "@/contexts/order-context"
import { getChildObject } from "@/components/generic"

type Data = {
  id: string,
  name: string,
  quantity: number,
  reserved: number,
  type: string,
}

export default function FinishedGoodsPage() {
  const { inventory = [], allocations = [] } = useInventory()
  const [showAllocationDialog, setShowAllocationDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showHistory, setShowHistory] = useState(true) // Set to true by default
  const { toast } = useToast()
  const [selectedSku, setSelectedSku] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0) // Add a refresh key to force re-render
  const [showWastageDialog, setShowWastageDialog] = useState(false)

  // Add state to track wastage data
  const [wastageData, setWastageData] = useState<WastageData[]>([])

  // Add state to track inventory data
  const [inventoryData, setInventoryData] = useState<Data[]>([])

  useEffect(() => {
    if (inventory.length === 0) return;
    setInventoryData(
      inventory.map(item => ({
        id: item.id + '',
        name: item.material,
        quantity: item.quantity,
        reserved: item.reserved || 0,
        type: "finished",
      })))
    const initialWastageData = inventory.map((material) => ({
      id: material.id + '',
      product: material.material,
      category: material.category,
      wastage: material.wastage || 0,
      wastagePercentage: ((material.wastage || 0) / material.quantity) * 100,
      lastUpdated: material.modifiedOn || material.createdOn
    } as WastageData))
    setWastageData(initialWastageData)
  }, [inventory])

  // Update the state to include allocation history
  const [allocationHistory, setAllocationHistory] = useState<any[]>([])

  useEffect(() => {
    setAllocationHistory(allocations.map(item => ({
      id: getChildObject(item, "allocationId", ""),
      timestamp: getChildObject(item, "createdOn", getChildObject(item, "modifiedOn", "")),
      orderId: getChildObject(item, "orderId", ""),
      customer: getChildObject(item, "createdBy", getChildObject(item, "modifiedBy", "")),
      sku: getChildObject(item, "sku", ""),
      allocated: getChildObject(item, "allocated", 0)
    })))
  }, [allocations])

  // Get customer name from order ID
  const getCustomerName = (orderId: string) => {
    const orderMap: Record<string, string> = {
      "SO-1001": "ABC Corp",
      "SO-1002": "XYZ Retail",
      "SO-1003": "Urgent Pharma",
      "SO-1004": "Global Foods",
      "SO-1005": "Premium Stores",
      "SO-1006": "Mega Distributors",
      "SO-1007": "City Grocers",
      "SO-1008": "Health Essentials",
      "SO-1009": "Wellness Chain",
      "SO-1010": "Global Retail",
      "SO-1011": "Prime Markets",
      "SO-1012": "Regional Stores",
    }

    return orderMap[orderId] || "Unknown Customer"
  }

  // Update the handleAllocate function to properly deduct from inventory and add to history
  const handleAllocate = (orderId: string, products: { id: string; quantity: number }[]) => {
    // In a real application, this would call an API to allocate stock
    console.log("Allocating stock to order:", orderId, "Products:", products)

    // Create a copy of the current inventory data
    const updatedInventory = [...inventoryData]
    const newAllocations: any[] = []

    // Process each product allocation
    products.forEach((product) => {
      // Find the product in our inventory by ID
      // In the AllocationDialog, the product.id is actually the product ID (P1, P2, etc.)
      // We need to find the corresponding SKU from the order's products

      // First, find the product SKU from the mock orders
      const mockOrders = [
        {
          id: "SO-1001",
          products: [
            { id: "P1", sku: "500ml" },
            { id: "P2", sku: "750ml" },
            { id: "P3", sku: "1000ml" },
          ],
        },
        {
          id: "SO-1002",
          products: [
            { id: "P4", sku: "500ml" },
            { id: "P5", sku: "2000ml" },
          ],
        },
        {
          id: "SO-1003",
          products: [{ id: "P6", sku: "750ml" }],
        },
        {
          id: "SO-1004",
          products: [
            { id: "P7", sku: "500ml" },
            { id: "P8", sku: "750ml" },
          ],
        },
        {
          id: "SO-1005",
          products: [{ id: "P9", sku: "1000ml" }],
        },
      ]

      // Find the order
      const order = mockOrders.find((o) => o.id === orderId)
      if (!order) return

      // Find the product in the order
      const orderProduct = order.products.find((p) => p.id === product.id)
      if (!orderProduct) return

      // Now find the inventory item with matching SKU
      const inventoryIndex = updatedInventory.findIndex(
        (item) =>
          item.name.toLowerCase() === orderProduct.sku.toLowerCase() ||
          item.id.toLowerCase() === orderProduct.sku.toLowerCase(),
      )

      if (inventoryIndex !== -1) {
        // Get the current values
        const currentQuantity = updatedInventory[inventoryIndex].quantity
        const currentReserved = updatedInventory[inventoryIndex].reserved || 0
        const allocatedQuantity = Math.min(currentQuantity, product.quantity)

        // Deduct the allocated quantity from available and add to reserved
        updatedInventory[inventoryIndex] = {
          ...updatedInventory[inventoryIndex],
          quantity: Math.max(0, currentQuantity - allocatedQuantity),
          reserved: currentReserved + allocatedQuantity,
        }

        // Create a new allocation history entry
        const newAllocation = {
          id: `ALLOC-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          orderId: orderId,
          customer: getCustomerName(orderId),
          sku: orderProduct.sku,
          allocated: allocatedQuantity,
        }

        newAllocations.push(newAllocation)
      }
    })

    // Update the inventory state
    setInventoryData(updatedInventory)

    // Add new allocations to history
    if (newAllocations.length > 0) {
      setAllocationHistory((prev) => [...newAllocations, ...prev])
    }

    // Force a re-render to ensure UI updates
    setRefreshKey((prev) => prev + 1)

    // Show a success toast with details
    const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0)
    toast({
      title: "Stock allocation successful",
      description: `Allocated ${totalUnits} units to order ${orderId}`,
      variant: "default",
    })
  }

  const handleUpdateInventory = (updatedItems: any[], wastageUpdates: any[]) => {
    // Update the inventory data with the new quantities
    const updatedInventory = [...inventoryData]

    updatedItems.forEach((updatedItem) => {
      const index = updatedInventory.findIndex((item) => item.id === updatedItem.id)
      if (index !== -1) {
        updatedInventory[index] = {
          ...updatedInventory[index],
          quantity: updatedItem.quantity,
          // Preserve the reserved quantity
          reserved: updatedInventory[index].reserved || 0,
        }
      }
    })

    // Update wastage data if there are any wastage updates
    if (wastageUpdates && wastageUpdates.length > 0) {
      const updatedWastageData = [...wastageData]

      wastageUpdates.forEach((update) => {
        const index = updatedWastageData.findIndex((item) => item.id === update.id)

        if (index !== -1) {
          // Get the inventory item to calculate percentage
          const inventoryItem = inventoryData.find((item) => item.id === update.id)
          const totalQuantity = inventoryItem ? inventoryItem.quantity + update.wastage : update.wastage
          const wastagePercentage = totalQuantity > 0 ? (update.wastage / totalQuantity) * 100 : 0

          // Update existing wastage data
          updatedWastageData[index] = {
            ...updatedWastageData[index],
            wastage: updatedWastageData[index].wastage + update.wastage,
            wastagePercentage: wastagePercentage,
            lastUpdated: new Date(),
          }
        }
      })

      setWastageData(updatedWastageData)
    }

    // Force a re-render to ensure UI updates
    setRefreshKey((prev) => prev + 1)

    // Show a success toast
    toast({
      title: "Inventory updated",
      description: `Updated ${updatedItems.length} item(s) in finished goods inventory`,
    })
  }

  return (
    <OrderProvider>
      <DashboardShell className="p-6">
        <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Finished Goods Inventory Management</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowWastageDialog(true)}
              className="ml-auto bg-[#f8285a] hover:bg-[#f8285a]/90 text-white border-[#f8285a]"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Wastage
            </Button>
            <Button
              onClick={() => setShowUpdateDialog(true)}
              className="ml-auto bg-[#725af2] hover:bg-[#725af2]/90 text-white border-[#725af2]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Inventory
            </Button>
            <Button
              onClick={() => {
                setSelectedSku(null) // Clear any selected SKU
                setShowAllocationDialog(true)
              }}
              className="ml-auto bg-[#43ced7] hover:bg-[#43ced7]/90 text-white border-[#43ced7]"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Allocate Stock
            </Button>
          </div>
        </CardHeader>

        <div className="space-y-6">
          {/* Inventory Overview */}
          <Card>
            <CardContent className="pt-6">
              <InventoryTable
                key={`inventory-table-${refreshKey}`}
                inventoryData={inventoryData}
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
                  <AllocationHistory key={`allocation-history-${refreshKey}`} allocationHistory={allocationHistory} />
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

        <UpdateInventoryDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          inventoryType="finished"
          items={inventoryData}
          onUpdateInventory={handleUpdateInventory}
        />
        <WastageSummaryDialog open={showWastageDialog} onOpenChange={setShowWastageDialog} wastageData={wastageData} />
      </DashboardShell>
    </OrderProvider>
  )
}
