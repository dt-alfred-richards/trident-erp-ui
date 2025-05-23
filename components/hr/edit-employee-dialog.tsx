"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Employee {
  id: string
  firstName: string
  middleName?: string
  lastName: string
  email: string
  bloodGroup?: string
  dateOfBirth?: string
  role: string
  department: string
  employeeType: string
  shiftDuration?: string
  annualLeaves?: number
  payCycle?: string
  salary: number
  contactNumber: string
  dateOfJoining: string
  gender: string
  [key: string]: any // For additional fields
}

interface EditEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
  onSave: (employee: Employee) => void
}

export function EditEmployeeDialog({ open, onOpenChange, employee, onSave }: EditEmployeeDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Employee | null>(null)
  const [activeTab, setActiveTab] = useState("personal")

  // Initialize form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData({ ...employee })
    }
  }, [employee])

  const handleChange = (field: string, value: string | number) => {
    if (formData) {
      setFormData({ ...formData, [field]: value })
    }
  }

  const handleSubmit = () => {
    if (formData) {
      // Validate required fields
      if (!formData.firstName || !formData.lastName) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields in the Personal tab.",
          variant: "destructive",
        })
        setActiveTab("personal")
        return
      }

      if (!formData.role || !formData.department || !formData.dateOfJoining) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields in the Employment tab.",
          variant: "destructive",
        })
        setActiveTab("employment")
        return
      }

      if (!formData.salary) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields in the Financial tab.",
          variant: "destructive",
        })
        setActiveTab("financial")
        return
      }

      onSave(formData)
      onOpenChange(false)
    }
  }

  if (!formData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Update employee information. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName || ""}
                  onChange={(e) => handleChange("middleName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={formData.bloodGroup || ""} onValueChange={(value) => handleChange("bloodGroup", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email ID *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalEmail">Personal Email ID</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  value={formData.personalEmail || ""}
                  onChange={(e) => handleChange("personalEmail", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => handleChange("contactNumber", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Employment Details Tab */}
          <TabsContent value="employment" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  value={formData.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                  required
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">Date of Joining *</Label>
                <Input
                  id="dateOfJoining"
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) => handleChange("dateOfJoining", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeType">Employee Type *</Label>
                <Select value={formData.employeeType} onValueChange={(value) => handleChange("employeeType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shiftDuration">Shift Duration</Label>
                <Select
                  value={formData.shiftDuration || ""}
                  onValueChange={(value) => handleChange("shiftDuration", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualLeaves">Annual Leaves</Label>
                <Input
                  id="annualLeaves"
                  type="number"
                  min="0"
                  value={formData.annualLeaves || ""}
                  onChange={(e) => handleChange("annualLeaves", Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payCycle">Pay Cycle</Label>
                <Select value={formData.payCycle || ""} onValueChange={(value) => handleChange("payCycle", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sundayOn">Sunday On *</Label>
                <Select value={formData.sundayOn || "No"} onValueChange={(value) => handleChange("sundayOn", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Financial Details Tab */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">{formData.employeeType === "Part-time" ? "Salary (Year) *" : "Salary *"}</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", Number.parseFloat(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  value={formData.panNumber || ""}
                  onChange={(e) => handleChange("panNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pfNumber">PF Number</Label>
                <Input
                  id="pfNumber"
                  value={formData.pfNumber || ""}
                  onChange={(e) => handleChange("pfNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="esiNumber">ESI Number</Label>
                <Input
                  id="esiNumber"
                  value={formData.esiNumber || ""}
                  onChange={(e) => handleChange("esiNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">Banking Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName || ""}
                    onChange={(e) => handleChange("bankName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankBranch">Bank Branch</Label>
                  <Input
                    id="bankBranch"
                    value={formData.bankBranch || ""}
                    onChange={(e) => handleChange("bankBranch", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber || ""}
                    onChange={(e) => handleChange("accountNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={formData.ifscCode || ""}
                    onChange={(e) => handleChange("ifscCode", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
