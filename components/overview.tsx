"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, Package, ShoppingCart, Truck, PackageCheck, Wallet, Building, UserCheck } from "lucide-react"
import { useOrders } from "@/contexts/order-context"
import { useProcurementData } from "@/hooks/use-procurement-data"
import { useFinance } from "@/contexts/finance-context"
import { useProductionStore } from "@/hooks/use-production-store"
import { initialEmployees } from "@/components/hr/hr-dashboard"
import { SalesByDayChart } from "@/components/dashboard/sales-by-day-chart"
import { PendingOrdersChart } from "@/components/dashboard/pending-orders-chart"
import { useState, useEffect } from "react"

export function Overview() {
  const { orders } = useOrders()
  const { openPOs } = useProcurementData()
  const { bankAccounts } = useFinance()
  const { productionData } = useProductionStore()
  const [availableStock, setAvailableStock] = useState(0)

  // Calculate total in production from production data
  const totalInProduction = productionData.reduce((sum, item) => sum + item.inProduction, 0)

  // Filter orders with status "pending_approval", "approved", or "partial_fulfillment"
  const pendingOrdersCount = orders.filter((order) =>
    ["pending_approval", "approved", "partial_fulfillment"].includes(order.status),
  ).length

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Filter purchase orders that are ready to receive (pending or partial and due today)
  const readyToReceiveCount = openPOs.filter(
    (po) => (po.status === "sent" || po.status === "partial") && po.expectedDelivery === today,
  ).length

  // For Cash in Hand, directly use 50000 as specified
  const cashInHand = 50000

  // For Cash in Bank, directly use 4700000 (sum of Current accounts: 3500000 + 1200000)
  const cashInBank = 4700000

  // Calculate today's attendance
  const totalEmployees = initialEmployees.length
  // Sample attendance data - assuming 10 out of 12 employees are present today
  const presentEmployees = 10
  const attendancePercentage = Math.round((presentEmployees / totalEmployees) * 100)

  // Format the cash amounts with commas and currency symbol
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formattedCashInHand = formatCurrency(cashInHand)
  const formattedCashInBank = formatCurrency(cashInBank)

  // Calculate the sum of available quantities from Finished Goods inventory
  useEffect(() => {
    // This is the same data used in the finished-goods page
    const finishedGoodsData = [
      {
        id: "500ml",
        name: "500ml",
        quantity: 250,
        reserved: 1000,
        type: "finished",
      },
      {
        id: "750ml",
        name: "750ml",
        quantity: 1200,
        reserved: 0,
        type: "finished",
      },
      {
        id: "1000ml",
        name: "1000ml",
        quantity: 200,
        reserved: 600,
        type: "finished",
      },
      {
        id: "2000ml",
        name: "2000ml",
        quantity: 1000,
        reserved: 500,
        type: "finished",
      },
      {
        id: "custom-a",
        name: "Custom-A",
        quantity: 0,
        reserved: 0,
        type: "finished",
      },
      {
        id: "premium-500ml",
        name: "Premium-500ml",
        quantity: 350,
        reserved: 800,
        type: "finished",
      },
      {
        id: "premium-750ml",
        name: "Premium-750ml",
        quantity: 900,
        reserved: 200,
        type: "finished",
      },
      {
        id: "premium-1000ml",
        name: "Premium-1000ml",
        quantity: 150,
        reserved: 400,
        type: "finished",
      },
      {
        id: "limited-edition",
        name: "Limited-Edition",
        quantity: 50,
        reserved: 300,
        type: "finished",
      },
      {
        id: "gift-pack",
        name: "Gift-Pack",
        quantity: 75,
        reserved: 150,
        type: "finished",
      },
    ]

    // Calculate the sum of available quantities
    const totalAvailable = finishedGoodsData.reduce((sum, item) => sum + item.quantity, 0)
    setAvailableStock(totalAvailable)
  }, [])

  return (
    <div className="w-full max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Pending Orders Card */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">{pendingOrdersCount}</h3>
                </div>
                <p className="text-xs text-muted-foreground">Orders requiring attention</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In Production Card */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">In Production</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">{totalInProduction.toLocaleString()}</h3>
                </div>
                <p className="text-xs text-muted-foreground">Bottles across {productionData.length} SKUs</p>
              </div>
              <div className="rounded-full bg-purple-500/10 p-3">
                <ClipboardList className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Stock Card */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Available Stock</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">{availableStock}</h3>
                </div>
                <p className="text-xs text-muted-foreground">Bottles ready for allocation</p>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3">
                <Package className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ready for Dispatch Card */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Ready for Dispatch</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">18</h3>
                </div>
                <p className="text-xs text-muted-foreground">Orders awaiting shipment</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <Truck className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ready to Receive Card */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Ready to Receive</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">{readyToReceiveCount}</h3>
                </div>
                <p className="text-xs text-muted-foreground">Purchase orders due today</p>
              </div>
              <div className="rounded-full bg-teal-500/10 p-3">
                <PackageCheck className="h-5 w-5 text-teal-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash in Hand Card */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cash in Hand</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">{formattedCashInHand}</h3>
                </div>
                <p className="text-xs text-muted-foreground">Available petty cash</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <Wallet className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash in Bank Card */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cash in Bank</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">{formattedCashInBank}</h3>
                </div>
                <p className="text-xs text-muted-foreground">Current account balances</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Building className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance Card */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Today's Attendance</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    {presentEmployees}/{totalEmployees}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">{attendancePercentage}% employees present</p>
              </div>
              <div className="rounded-full bg-indigo-500/10 p-3">
                <UserCheck className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesByDayChart />
        <PendingOrdersChart />
      </div>
    </div>
  )
}
