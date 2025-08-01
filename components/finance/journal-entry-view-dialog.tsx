"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFinance, getDisplayAccountName } from "@/contexts/finance-context"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useJournalContext } from "./context/journal-context"
import { useMemo } from "react"
import { useBillContext } from "./context/bill-context"
import { useInvoiceContext } from "./context/invoice-context"
import { convertDate } from "../generic"

interface JournalEntryViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entryId: string | null
}

// Sample customer data (same as in form)
const customers = [
  { id: "CUST001", name: "Acme Corp" },
  { id: "CUST002", name: "TechGiant Inc" },
  { id: "CUST003", name: "Global Traders" },
  { id: "CUST004", name: "Innovate Solutions" },
  { id: "CUST005", name: "Prime Industries" },
]

// Sample supplier data (same as in form)
const suppliers = [
  { id: "SUP001", name: "Raw Materials Co." },
  { id: "SUP002", name: "Industrial Supplies Ltd." },
  { id: "SUP003", name: "Quality Components Inc." },
  { id: "SUP004", name: "Packaging Solutions" },
  { id: "SUP005", name: "Logistics Partners" },
]

export function JournalEntryViewDialog({ open, onOpenChange, entryId }: JournalEntryViewDialogProps) {
  const { data: bills } = useBillContext()
  const { data: invoices } = useInvoiceContext()

  const { data } = useJournalContext()
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

  // Find the journal entry by ID
  const entry = journalEntries.find((entry) => entry.id === entryId)

  if (!entry) {
    return null
  }

  // Find the customer name if it's a debtor transaction
  const getCustomerName = () => {
    if (entry.debtorCustomer) {
      const customer = customers.find((c) => c.id === entry.debtorCustomer)
      return customer ? customer.name : entry.debtorCustomer
    }
    return null
  }

  // Find the supplier name if it's a creditor transaction
  const getSupplierName = () => {
    if (entry.creditorSupplier) {
      const supplier = suppliers.find((s) => s.id === entry.creditorSupplier)
      return supplier ? supplier.name : entry.creditorSupplier
    }
    return null
  }

  // Find invoice details
  const getInvoiceDetails = () => {
    if (entry.activeInvoice) {
      const invoice = invoices.find((inv) => inv.id === entry.activeInvoice)
      return invoice ? `${invoice.id} - ₹${invoice.balance.toLocaleString("en-IN")}` : entry.activeInvoice
    }
    return null
  }

  // Find bill details
  const getBillDetails = () => {
    if (entry.activeBill) {
      const bill = bills.find((b) => b.id === entry.activeBill)
      return bill ? `${bill.id} - ₹${bill.balance.toLocaleString("en-IN")}` : entry.activeBill
    }
    return null
  }

  // Format the status with appropriate styling
  const getStatusClass = () => {
    switch (entry.status) {
      case "Posted":
        return "bg-green-50 text-green-700 border-green-200"
      case "Draft":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Calculate GST breakdown if applicable
  const getGstBreakdown = () => {
    if (entry.gstPercentage && entry.gstPercentage > 0) {
      const baseAmount = entry.baseAmount || entry.amount
      const gstAmount = entry.gstAmount || baseAmount * (entry.gstPercentage / 100)
      const totalAmount = entry.totalAmount || baseAmount + gstAmount

      if (entry.transactionType === "IGST") {
        return {
          baseAmount,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: gstAmount,
          totalAmount,
        }
      } else {
        return {
          baseAmount,
          cgstAmount: gstAmount / 2,
          sgstAmount: gstAmount / 2,
          igstAmount: 0,
          totalAmount,
        }
      }
    }
    return null
  }

  const gstBreakdown = getGstBreakdown()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Journal Entry Details</DialogTitle>
          <DialogDescription>Viewing details for journal entry {entry.id}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 max-h-[calc(80vh-10rem)]">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0 space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-900">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Entry ID</h4>
                    <p className="text-base font-semibold">{entry.id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date</h4>
                    <p className="text-base">{entry.date}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="text-base whitespace-pre-wrap">{entry.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-1 ${getStatusClass()}`}
                  >
                    {entry.status}
                  </span>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-900">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Debit Account</h4>
                    <p className="text-base font-medium">{getDisplayAccountName(entry.debitAccount)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Credit Account</h4>
                    <p className="text-base font-medium">{getDisplayAccountName(entry.creditAccount)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                  <p className="text-base font-bold">₹{entry.amount.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Party Information Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-900">Party Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Party Type</h4>
                    <p className="text-base">{entry.partyType || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      {entry.partyType === "Customer"
                        ? "Customer"
                        : entry.partyType === "Supplier"
                          ? "Supplier"
                          : "Party"}
                    </h4>
                    <p className="text-base">{getCustomerName() || getSupplierName() || "—"}</p>
                  </div>
                </div>
                {getInvoiceDetails() && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Active Invoice</h4>
                    <p className="text-base">{getInvoiceDetails()}</p>
                  </div>
                )}
                {getBillDetails() && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Active Bill</h4>
                    <p className="text-base">{getBillDetails()}</p>
                  </div>
                )}
              </div>

              {/* Reference Information Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-900">Reference Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                    <p className="text-base">{entry.dueDate || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Reference Number</h4>
                    <p className="text-base">{entry.referenceNumber || "—"}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Additional Reference</h4>
                  <p className="text-base">{entry.reference || "—"}</p>
                </div>
              </div>

              {/* Tax Information Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-900">Tax Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Transaction Type</h4>
                    <p className="text-base">{entry.transactionType || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">GST Percentage</h4>
                    <p className="text-base">{entry.gstPercentage ? `${entry.gstPercentage}%` : "—"}</p>
                  </div>
                </div>
                {entry.baseAmount && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Base Amount</h4>
                      <p className="text-base">₹{entry.baseAmount.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">GST Amount</h4>
                      <p className="text-base">₹{(entry.gstAmount || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                )}
                {entry.totalAmount && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                    <p className="text-base font-bold">₹{entry.totalAmount.toLocaleString("en-IN")}</p>
                  </div>
                )}
              </div>

              {/* GST Breakdown Section */}
              {gstBreakdown && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-900">GST Breakdown</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Base Amount:</span>
                      <span className="font-medium ml-2">
                        ₹{gstBreakdown.baseAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {gstBreakdown.cgstAmount > 0 && (
                      <>
                        <div>
                          <span className="text-gray-600">CGST ({(entry.gstPercentage || 0) / 2}%):</span>
                          <span className="font-medium ml-2">
                            ₹{gstBreakdown.cgstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">SGST ({(entry.gstPercentage || 0) / 2}%):</span>
                          <span className="font-medium ml-2">
                            ₹{gstBreakdown.sgstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    )}
                    {gstBreakdown.igstAmount > 0 && (
                      <div>
                        <span className="text-gray-600">IGST ({entry.gstPercentage || 0}%):</span>
                        <span className="font-medium ml-2">
                          ₹{gstBreakdown.igstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="col-span-2 border-t pt-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold ml-2 text-blue-900">
                        ₹{gstBreakdown.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* System Information Section */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-900">System Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Created By</h4>
                    <p className="text-base">System User</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Modified</h4>
                    <p className="text-base">{entry.date}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
