"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InventoryTableProps {
  onAllocate?: (sku: string) => void
}

export function InventoryTable({ onAllocate }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()

  // This would come from your API in a real application
  const inventoryData = [
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
    // Adding 5 more rows
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

  // Filter data based on search term
  const filteredData = inventoryData.filter((item) => item.sku.toLowerCase().includes(searchTerm.toLowerCase()))

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

      <div className="w-full overflow-auto" style={{ maxHeight: "400px" }}>
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
            {sortedData.length > 0 ? (
              sortedData.map((item) => {
                const total = item.available + item.reserved + item.inProduction

                return (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell className="text-right text-blue-600 font-medium">
                      {item.available.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">{item.reserved.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-amber-600">{item.inProduction.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold">{total.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
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
    </div>
  )
}

