"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Inventory, useInventory } from "@/app/inventory-context"

interface InventoryItem {
  id: string
  name: string
  quantity: number
  type: string
  category?: string
  wastage: number
}

interface WastageUpdate {
  id: string
  name: string
  wastage: number
}

interface UpdateInventoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventoryType: "finished" | "raw"
  items: InventoryItem[]
  onUpdateInventory: (updatedItems: InventoryItem[], wastageUpdates: WastageUpdate[]) => void
}

export function UpdateInventoryDialog({
  open,
  onOpenChange,
  inventoryType,
  items,
  onUpdateInventory,
}: UpdateInventoryDialogProps) {
  const { updateInventory } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([])
  const [updatedItems, setUpdatedItems] = useState<InventoryItem[]>([])
  const { toast } = useToast()
  const [wastageValues, setWastageValues] = useState<Record<string, number>>({})

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSearchTerm("")
      setSelectedItems([])
      setUpdatedItems([])
      setWastageValues({})
    }
  }, [open])

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [items])

  // Handle selecting an item
  const handleSelectItem = (item: InventoryItem) => {
    // Check if item is already selected
    if (selectedItems.some((selectedItem) => selectedItem.id === item.id)) {
      return
    }

    // Add item to selected items
    setSelectedItems([...selectedItems, item])

    // Add item to updated items with current quantity
    setUpdatedItems([...updatedItems, { ...item, quantity: item.quantity }])
  }

  // Handle removing an item from selection
  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId))
    setUpdatedItems(updatedItems.filter((item) => item.id !== itemId))

    // Also remove from wastage values
    const newWastageValues = { ...wastageValues }
    delete newWastageValues[itemId]
    setWastageValues(newWastageValues)
  }

  // Handle quantity change
  const handleQuantityChange = (itemId: string, newQuantity: number, wastage: number) => {
    setUpdatedItems(updatedItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity, wastage } : item)))
  }

  const handleWastageChange = (itemId: string, value: string) => {
    const numValue = Number.parseInt(value)
    if (!isNaN(numValue) && numValue >= 0) {
      // Update wastage value
      setWastageValues((prev) => ({ ...prev, [itemId]: numValue }))

      // Find the original item to get its current quantity
      const originalItem = items.find(i => i.id === itemId)
      if (originalItem) {
        // Calculate new quantity based on wastage
        const newQuantity = Math.max(0, originalItem.quantity - numValue)
        handleQuantityChange(itemId, newQuantity, numValue)
      }
    }
  }

  // Handle save
  const handleSave = () => {
    if (!updateInventory) return;
    const payload = updatedItems.map(item => ({ id: parseInt(item.id), quantity: item.quantity, wastage: item.wastage } as Partial<Inventory>))
    Promise.allSettled(
      payload.map(item => updateInventory(item))
    ).then(() => {
      toast({
        title: "Inventory updated",
        description: `Successfully updated ${updatedItems.length} item${updatedItems.length !== 1 ? "s" : ""}`,
      })
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Update {inventoryType === "finished" ? "Finished Goods" : "Raw Materials"} Inventory
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${inventoryType === "finished" ? "products" : "materials"}...`}
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Search Results */}
          {searchTerm && (
            <div className="border rounded-md">
              <ScrollArea className="h-[200px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.name}
                            {item.category && (
                              <Badge variant="outline" className="ml-2">
                                {item.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectItem(item)}
                              disabled={selectedItems.some((selectedItem) => selectedItem.id === item.id)}
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          No items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Selected Items</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Wastage</TableHead>
                      <TableHead>New Quantity</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => {
                      const updatedItem = updatedItems.find((updated) => updated.id === item.id)
                      const newQuantity = updatedItem ? updatedItem.quantity : item.quantity
                      const wastage = wastageValues[item.id] || 0

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.name}
                            {item.category && (
                              <Badge variant="outline" className="ml-2">
                                {item.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className="w-16 text-center"
                              value={wastage}
                              onChange={(e) => handleWastageChange(item.id, e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="w-16 text-center py-2">{newQuantity}</div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-destructive"
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updatedItems.length === 0}
            className="bg-[#725af2] text-white hover:bg-[#5e48d0]"
          >
            Update Inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
