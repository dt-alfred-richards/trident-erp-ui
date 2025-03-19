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

interface GoodsReceivedFormProps {
  poNumber?: string
}

export function GoodsReceivedForm({ poNumber }: GoodsReceivedFormProps) {
  const [selectedPO, setSelectedPO] = useState<string>(poNumber || "")
  const [formData, setFormData] = useState({
    receivedQuantity: "",
    qualityStatus: "accept",
    notes: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would submit the GRN to your API
    console.log("Creating GRN:", { poId: selectedPO, ...formData })
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
            <CardContent className="space-y-6">
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

