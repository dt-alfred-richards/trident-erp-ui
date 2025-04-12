import { DataByTableName } from "@/components/utils/api"

export type ProductStatus =
  | "pending"
  | "ready"
  | "partially_ready"
  | "dispatched"
  | "partially_dispatched"
  | "delivered"
  | "partially_delivered"

// Order status types
export type OrderStatus = "pending_approval" | "approved" | "ready" | "dispatched" | "delivered" | "partial_fulfillment" | "rejected" | 'cancelled'

// Product item within an order
export interface OrderProduct {
  id: string
  name: string
  sku: string
  quantity: number
  price: number,
  units: string,
  status?: ProductStatus
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

export type ClientProposedPrice = {
  clientId: string,
  id: number,
  paymentTimePeriod: number,
  productId: string,
  proposedPrice: number,
}

export type ClientAddress = {
  clientId: string,
  addressId: string,
  addressLine_1: string,
  addressLine_2: string,
  cityDistrictState: string,
  pincode: number
}

export type ClientInfo = {
  clientId: string,
  name: string,
  contactNumber: number
  email: string,
  address: string,
  reference: string,
  type: string,
  gst: string,
  pan: string,
  contactPerson: string
}

export type StatusHistory = {
  timestamp: string
  status: OrderStatus
  user: string
  note?: string
}

// Complete order with products
export interface Order {
  id: string
  orderDate: number,
  customer: string,
  customerEmail: string,
  customerNumber: number,
  billingAddress: string,
  shippingAddress: string,
  reference: string
  deliveryDate: string
  priority: "high" | "medium" | "low"
  status: OrderStatus
  trackingId?: string
  carrier?: string
  products: OrderProduct[]
  // Audit information
  createdBy: string
  createdAt?: string
  approvedBy?: string
  approvedAt?: any
  // History of status changes for audit trail
  statusHistory: StatusHistory[],
  subtotal: number
}

// Valid status transitions for products
export const VALID_PRODUCT_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  pending: ["ready", "partially_ready"],
  ready: ["dispatched"],
  partially_ready: ["ready", "partially_dispatched"],
  dispatched: ["delivered"],
  partially_dispatched: ["dispatched", "partially_delivered"],
  delivered: [],
  partially_delivered: ["delivered"],
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
  async approveOrder(orderId: string, user: string) {
    const factSalesInstance = new DataByTableName("fact_sales_v2");
    return await factSalesInstance.patch({
      key: "orderId",
      value: orderId
    }, { status: "approved" })
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

