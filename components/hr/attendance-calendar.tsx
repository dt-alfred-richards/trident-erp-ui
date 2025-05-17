"use client"

import { useState } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isToday,
} from "date-fns"

// Types for the component props
interface AttendanceCalendarProps {
  employeeId: string
  employeeName: string
}

// Sample attendance data for calendar view
const generateAttendanceData = (employeeId: string, month: Date) => {
  const start = startOfMonth(month)
  const end = endOfMonth(month)
  const days = eachDayOfInterval({ start, end })

  const attendanceData: Record<string, string> = {}

  days.forEach((day) => {
    const dateStr = format(day, "yyyy-MM-dd")
    const dayOfWeek = getDay(day)

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      attendanceData[dateStr] = "weekend"
      return
    }

    // Random attendance status
    const rand = Math.random()
    if (rand > 0.9) {
      attendanceData[dateStr] = "absent"
    } else if (rand > 0.8) {
      attendanceData[dateStr] = "half-day"
    } else if (rand > 0.7) {
      attendanceData[dateStr] = "leave"
    } else {
      attendanceData[dateStr] = "present"
    }
  })

  return attendanceData
}

export function AttendanceCalendar({ employeeId, employeeName }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MMMM yyyy"))

  // Handle month navigation
  const nextMonth = () => {
    const next = addMonths(currentMonth, 1)
    setCurrentMonth(next)
    setSelectedMonth(format(next, "MMMM yyyy"))
  }

  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1)
    setCurrentMonth(prev)
    setSelectedMonth(format(prev, "MMMM yyyy"))
  }

  // Handle month selection
  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
    const [monthName, year] = value.split(" ")
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth()
    const newDate = new Date()
    newDate.setFullYear(Number.parseInt(year))
    newDate.setMonth(monthIndex)
    setCurrentMonth(newDate)
  }

  // Generate months for dropdown
  const generateMonthOptions = () => {
    const months = []
    const currentDate = new Date()

    // Generate options for the last 12 months and next 3 months
    for (let i = -11; i <= 3; i++) {
      const date = new Date(currentDate)
      date.setMonth(currentDate.getMonth() + i)
      months.push(format(date, "MMMM yyyy"))
    }

    return months
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = getDay(start)

    // Create array for empty cells before the first day
    const emptyCells = Array(firstDayOfWeek).fill(null)

    return [...emptyCells, ...days]
  }

  // Get attendance data for the selected employee and month
  const getAttendanceData = () => {
    return generateAttendanceData(employeeId, currentMonth)
  }

  const attendanceData = getAttendanceData()
  const calendarDays = generateCalendarDays()

  // Calculate attendance summary
  const calculateSummary = () => {
    const summary = {
      present: 0,
      halfDay: 0,
      leave: 0,
      absent: 0,
    }

    Object.values(attendanceData).forEach((status) => {
      if (status === "present") summary.present++
      else if (status === "half-day") summary.halfDay++
      else if (status === "leave") summary.leave++
      else if (status === "absent") summary.absent++
    })

    return summary
  }

  const summary = calculateSummary()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>{selectedMonth}</span>
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs">Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-xs">Half Day</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs">Leave</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-xs">Absent</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
            <span className="text-xs">Weekend</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-medium py-2">
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-16 border rounded-md bg-gray-50"></div>
          }

          const dateStr = format(day, "yyyy-MM-dd")
          const status = attendanceData[dateStr]

          let statusColor = "bg-white"
          let statusText = ""

          switch (status) {
            case "present":
              statusColor = "bg-green-100 border-green-300"
              statusText = "Present"
              break
            case "half-day":
              statusColor = "bg-yellow-100 border-yellow-300"
              statusText = "Half Day"
              break
            case "leave":
              statusColor = "bg-blue-100 border-blue-300"
              statusText = "Leave"
              break
            case "absent":
              statusColor = "bg-red-100 border-red-300"
              statusText = "Absent"
              break
            case "weekend":
              statusColor = "bg-gray-100 border-gray-300"
              statusText = "Weekend"
              break
          }

          return (
            <div
              key={dateStr}
              className={`h-16 border rounded-md p-1 ${statusColor} ${isToday(day) ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex flex-col h-full">
                <div className={`text-right text-sm ${!isSameMonth(day, currentMonth) ? "text-gray-400" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="flex-grow flex items-center justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs text-center">
                          {status === "present" && <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>}
                          {status === "half-day" && <div className="w-2 h-2 bg-yellow-500 rounded-full mx-auto"></div>}
                          {status === "leave" && <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>}
                          {status === "absent" && <div className="w-2 h-2 bg-red-500 rounded-full mx-auto"></div>}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {format(day, "dd MMM yyyy")}: {statusText}
                        </p>
                        {status === "present" && <p>Check-in: 09:00, Check-out: 17:30</p>}
                        {status === "half-day" && <p>Check-in: 09:00, Check-out: 13:30</p>}
                        {status === "leave" && <p>Approved leave</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Monthly Summary</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-green-50 p-3 rounded-md border border-green-200">
            <div className="text-sm text-gray-500">Present Days</div>
            <div className="text-2xl font-semibold">{summary.present}</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <div className="text-sm text-gray-500">Half Days</div>
            <div className="text-2xl font-semibold">{summary.halfDay}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <div className="text-sm text-gray-500">Leaves</div>
            <div className="text-2xl font-semibold">{summary.leave}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-md border border-red-200">
            <div className="text-sm text-gray-500">Absent</div>
            <div className="text-2xl font-semibold">{summary.absent}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
    </div>
  )
}
