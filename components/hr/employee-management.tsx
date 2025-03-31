"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Edit, Eye, FileText, ExternalLink } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { EditEmployeeDialog } from "./edit-employee-dialog"
import { Pagination } from "@/components/ui/pagination"
import { EmployeeRow, useHrContext } from "@/contexts/hr-context"

export function EmployeeManagement() {
  const { employeeDetails = [] } = useHrContext();
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [employeeData, setEmployeeData] = useState<EmployeeRow[]>([])
  const [showAadharImage, setShowAadharImage] = useState(false)

  useEffect(() => {
    setEmployeeData(employeeDetails);
  }, [employeeDetails])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter employees based on search query and selected filters
  const filteredEmployees = useMemo(
    () =>
      employeeData.filter((employee) => {
        const matchesSearch =
          employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.department.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesEmployeeType = selectedEmployeeType === "all" || employee.employeeType === selectedEmployeeType

        const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment

        const matchesRole = selectedRole === "all" || employee.role === selectedRole

        return matchesSearch && matchesEmployeeType && matchesDepartment && matchesRole
      }),
    [employeeData, searchQuery, selectedEmployeeType, selectedDepartment, selectedRole, employeeDetails],
  )

  // Calculate paginated data
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredEmployees, currentPage, itemsPerPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedEmployeeType, selectedDepartment, selectedRole])

  const handleViewDetails = (id: string) => {
    setSelectedEmployee(id)
    setShowEmployeeDetails(true)
  }

  const handleEditEmployee = (id: string) => {
    setSelectedEmployee(id)
    setShowEditDialog(true)
  }

  const handleSaveEmployee = (updatedEmployee: any) => {
    setEmployeeData(employeeData.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
  }

  const employee = selectedEmployee ? employeeData.find((e) => e.id === selectedEmployee) : null

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" || selectedEmployeeType !== "all" || selectedDepartment !== "all" || selectedRole !== "all"

  // Function to clear all filters
  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedEmployeeType("all")
    setSelectedDepartment("all")
    setSelectedRole("all")
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h3 className="text-lg font-medium">Employee Management</h3>
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

          <Select value={selectedEmployeeType} onValueChange={setSelectedEmployeeType}>
            <SelectTrigger className="h-9 w-[130px]">
              <span>Employee Type</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="h-9 w-[130px]">
              <span>Department</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="h-9 w-[130px]">
              <span>Role</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Production Manager">Production Manager</SelectItem>
              <SelectItem value="Line Supervisor">Line Supervisor</SelectItem>
              <SelectItem value="Line Worker">Line Worker</SelectItem>
              <SelectItem value="Quality Control">Quality Control</SelectItem>
              <SelectItem value="HR Executive">HR Executive</SelectItem>
              <SelectItem value="Finance Manager">Finance Manager</SelectItem>
              <SelectItem value="Accountant">Accountant</SelectItem>
              <SelectItem value="Sales Manager">Sales Manager</SelectItem>
              <SelectItem value="Marketing Executive">Marketing Executive</SelectItem>
              <SelectItem value="IT Manager">IT Manager</SelectItem>
              <SelectItem value="System Administrator">System Administrator</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              className="h-9 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={clearAllFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Employee Type</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <Badge variant={employee.employeeType === "Full-time" ? "default" : "secondary"}>
                        {employee.employeeType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.employeeType === "Full-time"
                        ? `₹${employee.salary.toLocaleString()}/month`
                        : `₹${employee.salary.toLocaleString()}/hour`}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetails(employee.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No employees found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredEmployees.length > 0 && (
            <div className="p-4">
              <Pagination
                totalItems={filteredEmployees.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Dialog */}
      <Dialog open={showEmployeeDetails} onOpenChange={setShowEmployeeDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>View detailed information about the employee</DialogDescription>
          </DialogHeader>

          {employee && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Employee ID</h4>
                  <p>{employee.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Full Name</h4>
                  <p>
                    {employee.firstName} {employee.lastName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Email</h4>
                  <p>{employee.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Contact Number</h4>
                  <p>{employee.contactNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Department</h4>
                  <p>{employee.department}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Role</h4>
                  <p>{employee.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Employee Type</h4>
                  <Badge variant={employee.employeeType === "Full-time" ? "default" : "secondary"}>
                    {employee.employeeType}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Date of Joining</h4>
                  <p>{new Date(employee.dateOfJoining).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Salary</h4>
                  <p>
                    {employee.employeeType === "Full-time"
                      ? `₹${employee.salary.toLocaleString()}/month`
                      : `₹${employee.salary.toLocaleString()}/hour`}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Gender</h4>
                  <p>{employee.gender}</p>
                </div>
              </div>

              {/* New Aadhaar Image Field */}
              <div className="border-t pt-4 mt-2">
                <h4 className="text-sm font-medium mb-2">Identity Documents</h4>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="mr-2">Aadhaar Card:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-blue-600"
                    onClick={() => setShowAadharImage(true)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    View Document
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEmployeeDetails(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowEmployeeDetails(false)
                    handleEditEmployee(employee.id)
                  }}
                >
                  Edit Employee
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Aadhaar Image Viewer Dialog */}
      {employee && (
        <Dialog open={showAadharImage} onOpenChange={setShowAadharImage}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>
                Aadhaar Card - {employee.firstName} {employee.lastName}
              </DialogTitle>
              <DialogDescription>Employee ID: {employee.id}</DialogDescription>
            </DialogHeader>

            <div className="flex justify-center py-4">
              <img
                src={employee.aadharImageUrl || "/placeholder.svg"}
                alt={`Aadhaar card of ${employee.firstName} ${employee.lastName}`}
                className="max-w-full border rounded-md shadow-sm"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAadharImage(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        employee={employee}
        onSave={handleSaveEmployee}
      />
    </div>
  )
}

