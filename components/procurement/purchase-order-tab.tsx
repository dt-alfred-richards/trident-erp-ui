"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, FileText, CalendarIcon, XCircle, ClipboardCheck } from "lucide-react"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

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

  // Add new state variables for cancel confirmation and GRN view
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [poToCancel, setPoToCancel] = useState<string>("")
  const [grnViewDialogOpen, setGrnViewDialogOpen] = useState(false)
  const [selectedGrnPo, setSelectedGrnPo] = useState<string>("")

  const { toast } = useToast()

  // Mock data for purchase orders with simplified statuses
  const [purchaseOrders, setPurchaseOrders] = useState([
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
  ])

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

  // Add a new function to handle cancel button click
  const handleCancelClick = (poId: string) => {
    setPoToCancel(poId)
    setCancelDialogOpen(true)
  }

  // Add a new function to handle GRN view button click
  const handleGrnViewClick = (poId: string) => {
    setSelectedGrnPo(poId)
    setGrnViewDialogOpen(true)
  }

  // Add a function to confirm cancellation
  const confirmCancelOrder = () => {
    // Update the purchase orders state with the cancelled order
    setPurchaseOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === poToCancel ? { ...order, status: "cancelled" } : order)),
    )

    // Show success notification
    toast({
      title: "Purchase Order Cancelled",
      description: `Purchase order ${poToCancel} has been cancelled successfully.`,
      variant: "default",
    })

    // Close the dialog
    setCancelDialogOpen(false)
    setPoToCancel("")
  }

  // Function to clear all filters
  const clearAllFilters = () => {
    setStatusFilter([])
    setDateRange({ from: undefined, to: undefined })
    setSearchQuery("")
  }

  // Check if any filters are applied
  const hasFilters = statusFilter.length > 0 || dateRange?.from || searchQuery

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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
              <DropdownMenuItem onClick={() => setStatusFilter([])}>Clear Status Filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Moved filter indicators to top of table */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4 bg-muted/30 p-2 rounded-md">
          <span className="font-medium">Filtered by:</span>
          {searchQuery && (
            <Badge variant="secondary">
              Search: {searchQuery}
              <button className="ml-1 text-xs" onClick={() => setSearchQuery("")}>
                ×
              </button>
            </Badge>
          )}
          {statusFilter.map((status) => (
            <Badge key={status} variant="secondary" className="capitalize">
              Status: {status}
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
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs ml-auto" onClick={clearAllFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">PO #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Order Date</TableHead>
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
                      <TableCell>{po.supplier}</TableCell>
                      <TableCell>
                        {po.material} ({po.quantity} {po.unit})
                      </TableCell>
                      <TableCell>{po.orderDate}</TableCell>
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
                          {po.status === "pending" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => handleCancelClick(po.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Cancel Order</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {(po.status === "completed" || po.status === "partial") && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-500 hover:text-green-700 hover:bg-green-100"
                                    onClick={() => handleGrnViewClick(po.id)}
                                  >
                                    <ClipboardCheck className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View GRN</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleViewClick(po.id)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Order Details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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

      {receiveDialogOpen && (
        <GoodsReceivedDialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen} poNumber={selectedPO} />
      )}

      {viewDialogOpen && (
        <PurchaseOrderViewDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} poId={selectedPO} />
      )}

      {cancelDialogOpen && (
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cancel Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to cancel purchase order <span className="font-medium">{poToCancel}</span>? This
                action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                No, Keep Order
              </Button>
              <Button variant="destructive" onClick={confirmCancelOrder}>
                Yes, Cancel Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {grnViewDialogOpen && (
        <Dialog open={grnViewDialogOpen} onOpenChange={setGrnViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Goods Received Note for PO {selectedGrnPo}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Received</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Quality Check</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Mock GRN data - in a real app, this would be fetched based on the PO */}
                    <TableRow>
                      <TableCell>2023-06-05</TableCell>
                      <TableCell>Plastic Resin</TableCell>
                      <TableCell>250 kg</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Passed
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2023-06-07</TableCell>
                      <TableCell>Plastic Resin</TableCell>
                      <TableCell>250 kg</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Passed
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">
                  Material received in good condition. Quality check performed on samples from both batches.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setGrnViewDialogOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

