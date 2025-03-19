"use client"

import { TrendingUp } from "lucide-react"
import { ResponsiveContainer, CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface RevenueChartProps {
  timeRange: string
}

export function RevenueChart({ timeRange }: RevenueChartProps) {
  // This would come from your API in a real application
  const revenueData = {
    week: [
      { date: "Monday", revenue: 42000 },
      { date: "Tuesday", revenue: 38000 },
      { date: "Wednesday", revenue: 55000 },
      { date: "Thursday", revenue: 47000 },
      { date: "Friday", revenue: 63000 },
      { date: "Saturday", revenue: 42000 },
      { date: "Sunday", revenue: 33000 },
    ],
    month: Array.from({ length: 4 }, (_, i) => {
      const week = i + 1
      const randomFactor = 0.7 + Math.random() * 0.6
      return {
        date: `Week ${week}`,
        revenue: Math.round(80000 * randomFactor),
      }
    }),
    quarter: Array.from({ length: 3 }, (_, i) => {
      const month = ["Jan", "Feb", "Mar"][i]
      const randomFactor = 0.7 + Math.random() * 0.6
      return {
        date: month,
        revenue: Math.round(320000 * randomFactor),
      }
    }),
    custom: Array.from({ length: 5 }, (_, i) => {
      const day = i + 1
      const randomFactor = 0.7 + Math.random() * 0.6
      return {
        date: `Day ${day}`,
        revenue: Math.round(50000 * randomFactor),
      }
    }),
  }

  const data = revenueData[timeRange as keyof typeof revenueData] || revenueData["month"]

  // Calculate growth percentage
  const firstValue = data[0]?.revenue || 0
  const lastValue = data[data.length - 1]?.revenue || 0
  const growthPercentage = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0

  // Get period description
  const periodDescription =
    timeRange === "week"
      ? "Last week"
      : timeRange === "month"
        ? "Last month"
        : timeRange === "quarter"
          ? "Last quarter"
          : "Custom period"

  // Format revenue for tooltip and axis
  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}L`
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`
    }
    return `₹${value}`
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm font-medium text-primary">{formatRevenue(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>{periodDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                hide={true} // Hide the Y-axis completely
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={false} // Remove the vertical line cursor
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--chart-1))" // Use the chart-1 color from our theme
                strokeWidth={2}
                dot={{
                  fill: "hsl(var(--chart-1))",
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: "hsl(var(--chart-1))",
                  strokeWidth: 2,
                  fill: "hsl(var(--background))",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending {growthPercentage > 0 ? "up" : "down"} by {Math.abs(growthPercentage).toFixed(1)}% this period{" "}
          <TrendingUp className={`h-4 w-4 ${growthPercentage > 0 ? "text-green-500" : "text-red-500"}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total revenue for the {periodDescription.toLowerCase()}
        </div>
      </CardFooter>
    </Card>
  )
}

