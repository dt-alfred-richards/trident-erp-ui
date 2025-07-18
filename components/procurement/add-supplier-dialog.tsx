"use client"

import { useState } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { Suppliers, useProcurement } from "@/app/procurement/procurement-context"

interface AddSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (newSupplier: any) => void
}

export function AddSupplierDialog({ open, onOpenChange, onAdd }: AddSupplierDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    billingAddress: "",
    bankName: "",
    ifscCode: "",
    bankAccount: "",
    upi: "",
    gst: "",
    pan: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate supplier name
    if (!formData.name.trim()) {
      newErrors.name = "Supplier name is required"
    }

    // Validate contact person
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required"
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[+]?[\d\s-]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    // Validate billing address
    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = "Billing address is required"
    }

    // Validate GST
    if (!formData.gst.trim()) {
      newErrors.gst = "GST number is required"
    }

    // Validate email format if provided
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const { addSupplier } = useProcurement()

  const handleSubmit = () => {
    if (validateForm()) {
      // Create new supplier object
      const newSupplier: Partial<Suppliers> = {
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.billingAddress,
        bankAccount: formData.bankAccount,
        bankName: formData.bankName,
        gst: formData.gst,
        ifscCode: formData.ifscCode,
        pan: formData.pan,
        upi: formData.upi
      }

      addSupplier(newSupplier).then(() => {
        // Reset form
        setFormData({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          billingAddress: "",
          bankName: "",
          ifscCode: "",
          bankAccount: "",
          upi: "",
          gst: "",
          pan: "",
        })

        // Close dialog
        onOpenChange(false)

        // Show success toast
        toast({
          title: "Supplier added",
          description: `${newSupplier.name} has been added to the supplier list.`,
        })

      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>Enter supplier details to add a new supplier to the system.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-name">
                  Supplier Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="supplier-name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                  placeholder="Enter supplier name"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-person">
                  Contact Person<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact-person"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange("contactPerson", e.target.value)}
                  className={errors.contactPerson ? "border-destructive" : ""}
                  placeholder="Enter contact person name"
                />
                {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson}</p>}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={errors.phone ? "border-destructive" : ""}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Address Information</h3>
            <div className="space-y-2">
              <Label htmlFor="billing-address">
                Billing Address<span className="text-red-500">*</span>
              </Label>
              <Input
                id="billing-address"
                value={formData.billingAddress}
                onChange={(e) => handleChange("billingAddress", e.target.value)}
                className={errors.billingAddress ? "border-destructive" : ""}
                placeholder="Enter complete billing address"
              />
              {errors.billingAddress && <p className="text-sm text-destructive">{errors.billingAddress}</p>}
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  placeholder="Enter bank name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifsc-code">IFSC Code</Label>
                <Input
                  id="ifsc-code"
                  value={formData.ifscCode}
                  onChange={(e) => handleChange("ifscCode", e.target.value)}
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank-account">Bank Account</Label>
                <Input
                  id="bank-account"
                  value={formData.bankAccount}
                  onChange={(e) => handleChange("bankAccount", e.target.value)}
                  className=""
                  placeholder="Enter bank account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upi">UPI</Label>
                <Input
                  id="upi"
                  value={formData.upi}
                  onChange={(e) => handleChange("upi", e.target.value)}
                  placeholder="Enter UPI ID"
                />
              </div>
            </div>
          </div>

          {/* Business Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gst">
                  GST<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="gst"
                  value={formData.gst}
                  onChange={(e) => handleChange("gst", e.target.value)}
                  className={errors.gst ? "border-destructive" : ""}
                  placeholder="Enter GST number"
                />
                {errors.gst && <p className="text-sm text-destructive">{errors.gst}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan">PAN</Label>
                <Input
                  id="pan"
                  value={formData.pan}
                  onChange={(e) => handleChange("pan", e.target.value)}
                  placeholder="Enter PAN number"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#725af2] hover:bg-[#5e48d0] text-white">
            Add Supplier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
