"use client"

import { useState } from "react"
import { Search, Edit, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { EditEmployeeDialog } from "./edit-employee-dialog"

// Sample employee data
const employees = [
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
  },
]

export function EmployeeManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [employeeData, setEmployeeData] = useState(employees)

  // Filter employees based on search query and selected filters
  const filteredEmployees = employeeData.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEmployeeType = selectedEmployeeType === "all" || employee.employeeType === selectedEmployeeType

    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment

    const matchesRole = selectedRole === "all" || employee.role === selectedRole

    return matchesSearch && matchesEmployeeType && matchesDepartment && matchesRole
  })

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
            </SelectContent>
          </Select>
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
              {filteredEmployees.map((employee) => (
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
              ))}
            </TableBody>
          </Table>
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

