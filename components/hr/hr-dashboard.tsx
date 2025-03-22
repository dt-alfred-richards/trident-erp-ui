"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Users, Clock, DollarSign, Plus } from "lucide-react"
import { EmployeeManagement } from "./employee-management"
import { AttendanceTracking } from "./attendance-tracking"
import { PayrollManagement } from "./payroll-management"
import { AddEmployeeDialog } from "./add-employee-dialog"
import { AddAttendanceDialog } from "./add-attendance-dialog"
import { HrProvider } from "@/contexts/hr-context"

export function HRDashboard() {
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false)
  const [showAddAttendanceDialog, setShowAddAttendanceDialog] = useState(false)

  // Get last month's name and year
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1)
  const lastMonthName = lastMonth.toLocaleString("default", { month: "long" })
  const lastMonthYear = lastMonth.getFullYear()

  return (
    <HrProvider>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Human Resources</h2>
            <p className="text-muted-foreground">Manage employees, attendance, and payroll</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowAddEmployeeDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
            <Button variant="outline" onClick={() => setShowAddAttendanceDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Attendance
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">93% attendance rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{lastMonthName} Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹1.2M</div>
              <p className="text-xs text-muted-foreground">For 45 employees ({lastMonthYear})</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <EmployeeManagement />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <AttendanceTracking />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <PayrollManagement />
          </TabsContent>
        </Tabs>

        <AddEmployeeDialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog} />
        <AddAttendanceDialog open={showAddAttendanceDialog} onOpenChange={setShowAddAttendanceDialog} />
      </div>
    </HrProvider>
  )
}

