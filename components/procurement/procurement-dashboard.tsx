"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PurchaseOrderTab } from "@/components/procurement/purchase-order-tab"
import { SupplierListTab } from "@/components/procurement/supplier-list-tab"
import { PurchaseOrderDialog } from "@/components/procurement/purchase-order-dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Define the PurchaseOrder type
export interface PurchaseOrder {
  id: string
  supplier: string
  supplierName?: string
  material: string
  materialName?: string
  quantity: number
  unit: string
  orderDate: string
  expectedDelivery: string
  status: string
  totalValue: number
  received?: number
  priority?: string
  notes?: string
}

export function ProcurementDashboard() {
  const [activeTab, setActiveTab] = useState("purchase-order")
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const { toast } = useToast()

  // Move purchase orders state up to this component
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: "PO-001",
      supplier: "plasticorp",
      supplierName: "PlastiCorp Inc.",
      material: "plastic-resin",
      materialName: "Plastic Resin",
      quantity: 500,
      unit: "kg",
      orderDate: "2023-06-01",
      expectedDelivery: "2023-06-08",
      status: "pending",
      totalValue: 2500,
    },
    {
      id: "PO-002",
      supplier: "capmakers",
      supplierName: "CapMakers Ltd.",
      material: "bottle-caps",
      materialName: "Bottle Caps",
      quantity: 10000,
      unit: "pcs",
      orderDate: "2023-06-02",
      expectedDelivery: "2023-06-09",
      status: "partial",
      received: 5000,
      totalValue: 1000,
    },
    {
      id: "PO-003",
      supplier: "adhesive",
      supplierName: "Adhesive Solutions",
      material: "label-adhesive",
      materialName: "Label Adhesive",
      quantity: 100,
      unit: "liters",
      orderDate: "2023-06-03",
      expectedDelivery: "2023-06-10",
      status: "pending",
      totalValue: 1500,
    },
    {
      id: "PO-004",
      supplier: "packaging",
      supplierName: "Packaging Experts",
      material: "cardboard-boxes",
      materialName: "Cardboard Boxes",
      quantity: 1000,
      unit: "pcs",
      orderDate: "2023-05-28",
      expectedDelivery: "2023-06-05",
      status: "completed",
      totalValue: 800,
    },
    {
      id: "PO-005",
      supplier: "labels",
      supplierName: "Label Masters",
      material: "labels",
      materialName: "Product Labels",
      quantity: 5000,
      unit: "sheets",
      orderDate: "2023-05-30",
      expectedDelivery: "2023-06-07",
      status: "cancelled",
      totalValue: 1200,
    },
  ])

  const handleNewOrder = () => {
    setIsOrderDialogOpen(true)
  }

  // Function to add a new purchase order
  const addPurchaseOrder = (newOrder: Omit<PurchaseOrder, "id" | "orderDate" | "status">) => {
    // Generate a new PO ID
    const poId = `PO-${String(purchaseOrders.length + 1).padStart(3, "0")}`

    // Create the new order object
    const order: PurchaseOrder = {
      id: poId,
      orderDate: new Date().toISOString().split("T")[0], // Today's date
      status: "pending",
      ...newOrder,
    }

    // Update the state with the new order
    setPurchaseOrders((prev) => [order, ...prev])

    // Show success notification
    toast({
      title: "Purchase Order Created",
      description: `Purchase order ${poId} has been created successfully.`,
      variant: "default",
    })

    // Close the dialog
    setIsOrderDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Procurement</h2>

        {activeTab === "purchase-order" && (
          <div className="flex items-center gap-2">
            <Button onClick={handleNewOrder} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Order</span>
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="purchase-order" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="purchase-order">Purchase Order-TB</TabsTrigger>
          <TabsTrigger value="supplier-list">Supplier List</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase-order" className="mt-0">
          <PurchaseOrderTab purchaseOrders={purchaseOrders} setPurchaseOrders={setPurchaseOrders} />
        </TabsContent>

        <TabsContent value="supplier-list" className="mt-0">
          <SupplierListTab />
        </TabsContent>
      </Tabs>

      {isOrderDialogOpen && (
        <PurchaseOrderDialog
          open={isOrderDialogOpen}
          onOpenChange={setIsOrderDialogOpen}
          onCreateOrder={addPurchaseOrder}
        />
      )}
    </div>
  )
}
