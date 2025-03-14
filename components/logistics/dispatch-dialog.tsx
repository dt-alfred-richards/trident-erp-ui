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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DispatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: string
    customer: string
  }
}

export function DispatchDialog({ open, onOpenChange, order }: DispatchDialogProps) {
  const handleSubmit = () => {
    // In a real app, this would submit the dispatch information
    console.log("Dispatching order:", order.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispatch Order {order.id}</DialogTitle>
          <DialogDescription>Assign a delivery partner and create a shipment.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="carrier" className="text-right">
              Carrier
            </Label>
            <Select defaultValue="fedex">
              <SelectTrigger id="carrier" className="col-span-3">
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fedex">FedEx</SelectItem>
                <SelectItem value="ups">UPS</SelectItem>
                <SelectItem value="dhl">DHL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tracking" className="text-right">
              Tracking ID
            </Label>
            <Input id="tracking" placeholder="Enter tracking number" className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Input id="notes" placeholder="Optional notes" className="col-span-3" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Mark as Dispatched
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

