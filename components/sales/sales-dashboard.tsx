"use client"

import { Button } from "@/components/ui/button"
import { SalesTable } from "@/components/sales/sales-table"
import { OrderTrackingKanban } from "@/components/sales/order-tracking-kanban"
import { CreateSalesOrderDialog } from "@/components/sales/create-sales-order-dialog"
import { useCallback, useContext, useEffect, useState } from "react"
import { PlusCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataByTableName } from "../utils/api"
import { OrderProvider, useOrders } from "@/contexts/order-context"
import { Order, OrderProduct, OrderStatus } from "@/types/order"
import { createType } from "../utils/generic"
import { useAccess } from "../Auth/auth-context"
import { toast } from "../ui/use-toast"

export type FactSales = {
  id: number,
  orderDate: number,
  expectedDeliveryDate: number,
  clientId: string,
  reference: string,
  purchaseDate: number,
  purchaseOrderId: string,
  purchaseOrderNumber: string,
  shippingAddressId: string,
  remarks: string,
  subTotal: number,
  discount: number,
  taxesEnabled: boolean,
  igst: number,
  status: string,
  primarySku: object,
  createdOn: number
  modifiedOn: number,
  modifiedBy: string,
  createdBy: string,
  orderId: string,
  approvedOn: number,
  approvedBy: string,
  carrier: string,
  trackingId: string
}

export type ProductInfo = {
  id: number,
  productId: string,
  sku: string,
  price: number,
  units: string,
  name:string
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
  const { canDelete, canRead, canUpdate, canWrite } = useAccess("fact_sales_v2")

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("order-book")

  return (
    <OrderProvider>
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
    </OrderProvider>

  )
}

