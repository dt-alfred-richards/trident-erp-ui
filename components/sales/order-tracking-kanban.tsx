"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useOrders } from "@/contexts/order-context"
import { PriorityIndicator } from "@/components/common/priority-indicator"
import { OrderSummaryDialog } from "@/components/sales/order-summary-dialog"
import { TrackOrderDialog } from "@/components/sales/track-order-dialog"
import type { Order, OrderStatus } from "@/types/order"

export function OrderTrackingKanban() {
  const { orders, getOrderById } = useOrders()

  // Dialog states
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false)
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Define the status columns in the required order
  const statusColumns: OrderStatus[] = [
    "pending_approval",
    "approved",
    "ready",
    "dispatched",
    "partial_fulfillment",
    "delivered",
  ]

  // Use all orders since we're not filtering
  const filteredOrders = useMemo(() => {
    return orders
  }, [orders])

  // Group orders by status
  const groupedOrders = useMemo(() => {
    return statusColumns.reduce((acc: { [key: string]: Order[] }, status) => {
      acc[status] = filteredOrders.filter((order) => order.status === status)
      return acc
    }, {})
  }, [filteredOrders, statusColumns])

  // Handle view order details
  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsOrderSummaryOpen(true)
  }

  // Handle track order
  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsTrackOrderOpen(true)
  }

  // Get the selected order
  const selectedOrder = selectedOrderId ? getOrderById(selectedOrderId) : null

  // Calculate total amount for an order
  const calculateTotalAmount = (order: Order) => {
    return order.products.reduce((total, product) => {
      return total + product.price * product.quantity
    }, 0)
  }

  return (
    <div className="space-y-4">
      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pb-8">
        {statusColumns.map((status) => (
          <div key={status} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider">{status.replace("_", " ")}</h3>
              <Badge variant="outline" className="px-2 py-1">
                {groupedOrders[status].length}
              </Badge>
            </div>

            <div className="flex-1 space-y-3 bg-muted/30 p-3 rounded-lg min-h-[500px] overflow-y-auto">
              {groupedOrders[status].length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No orders</div>
              ) : (
                groupedOrders[status].map((order) => (
                  <Card
                    key={order.id}
                    className={`border-l-4 ${order.priority === "high"
                        ? "border-l-red-500"
                        : order.priority === "medium"
                          ? "border-l-amber-500"
                          : "border-l-green-500"
                      } hover:shadow-md transition-shadow cursor-pointer`}
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <CardHeader className="p-3 pb-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{order.id}</span>
                        <PriorityIndicator priority={order.priority} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-2 pb-2">
                      <div className="space-y-1 text-sm">
                        <div className="font-medium truncate">{order.customer}</div>
                        <div className="text-muted-foreground text-xs">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          Ref: <span className="font-medium">{order.reference}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 pt-0 flex justify-between items-center">
                      <div className="text-sm font-semibold">₹{calculateTotalAmount(order).toLocaleString()}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTrackOrder(order.id)
                        }}
                      >
                        Track
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      {selectedOrder && (
        <>
          <OrderSummaryDialog open={isOrderSummaryOpen} onOpenChange={setIsOrderSummaryOpen} order={selectedOrder} />
          <TrackOrderDialog open={isTrackOrderOpen} onOpenChange={setIsTrackOrderOpen} order={selectedOrder} />
        </>
      )}
    </div>
  )
}
