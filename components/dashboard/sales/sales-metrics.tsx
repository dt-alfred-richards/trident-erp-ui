"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, TrendingUp, ShoppingCart, Users, CreditCard } from "lucide-react"
import { useTimeRange } from "../common/use-time-range"
import { useMemo } from "react"
import { useOrders } from "@/contexts/order-context"
import { convertToChart } from "./dashboard-helper"
import { formatNumberIndian, getCummulativeSum } from "@/components/generic"

interface SalesMetricsProps {
  timeRange: string
}

export function SalesMetrics({ timeRange }: SalesMetricsProps) {
  // This would come from your API in a real application
  const { timeRange: tRange, startDate, endDate, handleTimeRangeChange, setStartDate, setEndDate } = useTimeRange(timeRange)

  const { orders, clientMapper } = useOrders()
  const chartData = useMemo(() => {
    return convertToChart(orders.map(item => ({ date: item.modifiedOn || item.createdAt, total: item.total })))
  }, [orders]);

  const clientCharts = useMemo(() => {
    return convertToChart(Object.values(clientMapper).map(item => ({ date: item.modifiedOn || item.createdOn, total: 0 })))
  }, [clientMapper])

  const metricsData = useMemo(() => {
    const weekRevenue = getCummulativeSum({ key: "revenue", refObject: chartData["week"] }),
      monthRevenue = getCummulativeSum({ key: "revenue", refObject: chartData["month"] }),
      quaterRevenue = getCummulativeSum({ key: "revenue", refObject: chartData["quarter"] }),
      customRevenue = getCummulativeSum({ key: "revenue", refObject: chartData["custom"] })
    return ({
      week: {
        revenue: {
          value: formatNumberIndian(weekRevenue), change: ""
        },
        orders: { value: chartData.week.length, change: "" },
        customers: { value: clientCharts["week"].length, change: "" },
        avgOrderValue: { value: formatNumberIndian(weekRevenue / chartData.week.length), change: "" },
      },
      month: {
        revenue: {
          value: formatNumberIndian(monthRevenue), change: ""
        },
        orders: { value: chartData.month.length, change: "" },
        customers: { value: clientCharts["month"].length, change: "" },
        avgOrderValue: { value: formatNumberIndian(monthRevenue / chartData.month.length), change: "" },
      },
      quarter: {
        revenue: {
          value: formatNumberIndian(quaterRevenue), change: ""
        },
        orders: { value: chartData.quarter.length, change: "" },
        customers: { value: clientCharts["quarter"].length, change: "" },
        avgOrderValue: { value: formatNumberIndian(quaterRevenue / chartData.quarter.length), change: "" },
      },
      custom: {
        revenue: {
          value: formatNumberIndian(customRevenue), change: ""
        },
        orders: { value: chartData.custom.length, change: "" },
        customers: { value: clientCharts["custom"].length, change: "" },
        avgOrderValue: { value: formatNumberIndian(customRevenue / chartData.custom.length), change: "" },
      },
    })
  }, [chartData, clientCharts])

  const data = metricsData[timeRange as keyof typeof metricsData] || metricsData["month"]

  // Helper function to get time period label
  const getTimePeriodLabel = () => {
    switch (timeRange) {
      case "week":
        return "This week"
      case "month":
        return "This month"
      case "quarter":
        return "This quarter"
      case "custom":
        return "Custom period"
      default:
        return "This month"
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Revenue Card */}
      <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{data.revenue.value}</h3>
                <div className="flex items-center text-xs font-medium text-green-500">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {data.revenue.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Card */}
      <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{data.orders.value}</h3>
                <div className="flex items-center text-xs font-medium text-green-500">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {data.orders.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Card */}
      <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{data.customers.value}</h3>
                <div className="flex items-center text-xs font-medium text-green-500">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {data.customers.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
            </div>
            <div className="rounded-full bg-green-500/10 p-3">
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AOV Card */}
      <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{data.avgOrderValue.value}</h3>
                <div className="flex items-center text-xs font-medium text-green-500">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {data.avgOrderValue.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
            </div>
            <div className="rounded-full bg-amber-500/10 p-3">
              <CreditCard className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
