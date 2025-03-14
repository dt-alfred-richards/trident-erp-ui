"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PurchaseOrderTimeline } from "@/components/procurement/purchase-order-timeline"

export function PurchaseOrderTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Order Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <PurchaseOrderTimeline />
      </CardContent>
    </Card>
  )
}

