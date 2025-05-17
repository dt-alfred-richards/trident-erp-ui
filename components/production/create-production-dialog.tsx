"use client"

import type React from "react"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { AlertCircle, Info, CalendarIcon } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useProductionStore } from "@/hooks/use-production-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useBomStore } from "@/hooks/use-bom-store"
import { useInventoryStore } from "@/hooks/use-inventory-store"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { BomComponentType } from "@/types/bom"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { useRawMaterialsStore } from "@/hooks/use-raw-materials-store"
import { useToast } from "@/components/ui/use-toast"

interface CreateProductionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sku: string
  deficit: number
}

interface BomComponentWithAvailability extends BomComponentType {
  available: number
  isSelected: boolean
  isSufficient: boolean
  type?: string
  category?: string
}

// Material category mapping
const materialCategoryMap: Record<string, string> = {
  Preform: "Pre-Form",
  Caps: "Caps",
  Labels: "Labels",
  Shrink: "Shrink",
}

export function CreateProductionDialog({ open, onOpenChange, sku, deficit }: CreateProductionDialogProps) {
  const [quantity, setQuantity] = useState("")
  const [selectedSku, setSelectedSku] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [date, setDate] = useState<Date | null>(null)
  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [bomComponents, setBomComponents] = useState<BomComponentWithAvailability[]>([])
  const [bomId, setBomId] = useState<string>("")
  const [allComponentsSelected, setAllComponentsSelected] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createProductionOrder } = useProductionStore()
  const { boms } = useBomStore()
  const { rawMaterials } = useInventoryStore()
  const {
    rawMaterials: detailedRawMaterials,
    getRawMaterialByTypeAndCategory,
    deductRawMaterialQuantity,
  } = useRawMaterialsStore()
  const { toast } = useToast()

  // Updated SKU options as requested
  const availableSkus = [
    { value: "2000ml", label: "2000ml" },
    { value: "1000ml", label: "1000ml" },
    { value: "750ml", label: "750ml" },
    { value: "500ml", label: "500ml" },
    { value: "250ml", label: "250ml" },
    { value: "Custom-A", label: "Custom-A" },
  ]

  const existingProduction = selectedSku === "500ml" ? 2000 : selectedSku === "1000ml" ? 1000 : 0
  const teamMembers = ["John D.", "Sarah M.", "Mike T.", "Lisa R.", "David K."]

  // Material-type mapping for default types
  const materialTypeMap: Record<string, string[]> = {
    Preform: ["9.3", "12.5", "19", "32", "26"],
    Caps: ["Red", "White", "Black", "Pink", "Yellow", "Blue", "Orange"],
    Labels: ["500ml Standard", "1L Premium", "2L Economy", "750ml Special", "330ml Mini"],
    Shrink: ["480mm", "530mm"],
  }

  // Update BOM components when SKU or quantity changes
  useEffect(() => {
    if (!selectedSku) {
      setBomComponents([])
      setBomId("")
      return
    }

    // Get BOM for the selected SKU
    const bomForSku = boms.find(
      (bom) =>
        bom.productName.toLowerCase().includes(selectedSku.toLowerCase()) ||
        selectedSku.toLowerCase().includes(bom.productName.toLowerCase()),
    )

    if (!bomForSku) {
      setBomComponents([])
      setBomId("")
      return
    }

    setBomId(bomForSku.id)

    // Calculate required quantities and check availability
    const requiredQuantity = Number(quantity) || 0
    const componentsWithAvailability = bomForSku.components.map((component) => {
      // Get the default type for this material if not specified
      const type = component.type || getDefaultType(component.materialName)

      // Get the category for this material
      const category = getMaterialCategory(component.materialName)

      // Try to get the exact raw material by type and category
      const exactRawMaterial = getRawMaterialByTypeAndCategory(category, type)

      // If found, use its quantity, otherwise fall back to the old method
      let available = 0
      if (exactRawMaterial) {
        available = exactRawMaterial.quantity
      } else {
        // Fallback to the old method
        const material = rawMaterials.find((m) => m.name.toLowerCase() === component.materialName.toLowerCase())
        available = material?.quantity || 0
      }

      const required = component.quantity * requiredQuantity
      const isSufficient = available >= required

      return {
        ...component,
        available,
        isSelected: isSufficient, // Auto-select if sufficient
        isSufficient,
        type,
        category,
      }
    })

    setBomComponents(componentsWithAvailability)
  }, [selectedSku, quantity, boms, rawMaterials, detailedRawMaterials, getRawMaterialByTypeAndCategory])

  // Helper function to get a default type for a material
  const getDefaultType = (materialName: string): string => {
    const material = Object.keys(materialTypeMap).find((key) => key.toLowerCase() === materialName.toLowerCase())

    if (material && materialTypeMap[material].length > 0) {
      return materialTypeMap[material][0]
    }

    return "Standard"
  }

  // Helper function to get the category for a material
  const getMaterialCategory = (materialName: string): string => {
    const material = Object.keys(materialCategoryMap).find((key) =>
      materialName.toLowerCase().includes(key.toLowerCase()),
    )

    if (material) {
      return materialCategoryMap[material]
    }

    // Default fallback
    return materialName
  }

  // Check if all components are selected and sufficient
  useEffect(() => {
    const allSelected =
      bomComponents.length > 0 && bomComponents.every((component) => component.isSelected && component.isSufficient)
    setAllComponentsSelected(allSelected)
  }, [bomComponents])

  const handleComponentToggle = (index: number, checked: boolean) => {
    const updatedComponents = [...bomComponents]
    updatedComponents[index].isSelected = checked
    setBomComponents(updatedComponents)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!selectedSku || !bomId || !allComponentsSelected || !date) {
      setIsSubmitting(false)
      return // Prevent submission without a SKU, date, or if components aren't all selected
    }

    // Deduct materials from inventory
    let allDeductionsSuccessful = true
    const deductionResults = bomComponents
      .filter((component) => component.isSelected)
      .map((component) => {
        const requiredQty = component.quantity * Number(quantity)
        if (component.category && component.type) {
          const success = deductRawMaterialQuantity(component.category, component.type, requiredQty)
          if (!success) {
            allDeductionsSuccessful = false
          }
          return { component, success, requiredQty }
        }
        return { component, success: false, requiredQty }
      })

    if (!allDeductionsSuccessful) {
      // Show error toast
      toast({
        title: "Inventory Update Failed",
        description: "Some materials could not be deducted from inventory. Please check availability.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Create the production order
    createProductionOrder({
      sku: selectedSku,
      quantity: Number.parseInt(quantity),
      deadline: date.toISOString(),
      assignedTo,
      bomId,
    })

    // Show success toast
    toast({
      title: "Production Order Created",
      description: `Successfully created production order for ${quantity} units of ${selectedSku} and updated inventory.`,
      variant: "default",
    })

    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Production Order</DialogTitle>
          <DialogDescription>Create a new production order{sku ? ` for ${sku} SKU` : ""}.</DialogDescription>
        </DialogHeader>

        {existingProduction > 0 && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              {existingProduction.toLocaleString()} bottles of {selectedSku} are already in production.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Order Details Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SKU Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    {sku ? (
                      <Input id="sku" value={sku} readOnly className="bg-muted" />
                    ) : (
                      <Select value={selectedSku} onValueChange={(value) => setSelectedSku(value)}>
                        <SelectTrigger id="sku">
                          <SelectValue placeholder="Select SKU" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSkus.map((skuOption) => (
                            <SelectItem key={skuOption.value} value={skuOption.value}>
                              {skuOption.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                    />
                  </div>

                  {/* Deadline Date Picker */}
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal" id="deadline">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(date) => {
                            setDate(date)
                            setOpenDatePicker(false)
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Assign To */}
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger id="assignedTo">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member} value={member}>
                            {member}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BOM Components Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Bill of Materials</h3>
                {bomComponents.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Use</TableHead>
                          <TableHead>Material</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Required</TableHead>
                          <TableHead className="text-right">Available</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bomComponents.map((component, index) => {
                          const requiredQty = component.quantity * Number(quantity || 0)
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Checkbox
                                  checked={component.isSelected}
                                  onCheckedChange={(checked) => handleComponentToggle(index, checked as boolean)}
                                  disabled={!component.isSufficient}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{component.materialName}</TableCell>
                              <TableCell>{component.type || "Standard"}</TableCell>
                              <TableCell className="text-right">
                                {requiredQty.toLocaleString()} {component.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                {component.available.toLocaleString()} {component.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                {component.isSufficient ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Sufficient
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Insufficient
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : selectedSku ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No BOM Found</AlertTitle>
                    <AlertDescription>No bill of materials found for the selected SKU.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-center p-6 border rounded-md bg-muted">
                    <Info className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Select an SKU to view the bill of materials</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {bomComponents.length > 0 && !allComponentsSelected && (
            <Alert variant="warning" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Materials Check Required</AlertTitle>
              <AlertDescription>
                Please ensure all required materials are selected and sufficient before creating the production order.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="submit"
              disabled={!selectedSku || !allComponentsSelected || !date || !assignedTo || !quantity || isSubmitting}
              className="bg-[#1b84ff] text-white hover:bg-[#0a6edf]"
            >
              {isSubmitting ? "Creating Order..." : "Create Production Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
