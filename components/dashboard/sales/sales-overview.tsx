"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, TrendingUp, Users, Package, CreditCard } from "lucide-react"

interface SalesOverviewProps {
  timeRange: string
}

export function SalesOverview({ timeRange }: SalesOverviewProps) {
  // This would come from your API in a real application
  const overviewData = {
    week: {
      revenue: { value: "₹3.2L", change: "+8.2%", trend: "up" },
      orders: { value: "42", change: "+12.5%", trend: "up" },
      customers: { value: "18", change: "-3.1%", trend: "down" },
      avgOrderValue: { value: "₹7,619", change: "+4.3%", trend: "up" },
    },
    month: {
      revenue: { value: "₹14.5L", change: "+12.3%", trend: "up" },
      orders: { value: "186", change: "+8.7%", trend: "up" },
      customers: { value: "64", change: "+5.2%", trend: "up" },
      avgOrderValue: { value: "₹7,796", change: "+3.4%", trend: "up" },
    },
    quarter: {
      revenue: { value: "₹42.8L", change: "+15.7%", trend: "up" },
      orders: { value: "542", change: "+10.2%", trend: "up" },
      customers: { value: "128", change: "+7.8%", trend: "up" },
      avgOrderValue: { value: "₹7,898", change: "+5.0%", trend: "up" },
    },
    year: {
      revenue: { value: "₹168.5L", change: "+22.4%", trend: "up" },
      orders: { value: "2,154", change: "+18.3%", trend: "up" },
      customers: { value: "245", change: "+12.5%", trend: "up" },
      avgOrderValue: { value: "₹7,822", change: "+3.5%", trend: "up" },
    },
    custom: {
      revenue: { value: "₹24.6L", change: "+14.2%", trend: "up" },
      orders: { value: "312", change: "+9.8%", trend: "up" },
      customers: { value: "87", change: "+6.3%", trend: "up" },
      avgOrderValue: { value: "₹7,885", change: "+4.1%", trend: "up" },
    },
  }

  const data = overviewData[timeRange as keyof typeof overviewData] || overviewData.month

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Revenue</span>
              <span className="text-2xl font-bold">{data.revenue.value}</span>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            {data.revenue.trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className={data.revenue.trend === "up" ? "text-green-500" : "text-red-500"}>
              {data.revenue.change}
            </span>
            <span className="text-xs text-muted-foreground">vs previous period</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Orders</span>
              <span className="text-2xl font-bold">{data.orders.value}</span>
            </div>
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            {data.orders.trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className={data.orders.trend === "up" ? "text-green-500" : "text-red-500"}>{data.orders.change}</span>
            <span className="text-xs text-muted-foreground">vs previous period</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Customers</span>
              <span className="text-2xl font-bold">{data.customers.value}</span>
            </div>
            <div className="rounded-full bg-green-500/10 p-2 text-green-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            {data.customers.trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className={data.customers.trend === "up" ? "text-green-500" : "text-red-500"}>
              {data.customers.change}
            </span>
            <span className="text-xs text-muted-foreground">vs previous period</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Avg. Order Value</span>
              <span className="text-2xl font-bold">{data.avgOrderValue.value}</span>
            </div>
            <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            {data.avgOrderValue.trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className={data.avgOrderValue.trend === "up" ? "text-green-500" : "text-red-500"}>
              {data.avgOrderValue.change}
            </span>
            <span className="text-xs text-muted-foreground">vs previous period</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

