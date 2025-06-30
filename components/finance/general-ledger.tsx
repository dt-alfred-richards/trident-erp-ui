"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { useFinance, type TrialBalanceEntry, getDisplayAccountName } from "@/contexts/finance-context"
import { JournalEntryForm } from "@/components/finance/journal-entry-form"
import type { JournalEntry, Account } from "@/contexts/finance-context"
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
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { JournalEntryViewDialog } from "@/components/finance/journal-entry-view-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Import DebitCreditNoteManager
import { DebitCreditNoteManager } from "@/components/finance/debit-credit-note-manager"
import { useJournalContext } from "./context/journal-context"
import { convertDate } from "../generic"

// Define the trial balance data type (already exists, keeping for context)
type TrialBalanceEntryType = {
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

// Sample trial balance data for different periods (keeping for context, but actual trialBalance is dynamic)
const trialBalanceData: Record<string, TrialBalancePeriod> = {
  current: {
    label: "Current Month",
    date: "June 30, 2023",
    entries: [
      { account: "Cash", debit: 3500000, credit: null },
      { account: "Bank", debit: 2800000, credit: null },
      { account: "Accounts Receivable", debit: 6300000, credit: null },
      { account: "Raw Materials Inventory", debit: 4200000, credit: null },
      { account: "Work-in-Progress", debit: 2500000, credit: null },
      { account: "Finished Goods Inventory", debit: 3800000, credit: null },
      { account: "Fixed Assets", debit: 12500000, credit: null },
      { account: "Accounts Payable", debit: null, credit: 4900000 },
      { account: "Sales Revenue", debit: null, credit: 18500000 },
      { account: "Wages", debit: 6500000, credit: null },
      { account: "Salary Expenses", debit: 4200000, credit: null },
      { account: "Utilities Expenses", debit: 1200000, credit: null },
    ],
    totalDebit: 47500000,
    totalCredit: 47500000,
  },
  previous: {
    label: "Previous Month",
    date: "May 31, 2023",
    entries: [
      { account: "Cash", debit: 3200000, credit: null },
      { account: "Bank", debit: 2600000, credit: null },
      { account: "Accounts Receivable", debit: 5800000, credit: null },
      { account: "Raw Materials Inventory", debit: 3900000, credit: null },
      { account: "Work-in-Progress", debit: 2200000, credit: null },
      { account: "Finished Goods Inventory", debit: 3500000, credit: null },
      { account: "Fixed Assets", debit: 12500000, credit: null },
      { account: "Accounts Payable", debit: null, credit: 4500000 },
      { account: "Sales Revenue", debit: null, credit: 17200000 },
      { account: "Wages", debit: 6500000, credit: null },
      { account: "Salary Expenses", debit: 3900000, credit: null },
      { account: "Utilities Expenses", debit: 1100000, credit: null },
    ],
    totalDebit: 45200000,
    totalCredit: 45200000,
  },
  quarter: {
    label: "Current Quarter",
    date: "Q2 2023",
    entries: [
      { account: "Cash", debit: 3500000, credit: null },
      { account: "Bank", debit: 2800000, credit: null },
      { account: "Accounts Receivable", debit: 6300000, credit: null },
      { account: "Raw Materials Inventory", debit: 4200000, credit: null },
      { account: "Work-in-Progress", debit: 2500000, credit: null },
      { account: "Finished Goods Inventory", debit: 3800000, credit: null },
      { account: "Fixed Assets", debit: 12500000, credit: null },
      { account: "Accounts Payable", debit: null, credit: 4900000 },
      { account: "Sales Revenue", debit: null, credit: 22800000 },
      { account: "Wages", debit: 13000000, credit: null },
      { account: "Salary Expenses", debit: 5200000, credit: null },
      { account: "Utilities Expenses", debit: 2400000, credit: null },
    ],
    totalDebit: 56200000,
    totalCredit: 56200000,
  },
  year: {
    label: "Current Year",
    date: "YTD 2023",
    entries: [
      { account: "Cash", debit: 3500000, credit: null },
      { account: "Bank", debit: 2800000, credit: null },
      { account: "Accounts Receivable", debit: 6300000, credit: null },
      { account: "Raw Materials Inventory", debit: 4200000, credit: null },
      { account: "Work-in-Progress", debit: 2500000, credit: null },
      { account: "Finished Goods Inventory", debit: 3800000, credit: null },
      { account: "Fixed Assets", debit: 12500000, credit: null },
      { account: "Accounts Payable", debit: null, credit: 4900000 },
      { account: "Sales Revenue", debit: null, credit: 42500000 },
      { account: "Wages", debit: 19500000, credit: null },
      { account: "Salary Expenses", debit: 9800000, credit: null },
      { account: "Utilities Expenses", debit: 3600000, credit: null },
    ],
    totalDebit: 68500000,
    totalCredit: 68500000,
  },
}

// Define account categories and their components for Chart of Accounts
const chartOfAccountsCategories = {
  "Current Assets": [
    "Cash",
    "Bank",
    "Accounts Receivable",
    "Raw Materials Inventory",
    "Work-in-Progress",
    "Finished Goods Inventory",
    "Prepaid Expenses",
    "Short Term Investment",
    "Other Receivables",
    "CGST Input",
    "SGST Input",
    "IGST Input",
  ],
  "Fixed Assets": ["Fixed Assets", "Accumulated Depreciation"],
  "Current Liabilities": [
    "Accounts Payable",
    "Short Term Loans",
    "Taxes Payable",
    "Accrued Expenses",
    "CGST Output",
    "SGST Output",
    "IGST Output",
  ],
  "Long Term Liabilities": ["Long Term Loans", "Bonds Payable", "Deferred Tax Liabilities"],
  Equity: ["Capital", "Retained Earnings", "Additional Paid-in Capital"],
  Revenue: ["Sales Revenue", "Service Revenue", "Interest Income", "Other Income"],
  "Cost of Goods Sold": ["Direct Materials", "Direct Labor", "Manufacturing Overhead"],
  "Operating Expenses": [
    "Salary Expenses",
    "Rent Expense",
    "Utilities Expenses",
    "Depreciation Expense",
    "Marketing Expense",
  ],
  "Other Expenses": ["Interest Expense", "Tax Expense", "Loss on Sale of Assets"],
}

// Define overhead categories for expense accounts
const overheadCategories: Record<string, "Direct Overhead" | "Indirect Overhead"> = {
  "Cost of Goods Sold": "Direct Overhead",
  Wages: "Direct Overhead", // Assuming wages directly tied to production
  "Salary Expenses": "Indirect Overhead", // Assuming administrative/office salaries
  "Utilities Expenses": "Indirect Overhead", // Assuming general utilities
  "Operating Expenses": "Indirect Overhead",
  "Inventory Loss": "Direct Overhead", // Directly related to production/inventory
  // Add more mappings as needed for other expense accounts
  "Rent Expense": "Indirect Overhead",
  "Depreciation Expense": "Indirect Overhead",
  "Marketing Expense": "Indirect Overhead",
  "Interest Expense": "Indirect Overhead",
  "Tax Expense": "Indirect Overhead",
  "Loss on Sale of Assets": "Indirect Overhead",
  "Fuel Expense": "Direct Overhead",
  "Food Expense": "Indirect Overhead",
  "Electricity Expense": "Indirect Overhead",
  "Machinery Expense": "Direct Overhead",
  "Telephone Expense": "Indirect Overhead",
  "Factory Maintenance": "Direct Overhead",
  "Water Expense": "Indirect Overhead",
}

// Define account categories for Balance Sheet
const balanceSheetAccountCategories = {
  assets: {
    current: [
      "Cash",
      "Bank",
      "Accounts Receivable",
      "Raw Materials Inventory",
      "Work-in-Progress",
      "Finished Goods Inventory",
      "Prepaid Expenses",
      "Short Term Investment",
      "Other Receivables",
      "CGST Input",
      "SGST Input",
      "IGST Input",
    ],
    fixed: ["Fixed Assets", "Accumulated Depreciation"],
    other: ["Other Assets"],
  },
  liabilities: {
    current: [
      "Accounts Payable",
      "Short Term Loans",
      "Bank Overdrafts",
      "GST Payable",
      "Accrued Expenses",
      "Unearned Revenue",
      "Other Current Liabilities",
      "CGST Output",
      "SGST Output",
      "IGST Output",
    ],
    longTerm: ["Long-term Liabilities"],
  },
  equity: ["Capital", "Retained Earnings"],
}

// Define account categories for Profit and Loss Account
const profitAndLossAccountCategories = {
  revenue: ["Sales Revenue", "Service Revenue", "Other Income"],
  cogs: ["Cost of Goods Sold", "Direct Materials", "Direct Labor", "Manufacturing Overhead", "Inventory Loss"], // Assuming wages and inventory loss are direct costs
  operatingExpenses: [
    "Salary Expenses",
    "Rent Expense",
    "Utilities Expenses",
    "Depreciation Expense",
    "Marketing Expense",
    "Fuel Expense",
    "Food Expense",
    "Electricity Expense",
    "Machinery Expense",
    "Telephone Expense",
    "Factory Maintenance",
    "Water Expense",
  ],
  otherIncome: ["Interest Income"],
  otherExpenses: ["Interest Expense", "Tax Expense", "Loss on Sale of Assets"],
}

export function GeneralLedger() {
  const { accounts, trialBalance = [] } = useFinance()
  const { data, deleteItem: deleteJournalEntry } = useJournalContext()
  const journalEntries = useMemo(() => {
    return data.map(item => {
      return ({
        id: `${item.id}`,
        date: convertDate(item.date as Date),
        description: item.description,
        debitAccount: item.debitAccount,
        creditAccount: item.creditAccount,
        amount: item.amount,
        reference: item.reference,
        status: item.status,
        transactionType: item.transcationType,
        gstPercentage: item.gst,
        partyType: item.partyType,
        debtorCustomer: item.debtorCustomer,
      })
    })
  }, [data])
  const [activeTab, setActiveTab] = useState("journal-entries")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [accountTypeFilter, setAccountTypeFilter] = useState("all")
  const [accountSearchTerm, setSearchTermAccount] = useState("") // Renamed to avoid conflict
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

  // Overheads date filter state
  const [overheadStartDate, setOverheadStartDate] = useState<string>("")
  const [overheadEndDate, setOverheadEndDate] = useState<string>("")
  const [salesStartDate, setSalesStartDate] = useState<string>("")

  const [salesEndDate, setSalesEndDate] = useState<string>("")

  // P/L and Expense Summary date filter state (reusing for both)
  const [plStartDate, setPlStartDate] = useState<string>("")
  const [plEndDate, setPlEndDate] = useState<string>("")

  // Pagination state
  const [journalCurrentPage, setJournalCurrentPage] = useState(1)
  const [journalItemsPerPage] = useState(5)
  const [accountCurrentPage, setAccountCurrentPage] = useState(1)
  const [accountItemsPerPage] = useState(5)

  // Remove the static trialBalanceData and replace with dynamic calculation
  const calculateTrialBalanceTotals = () => {
    const totalDebit = trialBalance.reduce((sum, entry) => sum + entry.debit, 0)
    const totalCredit = trialBalance.reduce((sum, entry) => sum + entry.credit, 0)
    return { totalDebit, totalCredit }
  }

  const { totalDebit, totalCredit } = calculateTrialBalanceTotals()

  // Filter trial balance entries that have non-zero balances
  const activeTrialBalanceEntries = trialBalance.filter((entry) => entry.debit > 0 || entry.credit > 0)

  // Get the current trial balance data based on selected period (keeping for context)
  const currentTrialBalance = trialBalanceData[trialBalancePeriod]

  // Filter journal entries based on search term and status
  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      const matchesSearch =
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.debitAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.creditAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || entry.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [journalEntries])

  // Calculate pagination for journal entries
  const indexOfLastJournalEntry = journalCurrentPage * journalItemsPerPage
  const indexOfFirstJournalEntry = (journalCurrentPage - 1) * journalItemsPerPage
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

  // Define the order of account types for sorting
  const accountTypeOrder = {
    Asset: 1,
    Liability: 2,
    Equity: 3,
    Revenue: 4,
    Expense: 5,
  }

  // Get all parent accounts that match the filter or have children that match the filter
  const parentAccountIds = new Set(
    filteredAccounts.filter((account) => account.parentId).map((account) => account.parentId),
  )

  // Get parent accounts that either match the filter themselves or have children that match
  const visibleParentAccountsUnsorted = accounts.filter(
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

  // Sort parent accounts by type order first, then by calculated balance in descending order
  const visibleParentAccounts = visibleParentAccountsUnsorted.sort((a, b) => {
    // First sort by account type order
    const typeOrderA = accountTypeOrder[a.type] || 999
    const typeOrderB = accountTypeOrder[b.type] || 999

    if (typeOrderA !== typeOrderB) {
      return typeOrderA - typeOrderB
    }

    // Then sort by calculated balance in descending order within the same type
    const balanceA = calculateAccountBalance(a)
    const balanceB = calculateAccountBalance(b)
    return balanceB - balanceA
  })

  // Function to calculate account balance from trial balance for Chart of Accounts
  const calculateAccountBalance = (account: Account): number => {
    // Special case for Current Assets - sum up specific accounts
    if (account.name === "Current Assets") {
      return calculateCurrentAssetsBalance()
    }

    // Check if this account belongs to a specific category (from chartOfAccountsCategories)
    for (const [category, accountNames] of Object.entries(chartOfAccountsCategories)) {
      if (account.name === category) {
        return calculateCategoryBalance(category, accountNames)
      }
    }

    if (account.parentId) {
      // For sub-accounts, get the actual balance from trial balance
      const trialBalanceEntry = trialBalance.find((entry) => entry.account === account.name)
      if (trialBalanceEntry) {
        // Calculate net balance based on account type
        if (account.type === "Asset" || account.type === "Expense") {
          return trialBalanceEntry.debit - trialBalanceEntry.credit
        } else {
          return trialBalanceEntry.credit - trialBalanceEntry.debit
        }
      }
      return 0
    } else {
      // For parent accounts, sum up all child accounts of the same type
      const childAccounts = accounts.filter((child) => child.parentId === account.id)
      const directBalance = childAccounts.reduce((sum, child) => {
        return sum + calculateAccountBalance(child)
      }, 0)

      // Also include any trial balance entries that match this account name
      const trialBalanceEntry = trialBalance.find((entry) => entry.account === account.name)
      let ownBalance = 0
      if (trialBalanceEntry) {
        if (account.type === "Asset" || account.type === "Expense") {
          ownBalance = trialBalanceEntry.debit - trialBalanceEntry.credit
        } else {
          ownBalance = trialBalanceEntry.credit - trialBalanceEntry.debit
        }
      }

      // For parent accounts without specific children, sum all trial balance entries of the same type
      if (childAccounts.length === 0) {
        const typeBalance = trialBalance
          .filter((entry) => entry.accountType === account.type)
          .reduce((sum, entry) => {
            if (account.type === "Asset" || account.type === "Expense") {
              return sum + (entry.debit - entry.credit)
            } else {
              return sum + (entry.credit - entry.debit)
            }
          }, 0)
        return typeBalance
      }

      return directBalance + ownBalance
    }
  }

  // Function to calculate Current Assets balance specifically
  const calculateCurrentAssetsBalance = (): number => {
    const currentAssetAccounts = chartOfAccountsCategories["Current Assets"]
    let totalBalance = 0

    // Sum up all current asset accounts from trial balance
    currentAssetAccounts.forEach((accountName) => {
      const entry = trialBalance.find((entry) => entry.account === accountName)
      if (entry) {
        // Assets have a debit balance (debit - credit)
        totalBalance += entry.debit - entry.credit
      }
    })

    return totalBalance
  }

  // Function to calculate balance for a specific category (for Chart of Accounts)
  const calculateCategoryBalance = (category: string, accountNames: string[]): number => {
    let totalBalance = 0

    accountNames.forEach((accountName) => {
      const entry = trialBalance.find((entry) => entry.account === accountName)
      if (entry) {
        // Calculate based on account type
        const accountType = entry.accountType
        if (accountType === "Asset" || accountType === "Expense") {
          totalBalance += entry.debit - entry.credit
        } else {
          totalBalance += entry.credit - entry.debit
        }
      }
    })

    return totalBalance
  }

  // Update the account mapping to show calculated balances (for Chart of Accounts)
  const accountsWithCalculatedBalances = accounts.map((account) => ({
    ...account,
    calculatedBalance: calculateAccountBalance(account),
  }))

  // Update the visibleParentAccounts filtering to use calculated balances (for Chart of Accounts)
  const visibleParentAccountsWithBalances = visibleParentAccounts.map((account) => ({
    ...account,
    calculatedBalance: calculateAccountBalance(account),
  }))

  // Calculate pagination for accounts using sorted array
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
      deleteJournalEntry(parseInt(entryToDelete)).then(() => {
        setEntryToDelete(null)
        setIsDeleteDialogOpen(false)
      })
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
        <h2>As of ${new Date().toLocaleDateString()}</h2>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Type</th>
            <th class="amount">Debit (₹)</th>
            <th class="amount">Credit (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${sortedTrialBalanceEntries
        .map(
          (entry) => `
  <tr>
    <td>${getDisplayAccountName(entry.account)}</td>
    <td>${entry.accountType}</td>
    <td class="amount">${entry.debit > 0 ? entry.debit.toLocaleString("en-IN") : "-"}</td>
    <td class="amount">${entry.credit > 0 ? entry.credit.toLocaleString("en-IN") : "-"}</td>
  </tr>
`,
        )
        .join("")}
          <tr class="total-row">
            <td colspan="2">Total</td>
            <td class="amount">${totalDebit.toLocaleString("en-IN")}</td>
            <td class="amount">${totalCredit.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()">Print</button>
      </div>
    </body>
    </html>
  `

    const printWindow = window.open("", "_blank")
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  // Helper function to get balance for a specific account from trialBalance
  const getBalanceFromTrialBalance = (accountName: string): number => {
    const entry = trialBalance.find((tb) => tb.account === accountName)
    if (!entry) return 0
    // Assets and Expenses have normal debit balance, Liabilities, Equity, Revenue have normal credit balance
    // For contra-assets (like Accumulated Depreciation), they have a credit balance but reduce assets, so credit - debit is correct.
    if (entry.accountType === "Asset" || entry.accountType === "Expense") {
      return entry.debit - entry.credit
    } else {
      return entry.credit - entry.debit
    }
  }

  // Function to calculate Balance Sheet data
  const calculateBalanceSheetData = () => {
    let currentAssetsTotal = 0
    balanceSheetAccountCategories.assets.current.forEach((accountName) => {
      currentAssetsTotal += getBalanceFromTrialBalance(accountName)
    })

    let fixedAssetsTotal = 0
    balanceSheetAccountCategories.assets.fixed.forEach((accountName) => {
      fixedAssetsTotal += getBalanceFromTrialBalance(accountName)
    })

    let otherAssetsTotal = 0
    balanceSheetAccountCategories.assets.other.forEach((accountName) => {
      otherAssetsTotal += getBalanceFromTrialBalance(accountName)
    })

    const totalAssets = currentAssetsTotal + fixedAssetsTotal + otherAssetsTotal

    let currentLiabilitiesTotal = 0
    balanceSheetAccountCategories.liabilities.current.forEach((accountName) => {
      currentLiabilitiesTotal += getBalanceFromTrialBalance(accountName)
    })

    let longTermLiabilitiesTotal = 0
    balanceSheetAccountCategories.liabilities.longTerm.forEach((accountName) => {
      longTermLiabilitiesTotal += getBalanceFromTrialBalance(accountName)
    })

    const totalLiabilities = currentLiabilitiesTotal + longTermLiabilitiesTotal

    let equityTotal = 0
    balanceSheetAccountCategories.equity.forEach((accountName) => {
      equityTotal += getBalanceFromTrialBalance(accountName)
    })

    const totalLiabilitiesAndEquity = totalLiabilities + equityTotal

    return {
      assets: {
        current: currentAssetsTotal,
        fixed: fixedAssetsTotal,
        other: otherAssetsTotal,
        total: totalAssets,
      },
      liabilities: {
        current: currentLiabilitiesTotal,
        longTerm: longTermLiabilitiesTotal,
        total: totalLiabilities,
      },
      equity: equityTotal,
      totalLiabilitiesAndEquity: totalLiabilitiesAndEquity,
    }
  }

  const balanceSheet = calculateBalanceSheetData()

  // Handle print balance sheet
  const handlePrintBalanceSheet = () => {
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Balance Sheet - Trident FMS</title>
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
        .section-header {
          background-color: #e0e0e0;
          font-weight: bold;
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
        <h1>Balance Sheet</h1>
        <h2>As of ${new Date().toLocaleDateString()}</h2>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th class="amount">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="section-header">
            <td>ASSETS</td>
            <td></td>
          </tr>
          <tr>
            <td>&nbsp;&nbsp;Current Assets</td>
            <td class="amount">${balanceSheet.assets.current.toLocaleString("en-IN")}</td>
          </tr>
          ${balanceSheetAccountCategories.assets.current
        .map((accountName) => {
          const balance = getBalanceFromTrialBalance(accountName)
          return balance !== 0
            ? `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${balance.toLocaleString("en-IN")}</td></tr>`
            : ""
        })
        .join("")}
          <tr>
            <td>&nbsp;&nbsp;Fixed Assets</td>
            <td class="amount">${balanceSheet.assets.fixed.toLocaleString("en-IN")}</td>
          </tr>
          ${balanceSheetAccountCategories.assets.fixed
        .map((accountName) => {
          const balance = getBalanceFromTrialBalance(accountName)
          return balance !== 0
            ? `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${balance.toLocaleString("en-IN")}</td></tr>`
            : ""
        })
        .join("")}
          ${balanceSheet.assets.other !== 0
        ? `<tr><td>&nbsp;&nbsp;Other Assets</td><td class="amount">${balanceSheet.assets.other.toLocaleString("en-IN")}
</cut_off_point>
</td></tr>`
        : ""
      }
          ${balanceSheetAccountCategories.assets.other
        .map((accountName) => {
          const balance = getBalanceFromTrialBalance(accountName)
          return balance !== 0
            ? `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${balance.toLocaleString("en-IN")}</td></tr>`
            : ""
        })
        .join("")}
          <tr class="total-row">
            <td>TOTAL ASSETS</td>
            <td class="amount">${balanceSheet.assets.total.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="section-header">
            <td>LIABILITIES</td>
            <td></td>
          </tr>
          <tr>
            <td>&nbsp;&nbsp;Current Liabilities</td>
            <td class="amount">${balanceSheet.liabilities.current.toLocaleString("en-IN")}</td>
          </tr>
          ${balanceSheetAccountCategories.liabilities.current
        .map((accountName) => {
          const balance = getBalanceFromTrialBalance(accountName)
          return balance !== 0
            ? `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${balance.toLocaleString("en-IN")}</td></tr>`
            : ""
        })
        .join("")}
          <tr>
            <td>&nbsp;&nbsp;Long-Term Liabilities</td>
            <td class="amount">${balanceSheet.liabilities.longTerm.toLocaleString("en-IN")}</td>
          </tr>
          ${balanceSheetAccountCategories.liabilities.longTerm
        .map((accountName) => {
          const balance = getBalanceFromTrialBalance(accountName)
          return balance !== 0
            ? `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${balance.toLocaleString("en-IN")}</td></tr>`
            : ""
        })
        .join("")}
          <tr class="total-row">
            <td>TOTAL LIABILITIES</td>
            <td class="amount">${balanceSheet.liabilities.total.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="section-header">
            <td>EQUITY</td>
            <td></td>
          </tr>
          <tr>
            <td>&nbsp;&nbsp;Equity</td>
            <td class="amount">${balanceSheet.equity.toLocaleString("en-IN")}</td>
          </tr>
          ${balanceSheetAccountCategories.equity
        .map((accountName) => {
          const balance = getBalanceFromTrialBalance(accountName)
          return balance !== 0
            ? `<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${balance.toLocaleString("en-IN")}</td></tr>`
            : ""
        })
        .join("")}
          <tr class="total-row">
            <td>TOTAL EQUITY</td>
            <td class="amount">${balanceSheet.equity.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="total-row">
            <td>TOTAL LIABILITIES & EQUITY</td>
            <td class="amount">${balanceSheet.totalLiabilitiesAndEquity.toLocaleString("en-IN")}</td>
          </tr>
          ${balanceSheet.assets.total !== balanceSheet.totalLiabilitiesAndEquity
        ? `<tr class="bg-red-50 dark:bg-red-950/30">
                <td colspan="2" class="text-red-600 font-medium">
                  ⚠️ Balance Sheet is not balanced! Difference: ₹${Math.abs(balanceSheet.assets.total - balanceSheet.totalLiabilitiesAndEquity).toLocaleString("en-IN")}
                </td>
              </tr>`
        : ""
      }
        </tbody>
      </table>
      
      <div style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()">Print</button>
      </div>
    </body>
    </html>
  `

    const printWindow = window.open("", "_blank")
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  // Function to calculate Profit and Loss data
  const calculateProfitAndLossData = () => {
    const filteredPlEntries = journalEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const start = plStartDate ? new Date(plStartDate) : null
      const end = plEndDate ? new Date(plEndDate) : null

      const matchesDate =
        (!start || entryDate >= start) && (!end || entryDate <= new Date(end.setDate(end.getDate() + 1)))

      return matchesDate
    })

    let totalRevenue = 0
    let totalCogs = 0
    let totalOperatingExpenses = 0
    let totalOtherIncome = 0
    let totalOtherExpenses = 0

    const revenueDetails: { [key: string]: number } = {}
    const cogsDetails: { [key: string]: number } = {}
    const operatingExpensesDetails: { [key: string]: number } = {}
    const otherIncomeDetails: { [key: string]: number } = {}
    const otherExpensesDetails: { [key: string]: number } = {}

    filteredPlEntries.forEach((entry) => {
      // Revenue accounts (credit balance)
      if (profitAndLossAccountCategories.revenue.includes(entry.creditAccount)) {
        const amount = entry.amount
        totalRevenue += amount
        revenueDetails[entry.creditAccount] = (revenueDetails[entry.creditAccount] || 0) + amount
      }
      // COGS accounts (debit balance)
      else if (profitAndLossAccountCategories.cogs.includes(entry.debitAccount)) {
        const amount = entry.amount
        totalCogs += amount
        cogsDetails[entry.debitAccount] = (cogsDetails[entry.debitAccount] || 0) + amount
      }
      // Operating Expenses accounts (debit balance)
      else if (profitAndLossAccountCategories.operatingExpenses.includes(entry.debitAccount)) {
        const amount = entry.amount
        totalOperatingExpenses += amount
        operatingExpensesDetails[entry.debitAccount] = (operatingExpensesDetails[entry.debitAccount] || 0) + amount
      }
      // Other Income accounts (credit balance)
      else if (profitAndLossAccountCategories.otherIncome.includes(entry.creditAccount)) {
        const amount = entry.amount
        totalOtherIncome += amount
        otherIncomeDetails[entry.creditAccount] = (otherIncomeDetails[entry.creditAccount] || 0) + amount
      }
      // Other Expenses accounts (debit balance)
      else if (profitAndLossAccountCategories.otherExpenses.includes(entry.debitAccount)) {
        const amount = entry.amount
        totalOtherExpenses += amount
        otherExpensesDetails[entry.debitAccount] = (otherExpensesDetails[entry.debitAccount] || 0) + amount
      }
    })

    const grossProfit = totalRevenue - totalCogs
    const operatingProfit = grossProfit - totalOperatingExpenses
    const netProfit = operatingProfit + totalOtherIncome - totalOtherExpenses

    return {
      revenue: { total: totalRevenue, details: revenueDetails },
      cogs: { total: totalCogs, details: cogsDetails },
      grossProfit,
      operatingExpenses: { total: totalOperatingExpenses, details: operatingExpensesDetails },
      operatingProfit,
      otherIncome: { total: totalOtherIncome, details: otherIncomeDetails },
      otherExpenses: { total: totalOtherExpenses, details: otherExpensesDetails },
      netProfit,
    }
  }

  const profitAndLoss = calculateProfitAndLossData()

  // Handle print P/L
  const handlePrintProfitAndLoss = () => {
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Profit and Loss Account - Trident FMS</title>
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
        .section-header {
          background-color: #e0e0e0;
          font-weight: bold;
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
        <h1>Profit and Loss Account</h1>
        <h2>For the period ${plStartDate || "Start"} to ${plEndDate || "End"}</h2>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th class="amount">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="section-header">
            <td>REVENUE</td>
            <td></td>
          </tr>
          ${Object.entries(profitAndLoss.revenue.details)
        .map(
          ([accountName, amount]) =>
            `<tr><td>&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${amount.toLocaleString("en-IN")}</td></tr>`,
        )
        .join("")}
          <tr class="total-row">
            <td>TOTAL REVENUE</td>
            <td class="amount">${profitAndLoss.revenue.total.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="section-header">
            <td>COST OF GOODS SOLD</td>
            <td></td>
          </tr>
          ${Object.entries(profitAndLoss.cogs.details)
        .map(
          ([accountName, amount]) =>
            `<tr><td>&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${amount.toLocaleString("en-IN")}</td></tr>`,
        )
        .join("")}
          <tr class="total-row">
            <td>TOTAL COST OF GOODS SOLD</td>
            <td class="amount">${profitAndLoss.cogs.total.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="total-row">
            <td>GROSS PROFIT</td>
            <td class="amount">${profitAndLoss.grossProfit.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="section-header">
            <td>OPERATING EXPENSES</td>
            <td></td>
          </tr>
          ${Object.entries(profitAndLoss.operatingExpenses.details)
        .map(
          ([accountName, amount]) =>
            `<tr><td>&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${amount.toLocaleString("en-IN")}</td></tr>`,
        )
        .join("")}
          <tr class="total-row">
            <td>TOTAL OPERATING EXPENSES</td>
            <td class="amount">${profitAndLoss.operatingExpenses.total.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="total-row">
            <td>OPERATING PROFIT</td>
            <td class="amount">${profitAndLoss.operatingProfit.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="section-header">
            <td>OTHER INCOME</td>
            <td></td>
          </tr>
          ${Object.entries(profitAndLoss.otherIncome.details)
        .map(
          ([accountName, amount]) =>
            `<tr><td>&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${amount.toLocaleString("en-IN")}</td></tr>`,
        )
        .join("")}
          <tr class="total-row">
            <td>TOTAL OTHER INCOME</td>
            <td class="amount">${profitAndLoss.otherIncome.total.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="section-header">
            <td>OTHER EXPENSES</td>
            <td></td>
          </tr>
          ${Object.entries(profitAndLoss.otherExpenses.details)
        .map(
          ([accountName, amount]) =>
            `<tr><td>&nbsp;&nbsp;${getDisplayAccountName(accountName)}</td><td class="amount">${amount.toLocaleString("en-IN")}</td></tr>`,
        )
        .join("")}
          <tr class="total-row">
            <td>TOTAL OTHER EXPENSES</td>
            <td class="amount">${profitAndLoss.otherExpenses.total.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="total-row bg-primary/10">
            <td>NET PROFIT</td>
            <td class="amount">${profitAndLoss.netProfit.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()">Print</button>
      </div>
    </body>
    </html>
    `

    const printWindow = window.open("", "_blank")
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  // Define a comprehensive list of individual expense accounts to be summarized
  const individualExpenseAccounts = [
    // COGS components (from chartOfAccountsCategories["Cost of Goods Sold"])
    "Direct Materials", // Assuming this represents "Purchase RM" for expense summary
    "Direct Labor",
    "Manufacturing Overhead",
    "Inventory Loss",
    // Explicitly mentioned by user and present in sample data/context
    "Wages",
    "Raw Materials Inventory", // Include Raw Materials Inventory for its debit entries in expense summary
    // Operating Expenses (from chartOfAccountsCategories["Operating Expenses"])
    "Salary Expenses",
    "Rent Expense",
    "Utilities Expenses",
    "Depreciation Expense",
    "Marketing Expense",
    "Fuel Expense",
    "Food Expense",
    "Electricity Expense",
    "Machinery Expense",
    "Telephone Expense",
    "Factory Maintenance",
    "Water Expense",
    // Other Expenses (from chartOfAccountsCategories["Other Expenses"])
    "Interest Expense",
    "Tax Expense",
    "Loss on Sale of Assets",
  ]

  // Function to calculate Expense Summary data
  const calculateExpenseSummaryData = () => {
    const expenseSummary: { [accountName: string]: number } = {}
    let totalExpenses = 0

    const filteredExpenseEntries = journalEntries.filter((entry) => {
      const entryDate = new Date(entry.date)
      const start = plStartDate ? new Date(plStartDate) : null
      const end = plEndDate ? new Date(plEndDate) : null

      const matchesDate =
        (!start || entryDate >= start) && (!end || entryDate <= new Date(end.setDate(end.getDate() + 1))) // Include end date

      // Check if the debit account is one of the individual expense accounts
      const isIndividualExpense = individualExpenseAccounts.includes(entry.debitAccount)

      return entry.status === "Posted" && isIndividualExpense && matchesDate
    })

    filteredExpenseEntries.forEach((entry) => {
      expenseSummary[entry.debitAccount] = (expenseSummary[entry.debitAccount] || 0) + entry.amount
      totalExpenses += entry.amount
    })

    // Sort expenses by amount descending
    const sortedExpenseSummary = Object.entries(expenseSummary).sort(([, amountA], [, amountB]) => amountB - amountA)

    return { sortedExpenseSummary, totalExpenses }
  }

  const { sortedExpenseSummary, totalExpenses } = calculateExpenseSummaryData()

  // Handle print Expense Summary
  const handlePrintExpenseSummary = () => {
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Summary - Trident FMS</title>
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
        <h1>Expense Summary</h1>
        <h2>For the period ${plStartDate || "Start"} to ${plEndDate || "End"}</h2>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Expense Account</th>
            <th class="amount">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${sortedExpenseSummary
        .map(
          ([accountName, amount]) =>
            `<tr><td>${getDisplayAccountName(accountName)}</td><td class="amount">${amount.toLocaleString("en-IN")}</td></tr>`,
        )
        .join("")}
          <tr class="total-row">
            <td>TOTAL EXPENSES</td>
            <td class="amount">${totalExpenses.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()">Print</button>
      </div>
    </body>
    </html>
    `

    const printWindow = window.open("", "_blank")
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()
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
      csvData = `Entry ID,Date,Description,Debit Account,Credit Account,Amount (₹),Reference,Status\n`

      // Add filtered entries data
      filteredEntries.forEach((entry) => {
        csvData += `${entry.id},${entry.date},"${entry.description}",${getDisplayAccountName(entry.debitAccount)},${getDisplayAccountName(entry.creditAccount)},${entry.amount},"${entry.reference}",${entry.status}\n`
      })
    } else if (activeTab === "chart-of-accounts") {
      // Export chart of accounts
      filename = "chart-of-accounts.csv"

      // Create CSV header
      csvData = `Account Code,Account Name,Type,Calculated Balance (₹)\n`
      visibleParentAccounts.forEach((account) => {
        const calculatedBalance = calculateAccountBalance(account)
        csvData += `${account.id},"${getDisplayAccountName(account.name)}",${account.type},${calculatedBalance}\n`
        filteredAccounts
          .filter((subAccount) => subAccount.parentId === account.id)
          .forEach((subAccount) => {
            const subCalculatedBalance = calculateAccountBalance(subAccount)
            csvData += `${subAccount.id},"${getDisplayAccountName(subAccount.name)}",${account.type},${subCalculatedBalance}\n`
          })
      })
    } else if (activeTab === "trial-balance") {
      // Export trial balance
      filename = "trial-balance-realtime.csv"

      // Create CSV header
      csvData = `Account,Type,Debit (₹),Credit (₹)\n`
      sortedTrialBalanceEntries.forEach((entry) => {
        csvData += `"${getDisplayAccountName(entry.account)}","${entry.accountType}",${entry.debit || ""},${entry.credit || ""}\n`
      })

      // Add total row
      csvData += `Total,,${totalDebit},${totalCredit}\n`
    } else if (activeTab === "sales-register") {
      filename = "sales-register.csv"
      csvData = `Invoice ID,Date,Customer,Base Amount (₹),GST Amount (₹),Total Amount (₹),GST Type,Status\n`
      filteredSalesEntries.forEach((entry) => {
        csvData += `${entry.id},${entry.date},"${entry.debtorCustomer || "N/A"}",${entry.amount},${entry.gstAmount || 0},${entry.totalAmount},${entry.transactionType || "N/A"},${entry.status}\n`
      })
      csvData += `Total,,,,,,${totalSalesAmount}\n` // Add total row to CSV
    } else if (activeTab === "overheads") {
      filename = "overheads-report.csv"
      csvData = `Category,Expense Account,Amount (₹)\n`
      Object.entries(categorizedOverheads).forEach(([category, expenses]) => {
        Object.entries(expenses).forEach(([account, amount]) => {
          csvData += `"${category}","${getDisplayAccountName(account)}",${amount}\n`
        })
      })
      csvData += `Total Direct Overheads,,${totalDirectOverheads}\n`
      csvData += `Total Indirect Overheads,,${totalIndirectOverheads}\n`
      csvData += `Grand Total Overheads,,${totalDirectOverheads + totalIndirectOverheads}\n`
    } else if (activeTab === "balance-sheet") {
      filename = "balance-sheet.csv"
      csvData = `Category,Account,Amount (₹)\n`

      csvData += `Assets,Current Assets,${balanceSheet.assets.current}\n`
      balanceSheetAccountCategories.assets.current.forEach((accountName) => {
        const balance = getBalanceFromTrialBalance(accountName)
        if (balance !== 0) csvData += `,"${getDisplayAccountName(accountName)}",${balance}\n`
      })
      csvData += `Assets,Fixed Assets,${balanceSheet.assets.fixed}\n`
      balanceSheetAccountCategories.assets.fixed.forEach((accountName) => {
        const balance = getBalanceFromTrialBalance(accountName)
        if (balance !== 0) csvData += `,"${getDisplayAccountName(accountName)}",${balance}\n`
      })
      if (balanceSheet.assets.other !== 0) {
        csvData += `Assets,Other Assets,${balanceSheet.assets.other}\n`
        balanceSheetAccountCategories.assets.other.forEach((accountName) => {
          const balance = getBalanceFromTrialBalance(accountName)
          if (balance !== 0) csvData += `,"${getDisplayAccountName(accountName)}",${balance}\n`
        })
      }
      csvData += `Total Assets,,${balanceSheet.assets.total}\n`

      csvData += `Liabilities,Current Liabilities,${balanceSheet.liabilities.current}\n`
      balanceSheetAccountCategories.liabilities.current.forEach((accountName) => {
        const balance = getBalanceFromTrialBalance(accountName)
        if (balance !== 0) csvData += `,"${getDisplayAccountName(accountName)}",${balance}\n`
      })
      csvData += `Liabilities,Long-Term Liabilities,${balanceSheet.liabilities.longTerm}\n`
      balanceSheetAccountCategories.liabilities.longTerm.forEach((accountName) => {
        const balance = getBalanceFromTrialBalance(accountName)
        if (balance !== 0) csvData += `,"${getDisplayAccountName(accountName)}",${balance}\n`
      })
      csvData += `Total Liabilities,,${balanceSheet.liabilities.total}\n`

      csvData += `Equity,Equity,${balanceSheet.equity}\n`
      balanceSheetAccountCategories.equity.forEach((accountName) => {
        const balance = getBalanceFromTrialBalance(accountName)
        if (balance !== 0) csvData += `,"${getDisplayAccountName(accountName)}",${balance}\n`
      })
      csvData += `Total Liabilities & Equity,,${balanceSheet.totalLiabilitiesAndEquity}\n`
    } else if (activeTab === "p-l-account") {
      filename = "profit-and-loss.csv"
      csvData = `Category,Account,Amount (₹)\n`

      csvData += `Revenue,Total Revenue,${profitAndLoss.revenue.total}\n`
      Object.entries(profitAndLoss.revenue.details).forEach(([accountName, amount]) => {
        csvData += `,"${getDisplayAccountName(accountName)}",${amount}\n`
      })

      csvData += `Cost of Goods Sold,Total Cost of Goods Sold,${profitAndLoss.cogs.total}\n`
      Object.entries(profitAndLoss.cogs.details).forEach(([accountName, amount]) => {
        csvData += `,"${getDisplayAccountName(accountName)}",${amount}\n`
      })

      csvData += `Gross Profit,,${profitAndLoss.grossProfit}\n`

      csvData += `Operating Expenses,Total Operating Expenses,${profitAndLoss.operatingExpenses.total}\n`
      Object.entries(profitAndLoss.operatingExpenses.details).forEach(([accountName, amount]) => {
        csvData += `,"${getDisplayAccountName(accountName)}",${amount}\n`
      })

      csvData += `Operating Profit,,${profitAndLoss.operatingProfit}\n`

      csvData += `Other Income,Total Other Income,${profitAndLoss.otherIncome.total}\n`
      Object.entries(profitAndLoss.otherIncome.details).forEach(([accountName, amount]) => {
        csvData += `,"${getDisplayAccountName(accountName)}",${amount}\n`
      })

      csvData += `Other Expenses,Total Other Expenses,${profitAndLoss.otherExpenses.total}\n`
      Object.entries(profitAndLoss.otherExpenses.details).forEach(([accountName, amount]) => {
        csvData += `,"${getDisplayAccountName(accountName)}",${amount}\n`
      })

      csvData += `Net Profit,,${profitAndLoss.netProfit}\n`
    } else if (activeTab === "expense-summary") {
      filename = "expense-summary.csv"
      csvData = `Expense Account,Amount (₹)\n`
      sortedExpenseSummary.forEach(([accountName, amount]) => {
        csvData += `"${getDisplayAccountName(accountName)}",${amount}\n`
      })
      csvData += `Total Expenses,,${totalExpenses}\n`
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

  // Define the order for account types
  const accountTypeOrderTrialBalance = {
    Asset: 1,
    Liability: 2,
    Equity: 3,
    Revenue: 4,
    Expense: 5,
  }

  // Sort trial balance entries by account type and then by amount, with GST accounts prioritized
  const sortedTrialBalanceEntries = [...activeTrialBalanceEntries].sort((a, b) => {
    // First sort by account type order
    const typeOrderA = accountTypeOrderTrialBalance[a.accountType] || 999
    const typeOrderB = accountTypeOrderTrialBalance[b.accountType] || 999

    if (typeOrderA !== typeOrderB) {
      return typeOrderA - typeOrderB
    }

    // Within the same type, prioritize GST accounts
    const isGstAccountA =
      a.account.includes("GST") ||
      a.account.includes("CGST") ||
      a.account.includes("SGST") ||
      a.account.includes("IGST")
    const isGstAccountB =
      b.account.includes("GST") ||
      b.account.includes("CGST") ||
      b.account.includes("SGST") ||
      b.account.includes("IGST")

    if (isGstAccountA && !isGstAccountB) return -1
    if (!isGstAccountA && isGstAccountB) return 1

    // Then sort by amount in descending order within the same type
    const amountA = a.accountType === "Asset" || a.accountType === "Expense" ? a.debit : a.credit
    const amountB = b.accountType === "Asset" || b.accountType === "Expense" ? b.debit : b.credit

    return amountB - amountA
  })

  // Sales Register Logic
  const salesEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      const isSalesRelated =
        entry.creditAccount === "Sales Revenue" &&
        (entry.debitAccount === "Accounts Receivable" ||
          entry.debitAccount === "Cash" ||
          entry.debitAccount === "Bank") &&
        entry.status === "Posted" // Only consider posted entries for sales register

      const entryDate = new Date(entry.date)
      const start = salesStartDate ? new Date(salesStartDate) : null
      const end = salesEndDate ? new Date(salesEndDate) : null

      const matchesDate =
        (!start || entryDate >= start) && (!end || entryDate <= new Date(end.setDate(end.getDate() + 1))) // Include end date

      return isSalesRelated && matchesDate
    })
  }, [journalEntries])

  const filteredSalesEntries = salesEntries.map((entry) => {
    const baseAmount = entry.amount
    const gstAmount = entry.gstPercentage ? baseAmount * (entry.gstPercentage / 100) : 0
    const totalAmount = baseAmount + gstAmount
    return { ...entry, baseAmount, gstAmount, totalAmount }
  })

  const totalSalesAmount = filteredSalesEntries.reduce((sum, entry) => sum + (entry.totalAmount || 0), 0)

  // Overheads Logic
  const filteredOverheadEntries = journalEntries.filter((entry) => {
    const account = accounts.find((acc) => acc.name === entry.debitAccount)
    const isExpense = account?.type === "Expense"
    const entryDate = new Date(entry.date)
    const start = overheadStartDate ? new Date(overheadStartDate) : null
    const end = overheadEndDate ? new Date(overheadEndDate) : null

    const matchesDate =
      (!start || entryDate >= start) && (!end || entryDate <= new Date(end.setDate(end.getDate() + 1))) // Include end date

    return isExpense && matchesDate
  })

  const categorizedOverheads: { [key: string]: { [key: string]: number } } = {
    "Direct Overhead": {},
    "Indirect Overhead": {},
  }

  filteredOverheadEntries.forEach((entry) => {
    const category = overheadCategories[entry.debitAccount]
    if (category) {
      categorizedOverheads[category][entry.debitAccount] =
        (categorizedOverheads[category][entry.debitAccount] || 0) + entry.amount
    }
  })

  const totalDirectOverheads = Object.values(categorizedOverheads["Direct Overhead"]).reduce(
    (sum, amount) => sum + amount,
    0,
  )
  const totalIndirectOverheads = Object.values(categorizedOverheads["Indirect Overhead"]).reduce(
    (sum, amount) => sum + amount,
    0,
  )

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
          <TabsTrigger
            value="sales-register"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Sales Register
          </TabsTrigger>
          <TabsTrigger
            value="overheads"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Overheads
          </TabsTrigger>
          <TabsTrigger
            value="balance-sheet"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger
            value="p-l-account"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            P/L Account
          </TabsTrigger>
          <TabsTrigger
            value="expense-summary"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Expense Summary
          </TabsTrigger>
          <TabsTrigger
            value="debit-credit-notes"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
          >
            Debit/Credit Notes
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
                    <TableHead className="w-[120px]">Entry ID</TableHead>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[200px]">Description</TableHead>
                    <TableHead className="w-[200px]">Account</TableHead>
                    <TableHead className="w-[120px] text-right">Debit (₹)</TableHead>
                    <TableHead className="w-[120px] text-right">Credit (₹)</TableHead>
                    <TableHead className="w-[100px]">Reference</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEntries.length > 0 ? (
                    paginatedEntries.flatMap((entry, entryIndex) => {
                      // Calculate GST amounts if it's a sales transaction
                      const isSalesTransaction =
                        entry.creditAccount === "Sales Revenue" && entry.gstPercentage && entry.gstPercentage > 0

                      const isPurchaseTransaction =
                        (entry.debitAccount === "Raw Materials Inventory" ||
                          entry.debitAccount === "Finished Goods Inventory" ||
                          entry.debitAccount === "Work-in-Progress") &&
                        entry.gstPercentage &&
                        entry.gstPercentage > 0

                      // Check for purchase return transaction
                      const isPurchaseReturnTransaction =
                        entry.creditAccount === "Raw Materials Inventory Returned" &&
                        entry.gstPercentage &&
                        entry.gstPercentage > 0

                      // Create account lines for journal book format
                      const accountLines = []

                      // Add debit account line
                      if (isPurchaseTransaction) {
                        // For purchase transactions, debit account gets the base amount
                        accountLines.push({
                          account: entry.debitAccount,
                          debit: entry.amount,
                          credit: 0,
                          isDebit: true,
                        })

                        // Add GST Input accounts as debit
                        const gstAmount = entry.amount * (entry.gstPercentage / 100)

                        if (entry.transactionType === "IGST") {
                          // IGST transaction
                          accountLines.push({
                            account: "IGST Input",
                            debit: gstAmount,
                            credit: 0,
                            isDebit: true,
                          })
                        } else {
                          // CGST-SGST transaction (default)
                          const cgstAmount = gstAmount / 2
                          const sgstAmount = gstAmount / 2

                          accountLines.push({
                            account: "CGST Input",
                            debit: cgstAmount,
                            credit: 0,
                            isDebit: true,
                          })
                          accountLines.push({
                            account: "SGST Input",
                            debit: sgstAmount,
                            credit: 0,
                            isDebit: true,
                          })
                        }
                      } else if (
                        entry.debitAccount === "Sales Revenue Returned" &&
                        entry.gstPercentage &&
                        entry.gstPercentage > 0
                      ) {
                        // For sales return transactions with GST
                        const gstAmount = entry.amount * (entry.gstPercentage / 100)

                        // Debit Sales Revenue Returned with base amount
                        accountLines.push({
                          account: entry.debitAccount,
                          debit: entry.amount,
                          credit: 0,
                          isDebit: true,
                        })

                        // Add GST Output accounts as debit (reversing the GST)
                        if (entry.transactionType === "IGST") {
                          // IGST transaction
                          accountLines.push({
                            account: "IGST Output",
                            debit: gstAmount,
                            credit: 0,
                            isDebit: true,
                          })
                        } else {
                          // CGST-SGST transaction (default)
                          const cgstAmount = gstAmount / 2
                          const sgstAmount = gstAmount / 2

                          accountLines.push({
                            account: "CGST Output",
                            debit: cgstAmount,
                            credit: 0,
                            isDebit: true,
                          })
                          accountLines.push({
                            account: "SGST Output",
                            debit: sgstAmount,
                            credit: 0,
                            isDebit: true,
                          })
                        }
                      } else if (
                        entry.creditAccount === "Raw Materials Inventory Returned" &&
                        entry.gstPercentage &&
                        entry.gstPercentage > 0
                      ) {
                        // For purchase return transactions with GST, debit account gets total amount (base + GST)
                        const gstAmount = entry.amount * (entry.gstPercentage / 100)
                        const totalAmount = entry.amount + gstAmount

                        accountLines.push({
                          account: entry.debitAccount,
                          debit: totalAmount,
                          credit: 0,
                          isDebit: true,
                        })
                      } else {
                        // For sales transactions or non-GST transactions
                        accountLines.push({
                          account: entry.debitAccount,
                          debit:
                            entry.amount +
                            (isSalesTransaction && entry.gstPercentage
                              ? entry.amount * (entry.gstPercentage / 100)
                              : 0),
                          credit: 0,
                          isDebit: true,
                        })
                      }

                      // Add credit account lines
                      if (isSalesTransaction && entry.gstPercentage && entry.gstPercentage > 0) {
                        // For sales transactions with GST, show GST Output accounts based on transaction type
                        const gstAmount = entry.amount * (entry.gstPercentage / 100)

                        if (entry.transactionType === "IGST") {
                          // IGST transaction
                          accountLines.push({
                            account: "IGST Output",
                            debit: 0,
                            credit: gstAmount,
                            isCredit: true,
                          })
                        } else {
                          // CGST-SGST transaction (default)
                          const cgstAmount = gstAmount / 2
                          const sgstAmount = gstAmount / 2

                          accountLines.push({
                            account: "CGST Output",
                            debit: 0,
                            credit: cgstAmount,
                            isCredit: true,
                          })
                          accountLines.push({
                            account: "SGST Output",
                            debit: 0,
                            credit: sgstAmount,
                            isCredit: true,
                          })
                        }

                        accountLines.push({
                          account: entry.creditAccount,
                          debit: 0,
                          credit: entry.amount,
                          isCredit: true,
                        })
                      } else if (
                        entry.debitAccount === "Sales Revenue Returned" &&
                        entry.gstPercentage &&
                        entry.gstPercentage > 0
                      ) {
                        // For sales return transactions with GST, credit account gets total amount (base + GST)
                        const gstAmount = entry.amount * (entry.gstPercentage / 100)
                        const totalAmount = entry.amount + gstAmount

                        accountLines.push({
                          account: entry.creditAccount,
                          debit: 0,
                          credit: totalAmount,
                          isCredit: true,
                        })
                      } else if (
                        entry.creditAccount === "Raw Materials Inventory Returned" &&
                        entry.gstPercentage &&
                        entry.gstPercentage > 0
                      ) {
                        // For purchase return transactions with GST
                        const gstAmount = entry.amount * (entry.gstPercentage / 100)

                        // Credit Raw Materials Inventory Returned with base amount
                        accountLines.push({
                          account: entry.creditAccount,
                          debit: 0,
                          credit: entry.amount,
                          isCredit: true,
                        })

                        // Add GST Input accounts as credit (reversing the GST)
                        if (entry.transactionType === "IGST") {
                          // IGST transaction
                          accountLines.push({
                            account: "IGST Input",
                            debit: 0,
                            credit: gstAmount,
                            isCredit: true,
                          })
                        } else {
                          // CGST-SGST transaction (default)
                          const cgstAmount = gstAmount / 2
                          const sgstAmount = gstAmount / 2

                          accountLines.push({
                            account: "CGST Input",
                            debit: 0,
                            credit: cgstAmount,
                            isCredit: true,
                          })
                          accountLines.push({
                            account: "SGST Input",
                            debit: 0,
                            credit: sgstAmount,
                            isCredit: true,
                          })
                        }
                      } else if (isPurchaseTransaction && entry.gstPercentage && entry.gstPercentage > 0) {
                        // For purchase transactions with GST, credit account gets total amount (base + GST)
                        const gstAmount = entry.amount * (entry.gstPercentage / 100)
                        const totalAmount = entry.amount + gstAmount

                        accountLines.push({
                          account: entry.creditAccount,
                          debit: 0,
                          credit: totalAmount,
                          isCredit: true,
                        })
                      } else {
                        // For non-GST transactions, show as before
                        accountLines.push({
                          account: entry.creditAccount,
                          debit: 0,
                          credit: entry.amount,
                          isCredit: true,
                        })
                      }

                      return accountLines.map((line, lineIndex) => (
                        <TableRow
                          key={`${entry.id}-${lineIndex}`}
                          className={lineIndex === 0 ? "border-t-2 border-t-muted" : ""}
                        >
                          {/* Entry ID - only show on first line */}
                          <TableCell className={`font-medium ${lineIndex > 0 ? "text-transparent" : ""}`}>
                            {lineIndex === 0 ? `JE-${entry.id}` : ""}
                          </TableCell>

                          {/* Date - only show on first line */}
                          <TableCell className={lineIndex > 0 ? "text-transparent" : ""}>
                            {lineIndex === 0 ? entry.date : ""}
                          </TableCell>

                          {/* Description - only show on first line */}
                          <TableCell className={lineIndex > 0 ? "text-transparent" : ""}>
                            {lineIndex === 0 ? entry.description : ""}
                          </TableCell>

                          {/* Account Name */}
                          <TableCell className={`${line.isDebit ? "font-medium" : "pl-6"}`}>
                            {getDisplayAccountName(line.account)}
                          </TableCell>

                          {/* Debit Amount */}
                          <TableCell className="text-right">
                            {line.debit > 0 ? line.debit.toLocaleString("en-IN") : ""}
                          </TableCell>

                          {/* Credit Amount */}
                          <TableCell className="text-right">
                            {line.credit > 0 ? line.credit.toLocaleString("en-IN") : ""}
                          </TableCell>

                          {/* Reference - only show on first line */}
                          <TableCell className={lineIndex > 0 ? "text-transparent" : ""}>
                            {lineIndex === 0 ? entry.reference : ""}
                          </TableCell>

                          {/* Status - only show on first line */}
                          <TableCell className={lineIndex > 0 ? "" : ""}>
                            {lineIndex === 0 ? (
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${entry.status === "Posted"
                                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                                  : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-400"
                                  }`}
                              >
                                {entry.status}
                              </span>
                            ) : (
                              ""
                            )}
                          </TableCell>

                          {/* Actions - only show on first line */}
                          <TableCell className="text-right">
                            {lineIndex === 0 ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleView(entry)}
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(entry)}
                                  className="h-8 w-8"
                                >
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
                            ) : (
                              ""
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    })
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
                  onChange={(e) => setSearchTermAccount(e.target.value)}
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
                          <TableCell className="font-medium">{getDisplayAccountName(account.name)}</TableCell>
                          <TableCell>{account.type}</TableCell>
                          <TableCell className="text-right font-medium">
                            {calculateAccountBalance(account).toLocaleString("en-IN")}
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
                          .sort((a, b) => {
                            // Sort sub-accounts by calculated balance in descending order
                            const balanceA = calculateAccountBalance(a)
                            const balanceB = calculateAccountBalance(b)
                            return balanceB - balanceA
                          })
                          .map((subAccount) => (
                            <TableRow key={subAccount.id}>
                              <TableCell className="pl-8">{subAccount.id}</TableCell>
                              <TableCell>{getDisplayAccountName(subAccount.name)}</TableCell>
                              <TableCell>{account.type}</TableCell>
                              <TableCell className="text-right">
                                {calculateAccountBalance(subAccount).toLocaleString("en-IN")}
                              </TableCell>
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
              <div className="text-sm text-muted-foreground">
                Real-time Trial Balance (Updates automatically with journal entries)
              </div>
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
              <CardDescription>Real-time balance as of {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Debit (₹)</TableHead>
                    <TableHead className="text-right">Credit (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTrialBalanceEntries.map((entry, index) => (
                    <TableRow
                      key={index}
                      className={
                        entry.account.includes("GST") ||
                          entry.account.includes("CGST") ||
                          entry.account.includes("SGST") ||
                          entry.account.includes("IGST")
                          ? "bg-blue-50 dark:bg-blue-950/20"
                          : ""
                      }
                    >
                      <TableCell
                        className={
                          entry.account.includes("GST") ||
                            entry.account.includes("CGST") ||
                            entry.account.includes("SGST") ||
                            entry.account.includes("IGST")
                            ? "font-semibold"
                            : ""
                        }
                      >
                        {getDisplayAccountName(entry.account)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${entry.accountType === "Asset"
                            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                            : entry.accountType === "Liability"
                              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                              : entry.accountType === "Equity"
                                ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400"
                                : entry.accountType === "Revenue"
                                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                                  : "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400"
                            }`}
                        >
                          {entry.accountType}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.debit > 0 ? entry.debit.toLocaleString("en-IN") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.credit > 0 ? entry.credit.toLocaleString("en-IN") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">{totalDebit.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right">{totalCredit.toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                  {totalDebit !== totalCredit && (
                    <TableRow className="bg-red-50 dark:bg-red-950/30">
                      <TableCell colSpan={2} className="text-red-600 font-medium">
                        ⚠️ Trial Balance is not balanced!
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        Difference: ₹{Math.abs(totalDebit - totalCredit).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales-register" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="sales-start-date" className="text-sm font-medium text-muted-foreground">
                  From:
                </label>
                <Input
                  id="sales-start-date"
                  type="date"
                  value={salesStartDate}
                  onChange={(e) => setSalesStartDate(e.target.value)}
                  className="w-[150px]"
                />
                <label htmlFor="sales-end-date" className="text-sm font-medium text-muted-foreground">
                  To:
                </label>
                <Input
                  id="sales-end-date"
                  type="date"
                  value={salesEndDate}
                  onChange={(e) => setSalesEndDate(e.target.value)}
                  className="w-[150px]"
                />
              </div>
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
              <CardTitle className="text-lg font-semibold">Sales Register</CardTitle>
              <CardDescription>Detailed record of sales transactions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Base Amount (₹)</TableHead>
                    <TableHead className="text-right">GST Amount (₹)</TableHead>
                    <TableHead className="text-right">Total Amount (₹)</TableHead>
                    <TableHead>GST Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalesEntries.length > 0 ? (
                    filteredSalesEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.id}</TableCell>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.debtorCustomer || "N/A"}</TableCell>
                        <TableCell className="text-right">{entry.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{entry.gstAmount?.toLocaleString("en-IN") || "0"}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {entry.totalAmount?.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>{entry.transactionType || "N/A"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${entry.status === "Posted"
                              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                              : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950/30 dark:text-gray-400"
                              }`}
                          >
                            {entry.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No sales entries found.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredSalesEntries.length > 0 && (
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell colSpan={5}>Total Sales for Selected Period</TableCell>
                      <TableCell className="text-right">{totalSalesAmount.toLocaleString("en-IN")}</TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overheads" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="start-date" className="text-sm font-medium text-muted-foreground">
                  From:
                </label>
                <Input
                  id="start-date"
                  type="date"
                  value={overheadStartDate}
                  onChange={(e) => setOverheadStartDate(e.target.value)}
                  className="w-[150px]"
                />
                <label htmlFor="end-date" className="text-sm font-medium text-muted-foreground">
                  To:
                </label>
                <Input
                  id="end-date"
                  type="date"
                  value={overheadEndDate}
                  onChange={(e) => setOverheadEndDate(e.target.value)}
                  className="w-[150px]"
                />
              </div>
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
              <CardTitle className="text-lg font-semibold">Overhead Costs</CardTitle>
              <CardDescription>Bifurcation of direct and indirect overhead expenses.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Expense Account</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(categorizedOverheads).length > 0 ? (
                    <>
                      {Object.entries(categorizedOverheads).map(([category, expenses]) => (
                        <React.Fragment key={category}>
                          <TableRow className="bg-muted/50 font-semibold">
                            <TableCell colSpan={3}>{category}</TableCell>
                          </TableRow>
                          {Object.entries(expenses).length > 0 ? (
                            Object.entries(expenses).map(([account, amount]) => (
                              <TableRow key={account}>
                                <TableCell></TableCell>
                                <TableCell>{getDisplayAccountName(account)}</TableCell>
                                <TableCell className="text-right">{amount.toLocaleString("en-IN")}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground">
                                No expenses in this category for the selected period.
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2}>Total Direct Overheads</TableCell>
                        <TableCell className="text-right">{totalDirectOverheads.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={2}>Total Indirect Overheads</TableCell>
                        <TableCell className="text-right">{totalIndirectOverheads.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                      <TableRow className="font-bold bg-primary/10">
                        <TableCell colSpan={2}>Grand Total Overheads</TableCell>
                        <TableCell className="text-right">
                          {(totalDirectOverheads + totalIndirectOverheads).toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No overhead expenses found for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Real-time Balance Sheet (Updates automatically with journal entries)
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintBalanceSheet}>
                <FileText className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Balance Sheet</CardTitle>
              <CardDescription>As of {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>ASSETS</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-4 font-medium">Current Assets</TableCell>
                    <TableCell className="text-right font-medium">
                      {balanceSheet.assets.current.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                  {balanceSheetAccountCategories.assets.current.map((accountName) => {
                    const balance = getBalanceFromTrialBalance(accountName)
                    return balance !== 0 ? (
                      <TableRow key={accountName}>
                        <TableCell className="pl-8">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{balance.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ) : null
                  })}
                  <TableRow>
                    <TableCell className="pl-4 font-medium">Fixed Assets</TableCell>
                    <TableCell className="text-right font-medium">
                      {balanceSheet.assets.fixed.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                  {balanceSheetAccountCategories.assets.fixed.map((accountName) => {
                    const balance = getBalanceFromTrialBalance(accountName)
                    return balance !== 0 ? (
                      <TableRow key={accountName}>
                        <TableCell className="pl-8">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{balance.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ) : null
                  })}
                  {balanceSheet.assets.other !== 0 && (
                    <TableRow>
                      <TableCell className="pl-4 font-medium">Other Assets</TableCell>
                      <TableCell className="text-right font-medium">
                        {balanceSheet.assets.other.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  )}
                  {balanceSheetAccountCategories.assets.other.map((accountName) => {
                    const balance = getBalanceFromTrialBalance(accountName)
                    return balance !== 0 ? (
                      <TableRow key={accountName}>
                        <TableCell className="pl-8">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{balance.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ) : null
                  })}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>TOTAL ASSETS</TableCell>
                    <TableCell className="text-right">{balanceSheet.assets.total.toLocaleString("en-IN")}</TableCell>
                  </TableRow>

                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>LIABILITIES</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-4 font-medium">Current Liabilities</TableCell>
                    <TableCell className="text-right font-medium">
                      {balanceSheet.liabilities.current.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                  {balanceSheetAccountCategories.liabilities.current.map((accountName) => {
                    const balance = getBalanceFromTrialBalance(accountName)
                    return balance !== 0 ? (
                      <TableRow key={accountName}>
                        <TableCell className="pl-8">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{balance.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ) : null
                  })}
                  <TableRow>
                    <TableCell className="pl-4 font-medium">Long-Term Liabilities</TableCell>
                    <TableCell className="text-right font-medium">
                      {balanceSheet.liabilities.longTerm.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                  {balanceSheetAccountCategories.liabilities.longTerm.map((accountName) => {
                    const balance = getBalanceFromTrialBalance(accountName)
                    return balance !== 0 ? (
                      <TableRow key={accountName}>
                        <TableCell className="pl-8">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{balance.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ) : null
                  })}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>TOTAL LIABILITIES</TableCell>
                    <TableCell className="text-right">
                      {balanceSheet.liabilities.total.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>

                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>EQUITY</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-4 font-medium">Equity</TableCell>
                    <TableCell className="text-right font-medium">
                      {balanceSheet.equity.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                  {balanceSheetAccountCategories.equity.map((accountName) => {
                    const balance = getBalanceFromTrialBalance(accountName)
                    return balance !== 0 ? (
                      <TableRow key={accountName}>
                        <TableCell className="pl-8">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{balance.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ) : null
                  })}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>TOTAL EQUITY</TableCell>
                    <TableCell className="text-right">{balanceSheet.equity.toLocaleString("en-IN")}</TableCell>
                  </TableRow>

                  <TableRow className="font-bold bg-primary/10">
                    <TableCell>TOTAL LIABILITIES & EQUITY</TableCell>
                    <TableCell className="text-right">
                      {balanceSheet.totalLiabilitiesAndEquity.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                  {balanceSheet.assets.total !== balanceSheet.totalLiabilitiesAndEquity && (
                    <TableRow className="bg-red-50 dark:bg-red-950/30">
                      <TableCell colSpan={2} className="text-red-600 font-medium">
                        ⚠️ Balance Sheet is not balanced! Difference: ₹
                        {Math.abs(balanceSheet.assets.total - balanceSheet.totalLiabilitiesAndEquity).toLocaleString(
                          "en-IN",
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="p-l-account" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="pl-start-date" className="text-sm font-medium text-muted-foreground">
                  From:
                </label>
                <Input
                  id="pl-start-date"
                  type="date"
                  value={plStartDate}
                  onChange={(e) => setPlStartDate(e.target.value)}
                  className="w-[150px]"
                />
                <label htmlFor="pl-end-date" className="text-sm font-medium text-muted-foreground">
                  To:
                </label>
                <Input
                  id="pl-end-date"
                  type="date"
                  value={plEndDate}
                  onChange={(e) => setPlEndDate(e.target.value)}
                  className="w-[150px]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintProfitAndLoss}>
                <FileText className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Profit and Loss Account</CardTitle>
              <CardDescription>
                For the period {plStartDate || "Start"} to {plEndDate || "End"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>REVENUE</TableCell>
                  </TableRow>
                  {Object.entries(profitAndLoss.revenue.details).length > 0 ? (
                    Object.entries(profitAndLoss.revenue.details).map(([accountName, amount]) => (
                      <TableRow key={accountName}>
                        <TableCell className="pl-4">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{amount.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No revenue entries for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>TOTAL REVENUE</TableCell>
                    <TableCell className="text-right">{profitAndLoss.revenue.total.toLocaleString("en-IN")}</TableCell>
                  </TableRow>

                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>COST OF GOODS SOLD</TableCell>
                  </TableRow>
                  {Object.entries(profitAndLoss.cogs.details).length > 0 ? (
                    Object.entries(profitAndLoss.cogs.details).map(([accountName, amount]) => (
                      <TableRow key={accountName}>
                        <TableCell className="pl-4">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{amount.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No COGS entries for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>TOTAL COST OF GOODS SOLD</TableCell>
                    <TableCell className="text-right">{profitAndLoss.cogs.total.toLocaleString("en-IN")}</TableCell>
                  </TableRow>

                  <TableRow className="font-bold bg-primary/10">
                    <TableCell>GROSS PROFIT</TableCell>
                    <TableCell className="text-right">{profitAndLoss.grossProfit.toLocaleString("en-IN")}</TableCell>
                  </TableRow>

                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>OPERATING EXPENSES</TableCell>
                  </TableRow>
                  {Object.entries(profitAndLoss.operatingExpenses.details).length > 0 ? (
                    Object.entries(profitAndLoss.operatingExpenses.details).map(([accountName, amount]) => (
                      <TableRow key={accountName}>
                        <TableCell className="pl-4">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{amount.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No operating expenses for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>TOTAL OPERATING EXPENSES</TableCell>
                    <TableCell className="text-right">
                      {profitAndLoss.operatingExpenses.total.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-bold bg-primary/10">
                    <TableCell>OPERATING PROFIT</TableCell>
                    <TableCell className="text-right">
                      {profitAndLoss.operatingProfit.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>

                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>OTHER INCOME</TableCell>
                  </TableRow>
                  {Object.entries(profitAndLoss.otherIncome.details).length > 0 ? (
                    Object.entries(profitAndLoss.otherIncome.details).map(([accountName, amount]) => (
                      <TableRow key={accountName}>
                        <TableCell className="pl-4">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{amount.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No other income for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>TOTAL OTHER INCOME</TableCell>
                    <TableCell className="text-right">
                      {profitAndLoss.otherIncome.total.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>

                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>OTHER EXPENSES</TableCell>
                  </TableRow>
                  {Object.entries(profitAndLoss.otherExpenses.details).length > 0 ? (
                    Object.entries(profitAndLoss.otherExpenses.details).map(([accountName, amount]) => (
                      <TableRow key={accountName}>
                        <TableCell className="pl-4">{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{amount.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No other expenses for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>TOTAL OTHER EXPENSES</TableCell>
                    <TableCell className="text-right">
                      {profitAndLoss.otherExpenses.total.toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-bold bg-primary/10">
                    <TableCell>NET PROFIT</TableCell>
                    <TableCell className="text-right">{profitAndLoss.netProfit.toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense-summary" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="expense-start-date" className="text-sm font-medium text-muted-foreground">
                  From:
                </label>
                <Input
                  id="expense-start-date"
                  type="date"
                  value={plStartDate}
                  onChange={(e) => setPlStartDate(e.target.value)}
                  className="w-[150px]"
                />
                <label htmlFor="expense-end-date" className="text-sm font-medium text-muted-foreground">
                  To:
                </label>
                <Input
                  id="expense-end-date"
                  type="date"
                  value={plEndDate}
                  onChange={(e) => setPlEndDate(e.target.value)}
                  className="w-[150px]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintExpenseSummary}>
                <FileText className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Expense Summary</CardTitle>
              <CardDescription>
                Summarized view of all expenses for the period {plStartDate || "Start"} to {plEndDate || "End"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Expense Account</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExpenseSummary.length > 0 ? (
                    sortedExpenseSummary.map(([accountName, amount]) => (
                      <TableRow key={accountName}>
                        <TableCell>{getDisplayAccountName(accountName)}</TableCell>
                        <TableCell className="text-right">{amount.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        No expense entries found for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                  {sortedExpenseSummary.length > 0 && (
                    <TableRow className="font-bold bg-primary/10">
                      <TableCell>TOTAL EXPENSES</TableCell>
                      <TableCell className="text-right">{totalExpenses.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="debit-credit-notes" className="flex-1 p-0">
          <DebitCreditNoteManager />
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
                  <p className="text-base font-semibold">{getDisplayAccountName(accountToView.name)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                <p className="text-base">{accountToView.type}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
                <p className="text-base font-bold">₹{calculateAccountBalance(accountToView).toLocaleString("en-IN")}</p>
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
                          {subAccount.id}: {getDisplayAccountName(subAccount.name)} - ₹
                          {calculateAccountBalance(subAccount).toLocaleString("en-IN")}
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
