"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndianRupee, CreditCard, Building, Receipt } from "lucide-react"
import { useFinance } from "@/contexts/finance-context"
import { useState } from "react"

export function FinanceOverview() {
  const { journalEntries, invoices, bills, accounts } = useFinance()
  const [isJournalEntryFormOpen, setIsJournalEntryFormOpen] = useState(false)
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false)

  // Calculate financial metrics
  const totalRevenue = accounts
    .filter((account) => account.type === "Revenue")
    .reduce((sum, account) => sum + account.balance, 0)

  const totalReceivables = invoices.reduce((sum, inv) => sum + inv.balance, 0)

  const totalPayables = bills.reduce((sum, bill) => sum + bill.balance, 0)

  const netProfit =
    totalRevenue -
    accounts.filter((account) => account.type === "Expense").reduce((sum, account) => sum + account.balance, 0)

  // Group receivables by age
  const today = new Date()
  const accountsReceivableData = [
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
  ]

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
        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalRevenue / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Accounts Receivable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalReceivables / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Accounts Payable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalPayables / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(netProfit / 1000000).toFixed(1)}M</div>
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
                <TabsTrigger value="receivables">Receivables</TabsTrigger>
                <TabsTrigger value="payables">Payables</TabsTrigger>
              </TabsList>
              <TabsContent value="receivables" className="pt-4">
                <div className="space-y-4">
                  {accountsReceivableData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">₹{(item.value / 1000000).toFixed(2)}M</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">
                      ₹{(accountsReceivableData.reduce((acc, item) => acc + item.value, 0) / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="payables" className="pt-4">
                <div className="space-y-4">
                  {accountsPayableData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">₹{(item.value / 1000000).toFixed(2)}M</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">
                      ₹{(accountsPayableData.reduce((acc, item) => acc + item.value, 0) / 1000000).toFixed(2)}M
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
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">JE-2023-0145</div>
                  <div className="text-sm text-muted-foreground">₹125,000</div>
                </div>
                <div className="text-sm text-muted-foreground">Sales Revenue - Acme Corp</div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">JE-2023-0144</div>
                  <div className="text-sm text-muted-foreground">₹78,500</div>
                </div>
                <div className="text-sm text-muted-foreground">Raw Material Purchase</div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">JE-2023-0143</div>
                  <div className="text-sm text-muted-foreground">₹45,200</div>
                </div>
                <div className="text-sm text-muted-foreground">Utility Expenses</div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">JE-2023-0142</div>
                  <div className="text-sm text-muted-foreground">₹92,750</div>
                </div>
                <div className="text-sm text-muted-foreground">Equipment Maintenance</div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">JE-2023-0141</div>
                  <div className="text-sm text-muted-foreground">₹134,200</div>
                </div>
                <div className="text-sm text-muted-foreground">Employee Salaries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2 bg-muted/30">
            <CardTitle className="text-sm font-semibold">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">INV-2023-0089</div>
                  <div className="text-sm text-muted-foreground">₹185,000</div>
                </div>
                <div className="text-sm text-muted-foreground">Due in 5 days</div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">INV-2023-0088</div>
                  <div className="text-sm text-muted-foreground">₹92,750</div>
                </div>
                <div className="text-sm text-muted-foreground">Due in 7 days</div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">INV-2023-0087</div>
                  <div className="text-sm text-muted-foreground">₹134,200</div>
                </div>
                <div className="text-sm text-muted-foreground">Due in 12 days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2 bg-muted/30">
            <CardTitle className="text-sm font-semibold">Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">PO-2023-0112</div>
                  <div className="text-sm text-muted-foreground">₹145,000</div>
                </div>
                <div className="text-sm text-muted-foreground">Due in 3 days</div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">PO-2023-0111</div>
                  <div className="text-sm text-muted-foreground">₹67,800</div>
                </div>
                <div className="text-sm text-muted-foreground">Due in 8 days</div>
              </div>
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium">PO-2023-0110</div>
                  <div className="text-sm text-muted-foreground">₹98,500</div>
                </div>
                <div className="text-sm text-muted-foreground">Due in 10 days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2 bg-muted/30">
            <CardTitle className="text-sm font-semibold">Tax Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <div className="font-medium">GST Filing</div>
                <div className="text-sm text-muted-foreground">Due in 7 days</div>
              </div>
              <div className="border-b pb-2">
                <div className="font-medium">TDS Payment</div>
                <div className="text-sm text-muted-foreground">Due in 12 days</div>
              </div>
              <div className="border-b pb-2">
                <div className="font-medium">Advance Tax</div>
                <div className="text-sm text-muted-foreground">Due in 25 days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

