"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Define the raw material interface
interface RawMaterial {
  category: string
  type: string
  quantity: number
  unit: string
}

export default function RawMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("")

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

  // Filter raw materials based on search term
  const filteredMaterials = rawMaterials.filter(
    (material) =>
      material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Group materials by category
  const groupedMaterials: { [key: string]: RawMaterial[] } = {}
  filteredMaterials.forEach((material) => {
    if (!groupedMaterials[material.category]) {
      groupedMaterials[material.category] = []
    }
    groupedMaterials[material.category].push(material)
  })

  // Get unique categories and sort them in the specified order
  const categoryOrder = ["Labels", "Pre-Form", "Shrink", "Caps", "Consumables"]
  const categories = Object.keys(groupedMaterials).sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b))

  return (
    <DashboardShell className="p-6">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-0 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Materials</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-1 px-3">
              <div className="text-base font-bold">{rawMaterials.length}</div>
              <p className="text-[10px] text-muted-foreground">Across {categories.length} categories</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-0 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-1 px-3">
              <div className="text-base font-bold">₹24.7M</div>
              <p className="text-[10px] text-muted-foreground">Estimated value</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-0 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Low Stock</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-1 px-3">
              <div className="text-base font-bold">12</div>
              <p className="text-[10px] text-muted-foreground">Below threshold</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-0 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-1 px-3">
              <div className="text-base font-bold">7</div>
              <p className="text-[10px] text-muted-foreground">Awaiting delivery</p>
            </CardContent>
          </Card>
        </div>

        {/* Main content card */}
        <Card className="border-0 shadow-md bg-card">
          <CardHeader className="border-b bg-muted/30 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Raw Materials Inventory</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Complete inventory of all manufacturing materials</p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search materials..."
                  className="pl-9 pr-4 py-2 border-muted bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{category}</h3>
                      <div className="h-px flex-1 bg-border"></div>
                      <span className="text-sm text-muted-foreground">{groupedMaterials[category].length} items</span>
                    </div>
                    <div className="rounded-md border border-border/60 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="w-[40%]">Type</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Unit</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedMaterials[category].map((material, index) => {
                            // Determine status based on quantity
                            const isLowStock =
                              (material.quantity < 30 && material.unit === "Boxes") ||
                              (material.quantity < 10000 && material.unit === "Pieces") ||
                              (material.quantity < 20 && material.unit === "Rolls")

                            return (
                              <TableRow
                                key={`${material.category}-${material.type}-${index}`}
                                className={isLowStock ? "bg-destructive/5" : ""}
                              >
                                <TableCell className="font-medium">{material.type}</TableCell>
                                <TableCell className="text-right">{material.quantity.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{material.unit}</TableCell>
                                <TableCell className="text-right">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      isLowStock
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    }`}
                                  >
                                    {isLowStock ? "Low Stock" : "In Stock"}
                                  </span>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No materials found</h3>
                  <p>Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

