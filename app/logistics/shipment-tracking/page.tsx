import { LogisticsDashboard } from "@/components/logistics/logistics-dashboard"
import { LogisticsProvider } from "./logistics-context"
import { VehicleProvider } from "@/components/logistics/vehicle-context"

export default function ShipmentTrackingPage() {
  return (
    <VehicleProvider>
      <LogisticsProvider>
        <LogisticsDashboard />
      </LogisticsProvider>
    </VehicleProvider>
  )
}
