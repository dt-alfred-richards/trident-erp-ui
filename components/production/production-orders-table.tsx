"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, CheckCircle, BarChart2, Eye, Search, Filter, X, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ProductionOrder } from "@/types/production"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { format, isWithinInterval } from "date-fns"
import { cn } from "@/lib/utils"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

interface ProductionOrdersTableProps {
  orders: ProductionOrder[]
  onUpdateProgress: (orderId: string, progress: number) => void
  onViewDetails: (orderId: string) => void
}

type OrderStatus = "all" | "completed" | "in-progress" | "overdue" | "urgent"

export function ProductionOrdersTable({ orders, onUpdateProgress, onViewDetails }: ProductionOrdersTableProps) {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [unitsCompleted, setUnitsCompleted] = useState<number>(0)
  const [initialUnitsCompleted, setInitialUnitsCompleted] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [filteredOrders, setFilteredOrders] = useState<ProductionOrder[]>(orders)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10)

  const selectedOrder = orders.find((order) => order.id === selectedOrderId)

  // Calculate remaining units
  const totalUnits = selectedOrder?.quantity || 0
  const remainingUnits = totalUnits - unitsCompleted

  // Calculate progress percentage
  const progressPercentage = totalUnits > 0 ? Math.round((unitsCompleted / totalUnits) * 100) : 0

  // Apply filters whenever filter states change
  useEffect(() => {
    let result = [...orders]

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (order) =>
          order.sku.toLowerCase().includes(query) ||
          order.assignedTo.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => {
        const daysLeft = Math.ceil((new Date(order.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

        switch (statusFilter) {
          case "completed":
            return order.progress === 100
          case "in-progress":
            return order.progress < 100 && daysLeft >= 0 && daysLeft > 2
          case "overdue":
            return order.progress < 100 && daysLeft < 0
          case "urgent":
            return order.progress < 100 && daysLeft >= 0 && daysLeft <= 2
          default:
            return true
        }
      })
    }

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      result = result.filter((order) => {
        const orderDate = new Date(order.startDate)
        return isWithinInterval(orderDate, {
          start: dateRange.from,
          end: dateRange.to,
        })
      })
    }

    setFilteredOrders(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [orders, searchQuery, statusFilter, dateRange])

  useEffect(() => {
    if (selectedOrder) {
      // Initialize units completed based on current progress
      const initialUnits = Math.round((selectedOrder.progress / 100) * selectedOrder.quantity)
      setUnitsCompleted(initialUnits)
      setInitialUnitsCompleted(initialUnits)
      setError(null)
    }
  }, [selectedOrder])

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const paginatedOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  const handleOpenUpdateDialog = (order: ProductionOrder) => {
    setSelectedOrderId(order.id)
    setError(null)
    setUpdateDialogOpen(true)
  }

  const handleUnitsChange = (value: string) => {
    const units = Number.parseInt(value, 10) || 0

    if (selectedOrder) {
      // Prevent decreasing progress
      if (units < initialUnitsCompleted) {
        setError(`Cannot decrease progress. Previous completed units: ${initialUnitsCompleted.toLocaleString()}`)
        setUnitsCompleted(initialUnitsCompleted)
        return
      }

      if (units > selectedOrder.quantity) {
        setError(`Cannot exceed order quantity of ${selectedOrder.quantity.toLocaleString()} units`)
        setUnitsCompleted(selectedOrder.quantity)
      } else if (units < 0) {
        setError("Units completed cannot be negative")
        setUnitsCompleted(0)
      } else {
        setError(null)
        setUnitsCompleted(units)
      }
    }
  }

  const handleSaveProgress = () => {
    if (selectedOrderId && selectedOrder && !error) {
      // Only allow progress to increase
      if (progressPercentage < selectedOrder.progress) {
        setError("Cannot decrease progress from previous value")
        return
      }

      // Convert units to percentage
      onUpdateProgress(selectedOrderId, progressPercentage)
      setUpdateDialogOpen(false)
    }
  }

  const getStatusBadge = (order: ProductionOrder) => {
    const daysLeft = Math.ceil((new Date(order.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    if (order.progress === 100) {
      return <Badge className="bg-green-500">Completed</Badge>
    } else if (daysLeft < 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Overdue
        </Badge>
      )
    } else if (daysLeft <= 2) {
      return (
        <Badge variant="warning" className="flex items-center gap-1 bg-amber-500">
          <Clock className="h-3 w-3" />
          Urgent
        </Badge>
      )
    } else {
      return <Badge variant="outline">In Progress</Badge>
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setDateRange(undefined)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Production Orders</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Completed: {orders.filter((o) => o.progress === 100).length}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-500" />
            In Progress: {orders.filter((o) => o.progress < 100).length}
          </Badge>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-card rounded-lg border shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SKU, ID or assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus)}>
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters & Reset */}
        {(searchQuery || statusFilter !== "all" || dateRange?.from) && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter.replace("-", " ")}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => setStatusFilter("all")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              {dateRange?.from && dateRange?.to && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 p-0"
                    onClick={() => setDateRange(undefined)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}

              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={resetFilters}>
                Reset all
              </Button>
            </div>
          </div>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg border border-dashed">
          <div className="rounded-full bg-muted/50 p-3 mb-3">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No matching orders found</h3>
          <p className="text-muted-foreground mt-1 mb-4 max-w-md">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="w-full overflow-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.sku}</TableCell>
                  <TableCell>{order.quantity.toLocaleString()}</TableCell>
                  <TableCell>{new Date(order.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(order.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>{order.assignedTo}</TableCell>
                  <TableCell className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <Progress value={order.progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium w-9">{order.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenUpdateDialog(order)}
                        disabled={order.progress === 100}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 transition-colors"
                      >
                        <BarChart2 className="h-4 w-4 mr-1 text-blue-600" />
                        Update
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => onViewDetails(order.id)} title="View Details">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <DataTablePagination
        totalItems={filteredOrders.length}
        itemsPerPage={ordersPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Progress Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Production Progress</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <>
                  Update production units for <span className="font-medium">{selectedOrder.sku}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              {selectedOrder && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Order Quantity</p>
                    <p className="text-lg font-semibold">{selectedOrder.quantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Progress</p>
                    <p className="text-lg font-semibold">{selectedOrder.progress}%</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="units-completed" className="text-sm font-medium">
                  Units Completed
                </label>
                <Input
                  id="units-completed"
                  type="number"
                  value={unitsCompleted}
                  onChange={(e) => handleUnitsChange(e.target.value)}
                  min={initialUnitsCompleted}
                  max={selectedOrder?.quantity}
                  className="w-full"
                />
                {initialUnitsCompleted > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Previous completed units: {initialUnitsCompleted.toLocaleString()}
                  </p>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md">
                <div>
                  <p className="text-sm font-medium">Remaining Units</p>
                  <p className="text-lg font-semibold text-amber-600">{remainingUnits.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">New Progress</p>
                  <p className="text-lg font-semibold text-blue-600">{progressPercentage}%</p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProgress}
              disabled={!!error || (selectedOrder && progressPercentage <= selectedOrder.progress)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              Save Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
