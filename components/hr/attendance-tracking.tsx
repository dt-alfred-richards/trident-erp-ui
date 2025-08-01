"use client"

import { type Dispatch, type SetStateAction, useCallback, useMemo, useState, useEffect } from "react"
import { CalendarIcon, Filter, Download, Search, Eye, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
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
import type { AttendanceData } from "./hr-dashboard"
import { useHrContext } from "@/app/hr/hr-context"
import { convertDate } from "../generic"
import { DateInput } from "../ui/reusable-components"

export function AttendanceTracking({
  attendanceData: x,
  setAttendanceRecords,
}: { attendanceData: AttendanceData[]; setAttendanceRecords: Dispatch<SetStateAction<AttendanceData[]>> }) {
  const { employees, employeeLeaves: pastLeavesData, dailyAttendance: attendanceData, updateAttendance } = useHrContext()
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
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)
  const [calendarEmployee, setCalendarEmployee] = useState<{ id: string; name: string } | null>(null)

  // Pagination state
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1)
  const [leaveCurrentPage, setLeaveCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter attendance data based on search query and selected status
  const filteredAttendance = useMemo(
    () =>
      attendanceData.filter((record) => {
        const matchesSearch =
          record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.employeeName.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = selectedStatus === "all" || record.status === selectedStatus

        const matchesDate = date &&
          new Date(record.modifiedOn || record.createdOn).toDateString() === new Date(date).toDateString()

        return matchesSearch && matchesStatus && matchesDate
      }),
    [attendanceData, searchQuery, selectedStatus, date]
  )

  const leaveBalanceData = useMemo(() => {
    return employees.map(item => ({
      id: item.id,
      employeeId: item.id,
      employeeName: `${item.firstName} ${item.lastName}`,
      earnedLeave: item.leaves,
      usedLeave: item.usedLeaves || pastLeavesData[item.id]?.length || 0,
      remainingLeave: item.leaves - (item.usedLeaves || pastLeavesData[item.id]?.length || 0)
    }))
  }, [employees])

  // Filter leave balance data based on search query
  const filteredLeaveBalance = useMemo(
    () =>
      leaveBalanceData.filter((record) => {
        return (
          record.employeeId.toLowerCase().includes(leaveSearchQuery.toLowerCase()) ||
          record.employeeName.toLowerCase().includes(leaveSearchQuery.toLowerCase())
        )
      }),
    [leaveSearchQuery],
  )

  // Calculate paginated data for both tables
  const paginatedAttendance = useMemo(() => {
    const startIndex = (attendanceCurrentPage - 1) * itemsPerPage
    return filteredAttendance.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAttendance, attendanceCurrentPage, itemsPerPage, date])

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
      setAttendanceRecords(attendanceData.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))
      setShowEditAttendanceDialog(false)
    },
    [attendanceData, setAttendanceRecords],
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
            <Button variant="outline" onClick={() => setShowBulkImportDialog(true)}>
              <Download className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div><DateInput selectedDate={date} setState={setDate} /></div>
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
                          <Badge
                            variant="outline"
                            className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                          >
                            Present
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                          >
                            Absent
                          </Badge>
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
            <div className="flex items-center justify-between mt-4 px-4 pb-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredAttendance.length > 0 ? (attendanceCurrentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(attendanceCurrentPage * itemsPerPage, filteredAttendance.length)} of{" "}
                {filteredAttendance.length} records
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttendanceCurrentPage(attendanceCurrentPage - 1)}
                  disabled={attendanceCurrentPage === 1 || filteredAttendance.length === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                {Array.from(
                  { length: Math.min(5, Math.ceil(filteredAttendance.length / itemsPerPage) || 1) },
                  (_, i) => {
                    // Show pages around current page
                    let pageNum = 1
                    const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage)
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (attendanceCurrentPage <= 3) {
                      pageNum = i + 1
                    } else if (attendanceCurrentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = attendanceCurrentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={attendanceCurrentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAttendanceCurrentPage(pageNum)}
                        disabled={filteredAttendance.length === 0}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  },
                )}
                {Math.ceil(filteredAttendance.length / itemsPerPage) > 5 &&
                  attendanceCurrentPage < Math.ceil(filteredAttendance.length / itemsPerPage) - 2 && (
                    <>
                      {attendanceCurrentPage < Math.ceil(filteredAttendance.length / itemsPerPage) - 3 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAttendanceCurrentPage(Math.ceil(filteredAttendance.length / itemsPerPage))}
                        disabled={filteredAttendance.length === 0}
                        className="h-8 w-8 p-0"
                      >
                        {Math.ceil(filteredAttendance.length / itemsPerPage)}
                      </Button>
                    </>
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttendanceCurrentPage(attendanceCurrentPage + 1)}
                  disabled={
                    attendanceCurrentPage === Math.ceil(filteredAttendance.length / itemsPerPage) ||
                    filteredAttendance.length === 0
                  }
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
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
                        {record.remainingLeave > 10 ? (
                          <Badge
                            variant="outline"
                            className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                          >
                            {record.remainingLeave}
                          </Badge>
                        ) : record.remainingLeave > 5 ? (
                          <Badge
                            variant="outline"
                            className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                          >
                            {record.remainingLeave}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                          >
                            {record.remainingLeave}
                          </Badge>
                        )}
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
            <div className="flex items-center justify-between mt-4 px-4 pb-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredLeaveBalance.length > 0 ? (leaveCurrentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                {Math.min(leaveCurrentPage * itemsPerPage, filteredLeaveBalance.length)} of{" "}
                {filteredLeaveBalance.length} records
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLeaveCurrentPage(leaveCurrentPage - 1)}
                  disabled={leaveCurrentPage === 1 || filteredLeaveBalance.length === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                {Array.from(
                  { length: Math.min(5, Math.ceil(filteredLeaveBalance.length / itemsPerPage) || 1) },
                  (_, i) => {
                    // Show pages around current page
                    let pageNum = 1
                    const totalPages = Math.ceil(filteredLeaveBalance.length / itemsPerPage)
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (leaveCurrentPage <= 3) {
                      pageNum = i + 1
                    } else if (leaveCurrentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = leaveCurrentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={leaveCurrentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLeaveCurrentPage(pageNum)}
                        disabled={filteredLeaveBalance.length === 0}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  },
                )}
                {Math.ceil(filteredLeaveBalance.length / itemsPerPage) > 5 &&
                  leaveCurrentPage < Math.ceil(filteredLeaveBalance.length / itemsPerPage) - 2 && (
                    <>
                      {leaveCurrentPage < Math.ceil(filteredLeaveBalance.length / itemsPerPage) - 3 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLeaveCurrentPage(Math.ceil(filteredLeaveBalance.length / itemsPerPage))}
                        disabled={filteredLeaveBalance.length === 0}
                        className="h-8 w-8 p-0"
                      >
                        {Math.ceil(filteredLeaveBalance.length / itemsPerPage)}
                      </Button>
                    </>
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLeaveCurrentPage(leaveCurrentPage + 1)}
                  disabled={
                    leaveCurrentPage === Math.ceil(filteredLeaveBalance.length / itemsPerPage) ||
                    filteredLeaveBalance.length === 0
                  }
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
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
                        <TableCell>{convertDate(leave.date)}</TableCell>
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
