"use client"

import { DataByTableName } from "@/components/utils/api"
import { createType } from "@/components/utils/generic"
import { OrderStatus, ProductStatus } from "@/types/order"
import moment from "moment"
import { useState, useEffect, useCallback } from "react"

interface LogisticsOrder {
  id: string,
  orderId: string,
  customer: string
  sku: string
  quantity: number
  status: string
  date: string
  trackingId?: string
  carrier?: string
  deliveryDate?: string
}

type Fact_logistics = {
  id: number,
  orderId: string,
  customer: string,
  sku: string,
  quantity: number,
  status: string,
  trackingId: string,
  notes: string,
  createdOn: number,
  createdBy: string,
  modifiedOn: number,
  modifiedBy: string,
  carrier: string,
  deliveryDate: number
}

export function useLogisticsData(status: "all" | "ready" | "dispatched" | "delivered") {
  const [orders, setOrders] = useState<LogisticsOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<LogisticsOrder[]>([])
  const [rerender, setRerender] = useState(false);

  const triggerRender = useCallback(() => {
    setRerender(r => !r)
  }, [setRerender])

  useEffect(() => {
    const logisticsInstance = new DataByTableName("fact_logistics");

    logisticsInstance.get().then(res => {
      const data = (res.data?.data || []) as Fact_logistics[]
      const _orders = data.map(item => ({
        id: item.id + "",
        orderId: item.orderId,
        customer: item.customer,
        sku: item.sku,
        quantity: item.quantity,
        status: item.status as OrderStatus | ProductStatus,
        date: moment(item.createdOn).format('YYYY-MM-DD'),
        trackingId: item.trackingId,
        carrier: item.carrier,
        deliveryDate: moment(item.deliveryDate).format('YYYY-MM-DD')
      } as LogisticsOrder))
      setOrders(_orders)
      // Filter orders based on selected tab
      const filtered = status === "all" ? _orders : _orders.filter((order) => order.status === status)

      setFilteredOrders(filtered)
    }).catch(error => {
      console.log({ error })
    })
  }, [status, rerender])

  return { orders, filteredOrders, triggerRender }
}

