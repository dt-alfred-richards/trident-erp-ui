"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"

// Sample customer data for integration
const customers = [
  { id: "CUST001", name: "Acme Corp" },
  { id: "CUST002", name: "TechGiant Inc" },
  { id: "CUST003", name: "Global Traders" },
  { id: "CUST004", name: "Innovate Solutions" },
  { id: "CUST005", name: "Prime Industries" },
]

// Sample supplier data for integration
const suppliers = [
  { id: "SUP001", name: "Raw Materials Co." },
  { id: "SUP002", name: "Industrial Supplies Ltd." },
  { id: "SUP003", name: "Quality Components Inc." },
  { id: "SUP004", name: "Packaging Solutions" },
  { id: "SUP005", name: "Logistics Partners" },
]

// Define types for our finance data
export type JournalEntry = {
  id: string
  date: string
  description: string
  debitAccount: string
  creditAccount: string
  amount: number
  reference: string
  status: "Draft" | "Posted" | "Pending" | "Rejected"
  transactionType?: "CGST-SGST" | "IGST"
  gstPercentage?: number
  partyType?: "Customer" | "Supplier"
  debtorCustomer?: string
  creditorSupplier?: string
  dueDate?: string
  gstAmount?: number
  activeInvoice?: string
  activeBill?: string
  bankAccount?: string
  isNoteRelated?: boolean // Add this new field
}

export type Account = {
  id: string
  name: string
  type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense"
  balance: number
  parentId?: string
}

export type Invoice = {
  id: string
  customer: string
  date: string
  dueDate: string
  amount: number
  balance: number
  status: "Open" | "Paid" | "Overdue" | "Partially Paid"
  items: InvoiceItem[]
}

export type InvoiceItem = {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxRate: number
  taxAmount: number
}

export type Bill = {
  id: string
  supplier: string
  date: string
  dueDate: string
  amount: number
  balance: number
  status: "Open" | "Paid" | "Overdue" | "Partially Paid"
  items: BillItem[]
}

export type BillItem = {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxRate: number
  taxAmount: number
}

export type BankAccount = {
  id: string
  name: string
  bank: string
  accountNumber: string
  balance: number
  type: "Current" | "Savings" | "Fixed Deposit" | "Cash"
}

export type Transaction = {
  id: string
  date: string
  description: string
  account: string
  type: "Deposit" | "Withdrawal" | "Transfer"
  amount: number
  reference: string
  status: "Cleared" | "Pending" | "Bounced"
}

export type Asset = {
  id: string
  name: string
  category: string
  purchaseDate: string
  cost: number
  currentValue: number
  location: string
  status: string
}

export type CostCenter = {
  id: string
  name: string
  type: string
  manager: string
  budget: number
  actual: number
  variance: number
}

export type TaxFiling = {
  id: string
  type: string
  period: string
  dueDate: string
  status: "Upcoming" | "Filed" | "Overdue"
  amount: number
}

// Add new types for DebitNote and CreditNote
// Add new state variables for debitNotes and creditNotes
// Add addDebitNote and addCreditNote functions to the context value
// Ensure customers and suppliers are exposed in the context value

// Add these types after the existing `TaxFiling` type:
export type DebitNote = {
  id: string
  billId: string // Original Bill ID
  supplier: string
  date: string
  reason: string
  items: {
    description: string
    quantity: number
    unitPrice: number
    amount: number
    taxRate: number
    taxAmount: number
  }[]
  baseAmount: number
  gstAmount: number
  totalAmount: number
  transactionType: "CGST-SGST" | "IGST"
  status: "Draft" | "Posted"
}

export type CreditNote = {
  id: string
  invoiceId: string // Original Invoice ID
  customer: string
  date: string
  reason: string
  items: {
    description: string
    quantity: number
    unitPrice: number
    amount: number
    taxRate: number
    taxAmount: number
  }[]
  baseAmount: number
  gstAmount: number
  totalAmount: number
  transactionType: "CGST-SGST" | "IGST"
  status: "Draft" | "Posted"
}

// Account type mapping for proper accounting principles
const accountTypeMapping: Record<string, "Asset" | "Liability" | "Equity" | "Revenue" | "Expense"> = {
  Cash: "Asset",
  Bank: "Asset",
  "Accounts Receivable": "Asset",
  "Raw Materials Inventory": "Asset",
  "Work-in-Progress": "Asset",
  "Finished Goods Inventory": "Asset",
  "Fixed Assets": "Asset",
  "Other Assets": "Asset",
  "Prepaid Expenses": "Asset",
  "Short Term Investment": "Asset",
  "Other Receivables": "Asset",
  // GST Input Accounts (Input Tax Credit - Assets)
  "CGST Input": "Asset",
  "SGST Input": "Asset",
  "IGST Input": "Asset",
  "Accounts Payable": "Liability",
  "Current Liabilities": "Liability",
  "Long-term Liabilities": "Liability",
  "Short Term Loans": "Liability",
  "Bank Overdrafts": "Liability",
  "GST Payable": "Liability",
  "Accrued Expenses": "Liability",
  "Unearned Revenue": "Liability",
  "Other Current Liabilities": "Liability",
  // GST Output Accounts (Tax Payable - Liabilities)
  "CGST Output": "Liability",
  "SGST Output": "Liability",
  "IGST Output": "Liability",
  Capital: "Equity",
  "Retained Earnings": "Equity",
  "Sales Revenue": "Revenue",
  "Service Revenue": "Revenue",
  "Other Revenue": "Revenue",
  "Sales Revenue Returned": "Revenue",
  "Cost of Goods Sold": "Expense",
  Wages: "Expense",
  "Salary Expenses": "Expense",
  "Utilities Expenses": "Expense",
  "Operating Expenses": "Expense",
  "Inventory Loss": "Expense",
  "Raw Materials Inventory Returned": "Asset",
  "Fuel Expense": "Expense",
  "Food Expense": "Expense",
  "Electricity Expense": "Expense",
  "Machinery Expense": "Expense",
  "Telephone Expense": "Expense",
  "Factory Maintenance": "Expense",
  "Water Expense": "Expense",
}

// Add the following mapping and helper function at the top of the file, before `initialTrialBalance`.

const accountDisplayNames: Record<string, string> = {
  "Sales Revenue": "Sales",
  "Sales Revenue Returned": "Sales Return (Credit Note)",
  "Raw Materials Inventory": "Purchase RM",
  "Raw Materials Inventory Returned": "Purchase RM Return (Debit Note)",
  // Add other accounts if they need specific display names, otherwise they map to themselves
  "Accounts Payable": "Accounts Payable",
  "Accounts Receivable": "Accounts Receivable",
  "Accrued Expenses": "Accrued Expenses",
  "Advance from Customer": "Advance from Customer",
  "Advance to Supplier": "Advance to Supplier",
  Bank: "Bank",
  "Bank Overdrafts": "Bank Overdrafts",
  Cash: "Cash",
  "CGST Input": "CGST Input",
  "CGST Output": "CGST Output",
  "Finished Goods Inventory": "Finished Goods Inventory",
  "GST Payable": "GST Payable",
  "IGST Input": "IGST Input",
  "IGST Output": "IGST Output",
  "Other Current Liabilities": "Other Current Liabilities",
  "Other Receivables": "Other Receivables",
  "Prepaid Expenses": "Prepaid Expenses",
  "SGST Input": "SGST Input",
  "SGST Output": "SGST Output",
  "Short Term Investment": "Short Term Investment",
  "Short Term Loans": "Short Term Loans",
  "Unearned Revenue": "Unearned Revenue",
  Wages: "Wages",
  "Work-in-Progress": "Work-in-Progress",
  Inventory: "Inventory",
  "Utilities Expense": "Utilities Expense",
  "Salary Expense": "Salary Expense",
  "Fixed Assets": "Fixed Assets",
  Capital: "Capital",
  "Retained Earnings": "Retained Earnings",
  "Service Revenue": "Service Revenue",
  "Other Revenue": "Other Revenue",
  "Cost of Goods Sold": "Cost of Goods Sold",
  "Operating Expenses": "Operating Expenses",
  "Inventory Loss": "Inventory Loss",
  "Fuel Expense": "Fuel Expense",
  "Food Expense": "Food Expense",
  "Electricity Expense": "Electricity Expense",
  "Machinery Expense": "Machinery Expense",
  "Telephone Expense": "Telephone Expense",
  "Factory Maintenance": "Factory Maintenance",
  "Water Expense": "Water Expense",
}

export const getDisplayAccountName = (internalName: string): string => {
  return accountDisplayNames[internalName] || internalName
}

// Trial Balance Entry type
type TrialBalanceEntry = {
  account: string
  accountType: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense"
  debit: number
  credit: number
}

// Initial trial balance state - Add GST accounts
const initialTrialBalance: TrialBalanceEntry[] = [
  { account: "Cash", accountType: "Asset", debit: 3500000, credit: 0 },
  { account: "Bank", accountType: "Asset", debit: 2800000, credit: 0 },
  { account: "Accounts Receivable", accountType: "Asset", debit: 6300000, credit: 0 },
  { account: "Raw Materials Inventory", accountType: "Asset", debit: 4200000, credit: 0 },
  { account: "Work-in-Progress", accountType: "Asset", debit: 2500000, credit: 0 },
  { account: "Finished Goods Inventory", accountType: "Asset", debit: 3800000, credit: 0 },
  { account: "Fixed Assets", type: "Asset", debit: 12500000, credit: 0 },
  { account: "Accounts Payable", accountType: "Liability", debit: 0, credit: 4900000 },
  { account: "Sales Revenue", accountType: "Revenue", debit: 0, credit: 18500000 },
  { account: "Wages", accountType: "Expense", debit: 6500000, credit: 0 },
  { account: "Salary Expenses", accountType: "Expense", debit: 4200000, credit: 0 },
  { account: "Utilities Expenses", accountType: "Expense", debit: 1200000, credit: 0 },
  { account: "CGST Input", accountType: "Asset", debit: 0, credit: 0 },
  { account: "SGST Input", accountType: "Asset", debit: 0, credit: 0 },
  { account: "IGST Input", accountType: "Asset", debit: 0, credit: 0 },
  { account: "CGST Output", accountType: "Liability", debit: 0, credit: 0 },
  { account: "SGST Output", accountType: "Liability", debit: 0, credit: 0 },
  { account: "IGST Output", accountType: "Liability", debit: 0, credit: 0 },
  { account: "Capital", accountType: "Equity", debit: 0, credit: 10000000 }, // Example initial capital
  { account: "Retained Earnings", accountType: "Equity", debit: 0, credit: 4500000 }, // Example initial retained earnings
  { account: "Accumulated Depreciation", accountType: "Asset", debit: 0, credit: 1000000 }, // Example contra-asset
  { account: "Fuel Expense", accountType: "Expense", debit: 0, credit: 0 },
  { account: "Food Expense", accountType: "Expense", debit: 0, credit: 0 },
  { account: "Electricity Expense", accountType: "Expense", debit: 0, credit: 0 },
  { account: "Machinery Expense", accountType: "Expense", debit: 0, credit: 0 },
  { account: "Telephone Expense", accountType: "Expense", debit: 0, credit: 0 },
  { account: "Factory Maintenance", accountType: "Expense", debit: 0, credit: 0 },
  { account: "Water Expense", accountType: "Expense", debit: 0, credit: 0 },
]

// Define the context type
type FinanceContextType = {
  journalEntries: JournalEntry[]
  accounts: Account[]
  invoices: Invoice[]
  bills: Bill[]
  bankAccounts: BankAccount[]
  transactions: Transaction[]
  assets: Asset[]
  costCenters: CostCenter[]
  taxFilings: TaxFiling[]
  trialBalance: TrialBalanceEntry[]
  debitNotes: DebitNote[]
  creditNotes: CreditNote[]
  customers: { id: string; name: string }[]
  suppliers: { id: string; name: string }[]

  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void
  deleteJournalEntry: (id: string) => void

  addAccount: (account: Omit<Account, "id">) => void
  updateAccount: (id: string, account: Partial<Account>) => void
  deleteAccount: (id: string) => void

  addInvoice: (invoice: Omit<Invoice, "id">) => void
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void

  addBill: (bill: Omit<Bill, "id">) => void
  updateBill: (id: string, bill: Partial<Bill>) => void
  deleteBill: (id: string) => void

  addBankAccount: (account: Omit<BankAccount, "id">) => void
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void
  deleteBankAccount: (id: string) => void

  addTransaction: (transaction: Omit<Transaction, "id">) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  addAsset: (asset: Omit<Asset, "id">) => void
  updateAsset: (id: string, asset: Partial<Asset>) => void
  deleteAsset: (id: string) => void

  addCostCenter: (center: Omit<CostCenter, "id">) => void
  updateCostCenter: (id: string, center: Partial<CostCenter>) => void
  deleteCostCenter: (id: string) => void

  addTaxFiling: (filing: Omit<TaxFiling, "id">) => void
  updateTaxFiling: (id: string, filing: Partial<TaxFiling>) => void
  deleteTaxFiling: (id: string) => void

  addDebitNote: (note: Omit<DebitNote, "id">) => void
  addCreditNote: (note: Omit<CreditNote, "id">) => void

  updateTotalReceivables: (amount: number, customer?: string) => void
  decreaseTotalReceivables: (amount: number, customer?: string, invoiceId?: string) => void

  updateTotalPayables: (amount: number, supplier?: string) => void
  decreaseTotalPayables: (amount: number, supplier?: string, billId?: string) => void
  updateTrialBalance: (debitAccount: string, creditAccount: string, amount: number) => void
}

// Sample data
const sampleJournalEntries: JournalEntry[] = [
  {
    id: "JE-2023-0145",
    date: "2023-06-15",
    description: "Sales Revenue - Acme Corp",
    debitAccount: "Accounts Receivable",
    creditAccount: "Sales Revenue",
    amount: 125000,
    reference: "INV-2023-0089",
    status: "Posted",
    transactionType: "CGST-SGST",
    gstPercentage: 18,
    partyType: "Customer",
    debtorCustomer: "CUST001",
  },
  {
    id: "JE-2023-0144",
    date: "2023-06-14",
    description: "Raw Material Purchase",
    debitAccount: "Inventory",
    creditAccount: "Accounts Payable",
    amount: 78500,
    reference: "PO-2023-0112",
    status: "Posted",
    transactionType: "IGST",
    gstPercentage: 18,
    partyType: "Supplier",
    creditorSupplier: "SUP001",
  },
  {
    id: "JE-2023-0143",
    date: "2023-06-13",
    description: "Utility Expenses",
    debitAccount: "Utilities Expense",
    creditAccount: "Cash",
    amount: 45200,
    reference: "UTIL-2023-06",
    status: "Posted",
  },
  {
    id: "JE-2023-0142",
    date: "2023-06-12",
    description: "Employee Salaries",
    debitAccount: "Salary Expense",
    creditAccount: "Cash",
    amount: 350000,
    reference: "PAY-2023-06",
    status: "Posted",
  },
  {
    id: "JE-2023-0141",
    date: "2023-06-10",
    description: "Equipment Purchase",
    debitAccount: "Fixed Assets",
    creditAccount: "Cash",
    amount: 275000,
    reference: "FA-2023-0025",
    status: "Posted",
  },
]

const sampleAccounts: Account[] = [
  { id: "1000", name: "Assets", type: "Asset", balance: 22800000 },
  { id: "1100", name: "Current Assets", type: "Asset", balance: 8500000, parentId: "1000" },
  { id: "1200", name: "Fixed Assets", type: "Asset", balance: 12500000, parentId: "1000" },
  { id: "1300", name: "Other Assets", type: "Asset", balance: 1800000, parentId: "1000" },

  { id: "2000", name: "Liabilities", type: "Liability", balance: 12700000 },
  { id: "2100", name: "Current Liabilities", type: "Liability", balance: 5200000, parentId: "2000" },
  { id: "2200", name: "Long-term Liabilities", type: "Liability", balance: 7500000, parentId: "2000" },

  { id: "3000", name: "Equity", type: "Equity", balance: 14500000 },
  { id: "3100", name: "Capital", type: "Equity", balance: 10000000, parentId: "3000" },
  { id: "3200", name: "Retained Earnings", type: "Equity", balance: 4500000, parentId: "3000" },

  { id: "4000", name: "Revenue", type: "Revenue", balance: 22550000 },
  { id: "4100", name: "Sales Revenue", type: "Revenue", balance: 18500000, parentId: "4000" },
  { id: "4200", name: "Service Revenue", type: "Revenue", balance: 3200000, parentId: "4000" },
  { id: "4300", name: "Other Revenue", type: "Revenue", balance: 850000, parentId: "4000" },

  { id: "5000", name: "Expenses", type: "Expense", balance: 21700000 },
  { id: "5100", name: "Cost of Goods Sold", type: "Expense", balance: 9800000, parentId: "5000" },
  { id: "5200", name: "Operating Expenses", type: "Expense", balance: 4200000, parentId: "5000" },
  { id: "5300", name: "Salary Expenses", type: "Expense", balance: 6500000, parentId: "5000" },
  { id: "5400", name: "Utilities Expenses", type: "Expense", balance: 1200000, parentId: "5000" },
]

const sampleInvoices: Invoice[] = [
  {
    id: "INV-2023-0089",
    customer: "Acme Corp",
    date: "2023-06-15",
    dueDate: "2023-07-15",
    amount: 185000,
    balance: 185000,
    status: "Open",
    items: [
      {
        id: "ITEM-001",
        description: "Premium Steel Fasteners (Box of 100)",
        quantity: 50,
        unitPrice: 3500,
        amount: 175000,
        taxRate: 18,
        taxAmount: 31500,
      },
      {
        id: "ITEM-002",
        description: "Shipping and Handling",
        quantity: 1,
        unitPrice: 10000,
        amount: 10000,
        taxRate: 18,
        taxAmount: 1800,
      },
    ],
  },
  {
    id: "INV-2023-0088",
    customer: "TechGiant Inc",
    date: "2023-06-10",
    dueDate: "2023-07-10",
    amount: 92750,
    balance: 92750,
    status: "Open",
    items: [
      {
        id: "ITEM-001",
        description: "Industrial Grade Bolts (Box of 50)",
        quantity: 25,
        unitPrice: 3500,
        amount: 87500,
        taxRate: 18,
        taxAmount: 15750,
      },
      {
        id: "ITEM-002",
        description: "Shipping and Handling",
        quantity: 1,
        unitPrice: 5250,
        amount: 5250,
        taxRate: 18,
        taxAmount: 945,
      },
    ],
  },
  {
    id: "INV-2023-0087",
    customer: "Global Traders",
    date: "2023-06-05",
    dueDate: "2023-07-05",
    amount: 134200,
    balance: 134200,
    status: "Open",
    items: [
      {
        id: "ITEM-001",
        description: "Precision Machined Components",
        quantity: 20,
        unitPrice: 6300,
        amount: 126000,
        taxRate: 18,
        taxAmount: 22680,
      },
      {
        id: "ITEM-002",
        description: "Shipping and Handling",
        quantity: 1,
        unitPrice: 8200,
        amount: 8200,
        taxRate: 18,
        taxAmount: 1476,
      },
    ],
  },
  {
    id: "INV-2023-0086",
    customer: "Innovate Solutions",
    date: "2023-05-28",
    dueDate: "2023-06-28",
    amount: 76500,
    balance: 0,
    status: "Paid",
    items: [
      {
        id: "ITEM-001",
        description: "Stainless Steel Brackets",
        quantity: 15,
        unitPrice: 4800,
        amount: 72000,
        taxRate: 18,
        taxAmount: 12960,
      },
      {
        id: "ITEM-002",
        description: "Shipping and Handling",
        quantity: 1,
        unitPrice: 4500,
        amount: 4500,
        taxRate: 18,
        taxAmount: 810,
      },
    ],
  },
  {
    id: "INV-2023-0085",
    customer: "Prime Industries",
    date: "2023-05-20",
    dueDate: "2023-06-20",
    amount: 215000,
    balance: 0,
    status: "Paid",
    items: [
      {
        id: "ITEM-001",
        description: "Custom Aluminum Fittings",
        quantity: 40,
        unitPrice: 5200,
        amount: 208000,
        taxRate: 18,
        taxAmount: 37440,
      },
      {
        id: "ITEM-002",
        description: "Shipping and Handling",
        quantity: 1,
        unitPrice: 7000,
        amount: 7000,
        taxRate: 18,
        taxAmount: 1260,
      },
    ],
  },
]

const sampleBills: Bill[] = [
  {
    id: "BILL-2023-0112",
    supplier: "Raw Materials Co.", // Changed from "RawMaterials Ltd"
    date: "2023-06-12",
    dueDate: "2023-07-12",
    amount: 145000,
    balance: 145000,
    status: "Open",
    items: [
      {
        id: "ITEM-001",
        description: "Steel Rods (Grade A)",
        quantity: 500,
        unitPrice: 280,
        amount: 140000,
        taxRate: 18,
        taxAmount: 25200,
      },
      {
        id: "ITEM-002",
        description: "Shipping and Handling",
        quantity: 1,
        unitPrice: 5000,
        amount: 5000,
        taxRate: 18,
        taxAmount: 900,
      },
    ],
  },
  {
    id: "BILL-2023-0111",
    supplier: "Industrial Supplies Ltd.", // Changed from "Equipment Suppliers"
    date: "2023-06-08",
    dueDate: "2023-07-08",
    amount: 67800,
    balance: 67800,
    status: "Open",
    items: [
      {
        id: "ITEM-001",
        description: "Maintenance Parts for CNC Machine",
        quantity: 1,
        unitPrice: 65000,
        amount: 65000,
        taxRate: 18,
        taxAmount: 11700,
      },
      {
        id: "ITEM-002",
        description: "Service Fee",
        quantity: 1,
        unitPrice: 2800,
        amount: 2800,
        taxRate: 18,
        taxAmount: 504,
      },
    ],
  },
  {
    id: "BILL-2023-0110",
    supplier: "Packaging Solutions",
    date: "2023-06-05",
    dueDate: "2023-07-05",
    amount: 98500,
    balance: 98500,
    status: "Open",
    items: [
      {
        id: "ITEM-001",
        description: "Custom Packaging Boxes",
        quantity: 1000,
        unitPrice: 95,
        amount: 95000,
        taxRate: 18,
        taxAmount: 17100,
      },
      {
        id: "ITEM-002",
        description: "Shipping and Handling",
        quantity: 1,
        unitPrice: 3500,
        amount: 3500,
        taxRate: 18,
        taxAmount: 630,
      },
    ],
  },
  {
    id: "BILL-2023-0109",
    supplier: "Logistics Partners",
    date: "2023-05-25",
    dueDate: "2023-06-25",
    amount: 54200,
    balance: 0,
    status: "Paid",
    items: [
      {
        id: "ITEM-001",
        description: "Transportation Services",
        quantity: 1,
        unitPrice: 52000,
        amount: 52000,
        taxRate: 18,
        taxAmount: 9360,
      },
      {
        id: "ITEM-002",
        description: "Documentation Fee",
        quantity: 1,
        unitPrice: 2200,
        amount: 2200,
        taxRate: 18,
        taxAmount: 396,
      },
    ],
  },
  {
    id: "BILL-2023-0108",
    supplier: "Quality Components Inc.", // Changed from "Office Supplies Co"
    date: "2023-05-18",
    dueDate: "2023-06-18",
    amount: 32500,
    balance: 0,
    status: "Paid",
    items: [
      {
        id: "ITEM-001",
        description: "Office Stationery",
        quantity: 1,
        unitPrice: 25000,
        amount: 25000,
        taxRate: 18,
        taxRate: 18,
        taxAmount: 4500,
      },
      {
        id: "ITEM-002",
        description: "Computer Accessories",
        quantity: 1,
        unitPrice: 7500,
        amount: 7500,
        taxRate: 18,
        taxAmount: 1350,
      },
    ],
  },
]

const sampleBankAccounts: BankAccount[] = [
  {
    id: "ACC-001",
    name: "Main Operating Account",
    bank: "State Bank of India",
    accountNumber: "XXXX-XXXX-1234",
    balance: 3500000,
    type: "Current",
  },
  {
    id: "ACC-002",
    name: "Payroll Account",
    bank: "HDFC Bank",
    accountNumber: "XXXX-XXXX-5678",
    balance: 1200000,
    type: "Current",
  },
  {
    id: "ACC-003",
    name: "Tax Reserve Account",
    bank: "ICICI Bank",
    accountNumber: "XXXX-XXXX-9012",
    balance: 850000,
    type: "Savings",
  },
  {
    id: "ACC-004",
    name: "Fixed Deposit",
    bank: "Axis Bank",
    accountNumber: "XXXX-XXXX-3456",
    balance: 5000000,
    type: "Fixed Deposit",
  },
  {
    id: "ACC-005",
    name: "Petty Cash",
    bank: "Cash on Hand",
    accountNumber: "N/A",
    balance: 50000,
    type: "Cash",
  },
]

const sampleTransactions: Transaction[] = [
  {
    id: "TRX-2023-0245",
    date: "2023-06-15",
    description: "Customer Payment - Acme Corp",
    account: "Main Operating Account",
    type: "Deposit",
    amount: 125000,
    reference: "INV-2023-0089",
    status: "Cleared",
  },
  {
    id: "TRX-2023-0244",
    date: "2023-06-14",
    description: "Supplier Payment - RawMaterials Ltd",
    account: "Main Operating Account",
    type: "Withdrawal",
    amount: 78500,
    reference: "BILL-2023-0112",
    status: "Cleared",
  },
  {
    id: "TRX-2023-0243",
    date: "2023-06-13",
    description: "Utility Bill Payment",
    account: "Main Operating Account",
    type: "Withdrawal",
    amount: 45200,
    reference: "UTIL-2023-06",
    status: "Cleared",
  },
  {
    id: "TRX-2023-0242",
    date: "2023-06-12",
    description: "Payroll Transfer",
    account: "Payroll Account",
    type: "Transfer",
    amount: 350000,
    reference: "PAY-2023-06",
    status: "Cleared",
  },
  {
    id: "TRX-2023-0241",
    date: "2023-06-10",
    description: "GST Payment",
    account: "Tax Reserve Account",
    type: "Withdrawal",
    amount: 125000,
    reference: "TAX-2023-05",
    status: "Pending",
  },
]

const sampleAssets: Asset[] = [
  {
    id: "FA-2023-0025",
    name: "CNC Machine - Model X500",
    category: "Machinery & Equipment",
    purchaseDate: "2023-06-10",
    cost: 2750000,
    currentValue: 2612500,
    location: "Production Floor A",
    status: "In Use",
  },
  {
    id: "FA-2023-0024",
    name: "Delivery Truck - Tata LPT 1109",
    category: "Vehicles",
    purchaseDate: "2023-05-15",
    cost: 1850000,
    currentValue: 1739000,
    location: "Transport Bay",
    status: "In Use",
  },
  {
    id: "FA-2023-0023",
    name: "Office Building - East Wing",
    category: "Real Estate",
    purchaseDate: "2022-12-01",
    cost: 25000000,
    currentValue: 24375000,
    location: "Main Campus",
    status: "In Use",
  },
  {
    id: "FA-2023-0022",
    name: "Computer Workstations (20 units)",
    category: "IT Equipment",
    purchaseDate: "2023-02-20",
    cost: 1200000,
    currentValue: 1050000,
    location: "Office Area",
    status: "In Use",
  },
  {
    id: "FA-2023-0021",
    name: "Packaging Machine - AutoPack 2000",
    category: "Machinery & Equipment",
    purchaseDate: "2022-10-15",
    cost: 1850000,
    currentValue: 1665000,
    location: "Packaging Department",
    status: "In Use",
  },
]

const sampleCostCenters: CostCenter[] = [
  {
    id: "CC-001",
    name: "Production Department",
    type: "Manufacturing",
    manager: "Rajesh Kumar",
    budget: 2500000,
    actual: 2350000,
    variance: 150000,
  },
  {
    id: "CC-002",
    name: "Assembly Line",
    type: "Manufacturing",
    manager: "Priya Sharma",
    budget: 1800000,
    actual: 1750000,
    variance: 50000,
  },
  {
    id: "CC-003",
    name: "Quality Control",
    type: "Manufacturing",
    manager: "Amit Singh",
    budget: 950000,
    actual: 980000,
    variance: -30000,
  },
  {
    id: "CC-004",
    name: "Packaging Department",
    type: "Manufacturing",
    manager: "Neha Gupta",
    budget: 750000,
    actual: 720000,
    variance: 30000,
  },
  {
    id: "CC-005",
    name: "Administration",
    type: "Support",
    manager: "Vikram Patel",
    budget: 1200000,
    actual: 1150000,
    variance: 50000,
  },
]

const sampleTaxFilings: TaxFiling[] = [
  {
    id: "GST-2023-06",
    type: "GST",
    period: "June 2023",
    dueDate: "2023-07-20",
    status: "Upcoming",
    amount: 450000,
  },
  {
    id: "TDS-2023-06",
    type: "TDS",
    period: "June 2023",
    dueDate: "2023-07-07",
    status: "Upcoming",
    amount: 125000,
  },
  {
    id: "ADV-2023-Q1",
    type: "Advance Tax",
    period: "Q1 2023-24",
    dueDate: "2023-06-15",
    status: "Filed",
    amount: 750000,
  },
  {
    id: "GST-2023-05",
    type: "GST",
    period: "May 2023",
    dueDate: "2023-06-20",
    status: "Filed",
    amount: 425000,
  },
  {
    id: "TDS-2023-05",
    type: "TDS",
    period: "May 2023",
    dueDate: "2023-06-07",
    status: "Filed",
    amount: 118000,
  },
]

// Create the context with default values
const FinanceContext = createContext<FinanceContextType>({
  journalEntries: [],
  accounts: [],
  invoices: [],
  bills: [],
  bankAccounts: [],
  transactions: [],
  assets: [],
  costCenters: [],
  taxFilings: [],
  trialBalance: [],
  debitNotes: [],
  creditNotes: [],
  customers: [],
  suppliers: [],

  addJournalEntry: () => {},
  updateJournalEntry: () => {},
  deleteJournalEntry: () => {},

  addAccount: () => {},
  updateAccount: () => {},
  deleteAccount: () => {},

  addInvoice: () => {},
  updateInvoice: () => {},
  deleteInvoice: () => {},

  addBill: () => {},
  updateBill: () => {},
  deleteBill: () => {},

  addBankAccount: () => {},
  updateBankAccount: () => {},
  deleteBankAccount: () => {},

  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},

  addAsset: () => {},
  updateAsset: () => {},
  deleteAsset: () => {},

  addCostCenter: () => {},
  updateCostCenter: () => {},
  deleteCostCenter: () => {},

  addTaxFiling: () => {},
  updateTaxFiling: () => {},
  deleteTaxFiling: () => {},

  addDebitNote: () => {},
  addCreditNote: () => {},

  updateTotalReceivables: () => {},
  decreaseTotalReceivables: () => {},
  updateTotalPayables: () => {},
  decreaseTotalPayables: () => {},
  updateTrialBalance: () => {},
})

// Helper function to generate IDs
const generateId = (prefix: string): string => {
  const timestamp = new Date().getTime()
  const random = Math.floor(Math.random() * 1000)
  return `${prefix}-${timestamp}-${random}`
}

// Provider component
export function FinanceProvider({ children }: { children: ReactNode }) {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(sampleJournalEntries)
  const [accounts, setAccounts] = useState<Account[]>(sampleAccounts)
  const [invoices, setInvoices] = useState<Invoice[]>(sampleInvoices)
  const [bills, setBills] = useState<Bill[]>(sampleBills)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(sampleBankAccounts)
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions)
  const [assets, setAssets] = useState<Asset[]>(sampleAssets)
  const [costCenters, setCostCenters] = useState<CostCenter[]>(sampleCostCenters)
  const [taxFilings, setTaxFilings] = useState<TaxFiling[]>(sampleTaxFilings)
  const [trialBalance, setTrialBalance] = useState<TrialBalanceEntry[]>(initialTrialBalance)
  const [debitNotes, setDebitNotes] = useState<DebitNote[]>([])
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([])
  const [customersList, setCustomers] = useState<{ id: string; name: string }[]>(customers)
  const [suppliersList, setSuppliers] = useState<{ id: string; name: string }[]>(suppliers)

  // Function to update trial balance based on journal entry
  const updateTrialBalance = (debitAccount: string, creditAccount: string, amount: number) => {
    setTrialBalance((prevBalance) => {
      const newBalance = [...prevBalance]

      // Helper function to get account type
      const getAccountType = (accountName: string): "Asset" | "Liability" | "Equity" | "Revenue" | "Expense" => {
        return accountTypeMapping[accountName] || "Asset"
      }

      // Helper function to find or create account entry
      const findOrCreateAccount = (accountName: string) => {
        let accountEntry = newBalance.find((entry) => entry.account === accountName)
        if (!accountEntry) {
          accountEntry = {
            account: accountName,
            accountType: getAccountType(accountName),
            debit: 0,
            credit: 0,
          }
          newBalance.push(accountEntry)
        }
        return accountEntry
      }

      // Update debit account
      const debitEntry = findOrCreateAccount(debitAccount)
      const debitAccountType = debitEntry.accountType

      // Update credit account
      const creditEntry = findOrCreateAccount(creditAccount)
      const creditAccountType = creditEntry.accountType

      // Apply accounting principles for debit side
      if (debitAccountType === "Asset" || debitAccountType === "Expense") {
        // Assets and Expenses have normal debit balance - increase debit side
        debitEntry.debit += amount
      } else {
        // Liabilities, Equity, Revenue have normal credit balance - decrease credit side when debited
        debitEntry.credit = Math.max(0, debitEntry.credit - amount)
        // If credit becomes negative, move to debit side
        if (debitEntry.credit === 0 && debitEntry.credit - amount < 0) {
          debitEntry.debit += Math.abs(debitEntry.credit - amount)
        }
      }

      // Apply accounting principles for credit side
      if (creditAccountType === "Liability" || creditAccountType === "Equity" || creditAccountType === "Revenue") {
        // Liabilities, Equity, Revenue have normal credit balance - increase credit side
        creditEntry.credit += amount
      } else {
        // Assets and Expenses have normal debit balance - decrease debit side when credited
        creditEntry.debit = Math.max(0, creditEntry.debit - amount)
        // If debit becomes negative, move to credit side
        if (creditEntry.debit === 0 && creditEntry.debit - amount < 0) {
          creditEntry.credit += Math.abs(creditEntry.debit - amount)
        }
      }

      return newBalance
    })
  }

  // Journal Entry CRUD operations
  const addJournalEntry = (entry: Omit<JournalEntry, "id">) => {
    const newEntry = { ...entry, id: generateId("JE") }

    // Identify transaction flavours once so they’re in outer scope
    const isSalesReturnTransaction =
      entry.debitAccount === "Sales Revenue Returned" &&
      ["Cash", "Bank", "Accounts Receivable"].includes(entry.creditAccount)

    const isPurchaseReturnTransaction =
      entry.creditAccount === "Raw Materials Inventory Returned" &&
      ["Cash", "Bank", "Accounts Payable"].includes(entry.debitAccount)

    setJournalEntries([newEntry, ...journalEntries])

    // Update trial balance with the main journal entry
    updateTrialBalance(entry.debitAccount, entry.creditAccount, entry.amount)

    // Handle Bank Account Balance Updates
    if (entry.bankAccount && (entry.debitAccount === "Bank" || entry.creditAccount === "Bank")) {
      setBankAccounts((prevAccounts) => {
        return prevAccounts.map((account) => {
          if (account.id === entry.bankAccount) {
            let newBalance = account.balance

            // If Bank is debited, money is coming in (increase balance)
            if (entry.debitAccount === "Bank") {
              newBalance += entry.amount
            }
            // If Bank is credited, money is going out (decrease balance)
            else if (entry.creditAccount === "Bank") {
              newBalance -= entry.amount
            }

            return { ...account, balance: newBalance }
          }
          return account
        })
      })

      // Create corresponding transaction in Banking & Cash -> Transactions
      const selectedBankAccount = bankAccounts.find((account) => account.id === entry.bankAccount)
      if (selectedBankAccount) {
        const newTransaction: Transaction = {
          id: `TRX-JE-${newEntry.id}`, // Link to journal entry
          date: entry.date,
          description: entry.description,
          account: selectedBankAccount.name,
          type: entry.debitAccount === "Bank" ? "Deposit" : "Withdrawal",
          amount: entry.amount,
          reference: entry.reference,
          status: entry.status === "Posted" ? "Cleared" : "Pending",
        }
        setTransactions((prev) => [newTransaction, ...prev])
      }
    }

    // Handle Cash Account Balance Updates
    if (entry.debitAccount === "Cash" || entry.creditAccount === "Cash") {
      // Find the Petty Cash account
      const pettyCashAccount = bankAccounts.find((account) => account.type === "Cash")

      if (pettyCashAccount) {
        setBankAccounts((prevAccounts) => {
          return prevAccounts.map((account) => {
            if (account.id === pettyCashAccount.id) {
              let newBalance = account.balance

              // If Cash is debited, money is coming in (increase balance)
              if (entry.debitAccount === "Cash") {
                newBalance += entry.amount
              }
              // If Cash is credited, money is going out (decrease balance)
              else if (entry.creditAccount === "Cash") {
                newBalance -= entry.amount
              }

              return { ...account, balance: newBalance }
            }
            return account
          })
        })

        // Create corresponding transaction in Banking & Cash -> Transactions
        const newTransaction: Transaction = {
          id: `TRX-CASH-${newEntry.id}`, // Link to journal entry
          date: entry.date,
          description: entry.description,
          account: pettyCashAccount.name,
          type: entry.debitAccount === "Cash" ? "Deposit" : "Withdrawal",
          amount: entry.amount,
          reference: entry.reference,
          status: entry.status === "Posted" ? "Cleared" : "Pending",
        }
        setTransactions((prev) => [newTransaction, ...prev])
      }
    }

    // Handle GST entries if applicable
    if (entry.gstPercentage && entry.gstPercentage > 0) {
      const gstAmount = entry.amount * (entry.gstPercentage / 100)

      // Check if this is a sales transaction
      const isSalesTransaction =
        (entry.debitAccount === "Cash" ||
          entry.debitAccount === "Bank" ||
          entry.debitAccount === "Accounts Receivable") &&
        entry.creditAccount === "Sales Revenue"

      // Check if this is a purchase transaction
      const isPurchaseTransaction =
        (entry.debitAccount === "Raw Materials Inventory" ||
          entry.debitAccount === "Finished Goods Inventory" ||
          entry.debitAccount === "Work-in-Progress") &&
        (entry.creditAccount === "Cash" || entry.creditAccount === "Bank" || entry.creditAccount === "Accounts Payable")

      if (isSalesTransaction) {
        // For sales: Credit GST Output accounts
        if (entry.transactionType === "IGST") {
          updateTrialBalance("IGST Output", "IGST Output", 0) // Ensure account exists
          updateTrialBalance(entry.debitAccount, "IGST Output", gstAmount)
        } else {
          // CGST-SGST
          const cgstAmount = gstAmount / 2
          const sgstAmount = gstAmount / 2
          updateTrialBalance("CGST Output", "CGST Output", 0) // Ensure account exists
          updateTrialBalance("SGST Output", "SGST Output", 0) // Ensure account exists
          updateTrialBalance(entry.debitAccount, "CGST Output", cgstAmount)
          updateTrialBalance(entry.debitAccount, "SGST Output", sgstAmount)
        }
      } else if (isPurchaseTransaction) {
        // For purchases: Debit GST Input accounts
        if (entry.transactionType === "IGST") {
          updateTrialBalance("IGST Input", "IGST Input", 0) // Ensure account exists
          updateTrialBalance("IGST Input", entry.creditAccount, gstAmount)
        } else {
          // CGST-SGST
          const cgstAmount = gstAmount / 2
          const sgstAmount = gstAmount / 2
          updateTrialBalance("CGST Input", "CGST Input", 0) // Ensure account exists
          updateTrialBalance("SGST Input", "SGST Input", 0) // Ensure account exists
          updateTrialBalance("CGST Input", entry.creditAccount, cgstAmount)
          updateTrialBalance("SGST Input", entry.creditAccount, sgstAmount)
        }
      } else if (isSalesReturnTransaction) {
        // For sales returns: Debit GST Output accounts (reversing)
        if (entry.transactionType === "IGST") {
          updateTrialBalance("IGST Output", entry.creditAccount, gstAmount)
        } else {
          // CGST-SGST
          const cgstAmount = gstAmount / 2
          const sgstAmount = gstAmount / 2
          updateTrialBalance("CGST Output", entry.creditAccount, cgstAmount)
          updateTrialBalance("SGST Output", entry.creditAccount, sgstAmount)
        }
      } else if (isPurchaseReturnTransaction) {
        // For purchase returns: Credit GST Input accounts (reversing)
        if (entry.transactionType === "IGST") {
          updateTrialBalance(entry.debitAccount, "IGST Input", gstAmount)
        } else {
          // CGST-SGST
          const cgstAmount = gstAmount / 2
          const sgstAmount = gstAmount / 2
          updateTrialBalance(entry.debitAccount, "CGST Input", cgstAmount)
          updateTrialBalance(entry.debitAccount, "SGST Input", sgstAmount)
        }
      }
    }

    // Handle Customer/Supplier Integration
    if (entry.partyType && (entry.debtorCustomer || entry.creditorSupplier)) {
      // Handle Customer transactions (Accounts Receivable)
      if (entry.partyType === "Customer" && entry.debtorCustomer) {
        const customerName = customers.find((c) => c.id === entry.debtorCustomer)?.name || entry.debtorCustomer

        // Check if this is a sale transaction (creating receivable)
        if (entry.debitAccount === "Accounts Receivable" && entry.creditAccount === "Sales Revenue") {
          // Calculate total amount including GST
          const baseAmount = entry.amount
          const gstAmount = entry.gstPercentage ? baseAmount * (entry.gstPercentage / 100) : 0
          const totalAmount = baseAmount + gstAmount

          // Create a new invoice for this sale
          const newInvoice: Invoice = {
            id: `INV-${new Date().getTime()}`,
            customer: customerName,
            date: entry.date,
            dueDate: entry.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            amount: totalAmount, // Total amount including GST
            balance: totalAmount, // Total amount including GST
            status: "Open",
            items: [
              {
                id: `ITEM-${new Date().getTime()}`,
                description: entry.description || "Sales Transaction",
                quantity: 1,
                unitPrice: baseAmount, // Base amount per unit
                amount: baseAmount, // Base amount
                taxRate: entry.gstPercentage || 0,
                taxAmount: gstAmount, // GST amount
              },
            ],
          }
          setInvoices((prev) => [newInvoice, ...prev])
        }

        // Check if this is a payment against receivable
        else if (
          (entry.debitAccount === "Cash" || entry.debitAccount === "Bank") &&
          entry.creditAccount === "Accounts Receivable"
        ) {
          // If specific invoice is selected, update that invoice
          if (entry.activeInvoice) {
            const invoice = invoices.find((inv) => inv.id === entry.activeInvoice)
            if (invoice) {
              const newBalance = Math.max(0, invoice.balance - entry.amount)
              const newStatus = newBalance <= 0 ? "Paid" : "Partially Paid"

              setInvoices((prev) =>
                prev.map((inv) =>
                  inv.id === entry.activeInvoice ? { ...inv, balance: newBalance, status: newStatus } : inv,
                ),
              )
            }
          } else {
            // Find an open invoice for this customer to apply payment
            const customerInvoice = invoices.find(
              (inv) => inv.customer === customerName && inv.status === "Open" && inv.balance >= entry.amount,
            )

            if (customerInvoice) {
              const newBalance = customerInvoice.balance - entry.amount
              const newStatus = newBalance <= 0 ? "Paid" : "Partially Paid"

              setInvoices((prev) =>
                prev.map((inv) =>
                  inv.id === customerInvoice.id ? { ...inv, balance: newBalance, status: newStatus } : inv,
                ),
              )
            }
          }
        }
        // NEW: Handle Sales Return (Credit Note) against an invoice
        // Only call if this journal entry was NOT generated by a CreditNote itself
        else if (!entry.isNoteRelated && isSalesReturnTransaction && entry.activeInvoice) {
          decreaseTotalReceivables(entry.amount, customerName, entry.activeInvoice)
        }
      }

      // Handle Supplier transactions (Accounts Payable)
      if (entry.partyType === "Supplier" && entry.creditorSupplier) {
        const supplierName = suppliers.find((s) => s.id === entry.creditorSupplier)?.name || entry.creditorSupplier

        // Check if this is a purchase transaction (creating payable)
        if (
          (entry.debitAccount === "Raw Materials Inventory" ||
            entry.debitAccount === "Finished Goods Inventory" ||
            entry.debitAccount === "Work-in-Progress") &&
          entry.creditAccount === "Accounts Payable"
        ) {
          // Calculate total amount including GST
          const baseAmount = entry.amount
          const gstAmount = entry.gstPercentage ? baseAmount * (entry.gstPercentage / 100) : 0
          const totalAmount = baseAmount + gstAmount

          // Create a new bill for this purchase
          const newBill: Bill = {
            id: `BILL-${new Date().getTime()}`,
            supplier: supplierName,
            date: entry.date,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            amount: totalAmount, // Total amount including GST
            balance: totalAmount, // Total amount including GST
            status: "Open",
            items: [
              {
                id: `ITEM-${new Date().getTime()}`,
                description: entry.description || "Purchase Transaction",
                quantity: 1,
                unitPrice: baseAmount, // Base amount per unit
                amount: baseAmount, // Base amount
                taxRate: entry.gstPercentage || 0,
                taxAmount: gstAmount, // GST amount
              },
            ],
          }
          setBills((prev) => [newBill, ...prev])
        }

        // Check if this is a payment against payable
        else if (
          entry.debitAccount === "Accounts Payable" &&
          (entry.creditAccount === "Cash" || entry.creditAccount === "Bank")
        ) {
          // If specific bill is selected, update that bill
          if (entry.activeBill) {
            const bill = bills.find((b) => b.id === entry.activeBill)
            if (bill) {
              const newBalance = Math.max(0, bill.balance - entry.amount)
              const newStatus = newBalance <= 0 ? "Paid" : "Partially Paid"

              setBills((prev) =>
                prev.map((b) => (b.id === entry.activeBill ? { ...b, balance: newBalance, status: newStatus } : b)),
              )
            }
          } else {
            // Find an open bill for this supplier to apply payment
            const supplierBill = bills.find(
              (bill) => bill.supplier === supplierName && bill.status === "Open" && bill.balance >= entry.amount,
            )

            if (supplierBill) {
              const newBalance = supplierBill.balance - entry.amount
              const newStatus = newBalance <= 0 ? "Paid" : "Partially Paid"

              setBills((prev) =>
                prev.map((b) => (b.id === supplierBill.id ? { ...b, balance: newBalance, status: newStatus } : b)),
              )
            }
          }
        }
        // NEW: Handle Purchase Return (Debit Note) against a bill
        // Only call if this journal entry was NOT generated by a DebitNote itself
        else if (!entry.isNoteRelated && isPurchaseReturnTransaction && entry.activeBill) {
          decreaseTotalPayables(entry.amount, supplierName, entry.activeBill)
        }
      }
    }

    toast({
      title: "Journal Entry Created",
      description: `Entry ${newEntry.id} has been created successfully. Trial Balance updated.`,
    })
  }

  const updateJournalEntry = (id: string, entry: Partial<JournalEntry>) => {
    // Find the original entry before updating it
    const originalEntry = journalEntries.find((item) => item.id === id)

    if (originalEntry) {
      // Update the journal entry in the state
      setJournalEntries(journalEntries.map((item) => (item.id === id ? { ...item, ...entry } : item)))

      // If the debit/credit accounts or amount has changed, update the trial balance
      if (entry.debitAccount !== undefined || entry.creditAccount !== undefined || entry.amount !== undefined) {
        // Get the complete updated entry
        const updatedEntry = { ...originalEntry, ...entry }

        // First, reverse the effect of the original entry (subtract from trial balance)
        // We do this by applying the opposite effect
        if (originalEntry.debitAccount && originalEntry.creditAccount) {
          reverseTrialBalanceEntry(originalEntry.debitAccount, originalEntry.creditAccount, originalEntry.amount)
        }

        // Then, add the new entry to the trial balance
        if (updatedEntry.debitAccount && updatedEntry.creditAccount && updatedEntry.amount !== undefined) {
          updateTrialBalance(updatedEntry.debitAccount, updatedEntry.creditAccount, updatedEntry.amount)
        }
      }

      // Handle Bank Account Balance Updates for edited entries
      const updatedEntry = { ...originalEntry, ...entry }
      if (
        originalEntry &&
        updatedEntry.bankAccount &&
        (updatedEntry.debitAccount === "Bank" || updatedEntry.creditAccount === "Bank")
      ) {
        setBankAccounts((prevAccounts) => {
          return prevAccounts.map((account) => {
            if (account.id === updatedEntry.bankAccount) {
              let newBalance = account.balance

              // First, reverse the original entry's effect on bank balance
              if (originalEntry.debitAccount === "Bank" && originalEntry.bankAccount === updatedEntry.bankAccount) {
                newBalance -= originalEntry.amount // Reverse the previous increase
              } else if (
                originalEntry.creditAccount === "Bank" &&
                originalEntry.bankAccount === updatedEntry.bankAccount
              ) {
                newBalance += originalEntry.amount // Reverse the previous decrease
              }

              // Then apply the updated entry's effect
              if (updatedEntry.debitAccount === "Bank") {
                newBalance += updatedEntry.amount // Money coming in
              } else if (updatedEntry.creditAccount === "Bank") {
                newBalance -= updatedEntry.amount // Money going out
              }

              return { ...account, balance: newBalance }
            }
            return account
          })
        })

        // Update corresponding transaction in Banking & Cash -> Transactions
        const transactionId = `TRX-JE-${id}`
        const selectedBankAccount = bankAccounts.find((account) => account.id === updatedEntry.bankAccount)

        if (selectedBankAccount) {
          const updatedTransaction: Partial<Transaction> = {
            date: updatedEntry.date,
            description: updatedEntry.description,
            account: selectedBankAccount.name,
            type: updatedEntry.debitAccount === "Bank" ? "Deposit" : "Withdrawal",
            amount: updatedEntry.amount,
            reference: updatedEntry.reference,
            status: updatedEntry.status === "Posted" ? "Cleared" : "Pending",
          }

          setTransactions((prev) =>
            prev.map((transaction) =>
              transaction.id === transactionId ? { ...transaction, ...updatedTransaction } : transaction,
            ),
          )
        }
      }

      // Handle Cash Account Balance Updates for edited entries
      if (originalEntry && (updatedEntry.debitAccount === "Cash" || updatedEntry.creditAccount === "Cash")) {
        const pettyCashAccount = bankAccounts.find((account) => account.type === "Cash")

        if (pettyCashAccount) {
          setBankAccounts((prevAccounts) => {
            return prevAccounts.map((account) => {
              if (account.id === pettyCashAccount.id) {
                let newBalance = account.balance

                // First, reverse the original entry's effect on cash balance
                if (originalEntry.debitAccount === "Cash") {
                  newBalance -= originalEntry.amount // Reverse the increase
                } else if (originalEntry.creditAccount === "Cash") {
                  newBalance += originalEntry.amount // Reverse the previous decrease
                }

                // Then apply the updated entry's effect
                if (updatedEntry.debitAccount === "Cash") {
                  newBalance += updatedEntry.amount // Money coming in
                } else if (updatedEntry.creditAccount === "Cash") {
                  newBalance -= updatedEntry.amount // Money going out
                }

                return { ...account, balance: newBalance }
              }
              return account
            })
          })

          // Update corresponding transaction in Banking & Cash -> Transactions
          const transactionId = `TRX-CASH-${id}`

          const updatedTransaction: Partial<Transaction> = {
            date: updatedEntry.date,
            description: updatedEntry.description,
            account: pettyCashAccount.name,
            type: updatedEntry.debitAccount === "Cash" ? "Deposit" : "Withdrawal",
            amount: updatedEntry.amount,
            reference: updatedEntry.reference,
            status: updatedEntry.status === "Posted" ? "Cleared" : "Pending",
          }

          setTransactions((prev) =>
            prev.map((transaction) =>
              transaction.id === transactionId ? { ...transaction, ...updatedTransaction } : transaction,
            ),
          )
        }
      }

      toast({
        title: "Journal Entry Updated",
        description: `Entry ${id} has been updated successfully. Trial Balance updated.`,
      })
    } else {
      toast({
        title: "Update Failed",
        description: `Could not find journal entry ${id}.`,
        variant: "destructive",
      })
    }
  }

  // Add this new helper function to reverse a trial balance entry
  const reverseTrialBalanceEntry = (debitAccount: string, creditAccount: string, amount: number) => {
    setTrialBalance((prevBalance) => {
      const newBalance = [...prevBalance]

      // Helper function to get account type
      const getAccountType = (accountName: string): "Asset" | "Liability" | "Equity" | "Revenue" | "Expense" => {
        return accountTypeMapping[accountName] || "Asset"
      }

      // Helper function to find account entry
      const findAccount = (accountName: string) => {
        return newBalance.find((entry) => entry.account === accountName)
      }

      // Find debit and credit accounts
      const debitEntry = findAccount(debitAccount)
      const creditEntry = findAccount(creditAccount)

      if (debitEntry && creditEntry) {
        const debitAccountType = debitEntry.accountType
        const creditAccountType = creditEntry.accountType

        // Reverse the effect on debit side
        if (debitAccountType === "Asset" || debitAccountType === "Expense") {
          // Assets and Expenses have normal debit balance - decrease debit side
          debitEntry.debit = Math.max(0, debitEntry.debit - amount)
        } else {
          // Liabilities, Equity, Revenue have normal credit balance - increase credit side when reversed
          debitEntry.credit += amount
        }

        // Reverse the effect on credit side
        if (creditAccountType === "Liability" || creditAccountType === "Equity" || creditAccountType === "Revenue") {
          // Liabilities, Equity, Revenue have normal credit balance - decrease credit side
          creditEntry.credit = Math.max(0, creditEntry.credit - amount)
        } else {
          // Assets and Expenses have normal debit balance - increase debit side when reversed
          creditEntry.debit += amount
        }
      }

      return newBalance
    })
  }

  const deleteJournalEntry = (id: string) => {
    // Handle Bank Account Balance Updates for deleted entries
    const entryToDelete = journalEntries.find((item) => item.id === id)
    if (
      entryToDelete &&
      entryToDelete.bankAccount &&
      (entryToDelete.debitAccount === "Bank" || entryToDelete.creditAccount === "Bank")
    ) {
      setBankAccounts((prevAccounts) => {
        return prevAccounts.map((account) => {
          if (account.id === entryToDelete.bankAccount) {
            let newBalance = account.balance

            // Reverse the entry's effect on bank balance
            if (entryToDelete.debitAccount === "Bank") {
              newBalance -= entryToDelete.amount // Reverse the increase
            } else if (entryToDelete.creditAccount === "Bank") {
              newBalance += entryToDelete.amount // Reverse the decrease
            }

            return { ...account, balance: newBalance }
          }
          return account
        })
      })

      // Delete corresponding transaction in Banking & Cash -> Transactions
      const transactionId = `TRX-JE-${id}`
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== transactionId))
    }

    // Handle Cash Account Balance Updates for deleted entries
    if (entryToDelete && (entryToDelete.debitAccount === "Cash" || entryToDelete.creditAccount === "Cash")) {
      const pettyCashAccount = bankAccounts.find((account) => account.type === "Cash")

      if (pettyCashAccount) {
        setBankAccounts((prevAccounts) => {
          return prevAccounts.map((account) => {
            if (account.id === pettyCashAccount.id) {
              let newBalance = account.balance

              // Reverse the entry's effect on cash balance
              if (entryToDelete.debitAccount === "Cash") {
                newBalance -= entryToDelete.amount // Reverse the increase
              } else if (entryToDelete.creditAccount === "Cash") {
                newBalance += entryToDelete.amount // Reverse the decrease
              }

              return { ...account, balance: newBalance }
            }
            return account
          })
        })

        // Delete corresponding transaction in Banking & Cash -> Transactions
        const transactionId = `TRX-CASH-${id}`
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== transactionId))
      }
    }
    setJournalEntries(journalEntries.filter((item) => item.id !== id))
    toast({
      title: "Journal Entry Deleted",
      description: `Entry ${id} has been deleted successfully.`,
    })
  }

  // Account CRUD operations
  const addAccount = (account: Omit<Account, "id">) => {
    const newAccount = { ...account, id: generateId("ACC") }
    setAccounts([...accounts, newAccount])
    toast({
      title: "Account Created",
      description: `Account ${newAccount.name} has been created successfully.`,
    })
  }

  const updateAccount = (id: string, account: Partial<Account>) => {
    setAccounts(accounts.map((item) => (item.id === id ? { ...item, ...account } : item)))
    toast({
      title: "Account Updated",
      description: `Account ${account.name || id} has been updated successfully.`,
    })
  }

  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter((item) => item.id !== id))
    toast({
      title: "Account Deleted",
      description: `Account has been deleted successfully.`,
    })
  }

  // Invoice CRUD operations
  const addInvoice = (invoice: Omit<Invoice, "id">) => {
    const newInvoice = { ...invoice, id: generateId("INV") }
    setInvoices([newInvoice, ...invoices])
    toast({
      title: "Invoice Created",
      description: `Invoice for ${newInvoice.customer} has been created successfully.`,
    })
  }

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    setInvoices(invoices.map((item) => (item.id === id ? { ...item, ...invoice } : item)))
    toast({
      title: "Invoice Updated",
      description: `Invoice ${id} has been updated successfully.`,
    })
  }

  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter((item) => item.id !== id))
    toast({
      title: "Invoice Deleted",
      description: `Invoice ${id} has been deleted successfully.`,
    })
  }

  // Bill CRUD operations
  const addBill = (bill: Omit<Bill, "id">) => {
    const newBill = { ...bill, id: generateId("BILL") }
    setBills([newBill, ...bills])
    toast({
      title: "Bill Created",
      description: `Bill for ${newBill.supplier} has been created successfully.`,
    })
  }

  const updateBill = (id: string, bill: Partial<Bill>) => {
    setBills(bills.map((item) => (item.id === id ? { ...item, ...bill } : item)))
    toast({
      title: "Bill Updated",
      description: `Bill ${id} has been updated successfully.`,
    })
  }

  const deleteBill = (id: string) => {
    setBills(bills.filter((item) => item.id !== id))
    toast({
      title: "Bill Deleted",
      description: `Bill ${id} has been deleted successfully.`,
    })
  }

  // Bank Account CRUD operations
  const addBankAccount = (account: Omit<BankAccount, "id">) => {
    const newAccount = { ...account, id: generateId("BACC") }
    setBankAccounts([...bankAccounts, newAccount])
    toast({
      title: "Bank Account Created",
      description: `Account ${newAccount.name} has been created successfully.`,
    })
  }

  const updateBankAccount = (id: string, account: Partial<BankAccount>) => {
    setBankAccounts(bankAccounts.map((item) => (item.id === id ? { ...item, ...account } : item)))
    toast({
      title: "Bank Account Updated",
      description: `Account ${account.name || id} has been updated successfully.`,
    })
  }

  const deleteBankAccount = (id: string) => {
    setBankAccounts(bankAccounts.filter((item) => item.id !== id))
    toast({
      title: "Bank Account Deleted",
      description: `Account has been deleted successfully.`,
    })
  }

  // Transaction CRUD operations
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = { ...transaction, id: generateId("TRX") }
    setTransactions([newTransaction, ...transactions])
    toast({
      title: "Transaction Created",
      description: `Transaction has been recorded successfully.`,
    })
  }

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setTransactions(transactions.map((item) => (item.id === id ? { ...item, ...transaction } : item)))
    toast({
      title: "Transaction Updated",
      description: `Transaction ${id} has been updated successfully.`,
    })
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((item) => item.id !== id))
    toast({
      title: "Transaction Deleted",
      description: `Transaction ${id} has been deleted successfully.`,
    })
  }

  // Asset CRUD operations
  const addAsset = (asset: Omit<Asset, "id">) => {
    const newAsset = { ...asset, id: generateId("FA") }
    setAssets([newAsset, ...assets])
    toast({
      title: "Asset Created",
      description: `Asset ${newAsset.name} has been created successfully.`,
    })
  }

  const updateAsset = (id: string, asset: Partial<Asset>) => {
    setAssets(assets.map((item) => (item.id === id ? { ...item, ...asset } : item)))
    toast({
      title: "Asset Updated",
      description: `Asset ${asset.name || id} has been updated successfully.`,
    })
  }

  const deleteAsset = (id: string) => {
    setAssets(assets.filter((item) => item.id !== id))
    toast({
      title: "Asset Deleted",
      description: `Asset has been deleted successfully.`,
    })
  }

  // Cost Center CRUD operations
  const addCostCenter = (center: Omit<CostCenter, "id">) => {
    const newCenter = { ...center, id: generateId("CC") }
    setCostCenters([...costCenters, newCenter])
    toast({
      title: "Cost Center Created",
      description: `Cost Center ${newCenter.name} has been created successfully.`,
    })
  }

  const updateCostCenter = (id: string, center: Partial<CostCenter>) => {
    setCostCenters(costCenters.map((item) => (item.id === id ? { ...item, ...center } : item)))
    toast({
      title: "Cost Center Updated",
      description: `Cost Center ${center.name || id} has been updated successfully.`,
    })
  }

  const deleteCostCenter = (id: string) => {
    setCostCenters(costCenters.filter((item) => item.id !== id))
    toast({
      title: "Cost Center Deleted",
      description: `Cost Center has been deleted successfully.`,
    })
  }

  // Tax Filing CRUD operations
  const addTaxFiling = (filing: Omit<TaxFiling, "id">) => {
    const newFiling = { ...filing, id: generateId("TAX") }
    setTaxFilings([...taxFilings, newFiling])
    toast({
      title: "Tax Filing Created",
      description: `Tax Filing for ${newFiling.period} has been created successfully.`,
    })
  }

  const updateTaxFiling = (id: string, filing: Partial<TaxFiling>) => {
    setTaxFilings(taxFilings.map((item) => (item.id === id ? { ...item, ...filing } : item)))
    toast({
      title: "Tax Filing Updated",
      description: `Tax Filing ${id} has been updated successfully.`,
    })
  }

  const deleteTaxFiling = (id: string) => {
    setTaxFilings(taxFilings.filter((item) => item.id !== id))
    toast({
      title: "Tax Filing Deleted",
      description: `Tax Filing ${id} has been deleted successfully.`,
    })
  }

  // Function to update total receivables
  const updateTotalReceivables = (amount: number, customer = "Journal Entry Customer") => {
    // Create a new invoice with the amount as balance
    const newInvoice = {
      id: `INV-${new Date().getTime()}`,
      customer: customer,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: amount,
      balance: amount,
      status: "Open" as const,
      items: [
        {
          id: `ITEM-${new Date().getTime()}`,
          description: "Journal Entry Item",
          quantity: 1,
          unitPrice: amount,
          amount: amount,
          taxRate: 0,
          taxAmount: 0,
        },
      ],
    }

    setInvoices([newInvoice, ...invoices])

    toast({
      title: "Total Receivables Updated",
      description: `₹${amount.toLocaleString("en-IN")} has been added to Total Receivables.`,
    })
  }

  // Function to decrease total receivables
  const decreaseTotalReceivables = (amount: number, customer = "Journal Entry Payment", invoiceId?: string) => {
    // If a specific invoice ID is provided, update that invoice
    if (invoiceId) {
      const invoice = invoices.find((inv) => inv.id === invoiceId)

      if (invoice) {
        const newBalance = Math.max(0, invoice.balance - amount)
        const newStatus = newBalance <= 0 ? "Paid" : "Partially Paid"

        updateInvoice(invoiceId, {
          balance: newBalance,
          status: newStatus,
        })

        return
      }
    }

    // If no specific invoice or invoice not found, find an open invoice to update
    const openInvoice = invoices.find(
      (invoice) => invoice.status === "Open" && invoice.balance >= amount && invoice.customer === customer,
    )

    if (openInvoice) {
      // Update the existing invoice
      const newBalance = openInvoice.balance - amount
      const newStatus = newBalance <= 0 ? "Paid" : "Partially Paid"

      updateInvoice(openInvoice.id, {
        balance: newBalance,
        status: newStatus,
      })
    } else {
      // Create a payment record
      const paymentRecord = {
        id: `PMT-${new Date().getTime()}`,
        customer: customer,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        amount: amount,
        balance: 0,
        status: "Paid" as const,
        items: [
          {
            id: `ITEM-${new Date().getTime()}`,
            description: "Payment against receivables",
            quantity: 1,
            unitPrice: amount,
            amount: amount,
            taxRate: 0,
            taxAmount: 0,
          },
        ],
      }

      setInvoices([paymentRecord, ...invoices])
    }

    toast({
      title: "Total Receivables Updated",
      description: `₹${amount.toLocaleString("en-IN")} has been deducted from Total Receivables.`,
    })
  }

  // Function to update total payables
  const updateTotalPayables = (amount: number, supplier = "Journal Entry Supplier") => {
    // Create a new bill with the amount as balance
    const newBill = {
      id: `BILL-${new Date().getTime()}`,
      supplier: supplier,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: amount,
      balance: amount,
      status: "Open" as const,
      items: [
        {
          id: `ITEM-${new Date().getTime()}`,
          description: "Journal Entry Item",
          quantity: 1,
          unitPrice: amount,
          amount: amount,
          taxRate: 0,
          taxAmount: 0,
        },
      ],
    }

    setBills([newBill, ...bills])

    toast({
      title: "Total Payables Updated",
      description: `₹${amount.toLocaleString("en-IN")} has been added to Total Payables.`,
    })
  }

  // Function to decrease total payables
  const decreaseTotalPayables = (amount: number, supplier = "Journal Entry Payment", billId?: string) => {
    // If a specific bill ID is provided, update that bill
    if (billId) {
      const bill = bills.find((b) => b.id === billId)

      if (bill) {
        const newBalance = Math.max(0, bill.balance - amount)
        const newStatus = newBalance <= 0 ? "Paid" : "Partially Paid"

        updateBill(billId, {
          balance: newBalance,
          status: newStatus,
        })

        return
      }
    }

    // If no specific bill or bill not found, find an open bill to update
    const openBill = bills.find(
      (bill) => bill.status === "Open" && bill.balance >= amount && bill.supplier === supplier,
    )

    if (openBill) {
      // Update the existing bill
      const newBalance = openBill.balance - amount
      const newStatus = newBalance <= 0 ? "Paid" : "Partially Paid"

      updateBill(openBill.id, {
        balance: newBalance,
        status: newStatus,
      })
    } else {
      // Create a payment record
      const paymentRecord = {
        id: `PMT-${new Date().getTime()}`,
        supplier: supplier,
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        amount: amount,
        balance: 0,
        status: "Paid" as const,
        items: [
          {
            id: `ITEM-${new Date().getTime()}`,
            description: "Payment against payables",
            quantity: 1,
            unitPrice: amount,
            amount: amount,
            taxRate: 0,
            taxAmount: 0,
          },
        ],
      }

      setBills([paymentRecord, ...bills])
    }

    toast({
      title: "Total Payables Updated",
      description: `₹${amount.toLocaleString("en-IN")} has been deducted from Total Payables.`,
    })
  }

  const addDebitNote = (note: Omit<DebitNote, "id">) => {
    const newNote = { ...note, id: generateId("DN") }
    setDebitNotes((prev) => [newNote, ...prev])

    // Update original bill balance directly using totalAmount
    setBills((prevBills) =>
      prevBills.map((bill) =>
        bill.id === newNote.billId ? { ...bill, balance: Math.max(0, bill.balance - newNote.totalAmount) } : bill,
      ),
    )

    // Create Journal Entry for Debit Note (Purchase Return)
    // Debit: Accounts Payable (or Cash/Bank if refund received)
    // Credit: Raw Materials Inventory Returned (or relevant asset account)
    // Credit: GST Input (reversing ITC)
    const debitAccount = newNote.totalAmount > 0 ? "Accounts Payable" : "Bank" // Assuming payment if balance is 0, or Bank if paid from bank
    const creditAccount = "Raw Materials Inventory Returned" // Or a more general "Purchase Returns"

    // Journal entry for the base amount
    addJournalEntry({
      date: newNote.date,
      description: `Debit Note: ${newNote.reason} for Bill ${newNote.billId}`,
      debitAccount: debitAccount,
      creditAccount: creditAccount,
      amount: newNote.baseAmount,
      reference: newNote.id,
      status: "Posted",
      partyType: "Supplier",
      creditorSupplier: suppliersList.find((s) => s.name === newNote.supplier)?.id || newNote.supplier,
      activeBill: newNote.billId,
      transactionType: newNote.transactionType,
      gstPercentage: newNote.gstAmount > 0 ? (newNote.gstAmount / newNote.baseAmount) * 100 : 0,
      isNoteRelated: true, // Mark this journal entry as related to a note
    })

    // Journal entry for reversing GST Input (if applicable)
    if (newNote.gstAmount > 0) {
      if (newNote.transactionType === "IGST") {
        addJournalEntry({
          date: newNote.date,
          description: `Debit Note GST Reversal (IGST) for Bill ${newNote.billId}`,
          debitAccount: "GST Payable", // Or a temporary clearing account if needed
          creditAccount: "IGST Input",
          amount: newNote.gstAmount,
          reference: newNote.id,
          status: "Posted",
          partyType: "Supplier",
          creditorSupplier: suppliersList.find((s) => s.name === newNote.supplier)?.id || newNote.supplier,
          activeBill: newNote.billId,
          transactionType: newNote.transactionType,
          gstPercentage: newNote.gstAmount > 0 ? (newNote.gstAmount / newNote.baseAmount) * 100 : 0,
          isNoteRelated: true, // Mark this journal entry as related to a note
        })
      } else {
        addJournalEntry({
          date: newNote.date,
          description: `Debit Note GST Reversal (CGST) for Bill ${newNote.billId}`,
          debitAccount: "GST Payable",
          creditAccount: "CGST Input",
          amount: newNote.gstAmount / 2,
          reference: newNote.id,
          status: "Posted",
          partyType: "Supplier",
          creditorSupplier: suppliersList.find((s) => s.name === newNote.supplier)?.id || newNote.supplier,
          activeBill: newNote.billId,
          transactionType: newNote.transactionType,
          gstPercentage: newNote.gstAmount > 0 ? (newNote.gstAmount / newNote.baseAmount) * 100 : 0,
          isNoteRelated: true, // Mark this journal entry as related to a note
        })
        addJournalEntry({
          date: newNote.date,
          description: `Debit Note GST Reversal (SGST) for Bill ${newNote.billId}`,
          debitAccount: "GST Payable",
          creditAccount: "SGST Input",
          amount: newNote.gstAmount / 2,
          reference: newNote.id,
          status: "Posted",
          partyType: "Supplier",
          creditorSupplier: suppliersList.find((s) => s.name === newNote.supplier)?.id || newNote.supplier,
          activeBill: newNote.billId,
          transactionType: newNote.transactionType,
          gstPercentage: newNote.gstAmount > 0 ? (newNote.gstAmount / newNote.baseAmount) * 100 : 0,
          isNoteRelated: true, // Mark this journal entry as related to a note
        })
      }
    }

    toast({ title: "Debit Note Created", description: `Debit Note ${newNote.id} created successfully.` })
  }

  const addCreditNote = (note: Omit<CreditNote, "id">) => {
    const newNote = { ...note, id: generateId("CN") }
    setCreditNotes((prev) => [newNote, ...prev])

    // Update original invoice balance directly using totalAmount
    setInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === newNote.invoiceId
          ? { ...invoice, balance: Math.max(0, invoice.balance - newNote.totalAmount) }
          : invoice,
      ),
    )

    // Create Journal Entry for Credit Note (Sales Return)
    // Debit: Sales Revenue Returned (or relevant revenue account)
    // Debit: GST Output (reversing liability)
    // Credit: Accounts Receivable (or Cash/Bank if refund given)
    const debitAccount = "Sales Revenue Returned" // Or a more general "Sales Returns"
    const creditAccount = newNote.totalAmount > 0 ? "Accounts Receivable" : "Bank" // Assuming refund if balance is 0, or Bank if refunded from bank

    // Journal entry for the base amount
    addJournalEntry({
      date: newNote.date,
      description: `Credit Note: ${newNote.reason} for Invoice ${newNote.invoiceId}`,
      debitAccount: debitAccount,
      creditAccount: creditAccount,
      amount: newNote.baseAmount,
      reference: newNote.id,
      status: "Posted",
      partyType: "Customer",
      debtorCustomer: customersList.find((c) => c.name === newNote.customer)?.id || newNote.customer,
      activeInvoice: newNote.invoiceId,
      transactionType: newNote.transactionType,
      gstPercentage: newNote.gstAmount > 0 ? (newNote.gstAmount / newNote.baseAmount) * 100 : 0,
      isNoteRelated: true, // Mark this journal entry as related to a note
    })

    // Journal entry for reversing GST Output (if applicable)
    if (newNote.gstAmount > 0) {
      if (newNote.transactionType === "IGST") {
        addJournalEntry({
          date: newNote.date,
          description: `Credit Note GST Reversal (IGST) for Invoice ${newNote.invoiceId}`,
          debitAccount: "IGST Output",
          creditAccount: "GST Payable", // Or a temporary clearing account if needed
          amount: newNote.gstAmount,
          reference: newNote.id,
          status: "Posted",
          partyType: "Customer",
          debtorCustomer: customersList.find((c) => c.name === newNote.customer)?.id || newNote.customer,
          activeInvoice: newNote.invoiceId,
          transactionType: newNote.transactionType,
          gstPercentage: newNote.gstAmount > 0 ? (newNote.gstAmount / newNote.baseAmount) * 100 : 0,
          isNoteRelated: true, // Mark this journal entry as related to a note
        })
      } else {
        addJournalEntry({
          date: newNote.date,
          description: `Credit Note GST Reversal (CGST) for Invoice ${newNote.invoiceId}`,
          debitAccount: "CGST Output",
          creditAccount: "GST Payable",
          amount: newNote.gstAmount / 2,
          reference: newNote.id,
          status: "Posted",
          partyType: "Customer",
          debtorCustomer: customersList.find((c) => c.name === newNote.customer)?.id || newNote.customer,
          activeInvoice: newNote.invoiceId,
          transactionType: newNote.transactionType,
          gstPercentage: newNote.gstAmount > 0 ? (newNote.gstAmount / newNote.baseAmount) * 100 : 0,
          isNoteRelated: true, // Mark this journal entry as related to a note
        })
        addJournalEntry({
          date: newNote.date,
          description: `Credit Note GST Reversal (SGST) for Invoice ${newNote.invoiceId}`,
          debitAccount: "SGST Output",
          creditAccount: "GST Payable",
          amount: newNote.gstAmount / 2,
          reference: newNote.id,
          status: "Posted",
          partyType: "Customer",
          debtorCustomer: customersList.find((c) => c.name === newNote.customer)?.id || newNote.customer,
          activeInvoice: newNote.invoiceId,
          transactionType: newNote.transactionType,
          gstPercentage: newNote.gstAmount > 0 ? (newNote.gstAmount / newNote.baseAmount) * 100 : 0,
          isNoteRelated: true, // Mark this journal entry as related to a note
        })
      }
    }

    toast({ title: "Credit Note Created", description: `Credit Note ${newNote.id} created successfully.` })
  }

  return (
    <FinanceContext.Provider
      value={{
        journalEntries,
        accounts,
        invoices,
        bills,
        bankAccounts,
        transactions,
        assets,
        costCenters,
        taxFilings,
        trialBalance,
        debitNotes,
        creditNotes,
        customers: customersList,
        suppliers: suppliersList,

        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,

        addAccount,
        updateAccount,
        deleteAccount,

        addInvoice,
        updateInvoice,
        deleteInvoice,

        addBill,
        updateBill,
        deleteBill,

        addBankAccount,
        updateBankAccount,
        deleteBankAccount,

        addTransaction,
        updateTransaction,
        deleteTransaction,

        addAsset,
        updateAsset,
        deleteAsset,

        addCostCenter,
        updateCostCenter,
        deleteCostCenter,

        addTaxFiling,
        updateTaxFiling,
        deleteTaxFiling,

        addDebitNote,
        addCreditNote,

        updateTotalReceivables,
        decreaseTotalReceivables,
        updateTotalPayables,
        decreaseTotalPayables,
        updateTrialBalance,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

// Custom hook to use the finance context
export const useFinance = () => useContext(FinanceContext)

export type { TrialBalanceEntry }
