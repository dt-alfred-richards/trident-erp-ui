"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Search, Download, Printer, Eye, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

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
  {
    id: "EMP007",
    name: "Rahul Mehta",
    department: "Finance",
    role: "Finance Manager",
    salary: 60000,
    attendance: 21,
    overtime: 3,
    bonus: 2000,
    deductions: 1500,
    netPay: 62000,
    status: "Processed",
    month: "2025-03",
  },
  {
    id: "EMP008",
    name: "Sonia Gupta",
    department: "Finance",
    role: "Accountant",
    salary: 45000,
    attendance: 22,
    overtime: 4,
    bonus: 1200,
    deductions: 1000,
    netPay: 46200,
    status: "Pending",
    month: "2025-03",
  },
  {
    id: "EMP009",
    name: "Rohit Srivastava",
    department: "Sales",
    role: "Sales Manager",
    salary: 55000,
    attendance: 20,
    overtime: 6,
    bonus: 2500,
    deductions: 1400,
    netPay: 57600,
    status: "Pending",
    month: "2025-03",
  },
  {
    id: "EMP010",
    name: "Ananya Joshi",
    department: "Marketing",
    role: "Marketing Executive",
    salary: 42000,
    attendance: 21,
    overtime: 5,
    bonus: 1000,
    deductions: 900,
    netPay: 43100,
    status: "Processed",
    month: "2025-02",
  },
  {
    id: "EMP011",
    name: "Suresh Reddy",
    department: "IT",
    role: "IT Manager",
    salary: 70000,
    attendance: 22,
    overtime: 3,
    bonus: 2000,
    deductions: 1800,
    netPay: 71700,
    status: "Processed",
    month: "2025-03",
  },
  {
    id: "EMP012",
    name: "Divya Rao",
    department: "IT",
    role: "System Administrator",
    salary: 50000,
    attendance: 20,
    overtime: 8,
    bonus: 1500,
    deductions: 1200,
    netPay: 51800,
    status: "Pending",
    month: "2025-03",
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
  return Array.from(months).sort().reverse() // Sort in descending order
}

// Get the most recent month from available months
const getMaxMonth = () => {
  const months = getAvailableMonths()
  return months.length > 0 ? months[0] : getCurrentMonth()
}

// Helper function to get badge classes based on status
const getPayrollStatusBadgeClass = (status: string) => {
  switch (status) {
    case "Processed":
      return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
    case "Pending":
      return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
    default:
      return ""
  }
}

export function PayrollManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(getMaxMonth())
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [viewPayslip, setViewPayslip] = useState<(typeof payrollData)[0] | null>(null)
  // Add a state to track payroll updates
  const [payrollUpdateCounter, setPayrollUpdateCounter] = useState(0)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [processingEmployeeId, setProcessingEmployeeId] = useState<string | undefined>(undefined)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter payroll data based on search query, selected filters, and month
  const filteredPayroll = useMemo(
    () =>
      payrollData.filter((employee) => {
        const matchesSearch =
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.id.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus

        const matchesMonth = employee.month === selectedMonth

        return matchesSearch && matchesStatus && matchesMonth
      }),
    [searchQuery, selectedStatus, selectedMonth, payrollUpdateCounter],
  )

  // Calculate paginated data
  const paginatedPayroll = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPayroll.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPayroll, currentPage, itemsPerPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedStatus, selectedMonth])

  // Handle select all checkbox
  const handleSelectAll = () => {
    // Get only the non-processed employees
    const selectableEmployees = paginatedPayroll.filter((emp) => emp.status !== "Processed")

    if (selectedEmployees.length === selectableEmployees.length && selectableEmployees.length > 0) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(selectableEmployees.map((employee) => employee.id))
    }
  }

  // Handle individual checkbox selection
  const handleSelectEmployee = (id: string) => {
    // Find the employee to check if it's processed
    const employee = payrollData.find((emp) => emp.id === id)

    // If the employee is processed, don't allow selection
    if (employee?.status === "Processed") {
      return
    }

    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id))
    } else {
      setSelectedEmployees([...selectedEmployees, id])
    }
  }

  // Open confirmation dialog before processing
  const confirmProcessPayroll = (id?: string) => {
    setProcessingEmployeeId(id)
    setIsConfirmDialogOpen(true)
  }

  // Actually process payroll after confirmation
  const handleProcessPayroll = () => {
    if (processingEmployeeId) {
      // Process a single employee
      const employeeIndex = payrollData.findIndex((emp) => emp.id === processingEmployeeId)
      if (employeeIndex !== -1) {
        payrollData[employeeIndex].status = "Processed"
        // Update the UI
        setSelectedEmployees((prev) => prev.filter((empId) => empId !== processingEmployeeId))
        alert(`Payroll for employee ${processingEmployeeId} has been processed successfully.`)
      }
    } else {
      // Process multiple employees
      selectedEmployees.forEach((empId) => {
        const employeeIndex = payrollData.findIndex((emp) => emp.id === empId)
        if (employeeIndex !== -1) {
          payrollData[employeeIndex].status = "Processed"
        }
      })
      alert(`Payroll for ${selectedEmployees.length} employees has been processed successfully.`)
      setSelectedEmployees([])
    }

    // Close the dialog and reset the processing employee ID
    setIsConfirmDialogOpen(false)
    setProcessingEmployeeId(undefined)

    // Force a re-render by incrementing the counter
    setPayrollUpdateCounter((prev) => prev + 1)
  }

  // View payslip
  const handleViewPayslip = (employee: (typeof payrollData)[0]) => {
    setViewPayslip(employee)
  }

  // Function to print the payslip
  const handlePrintPayslip = useCallback(() => {
    if (!viewPayslip) return

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to print the payslip")
      return
    }

    // Generate the payslip HTML content
    const payslipContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${viewPayslip.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .payslip { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .company { font-size: 24px; font-weight: bold; }
          .title { font-size: 18px; margin: 10px 0; }
          .employee-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total { font-weight: bold; border-top: 1px solid #ddd; padding-top: 5px; margin-top: 5px; }
          .net-pay { background-color: #f5f5f5; padding: 10px; font-size: 18px; font-weight: bold; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="payslip">
          <div class="header">
            <div class="company">Dhaara ERP</div>
            <div class="title">Payslip for ${formatMonth(viewPayslip.month || "")}</div>
          </div>
          
          <div class="employee-details">
            <div>
              <p><strong>Employee Name:</strong> ${viewPayslip.name}</p>
              <p><strong>Employee ID:</strong> ${viewPayslip.id}</p>
            </div>
            <div>
              <p><strong>Department:</strong> ${viewPayslip.department}</p>
              <p><strong>Role:</strong> ${viewPayslip.role}</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Earnings</div>
            <div class="row">
              <span>Basic Salary</span>
              <span>₹${viewPayslip.salary.toLocaleString()}</span>
            </div>
            <div class="row">
              <span>Overtime (${viewPayslip.overtime} hrs)</span>
              <span>₹${(viewPayslip.overtime * (viewPayslip.salary / 176)).toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Bonus</span>
              <span>₹${viewPayslip.bonus.toLocaleString()}</span>
            </div>
            <div class="row total">
              <span>Total Earnings</span>
              <span>₹${(
                viewPayslip.salary + viewPayslip.bonus + viewPayslip.overtime * (viewPayslip.salary / 176)
              ).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Deductions</div>
            <div class="row">
              <span>Tax</span>
              <span>₹${(viewPayslip.deductions * 0.6).toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Provident Fund</span>
              <span>₹${(viewPayslip.deductions * 0.3).toFixed(2)}</span>
            </div>
            <div class="row">
              <span>Other Deductions</span>
              <span>₹${(viewPayslip.deductions * 0.1).toFixed(2)}</span>
            </div>
            <div class="row total">
              <span>Total Deductions</span>
              <span>₹${viewPayslip.deductions.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="net-pay">
            <div class="row">
              <span>Net Pay</span>
              <span>₹${viewPayslip.netPay.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p>For any queries regarding your payslip, please contact the HR department.</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    // Write the content to the new window and print
    printWindow.document.open()
    printWindow.document.write(payslipContent)
    printWindow.document.close()
  }, [viewPayslip])

  // Add these functions after the handleViewPayslip function

  // Function to print the payroll table
  const handlePrintPayroll = useCallback(() => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to print the payroll")
      return
    }

    // Generate the payroll table HTML content
    const payrollContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payroll Report - ${formatMonth(selectedMonth)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h1 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <h1>Payroll Report - ${formatMonth(selectedMonth)}</h1>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Attendance</th>
              <th>Overtime (hrs)</th>
              <th>Net Pay (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPayroll
              .map(
                (employee) => `
              <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.role}</td>
                <td>${employee.department}</td>
                <td>${employee.attendance} days</td>
                <td>${employee.overtime} hrs</td>
                <td>₹${employee.netPay.toLocaleString()}</td>
                <td>${employee.status}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Dhaara ERP System - Payroll Module</p>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `

    // Write the content to the new window and print
    printWindow.document.open()
    printWindow.document.write(payrollContent)
    printWindow.document.close()
  }, [filteredPayroll, selectedMonth])

  // Function to export payroll data to CSV
  const handleExportPayroll = useCallback(() => {
    // Create CSV headers
    const headers = [
      "Employee ID",
      "Name",
      "Department",
      "Role",
      "Attendance",
      "Overtime (hrs)",
      "Basic Salary (₹)",
      "Bonus (₹)",
      "Deductions (₹)",
      "Net Pay (₹)",
      "Status",
    ]

    // Convert data to CSV format
    const csvData = filteredPayroll.map((employee) => [
      employee.id,
      employee.name,
      employee.department,
      employee.role,
      employee.attendance,
      employee.overtime,
      employee.salary,
      employee.bonus,
      employee.deductions,
      employee.netPay,
      employee.status,
    ])

    // Add headers to the beginning
    csvData.unshift(headers)

    // Convert to CSV string
    const csvContent = csvData.map((row) => row.join(",")).join("\n")

    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })

    // Create a download link
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    // Set link properties
    link.setAttribute("href", url)
    link.setAttribute("download", `payroll_${selectedMonth}_export.csv`)
    link.style.visibility = "hidden"

    // Add to document, click and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Show success message
    alert(`Payroll data for ${formatMonth(selectedMonth)} has been exported successfully.`)
  }, [filteredPayroll, selectedMonth])

  // Update the buttons in the return statement to use these functions

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
          <Button size="sm" onClick={() => confirmProcessPayroll()}>
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
                    checked={
                      paginatedPayroll.filter((emp) => emp.status !== "Processed").length > 0 &&
                      selectedEmployees.length === paginatedPayroll.filter((emp) => emp.status !== "Processed").length
                    }
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
              {paginatedPayroll.length > 0 ? (
                paginatedPayroll.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => handleSelectEmployee(employee.id)}
                        aria-label={`Select ${employee.name}`}
                        disabled={employee.status === "Processed"}
                      />
                    </TableCell>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.attendance} days</TableCell>
                    <TableCell>{employee.overtime} hrs</TableCell>
                    <TableCell className="font-medium">₹{employee.netPay.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(getPayrollStatusBadgeClass(employee.status))}>
                        {employee.status}
                      </Badge>
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
                                onClick={() => confirmProcessPayroll(employee.id)}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No payroll records found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredPayroll.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredPayroll.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredPayroll.length)} of {filteredPayroll.length} records
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1 || filteredPayroll.length === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  {Array.from(
                    { length: Math.min(5, Math.ceil(filteredPayroll.length / itemsPerPage) || 1) },
                    (_, i) => {
                      // Show pages around current page
                      let pageNum = 1
                      const totalPages = Math.ceil(filteredPayroll.length / itemsPerPage)
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={filteredPayroll.length === 0}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    },
                  )}
                  {Math.ceil(filteredPayroll.length / itemsPerPage) > 5 &&
                    currentPage < Math.ceil(filteredPayroll.length / itemsPerPage) - 2 && (
                      <>
                        {currentPage < Math.ceil(filteredPayroll.length / itemsPerPage) - 3 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.ceil(filteredPayroll.length / itemsPerPage))}
                          disabled={filteredPayroll.length === 0}
                          className="h-8 w-8 p-0"
                        >
                          {Math.ceil(filteredPayroll.length / itemsPerPage)}
                        </Button>
                      </>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={
                      currentPage === Math.ceil(filteredPayroll.length / itemsPerPage) || filteredPayroll.length === 0
                    }
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedPayroll.length} of {filteredPayroll.length} employees for {formatMonth(selectedMonth)}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrintPayroll}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPayroll}>
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
                <Button onClick={handlePrintPayslip}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Payslip
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Payroll Processing</DialogTitle>
            <DialogDescription>
              {processingEmployeeId
                ? `Are you sure you want to process payroll for employee ${processingEmployeeId}?`
                : `Are you sure you want to process payroll for ${selectedEmployees.length} selected employees?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayroll}>Confirm Processing</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
