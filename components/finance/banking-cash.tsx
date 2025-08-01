"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Plus, Search, Edit, Trash2, Calendar } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { useFinance, type BankAccount, type Transaction } from "@/contexts/finance-context"
import { BankAccountForm } from "@/components/finance/bank-account-form"
import { TransactionForm } from "@/components/finance/transaction-form"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useBankAccountContext } from "./context/bank-account-context"
import { useTranscation } from "./context/trasncations"
import { formatNumberIndian } from "../generic"

export function BankingCash() {
  const { journalEntries } = useFinance()
  const { data: bankAccounts, deleteItem: deleteBankAccount } = useBankAccountContext();
  const { data: transactions, deleteItem: deleteTransaction } = useTranscation()
  const [mainTab, setMainTab] = useState("banking") // New state for top-level tabs
  const [bankingSubTab, setBankingSubTab] = useState("accounts") // State for Banking sub-tabs
  const [cashSubTab, setCashSubTab] = useState("cashaccounts") // State for Cash sub-tabs, default to cash accounts

  const [searchTerm, setSearchTerm] = useState("")
  const [accountSearchTerm, setAccountSearchTerm] = useState("")
  const [accountFilter, setAccountFilter] = useState("all")
  const [accountTypeFilter, setAccountTypeFilter] = useState("all")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all")
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("6months")

  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [isAccountDeleteDialogOpen, setIsAccountDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)

  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isTransactionDeleteDialogOpen, setIsTransactionDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  const [cashBookStartDate, setCashBookStartDate] = useState("")
  const [cashBookEndDate, setCashBookEndDate] = useState("")

  // Bank reconciliation state
  const [bankDates, setBankDates] = useState<Record<string, string>>({})

  // Pagination state
  const [accountPage, setAccountPage] = useState(0)
  const [accountRowsPerPage, setAccountRowsPerPage] = useState(5)
  const [transactionPage, setTransactionPage] = useState(0)
  const [transactionRowsPerPage, setTransactionRowsPerPage] = useState(5)
  const [reconciliationPage, setReconciliationPage] = useState(0)
  const [reconciliationRowsPerPage, setReconciliationRowsPerPage] = useState(10)

  // Get cash flow data based on selected time period and cash journal entries
  const getCashFlowData = () => {
    const now = new Date()
    const startDate = new Date()
    if (selectedTimePeriod === "3months") {
      startDate.setMonth(now.getMonth() - 2) // Last 3 months including current
    } else if (selectedTimePeriod === "6months") {
      startDate.setMonth(now.getMonth() - 5) // Last 6 months including current
    } else {
      // 12months
      startDate.setFullYear(now.getFullYear() - 1)
    }
    startDate.setDate(1) // Start from the first day of the month

    const cashFlowEntries = journalEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= startDate && (entry.debitAccount === "Cash" || entry.creditAccount === "Cash")
    })

    const monthlyAggregates: { [key: string]: { inflow: number; outflow: number } } = {}
    cashFlowEntries.forEach((entry) => {
      const monthKey = format(new Date(entry.date), "MMM yyyy")
      if (!monthlyAggregates[monthKey]) {
        monthlyAggregates[monthKey] = { inflow: 0, outflow: 0 }
      }
      if (entry.debitAccount === "Cash") {
        monthlyAggregates[monthKey].inflow += entry.amount
      } else if (entry.creditAccount === "Cash") {
        monthlyAggregates[monthKey].outflow += entry.amount
      }
    })

    const sortedMonthlyData = Object.keys(monthlyAggregates)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((monthKey) => ({
        month: format(new Date(monthKey), "MMM"), // For chart XAxis
        inflow: monthlyAggregates[monthKey].inflow,
        outflow: monthlyAggregates[monthKey].outflow,
        netCashFlow: monthlyAggregates[monthKey].inflow - monthlyAggregates[monthKey].outflow,
      }))

    return sortedMonthlyData
  }

  // Get cash flow summary data based on cash journal entries
  const getCashFlowSummary = () => {
    const cashFlowEntries = journalEntries.filter(
      (entry) => entry.debitAccount === "Cash" || entry.creditAccount === "Cash",
    )

    let salesRevenue = 0
    let accountsReceivable = 0
    let otherIncome = 0
    let rawMaterials = 0
    let payroll = 0
    let operatingExpenses = 0
    let taxPayments = 0

    cashFlowEntries.forEach((entry) => {
      if (entry.debitAccount === "Cash") {
        // Inflows
        if (entry.creditAccount === "Sales Revenue") {
          salesRevenue += entry.amount
        } else if (entry.creditAccount === "Accounts Receivable") {
          accountsReceivable += entry.amount
        } else {
          // Categorize other inflows as 'Other Income' for simplicity
          otherIncome += entry.amount
        }
      } else if (entry.creditAccount === "Cash") {
        // Outflows
        if (entry.debitAccount === "Raw Materials Inventory") {
          rawMaterials += entry.amount
        } else if (entry.debitAccount === "Salary Expenses" || entry.debitAccount === "Wages") {
          payroll += entry.amount
        } else if (entry.debitAccount === "Utilities Expenses") {
          operatingExpenses += entry.amount
        } else if (entry.debitAccount.includes("GST") || entry.description.toLowerCase().includes("tax")) {
          taxPayments += entry.amount
        } else {
          // Categorize other outflows as 'Operating Expenses' for simplicity
          operatingExpenses += entry.amount
        }
      }
    })

    const totalInflows = salesRevenue + accountsReceivable + otherIncome
    const totalOutflows = rawMaterials + payroll + operatingExpenses + taxPayments

    return {
      salesRevenue,
      accountsReceivable,
      otherIncome,
      totalInflows,
      rawMaterials,
      payroll,
      operatingExpenses,
      taxPayments,
      totalOutflows,
    }
  }

  const cashFlowData = getCashFlowData()
  const cashFlowSummary = getCashFlowSummary()

  // Filter bank accounts (excluding cash accounts)
  const filteredBankAccounts = bankAccounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
      `${account?.id || ''}`.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
      account.bank.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
      account.accountNumber.toLowerCase().includes(accountSearchTerm.toLowerCase())

    const matchesType = accountTypeFilter === "all" || account.type.toLowerCase() === accountTypeFilter.toLowerCase()

    return account.type !== "Cash" && matchesSearch && matchesType
  })

  // Filter cash accounts (only cash accounts)
  const filteredCashAccounts = bankAccounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
      `${account?.id || ''}`.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
      account.bank.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
      account.accountNumber.toLowerCase().includes(accountSearchTerm.toLowerCase())

    // For cash accounts, we typically only have 'Cash' type, but keep filter for consistency
    const matchesType = accountTypeFilter === "all" || account.type.toLowerCase() === accountTypeFilter.toLowerCase()

    return account.type === "Cash" && matchesSearch && matchesType
  })

  // Filter transactions for Banking Tab (only bank-related transactions)
  const filteredBankTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const isBankTransaction = bankAccounts.some(
        (account) => account.name === transaction.account && account.type !== "Cash",
      )
      const matchesSearch =
        searchTerm === "" ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${transaction?.id || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.account.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesAccount = accountFilter === "all" || transaction.account === accountFilter

      const matchesType =
        transactionTypeFilter === "all" || transaction.type.toLowerCase() === transactionTypeFilter.toLowerCase()

      return matchesSearch && matchesAccount && matchesType
    })
  }, [bankAccounts, transactions, searchTerm, accountFilter, transactionTypeFilter])

  // Filter transactions for Cash Tab (only cash-related transactions)
  const filteredCashTransactions = transactions.filter((transaction) => {
    const isCashTransaction = bankAccounts.some(
      (account) => account.name === transaction.account && account.type === "Cash",
    )
    const matchesSearch =
      searchTerm === "" ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${transaction?.id || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAccount = accountFilter === "all" || transaction.account === accountFilter

    const matchesType =
      transactionTypeFilter === "all" || transaction.type.toLowerCase() === transactionTypeFilter.toLowerCase()

    return isCashTransaction && matchesSearch && matchesAccount && matchesType
  })

  // Get bank book transactions (similar to cash book, but for bank)
  const getBankBookTransactions = () => {
    const bankBookEntries = journalEntries
      .filter((entry) => {
        const matchesDateFilter =
          (!cashBookStartDate || entry.date >= cashBookStartDate) && (!cashBookEndDate || entry.date <= cashBookEndDate)
        return (
          (entry.debitAccount === "Bank" || entry.creditAccount === "Bank") &&
          entry.status === "Posted" &&
          matchesDateFilter
        )
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return bankBookEntries
  }

  const bankBookTransactions = getBankBookTransactions()

  // Paginate bank accounts
  const paginatedBankAccounts = filteredBankAccounts.slice(
    accountPage * accountRowsPerPage,
    accountPage * accountRowsPerPage + accountRowsPerPage,
  )

  // Paginate cash accounts
  const paginatedCashAccounts = filteredCashAccounts.slice(
    accountPage * accountRowsPerPage,
    accountPage * accountRowsPerPage + accountRowsPerPage,
  )

  // Paginate bank transactions
  const paginatedBankTransactions = filteredBankTransactions.slice(
    transactionPage * transactionRowsPerPage,
    transactionPage * transactionRowsPerPage + transactionRowsPerPage,
  )

  // Paginate cash transactions
  const paginatedCashTransactions = filteredCashTransactions.slice(
    transactionPage * transactionRowsPerPage,
    transactionPage * transactionRowsPerPage + transactionRowsPerPage,
  )

  // Paginate bank book transactions
  const paginatedBankBookTransactions = bankBookTransactions.slice(
    transactionPage * transactionRowsPerPage, // Reusing transactionPage/RowsPerPage for simplicity, could have separate
    transactionPage * transactionRowsPerPage + transactionRowsPerPage,
  )

  // Calculate total balance (across all accounts, including cash)
  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0)

  // Calculate net cash flow (overall, for the metric card)
  const overallInflows = transactions
    .filter((t) => t.type === "Deposit" && t.status === "Cleared")
    .reduce((sum, t) => sum + t.amount, 0)

  const overallOutflows = transactions
    .filter((t) => t.type === "Withdrawal" && t.status === "Cleared")
    .reduce((sum, t) => sum + t.amount, 0)

  const netCashFlow = overallInflows - overallOutflows

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
    if (accountToDelete && deleteBankAccount) {
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
    if (transactionToDelete && deleteTransaction) {
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

  // Handle bank date update
  const handleBankDateUpdate = (entryId: string, newDate: string) => {
    setBankDates((prev) => ({
      ...prev,
      [entryId]: newDate,
    }))
  }

  // Get bank reconciliation transactions
  const getBankReconciliationTransactions = () => {
    // Filter journal entries that involve bank accounts
    const bankTransactions = journalEntries
      .filter((entry) => {
        return (entry.debitAccount === "Bank" || entry.creditAccount === "Bank") && entry.status === "Posted"
      })
      .map((entry) => {
        // Determine transaction type and amounts based on accounting principles
        const isReceipt = entry.debitAccount === "Bank" // Money coming into bank
        const isPayment = entry.creditAccount === "Bank" // Money going out of bank

        // Get payment method based on amount and description
        const getPaymentMethod = (amount: number, description: string) => {
          if (amount >= 200000) return "NEFT"
          if (amount >= 50000) return "RTGS"
          if (description.toLowerCase().includes("salary") || description.toLowerCase().includes("payroll"))
            return "NEFT"
          if (description.toLowerCase().includes("utility") || description.toLowerCase().includes("bill")) return "UPI"
          return "UPI"
        }

        // Get bank name based on the bank account used
        const getBankName = (entry: any) => {
          if (entry.bankAccount) {
            const account = bankAccounts.find((acc) => acc.id === entry.bankAccount)
            return account?.bank || "State Bank of India"
          }
          return "State Bank of India" // Default bank
        }

        return {
          id: entry.id,
          date: entry.date,
          description: entry.description,
          type: isReceipt ? "Receipt" : "Payment",
          method: getPaymentMethod(entry.amount, entry.description),
          bankName: getBankName(entry),
          instrumentDate: entry.date, // Same as transaction date initially
          bankDate: bankDates[entry.id] || entry.date, // Editable bank date
          debit: isPayment ? entry.amount : 0, // Show amount in debit for payments
          credit: isReceipt ? entry.amount : 0, // Show amount in credit for receipts
          reference: entry.reference,
          originalEntry: entry,
        }
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return bankTransactions
  }

  const bankReconciliationTransactions = getBankReconciliationTransactions()

  // Paginate reconciliation transactions
  const paginatedReconciliationTransactions = bankReconciliationTransactions.slice(
    reconciliationPage * reconciliationRowsPerPage,
    reconciliationPage * reconciliationRowsPerPage + reconciliationRowsPerPage,
  )

  // Export function
  const handleExport = () => {
    let dataToExport: any[] = []
    let filename = ""
    let csvData = ""

    if (mainTab === "banking") {
      if (bankingSubTab === "accounts") {
        dataToExport = filteredBankAccounts
        filename = "bank-accounts.csv"
      } else if (bankingSubTab === "transactions") {
        dataToExport = filteredBankTransactions
        filename = "bank-transactions.csv"
      } else if (bankingSubTab === "bankbook") {
        // Export bank book
        filename = "bank-book.csv"
        csvData = "Type,Date,Particulars,Reference,Amount (₹)\n"
        bankBookTransactions.forEach((entry) => {
          const type = entry.debitAccount === "Bank" ? "Receipt" : "Payment"
          const particulars =
            entry.debitAccount === "Bank"
              ? `To ${entry.creditAccount} - ${entry.description}`
              : `By ${entry.debitAccount} - ${entry.description}`
          csvData += `${type},${entry.date},"${particulars}","${entry.reference}",${entry.amount}\n`
        })
      } else if (bankingSubTab === "reconciliation") {
        // Export bank reconciliation
        filename = "bank-reconciliation.csv"
        csvData = "Date,Description,Type,Method,Bank Name,Instrument Date,Bank Date,Debit (₹),Credit (₹)\n"
        bankReconciliationTransactions.forEach((transaction) => {
          csvData += `${transaction.date},"${transaction.description}","${transaction.type}","${transaction.method}","${transaction.bankName}","${transaction.instrumentDate}","${transaction.bankDate}",${transaction.debit},${transaction.credit}\n`
        })
      }
    } else if (mainTab === "cash") {
      if (cashSubTab === "cashaccounts") {
        dataToExport = filteredCashAccounts
        filename = "cash-accounts.csv"
      } else if (cashSubTab === "transactions") {
        dataToExport = filteredCashTransactions
        filename = "cash-transactions.csv"
      } else if (cashSubTab === "cashbook") {
        // Export cash book (existing logic)
        filename = "cash-book.csv"
        csvData = "Type,Date,Particulars,Reference,Amount (₹)\n"

        const cashReceipts = journalEntries
          .filter((entry) => {
            const matchesDateFilter =
              (!cashBookStartDate || entry.date >= cashBookStartDate) &&
              (!cashBookEndDate || entry.date <= cashBookEndDate)
            return entry.debitAccount === "Cash" && entry.status === "Posted" && matchesDateFilter
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        cashReceipts.forEach((entry) => {
          csvData += `Receipt,${entry.date},"To ${entry.creditAccount} - ${entry.description}","${entry.reference}",${entry.amount}\n`
        })

        const cashPayments = journalEntries
          .filter((entry) => {
            const matchesDateFilter =
              (!cashBookStartDate || entry.date >= cashBookStartDate) &&
              (!cashBookEndDate || entry.date <= cashBookEndDate)
            return entry.creditAccount === "Cash" && entry.status === "Posted" && matchesDateFilter
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        cashPayments.forEach((entry) => {
          csvData += `Payment,${entry.date},"By ${entry.debitAccount} - ${entry.description}","${entry.reference}",${entry.amount}\n`
        })
      }
    }

    if (dataToExport.length === 0 && csvData === "") {
      alert("No data to export")
      return
    }

    if (csvData === "") {
      // If not a custom CSV generation
      const headers = Object.keys(dataToExport[0])
      csvData = [
        headers.join(","),
        ...dataToExport.map((row) =>
          headers
            .map((header) => {
              const cell = row[header]
              const cellStr = typeof cell === "object" ? JSON.stringify(cell) : String(cell)
              return `"${cellStr.replace(/"/g, '""')}"`
            })
            .join(","),
        ),
      ].join("\n")
    }

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
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
          value={`₹${formatNumberIndian(totalBalance)}`}
          description="Across all accounts"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-teal-500"
          iconBgColor="bg-teal-500/10"
        />
        <MetricCard
          title="Operating Account"
          value={`₹${formatNumberIndian(bankAccounts[0]?.balance)}`}
          description="Main business account"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <MetricCard
          title="Net Cash Flow (MTD)"
          value={`₹${formatNumberIndian(netCashFlow)}`}
          trend={netCashFlow > 0 ? "up" : "down"}
          // change={`${Math.abs(Math.round((netCashFlow / totalBalance) * 100))}%`}
          // description="vs last month"
          icon={<span className="text-lg">₹</span>}
          iconColor={netCashFlow > 0 ? "text-emerald-500" : "text-red-500"}
          iconBgColor={netCashFlow > 0 ? "bg-emerald-500/10" : "bg-red-500/10"}
        />
      </div>

      <Tabs defaultValue="banking" onValueChange={setMainTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="banking"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Banking
          </TabsTrigger>
          <TabsTrigger
            value="cash"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Cash
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banking" className="space-y-6 pt-4">
          <Tabs defaultValue="accounts" onValueChange={setBankingSubTab}>
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
                Bank Transactions
              </TabsTrigger>
              <TabsTrigger
                value="bankbook"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Bank Book
              </TabsTrigger>
              <TabsTrigger
                value="reconciliation"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Reconciliation
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
                    onClick={handleNewAccount}
                    className="bg-[#43ced7] hover:bg-[#43ced7]/90 text-white"
                  >
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
                      <SelectItem value="all">All Bank Accounts</SelectItem>
                      {bankAccounts
                        .filter((acc) => acc.type !== "Cash")
                        .map((account) => (
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
                      {paginatedBankTransactions.length > 0 ? (
                        paginatedBankTransactions.map((transaction) => (
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
                            No bank transactions found matching the current filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {filteredBankTransactions.length > 0 && (
                <DataTablePagination
                  totalItems={filteredBankTransactions.length}
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

            <TabsContent value="bankbook" className="space-y-6 pt-4">
              <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="start-date-bank" className="text-sm font-medium">
                      From:
                    </label>
                    <Input
                      id="start-date-bank"
                      type="date"
                      value={cashBookStartDate}
                      onChange={(e) => setCashBookStartDate(e.target.value)}
                      className="w-[150px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="end-date-bank" className="text-sm font-medium">
                      To:
                    </label>
                    <Input
                      id="end-date-bank"
                      type="date"
                      value={cashBookEndDate}
                      onChange={(e) => setCashBookEndDate(e.target.value)}
                      className="w-[150px]"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCashBookStartDate("")
                      setCashBookEndDate("")
                    }}
                  >
                    Clear Filter
                  </Button>
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
                  <CardTitle className="text-lg font-semibold">Bank Book</CardTitle>
                  <CardDescription>All bank receipts and payments</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-0">
                    <div className="border-r">
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 border-b">
                        <h3 className="font-semibold text-green-700 dark:text-green-400">Receipts (Dr.)</h3>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Particulars</TableHead>
                            <TableHead className="text-xs">Ref.</TableHead>
                            <TableHead className="text-xs text-right">Amount (₹)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedBankBookTransactions.filter((entry) => entry.debitAccount === "Bank").length > 0 ? (
                            paginatedBankBookTransactions
                              .filter((entry) => entry.debitAccount === "Bank")
                              .map((entry) => (
                                <TableRow key={entry.id} className="hover:bg-green-50/50 dark:hover:bg-green-950/20">
                                  <TableCell className="text-xs">{entry.date}</TableCell>
                                  <TableCell className="text-xs">
                                    <div>
                                      <div className="font-medium">To {entry.creditAccount}</div>
                                      <div className="text-muted-foreground text-xs">{entry.description}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs">{entry.reference}</TableCell>
                                  <TableCell className="text-xs text-right font-medium">
                                    {entry.amount.toLocaleString("en-IN")}
                                  </TableCell>
                                </TableRow>
                              ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                                No bank receipts found for the selected period
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <div className="bg-red-50 dark:bg-red-950/30 p-3 border-b">
                        <h3 className="font-semibold text-red-700 dark:text-red-400">Payments (Cr.)</h3>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Particulars</TableHead>
                            <TableHead className="text-xs">Ref.</TableHead>
                            <TableHead className="text-xs text-right">Amount (₹)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedBankBookTransactions.filter((entry) => entry.creditAccount === "Bank").length >
                            0 ? (
                            paginatedBankBookTransactions
                              .filter((entry) => entry.creditAccount === "Bank")
                              .map((entry) => (
                                <TableRow key={entry.id} className="hover:bg-red-50/50 dark:hover:bg-red-950/20">
                                  <TableCell className="text-xs">{entry.date}</TableCell>
                                  <TableCell className="text-xs">
                                    <div>
                                      <div className="font-medium">By {entry.debitAccount}</div>
                                      <div className="text-muted-foreground text-xs">{entry.description}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs">{entry.reference}</TableCell>
                                  <TableCell className="text-xs text-right font-medium">
                                    {entry.amount.toLocaleString("en-IN")}
                                  </TableCell>
                                </TableRow>
                              ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                                No bank payments found for the selected period
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="border-t bg-muted/20 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Total Receipts</h4>
                        <p className="text-lg font-bold">
                          ₹
                          {bankBookTransactions
                            .filter((entry) => entry.debitAccount === "Bank")
                            .reduce((sum, entry) => sum + entry.amount, 0)
                            .toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Total Payments</h4>
                        <p className="text-lg font-bold">
                          ₹
                          {bankBookTransactions
                            .filter((entry) => entry.creditAccount === "Bank")
                            .reduce((sum, entry) => sum + entry.amount, 0)
                            .toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Net Bank Movement</h4>
                      <p
                        className={`text-xl font-bold ${(() => {
                          const receipts = bankBookTransactions
                            .filter((entry) => entry.debitAccount === "Bank")
                            .reduce((sum, entry) => sum + entry.amount, 0)
                          const payments = bankBookTransactions
                            .filter((entry) => entry.creditAccount === "Bank")
                            .reduce((sum, entry) => sum + entry.amount, 0)
                          return receipts - payments >= 0 ? "text-green-600" : "text-red-600"
                        })()}`}
                      >
                        ₹{(() => {
                          const receipts = bankBookTransactions
                            .filter((entry) => entry.debitAccount === "Bank")
                            .reduce((sum, entry) => sum + entry.amount, 0)
                          const payments = bankBookTransactions
                            .filter((entry) => entry.creditAccount === "Bank")
                            .reduce((sum, entry) => sum + entry.amount, 0)
                          return Math.abs(receipts - payments).toLocaleString("en-IN")
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {bankBookTransactions.length > 0 && (
                <DataTablePagination
                  totalItems={bankBookTransactions.length}
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
                  <h3 className="text-lg font-semibold">Bank Reconciliation</h3>
                  <span className="text-sm text-muted-foreground">
                    ({bankReconciliationTransactions.length} transactions)
                  </span>
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
                  <CardTitle className="text-lg font-semibold">Bank Transactions</CardTitle>
                  <CardDescription>All transactions involving bank accounts from journal entries</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Bank Name</TableHead>
                        <TableHead>Instrument Date</TableHead>
                        <TableHead>Bank Date</TableHead>
                        <TableHead className="text-right">Debit (₹)</TableHead>
                        <TableHead className="text-right">Credit (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedReconciliationTransactions.length > 0 ? (
                        paginatedReconciliationTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="text-sm">{transaction.date}</TableCell>
                            <TableCell className="text-sm max-w-[200px]">
                              <div className="truncate" title={transaction.description}>
                                {transaction.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                status={transaction.type.toLowerCase() as any}
                                className={
                                  transaction.type === "Receipt"
                                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {transaction.method}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">{transaction.bankName}</TableCell>
                            <TableCell className="text-sm">{transaction.instrumentDate}</TableCell>
                            <TableCell>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-[120px] justify-start text-left font-normal"
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {transaction.bankDate
                                      ? format(new Date(transaction.bankDate), "dd/MM/yyyy")
                                      : "Select"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={transaction.bankDate ? new Date(transaction.bankDate) : undefined}
                                    onSelect={(date) => {
                                      if (date) {
                                        handleBankDateUpdate(transaction.id, format(date, "yyyy-MM-dd"))
                                      }
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {transaction.debit > 0 ? transaction.debit.toLocaleString("en-IN") : "-"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {transaction.credit > 0 ? transaction.credit.toLocaleString("en-IN") : "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                            No bank transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border border-border/40">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-lg font-semibold">Reconciliation Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Total Debits (Payments)</h4>
                      <p className="text-xl font-bold">
                        ₹
                        {bankReconciliationTransactions
                          .reduce((sum, transaction) => sum + transaction.debit, 0)
                          .toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-center">
                      <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Total Credits (Receipts)</h4>
                      <p className="text-xl font-bold">
                        ₹
                        {bankReconciliationTransactions
                          .reduce((sum, transaction) => sum + transaction.credit, 0)
                          .toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-center">
                      <h4 className="font-medium mb-2">Net Bank Movement</h4>
                      <p
                        className={`text-xl font-bold ${(() => {
                          const totalCredits = bankReconciliationTransactions.reduce(
                            (sum, transaction) => sum + transaction.credit,
                            0,
                          )
                          const totalDebits = bankReconciliationTransactions.reduce(
                            (sum, transaction) => sum + transaction.debit,
                            0,
                          )
                          return totalCredits - totalDebits >= 0 ? "text-green-600" : "text-red-600"
                        })()}`}
                      >
                        ₹{(() => {
                          const totalCredits = bankReconciliationTransactions.reduce(
                            (sum, transaction) => sum + transaction.credit,
                            0,
                          )
                          const totalDebits = bankReconciliationTransactions.reduce(
                            (sum, transaction) => sum + transaction.debit,
                            0,
                          )
                          return Math.abs(totalCredits - totalDebits).toLocaleString("en-IN")
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {bankReconciliationTransactions.length > 0 && (
                <DataTablePagination
                  totalItems={bankReconciliationTransactions.length}
                  itemsPerPage={reconciliationRowsPerPage}
                  currentPage={reconciliationPage + 1}
                  onPageChange={(page) => setReconciliationPage(page - 1)}
                  onRowsPerPageChange={(newValue) => {
                    setReconciliationRowsPerPage(newValue)
                    setReconciliationPage(0)
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="cash" className="space-y-6 pt-4">
          <Tabs defaultValue="cashaccounts" onValueChange={setCashSubTab}>
            <TabsList className="bg-muted/50 p-1 rounded-lg">
              <TabsTrigger
                value="cashaccounts"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Cash Accounts
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Cash Transactions
              </TabsTrigger>
              <TabsTrigger
                value="cashbook"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
              >
                Cash Book
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cashaccounts" className="space-y-6 pt-4">
              <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search cash accounts..."
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
                      <SelectItem value="cash">Cash</SelectItem>
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
                    onClick={handleNewAccount}
                    className="bg-[#43ced7] hover:bg-[#43ced7]/90 text-white"
                  >
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
                      {paginatedCashAccounts.length > 0 ? (
                        paginatedCashAccounts.map((account) => (
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
                            No cash accounts found matching the current filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {paginatedCashAccounts.length > 0 && (
                <DataTablePagination
                  totalItems={filteredCashAccounts.length}
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
                      <SelectItem value="all">All Cash Accounts</SelectItem>
                      {bankAccounts
                        .filter((acc) => acc.type === "Cash")
                        .map((account) => (
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
                      {paginatedCashTransactions.length > 0 ? (
                        paginatedCashTransactions.map((transaction) => (
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
                            No cash transactions found matching the current filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {filteredCashTransactions.length > 0 && (
                <DataTablePagination
                  totalItems={filteredCashTransactions.length}
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

            <TabsContent value="cashbook" className="space-y-6 pt-4">
              <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="start-date" className="text-sm font-medium">
                      From:
                    </label>
                    <Input
                      id="start-date"
                      type="date"
                      value={cashBookStartDate}
                      onChange={(e) => setCashBookStartDate(e.target.value)}
                      className="w-[150px]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="end-date" className="text-sm font-medium">
                      To:
                    </label>
                    <Input
                      id="end-date"
                      type="date"
                      value={cashBookEndDate}
                      onChange={(e) => setCashBookEndDate(e.target.value)}
                      className="w-[150px]"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCashBookStartDate("")
                      setCashBookEndDate("")
                    }}
                  >
                    Clear Filter
                  </Button>
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
                  <CardTitle className="text-lg font-semibold">Cash Book</CardTitle>
                  <CardDescription>All cash receipts and payments</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-0">
                    <div className="border-r">
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 border-b">
                        <h3 className="font-semibold text-green-700 dark:text-green-400">Receipts (Dr.)</h3>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Particulars</TableHead>
                            <TableHead className="text-xs">Ref.</TableHead>
                            <TableHead className="text-xs text-right">Amount (₹)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            const cashReceipts = journalEntries
                              .filter((entry) => {
                                const matchesDateFilter =
                                  (!cashBookStartDate || entry.date >= cashBookStartDate) &&
                                  (!cashBookEndDate || entry.date <= cashBookEndDate)
                                return entry.debitAccount === "Cash" && entry.status === "Posted" && matchesDateFilter
                              })
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

                            let runningBalance = 0

                            return cashReceipts.length > 0 ? (
                              cashReceipts.map((entry) => {
                                runningBalance += entry.amount
                                return (
                                  <TableRow key={entry.id} className="hover:bg-green-50/50 dark:hover:bg-green-950/20">
                                    <TableCell className="text-xs">{entry.date}</TableCell>
                                    <TableCell className="text-xs">
                                      <div>
                                        <div className="font-medium">To {entry.creditAccount}</div>
                                        <div className="text-muted-foreground text-xs">{entry.description}</div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs">{entry.reference}</TableCell>
                                    <TableCell className="text-xs text-right font-medium">
                                      {entry.amount.toLocaleString("en-IN")}
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                                  No cash receipts found for the selected period
                                </TableCell>
                              </TableRow>
                            )
                          })()}
                        </TableBody>
                      </Table>
                    </div>

                    <div>
                      <div className="bg-red-50 dark:bg-red-950/30 p-3 border-b">
                        <h3 className="font-semibold text-red-700 dark:text-red-400">Payments (Cr.)</h3>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Date</TableHead>
                            <TableHead className="text-xs">Particulars</TableHead>
                            <TableHead className="text-xs">Ref.</TableHead>
                            <TableHead className="text-xs text-right">Amount (₹)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(() => {
                            const cashPayments = journalEntries
                              .filter((entry) => {
                                const matchesDateFilter =
                                  (!cashBookStartDate || entry.date >= cashBookStartDate) &&
                                  (!cashBookEndDate || entry.date <= cashBookEndDate)
                                return entry.creditAccount === "Cash" && entry.status === "Posted" && matchesDateFilter
                              })
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

                            return cashPayments.length > 0 ? (
                              cashPayments.map((entry) => (
                                <TableRow key={entry.id} className="hover:bg-red-50/50 dark:hover:bg-red-950/20">
                                  <TableCell className="text-xs">{entry.date}</TableCell>
                                  <TableCell className="text-xs">
                                    <div>
                                      <div className="font-medium">By {entry.debitAccount}</div>
                                      <div className="text-muted-foreground text-xs">{entry.description}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs">{entry.reference}</TableCell>
                                  <TableCell className="text-xs text-right font-medium">
                                    {entry.amount.toLocaleString("en-IN")}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                                  No cash payments found for the selected period
                                </TableCell>
                              </TableRow>
                            )
                          })()}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="border-t bg-muted/20 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Total Receipts</h4>
                        <p className="text-lg font-bold">
                          ₹
                          {journalEntries
                            .filter((entry) => {
                              const matchesDateFilter =
                                (!cashBookStartDate || entry.date >= cashBookStartDate) &&
                                (!cashBookEndDate || entry.date <= cashBookEndDate)
                              return entry.debitAccount === "Cash" && entry.status === "Posted" && matchesDateFilter
                            })
                            .reduce((sum, entry) => sum + entry.amount, 0)
                            .toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Total Payments</h4>
                        <p className="text-lg font-bold">
                          ₹
                          {journalEntries
                            .filter((entry) => {
                              const matchesDateFilter =
                                (!cashBookStartDate || entry.date >= cashBookStartDate) &&
                                (!cashBookEndDate || entry.date <= cashBookEndDate)
                              return entry.creditAccount === "Cash" && entry.status === "Posted" && matchesDateFilter
                            })
                            .reduce((sum, entry) => sum + entry.amount, 0)
                            .toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Net Cash Flow</h4>
                      <p
                        className={`text-xl font-bold ${(() => {
                          const receipts = journalEntries
                            .filter((entry) => {
                              const matchesDateFilter =
                                (!cashBookStartDate || entry.date >= cashBookStartDate) &&
                                (!cashBookEndDate || entry.date <= cashBookEndDate)
                              return entry.debitAccount === "Cash" && entry.status === "Posted" && matchesDateFilter
                            })
                            .reduce((sum, entry) => sum + entry.amount, 0)

                          const payments = journalEntries
                            .filter((entry) => {
                              const matchesDateFilter =
                                (!cashBookStartDate || entry.date >= cashBookStartDate) &&
                                (!cashBookEndDate || entry.date <= cashBookEndDate)
                              return entry.creditAccount === "Cash" && entry.status === "Posted" && matchesDateFilter
                            })
                            .reduce((sum, entry) => sum + entry.amount, 0)

                          return receipts - payments >= 0 ? "text-green-600" : "text-red-600"
                        })()}`}
                      >
                        ₹{(() => {
                          const receipts = journalEntries
                            .filter((entry) => {
                              const matchesDateFilter =
                                (!cashBookStartDate || entry.date >= cashBookStartDate) &&
                                (!cashBookEndDate || entry.date <= cashBookEndDate)
                              return entry.debitAccount === "Cash" && entry.status === "Posted" && matchesDateFilter
                            })
                            .reduce((sum, entry) => sum + entry.amount, 0)

                          const payments = journalEntries
                            .filter((entry) => {
                              const matchesDateFilter =
                                (!cashBookStartDate || entry.date >= cashBookStartDate) &&
                                (!cashBookEndDate || entry.date <= cashBookEndDate)
                              return entry.creditAccount === "Cash" && entry.status === "Posted" && matchesDateFilter
                            })
                            .reduce((sum, entry) => sum + entry.amount, 0)

                          return Math.abs(receipts - payments).toLocaleString("en-IN")
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <BankAccountForm
        open={isAccountFormOpen}
        onOpenChange={setIsAccountFormOpen}
        initialValues={selectedAccount || undefined}
        accountId={selectedAccount?.id}
      />

      <TransactionForm
        open={isTransactionFormOpen}
        onOpenChange={setIsTransactionFormOpen}
        initialValues={selectedTransaction || undefined}
        transactionId={selectedTransaction?.id}
      />

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
