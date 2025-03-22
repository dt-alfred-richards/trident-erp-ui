"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Users, Clock, Calendar, DollarSign } from "lucide-react"
import { EmployeeManagement } from "./employee-management"
import { AttendanceTracking } from "./attendance-tracking"
import { LeaveManagement } from "./leave-management"
import { PayrollManagement } from "./payroll-management"
import { AddEmployeeDialog } from "./add-employee-dialog"
import { DataByTableName } from "../utils/api"

type Employee = {
  "empId": string,
  "name": string,
  "lastName": string,
  "contactNumber": number,
  "email": string
  "dob": string,
  "address": string,
  "joiningDate": string,
  "department": string,
  "role": string,
  "salary": number,
  "bloodGroup": string,
  "averageWorkingHours": string,
  "monthlyPayment": boolean,
  "basePay": number,
  "sundayHoliday": boolean
}

export type EmployeeRow = {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  role: string,
  department: string,
  employeeType: string,
  shift: string,
  salary: Employee["salary"],
  contactNumber: Employee["contactNumber"],
  dateOfJoining: string,
  gender: string,
  averageWorkingHours: string
}

export function HRDashboard() {
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false)

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);

  const fetchData = async () => {
    try {
      const instance = new DataByTableName("dim_employee")
      const { data, error } = await instance.get();
      const employeeData = data.map((item: Employee) => (
        {
          id: item.empId,
          firstName: item.name,
          lastName: item.lastName ?? "",
          email: item.email,
          role: item.role,
          department: item.department,
          employeeType: "",
          shift: "",
          salary: item.salary,
          contactNumber: item.contactNumber,
          dateOfJoining: item.joiningDate,
          gender: "",
          averageWorkingHours: item.averageWorkingHours
        }
      ))
      setEmployees(employeeData)
    } catch (error) {
      console.log({ error })
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Human Resources</h2>
          <p className="text-muted-foreground">Manage employees, attendance, leave, and payroll</p>
        </div>
        <Button onClick={() => setShowAddEmployeeDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requires approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1.2M</div>
            <p className="text-xs text-muted-foreground">For 45 employees</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave Management</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <EmployeeManagement employees={employees} />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceTracking employees={employees} />
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <LeaveManagement />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollManagement />
        </TabsContent>
      </Tabs>

      <AddEmployeeDialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog} />
    </div>
  )
}

