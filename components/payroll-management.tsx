"use client"

import { useState } from "react"
import { Search, Download, Printer } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample payroll data
const payrollData = [
  {
    id: "EMP001",
    name: "Rajesh Kumar",
    department: "Production",
    role: "Production Manager",
    salary: 65000,
    attendance: 22,
    overtime: 5,
    bonus: 2000,
    deductions: 1500,
    netPay: 67500,
    status: "Pending",
  },
  {
    id: "EMP002",
    name: "Priya Sharma",
    department: "Production",
    role: "Line Supervisor",
    salary: 45000,
    attendance: 21,
    overtime: 8,
    bonus: 1500,
    deductions: 1000,
    netPay: 47500,
    status: "Processed",
  },
  {
    id: "EMP003",
    name: "Amit Patel",
    department: "Production",
    role: "Line Worker",
    salary: 30000,
    attendance: 20,
    overtime: 10,
    bonus: 1000,
    deductions: 800,
    netPay: 31700,
    status: "Pending",
  },
  {
    id: "EMP004",
    name: "Sneha Gupta",
    department: "Production",
    role: "Line Worker",
    salary: 28000,
    attendance: 22,
    overtime: 6,
    bonus: 800,
    deductions: 700,
    netPay: 29100,
    status: "Pending",
  },
  {
    id: "EMP005",
    name: "Vikram Singh",
    department: "Production",
    role: "Quality Control",
    salary: 40000,
    attendance: 21,
    overtime: 4,
    bonus: 1200,
    deductions: 900,
    netPay: 41300,
    status: "Processed",
  },
  {
    id: "EMP006",
    name: "Neha Verma",
    department: "HR",
    role: "HR Executive",
    salary: 50000,
    attendance: 22,
    overtime: 2,
    bonus: 1500,
    deductions: 1200,
    netPay: 51300,
    status: "Processed",
  },
]

export function PayrollManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  // Filter payroll data based on search query and selected filters
  const filteredPayroll = payrollData.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus

    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment

    return matchesSearch && matchesStatus && matchesDepartment
  })

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredPayroll.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredPayroll.map((employee) => employee.id))
    }
  }

  // Handle individual checkbox selection
  const handleSelectEmployee = (id: string) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id))
    } else {
      setSelectedEmployees([...selectedEmployees, id])
    }
  }

  // Process selected payrolls
  const handleProcessPayroll = () => {
    alert(`Processing payroll for ${selectedEmployees.length} employees`)
    // In a real application, you would call an API to process the payroll
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h3 className="text-lg font-medium">Payroll Management</h3>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8 h-9 md:w-[200px] lg:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processed">Processed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedEmployees.length > 0 && (
        <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
          <span className="text-sm font-medium">{selectedEmployees.length} employees selected</span>
          <Button size="sm" onClick={handleProcessPayroll}>
            Process Payroll
          </Button>
          <Button size="sm" variant="outline" onClick={() => setSelectedEmployees([])}>
            Clear Selection
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={filteredPayroll.length > 0 && selectedEmployees.length === filteredPayroll.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Overtime (hrs)</TableHead>
                <TableHead>Salary (₹)</TableHead>
                <TableHead>Bonus (₹)</TableHead>
                <TableHead>Deductions (₹)</TableHead>
                <TableHead>Net Pay (₹)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayroll.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedEmployees.includes(employee.id)}
                      onCheckedChange={() => handleSelectEmployee(employee.id)}
                      aria-label={`Select ${employee.name}`}
                    />
                  </TableCell>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.attendance} days</TableCell>
                  <TableCell>{employee.overtime} hrs</TableCell>
                  <TableCell>₹{employee.salary.toLocaleString()}</TableCell>
                  <TableCell>₹{employee.bonus.toLocaleString()}</TableCell>
                  <TableCell>₹{employee.deductions.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">₹{employee.netPay.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === "Processed" ? "success" : "outline"}>{employee.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {filteredPayroll.length} of {payrollData.length} employees
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}

