"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function SupplierPerformance() {
  // This would come from your API in a real application
  const supplierData = [
    {
      name: "PlastiCorp Inc.",
      onTimeDelivery: 95,
      qualityScore: 92,
      costEfficiency: 88,
    },
    {
      name: "CapMakers Ltd.",
      onTimeDelivery: 88,
      qualityScore: 95,
      costEfficiency: 90,
    },
    {
      name: "Adhesive Solutions",
      onTimeDelivery: 92,
      qualityScore: 90,
      costEfficiency: 85,
    },
    {
      name: "BoxCraft Co.",
      onTimeDelivery: 78,
      qualityScore: 82,
      costEfficiency: 95,
    },
    {
      name: "Label Experts",
      onTimeDelivery: 85,
      qualityScore: 88,
      costEfficiency: 92,
    },
  ]

  // Make sure supplierData is not null or undefined before rendering
  if (!supplierData || supplierData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
        No supplier data available
      </div>
    )
  }

  return (
    <div className="w-full h-[300px]">
      <div className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={supplierData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="text-sm">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium">{label}</p>
                          {payload.map((entry) => (
                            <div key={entry.dataKey} className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-xs text-muted-foreground">
                                {entry.dataKey === "onTimeDelivery"
                                  ? "On-Time Delivery"
                                  : entry.dataKey === "qualityScore"
                                    ? "Quality Score"
                                    : "Cost Efficiency"}
                                :
                              </span>
                              <span className="text-xs font-medium">{entry.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Bar dataKey="onTimeDelivery" name="On-Time Delivery" fill="#4f46e5" />
            <Bar dataKey="qualityScore" name="Quality Score" fill="#10b981" />
            <Bar dataKey="costEfficiency" name="Cost Efficiency" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

