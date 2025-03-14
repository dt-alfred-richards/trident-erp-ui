"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LowStockAlerts } from "@/components/procurement/low-stock-alerts"
import { PendingRequisitions } from "@/components/procurement/pending-requisitions"
import { OpenPurchaseOrders } from "@/components/procurement/open-purchase-orders"
import { SupplierPerformance } from "@/components/procurement/supplier-performance"

export function DashboardCards() {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <LowStockAlerts />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Requisitions</CardTitle>
          </CardHeader>
          <CardContent>
            <PendingRequisitions />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Open Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <OpenPurchaseOrders />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Supplier Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <SupplierPerformance />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

