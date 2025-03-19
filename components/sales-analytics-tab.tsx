"use client"

import { BarChart3 } from "lucide-react"
import { SalesMetrics } from "@/components/dashboard/sales/sales-metrics"
import { RevenueChart } from "@/components/dashboard/sales/revenue-chart"
import { ProductDistribution } from "@/components/dashboard/sales/product-distribution"
import { CustomerInsights } from "@/components/dashboard/sales/customer-insights"
import { RegionalBreakdown } from "@/components/dashboard/sales/regional-breakdown"
import { SalesPerformance } from "@/components/dashboard/sales/sales-performance"
import { DashboardHeader } from "@/components/dashboard/common/dashboard-header"
import { ChartCard } from "@/components/dashboard/common/chart-card"
import { useTimeRange } from "@/components/dashboard/common/use-time-range"

export function SalesAnalyticsTab() {
  const { timeRange, startDate, endDate, handleTimeRangeChange, setStartDate, setEndDate } = useTimeRange("month")

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <DashboardHeader
        icon={<BarChart3 className="h-5 w-5 text-primary" />}
        title="Sales Performance Dashboard"
        description="Comprehensive view of your sales metrics and trends"
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Key metrics */}
      <SalesMetrics timeRange={timeRange} />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend - takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <RevenueChart timeRange={timeRange} />
        </div>

        {/* Product distribution - takes 1/3 of the width on large screens */}
        <ProductDistribution timeRange={timeRange} />
      </div>

      {/* Secondary content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer insights */}
        <ChartCard title="Customer Insights" description="Top customers by revenue">
          <CustomerInsights timeRange={timeRange} />
        </ChartCard>

        {/* Regional breakdown */}
        <ChartCard title="Regional Breakdown" description="Sales distribution by region">
          <RegionalBreakdown timeRange={timeRange} />
        </ChartCard>
      </div>

      {/* Sales performance */}
      <ChartCard title="Sales Performance" description="Detailed breakdown of sales metrics">
        <SalesPerformance timeRange={timeRange} />
      </ChartCard>
    </div>
  )
}

