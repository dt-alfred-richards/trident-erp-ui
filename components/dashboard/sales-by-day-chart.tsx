"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer, Tooltip } from "recharts"

// Sample data for the chart
const salesData = [
  {
    day: "Mon",
    currentWeek: 42000,
    previousWeek: 35000,
  },
  {
    day: "Tue",
    currentWeek: 53000,
    previousWeek: 48000,
  },
  {
    day: "Wed",
    currentWeek: 58000,
    previousWeek: 62000,
  },
  {
    day: "Thu",
    currentWeek: 65000,
    previousWeek: 51000,
  },
  {
    day: "Fri",
    currentWeek: 75000,
    previousWeek: 68000,
  },
  {
    day: "Sat",
    currentWeek: 85000,
    previousWeek: 72000,
  },
  {
    day: "Sun",
    currentWeek: 52000,
    previousWeek: 48000,
  },
]

// Define colors for donut charts elsewhere
const COLORS = ["#7db1f5", "#c3d3db", "#77878f", "#3284f0", "#9ad9ca", "#198ca8"]

export function SalesByDayChart() {
  // Format currency for the tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format currency for the Y-axis (shorter format)
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `₹${value / 1000}K`
    }
    return `₹${value}`
  }

  return (
    <Card className="h-full w-full">
      <CardHeader className="dark:border-gray-700">
        <CardTitle className="text-foreground">Sales by Day of Week</CardTitle>
        <CardDescription className="text-muted-foreground">
          Comparison of current week vs previous week sales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            currentWeek: {
              label: "Current Week",
              theme: {
                light: "#1b84ff",
                dark: "#1b84ff",
              },
            },
            previousWeek: {
              label: "Previous Week",
              theme: {
                light: "#dadada",
                dark: "#dadada",
              },
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="day" stroke="currentColor" />
              <YAxis tickFormatter={formatYAxis} stroke="currentColor" />
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
              <Legend />
              <Bar
                dataKey="currentWeek"
                name="Current Week"
                fill="var(--color-currentWeek)"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="previousWeek"
                name="Previous Week"
                fill="var(--color-previousWeek)"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
