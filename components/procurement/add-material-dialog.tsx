"use client"

import { useMemo, useState } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { useProcurement } from "@/app/procurement/procurement-context"
import { Inventory, useInventory } from "@/app/inventory-context"

// List of available units
const unitOptions = [
  "per kg",
  "per ton",
  "per gram",
  "per liter",
  "per ml",
  "per meter",
  "per cm",
  "per unit",
  "per dozen",
  "per box",
  "per pack",
  "per sheet",
  "per roll",
  "per sq.ft",
  "per sq.m",
]

// Material types
const materialTypes = [
  "Metal",
  "Plastic",
  "Chemical",
  "Fabric",
  "Paper",
  "Wood",
  "Glass",
  "Ceramic",
  "Composite",
  "Electronic",
  "Other",
]

interface AddMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (material: any) => void
  existingIds: string[]
  supplierId: string
}

export function AddMaterialDialog({ open, onOpenChange, onAdd, existingIds, supplierId }: AddMaterialDialogProps) {
  const { toast } = useToast()
  const { addMaterial } = useProcurement()
  const { inventory } = useInventory();
  const [materialId, setMaterialId] = useState("")
  const [materialName, setMaterialName] = useState(undefined)
  const [materialType, setMaterialType] = useState(undefined)
  const [price, setPrice] = useState("")
  const [unit, setUnit] = useState("per unit")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = useMemo(() => {
    const distinctCats: Set<string> = new Set();

    inventory?.forEach(item => {
      distinctCats.add(item.category)
    })
    return Array.from(distinctCats)
  }, [inventory])

  const materials = useMemo(() => {
    return inventory?.filter(item => item.category === materialType)
  }, [inventory, materialType])

  const selected = useMemo(() => {
    return inventory?.find(item => item.category === materialType && item.material === item.material)
  }, [materialName, materialType])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!materialName) {
      newErrors.materialName = "Material name is required"
    }

    if (!materialType) {
      newErrors.materialType = "Material type is required"
    }

    if (!unit) {
      newErrors.unit = "Unit is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const newMaterial = {
        name: materialName,
        type: materialType,
        price: Number.parseFloat(price),
        unit: unit,
        supplierId: supplierId,
        inventoryId: selected?.inventoryId
      }


      addMaterial(newMaterial)
        .then(() => {
          toast({
            title: "Material added",
            description: `${materialName} has been added to the supplier's materials.`,
          })

          // Reset form
          setMaterialId("")
          setMaterialName("")
          setMaterialType("")
          setPrice("")
          setUnit("per unit")
          setErrors({})

          onOpenChange(false)
        })

    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>Add a new material for this supplier. Fill in all the required fields.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">

          <div className="grid gap-2">
            <Label htmlFor="material-type">
              Material Type <span className="text-red-500">*</span>
            </Label>
            <Select value={materialType} onValueChange={setMaterialType}>
              <SelectTrigger id="material-type" className={errors.materialType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.materialType && <p className="text-red-500 text-sm">{errors.materialType}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="material-type">
              Material  <span className="text-red-500">*</span>
            </Label>
            <Select value={materialName} onValueChange={setMaterialName}>
              <SelectTrigger id="materialName" className={errors.materialName ? "border-red-500" : ""}>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {materials?.map((type: Inventory) => (
                  <SelectItem key={type.inventoryId} value={type.material}>
                    {type.material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          <div className="grid grid-cols-2 gap-4">
            {/* <div className="grid gap-2">
              <Label htmlFor="price">
                Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="e.g., 100"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div> */}

            <div className="grid gap-2">
              <Label htmlFor="unit">
                Unit <span className="text-red-500">*</span>
              </Label>
              <Input value={selected?.unit} placeholder="Unit" disabled />
              {errors.unit && <p className="text-red-500 text-sm">{errors.unit}</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Material</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
