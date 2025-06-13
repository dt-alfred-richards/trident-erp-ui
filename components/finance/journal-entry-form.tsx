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
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { useJournalContext } from "./context/journal-context"

// Define the form schema
const formSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  debitAccount: z.string().min(1, { message: "Debit account is required" }),
  creditAccount: z.string().min(1, { message: "Credit account is required" }),
  debtorCustomer: z.string().optional(),
  creditorSupplier: z.string().optional(),
  activeInvoice: z.string().optional(),
  activeBill: z.string().optional(),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  reference: z.string().optional(),
  status: z.enum(["Draft", "Posted", "Pending", "Rejected"]),
})

// Sample customer data
const customers = [
  { id: "CUST001", name: "Acme Corp" },
  { id: "CUST002", name: "TechGiant Inc" },
  { id: "CUST003", name: "Global Traders" },
  { id: "CUST004", name: "Innovate Solutions" },
  { id: "CUST005", name: "Prime Industries" },
]

// Sample supplier data
const suppliers = [
  { id: "SUP001", name: "Raw Materials Co." },
  { id: "SUP002", name: "Industrial Supplies Ltd." },
  { id: "SUP003", name: "Quality Components Inc." },
  { id: "SUP004", name: "Packaging Solutions" },
  { id: "SUP005", name: "Logistics Partners" },
]

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
    addJournalEntry,
    updateJournalEntry,
    updateTotalReceivables,
    decreaseTotalReceivables,
    updateTotalPayables,
    decreaseTotalPayables,
  } = useFinance()
  const isEditing = !!entryId
  const [selectedInvoiceBalance, setSelectedInvoiceBalance] = useState<number | null>(null)
  const [selectedBillBalance, setSelectedBillBalance] = useState<number | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)

  const { create: createJournal, update } = useJournalContext()

  // Default values for the form
  const defaultValues: Partial<JournalEntryFormValues> = {
    date: new Date().toISOString().split("T")[0],
    description: "",
    debitAccount: "",
    creditAccount: "",
    debtorCustomer: "",
    creditorSupplier: "",
    activeInvoice: "",
    activeBill: "",
    amount: 0,
    reference: "",
    status: "Draft",
  }

  // Initialize the form
  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Reset form with initialValues when they change or when the dialog opens
  useEffect(() => {
    if (open) {
      if (initialValues) {
        // Reset the form with initialValues
        form.reset({
          date: initialValues.date,
          description: initialValues.description,
          debitAccount: initialValues.debitAccount,
          creditAccount: initialValues.creditAccount,
          debtorCustomer: initialValues.debtorCustomer || "",
          creditorSupplier: initialValues.creditorSupplier || "",
          activeInvoice: initialValues.activeInvoice || "",
          activeBill: initialValues.activeBill || "",
          amount: initialValues.amount,
          reference: initialValues.reference || "",
          status: initialValues.status,
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
  }, [form, initialValues, open])

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
      debitAccount === "Cash" &&
      creditAccount === "Accounts Receivable" &&
      activeInvoice &&
      selectedInvoiceBalance !== null &&
      amount > selectedInvoiceBalance
    ) {
      setAmountError(`Amount cannot exceed invoice balance of ₹${selectedInvoiceBalance.toLocaleString("en-IN")}`)
    } else if (
      debitAccount === "Accounts Payable" &&
      creditAccount === "Cash" &&
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
    (account) => account.name !== "Revenue" && account.name !== "Sales Revenue" && account.name !== "Service Revenue",
  )

  // Handle form submission
  const onSubmit = (values: JournalEntryFormValues) => {
    if (isEditing) {
      update({ ...values, id: entryId }).then(_ => {
        onOpenChange(false)
      })
    } else {
      createJournal({
        ...values,
      }).then(_ => {
        onOpenChange(false)
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Journal Entry" : "Create Journal Entry"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of this journal entry." : "Enter the details for the new journal entry."}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 max-h-[calc(80vh-10rem)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Accounts Payable">Accounts Payable</SelectItem>
                          <SelectItem value="Accounts Receivable">Accounts Receivable</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Raw Material Expenses">Raw Material Expenses</SelectItem>
                          {filteredAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.name}>
                              {account.name}
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
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Accounts Payable">Accounts Payable</SelectItem>
                          <SelectItem value="Accounts Receivable">Accounts Receivable</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Raw Material Expenses">Raw Material Expenses</SelectItem>
                          {filteredAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.name}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Customer dropdown that appears when Accounts Receivable is selected */}
              {(form.watch("debitAccount") === "Accounts Receivable" ||
                form.watch("creditAccount") === "Accounts Receivable") && (
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
                        <FormDescription>
                          Please select the customer for this accounts receivable transaction
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

              {/* Active Invoices dropdown that appears when Cash/Accounts Receivable entry is being created */}
              {form.watch("debitAccount") === "Cash" &&
                form.watch("creditAccount") === "Accounts Receivable" &&
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

              {/* Supplier dropdown that appears when Accounts Payable is selected */}
              {(form.watch("debitAccount") === "Accounts Payable" ||
                form.watch("creditAccount") === "Accounts Payable") && (
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
                        <FormDescription>
                          Please select the supplier for this accounts payable transaction
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

              {/* Active Bills dropdown that appears when Accounts Payable/Cash entry is being created */}
              {form.watch("debitAccount") === "Accounts Payable" &&
                form.watch("creditAccount") === "Cash" &&
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          className={amountError ? "border-red-500" : ""}
                          onChange={(e) => {
                            field.onChange(e)
                            // Clear error if amount is valid
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
                      {amountError && <p className="text-sm font-medium text-red-500">{amountError}</p>}
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
                  )}
                />
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>Optional reference number or code</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={!!amountError}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
