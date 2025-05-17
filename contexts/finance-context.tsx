"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"

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

  // CRUD operations
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

  updateTotalReceivables: (amount: number, customer?: string) => void
  decreaseTotalReceivables: (amount: number, customer?: string, invoiceId?: string) => void

  updateTotalPayables: (amount: number, supplier?: string) => void
  decreaseTotalPayables: (amount: number, supplier?: string, billId?: string) => void
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
    supplier: "RawMaterials Ltd",
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
    supplier: "Equipment Suppliers",
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
    supplier: "Office Supplies Co",
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

  updateTotalReceivables: () => {},
  decreaseTotalReceivables: () => {},
  updateTotalPayables: () => {},
  decreaseTotalPayables: () => {},
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

  // Journal Entry CRUD operations
  const addJournalEntry = (entry: Omit<JournalEntry, "id">) => {
    const newEntry = { ...entry, id: generateId("JE") }
    setJournalEntries([newEntry, ...journalEntries])
    toast({
      title: "Journal Entry Created",
      description: `Entry ${newEntry.id} has been created successfully.`,
    })
  }

  const updateJournalEntry = (id: string, entry: Partial<JournalEntry>) => {
    setJournalEntries(journalEntries.map((item) => (item.id === id ? { ...item, ...entry } : item)))
    toast({
      title: "Journal Entry Updated",
      description: `Entry ${id} has been updated successfully.`,
    })
  }

  const deleteJournalEntry = (id: string) => {
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

        updateTotalReceivables,
        decreaseTotalReceivables,
        updateTotalPayables,
        decreaseTotalPayables,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

// Custom hook to use the finance context
export const useFinance = () => useContext(FinanceContext)
