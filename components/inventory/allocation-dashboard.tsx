"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Search } from "lucide-react"
import { PartialAllocationDialog } from "@/components/inventory/partial-allocation-dialog"
import { MultiSkuAllocationDialog } from "@/components/inventory/multi-sku-allocation-dialog"
import { cn } from "@/lib/utils"

// Define types for our data structure
interface Product {
  id: string
  sku: string
  name: string
  quantity: number
  allocated?: number
}

interface Order {
  id: string
  customer: string
  dueDate: string
  priority: "urgent" | "high-value" | "standard"
  status: string
  products: Product[]
}

export function AllocationDashboard() {
  // State for orders, allocations, and UI controls
  const [orders, setOrders] = useState<Order[]>([])
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [availableStock, setAvailableStock] = useState<Record<string, number>>({})
  const [reservedStock, setReservedStock] = useState<Record<string, number>>({})
  const [sortBy, setSortBy] = useState<string>("dueDate")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [showPartialDialog, setShowPartialDialog] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<{ orderId: string; product: Product } | null>(null)
  const [showMultiSkuDialog, setShowMultiSkuDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [allocationHistory, setAllocationHistory] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [allocatedProducts, setAllocatedProducts] = useState<Record<string, boolean>>({})

  // This would come from your API in a real application
  useEffect(() => {
    // Mock data for orders with multiple products
    const mockOrders: Order[] = [
      {
        id: "SO-1001",
        customer: "ABC Corp",
        dueDate: "2023-10-15",
        priority: "high-value",
        status: "pending",
        products: [
          { id: "P1001-1", sku: "500ml", name: "Premium Water Bottle 500ml", quantity: 300 },
          { id: "P1001-2", sku: "750ml", name: "Premium Water Bottle 750ml", quantity: 200 },
          { id: "P1001-3", sku: "1000ml", name: "Premium Water Bottle 1000ml", quantity: 100 },
        ],
      },
      {
        id: "SO-1002",
        customer: "XYZ Retail",
        dueDate: "2023-10-20",
        priority: "standard",
        status: "pending",
        products: [
          { id: "P1002-1", sku: "500ml", name: "Premium Water Bottle 500ml", quantity: 300 },
          { id: "P1002-2", sku: "2000ml", name: "Premium Water Bottle 2000ml", quantity: 150 },
        ],
      },
      {
        id: "SO-1003",
        customer: "Urgent Pharma",
        dueDate: "2023-10-10",
        priority: "urgent",
        status: "pending",
        products: [{ id: "P1003-1", sku: "500ml", name: "Premium Water Bottle 500ml", quantity: 200 }],
      },
      {
        id: "SO-1004",
        customer: "Global Foods",
        dueDate: "2023-10-18",
        priority: "standard",
        status: "pending",
        products: [
          { id: "P1004-1", sku: "750ml", name: "Premium Water Bottle 750ml", quantity: 500 },
          { id: "P1004-2", sku: "1000ml", name: "Premium Water Bottle 1000ml", quantity: 300 },
        ],
      },
      {
        id: "SO-1005",
        customer: "Premium Stores",
        dueDate: "2023-10-12",
        priority: "high-value",
        status: "pending",
        products: [
          { id: "P1005-1", sku: "750ml", name: "Premium Water Bottle 750ml", quantity: 400 },
          { id: "P1005-2", sku: "2000ml", name: "Premium Water Bottle 2000ml", quantity: 200 },
        ],
      },
    ]

    // Mock data for available stock
    const mockStock = {
      "500ml": 1000,
      "750ml": 1500,
      "1000ml": 800,
      "2000ml": 600,
    }

    // Mock data for reserved stock
    const mockReserved = {
      "500ml": 0,
      "750ml": 0,
      "1000ml": 0,
      "2000ml": 0,
    }

    setOrders(mockOrders)
    setAvailableStock(mockStock)
    setReservedStock(mockReserved)

    // Initialize allocations
    const initialAllocations: Record<string, number> = {}
    mockOrders.forEach((order) => {
      order.products.forEach((product) => {
        initialAllocations[`${order.id}-${product.id}`] = 0
      })
    })
    setAllocations(initialAllocations)

    // Initialize allocated products
    const initialAllocatedProducts: Record<string, boolean> = {}
    mockOrders.forEach((order) => {
      order.products.forEach((product) => {
        initialAllocatedProducts[`${order.id}-${product.id}`] = false
      })
    })
    setAllocatedProducts(initialAllocatedProducts)
  }, [])

  // Check if an order is fully allocated
  const isOrderFullyAllocated = (order: Order) => {
    return order.products.every((product) => (product.allocated || 0) >= product.quantity)
  }

  // Check if an order is partially allocated
  const isOrderPartiallyAllocated = (order: Order) => {
    return (
      order.products.some((product) => (product.allocated || 0) > 0) &&
      !order.products.every((product) => (product.allocated || 0) >= product.quantity)
    )
  }

  // Filter orders to show only those that need allocation (not fully allocated)
  const ordersNeedingAllocation = orders.filter((order) => !isOrderFullyAllocated(order))

  // Filter orders based on search term
  const searchFilteredOrders = ordersNeedingAllocation.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products.some(
        (product) =>
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  )

  // Sort orders based on selected criteria
  const sortedOrders = [...searchFilteredOrders].sort((a, b) => {
    if (sortBy === "dueDate") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    } else if (sortBy === "priority") {
      const priorityRank = { urgent: 0, "high-value": 1, standard: 2 }
      return priorityRank[a.priority] - priorityRank[b.priority]
    }
    return 0
  })

  // Filter orders based on priority
  const filteredOrders =
    filterPriority === "all" ? sortedOrders : sortedOrders.filter((order) => order.priority === filterPriority)

  // Open the multi-SKU allocation dialog
  const openAllocationDialog = (order: Order) => {
    setSelectedOrder(order)
    setShowMultiSkuDialog(true)
  }

  // Handle allocation confirmation from the dialog
  const handleAllocationConfirm = (allocations: Record<string, number>) => {
    if (!selectedOrder) return

    const timestamp = new Date().toISOString()
    const historyEntries: any[] = []

    // Process each allocation
    Object.entries(allocations).forEach(([productId, quantity]) => {
      if (quantity <= 0) return

      const product = selectedOrder.products.find((p) => p.id === productId)
      if (!product) return

      // Update available stock
      setAvailableStock((prev) => ({
        ...prev,
        [product.sku]: (prev[product.sku] || 0) - quantity,
      }))

      // Update reserved stock
      setReservedStock((prev) => ({
        ...prev,
        [product.sku]: (prev[product.sku] || 0) + quantity,
      }))

      // Mark product as allocated
      setAllocatedProducts((prev) => ({
        ...prev,
        [`${selectedOrder.id}-${productId}`]: true,
      }))

      // Create history entry
      historyEntries.push({
        id: `ALLOC-${Date.now()}-${productId}`,
        timestamp,
        user: "Current User",
        orderId: selectedOrder.id,
        customer: selectedOrder.customer,
        sku: product.sku,
        allocated: quantity,
        requested: product.quantity,
        reason: `Allocation for ${selectedOrder.customer}`,
      })

      // Update the product's allocated amount in the orders state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                products: o.products.map((p) =>
                  p.id === productId ? { ...p, allocated: (p.allocated || 0) + quantity } : p,
                ),
              }
            : o,
        ),
      )
    })

    // Add to allocation history
    setAllocationHistory((prev) => [...prev, ...historyEntries])

    // Reset the selected order
    setSelectedOrder(null)
  }

  // Handle allocation quantity change
  const handleAllocationChange = (orderId: string, productId: string, value: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const product = order.products.find((p) => p.id === productId)
    if (!product) return

    const numValue = Number.parseInt(value) || 0

    // Validate against product quantity and available stock
    const maxAllocation = Math.min(product.quantity, availableStock[product.sku] || 0)

    if (numValue > maxAllocation) {
      // Show partial allocation dialog if trying to allocate more than available
      if (numValue > availableStock[product.sku]) {
        setCurrentProduct({ orderId, product })
        setShowPartialDialog(true)
        return
      }
    }

    setAllocations((prev) => ({
      ...prev,
      [`${orderId}-${productId}`]: numValue,
    }))
  }

  // Allocate a specific product
  const allocateProduct = (orderId: string, productId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const product = order.products.find((p) => p.id === productId)
    if (!product) return

    const allocationKey = `${orderId}-${productId}`
    const allocationAmount = allocations[allocationKey] || 0

    if (allocationAmount <= 0) {
      alert("Please enter a quantity to allocate")
      return
    }

    if (allocationAmount > availableStock[product.sku]) {
      alert("Cannot allocate more than available stock")
      return
    }

    // Update available stock
    setAvailableStock((prev) => ({
      ...prev,
      [product.sku]: (prev[product.sku] || 0) - allocationAmount,
    }))

    // Update reserved stock
    setReservedStock((prev) => ({
      ...prev,
      [product.sku]: (prev[product.sku] || 0) + allocationAmount,
    }))

    // Mark product as allocated
    setAllocatedProducts((prev) => ({
      ...prev,
      [allocationKey]: true,
    }))

    // Add to allocation history
    const historyEntry = {
      id: `ALLOC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: "Current User",
      orderId: order.id,
      customer: order.customer,
      sku: product.sku,
      allocated: allocationAmount,
      requested: product.quantity,
      reason: `Allocation for ${order.customer}`,
    }
    setAllocationHistory((prev) => [...prev, historyEntry])

    // Update the product's allocated amount in the orders state
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              products: o.products.map((p) =>
                p.id === productId ? { ...p, allocated: (p.allocated || 0) + allocationAmount } : p,
              ),
            }
          : o,
      ),
    )

    // Reset allocation input
    setAllocations((prev) => ({
      ...prev,
      [allocationKey]: 0,
    }))
  }

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            🔥 Urgent
          </Badge>
        )
      case "high-value":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-amber-500">
            ⭐ High-Value
          </Badge>
        )
      case "standard":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            🟢 Standard
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Check if any products are allocated

  // Get allocation status badge
  const getAllocationStatusBadge = (order: Order) => {
    if (isOrderFullyAllocated(order)) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Fully Allocated
        </Badge>
      )
    } else if (isOrderPartiallyAllocated(order)) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Partially Allocated
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Not Allocated
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <Label htmlFor="sort-by" className="mb-2 block">
              Sort By
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-by" className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date (Earliest)</SelectItem>
                <SelectItem value="priority">Priority (Highest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="filter-priority" className="mb-2 block">
              Filter Priority
            </Label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger id="filter-priority" className="w-[180px]">
                <SelectValue placeholder="Filter priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">🔥 Urgent</SelectItem>
                <SelectItem value="high-value">⭐ High-Value</SelectItem>
                <SelectItem value="standard">🟢 Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="search" className="mb-2 block">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="search"
                placeholder="Order ID, Customer, or SKU..."
                className="pl-8 w-full md:w-[220px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={cn(
                      "hover:bg-muted/50",
                      new Date(order.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? "bg-red-50" : "",
                    )}
                  >
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {new Date(order.dueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                    <TableCell>{getAllocationStatusBadge(order)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => openAllocationDialog(order)}
                        disabled={isOrderFullyAllocated(order)}
                      >
                        Allocate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No orders found requiring allocation
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <span className="font-medium">Orders Requiring Allocation:</span>{" "}
          <span className="font-bold">{filteredOrders.length}</span>
        </div>
      </div>

      {currentProduct && (
        <PartialAllocationDialog
          open={showPartialDialog}
          onOpenChange={setShowPartialDialog}
          order={{
            id: currentProduct.orderId,
            sku: currentProduct.product.sku,
            quantity: currentProduct.product.quantity,
          }}
          availableStock={availableStock[currentProduct.product.sku] || 0}
          onConfirm={(quantity, reason) => {
            setAllocations((prev) => ({
              ...prev,
              [`${currentProduct.orderId}-${currentProduct.product.id}`]: quantity,
            }))
            setCurrentProduct(null)
          }}
        />
      )}

      {/* Multi-SKU Allocation Dialog */}
      <MultiSkuAllocationDialog
        open={showMultiSkuDialog}
        onOpenChange={setShowMultiSkuDialog}
        order={selectedOrder}
        availableStock={availableStock}
        onConfirm={handleAllocationConfirm}
      />
    </div>
  )
}

