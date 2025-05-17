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

interface AddSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (newSupplier: any) => void
  existingIds: string[]
}

export function AddSupplierDialog({ open, onOpenChange, onAdd, existingIds }: AddSupplierDialogProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
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

    // Validate supplier ID
    if (!formData.id.trim()) {
      newErrors.id = "Supplier ID is required"
    } else if (existingIds.includes(formData.id)) {
      newErrors.id = "This Supplier ID already exists"
    }

    // Validate supplier name
    if (!formData.name.trim()) {
      newErrors.name = "Supplier name is required"
    }

    // Validate email format if provided
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Validate phone format if provided (simple validation)
    if (formData.phone && !/^[+]?[\d\s-]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      // Create new supplier object
      const newSupplier = {
        id: formData.id,
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        // Keep these fields in the data model but they won't be displayed in the table
        materialName: "",
        materialType: "",
        price: 0,
        unit: "",
      }

      // Call onAdd with new supplier
      onAdd(newSupplier)

      // Reset form
      setFormData({
        id: "",
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
      })

      // Close dialog
      onOpenChange(false)

      // Show success toast
      toast({
        title: "Supplier added",
        description: `${newSupplier.name} has been added to the supplier list.`,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
          <DialogDescription>Enter supplier details to add a new supplier to the system.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier-id" className="text-right">
              Supplier ID*
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="supplier-id"
                value={formData.id}
                onChange={(e) => handleChange("id", e.target.value)}
                className={errors.id ? "border-destructive" : ""}
              />
              {errors.id && <p className="text-sm text-destructive">{errors.id}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier-name" className="text-right">
              Supplier Name*
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="supplier-name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact-person" className="text-right">
              Contact Person
            </Label>
            <div className="col-span-3">
              <Input
                id="contact-person"
                value={formData.contactPerson}
                onChange={(e) => handleChange("contactPerson", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
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
