"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardCards } from "@/components/procurement/dashboard-cards"
import { SupplierComparisonTab } from "@/components/procurement/supplier-comparison-tab"
import { PurchaseOrderTab } from "@/components/procurement/purchase-order-tab"
import { GoodsReceivedTab } from "@/components/procurement/goods-received-tab"
import { CreateRequisitionDialog } from "@/components/procurement/create-requisition-dialog"

export function ProcurementDashboard() {
  const [isRequisitionDialogOpen, setIsRequisitionDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState("dashboard")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="dashboard" className="w-full" onValueChange={setSelectedTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
              <TabsTrigger value="receiving">Goods Receiving</TabsTrigger>
            </TabsList>

            <Button onClick={() => setIsRequisitionDialogOpen(true)}>Create Requisition</Button>
          </div>

          <TabsContent value="dashboard" className="space-y-4">
            <DashboardCards />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <SupplierComparisonTab />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <PurchaseOrderTab />
          </TabsContent>

          <TabsContent value="receiving" className="space-y-4">
            <GoodsReceivedTab />
          </TabsContent>
        </Tabs>
      </div>

      {isRequisitionDialogOpen && (
        <CreateRequisitionDialog open={isRequisitionDialogOpen} onOpenChange={setIsRequisitionDialogOpen} />
      )}
    </div>
  )
}

