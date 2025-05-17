"use client"

import type React from "react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export type Asset = {
  id: string
  name: string
  category: string
  purchaseDate: string
  cost: number
  currentValue: number
  location: string
  status: string
  manufacturer?: string
  modelNumber?: string
  serialNumber?: string
  warrantyExpiry?: string
  lastMaintenance?: string
  nextMaintenance?: string
}

interface AddAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddAsset: (asset: Asset) => void
}

export function AddAssetDialog({ open, onOpenChange, onAddAsset }: AddAssetDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    purchaseDate: format(new Date(), "yyyy-MM-dd"),
    cost: "",
    location: "",
    status: "In Use",
    manufacturer: "",
    modelNumber: "",
    serialNumber: "",
    warrantyExpiry: format(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), "yyyy-MM-dd"),
    lastMaintenance: "",
    nextMaintenance: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Generate a new asset ID
    const assetId = `FA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    // Calculate current value (for simplicity, using 95% of cost as initial current value)
    const cost = Number.parseFloat(formData.cost) || 0
    const currentValue = cost * 0.95

    const newAsset: Asset = {
      id: assetId,
      name: formData.name,
      category: formData.category,
      purchaseDate: formData.purchaseDate,
      cost: cost,
      currentValue: currentValue,
      location: formData.location,
      status: formData.status,
      manufacturer: formData.manufacturer,
      modelNumber: formData.modelNumber,
      serialNumber: formData.serialNumber,
      warrantyExpiry: formData.warrantyExpiry,
      lastMaintenance: formData.lastMaintenance,
      nextMaintenance: formData.nextMaintenance,
    }

    onAddAsset(newAsset)
    onOpenChange(false)

    // Reset form
    setFormData({
      name: "",
      category: "",
      purchaseDate: format(new Date(), "yyyy-MM-dd"),
      cost: "",
      location: "",
      status: "In Use",
      manufacturer: "",
      modelNumber: "",
      serialNumber: "",
      warrantyExpiry: format(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), "yyyy-MM-dd"),
      lastMaintenance: "",
      nextMaintenance: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
            <DialogDescription>Enter the details of the new asset to add it to the register.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] my-4 px-1">
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-full mr-4">
                  <Label htmlFor="name" className="text-right">
                    Asset Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div className="min-w-[120px]">
                  <Label htmlFor="status" className="mb-2 block">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)} required>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Use">In Use</SelectItem>
                      <SelectItem value="In Storage">In Storage</SelectItem>
                      <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="Disposed">Disposed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="mb-2 block">
                    Category
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Machinery & Equipment">Machinery & Equipment</SelectItem>
                      <SelectItem value="Vehicles">Vehicles</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                      <SelectItem value="Furniture & Fixtures">Furniture & Fixtures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location" className="mb-2 block">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="purchaseDate" className="mb-2 block">
                    Purchase Date
                  </Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleChange("purchaseDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cost" className="mb-2 block">
                    Cost (₹)
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleChange("cost", e.target.value)}
                    min="0"
                    step="1000"
                    required
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Maintenance Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastMaintenance" className="mb-2 block">
                      Last maintenance
                    </Label>
                    <Input
                      id="lastMaintenance"
                      type="date"
                      value={formData.lastMaintenance}
                      onChange={(e) => handleChange("lastMaintenance", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nextMaintenance" className="mb-2 block">
                      Next scheduled
                    </Label>
                    <Input
                      id="nextMaintenance"
                      type="date"
                      value={formData.nextMaintenance}
                      onChange={(e) => handleChange("nextMaintenance", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Additional Information</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="manufacturer" className="mb-2 block">
                      Manufacturer
                    </Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => handleChange("manufacturer", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelNumber" className="mb-2 block">
                      Model Number
                    </Label>
                    <Input
                      id="modelNumber"
                      value={formData.modelNumber}
                      onChange={(e) => handleChange("modelNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serialNumber" className="mb-2 block">
                      Serial Number
                    </Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => handleChange("serialNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="warrantyExpiry" className="mb-2 block">
                      Warranty Expiry
                    </Label>
                    <Input
                      id="warrantyExpiry"
                      type="date"
                      value={formData.warrantyExpiry}
                      onChange={(e) => handleChange("warrantyExpiry", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Asset</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
