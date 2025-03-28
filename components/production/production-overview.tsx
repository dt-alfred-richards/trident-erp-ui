"use client"

import { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown } from "lucide-react"
import { useProductionStore } from "@/hooks/use-production-store"
import { ProductionActionButton } from "@/components/production/production-action-button"
import { useFinished } from "@/app/inventory/finished-goods/context"
import { useOrders } from "@/contexts/order-context"
import moment from "moment"

interface ProductionOverviewProps {
  onProduceClick: (sku: string, deficit: number) => void
  onViewOrders: (sku: string) => void
  onViewDemand?: (sku: string) => void
}

interface ProductionData {
  sku: string
  pendingOrders: number
  inProduction: number
  availableStock: number
  deficit: number
  status: "deficit" | "sufficient",
  id: number
}

type ProductionOrders = {
  id: string,
  sku: string,
  quantity: number,
  startDate: string,
  deadline: string,
  assignedTo: string,
  progress: number,
}

export function ProductionOverview({ onProduceClick, onViewOrders, onViewDemand }: ProductionOverviewProps) {
  const { cummlative, finishedGoods, productionDetails } = useFinished();
  // const { productionData, productionOrders } = useProductionStore()
  const { productInfo } = useOrders();
  const [productionData, setProductionData] = useState<ProductionData[]>([])
  const [productionOrders, setProductionOrders] = useState<ProductionOrders[]>([]);
  const [searchQuery, setSearchQuery] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    if (!productInfo || !cummlative || !finishedGoods) return;

    const _productionData = Object.values(productInfo).map(item => {
      const availableStock = cummlative.find(({ productId }) => productId === item.productId)?.stock || 0;

      const inProduction = finishedGoods
        .filter(({ productId }) => productId === item.productId)
        .reduce((acc, curr) => acc + (curr.production || 0), 0);

      const pendingOrders = productionDetails.filter(({ productionId }) => productionId === item.productId).reduce((acc, curr) => {
        acc += curr.numBottles
        return acc;
      }, 0)
      return {
        availableStock,
        inProduction,
        deficit: pendingOrders - (inProduction + availableStock),
        pendingOrders,
        sku: item.sku,
        status: "sufficient",
        id: item.id
      } as ProductionData;
    });

    setProductionOrders(productionDetails.map(item => ({
      assignedTo: "",
      deadline: "",
      id: item.productionId,
      progress: 0,
      quantity: item.numBottles,
      sku: productInfo[item.productionId]?.sku || "",
      startDate: moment(item.startTime).format('DD-MM-YYYY'),
    }) as ProductionOrders))
    setProductionData(_productionData);
  }, [productInfo, cummlative, finishedGoods, productionDetails]);

  // Calculate active orders for each SKU
  const activeOrdersBySku = useMemo(() => productionOrders.reduce(
    (acc, order) => {
      acc[order.sku] = (acc[order?.sku] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  ), [productionOrders])

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

      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
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
              <TableRow key={item.id}>
                <TableCell className="font-medium" style={{ display: 'none' }}>{item.id}</TableCell>
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

