"use client"

import { type Dispatch, type SetStateAction, useCallback, useMemo, useState, useEffect } from "react"
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
import { AttendanceData, useHrContext } from "@/contexts/hr-context"
import { Pagination } from "../ui/pagination"
import moment from "moment"

type Leavebalance = {
  id: number,
  employeeId: string,
  employeeName: string,
  earnedLeave: number,
  usedLeave: number,
  remainingLeave: number
}

type PastleavesData = Record<string, {
  date: string, reason: string
}[]>


export function AttendanceTracking() {
  const { attendanceDetails, refetchData, employeeDetails, empLeaves } = useHrContext();
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
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceData[]>([])
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)
  const [calendarEmployee, setCalendarEmployee] = useState<{ id: string; name: string } | null>(null)
  const [leaveBalanceData, setLeaveBalanceData] = useState<Leavebalance[]>([])
  const [pastLeavesData, setPastLeavesData] = useState<PastleavesData>({})

  useEffect(() => {
    if (employeeDetails.length === 0) return
    const _leaveBalanceData = employeeDetails.map((item, index) => ({
      id: index,
      employeeId: item.id,
      employeeName: [item.firstName, item.lastName].filter(item => item).join(""),
      earnedLeave: item.earnedLeaves,
      usedLeave: item.usedLeaves,
      remainingLeave: Math.abs(item.earnedLeaves - item.usedLeaves) || 0,
    }) as Leavebalance)
    setPastLeavesData(
      empLeaves.reduce((a, c) => {
        if (!a[c.employeeId]) {
          a[c.employeeId] = [];
        }
        a[c.employeeId].push({
          date: moment(c.date).format('DD-MM-YYYY'),
          reason: c.reason
        })
        return a;
      }, {} as PastleavesData)
    )
    setLeaveBalanceData(_leaveBalanceData)
  }, [employeeDetails])
  // Pagination state
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1)
  const [leaveCurrentPage, setLeaveCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    if (attendanceRecords.length == 0) {
      setAttendanceRecords([...attendanceDetails].slice(0, 100))
    }
  }, [attendanceDetails])

  // Filter attendance data based on search query and selected status
  const filteredAttendance = useMemo(
    () =>
      attendanceRecords.filter((record) => {
        const matchesSearch =
          record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.employeeName.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = selectedStatus === "all" || record.status === selectedStatus

        return matchesSearch && matchesStatus
      }),
    [attendanceRecords, searchQuery, selectedStatus],
  )

  // Filter leave balance data based on search query
  const filteredLeaveBalance = useMemo(
    () =>
      leaveBalanceData.filter((record) => {
        return (
          record.employeeId.toLowerCase().includes(leaveSearchQuery.toLowerCase()) ||
          record.employeeName.toLowerCase().includes(leaveSearchQuery.toLowerCase())
        )
      }),
    [leaveSearchQuery, leaveBalanceData],
  )

  // Calculate paginated data for both tables
  const paginatedAttendance = useMemo(() => {
    const startIndex = (attendanceCurrentPage - 1) * itemsPerPage
    return filteredAttendance.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAttendance, attendanceCurrentPage, itemsPerPage])

  const paginatedLeaveBalance = useMemo(() => {
    const startIndex = (leaveCurrentPage - 1) * itemsPerPage
    return filteredLeaveBalance.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredLeaveBalance, leaveCurrentPage, itemsPerPage])

  // Reset to first page when filters change
  useEffect(() => {
    setAttendanceCurrentPage(1)
  }, [searchQuery, selectedStatus])

  useEffect(() => {
    setLeaveCurrentPage(1)
  }, [leaveSearchQuery])

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
  const handleUpdateAttendance = useCallback(
    (updatedRecord: any) => {
      setAttendanceRecords(attendanceRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))
      setShowEditAttendanceDialog(false)
    },
    [attendanceRecords, setAttendanceRecords],
  )

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
      <div className="mb-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">Attendance Tracking</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage and monitor employee attendance records</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAddAttendanceDialog(true)} variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Attendance
            </Button>
            <Button variant="outline" onClick={() => setShowBulkImportDialog(true)}>
              <Download className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8 h-9"
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
                {paginatedAttendance.length > 0 ? (
                  paginatedAttendance.map((record) => (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No attendance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredAttendance.length > 0 && (
            <Pagination
              totalItems={filteredAttendance.length}
              itemsPerPage={itemsPerPage}
              currentPage={attendanceCurrentPage}
              onPageChange={setAttendanceCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
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
                {paginatedLeaveBalance.length > 0 ? (
                  paginatedLeaveBalance.map((record) => (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No leave balance records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredLeaveBalance.length > 0 && (
            <Pagination
              totalItems={filteredLeaveBalance.length}
              itemsPerPage={itemsPerPage}
              currentPage={leaveCurrentPage}
              onPageChange={setLeaveCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </CardContent>
      </Card>

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
                        <TableCell>{leave.date}</TableCell>
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

