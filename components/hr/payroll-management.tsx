"use client"

import { useState } from "react"
import { Search, Download, Printer, Eye, CheckCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
    month: "2025-03",
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
    month: "2025-03",
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
    month: "2025-03",
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
    month: "2025-02",
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
    month: "2025-02",
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
    month: "2025-01",
  },
]

// Get current month in YYYY-MM format
const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

// Format month for display
const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split("-")
  return new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

// Get list of available months from data
const getAvailableMonths = () => {
  const months = new Set<string>()
  payrollData.forEach((employee) => {
    if (employee.month) {
      months.add(employee.month)
    }
  })
  return Array.from(months).sort().reverse()
}

export function PayrollManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [viewPayslip, setViewPayslip] = useState<(typeof payrollData)[0] | null>(null)

  // Filter payroll data based on search query, selected filters, and month
  const filteredPayroll = payrollData.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus

    const matchesMonth = employee.month === selectedMonth

    return matchesSearch && matchesStatus && matchesMonth
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
  const handleProcessPayroll = (id?: string) => {
    if (id) {
      alert(`Processing payroll for employee ${id}`)
    } else {
      alert(`Processing payroll for ${selectedEmployees.length} employees`)
    }
    // In a real application, you would call an API to process the payroll
  }

  // View payslip
  const handleViewPayslip = (employee: (typeof payrollData)[0]) => {
    setViewPayslip(employee)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h3 className="text-lg font-medium">Payroll Management</h3>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableMonths().map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
        </div>
      </div>

      {selectedEmployees.length > 0 && (
        <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
          <span className="text-sm font-medium">{selectedEmployees.length} employees selected</span>
          <Button size="sm" onClick={() => handleProcessPayroll()}>
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
                <TableHead>Role</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Overtime (hrs)</TableHead>
                <TableHead>Net Pay (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.attendance} days</TableCell>
                  <TableCell>{employee.overtime} hrs</TableCell>
                  <TableCell className="font-medium">₹{employee.netPay.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === "Processed" ? "success" : "outline"}>{employee.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleViewPayslip(employee)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Payslip</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Payslip</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleProcessPayroll(employee.id)}
                              disabled={employee.status === "Processed"}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span className="sr-only">Process Payroll</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Process Payroll</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {filteredPayroll.length} of {payrollData.filter((emp) => emp.month === selectedMonth).length}{" "}
          employees for {formatMonth(selectedMonth)}
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

      {/* Payslip Dialog */}
      <Dialog open={!!viewPayslip} onOpenChange={(open) => !open && setViewPayslip(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Employee Payslip</DialogTitle>
            <DialogDescription>
              {viewPayslip && `${viewPayslip.name} (${viewPayslip.id}) - ${formatMonth(viewPayslip.month || "")}`}
            </DialogDescription>
          </DialogHeader>

          {viewPayslip && (
            <div className="space-y-4">
              <div className="border rounded-md p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee</p>
                    <p className="font-medium">{viewPayslip.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-medium">{viewPayslip.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{viewPayslip.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="font-medium">{viewPayslip.role}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Salary</span>
                    <span>₹{viewPayslip.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overtime ({viewPayslip.overtime} hrs)</span>
                    <span>₹{(viewPayslip.overtime * (viewPayslip.salary / 176)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bonus</span>
                    <span>₹{viewPayslip.bonus.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Earnings</span>
                    <span>
                      ₹
                      {(
                        viewPayslip.salary +
                        viewPayslip.bonus +
                        viewPayslip.overtime * (viewPayslip.salary / 176)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>₹{(viewPayslip.deductions * 0.6).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provident Fund</span>
                    <span>₹{(viewPayslip.deductions * 0.3).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Other Deductions</span>
                    <span>₹{(viewPayslip.deductions * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Deductions</span>
                    <span>₹{viewPayslip.deductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-md flex justify-between font-medium text-lg">
                <span>Net Pay</span>
                <span>₹{viewPayslip.netPay.toLocaleString()}</span>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setViewPayslip(null)}>
                  Close
                </Button>
                <Button>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Payslip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

