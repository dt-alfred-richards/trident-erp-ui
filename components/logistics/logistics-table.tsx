"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { DispatchDialog } from "@/components/logistics/dispatch-dialog"
import { useLogisticsData } from "@/hooks/use-logistics-data"
import { Eye } from "lucide-react"

interface LogisticsTableProps {
  status: "all" | "ready" | "dispatched" | "delivered"
}

export function LogisticsTable({ status }: LogisticsTableProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Get logistics data from custom hook
  const { orders, filteredOrders } = useLogisticsData(status)

  const handleDispatchClick = (order: any) => {
    setSelectedOrder(order)
    setOpenDialog(true)
  }

  const handleViewDetails = (order: any) => {
    console.log("View shipment details:", order.id)
    // In a real app, this would show shipment details
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

  const isDispatched = (status: string) => {
    return ["dispatched", "partial_fulfillment", "delivered"].includes(status)
  }

  return (
    <div className="space-y-4">
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Shipment ID</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {isDispatched(order.status) ? (
                      order.shipmentId ||
                      `SH-${Math.floor(Math.random() * 10000)
                        .toString()
                        .padStart(4, "0")}`
                    ) : (
                      <span className="text-muted-foreground">Not dispatched</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isDispatched(order.status) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(order)}
                          title="View shipment details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <ActionButton status={order.status} onClick={() => handleActionClick(order)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No shipments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && <DispatchDialog open={openDialog} onOpenChange={setOpenDialog} order={selectedOrder} />}
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

