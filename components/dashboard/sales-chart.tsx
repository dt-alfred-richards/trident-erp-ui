"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface SalesChartProps {
  timeRange: string
}

export function SalesChart({ timeRange }: SalesChartProps) {
  // This would come from your API in a real application
  const salesData = {
    day: [
      { name: "500ml", value: 1200 },
      { name: "750ml", value: 800 },
      { name: "1000ml", value: 600 },
      { name: "2000ml", value: 300 },
      { name: "Custom-A", value: 100 },
    ],
    week: [
      { name: "500ml", value: 8500 },
      { name: "750ml", value: 5200 },
      { name: "1000ml", value: 4100 },
      { name: "2000ml", value: 2200 },
      { name: "Custom-A", value: 800 },
    ],
    month: [
      { name: "500ml", value: 32000 },
      { name: "750ml", value: 21000 },
      { name: "1000ml", value: 18500 },
      { name: "2000ml", value: 9800 },
      { name: "Custom-A", value: 3500 },
    ],
    quarter: [
      { name: "500ml", value: 95000 },
      { name: "750ml", value: 62000 },
      { name: "1000ml", value: 54000 },
      { name: "2000ml", value: 28000 },
      { name: "Custom-A", value: 12000 },
    ],
  }

  const data = salesData[timeRange as keyof typeof salesData] || salesData.week
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value.toLocaleString()} units`, "Sales"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

