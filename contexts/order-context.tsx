"use client"

import { createContext, Dispatch, SetStateAction, useContext, useMemo, useState, type ReactNode } from "react"
import { type Order, type OrderStatus, ClientInfo, ClientProposedPrice, OrderActionService } from "@/types/order"
import { Product } from "@/components/sales/sales-dashboard"

interface OrderContextType {
  orders: Order[]
  currentUser: string
  filteredOrders: (status: OrderStatus | "all") => Order[]
  approveOrder: (order: Order) => void
  allocateInventory: (orderId: string, productId: string, quantity: number) => void
  dispatchProducts: (orderId: string, productId: string, quantity: number) => void
  deliverProducts: (orderId: string, productId: string, quantity: number) => void
  getOrderById: (orderId: string) => Order | undefined,
  setOrders: Dispatch<SetStateAction<Order[]>>
  createClientProposedPrice: (data: ClientProposedPrice[], clientInfo: ClientInfo[], productInfo: Product[]) => void
  clientProposedPrice: Record<string, ClientProposedPrice>,
  productInfo: Record<string, Product>,
  clientInfo: Record<string, ClientInfo>,
  refetchData: boolean,
  nonSerializedData: Record<string, any>,
  updateNonSerilizedData: (data: any) => void,
  setRefetchData: Dispatch<SetStateAction<boolean>>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [refetchData, setRefetchData] = useState(false);
  const [clientInfo, setClientInfo] = useState<Record<string, ClientInfo>>({});
  const [productInfo, setProductInfo] = useState<Record<string, Product>>({});
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

  const createClientProposedPrice = (priceData: ClientProposedPrice[], clientInfo: ClientInfo[], productInfo: Product[]) => {
    setClientProposedPrice(Object.fromEntries(priceData.map(item => [item.productId, item])))
    setClientInfo(Object.fromEntries(clientInfo.map(item => [item.clientId, item])))
    setProductInfo(Object.fromEntries(productInfo.map(item => [item.productId, item])))
    setRefetchData(true);
  }

  const updateNonSerilizedData = (data: any) => {
    setNonSerializedData(prev => ({
      ...prev,
      ...data
    }))
  }

  // Context value
  const value = useMemo(() => ({
    orders,
    currentUser,
    filteredOrders,
    approveOrder,
    allocateInventory,
    dispatchProducts,
    deliverProducts,
    getOrderById,
    setOrders,
    createClientProposedPrice,
    clientProposedPrice,
    clientInfo,
    refetchData,
    nonSerializedData,
    updateNonSerilizedData,
    setRefetchData,
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

