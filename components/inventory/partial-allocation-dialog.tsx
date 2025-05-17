"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PartialAllocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: string
    customer: string
    sku: string
    quantity: number
  }
  availableStock: number
  onConfirm: (quantity: number, reason: string) => void
}

export function PartialAllocationDialog({
  open,
  onOpenChange,
  order,
  availableStock,
  onConfirm,
}: PartialAllocationDialogProps) {
  const [quantity, setQuantity] = useState<string>(availableStock.toString())
  const [reason, setReason] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm(Number.parseInt(quantity) || 0, reason)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Partial Allocation</DialogTitle>
          <DialogDescription>
            The requested quantity exceeds available stock. You can allocate a partial amount.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limited Stock Available</AlertTitle>
          <AlertDescription>
            Order {order.id} requests {order.quantity} units, but only {availableStock} are available.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order-details" className="text-right">
                Order
              </Label>
              <div id="order-details" className="col-span-3">
                <p className="font-medium">
                  {order.id} - {order.customer}
                </p>
                <p className="text-sm text-muted-foreground">SKU: {order.sku}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Allocate
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                  max={availableStock}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  of {order.quantity} requested ({availableStock} available)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="reason" className="text-right pt-2">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this order is receiving partial allocation"
                className="col-span-3 h-20"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Allocation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
