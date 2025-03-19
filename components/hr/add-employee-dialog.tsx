"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEmployeeDialog({ open, onOpenChange }: AddEmployeeDialogProps) {
  const [activeTab, setActiveTab] = useState("personal")
  // Update the formData state to include aadhaarImage
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    contactNumber: "",
    personalEmail: "",
    dob: "",
    dateOfJoining: "",
    payCycle: "monthly",
    panNumber: "",
    aadhaarNumber: "",
    sundayOn: "no",
    bloodGroup: "",
    salary: "",
    bankName: "",
    bankBranch: "",
    accountNumber: "",
    ifscCode: "",
    address: "",
    employeeType: "Full-time",
    shiftDuration: "8",
    role: "",
    department: "",
  })

  // Add state for the Aadhaar image file
  const [aadhaarImage, setAadhaarImage] = useState<File | null>(null)
  const [aadhaarImagePreview, setAadhaarImagePreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Automatically set Sunday Off for full-time employees
  useEffect(() => {
    if (formData.employeeType === "Full-time") {
      setFormData((prev) => ({ ...prev, [name]: "no" }))
    }
  }, [formData.employeeType])

  // Add a function to handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAadhaarImage(file)

      // Create a preview URL for the image
      const reader = new FileReader()
      reader.onload = () => {
        setAadhaarImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Update the handleSubmit function to include the Aadhaar image
  const handleSubmit = () => {
    // Validation logic for required fields
    if (!aadhaarImage) {
      alert("Please upload Aadhaar card image")
      return
    }

    console.log("Form submitted:", formData)
    console.log("Aadhaar image:", aadhaarImage)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Enter employee details to add them to the system</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="employment">Employment Details</TabsTrigger>
            <TabsTrigger value="financial">Financial Details</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => handleSelectChange("bloodGroup", value)}>
                  <SelectTrigger id="bloodGroup">
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
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalEmail">Personal Email</Label>
                <Input
                  id="personalEmail"
                  name="personalEmail"
                  type="email"
                  value={formData.personalEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                <Input
                  id="aadhaarNumber"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Add the Aadhaar image upload field below the Aadhaar number field */}
            {/* Find the div containing the Aadhaar number field in the personal tab */}
            {/* After this div: */}
            {/* <div className="space-y-2">
              <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
              <Input
                id="aadhaarNumber"
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                required
              />
            </div> */}

            {/* Add this new div right after the Aadhaar number field: */}
            <div className="space-y-2">
              <Label htmlFor="aadhaarImage">Aadhaar Card Image *</Label>
              <div className="flex flex-col gap-2">
                <Input
                  id="aadhaarImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  required
                />
                {aadhaarImagePreview && (
                  <div className="relative mt-2 h-32 w-full overflow-hidden rounded-md border">
                    <img
                      src={aadhaarImagePreview || "/placeholder.svg"}
                      alt="Aadhaar card preview"
                      className="h-full w-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => {
                        setAadhaarImage(null)
                        setAadhaarImagePreview(null)
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  // Check if required fields in personal tab are filled
                  if (
                    !formData.firstName ||
                    !formData.lastName ||
                    !formData.gender ||
                    !formData.contactNumber ||
                    !formData.dob ||
                    !formData.aadhaarNumber ||
                    !aadhaarImage ||
                    !formData.address
                  ) {
                    alert("Please fill all required fields including Aadhaar card image")
                    return
                  }
                  setActiveTab("employment")
                }}
              >
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="employment" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeType">Employee Type *</Label>
                <Select
                  value={formData.employeeType}
                  onValueChange={(value) => handleSelectChange("employeeType", value)}
                >
                  <SelectTrigger id="employeeType">
                    <SelectValue placeholder="Select employee type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">Date of Joining *</Label>
                <Input
                  id="dateOfJoining"
                  name="dateOfJoining"
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Production Manager">Production Manager</SelectItem>
                    <SelectItem value="Line Supervisor">Line Supervisor</SelectItem>
                    <SelectItem value="Line Worker">Line Worker</SelectItem>
                    <SelectItem value="Quality Control">Quality Control</SelectItem>
                    <SelectItem value="HR Executive">HR Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shiftDuration">Shift Duration (hours) *</Label>
                <Select
                  value={formData.shiftDuration}
                  onValueChange={(value) => handleSelectChange("shiftDuration", value)}
                >
                  <SelectTrigger id="shiftDuration">
                    <SelectValue placeholder="Select shift duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="10">10 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payCycle">Pay Cycle *</Label>
                <Select value={formData.payCycle} onValueChange={(value) => handleSelectChange("payCycle", value)}>
                  <SelectTrigger id="payCycle">
                    <SelectValue placeholder="Select pay cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sundayOn">Sunday On *</Label>
                <Select value={formData.sundayOn} onValueChange={(value) => handleSelectChange("sundayOn", value)}>
                  <SelectTrigger id="sundayOn">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("personal")}>
                Previous
              </Button>
              <Button onClick={() => setActiveTab("financial")}>Next</Button>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">
                  {formData.employeeType === "Full-time" ? "Monthly Salary *" : "Salary (Year) *"}
                </Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankBranch">Bank Branch</Label>
                <Input id="bankBranch" name="bankBranch" value={formData.bankBranch} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input id="ifscCode" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("employment")}>
                Previous
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

