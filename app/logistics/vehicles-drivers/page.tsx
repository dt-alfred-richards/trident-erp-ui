import { VehicleProvider } from "@/components/logistics/vehicle-context"
import { VehiclesDriversDashboard } from "@/components/logistics/vehicles-drivers-dashboard"

export default function VehiclesDriversPage() {
  return <VehicleProvider>
    <VehiclesDriversDashboard />
  </VehicleProvider>
}
