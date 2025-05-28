"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react"
import { useBomStore } from "@/hooks/use-bom-store"
import { useInventoryStore } from "@/hooks/use-inventory-store"
import type { BomType, BomComponentType } from "@/types/bom"
import { Bom, BomAndComponent, BomComponent, useBomContext } from "./bom-context"
import { useOrders } from "@/contexts/order-context"
import { removebasicTypes } from "../generic"

// Extended component type to include the type field
interface ExtendedBomComponentType extends BomComponentType {
  type?: string
}

interface EditBomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bom: BomAndComponent
}

export function EditBomDialog({ open, onOpenChange, bom }: EditBomDialogProps) {
  const { editBom, editBomComponent, addBomComponent, deleteBomComponent, materialOptions = [], unitOptions = [], typeOptionsMap = {}, refetch = () => { } } = useBomContext()
  const { clientProposedProductMapper } = useOrders()
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(bom.productId)
  const [productId, setProductId] = useState(bom.productId || "")
  const [bomCode, setBomCode] = useState(bom.bomId)
  const [isActive, setIsActive] = useState(bom.status)
  const [deletedMaterialIds, setDeletedMaterialIds] = useState<string[]>([])
  const [components, setComponents] = useState<ExtendedBomComponentType[]>(() => {
    // Initialize components with type field if not present
    return bom.components.map((comp) => ({
      ...comp,
      type: comp.type || "Standard",
    }))
  })
  const [error, setError] = useState<string | null>(null)


  const existingComponentIds = useMemo(() => {
    return bom.components.map(item => item.materialId)
  }, [bom])

  // Get type options based on selected material
  const getTypeOptions = (materialName: string) => {
    return typeOptionsMap[materialName as keyof typeof typeOptionsMap] || typeOptionsMap.default
  }

  // Update form when BOM changes
  useEffect(() => {
    setProductId(bom.productId || "")
    setBomCode(bom.bomId)
    setIsActive(bom.status)
    // Initialize components with type field if not present
    setComponents(
      bom.components.map((comp) => ({
        ...comp,
        type: comp.type || "Standard",
      })),
    )
  }, [bom])

  const handleAddComponent = () => {
    setComponents([
      ...components,
      {
        materialId: "",
        materialName: "",
        quantity: 0,
        unit: "Pcs", // Default unit
        cost: 0,
        type: "Standard", // Default type
      },
    ])
  }

  const handleRemoveComponent = (materialId: string) => {
    setDeletedMaterialIds(p => {
      p.concat(materialId)
      return p;
    })
    setComponents(components.filter((i) => i.materialId !== materialId))
  }

  const handleComponentChange = (index: number, field: keyof ExtendedBomComponentType, value: string | number) => {
    const updatedComponents = [...components]

    if (field === "materialName") {
      const selectedItem = materialOptions.find((item) => item.name === value)
      const typeOptions = getTypeOptions(value as string)
      const defaultType = typeOptions[0] || "Standard"

      updatedComponents[index] = {
        ...updatedComponents[index],
        [field]: value as string,
        unit: selectedItem?.unit || "Pcs", // Default to Pcs if not found
        cost: selectedItem?.cost || 0,
        type: defaultType, // Set default type based on selected material
      }
    } else if (field === "cost") {
      // Handle cost changes - ensure it's a valid number
      let costValue = value

      // If it's a string (from input), parse it
      if (typeof costValue === "string") {
        // Remove currency symbol if present
        costValue = costValue.replace("₹", "").trim()
        // Parse as float
        const parsedValue = Number.parseFloat(costValue as string)
        costValue = isNaN(parsedValue) ? 0 : parsedValue
      }

      updatedComponents[index] = {
        ...updatedComponents[index],
        [field]: costValue as number,
      }
    } else {
      updatedComponents[index] = {
        ...updatedComponents[index],
        [field]: value,
      }
    }

    setComponents(updatedComponents)
  }

  const calculateTotalCost = () => {
    return components.reduce((total, component) => {
      return total + component.cost * component.quantity
    }, 0)
  }

  const handleSubmit = () => {
    // Validation
    if (!productId.trim()) {
      setError("Product name is required")
      return
    }

    if (!bomCode.trim()) {
      setError("BOM code is required")
      return
    }

    if (components.length === 0) {
      setError("At least one component is required")
      return
    }

    for (const component of components) {
      if (!component.materialId || component.quantity <= 0) {
        setError("All components must have a material name and quantity greater than zero")
        return
      }
    }

    const bomPayload: Partial<Bom> = {
      productId,
      status: isActive
    }, existingBomComponents = components.filter(item => existingComponentIds.includes(item.materialId)).map(item => ({
      bomCompId: item.bomCompId,
      cost: item.cost,
      materialId: item.materialId,
      quantity: item.quantity,
      type: item.type,
      unit: item.unit
    } as Partial<BomComponent>)), newBomComponents = components.filter(item => existingComponentIds.includes(item.materialId)).map(item => ({
      cost: item.cost,
      materialId: item.materialId,
      quantity: item.quantity,
      type: item.type,
      unit: item.unit
    })), deletedBomComponents = components.filter(item => deletedMaterialIds.includes(item.materialId) && item.bomCompId).map(item => item.bomCompId)
    if (!editBom || !editBomComponent || !addBomComponent || !deleteBomComponent) return;

    Promise.allSettled([
      editBom(bom.bomId, bomPayload),
      ...existingBomComponents.map(item => editBomComponent(item.bomCompId || "", removebasicTypes(item, ["bomCompId"]))),
      ...newBomComponents.map(item => addBomComponent(bom.bomId, removebasicTypes(item, ["id", "bomCompId"]))),
      ...deletedBomComponents.map(item => deleteBomComponent(item || ""))]).then(() => {
        setError(null)
        onOpenChange(false)
        refetch()
      })
  }

  const selectedProductOption: any = useMemo(() => {
    return Object.values(clientProposedProductMapper).flat().find(item => item.productId === selectedProduct)?.productId || ""
  }, [clientProposedProductMapper, selectedProduct])


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit BOM</DialogTitle>
          <DialogDescription>Update the Bill of Materials for {bom.productName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Select
                value={selectedProductOption}
                onValueChange={(value) => {
                  setSelectedProduct(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(clientProposedProductMapper).flat().map((item) => (
                    <SelectItem key={item.id} value={item.productId || ""}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bom-code">BOM Code</Label>
              <Input id="bom-code" value={bomCode} onChange={(e) => setBomCode(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active-status"
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-[#2cd07e] data-[state=checked]:border-[#2cd07e]"
            />
            <Label htmlFor="active-status">Active</Label>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-medium">Components</h4>
              <Button type="button" variant="outline" size="sm" onClick={handleAddComponent}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Component
              </Button>
            </div>

            {components.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Cost (₹)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map((component, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={component.materialId}
                          onValueChange={(value) => handleComponentChange(index, "materialId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialOptions.map((item) => (
                              <SelectItem key={item.name} value={item.materialId}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={component.type || "Standard"}
                          onValueChange={(value) => handleComponentChange(index, "type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {getTypeOptions(component.materialName).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={component.quantity || ""}
                          onChange={(e) => handleComponentChange(index, "quantity", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={component.unit}
                          onValueChange={(value) => handleComponentChange(index, "unit", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {unitOptions.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={component.cost}
                          onChange={(e) => handleComponentChange(index, "cost", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveComponent(component.materialId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground border rounded-md">
                No components added yet. Click "Add Component" to start.
              </div>
            )}

            {components.length > 0 && (
              <div className="flex justify-end">
                <div className="bg-muted p-3 rounded-md">
                  <span className="font-medium">Total Cost: </span>
                  <span className="font-bold">₹{calculateTotalCost().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
