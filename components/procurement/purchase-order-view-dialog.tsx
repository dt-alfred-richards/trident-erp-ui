"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, CheckCircle2, AlertTriangle, Printer, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useMemo } from "react"
import { PurchaseContextType, useProcurements } from "./procurement-context"
import moment from "moment"

interface PurchaseOrderViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poId: string
}

// Mock data for a purchase order
const getPurchaseOrderData = (poId: string) => {
  const orders = {
    "PO-001": {
      id: "PO-001",
      supplier: "PlastiCorp Inc.",
      supplierContact: "John Smith",
      supplierEmail: "john.smith@plasticorp.com",
      date: "2023-06-01",
      dueDate: "2023-06-08",
      status: "pending",
      currency: "USD",
      paymentTerms: "Net 30",
      priority: "normal",
      notes: "Please ensure all materials meet our quality standards.",
      items: [
        {
          material: "Plastic Resin",
          quantity: 500,
          unit: "kg",
          price: 5.0,
        },
      ],
    },
    "PO-002": {
      id: "PO-002",
      supplier: "CapMakers Ltd.",
      supplierContact: "Jane Doe",
      supplierEmail: "jane.doe@capmakers.com",
      date: "2023-06-02",
      dueDate: "2023-06-09",
      status: "partial",
      received: 5000,
      currency: "USD",
      paymentTerms: "Net 45",
      priority: "high",
      notes: "Urgent order for production line A.",
      items: [
        {
          material: "Bottle Caps",
          quantity: 10000,
          unit: "pcs",
          price: 0.1,
        },
      ],
    },
    "PO-003": {
      id: "PO-003",
      supplier: "Adhesive Solutions",
      supplierContact: "Robert Johnson",
      supplierEmail: "robert@adhesivesolutions.com",
      date: "2023-06-03",
      dueDate: "2023-06-10",
      status: "pending",
      currency: "USD",
      paymentTerms: "Net 30",
      priority: "normal",
      notes: "",
      items: [
        {
          material: "Label Adhesive",
          quantity: 100,
          unit: "liters",
          price: 15.0,
        },
      ],
    },
    "PO-004": {
      id: "PO-004",
      supplier: "Packaging Experts",
      supplierContact: "Sarah Williams",
      supplierEmail: "sarah@packagingexperts.com",
      date: "2023-05-28",
      dueDate: "2023-06-05",
      status: "completed",
      receivedDate: "2023-06-04",
      currency: "USD",
      paymentTerms: "Net 15",
      priority: "low",
      notes: "Standard order for Q2.",
      items: [
        {
          material: "Cardboard Boxes",
          quantity: 1000,
          unit: "pcs",
          price: 0.8,
        },
      ],
    },
    "PO-005": {
      id: "PO-005",
      supplier: "Label Masters",
      supplierContact: "Michael Brown",
      supplierEmail: "michael@labelmasters.com",
      date: "2023-05-30",
      dueDate: "2023-06-07",
      status: "cancelled",
      cancelledDate: "2023-06-01",
      cancelReason: "Supplier unable to fulfill order by required date.",
      currency: "USD",
      paymentTerms: "Net 30",
      priority: "normal",
      notes: "",
      items: [
        {
          material: "Product Labels",
          quantity: 5000,
          unit: "sheets",
          price: 0.24,
        },
      ],
    },
  }

  return orders[poId as keyof typeof orders]
}

export function PurchaseOrderViewDialog({ open, onOpenChange, poId }: PurchaseOrderViewDialogProps) {
  const { purchaseOrders, suppliers = {}, rawMaterials = {} } = useProcurements();
  const po = useMemo(() => {
    const order = purchaseOrders.find(item => item.purchaseId === poId);
    const { name, contactNumber, email } = suppliers[order?.supplierId || ""] || {}
    return {
      id: order?.purchaseId,
      supplier: name,
      supplierContact: contactNumber,
      supplierEmail: email,
      date: moment(order?.createdOn).format('YYYY-MM-DD'),
      dueDate: moment(order?.expectedDeliveryDate).format('YYYY-MM-DD'),
      status: order?.status,
      currency: order?.currency,
      paymentTerms: order?.paymentTerms,
      priority: order?.priority,
      notes: order?.notes,
      items: purchaseOrders.filter(item => item.purchaseId === poId).map((item: PurchaseContextType["purchaseOrders"][0]) => ({
        material: rawMaterials[item.materialId].name,
        quantity: item.quantity,
        unit: rawMaterials[item.materialId].units,
        price: item.price || 0,
      }))
    }
  }, [poId])

  const { toast } = useToast()

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Purchase Order {po.id}</DialogTitle>
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
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                toast({
                  title: "Preparing print view",
                  description: "Opening print dialog for PO-" + po.id,
                })
                // Use setTimeout to allow the toast to show before opening print dialog
                setTimeout(() => {
                  window.print()
                }, 500)
              }}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                toast({
                  title: "Exporting purchase order",
                  description: `PO-${po.id} has been exported as PDF`,
                  variant: "success",
                })
              }}
            >
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

