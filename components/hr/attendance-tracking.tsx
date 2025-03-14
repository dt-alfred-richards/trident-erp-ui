"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Filter, Download, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Sample attendance data
const attendanceData = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "Rajesh Kumar",
    date: "2023-10-25",
    checkIn: "08:55",
    checkOut: "17:05",
    totalHours: "8:10",
    breakDuration: "00:30",
    status: "present",
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Priya Sharma",
    date: "2023-10-25",
    checkIn: "08:50",
    checkOut: "17:30",
    totalHours: "8:40",
    breakDuration: "00:30",
    status: "present",
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "Amit Patel",
    date: "2023-10-25",
    checkIn: "08:45",
    checkOut: "17:15",
    totalHours: "8:30",
    breakDuration: "00:30",
    status: "present",
  },
  {
    id: 4,
    employeeId: "EMP004",
    employeeName: "Sneha Gupta",
    date: "2023-10-25",
    checkIn: "14:00",
    checkOut: "22:05",
    totalHours: "8:05",
    breakDuration: "00:30",
    status: "present",
  },
  {
    id: 5,
    employeeId: "EMP005",
    employeeName: "Vikram Singh",
    date: "2023-10-25",
    status: "absent",
  },
  {
    id: 6,
    employeeId: "EMP006",
    employeeName: "Neha Verma",
    date: "2023-10-25",
    checkIn: "09:10",
    checkOut: "18:05",
    totalHours: "8:55",
    breakDuration: "00:30",
    status: "present",
  },
]

export function AttendanceTracking() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showAddAttendanceDialog, setShowAddAttendanceDialog] = useState(false)
  const [newAttendance, setNewAttendance] = useState({
    employeeId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    checkIn: "",
    checkOut: "",
    breakDuration: "00:30",
  })

  // Filter attendance data based on search query and selected status
  const filteredAttendance = attendanceData.filter((record) => {
    const matchesSearch =
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "all" || record.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleAddAttendanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewAttendance((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddAttendance = () => {
    // Validation logic would go here
    console.log("New attendance:", newAttendance)
    setShowAddAttendanceDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h3 className="text-lg font-medium">Attendance Tracking</h3>
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8 h-9 md:w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-9 w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <span>Status</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setShowAddAttendanceDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Attendance
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Daily Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Check-out Time</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employeeId}</TableCell>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.checkIn || "-"}</TableCell>
                    <TableCell>{record.checkOut || "-"}</TableCell>
                    <TableCell>{record.totalHours || "-"}</TableCell>
                    <TableCell>
                      {record.status === "present" ? (
                        <Badge className="bg-green-500">Present</Badge>
                      ) : (
                        <Badge variant="destructive">Absent</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Attendance
        </Button>
      </div>

      {/* Add Attendance Dialog */}
      <Dialog open={showAddAttendanceDialog} onOpenChange={setShowAddAttendanceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Attendance</DialogTitle>
            <DialogDescription>Enter attendance details for an employee</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Select
                value={newAttendance.employeeId}
                onValueChange={(value) => setNewAttendance((prev) => ({ ...prev, employeeId: value }))}
              >
                <SelectTrigger id="employeeId">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMP001">EMP001 - Rajesh Kumar</SelectItem>
                  <SelectItem value="EMP002">EMP002 - Priya Sharma</SelectItem>
                  <SelectItem value="EMP003">EMP003 - Amit Patel</SelectItem>
                  <SelectItem value="EMP004">EMP004 - Sneha Gupta</SelectItem>
                  <SelectItem value="EMP005">EMP005 - Vikram Singh</SelectItem>
                  <SelectItem value="EMP006">EMP006 - Neha Verma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={newAttendance.date}
                onChange={handleAddAttendanceChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in Time *</Label>
                <Input
                  id="checkIn"
                  name="checkIn"
                  type="time"
                  value={newAttendance.checkIn}
                  onChange={handleAddAttendanceChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out Time *</Label>
                <Input
                  id="checkOut"
                  name="checkOut"
                  type="time"
                  value={newAttendance.checkOut}
                  onChange={handleAddAttendanceChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breakDuration">Break Duration (HH:MM)</Label>
              <Input
                id="breakDuration"
                name="breakDuration"
                type="text"
                value={newAttendance.breakDuration}
                onChange={handleAddAttendanceChange}
                placeholder="00:30"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAttendanceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAttendance}>Add Attendance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

