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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import type { MaintenanceRecord } from "./schedule-maintenance-dialog"

interface ViewMaintenanceDialogProps {
  record: MaintenanceRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (updatedRecord: MaintenanceRecord) => void
}

export function ViewMaintenanceDialog({ record, open, onOpenChange, onUpdate }: ViewMaintenanceDialogProps) {
  const [editableRecord, setEditableRecord] = useState<MaintenanceRecord | null>(null)

  useEffect(() => {
    if (record) {
      setEditableRecord({ ...record })
    }
  }, [record])

  if (!editableRecord) return null

  const handleChange = (field: keyof MaintenanceRecord, value: any) => {
    setEditableRecord((prev) => {
      if (!prev) return prev
      return { ...prev, [field]: value }
    })
  }

  const handleSave = () => {
    if (editableRecord) {
      // If the status is changed to completed and no completed date is set, set it to today
      const updatedRecord = { ...editableRecord }
      if (updatedRecord.status === "Completed" && !updatedRecord.completedDate) {
        updatedRecord.completedDate = new Date().toISOString().split("T")[0]
      }

      onUpdate(updatedRecord)
      toast({
        title: "Maintenance Record Updated",
        description: `Maintenance record for ${updatedRecord.asset} has been updated.`,
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">Maintenance Details</DialogTitle>
          <DialogDescription>View or edit maintenance information.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1 flex-grow">
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-full mr-4">
                <Label htmlFor="id">Maintenance ID</Label>
                <Input id="id" value={editableRecord.id} disabled />
              </div>
              <div className="min-w-[150px]">
                <Label htmlFor="status" className="mb-2 block">
                  Status
                </Label>
                <Select value={editableRecord.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="asset" className="mb-2 block">
                  Asset
                </Label>
                <Input id="asset" value={editableRecord.asset} disabled />
              </div>
              <div>
                <Label htmlFor="assetId" className="mb-2 block">
                  Asset ID
                </Label>
                <Input id="assetId" value={editableRecord.assetId} disabled />
              </div>
              <div>
                <Label htmlFor="type" className="mb-2 block">
                  Maintenance Type
                </Label>
                <Select value={editableRecord.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Preventive">Preventive</SelectItem>
                    <SelectItem value="Corrective">Corrective</SelectItem>
                    <SelectItem value="Predictive">Predictive</SelectItem>
                    <SelectItem value="Condition-Based">Condition-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="technician" className="mb-2 block">
                  Technician
                </Label>
                <Input
                  id="technician"
                  value={editableRecord.technician}
                  onChange={(e) => handleChange("technician", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="scheduledDate" className="mb-2 block">
                  Scheduled Date
                </Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={editableRecord.scheduledDate}
                  onChange={(e) => handleChange("scheduledDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="completedDate" className="mb-2 block">
                  Completed Date
                </Label>
                <Input
                  id="completedDate"
                  type="date"
                  value={editableRecord.completedDate}
                  onChange={(e) => handleChange("completedDate", e.target.value)}
                  disabled={editableRecord.status !== "Completed"}
                />
              </div>
              <div>
                <Label htmlFor="cost" className="mb-2 block">
                  Cost (₹)
                </Label>
                <Input
                  id="cost"
                  type="number"
                  value={editableRecord.cost}
                  onChange={(e) => handleChange("cost", Number.parseFloat(e.target.value))}
                />
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="notes" className="mb-2 block">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={editableRecord.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-black hover:bg-gray-800 text-white">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
