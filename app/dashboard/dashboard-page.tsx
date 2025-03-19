"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { Overview } from "@/components/overview"
import { SalesAnalyticsTab } from "@/components/dashboard/sales/sales-analytics-tab"
import { ProductionAnalyticsTab } from "@/components/dashboard/production/production-analytics-tab"
import { InventoryAnalyticsTab } from "@/components/dashboard/inventory/inventory-analytics-tab"
import { LogisticsAnalyticsTab } from "@/components/dashboard/logistics/logistics-analytics-tab"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Dashboard Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="production">Production</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Overview />
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6 mt-0">
          <SalesAnalyticsTab />
        </TabsContent>

        {/* Production Tab */}
        <TabsContent value="production" className="space-y-6 mt-0">
          <ProductionAnalyticsTab />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6 mt-0">
          <InventoryAnalyticsTab />
        </TabsContent>

        {/* Logistics Tab */}
        <TabsContent value="logistics" className="space-y-6 mt-0">
          <LogisticsAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

