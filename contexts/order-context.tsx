"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { type Order, type OrderStatus, OrderActionService, OrderSummary, Product, SalesOrderDetails, ShippingAddress } from "@/types/order"
import type { ProductStatus } from "@/types/product"
import { DataByTableName } from "@/components/api"
import { createType, getChildObject } from "@/components/generic"
import { Client, ClientReferences, Sale } from "./types"
import { id } from "date-fns/locale"
import { useGlobalContext } from "@/app/GlobalContext"
import { Summary } from "framer-motion"

interface OrderContextType {
  orders: Order[]
  currentUser: string
  filteredOrders: (status: OrderStatus | "all") => Order[]
  approveOrder: (orderId: string) => Promise<void>
  rejectOrder: (orderId: string) => void
  allocateInventory: (orderId: string, productId: string, quantity: number) => void
  dispatchProducts: (orderId: string, productId: string, quantity: number) => void
  deliverProducts: (orderId: string, productId: string, quantity: number) => void
  getOrderById: (orderId: string) => Order | undefined
  updateOrder: (orderId: string, updatedOrder: Partial<Order>) => Promise<void>
  addOrder: (order: Order & { summary: OrderSummary }) => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>,
  clientMapper: Record<string, Client>,
  shippingAddress: ShippingAddress[],
  references: ClientReferences[],
  products: Product[],
  refetchContext: VoidFunction
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const { usersMapper = {} } = useGlobalContext();
  const fetchRef = useRef(true);
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState<Client[]>([])
  const [clientReferences, setClientReferences] = useState<ClientReferences[]>([])
  const [clientMapper, setClientMapper] = useState<Record<string, Client>>({})
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [orders, setOrders] = useState<Order[]>([])
  const [currentUser, setCurrentUser] = useState<string>("Current User") // In a real app, this would come from authentication

  const salesInstance = new DataByTableName("v1_sales");

  const fetchContextInfo = useCallback(() => {
    const referenceInstance = new DataByTableName("client_references");
    const clientInstance = new DataByTableName("v1_clients");
    const shippingAddressInstance = new DataByTableName("shipping_addresses")
    const productsInstance = new DataByTableName("products")
    const saleOrders = new DataByTableName("sales_order_details")

    Promise.allSettled([
      referenceInstance.get(),
      clientInstance.get(),
      salesInstance.get(),
      shippingAddressInstance.get(),
      productsInstance.get(),
      saleOrders.get()
    ]).then(responses => {
      const _references = getChildObject(responses, "0.value.data", [])
      const _clients = getChildObject(responses, "1.value.data", []) as Client[]
      const _sales = getChildObject(responses, "2.value.data", [])
      const _shippingAddress = getChildObject(responses, "3.value.data", [])
      const _products = getChildObject(responses, "4.value.data", [])
      const _saleOrders = getChildObject(responses, "5.value.data", []) as SalesOrderDetails[]
      const _clientMapper = _clients.reduce((a, c: Client) => {
        if (!a[c.clientId]) {
          a[c.clientId] = c;
        }
        return a
      }, {} as Record<string, Client>)
      const _productsMapper = _products.reduce((a, c: Product) => {
        if (!a[c.id]) {
          a[c.id] = c;
        }
        return a
      }, {} as Record<string, Product>)
      const _orders = _sales.map((item: Sale) => {
        return ({
          clientId: item.clientId,
          createdAt: item.createdOn,
          createdBy: item.createdBy,
          deliveryDate: item.deliveryDate,
          customer: _clientMapper[item.clientId]?.name || "",
          carrier: "",
          id: item.saleId,
          modifiedBy: item.modifiedBy,
          orderDate: item.orderDate,
          poDate: item.poDate,
          poId: item.poId,
          poNumber: item.poNumber,
          priority: "low",
          products: [],
          reference: item.reference,
          remarks: item.remarks,
          salesId: item.saleId,
          status: item.status,
          statusHistory: [],
          shippingAddressId: item.shippingAddressId,
          summary: {
            discount: item.discount,
            discountType: item.discountType,
            subtotal: item.subtotal,
            taxTotal: item.taxTotal,
            taxType: item.taxType,
            total: item.total,
            taxEnabled: item.taxesEnabled,
            taxesEnabled: item.taxesEnabled
          }
        } as Partial<Order>)
      })
      setClients(_sales)
      setClientReferences(_references)
      setSales(_sales)
      setOrders(_orders)
      setClientMapper(_clientMapper)
      setShippingAddress(_shippingAddress.map((item: ShippingAddress) => ({ ...item, isDefault: item.id === 1 })))
      setProducts(_products)
    })
  }, [fetchRef, usersMapper])

  useEffect(() => {
    if (!fetchRef.current || Object.values(usersMapper).length === 0) return
    fetchRef.current = false;
    fetchContextInfo()
  }, [fetchRef, fetchContextInfo, usersMapper])
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
    return salesInstance.patch({ key: "id", value: orderId }, { status: "approved" }).catch(error => {
      console.error(`Error approving order ${orderId}:`, error)
    })
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
    return salesInstance.patch({ key: "id", value: orderId }, { status: "cancelled" }).catch(error => {
      console.error(`Error cancelling order ${orderId}:`, error)
    })
  }

  // Update an order
  const updateOrder = (orderId: string, updatedOrder: Partial<Order>) => {
    const summary = updatedOrder.summary ?? {} as OrderSummary
    summary["taxEnabled"] = updatedOrder.summary?.taxesEnabled

    delete summary["taxesEnabled"]

    const saleOrderPayload = {
      deliveryDate: updatedOrder.deliveryDate?.toISOString(),
      shippingAddress: updatedOrder.shippingAddress,
      reference: updatedOrder.reference,
      ...summary
    } as Partial<Sale>

    const salesOrderDetailsPayload: Partial<SalesOrderDetails>[] = (updatedOrder.products ?? []).map(item => ({
      productId: getChildObject(item, "productId", ""),
      selectedSku: getChildObject(item, "sku", ""),
      cases: getChildObject(item, "cases", ""),
      status: getChildObject(item, "status", ""),
      salesId: getChildObject(item, "salesId", "")
    }))

    const saleInstance = new DataByTableName("sales")
    const saleOrderDetailsInstance = new DataByTableName("sales_order_details")

    Promise.allSettled([
      saleInstance.patch({ key: "id", value: orderId }, saleOrderPayload),
      ...salesOrderDetailsPayload.map(item => {
        return saleOrderDetailsInstance.patch({ key: "sales_id", value: item.salesId }, item)
      })
    ]).then(res => {
      console.log({ res })
    })
    // return Promise.resolve("alfreds")

    //  try {
    //    setOrders((prevOrders) =>
    //     prevOrders.map((order) =>
    //       order.id === orderId
    //         ? {
    //           ...order,
    //           ...updatedOrder,
    //           statusHistory: [
    //             ...order.statusHistory,
    //             {
    //               timestamp: new Date().toISOString(),
    //               status: updatedOrder.status || order.status,
    //               user: currentUser,
    //               note: "Order updated",
    //             },
    //           ],
    //         }
    //         : order,
    //     ),
    //   )
    //   console.log(`Order ${orderId} updated successfully`)
    // } catch (error) {
    //   console.error(`Error updating order ${orderId}:`, error)
    //   // In a real app, you would show an error notification
    // }
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
      const { customer, deliveryDate, orderDate, priority, products, reference, status, statusHistory, carrier, trackingId, poDate, poId, poNumber, shippingAddress, remarks, summary } = order

      const { discount, discountType, subtotal, taxesEnabled, taxTotal, taxType, total } = summary

      const salesEntry: Partial<Sale> = {
        clientId: customer,
        deliveryDate: deliveryDate,
        orderDate,
        priority,
        status,
        poDate,
        poNumber,
        poId,
        shippingAddressId: getChildObject(shippingAddress, "id", ""),
        remarks,
        reference: clientReferences.find(item => item.referenceId === reference)?.referenceId || "",
        subtotal,
        discount,
        discountType,
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
  }), [orders, currentUser, clientMapper, shippingAddress, clientReferences, products, fetchContextInfo, shippingAddress])

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


