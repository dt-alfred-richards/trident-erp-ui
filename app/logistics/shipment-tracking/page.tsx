import { LogisticsProvider } from "@/hooks/use-logistics-data"
import { LogisticsDashboard } from "@/components/logistics/logistics-dashboard"

export default function ShipmentTrackingPage() {
    return (
        <LogisticsProvider>
            <LogisticsDashboard />
        </LogisticsProvider>
    )
}
