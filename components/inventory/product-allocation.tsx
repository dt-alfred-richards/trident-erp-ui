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
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ProductAllocation() {
  const { orders, allocateInventory } = useOrders()
  const [selectedOrderId, setSelectedOrderId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filter for eligible orders (pending_approval or approved)
  const eligibleOrders = orders.filter(
    (order) =>
      order.status === "pending_approval" ||
      order.status === "approved" ||
      order.status === "partial_fulfillment" ||
      order.status === "ready",
  )

  // Get the selected order
  const selectedOrder = eligibleOrders.find((order) => order.id === selectedOrderId)

  // Get products eligible for allocation (pending, partially_ready)
  const eligibleProducts =
    selectedOrder?.products.filter((product) => product.status === "pending" || product.status === "partially_ready") ||
    []

  // Handle allocation
  const handleAllocate = (productId: string, quantity: number) => {
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

      allocateInventory(selectedOrderId, productId, quantity)
      setSuccessMessage(`Allocated ${quantity} units successfully`)

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
          <CardTitle>Product Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-select">Select Order</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger id="order-select">
                  <SelectValue placeholder="Select order to allocate" />
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
                      <TableHead className="text-right">Ordered</TableHead>
                      <TableHead className="text-right">Currently Allocated</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.products.map((product) => {
                      const allocated = product.allocated || 0
                      const remaining = product.quantity - allocated
                      const isEligible = eligibleProducts.some((p) => p.id === product.id)

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right">{allocated}</TableCell>
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
                                  id={`alloc-${product.id}`}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const input = document.getElementById(`alloc-${product.id}`) as HTMLInputElement
                                    const quantity = Number.parseInt(input.value)
                                    handleAllocate(product.id, quantity)
                                  }}
                                >
                                  Allocate
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {remaining === 0 ? "Fully Allocated" : "Not Available"}
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
