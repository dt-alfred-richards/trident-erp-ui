"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Package, Layers, Box, AlertCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Define the raw material interface
interface RawMaterial {
  category: string
  type: string
  quantity: number
  unit: string
}

export default function RawMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Mock data for raw materials
  const rawMaterials: RawMaterial[] = [
    // Labels
    { category: "Labels", type: "500ml Standard", quantity: 25000, unit: "Pieces" },
    { category: "Labels", type: "1L Premium", quantity: 15000, unit: "Pieces" },
    { category: "Labels", type: "2L Economy", quantity: 10000, unit: "Pieces" },
    { category: "Labels", type: "750ml Special", quantity: 8000, unit: "Pieces" },
    { category: "Labels", type: "330ml Mini", quantity: 30000, unit: "Pieces" },

    // Pre-Form
    { category: "Pre-Form", type: "9.3", quantity: 150, unit: "Boxes" },
    { category: "Pre-Form", type: "12.5", quantity: 200, unit: "Boxes" },
    { category: "Pre-Form", type: "19", quantity: 175, unit: "Boxes" },
    { category: "Pre-Form", type: "32", quantity: 120, unit: "Boxes" },
    { category: "Pre-Form", type: "26", quantity: 90, unit: "Boxes" },

    // Shrink
    { category: "Shrink", type: "480mm", quantity: 50, unit: "Rolls" },
    { category: "Shrink", type: "530mm", quantity: 45, unit: "Rolls" },

    // Caps
    { category: "Caps", type: "Red", quantity: 50000, unit: "Pieces" },
    { category: "Caps", type: "White", quantity: 45000, unit: "Pieces" },
    { category: "Caps", type: "Black", quantity: 30000, unit: "Pieces" },
    { category: "Caps", type: "Pink", quantity: 25000, unit: "Pieces" },
    { category: "Caps", type: "Yellow", quantity: 20000, unit: "Pieces" },
    { category: "Caps", type: "Blue", quantity: 35000, unit: "Pieces" },
    { category: "Caps", type: "Orange", quantity: 15000, unit: "Pieces" },

    // Consumables
    { category: "Consumables", type: "Red Handle", quantity: 75, unit: "Boxes" },
    { category: "Consumables", type: "White Handle", quantity: 60, unit: "Boxes" },
    { category: "Consumables", type: "Nilkamal Ink Bottle", quantity: 40, unit: "Boxes" },
    { category: "Consumables", type: "Nilkamal Makeup", quantity: 35, unit: "Boxes" },
    { category: "Consumables", type: "Best Code Wash Bottles", quantity: 25, unit: "Boxes" },
  ]

  // Get unique categories and sort them in the specified order
  const categoryOrder = ["Labels", "Pre-Form", "Shrink", "Caps", "Consumables"]
  const categories = Array.from(new Set(rawMaterials.map((item) => item.category))).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
  )

  // Set default active category to first category on initial load
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0])
    }
  }, [categories, activeCategory])

  // Filter raw materials based on search term and active category
  const filteredMaterials = rawMaterials.filter(
    (material) =>
      (activeCategory === null || material.category === activeCategory) &&
      (material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.type.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Calculate summary metrics
  const totalMaterials = rawMaterials.length
  const lowStockCount = rawMaterials.filter(
    (material) =>
      (material.quantity < 30 && material.unit === "Boxes") ||
      (material.quantity < 10000 && material.unit === "Pieces") ||
      (material.quantity < 20 && material.unit === "Rolls"),
  ).length
  const pendingOrdersCount = 12 // Mock data for pending orders

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Labels":
        return <Layers className="h-4 w-4" />
      case "Pre-Form":
        return <Box className="h-4 w-4" />
      case "Shrink":
        return <Package className="h-4 w-4" />
      case "Caps":
        return <Package className="h-4 w-4" />
      case "Consumables":
        return <Package className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveCategory(value)
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
                <p className="text-2xl font-semibold">₹24.7M</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category tabs and table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="px-6 py-4 border-b bg-muted/20">
            <Tabs defaultValue={categories[0]} value={activeCategory || categories[0]} onValueChange={handleTabChange}>
              <TabsList className="bg-transparent p-0 h-auto space-x-2">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="px-3 py-1.5 h-auto text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5"
                  >
                    {getCategoryIcon(category)}
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="p-0">
            {filteredMaterials.length > 0 ? (
              <div className="overflow-auto">
                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead className="w-[40%]">Material Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material, index) => {
                      // Determine status based on quantity
                      const isLowStock =
                        (material.quantity < 30 && material.unit === "Boxes") ||
                        (material.quantity < 10000 && material.unit === "Pieces") ||
                        (material.quantity < 20 && material.unit === "Rolls")

                      return (
                        <TableRow
                          key={`${material.category}-${material.type}-${index}`}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium">{material.type}</TableCell>
                          <TableCell className="text-right font-medium">{material.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{material.unit}</TableCell>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

