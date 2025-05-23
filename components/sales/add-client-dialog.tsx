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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Client, useClient } from "@/app/sales/client-list/client-context"
import { Basic } from "@/contexts/types"

type ComponentClientProps = Omit<Client, keyof Basic>;
const initialState: Client = {
  clientId: "",
  id: -1,
  name: "",
  contactPerson: "",
  email: "",
  phoneNumber: "",
  shippingAddress: "",
  clientType: "", // Add this new field
  gstNumber: "",
  panNumber: "",
  createdBy: "",
  createdOn: "",
  modifiedBy: "",
  modifiedOn: ""

}
export function AddClientDialog({ open, onOpenChange, onAddClient }) {
  const { addClient, refetchContext } = useClient();
  const [formData, setFormData] = useState<Client>(initialState)

  const [errors, setErrors] = useState<any>({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: null }))
    }
  }

  const handleSelectChange = (value) => {
    setFormData((prev: any) => ({ ...prev, clientType: value }))
    // Clear error when field is edited
    if (errors.clientType) {
      setErrors((prev: any) => ({ ...prev, clientType: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {} as any
    if (!formData.name.trim()) newErrors.name = "Client name is required"
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phoneNumber.trim()) newErrors.phone = "Phone number is required"
    if (!formData.shippingAddress.trim()) newErrors.address = "Address is required"
    if (!formData.clientType) newErrors.clientType = "Client type is required"
    if (!formData.gstNumber) newErrors.gstNumber = "Gst number is required"
    if (!formData.panNumber) newErrors.panNumber = "Pan number is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      addClient(formData).then(() => {
        onOpenChange(false)

        // Reset form
        setFormData(initialState)

        // Clear errors
        setErrors({})
        refetchContext()
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>Enter the details of the new client.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Client Name
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
              {errors.name && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactPerson" className="text-right">
                Contact Person
              </Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="col-span-3"
              />
              {errors.contactPerson && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.contactPerson}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
              />
              {errors.email && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="col-span-3" />
              {errors.phoneNumber && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.phoneNumber}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gstNumber" className="text-right">
                Gst number
              </Label>
              <Input id="gstNumber" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="col-span-3" />
              {errors.gstNumber && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.gstNumber}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="panNumber" className="text-right">
                Pan number
              </Label>
              <Input id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleChange} className="col-span-3" />
              {errors.panNumber && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.panNumber}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shippingAddress" className="text-right">
                Address
              </Label>
              <Textarea
                id="shippingAddress"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
              {errors.shippingAddress && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.shippingAddress}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientType" className="text-right">
                Client Type
              </Label>
              <div className="col-span-3">
                <Select value={formData.clientType} onValueChange={handleSelectChange}>
                  <SelectTrigger id="clientType">
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Distributor">Distributor</SelectItem>
                    <SelectItem value="Wholeseller">Wholeseller</SelectItem>
                    <SelectItem value="Hotels&Restaurants">Hotels & Restaurants</SelectItem>
                  </SelectContent>
                </Select>
                {errors.clientType && <p className="text-sm text-red-500 mt-1">{errors.clientType}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1b84ff] hover:bg-[#1670e0] text-white">
              Add Client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
