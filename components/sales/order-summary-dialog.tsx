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
import moment from "moment"
import { convertDate, getChildObject } from "../generic"
import { Employee } from "@/app/hr/hr-context"
import { useState, useRef, useEffect, useMemo } from "react"
import { DataByTableName } from "../api"

interface OrderSummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function OrderSummaryDialog({ open, onOpenChange, order }: OrderSummaryDialogProps) {
  // Calculate order totals
  const subtotal = order.products.reduce((sum, product) => sum + product.price * product.cases, 0)
  const discount = subtotal * 0.05 // Assuming 5% discount, adjust as needed
  const taxableAmount = subtotal - discount
  const cgst = taxableAmount * 0.09
  const sgst = taxableAmount * 0.09
  const taxes = cgst + sgst // Keep total taxes for the final calculation
  const total = taxableAmount + taxes

  const [employees, setEmployees] = useState<Employee[]>([])
  const employeeRef = useRef(true)
  const employeeInstance = new DataByTableName("v1_employee")

  useEffect(() => {
    if (!employeeRef.current) return
    employeeRef.current = false
    employeeInstance.get().then(response => {
      const data = getChildObject(response, "data", [])
      setEmployees(data)
    })
  }, [])

  const employeeMapper = useMemo(() => {
    return employees.reduce((acc: Record<string, Employee>, curr) => {
      if (!acc[curr.id]) acc[curr.id] = curr
      return acc;
    }, {})
  }, [employees])

  const handlePrint = () => {
    window.print()
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return moment(date).format("LL")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Order Summary</DialogTitle>
          <DialogDescription>
            Order details for <span className="font-medium">{`ORDER-${order.id}`}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Order Details</TabsTrigger>
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
                      <span className="text-sm">{"+91 98765 43210"}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="text-sm">{`info@${order.customer.toLowerCase().replace(/\s+/g, "")}.com`}</span>
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
                      <span className="text-sm">{convertDate(order.orderDate)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Delivery Date:</span>
                      <span className="text-sm">{convertDate(order.deliveryDate)}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Order ID:</span>
                      <span className="text-sm font-medium">{order.id}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">{order.isEmployeeChecked ? "Employee reference:" : "Reference:"}</span>
                      <span className="text-sm">{order.isEmployeeChecked ? getChildObject(employeeMapper, `${order.employeeReferenceId}.firstName`, '') : order.reference}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="text-sm text-muted-foreground">Created By:</span>
                      <span className="text-sm">{order.createdBy}</span>
                    </div>
                    {order.modifiedBy && (
                      <div className="grid grid-cols-2">
                        <span className="text-sm text-muted-foreground">Approved By:</span>
                        <span className="text-sm">{order.modifiedBy}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Products</h3>
              <div className="border rounded-md mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
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
                        <TableCell className="text-right">{product.cases.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{product?.category || ''}</TableCell>
                        <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{(product.cases * product.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="flex justify-end">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Discount:</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">CGST (9%):</span>
                  <span>₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">SGST (9%):</span>
                  <span>₹{sgst.toFixed(2)}</span>
                </div>
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
                    <div>{order.customer}</div>
                    <div>{order.shippingAddressId}</div>
                  </p>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium">Shipping Address</h3>
                  <p className="text-sm">
                    <div>{order.customer}</div>
                    <div>{order.shippingAddressId}</div>
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 py-4">
            <h3 className="text-lg font-semibold mb-3">Status History</h3>
            <div className="space-y-4">
              {order.statusHistory.map((entry, index) => (
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
