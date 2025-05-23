"use client"

import { Card, CardContent } from "@/components/ui/card"
import { VehiclesTable } from "@/components/logistics/vehicles-table"
import { DriversTable } from "@/components/logistics/drivers-table"

export function VehiclesDriversDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Vehicles & Drivers Management</h1>
 
      <Card>
        <CardContent className="pt-6">
          <VehiclesTable />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <DriversTable />
        </CardContent>
      </Card>
    </div>
  )
}
