"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogisticsTable } from "@/components/logistics/logistics-table"
import { ShipmentTrackingHeader } from "@/components/logistics/shipment-tracking-header"

export function LogisticsDashboard() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <ShipmentTrackingHeader>
            <TabsList>
              <TabsTrigger value="all">All Shipments</TabsTrigger>
              <TabsTrigger value="ready">Ready for Dispatch</TabsTrigger>
              <TabsTrigger value="dispatched">Out for Delivery</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
          </ShipmentTrackingHeader>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <LogisticsTable status="all" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <LogisticsTable status="ready" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispatched" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <LogisticsTable status="dispatched" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <LogisticsTable status="delivered" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

