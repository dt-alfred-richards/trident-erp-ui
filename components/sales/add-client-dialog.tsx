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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, XIcon } from "lucide-react"
import { useClient } from "@/app/sales/client-list/client-context"

export function AddClientDialog({ open, onOpenChange, onAddClient }) {
  const { addClient } = useClient()
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddresses: [""], // Changed to an array
    clientType: "",
    gst: "",
    pan: "",
  })

  const [isSameAddress, setIsSameAddress] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // If billing address changes and checkbox is checked, update the first shipping address
    if (name === "billingAddress" && isSameAddress) {
      setFormData((prev) => ({ ...prev, shippingAddresses: [value] }))
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleShippingAddressChange = (index, value) => {
    setFormData((prev) => {
      const newShippingAddresses = [...prev.shippingAddresses]
      newShippingAddresses[index] = value
      return { ...prev, shippingAddresses: newShippingAddresses }
    })
    // Clear error when field is edited
    if (errors[`shippingAddresses[${index}]`]) {
      setErrors((prev) => ({ ...prev, [`shippingAddresses[${index}]`]: null }))
    }
  }

  const handleAddShippingAddress = () => {
    setFormData((prev) => ({
      ...prev,
      shippingAddresses: [...prev.shippingAddresses, ""],
    }))
  }

  const handleRemoveShippingAddress = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      shippingAddresses: prev.shippingAddresses.filter((_, index) => index !== indexToRemove),
    }))
    // Clear error for the removed address
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[`shippingAddresses[${indexToRemove}]`]
      return newErrors
    })
  }

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, clientType: value }))
    // Clear error when field is edited
    if (errors.clientType) {
      setErrors((prev) => ({ ...prev, clientType: null }))
    }
  }

  const handleSameAddressChange = (checked) => {
    setIsSameAddress(checked)
    if (checked) {
      // Auto-fill first shipping address with billing address
      setFormData((prev) => ({ ...prev, shippingAddresses: [prev.billingAddress] }))
    } else {
      // Clear first shipping address when unchecked
      setFormData((prev) => ({ ...prev, shippingAddresses: [""] }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Client name is required"
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact person is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.billingAddress.trim()) newErrors.billingAddress = "Billing address is required"

    // Validate all shipping addresses
    if (formData.shippingAddresses.length === 0) {
      newErrors.shippingAddresses = "At least one shipping address is required"
    } else {
      formData.shippingAddresses.forEach((address, index) => {
        if (!address.trim()) {
          newErrors[`shippingAddresses[${index}]`] = `Shipping Address ${index + 1} is required`
        }
      })
    }

    if (!formData.clientType) newErrors.clientType = "Client type is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (addClient) {
      addClient({
        clientType: formData.clientType,
        contactPerson: formData.contactPerson,
        email: formData.email,
        gstNumber: formData.gst,
        name: formData.name,
        panNumber: formData.pan,
        phoneNumber: formData.phone,
        shippingAddresses: formData.shippingAddresses,
        billingAddress: formData.billingAddress
      }).then(_ => {
        // Close the dialog
        onOpenChange(false)
        // Reset form
        setFormData({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          billingAddress: "",
          shippingAddresses: [""], // Reset to one empty address
          clientType: "",
          gst: "",
          pan: "",
        })

        // Reset checkbox state
        setIsSameAddress(false)

        // Clear errors
        setErrors({})
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>Enter the details of the new client.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Basic Information Section */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    Contact Person <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                  />
                  {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Address Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">
                    Billing Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="billingAddress"
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    rows={3}
                  />
                  {errors.billingAddress && <p className="text-sm text-red-500">{errors.billingAddress}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="sameAddress" checked={isSameAddress} onCheckedChange={handleSameAddressChange} />
                  <Label htmlFor="sameAddress" className="text-sm font-normal">
                    Billing address is Shipping Address (for the first address)
                  </Label>
                </div>

                {formData.shippingAddresses.map((address, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`shippingAddress-${index}`}>
                        Shipping Address {index + 1} <span className="text-red-500">*</span>
                      </Label>
                      {index > 0 && ( // Only show remove button for additional addresses
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveShippingAddress(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XIcon className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id={`shippingAddress-${index}`}
                      name={`shippingAddress-${index}`}
                      value={address}
                      onChange={(e) => handleShippingAddressChange(index, e.target.value)}
                      rows={3}
                      disabled={index === 0 && isSameAddress} // Only disable the first if same as billing
                    />
                    {errors[`shippingAddresses[${index}]`] && (
                      <p className="text-sm text-red-500">{errors[`shippingAddresses[${index}]`]}</p>
                    )}
                  </div>
                ))}
                {errors.shippingAddresses && <p className="text-sm text-red-500">{errors.shippingAddresses}</p>}

                <Button type="button" variant="outline" onClick={handleAddShippingAddress} className="mt-2">
                  <PlusIcon className="h-4 w-4 mr-2" /> Add Another Shipping Address
                </Button>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Business Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientType">
                    Client Type <span className="text-red-500">*</span>
                  </Label>
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
                  {errors.clientType && <p className="text-sm text-red-500">{errors.clientType}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gst">GST Number</Label>
                    <Input id="gst" name="gst" value={formData.gst} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN Number</Label>
                    <Input id="pan" name="pan" value={formData.pan} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1b84ff] hover:bg-[1670e0] text-white">
              Add Client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
