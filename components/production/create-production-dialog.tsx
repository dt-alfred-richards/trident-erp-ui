"use client"

import type React from "react"
import { format } from "date-fns"
import { useState, useEffect, useMemo, useCallback } from "react"
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
import { useOrders } from "@/contexts/order-context"
import { BomAndComponent, MaterialOptions, useBomContext } from "../bom/bom-context"
import { useProduction } from "./production-context"
import { getChildObject } from "../generic"

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
  category?: string,
  bomId: string
}

// Material category mapping
const materialCategoryMap: Record<string, string> = {
  Preform: "Pre-Form",
  Caps: "Caps",
  Labels: "Labels",
  Shrink: "Shrink",
}

export function CreateProductionDialog({ open, onOpenChange, sku }: CreateProductionDialogProps) {
  const { clientProposedProductMapper } = useOrders()
  const { createProductionOrder, refetch, updateProductionOrder } = useProduction()
  const { bom = [], materialOptions = [] } = useBomContext()
  const [quantity, setQuantity] = useState("")
  const [selectedSku, setSelectedSku] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [date, setDate] = useState<Date | null>(null)
  const [openDatePicker, setOpenDatePicker] = useState(false)
  const [bomComponents, setBomComponents] = useState<BomComponentWithAvailability[]>([])
  const [bomId, setBomId] = useState<string>("")
  const [allComponentsSelected, setAllComponentsSelected] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const materialMapper = useMemo(() => {
    return materialOptions.reduce((acc: Record<string, MaterialOptions>, curr) => {
      if (!acc[curr.materialId]) {
        acc[curr.materialId] = curr
      }
      return acc;
    }, {})
  }, [materialOptions])

  const productNameMapper = useMemo(() => {
    return Object.values(clientProposedProductMapper).flat().reduce((acc: Record<string, string>, curr) => {
      if (!acc[curr.productId || ""]) acc[curr.productId || ""] = curr.sku;
      return acc;
    }, {})
  }, [clientProposedProductMapper])

  const createBom = useCallback((bomItem: BomAndComponent, bomId: string) => {
    return bomItem.components.flatMap(item => ({
      available: item.quantity,
      cost: item.cost,
      isSelected: false,
      isSufficient: false,
      materialId: item.materialId,
      materialName: materialMapper[item.materialId]?.name || "",
      quantity: item.quantity,
      category: materialMapper[item.materialId]?.category || '',
      unit: materialMapper[item.materialId]?.unit,
      bomId
    } as BomComponentWithAvailability))
  }, [quantity])

  useEffect(() => {
    const _bomComponents = bom.filter(item => item.productId === selectedSku).flatMap(item => [...createBom(item, item.bomId)])
    setBomComponents(_bomComponents)
    if (sku) {
      setSelectedSku(sku)
    }
  }, [selectedSku, bom, quantity, sku])

  const { toast } = useToast()

  // Updated SKU options as requested
  const availableSkus = useMemo(() => {
    return Object.values(clientProposedProductMapper).flat().map(item => ({ value: item.productId, label: item.name }))
  }, [clientProposedProductMapper])

  const existingProduction = selectedSku === "500ml" ? 2000 : selectedSku === "1000ml" ? 1000 : 0
  const teamMembers = ["John D.", "Sarah M.", "Mike T.", "Lisa R.", "David K."]

  // Material-type mapping for default types
  const materialTypeMap: Record<string, string[]> = {
    Preform: ["9.3", "12.5", "19", "32", "26"],
    Caps: ["Red", "White", "Black", "Pink", "Yellow", "Blue", "Orange"],
    Labels: ["500ml Standard", "1L Premium", "2L Economy", "750ml Special", "330ml Mini"],
    Shrink: ["480mm", "530mm"],
  }

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

  const onUpdateProductionOrder = () => {
    if (!updateProductionOrder || !date || !refetch) return;
    updateProductionOrder(sku, { quantity: parseInt(quantity), deadline: date }).then(() => {
      setDate(null)
      setQuantity("")
      refetch()
      onOpenChange(false)
      setSelectedSku("")
      setIsSubmitting(false)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!createProductionOrder || !date || !refetch || !updateProductionOrder) return

    Promise.allSettled(
      bomComponents.map(item => createProductionOrder({
        bomId: item.bomId,
        deadline: date,
        productId: selectedSku || sku,
        inProduction: parseInt(quantity),
        quantity: parseInt(quantity)
      }))
    ).then(() => {
      refetch()
      onOpenChange(false)
      setSelectedSku("")
      setIsSubmitting(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{`Create Production Order`}</DialogTitle>
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
                      <Input id="sku" value={productNameMapper[sku]} readOnly className="bg-muted" />
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
                                // disabled={!component.isSufficient}
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
              disabled={!selectedSku || !date || !quantity || bomComponents.length <= 0 || bomComponents.length !== bomComponents.filter(item => item.isSelected).length}
              className="bg-[#1b84ff] text-white hover:bg-[#0a6edf]"
            >
              {isSubmitting ? `${sku ? "Editing" : "Creating"} Order...` : `Create Production Order`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}
