"use client"

import { useState } from "react"
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
  const [materialId, setMaterialId] = useState("")
  const [materialName, setMaterialName] = useState("")
  const [materialType, setMaterialType] = useState("")
  const [price, setPrice] = useState("")
  const [unit, setUnit] = useState("per unit")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!materialName) {
      newErrors.materialName = "Material name is required"
    }

    if (!materialType) {
      newErrors.materialType = "Material type is required"
    }

    // if (!price) {
    //   newErrors.price = "Price is required"
    // } else if (isNaN(Number.parseFloat(price)) || Number.parseFloat(price) < 0) {
    //   newErrors.price = "Price must be a positive number"
    // } 

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
            <Label htmlFor="material-name">
              Material Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="material-name"
              placeholder="e.g., Copper Wire"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className={errors.materialName ? "border-red-500" : ""}
            />
            {errors.materialName && <p className="text-red-500 text-sm">{errors.materialName}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="material-type">
              Material Type <span className="text-red-500">*</span>
            </Label>
            <Select value={materialType} onValueChange={setMaterialType}>
              <SelectTrigger id="material-type" className={errors.materialType ? "border-red-500" : ""}>
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.materialType && <p className="text-red-500 text-sm">{errors.materialType}</p>}
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
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="unit" className={errors.unit ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unitOption) => (
                    <SelectItem key={unitOption} value={unitOption}>
                      {unitOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
