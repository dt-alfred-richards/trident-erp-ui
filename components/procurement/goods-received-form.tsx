"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, ImageIcon, Upload, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GoodsReceivedFormProps {
  poNumber?: string
}

export function GoodsReceivedForm({ poNumber }: GoodsReceivedFormProps) {
  // First, update the formData state to include the substitutionMaterial field
  const [formData, setFormData] = useState({
    receivedQuantity: "",
    qualityStatus: "accept",
    notes: "",
    useSubstitution: false,
    substitutionCategory: "",
    substitutionMaterial: "",
    substitutionQuantity: "",
  })
  const [imageUploaded, setImageUploaded] = useState(false)
  const [selectedPO, setSelectedPO] = useState<string | undefined>(undefined)

  // This would come from your API in a real application
  const pendingPOs = [
    {
      id: "PO-001",
      supplier: "PlastiCorp Inc.",
      material: "Plastic Resin",
      quantity: 500,
      unit: "kg",
      status: "shipped",
    },
    {
      id: "PO-003",
      supplier: "Adhesive Solutions",
      material: "Label Adhesive",
      quantity: 100,
      unit: "liters",
      status: "sent",
    },
  ]

  // Safely find the selected PO details
  const selectedPoDetails = pendingPOs.find((po) => po.id === selectedPO) || null

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

  const handleSubstitutionChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      useSubstitution: checked,
      // Reset substitution values when unchecked
      ...(checked ? {} : { substitutionCategory: "", substitutionMaterial: "", substitutionQuantity: "" }),
    }))
  }

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

  // Update the isValidSubstitutionQuantity function to check for material too
  const isValidSubstitutionQuantity = () => {
    if (!formData.useSubstitution) return true
    if (!formData.substitutionCategory || !formData.substitutionMaterial) return false

    const quantity = Number(formData.substitutionQuantity)
    return !isNaN(quantity) && quantity > 0
  }

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
      poId: selectedPO,
      ...formData,
      // Only include substitution data if enabled
      ...(formData.useSubstitution
        ? {
            substitution: {
              category: formData.substitutionCategory,
              material: formData.substitutionMaterial,
              quantity: formData.substitutionQuantity,
            },
          }
        : {}),
    })

    alert("Goods received note created successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="po-select" className="mb-2 block">
            Select Purchase Order
          </Label>
          <Select value={selectedPO} onValueChange={setSelectedPO}>
            <SelectTrigger id="po-select">
              <SelectValue placeholder="Select PO to receive" />
            </SelectTrigger>
            <SelectContent>
              {pendingPOs.map((po) => (
                <SelectItem key={po.id} value={po.id}>
                  {po.id} - {po.supplier} ({po.material})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedPoDetails && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Goods Received Note (GRN)</CardTitle>
              <CardDescription>
                Record receipt of goods for PO {selectedPoDetails.id} from {selectedPoDetails.supplier}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-hidden p-0">
              <ScrollArea className="h-full px-6 py-2">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                      {formData.receivedQuantity &&
                        Number.parseInt(formData.receivedQuantity) < selectedPoDetails.quantity && (
                          <Alert variant="warning" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Partial Delivery</AlertTitle>
                            <AlertDescription>
                              You're recording a partial delivery ({formData.receivedQuantity} of{" "}
                              {selectedPoDetails.quantity} {selectedPoDetails.unit})
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
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="substitution-category" className="block mb-2">
                              Category
                            </Label>
                            <Select value={formData.substitutionCategory} onValueChange={handleCategoryChange}>
                              <SelectTrigger id="substitution-category" className="w-full">
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
                            <Label htmlFor="substitution-material" className="block mb-2">
                              Material
                            </Label>
                            <Select
                              value={formData.substitutionMaterial}
                              onValueChange={(value) => handleChange("substitutionMaterial", value)}
                              disabled={!formData.substitutionCategory}
                            >
                              <SelectTrigger id="substitution-material" className="w-full">
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                              <SelectContent>
                                {getMaterialsByCategory(formData.substitutionCategory).map((material) => (
                                  <SelectItem key={material} value={material}>
                                    {material}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="substitution-quantity" className="block mb-2">
                              Quantity
                            </Label>
                            <Input
                              id="substitution-quantity"
                              type="number"
                              value={formData.substitutionQuantity}
                              onChange={(e) => handleChange("substitutionQuantity", e.target.value)}
                              min="0.1"
                              step="0.1"
                              placeholder="Enter quantity"
                              disabled={!formData.substitutionMaterial}
                              className="w-full"
                            />
                            {formData.substitutionQuantity && Number(formData.substitutionQuantity) <= 0 && (
                              <p className="text-sm text-red-500">Quantity must be greater than zero</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Photo Evidence</Label>
                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                      {imageUploaded ? (
                        <div className="text-center">
                          <div className="mb-2 flex justify-center">
                            <ImageIcon className="h-8 w-8 text-green-500" />
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
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to upload photos</p>
                          <Button variant="outline" size="sm" onClick={() => setImageUploaded(true)} type="button">
                            Upload Photos
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit">Create GRN</Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  )
}
