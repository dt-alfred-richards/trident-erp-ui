"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Calendar,
  ArrowRight,
  Package,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  Filter,
  Truck,
  Users,
  ChevronDown,
} from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useOrders } from "@/contexts/order-context"
import { Order } from "@/types/order"
import { convertDate, getChildObject } from "../generic"
import { useInventory } from "@/app/inventory-context"
interface AllocationOrder {
  id: string
  customer: string
  dueDate: string
  priority: string
  status: string
  products: OrderProduct[]
}
interface OrderProduct {
  id: string
  name: string
  sku: string
  quantity: number
  allocated?: number
}

interface AllocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAllocate: (orderId: string, products: { id: string; quantity: number }[]) => void
  initialSku?: string | null
}

// Create a persistent mock data store
const STORAGE_KEY = "allocation-dialog-orders"

// Helper function to save orders to storage
const saveOrders = (orders: Order[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  } catch (error) {
    console.error("Error saving orders to localStorage:", error)
  }
}

export function AllocationDialog({ open, onOpenChange, onAllocate, initialSku = null }: AllocationDialogProps) {
  const { orders: saleOrders, refetchContext } = useOrders()
  const { updateSaleAllocation, refetchContext: inventoryRefetch } = useInventory()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<"sku" | "order" | "customer">("order")
  const [orders, setOrders] = useState<AllocationOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<AllocationOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<AllocationOrder | null>(null)
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const { toast } = useToast()

  const data = useMemo(() => {
    return saleOrders?.map((item) => ({
      id: item.id,
      customer: item.customer,
      dueDate: item.deliveryDate ? convertDate(item.deliveryDate) : "",
      priority: item.priority,
      status: item.status,
      products: item.products.map(item => ({
        ...item, quantity: item.cases, reserved: parseInt(getChildObject(item, "allocated", 0))
      }))
    }))
  }, [saleOrders])

  // Load orders from storage when component mounts
  useEffect(() => {
    const savedOrders = data
    setOrders(savedOrders)
  }, [data])

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("")
      setSelectedOrder(null)
      setAllocations({})
      setPriorityFilter("all")
      setSearchType("order")
    } else if (initialSku) {
      setSearchTerm(initialSku)
      setSearchType("sku")
    }
  }, [open, initialSku])

  // Filter orders based on search term and type
  useEffect(() => {
    let filtered = [...orders]

    // Apply search filter
    if (searchTerm) {
      if (searchType === "sku") {
        filtered = orders.filter((order) =>
          order.products.some(
            (product) =>
              product.sku.toLowerCase().includes(searchTerm.toLowerCase()) && getRemainingQuantity(product) > 0,
          ),
        )
      } else if (searchType === "order") {
        filtered = orders.filter((order) => order.id.toLowerCase().includes(searchTerm.toLowerCase()))
      } else if (searchType === "customer") {
        filtered = orders.filter((order) => order.customer.toLowerCase().includes(searchTerm.toLowerCase()))
      }
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((order) => order.priority === priorityFilter)
    }
    console.log({ filtered, saleOrders, searchTerm })
    setFilteredOrders(filtered)
  }, [searchTerm, searchType, orders, priorityFilter])

  // Handle order selection
  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order)

    // Initialize allocations with zeros
    const initialAllocations: Record<string, number> = {}
    order.products.forEach((product) => {
      initialAllocations[product.id] = 0
    })
    setAllocations(initialAllocations)
  }

  // Calculate remaining quantity for a product
  const getRemainingQuantity = (product: OrderProduct) => {
    return product.quantity - (product.allocated || 0)
  }

  // Handle allocation input change
  const handleAllocationChange = (productId: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setAllocations((prev) => ({
      ...prev,
      [productId]: numValue,
    }))
  }

  const products = useMemo(() => {
    return saleOrders.flatMap(item => item.products)
  }, [saleOrders])
  // Handle allocation submission
  const handleSubmitAllocation = () => {
    if (!selectedOrder || !updateSaleAllocation || !inventoryRefetch) return

    Promise.allSettled(Object.entries(allocations).map(([key, value]) => (
      updateSaleAllocation({ allocated: value }, key, selectedOrder)
    ))).then(() => {
      onOpenChange(false)
      refetchContext();
      inventoryRefetch()
    })
  }
  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge variant="destructive" className="ml-2">
            Urgent
          </Badge>
        )
      case "high":
      case "high-value":
        return (
          <Badge variant="default" className="bg-amber-500 ml-2">
            High-Value
          </Badge>
        )
      case "standard":
        return (
          <Badge variant="outline" className="ml-2">
            Standard
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="ml-2">
            Unknown
          </Badge>
        )
    }
  }

  // Calculate allocation progress percentage
  const getAllocationProgress = (product: OrderProduct) => {
    const currentAllocated = (product.allocated || 0) + (allocations[product.id] || 0)
    return Math.round((currentAllocated / product.quantity) * 100)
  }

  // Get allocation status color
  const getAllocationStatusColor = (progress: number) => {
    if (progress === 100) return "bg-green-500"
    if (progress > 50) return "bg-amber-500"
    return "bg-blue-500"
  }

  // Filter products by SKU if in SKU search mode
  const getFilteredProducts = (products: OrderProduct[]) => {
    if (searchType === "sku" && searchTerm) {
      return products.filter(
        (product) => product.sku.toLowerCase().includes(searchTerm.toLowerCase()) && getRemainingQuantity(product) > 0,
      )
    }
    return products.filter((product) => getRemainingQuantity(product) > 0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">
            {selectedOrder ? (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 mr-2 -ml-2"
                  onClick={() => setSelectedOrder(null)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                Allocate Stock to Order
              </div>
            ) : (
              "Allocate Stock to Order"
            )}
          </DialogTitle>
          <DialogDescription>
            {selectedOrder
              ? `Allocating stock for order ${selectedOrder.id} - ${selectedOrder.customer}`
              : "Search for an order by ID, customer name, or SKU to allocate stock."}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-hidden flex flex-col">
          {!selectedOrder ? (
            <div className="p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
              {/* Search Type Selector */}
              <div className="flex flex-col space-y-2">
                <Label>Search by</Label>
                <RadioGroup
                  defaultValue={searchType}
                  className="flex space-x-4"
                  onValueChange={(value) => setSearchType(value as "sku" | "order" | "customer")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="order" id="search-order" />
                    <Label htmlFor="search-order" className="flex items-center">
                      <Package className="h-4 w-4 mr-1" /> Order ID
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="search-customer" />
                    <Label htmlFor="search-customer" className="flex items-center">
                      <Users className="h-4 w-4 mr-1" /> Customer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sku" id="search-sku" />
                    <Label htmlFor="search-sku" className="flex items-center">
                      <Truck className="h-4 w-4 mr-1" /> SKU
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`Search by ${searchType === "order" ? "Order ID" : searchType === "customer" ? "Customer Name" : "SKU"}...`}
                    className="pl-9 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by priority" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high-value">High Value</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scroll indicator */}
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <ChevronDown className="h-4 w-4 animate-bounce" />
                <span className="ml-1">Scroll to see more orders</span>
              </div>

              {/* Order list with enhanced scrolling */}
              <div className="flex-1 min-h-0 border rounded-md">
                <ScrollArea className="h-[350px] rounded-md">
                  <div className="p-4 space-y-3">
                    {
                      filteredOrders
                        .map((order) => {
                          // For SKU search, only show orders with matching products that have remaining quantity
                          const filteredProducts = getFilteredProducts(order.products)
                          if (searchType === "sku" && filteredProducts.length === 0) return null

                          return (
                            <Card
                              key={order.id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handleOrderSelect(order)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="space-y-1">
                                    <div className="font-medium flex items-center">
                                      {order.id} {getPriorityBadge(order.priority)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{order.customer}</div>
                                    <div className="text-xs flex items-center text-muted-foreground">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Due: {new Date(order.dueDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                </div>

                                {/* Show matching products when searching by SKU */}
                                {searchType === "sku" && (
                                  <div className="mt-2 pt-2 border-t">
                                    <div className="text-xs text-muted-foreground mb-1">Matching Products:</div>
                                    <div className="flex flex-wrap gap-2">
                                      {filteredProducts.map((product) => (
                                        <Badge key={product.id} variant="outline" className="flex items-center gap-1">
                                          {product.sku}
                                          <span className="text-xs">({getRemainingQuantity(product)} needed)</span>
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })
                        .filter(Boolean)
                    }
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{selectedOrder.id}</h3>
                      <p className="text-sm text-muted-foreground">{selectedOrder.customer}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      selectedOrder.priority === "urgent"
                        ? "destructive"
                        : selectedOrder.priority === "high-value"
                          ? "default"
                          : "outline"
                    }
                    className={selectedOrder.priority === "high-value" ? "bg-amber-500" : ""}
                  >
                    {selectedOrder.priority.replace("-", " ")}
                  </Badge>
                </div>
              </div>

              {/* Scroll indicator for products */}
              <div className="flex items-center justify-center text-xs text-muted-foreground pt-2">
                <ChevronDown className="h-4 w-4 animate-bounce" />
                <span className="ml-1">Scroll to see all products</span>
              </div>

              {/* Products with enhanced scrolling */}
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-6 space-y-6">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                      Products to Allocate
                    </h4>

                    <div className="grid gap-4">
                      {/* Filter products based on search type and term */}
                      {getFilteredProducts(selectedOrder.products).map((product) => {
                        const remaining = getRemainingQuantity(product)
                        const isFullyAllocated = remaining === 0
                        const progress = getAllocationProgress(product)

                        return (
                          <Card
                            key={product.id}
                            className={isFullyAllocated ? "border-green-200 bg-green-50/30 dark:bg-green-900/10" : ""}
                          >
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">
                                  {product.name}
                                  <span className="text-muted-foreground ml-1">({product.sku})</span>
                                </div>
                                {isFullyAllocated ? (
                                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Fully Allocated
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                    {remaining} remaining
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>

                            <CardContent className="p-4 pt-0 pb-2">
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Allocation Progress</span>
                                  <span className="font-medium">{progress}%</span>
                                </div>

                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${getAllocationStatusColor(progress)} transition-all duration-300`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="text-center p-1 bg-muted/50 rounded">
                                    <div className="text-muted-foreground">Ordered</div>
                                    <div className="font-medium">{product.quantity}</div>
                                  </div>
                                  <div className="text-center p-1 bg-muted/50 rounded">
                                    <div className="text-muted-foreground">Allocated</div>
                                    <div className="font-medium">
                                      {parseInt(getChildObject(product, "allocated", 0)) + parseInt(getChildObject(allocations, product.id, 0))}
                                    </div>
                                  </div>
                                  <div className="text-center p-1 bg-muted/50 rounded">
                                    <div className="text-muted-foreground">Remaining</div>
                                    <div className="font-medium">{remaining - (allocations[product.id] || 0)}</div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>

                            <CardFooter className="p-4 pt-2">
                              <div className="flex items-center gap-2 w-full">
                                <div className="relative flex-1">
                                  <Input
                                    id={`product-${product.id}`}
                                    type="number"
                                    min="0"
                                    max={remaining}
                                    value={allocations[product.id] || ""}
                                    onChange={(e) => handleAllocationChange(product.id, e.target.value)}
                                    className="w-full pr-16"
                                    disabled={isFullyAllocated}
                                    placeholder="Enter quantity"
                                  />
                                  {allocations[product.id] > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute right-10 top-0 h-full"
                                      onClick={() => handleAllocationChange(product.id, "0")}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAllocationChange(product.id, remaining.toString())}
                                  disabled={isFullyAllocated}
                                  className="whitespace-nowrap"
                                >
                                  Max ({remaining})
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="p-4">
          {selectedOrder ? (
            <div className="w-full flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">{Object.values(allocations).reduce((sum, qty) => sum + qty, 0)}</span>{" "}
                units to allocate
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitAllocation}
                  disabled={Object.values(allocations).every((qty) => qty === 0)}
                  className="bg-[#43ced7] text-white hover:bg-[#36b0b8]"
                >
                  Allocate Stock
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
