"use client"

import { Button } from "@/components/ui/button"
import { SalesTable } from "@/components/sales/sales-table"
import { OrderTrackingKanban } from "@/components/sales/order-tracking-kanban"
import { CreateSalesOrderDialog } from "@/components/sales/create-sales-order-dialog"
import { useState } from "react"
import { PlusCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SalesDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("order-book")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white dark:bg-[#0f1729] p-4 rounded-lg shadow-sm mb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Sales Management</h2>
          <p className="text-muted-foreground">View and manage all sales orders in one place</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-1 bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-white"
        >
          <PlusCircle className="h-4 w-4" />
          New Order
        </Button>
      </div>

      <Tabs defaultValue="order-book" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-background dark:bg-background">
          <TabsTrigger
            value="order-book"
            className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:font-medium"
          >
            Order Book
          </TabsTrigger>
          <TabsTrigger
            value="order-tracking"
            className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:font-medium"
          >
            Order Tracking
          </TabsTrigger>
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
