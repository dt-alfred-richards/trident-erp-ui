import type React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { cn } from "@/lib/utils"

interface RevenueChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
  className?: string
}

const formatRevenue = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, className }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-muted-foreground">
            <span className="font-medium" style={{ color: payload[0].color }}>
              Revenue:
            </span>{" "}
            {formatRevenue(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart width={400} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={160}
            dataKey="value"
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
