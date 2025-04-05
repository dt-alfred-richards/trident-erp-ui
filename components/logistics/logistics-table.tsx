"use client"

import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { DispatchDialog } from "@/components/logistics/dispatch-dialog"
import { ShipmentDetailsDialog } from "@/components/logistics/shipment-details-dialog"
import { useLogisticsData } from "@/hooks/use-logistics-data"
import { Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataByTableName } from "../utils/api"

interface LogisticsTableProps {
  status: "all" | "ready" | "dispatched" | "delivered"
}

export function LogisticsTable({ status = 'all' }: LogisticsTableProps) {
  const [openDispatchDialog, setOpenDispatchDialog] = useState(false)
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  // Get logistics data from custom hook
  const { orders, triggerRender } = useLogisticsData()

  const handleDispatchClick = (order: any) => {
    setSelectedOrder(order)
    setOpenDispatchDialog(true)
  }

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setOpenDetailsDialog(true)
  }

  const handleActionClick = (order: any) => {
    if (order.status === "ready") {
      handleDispatchClick(order)
    } else if (order.status === "dispatched") {
      setSelectedOrder(order)
      setOpenConfirmDialog(true)
    }
  }

  const handleDeliveryConfirmed = useCallback(() => {
    const instance = new DataByTableName("fact_logistics");

    instance.patch({ key: "orderId", value: selectedOrder.id }, { status: "delivered" }).then(() => {
      triggerRender();
      setOpenConfirmDialog(false)
    }).catch(error => {
      console.log({ error })
    })
  }, [selectedOrder])

  const filteredOrders = useMemo(() => status === "all" ? orders : orders.filter(item => item.status === status), [status, orders])

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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewDetails(order)}
                        title="View shipment details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === "ready" && (
                        <Button variant="default" size="sm" onClick={() => handleDispatchClick(order)}>
                          Dispatch
                        </Button>
                      )}
                      {order.status === "dispatched" && (
                        <Button variant="outline" size="sm" onClick={() => handleActionClick(order)}>
                          Mark Delivered
                        </Button>
                      )}
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

      {selectedOrder && (
        <>
          <DispatchDialog open={openDispatchDialog} onOpenChange={setOpenDispatchDialog} order={selectedOrder} />
          <ShipmentDetailsDialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog} order={selectedOrder} />
          <AlertDialog open={openConfirmDialog} onOpenChange={setOpenConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Delivery</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to mark this order as delivered? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeliveryConfirmed}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}

