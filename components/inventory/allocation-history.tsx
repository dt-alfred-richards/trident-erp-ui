"use client"

import { FinishedGoodsContext, useFinished } from "@/app/inventory/finished-goods/context"
import { Allocations } from "@/app/inventory/finished-goods/page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useOrders } from "@/contexts/order-context"
import { format } from "date-fns"
import { CalendarIcon, Download, Search } from "lucide-react"
import moment from "moment"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"

export function AllocationHistory() {
  const { orderDetails } = useFinished();
  const { clientInfo, productInfo } = useOrders();
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [filterSku, setFilterSku] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [allocations, setAllocations] = useState<Allocations[]>([])

  useEffect(() => {
    if (orderDetails.length == 0) return
    const _allocations = orderDetails.map((order, index) => ({
      id: index + "",
      timestamp: new Date(order.createdOn ?? "").toLocaleDateString(),
      user: order.clientId,
      orderId: order.orderId ?? "",
      customer: clientInfo[order.clientId]?.name ?? "",
      sku: productInfo[order.productId]?.sku ?? "",
      allocated: order.casesReserved,
      requested: order.cases,
      status: order.status,
      reason: "",
    }))
    setAllocations(_allocations)
  }, [orderDetails, clientInfo, productInfo])
  
  // Filter history based on date range, SKU, status, and search query
  const filteredHistory = useMemo(() => allocations.filter((item) => {
    const itemDate = new Date(item.timestamp)
    const matchesDateRange = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate)
    const matchesSku = filterSku === "all" || item.sku === filterSku
    const matchesStatus = filterStatus === "all" || item.status === filterStatus

    const matchesSearch =
      !searchQuery ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesDateRange && matchesSku && matchesStatus && matchesSearch
  }), [allocations, searchQuery, filterSku])

  // Get unique SKUs for filter dropdown
  const uniqueSkus = Array.from(new Set(allocations.map((item) => item.sku))).filter(item => item)

  // Group allocations by order ID to show order-level status
  const orderAllocations = useMemo(() => filteredHistory.reduce(
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
    {} as Record<string, { orderId: string; customer: string; items: typeof allocations; timestamp: string }>,
  ), [filteredHistory])

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
          <Select value={filterSku ?? ""} onValueChange={setFilterSku}>
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
          <Select value={filterStatus ?? ""} onValueChange={setFilterStatus}>
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
                <TableCell className="whitespace-nowrap">{moment(item.timestamp).format('DD-MM-YYYY')}</TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell className="font-medium">{item.orderId}</TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell className="text-right">
                  {item.allocated.toLocaleString()} / {item.requested.toLocaleString()}
                </TableCell>
                <TableCell>
                  {item.status === "partial_fulfillment" ? (
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
    </div>
  )
}

