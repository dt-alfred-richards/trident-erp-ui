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
import { useCallback, useState } from "react"
import { DataByTableName } from "../utils/api"
import { useLogisticsData } from "@/hooks/use-logistics-data"

interface DispatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void,
  triggerRender: VoidFunction,
  order: {
    id: string
    customer: string
  }
}

export function DispatchDialog({ open, onOpenChange, order, triggerRender = () => { } }: DispatchDialogProps) {
  const [selectedCarrier, setSelectedCarrier] = useState<any>()
  const [trackingId, setTrackingId] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = useCallback(async () => {
    const instance = new DataByTableName("fact_logistics");

    instance.patch({ key: 'id', value: order.id }, {
      carrier: selectedCarrier,
      notes,
      trackingId,
      status: "dispatched"
    }).then(res => {
      console.log("Dispatching order:", order.id)
      onOpenChange(false)
      triggerRender();
    }).catch(error => {
      console.log({ error })
    })
  }, [order, notes, trackingId, selectedCarrier])

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
            <Select defaultValue="fedex" onValueChange={value => {
              setSelectedCarrier(value)
            }}>
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
            <Input id="tracking" placeholder="Enter tracking number" className="col-span-3" onChange={event => {
              setTrackingId(event.target.value.trimStart())
            }} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Input id="notes" placeholder="Optional notes" className="col-span-3" onChange={event => setNotes(event.target.value)} />
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

