"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { useRawMaterialsStore } from "@/hooks/use-raw-materials-store"
import { useInventory } from "@/app/inventory-context"
import { useOrders } from "@/contexts/order-context"
import { getChildObject } from "../generic"
import { useProduction } from "../production/production-context"

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
  const { inventory = [] } = useInventory()
  const { productionOrders } = useProduction()
  const { orders, clientMapper } = useOrders();
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()
  const [displayData, setDisplayData] = useState<any[]>([])
  const { productSkuMapper, clientProposedProductMapper } = useOrders()

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const getCummulativeSum = useCallback(
    ({ key, refObject, defaultValue = 0 }: { key: string, refObject: any[], defaultValue?: number }) => {
      return refObject.reduce((acc, curr) => {
        acc += getChildObject(curr, key, defaultValue)
        return acc;
      }, 0)
    }, [orders])

  // This would come from your API in a real application
  const defaultInventoryData = useMemo(() => {
    const products = orders.flatMap(item => getChildObject(item, "products", [])).reduce((acc, curr) => {
      if (!acc[curr.sku]) {
        acc[curr.sku] = 0
      }
      acc[curr.sku] += parseInt(curr.allocated)
      return acc;
    }, {})

    return Object.values(clientProposedProductMapper).flat().map(item => {
      const pOrders = productionOrders?.filter(i => i.sku === item.sku)
      const inProduction = getCummulativeSum({ refObject: pOrders || [], key: "inProduction" })
      return {
        sku: `${item?.name || ""}`,
        clientId: item.clientId,
        available: parseInt(item.availableQuantity) || 0,
        reserved: products[item.sku] || 0,
        inProduction: inProduction,
      }
    })
  }, [clientProposedProductMapper, productSkuMapper, productionOrders, orders])

  // Process the inventory data when it changes
  useEffect(() => {
    // Start with the default inventory data
    const processedData = [...defaultInventoryData]
    setDisplayData(processedData)
  }, [defaultInventoryData])

  // Filter data based on search term
  const filteredData = useMemo(() => displayData.filter((item) => item.sku.toLowerCase().includes(searchTerm.toLowerCase())),
    [displayData, searchTerm])


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
                  Product
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
              paginatedData.map((item, index) => {
                const total = parseInt(item.available) + parseInt(item.reserved) + parseInt(item.inProduction)

                return (
                  <TableRow key={`${item.sku}-${index}`}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.sku}</span>
                        <span className="text-xs text-muted-foreground">
                          {clientMapper[item.clientId]?.name}
                        </span>
                      </div>
                      {/* {item.sku} */}
                    </TableCell>
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
