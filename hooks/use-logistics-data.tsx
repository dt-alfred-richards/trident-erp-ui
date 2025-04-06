"use client"

import { lodashGet } from "@/components/common/generic"
import { ProductInfo } from "@/components/sales/sales-dashboard"
import { DataByTableName } from "@/components/utils/api"
import { createType } from "@/components/utils/generic"
import { getMapper } from "@/contexts/order-context"
import { OrderStatus, ProductStatus } from "@/types/order"
import moment from "moment"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

export interface LogisticsOrder {
  id: string,
  shipmentId: string,
  orderId: string,
  customer: string
  sku: string
  quantity: number
  status: string
  date: string
  trackingId?: string
  carrier?: string
  deliveryDate?: string,
}

type Fact_logistics = {
  id: number,
  orderId: string,
  status: string,
  orderDate: number,
  deliveryDate: number,
  customer: string,
  carrier: string,
  trackingId: string,
  shippingAddress: string,
  shippingId: string,
  createdOn: number,
  modifiedOn: number,
  createdBy: string,
  modifiedBy: string,
  productId: string,
  quantity: number,
  vehicleId: string,
  driverName: string,
  contactNumber: bigint,
  deliveryAddress: string,
  deliveryNote: string;
}

// Create a context to share state between components
interface LogisticsContextType {
  orders: LogisticsOrder[]
  updateOrderStatus: (orderId: string, updatedOrder: Partial<LogisticsOrder>) => void,
  triggerRender: VoidFunction,
  filteredOrders: LogisticsOrder[],
  productInfo: Record<string, ProductInfo>,
  vehicles: Record<string, Vehicle>,
  drivers: Record<string, Driver>
}

export const LogisticsContext = createContext<LogisticsContextType>({
  orders: [],
  updateOrderStatus: () => { },
  triggerRender: () => { },
  filteredOrders: [],
  productInfo: {},
  vehicles: {},
  drivers: {}
})

type Vehicle = {
  id: number,
  vehicleId: string,
  type: string,
  model: string,
  loadCapacity: number,
  loadUnits: string,
  maxLoad: string,
  registrationNumber: string,
  createdOn: number,
  modifiedOn: number,
  createdBy: string,
  modifiedBy: string
}

type Driver = {
  id: number,
  driverId: string,
  name: string,
  phoneNumber: number,
  drivingLicense: string,
  email: string,
  vehicleIds: object,
  address: string,
  joiningDate: string,
  isActive: boolean,
  createdOn: number,
  modifiedOn: number,
  createdBy: string,
  modifiedBy: string
}

export const LogisticsProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<LogisticsOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<LogisticsOrder[]>([])
  const [rerender, setRerender] = useState(false);
  const [productInfo, setProductInfo] = useState<Record<string, ProductInfo>>({})
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({})
  const [drivers, setDrivers] = useState<Record<string, Driver>>({})

  const updateOrderStatus = (orderId: string, updatedOrder: Partial<LogisticsOrder>) => {
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, ...updatedOrder } : order)))
  }

  const triggerRender = useCallback(() => {
    setRerender(r => !r)
  }, [setRerender])

  useEffect(() => {
    const logisticsInstance = new DataByTableName("fact_logistics");
    const dimProduct = new DataByTableName("dim_product");
    const dimVehicle = new DataByTableName("dim_vehicle");
    const dimDrivers = new DataByTableName("dim_drivers");

    Promise.allSettled([
      logisticsInstance.get(),
      dimProduct.get(),
      dimVehicle.get(),
      dimDrivers.get()
    ]).then(responses => {
      const data = lodashGet({ data: responses, path: '0.value.data.data' }) || [];
      const products = lodashGet({ data: responses, path: '1.value.data.data' }) || [];
      const _vehicles = (lodashGet({ data: responses, path: '2.value.data.data' }) || []).sort((a: any, b: any) => b.id - a.id);
      const _drivers = (lodashGet({ data: responses, path: '3.value.data.data' }) || []).sort((a: any, b: any) => b.id - a.id);

      const productsMapper = getMapper(products, "productId");
      const vehicleMapper = getMapper(_vehicles, "vehicleId");
      const driverMapper = getMapper(_drivers, "driverId");

      const _orders = data.map((item: Fact_logistics) => ({
        id: item.orderId + "",
        orderId: item.id + "",
        customer: item.customer,
        status: item.status as OrderStatus | ProductStatus,
        date: moment(item.orderDate).format('YYYY-MM-DD'),
        trackingId: item.trackingId,
        carrier: item.carrier,
        deliveryDate: moment(item.deliveryDate).format('YYYY-MM-DD'),
        sku: productsMapper[item.productId]?.sku || "",
        quantity: item?.quantity || 0
      } as LogisticsOrder))

      setOrders(_orders)
      setProductInfo(productsMapper)
      // Filter orders based on selected tab
      const filtered = [..._orders]

      setFilteredOrders(filtered)
      setVehicles(vehicleMapper)
      setDrivers(driverMapper)
    }).catch(error => {
      console.log({ error })
    })
  }, [rerender])

  const value = useMemo(() => ({ orders, filteredOrders, triggerRender, updateOrderStatus, productInfo, vehicles, drivers }), [orders, filteredOrders])

  return <LogisticsContext.Provider value={value}>{children}</LogisticsContext.Provider>
}

export const useLogisticsContext = () => useContext(LogisticsContext)

export function useLogisticsData() {
  const context = useContext(LogisticsContext)

  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }

  return context
}


