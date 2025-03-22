"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, Plus, Search, Edit, Trash2 } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { useFinance, type BankAccount, type Transaction } from "@/contexts/finance-context"
import { BankAccountForm } from "@/components/finance/bank-account-form"
import { TransactionForm } from "@/components/finance/transaction-form"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function BankingCash() {
  const { bankAccounts, transactions, deleteBankAccount, deleteTransaction } = useFinance()
  const [activeTab, setActiveTab] = useState("accounts")
  const [searchTerm, setSearchTerm] = useState("")
  const [accountFilter, setAccountFilter] = useState("all")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all")

  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [isAccountDeleteDialogOpen, setIsAccountDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)

  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isTransactionDeleteDialogOpen, setIsTransactionDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  // Filter transactions based on search term, account, and type
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAccount = accountFilter === "all" || transaction.account === accountFilter

    const matchesType =
      transactionTypeFilter === "all" || transaction.type.toLowerCase() === transactionTypeFilter.toLowerCase()

    return matchesSearch && matchesAccount && matchesType
  })

  // Calculate total balance
  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0)

  // Calculate net cash flow
  const inflows = transactions
    .filter((t) => t.type === "Deposit" && t.status === "Cleared")
    .reduce((sum, t) => sum + t.amount, 0)

  const outflows = transactions
    .filter((t) => t.type === "Withdrawal" && t.status === "Cleared")
    .reduce((sum, t) => sum + t.amount, 0)

  const netCashFlow = inflows - outflows

  // Handle account actions
  const handleEditAccount = (account: BankAccount) => {
    setSelectedAccount(account)
    setIsAccountFormOpen(true)
  }

  const handleDeleteAccount = (id: string) => {
    setAccountToDelete(id)
    setIsAccountDeleteDialogOpen(true)
  }

  const confirmDeleteAccount = () => {
    if (accountToDelete) {
      deleteBankAccount(accountToDelete)
      setAccountToDelete(null)
      setIsAccountDeleteDialogOpen(false)
    }
  }

  const handleNewAccount = () => {
    setSelectedAccount(null)
    setIsAccountFormOpen(true)
  }

  // Handle transaction actions
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsTransactionFormOpen(true)
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id)
    setIsTransactionDeleteDialogOpen(true)
  }

  const confirmDeleteTransaction = () => {
    if (transactionToDelete) {
      deleteTransaction(transactionToDelete)
      setTransactionToDelete(null)
      setIsTransactionDeleteDialogOpen(false)
    }
  }

  const handleNewTransaction = () => {
    setSelectedTransaction(null)
    setIsTransactionFormOpen(true)
  }

  // Prepare cash flow data for chart
  const cashFlowData = [
    { month: "Jan", inflow: 4800000, outflow: 3500000, netCashFlow: 1300000 },
    { month: "Feb", inflow: 5300000, outflow: 3800000, netCashFlow: 1500000 },
    { month: "Mar", inflow: 4900000, outflow: 3600000, netCashFlow: 1300000 },
    { month: "Apr", inflow: 6200000, outflow: 4100000, netCashFlow: 2100000 },
    { month: "May", inflow: 5700000, outflow: 3900000, netCashFlow: 1800000 },
    { month: "Jun", inflow: 6700000, outflow: 4300000, netCashFlow: 2400000 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Cash Balance"
          value={`₹${(totalBalance / 1000000).toFixed(2)}M`}
          description="Across all accounts"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Operating Account"
          value={`₹${(bankAccounts[0]?.balance / 1000000 || 0).toFixed(2)}M`}
          description="Main business account"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Net Cash Flow (MTD)"
          value={`₹${(netCashFlow / 1000000).toFixed(2)}M`}
          trend={netCashFlow > 0 ? "up" : "down"}
          change={`${Math.abs(Math.round((netCashFlow / totalBalance) * 100))}%`}
          description="vs last month"
          icon={<span className="text-lg">₹</span>}
        />
      </div>

      <Tabs defaultValue="accounts" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search accounts..." className="pl-8 w-[300px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="fd">Fixed Deposit</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleNewAccount}>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Balance (₹)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.id}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>{account.bank}</TableCell>
                      <TableCell>{account.accountNumber}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell className="text-right">{account.balance.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteAccount(account.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-8 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Select defaultValue="all" value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.name}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="all" value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleNewTransaction}>
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.account}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transaction.type === "Deposit"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                              : transaction.type === "Withdrawal"
                                ? "bg-rose-50 text-rose-700 border-rose-200 font-medium"
                                : "bg-sky-50 text-sky-700 border-sky-200 font-medium"
                          }
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{transaction.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell>{transaction.reference}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transaction.status === "Cleared"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                              : transaction.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200 font-medium"
                                : "bg-red-50 text-red-700 border-red-200 font-medium"
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTransaction(transaction.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="main">
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Operating Account</SelectItem>
                  <SelectItem value="payroll">Payroll Account</SelectItem>
                  <SelectItem value="tax">Tax Reserve Account</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="june">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="june">June 2023</SelectItem>
                  <SelectItem value="may">May 2023</SelectItem>
                  <SelectItem value="april">April 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">Start Reconciliation</Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Bank Reconciliation - Main Operating Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Book Balance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Opening Balance (June 1, 2023)</span>
                        <span className="font-medium">₹3,250,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Add: Total Deposits</span>
                        <span className="font-medium text-green-600">₹1,250,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Less: Total Withdrawals</span>
                        <span className="font-medium text-red-600">₹(1,000,000)</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Ending Book Balance (June 30, 2023)</span>
                        <span className="font-medium">₹3,500,000</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Bank Statement Balance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Bank Statement Balance (June 30, 2023)</span>
                        <span className="font-medium">₹3,575,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Add: Deposits in Transit</span>
                        <span className="font-medium text-green-600">₹0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Less: Outstanding Checks</span>
                        <span className="font-medium text-red-600">₹(75,000)</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Adjusted Bank Balance</span>
                        <span className="font-medium">₹3,500,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Unreconciled Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount (₹)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>2023-06-28</TableCell>
                        <TableCell>Supplier Payment - Office Supplies Co</TableCell>
                        <TableCell>CHK-2023-0056</TableCell>
                        <TableCell className="text-right">75,000</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                            Outstanding
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Reconcile
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="6months">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Cash Flow Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] p-2">
                <ChartContainer
                  config={{
                    inflow: {
                      label: "Cash Inflow",
                      color: "hsl(var(--chart-1))",
                    },
                    outflow: {
                      label: "Cash Outflow",
                      color: "hsl(var(--chart-2))",
                    },
                    netCashFlow: {
                      label: "Net Cash Flow",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashFlowData}>
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="inflow"
                        stroke="var(--color-inflow)"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="outflow" stroke="var(--color-outflow)" strokeWidth={2} />
                      <Line type="monotone" dataKey="netCashFlow" stroke="var(--color-netCashFlow)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/20 p-4 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium mb-4">Cash Inflows</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Sales Revenue</span>
                      <span className="font-medium">₹4,500,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accounts Receivable Collections</span>
                      <span className="font-medium">₹1,800,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Income</span>
                      <span className="font-medium">₹400,000</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Inflows</span>
                      <span className="font-medium">₹6,700,000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Cash Outflows</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Raw Material Purchases</span>
                      <span className="font-medium">₹1,800,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payroll & Benefits</span>
                      <span className="font-medium">₹1,500,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operating Expenses</span>
                      <span className="font-medium">₹650,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Payments</span>
                      <span className="font-medium">₹350,000</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Outflows</span>
                      <span className="font-medium">₹4,300,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bank Account Form Dialog */}
      <BankAccountForm
        open={isAccountFormOpen}
        onOpenChange={setIsAccountFormOpen}
        initialValues={selectedAccount || undefined}
        accountId={selectedAccount?.id}
      />

      {/* Transaction Form Dialog */}
      <TransactionForm
        open={isTransactionFormOpen}
        onOpenChange={setIsTransactionFormOpen}
        initialValues={selectedTransaction || undefined}
        transactionId={selectedTransaction?.id}
      />

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isAccountDeleteDialogOpen} onOpenChange={setIsAccountDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bank account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAccount} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Transaction Confirmation Dialog */}
      <AlertDialog open={isTransactionDeleteDialogOpen} onOpenChange={setIsTransactionDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransaction} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

