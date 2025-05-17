"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

// Sample data for pending orders by product
const pendingOrdersData = [
  { name: "500ml", value: 12 },
  { name: "750ml", value: 8 },
  { name: "1000ml", value: 15 },
  { name: "Premium", value: 7 },
]

const COLORS = ["#43ced7", "#f8285a", "#6610f2", "#2cd07e", "#1b84ff", "#f27104"]
const DARK_COLORS = ["#4da0ff", "#65e6ee", "#50e69a", "#ff5a7d", "#b8e6d9", "#3ba8c4"]

export function PendingOrdersChart() {
  // Calculate total pending orders
  const totalPendingOrders = pendingOrdersData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="h-full w-full">
      <CardHeader className="dark:border-gray-700">
        <CardTitle className="text-foreground">Pending Orders by Product</CardTitle>
        <CardDescription className="text-muted-foreground">
          Distribution of {totalPendingOrders} pending orders
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ChartContainer
          config={{
            "500ml": {
              label: "500ml",
              theme: {
                light: "#6610f2",
                dark: "#6610f2",
              },
            },
            "750ml": {
              label: "750ml",
              theme: {
                light: "#43ced7",
                dark: "#43ced7",
              },
            },
            "1000ml": {
              label: "1000ml",
              theme: {
                light: "#dadada",
                dark: "#dadada",
              },
            },
            Premium: {
              label: "Premium",
              theme: {
                light: "#f8285a",
                dark: "#f8285a",
              },
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pendingOrdersData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                {pendingOrdersData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                ))}
              </Pie>
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
                            {entry.value} orders
                          </p>
                        ))}
                        <p className="text-xs text-muted-foreground mt-1">
                          Total: {payload.reduce((sum, entry) => sum + entry.value, 0)} orders
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
                wrapperStyle={{ outline: "none" }}
              />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="text-sm text-muted-foreground mt-2">
          1000ml bottles represent the highest demand at 36% of pending orders, suggesting a need to prioritize their
          production.
        </div>
      </CardContent>
    </Card>
  )
}
