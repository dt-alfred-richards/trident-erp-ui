"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { Printer, X, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Order, OrderProduct } from "@/types/order"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useOrders } from "@/contexts/order-context"

interface OrderSummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function OrderSummaryDialog({ open, onOpenChange, order }: OrderSummaryDialogProps) {
  // Calculate order totals
  const subtotal = order?.subtotal || 0
  const taxes = subtotal * 0.18
  const discount = 0 // Could be dynamic in a real app
  const total = subtotal + taxes - discount
  const handlePrint = () => {
    window.print()
  }

  console.log({ order })
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Order Summary</DialogTitle>
          <DialogDescription>
            Order details for <span className="font-medium">{order.id}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="history">Status History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 py-4">
            {/* Order Status */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order Status</h3>
              <StatusBadge status={order.status} />
            </div>

            {/* Customer and Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Details */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium">Customer Details</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <span className="text-sm font-medium">{order.customer}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Contact:</span>
                      <span className="text-sm">{order.customerNumber}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="text-sm">{order.customerEmail}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Information */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium">Order Information</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Order Date:</span>
                      <span className="text-sm">{formatDate(order.orderDate)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Delivery Date:</span>
                      <span className="text-sm">{formatDate(order.deliveryDate)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Order ID:</span>
                      <span className="text-sm font-medium">{order.id}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Reference:</span>
                      <span className="text-sm">{order.reference}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Created By:</span>
                      <span className="text-sm">{order.createdBy}</span>
                    </div>
                    {order.approvedBy && (
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Approved By:</span>
                        <span className="text-sm">{order.approvedBy}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Taxes (18%):</span>
                  <span>₹{taxes.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-2 border-t border-border" />
                <div className="flex justify-between py-2 font-bold">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Details (only for completed orders) */}
            {(order.status === "dispatched" ||
              order.status === "delivered" ||
              order.status === "partial_fulfillment") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Details */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-medium">Payment Details</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-muted-foreground">Payment Method:</span>
                          <span className="text-sm">Bank Transfer</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-muted-foreground">Transaction ID:</span>
                          <span className="text-sm">{"TXN-" + order.id.substring(3)}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-muted-foreground">Amount:</span>
                          <span className="text-sm font-medium">₹{total.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <span className="text-sm text-green-600 font-medium">Paid</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Details */}
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-medium">Shipping Details</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-muted-foreground">Carrier:</span>
                          <span className="text-sm">{order.carrier || "Dhaara Logistics"}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-muted-foreground">Tracking Code:</span>
                          <span className="text-sm">{order.trackingId || "TRK-" + order.id.substring(3)}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <span className="text-sm text-green-600 font-medium">
                            {order.status === "delivered"
                              ? "Delivered"
                              : order.status === "dispatched"
                                ? "In Transit"
                                : "Partially Shipped"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Billing Address */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium">Billing Address</h3>
                  <p className="text-sm">
                    {`${order.customer}
${order.billingAddress}`}
                  </p>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium">Shipping Address</h3>
                  <p className="text-sm">
                    {`${order.customer}
${order.shippingAddress}`}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6 py-4">
            <h3 className="text-lg font-semibold mb-3">Products</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Allocated</TableHead>
                    <TableHead className="text-right">Dispatched</TableHead>
                    <TableHead className="text-right">Delivered</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
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
                      <TableCell className="text-right">{product.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{product.allocated?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-right">{product.dispatched?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-right">{product.delivered?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{(product.quantity * product.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <StatusBadge status={product.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 py-4">
            <h3 className="text-lg font-semibold mb-3">Status History</h3>
            <div className="space-y-4">
              {(order?.statusHistory || []).map((entry, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <StatusBadge status={entry.status} />
                        <span className="ml-2 font-medium">{entry.user}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</span>
                    </div>
                    {entry.note && <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>}
                    {index < order.statusHistory.length - 1 && <Separator className="mt-4" />}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

