"use client"

import { TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useOrders } from "@/contexts/order-context"
import { useMemo } from "react"
import { getCummulativeSum, getNumber } from "@/components/generic"
import { convertToChart } from "./dashboard-helper"

interface ProductDistributionProps {
  timeRange: string
  useShadcnChart?: boolean
}

export function ProductDistribution({ timeRange }: ProductDistributionProps) {
  const { clientProposedProductMapper, orders } = useOrders()

  const saleProducts = useMemo(() => {
    return orders.map(item => item.products.map(i => ({
      ...i,
      date: item.modifiedOn || item.createdAt
    }))).flat().map(item => ({ total: getNumber(item.cases + '') * getNumber(item.price + ''), date: item.date, product: item.name }))
  }, [orders])

  const products = useMemo(() => {
    return Object.values(clientProposedProductMapper).flat().map(item => ({
      id: item.id, name: item.name, date: item.modifiedOn || item.createdOn
    }))
  }, [clientProposedProductMapper])

  const chartData = useMemo(() => {
    return convertToChart(saleProducts)
  }, [saleProducts])

  // This would come from your A
  // const saleProducts = useMemo(()=>{
  // })PI in a real application
  const productData = {
    "7d": products.map(item => ({
      name: item.name, value: getCummulativeSum({ key: "revenue", refObject: chartData.week.filter(i => i?.name === item.name) })
    })),
    "30d": products.map(item => ({
      name: item.name, value: getCummulativeSum({ key: "revenue", refObject: chartData.month.filter(i => i?.name === item.name) })
    })),
    "90d": products.map(item => ({
      name: item.name, value: getCummulativeSum({ key: "revenue", refObject: chartData.quarter.filter(i => i?.name === item.name) })
    })),
    custom: products.map(item => ({
      name: item.name, value: getCummulativeSum({ key: "revenue", refObject: chartData.custom.filter(i => i?.name === item.name) })
    })),
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
