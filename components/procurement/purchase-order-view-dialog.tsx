"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, CheckCircle2, AlertTriangle, Printer, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Material, Suppliers, useProcurement } from "@/app/procurement/procurement-context"
import { useMemo } from "react"
import { convertDate } from "../generic"

interface PurchaseOrderViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poId: string
}

export function PurchaseOrderViewDialog({ open, onOpenChange, poId }: PurchaseOrderViewDialogProps) {
  const { purchaseOrders, purchaseOrderMaterials, suppliers, materials } = useProcurement()
  const supplierMapper = useMemo(() => {
    return suppliers.reduce((acc: Record<string, Suppliers>, curr) => {
      if (!acc[curr.supplierId]) acc[curr.supplierId] = curr
      return acc;
    }, {})
  }, [suppliers])

  const materialMapper = useMemo(() => {
    return materials.reduce((acc: Record<string, Material>, curr) => {
      if (!acc[curr.materialId]) acc[curr.materialId] = curr
      return acc;
    }, {})
  }, [materials])

  const orders = useMemo(() => {
    return purchaseOrders.reduce((acc: Record<string, any>, curr) => {
      if (!acc[curr.purchaseId]) {
        acc[curr.purchaseId] = {
          id: curr.purchaseId,
          supplier: supplierMapper[curr.supplierId]?.name || "",
          supplierContact: supplierMapper[curr.supplierId]?.contactPerson || "",
          supplierEmail: supplierMapper[curr.supplierId]?.email || "",
          date: convertDate(curr.createdOn || curr.modifiedOn),
          dueDate: convertDate(curr.dueDate), // 7 days from now
          status: curr.status || "pending",
          currency: curr.currency,
          paymentTerms: curr.paymentTerms,
          priority: curr.priority,
          notes: curr.notes,
          items: purchaseOrderMaterials.filter(item => item.purchaseOrderId === curr.purchaseId).map(item => ({
            material: materialMapper[item.materialId]?.name || "",
            quantity: item.quantity,
            unit: item.unit,
            price: item.unitPrice,

          })),
        }
      }
      return acc;
    }, {})
  }, [purchaseOrders, purchaseOrderMaterials])
  const { toast } = useToast()

  const po = useMemo(() => {
    return orders[poId]
  }, [poId, orders])


  if (!po) {
    return null
  }

  const getStatusBadge = (status: string, received?: number, quantity?: number) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case "partial":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Partial {received && quantity ? `(${received}/${quantity})` : ""}
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const calculateTotal = () => {
    return po.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  const totalValue = calculateTotal()

  const handlePrint = () => {
    toast({
      title: "Preparing print view",
      description: "Opening print dialog for PO-" + po.id,
    })
    // Use setTimeout to allow the toast to show before opening print dialog
    setTimeout(() => {
      window.print()
    }, 500)
  }

  const handleExport = () => {
    toast({
      title: "Exporting purchase order",
      description: `PO-${po.id} has been exported as PDF`,
      variant: "success",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Purchase Order - {po.id}</DialogTitle>
            {getStatusBadge(po.status, po.received, po.items[0].quantity)}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 p-1">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Supplier</h3>
                <div className="font-medium">{po.supplier}</div>
                <div className="text-sm">{po.supplierContact}</div>
                <div className="text-sm text-muted-foreground">{po.supplierEmail}</div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Details</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>Order Date:</div>
                  <div className="font-medium">{po.date}</div>

                  <div>Due Date:</div>
                  <div className="font-medium">{po.dueDate}</div>

                  <div>Payment Terms:</div>
                  <div className="font-medium">{po.paymentTerms}</div>

                  <div>Priority:</div>
                  <div className="font-medium capitalize">{po.priority}</div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Items</h3>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium">Material</th>
                      <th className="h-10 px-4 text-right align-middle font-medium">Quantity</th>
                      <th className="h-10 px-4 text-right align-middle font-medium">Unit Price</th>
                      <th className="h-10 px-4 text-right align-middle font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-4">{item.material}</td>
                        <td className="p-4 text-right">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-4 text-right">
                          {item.price.toFixed(2)} {po.currency}
                        </td>
                        <td className="p-4 text-right font-medium">
                          {(item.price * item.quantity).toFixed(2)} {po.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-b">
                      <td colSpan={3} className="p-4 text-right font-medium">
                        Total:
                      </td>
                      <td className="p-4 text-right font-bold">
                        {totalValue.toFixed(2)} {po.currency}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {po.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                  <div className="p-3 rounded-md bg-muted/50">{po.notes}</div>
                </div>
              </>
            )}

            {po.status === "cancelled" && po.cancelReason && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-red-500 mb-2">Cancellation Reason</h3>
                  <div className="p-3 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {po.cancelReason}
                  </div>
                </div>
              </>
            )}

            {po.status === "completed" && po.receivedDate && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-green-500 mb-2">Delivery Information</h3>
                  <div className="p-3 rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Order received on {po.receivedDate}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
