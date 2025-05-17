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
                        {entry.value.toLocaleString()} units
                      </p>
                    ))}
                    <p className="text-xs text-muted-foreground mt-1">
                      Total: {payload.reduce((sum, entry) => sum + entry.value, 0).toLocaleString()} units
                    </p>
                  </div>
                )
              }
              return null
            }}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar dataKey="available" stackId="a" fill="#4882d9" name="Available" barSize={12} />
          <Bar dataKey="reserved" stackId="a" fill="#c2d6f3" name="Reserved" barSize={12} />
          <Bar dataKey="inProduction" stackId="a" fill="#94a3b8" name="In Production" barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
