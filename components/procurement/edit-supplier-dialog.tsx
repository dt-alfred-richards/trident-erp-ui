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

interface EditSupplierDialogProps {
  supplier: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (updatedSupplier: any) => void
}

export function EditSupplierDialog({ supplier, open, onOpenChange, onSave }: EditSupplierDialogProps) {
  const [contactPerson, setContactPerson] = useState(supplier.contactPerson)
  const [email, setEmail] = useState(supplier.email)
  const [phone, setPhone] = useState(supplier.phone)
  const [address, setAddress] = useState(supplier.address || "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate email format
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Validate phone format (simple validation)
    if (phone && !/^[+]?[\d\s-]+$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    // Create updated supplier object
    const updatedSupplier = {
      ...supplier,
      contactPerson,
      email,
      phone,
      address,
    }

    // Call onSave with updated supplier
    onSave(updatedSupplier)

    // Show success toast
    toast({
      title: "Supplier updated",
      description: `${supplier.name} information has been updated.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Supplier Details</DialogTitle>
          <DialogDescription>Update the supplier contact information.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier-id" className="text-right">
              Supplier ID
            </Label>
            <Input id="supplier-id" value={supplier.id} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier-name" className="text-right">
              Supplier Name
            </Label>
            <Input id="supplier-name" value={supplier.name} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact-person" className="text-right">
              Contact Person
            </Label>
            <div className="col-span-3">
              <Input id="contact-person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: "" })
                }}
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
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (errors.phone) setErrors({ ...errors, phone: "" })
                }}
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
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
