"use client"

import type React from "react"

import { useState, useEffect } from "react" // Import useEffect
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, XIcon } from "lucide-react" // Import icons
import { Client, useClient } from "@/app/sales/client-list/client-context"

interface ClientDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client // Replace 'any' with a more specific type if available
  onSave: (updatedClient: any) => void // Replace 'any' with a more specific type if available
}

export function ClientDetailsDialog({ open, onOpenChange, client, onSave }: ClientDetailsDialogProps) {
  const [editedClient, setEditedClient] = useState({
    id: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddresses: [""], // Initialize as array
    clientType: "",
    gst: "",
    pan: "",
  })
  const [isSameAddress, setIsSameAddress] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  // Effect to update form data when client prop changes (e.g., when dialog opens with a new client)
  useEffect(() => {
    if (client) {
      const initialShippingAddresses =
        Array.isArray(client.shippingAddresses) && client.shippingAddresses.length > 0
          ? client.shippingAddresses
          : [client.billingAddress || ""] // Use client.address as fallback for first shipping address

      setEditedClient({
        id: client.id || "",
        name: client.name || "",
        contactPerson: client.contactPerson || "",
        email: client.email || "",
        phone: client.phoneNumber || "",
        billingAddress: client.billingAddress || "", // Assuming 'address' is the billing address
        shippingAddresses: initialShippingAddresses,
        clientType: client.clientType || "",
        gst: client.gstNumber || "",
        pan: client.panNumber || "",
      })

      // Determine initial state of isSameAddress
      const firstShippingAddress = initialShippingAddresses[0]
      setIsSameAddress(firstShippingAddress === client.address && initialShippingAddresses.length === 1)
    }
  }, [client])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedClient((prev) => ({ ...prev, [name]: value }))

    // If billing address changes and checkbox is checked, update the first shipping address
    if (name === "billingAddress" && isSameAddress) {
      setEditedClient((prev) => ({ ...prev, shippingAddresses: [value] }))
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleShippingAddressChange = (index: number, value: string) => {
    setEditedClient((prev) => {
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
    setEditedClient((prev) => ({
      ...prev,
      shippingAddresses: [...prev.shippingAddresses, ""],
    }))
  }

  const handleRemoveShippingAddress = (indexToRemove: number) => {
    setEditedClient((prev) => ({
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

  const handleSelectChange = (value: string) => {
    setEditedClient((prev) => ({ ...prev, clientType: value }))
    // Clear error when field is edited
    if (errors.clientType) {
      setErrors((prev) => ({ ...prev, clientType: null }))
    }
  }

  const handleSameAddressCheckboxChange = (checked: boolean) => {
    setIsSameAddress(checked)
    if (checked) {
      // Auto-fill first shipping address with billing address
      setEditedClient((prev) => ({ ...prev, shippingAddresses: [prev.billingAddress] }))
    } else {
      // Clear first shipping address when unchecked
      setEditedClient((prev) => ({ ...prev, shippingAddresses: [""] }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string | null> = {}
    if (!editedClient.name.trim()) newErrors.name = "Client name is required"
    if (!editedClient.contactPerson.trim()) newErrors.contactPerson = "Contact person is required"
    if (!editedClient.email.trim()) newErrors.email = "Email is required"
    if (!/^\S+@\S+\.\S+$/.test(editedClient.email)) newErrors.email = "Invalid email format"
    if (!editedClient.phone.trim()) newErrors.phone = "Phone number is required"
    if (!editedClient.billingAddress.trim()) newErrors.billingAddress = "Billing address is required"

    // Validate all shipping addresses
    if (editedClient.shippingAddresses.length === 0) {
      newErrors.shippingAddresses = "At least one shipping address is required"
    } else {
      editedClient.shippingAddresses.forEach((address, index) => {
        if (!address.trim()) {
          newErrors[`shippingAddresses[${index}]`] = `Shipping Address ${index + 1} is required`
        }
      })
    }

    if (!editedClient.clientType) newErrors.clientType = "Client type is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const { editClient } = useClient()
  const handleSave = () => {
    if (validateForm() && editClient) {
      editClient({
        clientType: editedClient.clientType,
        contactPerson: editedClient.contactPerson,
        email: editedClient.email,
        gstNumber: editedClient.gst,
        name: editedClient.name,
        panNumber: editedClient.pan,
        phoneNumber: editedClient.phone,
        shippingAddresses: editedClient.shippingAddresses,
        billingAddress: editedClient.billingAddress
      }, parseInt(editedClient.id)).then(() => {
        onOpenChange(false)
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Basic Information Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-id">Client ID</Label>
                <Input id="client-id" value={editedClient.id} className="w-full" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input id="name" name="name" value={editedClient.name} onChange={handleChange} className="w-full" />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">
                  Contact Person <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={editedClient.contactPerson}
                  onChange={handleChange}
                  className="w-full"
                />
                {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editedClient.email}
                  onChange={handleChange}
                  className="w-full"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input id="phone" name="phone" value={editedClient.phone} onChange={handleChange} className="w-full" />
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
                  value={editedClient.billingAddress}
                  onChange={handleChange}
                  className="w-full"
                  rows={3}
                />
                {errors.billingAddress && <p className="text-sm text-red-500">{errors.billingAddress}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="sameAddress" checked={isSameAddress} onCheckedChange={handleSameAddressCheckboxChange} />
                <Label htmlFor="sameAddress" className="text-sm font-normal">
                  Billing address is Shipping Address (for the first address)
                </Label>
              </div>

              {editedClient.shippingAddresses.map((address, index) => (
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
                <Select value={editedClient.clientType} onValueChange={handleSelectChange}>
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
                  <Input id="gst" name="gst" value={editedClient.gst} onChange={handleChange} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input id="pan" name="pan" value={editedClient.pan} onChange={handleChange} className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
