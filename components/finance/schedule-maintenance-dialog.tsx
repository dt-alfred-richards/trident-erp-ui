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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"

export type MaintenanceRecord = {
  id: string
  asset: string
  assetId: string
  type: string
  scheduledDate: string
  completedDate: string
  cost: number
  status: string
  notes: string
  technician: string
}

interface ScheduleMaintenanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScheduleMaintenance: (record: MaintenanceRecord) => void
  assets: Array<{ id: string; name: string }>
}

export function ScheduleMaintenanceDialog({
  open,
  onOpenChange,
  onScheduleMaintenance,
  assets,
}: ScheduleMaintenanceDialogProps) {
  const [formData, setFormData] = useState({
    assetId: "",
    type: "Preventive",
    scheduledDate: format(new Date(), "yyyy-MM-dd"),
    cost: "",
    notes: "",
    technician: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Find the selected asset to get its name
    const selectedAsset = assets.find((asset) => asset.id === formData.assetId)
    if (!selectedAsset) return

    // Generate a new maintenance ID
    const maintenanceId = `MAINT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    const newRecord: MaintenanceRecord = {
      id: maintenanceId,
      asset: selectedAsset.name,
      assetId: formData.assetId,
      type: formData.type,
      scheduledDate: formData.scheduledDate,
      completedDate: "",
      cost: Number.parseFloat(formData.cost) || 0,
      status: "Scheduled",
      notes: formData.notes,
      technician: formData.technician,
    }

    onScheduleMaintenance(newRecord)
    onOpenChange(false)

    // Reset form
    setFormData({
      assetId: "",
      type: "Preventive",
      scheduledDate: format(new Date(), "yyyy-MM-dd"),
      cost: "",
      notes: "",
      technician: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>Enter the details to schedule a new maintenance task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assetId" className="text-right">
                Asset
              </Label>
              <Select value={formData.assetId} onValueChange={(value) => handleChange("assetId", value)} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventive">Preventive</SelectItem>
                  <SelectItem value="Corrective">Corrective</SelectItem>
                  <SelectItem value="Predictive">Predictive</SelectItem>
                  <SelectItem value="Condition-Based">Condition-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scheduledDate" className="text-right">
                Scheduled Date
              </Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleChange("scheduledDate", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost" className="text-right">
                Estimated Cost (₹)
              </Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                className="col-span-3"
                min="0"
                step="1000"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="technician" className="text-right">
                Technician
              </Label>
              <Input
                id="technician"
                value={formData.technician}
                onChange={(e) => handleChange("technician", e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
