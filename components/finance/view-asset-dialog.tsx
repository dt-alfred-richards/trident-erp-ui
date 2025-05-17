"use client"

import { useState, useEffect } from "react"
import type { Asset } from "./add-asset-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ViewAssetDialogProps {
  asset: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewAssetDialog({ asset, open, onOpenChange }: ViewAssetDialogProps) {
  const [editableAsset, setEditableAsset] = useState<Asset | null>(null)

  useEffect(() => {
    if (asset) {
      setEditableAsset({ ...asset })
    }
  }, [asset])

  if (!editableAsset) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">Asset Details (View Only)</DialogTitle>
          <DialogDescription>Edit information about the selected asset.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-1 flex-grow">
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-full mr-4">
                <Label htmlFor="name">Asset Name</Label>
                <Input id="name" value={editableAsset.name} readOnly />
                <p className="text-sm text-muted-foreground">{editableAsset.id}</p>
              </div>
              <div className="min-w-[120px]">
                <Label htmlFor="status" className="mb-2 block">
                  Status
                </Label>
                <Select value={editableAsset.status} disabled>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Use">In Use</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
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
                <Input id="category" value={editableAsset.category} readOnly />
              </div>
              <div>
                <Label htmlFor="location" className="mb-2 block">
                  Location
                </Label>
                <Input id="location" value={editableAsset.location} readOnly />
              </div>
              <div>
                <Label htmlFor="purchaseDate" className="mb-2 block">
                  Purchase Date
                </Label>
                <Input id="purchaseDate" type="date" value={editableAsset.purchaseDate} readOnly />
              </div>
              <div>
                <Label htmlFor="age" className="mb-2 block">
                  Age
                </Label>
                <Input id="age" value={calculateAge(editableAsset.purchaseDate)} disabled readOnly />
              </div>
              <div>
                <Label htmlFor="cost" className="mb-2 block">
                  Original Cost (₹)
                </Label>
                <Input id="cost" type="number" value={editableAsset.cost} readOnly />
              </div>
              <div>
                <Label htmlFor="currentValue" className="mb-2 block">
                  Current Value (₹)
                </Label>
                <Input id="currentValue" type="number" value={editableAsset.currentValue} readOnly />
              </div>
              <div>
                <Label htmlFor="depreciation" className="mb-2 block">
                  Depreciation (₹)
                </Label>
                <Input
                  id="depreciation"
                  value={(editableAsset.cost - editableAsset.currentValue).toLocaleString("en-IN")}
                  disabled
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="depreciationPercent" className="mb-2 block">
                  Depreciation %
                </Label>
                <Input
                  id="depreciationPercent"
                  value={Math.round(((editableAsset.cost - editableAsset.currentValue) / editableAsset.cost) * 100)}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Maintenance History</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lastMaintenance" className="mb-2 block">
                    Last maintenance
                  </Label>
                  <Input id="lastMaintenance" type="date" defaultValue="2023-05-15" readOnly />
                </div>
                <div>
                  <Label htmlFor="nextMaintenance" className="mb-2 block">
                    Next scheduled
                  </Label>
                  <Input id="nextMaintenance" type="date" defaultValue="2023-08-15" readOnly />
                </div>
              </div>
            </div>

            {/* Additional content to demonstrate scrolling */}
            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Additional Information</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="manufacturer" className="mb-2 block">
                    Manufacturer
                  </Label>
                  <Input id="manufacturer" defaultValue="Acme Corporation" readOnly />
                </div>
                <div>
                  <Label htmlFor="model" className="mb-2 block">
                    Model Number
                  </Label>
                  <Input id="model" defaultValue="AC-2023-XL" readOnly />
                </div>
                <div>
                  <Label htmlFor="serialNumber" className="mb-2 block">
                    Serial Number
                  </Label>
                  <Input id="serialNumber" defaultValue="SN-2023-45678" readOnly />
                </div>
                <div>
                  <Label htmlFor="warranty" className="mb-2 block">
                    Warranty Expiry
                  </Label>
                  <Input id="warranty" type="date" defaultValue="2025-06-30" readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to calculate age of asset
function calculateAge(purchaseDate: string): string {
  const purchase = new Date(purchaseDate)
  const now = new Date()

  const diffTime = Math.abs(now.getTime() - purchase.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)

  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""} ${months} month${months > 1 ? "s" : ""}`
  } else {
    return `${months} month${months > 1 ? "s" : ""}`
  }
}
