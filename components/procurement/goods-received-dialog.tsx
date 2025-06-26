"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Material, PurchaseOrderMaterial, useProcurement } from "@/app/procurement/procurement-context"
import { getChildObject } from "../generic"

interface POItem {
  id: string
  material: string
  quantity: number
  unit: string
  supplier: string
  receivedQuantity: string
  selected: boolean
}

interface GoodsReceivedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poNumber: string
  onGoodsReceived?: (poId: string, isFullDelivery: boolean) => void
}

export function GoodsReceivedDialog({ open, onOpenChange, poNumber, onGoodsReceived }: GoodsReceivedDialogProps) {
  // Mock data for PO items - in a real app, this would be fetched based on the PO number
  const { purchaseOrderMaterials, materials, editPurchaseOrder, purchaseOrders } = useProcurement();

  const materialMapper = useMemo(() => {
    return materials.reduce((acc: Record<string, Material>, curr) => {
      if (!acc[curr.materialId]) acc[curr.materialId] = curr
      return acc;
    }, {})
  }, [materials])

  const [poItems, setPoItems] = useState<any[]>([])

  useEffect(() => {
    setPoItems(
      purchaseOrderMaterials.filter(item => item.purchaseOrderId === poNumber).map(item => ({
        id: item.purchaseItemId,
        material: materialMapper[item.materialId]?.name || "",
        quantity: item.quantity,
        unit: item.unit,
        supplier: materialMapper[item.materialId]?.supplierId || "",
        receivedQuantity: item?.receivedQuantity || 0,
        selected: false,
      }))
    )
  }, [purchaseOrderMaterials])

  const [formData, setFormData] = useState({
    notes: "",
    useSubstitution: false,
    substitutionItems: [
      {
        id: "1",
        category: "",
        material: "",
        quantity: "",
        unit: "kg",
      },
    ],
  })

  useEffect(() => {
    const order = purchaseOrders.find(item => item.purchaseId === poNumber);

    setFormData({
      ...formData,
      notes: order?.notes || ""
    })
  }, [poNumber])

  // Add state for confirmation dialog
  const [confirmReceiveAll, setConfirmReceiveAll] = useState(false)
  const [confirmGrnDialog, setConfirmGrnDialog] = useState(false)

  const handleItemSelection = (itemId: string, checked: boolean) => {
    setPoItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
            ...item,
            selected: checked,
            // Clear received quantity when deselected
            receivedQuantity: checked ? item.receivedQuantity : "",
          }
          : item,
      ),
    )
  }

  const handleReceivedQuantityChange = (itemId: string, value: string) => {
    setPoItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId && item.selected ? { ...item, receivedQuantity: value } : item)),
    )
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Add function to handle "Receive All" button click
  const handleReceiveAll = () => {
    // Select all items and set received quantity to ordered quantity
    setPoItems(p => p.map(i => ({ ...i, selected: true, receivedQuantity: i.quantity })))
  }

  // const rawMaterialCategories = useMemo(() => {
  //   return materials.map(item => ({ value: item.materialId, label: item.name }))
  // }, [materials])

  const rawMaterialCategories = [
    "Plastic Resins",
    "Metal Components",
    "Adhesives",
    "Labels",
    "Packaging Materials",
    "Colorants",
    "Chemicals",
    "Fasteners",
  ]

  // Add a function to get materials by category
  const getMaterialsByCategory = (category: string) => {
    // This would come from your API in a real application
    const materialsByCategory: Record<string, string[]> = {
      "Plastic Resins": ["PET Resin", "HDPE Resin", "PVC Resin", "LDPE Resin"],
      "Metal Components": ["Aluminum Sheets", "Steel Rods", "Copper Wire", "Zinc Plates"],
      Adhesives: ["Label Adhesive", "Packaging Glue", "Industrial Epoxy", "Hot Melt Adhesive"],
      Labels: ["Paper Labels", "Plastic Labels", "Metallic Labels", "Fabric Labels"],
      "Packaging Materials": ["Cardboard Boxes", "Plastic Wraps", "Bubble Wrap", "Foam Inserts"],
      Colorants: ["Red Dye", "Blue Pigment", "Yellow Colorant", "Black Tint"],
      Chemicals: ["Cleaning Solution", "Preservatives", "Stabilizers", "Catalysts"],
      Fasteners: ["Screws", "Bolts", "Rivets", "Clips"],
    }

    return materialsByCategory[category] || []
  }

  const handleSubstitutionChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      useSubstitution: checked,
      // Reset substitution values when unchecked
      ...(checked
        ? {}
        : {
          substitutionItems: [
            {
              id: "1",
              category: "",
              material: "",
              quantity: "",
              unit: "kg",
            },
          ],
        }),
    }))
  }

  // Update the isValidSubstitutionQuantity function to check for material too
  const isValidSubstitutionQuantity = () => {
    if (!formData.useSubstitution) return true

    // Check if all items have valid data
    return formData.substitutionItems.every((item) => {
      if (!item.category || !item.material) return false
      const quantity = Number(item.quantity)
      return !isNaN(quantity) && quantity > 0
    })
  }

  // Check if any items have partial delivery
  const hasPartialDelivery = () => {
    return poItems.some((item) => {
      if (!item.selected) return false
      const receivedQty = Number(item.receivedQuantity)
      return receivedQty > 0 && receivedQty < item.quantity
    })
  }

  // Update the handleSubmit function to include the material in the submission
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()

    // Check if at least one item has been selected
    const hasSelectedItems = poItems.some((item) => item.selected)

    if (!hasSelectedItems) {
      alert("Please select at least one item to receive")
      return
    }

    // Check if all selected items have a received quantity
    const allSelectedItemsHaveQuantity = poItems
      .filter((item) => item.selected)
      .every((item) => {
        const qty = Number(item.receivedQuantity)
        return !isNaN(qty) && qty > 0
      })

    if (!allSelectedItemsHaveQuantity) {
      alert("Please enter received quantity for all selected items")
      return
    }

    // Validate substitution data if enabled
    if (formData.useSubstitution && !isValidSubstitutionQuantity()) {
      alert("Please enter a valid substitution quantity")
      return
    }

    // Show confirmation dialog instead of immediately submitting
    setConfirmGrnDialog(true)
  }

  const totalQuantity = useMemo(() => {
    return poItems.reduce((acc, curr) => {
      acc += curr.quantity
      return acc;
    }, 0)
  }, [poItems])
  const receivedQuantity = useMemo(() => {
    return poItems.reduce((acc, curr) => {
      acc += curr.receivedQuantity
      return acc;
    }, 0)
  }, [poItems])


  const getStatus = useCallback(() => {
    if (receivedQuantity !== totalQuantity) {
      return "partial"
    } else if (receivedQuantity === totalQuantity) {
      return "completed"
    } else {
      return ""
    }
  }, [receivedQuantity, totalQuantity])
  const confirmCreateGrn = () => {
    if (!editPurchaseOrder) return

    editPurchaseOrder({ grnCreated: true, purchaseId: poNumber, notes: formData.notes, status: getStatus() },
      poItems.filter(item => item.selected).map(item => ({ purchaseItemId: item.id, receivedQuantity: item.receivedQuantity } as Partial<PurchaseOrderMaterial>))
    ).then(() => {
      // Close the confirmation dialog
      setConfirmGrnDialog(false)

      // Close the main dialog
      onOpenChange(false)
    })
  }

  const noItemsSelected = useMemo(() => {
    return poItems.filter(item => item.selected).length === 0
  }, [poItems])

  // Check if all items are fully received
  const isFullyReceived = () => {
    return poItems.every((item) => item.selected && Number(item.receivedQuantity) === item.quantity)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Receive Goods for PO {poNumber}</DialogTitle>
          <DialogDescription>Record receipt of goods for this purchase order</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 h-full px-6 py-2 overflow-auto">
          <form id="grn-form" onSubmit={handleSubmit} className="space-y-4 pb-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-muted-foreground">Select items and enter received quantities</div>
                <Button
                  type="button"
                  onClick={() => setConfirmReceiveAll(true)}
                  className="text-sm bg-[#43ced7] hover:bg-[#36b0b8] text-white"
                >
                  Receive All
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Ordered Quantity</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Received Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>{item.material}</TableCell>
                        <TableCell>
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              value={item.receivedQuantity}
                              onChange={(e) => handleReceivedQuantityChange(item.id, e.target.value)}
                              min="0"
                              max={item.quantity}
                              placeholder="0"
                              className="w-24"
                              disabled={!item.selected}
                            />
                            <span className="text-sm text-muted-foreground">{item.unit}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {hasPartialDelivery() && (
                <Alert variant="warning" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Partial Delivery</AlertTitle>
                  <AlertDescription>You're recording a partial delivery for one or more items</AlertDescription>
                </Alert>
              )}
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

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-substitution"
                  checked={formData.useSubstitution}
                  onCheckedChange={handleSubstitutionChange}
                />
                <Label htmlFor="use-substitution">Use Material Substitution</Label>
              </div>

              {formData.useSubstitution && (
                <div className="space-y-4 p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Material Substitutions</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          substitutionItems: [
                            ...prev.substitutionItems,
                            {
                              id: Date.now().toString(),
                              category: "",
                              material: "",
                              quantity: "",
                              unit: "kg",
                            },
                          ],
                        }))
                      }}
                    >
                      Add More
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-2">
                    <div className="text-sm font-medium text-muted-foreground">Category</div>
                    <div className="text-sm font-medium text-muted-foreground">Material</div>
                    <div className="text-sm font-medium text-muted-foreground">Quantity</div>
                    <div className="text-sm font-medium text-muted-foreground">Unit</div>
                  </div>

                  {formData.substitutionItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-4 gap-4 items-start">
                      <div>
                        <Select
                          value={item.category}
                          onValueChange={(value) => {
                            const newItems = [...formData.substitutionItems]
                            newItems[index] = {
                              ...newItems[index],
                              category: value,
                              material: "", // Reset material when category changes
                            }
                            setFormData((prev) => ({
                              ...prev,
                              substitutionItems: newItems,
                            }))
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {rawMaterialCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Select
                          value={item.material}
                          onValueChange={(value) => {
                            const newItems = [...formData.substitutionItems]
                            newItems[index] = {
                              ...newItems[index],
                              material: value,
                            }
                            setFormData((prev) => ({
                              ...prev,
                              substitutionItems: newItems,
                            }))
                          }}
                          disabled={!item.category}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {getMaterialsByCategory(item.category).map((material) => (
                              <SelectItem key={material} value={material}>
                                {material}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...formData.substitutionItems]
                            newItems[index] = {
                              ...newItems[index],
                              quantity: e.target.value,
                            }
                            setFormData((prev) => ({
                              ...prev,
                              substitutionItems: newItems,
                            }))
                          }}
                          min="0.1"
                          step="0.1"
                          placeholder="Enter quantity"
                          disabled={!item.material}
                          className="w-full"
                        />
                        {item.quantity && Number(item.quantity) <= 0 && (
                          <p className="text-xs text-red-500">Must be &gt; 0</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={item.unit}
                          onValueChange={(value) => {
                            const newItems = [...formData.substitutionItems]
                            newItems[index] = {
                              ...newItems[index],
                              unit: value,
                            }
                            setFormData((prev) => ({
                              ...prev,
                              substitutionItems: newItems,
                            }))
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="pcs">pcs</SelectItem>
                          </SelectContent>
                        </Select>

                        {formData.substitutionItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                substitutionItems: prev.substitutionItems.filter((_, i) => i !== index),
                              }))
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="p-6 pt-2">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="grn-form"
            disabled={noItemsSelected}
            style={{ backgroundColor: "#1b84ff", color: "#ffffff" }}
            className="hover:bg-blue-600"
          >
            Create GRN
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Confirmation Dialog for Receive All */}
      <ConfirmationDialog
        open={confirmReceiveAll}
        onOpenChange={setConfirmReceiveAll}
        title="Receive All Items"
        description="This will mark all items as fully received. The order status will be changed to 'Completed'. Do you want to continue?"
        confirmLabel="Yes, Receive All"
        cancelLabel="Cancel"
        onConfirm={() => {
          handleReceiveAll()
        }}
      />
      {/* Confirmation Dialog for Create GRN */}
      <ConfirmationDialog
        open={confirmGrnDialog}
        onOpenChange={setConfirmGrnDialog}
        title="Create Goods Received Note"
        description="Are you sure you want to create this GRN? The order status will be changed to 'Partial'."
        confirmLabel="Yes, Create GRN"
        cancelLabel="Cancel"
        onConfirm={confirmCreateGrn}
      />
    </Dialog>
  )
}
