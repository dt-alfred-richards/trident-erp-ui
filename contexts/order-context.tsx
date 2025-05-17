"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { type Order, type OrderStatus, OrderActionService, OrderSummary, Product, SalesOrderDetails, ShippingAddress } from "@/types/order"
import type { ProductStatus } from "@/types/product"
import { DataByTableName } from "@/components/api"
import { createType, getChildObject } from "@/components/generic"
import { Client, ClientReferences, Sale } from "./types"

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
  addOrder: (order: Order & { summary: OrderSummary }) => Promise<void>
  cancelOrder: (orderId: string) => void,
  clientMapper: Record<string, Client>,
  shippingAddress: ShippingAddress[],
  references: ClientReferences[],
  products: Product[],
  refetchContext: VoidFunction
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const fetchRef = useRef(true);
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState<Client[]>([])
  const [clientReferences, setClientReferences] = useState<ClientReferences[]>([])
  const [clientMapper, setClientMapper] = useState<Record<string, Client>>({})
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [orders, setOrders] = useState<Order[]>([])
  const [currentUser, setCurrentUser] = useState<string>("Current User") // In a real app, this would come from authentication

  const fetchContextInfo = useCallback(() => {
    const referenceInstance = new DataByTableName("client_references");
    const clientInstance = new DataByTableName("clients");
    const salesInstance = new DataByTableName("sales");
    const shippingAddressInstance = new DataByTableName("shipping_addresses")
    const productsInstance = new DataByTableName("products")

    Promise.allSettled([
      referenceInstance.get(),
      clientInstance.get(),
      salesInstance.get(),
      shippingAddressInstance.get(),
      productsInstance.get()
    ]).then(responses => {
      const _references = getChildObject(responses, "0.value.data", [])
      const _clients = getChildObject(responses, "1.value.data", []) as Client[]
      const _sales = getChildObject(responses, "2.value.data", [])
      const _shippingAddress = getChildObject(responses, "3.value.data", [])
      const _products = getChildObject(responses, "4.value.data", [])

      const clientMapper = _clients.reduce((a, c: Client) => {
        if (!a[c.clientId]) {
          a[c.clientId] = c;
        }
        return a
      }, {} as Record<string, Client>)

      const _orders = _sales.map((item: Sale) => ({
        id: `ORDER-${item.id}`,
        orderDate: item.orderDate,
        customer: clientMapper[item.clientId]?.clientName || "",
        reference: item.reference,
        deliveryDate: item.deliveryDate,
        priority: item.priority,
        status: item.status,
        createdBy: item.createdBy,
        createdAt: item.createdAt,
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
      }))
      setClients(_sales)
      setClientReferences(_references)
      setSales(_sales)
      setOrders(_orders as Order[])
      setClientMapper(clientMapper)
      setShippingAddress(_shippingAddress.map((item: ShippingAddress) => ({ ...item, isDefault: item.id === 1 })))
      setProducts(_products)
    })
  }, [fetchRef])

  useEffect(() => {
    if (!fetchRef.current) return
    fetchRef.current = false;
    fetchContextInfo()
  }, [fetchRef, fetchContextInfo])
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
  const addOrder = (order: Order & { summary: OrderSummary }) => {
    try {
      const { customer, deliveryDate, orderDate, priority, products, reference, status, statusHistory, approvedAt, approvedBy, carrier, trackingId, poDate, poId, poNumber, shippingAddress, remarks, summary } = order

      const { discount, discountType, subtotal, taxesEnabled, taxTotal, taxType, total } = summary

      const salesEntry: Partial<Sale> = {
        clientId: customer, deliveryDate: deliveryDate,
        orderDate,
        priority,
        status,
        purchaseOrderDate: poDate,
        purchaseOrderNumber: poNumber,
        purchaseOrderId: poId,
        shippingAddress: getChildObject(shippingAddress, "id", ""),
        remarks,
        reference: clientReferences.find(item => item.referenceId === reference)?.referenceId || "",
        subtotal,
        discount,
        discountType,
        taxEnabled: taxesEnabled,
        taxTotal,
        total,
        taxType
      }

      const salesInstance = new DataByTableName("sales")

      return salesInstance.post(salesEntry).then(res => {
        const salesId = getChildObject(res, "data.0.salesId", false)

        if (!salesId) {
          throw new Error("Error while saving new sales order")
        }

        const salesOrderDetails: Partial<SalesOrderDetails>[] = products.map(item => ({
          productId: getChildObject(item, "productId", ""),
          selectedSku: getChildObject(item, "sku", ""),
          cases: getChildObject(item, "cases", ""),
          status: getChildObject(item, "status", ""),
          salesId
        }))

        const salesOrderDetailsInstance = new DataByTableName("sales_order_details")
        return salesOrderDetailsInstance.post(salesOrderDetails)
      }).catch(error => {
        console.log({ error })
      })
    } catch (error) {
      console.error(`Error adding order:`, error)
      throw error
    }
  }

  // Context value
  const value = useMemo(() => ({
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
    clientMapper,
    shippingAddress,
    references: clientReferences,
    products,
    refetchContext: fetchContextInfo
  }), [orders, currentUser, clientMapper, shippingAddress, clientReferences, products, fetchContextInfo])

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


