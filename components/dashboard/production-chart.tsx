"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ProductionChartProps {
  timeRange: string
}

export function ProductionChart({ timeRange }: ProductionChartProps) {
  // This would come from your API in a real application
  const productionData = {
    day: [
      { name: "8 AM", actual: 200, target: 250 },
      { name: "10 AM", actual: 450, target: 500 },
      { name: "12 PM", actual: 700, target: 750 },
      { name: "2 PM", actual: 950, target: 1000 },
      { name: "4 PM", actual: 1200, target: 1250 },
      { name: "6 PM", actual: 1500, target: 1500 },
    ],
    week: [
      { name: "Mon", actual: 1500, target: 1500 },
      { name: "Tue", actual: 1400, target: 1500 },
      { name: "Wed", actual: 1600, target: 1500 },
      { name: "Thu", actual: 1450, target: 1500 },
      { name: "Fri", actual: 1550, target: 1500 },
      { name: "Sat", actual: 800, target: 800 },
      { name: "Sun", actual: 0, target: 0 },
    ],
    month: [
      { name: "Week 1", actual: 7300, target: 7500 },
      { name: "Week 2", actual: 7800, target: 7500 },
      { name: "Week 3", actual: 7200, target: 7500 },
      { name: "Week 4", actual: 7600, target: 7500 },
    ],
    quarter: [
      { name: "Jan", actual: 30000, target: 30000 },
      { name: "Feb", actual: 28000, target: 30000 },
      { name: "Mar", actual: 32000, target: 30000 },
    ],
  }

  const data = productionData[timeRange as keyof typeof productionData] || productionData.week

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => [value.toLocaleString(), ""]} />
          <Legend />
          <Line type="monotone" dataKey="actual" stroke="#4f46e5" name="Actual" strokeWidth={2} />
          <Line type="monotone" dataKey="target" stroke="#94a3b8" name="Target" strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

