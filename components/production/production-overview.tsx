"use client"

import { useState, useMemo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown } from "lucide-react"
import { useProductionStore } from "@/hooks/use-production-store"
import { ProductionActionButton } from "@/components/production/production-action-button"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { useOrders } from "@/contexts/order-context"
import { useProduction } from "./production-context"
import { getChildObject } from "../generic"
import { useBomContext } from "../bom/bom-context"
import { useInventory } from "@/app/inventory-context"

interface ProductionOverviewProps {
  onProduceClick: (sku: string, deficit: number) => void
  onViewOrders: (sku: string) => void
  onViewDemand?: (sku: string) => void
}

export function ProductionOverview({ onProduceClick, onViewOrders, onViewDemand }: ProductionOverviewProps) {
  const { productionOrders = [] } = useProduction()
  const { bom = [] } = useBomContext();
  const { inventory } = useInventory()
  const { clientProposedProductMapper } = useOrders()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const notCompletedOrders = useMemo(() => {
    return productionOrders.filter(item => !["cancelled", "completed"].includes(item.status))
  }, [productionOrders])

  const getCummulativeSum = useCallback(
    ({ key, refObject, defaultValue = 0 }: { key: string, refObject: any[], defaultValue?: number }) => {
      return refObject.reduce((acc, curr) => {
        acc += getChildObject(curr, key, defaultValue)
        return acc;
      }, 0)
    }, [productionOrders])

  const productionData = useMemo(() => {
    return Object.values(clientProposedProductMapper).flat().map(item => {
      const skuProductionOrders = productionOrders.filter(i => i.sku === item.sku);
      return ({
        sku: item.sku,
        productId: item.productId,
        pendingOrders: skuProductionOrders.filter(i => i.status === "pending").length || 0,
        inProduction: getCummulativeSum({ key: "inProduction", refObject: skuProductionOrders }),
        produced: getCummulativeSum({ key: "produced", refObject: skuProductionOrders }),
        availableStock: item.availableQuantity,
        activeOrders: skuProductionOrders.filter(item => item.status !== "completed").length,
        deficit: getCummulativeSum({ key: "inProduction", refObject: skuProductionOrders })
      })
    })
  }, [clientProposedProductMapper, notCompletedOrders, productionOrders, getCummulativeSum])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Calculate active orders for each SKU
  const activeOrdersBySku = productionOrders.reduce(
    (acc, order) => {
      acc[order.sku] = (acc[order.sku] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Filter and sort the production data
  const filteredAndSortedData = useMemo(() => {
    // First filter by search query
    const filtered = productionData.filter((item) => item.sku.toLowerCase().includes(searchQuery.toLowerCase()))

    // Then sort by SKU
    return [...filtered].sort((a, b) => {
      if (sortDirection === "asc") {
        return a.sku.localeCompare(b.sku)
      } else {
        return b.sku.localeCompare(a.sku)
      }
    })
  }, [productionData, searchQuery, sortDirection])

  // Add this function after the existing useMemo hooks
  const getLatestProducedUnits = (sku: string) => {
    // Find all production orders for this SKU
    const skuOrders = productionOrders.filter((order) => order.sku === sku)

    if (skuOrders.length === 0) return 0

    // Get the latest production update for each order
    let totalProduced = 0

    skuOrders.forEach((order) => {
      // Get progress history for this order
      const progressHistory = useProductionStore.getState().getProgressHistory(order.id)

      if (progressHistory && progressHistory.length > 0) {
        // Sort by timestamp in descending order
        const sortedHistory = [...progressHistory].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

        // Get the latest update
        const latestUpdate = sortedHistory[0]
        totalProduced += latestUpdate.units
      }
    })

    return totalProduced
  }

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem)

  // Toggle sort direction
  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">SKU Production Overview</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="w-full overflow-auto border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="cursor-pointer" onClick={toggleSort}>
                <div className="flex items-center">
                  SKU
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Pending Orders</TableHead>
              <TableHead className="text-right">In Production</TableHead>
              <TableHead className="text-right">Produced</TableHead>
              <TableHead className="text-right">Available Stock</TableHead>
              <TableHead className="text-right">Deficit</TableHead>
              <TableHead className="text-right">Active Orders</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No SKUs found.
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell className="text-right">{item.pendingOrders.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.inProduction.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.produced}</TableCell>
                  <TableCell className="text-right">{item.availableStock.toLocaleString()}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${item.deficit > 0 ? "text-red-500" : "text-green-500"}`}
                  >
                    {item.deficit > 0 ? item.deficit.toLocaleString() : "Sufficient"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.activeOrders ? (
                      <Badge variant="outline" className="ml-auto">
                        {item.activeOrders} orders
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <ProductionActionButton
                        type="produce"
                        sku={item.productId}
                        deficit={item.deficit}
                        onClick={onProduceClick}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        totalItems={filteredAndSortedData.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
