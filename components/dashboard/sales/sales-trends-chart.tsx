"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SalesTrendsChartProps {
  timeRange: string
}

export function SalesTrendsChart({ timeRange }: SalesTrendsChartProps) {
  // This would come from your API in a real application
  const salesData = {
    week: [
      { name: "Mon", revenue: 42000, orders: 5 },
      { name: "Tue", revenue: 38000, orders: 4 },
      { name: "Wed", revenue: 55000, orders: 7 },
      { name: "Thu", revenue: 47000, orders: 6 },
      { name: "Fri", revenue: 63000, orders: 8 },
      { name: "Sat", revenue: 42000, orders: 6 },
      { name: "Sun", revenue: 33000, orders: 4 },
    ],
    month: [
      { name: "Week 1", revenue: 320000, orders: 40 },
      { name: "Week 2", revenue: 380000, orders: 48 },
      { name: "Week 3", revenue: 420000, orders: 52 },
      { name: "Week 4", revenue: 330000, orders: 46 },
    ],
    quarter: [
      { name: "Jan", revenue: 1250000, orders: 160 },
      { name: "Feb", revenue: 1450000, orders: 186 },
      { name: "Mar", revenue: 1580000, orders: 196 },
    ],
    year: [
      { name: "Q1", revenue: 4280000, orders: 542 },
      { name: "Q2", revenue: 4850000, orders: 612 },
      { name: "Q3", revenue: 3950000, orders: 498 },
      { name: "Q4", revenue: 5770000, orders: 502 },
    ],
    custom: [
      { name: "Period 1", revenue: 850000, orders: 105 },
      { name: "Period 2", revenue: 920000, orders: 112 },
      { name: "Period 3", revenue: 690000, orders: 95 },
    ],
  }

  const data = salesData[timeRange as keyof typeof salesData] || salesData.month

  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(2)}L`
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`
    }
    return `₹${value}`
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="combined">Combined</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="pt-4">
          <div className="h-[350px]">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatRevenue} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="pt-4">
          <div className="h-[350px]">
            <ChartContainer
              config={{
                orders: {
                  label: "Orders",
                  color: "hsl(var(--chart-2))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="combined" className="pt-4">
          <div className="h-[350px]">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
                orders: {
                  label: "Orders",
                  color: "hsl(var(--chart-2))",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" tickFormatter={formatRevenue} />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--color-orders)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

