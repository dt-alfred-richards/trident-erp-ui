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

interface AttendanceRecord {
  id: number
  employeeId: string
  employeeName: string
  date: string
  checkIn?: string
  checkOut?: string
  totalHours?: string
  status: "present" | "absent"
}

interface EditAttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: AttendanceRecord
  onUpdate: (updatedAttendance: AttendanceRecord) => void
}

export function EditAttendanceDialog({ open, onOpenChange, attendance, onUpdate }: EditAttendanceDialogProps) {
  const [formData, setFormData] = useState<AttendanceRecord>({
    id: 0,
    employeeId: "",
    employeeName: "",
    date: "",
    checkIn: "",
    checkOut: "",
    totalHours: "",
    status: "present",
  })

  useEffect(() => {
    if (attendance) {
      setFormData({
        ...attendance,
      })
    }
  }, [attendance])

  const handleChange = (field: "checkIn" | "checkOut", value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Calculate total hours when check-in or check-out changes
      if (updated.checkIn && updated.checkOut) {
        updated.totalHours = calculateTotalHours(updated.checkIn, updated.checkOut)
      }

      return updated
    })
  }

  const calculateTotalHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return undefined

    const [inHours, inMinutes] = checkIn.split(":").map(Number)
    const [outHours, outMinutes] = checkOut.split(":").map(Number)

    let totalMinutes = outHours * 60 + outMinutes - (inHours * 60 + inMinutes)
    if (totalMinutes < 0) totalMinutes += 24 * 60 // Handle next day checkout

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  const handleSubmit = () => {
    onUpdate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Time Entries</DialogTitle>
          <DialogDescription>
            Update check-in and check-out times for {formData.employeeName} on{" "}
            {formData.date ? new Date(formData.date).toLocaleDateString() : "selected date"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in Time *</Label>
              <Input
                id="checkIn"
                type="time"
                value={formData.checkIn || ""}
                onChange={(e) => handleChange("checkIn", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out Time *</Label>
              <Input
                id="checkOut"
                type="time"
                value={formData.checkOut || ""}
                onChange={(e) => handleChange("checkOut", e.target.value)}
                required
              />
            </div>
          </div>

          {formData.checkIn && formData.checkOut && (
            <div className="space-y-2">
              <Label>Total Hours</Label>
              <div className="p-2 bg-muted rounded-md font-medium text-center">{formData.totalHours}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update Time Entries</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

