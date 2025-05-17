"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type Order, type OrderStatus, OrderActionService } from "@/types/order"
import type { ProductStatus } from "@/types/product"

// Initial mock data for orders
const initialOrders: Order[] = [
  {
    id: "SO-1001",
    orderDate: "2023-06-05",
    customer: "Acme Corp",
    reference: "REF-A001",
    deliveryDate: "2023-06-15",
    priority: "high",
    status: "pending_approval",
    createdBy: "John Doe",
    createdAt: "2023-06-05T10:30:00Z",
    statusHistory: [
      {
        timestamp: "2023-06-05T10:30:00Z",
        status: "pending_approval",
        user: "John Doe",
        note: "Order created",
      },
    ],
    products: [
      {
        id: "P1",
        name: "Premium Water Bottle",
        sku: "500ml",
        quantity: 1000,
        price: 120,
        status: "pending",
      },
    ],
  },
  {
    id: "SO-1002",
    orderDate: "2023-06-06",
    customer: "TechStart Inc",
    reference: "REF-T002",
    deliveryDate: "2023-06-20",
    priority: "medium",
    status: "pending_approval",
    createdBy: "Sarah Smith",
    createdAt: "2023-06-06T09:15:00Z",
    statusHistory: [
      {
        timestamp: "2023-06-06T09:15:00Z",
        status: "pending_approval",
        user: "Sarah Smith",
        note: "Order created",
      },
    ],
    products: [
      {
        id: "P2",
        name: "Premium Water Bottle",
        sku: "1000ml",
        quantity: 500,
        price: 220,
        status: "pending",
      },
    ],
  },
  {
    id: "SO-0998",
    orderDate: "2023-06-02",
    customer: "Fresh Markets",
    reference: "REF-F004",
    deliveryDate: "2023-06-12",
    priority: "medium",
    status: "approved",
    trackingId: "TRK-0998",
    createdBy: "Mike Johnson",
    createdAt: "2023-06-02T14:20:00Z",
    approvedBy: "David Lee",
    approvedAt: "2023-06-03T09:30:00Z",
    statusHistory: [
      {
        timestamp: "2023-06-02T14:20:00Z",
        status: "pending_approval",
        user: "Mike Johnson",
        note: "Order created",
      },
      {
        timestamp: "2023-06-03T09:30:00Z",
        status: "approved",
        user: "David Lee",
        note: "Order approved",
      },
    ],
    products: [
      {
        id: "P3",
        name: "Premium Water Bottle",
        sku: "750ml",
        quantity: 1200,
        price: 180,
        status: "pending",
      },
    ],
  },
  // Demo for a partial fulfillment order with multiple products in different stages
  {
    id: "SO-0989",
    orderDate: "2023-05-24",
    customer: "Eco Friendly Co",
    reference: "REF-E012",
    deliveryDate: "2023-06-04",
    priority: "high",
    status: "partial_fulfillment",
    trackingId: "TRK-0989",
    createdBy: "Lisa Chen",
    createdAt: "2023-05-24T10:15:00Z",
    approvedBy: "David Lee",
    approvedAt: "2023-05-25T09:00:00Z",
    statusHistory: [
      {
        timestamp: "2023-05-24T10:15:00Z",
        status: "pending_approval",
        user: "Lisa Chen",
        note: "Order created",
      },
      {
        timestamp: "2023-05-25T09:00:00Z",
        status: "approved",
        user: "David Lee",
        note: "Order approved",
      },
      {
        timestamp: "2023-05-26T14:30:00Z",
        status: "partial_fulfillment",
        user: "Alex Wong",
        note: "Allocated 500 units of 500ml bottles",
      },
      {
        timestamp: "2023-05-27T11:45:00Z",
        status: "partial_fulfillment",
        user: "Alex Wong",
        note: "Allocated 300 units of 750ml bottles",
      },
      {
        timestamp: "2023-05-28T10:00:00Z",
        status: "partial_fulfillment",
        user: "Alex Wong",
        note: "Allocated 200 units of 1000ml bottles",
      },
      {
        timestamp: "2023-05-29T09:30:00Z",
        status: "partial_fulfillment",
        user: "James Wilson",
        note: "Dispatched 500 units of 500ml bottles",
      },
      {
        timestamp: "2023-05-30T15:20:00Z",
        status: "partial_fulfillment",
        user: "James Wilson",
        note: "Dispatched 300 units of 750ml bottles",
      },
      {
        timestamp: "2023-06-01T14:15:00Z",
        status: "partial_fulfillment",
        user: "Emma Brown",
        note: "Delivered 500 units of 500ml bottles",
      },
    ],
    products: [
      {
        id: "P10",
        name: "Premium Water Bottle",
        sku: "500ml",
        quantity: 500,
        price: 120,
        status: "delivered",
        allocated: 500,
        dispatched: 500,
        delivered: 500,
        allocatedBy: "Alex Wong",
        allocatedAt: "2023-05-26T14:30:00Z",
        dispatchedBy: "James Wilson",
        dispatchedAt: "2023-05-29T09:30:00Z",
        deliveredBy: "Emma Brown",
        deliveredAt: "2023-06-01T14:15:00Z",
      },
      {
        id: "P11",
        name: "Premium Water Bottle",
        sku: "750ml",
        quantity: 300,
        price: 180,
        status: "dispatched",
        allocated: 300,
        dispatched: 300,
        allocatedBy: "Alex Wong",
        allocatedAt: "2023-05-27T11:45:00Z",
        dispatchedBy: "James Wilson",
        dispatchedAt: "2023-05-30T15:20:00Z",
      },
      {
        id: "P12",
        name: "Premium Water Bottle",
        sku: "1000ml",
        quantity: 200,
        price: 220,
        status: "ready",
        allocated: 200,
        allocatedBy: "Alex Wong",
        allocatedAt: "2023-05-28T10:00:00Z",
      },
    ],
  },
  {
    id: "SO-1003",
    orderDate: "2023-06-08",
    customer: "Global Foods",
    reference: "REF-G001",
    deliveryDate: "2023-06-18",
    priority: "high",
    status: "ready",
    createdBy: "Emily Chen",
    createdAt: "2023-06-08T11:20:00Z",
    approvedBy: "David Lee",
    approvedAt: "2023-06-09T09:15:00Z",
    statusHistory: [
      {
        timestamp: "2023-06-08T11:20:00Z",
        status: "pending_approval",
        user: "Emily Chen",
        note: "Order created",
      },
      {
        timestamp: "2023-06-09T09:15:00Z",
        status: "approved",
        user: "David Lee",
        note: "Order approved",
      },
      {
        timestamp: "2023-06-10T14:30:00Z",
        status: "ready",
        user: "Alex Wong",
        note: "Order ready for dispatch",
      },
    ],
    products: [
      {
        id: "P4",
        name: "Premium Water Bottle",
        sku: "2000ml",
        quantity: 300,
        price: 350,
        status: "ready",
        allocated: 300,
        allocatedBy: "Alex Wong",
        allocatedAt: "2023-06-10T14:30:00Z",
      },
    ],
  },
  {
    id: "SO-1004",
    orderDate: "2023-06-07",
    customer: "Sunrise Hotels",
    reference: "REF-S005",
    deliveryDate: "2023-06-17",
    priority: "medium",
    status: "dispatched",
    trackingId: "TRK-1004",
    carrier: "Express Logistics",
    createdBy: "Robert Kim",
    createdAt: "2023-06-07T10:45:00Z",
    approvedBy: "David Lee",
    approvedAt: "2023-06-08T09:30:00Z",
    statusHistory: [
      {
        timestamp: "2023-06-07T10:45:00Z",
        status: "pending_approval",
        user: "Robert Kim",
        note: "Order created",
      },
      {
        timestamp: "2023-06-08T09:30:00Z",
        status: "approved",
        user: "David Lee",
        note: "Order approved",
      },
      {
        timestamp: "2023-06-09T14:15:00Z",
        status: "ready",
        user: "Alex Wong",
        note: "Order ready for dispatch",
      },
      {
        timestamp: "2023-06-10T11:30:00Z",
        status: "dispatched",
        user: "James Wilson",
        note: "Order dispatched",
      },
    ],
    products: [
      {
        id: "P5",
        name: "Premium Water Bottle",
        sku: "500ml",
        quantity: 1500,
        price: 120,
        status: "dispatched",
        allocated: 1500,
        dispatched: 1500,
        allocatedBy: "Alex Wong",
        allocatedAt: "2023-06-09T14:15:00Z",
        dispatchedBy: "James Wilson",
        dispatchedAt: "2023-06-10T11:30:00Z",
      },
    ],
  },
  {
    id: "SO-1005",
    orderDate: "2023-06-06",
    customer: "Wellness Spa",
    reference: "REF-W003",
    deliveryDate: "2023-06-16",
    priority: "low",
    status: "delivered",
    trackingId: "TRK-1005",
    carrier: "Swift Delivery",
    createdBy: "Jennifer Park",
    createdAt: "2023-06-06T09:20:00Z",
    approvedBy: "David Lee",
    approvedAt: "2023-06-07T10:15:00Z",
    statusHistory: [
      {
        timestamp: "2023-06-06T09:20:00Z",
        status: "pending_approval",
        user: "Jennifer Park",
        note: "Order created",
      },
      {
        timestamp: "2023-06-07T10:15:00Z",
        status: "approved",
        user: "David Lee",
        note: "Order approved",
      },
      {
        timestamp: "2023-06-08T13:45:00Z",
        status: "ready",
        user: "Alex Wong",
        note: "Order ready for dispatch",
      },
      {
        timestamp: "2023-06-09T11:30:00Z",
        status: "dispatched",
        user: "James Wilson",
        note: "Order dispatched",
      },
      {
        timestamp: "2023-06-11T14:20:00Z",
        status: "delivered",
        user: "Emma Brown",
        note: "Order delivered",
      },
    ],
    products: [
      {
        id: "P6",
        name: "Premium Water Bottle",
        sku: "750ml",
        quantity: 800,
        price: 180,
        status: "delivered",
        allocated: 800,
        dispatched: 800,
        delivered: 800,
        allocatedBy: "Alex Wong",
        allocatedAt: "2023-06-08T13:45:00Z",
        dispatchedBy: "James Wilson",
        dispatchedAt: "2023-06-09T11:30:00Z",
        deliveredBy: "Emma Brown",
        deliveredAt: "2023-06-11T14:20:00Z",
      },
    ],
  },
  {
    id: "SO-1006",
    orderDate: "2023-06-09",
    customer: "Mountain Resorts",
    reference: "REF-M007",
    deliveryDate: "2023-06-19",
    priority: "high",
    status: "approved",
    createdBy: "Thomas Lee",
    createdAt: "2023-06-09T08:30:00Z",
    approvedBy: "David Lee",
    approvedAt: "2023-06-10T09:45:00Z",
    statusHistory: [
      {
        timestamp: "2023-06-09T08:30:00Z",
        status: "pending_approval",
        user: "Thomas Lee",
        note: "Order created",
      },
      {
        timestamp: "2023-06-10T09:45:00Z",
        status: "approved",
        user: "David Lee",
        note: "Order approved",
      },
    ],
    products: [
      {
        id: "P7",
        name: "Premium Water Bottle",
        sku: "1000ml",
        quantity: 600,
        price: 220,
        status: "pending",
      },
    ],
  },
]

interface OrderContextType {
  orders: Order[]
  currentUser: string
  filteredOrders: (status: OrderStatus | "all") => Order[]
  approveOrder: (orderId: string) => void
  rejectOrder: (orderId: string) => void
  allocateInventory: (orderId: string, productId: string, quantity: number) => void
  dispatchProducts: (orderId: string, productId: string, quantity: number) => void
  deliverProducts: (orderId: string, productId: string, quantity: number) => void
  getOrderById: (orderId: string) => Order | undefined
  updateOrder: (orderId: string, updatedOrder: Partial<Order>) => void
  addOrder: (order: Order) => void
  cancelOrder: (orderId: string) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [currentUser, setCurrentUser] = useState<string>("Current User") // In a real app, this would come from authentication

  // Get filtered orders by status
  const filteredOrders = (status: OrderStatus | "all") => {
    if (status === "all") {
      return orders
    }
    return orders.filter((order) => order.status === status)
  }

  // Get an order by ID
  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.id === orderId)
  }

  // Approve an order
  const approveOrder = (orderId: string) => {
    try {
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? OrderActionService.approveOrder(order, currentUser) : order)),
      )
      console.log(`Order ${orderId} approved successfully`)
    } catch (error) {
      console.error(`Error approving order ${orderId}:`, error)
      // In a real app, you would show an error notification
    }
  }

  // Reject an order
  const rejectOrder = (orderId: string) => {
    try {
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? OrderActionService.rejectOrder(order, currentUser) : order)),
      )
      console.log(`Order ${orderId} rejected successfully`)
    } catch (error) {
      console.error(`Error rejecting order ${orderId}:`, error)
      // In a real app, you would show an error notification
    }
  }

  // Add the cancelOrder implementation in the OrderProvider
  // Add this function after the rejectOrder function
  const cancelOrder = (orderId: string) => {
    try {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === orderId) {
            // Update all products to cancelled status
            const updatedProducts = order.products.map((product) => ({
              ...product,
              status: "cancelled" as ProductStatus,
            }))

            return {
              ...order,
              status: "cancelled" as OrderStatus,
              products: updatedProducts,
              statusHistory: [
                ...order.statusHistory,
                {
                  timestamp: new Date().toISOString(),
                  status: "cancelled",
                  user: currentUser,
                  note: "Order cancelled",
                },
              ],
            }
          }
          return order
        }),
      )
      console.log(`Order ${orderId} cancelled successfully`)
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error)
      // In a real app, you would show an error notification
    }
  }

  // Update an order
  const updateOrder = (orderId: string, updatedOrder: Partial<Order>) => {
    try {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                ...updatedOrder,
                statusHistory: [
                  ...order.statusHistory,
                  {
                    timestamp: new Date().toISOString(),
                    status: updatedOrder.status || order.status,
                    user: currentUser,
                    note: "Order updated",
                  },
                ],
              }
            : order,
        ),
      )
      console.log(`Order ${orderId} updated successfully`)
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error)
      // In a real app, you would show an error notification
    }
  }

  // Allocate inventory to a product
  const allocateInventory = (orderId: string, productId: string, quantity: number) => {
    try {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? OrderActionService.allocateInventory(order, productId, quantity, currentUser) : order,
        ),
      )
      console.log(`Allocated ${quantity} units to product ${productId} in order ${orderId}`)
    } catch (error) {
      console.error(`Error allocating inventory to product ${productId} in order ${orderId}:`, error)
      // In a real app, you would show an error notification
    }
  }

  // Dispatch products
  const dispatchProducts = (orderId: string, productId: string, quantity: number) => {
    try {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? OrderActionService.dispatchProducts(order, productId, quantity, currentUser) : order,
        ),
      )
      console.log(`Dispatched ${quantity} units of product ${productId} in order ${orderId}`)
    } catch (error) {
      console.error(`Error dispatching product ${productId} in order ${orderId}:`, error)
      // In a real app, you would show an error notification
    }
  }

  // Deliver products
  const deliverProducts = (orderId: string, productId: string, quantity: number) => {
    try {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? OrderActionService.deliverProducts(order, productId, quantity, currentUser) : order,
        ),
      )
      console.log(`Delivered ${quantity} units of product ${productId} in order ${orderId}`)
    } catch (error) {
      console.error(`Error delivering product ${productId} in order ${orderId}:`, error)
      // In a real app, you would show an error notification
    }
  }

  // Add a new order
  const addOrder = (order: Order) => {
    try {
      setOrders((prevOrders) => [order, ...prevOrders])
      console.log(`Order ${order.id} added successfully`)
    } catch (error) {
      console.error(`Error adding order:`, error)
      throw error
    }
  }

  // Context value
  const value = {
    orders,
    currentUser,
    filteredOrders,
    approveOrder,
    rejectOrder,
    allocateInventory,
    dispatchProducts,
    deliverProducts,
    getOrderById,
    updateOrder,
    addOrder,
    cancelOrder,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

// Custom hook to use the order context
export function useOrders() {
  const context = useContext(OrderContext)

  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }

  return context
}
