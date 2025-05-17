"use client"

import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface RegionalSalesProps {
  timeRange: string
}

export function RegionalSales({ timeRange }: RegionalSalesProps) {
  // This would come from your API in a real application
  const regionalData = {
    week: [
      { name: "North", value: 85000, growth: 8.2 },
      { name: "South", value: 120000, growth: 12.5 },
      { name: "East", value: 65000, growth: 5.8 },
      { name: "West", value: 95000, growth: 9.3 },
    ],
    month: [
      { name: "North", value: 380000, growth: 9.5 },
      { name: "South", value: 520000, growth: 14.2 },
      { name: "East", value: 280000, growth: 7.8 },
      { name: "West", value: 420000, growth: 11.5 },
    ],
    quarter: [
      { name: "North", value: 1150000, growth: 11.2 },
      { name: "South", value: 1580000, growth: 15.7 },
      { name: "East", value: 850000, growth: 8.4 },
      { name: "West", value: 1280000, growth: 12.8 },
    ],
    year: [
      { name: "North", value: 4500000, growth: 14.5 },
      { name: "South", value: 6200000, growth: 18.2 },
      { name: "East", value: 3400000, growth: 10.8 },
      { name: "West", value: 5100000, growth: 15.3 },
    ],
    custom: [
      { name: "North", value: 750000, growth: 10.2 },
      { name: "South", value: 980000, growth: 13.5 },
      { name: "East", value: 520000, growth: 7.8 },
      { name: "West", value: 820000, growth: 11.2 },
    ],
  }

  const data = regionalData[timeRange as keyof typeof regionalData] || regionalData.month

  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(2)}L`
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`
    }
    return `₹${value}`
  }

  return (
    <div className="h-[300px]">
      <ChartContainer
        config={{
          value: {
            label: "Revenue",
            color: "#4882d9",
          },
          growth: {
            label: "Growth %",
            color: "#c2d6f3",
          },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" tickFormatter={formatRevenue} />
            <YAxis yAxisId="right" orientation="right" unit="%" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar yAxisId="left" dataKey="value" fill="#4882d9" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar yAxisId="right" dataKey="growth" fill="#c2d6f3" radius={[4, 4, 0, 0]} barSize={12} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
