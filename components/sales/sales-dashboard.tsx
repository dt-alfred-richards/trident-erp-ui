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

export type FactSales = {
  amount: number,
  custId: string,
  date: string,
  dc: string,
  dcDate: string,
  expectedDeliveryDate: string,
  invoiceNumber: string,
  numOrders: number,
  orderId?: string,
  poDate: string,
  poId: string,
  poNumber: string,
  productId: string,
  referenceName: string,
  remarks: string,
  status: OrderStatus,
}

export type Product = {
  size: string,
  type: string,
  brand: string,
  productId: string
}

const getNumber = (str: string) => {
  const match = str.match(/^(\d+)(\D*)$/); // Match leading numbers and trailing characters
  return {
    quantity: match ? parseInt(match[1]) : NaN, // Extract number
    units: match ? match[2] : "" // Extract units
  };
};

export function SalesDashboard() {
  const { setOrders, clientProposedPrice, clientInfo, refetchData, updateNonSerilizedData, setRefetchData } = useOrders()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("order-book")
  const salesInstance = new DataByTableName("fact_sales");
  const productInstance = new DataByTableName("dim_product");

  const convertSalesToOrders = useCallback((data: FactSales[], products: Product[]) => {
    return data.map(item => {
      const _products: OrderProduct[] = products.filter(p => p.productId === item.productId).map(p => {
        const { quantity, units } = getNumber(p.size);
        return ({
          id: p.productId,
          name: p.brand,
          price: clientProposedPrice[p.productId]?.proposedPrice ?? 0,
          quantity,
          sku: "",
          units,
          status: "delivered"
        })
      })
      const { name = "", contactNumber: customerNumber = "", email: customerEmail = "", address } = clientInfo[item.custId] ?? {}
      return ({
        createdAt: "",
        createdBy: "", customerNumber, customerEmail,
        billingAddress: address,
        shippingAddress: address,
        customer: name,
        deliveryDate: item.dcDate,
        id: item.orderId,
        orderDate: item.date,
        priority: "medium",
        products: _products,
        reference: item.referenceName,
        status: item.status,
        statusHistory: [],
        approvedAt: "",
        approvedBy: "",
        carrier: "",
        trackingId: ""
      })
    })
  }, [clientInfo, clientProposedPrice])

  const fetchSalesDetails = useCallback(() => {
    Promise.allSettled([
      productInstance.get(),
      salesInstance.get()
    ]).then((responses: any[]) => {
      const productData = responses[0]?.value.data;
      const sales = responses[1]?.value.data;
      const data = convertSalesToOrders(sales ?? [], productData)
      setOrders(data as Order[]);
      updateNonSerilizedData({
        factSales: sales,
        dimProduct: productData
      })
    }).finally(() => {
      setRefetchData(false);
    })
  }, [refetchData])

  useEffect(() => {
    if (!refetchData) return;
    fetchSalesDetails();
  }, [clientInfo, clientProposedPrice, refetchData])

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

