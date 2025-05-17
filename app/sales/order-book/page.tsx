import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { SalesDashboard } from "@/components/sales/sales-dashboard"
import { SalesProvider } from "@/components/context/Sales/sales-context"
import { OrderProvider } from "@/contexts/order-context"

export const metadata: Metadata = {
  title: "Order Book",
  description: "Manage sales orders and customer requests",
}

export default function OrderBookPage() {
  return (
    <DashboardShell>
      <OrderProvider>
        <SalesDashboard />
      </OrderProvider>
    </DashboardShell>
  )
}
