"use client"

import { Button } from "@/components/ui/button"
import { SalesTable } from "@/components/sales/sales-table"
import { OrderTrackingKanban } from "@/components/sales/order-tracking-kanban"
import { CreateSalesOrderDialog } from "@/components/sales/create-sales-order-dialog"
import { useCallback, useContext, useEffect, useState } from "react"
import { PlusCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataByTableName } from "../utils/api"
import { useOrders } from "@/contexts/order-context"
import { Order, OrderProduct, OrderStatus } from "@/types/order"
import { createType } from "../utils/generic"

export type FactSales = {
  amount: number,
  clientId: string,
  date: string,
  dc: string,
  dcDate: string,
  expectedDeliveryDate: number,
  invoiceNumber: string,
  numOrders: number,
  orderId?: string,
  poDate: string | number,
  poId: string,
  poNumber: string,
  referenceName: string,
  remarks: string,
  status: OrderStatus,
  createdBy?: string,
  createdOn?: number,
  modifiedOn?: number
}

export type Product = {
  size: string,
  type: string,
  brand: string,
  productId: string,
  sku: string,
  units: string,
  id: number
}

export type OrderDetails = {
  id?: number,
  clientId: string,
  cases: number,
  tradePrice: number,
  expectedDeliveryDate: number,
  status: string,
  casesDelivered: number,
  casesReserved: number,
  createdBy?: string,
  addressId: string,
  createdOn?: number,
  modifiedOn?: number,
  productId: string,
  orderId?: string
}

const getNumber = (str: string) => {
  if (!str) return {}
  const match = str.match(/^(\d+)(\D*)$/); // Match leading numbers and trailing characters
  return {
    quantity: match ? parseInt(match[1]) : NaN, // Extract number
    units: match ? match[2] : "" // Extract units
  };
};

export function SalesDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("order-book")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Sales Management</h2>
          <p className="text-muted-foreground">View and manage all sales orders in one place</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          New Order
        </Button>
      </div>

      <Tabs defaultValue="order-book" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="order-book">Order Book</TabsTrigger>
          <TabsTrigger value="order-tracking">Order Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="order-book" className="mt-0">
          <SalesTable />
        </TabsContent>

        <TabsContent value="order-tracking" className="mt-0">
          <OrderTrackingKanban />
        </TabsContent>
      </Tabs>

      <CreateSalesOrderDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}

