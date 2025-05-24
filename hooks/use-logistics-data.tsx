"use client"

import { DataByTableName } from "@/components/api"
import { getChildObject } from "@/components/generic"
import { useOrders } from "@/contexts/order-context"
import type React from "react"

import { useState, useEffect, createContext, useContext, useRef } from "react"

interface LogisticsOrder {
  id: string
  customer: string
  sku: string
  quantity: number
  status: string
  date: string
  trackingId?: string
  carrier?: string
  deliveryDate?: string
  vehicleId?: string
  driverName?: string
  contactNumber?: string
}

type ShipmenTracking = {
  id: number,
  shipmentId: string,
  vehicleId: string,
  driverName: string,
  contactNumber: string,
  deliveryAddress: string,
  deliveryNote: string,
  saleId: string,
  saleOrderId: string,
  createdOn: Date
}

// Create a context to share state between components
interface LogisticsContextType {
  orders: LogisticsOrder[]
  updateOrderStatus: (orderId: string, updatedOrder: Partial<LogisticsOrder>) => void
}

const LogisticsContext = createContext<LogisticsContextType>({
  orders: [],
  updateOrderStatus: () => { },
})

export const LogisticsProvider = ({ children }: { children: React.ReactNode }) => {
  const { orders: saleOrders } = useOrders()
  const fetchRef = useRef(true)
  const shipmentInstance = new DataByTableName("v1_shipment_tracking")

  const fetchData = () => {
    Promise.allSettled([
      shipmentInstance.get()
    ]).then(response => {
      const shipmentResponse = getChildObject(response, "0.value.data", [])

    })
  }

  useEffect(() => {
    if (!!fetchRef.current) return;
    fetchRef.current = false
    fetchData()
  }, [])
  const [orders, setOrders] = useState<LogisticsOrder[]>([
    {
      id: "SO-0995",
      customer: "Health Foods",
      sku: "500ml",
      quantity: 1000,
      status: "ready",
      date: "2023-06-01",
    },
    {
      id: "SO-0996",
      customer: "Wellness Store",
      sku: "750ml",
      quantity: 500,
      status: "ready",
      date: "2023-06-02",
    },
    {
      id: "SO-0997",
      customer: "Fitness Center",
      sku: "1000ml",
      quantity: 300,
      status: "dispatched",
      trackingId: "TRK-12345",
      carrier: "FedEx",
      date: "2023-06-03",
      vehicleId: "VEH001",
      driverName: "John Smith",
      contactNumber: "+91 98765 43210",
    },
    {
      id: "SO-0998",
      customer: "Organic Life",
      sku: "2000ml",
      quantity: 200,
      status: "delivered",
      trackingId: "TRK-12346",
      carrier: "UPS",
      date: "2023-06-04",
      deliveryDate: "2023-06-07",
      vehicleId: "VEH002",
      driverName: "Maria Garcia",
      contactNumber: "+91 87654 32109",
    },
    {
      id: "SO-0999",
      customer: "Green Grocers",
      sku: "750ml",
      quantity: 350,
      status: "delivered",
      trackingId: "TRK-12347",
      carrier: "DHL",
      date: "2023-06-05",
      deliveryDate: "2023-06-08",
      vehicleId: "VEH003",
      driverName: "David Chen",
      contactNumber: "+91 76543 21098",
    },
  ])

  const updateOrderStatus = (orderId: string, updatedOrder: Partial<LogisticsOrder>) => {
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, ...updatedOrder } : order)))
  }

  return <LogisticsContext.Provider value={{ orders, updateOrderStatus }}>{children}</LogisticsContext.Provider>
}

export const useLogisticsContext = () => useContext(LogisticsContext)

export function useLogisticsData(status: "all" | "ready" | "dispatched" | "delivered") {
  const { orders, updateOrderStatus } = useLogisticsContext()
  const [filteredOrders, setFilteredOrders] = useState<LogisticsOrder[]>([])

  useEffect(() => {
    // Filter orders based on selected tab
    const filtered = status === "all" ? orders : orders.filter((order) => order.status === status)
    setFilteredOrders(filtered)
  }, [status, orders])

  return { orders, filteredOrders, updateOrderStatus }
}
