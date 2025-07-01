"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useFinance } from "@/contexts/finance-context"
import { useEffect, useMemo, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { getDisplayAccountName } from "@/contexts/finance-context" // Add this line
// Remove the Eye, EyeOff import
import { Switch } from "@/components/ui/switch"
import { Journal, useJournalContext } from "./context/journal-context"
import { useOrders } from "@/contexts/order-context"
import { useProcurement } from "@/app/procurement/procurement-context"
import { useBankAccountContext } from "./context/bank-account-context"

// Define the form schema
const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  debitAccount: z.string().min(1, { message: "Debit account is required" }),
  creditAccount: z.string().min(1, { message: "Credit account is required" }),
  partyType: z.enum(["Customer", "Supplier"]).optional(),
  debtorCustomer: z.string().optional(),
  creditorSupplier: z.string().optional(),
  activeInvoice: z.string().optional(),
  activeBill: z.string().optional(),
  transactionType: z.enum(["CGST-SGST", "IGST"]).default("CGST-SGST"),
  gstPercentage: z.coerce.number().min(0).max(100).optional(),
  baseAmount: z.coerce.number().positive({ message: "Base amount must be positive" }),
  gstAmount: z.coerce.number().min(0).optional(),
  totalAmount: z.coerce.number().positive({ message: "Total amount must be positive" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  reference: z.string().optional(),
  referenceNumber: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["Draft", "Posted", "Pending", "Rejected"]),
  bankAccount: z.string().optional(), // Add this new field
  additionalReference: z.string().optional()
})


type JournalEntryFormValues = z.infer<typeof formSchema>

interface JournalEntryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: JournalEntryFormValues
  entryId?: string
}

export function JournalEntryForm({ open, onOpenChange, initialValues, entryId }: JournalEntryFormProps) {
  const {
    accounts,
    invoices,
    bills,
    updateTotalReceivables,
    decreaseTotalReceivables,
    updateTotalPayables,
    decreaseTotalPayables,
  } = useFinance()
  const isEditing = !!entryId
  const { create: addJournalEntry, data, update: updateJournalEntry } = useJournalContext();
  const { data: bnkAccounts } = useBankAccountContext()

  const editingJournal = useMemo(() => {
    if (isEditing) {
      return data.find(item => item.id + '' === entryId)
    } else {
      return {} as Journal
    }
  }, [entryId, data])

  const bankAccounts = useMemo(() => {
    return bnkAccounts.map(item => {
      return ({
        id: item.id,
        name: item.name,
        bank: item.bank,
        accountNumber: item.accountNumber,
        balance: item.balance,
        type: item.type,
      })
    })
  }, [bnkAccounts])

  const [selectedInvoiceBalance, setSelectedInvoiceBalance] = useState<number | null>(null)
  const [selectedBillBalance, setSelectedBillBalance] = useState<number | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [showTaxesSection, setShowTaxesSection] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { clientMapper } = useOrders()
  const { suppliers: supps } = useProcurement();

  const suppliers = useMemo(() => {
    return supps.map(item => {
      return ({ id: item.supplierId, name: item.name })
    })
  }, [supps])

  // Sample customer data
  const customers = useMemo(() => {
    return Object.values(clientMapper).map(item => {
      return ({
        id: item.clientId,
        name: item.name
      })
    })
  }, [clientMapper])


  const [gstBreakdown, setGstBreakdown] = useState<{
    baseAmount: number
    cgstAmount: number
    sgstAmount: number
    igstAmount: number
    totalAmount: number
  } | null>(null)

  // Default values for the form
  const defaultValues: Partial<JournalEntryFormValues> = {
    date: new Date().toISOString().split("T")[0],
    description: "",
    debitAccount: "",
    creditAccount: "",
    partyType: undefined,
    debtorCustomer: "",
    creditorSupplier: "",
    activeInvoice: "",
    activeBill: "",
    transactionType: "CGST-SGST",
    gstPercentage: 0,
    baseAmount: 0,
    gstAmount: 0,
    totalAmount: 0,
    amount: 0,
    reference: "",
    referenceNumber: "",
    dueDate: "",
    status: "Draft",
    bankAccount: "", // Add this
  }

  // Initialize the form
  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Reset form with initialValues when they change or when the dialog opens
  useEffect(() => {
    if (open) {
      if (initialValues && editingJournal) {
        // Reset the form with initialValues
        form.reset({
          date: editingJournal.date.toLocaleString(),
          description: editingJournal.description,
          debitAccount: editingJournal.debitAccount,
          creditAccount: editingJournal.creditAccount,
          partyType: editingJournal.partyType || '' as any,
          debtorCustomer: editingJournal.debtorCustomer || "",
          creditorSupplier: editingJournal.creditorSupplier || "",
          activeInvoice: editingJournal.activeInvoice || "",
          activeBill: editingJournal.activeBill || "",
          transactionType: editingJournal?.transcationType || "CGST-SGST" as any,
          gstPercentage: editingJournal.gst || 0,
          baseAmount: editingJournal.baseAmount || 0,
          gstAmount: editingJournal.gstAmount || 0,
          totalAmount: editingJournal.totalAmount || 0,
          amount: editingJournal.amount,
          additionalReference: editingJournal?.additionalReference || "",
          referenceNumber: editingJournal.referenceNumber || "",
          dueDate: editingJournal.dueDate || "" as any,
          status: editingJournal.status as any,
          bankAccount: editingJournal.bankAccount || "", // Add this
        })
        console.log("Form reset with initialValues:", initialValues)
      } else {
        // Reset to default values if not editing
        form.reset(defaultValues)
        console.log("Form reset with defaultValues")
      }
      // Reset selected invoice/bill balance and error
      setSelectedInvoiceBalance(null)
      setSelectedBillBalance(null)
      setAmountError(null)
    }
  }, [form, initialValues, open, editingJournal])

  // Update selected invoice balance when activeInvoice changes
  useEffect(() => {
    const activeInvoiceId = form.watch("activeInvoice")
    if (activeInvoiceId) {
      const invoice = invoices.find((inv) => inv.id === activeInvoiceId)
      if (invoice) {
        setSelectedInvoiceBalance(invoice.balance)
      } else {
        setSelectedInvoiceBalance(null)
      }
    } else {
      setSelectedInvoiceBalance(null)
    }
  }, [form.watch("activeInvoice"), invoices])

  // Update selected bill balance when activeBill changes
  useEffect(() => {
    const activeBillId = form.watch("activeBill")
    if (activeBillId) {
      const bill = bills.find((b) => b.id === activeBillId)
      if (bill) {
        setSelectedBillBalance(bill.balance)
      } else {
        setSelectedBillBalance(null)
      }
    } else {
      setSelectedBillBalance(null)
    }
  }, [form.watch("activeBill"), bills])

  // Validate amount against selected invoice/bill balance
  useEffect(() => {
    const amount = form.watch("amount")
    const debitAccount = form.watch("debitAccount")
    const creditAccount = form.watch("creditAccount")
    const activeInvoice = form.watch("activeInvoice")
    const activeBill = form.watch("activeBill")

    if (
      (debitAccount === "Cash" || debitAccount === "Bank") &&
      creditAccount === "Accounts Receivable" &&
      activeInvoice &&
      selectedInvoiceBalance !== null &&
      amount > selectedInvoiceBalance
    ) {
      setAmountError(`Amount cannot exceed invoice balance of ₹${selectedInvoiceBalance.toLocaleString("en-IN")}`)
    } else if (
      debitAccount === "Accounts Payable" &&
      (creditAccount === "Cash" || creditAccount === "Bank") &&
      activeBill &&
      selectedBillBalance !== null &&
      amount > selectedBillBalance
    ) {
      setAmountError(`Amount cannot exceed bill balance of ₹${selectedBillBalance.toLocaleString("en-IN")}`)
    } else {
      setAmountError(null)
    }
  }, [
    form.watch("amount"),
    form.watch("activeInvoice"),
    form.watch("activeBill"),
    selectedInvoiceBalance,
    selectedBillBalance,
    form.watch("debitAccount"),
    form.watch("creditAccount"),
  ])

  // Filter out the accounts we want to remove
  const filteredAccounts = accounts.filter(
    (account) =>
      account.name !== "Revenue" &&
      account.name !== "Sales Revenue" &&
      account.name !== "Service Revenue" &&
      account.name !== "Assets" &&
      account.name !== "Current Assets" &&
      account.name !== "Liabilities" &&
      account.name !== "Current Liabilities" &&
      account.name !== "Equity" &&
      account.name !== "Operating Expenses",
  )

  // Combine all account options and sort them alphabetically
  const allAccountOptions = [
    "Accounts Payable",
    "Accounts Receivable",
    "Accrued Expenses",
    "Advance from Customer",
    "Advance to Supplier",
    "Bank",
    "Bank Overdrafts",
    "Cash",
    "CGST Input",
    "CGST Output",
    "Finished Goods Inventory",
    "GST Payable",
    "IGST Input",
    "IGST Output",
    "Other Current Liabilities",
    "Other Receivables",
    "Prepaid Expenses",
    "Raw Materials Inventory",
    "Raw Materials Inventory Returned",
    "Sales Revenue",
    "Sales Revenue Returned",
    "SGST Input",
    "SGST Output",
    "Short Term Investment",
    "Short Term Loans",
    "Unearned Revenue",
    "Wages",
    "Work-in-Progress",
    "Fuel Expense",
    "Food Expense",
    "Electricity Expense",
    "Machinery Expense",
    "Telephone Expense",
    "Factory Maintenance",
    "Water Expense",
    ...filteredAccounts.map((account) => account.name),
  ]
    .sort()
    .map((name) => ({ value: name, label: getDisplayAccountName(name) }))

  // Calculate GST breakdown when GST percentage or amount changes
  useEffect(() => {
    const gstPercentage = Number(form.watch("gstPercentage")) || 0
    const amount = Number(form.watch("amount")) || 0
    const transactionType = form.watch("transactionType")
    const debitAccount = form.watch("debitAccount")
    const creditAccount = form.watch("creditAccount")

    // Check if this is a GST applicable transaction (sales, purchase, or sales return)
    const isGstApplicable =
      gstPercentage > 0 &&
      (((debitAccount === "Cash" || debitAccount === "Bank" || debitAccount === "Accounts Receivable") &&
        creditAccount === "Sales Revenue") ||
        ((debitAccount === "Raw Materials Inventory" ||
          debitAccount === "Finished Goods Inventory" ||
          debitAccount === "Work-in-Progress") &&
          (creditAccount === "Cash" || creditAccount === "Bank" || creditAccount === "Accounts Payable")) ||
        // Add Sales Revenue Return logic
        (debitAccount === "Sales Revenue Returned" &&
          (creditAccount === "Cash" || creditAccount === "Bank" || creditAccount === "Accounts Receivable")) ||
        // Add Raw Materials Inventory Return logic
        (creditAccount === "Raw Materials Inventory Returned" &&
          (debitAccount === "Cash" || debitAccount === "Bank" || debitAccount === "Accounts Payable")))

    if (isGstApplicable && amount > 0) {
      // Correct formula: Total Amount = Amount + (Amount * GST%)
      const baseAmount = amount
      const gstAmount = amount * (gstPercentage / 100)
      const totalAmount = amount + gstAmount

      if (transactionType === "CGST-SGST") {
        // CGST + SGST
        const cgstAmount = gstAmount / 2
        const sgstAmount = gstAmount / 2
        setGstBreakdown({
          baseAmount,
          cgstAmount,
          sgstAmount,
          igstAmount: 0,
          totalAmount,
        })
      } else {
        // IGST
        setGstBreakdown({
          baseAmount,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: gstAmount,
          totalAmount,
        })
      }
    } else {
      setGstBreakdown(null)
    }
  }, [
    form.watch("gstPercentage"),
    form.watch("amount"),
    form.watch("transactionType"),
    form.watch("debitAccount"),
    form.watch("creditAccount"),
  ])

  // Handle form submission
  const onSubmit = async (values: JournalEntryFormValues) => {
    try {
      console.log("Form submitted with values:", values)

      const payload = {
        date: values.date,
        description: values.description,
        debitAccount: values.debitAccount,
        creditAccount: values.creditAccount,
        amount: values.amount,
        status: values.status || "Draft",
        transcationType: values.transactionType,
        gst: values.gstPercentage,
        partyType: values.partyType,
        debtorCustomer: values.debtorCustomer,
        creditorSupplier: values.creditorSupplier,
        additionalReference: values.additionalReference,
        referenceNumber: values.referenceNumber,
        taxInformation: showTaxesSection,
        id: entryId,
        activeInvoice: values.activeInvoice,
        activeBill: values.activeBill,
        baseAmount: values.baseAmount,
        bankAccount: values.bankAccount,
        totalAmount: values.totalAmount,
        dueDate: values.dueDate ? new Date(values.dueDate as any) : null,
        reference: values.reference,
        gstAmount: values.gstAmount
      } as Partial<Journal>
      // Force create the journal entry regardless of validation
      if (isEditing) {
        updateJournalEntry({
          ...payload,
          id: entryId
        } as Partial<Journal>).then(() => {
          onOpenChange(false)
        })
      } else {
        return addJournalEntry(payload).then(() => {
          onOpenChange(false)
          toast({
            title: "Success",
            description: "Journal entry created successfully!",
          })
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "Failed to create journal entry. Please check the console for details.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] bg-background">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Journal Entry" : "Create Journal Entry"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this journal entry." : "Enter the details for the new journal entry."}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 max-h-[calc(80vh-10rem)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <h3 className="text-sm font-medium text-foreground">Basic Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Posted">Posted</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Account Information Section */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <h3 className="text-sm font-medium text-foreground">Account Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="debitAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Debit Account</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allAccountOptions.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="creditAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Account</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allAccountOptions.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Bank Account Selection - Show when Bank is involved */}
                  {(form.watch("debitAccount") === "Bank" || form.watch("creditAccount") === "Bank") && (
                    <FormField
                      control={form.control}
                      name="bankAccount"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Select Bank Account</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select bank account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bankAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id + ''}>
                                  {account.name} - {account.bank} ({account.accountNumber})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Select the specific bank account for this transaction</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => {
                    const debitAccount = form.watch("debitAccount")
                    const creditAccount = form.watch("creditAccount")
                    const gstPercentage = form.watch("gstPercentage") || 0

                    const isSale =
                      (debitAccount === "Cash" || debitAccount === "Bank" || debitAccount === "Accounts Receivable") &&
                      creditAccount === "Sales Revenue"
                    const isPurchase =
                      (debitAccount === "Raw Materials Inventory" ||
                        debitAccount === "Finished Goods Inventory" ||
                        debitAccount === "Work-in-Progress") &&
                      (creditAccount === "Cash" || creditAccount === "Bank" || creditAccount === "Accounts Payable")

                    let amountLabel = "Amount (₹)"
                    let amountDescription = ""

                    if (gstPercentage > 0 && (isSale || isPurchase)) {
                      amountLabel = "Base Amount (₹)"
                      amountDescription =
                        "Enter the base amount (excluding GST). Total amount will be calculated automatically."
                    }

                    return (
                      <FormItem>
                        <FormLabel>{amountLabel}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            className={amountError ? "border-destructive" : ""}
                            onChange={(e) => {
                              field.onChange(e)
                              const newAmount = Number.parseFloat(e.target.value)
                              if (
                                (!selectedInvoiceBalance || newAmount <= selectedInvoiceBalance) &&
                                (!selectedBillBalance || newAmount <= selectedBillBalance)
                              ) {
                                setAmountError(null)
                              }
                            }}
                          />
                        </FormControl>
                        {amountError && <p className="text-sm font-medium text-destructive">{amountError}</p>}
                        {amountDescription && <FormDescription>{amountDescription}</FormDescription>}
                        {selectedInvoiceBalance !== null && !amountError && (
                          <FormDescription>
                            Maximum amount: ₹{selectedInvoiceBalance.toLocaleString("en-IN")}
                          </FormDescription>
                        )}
                        {selectedBillBalance !== null && !amountError && (
                          <FormDescription>
                            Maximum amount: ₹{selectedBillBalance.toLocaleString("en-IN")}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>

              {/* Party Information Section */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <h3 className="text-sm font-medium text-foreground">Party Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Party Type dropdown */}
                  <FormField
                    control={form.control}
                    name="partyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Party Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            // Reset customer/supplier selections when party type changes
                            form.setValue("debtorCustomer", "")
                            form.setValue("creditorSupplier", "")
                            form.setValue("activeInvoice", "")
                            form.setValue("activeBill", "")
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select party type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Customer">Customer</SelectItem>
                            <SelectItem value="Supplier">Supplier</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Optional: Select party type if this transaction involves a customer or supplier
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Customer dropdown that appears when Party Type is Customer */}
                  {form.watch("partyType") === "Customer" && (
                    <FormField
                      control={form.control}
                      name="debtorCustomer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Customer</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Please select the customer for this transaction</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Supplier dropdown that appears when Party Type is Supplier */}
                  {form.watch("partyType") === "Supplier" && (
                    <FormField
                      control={form.control}
                      name="creditorSupplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Supplier</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Please select the supplier for this transaction</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Active Invoices dropdown that appears when Cash/Bank and Accounts Receivable entry is being created */}
                {(form.watch("debitAccount") === "Cash" || form.watch("debitAccount") === "Bank") &&
                  form.watch("creditAccount") === "Accounts Receivable" &&
                  form.watch("partyType") === "Customer" &&
                  form.watch("debtorCustomer") && (
                    <FormField
                      control={form.control}
                      name="activeInvoice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Invoice to Pay</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              // Reset amount when invoice changes
                              if (value) {
                                const invoice = invoices.find((inv) => inv.id === value)
                                if (invoice) {
                                  form.setValue("amount", invoice.balance)
                                }
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select invoice" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {invoices
                                .filter(
                                  (invoice) =>
                                    invoice.balance > 0 &&
                                    invoice.customer ===
                                    customers.find((c) => c.id === form.watch("debtorCustomer"))?.name,
                                )
                                .map((invoice) => (
                                  <SelectItem key={invoice.id} value={invoice.id}>
                                    {invoice.id} - ₹{invoice.balance.toLocaleString("en-IN")}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Select an open invoice to apply this payment to</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                {/* NEW: Active Invoices dropdown for Sales Returns (Credit Notes) */}
                {form.watch("debitAccount") === "Sales Revenue Returned" &&
                  form.watch("partyType") === "Customer" &&
                  form.watch("debtorCustomer") && (
                    <FormField
                      control={form.control}
                      name="activeInvoice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Invoice for Credit Note</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (value) {
                                const invoice = invoices.find((inv) => inv.id === value)
                                if (invoice) {
                                  form.setValue("amount", invoice.balance)
                                }
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select invoice" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {invoices
                                .filter(
                                  (invoice) =>
                                    invoice.balance > 0 &&
                                    invoice.customer ===
                                    customers.find((c) => c.id === form.watch("debtorCustomer"))?.name,
                                )
                                .map((invoice) => (
                                  <SelectItem key={invoice.id} value={invoice.id}>
                                    {invoice.id} - ₹{invoice.balance.toLocaleString("en-IN")}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Select the invoice this sales return applies to</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                {/* Active Bills dropdown that appears when Accounts Payable/Cash or Bank entry is being created */}
                {form.watch("debitAccount") === "Accounts Payable" &&
                  (form.watch("creditAccount") === "Cash" || form.watch("creditAccount") === "Bank") &&
                  form.watch("partyType") === "Supplier" &&
                  form.watch("creditorSupplier") && (
                    <FormField
                      control={form.control}
                      name="activeBill"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Bill to Pay</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              // Reset amount when bill changes
                              if (value) {
                                const bill = bills.find((b) => b.id === value)
                                if (bill) {
                                  form.setValue("amount", bill.balance)
                                }
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select bill" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bills
                                .filter(
                                  (bill) =>
                                    bill.balance > 0 &&
                                    bill.supplier ===
                                    suppliers.find((s) => s.id === form.watch("creditorSupplier"))?.name,
                                )
                                .map((bill) => (
                                  <SelectItem key={bill.id} value={bill.id}>
                                    {bill.id} - ₹{bill.balance.toLocaleString("en-IN")}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Select an open bill to apply this payment to</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                {/* NEW: Active Bills dropdown for Purchase Returns (Debit Notes) */}
                {form.watch("creditAccount") === "Raw Materials Inventory Returned" &&
                  form.watch("partyType") === "Supplier" &&
                  form.watch("creditorSupplier") && (
                    <FormField
                      control={form.control}
                      name="activeBill"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Bill for Debit Note</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (value) {
                                const bill = bills.find((b) => b.id === value)
                                if (bill) {
                                  form.setValue("amount", bill.balance)
                                }
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select bill" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bills
                                .filter(
                                  (bill) =>
                                    bill.balance > 0 &&
                                    bill.supplier ===
                                    suppliers.find((s) => s.id === form.watch("creditorSupplier"))?.name,
                                )
                                .map((bill) => (
                                  <SelectItem key={bill.id} value={bill.id}>
                                    {bill.id} - ₹{bill.balance.toLocaleString("en-IN")}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Select the bill this purchase return applies to</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
              </div>

              {/* Reference Information Section */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <h3 className="text-sm font-medium text-foreground">Reference Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => {
                      const debitAccount = form.watch("debitAccount")
                      const creditAccount = form.watch("creditAccount")

                      // Check if due date should be editable
                      const isDueDateEditable =
                        (debitAccount === "Accounts Receivable" && creditAccount === "Sales Revenue") ||
                        (debitAccount === "Raw Materials Inventory" && creditAccount === "Accounts Payable")

                      return (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              disabled={!isDueDateEditable}
                              className={!isDueDateEditable ? "bg-muted cursor-not-allowed" : ""}
                            />
                          </FormControl>
                          <FormDescription>
                            {isDueDateEditable
                              ? "Select the due date for this transaction"
                              : "Due date is only applicable for sales on credit or purchases on credit"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="referenceNumber"
                    render={({ field }) => {
                      const debitAccount = form.watch("debitAccount")
                      const creditAccount = form.watch("creditAccount")

                      // Check if reference number should be editable for buying/selling goods
                      const isReferenceNumberEditable =
                        // Sales transactions (cash or credit)
                        ((debitAccount === "Cash" ||
                          debitAccount === "Bank" ||
                          debitAccount === "Accounts Receivable") &&
                          creditAccount === "Sales Revenue") ||
                        // Purchase transactions (cash or credit)
                        ((debitAccount === "Raw Materials Inventory" ||
                          debitAccount === "Finished Goods Inventory" ||
                          debitAccount === "Work-in-Progress") &&
                          (creditAccount === "Cash" ||
                            creditAccount === "Bank" ||
                            creditAccount === "Accounts Payable"))

                      return (
                        <FormItem>
                          <FormLabel>Reference Number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isReferenceNumberEditable}
                              className={!isReferenceNumberEditable ? "bg-muted cursor-not-allowed" : ""}
                              placeholder={isReferenceNumberEditable ? "Enter invoice/bill number" : ""}
                            />
                          </FormControl>
                          <FormDescription>
                            {isReferenceNumberEditable
                              ? "Enter the invoice or bill number for this transaction"
                              : "Reference number is only applicable for buying or selling goods"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="additionalReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Reference</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional reference information" />
                      </FormControl>
                      <FormDescription>Optional reference number or code</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Taxes Section */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Tax Information</h3>
                  <div className="flex items-center gap-2">
                    <label htmlFor="taxes-toggle" className="text-sm text-muted-foreground">
                      {showTaxesSection ? "On" : "Off"}
                    </label>
                    <Switch id="taxes-toggle" checked={showTaxesSection} onCheckedChange={setShowTaxesSection} />
                  </div>
                </div>

                {showTaxesSection && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="transactionType"
                        render={({ field }) => {
                          const debitAccount = form.watch("debitAccount")
                          const creditAccount = form.watch("creditAccount")

                          // Check if transaction type should be editable for buying/selling goods or returns
                          const isTransactionTypeEditable =
                            // Sales transactions (cash or credit)
                            ((debitAccount === "Cash" ||
                              debitAccount === "Bank" ||
                              debitAccount === "Accounts Receivable") &&
                              creditAccount === "Sales Revenue") ||
                            // Purchase transactions (cash or credit)
                            ((debitAccount === "Raw Materials Inventory" ||
                              debitAccount === "Finished Goods Inventory" ||
                              debitAccount === "Work-in-Progress") &&
                              (creditAccount === "Cash" ||
                                creditAccount === "Bank" ||
                                creditAccount === "Accounts Payable")) ||
                            // Sales return transactions
                            (debitAccount === "Sales Revenue Returned" &&
                              (creditAccount === "Cash" ||
                                creditAccount === "Bank" ||
                                creditAccount === "Accounts Receivable")) ||
                            // Purchase return transactions
                            (creditAccount === "Raw Materials Inventory Returned" &&
                              (debitAccount === "Cash" ||
                                debitAccount === "Bank" ||
                                debitAccount === "Accounts Payable"))

                          return (
                            <FormItem>
                              <FormLabel>Transaction Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!isTransactionTypeEditable}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={!isTransactionTypeEditable ? "bg-muted cursor-not-allowed" : ""}
                                  >
                                    <SelectValue placeholder="Select transaction type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="CGST-SGST">CGST-SGST</SelectItem>
                                  <SelectItem value="IGST">IGST</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                {isTransactionTypeEditable
                                  ? "Select the transaction location for GST calculation"
                                  : "Transaction type is only applicable for buying or selling goods"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />

                      <FormField
                        control={form.control}
                        name="gstPercentage"
                        render={({ field }) => {
                          const debitAccount = form.watch("debitAccount")
                          const creditAccount = form.watch("creditAccount")

                          // Check if GST percentage should be editable for buying/selling goods or returns
                          const isGstPercentageEditable =
                            // Sales transactions (cash or credit)
                            ((debitAccount === "Cash" ||
                              debitAccount === "Bank" ||
                              debitAccount === "Accounts Receivable") &&
                              creditAccount === "Sales Revenue") ||
                            // Purchase transactions (cash or credit)
                            ((debitAccount === "Raw Materials Inventory" ||
                              debitAccount === "Finished Goods Inventory" ||
                              debitAccount === "Work-in-Progress") &&
                              (creditAccount === "Cash" ||
                                creditAccount === "Bank" ||
                                creditAccount === "Accounts Payable")) ||
                            // Sales return transactions
                            (debitAccount === "Sales Revenue Returned" &&
                              (creditAccount === "Cash" ||
                                creditAccount === "Bank" ||
                                creditAccount === "Accounts Receivable")) ||
                            // Purchase return transactions
                            (creditAccount === "Raw Materials Inventory Returned" &&
                              (debitAccount === "Cash" ||
                                debitAccount === "Bank" ||
                                debitAccount === "Accounts Payable"))

                          return (
                            <FormItem>
                              <FormLabel>GST %</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  {...field}
                                  disabled={!isGstPercentageEditable}
                                  className={!isGstPercentageEditable ? "bg-muted cursor-not-allowed" : ""}
                                  placeholder={isGstPercentageEditable ? "Enter GST percentage" : ""}
                                />
                              </FormControl>
                              <FormDescription>
                                {isGstPercentageEditable
                                  ? "Enter the GST percentage for this transaction"
                                  : "GST percentage is only applicable for buying or selling goods"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* GST Preview Sections */}
              {/* GST Output Accounts Preview - Show when Credit Account is Sales Revenue */}
              {form.watch("creditAccount") === "Sales Revenue" &&
                showTaxesSection &&
                form.watch("gstPercentage") > 0 && (
                  <div className="space-y-4 border rounded-lg p-4 bg-blue-900/10 mb-4">
                    <h4 className="text-sm font-medium text-blue-foreground">GST Output Entries Preview</h4>
                    <div className="text-sm text-blue-foreground">
                      <p className="mb-2">The following GST entries will be automatically created:</p>

                      {form.watch("transactionType") === "IGST" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium">IGST Output Account:</div>
                          <div>{getDisplayAccountName("IGST Output")}</div>
                          <div className="font-medium">IGST Amount:</div>
                          <div>
                            ₹
                            {(
                              ((Number(form.watch("amount")) || 0) * (Number(form.watch("gstPercentage")) || 0)) /
                              100
                            ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">CGST Output Account:</div>
                            <div>{getDisplayAccountName("CGST Output")}</div>
                            <div className="font-medium">CGST Amount:</div>
                            <div>
                              ₹
                              {(
                                ((Number(form.watch("amount")) || 0) *
                                  ((Number(form.watch("gstPercentage")) || 0) / 2)) /
                                100
                              ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                            <div className="font-medium">SGST Output Account:</div>
                            <div>{getDisplayAccountName("SGST Output")}</div>
                            <div className="font-medium">SGST Amount:</div>
                            <div>
                              ₹
                              {(
                                ((Number(form.watch("amount")) || 0) *
                                  ((Number(form.watch("gstPercentage")) || 0) / 2)) /
                                100
                              ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-blue-foreground/80">
                        These entries will be created automatically when you submit the form.
                      </p>
                    </div>
                  </div>
                )}

              {/* GST Input Accounts Preview - Show when Debit Account is Raw Materials/Finished Goods/WIP */}
              {(form.watch("debitAccount") === "Raw Materials Inventory" ||
                form.watch("debitAccount") === "Finished Goods Inventory" ||
                form.watch("debitAccount") === "Work-in-Progress") &&
                showTaxesSection &&
                form.watch("gstPercentage") > 0 && (
                  <div className="space-y-4 border rounded-lg p-4 bg-green-900/10 mb-4">
                    <h4 className="text-sm font-medium text-green-foreground">GST Input Entries Preview</h4>
                    <div className="text-sm text-green-foreground">
                      <p className="mb-2">The following GST entries will be automatically created:</p>

                      {form.watch("transactionType") === "IGST" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium">IGST Input Account:</div>
                          <div>{getDisplayAccountName("IGST Input")}</div>
                          <div className="font-medium">IGST Amount:</div>
                          <div>
                            ₹
                            {(
                              ((Number(form.watch("amount")) || 0) * (Number(form.watch("gstPercentage")) || 0)) /
                              100
                            ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">CGST Input Account:</div>
                            <div>{getDisplayAccountName("CGST Input")}</div>
                            <div className="font-medium">CGST Amount:</div>
                            <div>
                              ₹
                              {(
                                ((Number(form.watch("amount")) || 0) *
                                  ((Number(form.watch("gstPercentage")) || 0) / 2)) /
                                100
                              ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                            <div className="font-medium">SGST Input Account:</div>
                            <div>{getDisplayAccountName("SGST Input")}</div>
                            <div className="font-medium">SGST Amount:</div>
                            <div>
                              ₹
                              {(
                                ((Number(form.watch("amount")) || 0) *
                                  ((Number(form.watch("gstPercentage")) || 0) / 2)) /
                                100
                              ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-green-foreground/80">
                        These entries will be created automatically when you submit the form.
                      </p>
                    </div>
                  </div>
                )}

              {/* GST Return Accounts Preview - Show when Credit Account is Raw Materials Inventory Returned */}
              {form.watch("creditAccount") === "Raw Materials Inventory Returned" &&
                showTaxesSection &&
                form.watch("gstPercentage") > 0 && (
                  <div className="space-y-4 border rounded-lg p-4 bg-orange-900/10 mb-4">
                    <h4 className="text-sm font-medium text-orange-foreground">GST Purchase Return Entries Preview</h4>
                    <div className="text-sm text-orange-foreground">
                      <p className="mb-2">The following GST return entries will be automatically created:</p>

                      {form.watch("transactionType") === "IGST" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium">IGST Input Account:</div>
                          <div>{getDisplayAccountName("IGST Input")}</div>
                          <div className="font-medium">IGST Amount:</div>
                          <div>
                            ₹
                            {(
                              ((Number(form.watch("amount")) || 0) * (Number(form.watch("gstPercentage")) || 0)) /
                              100
                            ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">CGST Input Account:</div>
                            <div>{getDisplayAccountName("CGST Input")}</div>
                            <div className="font-medium">CGST Amount:</div>
                            <div>
                              ₹
                              {(
                                ((Number(form.watch("amount")) || 0) *
                                  ((Number(form.watch("gstPercentage")) || 0) / 2)) /
                                100
                              ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                            <div className="font-medium">SGST Input Account:</div>
                            <div>{getDisplayAccountName("SGST Input")}</div>
                            <div className="font-medium">SGST Amount:</div>
                            <div>
                              ₹
                              {(
                                ((Number(form.watch("amount")) || 0) *
                                  ((Number(form.watch("gstPercentage")) || 0) / 2)) /
                                100
                              ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-orange-foreground/80">
                        These return entries will be created automatically when you submit the form.
                      </p>
                    </div>
                  </div>
                )}

              {/* GST Return Accounts Preview - Show when Debit Account is Sales Revenue Returned */}
              {form.watch("debitAccount") === "Sales Revenue Returned" &&
                showTaxesSection &&
                form.watch("gstPercentage") > 0 && (
                  <div className="space-y-4 border rounded-lg p-4 bg-red-900/10 mb-4">
                    <h4 className="text-sm font-medium text-red-foreground">GST Return Entries Preview</h4>
                    <div className="text-sm text-red-foreground">
                      <p className="mb-2">The following GST return entries will be automatically created:</p>

                      {form.watch("transactionType") === "IGST" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium">IGST Output Account:</div>
                          <div>{getDisplayAccountName("IGST Output")}</div>
                          <div className="font-medium">IGST Amount:</div>
                          <div>
                            ₹
                            {(
                              ((Number(form.watch("amount")) || 0) * (Number(form.watch("gstPercentage")) || 0)) /
                              100
                            ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">CGST Output Account:</div>
                            <div>{getDisplayAccountName("CGST Output")}</div>
                            <div className="font-medium">CGST Amount:</div>
                            <div>
                              ₹
                              {(
                                ((Number(form.watch("amount")) || 0) *
                                  ((Number(form.watch("gstPercentage")) || 0) / 2)) /
                                100
                              ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                            <div className="font-medium">SGST Output Account:</div>
                            <div>{getDisplayAccountName("SGST Output")}</div>
                            <div className="font-medium">SGST Amount:</div>
                            <div>
                              ₹
                              {(
                                ((Number(form.watch("amount")) || 0) *
                                  ((Number(form.watch("gstPercentage")) || 0) / 2)) /
                                100
                              ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-red-foreground/80">
                        These return entries will be created automatically when you submit the form.
                      </p>
                    </div>
                  </div>
                )}

              {/* GST Breakdown Display - only show when taxes section is visible */}
              {showTaxesSection && gstBreakdown && (
                <div className="space-y-3 border rounded-lg p-4 bg-blue-900/10">
                  <h4 className="text-sm font-medium text-blue-foreground">GST Breakdown</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-foreground">Base Amount:</span>
                      <span className="font-medium ml-2">
                        ₹{gstBreakdown.baseAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {gstBreakdown.cgstAmount > 0 && (
                      <>
                        <div>
                          <span className="text-blue-foreground">
                            CGST ({(form.watch("gstPercentage") || 0) / 2}%):
                          </span>
                          <span className="font-medium ml-2">
                            ₹{gstBreakdown.cgstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-foreground">
                            SGST ({(form.watch("gstPercentage") || 0) / 2}%):
                          </span>
                          <span className="font-medium ml-2">
                            ₹{gstBreakdown.sgstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    )}
                    {gstBreakdown.igstAmount > 0 && (
                      <div>
                        <span className="text-blue-foreground">IGST ({form.watch("gstPercentage") || 0}%):</span>
                        <span className="font-medium ml-2">
                          ₹{gstBreakdown.igstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="col-span-2 border-t pt-2">
                      <span className="text-blue-foreground">Total Amount:</span>
                      <span className="font-bold ml-2 text-blue-foreground">
                        ₹{gstBreakdown.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              // Get form values directly
              const values = form.getValues()
              console.log("Form values on direct click:", values)

              // Directly submit without validation if needed
              if (Object.keys(form.formState.errors).length > 0) {
                console.log("Form has errors but proceeding anyway:", form.formState.errors)
              }

              onSubmit(values)
            }}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
