"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GoodsReceivedForm } from "@/components/procurement/goods-received-form"

export function GoodsReceivedTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Goods Received Note (GRN)</CardTitle>
      </CardHeader>
      <CardContent>
        <GoodsReceivedForm />
      </CardContent>
    </Card>
  )
}

