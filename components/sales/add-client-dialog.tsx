"use client"

import { useCallback, useState } from "react"
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
import { DataByTableName } from "../utils/api"
import { useOrders } from "@/contexts/order-context"

export function AddClientDialog({ open, onOpenChange, onAddClient }: any) {
  const { setRefetchData } = useOrders();
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  })

  const [errors, setErrors] = useState<any>({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {} as any
    if (!formData.name.trim()) newErrors.name = "Client name is required"
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = useCallback((e) => {
    e.preventDefault()

    if (validateForm()) {
      const { address, contactPerson, email, name, phone } = formData

      const instance = new DataByTableName("dim_client_v2")

      instance.post({
        name,
        reference: contactPerson,
        email,
        contactNumber: phone,
        address,
        type: "Individual",
        gst: "",
        pan: "",
        cin: "",
      }).then(res => {
        onOpenChange(false)

        // Reset form
        setFormData({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
        })

        // Clear errors
        setErrors({})
        setRefetchData(p => !p)
      }).catch(error => {
        console.log({ error })
      })
    }
  }, [formData])

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
              <Input id="phone" name="phone" type="number" value={formData.phone} onChange={handleChange} className="col-span-3" />
              {errors.phone && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.phone}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
              {errors.address && <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.address}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
