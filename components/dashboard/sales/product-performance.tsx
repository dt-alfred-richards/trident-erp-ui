"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ProductPerformanceProps {
  timeRange: string
}

export function ProductPerformance({ timeRange }: ProductPerformanceProps) {
  // This would come from your API in a real application
  const productData = {
    week: [
      { name: "500ml", value: 120000, percentage: 38 },
      { name: "750ml", value: 85000, percentage: 27 },
      { name: "1000ml", value: 65000, percentage: 20 },
      { name: "2000ml", value: 35000, percentage: 11 },
      { name: "Custom-A", value: 15000, percentage: 4 },
    ],
    month: [
      { name: "500ml", value: 520000, percentage: 36 },
      { name: "750ml", value: 420000, percentage: 29 },
      { name: "1000ml", value: 280000, percentage: 19 },
      { name: "2000ml", value: 160000, percentage: 11 },
      { name: "Custom-A", value: 70000, percentage: 5 },
    ],
    quarter: [
      { name: "500ml", value: 1520000, percentage: 35 },
      { name: "750ml", value: 1280000, percentage: 30 },
      { name: "1000ml", value: 850000, percentage: 20 },
      { name: "2000ml", value: 450000, percentage: 11 },
      { name: "Custom-A", value: 180000, percentage: 4 },
    ],
    year: [
      { name: "500ml", value: 5800000, percentage: 34 },
      { name: "750ml", value: 5200000, percentage: 31 },
      { name: "1000ml", value: 3400000, percentage: 20 },
      { name: "2000ml", value: 1800000, percentage: 11 },
      { name: "Custom-A", value: 650000, percentage: 4 },
    ],
    custom: [
      { name: "500ml", value: 850000, percentage: 35 },
      { name: "750ml", value: 720000, percentage: 29 },
      { name: "1000ml", value: 480000, percentage: 20 },
      { name: "2000ml", value: 280000, percentage: 11 },
      { name: "Custom-A", value: 130000, percentage: 5 },
    ],
  }

  const data = productData[timeRange as keyof typeof productData] || productData.month
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  const formatRevenue = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(2)}L`
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`
    }
    return `₹${value}`
  }

  return (
    <div className="space-y-6">
      <div className="h-[200px]">
        <ChartContainer
          config={{
            "500ml": { label: "500ml", color: COLORS[0] },
            "750ml": { label: "750ml", color: COLORS[1] },
            "1000ml": { label: "1000ml", color: COLORS[2] },
            "2000ml": { label: "2000ml", color: COLORS[3] },
            "Custom-A": { label: "Custom-A", color: COLORS[4] },
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{formatRevenue(item.value)}</span>
                <span className="text-muted-foreground ml-2">({item.percentage}%)</span>
              </div>
            </div>
            <Progress
              value={item.percentage}
              className="h-2"
              indicatorClassName={`bg-[${COLORS[index % COLORS.length]}]`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

