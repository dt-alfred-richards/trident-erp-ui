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
import { HRAnalyticsTab } from "@/components/dashboard/hr/hr-analytics-tab"
import { FinanceAnalyticsTab } from "@/components/dashboard/finance/finance-analytics-tab"
import { ChevronRight } from "lucide-react"

// Update the DashboardPage component to include a custom breadcrumb
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  // Create a custom breadcrumb based on the active tab
  const renderCustomBreadcrumb = () => {
    return (
      <nav className="flex items-center text-sm mb-4">
        <span className="text-muted-foreground">Home</span>
        <span className="mx-2 text-muted-foreground">
          <ChevronRight className="h-4 w-4" />
        </span>
        <span className="text-muted-foreground">Dashboard</span>
        <span className="mx-2 text-muted-foreground">
          <ChevronRight className="h-4 w-4" />
        </span>
        <span className="font-medium">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
      </nav>
    )
  }

  return (
    <div className="w-full max-w-full flex-1 space-y-6 px-0">
      {/* Custom Breadcrumb */}
      {renderCustomBreadcrumb()}

      {/* Dashboard Controls */}
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-background dark:bg-background">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="sales"
                className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Sales
              </TabsTrigger>
              <TabsTrigger
                value="production"
                className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Production
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Inventory
              </TabsTrigger>
              <TabsTrigger
                value="logistics"
                className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Logistics
              </TabsTrigger>
              <TabsTrigger
                value="hr"
                className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                HR
              </TabsTrigger>
              <TabsTrigger
                value="finance"
                className="data-[state=active]:bg-card dark:data-[state=active]:bg-card data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Finance
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 bg-[#725af2] hover:bg-[#725af2]/90 text-white border-[#725af2]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="text-xs">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-0 w-full space-y-6">
          <Overview />
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="mt-0 w-full space-y-6">
          <SalesAnalyticsTab />
        </TabsContent>

        {/* Production Tab */}
        <TabsContent value="production" className="mt-0 w-full space-y-6">
          <ProductionAnalyticsTab />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-0 w-full space-y-6">
          <InventoryAnalyticsTab />
        </TabsContent>

        {/* Logistics Tab */}
        <TabsContent value="logistics" className="mt-0 w-full space-y-6">
          <LogisticsAnalyticsTab />
        </TabsContent>

        {/* HR Tab */}
        <TabsContent value="hr" className="mt-0 w-full space-y-6">
          <HRAnalyticsTab />
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="mt-0 w-full space-y-6">
          <FinanceAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
