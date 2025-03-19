"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"

interface SalesForecastProps {
  timeRange: string
}

export function SalesForecast({ timeRange }: SalesForecastProps) {
  // This would come from your API in a real application
  const forecastData = {
    week: [
      { name: "Mon", actual: 42000, forecast: 40000 },
      { name: "Tue", actual: 38000, forecast: 42000 },
      { name: "Wed", actual: 55000, forecast: 45000 },
      { name: "Thu", actual: 47000, forecast: 48000 },
      { name: "Fri", actual: 63000, forecast: 52000 },
      { name: "Sat", forecast: 45000 },
      { name: "Sun", forecast: 38000 },
    ],
    month: [
      { name: "Week 1", actual: 320000, forecast: 300000 },
      { name: "Week 2", actual: 380000, forecast: 350000 },
      { name: "Week 3", actual: 420000, forecast: 400000 },
      { name: "Week 4", actual: 330000, forecast: 380000 },
      { name: "Week 5", forecast: 360000 },
    ],
    quarter: [
      { name: "Jan", actual: 1250000, forecast: 1200000 },
      { name: "Feb", actual: 1450000, forecast: 1350000 },
      { name: "Mar", actual: 1580000, forecast: 1500000 },
      { name: "Apr", forecast: 1650000 },
      { name: "May", forecast: 1720000 },
      { name: "Jun", forecast: 1800000 },
    ],
    year: [
      { name: "Q1", actual: 4280000, forecast: 4100000 },
      { name: "Q2", actual: 4850000, forecast: 4600000 },
      { name: "Q3", actual: 3950000, forecast: 4200000 },
      { name: "Q4", actual: 5770000, forecast: 5500000 },
      { name: "Q1 Next", forecast: 6100000 },
    ],
    custom: [
      { name: "Period 1", actual: 850000, forecast: 800000 },
      { name: "Period 2", actual: 920000, forecast: 880000 },
      { name: "Period 3", actual: 690000, forecast: 750000 },
      { name: "Period 4", forecast: 820000 },
      { name: "Period 5", forecast: 880000 },
    ],
  }

  const data = forecastData[timeRange as keyof typeof forecastData] || forecastData.month

  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(2)}L`
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`
    }
    return `₹${value}`
  }

  // Calculate forecast metrics
  const lastActualPeriod = data.filter((item) => item.actual).pop()
  const nextForecastPeriod = data.find((item) => item.forecast && !item.actual)

  const forecastGrowth =
    lastActualPeriod && nextForecastPeriod
      ? (((nextForecastPeriod.forecast - lastActualPeriod.actual) / lastActualPeriod.actual) * 100).toFixed(1)
      : "0.0"

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Next Period Forecast</div>
            <div className="text-2xl font-bold mt-1">
              {nextForecastPeriod ? formatRevenue(nextForecastPeriod.forecast) : "N/A"}
            </div>
            {Number.parseFloat(forecastGrowth) > 0 && (
              <div className="flex items-center gap-1 mt-1 text-green-500 text-sm">
                <ArrowUpRight className="h-3 w-3" />
                <span>{forecastGrowth}%</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Forecast Accuracy</div>
            <div className="text-2xl font-bold mt-1">94.8%</div>
            <div className="text-xs text-muted-foreground mt-1">Based on last 12 months</div>
          </CardContent>
        </Card>
      </div>

      <div className="h-[220px]">
        <ChartContainer
          config={{
            actual: {
              label: "Actual",
              color: "hsl(var(--chart-1))",
            },
            forecast: {
              label: "Forecast",
              color: "hsl(var(--chart-2))",
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
                dataKey="actual"
                stroke="var(--color-actual)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="var(--color-forecast)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

