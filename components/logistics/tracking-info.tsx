interface TrackingInfoProps {
  trackingId?: string
  carrier?: string
  deliveryDate?: string
}

export function TrackingInfo({ trackingId, carrier, deliveryDate }: TrackingInfoProps) {
  if (!trackingId) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <div className="text-sm">
      <div>{carrier}</div>
      <div className="text-blue-600 underline cursor-pointer">{trackingId}</div>
      {deliveryDate && (
        <div className="text-xs text-muted-foreground">Delivered: {new Date(deliveryDate).toLocaleDateString()}</div>
      )}
    </div>
  )
}
