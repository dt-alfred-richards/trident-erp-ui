"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MailIcon, MapPinIcon, PhoneIcon, UserIcon, PackageIcon, Save, X, Plus, Trash } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AddProductDialog } from "./add-product-dialog"
import { Client } from "@/app/sales/client-list/client-context"

interface ClientViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client // Replace 'any' with a more specific type if available
}

// Unit options
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

// Sample product data for the client
const initialProducts = [
  {
    id: 1,
    product: "Premium Steel Sheets",
    sku: "STL-PS-001",
    price: "₹45,000",
    unit: "per ton",
    clientId: "CL-001",
  },
  {
    id: 2,
    product: "Galvanized Iron Pipes",
    sku: "GIP-STD-002",
    price: "₹32,500",
    unit: "per ton",
    clientId: "CL-001",
  },
  {
    id: 3,
    product: "Stainless Steel Rods",
    sku: "SSR-304-003",
    price: "₹58,750",
    unit: "per ton",
    clientId: "CL-002",
  },
  {
    id: 4,
    product: "Aluminum Sheets",
    sku: "ALM-SHT-004",
    price: "₹38,200",
    unit: "per ton",
    clientId: "CL-003",
  },
]

// Global products state (simulating a database)
let globalProducts = [...initialProducts]

export function ClientViewDialog({ open, onOpenChange, client }: ClientViewDialogProps) {
  const { toast } = useToast()
  const [localProducts, setLocalProducts] = useState<any[]>([])
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [editedPrices, setEditedPrices] = useState<Record<number, string>>({})
  const [editedUnits, setEditedUnits] = useState<Record<number, string>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isDataSaved, setIsDataSaved] = useState(true)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  // Use a ref to track if component is mounted
  const isMounted = useRef(true)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setLocalProducts([...globalProducts])
      setSelectedProducts([])
      setEditedPrices({})
      setEditedUnits({})
      setHasUnsavedChanges(false)
      setIsDataSaved(true)
      setShowSaveSuccess(false)
    }

    // Cleanup function
    return () => {
      isMounted.current = false
    }
  }, [open])

  // Get products for this client
  const clientProducts = localProducts.filter((product) => product.clientId === client?.id)

  // Get all product IDs for validation
  const allProductIds = localProducts.map((product) => product.id)

  // Handle adding a new product
  const handleAddProduct = (newProduct: any) => {
    setLocalProducts((prev) => [...prev, newProduct])
    setIsDataSaved(false)
  }

  // Handle checkbox selection
  const toggleProductSelection = (productId: number) => {
    const isCurrentlySelected = selectedProducts.includes(productId)

    if (!isCurrentlySelected) {
      // Initialize the price and unit edit fields with current values if selecting
      const product = localProducts.find((p) => p.id === productId)
      if (product) {
        setEditedPrices((prev) => ({
          ...prev,
          [productId]: product.price,
        }))
        setEditedUnits((prev) => ({
          ...prev,
          [productId]: product.unit,
        }))
      }
    } else {
      // If deselecting, remove from edited states
      const updatedPrices = { ...editedPrices }
      const updatedUnits = { ...editedUnits }
      delete updatedPrices[productId]
      delete updatedUnits[productId]
      setEditedPrices(updatedPrices)
      setEditedUnits(updatedUnits)
    }

    setSelectedProducts((prev) => (isCurrentlySelected ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  // Handle select all checkbox
  const toggleSelectAll = () => {
    if (selectedProducts.length === clientProducts.length) {
      setSelectedProducts([])
      setEditedPrices({})
      setEditedUnits({})
    } else {
      const newSelectedProducts = clientProducts.map((product) => product.id)
      setSelectedProducts(newSelectedProducts)

      // Initialize all price and unit edit fields
      const newEditedPrices: Record<number, string> = {}
      const newEditedUnits: Record<number, string> = {}
      clientProducts.forEach((product) => {
        newEditedPrices[product.id] = product.price
        newEditedUnits[product.id] = product.unit
      })
      setEditedPrices(newEditedPrices)
      setEditedUnits(newEditedUnits)
    }
  }

  // Handle price change
  const handlePriceChange = (productId: number, value: string) => {
    setEditedPrices((prev) => ({
      ...prev,
      [productId]: value,
    }))
    checkForUnsavedChanges(productId, value, editedUnits[productId])
  }

  // Handle unit change
  const handleUnitChange = (productId: number, value: string) => {
    setEditedUnits((prev) => ({
      ...prev,
      [productId]: value,
    }))
    checkForUnsavedChanges(productId, editedPrices[productId], value)
  }

  // Check if there are unsaved changes
  const checkForUnsavedChanges = (productId: number, price: string, unit: string) => {
    const product = localProducts.find((p) => p.id === productId)
    if (product && (price !== product.price || unit !== product.unit)) {
      setHasUnsavedChanges(true)
    } else {
      // Check if there are any other unsaved changes
      const stillHasChanges = Object.keys(editedPrices).some((id) => {
        const numId = Number(id)
        if (numId === productId) return false
        const prod = localProducts.find((p) => p.id === numId)
        return prod && (editedPrices[numId] !== prod.price || editedUnits[numId] !== prod.unit)
      })
      setHasUnsavedChanges(stillHasChanges)
    }
  }

  // Save price and unit changes
  const saveChanges = () => {
    const updatedProducts = localProducts.map((product) => {
      if (selectedProducts.includes(product.id)) {
        return {
          ...product,
          price: editedPrices[product.id] || product.price,
          unit: editedUnits[product.id] || product.unit,
        }
      }
      return product
    })

    setLocalProducts(updatedProducts)
    setHasUnsavedChanges(false)
    setIsDataSaved(false)

    toast({
      title: "Product details updated",
      description: "Product prices and units have been successfully updated. Don't forget to save all changes.",
    })
  }

  // Discard changes
  const discardChanges = () => {
    // Reset edited values to current values
    const currentPrices: Record<number, string> = {}
    const currentUnits: Record<number, string> = {}
    selectedProducts.forEach((id) => {
      const product = localProducts.find((p) => p.id === id)
      if (product) {
        currentPrices[id] = product.price
        currentUnits[id] = product.unit
      }
    })

    setEditedPrices(currentPrices)
    setEditedUnits(currentUnits)
    setHasUnsavedChanges(false)
  }

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return

    setLocalProducts((prev) => prev.filter((product) => !selectedProducts.includes(product.id)))
    setIsDataSaved(false)

    toast({
      title: "Products deleted",
      description: `${selectedProducts.length} product(s) have been removed. Don't forget to save all changes.`,
    })

    setSelectedProducts([])
    setEditedPrices({})
    setEditedUnits({})
    setHasUnsavedChanges(false)
  }

  // Save all changes to the global products state
  const saveAllChanges = () => {
    // Update the global products state
    globalProducts = [...localProducts]

    setIsDataSaved(true)
    setShowSaveSuccess(true)

    // Hide success message after 3 seconds
    setTimeout(() => {
      if (isMounted.current) {
        setShowSaveSuccess(false)
      }
    }, 3000)

    toast({
      title: "Changes saved",
      description: "All changes have been successfully saved.",
      variant: "default",
    })
  }

  // Check if there are any unsaved changes (either price/unit edits or added/deleted products)
  const hasAnyUnsavedChanges = hasUnsavedChanges || !isDataSaved

  // Debug function to show current state
  const debugState = () => {
    console.log("Local Products:", localProducts)
    console.log("Global Products:", globalProducts)
    console.log("Selected Products:", selectedProducts)
    console.log("Edited Prices:", editedPrices)
    console.log("Edited Units:", editedUnits)
    console.log("Has Unsaved Changes:", hasUnsavedChanges)
    console.log("Is Data Saved:", isDataSaved)
  }

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
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Client Information - {client?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Client ID</p>
                  <p className="font-medium">{client?.clientId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Client Name</p>
                  <p className="font-medium">{client?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <UserIcon className="h-3 w-3" /> Contact Person
                  </p>
                  <p className="font-medium">{client?.contactPerson}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MailIcon className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium">{client?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium">{client?.phoneNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" /> Address
                  </p>
                  <p className="font-medium">{client?.shippingAddress}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PackageIcon className="h-5 w-5" />
                    Client Proposed Price
                  </CardTitle>
                  <div className="flex gap-2">
                    {hasUnsavedChanges && (
                      <>
                        <Button variant="outline" size="sm" onClick={discardChanges}>
                          <X className="h-4 w-4 mr-2" />
                          Discard
                        </Button>Add New Client
                        <Button variant="default" size="sm" onClick={saveChanges}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    )}
                    {selectedProducts.length > 0 && !hasUnsavedChanges && (
                      <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    )}
                    <Button size="sm" onClick={() => setIsAddProductDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={clientProducts.length > 0 && selectedProducts.length === clientProducts.length}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all products"
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No products found for this client.
                          </TableCell>
                        </TableRow>
                      ) : (
                        clientProducts.map((product) => (
                          <TableRow
                            key={product.id}
                            className={selectedProducts.includes(product.id) ? "bg-muted/50" : ""}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={() => toggleProductSelection(product.id)}
                                aria-label={`Select ${product.product}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{product.product}</TableCell>
                            <TableCell>{product.sku}</TableCell>
                            <TableCell>
                              {selectedProducts.includes(product.id) ? (
                                <Input
                                  value={
                                    editedPrices[product.id] !== undefined ? editedPrices[product.id] : product.price
                                  }
                                  onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                  className="h-8 w-full"
                                />
                              ) : (
                                product.price
                              )}
                            </TableCell>
                            <TableCell>
                              {selectedProducts.includes(product.id) ? (
                                <Select
                                  value={editedUnits[product.id] || product.unit}
                                  onValueChange={(value) => handleUnitChange(product.id, value)}
                                >
                                  <SelectTrigger className="h-8 w-full">
                                    <SelectValue />
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
                                product.unit
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {selectedProducts.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedProducts.length} item(s) selected. Price and unit columns are now editable.
                  </p>
                )}
                {!isDataSaved && (
                  <p className="text-sm text-amber-500 mt-2">
                    You have unsaved changes. Click "Save Changes" to persist your modifications.
                  </p>
                )}
                {showSaveSuccess && (
                  <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded-md mt-2">
                    <Save className="h-4 w-4 mr-2" />
                    Changes saved successfully!
                  </div>
                )}
              </CardContent>
            </Card>
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
            <Button
              onClick={saveAllChanges}
              disabled={isDataSaved && !hasUnsavedChanges}
              className={!isDataSaved || hasUnsavedChanges ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddProductDialog
        open={isAddProductDialogOpen}
        onOpenChange={setIsAddProductDialogOpen}
        onAdd={handleAddProduct}
        existingIds={allProductIds}
        clientId={client?.id}
      />
    </>
  )
}
