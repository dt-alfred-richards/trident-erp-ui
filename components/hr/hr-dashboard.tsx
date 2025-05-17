"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeManagement } from "@/components/hr/employee-management"
import { AttendanceTracking } from "@/components/hr/attendance-tracking"
import { PayrollManagement } from "@/components/hr/payroll-management"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import {
  Users,
  IndianRupee,
  UserPlus,
  CalendarPlus,
  Percent,
  CheckCircle,
  XCircle,
  CreditCard,
  AlertCircle,
  UserMinus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddEmployeeDialog } from "@/components/hr/add-employee-dialog"
import { AddAttendanceDialog } from "@/components/hr/add-attendance-dialog"
import { useToast } from "@/hooks/use-toast"

// Sample employee data with added aadharImageUrl field
export const initialEmployees = [
  {
    id: "EMP001",
    firstName: "Rajesh",
    lastName: "Kumar",
    email: "rajesh.kumar@dhaara.com",
    role: "Production Manager",
    department: "Production",
    employeeType: "Full-time",
    salary: 65000,
    contactNumber: "+91 98765 43210",
    dateOfJoining: "2022-05-15",
    gender: "Male",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP002",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@dhaara.com",
    role: "Line Supervisor",
    department: "Production",
    employeeType: "Full-time",
    salary: 45000,
    contactNumber: "+91 98765 43211",
    dateOfJoining: "2022-06-10",
    gender: "Female",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP003",
    firstName: "Amit",
    lastName: "Patel",
    email: "amit.patel@dhaara.com",
    role: "Line Worker",
    department: "Production",
    employeeType: "Full-time",
    salary: 30000,
    contactNumber: "+91 98765 43212",
    dateOfJoining: "2022-07-05",
    gender: "Male",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP004",
    firstName: "Sneha",
    lastName: "Gupta",
    email: "sneha.gupta@dhaara.com",
    role: "Line Worker",
    department: "Production",
    employeeType: "Part-time",
    salary: 200, // hourly rate
    contactNumber: "+91 98765 43213",
    dateOfJoining: "2022-08-20",
    gender: "Female",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP005",
    firstName: "Vikram",
    lastName: "Singh",
    email: "vikram.singh@dhaara.com",
    role: "Quality Control",
    department: "Production",
    employeeType: "Full-time",
    salary: 40000,
    contactNumber: "+91 98765 43214",
    dateOfJoining: "2022-09-15",
    gender: "Male",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP006",
    firstName: "Neha",
    lastName: "Verma",
    email: "neha.verma@dhaara.com",
    role: "HR Executive",
    department: "HR",
    employeeType: "Full-time",
    salary: 50000,
    contactNumber: "+91 98765 43215",
    dateOfJoining: "2022-04-10",
    gender: "Female",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP007",
    firstName: "Rahul",
    lastName: "Mehta",
    email: "rahul.mehta@dhaara.com",
    role: "Finance Manager",
    department: "Finance",
    employeeType: "Full-time",
    salary: 60000,
    contactNumber: "+91 98765 43216",
    dateOfJoining: "2022-03-15",
    gender: "Male",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP008",
    firstName: "Sonia",
    lastName: "Gupta",
    email: "sonia.gupta@dhaara.com",
    role: "Accountant",
    department: "Finance",
    employeeType: "Full-time",
    salary: 45000,
    contactNumber: "+91 98765 43217",
    dateOfJoining: "2022-05-20",
    gender: "Female",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP009",
    firstName: "Rohit",
    lastName: "Srivastava",
    email: "rohit.srivastava@dhaara.com",
    role: "Sales Manager",
    department: "Sales",
    employeeType: "Full-time",
    salary: 55000,
    contactNumber: "+91 98765 43218",
    dateOfJoining: "2022-02-10",
    gender: "Male",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP010",
    firstName: "Ananya",
    lastName: "Joshi",
    email: "ananya.joshi@dhaara.com",
    role: "Marketing Executive",
    department: "Marketing",
    employeeType: "Full-time",
    salary: 42000,
    contactNumber: "+91 98765 43219",
    dateOfJoining: "2022-07-25",
    gender: "Female",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP011",
    firstName: "Suresh",
    lastName: "Reddy",
    email: "suresh.reddy@dhaara.com",
    role: "IT Manager",
    department: "IT",
    employeeType: "Full-time",
    salary: 70000,
    contactNumber: "+91 98765 43220",
    dateOfJoining: "2022-01-05",
    gender: "Male",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
  {
    id: "EMP012",
    firstName: "Divya",
    lastName: "Rao",
    email: "divya.rao@dhaara.com",
    role: "System Administrator",
    department: "IT",
    employeeType: "Full-time",
    salary: 50000,
    contactNumber: "+91 98765 43221",
    dateOfJoining: "2022-04-15",
    gender: "Female",
    aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
  },
]

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
  const { toast } = useToast()
  const [employees, setEmployees] = useState(initialEmployees)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceData[]>([
    {
      id: 1,
      employeeId: "EMP001",
      employeeName: "Rajesh Kumar",
      date: "2023-10-26",
      checkIn: "09:00",
      checkOut: "17:30",
      totalHours: "8:30",
      status: "present",
    },
    {
      id: 2,
      employeeId: "EMP002",
      employeeName: "Priya Sharma",
      date: "2023-10-26",
      checkIn: "09:15",
      checkOut: "17:45",
      totalHours: "8:30",
      status: "present",
    },
    {
      id: 3,
      employeeId: "EMP003",
      employeeName: "Amit Patel",
      date: "2023-10-26",
      status: "absent",
    },
    {
      id: 4,
      employeeId: "EMP004",
      employeeName: "Sneha Gupta",
      date: "2023-10-26",
      checkIn: "10:00",
      checkOut: "18:00",
      totalHours: "8:00",
      status: "present",
    },
  ])

  // Add state to track the current tab
  const [activeTab, setActiveTab] = useState("employees")

  // Dialog open states
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false)
  const [addAttendanceOpen, setAddAttendanceOpen] = useState(false)

  // Calculate metrics for the cards
  const totalEmployees = employees.length
  const attendanceRate = 92
  const monthlyPayroll = "₹ 18.5L"

  // Function to add a new attendance record
  const addAttendanceRecord = (newRecord: Omit<AttendanceData, "id">) => {
    const newId = Math.max(0, ...attendanceRecords.map((record) => record.id)) + 1
    setAttendanceRecords((prev) => [{ ...newRecord, id: newId }, ...prev])
  }

  // Function to add a new employee
  const addEmployee = (newEmployee: any) => {
    // Generate a new employee ID
    const lastEmpId = employees.length > 0 ? employees[employees.length - 1].id : "EMP000"
    const lastEmpNum = Number.parseInt(lastEmpId.replace("EMP", ""))
    const newEmpId = `EMP${String(lastEmpNum + 1).padStart(3, "0")}`

    // Create the new employee object
    const employeeToAdd = {
      ...newEmployee,
      id: newEmpId,
      aadharImageUrl: "/placeholder.svg?height=300&width=500", // Placeholder for demo
    }

    // Add the new employee to the beginning of the array
    setEmployees((prev) => [employeeToAdd, ...prev])

    // Show a success toast
    toast({
      title: "Employee Added",
      description: `${newEmployee.firstName} ${newEmployee.lastName} has been added successfully.`,
    })

    // Close the dialog
    setAddEmployeeOpen(false)
  }

  // Update the KPI data section to include colored icons with background similar to the Dashboard Overview tab

  // Replace the kpiData object with this updated version that includes proper icon styling
  const kpiData = {
    employees: [
      {
        title: "Total Employees",
        value: totalEmployees,
        change: { value: 8, isPositive: true },
        icon: <Users className="h-5 w-5 text-blue-500" />,
        iconColor: "text-blue-500",
        iconBgColor: "bg-blue-500/10",
        description: "Active employees in the organization",
      },
      {
        title: "New Hires",
        value: 5,
        change: { value: 2, isPositive: true },
        icon: <UserPlus className="h-5 w-5 text-green-500" />,
        iconColor: "text-green-500",
        iconBgColor: "bg-green-500/10",
        description: "Employees hired this month",
      },
      {
        title: "Separation",
        value: 3,
        change: { value: 1, isPositive: false },
        icon: <UserMinus className="h-5 w-5 text-red-500" />,
        iconColor: "text-red-500",
        iconBgColor: "bg-red-500/10",
        description: "employees left this month",
      },
    ],
    attendance: [
      {
        title: "Present Today",
        value: 110,
        change: { value: 5, isPositive: true },
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        iconColor: "text-green-500",
        iconBgColor: "bg-green-500/10",
        description: "Employees present today",
      },
      {
        title: "Absent Today",
        value: 8,
        change: { value: 2, isPositive: false },
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        iconColor: "text-red-500",
        iconBgColor: "bg-red-500/10",
        description: "Employees absent today",
      },
      {
        title: "Attendance Rate",
        value: `${attendanceRate}%`,
        change: { value: 3, isPositive: true },
        icon: <Percent className="h-5 w-5 text-blue-500" />,
        iconColor: "text-blue-500",
        iconBgColor: "bg-blue-500/10",
        description: "Average attendance this month",
      },
    ],
    payroll: [
      {
        title: "Monthly Payroll",
        value: monthlyPayroll,
        change: { value: 5, isPositive: true },
        icon: <IndianRupee className="h-5 w-5 text-purple-500" />,
        iconColor: "text-purple-500",
        iconBgColor: "bg-purple-500/10",
        description: "Total payroll for current month",
      },
      {
        title: "Salary Processed",
        value: "₹ 15.2L",
        change: { value: 8, isPositive: true },
        icon: <CreditCard className="h-5 w-5 text-green-500" />,
        iconColor: "text-green-500",
        iconBgColor: "bg-green-500/10",
        description: "Salaries processed this month",
      },
      {
        title: "Pending Payouts",
        value: "₹ 3.3L",
        change: { value: 2, isPositive: false },
        icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
        iconColor: "text-amber-500",
        iconBgColor: "bg-amber-500/10",
        description: "Pending salary disbursements",
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Metric Cards based on active tab */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-300 ease-in-out">
        {kpiData[activeTab as keyof typeof kpiData].map((kpi, index) => (
          <MetricCard
            key={`${activeTab}-kpi-${index}`}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.icon}
            iconColor={kpi.iconColor}
            iconBgColor={kpi.iconBgColor}
            description={kpi.description}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-end">
        <Button
          onClick={() => setAddEmployeeOpen(true)}
          className="flex items-center gap-2 bg-[#1bc6ff] hover:bg-[#18b2e6] text-white border-0"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
        <Button
          onClick={() => setAddAttendanceOpen(true)}
          className="flex items-center gap-2 bg-[#1b86ff] hover:bg-[#1878e6] text-white border-0"
        >
          <CalendarPlus className="h-4 w-4" />
          Add Attendance
        </Button>
      </div>

      <Tabs defaultValue="employees" className="space-y-4" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="bg-white dark:bg-[#0f1729] [&_[data-state=active]]:bg-white [&_[data-state=active]]:dark:bg-[#0f1729] [&_[data-state=active]]:text-[#1b84ff] [&_[data-state=active]]:border-b-2 [&_[data-state=active]]:border-[#1b84ff]">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <EmployeeManagement employees={employees} setEmployees={setEmployees} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <AttendanceTracking attendanceData={attendanceRecords} setAttendanceRecords={setAttendanceRecords} />
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
      <AddEmployeeDialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen} onAddEmployee={addEmployee} />
      <AddAttendanceDialog
        open={addAttendanceOpen}
        onOpenChange={setAddAttendanceOpen}
        onAddAttendance={addAttendanceRecord}
      />
    </div>
  )
}
