"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ProductDistributionProps {
  timeRange: string
  useShadcnChart?: boolean
}

export function ProductDistribution({ timeRange }: ProductDistributionProps) {
  // This would come from your API in a real application
  const productData = {
    "7d": [
      { name: "500ml", value: 120000, percentage: 38, fill: "var(--color-500ml)" },
      { name: "750ml", value: 85000, percentage: 27, fill: "var(--color-750ml)" },
      { name: "1000ml", value: 65000, percentage: 20, fill: "var(--color-1000ml)" },
      { name: "2000ml", value: 35000, percentage: 11, fill: "var(--color-2000ml)" },
      { name: "Custom-A", value: 15000, percentage: 4, fill: "var(--color-custom-a)" },
    ],
    "30d": [
      { name: "500ml", value: 520000, percentage: 36, fill: "var(--color-500ml)" },
      { name: "750ml", value: 420000, percentage: 29, fill: "var(--color-750ml)" },
      { name: "1000ml", value: 280000, percentage: 19, fill: "var(--color-1000ml)" },
      { name: "2000ml", value: 160000, percentage: 11, fill: "var(--color-2000ml)" },
      { name: "Custom-A", value: 70000, percentage: 5, fill: "var(--color-custom-a)" },
    ],
    "90d": [
      { name: "500ml", value: 1520000, percentage: 35, fill: "var(--color-500ml)" },
      { name: "750ml", value: 1280000, percentage: 30, fill: "var(--color-750ml)" },
      { name: "1000ml", value: 850000, percentage: 20, fill: "var(--color-1000ml)" },
      { name: "2000ml", value: 450000, percentage: 11, fill: "var(--color-2000ml)" },
      { name: "Custom-A", value: 180000, percentage: 4, fill: "var(--color-custom-a)" },
    ],
    "12m": [
      { name: "500ml", value: 5800000, percentage: 34, fill: "var(--color-500ml)" },
      { name: "750ml", value: 5200000, percentage: 31, fill: "var(--color-750ml)" },
      { name: "1000ml", value: 3400000, percentage: 20, fill: "var(--color-1000ml)" },
      { name: "2000ml", value: 1800000, percentage: 11, fill: "var(--color-2000ml)" },
      { name: "Custom-A", value: 650000, percentage: 4, fill: "var(--color-custom-a)" },
    ],
    custom: [
      { name: "500ml", value: 850000, percentage: 35, fill: "var(--color-500ml)" },
      { name: "750ml", value: 720000, percentage: 29, fill: "var(--color-750ml)" },
      { name: "1000ml", value: 480000, percentage: 20, fill: "var(--color-1000ml)" },
      { name: "2000ml", value: 280000, percentage: 11, fill: "var(--color-2000ml)" },
      { name: "Custom-A", value: 130000, percentage: 5, fill: "var(--color-custom-a)" },
    ],
  }

  const data = productData[timeRange as keyof typeof productData] || productData["30d"]

  // Calculate growth percentage (this would come from your API in a real application)
  const growthPercentage =
    timeRange === "7d" ? 4.8 : timeRange === "30d" ? 5.2 : timeRange === "90d" ? 6.5 : timeRange === "12m" ? 8.3 : 5.7

  // Period description based on timeRange
  const periodDescription =
    timeRange === "7d"
      ? "Last 7 days"
      : timeRange === "30d"
        ? "Last 30 days"
        : timeRange === "90d"
          ? "Last 90 days"
          : timeRange === "12m"
            ? "Last 12 months"
            : "Custom period"

  const chartConfig = {
    value: {
      label: "Sales",
    },
    "500ml": {
      label: "500ml",
      color: "hsl(var(--chart-1))",
    },
    "750ml": {
      label: "750ml",
      color: "hsl(var(--chart-2))",
    },
    "1000ml": {
      label: "1000ml",
      color: "hsl(var(--chart-3))",
    },
    "2000ml": {
      label: "2000ml",
      color: "hsl(var(--chart-4))",
    },
    "Custom-A": {
      label: "Custom-A",
      color: "hsl(var(--chart-5))",
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col h-full border-0 shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle>Product Distribution</CardTitle>
        <CardDescription>{periodDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{data.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(data.value)}
                          </p>
                          <p className="text-xs font-medium">{data.percentage}% of total</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              label
              labelLine={false}
              cx="50%"
              cy="50%"
              outerRadius={80}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by {growthPercentage}% this period <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">Showing sales distribution by product category</div>
      </CardFooter>
    </Card>
  )
}

