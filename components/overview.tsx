"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, Package, ShoppingCart, Truck, PackageCheck, Wallet, Building, UserCheck } from "lucide-react"
import { useOrders } from "@/contexts/order-context"
import { useProcurementData } from "@/hooks/use-procurement-data"
import { useFinance } from "@/contexts/finance-context"
import { useProductionStore } from "@/hooks/use-production-store"
import { useInventoryStore } from "@/hooks/use-inventory-store"
import { initialEmployees } from "@/components/hr/hr-dashboard"
import { SalesByDayChart } from "@/components/dashboard/sales-by-day-chart"
import { PendingOrdersChart } from "@/components/dashboard/pending-orders-chart"
import { useCallback, useMemo } from "react"
import { useProduction } from "./production/production-context"
import { getNumber } from "./generic"
import { useProcurement } from "@/app/procurement/procurement-context"
import { useInventory } from "@/app/inventory-context"
import { useBankAccountContext } from "./finance/context/bank-account-context"
import { useTranscation } from "./finance/context/trasncations"

export function Overview() {
  const { orders = [], clientProposedProductMapper } = useOrders() ?? {}
  const { productionOrders } = useProduction()
  const { inventory } = useInventory()
  const { data: bankContext } = useBankAccountContext()
  const { data: trasncationsContext } = useTranscation()
  const { purchaseOrders, purchaseOrderMaterials, suppliers, materials } = useProcurement()

  const getSupplier = useCallback((id: string) => {
    return suppliers.find(item => item.supplierId === id)
  }, [suppliers])

  const getMaterial = useCallback((id: string) => {
    return materials.find(item => item.materialId === id)
  }, [materials])

  const openPOs = useMemo(() => {
    return purchaseOrderMaterials.map(item => {
      const poOrder = purchaseOrders.find(el => el.purchaseId === item.purchaseOrderId);
      return ({
        id: item.id,
        supplier: getSupplier(poOrder?.supplierId || '')?.name || '',
        material: getMaterial(item.materialId)?.name || '',
        quantity: item.quantity,
        unit: item.unit,
        orderDate: item.createdOn,
        expectedDelivery: poOrder?.dueDate,
        status: poOrder?.status,
      })
    }).filter(item => item.supplier)
  }, [purchaseOrderMaterials, purchaseOrders])

  const transactions = useMemo(() => {
    return trasncationsContext.map(item => {
      return ({
        id: item.id,
        date: item.date,
        description: item.description,
        account: item.account,
        type: item.type,
        amount: item.amount,
        reference: item?.reference || "",
        status: item.status,
      })
    })
  }, [trasncationsContext])

  const bankAccounts = useMemo(() => {
    return bankContext.map(item => {
      return ({
        id: item.id,
        name: item.name,
        bank: item.bank,
        accountNumber: item.accountNumber,
        balance: item.balance,
        type: item.type,
      })
    })
  }, [bankContext])

  const finishedGoods = useMemo(() => {
    return (inventory || []).map(item => {
      return ({
        id: item.id,
        name: item.material,
        quantity: item.quantity,
        unit: item.unit,
        reorderLevel: 100,
        supplier: "",
        lastRestocked: item.modifiedOn,
        cost: item.price,
      })
    })
  }, [inventory])

  const productionData = useMemo(() => {
    return Object.values(clientProposedProductMapper).flat()?.map(item => {
      const sku = item.sku, deficit = getNumber(item.availableQuantity) - getNumber(item.reservedQuantity)
      return ({
        sku: item.sku,
        pendingOrders: productionOrders?.filter(el => el.status === "pending" && el.sku === sku).length,
        inProduction: getNumber(item.inProduction),
        availableStock: item.availableQuantity,
        deficit,
        status: deficit < 0 ? "deficit" : 'sufficient'
      })
    })
  }, [productionOrders])

  const totalInProduction = useMemo(
    () => productionData.reduce((sum, item) => sum + item.inProduction, 0),
    [productionData],
  )

  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => ["pending_approval", "approved", "partial_fulfillment"].includes(o.status)).length,
    [orders],
  )

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  const readyToReceiveCount = useMemo(
    () =>
      openPOs.filter((po) => (po.status === "sent" || po.status === "partial") && po.expectedDelivery === today).length,
    [openPOs, today],
  )

  // Calculate cash in hand from transactions (petty cash transactions)
  const cashInHand = useMemo(() => {
    const pettyCashTransactions = transactions.filter((transaction) => transaction.account === "Petty Cash")
    return pettyCashTransactions.reduce((sum, transaction) => {
      return transaction.type === "Deposit" ? sum + transaction.amount : sum - transaction.amount
    }, 50000) // Starting with base amount
  }, [transactions])

  // Calculate cash in bank from bank accounts
  const cashInBank = useMemo(() => {
    return bankAccounts
      .filter((account) => account.type === "Current")
      .reduce((sum, account) => sum + account.balance, 0)
  }, [bankAccounts])

  // Calculate today's attendance
  const totalEmployees = initialEmployees.length
  // Sample attendance data - assuming 10 out of 12 employees are present today
  const presentEmployees = 10
  const attendancePercentage = Math.round((presentEmployees / totalEmployees) * 100)

  const availableStock = useMemo(() => finishedGoods.reduce((sum, item) => sum + item.quantity, 0), [finishedGoods])

  const readyForDispatchCount = useMemo(() => orders.filter((o) => o.status === "dispatched").length, [orders])

  // Format the cash amounts with commas and currency symbol
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formattedCashInHand = formatCurrency(cashInHand)
  const formattedCashInBank = formatCurrency(cashInBank)

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
                  <h3 className="text-2xl font-bold text-foreground">{readyForDispatchCount}</h3>
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
