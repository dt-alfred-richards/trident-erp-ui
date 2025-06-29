"use client"

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { type Order, type OrderStatus, OrderActionService, SalesOrderDetails } from "@/types/order"
import type { ProductStatus } from "@/types/product"
import { DataByTableName } from "@/components/api"
import { createType, getChildObject, getPriority, removebasicTypes } from "@/components/generic"
import { any } from "zod"

export type EventLogger = {
  id: number,
  eventId: string,
  tableName: string,
  fieldValue: string,
  category: string,
  tableId: number,
  createdOn: Date,
  createdBy: string
}

export type Client = {
  id?: number,
  clientId?: string,
  name: string,
  contactPerson: string,
  email: string,
  phoneNumber: string,
  shippingAddress: string,
  clientType: string,
  gstNumber: string,
  panNumber: string,
  createdOn: string,
  modifiedOn: Date,
  createdBy: string,
  modifiedBy: Date
}

export type ClientReference = {
  id?: number,
  referenceId: string,
  clientId: string,
  name: string
}

export type ShippingAddress = {
  id?: number,
  addressId: string,
  name: string,
  address: string,
  clientId: string,
  isDefault: boolean
}

export type ClientProposedProduct = {
  id?: number,
  productId?: string,
  name: string,
  clientId: string,
  sku: string,
  price: number,
  unit: string,
  createdOn: string,
  modifiedOn: object,
  createdBy: string,
  modifiedBy: object,
  availableQuantity: string,
  reservedQuantity: string,
  inProduction: string,
  produced: string;
}

export type V1Sale = {
  id: number,
  saleId: string,
  clientId: string,
  deliveryDate?: Date,
  poId: string,
  remarks: string,
  subtotal: number,
  discount: any,
  createdOn: Date,
  modifiedOn: Date,
  createdBy: string,
  modifiedBy: string,
  orderDate: Date,
  referenceId: string,
  total: number,
  shippingAddressId: string,
  poNumber: string,
  poDate: Date,
  discountType: string,
  taxesEnabled: boolean,
  taxType: string,
  taxTotal: number,
  status: string,
  trackingId: string,
  employeeReferenceId: string,
  isEmployeeChecked: boolean
}

export type SaleOrderDetail = {
  id: string,
  orderId: string,
  saleId: string,
  productId: string,
  cases: number,
  status: string,
  allocated: number
}
interface OrderContextType {
  orders: Order[]
  currentUser: string
  productSkuMapper: Record<string, string>
  filteredOrders: (status: OrderStatus | "all") => Order[]
  approveOrder: (orderId: string) => Promise<void>
  rejectOrder: (orderId: string) => Promise<void>
  allocateInventory: (orderId: string, productId: string, quantity: number) => void
  dispatchProducts: (orderId: string, productId: string, quantity: number) => void
  deliverProducts: (orderId: string, productId: string, quantity: number) => void
  getOrderById: (orderId: string) => Order | undefined
  updateOrder: (orderId: string, updatedOrder: any, updatedProducts: any, newEntries: Partial<SaleOrderDetail>[]) => Promise<any>,
  addOrder: (order: Partial<V1Sale>, saleOrder: Partial<SaleOrderDetail>[]) => Promise<void>,
  addSaleOrder: (saleOrder: Partial<SaleOrderDetail>) => Promise<void>,
  cancelOrder: (orderId: string) => void,
  clientMapper: Record<string, Client>
  referenceMapper: Record<string, ClientReference[]>
  shippingAddressMapper: Record<string, ShippingAddress[]>,
  clientProposedProductMapper: Record<string, ClientProposedProduct[]>,
  refetchContext: VoidFunction,
  eventsLogger: EventLogger[],
  saleOrders: SaleOrderDetail[],
  deleteSaleOrder: (orderId: string[]) => Promise<PromiseSettledResult<any>[]>,
  updateClientProduct?: (clientPayload: Partial<ClientProposedProduct>) => Promise<void>,
  updateSaleProductOrder: (orderId: string, payload: Partial<SalesOrderDetails>) => Promise<void>,
}

const emptyFunction = (props: any) => "" as any

const OrderContext = createContext<OrderContextType>({
  orders: [],
  currentUser: "",
  filteredOrders: emptyFunction,
  approveOrder: (orderId: string) => Promise.resolve(),
  rejectOrder: (orderId: string) => Promise.resolve(),
  allocateInventory: (orderId: string, productId: string, quantity: number) => { },
  dispatchProducts: (orderId: string, productId: string, quantity: number) => { },
  deliverProducts: (orderId: string, productId: string, quantity: number) => { },
  getOrderById: emptyFunction,
  updateOrder: (orderId: string, updatedOrder: any, updatedProducts: any, x: any[]) => Promise.resolve(),
  updateSaleProductOrder: (orderId: string, payload: Partial<SalesOrderDetails>) => Promise.resolve(),
  addOrder: (order: Partial<V1Sale>, saleOrder: Partial<SaleOrderDetail>[]) => Promise.resolve(),
  addSaleOrder: (saleOrder: Partial<SaleOrderDetail>) => Promise.resolve(),
  cancelOrder: (orderId: string) => { },
  clientMapper: {},
  referenceMapper: {},
  shippingAddressMapper: {},
  clientProposedProductMapper: {},
  refetchContext: () => { },
  eventsLogger: [],
  saleOrders: [],
  deleteSaleOrder: (orderId: string[]) => Promise.resolve(Promise.allSettled([])),
  productSkuMapper: {}
})

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [saleOrders, setSaleOrders] = useState([])
  const [currentUser, setCurrentUser] = useState<string>("Current User") // In a real app, this would come from authentication
  const [clientMapper, setClientMapper] = useState({})
  const [referenceMapper, setReferenceMapper] = useState({})
  const [shippingAddressMapper, setShippingAddressMapper] = useState({})
  const [eventsLogger, setEventsLogger] = useState([])
  const [clientProposedProductMapper, setClientProposedProductMapper] = useState<Record<string, ClientProposedProduct[]>>({})
  const fetchRef = useRef(true);
  const saleInstance = new DataByTableName("v1_sales");
  const clientInstance = new DataByTableName("v1_clients");
  const clientReferenceInstance = new DataByTableName("client_references");
  const shippingAddressInstance = new DataByTableName("shipping_addresses");
  const clientProposedProducts = new DataByTableName("v1_client_products");
  const saleOrderDetailInstance = new DataByTableName("v1_sales_order_details");
  const eventLoggerInstance = new DataByTableName("events_logger");

  const productSkuMapper = useMemo(() => {
    return Object.values(clientProposedProductMapper).flat().reduce((acc: Record<string, string>, curr) => {
      if (!acc[curr?.productId || ""]) {
        acc[curr?.productId || ""] = curr.sku
      }
      return acc;
    }, {})
  }, [clientProposedProductMapper])

  const fetchData = () => {
    Promise.allSettled([
      saleInstance.get(),
      clientInstance.get(),
      clientReferenceInstance.get(),
      shippingAddressInstance.get(),
      clientProposedProducts.get(),
      saleOrderDetailInstance.get(),
      eventLoggerInstance.get()
    ]).then(response => {
      const saleResponse = getChildObject(response, "0.value.data", []);
      const _clientMapper = getChildObject(response, "1.value.data", []).reduce((acc: Record<string, Client>, curr: Client) => {
        if (!acc[curr.clientId || ""]) {
          acc[curr.clientId || ""] = curr;
        }
        return acc;
      }, {})
      const _referenceMapper = getChildObject(response, "2.value.data", []).reduce((acc: any, curr: ClientReference) => {
        if (!acc[curr.clientId]) {
          acc[curr.clientId] = []
        }
        acc[curr.clientId].push(curr)
        return acc;
      }, {});
      const _shippingAddressMapper = getChildObject(response, "3.value.data", []).reduce((acc: any, curr: ShippingAddress) => {
        if (!acc[curr.clientId]) {
          acc[curr.clientId] = []
        }
        acc[curr.clientId].push(curr)
        return acc;
      }, {});

      const _clientProposedProductMapper = getChildObject(response, "4.value.data", []).reduce((acc: any, curr: ClientProposedProduct) => {
        if (!acc[curr.clientId]) {
          acc[curr.clientId] = []
        }
        acc[curr.clientId].push({
          ...curr,
          availableQuantity: curr.availableQuantity || 0,
        })
        return acc;
      }, {});

      const _saleOrderDetailInstance = getChildObject(response, "5.value.data", []).reduce((acc: Record<string, SaleOrderDetail[]>, curr: SaleOrderDetail) => {
        if (!acc[curr.saleId]) {
          acc[curr.saleId] = []
        }
        acc[curr.saleId].push(curr)
        return acc;
      }, {});
      const _products = getChildObject(response, "4.value.data", []).reduce((acc: Record<string, ClientProposedProduct>, curr: ClientProposedProduct) => {
        if (!acc[curr?.productId || ""]) {
          acc[curr?.productId || ""] = curr
        }
        return acc;
      }, {});
      const _eventsLogger = getChildObject(response, "6.value.data", [])
      setEventsLogger(_eventsLogger)
      const _orders = saleResponse.map((item: V1Sale) => {
        const client: Client = _clientMapper[item?.clientId || ""]
        if (!client) return;
        return ({
          id: item.saleId,
          orderDate: item.orderDate,
          customer: client.name,
          reference: item.referenceId,
          deliveryDate: item.deliveryDate,
          priority: getPriority(item.deliveryDate),
          status: item.status,
          createdBy: item.createdBy,
          createdAt: item.createdOn,
          modifiedOn: item.modifiedOn,
          clientId: item.clientId,
          remarks: item.remarks,
          isEmployeeChecked: item.isEmployeeChecked,
          employeeReferenceId: item.employeeReferenceId,
          shippingAddressId: item.shippingAddressId,
          total: item.total,
          statusHistory: _eventsLogger.filter((i: EventLogger) => i.tableName === "v1_sales" && i.tableId === item.id).map((item: EventLogger) => ({
            timestamp: item.createdOn,
            status: item.fieldValue,
            user: item.createdBy,
            note: item.fieldValue,
          })),
          products: (_saleOrderDetailInstance[item.saleId] || []).map((i: SaleOrderDetail) => {
            const product: ClientProposedProduct = _products[i.productId]
            if (!product) return;
            return ({
              id: i.orderId,
              name: product?.name || "",
              sku: product.sku,
              cases: i.cases,
              price: product.price,
              status: i.status,
              allocated: i.allocated
            })
          }).filter((item: any) => item)
        })
      })
      setOrders(_orders.filter((item: any) => item))
      setSaleOrders(saleResponse)
      setReferenceMapper(_referenceMapper)
      setShippingAddressMapper(_shippingAddressMapper)
      setClientMapper(_clientMapper)
      setClientProposedProductMapper(_clientProposedProductMapper)
    })
  }

  useEffect(() => {
    if (!fetchRef.current) return;
    fetchRef.current = false;
    fetchData();
  }, [])

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
    return saleInstance.patch({ key: "sale_id", value: orderId }, { status: "approved" }).catch(error => {
      console.log({ error })
    }).then(fetchData)
  }

  // Reject an order
  const rejectOrder = (orderId: string) => {
    return saleInstance.patch({ key: "sale_id", value: orderId }, { status: "cancelled" }).catch(error => {
      console.log({ error })
    }).then(fetchData)
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
  const addOrder = (order: Partial<V1Sale>, saleOrders: Partial<SaleOrderDetail>[]) => {
    return saleInstance.post(order)
      .then(res => {
        const saleId = getChildObject(res, "data.0.saleId", "")
        if (!saleId) {
          throw new Error("Sale order creation failed")
        }
        return Promise.allSettled(saleOrders.map(item => saleOrderDetailInstance.post({ ...item, saleId })))
      }).then(() => {
        fetchData()
      }).catch(error => {
        console.log({ error })
      })
  }


  const addSaleOrder = (saleOrder: Partial<SaleOrderDetail>) => {
    return saleOrderDetailInstance.post(saleOrder).catch(error => {
      console.log({ error })
    })
  }

  // Update an order
  const updateOrder = (orderId: string, updatedOrder: Partial<V1Sale>, saleOrrders: Partial<SaleOrderDetail>[], newEntries: Partial<SaleOrderDetail>[]) => {
    return saleInstance.patch({ key: "sale_id", value: orderId }, updatedOrder).then(() => {
      return Promise.allSettled(
        saleOrrders.map(item => {
          const id = item.id, payload = removebasicTypes(item, ["id", "salesId"])
          return saleOrderDetailInstance.patch({
            key: "order_id",
            value: id
          }, payload)
        })
      )
    }).then(() => {
      return newEntries.map(item => addSaleOrder(item))
    }).catch(error => {
      console.log({ error })
    })
  }


  const updateSaleProductOrder = (orderId: string, payload: Partial<SalesOrderDetails>) => {
    return saleOrderDetailInstance.patch({ key: "order_id", value: orderId }, payload).catch(error => {
      console.log({ error })
    })
  }

  const deleteSaleOrder = (orderIds: string[]) => {
    return Promise.allSettled(
      orderIds.map(id =>
        saleOrderDetailInstance.deleteById({ key: "order_id", value: id })
      )
    )
  }

  const updateClientProduct = (productPayload: Partial<ClientProposedProduct>) => {
    return clientProposedProducts.patch({ key: "product_id", value: productPayload.productId }, removebasicTypes(productPayload, ["productId"]))
  }

  return <OrderContext.Provider value={{
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
    updateSaleProductOrder,
    addOrder,
    cancelOrder,
    clientMapper,
    referenceMapper,
    shippingAddressMapper,
    clientProposedProductMapper,
    addSaleOrder,
    updateClientProduct,
    eventsLogger,
    refetchContext: fetchData,
    saleOrders,
    deleteSaleOrder,
    productSkuMapper
  }}>{children}</OrderContext.Provider>
}

// Custom hook to use the order context
export function useOrders() {
  const context = useContext(OrderContext)

  if (context === undefined) {
    console.log("useOrders must be used within an OrderProvider")
  }

  return context
}
