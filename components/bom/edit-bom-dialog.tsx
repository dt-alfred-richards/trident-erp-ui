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
  const [components, setComponents] = useState<BomComponentType[]>(bom.components)
  const [error, setError] = useState<string | null>(null)

  // Update form when BOM changes
  useEffect(() => {
    setProductName(bom.productName)
    setBomCode(bom.bomCode)
    setIsActive(bom.status === "active")
    setComponents(bom.components)
  }, [bom])

  const handleAddComponent = () => {
    setComponents([
      ...components,
      {
        materialName: "",
        quantity: 0,
        unit: "",
        cost: 0,
      },
    ])
  }

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index))
  }

  const handleComponentChange = (index: number, field: keyof BomComponentType, value: string | number) => {
    const updatedComponents = [...components]

    if (field === "materialName") {
      const selectedItem = inventoryItems.find((item) => item.name === value)
      updatedComponents[index] = {
        ...updatedComponents[index],
        [field]: value as string,
        unit: selectedItem?.unit || "",
        cost: selectedItem?.cost || 0,
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

    // Update BOM
    updateBom({
      ...bom,
      productName,
      bomCode,
      status: isActive ? "active" : "inactive",
      components,
      unitCost: calculateTotalCost(),
    })

    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
            <Switch id="active-status" checked={isActive} onCheckedChange={setIsActive} />
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
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Cost</TableHead>
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
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.name}>
                                {item.name}
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
                        <Input value={component.unit} readOnly />
                      </TableCell>
                      <TableCell>
                        <Input value={`₹${component.cost.toFixed(2)}`} readOnly />
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

