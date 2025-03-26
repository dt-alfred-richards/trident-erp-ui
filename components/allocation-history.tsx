"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Download, Search, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

export function AllocationHistory() {
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [filterSku, setFilterSku] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Function to clear all filters
  const clearFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setFilterSku("all")
    setSearchQuery("")
  }

  // Check if any filters are active
  const hasActiveFilters = startDate || endDate || filterSku !== "all" || searchQuery

  // This would come from your API in a real application
  const allocationHistory = [
    {
      id: "ALLOC-001",
      timestamp: "2023-10-12T10:15:00",
      orderId: "SO-1003",
      customer: "Urgent Pharma",
      sku: "500ml",
      allocated: 200,
    },
    {
      id: "ALLOC-002",
      timestamp: "2023-10-12T10:20:00",
      orderId: "SO-1001",
      customer: "ABC Corp",
      sku: "500ml",
      allocated: 300,
    },
    {
      id: "ALLOC-003",
      timestamp: "2023-10-12T10:25:00",
      orderId: "SO-1002",
      customer: "XYZ Retail",
      sku: "500ml",
      allocated: 300,
    },
    {
      id: "ALLOC-004",
      timestamp: "2023-10-13T09:30:00",
      orderId: "SO-1005",
      customer: "Premium Stores",
      sku: "750ml",
      allocated: 400,
    },
    {
      id: "ALLOC-005",
      timestamp: "2023-10-13T14:45:00",
      orderId: "SO-1004",
      customer: "Global Foods",
      sku: "750ml",
      allocated: 600,
    },
    {
      id: "ALLOC-006",
      timestamp: "2023-10-14T11:30:00",
      orderId: "SO-1001",
      customer: "ABC Corp",
      sku: "750ml",
      allocated: 150,
    },
    {
      id: "ALLOC-007",
      timestamp: "2023-10-14T11:35:00",
      orderId: "SO-1001",
      customer: "ABC Corp",
      sku: "1000ml",
      allocated: 100,
    },
    {
      id: "ALLOC-008",
      timestamp: "2023-10-15T09:15:00",
      orderId: "SO-1006",
      customer: "Mega Distributors",
      sku: "500ml",
      allocated: 500,
    },
    {
      id: "ALLOC-009",
      timestamp: "2023-10-15T14:20:00",
      orderId: "SO-1007",
      customer: "City Grocers",
      sku: "750ml",
      allocated: 250,
    },
    {
      id: "ALLOC-010",
      timestamp: "2023-10-16T10:45:00",
      orderId: "SO-1008",
      customer: "Health Essentials",
      sku: "1000ml",
      allocated: 300,
    },
    {
      id: "ALLOC-011",
      timestamp: "2023-10-16T11:30:00",
      orderId: "SO-1009",
      customer: "Wellness Chain",
      sku: "500ml",
      allocated: 450,
    },
    {
      id: "ALLOC-012",
      timestamp: "2023-10-17T09:00:00",
      orderId: "SO-1010",
      customer: "Global Retail",
      sku: "750ml",
      allocated: 350,
    },
    {
      id: "ALLOC-013",
      timestamp: "2023-10-17T15:15:00",
      orderId: "SO-1011",
      customer: "Prime Markets",
      sku: "1000ml",
      allocated: 200,
    },
    {
      id: "ALLOC-014",
      timestamp: "2023-10-18T10:30:00",
      orderId: "SO-1012",
      customer: "Regional Stores",
      sku: "500ml",
      allocated: 275,
    },
  ]

  // Filter history based on date range, SKU, and search query
  const filteredHistory = allocationHistory.filter((item) => {
    const itemDate = new Date(item.timestamp)
    const matchesDateRange = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate)
    const matchesSku = filterSku === "all" || item.sku === filterSku

    const matchesSearch =
      !searchQuery ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesDateRange && matchesSku && matchesSearch
  })

  // Get unique SKUs for filter dropdown
  const uniqueSkus = Array.from(new Set(allocationHistory.map((item) => item.sku)))

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
              ({filteredHistory.length} of {allocationHistory.length} records)
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
            {filteredHistory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="whitespace-nowrap">{new Date(item.timestamp).toLocaleString()}</TableCell>
                <TableCell className="font-medium">{item.orderId}</TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell className="text-right">{item.allocated.toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {filteredHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No allocation records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

