import type { ReactNode } from "react"

interface ShipmentTrackingHeaderProps {
  children: ReactNode
}

export function ShipmentTrackingHeader({ children }: ShipmentTrackingHeaderProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Shipment Tracking</h2>
      {children}
    </div>
  )
}

