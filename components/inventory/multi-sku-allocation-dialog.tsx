"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Product {
  id: string
  sku: string
  name: string
  quantity: number
  allocated?: number
}

interface Order {
  id: string
  customer: string
  dueDate: string
  priority: string
  status: string
  products: Product[]
}

interface MultiSkuAllocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  availableStock: Record<string, number>
  onConfirm: (allocations: Record<string, number>) => void
}

export function MultiSkuAllocationDialog({
  open,
  onOpenChange,
  order,
  availableStock,
  onConfirm,
}: MultiSkuAllocationDialogProps) {
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset allocations when order changes
  useEffect(() => {
    if (order) {
      const initialAllocations: Record<string, number> = {}
      order.products.forEach((product) => {
        initialAllocations[product.id] = 0
      })
      setAllocations(initialAllocations)
      setErrors({})
    }
  }, [order])

  if (!order) return null

  // Handle allocation change
  const handleAllocationChange = (productId: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    const product = order.products.find((p) => p.id === productId)

    if (!product) return

    // Calculate pending quantity (total quantity minus already allocated)
    const pendingQuantity = product.quantity - (product.allocated || 0)

    // Validate allocation
    let error = ""
    if (numValue > pendingQuantity) {
      error = "Cannot allocate more than pending quantity"
    } else if (numValue > (availableStock[product.sku] || 0)) {
      error = "Insufficient stock available"
    }

    // Update allocations and errors
    setAllocations((prev) => ({
      ...prev,
      [productId]: numValue,
    }))

    setErrors((prev) => ({
      ...prev,
      [productId]: error,
    }))
  }

  // Calculate pending quantity for a product
  const getPendingQuantity = (product: Product) => {
    return product.quantity - (product.allocated || 0)
  }

  // Check if any product has an error
  const hasErrors = Object.values(errors).some((error) => error !== "")

  // Check if any allocation is greater than zero
  const hasAllocations = Object.values(allocations).some((allocation) => allocation > 0)

  // Calculate total allocations
  const totalAllocations = Object.values(allocations).reduce((sum, allocation) => sum + allocation, 0)

  // Handle confirm
  const handleConfirm = () => {
    if (hasErrors || !hasAllocations) return
    onConfirm(allocations)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Allocate Stock for Order {order.id}</DialogTitle>
          <DialogDescription>
            Customer: {order.customer} | Due Date: {new Date(order.dueDate).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Allocate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.products.map((product) => {
                const pendingQuantity = getPendingQuantity(product)
                const isFullyAllocated = pendingQuantity <= 0

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">
                      {pendingQuantity}
                      {isFullyAllocated && (
                        <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">Fully Allocated</Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        (availableStock[product.sku] || 0) < pendingQuantity ? "text-amber-600 font-medium" : ""
                      }`}
                    >
                      {availableStock[product.sku]?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Input
                          type="number"
                          value={allocations[product.id] || ""}
                          onChange={(e) => handleAllocationChange(product.id, e.target.value)}
                          className={`w-24 text-right ${errors[product.id] ? "border-red-500" : ""}`}
                          min="0"
                          max={Math.min(pendingQuantity, availableStock[product.sku] || 0)}
                          disabled={isFullyAllocated}
                        />
                        {pendingQuantity > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleAllocationChange(
                                product.id,
                                Math.min(pendingQuantity, availableStock[product.sku] || 0).toString(),
                              )
                            }
                            disabled={isFullyAllocated || (availableStock[product.sku] || 0) <= 0}
                          >
                            Max
                          </Button>
                        )}
                      </div>
                      {errors[product.id] && <p className="text-xs text-red-500 mt-1">{errors[product.id]}</p>}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {hasErrors && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please correct the errors before confirming allocation.</AlertDescription>
          </Alert>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Allocating <span className="font-medium">{totalAllocations}</span> units across{" "}
            <span className="font-medium">{Object.values(allocations).filter((a) => a > 0).length}</span> products
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={hasErrors || !hasAllocations}>
            Confirm Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
