"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronDown, ChevronUp } from "lucide-react"
import { AllocationDialog } from "@/components/inventory/allocation-dialog"
import { useToast } from "@/hooks/use-toast"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { AllocationHistory } from "@/components/inventory/allocation-history"
import { Separator } from "@/components/ui/separator"
import { OrderDetails } from "@/components/sales/sales-dashboard"
import { DataByTableName } from "@/components/utils/api"
import { useOrders } from "@/contexts/order-context"
import { FinishedGoodsContext } from "./context"

export interface Order {
  id: string
  customer: string
  dueDate: string
  priority: "urgent" | "high-value" | "standard"
  status: string
  products: OrderProduct[],
  productId: string,
  casesReserved: number
}

interface OrderProduct {
  id: string
  name: string
  sku: string
  quantity: number
  allocated?: number
}

export type Allocations = {
  id: string,
  timestamp: string,
  user: string,
  orderId: string,
  customer: string,
  sku: string,
  allocated: OrderDetails["casesReserved"],
  requested: OrderDetails["cases"],
  status: OrderDetails["status"],
  reason: string,
}

export default function FinishedGoodsPage() {
  const [showAllocationDialog, setShowAllocationDialog] = useState(false)
  const [showHistory, setShowHistory] = useState(true) // Set to true by default
  const { toast } = useToast()
  const [selectedSku, setSelectedSku] = useState<string | null>(null)

  const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([])
  const { productInfo, clientProposedPrice, clientInfo } = useOrders();
  const [orders, setOrders] = useState<Order[]>([])
  const [allocations, setAllocations] = useState<Allocations[]>([])

  const getPriority = useCallback((date: Date): "urgent" | "high-value" | "standard" => {
    // const now = new Date();
    // const diffInDays = Math.floor((date?.getTime() - now?.getTime()) / (1000 * 60 * 60 * 24));

    // if (diffInDays < 10) {
    //   return "urgent";
    // } else if (diffInDays < 20) {
    //   return "high-value";
    // } else {
    //   return "standard";
    // }
    return "high-value"
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const orderDetails = new DataByTableName("order_details") as any;
      const response = await orderDetails.get();
      const orders: OrderDetails[] = response.data ?? [];

      const mockOrders: Order[] = Object.values(Object.fromEntries(orders.map((order: OrderDetails) => [order.orderId, {
        id: order.orderId,
        customer: order.clientId,
        dueDate: new Date(order.expectedDeliveryDate)?.toDateString(),
        priority: getPriority(order.expectedDeliveryDate),
        status: order.status,
        productId: order.productId,
        casesReserved: order.casesReserved,
        products: []
      }])));
      const updatedMockOrders = mockOrders.map((order: Order) => {
        const products = orders.filter(item => order.id === item.orderId).map(({ productId, casesReserved, casesDelivered, cases }, index) => {
          const { brand = "", sku = "", units = "" } = productInfo[productId] ?? {}
          return ({
            id: index + "",
            name: brand,
            price: clientProposedPrice[order.customer]?.proposedPrice ?? 0,
            quantity: cases,
            allocated: casesReserved,
            delivered: casesDelivered,
            sku,
            units,
          })
        })
        order.products = products;
        return order;
      })

      const _allocations = orders.map((order, index) => ({
        id: index + "",
        timestamp: new Date(order.createdOn)?.toLocaleString(),
        user: order.clientId,
        orderId: order.orderId,
        customer: clientInfo[order.clientId]?.name ?? "",
        sku: productInfo[order.productId]?.sku ?? "",
        allocated: order.casesReserved,
        requested: order.cases,
        status: order.status,
        reason: "",
      }))
      const skus = Array.from(new Set(allocations.map(item => item.sku)));
      setAllocations(_allocations)
      setOrders(updatedMockOrders)
      setOrderDetails(orders)
    } catch (error) {
      console.log({ error })
    }
  }, [clientInfo, clientProposedPrice, productInfo])

  useEffect(() => {
    if (Object.values(productInfo).length == 0) return;
    fetchData()
  }, [clientInfo, clientProposedPrice, productInfo])

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
    <FinishedGoodsContext.Provider value={{ orders, allocations }}>
      <DashboardShell className="p-6">
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
          orders={orders}
        />
      </DashboardShell>
    </FinishedGoodsContext.Provider>
  )
}

