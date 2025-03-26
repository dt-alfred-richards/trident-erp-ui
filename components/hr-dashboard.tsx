"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeManagement } from "@/components/hr/employee-management"
import { AttendanceTracking } from "@/components/hr/attendance-tracking"
import { PayrollManagement } from "@/components/hr/payroll-management"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { Users, Clock, IndianRupee, UserPlus, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddEmployeeDialog } from "@/components/hr/add-employee-dialog"
import { AddAttendanceDialog } from "@/components/hr/add-attendance-dialog"

export interface AttendanceData {
  id: number
  employeeId: string
  employeeName: string
  date: string
  checkIn?: string
  checkOut?: string
  totalHours?: string
  status: "present" | "absent"
}

export function HRDashboard() {
  // Dialog open states
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false)
  const [addAttendanceOpen, setAddAttendanceOpen] = useState(false)

  // Calculate metrics for the cards
  const totalEmployees = 42
  const attendanceRate = 92
  const monthlyPayroll = "₹ 18.5L"

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Employees"
          value={totalEmployees}
          change={{ value: 8, isPositive: true }}
          icon={<Users className="h-5 w-5" />}
          description="Active employees in the organization"
        />
        <MetricCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          change={{ value: 3, isPositive: true }}
          icon={<Clock className="h-5 w-5" />}
          description="Average attendance this month"
        />
        <MetricCard
          title="Monthly Payroll"
          value={monthlyPayroll}
          change={{ value: 5, isPositive: true }}
          icon={<IndianRupee className="h-5 w-5" />}
          description="Total payroll for current month"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-end">
        <Button onClick={() => setAddEmployeeOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
        <Button onClick={() => setAddAttendanceOpen(true)} className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4" />
          Add Attendance
        </Button>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <EmployeeManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <AttendanceTracking />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <PayrollManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddEmployeeDialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen} />
      <AddAttendanceDialog
        open={addAttendanceOpen}
        onOpenChange={setAddAttendanceOpen}
      />
    </div>
  )
}

