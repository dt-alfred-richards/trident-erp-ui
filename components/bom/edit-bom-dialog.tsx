"use client"

import { useState, useEffect } from "react"
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

// Extended component type to include the type field
interface ExtendedBomComponentType extends BomComponentType {
  type?: string
}

interface EditBomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bom: BomType
}

export function EditBomDialog({ open, onOpenChange, bom }: EditBomDialogProps) {
  const { updateBom } = useBomStore()
  const { inventoryItems } = useInventoryStore()

  const [productName, setProductName] = useState(bom.productName)
  const [bomCode, setBomCode] = useState(bom.bomCode)
  const [isActive, setIsActive] = useState(bom.status === "active")
  const [components, setComponents] = useState<ExtendedBomComponentType[]>(() => {
    // Initialize components with type field if not present
    return bom.components.map((comp) => ({
      ...comp,
      type: comp.type || "Standard",
    }))
  })
  const [error, setError] = useState<string | null>(null)

  // Define the fixed material options
  const materialOptions = [
    { name: "Preform", unit: "Pcs", cost: 2.5 },
    { name: "Caps", unit: "Pcs", cost: 0.75 },
    { name: "Labels", unit: "Pcs", cost: 1.25 },
    { name: "Shrink", unit: "Gms", cost: 0.5 },
  ]

  // Define unit options
  const unitOptions = ["Pcs", "Gms"]

  // Define type options based on material
  const typeOptionsMap = {
    Preform: ["9.3", "12.5", "19", "32", "26"],
    Caps: ["Red", "White", "Black", "Pink", "Yellow", "Blue", "Orange"],
    Labels: ["500ml Standard", "1L Premium", "2L Economy", "750ml Special", "330ml Mini"],
    Shrink: ["480mm", "530mm"],
    default: ["Standard", "Premium", "Economy", "Custom"],
  }

  // Get type options based on selected material
  const getTypeOptions = (materialName: string) => {
    return typeOptionsMap[materialName as keyof typeof typeOptionsMap] || typeOptionsMap.default
  }

  // Update form when BOM changes
  useEffect(() => {
    setProductName(bom.productName)
    setBomCode(bom.bomCode)
    setIsActive(bom.status === "active")
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
        materialName: "",
        quantity: 0,
        unit: "Pcs", // Default unit
        cost: 0,
        type: "Standard", // Default type
      },
    ])
  }

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index))
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
    if (!productName.trim()) {
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
      if (!component.materialName || component.quantity <= 0) {
        setError("All components must have a material name and quantity greater than zero")
        return
      }
    }

    // Update BOM - strip out the type field if it's not in the original type
    const updatedComponents = components.map(({ type, ...rest }) => {
      // Include type in the saved data
      return { ...rest, type } as BomComponentType
    })

    updateBom({
      ...bom,
      productName,
      bomCode,
      status: isActive ? "active" : "inactive",
      components: updatedComponents,
      unitCost: calculateTotalCost(),
    })

    setError(null)
    onOpenChange(false)
  }

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
              <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} />
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
                          value={component.materialName}
                          onValueChange={(value) => handleComponentChange(index, "materialName", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialOptions.map((item) => (
                              <SelectItem key={item.name} value={item.name}>
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
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveComponent(index)}>
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
