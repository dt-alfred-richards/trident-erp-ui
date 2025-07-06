"use client"

import { LogisticsProduct } from "@/app/logistics/shipment-tracking/logistics-context"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { PriorityIndicator } from "@/components/common/priority-indicator"
import { StatusBadge } from "@/components/common/status-badge"
import { EditOrderDialog } from "@/components/sales/edit-order-dialog"
import { OrderSummaryDialog } from "@/components/sales/order-summary-dialog"
import { TrackOrderDialog } from "@/components/sales/track-order-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useOrders } from "@/contexts/order-context"
import type { OrderStatus } from "@/types/order"
import { format } from "date-fns"
import {
  ArrowUpRight,
  Ban,
  CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Search,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { DataByTableName } from "../api"
import { convertDate } from "../generic"

export function SalesTable() {
  // Use order context
  const { orders = [], approveOrder, rejectOrder, getOrderById, cancelOrder, refetchContext, referenceMapper } = useOrders()
  // Filter states
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [clientFilter, setClientFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined)
  const [referenceFilter, setReferenceFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false)
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false)
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [orderToAction, setOrderToAction] = useState<string | null>(null)

  // Add pagination state variables
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10) // Reduced to 10 to make pagination more visible

  // Apply filters to orders
  const filtered = orders.filter((order) => {
    if (!order) return false;
    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false
    }

    // Search query (across multiple fields)
    if (searchQuery && order) {
      const query = searchQuery.toLowerCase()
      const matchesId = order.id.toLowerCase().includes(query)
      const matchesCustomer = order.customer.toLowerCase().includes(query)
      const matchesReference = order.reference.toLowerCase().includes(query)
      const matchesEmployee = order.isEmployeeChecked ? `Emp-${order.employeeReferenceId}`.toLowerCase().includes(query) : ""
      // const matchesSku = order.products.some((p) => p.sku.toLowerCase().includes(query))

      if (!(matchesId || matchesCustomer || matchesReference || matchesEmployee)) {
        return false
      }
    }

    // Date filter
    if (dateFilter) {
      const orderDate = new Date(order.orderDate)
      const filterDate = new Date(dateFilter)

      if (
        orderDate.getFullYear() !== filterDate.getFullYear() ||
        orderDate.getMonth() !== filterDate.getMonth() ||
        orderDate.getDate() !== filterDate.getDate()
      ) {
        return false
      }
    }

    // Client filter
    if (clientFilter && !order.customer.toLowerCase().includes(clientFilter.toLowerCase())) {
      return false
    }

    // Priority filter
    if (priorityFilter && order.priority !== priorityFilter) {
      return false
    }

    // Reference filter
    if (referenceFilter && !order.reference.toLowerCase().includes(referenceFilter.toLowerCase())) {
      return false
    }

    return true
  })

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const paginatedOrders = filtered.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filtered.length / ordersPerPage)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery, dateFilter, clientFilter, priorityFilter, referenceFilter])

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Update active filters
  useEffect(() => {
    const filters = []

    if (statusFilter !== "all") filters.push("status")
    if (searchQuery) filters.push("search")
    if (dateFilter) filters.push("date")
    if (clientFilter) filters.push("client")
    if (priorityFilter) filters.push("priority")
    if (referenceFilter) filters.push("reference")

    setActiveFilters(filters)
  }, [statusFilter, searchQuery, dateFilter, clientFilter, priorityFilter, referenceFilter])

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("all")
    setSearchQuery("")
    setDateFilter(undefined)
    setClientFilter("")
    setPriorityFilter(undefined)
    setReferenceFilter("")
  }

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsOrderSummaryOpen(true)
  }

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsTrackOrderOpen(true)
  }

  const handleApproveOrder = (orderId: string) => {
    setOrderToAction(orderId)
    setIsApproveDialogOpen(true)
  }

  const handleRejectOrder = (orderId: string) => {
    rejectOrder(orderId)
  }

  const handleCancelOrder = (orderId: string) => {
    setOrderToAction(orderId)
    setIsCancelDialogOpen(true)
  }

  const confirmApproval = () => {
    if (orderToAction) {
      const saleOrder = orders.find(item => item.id === orderToAction)
      if (!saleOrder) {
        alert("Sale order not found")
        return;
      }
      const logisticsPayload = {
        vehicleId: "",
        driverId: "",
        contactNumber: "",
        deliveryAddress: "",
        deliveryNote: "",
        status: "ready",
        clientId: saleOrder.clientId,
        orderId: orderToAction,
        products: JSON.stringify(saleOrder.products.map(i => ({
          allocatedQuantity: i?.allocated || 0,
          dispatchQuantity: i?.dispatched || 0,
          sku: i.sku,
          totatOrderQuantity: i.cases
        } as LogisticsProduct)))
      }

      const logisticsInstance = new DataByTableName("v1_logistics");
      approveOrder(orderToAction)
        .then(() => {
          return logisticsInstance.post(logisticsPayload)
        }).then(() => {
          setOrderToAction(null)
          refetchContext()

        })
    }
  }

  const confirmCancellation = () => {
    if (orderToAction && cancelOrder) {
      cancelOrder(orderToAction).then(() => {
        setOrderToAction(null)
        refetchContext()
      })
    }
  }

  const handleEditOrder = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsEditOrderOpen(true)
  }

  // Get the selected order
  const selectedOrder = selectedOrderId ? getOrderById(selectedOrderId) : null

  const referenceNameMapper = useMemo(() => {
    return Object.values(referenceMapper).flat().reduce((acc: Record<string, string>, curr) => {
      if (!acc[curr.referenceId]) {
        acc[curr.referenceId] = curr.name
      }
      return acc;
    }, {})
  }, [referenceMapper])

  return (
    <div className="space-y-4 bg-white dark:bg-[#0f1729] rounded-lg p-4 shadow-sm dark:text-gray-100">
      {/* Search bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by ID, customer, reference or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 h-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="partial_fulfillment">Partial Fulfillment</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-muted" : ""}
          >
            <Filter className="h-4 w-4" />
            <span className="sr-only">Toggle filters</span>
          </Button>
        </div>
      </div>

      {/* Filter toggle button */}
      {showFilters && (
        <div className="bg-muted/30 p-6 rounded-lg border mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Order Date filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Order Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-background">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Client Name filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Client Name</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-8 bg-background"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Priority filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value || undefined)}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Reference</label>
            <Input
              placeholder="Search reference..."
              value={referenceFilter}
              onChange={(e) => setReferenceFilter(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
      )}

      {/* Active filters indicator */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {statusFilter !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {statusFilter.replace("_", " ")}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setStatusFilter("all")} />
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {searchQuery}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {dateFilter && (
              <Badge variant="outline" className="flex items-center gap-1">
                Date: {format(dateFilter, "PP")}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setDateFilter(undefined)} />
              </Badge>
            )}
            {clientFilter && (
              <Badge variant="outline" className="flex items-center gap-1">
                Client: {clientFilter}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setClientFilter("")} />
              </Badge>
            )}
            {priorityFilter && (
              <Badge variant="outline" className="flex items-center gap-1">
                Priority: {priorityFilter}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setPriorityFilter(undefined)} />
              </Badge>
            )}
            {referenceFilter && (
              <Badge variant="outline" className="flex items-center gap-1">
                Reference: {referenceFilter}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setReferenceFilter("")} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 px-2 text-xs">
              Clear all
            </Button>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing{" "}
        {filtered.length > ordersPerPage
          ? `${indexOfFirstOrder + 1}-${Math.min(indexOfLastOrder, filtered.length)} of `
          : ""}
        {filtered.length} orders
      </div>

      {/* Table */}
      <div className="w-full overflow-auto border rounded-lg shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-medium">Order Date</TableHead>
              <TableHead className="font-medium">Order ID</TableHead>
              <TableHead className="font-medium">Client Name</TableHead>
              <TableHead className="font-medium">Reference</TableHead>
              <TableHead className="font-medium">Delivery Date</TableHead>
              <TableHead className="font-medium">Priority</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-3">{convertDate(order?.orderDate)}</TableCell>
                  <TableCell className="font-medium text-primary">{order?.id || ""}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.isEmployeeChecked ? `Emp-${order.employeeReferenceId}` : order.reference}</TableCell>
                  <TableCell>{convertDate(order.deliveryDate)}</TableCell>
                  <TableCell>
                    <PriorityIndicator priority={order.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {order.status === "pending_approval" ? (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleApproveOrder(order.id)}
                                  className="h-8 w-8 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">Approve order</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Approve order</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleRejectOrder(order.id)}
                                  className="h-8 w-8 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Reject order</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Reject order</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEditOrder(order.id)}
                                  className="h-8 w-8 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit order</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit order</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleViewOrder(order.id)}
                                  className="h-8 w-8 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 dark:border-primary/30 dark:bg-primary/10"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View order</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View order details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      ) : (
                        <div className="flex space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleViewOrder(order.id)}
                                  className="h-8 w-8 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 dark:border-primary/30 dark:bg-primary/10"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View order</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View order details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleTrackOrder(order.id)}
                                  className="h-8 w-8 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 dark:border-primary/30 dark:bg-primary/10"
                                >
                                  <ArrowUpRight className="h-4 w-4" />
                                  <span className="sr-only">Track order</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Track order</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                      {/* Add Cancel button for orders that are not cancelled, pending approval, or delivered */}
                      {order.status !== "cancelled" &&
                        order.status !== "pending_approval" &&
                        order.status !== "delivered" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="h-8 w-8 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                >
                                  <Ban className="h-4 w-4" />
                                  <span className="sr-only">Cancel order</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Cancel order</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-muted-foreground">
                  {activeFilters.length > 0 ? (
                    <div className="flex flex-col items-center gap-2">
                      <p>No orders match your filters</p>
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    "No orders found"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {filtered.length > 0 ? indexOfFirstOrder + 1 : 0} to {Math.min(indexOfLastOrder, filtered.length)} of{" "}
          {filtered.length} orders
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || filtered.length === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
            // Show pages around current page
            let pageNum = 1
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                disabled={filtered.length === 0}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            )
          })}
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={filtered.length === 0}
                className="h-8 w-8 p-0"
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || filtered.length === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      {selectedOrder && (
        <>
          <OrderSummaryDialog open={isOrderSummaryOpen} onOpenChange={setIsOrderSummaryOpen} order={selectedOrder} />
          <TrackOrderDialog open={isTrackOrderOpen} onOpenChange={setIsTrackOrderOpen} order={selectedOrder} />
          <EditOrderDialog open={isEditOrderOpen} onOpenChange={setIsEditOrderOpen} order={selectedOrder} />
        </>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        title="Approve Order"
        description="Are you sure you want to approve this order? This action cannot be undone."
        confirmLabel="Approve"
        onConfirm={confirmApproval}
      />

      <ConfirmationDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Cancel Order"
        variant="destructive"
        onConfirm={confirmCancellation}
      />
    </div>
  )
}
