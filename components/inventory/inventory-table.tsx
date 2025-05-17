"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { useRawMaterialsStore } from "@/hooks/use-raw-materials-store"

// Update the interface to include inventoryData
interface InventoryTableProps {
  onAllocate?: (sku: string) => void
  inventoryData?: {
    sku?: string
    id?: string
    name?: string
    available?: number
    quantity?: number
    reserved?: number
    inProduction?: number
  }[]
}

export function InventoryTable({ onAllocate, inventoryData: propInventoryData }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()
  const [displayData, setDisplayData] = useState<any[]>([])

  // Get raw materials data from the store
  const { rawMaterials } = useRawMaterialsStore()

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // This would come from your API in a real application
  const defaultInventoryData = [
    {
      sku: "500ml",
      available: 250,
      reserved: 1000,
      inProduction: 2000,
    },
    {
      sku: "750ml",
      available: 1200,
      reserved: 0,
      inProduction: 1500,
    },
    {
      sku: "1000ml",
      available: 200,
      reserved: 600,
      inProduction: 1000,
    },
    {
      sku: "2000ml",
      available: 1000,
      reserved: 500,
      inProduction: 500,
    },
    {
      sku: "Custom-A",
      available: 0,
      reserved: 0,
      inProduction: 800,
    },
    {
      sku: "Premium-500ml",
      available: 350,
      reserved: 800,
      inProduction: 1500,
    },
    {
      sku: "Premium-750ml",
      available: 900,
      reserved: 200,
      inProduction: 1200,
    },
    {
      sku: "Premium-1000ml",
      available: 150,
      reserved: 400,
      inProduction: 800,
    },
    {
      sku: "Limited-Edition",
      available: 50,
      reserved: 300,
      inProduction: 200,
    },
    {
      sku: "Gift-Pack",
      available: 75,
      reserved: 150,
      inProduction: 300,
    },
  ]

  // Process the inventory data when it changes
  useEffect(() => {
    // Start with the default inventory data
    const processedData = [...defaultInventoryData]

    // Update available quantities based on raw materials data
    // This is a simplified approach - in a real app, you'd have a more sophisticated mapping
    processedData.forEach((item) => {
      // For 500ml, use the quantity from the 500ml Standard label
      if (item.sku === "500ml") {
        const material = rawMaterials.find((m) => m.type === "500ml Standard" && m.category === "Labels")
        if (material) {
          item.available = material.quantity
        }
      }

      // For 750ml, use the quantity from the 750ml Special label
      else if (item.sku === "750ml") {
        const material = rawMaterials.find((m) => m.type === "750ml Special" && m.category === "Labels")
        if (material) {
          item.available = material.quantity
        }
      }

      // For 1000ml, use the quantity from the 1L Premium label
      else if (item.sku === "1000ml") {
        const material = rawMaterials.find((m) => m.type === "1L Premium" && m.category === "Labels")
        if (material) {
          item.available = material.quantity
        }
      }

      // For 2000ml, use the quantity from the 2L Economy label
      else if (item.sku === "2000ml") {
        const material = rawMaterials.find((m) => m.type === "2L Economy" && m.category === "Labels")
        if (material) {
          item.available = material.quantity
        }
      }
    })

    // If prop data is provided, use it to override the defaults
    if (propInventoryData) {
      propInventoryData.forEach((propItem) => {
        if (!propItem.name && !propItem.id && !propItem.sku) return

        const itemName = propItem.name || propItem.id || propItem.sku
        const index = processedData.findIndex((item) => item.sku.toLowerCase() === String(itemName).toLowerCase())

        if (index !== -1) {
          processedData[index].available =
            propItem.quantity !== undefined
              ? propItem.quantity
              : propItem.available !== undefined
                ? propItem.available
                : processedData[index].available

          if (propItem.reserved !== undefined) {
            processedData[index].reserved = propItem.reserved
          }
        }
      })
    }

    setDisplayData(processedData)
  }, [propInventoryData, rawMaterials])

  // Filter data based on search term
  const filteredData = displayData.filter((item) => item.sku.toLowerCase().includes(searchTerm.toLowerCase()))

  // Sort data if a sort column is selected
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn as keyof typeof a]
    const bValue = b[sortColumn as keyof typeof b]

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedData = sortedData.slice(indexOfFirstItem, indexOfLastItem)

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleAllocate = (sku: string) => {
    if (onAllocate) {
      onAllocate(sku)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-sm">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <span className="text-sm">In Production</span>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by SKU..."
          className="pl-8 w-full md:w-[300px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="w-full overflow-auto border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("sku")}>
                <div className="flex items-center">
                  SKU
                  {sortColumn === "sku" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("available")}>
                <div className="flex items-center justify-end">
                  Available
                  {sortColumn === "available" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("reserved")}>
                <div className="flex items-center justify-end">
                  Reserved
                  {sortColumn === "reserved" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => handleSort("inProduction")}>
                <div className="flex items-center justify-end">
                  In Production
                  {sortColumn === "inProduction" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right cursor-pointer">
                <div className="flex items-center justify-end">
                  Total
                  {sortColumn === "total" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => {
                const total = item.available + item.reserved + item.inProduction

                return (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell className="text-right text-blue-600 font-medium">
                      {item.available.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-gray-600 dark:text-gray-400">
                      {item.reserved.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-amber-600">{item.inProduction.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold">{total.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#43ced7] hover:bg-[#43ced7]/90 text-white"
                        onClick={() => handleAllocate(item.sku)}
                        disabled={item.available === 0}
                      >
                        Allocate
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        totalItems={sortedData.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
