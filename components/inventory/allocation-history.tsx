"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Download, Search, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { useInventory } from "@/app/inventory-context"
import { getChildObject } from "../generic"
import { useOrders } from "@/contexts/order-context"

interface AllocationHistoryProps {
  allocationHistory?: {
    id: string
    timestamp: string
    orderId: string
    customer: string
    sku: string
    allocated: number
  }[]
}

export function AllocationHistory({ allocationHistory: propAllocationHistory }: AllocationHistoryProps) {
  const [startDate, setStartDate] = useState<Date>()
  const { allocations = [] } = useInventory()
  const { clientMapper } = useOrders();
  const [endDate, setEndDate] = useState<Date>()
  const [filterSku, setFilterSku] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [displayHistory, setDisplayHistory] = useState<any[]>([])
  const [newAllocations, setNewAllocations] = useState<string[]>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Function to clear all filters
  const clearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setFilterSku("all")
    setSearchQuery("")
  }

  // Check if any filters are active
  const hasActiveFilters = startDate || endDate || filterSku !== "all" || searchQuery

  const defaultAllocationHistory = useMemo(() => {
    return allocations.map(item => ({
      id: getChildObject(item, "allocationId", ""),
      timestamp: getChildObject(item, "createdOn", getChildObject(item, "modifiedOn", "")),
      orderId: getChildObject(item, "orderId", ""),
      customer: clientMapper[getChildObject(item, "createdBy", getChildObject(item, "modifiedBy", ""))]?.name || '',
      sku: getChildObject(item, "sku", ""),
      allocated: getChildObject(item, "allocated", 0)
    }))
  }, [allocations])

  console.log({ defaultAllocationHistory, allocations })

  // Update display history when prop history changes
  useEffect(() => {
    if (propAllocationHistory) {
      setDisplayHistory(propAllocationHistory)

      // Check for new allocations (those not in the default history)
      const defaultIds = new Set(defaultAllocationHistory.map((item) => item.id))
      const newIds = propAllocationHistory.filter((item) => !defaultIds.has(item.id)).map((item) => item.id)

      setNewAllocations(newIds)
    } else {
      setDisplayHistory(defaultAllocationHistory)
    }
  }, [propAllocationHistory])

  // Filter history based on date range, SKU, and search query
  const filteredHistory = displayHistory.filter((item) => {
    const itemDate = new Date(item.timestamp)
    const matchesDateRange = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate)
    const matchesSku = filterSku === "all" || item.sku === filterSku

    const matchesSearch =
      !searchQuery ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesDateRange && matchesSku && matchesSearch
  })

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Get unique SKUs for filter dropdown
  const uniqueSkus = Array.from(new Set(displayHistory.map((item) => item.sku)))

  // Check if an allocation is new (added in this session)
  const isNewAllocation = (id: string) => {
    return newAllocations.includes(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="space-y-2">
          <Label htmlFor="date-range-start">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date-range-start" variant={"outline"} className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-range-end">End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date-range-end" variant={"outline"} className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-sku">SKU</Label>
          <Select value={filterSku} onValueChange={setFilterSku}>
            <SelectTrigger id="filter-sku" className="w-full">
              <SelectValue placeholder="Filter by SKU" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SKUs</SelectItem>
              {uniqueSkus.map((sku) => (
                <SelectItem key={sku} value={sku}>
                  {sku}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-1">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by order ID or customer"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="space-y-2 self-end">
            <Label className="opacity-0">Clear</Label>
            <Button variant="outline" onClick={clearFilters} className="flex items-center">
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          Allocation History
          {hasActiveFilters && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({filteredHistory.length} of {displayHistory.length} records)
            </span>
          )}
        </h3>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Allocated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No allocation records found
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item) => (
                <TableRow key={item.id} className={isNewAllocation(item.id) ? "bg-green-50 dark:bg-green-900/10" : ""}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleString()}
                    {isNewAllocation(item.id) && (
                      <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-200">
                        New
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.orderId}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell className="text-right">{item.allocated.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        totalItems={filteredHistory.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
