"use client"

import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DataByTableName } from "../utils/api"
import { useOrders } from "@/contexts/order-context"
import { Order } from "@/types/order"
import { createType } from "../utils/generic"
import { useFinished } from "@/app/inventory/finished-goods/context"
import { OrderDetails } from "../sales/sales-dashboard"

interface InventoryTableProps {
  onAllocate?: (sku: string) => void
}

type FinalProduction = {
  date: string,
  productId: string,
  opening: number,
  production: number,
  outward: number,
  closing: number
}

type Cummulative = {
  date: string,
  productId: string,
  stock: number
}


type InventoryData = {
  sku: string,
  available: number,
  reserved: number,
  inProduction: number,
  id: string
}

type Response = {
  id: number,
  productId: string,
  opening: number,
  production: number,
  outward: number,
  closing: number,
  createdOn: number,
  createdBy: object,
  modifiedOn: number,
  modifiedBy: object,
  reserved: number
}



export function InventoryTable({ onAllocate }: InventoryTableProps) {
  const { orderDetails, cummlative, finishedGoods } = useFinished();
  const [searchTerm, setSearchTerm] = useState("")
  const { productInfo, refetchData } = useOrders();
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([])

  useEffect(() => {
    const ordersMapper = Object.fromEntries(
      orderDetails.map((item) => [item.productId, item])
    );
    const _inventoryData: InventoryData[] = Object.values(ordersMapper).map((item) => {
      const reserved = orderDetails.filter(i => i.productId === item.productId).reduce((acc, curr) => {
        acc += curr.casesReserved;
        return acc;
      }, 0);

      return ({
        available: cummlative.find(i => i.productId === item.productId)?.stock || 0,
        id: item.orderId,
        inProduction: finishedGoods.find(i => i.productId === item.productId)?.production || 0,
        reserved: reserved,
        sku: productInfo[item.productId]?.sku || ""
      })
    })
    setInventoryData(_inventoryData)
  }, [orderDetails, finishedGoods, cummlative, productInfo])

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
              <TableHead className="cursor-pointer hidden" onClick={() => handleSort("id")}>
                <div className="flex items-center">
                  id
                  {sortColumn === "id" && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                  )}
                </div>
              </TableHead>
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
                  <TableRow key={item.id}>
                    <TableCell className="font-medium hidden">item.id}</TableCell>
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

