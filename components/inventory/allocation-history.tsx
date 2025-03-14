"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Download, Search } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

export function AllocationHistory() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [filterSku, setFilterSku] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // This would come from your API in a real application
  const allocationHistory = [
    {
      id: "ALLOC-001",
      timestamp: "2023-10-12T10:15:00",
      user: "John Smith",
      orderId: "SO-1003",
      customer: "Urgent Pharma",
      sku: "500ml",
      allocated: 200,
      requested: 200,
      status: "complete",
      reason: "Urgent request from Pharma customer",
    },
    {
      id: "ALLOC-002",
      timestamp: "2023-10-12T10:20:00",
      user: "John Smith",
      orderId: "SO-1001",
      customer: "ABC Corp",
      sku: "500ml",
      allocated: 300,
      requested: 300,
      status: "complete",
      reason: "High-value customer",
    },
    {
      id: "ALLOC-003",
      timestamp: "2023-10-12T10:25:00",
      user: "John Smith",
      orderId: "SO-1002",
      customer: "XYZ Retail",
      sku: "500ml",
      allocated: 300,
      requested: 300,
      status: "complete",
      reason: "Standard allocation",
    },
    {
      id: "ALLOC-004",
      timestamp: "2023-10-13T09:30:00",
      user: "Sarah Johnson",
      orderId: "SO-1005",
      customer: "Premium Stores",
      sku: "750ml",
      allocated: 400,
      requested: 400,
      status: "complete",
      reason: "High-value customer",
    },
    {
      id: "ALLOC-005",
      timestamp: "2023-10-13T14:45:00",
      user: "Sarah Johnson",
      orderId: "SO-1004",
      customer: "Global Foods",
      sku: "750ml",
      allocated: 600,
      requested: 800,
      status: "partial",
      reason: "Partial allocation due to limited stock",
    },
    {
      id: "ALLOC-006",
      timestamp: "2023-10-14T11:30:00",
      user: "Current User",
      orderId: "SO-1001",
      customer: "ABC Corp",
      sku: "750ml",
      allocated: 150,
      requested: 200,
      status: "partial",
      reason: "Partial allocation for high-value customer",
    },
    {
      id: "ALLOC-007",
      timestamp: "2023-10-14T11:35:00",
      user: "Current User",
      orderId: "SO-1001",
      customer: "ABC Corp",
      sku: "1000ml",
      allocated: 100,
      requested: 100,
      status: "complete",
      reason: "Complete allocation for high-value customer",
    },
    {
      id: "ALLOC-008",
      timestamp: "2023-10-15T09:15:00",
      user: "Michael Brown",
      orderId: "SO-1006",
      customer: "Mega Distributors",
      sku: "500ml",
      allocated: 500,
      requested: 500,
      status: "complete",
      reason: "Strategic partner allocation",
    },
    {
      id: "ALLOC-009",
      timestamp: "2023-10-15T14:20:00",
      user: "Michael Brown",
      orderId: "SO-1007",
      customer: "City Grocers",
      sku: "750ml",
      allocated: 250,
      requested: 400,
      status: "partial",
      reason: "Limited stock availability",
    },
    {
      id: "ALLOC-010",
      timestamp: "2023-10-16T10:45:00",
      user: "Emily Davis",
      orderId: "SO-1008",
      customer: "Health Essentials",
      sku: "1000ml",
      allocated: 300,
      requested: 300,
      status: "complete",
      reason: "Regular customer order",
    },
    {
      id: "ALLOC-011",
      timestamp: "2023-10-16T11:30:00",
      user: "Emily Davis",
      orderId: "SO-1009",
      customer: "Wellness Chain",
      sku: "500ml",
      allocated: 450,
      requested: 450,
      status: "complete",
      reason: "Promotional campaign support",
    },
    {
      id: "ALLOC-012",
      timestamp: "2023-10-17T09:00:00",
      user: "Robert Wilson",
      orderId: "SO-1010",
      customer: "Global Retail",
      sku: "750ml",
      allocated: 350,
      requested: 500,
      status: "partial",
      reason: "Stock constraints due to high demand",
    },
    {
      id: "ALLOC-013",
      timestamp: "2023-10-17T15:15:00",
      user: "Robert Wilson",
      orderId: "SO-1011",
      customer: "Prime Markets",
      sku: "1000ml",
      allocated: 200,
      requested: 200,
      status: "complete",
      reason: "New customer onboarding",
    },
    {
      id: "ALLOC-014",
      timestamp: "2023-10-18T10:30:00",
      user: "Current User",
      orderId: "SO-1012",
      customer: "Regional Stores",
      sku: "500ml",
      allocated: 275,
      requested: 300,
      status: "partial",
      reason: "Partial allocation due to production delay",
    },
  ]

  // Filter history based on date range, SKU, status, and search query
  const filteredHistory = allocationHistory.filter((item) => {
    const itemDate = new Date(item.timestamp)
    const matchesDateRange = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate)
    const matchesSku = filterSku === "all" || item.sku === filterSku
    const matchesStatus = filterStatus === "all" || item.status === filterStatus

    const matchesSearch =
      !searchQuery ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesDateRange && matchesSku && matchesStatus && matchesSearch
  })

  // Get unique SKUs for filter dropdown
  const uniqueSkus = Array.from(new Set(allocationHistory.map((item) => item.sku)))

  // Group allocations by order ID to show order-level status
  const orderAllocations = filteredHistory.reduce(
    (acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = {
          orderId: item.orderId,
          customer: item.customer,
          items: [],
          timestamp: item.timestamp,
        }
      }

      acc[item.orderId].items.push(item)

      // Use the most recent timestamp
      if (new Date(item.timestamp) > new Date(acc[item.orderId].timestamp)) {
        acc[item.orderId].timestamp = item.timestamp
      }

      return acc
    },
    {} as Record<string, { orderId: string; customer: string; items: typeof allocationHistory; timestamp: string }>,
  )

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

        <div className="space-y-2">
          <Label htmlFor="filter-status">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="filter-status" className="w-full">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-1">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by order ID, customer, or reason"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Allocation History</h3>
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
              <TableHead>User</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Allocated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="whitespace-nowrap">{new Date(item.timestamp).toLocaleString()}</TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell className="font-medium">{item.orderId}</TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell className="text-right">
                  {item.allocated.toLocaleString()} / {item.requested.toLocaleString()}
                </TableCell>
                <TableCell>
                  {item.status === "partial" ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Partial
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Complete
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={item.reason}>
                  {item.reason}
                </TableCell>
              </TableRow>
            ))}
            {filteredHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No allocation records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Order Allocation Summary</h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.values(orderAllocations).map((order) => {
                const isFullyAllocated = order.items.every((item) => item.allocated === item.requested)
                const isPartiallyAllocated = !isFullyAllocated && order.items.some((item) => item.allocated > 0)

                return (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{new Date(order.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{order.items.length} product(s)</TableCell>
                    <TableCell>
                      {isFullyAllocated ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Fully Allocated
                        </Badge>
                      ) : isPartiallyAllocated ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Partially Allocated
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Not Allocated
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {Object.keys(orderAllocations).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No order allocation records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

