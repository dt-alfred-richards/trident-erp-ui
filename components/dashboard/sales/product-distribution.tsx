"use client"

import { TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"

interface ProductDistributionProps {
  timeRange: string
  useShadcnChart?: boolean
}

export function ProductDistribution({ timeRange }: ProductDistributionProps) {
  // This would come from your API in a real application
  const productData = {
    "7d": [
      { name: "500ml", value: 120000, percentage: 38 },
      { name: "750ml", value: 85000, percentage: 27 },
      { name: "1000ml", value: 65000, percentage: 20 },
      { name: "2000ml", value: 35000, percentage: 11 },
      { name: "Custom-A", value: 15000, percentage: 4 },
    ],
    "30d": [
      { name: "500ml", value: 520000, percentage: 36 },
      { name: "750ml", value: 420000, percentage: 29 },
      { name: "1000ml", value: 280000, percentage: 19 },
      { name: "2000ml", value: 160000, percentage: 11 },
      { name: "Custom-A", value: 70000, percentage: 5 },
    ],
    "90d": [
      { name: "500ml", value: 1520000, percentage: 35 },
      { name: "750ml", value: 1280000, percentage: 30 },
      { name: "1000ml", value: 850000, percentage: 20 },
      { name: "2000ml", value: 450000, percentage: 11 },
      { name: "Custom-A", value: 180000, percentage: 4 },
    ],
    "12m": [
      { name: "500ml", value: 5800000, percentage: 34 },
      { name: "750ml", value: 5200000, percentage: 31 },
      { name: "1000ml", value: 3400000, percentage: 20 },
      { name: "2000ml", value: 1800000, percentage: 11 },
      { name: "Custom-A", value: 650000, percentage: 4 },
    ],
    custom: [
      { name: "500ml", value: 850000, percentage: 35 },
      { name: "750ml", value: 720000, percentage: 29 },
      { name: "1000ml", value: 480000, percentage: 20 },
      { name: "2000ml", value: 280000, percentage: 11 },
      { name: "Custom-A", value: 130000, percentage: 5 },
    ],
  }

  // Map the time range selector values to the data keys
  const getDataKey = (range: string) => {
    switch (range) {
      case "week":
        return "7d"
      case "month":
        return "30d"
      case "quarter":
        return "90d"
      case "year":
        return "12m"
      case "custom":
        return "custom"
      default:
        return "30d"
    }
  }

  const dataKey = getDataKey(timeRange)
  const data = productData[dataKey as keyof typeof productData] || productData["30d"]

  // Calculate growth percentage (this would come from your API in a real application)
  const growthPercentage =
    dataKey === "7d" ? 4.8 : dataKey === "30d" ? 5.2 : dataKey === "90d" ? 6.5 : dataKey === "12m" ? 8.3 : 5.7

  // Period description based on timeRange
  const periodDescription =
    dataKey === "7d"
      ? "Last 7 days"
      : dataKey === "30d"
        ? "Last 30 days"
        : dataKey === "90d"
          ? "Last 90 days"
          : dataKey === "12m"
            ? "Last 12 months"
            : "Custom period"

  const COLORS = ["#1b84ff", "#43ced7", "#818992", "#725af2", "#2cd07e", "#198ca8"]

  const chartConfig = {
    value: {
      label: "Sales",
    },
    "500ml": {
      label: "500ml",
      color: "#1b84ff",
    },
    "750ml": {
      label: "750ml",
      color: "#43ced7",
    },
    "1000ml": {
      label: "1000ml",
      color: "#818992",
    },
    "2000ml": {
      label: "2000ml",
      color: "#725af2",
    },
    "Custom-A": {
      label: "Custom-A",
      color: "#2cd07e",
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle>Product Distribution</CardTitle>
        <CardDescription>{periodDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pt-0">
        <ChartContainer config={chartConfig} className="w-full max-w-[280px] aspect-square">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(data.value)}
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">{data.percentage}%</span> of total sales
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
                wrapperStyle={{ outline: "none" }}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="w-full mt-4">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {data.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs">
                  {entry.name} ({entry.percentage}%)
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 font-medium text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Trending up by {growthPercentage}% this period</span>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-1">
            Showing sales distribution by product category
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
