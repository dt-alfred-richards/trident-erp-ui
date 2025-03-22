"use client"

import { useState } from "react"
import { CalendarIcon, Filter, Download, Search, Plus, Eye, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AddAttendanceDialog } from "./add-attendance-dialog"
import { EditAttendanceDialog } from "./edit-attendance-dialog"
import { AttendanceCalendar } from "./attendance-calendar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AttendanceData } from "./hr-dashboard"

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
    status: "present",
  },
]

// Sample leave balance data
const leaveBalanceData = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "Rajesh Kumar",
    earnedLeave: 20,
    usedLeave: 10,
    remainingLeave: 10,
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Priya Sharma",
    earnedLeave: 20,
    usedLeave: 6,
    remainingLeave: 14,
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "Amit Patel",
    earnedLeave: 20,
    usedLeave: 12,
    remainingLeave: 8,
  },
  {
    id: 4,
    employeeId: "EMP004",
    employeeName: "Sneha Gupta",
    earnedLeave: 20,
    usedLeave: 4,
    remainingLeave: 16,
  },
  {
    id: 5,
    employeeId: "EMP005",
    employeeName: "Vikram Singh",
    earnedLeave: 20,
    usedLeave: 18,
    remainingLeave: 2,
  },
  {
    id: 6,
    employeeId: "EMP006",
    employeeName: "Neha Verma",
    earnedLeave: 20,
    usedLeave: 8,
    remainingLeave: 12,
  },
]

// Sample past leaves data
const pastLeavesData = {
  EMP001: [
    { date: "2023-09-15", reason: "Personal" },
    { date: "2023-08-22", reason: "Sick" },
    { date: "2023-07-10", reason: "Family Function" },
  ],
  EMP002: [
    { date: "2023-09-05", reason: "Medical Emergency" },
    { date: "2023-08-18", reason: "Personal" },
  ],
  EMP003: [
    { date: "2023-09-25", reason: "Sick" },
    { date: "2023-09-10", reason: "Family Emergency" },
    { date: "2023-08-05", reason: "Personal" },
    { date: "2023-07-15", reason: "Vacation" },
  ],
  EMP004: [{ date: "2023-08-30", reason: "Personal" }],
  EMP005: [
    { date: "2023-09-28", reason: "Sick" },
    { date: "2023-09-20", reason: "Sick" },
    { date: "2023-09-05", reason: "Personal" },
    { date: "2023-08-15", reason: "Family Function" },
    { date: "2023-08-01", reason: "Vacation" },
    { date: "2023-07-20", reason: "Personal" },
  ],
  EMP006: [
    { date: "2023-09-12", reason: "Personal" },
    { date: "2023-08-08", reason: "Sick" },
    { date: "2023-07-05", reason: "Family Function" },
  ],
}

export function AttendanceTracking({ attendanceData }: { attendanceData: AttendanceData[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showAddAttendanceDialog, setShowAddAttendanceDialog] = useState(false)
  const [showBulkImportDialog, setShowBulkImportDialog] = useState(false)
  const [leaveSearchQuery, setLeaveSearchQuery] = useState("")
  const [showPastLeavesDialog, setShowPastLeavesDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null)
  const [showEditAttendanceDialog, setShowEditAttendanceDialog] = useState(false)
  const [attendanceRecords, setAttendanceRecords] = useState([...attendanceData])
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)
  const [calendarEmployee, setCalendarEmployee] = useState<{ id: string; name: string } | null>(null)

  // Filter attendance data based on search query and selected status
  const filteredAttendance = attendanceRecords.filter((record) => {
    const matchesSearch =
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "all" || record.status === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Filter leave balance data based on search query
  const filteredLeaveBalance = leaveBalanceData.filter((record) => {
    return (
      record.employeeId.toLowerCase().includes(leaveSearchQuery.toLowerCase()) ||
      record.employeeName.toLowerCase().includes(leaveSearchQuery.toLowerCase())
    )
  })

  // Handle view past leaves
  const handleViewPastLeaves = (employeeId: string) => {
    setSelectedEmployee(employeeId)
    setShowPastLeavesDialog(true)
  }

  // Handle edit attendance
  const handleEditAttendance = (record: any) => {
    setSelectedAttendance(record)
    setShowEditAttendanceDialog(true)
  }

  // Handle view attendance calendar
  const handleViewCalendar = (employeeId: string, employeeName: string) => {
    setCalendarEmployee({ id: employeeId, name: employeeName })
    setShowCalendarDialog(true)
  }

  // Handle update attendance
  const handleUpdateAttendance = (updatedRecord: any) => {
    setAttendanceRecords(attendanceRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))
    setShowEditAttendanceDialog(false)
  }

  // Calculate total hours
  const calculateTotalHours = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return "-"

    const [inHours, inMinutes] = checkIn.split(":").map(Number)
    const [outHours, outMinutes] = checkOut.split(":").map(Number)

    let totalMinutes = outHours * 60 + outMinutes - (inHours * 60 + inMinutes)
    if (totalMinutes < 0) totalMinutes += 24 * 60 // Handle next day checkout

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours}:${minutes.toString().padStart(2, "0")}`
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
              <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
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

          <div className="flex space-x-2">
            <Button onClick={() => setShowAddAttendanceDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Attendance
            </Button>
            <Button variant="outline" onClick={() => setShowBulkImportDialog(true)}>
              <Download className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
          </div>
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
                      <div className="flex justify-end space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewCalendar(record.employeeId, record.employeeName)}
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Monthly Attendance</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button variant="ghost" size="sm" onClick={() => handleEditAttendance(record)}>
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Leave Balance Table */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle>Leave Balance</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8 h-9 md:w-[200px]"
              value={leaveSearchQuery}
              onChange={(e) => setLeaveSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Earned Leave</TableHead>
                  <TableHead>Used Leave</TableHead>
                  <TableHead>Remaining Leave</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaveBalance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employeeId}</TableCell>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>{record.earnedLeave}</TableCell>
                    <TableCell>{record.usedLeave}</TableCell>
                    <TableCell>
                      <Badge className={record.remainingLeave > 5 ? "bg-green-500" : "bg-amber-500"}>
                        {record.remainingLeave}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewPastLeaves(record.employeeId)}
                        title="View Past Leaves"
                      >
                        <Eye className="h-4 w-4" />
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

      {/* Use the reusable AddAttendanceDialog component */}
      <AddAttendanceDialog open={showAddAttendanceDialog} onOpenChange={setShowAddAttendanceDialog} />

      {/* Edit Attendance Dialog */}
      {selectedAttendance && (
        <EditAttendanceDialog
          open={showEditAttendanceDialog}
          onOpenChange={setShowEditAttendanceDialog}
          attendance={selectedAttendance}
          onUpdate={handleUpdateAttendance}
        />
      )}

      {/* Attendance Calendar Dialog */}
      <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Monthly Attendance - {calendarEmployee?.name}</DialogTitle>
          </DialogHeader>

          {calendarEmployee && (
            <AttendanceCalendar employeeId={calendarEmployee.id} employeeName={calendarEmployee.name} />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImportDialog} onOpenChange={setShowBulkImportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Import Attendance</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="bulkDate"
                name="bulkDate"
                type="date"
                defaultValue={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload CSV File *</Label>
              <Input id="file" name="file" type="file" accept=".csv" required />
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-medium">CSV Format</h4>
              <p className="text-sm text-muted-foreground">
                Your CSV should include: Employee ID, Check-in Time, Check-out Time
              </p>
              <div className="bg-muted p-2 rounded-md text-xs font-mono">
                EMP001,08:30,17:30
                <br />
                EMP002,09:00,18:00
                <br />
                EMP003,08:45,17:45
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkImportDialog(false)}>
              Cancel
            </Button>
            <Button>Import Attendance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Past Leaves Dialog */}
      <Dialog open={showPastLeavesDialog} onOpenChange={setShowPastLeavesDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Past Leaves -{" "}
              {selectedEmployee && leaveBalanceData.find((e) => e.employeeId === selectedEmployee)?.employeeName}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEmployee &&
                    pastLeavesData[selectedEmployee]?.map((leave, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(leave.date).toLocaleDateString()}</TableCell>
                        <TableCell>{leave.reason}</TableCell>
                      </TableRow>
                    ))}
                  {selectedEmployee &&
                    (!pastLeavesData[selectedEmployee] || pastLeavesData[selectedEmployee].length === 0) && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                          No past leaves found for this employee.
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowPastLeavesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

