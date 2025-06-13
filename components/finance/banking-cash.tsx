"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Plus, Search, Edit, Trash2 } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { useFinance, type BankAccount, type Transaction } from "@/contexts/finance-context"
import { BankAccountForm } from "@/components/finance/bank-account-form"
import { TransactionForm } from "@/components/finance/transaction-form"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"
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
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { StatusBadge } from "@/components/common/status-badge"
import { useBankAccountContext } from "./context/bank-account-context"
import { useTranscation } from "./context/trasncations"

export function BankingCash() {
  const [activeTab, setActiveTab] = useState("accounts")
  const [searchTerm, setSearchTerm] = useState("")
  const [accountSearchTerm, setAccountSearchTerm] = useState("")
  const [accountFilter, setAccountFilter] = useState("all")
  const [accountTypeFilter, setAccountTypeFilter] = useState("all")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("june")
  const [selectedAccountType, setSelectedAccountType] = useState("main")
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("6months")

  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [isAccountDeleteDialogOpen, setIsAccountDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)

  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isTransactionDeleteDialogOpen, setIsTransactionDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  // Pagination state
  const [accountPage, setAccountPage] = useState(0)
  const [accountRowsPerPage, setAccountRowsPerPage] = useState(5)
  const [transactionPage, setTransactionPage] = useState(0)
  const [transactionRowsPerPage, setTransactionRowsPerPage] = useState(5)
  const [unreconciledPage, setUnreconciledPage] = useState(0)
  const [unreconciledRowsPerPage, setUnreconciledRowsPerPage] = useState(5)

  const { data, deleteItem: deleteBankAccount } = useBankAccountContext()
  const { data: Tdata, deleteItem: deleteTransaction } = useTranscation()

  const bankAccounts = useMemo(() => {
    return data.map(item => ({ ...item }))
  }, [data])
  const transactions = useMemo(() => {
    return Tdata.map(item => ({ ...item }))
  }, [Tdata])
  // Get account title based on selected account type
  const getAccountTitle = () => {
    switch (selectedAccountType) {
      case "main":
        return "Main Operating Account"
      case "payroll":
        return "Payroll Account"
      case "tax":
        return "Tax Reserve Account"
      default:
        return "Main Operating Account"
    }
  }

  // Get reconciliation data based on selected account type and month
  const getReconciliationData = () => {
    if (selectedAccountType === "main") {
      if (selectedMonth === "june") {
        return {
          openingBalance: 3250000,
          deposits: 1250000,
          withdrawals: 1000000,
          endingBalance: 3500000,
          bankStatementBalance: 3575000,
          depositsInTransit: 0,
          outstandingChecks: 75000,
          adjustedBankBalance: 3500000,
          unreconciledItems: [
            {
              date: "2023-06-28",
              description: "Supplier Payment - Office Supplies Co",
              reference: "CHK-2023-0056",
              amount: 75000,
              status: "Outstanding",
            },
          ],
        }
      } else if (selectedMonth === "may") {
        return {
          openingBalance: 3100000,
          deposits: 1150000,
          withdrawals: 1000000,
          endingBalance: 3250000,
          bankStatementBalance: 3300000,
          depositsInTransit: 0,
          outstandingChecks: 50000,
          adjustedBankBalance: 3250000,
          unreconciledItems: [
            {
              date: "2023-05-30",
              description: "Supplier Payment - Packaging Solutions",
              reference: "CHK-2023-0048",
              amount: 50000,
              status: "Outstanding",
            },
          ],
        }
      } else {
        return {
          openingBalance: 2950000,
          deposits: 1050000,
          withdrawals: 900000,
          endingBalance: 3100000,
          bankStatementBalance: 3150000,
          depositsInTransit: 0,
          outstandingChecks: 50000,
          adjustedBankBalance: 3100000,
          unreconciledItems: [
            {
              date: "2023-04-29",
              description: "Supplier Payment - Equipment Suppliers",
              reference: "CHK-2023-0042",
              amount: 50000,
              status: "Outstanding",
            },
          ],
        }
      }
    } else if (selectedAccountType === "payroll") {
      if (selectedMonth === "june") {
        return {
          openingBalance: 1500000,
          deposits: 1800000,
          withdrawals: 1750000,
          endingBalance: 1550000,
          bankStatementBalance: 1600000,
          depositsInTransit: 0,
          outstandingChecks: 50000,
          adjustedBankBalance: 1550000,
          unreconciledItems: [
            {
              date: "2023-06-29",
              description: "Employee Bonus Payment",
              reference: "CHK-2023-0057",
              amount: 50000,
              status: "Outstanding",
            },
          ],
        }
      } else if (selectedMonth === "may") {
        return {
          openingBalance: 1450000,
          deposits: 1750000,
          withdrawals: 1700000,
          endingBalance: 1500000,
          bankStatementBalance: 1550000,
          depositsInTransit: 0,
          outstandingChecks: 50000,
          adjustedBankBalance: 1500000,
          unreconciledItems: [
            {
              date: "2023-05-31",
              description: "Contractor Payment",
              reference: "CHK-2023-0049",
              amount: 50000,
              status: "Outstanding",
            },
          ],
        }
      } else {
        return {
          openingBalance: 1400000,
          deposits: 1700000,
          withdrawals: 1650000,
          endingBalance: 1450000,
          bankStatementBalance: 1500000,
          depositsInTransit: 0,
          outstandingChecks: 50000,
          adjustedBankBalance: 1450000,
          unreconciledItems: [
            {
              date: "2023-04-30",
              description: "Overtime Payment",
              reference: "CHK-2023-0043",
              amount: 50000,
              status: "Outstanding",
            },
          ],
        }
      }
    } else {
      if (selectedMonth === "june") {
        return {
          openingBalance: 850000,
          deposits: 350000,
          withdrawals: 200000,
          endingBalance: 1000000,
          bankStatementBalance: 1000000,
          depositsInTransit: 0,
          outstandingChecks: 0,
          adjustedBankBalance: 1000000,
          unreconciledItems: [],
        }
      } else if (selectedMonth === "may") {
        return {
          openingBalance: 750000,
          deposits: 300000,
          withdrawals: 200000,
          endingBalance: 850000,
          bankStatementBalance: 850000,
          depositsInTransit: 0,
          outstandingChecks: 0,
          adjustedBankBalance: 850000,
          unreconciledItems: [],
        }
      } else {
        return {
          openingBalance: 650000,
          deposits: 250000,
          withdrawals: 150000,
          endingBalance: 750000,
          bankStatementBalance: 750000,
          depositsInTransit: 0,
          outstandingChecks: 0,
          adjustedBankBalance: 750000,
          unreconciledItems: [],
        }
      }
    }
  }

  // Get cash flow data based on selected time period
  const getCashFlowData = () => {
    if (selectedTimePeriod === "3months") {
      return [
        { month: "Apr", inflow: 6200000, outflow: 4100000, netCashFlow: 2100000 },
        { month: "May", inflow: 5700000, outflow: 3900000, netCashFlow: 1800000 },
        { month: "Jun", inflow: 6700000, outflow: 4300000, netCashFlow: 2400000 },
      ]
    } else if (selectedTimePeriod === "6months") {
      return [
        { month: "Jan", inflow: 4800000, outflow: 3500000, netCashFlow: 1300000 },
        { month: "Feb", inflow: 5300000, outflow: 3800000, netCashFlow: 1500000 },
        { month: "Mar", inflow: 4900000, outflow: 3600000, netCashFlow: 1300000 },
        { month: "Apr", inflow: 6200000, outflow: 4100000, netCashFlow: 2100000 },
        { month: "May", inflow: 5700000, outflow: 3900000, netCashFlow: 1800000 },
        { month: "Jun", inflow: 6700000, outflow: 4300000, netCashFlow: 2400000 },
      ]
    } else {
      return [
        { month: "Jul", inflow: 4500000, outflow: 3200000, netCashFlow: 1300000 },
        { month: "Aug", inflow: 4700000, outflow: 3400000, netCashFlow: 1300000 },
        { month: "Sep", inflow: 4900000, outflow: 3600000, netCashFlow: 1300000 },
        { month: "Oct", inflow: 5100000, outflow: 3700000, netCashFlow: 1400000 },
        { month: "Nov", inflow: 5300000, outflow: 3800000, netCashFlow: 1500000 },
        { month: "Dec", inflow: 5500000, outflow: 3900000, netCashFlow: 1600000 },
        { month: "Jan", inflow: 4800000, outflow: 3500000, netCashFlow: 1300000 },
        { month: "Feb", inflow: 5300000, outflow: 3800000, netCashFlow: 1500000 },
        { month: "Mar", inflow: 4900000, outflow: 3600000, netCashFlow: 1300000 },
        { month: "Apr", inflow: 6200000, outflow: 4100000, netCashFlow: 2100000 },
        { month: "May", inflow: 5700000, outflow: 3900000, netCashFlow: 1800000 },
        { month: "Jun", inflow: 6700000, outflow: 4300000, netCashFlow: 2400000 },
      ]
    }
  }

  // Get cash flow summary data based on selected time period
  const getCashFlowSummary = () => {
    if (selectedTimePeriod === "3months") {
      return {
        salesRevenue: 4500000,
        accountsReceivable: 1800000,
        otherIncome: 400000,
        totalInflows: 6700000,
        rawMaterials: 1800000,
        payroll: 1500000,
        operatingExpenses: 650000,
        taxPayments: 350000,
        totalOutflows: 4300000,
      }
    } else if (selectedTimePeriod === "6months") {
      return {
        salesRevenue: 25000000,
        accountsReceivable: 8500000,
        otherIncome: 2100000,
        totalInflows: 35600000,
        rawMaterials: 10500000,
        payroll: 8900000,
        operatingExpenses: 3800000,
        taxPayments: 1800000,
        totalOutflows: 25000000,
      }
    } else {
      return {
        salesRevenue: 48000000,
        accountsReceivable: 16000000,
        otherIncome: 4000000,
        totalInflows: 68000000,
        rawMaterials: 20000000,
        payroll: 17000000,
        operatingExpenses: 7500000,
        taxPayments: 3500000,
        totalOutflows: 48000000,
      }
    }
  }

  const reconciliationData = getReconciliationData()
  const accountTitle = getAccountTitle()
  const cashFlowData = getCashFlowData()
  const cashFlowSummary = getCashFlowSummary()

  // Filter bank accounts based on search term and account type
  const filteredBankAccounts = bankAccounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
      account.id.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
      account.bank.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
      account.accountNumber.toLowerCase().includes(accountSearchTerm.toLowerCase())

    const matchesType = accountTypeFilter === "all" || account.type.toLowerCase() === accountTypeFilter.toLowerCase()

    return matchesSearch && matchesType
  })

  // Paginate bank accounts
  const paginatedBankAccounts = filteredBankAccounts.slice(
    accountPage * accountRowsPerPage,
    accountPage * accountRowsPerPage + accountRowsPerPage,
  )

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

  // Paginate transactions
  const paginatedTransactions = filteredTransactions.slice(
    transactionPage * transactionRowsPerPage,
    transactionPage * transactionRowsPerPage + transactionRowsPerPage,
  )

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
    // Create a deep copy of the account to avoid reference issues
    setSelectedAccount({ ...account })
    setIsAccountFormOpen(true)
  }

  const handleDeleteAccount = (id: string) => {
    setAccountToDelete(id)
    setIsAccountDeleteDialogOpen(true)
  }

  const confirmDeleteAccount = () => {
    if (accountToDelete) {
      deleteBankAccount(parseInt(accountToDelete)).then(() => {
        setAccountToDelete(null)
        setIsAccountDeleteDialogOpen(false)
      })
    }
  }

  const handleNewAccount = () => {
    setSelectedAccount(null)
    setIsAccountFormOpen(true)
  }

  // Handle transaction actions
  const handleEditTransaction = (transaction: Transaction) => {
    // Create a deep copy of the transaction to avoid reference issues
    setSelectedTransaction({
      id: transaction.id,
      date: transaction.date,
      description: transaction.description,
      account: transaction.account,
      type: transaction.type,
      amount: transaction.amount,
      reference: transaction.reference || "",
      status: transaction.status,
    })
    setIsTransactionFormOpen(true)
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id)
    setIsTransactionDeleteDialogOpen(true)
  }

  const confirmDeleteTransaction = () => {
    if (transactionToDelete) {
      deleteTransaction(parseInt(transactionToDelete)).then(() => {
        setTransactionToDelete(null)
        setIsTransactionDeleteDialogOpen(false)
      })
    }
  }

  const handleNewTransaction = () => {
    setSelectedTransaction(null)
    setIsTransactionFormOpen(true)
  }

  // Paginate unreconciled items
  const paginatedUnreconciledItems = reconciliationData.unreconciledItems
    ? reconciliationData.unreconciledItems.slice(
      unreconciledPage * unreconciledRowsPerPage,
      unreconciledPage * unreconciledRowsPerPage + unreconciledRowsPerPage,
    )
    : []

  // Export function
  const handleExport = () => {
    let dataToExport = []
    let filename = ""

    // Determine what data to export based on active tab
    if (activeTab === "accounts") {
      dataToExport = filteredBankAccounts
      filename = "bank-accounts.csv"
    } else if (activeTab === "transactions") {
      dataToExport = filteredTransactions
      filename = "transactions.csv"
    } else if (activeTab === "reconciliation") {
      // For reconciliation, we'll export the unreconciled items
      dataToExport = reconciliationData.unreconciledItems || []
      filename = `reconciliation-${selectedAccountType}-${selectedMonth}.csv`
    } else if (activeTab === "cashflow") {
      dataToExport = cashFlowData
      filename = `cash-flow-${selectedTimePeriod}.csv`
    }

    if (dataToExport.length === 0) {
      alert("No data to export")
      return
    }

    // Convert data to CSV
    const headers = Object.keys(dataToExport[0])
    const csvContent = [
      headers.join(","),
      ...dataToExport.map((row) =>
        headers
          .map((header) => {
            // Handle special cases like nested objects or arrays
            const cell = row[header]
            const cellStr = typeof cell === "object" ? JSON.stringify(cell) : String(cell)
            // Escape commas and quotes
            return `"${cellStr.replace(/"/g, '""')}"`
          })
          .join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Cash Balance"
          value={`₹${(totalBalance / 1000000).toFixed(2)}M`}
          description="Across all accounts"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-teal-500"
          iconBgColor="bg-teal-500/10"
        />
        <MetricCard
          title="Operating Account"
          value={`₹${(bankAccounts[0]?.balance / 1000000 || 0).toFixed(2)}M`}
          description="Main business account"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <MetricCard
          title="Net Cash Flow (MTD)"
          value={`₹${(netCashFlow / 1000000).toFixed(2)}M`}
          trend={netCashFlow > 0 ? "up" : "down"}
          change={`${Math.abs(Math.round((netCashFlow / totalBalance) * 100))}%`}
          description="vs last month"
          icon={<span className="text-lg">₹</span>}
          iconColor={netCashFlow > 0 ? "text-emerald-500" : "text-red-500"}
          iconBgColor={netCashFlow > 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
        />
      </div>

      <Tabs defaultValue="accounts" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="accounts"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Bank Accounts
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="reconciliation"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Reconciliation
          </TabsTrigger>
          <TabsTrigger
            value="cashflow"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Cash Flow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search accounts..."
                  className="pl-8 w-[300px]"
                  value={accountSearchTerm}
                  onChange={(e) => setAccountSearchTerm(e.target.value)}
                />
              </div>
              <Select defaultValue="all" value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleNewAccount} className="bg-[#43ced7] hover:bg-[#43ced7]/90 text-white">
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
                  {paginatedBankAccounts.length > 0 ? (
                    paginatedBankAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.id}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.bank}</TableCell>
                        <TableCell>{account.accountNumber}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-right">{account.balance.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditAccount(account)}
                              className="h-8 w-8"
                              title="Edit Account"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAccount(account.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              title="Delete Account"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No accounts found matching the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Bank Accounts Pagination */}
          {filteredBankAccounts.length > 0 && (
            <DataTablePagination
              totalItems={filteredBankAccounts.length}
              itemsPerPage={accountRowsPerPage}
              currentPage={accountPage + 1}
              onPageChange={(page) => setAccountPage(page - 1)}
              onRowsPerPageChange={(newValue) => {
                setAccountRowsPerPage(newValue)
                setAccountPage(0)
              }}
            />
          )}
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={handleNewTransaction}
                className="bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-[#ffffff]"
              >
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
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.account}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={transaction.type.toLowerCase() as any}
                            className={
                              transaction.type === "Deposit"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : transaction.type === "Withdrawal"
                                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                                  : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">{transaction.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={transaction.status.toLowerCase() as any}
                            className={
                              transaction.status === "Cleared"
                                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                                : transaction.status === "Pending"
                                  ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
                                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTransaction(transaction)}
                              className="h-8 w-8"
                              title="Edit Transaction"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              title="Delete Transaction"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                        No transactions found matching the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Transactions Pagination */}
          {filteredTransactions.length > 0 && (
            <DataTablePagination
              totalItems={filteredTransactions.length}
              itemsPerPage={transactionRowsPerPage}
              currentPage={transactionPage + 1}
              onPageChange={(page) => setTransactionPage(page - 1)}
              onRowsPerPageChange={(newValue) => {
                setTransactionRowsPerPage(newValue)
                setTransactionPage(0)
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Operating Account</SelectItem>
                  <SelectItem value="payroll">Payroll Account</SelectItem>
                  <SelectItem value="tax">Tax Reserve Account</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-[#725af2] hover:bg-[#725af2]/90 text-[#ffffff]">
                Start Reconciliation
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Bank Reconciliation - {accountTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Book Balance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>
                          Opening Balance (
                          {selectedMonth === "june" ? "June 1" : selectedMonth === "may" ? "May 1" : "April 1"}, 2023)
                        </span>
                        <span className="font-medium">
                          ₹{reconciliationData.openingBalance.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Add: Total Deposits</span>
                        <span className="font-medium text-green-600">
                          ₹{reconciliationData.deposits.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Less: Total Withdrawals</span>
                        <span className="font-medium text-red-600">
                          ₹({reconciliationData.withdrawals.toLocaleString("en-IN")})
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">
                          Ending Book Balance (
                          {selectedMonth === "june" ? "June 30" : selectedMonth === "may" ? "May 31" : "April 30"},
                          2023)
                        </span>
                        <span className="font-medium">₹{reconciliationData.endingBalance.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Bank Statement Balance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>
                          Bank Statement Balance (
                          {selectedMonth === "june" ? "June 30" : selectedMonth === "may" ? "May 31" : "April 30"},
                          2023)
                        </span>
                        <span className="font-medium">
                          ₹{reconciliationData.bankStatementBalance.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Add: Deposits in Transit</span>
                        <span className="font-medium text-green-600">
                          ₹{reconciliationData.depositsInTransit.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Less: Outstanding Checks</span>
                        <span className="font-medium text-red-600">
                          ₹({reconciliationData.outstandingChecks.toLocaleString("en-IN")})
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Adjusted Bank Balance</span>
                        <span className="font-medium">
                          ₹{reconciliationData.adjustedBankBalance.toLocaleString("en-IN")}
                        </span>
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
                      {reconciliationData.unreconciledItems && reconciliationData.unreconciledItems.length > 0 ? (
                        paginatedUnreconciledItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell>{item.reference}</TableCell>
                            <TableCell className="text-right">{item.amount.toLocaleString("en-IN")}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200 font-medium"
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Reconcile
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No unreconciled items for this period
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Unreconciled Items Pagination */}
                  {reconciliationData.unreconciledItems && reconciliationData.unreconciledItems.length > 0 && (
                    <div className="mt-4">
                      <DataTablePagination
                        totalItems={reconciliationData.unreconciledItems.length}
                        itemsPerPage={unreconciledRowsPerPage}
                        currentPage={unreconciledPage + 1}
                        onPageChange={(page) => setUnreconciledPage(page - 1)}
                        onRowsPerPageChange={(newValue) => {
                          setUnreconciledRowsPerPage(newValue)
                          setUnreconciledPage(0)
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData}>
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <div className="text-sm">
                                <p className="font-medium">{payload[0].payload.month}</p>
                                <p className="text-emerald-600">Inflow: ₹{(payload[0].value / 1000000).toFixed(2)}M</p>
                                <p className="text-rose-600">Outflow: ₹{(payload[1].value / 1000000).toFixed(2)}M</p>
                                <p className="text-blue-600">Net: ₹{(payload[2].value / 1000000).toFixed(2)}M</p>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(value) => {
                        const colors = {
                          inflow: "text-emerald-600",
                          outflow: "text-rose-600",
                          netCashFlow: "text-blue-600",
                        }
                        return (
                          <span className={colors[value as keyof typeof colors]}>
                            {value === "inflow"
                              ? "Cash Inflow"
                              : value === "outflow"
                                ? "Cash Outflow"
                                : "Net Cash Flow"}
                          </span>
                        )
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="inflow"
                      stroke="#10b981"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                      name="inflow"
                    />
                    <Line type="monotone" dataKey="outflow" stroke="#e11d48" strokeWidth={2} name="outflow" />
                    <Line type="monotone" dataKey="netCashFlow" stroke="#2563eb" strokeWidth={2} name="netCashFlow" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/20 p-4 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium mb-4">Cash Inflows</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Sales Revenue</span>
                      <span className="font-medium">₹{cashFlowSummary.salesRevenue.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accounts Receivable Collections</span>
                      <span className="font-medium">₹{cashFlowSummary.accountsReceivable.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Income</span>
                      <span className="font-medium">₹{cashFlowSummary.otherIncome.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Inflows</span>
                      <span className="font-medium">₹{cashFlowSummary.totalInflows.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Cash Outflows</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Raw Material Purchases</span>
                      <span className="font-medium">₹{cashFlowSummary.rawMaterials.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payroll & Benefits</span>
                      <span className="font-medium">₹{cashFlowSummary.payroll.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operating Expenses</span>
                      <span className="font-medium">₹{cashFlowSummary.operatingExpenses.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Payments</span>
                      <span className="font-medium">₹{cashFlowSummary.taxPayments.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Outflows</span>
                      <span className="font-medium">₹{cashFlowSummary.totalOutflows.toLocaleString("en-IN")}</span>
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
