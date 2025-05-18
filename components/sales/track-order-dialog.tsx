"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Clock, Package, Truck } from "lucide-react"
import { StatusBadge } from "@/components/common/status-badge"
import type { Order, OrderProduct } from "@/types/order"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { convertDate } from "../generic"

interface TrackOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function TrackOrderDialog({ open, onOpenChange, order }: TrackOrderDialogProps) {
  // In a real application, you would fetch the tracking details from your backend
  const trackingDetails = {
    trackingId: order.trackingId || "TRK-" + order.id,
    carrier: order.carrier || "Dhaara Logistics",
    status: order.status,
    events: [
      {
        status: "Order Placed",
        date: new Date(order.orderDate),
        description: "Order has been placed and is awaiting approval",
        completed: true,
      },
      {
        status: "Order Approved",
        date: new Date(new Date(order.orderDate).getTime() + 24 * 60 * 60 * 1000), // 1 day after order date
        description: "Order has been approved and is being processed",
        completed: order.status !== "pending_approval",
      },
      {
        status: "Production Complete",
        date: new Date(new Date(order.orderDate).getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days after order date
        description: "Production is complete and order is ready for dispatch",
        completed: ["ready", "dispatched", "delivered", "partial_fulfillment"].includes(order.status),
      },
      {
        status: "Dispatched",
        date: new Date(new Date(order.orderDate).getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days after order date
        description: "Order has been dispatched and is on its way",
        completed:
          ["dispatched", "delivered"].includes(order.status) ||
          (order.status === "partial_fulfillment" &&
            order.products.some(
              (p) =>
                p.status === "dispatched" ||
                p.status === "partially_dispatched" ||
                p.status === "delivered" ||
                p.status === "partially_delivered",
            )),
      },
      {
        status: "Delivered",
        date: new Date(order.deliveryDate),
        description: "Order has been delivered to the customer",
        completed:
          order.status === "delivered" ||
          (order.status === "partial_fulfillment" &&
            order.products.some((p) => p.status === "delivered" || p.status === "partially_delivered")),
      },
    ],
  }

  const getStatusIcon = (completed: boolean) => {
    if (completed) {
      return <CheckCircle2 className="h-6 w-6 text-green-500" />
    }
    return <Clock className="h-6 w-6 text-gray-400" />
  }

  const getCurrentStatusIcon = () => {
    switch (order.status) {
      case "pending_approval":
        return <Clock className="h-10 w-10 text-amber-500" />
      case "approved":
        return <Package className="h-10 w-10 text-blue-500" />
      case "ready":
        return <Package className="h-10 w-10 text-green-500" />
      case "dispatched":
        return <Truck className="h-10 w-10 text-purple-500" />
      case "delivered":
        return <CheckCircle2 className="h-10 w-10 text-green-500" />
      case "partial_fulfillment":
        return <Truck className="h-10 w-10 text-amber-500" />
      default:
        return <Clock className="h-10 w-10 text-gray-500" />
    }
  }

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{`Track Order "ORDER-${order.id}"`}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6 overflow-y-auto pr-1 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Tracking Information</h3>
              <p className="text-sm text-muted-foreground">
                Tracking ID: <span className="font-medium">{trackingDetails.trackingId}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Carrier: <span className="font-medium">{trackingDetails.carrier}</span>
              </p>
            </div>
            <div className="flex flex-col items-center">
              {getCurrentStatusIcon()}
              <StatusBadge status={order.status} />
            </div>
          </div>

          <Separator />

          {/* Product Status Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Status</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Dispatched</TableHead>
                  <TableHead className="text-right">Delivered</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.products.map((product: OrderProduct) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                    <TableCell className="text-right">{product.allocated || 0}</TableCell>
                    <TableCell className="text-right">{product.dispatched || 0}</TableCell>
                    <TableCell className="text-right">{product.delivered || 0}</TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tracking Timeline</h3>
            <div className="space-y-4">
              {trackingDetails.events.map((event, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-0.5">{getStatusIcon(event.completed)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.status}</h4>
                      <span className="text-sm text-muted-foreground">
                        {convertDate(event.date)}{" "}
                        {event.completed && event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />
        </div>

        <div className="flex justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Expected Delivery: <span className="font-medium">{convertDate(order.deliveryDate)}</span>
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
