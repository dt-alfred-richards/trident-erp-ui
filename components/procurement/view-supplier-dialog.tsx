"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash, Save, X, Check } from "lucide-react"
import { AddMaterialDialog } from "./add-material-dialog"
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

// Initial materials data
const initialMaterials = [
  {
    id: "MAT001",
    name: "Steel Sheets",
    type: "Metal",
    price: 450,
    unit: "per ton",
    supplierId: "SUP001",
  },
  {
    id: "MAT002",
    name: "Industrial Adhesive",
    type: "Chemical",
    price: 75,
    unit: "per liter",
    supplierId: "SUP002",
  },
  {
    id: "MAT003",
    name: "PVC Pipes",
    type: "Plastic",
    price: 120,
    unit: "per meter",
    supplierId: "SUP003",
  },
  {
    id: "MAT004",
    name: "Aluminum Rods",
    type: "Metal",
    price: 200,
    unit: "per kg",
    supplierId: "SUP006",
  },
]

// Global materials state (simulating a database)
// Using a variable outside the component to persist between renders

interface ViewSupplierDialogProps {
  supplier: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewSupplierDialog({ supplier, open, onOpenChange }: ViewSupplierDialogProps) {
  const { toast } = useToast()
  const { materials, deleteMaterial, refetch } = useProcurement()
  const globalMaterials = useMemo(() => {
    return materials.map(item => ({
      id: item.materialId,
      name: item.name,
      type: item.type,
      price: item.price,
      unit: item.unit,
      supplierId: item.supplierId,
    }))
  }, [materials])
  const [localMaterials, setLocalMaterials] = useState<any[]>([])
  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false)
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({})
  const [editedUnits, setEditedUnits] = useState<Record<string, string>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isDataSaved, setIsDataSaved] = useState(true)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const isMounted = useRef(true)

  // Debug function to log state
  const debugState = () => {
    console.log("Local Materials:", localMaterials)
    console.log("Global Materials:", globalMaterials)
    console.log("Selected Materials:", selectedMaterials)
    console.log("Edited Prices:", editedPrices)
    console.log("Edited Units:", editedUnits)
    console.log("Has Unsaved Changes:", hasUnsavedChanges)
    console.log("Is Data Saved:", isDataSaved)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Load materials when dialog opens
  useEffect(() => {
    if (open) {
      console.log("Dialog opened, loading materials from global state")
      console.log("Global materials:", globalMaterials)
      setLocalMaterials([...globalMaterials])
      setSelectedMaterials([])
      setEditedPrices({})
      setEditedUnits({})
      setHasUnsavedChanges(false)
      setIsDataSaved(true)
      setShowSaveSuccess(false)
    }
  }, [open, globalMaterials])

  // Get materials for this supplier
  const supplierMaterials = localMaterials.filter((material) => material.supplierId === supplier.id)

  // Get all material IDs for validation
  const allMaterialIds = localMaterials.map((material) => material.id)

  // Handle adding a new material
  const handleAddMaterial = (newMaterial: any) => {
    console.log("Adding new material:", newMaterial)
    setLocalMaterials((prev) => [...prev, newMaterial])
    setIsDataSaved(false)
  }

  // Handle checkbox selection
  const toggleMaterialSelection = (materialId: string) => {
    const isCurrentlySelected = selectedMaterials.includes(materialId)

    // If deselecting and there are unsaved changes, ask for confirmation
    if (isCurrentlySelected) {
      const material = localMaterials.find((m) => m.id === materialId)
      if (material) {
        if (editedPrices[materialId] !== undefined && editedPrices[materialId] !== material.price) {
          const updatedEditedPrices = { ...editedPrices }
          delete updatedEditedPrices[materialId]
          setEditedPrices(updatedEditedPrices)
        }
        if (editedUnits[materialId] !== undefined && editedUnits[materialId] !== material.unit) {
          const updatedEditedUnits = { ...editedUnits }
          delete updatedEditedUnits[materialId]
          setEditedUnits(updatedEditedUnits)
        }
      }
    } else {
      // Initialize the price and unit edit fields with current values if selecting
      const material = localMaterials.find((m) => m.id === materialId)
      if (material) {
        setEditedPrices((prev) => ({
          ...prev,
          [materialId]: material.price,
        }))
        setEditedUnits((prev) => ({
          ...prev,
          [materialId]: material.unit,
        }))
      }
    }

    setSelectedMaterials((prev) =>
      isCurrentlySelected ? prev.filter((id) => id !== materialId) : [...prev, materialId],
    )
  }

  // Handle select all checkbox
  const toggleSelectAll = () => {
    if (selectedMaterials.length === supplierMaterials.length) {
      setSelectedMaterials([])
      setEditedPrices({})
      setEditedUnits({})
    } else {
      const newSelectedMaterials = supplierMaterials.map((material) => material.id)
      setSelectedMaterials(newSelectedMaterials)

      // Initialize all price and unit edit fields
      const newEditedPrices: Record<string, number> = {}
      const newEditedUnits: Record<string, string> = {}
      supplierMaterials.forEach((material) => {
        newEditedPrices[material.id] = material.price
        newEditedUnits[material.id] = material.unit
      })
      setEditedPrices(newEditedPrices)
      setEditedUnits(newEditedUnits)
    }
  }

  // Handle price change
  const handlePriceChange = (materialId: string, value: string) => {
    const numericValue = Number.parseFloat(value)
    if (!isNaN(numericValue) && numericValue >= 0) {
      setEditedPrices((prev) => ({
        ...prev,
        [materialId]: numericValue,
      }))

      // Check if this creates unsaved changes
      const material = localMaterials.find((m) => m.id === materialId)
      if (material && numericValue !== material.price) {
        setHasUnsavedChanges(true)
      } else {
        // Check if there are any other unsaved changes
        checkForUnsavedChanges()
      }
    }
  }

  // Handle unit change
  const handleUnitChange = (materialId: string, value: string) => {
    setEditedUnits((prev) => ({
      ...prev,
      [materialId]: value,
    }))

    // Check if this creates unsaved changes
    const material = localMaterials.find((m) => m.id === materialId)
    if (material && value !== material.unit) {
      setHasUnsavedChanges(true)
    } else {
      // Check if there are any other unsaved changes
      checkForUnsavedChanges()
    }
  }

  // Check if there are any unsaved changes
  const checkForUnsavedChanges = () => {
    const hasChanges = selectedMaterials.some((id) => {
      const material = localMaterials.find((m) => m.id === id)
      return (
        material &&
        ((editedPrices[id] !== undefined && editedPrices[id] !== material.price) ||
          (editedUnits[id] !== undefined && editedUnits[id] !== material.unit))
      )
    })
    setHasUnsavedChanges(hasChanges)
  }

  // Save price and unit changes
  const saveChanges = () => {
    const updatedMaterials = localMaterials.map((material) => {
      if (selectedMaterials.includes(material.id)) {
        return {
          ...material,
          price: editedPrices[material.id] !== undefined ? editedPrices[material.id] : material.price,
          unit: editedUnits[material.id] !== undefined ? editedUnits[material.id] : material.unit,
        }
      }
      return material
    })

    setLocalMaterials(updatedMaterials)
    setHasUnsavedChanges(false)
    setIsDataSaved(false)

    toast({
      title: "Changes updated",
      description: "Price and unit changes have been successfully updated. Don't forget to save all changes.",
    })
  }

  // Discard changes
  const discardChanges = () => {
    // Reset edited prices and units to current values
    const currentPrices: Record<string, number> = {}
    const currentUnits: Record<string, string> = {}
    selectedMaterials.forEach((id) => {
      const material = localMaterials.find((m) => m.id === id)
      if (material) {
        currentPrices[id] = material.price
        currentUnits[id] = material.unit
      }
    })

    setEditedPrices(currentPrices)
    setEditedUnits(currentUnits)
    setHasUnsavedChanges(false)
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedMaterials.length === 0) return

    Promise.allSettled(
      selectedMaterials.map(materialId =>
        deleteMaterial(materialId)
      )
    ).then(() => {
      refetch()
      setIsDataSaved(false)
      toast({
        title: "Materials deleted",
        description: `${selectedMaterials.length} material(s) have been removed. Don't forget to save all changes.`,
      })

      setSelectedMaterials([])
      setEditedPrices({})
      setEditedUnits({})
      setHasUnsavedChanges(false)

    })
  }

  // Check if there are any unsaved changes (either edits or added/deleted materials)
  const hasAnyUnsavedChanges = hasUnsavedChanges || !isDataSaved

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          // Prevent closing if there are unsaved changes
          if (!newOpen && hasAnyUnsavedChanges) {
            const confirm = window.confirm("You have unsaved changes. Are you sure you want to close?")
            if (!confirm) return
          }
          onOpenChange(newOpen)
        }}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
            <DialogDescription>View detailed information about this supplier and their materials.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Supplier Information */}
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Supplier Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier ID</p>
                  <p className="font-medium">{supplier.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier Name</p>
                  <p className="font-medium">{supplier.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{supplier.contactPerson || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{supplier.email || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{supplier.phone || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{supplier.address || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Materials Table */}
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Material Supplies</h3>
                <div className="flex gap-2">
                  {hasUnsavedChanges && (
                    <>
                      <Button variant="outline" size="sm" onClick={discardChanges}>
                        <X className="h-4 w-4 mr-2" />
                        Discard
                      </Button>
                      <Button variant="default" size="sm" onClick={saveChanges}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  )}
                  {selectedMaterials.length > 0 && !hasUnsavedChanges && (
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  )}
                  <Button size="sm" onClick={() => setIsAddMaterialDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            supplierMaterials.length > 0 && selectedMaterials.length === supplierMaterials.length
                          }
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all materials"
                        />
                      </TableHead>
                      <TableHead>Material ID</TableHead>
                      <TableHead>Material Name</TableHead>
                      <TableHead>Material Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierMaterials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No materials found for this supplier.
                        </TableCell>
                      </TableRow>
                    ) : (
                      supplierMaterials.map((material) => (
                        <TableRow
                          key={material.id}
                          className={selectedMaterials.includes(material.id) ? "bg-muted/50" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedMaterials.includes(material.id)}
                              onCheckedChange={() => toggleMaterialSelection(material.id)}
                              aria-label={`Select ${material.name}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{material.id}</TableCell>
                          <TableCell>{material.name}</TableCell>
                          <TableCell>{material.type}</TableCell>
                          <TableCell>
                            {selectedMaterials.includes(material.id) ? (
                              <div className="flex items-center">
                                <span className="mr-1">₹</span>
                                <Input
                                  type="number"
                                  value={editedPrices[material.id] || ""}
                                  onChange={(e) => handlePriceChange(material.id, e.target.value)}
                                  className="w-24 h-8"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            ) : (
                              <>₹{material.price.toLocaleString()}</>
                            )}
                          </TableCell>
                          <TableCell>
                            {selectedMaterials.includes(material.id) ? (
                              <Select
                                value={editedUnits[material.id] || material.unit}
                                onValueChange={(value) => handleUnitChange(material.id, value)}
                              >
                                <SelectTrigger className="w-[130px] h-8">
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
                            ) : (
                              <>{material.unit}</>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {selectedMaterials.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedMaterials.length} item(s) selected. Price and unit columns are now editable.
                </p>
              )}
              {!isDataSaved && (
                <p className="text-sm text-amber-500">
                  You have unsaved changes. Click "Save Changes" to persist your modifications.
                </p>
              )}
              {showSaveSuccess && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded-md">
                  <Check className="h-4 w-4 mr-2" />
                  Changes saved successfully!
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-end gap-2">
            <Button
              onClick={() => {
                if (hasAnyUnsavedChanges) {
                  const confirm = window.confirm("You have unsaved changes. Are you sure you want to close?")
                  if (!confirm) return
                }
                onOpenChange(false)
              }}
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddMaterialDialog
        open={isAddMaterialDialogOpen}
        onOpenChange={setIsAddMaterialDialogOpen}
        onAdd={handleAddMaterial}
        existingIds={allMaterialIds}
        supplierId={supplier.id}
      />
    </>
  )
}
