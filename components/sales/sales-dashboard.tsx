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
  clientId: string,
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
  units: string
}

export type OrderDetails = {
  "orderId": string,
  "productId": string,
  "cases": number,
  "tradePrice": number,
  "expectedDeliveryDate": Date,
  "status": OrderStatus,
  "clientId": string,
  "casesDelivered": number,
  "casesReserved": number,
  "addressId"?: string | null,
  "orderSubId": string,
  modifiedOn: Date,
  brand: string
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
  const { setOrders, clientProposedPrice = {}, clientInfo, refetchData, updateNonSerilizedData, setRefetchData, productInfo, clientAddress } = useOrders()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("order-book")
  const salesInstance = new DataByTableName("fact_sales");
  const orderDetails = new DataByTableName("order_details") as any;

  console.log({ clientProposedPrice })

  const getPriority = useCallback((quantity: number) => {
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
        const { brand, size = "0", sku = "", units = "" } = productInfo[productId] ?? {}
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
      const { contactNumber, email, gst, name = "", pan, reference, type, clientId } = clientInfo[item.custId] ?? {}

      const { addressLine_1 = "", addressLine_2 = "", cityDistrictState = "", pincode } = (clientAddress[clientId] ?? [])[0] ?? {}

      const address = [addressLine_1, addressLine_2, cityDistrictState, pincode].filter(item => item).join(",") ?? ""
      return ({
        createdBy: item?.createdBy ?? "",
        customerNumber: contactNumber,
        customerEmail: email,
        billingAddress: address,
        shippingAddress: address,
        customer: name,
        deliveryDate: item.expectedDeliveryDate,
        id: item.orderId,
        orderDate: item.date,
        priority: getPriority(orderProducts.reduce((acc, curr) => {
          acc += curr.quantity ?? 0;
          return acc;
        }, 0)),
        products: orderProducts,
        reference: item.referenceName,
        status: item.status,
        statusHistory: [],
        approvedAt: "",
        approvedBy: "",
        carrier: "",
        trackingId: ""
      })
    }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
  }, [clientInfo, clientProposedPrice])

  const fetchSalesDetails = useCallback(() => {
    Promise.allSettled([
      orderDetails.get(),
      salesInstance.get()
    ]).then((responses: any[]) => {
      const orderDetails = responses[0]?.value.data;
      const sales = responses[1]?.value.data;
      const data = convertSalesToOrders(sales ?? [], orderDetails)
      setOrders(data as Order[]);
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

