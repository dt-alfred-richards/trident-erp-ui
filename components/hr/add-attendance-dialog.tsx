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
import { format } from "date-fns"
import { Check, Search } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

// Sample employees data for the combobox
const employees = [
  { value: "EMP001", label: "EMP001 - Rajesh Kumar" },
  { value: "EMP002", label: "EMP002 - Priya Sharma" },
  { value: "EMP003", label: "EMP003 - Amit Patel" },
  { value: "EMP004", label: "EMP004 - Sneha Gupta" },
  { value: "EMP005", label: "EMP005 - Vikram Singh" },
  { value: "EMP006", label: "EMP006 - Neha Verma" },
  { value: "EMP007", label: "EMP007 - Arun Joshi" },
  { value: "EMP008", label: "EMP008 - Meera Reddy" },
  { value: "EMP009", label: "EMP009 - Sanjay Gupta" },
  { value: "EMP010", label: "EMP010 - Ananya Desai" },
]

interface AddAttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddAttendanceDialog({ open, onOpenChange }: AddAttendanceDialogProps) {
  const [openCombobox, setOpenCombobox] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    checkIn: "",
    checkOut: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    // Validation logic would go here
    console.log("New attendance:", formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Attendance</DialogTitle>
          <DialogDescription>Enter attendance details for an employee</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID *</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between"
                >
                  {formData.employeeId
                    ? employees.find((employee) => employee.value === formData.employeeId)?.label
                    : "Select employee..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search employee..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {employees.map((employee) => (
                        <CommandItem
                          key={employee.value}
                          value={employee.label}
                          onSelect={() => {
                            setFormData((prev) => ({ ...prev, employeeId: employee.value }))
                            setOpenCombobox(false)
                          }}
                        >
                          {employee.label}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              formData.employeeId === employee.value ? "opacity-100" : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in Time *</Label>
              <Input
                id="checkIn"
                name="checkIn"
                type="time"
                value={formData.checkIn}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out Time *</Label>
              <Input
                id="checkOut"
                name="checkOut"
                type="time"
                value={formData.checkOut}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Attendance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

