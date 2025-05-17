import { number } from "zod"

// Product status types
export type ProductStatus =
  | "pending"
  | "ready"
  | "partially_ready"
  | "dispatched"
  | "partially_dispatched"
  | "delivered"
  | "partially_delivered"
  | "cancelled"

// Order status types
export type OrderStatus =
  | "pending_approval"
  | "approved"
  | "ready"
  | "dispatched"
  | "delivered"
  | "partial_fulfillment"
  | "cancelled"

// Product item within an order
export interface OrderProduct {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  status: ProductStatus
  allocated?: number
  dispatched?: number
  delivered?: number
  // Audit information
  allocatedBy?: string
  allocatedAt?: string
  dispatchedBy?: string
  dispatchedAt?: string
  deliveredBy?: string
  deliveredAt?: string
}

export type OrderPriority = "high" | "medium" | "low"

// Complete order with products
export interface Order {
  id: string
  orderDate: Date
  customer: string
  reference: string
  deliveryDate: Date
  priority: OrderPriority
  status: OrderStatus
  trackingId?: string
  carrier?: string
  products: OrderProduct[]
  // Audit information
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string,
  poNumber?: string,
  poId?: string,
  poDate?: Date,
  shippingAddress: Record<string, string>,
  remarks: string
  // History of status changes for audit trail
  statusHistory: {
    timestamp: string
    status: OrderStatus
    user: string
    note?: string
  }[],
}

// Valid status transitions for products
export const VALID_PRODUCT_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  pending: ["ready", "partially_ready", "cancelled"],
  ready: ["dispatched", "cancelled"],
  partially_ready: ["ready", "partially_dispatched", "cancelled"],
  dispatched: ["delivered", "cancelled"],
  partially_dispatched: ["dispatched", "partially_delivered", "cancelled"],
  delivered: [],
  partially_delivered: ["delivered", "cancelled"],
  cancelled: [],
}

// Verify if a product status transition is valid
export function isValidProductTransition(currentStatus: ProductStatus, newStatus: ProductStatus): boolean {
  return VALID_PRODUCT_TRANSITIONS[currentStatus]?.includes(newStatus) || false
}

// Calculate the global order status based on product statuses
export function calculateOrderStatus(products: OrderProduct[]): OrderStatus {
  if (products.length === 0) return "pending_approval"

  // Check if all products have the same status
  const allPending = products.every((p) => p.status === "pending")
  const allReady = products.every((p) => p.status === "ready")
  const allDispatched = products.every((p) => p.status === "dispatched")
  const allDelivered = products.every((p) => p.status === "delivered")
  const allCancelled = products.every((p) => p.status === "cancelled")

  if (allCancelled) return "cancelled"
  if (allPending) return "pending_approval"
  if (allReady) return "ready"
  if (allDispatched) return "dispatched"
  if (allDelivered) return "delivered"

  // Check for partial fulfillment scenarios
  const hasReady = products.some((p) => p.status === "ready" || p.status === "partially_ready")
  const hasDispatched = products.some((p) => p.status === "dispatched" || p.status === "partially_dispatched")
  const hasDelivered = products.some((p) => p.status === "delivered" || p.status === "partially_delivered")

  // All products at least approved, but some have advanced further
  if (hasDelivered || hasDispatched || hasReady) {
    return "partial_fulfillment"
  }

  // Default to approved if no advanced statuses
  return "approved"
}

// Order Action Service
export const OrderActionService = {
  // Approve an order
  approveOrder(order: Order, user: string): Order {
    // Validate current status
    if (order.status !== "pending_approval") {
      throw new Error("Only pending orders can be approved")
    }

    const updatedOrder = {
      ...order,
      status: "approved" as OrderStatus,
      approvedBy: user,
      approvedAt: new Date().toISOString(),
      statusHistory: [
        ...order.statusHistory,
        {
          timestamp: new Date().toISOString(),
          status: "approved",
          user,
          note: "Order approved",
        },
      ],
    }

    return updatedOrder
  },

  // Reject an order
  rejectOrder(order: Order, user: string): Order {
    // Validate current status
    if (order.status !== "pending_approval") {
      throw new Error("Only pending orders can be rejected")
    }

    // Update all products to cancelled status
    const updatedProducts = order.products.map((product) => ({
      ...product,
      status: "cancelled" as ProductStatus,
    }))

    const updatedOrder = {
      ...order,
      status: "cancelled" as OrderStatus,
      products: updatedProducts,
      statusHistory: [
        ...order.statusHistory,
        {
          timestamp: new Date().toISOString(),
          status: "cancelled",
          user,
          note: "Order rejected",
        },
      ],
    }

    return updatedOrder
  },

  // Allocate inventory to products in an order
  allocateInventory(order: Order, productId: string, quantity: number, user: string): Order {
    // Find the product
    const productIndex = order.products.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      throw new Error("Product not found in order")
    }

    const product = order.products[productIndex]

    // Validate current status
    if (product.status !== "pending" && product.status !== "partially_ready") {
      throw new Error("Product must be in pending or partially ready status to allocate inventory")
    }

    // Validate allocation quantity
    if (quantity <= 0) {
      throw new Error("Allocation quantity must be positive")
    }

    // Calculate new allocated quantity
    const currentAllocated = product.allocated || 0
    const newAllocated = currentAllocated + quantity

    if (newAllocated > product.quantity) {
      throw new Error("Cannot allocate more than ordered quantity")
    }

    // Determine new product status
    const newProductStatus: ProductStatus = newAllocated === product.quantity ? "ready" : "partially_ready"

    // Update the product
    const updatedProduct = {
      ...product,
      status: newProductStatus,
      allocated: newAllocated,
      allocatedBy: user,
      allocatedAt: new Date().toISOString(),
    }

    // Update the products array
    const updatedProducts = [...order.products]
    updatedProducts[productIndex] = updatedProduct

    // Calculate the new order status
    const newOrderStatus = calculateOrderStatus(updatedProducts)

    // Update the order
    const updatedOrder = {
      ...order,
      products: updatedProducts,
      status: newOrderStatus,
      statusHistory: [
        ...order.statusHistory,
        {
          timestamp: new Date().toISOString(),
          status: newOrderStatus,
          user,
          note: `Allocated ${quantity} units of ${product.name} (${product.sku})`,
        },
      ],
    }

    return updatedOrder
  },

  // Dispatch products in an order
  dispatchProducts(order: Order, productId: string, quantity: number, user: string): Order {
    // Find the product
    const productIndex = order.products.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      throw new Error("Product not found in order")
    }

    const product = order.products[productIndex]

    // Validate current status
    if (
      product.status !== "ready" &&
      product.status !== "partially_ready" &&
      product.status !== "partially_dispatched"
    ) {
      throw new Error("Product must be ready or partially ready to dispatch")
    }

    // Validate dispatch quantity
    if (quantity <= 0) {
      throw new Error("Dispatch quantity must be positive")
    }

    // Calculate new dispatched quantity
    const currentDispatched = product.dispatched || 0
    const newDispatched = currentDispatched + quantity
    const allocated = product.allocated || 0

    if (newDispatched > allocated) {
      throw new Error("Cannot dispatch more than allocated quantity")
    }

    // Determine new product status
    const newProductStatus: ProductStatus = newDispatched === allocated ? "dispatched" : "partially_dispatched"

    // Update the product
    const updatedProduct = {
      ...product,
      status: newProductStatus,
      dispatched: newDispatched,
      dispatchedBy: user,
      dispatchedAt: new Date().toISOString(),
    }

    // Update the products array
    const updatedProducts = [...order.products]
    updatedProducts[productIndex] = updatedProduct

    // Calculate the new order status
    const newOrderStatus = calculateOrderStatus(updatedProducts)

    // Update the order
    const updatedOrder = {
      ...order,
      products: updatedProducts,
      status: newOrderStatus,
      statusHistory: [
        ...order.statusHistory,
        {
          timestamp: new Date().toISOString(),
          status: newOrderStatus,
          user,
          note: `Dispatched ${quantity} units of ${product.name} (${product.sku})`,
        },
      ],
    }

    return updatedOrder
  },

  // Mark products as delivered
  deliverProducts(order: Order, productId: string, quantity: number, user: string): Order {
    // Find the product
    const productIndex = order.products.findIndex((p) => p.id === productId)

    if (productIndex === -1) {
      throw new Error("Product not found in order")
    }

    const product = order.products[productIndex]

    // Validate current status
    if (
      product.status !== "dispatched" &&
      product.status !== "partially_dispatched" &&
      product.status !== "partially_delivered"
    ) {
      throw new Error("Product must be dispatched or partially dispatched to deliver")
    }

    // Validate delivery quantity
    if (quantity <= 0) {
      throw new Error("Delivery quantity must be positive")
    }

    // Calculate new delivered quantity
    const currentDelivered = product.delivered || 0
    const newDelivered = currentDelivered + quantity
    const dispatched = product.dispatched || 0

    if (newDelivered > dispatched) {
      throw new Error("Cannot deliver more than dispatched quantity")
    }

    // Determine new product status
    const newProductStatus: ProductStatus = newDelivered === dispatched ? "delivered" : "partially_delivered"

    // Update the product
    const updatedProduct = {
      ...product,
      status: newProductStatus,
      delivered: newDelivered,
      deliveredBy: user,
      deliveredAt: new Date().toISOString(),
    }

    // Update the products array
    const updatedProducts = [...order.products]
    updatedProducts[productIndex] = updatedProduct

    // Calculate the new order status
    const newOrderStatus = calculateOrderStatus(updatedProducts)

    // Update the order
    const updatedOrder = {
      ...order,
      products: updatedProducts,
      status: newOrderStatus,
      statusHistory: [
        ...order.statusHistory,
        {
          timestamp: new Date().toISOString(),
          status: newOrderStatus,
          user,
          note: `Delivered ${quantity} units of ${product.name} (${product.sku})`,
        },
      ],
    }

    return updatedOrder
  },
}


export type ShippingAddress = {
  id: number,
  addressId: string,
  name: string,
  address: string,
  isDefault: boolean,
  clientId: string
}


export type Product = {
  id: number,
  productId: string,
  name: string,
  price: number,
  taxRate: number
}

export type SalesOrderDetails = {
  id: number,
  orderId: string,
  salesId: string,
  productId: string,
  selectedSku: string,
  cases: number,
  status: string
}

export type OrderSummary = {
  subtotal: number, discountType: string, discount: number, taxesEnabled: boolean, taxType: string, taxTotal: number, total: number
}