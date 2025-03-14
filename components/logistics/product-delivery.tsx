"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { useOrders } from "@/contexts/order-context"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ProductDelivery() {
  const { orders, deliverProducts } = useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filter for eligible orders (dispatched, partial_fulfillment)
  const eligibleOrders = orders.filter(
    (order) => order.status === "dispatched" || order.status === "partial_fulfillment" || order.status === "delivered",
  )

  // Get the selected order
  const selectedOrder = eligibleOrders.find((order) => order.id === selectedOrderId)

  // Get products eligible for delivery (dispatched, partially_dispatched, partially_delivered)
  const eligibleProducts =
    selectedOrder?.products.filter(
      (product) =>
        product.status === "dispatched" ||
        product.status === "partially_dispatched" ||
        product.status === "partially_delivered",
    ) || []

  // Handle delivery
  const handleDeliver = (productId: string, quantity: number) => {
    try {
      setError(null)

      if (!selectedOrder) {
        setError("No order selected")
        return
      }

      if (quantity <= 0) {
        setError("Quantity must be greater than zero")
        return
      }

      deliverProducts(selectedOrderId, productId, quantity)
      setSuccessMessage(`Delivered ${quantity} units successfully`)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-select">Select Order</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger id="order-select">
                  <SelectValue placeholder="Select order to mark as delivered" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {selectedOrder && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{selectedOrder.customer}</h3>
                    <p className="text-sm text-muted-foreground">Order ID: {selectedOrder.id}</p>
                  </div>
                  <StatusBadge status={selectedOrder.status} />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Dispatched</TableHead>
                      <TableHead className="text-right">Delivered</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.products.map((product) => {
                      const dispatched = product.dispatched || 0
                      const delivered = product.delivered || 0
                      const remaining = dispatched - delivered
                      const isEligible = eligibleProducts.some((p) => p.id === product.id)

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{dispatched}</TableCell>
                          <TableCell className="text-right">{delivered}</TableCell>
                          <TableCell className="text-right">{remaining}</TableCell>
                          <TableCell>
                            <StatusBadge status={product.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            {isEligible && remaining > 0 ? (
                              <div className="flex items-center justify-end gap-2">
                                <Input
                                  type="number"
                                  placeholder="Qty"
                                  className="w-20"
                                  min={1}
                                  max={remaining}
                                  id={`deliver-${product.id}`}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const input = document.getElementById(`deliver-${product.id}`) as HTMLInputElement
                                    const quantity = Number.parseInt(input.value)
                                    handleDeliver(product.id, quantity)
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Deliver
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {dispatched === 0
                                  ? "Not Dispatched"
                                  : remaining === 0
                                    ? "Fully Delivered"
                                    : "Not Available"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

