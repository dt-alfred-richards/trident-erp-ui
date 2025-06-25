"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRawMaterialsStore } from "@/hooks/use-raw-materials-store"
import { Inventory, useInventory } from "@/app/inventory-context"

interface AddRawMaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
}

export function AddRawMaterialDialog({ open, onOpenChange }: AddRawMaterialDialogProps) {
  const [name, setName] = useState("")
  const [quantity, setQuantity] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { inventory, addInventory } = useInventory()
  const [category, setCategory] = useState<string | undefined>(undefined)


  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName("")
      setQuantity(0)
      setError(null)
    }
  }, [open])

  const categories = ["Labels", "Pre-Form", "Shrink", "Caps and Handles", "Consumables"]

  // Get the unit for the selected category
  const getCategoryUnit = (category: string) => {
    switch (category?.toLowerCase()) {
      case "Labels":
        return "KGs"
      case "Pre-Form":
        return "KGs"
      case "Shrink":
        return "KGs"
      case "Caps and Handles":
        return "Pieces"
      case "Consumables":
        return "Pcs"
      default:
        return ""
    }
  }

  const handleSubmit = () => {
    if (!category || !addInventory) return;
    const payload = {
      category,
      material: name,
      quantity,
      unit: `per ${getCategoryUnit(category).toLowerCase()}`,
    } as Partial<Inventory>

    addInventory(payload).then(() => {
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Category
            </Label>
            <select id="type" value={category || ""} name="language" onChange={(value) => setCategory(value.target.value)} className="w-full p-2 border rounded-md col-span-3" >
              {
                categories?.map(item => {
                  return (<option value={item} key={`${item}`}>{item}</option>)
                })
              }
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Enter material name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="flex-1"
                min={0}
              />
              <span className="text-sm text-muted-foreground w-16">{getCategoryUnit(category)}</span>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
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
