"use client"

import { useState, useEffect } from "react"

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
}

export function useLogisticsData(status: "all" | "ready" | "dispatched" | "delivered") {
  const [orders, setOrders] = useState<LogisticsOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<LogisticsOrder[]>([])

  useEffect(() => {
    // This would come from your API in a real application
    const logisticsData: LogisticsOrder[] = [
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
      },
    ]

    setOrders(logisticsData)

    // Filter orders based on selected tab
    const filtered = status === "all" ? logisticsData : logisticsData.filter((order) => order.status === status)

    setFilteredOrders(filtered)
  }, [status])

  return { orders, filteredOrders }
}

