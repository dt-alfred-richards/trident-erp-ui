"use client"

import { createContext, Dispatch, SetStateAction, useContext, useMemo, useState, type ReactNode } from "react"
import { type Order, type OrderStatus, ClientAddress, ClientInfo, ClientProposedPrice, OrderActionService } from "@/types/order"
import type { ProductStatus } from "@/types/product"
import { Product } from "@/components/sales/sales-dashboard"

interface OrderContextType {
  orders: Order[]
  currentUser: string
  filteredOrders: (status: OrderStatus | "all") => Order[]
  approveOrder: (order: Order) => void
  rejectOrder: (orderId: string) => void
  allocateInventory: (orderId: string, productId: string, quantity: number) => void
  dispatchProducts: (orderId: string, productId: string, quantity: number) => void
  deliverProducts: (orderId: string, productId: string, quantity: number) => void
  getOrderById: (orderId: string) => Order | undefined
  updateOrder: (orderId: string, updatedOrder: Partial<Order>) => void
  addOrder: (order: Order) => void
  cancelOrder: (orderId: string) => void,
  setOrders: Dispatch<SetStateAction<Order[]>>
  createClientProposedPrice: (data: ClientProposedPrice[], clientInfo: ClientInfo[], productInfo: Product[], clientAddress: ClientAddress[]) => void
  clientProposedPrice: Record<string, ClientProposedPrice>,
  productInfo: Record<string, Product>,
  clientInfo: Record<string, ClientInfo>,
  refetchData: boolean,
  nonSerializedData: Record<string, any>,
  updateNonSerilizedData: (data: any) => void,
  setRefetchData: Dispatch<SetStateAction<boolean>>,
  clientAddress: Record<string, ClientAddress[]>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [refetchData, setRefetchData] = useState(false);
  const [clientInfo, setClientInfo] = useState<Record<string, ClientInfo>>({});
  const [productInfo, setProductInfo] = useState<Record<string, Product>>({});
  const [clientAddress, setClientAddress] = useState<Record<string, ClientAddress[]>>({});
  const [clientProposedPrice, setClientProposedPrice] = useState<Record<string, ClientProposedPrice>>({})
  const [currentUser, setCurrentUser] = useState<string>("Current User") // In a real app, this would come from authentication
  const [rootLoaded, setRootLoaded] = useState(false)

  const [nonSerializedData, setNonSerializedData] = useState<Record<string, any>>({})
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
  const approveOrder = ({ id: orderId, status }: Order) => {
    try {
      if (status !== "pending_approval") {
        throw new Error("Only pending orders can be approved")
      }
      OrderActionService.approveOrder(orderId, currentUser).finally(() => {
        setRefetchData(true)
      })
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

  const createClientProposedPrice = (priceData: ClientProposedPrice[], clientInfo: ClientInfo[], productInfo: Product[], clientAddress: ClientAddress[]) => {
    setClientProposedPrice(Object.fromEntries(priceData.map(item => [item.productId, item])))
    setClientInfo(Object.fromEntries(clientInfo.map(item => [item.clientId, item])))
    setProductInfo(Object.fromEntries(productInfo.map(item => [item.productId, item])))
    setClientAddress(
      clientAddress.reduce((acc, curr) => {
        if (!acc[curr.clientId]) {
          acc[curr.clientId] = acc[curr.clientId] ?? []
        }
        acc[curr.clientId].push(curr)
        return acc;
      }, {} as Record<string, ClientAddress[]>))
    setRefetchData(true);
  }

  const updateNonSerilizedData = (data: any) => {
    setNonSerializedData(prev => ({
      ...prev,
      ...data
    }))
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
    setOrders,
    createClientProposedPrice,
    clientProposedPrice,
    clientInfo,
    refetchData,
    nonSerializedData,
    updateNonSerilizedData,
    setRefetchData,
    clientAddress,
    productInfo
  }), [orders, clientProposedPrice, refetchData])

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

