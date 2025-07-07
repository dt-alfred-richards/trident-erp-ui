"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Package,
  Layers,
  Box,
  AlertCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Plus,
  ArrowUpDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { UpdateInventoryDialog } from "@/components/inventory/update-inventory-dialog"
import { useToast } from "@/hooks/use-toast"
import { inventoryWastageDialog, RawMaterialsWastageDialog, type WastageData } from "@/components/inventory/raw-materials-wastage-dialog"
import { AddRawMaterialDialog } from "@/components/inventory/add-raw-material-dialog"
import { useInventory } from "@/app/inventory-context"
import { formatNumberIndian } from "@/components/generic"

interface WastageUpdate {
  id: string
  name: string
  wastage: number
}

export default function RawMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showWastageDialog, setShowWastageDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const { toast } = useToast()

  // Add sorting state variables
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { inventory = [] } = useInventory()
  // Use the raw materials store

  const updateRawMaterialQuantity = () => { }

  // State for tracking wastage data
  const [wastageData, setWastageData] = useState<WastageData[]>([])

  // Get unique categories and sort them in the specified order
  const categoryOrder = ["Labels", "Pre-Form", "Shrink", "Caps and Handles", "Consumables"]
  const categories = useMemo(() => {
    return Array.from(new Set(inventory.map((item) => item.category))).sort(
      (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
    )
  }, [inventory])

  // Set default active category to first category on initial load
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0])
    }

    // Initialize wastage data if empty
    if (wastageData.length === 0) {
      const initialWastageData = inventory.map((material) => ({
        id: material.id + '',
        material: material.type,
        category: material.category,
        wastage: 0,
        wastagePercentage: 0,
        lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      }))
      setWastageData(initialWastageData)
    }
  }, [categories, activeCategory, wastageData.length])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveCategory(value)
  }

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Filter and sort raw materials based on search term, active category, and sorting
  const filteredAndSortedMaterials = (() => {
    let filtered = inventory.filter(
      (material) =>
        (activeCategory === null || material.category === activeCategory) &&
        (material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
          material.type?.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    // Apply sorting if a sort column is selected
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue, bValue

        if (sortColumn === "quantity") {
          aValue = a.quantity
          bValue = b.quantity
        } else if (sortColumn === "type") {
          aValue = a.type.toLowerCase()
          bValue = b.type.toLowerCase()
        } else {
          return 0
        }

        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    }

    return filtered
  })()

  // Calculate summary metrics
  const totalMaterials = inventory.length
  const lowStockCount = inventory.filter((material) => {
    switch (material.category) {
      case "Labels":
        return material.quantity < 100
      case "Pre-Form":
        return material.quantity < 100
      case "Shrink":
        return material.quantity < 50
      case "Caps and Handles":
        return material.quantity < 10000
      case "Consumables":
        return material.quantity < 20
      default:
        return false
    }
  }).length
  const pendingOrdersCount = useMemo(() => {
    return inventory.filter(item => !item.status || item.status === "pending").length
  }, [inventory])

  const totalValues = useMemo(() => {
    return inventory.reduce((acc, curr) => {
      acc += (curr.price * curr.quantity)
      return acc;
    }, 0)
  }, [inventory])

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Labels":
        return <Layers className="h-4 w-4" />
      case "Pre-Form":
        return <Box className="h-4 w-4" />
      case "Shrink":
        return <Package className="h-4 w-4" />
      case "Caps and Handles":
        return <Package className="h-4 w-4" />
      case "Consumables":
        return <Box className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  // Get category unit
  const getCategoryUnit = (category: string) => {
    switch (category) {
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

  // Format raw materials for the update dialog
  const formatinventoryForUpdate = () => {
    return inventory.map((material) => ({
      id: material.id,
      name: material.material,
      quantity: material.quantity,
      type: "raw",
      category: material.category,
    }))
  }

  const handleUpdateInventory = (updatedItems: any[], wastageUpdates: WastageUpdate[]) => {
    // Update the raw materials quantities using the store's update method
    updatedItems.forEach((updatedItem) => {
      const material = inventory.find((m) => m.id === updatedItem.id)
      if (material) {
        updateRawMaterialQuantity(material.category, material.type, updatedItem.quantity)
      }
    })

    // Update wastage data
    if (wastageUpdates.length > 0) {
      const now = new Date()

      setWastageData((prevWastageData) => {
        const newWastageData = [...prevWastageData]

        wastageUpdates.forEach((update) => {
          // Find the material to get its current quantity for percentage calculation
          const material = inventory.find((m) => m.id + '' === update.id)
          if (!material) return

          // Calculate wastage percentage based on original quantity + wastage
          const totalQuantity = material.quantity + update.wastage
          const wastagePercentage = totalQuantity > 0 ? (update.wastage / totalQuantity) * 100 : 0

          // Find existing wastage data entry
          const existingIndex = newWastageData.findIndex((item) => item.id === update.id)

          if (existingIndex >= 0) {
            // Update existing entry
            const existingEntry = newWastageData[existingIndex]
            newWastageData[existingIndex] = {
              ...existingEntry,
              wastage: existingEntry.wastage + update.wastage,
              wastagePercentage: wastagePercentage,
              lastUpdated: now,
            }
          } else {
            // Create new entry
            const material = inventory.find((m) => m.id + '' === update.id)
            if (material) {
              newWastageData.push({
                id: update.id,
                material: material.type,
                category: material.category,
                wastage: update.wastage,
                wastagePercentage: wastagePercentage,
                lastUpdated: now,
              })
            }
          }
        })

        return newWastageData
      })
    }

    // Show a success toast
    toast({
      title: "Inventory updated",
      description: `Updated ${updatedItems.length} item(s) in raw materials inventory`,
    })
  }

  return (
    <DashboardShell className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Raw Materials</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track your manufacturing materials inventory
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowWastageDialog(true)}
              className="mr-2 bg-[#f8285a] hover:bg-[#f8285a]/90 text-white border-[#f8285a]"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Wastage
            </Button>
            <Button
              onClick={() => setShowUpdateDialog(true)}
              className="mr-2 bg-[#725af2] hover:bg-[#725af2]/90 text-white border-[#725af2]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Inventory
            </Button>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="mr-2 bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-background border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Materials</p>
                <p className="text-2xl font-semibold">{totalMaterials}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-amber-500/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-semibold">{pendingOrdersCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-destructive/10 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-semibold">{lowStockCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Box className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-semibold">{`₹${formatNumberIndian(totalValues)}`}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category tabs and table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="px-6 py-4 border-b bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <Tabs
                defaultValue={categories[0]}
                value={activeCategory || categories[0]}
                onValueChange={handleTabChange}
              >
                <TabsList className="bg-transparent p-0 h-auto space-x-2">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="px-3 py-1.5 h-auto text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] flex items-center gap-1.5"
                    >
                      {getCategoryIcon(category)}
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search materials..."
                    className="pl-9 w-full md:w-[240px] h-9 bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {searchTerm && (
                  <Badge variant="outline" className="gap-1 px-2 py-1 h-9" onClick={() => setSearchTerm("")}>
                    <span>{searchTerm}</span>
                    <span className="cursor-pointer">×</span>
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredAndSortedMaterials.length > 0 ? (
              <div className="overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead className="w-[40%]">Material</TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => handleSort("quantity")}>
                        <div className="flex items-center justify-end">
                          Quantity
                          {sortColumn === "quantity" && (
                            <ArrowUpDown
                              className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`}
                            />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedMaterials.map((material, index) => {
                      // Determine status based on quantity and category
                      const isLowStock = (() => {
                        switch (material.category) {
                          case "Labels":
                            return material.quantity < 100
                          case "Pre-Form":
                            return material.quantity < 100
                          case "Shrink":
                            return material.quantity < 50
                          case "Caps and Handles":
                            return material.quantity < 10000
                          case "Consumables":
                            return material.quantity < 20
                          default:
                            return false
                        }
                      })()

                      return (
                        <TableRow
                          key={`${material.category}-${material.type}-${index}`}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium">{material.material}</TableCell>
                          <TableCell className="text-right font-medium">{material.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={isLowStock ? "destructive" : "outline"}
                              className={cn(
                                "font-normal",
                                isLowStock
                                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                  : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40",
                              )}
                            >
                              {isLowStock ? "Low Stock" : "In Stock"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="bg-muted/30 p-4 rounded-full mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No materials found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {searchTerm
                    ? `No results for "${searchTerm}". Try adjusting your search terms.`
                    : "No materials found in this category."}
                </p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  variant="outline"
                  className="mt-4 border-dashed border-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UpdateInventoryDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        inventoryType="raw"
        items={formatinventoryForUpdate()}
        onUpdateInventory={handleUpdateInventory}
      />
      <RawMaterialsWastageDialog
        open={showWastageDialog}
        onOpenChange={setShowWastageDialog}
        wastageData={wastageData}
      />
      <AddRawMaterialDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        category={activeCategory || categories[0]}
      />
    </DashboardShell>
  )
}
