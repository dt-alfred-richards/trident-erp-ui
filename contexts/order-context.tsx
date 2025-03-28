"use client"

import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { type Order, type OrderStatus, ClientAddress, ClientInfo, ClientProposedPrice, OrderActionService } from "@/types/order"
import { FactSales, OrderDetails, Product } from "@/components/sales/sales-dashboard"
import { DataByTableName } from "@/components/utils/api"
import { createType } from "@/components/utils/generic"

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
  clientProposedPrice: Record<string, ClientProposedPrice>,
  productInfo: Record<string, Product>,
  clientInfo: Record<string, ClientInfo>,
  refetchData: boolean,
  nonSerializedData: Record<string, any>,
  updateNonSerilizedData: (data: any) => void,
  setRefetchData: Dispatch<SetStateAction<boolean>>,
  clientAddress: Record<string, ClientAddress[]>,
  eventLogger: Record<string, EventLogger>
}

type EventLogger = {
  id: number,
  eventId: string,
  tableName: string,
  fieldValue: string,
  category: string,
  tableId: number
}

type Priority = 'high' | 'medium' | 'low'
const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [refetchData, setRefetchData] = useState(false);
  const [clientInfo, setClientInfo] = useState<Record<string, ClientInfo>>({});
  const [productInfo, setProductInfo] = useState<Record<string, Product>>({});
  const [clientAddress, setClientAddress] = useState<Record<string, ClientAddress[]>>({});
  const [clientProposedPrice, setClientProposedPrice] = useState<Record<string, ClientProposedPrice>>({})
  const [eventLogger, setEventLogger] = useState<Record<string, EventLogger>>({})
  const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([])
  const [sales, setSales] = useState<FactSales[]>([])
  const [currentUser, setCurrentUser] = useState<string>("Current User") // In a real app, this would come from authentication

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
        setRefetchData(p => !p)
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

  const getMapper = (data: any[], key: string = '') => {
    return Object.fromEntries(data.map(item => [item[key], item]))
  }

  const getPriority = useCallback((quantity: number): Priority => {
    if (quantity <= 1000) {
      return "high"
    } else if (quantity <= 10000) {
      return "medium"
    } else {
      return "low"
    }
  }, [])

  const convertSalesToOrders = useCallback((data: FactSales[], orderDetails: OrderDetails[]) => {
    return data.map(item => {
      const orderProducts = orderDetails.filter(order => order.orderId === item.orderId).map(({ productId, casesReserved, casesDelivered, cases }) => {
        const { brand, sku = "", units = "" } = productInfo[productId] ?? {}
        return ({
          id: productId,
          name: brand,
          price: clientProposedPrice[item.clientId]?.proposedPrice ?? 0,
          quantity: cases,
          allocated: casesReserved,
          delivered: casesDelivered,
          sku,
          units
        })
      })
      const { contactNumber, email, gst, name = "", pan, reference, type, clientId } = clientInfo[item.clientId] ?? {}

      const { addressLine_1 = "", addressLine_2 = "", cityDistrictState = "", pincode } = (clientAddress[clientId] ?? [])[0] ?? {}

      const address = [addressLine_1, addressLine_2, cityDistrictState, pincode].filter(item => item).join(",") ?? ""
      return ({
        createdBy: item?.createdBy ?? "",
        customerNumber: contactNumber,
        customerEmail: email,
        billingAddress: address,
        shippingAddress: address,
        customer: name,
        deliveryDate: new Date(item.expectedDeliveryDate).toDateString(),
        id: item.orderId ?? '',
        orderDate: item.date,
        priority: getPriority(orderProducts.reduce((acc, curr) => {
          acc += curr.quantity ?? 0;
          return acc;
        }, 0)),
        products: orderProducts,
        reference: item.referenceName,
        status: item.status as any,
        statusHistory: [],
        approvedAt: "",
        approvedBy: "",
        carrier: "",
        trackingId: ""
      })
    }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
  }, [clientInfo, clientProposedPrice, productInfo])

  useEffect(() => {
    const proposedPrice = new DataByTableName("client_proposed_price");
    const dimClient = new DataByTableName("dim_client");
    const dimProduct = new DataByTableName("dim_product");
    const clientAddress = new DataByTableName("client_address");
    const orderDetails = new DataByTableName("order_details");
    const salesInstance = new DataByTableName("fact_sales");
    const eventLogger = new DataByTableName("events_logger");

    Promise.allSettled([
      proposedPrice.get(),
      dimClient.get(),
      dimProduct.get(),
      clientAddress.get(),
      orderDetails.get(),
      salesInstance.get(),
      eventLogger.get()
    ]).then((responses: any[]) => {
      const _proposedPrice = responses[0].value.data.data
      const _dimClient = responses[1].value.data.data
      const _dimProduct = responses[2].value.data.data
      const _clientAddress = responses[3].value.data.data
      const _orderDetails = responses[4].value.data.data
      const _sales = responses[5].value.data.data
      const _eventLogger = responses[6].value.data.data

      setClientProposedPrice(getMapper(_proposedPrice, "productId"))
      setClientInfo(getMapper(_dimClient, "clientId"))
      setProductInfo(getMapper(_dimProduct, "productId"))
      setClientProposedPrice(getMapper(_proposedPrice, "productId"))
      setEventLogger(getMapper(_eventLogger, "id"))
      setClientAddress(
        _clientAddress.reduce((acc: any, curr: any) => {
          if (!acc[curr.clientId]) {
            acc[curr.clientId] = acc[curr.clientId] ?? []
          }
          acc[curr.clientId].push(curr)
          return acc;
        }, {} as Record<string, ClientAddress[]>))
      setOrderDetails(_orderDetails)
      setSales(_sales);
    })
  }, [refetchData])

  useEffect(() => {
    setOrders(convertSalesToOrders(sales, orderDetails))
  }, [productInfo, sales, orderDetails])

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
    clientProposedPrice,
    clientInfo,
    refetchData,
    nonSerializedData,
    updateNonSerilizedData,
    setRefetchData,
    clientAddress,
    productInfo,
    eventLogger
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

