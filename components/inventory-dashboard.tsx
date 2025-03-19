"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { AllocationDashboard } from "@/components/inventory/allocation-dashboard"
import { AllocationHistory } from "@/components/inventory/allocation-history"

export function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState("inventory")

  return (
    <div className="space-y-4">
      <Tabs defaultValue="inventory" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">Inventory Levels</TabsTrigger>
          <TabsTrigger value="allocation">Manual Allocation</TabsTrigger>
          <TabsTrigger value="history">Allocation History</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <InventoryTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <AllocationDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <AllocationHistory />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

