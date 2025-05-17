"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { useFinance } from "@/contexts/finance-context"
import { JournalEntryForm } from "@/components/finance/journal-entry-form"
import type { JournalEntry } from "@/contexts/finance-context"
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
import React from "react"
import { AccountForm } from "@/components/finance/account-form"
import type { Account } from "@/contexts/finance-context"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { JournalEntryViewDialog } from "@/components/finance/journal-entry-view-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Define the trial balance data type
type TrialBalanceEntry = {
  account: string
  debit: number | null
  credit: number | null
}

type TrialBalancePeriod = {
  label: string
  date: string
  entries: TrialBalanceEntry[]
  totalDebit: number
  totalCredit: number
}

// Sample trial balance data for different periods
const trialBalanceData: Record<string, TrialBalancePeriod> = {
  current: {
    label: "Current Month",
    date: "June 30, 2023",
    entries: [
      { account: "Cash", debit: 3500000, credit: null },
      { account: "Accounts Receivable", debit: 6300000, credit: null },
      { account: "Inventory", debit: 8200000, credit: null },
      { account: "Fixed Assets", debit: 12500000, credit: null },
      { account: "Accounts Payable", debit: null, credit: 4900000 },
      { account: "Long-term Liabilities", debit: null, credit: 7500000 },
      { account: "Capital", debit: null, credit: 10000000 },
      { account: "Retained Earnings", debit: null, credit: 4500000 },
      { account: "Sales Revenue", debit: null, credit: 18500000 },
      { account: "Cost of Goods Sold", debit: 9800000, credit: null },
      { account: "Operating Expenses", debit: 4200000, credit: null },
      { account: "Salary Expenses", debit: 6500000, credit: null },
      { account: "Utilities Expenses", debit: 1200000, credit: null },
    ],
    totalDebit: 52200000,
    totalCredit: 52200000,
  },
  previous: {
    label: "Previous Month",
    date: "May 31, 2023",
    entries: [
      { account: "Cash", debit: 3200000, credit: null },
      { account: "Accounts Receivable", debit: 5800000, credit: null },
      { account: "Inventory", debit: 7900000, credit: null },
      { account: "Fixed Assets", debit: 12500000, credit: null },
      { account: "Accounts Payable", debit: null, credit: 4500000 },
      { account: "Long-term Liabilities", debit: null, credit: 7500000 },
      { account: "Capital", debit: null, credit: 10000000 },
      { account: "Retained Earnings", debit: null, credit: 4200000 },
      { account: "Sales Revenue", debit: null, credit: 17200000 },
      { account: "Cost of Goods Sold", debit: 9100000, credit: null },
      { account: "Operating Expenses", debit: 3900000, credit: null },
      { account: "Salary Expenses", debit: 6500000, credit: null },
      { account: "Utilities Expenses", debit: 1100000, credit: null },
    ],
    totalDebit: 50000000,
    totalCredit: 50000000,
  },
  quarter: {
    label: "Current Quarter",
    date: "Q2 2023",
    entries: [
      { account: "Cash", debit: 3500000, credit: null },
      { account: "Accounts Receivable", debit: 6300000, credit: null },
      { account: "Inventory", debit: 8200000, credit: null },
      { account: "Fixed Assets", debit: 12500000, credit: null },
      { account: "Accounts Payable", debit: null, credit: 4900000 },
      { account: "Long-term Liabilities", debit: null, credit: 7500000 },
      { account: "Capital", debit: null, credit: 10000000 },
      { account: "Retained Earnings", debit: null, credit: 4500000 },
      { account: "Sales Revenue", debit: null, credit: 22800000 },
      { account: "Cost of Goods Sold", debit: 12500000, credit: null },
      { account: "Operating Expenses", debit: 5200000, credit: null },
      { account: "Salary Expenses", debit: 13000000, credit: null },
      { account: "Utilities Expenses", debit: 2400000, credit: null },
    ],
    totalDebit: 63600000,
    totalCredit: 63600000,
  },
  year: {
    label: "Current Year",
    date: "YTD 2023",
    entries: [
      { account: "Cash", debit: 3500000, credit: null },
      { account: "Accounts Receivable", debit: 6300000, credit: null },
      { account: "Inventory", debit: 8200000, credit: null },
      { account: "Fixed Assets", debit: 12500000, credit: null },
      { account: "Accounts Payable", debit: null, credit: 4900000 },
      { account: "Long-term Liabilities", debit: null, credit: 7500000 },
      { account: "Capital", debit: null, credit: 10000000 },
      { account: "Retained Earnings", debit: null, credit: 4500000 },
      { account: "Sales Revenue", debit: null, credit: 42500000 },
      { account: "Cost of Goods Sold", debit: 22800000, credit: null },
      { account: "Operating Expenses", debit: 9800000, credit: null },
      { account: "Salary Expenses", debit: 19500000, credit: null },
      { account: "Utilities Expenses", debit: 3600000, credit: null },
    ],
    totalDebit: 86200000,
    totalCredit: 86200000,
  },
}

export function GeneralLedger() {
  const { journalEntries, accounts, deleteJournalEntry } = useFinance()
  const [activeTab, setActiveTab] = useState("journal-entries")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [accountTypeFilter, setAccountTypeFilter] = useState("all")
  const [accountSearchTerm, setAccountSearchTerm] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [trialBalancePeriod, setTrialBalancePeriod] = useState<string>("current")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [entryToView, setEntryToView] = useState<string | null>(null)
  const [isViewAccountDialogOpen, setIsViewAccountDialogOpen] = useState(false)
  const [accountToView, setAccountToView] = useState<Account | null>(null)

  // Pagination state
  const [journalCurrentPage, setJournalCurrentPage] = useState(1)
  const [journalItemsPerPage] = useState(5)
  const [accountCurrentPage, setAccountCurrentPage] = useState(1)
  const [accountItemsPerPage] = useState(5)

  // Get the current trial balance data based on selected period
  const currentTrialBalance = trialBalanceData[trialBalancePeriod]

  // Filter journal entries based on search term and status
  const filteredEntries = journalEntries.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.debitAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.creditAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || entry.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Calculate pagination for journal entries
  const indexOfLastJournalEntry = journalCurrentPage * journalItemsPerPage
  const indexOfFirstJournalEntry = indexOfLastJournalEntry - journalItemsPerPage
  const paginatedEntries = filteredEntries.slice(indexOfFirstJournalEntry, indexOfLastJournalEntry)

  // Reset journal page when filters change
  useEffect(() => {
    setJournalCurrentPage(1)
  }, [searchTerm, statusFilter])

  // Filter accounts based on search term (only Account Code and Account Name) and account type
  const filteredAccounts = accounts.filter((account) => {
    // Only search in Account Code (id) and Account Name (name)
    const matchesSearch =
      accountSearchTerm === "" ||
      account.id.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(accountSearchTerm.toLowerCase())

    const matchesType = accountTypeFilter === "all" || account.type.toLowerCase() === accountTypeFilter.toLowerCase()

    return matchesSearch && matchesType
  })

  // Get all parent accounts that match the filter or have children that match the filter
  const parentAccountIds = new Set(
    filteredAccounts.filter((account) => account.parentId).map((account) => account.parentId),
  )

  // Get parent accounts that either match the filter themselves or have children that match
  const visibleParentAccounts = accounts.filter(
    (account) =>
      !account.parentId &&
      // Parent account matches the filter
      (((accountTypeFilter === "all" || account.type.toLowerCase() === accountTypeFilter.toLowerCase()) &&
        (accountSearchTerm === "" ||
          account.id.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
          account.name.toLowerCase().includes(accountSearchTerm.toLowerCase()))) ||
        // Or has children that match the filter
        parentAccountIds.has(account.id)),
  )

  // Calculate pagination for accounts
  const indexOfLastAccount = accountCurrentPage * accountItemsPerPage
  const indexOfFirstAccount = indexOfLastAccount - accountItemsPerPage
  const paginatedParentAccounts = visibleParentAccounts.slice(indexOfFirstAccount, indexOfLastAccount)

  // Reset account page when filters change
  useEffect(() => {
    setAccountCurrentPage(1)
  }, [accountSearchTerm, accountTypeFilter])

  // Handle view button click
  const handleView = (entry: JournalEntry) => {
    setEntryToView(entry.id)
    setIsViewDialogOpen(true)
  }

  // Handle edit button click
  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsFormOpen(true)
  }

  // Handle delete button click
  const handleDelete = (id: string) => {
    setEntryToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = () => {
    if (entryToDelete) {
      deleteJournalEntry(entryToDelete)
      setEntryToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle edit account button click
  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account)
    setIsAccountFormOpen(true)
  }

  // Handle view account button click
  const handleViewAccount = (account: Account) => {
    setAccountToView(account)
    setIsViewAccountDialogOpen(true)
  }

  // Handle new journal entry button click
  const handleNewEntry = () => {
    setSelectedEntry(null)
    setIsFormOpen(true)
  }

  // Handle print trial balance
  const handlePrintTrialBalance = () => {
    // Get the current trial balance data
    const trialBalance = trialBalanceData[trialBalancePeriod]

    // Create a new window for printing
    const printWindow = window.open("", "_blank")

    // Generate the print content with proper styling
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trial Balance - Trident FMS</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 5px;
          }
          h2 {
            font-size: 16px;
            color: #666;
            font-weight: normal;
            margin-top: 0;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .amount {
            text-align: right;
          }
          .total-row {
            font-weight: bold;
            background-color: #f5f5f5;
          }
          .company-header {
            margin-bottom: 30px;
          }
          @media print {
            body {
              margin: 0.5cm;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="company-header">
          <h1>Trial Balance</h1>
          <h2>As of ${trialBalance.date}</h2>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th class="amount">Debit (₹)</th>
              <th class="amount">Credit (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${trialBalance.entries
              .map(
                (entry) => `
              <tr>
                <td>${entry.account}</td>
                <td class="amount">${entry.debit ? entry.debit.toLocaleString("en-IN") : "-"}</td>
                <td class="amount">${entry.credit ? entry.credit.toLocaleString("en-IN") : "-"}</td>
              </tr>
            `,
              )
              .join("")}
            <tr class="total-row">
              <td>Total</td>
              <td class="amount">${trialBalance.totalDebit.toLocaleString("en-IN")}</td>
              <td class="amount">${trialBalance.totalCredit.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()">Print</button>
        </div>
      </body>
      </html>
    `

    // Write the content to the new window
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Trigger print when content is loaded
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  // Handle export functionality
  const handleExport = () => {
    // Get data based on active tab
    let csvData = ""
    let filename = ""

    if (activeTab === "journal-entries") {
      // Export journal entries
      filename = "journal-entries.csv"

      // Create CSV header
      csvData = "Entry ID,Date,Description,Debit Account,Credit Account,Amount (₹),Reference,Status\n"

      // Add filtered entries data
      filteredEntries.forEach((entry) => {
        csvData += `${entry.id},${entry.date},"${entry.description}",${entry.debitAccount},${entry.creditAccount},${entry.amount},"${entry.reference}",${entry.status}\n`
      })
    } else if (activeTab === "chart-of-accounts") {
      // Export chart of accounts
      filename = "chart-of-accounts.csv"

      // Create CSV header
      csvData = "Account Code,Account Name,Type,Balance (₹)\n"

      // Add filtered accounts data
      visibleParentAccounts.forEach((account) => {
        csvData += `${account.id},"${account.name}",${account.type},${account.balance}\n`

        // Add sub-accounts
        filteredAccounts
          .filter((subAccount) => subAccount.parentId === account.id)
          .forEach((subAccount) => {
            csvData += `${subAccount.id},"${subAccount.name}",${account.type},${subAccount.balance}\n`
          })
      })
    } else if (activeTab === "trial-balance") {
      // Export trial balance
      filename = `trial-balance-${trialBalancePeriod}.csv`

      // Create CSV header
      csvData = "Account,Debit (₹),Credit (₹)\n"

      // Add trial balance data
      currentTrialBalance.entries.forEach((entry) => {
        csvData += `"${entry.account}",${entry.debit || ""},${entry.credit || ""}\n`
      })

      // Add total row
      csvData += `Total,${currentTrialBalance.totalDebit},${currentTrialBalance.totalCredit}\n`
    }

    // Create and download the CSV file
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
      <Tabs defaultValue="journal-entries" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="journal-entries"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Journal Entries
          </TabsTrigger>
          <TabsTrigger
            value="chart-of-accounts"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Chart of Accounts
          </TabsTrigger>
          <TabsTrigger
            value="trial-balance"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Trial Balance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="journal-entries" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search journal entries..."
                  className="pl-8 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                onClick={handleNewEntry}
                style={{ backgroundColor: "#725af2", color: "white" }}
                className="hover:bg-[#5e48c9]"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Journal Entry
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Debit Account</TableHead>
                    <TableHead>Credit Account</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.length > 0 ? (
                    paginatedEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.id}</TableCell>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.debitAccount}</TableCell>
                        <TableCell>{entry.creditAccount}</TableCell>
                        <TableCell className="text-right">{entry.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell>{entry.reference}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                              entry.status === "Posted"
                                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                                : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-400"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleView(entry)} className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)} className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(entry.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                      <TableCell colSpan={9} className="h-24 text-center">
                        No journal entries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Journal Entries Pagination */}
          {filteredEntries.length > 0 && (
            <DataTablePagination
              totalItems={filteredEntries.length}
              itemsPerPage={journalItemsPerPage}
              currentPage={journalCurrentPage}
              onPageChange={setJournalCurrentPage}
            />
          )}
        </TabsContent>

        <TabsContent value="chart-of-accounts" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by Account Code or Name..."
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
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
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
                onClick={() => setIsAccountFormOpen(true)}
                className="bg-[#1b84ff] hover:bg-[#0a6edf] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Account
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Balance (₹)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedParentAccounts.length > 0 ? (
                    paginatedParentAccounts.map((account) => (
                      <React.Fragment key={account.id}>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-medium">{account.id}</TableCell>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>{account.type}</TableCell>
                          <TableCell className="text-right font-medium">
                            {account.balance.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditAccount(account)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewAccount(account)}
                                className="h-8 w-8"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {filteredAccounts
                          .filter((subAccount) => subAccount.parentId === account.id)
                          .map((subAccount) => (
                            <TableRow key={subAccount.id}>
                              <TableCell className="pl-8">{subAccount.id}</TableCell>
                              <TableCell>{subAccount.name}</TableCell>
                              <TableCell>{account.type}</TableCell>
                              <TableCell className="text-right">{subAccount.balance.toLocaleString("en-IN")}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditAccount(subAccount)}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewAccount(subAccount)}
                                    className="h-8 w-8"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No accounts found matching the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Chart of Accounts Pagination */}
          {visibleParentAccounts.length > 0 && (
            <DataTablePagination
              totalItems={visibleParentAccounts.length}
              itemsPerPage={accountItemsPerPage}
              currentPage={accountCurrentPage}
              onPageChange={setAccountCurrentPage}
            />
          )}
        </TabsContent>

        <TabsContent value="trial-balance" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select value={trialBalancePeriod} onValueChange={setTrialBalancePeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="previous">Previous Month</SelectItem>
                  <SelectItem value="quarter">Current Quarter</SelectItem>
                  <SelectItem value="year">Current Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintTrialBalance}>
                <FileText className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Trial Balance</CardTitle>
              <CardDescription>As of {currentTrialBalance.date}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit (₹)</TableHead>
                    <TableHead className="text-right">Credit (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTrialBalance.entries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.account}</TableCell>
                      <TableCell className="text-right">
                        {entry.debit ? entry.debit.toLocaleString("en-IN") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.credit ? entry.credit.toLocaleString("en-IN") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {currentTrialBalance.totalDebit.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      {currentTrialBalance.totalCredit.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Journal Entry Form Dialog */}
      <JournalEntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialValues={
          selectedEntry
            ? {
                date: selectedEntry.date,
                description: selectedEntry.description,
                debitAccount: selectedEntry.debitAccount,
                creditAccount: selectedEntry.creditAccount,
                amount: selectedEntry.amount,
                reference: selectedEntry.reference,
                status: selectedEntry.status,
              }
            : undefined
        }
        entryId={selectedEntry?.id}
      />

      {/* Journal Entry View Dialog */}
      <JournalEntryViewDialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} entryId={entryToView} />

      {/* Account Form */}
      <AccountForm
        open={isAccountFormOpen}
        onOpenChange={setIsAccountFormOpen}
        initialValues={
          selectedAccount
            ? {
                id: selectedAccount.id,
                name: selectedAccount.name,
                type: selectedAccount.type,
                balance: selectedAccount.balance,
                parentId: selectedAccount.parentId,
              }
            : undefined
        }
        accountId={selectedAccount?.id}
      />

      {/* Account View Dialog */}
      <Dialog open={isViewAccountDialogOpen} onOpenChange={setIsViewAccountDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
            <DialogDescription>
              Viewing details for account {accountToView?.id}: {accountToView?.name}
            </DialogDescription>
          </DialogHeader>
          {accountToView && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Code</h3>
                  <p className="text-base font-semibold">{accountToView.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Name</h3>
                  <p className="text-base font-semibold">{accountToView.name}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                <p className="text-base">{accountToView.type}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
                <p className="text-base font-bold">₹{accountToView.balance.toLocaleString("en-IN")}</p>
              </div>

              {accountToView.parentId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Parent Account</h3>
                  <p className="text-base">
                    {accounts.find((a) => a.id === accountToView.parentId)?.name} ({accountToView.parentId})
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500">Sub-Accounts</h3>
                {accounts.filter((a) => a.parentId === accountToView.id).length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {accounts
                      .filter((a) => a.parentId === accountToView.id)
                      .map((subAccount) => (
                        <li key={subAccount.id} className="text-sm">
                          {subAccount.id}: {subAccount.name} - ₹{subAccount.balance.toLocaleString("en-IN")}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No sub-accounts</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Recent Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Transaction history would be displayed here in a production environment.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
