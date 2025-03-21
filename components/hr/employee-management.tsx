"use client"

import { useEffect, useState } from "react"
import { Search, Edit, MoreHorizontal, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
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
  "averageWorkingHours": number,
  "monthlyPayment": boolean,
  "basePay": number,
  "sundayHoliday": boolean
}
export function EmployeeManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false)
  const [employees, setEmployees] = useState([]);

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

  // Filter employees based on search query and selected filters
  const filteredEmployees = employees.filter((employee) => {
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

  const employee = selectedEmployee ? employees.find((e) => e.id === selectedEmployee) : null

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
                <TableHead>Shift</TableHead>
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
                  <TableCell>{employee.shift}</TableCell>
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
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Employee</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete Employee</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                  <h4 className="text-sm font-medium mb-1">Shift</h4>
                  <p>{employee.shift}</p>
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
                  <h4 className="text-sm font-medium mb-1">Date of Joining</h4>
                  <p>{new Date(employee.dateOfJoining).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Gender</h4>
                  <p>{employee.gender}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEmployeeDetails(false)}>
                  Close
                </Button>
                <Button>Edit Employee</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

