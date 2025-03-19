"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function InventoryChart() {
  // This would come from your API in a real application
  const inventoryData = [
    {
      name: "500ml",
      available: 250,
      reserved: 1000,
      inProduction: 2000,
    },
    {
      name: "750ml",
      available: 1200,
      reserved: 0,
      inProduction: 1500,
    },
    {
      name: "1000ml",
      available: 200,
      reserved: 600,
      inProduction: 1000,
    },
    {
      name: "2000ml",
      available: 1000,
      reserved: 500,
      inProduction: 500,
    },
    {
      name: "Custom-A",
      available: 0,
      reserved: 0,
      inProduction: 800,
    },
  ]

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={inventoryData}
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
          <Tooltip />
          <Bar dataKey="available" stackId="a" fill="#4f46e5" name="Available" />
          <Bar dataKey="reserved" stackId="a" fill="#94a3b8" name="Reserved" />
          <Bar dataKey="inProduction" stackId="a" fill="#f59e0b" name="In Production" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

