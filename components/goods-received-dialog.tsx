"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, Check, ImageIcon, Upload, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GoodsReceivedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poNumber: string
}

// Make sure the export is properly defined
export function GoodsReceivedDialog({ open, onOpenChange, poNumber }: GoodsReceivedDialogProps) {
  // Component implementation remains the same
  const [formData, setFormData] = useState({
    receivedQuantity: "",
    qualityStatus: "accept",
    notes: "",
    useSubstitution: false,
    substitutionItems: [
      {
        id: "1",
        category: "",
        material: "",
        quantity: "",
        unit: "kg",
      },
    ],
  })
  const [imageUploaded, setImageUploaded] = useState(false)

  // This would come from your API in a real application
  const pendingPOs = [
    {
      id: "PO-001",
      supplier: "PlastiCorp Inc.",
      material: "Plastic Resin",
      quantity: 500,
      unit: "kg",
      status: "pending",
    },
    {
      id: "PO-002",
      supplier: "CapMakers Ltd.",
      material: "Bottle Caps",
      quantity: 10000,
      unit: "pcs",
      status: "partial",
      received: 5000,
    },
    {
      id: "PO-003",
      supplier: "Adhesive Solutions",
      material: "Label Adhesive",
      quantity: 100,
      unit: "liters",
      status: "pending",
    },
  ]

  // Find the selected PO details
  const selectedPoDetails = pendingPOs.find((po) => po.id === poNumber) || null

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const rawMaterialCategories = [
    "Plastic Resins",
    "Metal Components",
    "Adhesives",
    "Labels",
    "Packaging Materials",
    "Colorants",
    "Chemicals",
    "Fasteners",
  ]

  // Add a function to get materials by category
  const getMaterialsByCategory = (category: string) => {
    // This would come from your API in a real application
    const materialsByCategory: Record<string, string[]> = {
      "Plastic Resins": ["PET Resin", "HDPE Resin", "PVC Resin", "LDPE Resin"],
      "Metal Components": ["Aluminum Sheets", "Steel Rods", "Copper Wire", "Zinc Plates"],
      Adhesives: ["Label Adhesive", "Packaging Glue", "Industrial Epoxy", "Hot Melt Adhesive"],
      Labels: ["Paper Labels", "Plastic Labels", "Metallic Labels", "Fabric Labels"],
      "Packaging Materials": ["Cardboard Boxes", "Plastic Wraps", "Bubble Wrap", "Foam Inserts"],
      Colorants: ["Red Dye", "Blue Pigment", "Yellow Colorant", "Black Tint"],
      Chemicals: ["Cleaning Solution", "Preservatives", "Stabilizers", "Catalysts"],
      Fasteners: ["Screws", "Bolts", "Rivets", "Clips"],
    }

    return materialsByCategory[category] || []
  }

  // Add a handler for category change to reset material
  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      substitutionCategory: category,
      substitutionMaterial: "", // Reset material when category changes
    }))
  }

  const handleSubstitutionChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      useSubstitution: checked,
      // Reset substitution values when unchecked
      ...(checked
        ? {}
        : {
            substitutionItems: [
              {
                id: "1",
                category: "",
                material: "",
                quantity: "",
                unit: "kg",
              },
            ],
          }),
    }))
  }

  // Update the isValidSubstitutionQuantity function to check for material too
  const isValidSubstitutionQuantity = () => {
    if (!formData.useSubstitution) return true

    // Check if all items have valid data
    return formData.substitutionItems.every((item) => {
      if (!item.category || !item.material) return false
      const quantity = Number(item.quantity)
      return !isNaN(quantity) && quantity > 0
    })
  }

  // Update the handleSubmit function to include the material in the submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate substitution data if enabled
    if (formData.useSubstitution && !isValidSubstitutionQuantity()) {
      alert("Please enter a valid substitution quantity")
      return
    }

    // Here you would submit the GRN to your API
    // Inside handleSubmit, update the console.log to include substitutionMaterial:
    console.log("Creating GRN:", {
      poId: poNumber,
      ...formData,
      // Only include substitution data if enabled
      ...(formData.useSubstitution
        ? {
            substitutions: formData.substitutionItems.map((item) => ({
              category: item.category,
              material: item.material,
              quantity: item.quantity,
              unit: item.unit,
            })),
          }
        : {}),
    })

    alert("Goods received note created successfully!")
    onOpenChange(false)
  }

  if (!selectedPoDetails) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>Purchase order not found.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Receive Goods for PO {poNumber}</DialogTitle>
          <DialogDescription>Record receipt of goods from {selectedPoDetails.supplier}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="po-details">Purchase Order Details</Label>
              <div id="po-details" className="p-3 bg-muted rounded-md">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Material:</span>
                  </div>
                  <div className="font-medium">{selectedPoDetails.material}</div>

                  <div>
                    <span className="text-muted-foreground">Ordered Quantity:</span>
                  </div>
                  <div className="font-medium">
                    {selectedPoDetails.quantity} {selectedPoDetails.unit}
                  </div>

                  <div>
                    <span className="text-muted-foreground">Supplier:</span>
                  </div>
                  <div className="font-medium">{selectedPoDetails.supplier}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="received-quantity">Received Quantity</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="received-quantity"
                  type="number"
                  value={formData.receivedQuantity}
                  onChange={(e) => handleChange("receivedQuantity", e.target.value)}
                  min="1"
                  max={selectedPoDetails.quantity}
                  required
                />
                <span className="text-sm text-muted-foreground w-16">{selectedPoDetails.unit}</span>
              </div>

              {formData.receivedQuantity && Number.parseInt(formData.receivedQuantity) < selectedPoDetails.quantity && (
                <Alert variant="warning" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Partial Delivery</AlertTitle>
                  <AlertDescription>
                    You're recording a partial delivery ({formData.receivedQuantity} of {selectedPoDetails.quantity}{" "}
                    {selectedPoDetails.unit})
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quality Check</Label>
            <RadioGroup
              value={formData.qualityStatus}
              onValueChange={(value) => handleChange("qualityStatus", value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="accept" id="accept" />
                <Label htmlFor="accept" className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Accept - Material meets quality standards
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject" className="flex items-center">
                  <X className="h-4 w-4 mr-2 text-red-500" />
                  Reject - Material does not meet quality standards
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                  Partial Accept - Some items accepted, some rejected
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Inspector Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Add notes about the received goods, quality issues, etc."
              className="h-20"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-substitution"
                checked={formData.useSubstitution}
                onCheckedChange={handleSubstitutionChange}
              />
              <Label htmlFor="use-substitution">Use Material Substitution</Label>
            </div>

            {formData.useSubstitution && (
              <div className="space-y-4 p-4 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Material Substitutions</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        substitutionItems: [
                          ...prev.substitutionItems,
                          {
                            id: Date.now().toString(),
                            category: "",
                            material: "",
                            quantity: "",
                            unit: "kg",
                          },
                        ],
                      }))
                    }}
                  >
                    Add More
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-2">
                  <div className="text-sm font-medium text-muted-foreground">Category</div>
                  <div className="text-sm font-medium text-muted-foreground">Material</div>
                  <div className="text-sm font-medium text-muted-foreground">Quantity</div>
                  <div className="text-sm font-medium text-muted-foreground">Unit</div>
                </div>

                {formData.substitutionItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-4 gap-4 items-start">
                    <div>
                      <Select
                        value={item.category}
                        onValueChange={(value) => {
                          const newItems = [...formData.substitutionItems]
                          newItems[index] = {
                            ...newItems[index],
                            category: value,
                            material: "", // Reset material when category changes
                          }
                          setFormData((prev) => ({
                            ...prev,
                            substitutionItems: newItems,
                          }))
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {rawMaterialCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Select
                        value={item.material}
                        onValueChange={(value) => {
                          const newItems = [...formData.substitutionItems]
                          newItems[index] = {
                            ...newItems[index],
                            material: value,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            substitutionItems: newItems,
                          }))
                        }}
                        disabled={!item.category}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          {getMaterialsByCategory(item.category).map((material) => (
                            <SelectItem key={material} value={material}>
                              {material}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...formData.substitutionItems]
                          newItems[index] = {
                            ...newItems[index],
                            quantity: e.target.value,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            substitutionItems: newItems,
                          }))
                        }}
                        min="0.1"
                        step="0.1"
                        placeholder="Enter quantity"
                        disabled={!item.material}
                        className="w-full"
                      />
                      {item.quantity && Number(item.quantity) <= 0 && (
                        <p className="text-xs text-red-500">Must be &gt; 0</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        valuee={item.unit}
                        onValueChange={(value) => {
                          const newItems = [...formData.substitutionItems]
                          newItems[index] = {
                            ...newItems[index],
                            unit: value,
                          }
                          setFormData((prev) => ({
                            ...prev,
                            substitutionItems: newItems,
                          }))
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="l">l</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="pcs">pcs</SelectItem>
                        </SelectContent>
                      </Select>

                      {formData.substitutionItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              substitutionItems: prev.substitutionItems.filter((_, i) => i !== index),
                            }))
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Photo Evidence</Label>
            <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center">
              {imageUploaded ? (
                <div className="text-center">
                  <div className="mb-2 flex justify-center">
                    <ImageIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium">image-evidence.jpg uploaded</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setImageUploaded(false)}
                    type="button"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-2 flex justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Click to upload photos</p>
                  <Button variant="outline" size="sm" onClick={() => setImageUploaded(true)} type="button">
                    Upload Photos
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create GRN</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

