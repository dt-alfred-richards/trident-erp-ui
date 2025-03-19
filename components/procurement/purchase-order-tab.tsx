"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, FileText, CalendarIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { GoodsReceivedDialog } from "./goods-received-dialog"
import { PurchaseOrderViewDialog } from "./purchase-order-view-dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

interface PurchaseOrderTabProps {
  onNewOrder?: () => void
}

export function PurchaseOrderTab({ onNewOrder }: PurchaseOrderTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedPO, setSelectedPO] = useState<string>("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  // Mock data for purchase orders with simplified statuses
  const purchaseOrders = [
    {
      id: "PO-001",
      supplier: "PlastiCorp Inc.",
      material: "Plastic Resin",
      quantity: 500,
      unit: "kg",
      orderDate: "2023-06-01",
      expectedDelivery: "2023-06-08",
      status: "pending",
      totalValue: 2500,
    },
    {
      id: "PO-002",
      supplier: "CapMakers Ltd.",
      material: "Bottle Caps",
      quantity: 10000,
      unit: "pcs",
      orderDate: "2023-06-02",
      expectedDelivery: "2023-06-09",
      status: "partial",
      received: 5000,
      totalValue: 1000,
    },
    {
      id: "PO-003",
      supplier: "Adhesive Solutions",
      material: "Label Adhesive",
      quantity: 100,
      unit: "liters",
      orderDate: "2023-06-03",
      expectedDelivery: "2023-06-10",
      status: "pending", // Changed from shipped to pending
      totalValue: 1500,
    },
    {
      id: "PO-004",
      supplier: "Packaging Experts",
      material: "Cardboard Boxes",
      quantity: 1000,
      unit: "pcs",
      orderDate: "2023-05-28",
      expectedDelivery: "2023-06-05",
      status: "completed",
      totalValue: 800,
    },
    {
      id: "PO-005",
      supplier: "Label Masters",
      material: "Product Labels",
      quantity: 5000,
      unit: "sheets",
      orderDate: "2023-05-30",
      expectedDelivery: "2023-06-07",
      status: "cancelled",
      totalValue: 1200,
    },
  ]

  const getStatusBadge = (status: string, received?: number, quantity?: number) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Pending
          </Badge>
        )
      case "partial":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Partial {received && quantity ? `(${received}/${quantity})` : ""}
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Filter purchase orders based on search query and status filter
  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.material.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(po.status)

    const orderDate = new Date(po.orderDate)
    const matchesDate =
      !dateRange?.from || (orderDate >= dateRange.from && (!dateRange.to || orderDate <= dateRange.to))

    return matchesSearch && matchesStatus && matchesDate
  })

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleReceiveClick = (poId: string) => {
    setSelectedPO(poId)
    setReceiveDialogOpen(true)
  }

  const handleViewClick = (poId: string) => {
    setSelectedPO(poId)
    setViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Purchase Orders</h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className={cn("relative", dateRange && "bg-muted")}>
                <CalendarIcon className="h-4 w-4" />
                {dateRange && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar initialFocus mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Filter className="h-4 w-4" />
                {statusFilter.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter By Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("pending")}
                onCheckedChange={() => toggleStatusFilter("pending")}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("partial")}
                onCheckedChange={() => toggleStatusFilter("partial")}
              >
                Partially Received
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("completed")}
                onCheckedChange={() => toggleStatusFilter("completed")}
              >
                Completed
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter.includes("cancelled")}
                onCheckedChange={() => toggleStatusFilter("cancelled")}
              >
                Cancelled
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter([])}>Clear Filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">PO #</TableHead>
                  <TableHead>Supplier / Material</TableHead>
                  <TableHead className="hidden md:table-cell">Order Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No purchase orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{po.supplier}</span>
                          <span className="text-xs text-muted-foreground">
                            {po.material} ({po.quantity} {po.unit})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{po.orderDate}</TableCell>
                      <TableCell>{getStatusBadge(po.status, po.received, po.quantity)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(po.status === "pending" || po.status === "partial") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => handleReceiveClick(po.id)}
                            >
                              Receive
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewClick(po.id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {(statusFilter.length > 0 || dateRange?.from) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Filtered by:</span>
          {statusFilter.map((status) => (
            <Badge key={status} variant="secondary" className="capitalize">
              {status}
              <button className="ml-1 text-xs" onClick={() => toggleStatusFilter(status)}>
                ×
              </button>
            </Badge>
          ))}
          {dateRange?.from && (
            <Badge variant="secondary">
              Date: {format(dateRange.from, "PP")}
              {dateRange.to ? ` - ${format(dateRange.to, "PP")}` : ""}
              <button className="ml-1 text-xs" onClick={() => setDateRange({ from: undefined, to: undefined })}>
                ×
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              setStatusFilter([])
              setDateRange({ from: undefined, to: undefined })
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {receiveDialogOpen && (
        <GoodsReceivedDialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen} poNumber={selectedPO} />
      )}

      {viewDialogOpen && (
        <PurchaseOrderViewDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} poId={selectedPO} />
      )}
    </div>
  )
}

