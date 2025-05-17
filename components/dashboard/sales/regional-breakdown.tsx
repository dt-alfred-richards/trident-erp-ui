"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"

interface RegionalBreakdownProps {
  timeRange: string
}

export function RegionalBreakdown({ timeRange }: RegionalBreakdownProps) {
  // This would come from your API in a real application
  const regionalData = {
    week: [
      { name: "Bangalore", value: 85000, growth: 8.2, region: "South" },
      { name: "Mumbai", value: 120000, growth: 12.5, region: "West" },
      { name: "Delhi", value: 65000, growth: 5.8, region: "North" },
      { name: "Chennai", value: 95000, growth: 9.3, region: "South" },
      { name: "Hyderabad", value: 78000, growth: 7.6, region: "South" },
    ],
    month: [
      { name: "Mumbai", value: 520000, growth: 14.2, region: "West" },
      { name: "Bangalore", value: 480000, growth: 9.5, region: "South" },
      { name: "Delhi", value: 380000, growth: 7.8, region: "North" },
      { name: "Hyderabad", value: 420000, growth: 11.5, region: "South" },
      { name: "Pune", value: 350000, growth: 10.2, region: "West" },
    ],
    quarter: [
      { name: "Mumbai", value: 1580000, growth: 15.7, region: "West" },
      { name: "Bangalore", value: 1450000, growth: 11.2, region: "South" },
      { name: "Delhi", value: 1250000, growth: 8.4, region: "North" },
      { name: "Hyderabad", value: 1280000, growth: 12.8, region: "South" },
      { name: "Chennai", value: 1150000, growth: 10.5, region: "South" },
    ],
    custom: [
      { name: "Mumbai", value: 980000, growth: 13.5, region: "West" },
      { name: "Bangalore", value: 850000, growth: 10.2, region: "South" },
      { name: "Delhi", value: 750000, growth: 7.8, region: "North" },
      { name: "Hyderabad", value: 820000, growth: 11.2, region: "South" },
      { name: "Chennai", value: 720000, growth: 9.5, region: "South" },
    ],
  }

  const data = regionalData[timeRange as keyof typeof regionalData] || regionalData["month"]
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

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
        {data.map((city, index) => (
          <div key={city.name} className="flex flex-col p-3 rounded-lg bg-muted/30">
            <div className="flex justify-between items-center mb-1">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{city.name}</span>
                <span className="text-xs text-muted-foreground">{city.region}</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                +{city.growth}%
              </Badge>
            </div>
            <span className="text-lg font-bold">{formatRevenue(city.value)}</span>
          </div>
        ))}
      </div>

      <div className="h-[200px]">
        <ChartContainer
          config={{
            value: {
              label: "Revenue",
              color: "hsl(var(--chart-1))",
            },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis hide={true} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
                        <p className="font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-muted-foreground">
                            <span className="font-medium" style={{ color: entry.color }}>
                              {entry.name}:{" "}
                            </span>
                            ₹{entry.value.toLocaleString()}
                          </p>
                        ))}
                        <p className="text-xs text-muted-foreground mt-1">
                          Total: ₹{payload.reduce((sum, entry) => sum + entry.value, 0).toLocaleString()}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
                wrapperStyle={{ outline: "none" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}
