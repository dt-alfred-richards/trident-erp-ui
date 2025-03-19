"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown } from "lucide-react"
import { useProductionStore } from "@/hooks/use-production-store"
import { ProductionActionButton } from "@/components/production/production-action-button"

interface ProductionOverviewProps {
  onProduceClick: (sku: string, deficit: number) => void
  onViewOrders: (sku: string) => void
  onViewDemand?: (sku: string) => void
}

export function ProductionOverview({ onProduceClick, onViewOrders, onViewDemand }: ProductionOverviewProps) {
  const { productionData, productionOrders } = useProductionStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

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

  // Toggle sort direction
  const toggleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
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

      <div className="w-full overflow-auto h-[400px] border rounded-md">
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
              <TableHead className="text-right">Available Stock</TableHead>
              <TableHead className="text-right">Deficit</TableHead>
              <TableHead className="text-right">Active Orders</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((item) => (
              <TableRow key={item.sku}>
                <TableCell className="font-medium">{item.sku}</TableCell>
                <TableCell className="text-right">{item.pendingOrders.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.inProduction.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.availableStock.toLocaleString()}</TableCell>
                <TableCell className={`text-right font-medium ${item.deficit > 0 ? "text-red-500" : "text-green-500"}`}>
                  {item.deficit > 0 ? item.deficit.toLocaleString() : "Sufficient"}
                </TableCell>
                <TableCell className="text-right">
                  {activeOrdersBySku[item.sku] ? (
                    <Badge variant="outline" className="ml-auto">
                      {activeOrdersBySku[item.sku]} orders
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ProductionActionButton
                      type="produce"
                      sku={item.sku}
                      deficit={item.deficit}
                      onClick={onProduceClick}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

