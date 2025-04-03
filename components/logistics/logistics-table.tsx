"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { TrackingInfo } from "@/components/logistics/tracking-info"
import { DispatchDialog } from "@/components/logistics/dispatch-dialog"
import { useLogisticsData } from "@/hooks/use-logistics-data"

interface LogisticsTableProps {
  status: "all" | "ready" | "dispatched" | "delivered"
}

export function LogisticsTable({ status }: LogisticsTableProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Get logistics data from custom hook
  const { orders, filteredOrders, triggerRender } = useLogisticsData(status)

  console.log({ filteredOrders })

  const handleDispatchClick = (order: any) => {
    setSelectedOrder(order)
    setOpenDialog(true)
  }

  const handleActionClick = (order: any) => {
    if (order.status === "ready") {
      handleDispatchClick(order)
    } else if (order.status === "dispatched") {
      console.log("Mark as delivered:", order.id)
      // In a real app, this would update the order status
    } else {
      console.log("View order details:", order.id)
      // In a real app, this would show order details
    }
  }

  return (
    <div className="space-y-4">
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.sku}</TableCell>
                  <TableCell className="text-right">{order.quantity.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <TrackingInfo
                      trackingId={order.trackingId}
                      carrier={order.carrier}
                      deliveryDate={order.deliveryDate}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionButton status={order.status} onClick={() => handleActionClick(order)} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No shipments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && <DispatchDialog open={openDialog} onOpenChange={setOpenDialog} order={selectedOrder} triggerRender={triggerRender} />}
    </div>
  )
}

interface ActionButtonProps {
  status: string
  onClick: () => void
}

function ActionButton({ status, onClick }: ActionButtonProps) {
  let buttonText = "View"
  let buttonVariant: "default" | "outline" = "outline"

  if (status === "ready") {
    buttonText = "Dispatch"
    buttonVariant = "default"
  } else if (status === "dispatched") {
    buttonText = "Mark Delivered"
  }

  return (
    <Button variant={buttonVariant} size="sm" onClick={onClick}>
      {buttonText}
    </Button>
  )
}

