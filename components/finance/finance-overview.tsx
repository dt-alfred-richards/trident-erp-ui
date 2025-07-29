"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndianRupee, CreditCard, Building, Receipt } from "lucide-react"
import { useFinance } from "@/contexts/finance-context"
import { useMemo, useState } from "react"
import { formatNumberIndian, formatRelativeTime } from "../generic"
import { useOrders } from "@/contexts/order-context"

export function FinanceOverview() {
  const { journalEntries, invoices, bills, accounts } = useFinance()


  const { orders } = useOrders()

  // Calculate financial metrics
  const totalRevenue = useMemo(() => orders.reduce((acc, curr) => {
    acc += curr.total
    return acc;
  }, 0)
    , [orders])

  const totalReceivables = useMemo(() => invoices.reduce((sum, inv) => sum + inv.balance, 0), [invoices])

  const totalPayables = useMemo(() => bills.reduce((sum, bill) => sum + bill.balance, 0), [bills])

  const netProfit = useMemo(() => {
    return 0
  }, [orders])

  // Group receivables by age
  const today = new Date()
  const accountsReceivableData = useMemo(() => [
    {
      name: "Current",
      value: invoices.filter((inv) => new Date(inv.dueDate) >= today).reduce((sum, inv) => sum + inv.balance, 0),
    },
    {
      name: "1-30 Days",
      value: invoices
        .filter((inv) => {
          const dueDate = new Date(inv.dueDate)
          const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff > 0 && daysDiff <= 30
        })
        .reduce((sum, inv) => sum + inv.balance, 0),
    },
    {
      name: "31-60 Days",
      value: invoices
        .filter((inv) => {
          const dueDate = new Date(inv.dueDate)
          const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff > 30 && daysDiff <= 60
        })
        .reduce((sum, inv) => sum + inv.balance, 0),
    },
    {
      name: "61-90 Days",
      value: invoices
        .filter((inv) => {
          const dueDate = new Date(inv.dueDate)
          const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff > 60 && daysDiff <= 90
        })
        .reduce((sum, inv) => sum + inv.balance, 0),
    },
    {
      name: "90+ Days",
      value: invoices
        .filter((inv) => {
          const dueDate = new Date(inv.dueDate)
          const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff > 90
        })
        .reduce((sum, inv) => sum + inv.balance, 0),
    },
  ], [invoices])

  // Group payables by age
  const accountsPayableData = [
    {
      name: "Current",
      value: bills.filter((bill) => new Date(bill.dueDate) >= today).reduce((sum, bill) => sum + bill.balance, 0),
    },
    {
      name: "1-30 Days",
      value: bills
        .filter((bill) => {
          const dueDate = new Date(bill.dueDate)
          const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff > 0 && daysDiff <= 30
        })
        .reduce((sum, bill) => sum + bill.balance, 0),
    },
    {
      name: "31-60 Days",
      value: bills
        .filter((bill) => {
          const dueDate = new Date(bill.dueDate)
          const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff > 30 && daysDiff <= 60
        })
        .reduce((sum, bill) => sum + bill.balance, 0),
    },
    {
      name: "61-90 Days",
      value: bills
        .filter((bill) => {
          const dueDate = new Date(bill.dueDate)
          const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff > 60 && daysDiff <= 90
        })
        .reduce((sum, bill) => sum + bill.balance, 0),
    },
    {
      name: "90+ Days",
      value: bills
        .filter((bill) => {
          const dueDate = new Date(bill.dueDate)
          const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff > 90
        })
        .reduce((sum, bill) => sum + bill.balance, 0),
    },
  ]

  // Get recent journal entries
  const recentJournalEntries = [...journalEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Get pending invoices
  const pendingInvoices = [...invoices]
    .filter((inv) => inv.status === "Open" || inv.status === "Overdue")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  // Get upcoming payments
  const upcomingPayments = [...bills]
    .filter((bill) => bill.status === "Open" || bill.status === "Overdue")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3)

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{`₹${formatNumberIndian((totalRevenue))}`}</h3>
                </div>
              </div>
              <div className="rounded-full p-3 bg-green-500/10">
                <IndianRupee className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Accounts Receivable</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">₹{(totalReceivables / 1000000).toFixed(1)}M</h3>
                </div>
              </div>
              <div className="rounded-full p-3 bg-blue-500/10">
                <Receipt className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Accounts Payable</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">₹{formatNumberIndian((totalPayables))}</h3>
                </div>
              </div>
              <div className="rounded-full p-3 bg-amber-500/10">
                <CreditCard className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">₹{formatNumberIndian((netProfit))}</h3>
                </div>
              </div>
              <div className="rounded-full p-3 bg-purple-500/10">
                <Building className="h-4 w-4 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg font-semibold">Accounts Aging</CardTitle>
            <CardDescription>Receivables and payables by age</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="receivables">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger
                  value="receivables"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] rounded-none"
                >
                  Receivables
                </TabsTrigger>
                <TabsTrigger
                  value="payables"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] rounded-none"
                >
                  Payables
                </TabsTrigger>
              </TabsList>
              <TabsContent value="receivables" className="pt-4">
                <div className="space-y-4">
                  {accountsReceivableData.map((item, idx) => (
                    <div className="flex items-center justify-between" key={`${idx}-${item.name}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">₹{formatNumberIndian((item.value))}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">
                      ₹{formatNumberIndian((accountsReceivableData.reduce((acc, item) => acc + item.value, 0)))}
                    </span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="payables" className="pt-4">
                <div className="space-y-4">
                  {accountsPayableData.map((item, idx) => (
                    <div className="flex items-center justify-between" key={`${item.name}-${idx}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">₹{formatNumberIndian((item.value))}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">
                      ₹{formatNumberIndian((accountsPayableData.reduce((acc, item) => acc + item.value, 0)))}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200 col-span-1 lg:col-span-2">
          <CardHeader className="pb-2 bg-muted/30">
            <CardTitle className="text-sm font-semibold">Recent Journal Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {
                journalEntries.slice(0, 5).map((item, idx) => {
                  return (<div className="border-b pb-2" key={`${item.id}-${idx}`}>
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{`JE-${item.id}`}</div>
                      <div className="text-sm text-muted-foreground">{`₹${item.amount}`}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.debitAccount}</div>
                  </div>)
                })
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2 bg-muted/30">
            <CardTitle className="text-sm font-semibold">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {
                invoices.filter(item => item.status === "Open").map((item, idx) => {
                  return (<div className="border-b pb-2" key={`${item.id}-${idx}`}>
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{`INV-${item.id}`}</div>
                      <div className="text-sm text-muted-foreground">{`₹${item.amount}`}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{formatRelativeTime(new Date(item.dueDate))}</div>
                  </div>)
                })
              }
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2 bg-muted/30">
            <CardTitle className="text-sm font-semibold">Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bills.slice(0, 5).map(item => {
                return (<div key={item.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{`PO-${item.id}`}</div>
                    <div className="text-sm text-muted-foreground">{`₹${item.amount}`}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{formatRelativeTime(new Date(item.dueDate))}</div>
                </div>)
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
