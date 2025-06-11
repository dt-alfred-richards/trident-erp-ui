"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown, Calendar, AlertCircle } from "lucide-react"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { useProduction } from "./production-context"
import { convertDate, getPriority } from "../generic"
import { ClientProposedProduct, useOrders } from "@/contexts/order-context"

interface PendingOrder {
  id: string
  sku: string
  orderQuantity: number
  pendingQuantity: number
  orderDate: string
  deliveryDate: string
  customer: string
  priority: "low" | "medium" | "high"
}

interface PendingOrdersTableProps {
  filterSku?: string
}

export function PendingOrdersTable({ filterSku }: PendingOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { clientProposedProductMapper, clientMapper = {} } = useOrders()
  const [sortField, setSortField] = useState<keyof PendingOrder>("deliveryDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const { productionOrders = [] } = useProduction()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const productClientMapper = useMemo(() => {
    return Object.values(clientProposedProductMapper).flat().reduce((acc: Record<string, ClientProposedProduct>, curr) => {
      if (!acc[curr?.productId || ""]) {
        acc[curr?.productId || ""] = curr;
      }
      return acc;
    }, {})
  }, [clientProposedProductMapper])

  const samplePendingOrders = useMemo(() => {
    return productionOrders.map(item => {
      const clientId = productClientMapper[item.productId]?.clientId || "",
        customer = clientMapper[clientId]?.name || ""
      return ({
        id: item.productionOrderId,
        sku: item.sku,
        orderQuantity: item.quantity || 0,
        pendingQuantity: item.inProduction,
        orderDate: item.createdOn,
        deliveryDate: item.deadline,
        customer,
        priority: getPriority(item.deadline),
      })
    })
  }, [productionOrders, productClientMapper, clientMapper])


  // Filter and sort the pending orders
  const filteredAndSortedOrders = useMemo(() => {
    // First filter by SKU if provided
    let filtered = filterSku ? samplePendingOrders.filter((order) => order.sku === filterSku) : samplePendingOrders

    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.sku.toLowerCase().includes(query) ||
          order.customer.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query),
      )
    }

    // Then sort by the selected field
    return [...filtered].sort((a, b) => {
      if (sortField === "deliveryDate" || sortField === "orderDate") {
        const dateA = new Date(a[sortField]).getTime()
        const dateB = new Date(b[sortField]).getTime()
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else if (sortField === "orderQuantity" || sortField === "pendingQuantity") {
        return sortDirection === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField]
      } else {
        const valueA = String(a[sortField]).toLowerCase()
        const valueB = String(b[sortField]).toLowerCase()
        return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      }
    })
  }, [samplePendingOrders, searchQuery, sortField, sortDirection, filterSku])

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAndSortedOrders.slice(indexOfFirstItem, indexOfLastItem)

  // Toggle sort direction or change sort field
  const handleSort = (field: keyof PendingOrder) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Calculate days until required date
  const getDaysUntil = (dateString: string | Date) => {
    const today = new Date()
    const deliveryDate = new Date(dateString)
    const diffTime = deliveryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get priority badge
  const getPriorityBadge = (priority: PendingOrder["priority"], daysUntil: number) => {
    if (daysUntil < 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </Badge>
      )
    }

    if (daysUntil <= 3) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Critical
        </Badge>
      )
    }

    if (priority === "high" || daysUntil <= 7) {
      return <Badge className="bg-amber-500">Urgent</Badge>
    }

    if (priority === "medium") {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-500">
          Medium
        </Badge>
      )
    }

    return <Badge variant="outline">Normal</Badge>
  }

  // Clear filter
  const clearFilter = () => {
    setSearchQuery("")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Pending Orders</h2>
          {filterSku && (
            <Badge variant="secondary" className="ml-2">
              Filtered by: {filterSku}
              <Button variant="ghost" size="sm" className="h-4 w-4 ml-1 p-0" onClick={clearFilter}>
                ×
              </Button>
            </Badge>
          )}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
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
              <TableHead className="cursor-pointer" onClick={() => handleSort("sku")}>
                <div className="flex items-center">
                  SKU
                  {sortField === "sku" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("orderQuantity")}>
                <div className="flex items-center justify-end">
                  Order Quantity
                  {sortField === "orderQuantity" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort("pendingQuantity")}>
                <div className="flex items-center justify-end">
                  Pending Quantity
                  {sortField === "pendingQuantity" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("orderDate")}>
                <div className="flex items-center">
                  Order Date
                  {sortField === "orderDate" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                </div>
              </TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No pending orders found.
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((order) => {
                const daysUntil = getDaysUntil(order.deliveryDate)

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.sku}</TableCell>
                    <TableCell className="text-right">{order.orderQuantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{order.pendingQuantity.toLocaleString()}</TableCell>
                    <TableCell>{convertDate(order.orderDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {convertDate(order.deliveryDate)}
                        <span
                          className={`text-xs ${daysUntil < 0
                            ? "text-red-500"
                            : daysUntil <= 3
                              ? "text-red-500"
                              : daysUntil <= 7
                                ? "text-amber-500"
                                : "text-muted-foreground"
                            }`}
                        >
                          {daysUntil < 0
                            ? `(${Math.abs(daysUntil)} days overdue)`
                            : daysUntil === 0
                              ? "(Today)"
                              : `(${daysUntil} days)`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{getPriorityBadge(order.priority, daysUntil)}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        totalItems={filteredAndSortedOrders.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
