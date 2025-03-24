"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
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
import { DimEmployee, EmployeeBankDetails, EmployeeRow, useHrContext } from "@/contexts/hr-context"
import { DataByTableName } from "../utils/api"
import updateChild from "lodash.update"

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Formdata = Omit<EmployeeRow, "bankDetails">

export function AddEmployeeDialog({ open, onOpenChange }: AddEmployeeDialogProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const { roles = [], refetchData } = useHrContext()
  // Update the formData state to include aadhaarImage
  const [formData, setFormData] = useState<Partial<Formdata>>({})

  const [bankDetails, setBankDetails] = useState<Partial<EmployeeBankDetails>>({})
  // Add state for the Aadhaar image file
  const [aadhaarImage, setAadhaarImage] = useState<File | null>(null)
  const [aadhaarImagePreview, setAadhaarImagePreview] = useState<string | null>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevState => {
      const newPrev = { ...prevState } as any
      updateChild(newPrev, name, () => value);
      return newPrev
    })
  }, [setFormData])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Automatically set Sunday Off for full-time employees
  useEffect(() => {
    if (formData.employeeType === "full-time") {
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

    const { address, contactNumber, department, email, dateOfJoining, firstName, lastName, role = "", salary, sundayHoliday, employeeType: employmentType, gender, dateOfJoining: joiningDate, shiftDuration } = formData
    const employeePayload = {
      address, contactNumber, department, email, employmentType, firstName, gender, joiningDate, lastName, role: role.toLowerCase(), salary, sundayHoliday, averageWorkingHours: shiftDuration
    }
    const { accountNumber = "", bankBranch, bankName, ifscCode } = bankDetails
    const bankDetailsPayload = {
      accountNumber: parseInt(accountNumber as any), bankBranch, bankName, ifscCode, pfNumber: "", esiNumber: ""
    } as Partial<EmployeeBankDetails>

    const employeeInstance = new DataByTableName("dim_employee_v2");
    const bankInstance = new DataByTableName("employee_bank_details");

    employeeInstance.post(employeePayload).then(res => {
      return bankInstance.post(bankDetailsPayload)
    }).then(() => {
      onOpenChange(false)
      setFormData({})
      setBankDetails({})
      refetchData()
    }).catch(error => {
      console.log({ error })
    })

    console.log("Form submitted:", formData)
    console.log("Aadhaar image:", aadhaarImage)
    // onOpenChange(false)
  }

  const handleBank = useCallback((event: any) => {
    const { name, value } = event.target;
    setBankDetails(prev => ({
      ...prev, [name]: value
    }))
  }, [])

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
                  type="number"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalEmail">Personal Email</Label>
                <Input
                  id="personalEmail"
                  name="email"
                  type="email"
                  value={formData.email}
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
                  type="number"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
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
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
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
                    {
                      roles.map(item =>
                        <SelectItem key={item + "test"} value={item}>{item}</SelectItem>
                      )
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shiftDuration">Shift Duration (hours) *</Label>
                <Select
                  value={(formData.shiftDuration ?? 0) + ""}
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

            <div className="space-y-2">
              <Label htmlFor="leaves">Annual Leaves *</Label>
              <Input id="leaves" name="leaves" type="number" value={formData.leaves} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payCycle">Pay Cycle *</Label>
                <Select value={formData.payCycle} onValueChange={(value) => handleSelectChange("payCycle", value)}>
                  <SelectTrigger id="payCycle">
                    <SelectValue placeholder="Select pay cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sundayOn">Sunday On *</Label>
                <Select value={formData.sundayHoliday + ""} onValueChange={(value) => handleSelectChange("sundayHoliday", value)}>
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
                  {formData.employeeType === "full-time" ? "Monthly Salary *" : "Salary (Year) *"}
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
                <Input id="bankName" name="bankName" value={bankDetails.bankName} onChange={handleBank} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankBranch">Bank Branch</Label>
                <Input id="bankBranch" name="bankBranch" value={bankDetails.bankBranch} onChange={handleBank} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" name="accountNumber" type="number" value={bankDetails.accountNumber} onChange={handleBank} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input id="ifscCode" name="ifscCode" value={bankDetails.ifscCode} onChange={handleBank} />
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

