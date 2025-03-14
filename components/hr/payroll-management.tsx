"use client"

import { useState } from "react"
import { Download, DollarSign, Calendar, Filter, Search, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Sample payroll data
const payrollData = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "Rajesh Kumar",
    employeeType: "Full-time",
    payPeriod: "October 2023",
    basicSalary: 65000,
    overtime: 0,
    deductions: 6500,
    netSalary: 58500,
    status: "processed",
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Priya Sharma",
    employeeType: "Full-time",
    payPeriod: "October 2023",
    basicSalary: 45000,
    overtime: 2500,
    deductions: 4750,
    netSalary: 42750,
    status: "processed",
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "Amit Patel",
    employeeType: "Full-time",
    payPeriod: "October 2023",
    basicSalary: 30000,
    overtime: 1800,
    deductions: 3180,
    netSalary: 28620,
    status: "processed",
  },
  {
    id: 4,
    employeeId: "EMP004",
    employeeName: "Sneha Gupta",
    employeeType: "Part-time",
    payPeriod: "October 2023",
    hoursWorked: 80,
    hourlyRate: 200,
    basicSalary: 16000, // 80 * 200
    overtime: 0,
    deductions: 1600,
    netSalary: 14400,
    status: "processed",
  },
  {
    id: 5,
    employeeId: "EMP005",
    employeeName: "Vikram Singh",
    employeeType: "Full-time",
    payPeriod: "October 2023",
    basicSalary: 40000,
    overtime: 0,
    deductions: 4000,
    netSalary: 36000,
    status: "pending",
  },
]

export function PayrollManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPayPeriod, setSelectedPayPeriod] = useState("october2023")
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all")
  const [showPayslipDialog, setShowPayslipDialog] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<number | null>(null)

  // Filter payroll data based on search query and selected filters
  const filteredPayroll = payrollData.filter((record) => {
    const matchesSearch =
      record.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPayPeriod =
      selectedPayPeriod === "all" ||
      record.payPeriod.toLowerCase().replace(/\s+/g, "") === selectedPayPeriod.toLowerCase()

    const matchesEmployeeType = selectedEmployeeType === "all" || record.employeeType === selectedEmployeeType

    return matchesSearch && matchesPayPeriod && matchesEmployeeType
  })

  const handleViewPayslip = (id: number) => {
    setSelectedPayroll(id)
    setShowPayslipDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-500">Processed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const payroll = selectedPayroll ? payrollData.find((p) => p.id === selectedPayroll) : null

  // Calculate totals for summary
  const totalBasicSalary = filteredPayroll.reduce((sum, record) => sum + record.basicSalary, 0)
  const totalOvertime = filteredPayroll.reduce((sum, record) => sum + record.overtime, 0)
  const totalDeductions = filteredPayroll.reduce((sum, record) => sum + record.deductions, 0)
  const totalNetSalary = filteredPayroll.reduce((sum, record) => sum + record.netSalary, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h3 className="text-lg font-medium">Payroll Management</h3>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8 h-9 md:w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedPayPeriod} onValueChange={setSelectedPayPeriod}>
            <SelectTrigger className="h-9 w-[130px]">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Pay Period</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              <SelectItem value="october2023">October 2023</SelectItem>
              <SelectItem value="september2023">September 2023</SelectItem>
              <SelectItem value="august2023">August 2023</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedEmployeeType} onValueChange={setSelectedEmployeeType}>
            <SelectTrigger className="h-9 w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <span>Employee Type</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Employee Type</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayroll.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employeeId}</TableCell>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>{record.payPeriod}</TableCell>
                    <TableCell>{record.employeeType}</TableCell>
                    <TableCell>₹{record.basicSalary.toLocaleString()}</TableCell>
                    <TableCell>₹{record.overtime.toLocaleString()}</TableCell>
                    <TableCell>₹{record.deductions.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₹{record.netSalary.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPayslip(record.id)}>View Payslip</DropdownMenuItem>
                          <DropdownMenuItem>Download Payslip</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Basic Salary</p>
              <p className="text-2xl font-bold">₹{totalBasicSalary.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Overtime</p>
              <p className="text-2xl font-bold">₹{totalOvertime.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Deductions</p>
              <p className="text-2xl font-bold">₹{totalDeductions.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Net Salary</p>
              <p className="text-2xl font-bold">₹{totalNetSalary.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Payroll
        </Button>
        <Button>
          <DollarSign className="mr-2 h-4 w-4" />
          Process Payroll
        </Button>
      </div>

      {/* Payslip Dialog */}
      <Dialog open={showPayslipDialog} onOpenChange={setShowPayslipDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Employee Payslip</DialogTitle>
            <DialogDescription>
              {payroll?.payPeriod} | {payroll?.employeeName} ({payroll?.employeeId})
            </DialogDescription>
          </DialogHeader>

          {payroll && (
            <div className="py-4">
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{payroll.employeeName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {payroll.employeeId} • {payroll.employeeType}
                    </p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-medium">Payslip #{payroll.id}</h4>
                    <p className="text-sm text-muted-foreground">{payroll.payPeriod}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium mb-3">Earnings</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Basic Salary</span>
                      <span>₹{payroll.basicSalary.toLocaleString()}</span>
                    </div>
                    {payroll.overtime > 0 && (
                      <div className="flex justify-between">
                        <span>Overtime</span>
                        <span>₹{payroll.overtime.toLocaleString()}</span>
                      </div>
                    )}
                    {"hoursWorked" in payroll && (
                      <div className="flex justify-between">
                        <span>Hours Worked</span>
                        <span>
                          {payroll.hoursWorked} hrs @ ₹{payroll.hourlyRate}/hr
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total Earnings</span>
                      <span>₹{(payroll.basicSalary + payroll.overtime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Deductions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Provident Fund</span>
                      <span>₹{(payroll.deductions * 0.6).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional Tax</span>
                      <span>₹{(payroll.deductions * 0.1).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Income Tax</span>
                      <span>₹{(payroll.deductions * 0.3).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total Deductions</span>
                      <span>₹{payroll.deductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Net Salary</h3>
                  <span className="text-xl font-bold">₹{payroll.netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayslipDialog(false)}>
              Close
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Payslip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

