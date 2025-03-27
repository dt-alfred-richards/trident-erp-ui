"use client"

import type React from "react"

import { useMemo, useState } from "react"
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
import { format, isFuture, isToday } from "date-fns"
import { CalendarIcon, Check, Search } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { AttendanceData } from "./hr-dashboard"
import { useHrContext } from "@/contexts/hr-context"

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
  const { employeeDetails, refetchData } = useHrContext();

  const employees = useMemo(() => {
    return employeeDetails.map(item => ({ label: `${item.id}-${item.firstName}`, value: item.id }))
  }, [employeeDetails])

  const { toast } = useToast()
  const [openCombobox, setOpenCombobox] = useState(false)
  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    date: format(new Date(), "yyyy-MM-dd"),
    checkIn: "",
    checkOut: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }



  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      if (isFuture(date) && !isToday(date)) {
        setErrors((prev) => ({ ...prev, date: "Cannot select future dates" }))
        return
      }

      setSelectedDate(date)
      setFormData((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }))

      // Clear date error if it exists
      if (errors.date) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.date
          return newErrors
        })
      }
    }
    setOpenDatePicker(false)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.employeeId) {
      newErrors.employeeId = "Employee is required"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    }

    if (!formData.checkIn) {
      newErrors.checkIn = "Check-in time is required"
    }

    if (!formData.checkOut) {
      newErrors.checkOut = "Check-out time is required"
    } else if (formData.checkIn && formData.checkOut && formData.checkIn > formData.checkOut) {
      newErrors.checkOut = "Check-out time must be after check-in time"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateTotalHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return ""

    const [inHours, inMinutes] = checkIn.split(":").map(Number)
    const [outHours, outMinutes] = checkOut.split(":").map(Number)

    let totalMinutes = outHours * 60 + outMinutes - (inHours * 60 + inMinutes)
    if (totalMinutes < 0) totalMinutes += 24 * 60 // Handle next day checkout

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    // Find employee name from the selected ID
    const selectedEmployee = employees.find((emp) => emp.value === formData.employeeId)
    if (!selectedEmployee) {
      setErrors((prev) => ({ ...prev, employeeId: "Invalid employee selected" }))
      return
    }

    // Extract just the name part from "EMPXXX - Name"
    const employeeName = selectedEmployee.label.split(" - ")[1]

    // Create new attendance record
    const newAttendance: Omit<AttendanceData, "id"> = {
      employeeId: formData.employeeId,
      employeeName,
      date: formData.date,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      totalHours: calculateTotalHours(formData.checkIn, formData.checkOut),
      status: "present",
    }

    // Add the new attendance record
    onAddAttendance(newAttendance)

    // Show success toast
    toast({
      title: "Attendance Added",
      description: `Attendance for ${employeeName} has been recorded successfully.`,
    })

    // Reset form and close dialog
    setFormData({
      employeeId: "",
      employeeName: "",
      date: format(new Date(), "yyyy-MM-dd"),
      checkIn: "",
      checkOut: "",
    })
    setSelectedDate(new Date())
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
                  className={cn("w-full justify-between", errors.employeeId && "border-red-500")}
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
                            if (errors.employeeId) {
                              setErrors((prev) => {
                                const newErrors = { ...prev }
                                delete newErrors.employeeId
                                return newErrors
                              })
                            }
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
            {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                    errors.date && "border-red-500",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => isFuture(date) && !isToday(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
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
                className={cn(errors.checkIn && "border-red-500")}
              />
              {errors.checkIn && <p className="text-sm text-red-500">{errors.checkIn}</p>}
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
                className={cn(errors.checkOut && "border-red-500")}
              />
              {errors.checkOut && <p className="text-sm text-red-500">{errors.checkOut}</p>}
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

