"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { DispatchDialog } from "@/components/logistics/dispatch-dialog"
import { ShipmentDetailsDialog } from "@/components/logistics/shipment-details-dialog"
import { useLogisticsContext, useLogisticsData } from "@/hooks/use-logistics-data"
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
import { useToast } from "@/components/ui/use-toast"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { useOrders } from "@/contexts/order-context"
import { convertDate, getChildObject } from "../generic"
import { Logistics, LogisticsProduct, useLogistics } from "@/app/logistics/shipment-tracking/logistics-context"

interface LogisticsTableProps {
  status: "all" | "ready" | "dispatched" | "delivered"
}

export function LogisticsTable({ status }: LogisticsTableProps) {
  const [openDispatchDialog, setOpenDispatchDialog] = useState(false)
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const { toast } = useToast()

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const { orders } = useOrders()
  const { data: logisticsData, update } = useLogistics()

  const filteredOrders = useMemo(() => {
    const mapper: any = {};
    const saleOrders = orders.map(item => {
      mapper[item.id] = item.customer;
      return ({
        saleId: item.id,
        clientId: item.customer,
        trackingId: ``,
        logisticsId: "",
        products: JSON.stringify(item.products.map(i => ({
          allocatedQuantity: i?.allocated || 0,
          dispatchQuantity: i?.dispatched || 0,
          sku: i.sku,
          totatOrderQuantity: i.cases
        } as LogisticsProduct))),
        status: item.status === "approved" ? "ready" : "",
        date: convertDate(item.modifiedOn || item.createdAt),
        vehicleId: "",
        driverId: "",
        contactNumber: "",
        orderDate: item.modifiedOn || item.createdAt,
      })
    }).filter(item => item.status)
    const list = logisticsData.concat(saleOrders as any).map(item => {
      const products = JSON.parse(item.products) as LogisticsProduct[]
      return {
        logisticsId: item.id,
        id: item.orderId || getChildObject(item, "saleId", ""),
        customer: mapper[item.orderId || item.id] || item.clientId || '',
        trackingId: `TRK-${item.id}`,
        products: products,
        status: item.status,
        date: convertDate(item.modifiedOn || item.createdOn),
        vehicleId: item.vehicleId,
        driverId: item.driverId,
        contactNumber: item.contactNumber,
        orderDate: item.modifiedOn || item.createdOn
      }
    })
    console.log({ list })
    if (status === 'all') return list;
    return list.filter(item => item.status === status)
  }, [orders, status, logisticsData])


  // Get logistics data from custom hook with shared context
  const { updateOrderStatus } = useLogisticsData(status)

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem)

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

  const handleDeliveryConfirmed = () => {
    // Update the shared context state
    if (selectedOrder && selectedOrder.logisticsId) {
      update({ id: selectedOrder.logisticsId, status: "delivered" }).then(() => {
        setOpenConfirmDialog(false)
      })
    }
  }

  const handleDispatchComplete = (orderId: string, updatedOrder: any) => {
    // Update the shared context state
    updateOrderStatus(orderId, {
      status: "dispatched",
      trackingId: updatedOrder.trackingId,
      carrier: updatedOrder.carrier,
      vehicleId: updatedOrder.vehicleId,
      driverName: updatedOrder.driverName,
      contactNumber: updatedOrder.contactNumber,
    })

    setOpenDispatchDialog(false)
  }

  const isDispatched = (status: string) => {
    return ["dispatched", "partial_fulfillment", "delivered"].includes(status)
  }


  console.log({ paginatedOrders })

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
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order, index) => (
                <TableRow key={`${order.id}-${index}`}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {isDispatched(order.status) ? (
                      order.trackingId ||
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
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleDispatchClick(order)}
                          className="bg-[#725af2] hover:bg-[#5d48d0] text-white"
                        >
                          Dispatch
                        </Button>
                      )}
                      {order.status === "dispatched" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActionClick(order)}
                          className="bg-[#2cd07e] hover:bg-[#25b06a] text-white border-none"
                        >
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

      {/* Pagination */}
      <DataTablePagination
        totalItems={filteredOrders.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {selectedOrder && (
        <>
          <DispatchDialog
            open={openDispatchDialog}
            onOpenChange={setOpenDispatchDialog}
            order={selectedOrder}
            onDispatchComplete={handleDispatchComplete}
          />
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
