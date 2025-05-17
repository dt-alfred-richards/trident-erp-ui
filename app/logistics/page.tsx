import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Truck, Users } from "lucide-react"

export default function LogisticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Logistics Management</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipment Tracking
            </CardTitle>
            <CardDescription>
              Track and manage all shipments, dispatch orders, and monitor delivery status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/logistics/shipment-tracking">Go to Shipment Tracking</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Vehicles & Drivers
            </CardTitle>
            <CardDescription>Manage your fleet of vehicles and driver information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/logistics/vehicles-drivers">Go to Vehicles & Drivers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
