"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, TrendingUp, ShoppingCart, Users, CreditCard } from "lucide-react"

interface SalesMetricsProps {
  timeRange: string
}

export function SalesMetrics({ timeRange }: SalesMetricsProps) {
  // This would come from your API in a real application
  const metricsData = {
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
    custom: {
      revenue: { value: "₹24.6L", change: "+14.2%", trend: "up" },
      orders: { value: "312", change: "+9.8%", trend: "up" },
      customers: { value: "87", change: "+6.3%", trend: "up" },
      avgOrderValue: { value: "₹7,885", change: "+4.1%", trend: "up" },
    },
  }

  const data = metricsData[timeRange as keyof typeof metricsData] || metricsData["month"]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Revenue Card */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{data.revenue.value}</h3>
                <div
                  className={`flex items-center text-xs font-medium ${data.revenue.trend === "up" ? "text-green-500" : "text-red-500"}`}
                >
                  {data.revenue.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {data.revenue.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">vs. previous period</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Card */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-500/5 to-blue-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{data.orders.value}</h3>
                <div
                  className={`flex items-center text-xs font-medium ${data.orders.trend === "up" ? "text-green-500" : "text-red-500"}`}
                >
                  {data.orders.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {data.orders.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">vs. previous period</p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Card */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-green-500/5 to-green-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{data.customers.value}</h3>
                <div
                  className={`flex items-center text-xs font-medium ${data.customers.trend === "up" ? "text-green-500" : "text-red-500"}`}
                >
                  {data.customers.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {data.customers.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">vs. previous period</p>
            </div>
            <div className="rounded-full bg-green-500/10 p-3">
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AOV Card */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-amber-500/5 to-amber-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{data.avgOrderValue.value}</h3>
                <div
                  className={`flex items-center text-xs font-medium ${data.avgOrderValue.trend === "up" ? "text-green-500" : "text-red-500"}`}
                >
                  {data.avgOrderValue.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {data.avgOrderValue.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">vs. previous period</p>
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

