"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"

interface CustomerTypeBreakdownProps {
  timeRange: string
}

export function CustomerTypeBreakdown({ timeRange }: CustomerTypeBreakdownProps) {
  // This would come from your API in a real application
  const customerTypeData = {
    week: [
      { name: "Corporate", value: 120000, growth: 12.5, color: "#6610f2" },
      { name: "Distributor", value: 85000, growth: 8.2, color: "#f8285a" },
      { name: "Wholeseller", value: 65000, growth: 5.8, color: "#43ced7" },
      { name: "Hotels&Restaurants", value: 50000, growth: 9.3, color: "#1b84ff" },
    ],
    month: [
      { name: "Corporate", value: 520000, growth: 14.2, color: "#6610f2" },
      { name: "Distributor", value: 380000, growth: 9.5, color: "#f8285a" },
      { name: "Wholeseller", value: 280000, growth: 7.8, color: "#43ced7" },
      { name: "Hotels&Restaurants", value: 220000, growth: 11.5, color: "#1b84ff" },
    ],
    quarter: [
      { name: "Corporate", value: 1580000, growth: 15.7, color: "#6610f2" },
      { name: "Distributor", value: 1150000, growth: 11.2, color: "#f8285a" },
      { name: "Wholeseller", value: 850000, growth: 8.4, color: "#43ced7" },
      { name: "Hotels&Restaurants", value: 680000, growth: 12.8, color: "#1b84ff" },
    ],
    custom: [
      { name: "Corporate", value: 980000, growth: 13.5, color: "#6610f2" },
      { name: "Distributor", value: 750000, growth: 10.2, color: "#f8285a" },
      { name: "Wholeseller", value: 520000, growth: 7.8, color: "#43ced7" },
      { name: "Hotels&Restaurants", value: 420000, growth: 11.2, color: "#1b84ff" },
    ],
  }

  const data = customerTypeData[timeRange as keyof typeof customerTypeData] || customerTypeData["month"]

  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}L`
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`
    }
    return `₹${value}`
  }

  return (
    <div className="p-6 pt-0">
      <div className="grid grid-cols-2 gap-4 mb-4">
        {data.map((customerType, index) => (
          <div key={customerType.name} className="flex flex-col p-3 rounded-lg bg-muted/30">
            <div className="flex justify-between items-center mb-1">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{customerType.name}</span>
                <span className="text-xs text-muted-foreground">Customer Type</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                +{customerType.growth}%
              </Badge>
            </div>
            <span className="text-lg font-bold">{formatRevenue(customerType.value)}</span>
          </div>
        ))}
      </div>

      <div className="h-[200px]">
        <ChartContainer
          config={{
            value: {
              label: "Revenue",
              color: "#6610f2", // Using Corporate color as the default
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis hide={true} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    content={({ payload, label }) => {
                      if (payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">Customer Type</p>
                            <p className="text-sm font-medium">{formatRevenue(data.value)}</p>
                            <p className="text-xs text-green-600">+{data.growth}% growth</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                }
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
