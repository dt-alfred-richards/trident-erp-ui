"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFinance } from "@/contexts/finance-context"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface JournalEntryViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entryId: string | null
}

export function JournalEntryViewDialog({ open, onOpenChange, entryId }: JournalEntryViewDialogProps) {
  const { journalEntries, accounts } = useFinance()

  // Find the journal entry by ID
  const entry = journalEntries.find((entry) => entry.id === entryId)

  if (!entry) {
    return null
  }

  // Find the customer name if it's a debtor transaction
  const getCustomerName = () => {
    if (entry.debitAccount === "Debtors" || entry.creditAccount === "Debtors") {
      // In a real implementation, this would come from the entry data
      // For now, we'll return a placeholder
      return "Customer information not available"
    }
    return null
  }

  // Find the supplier name if it's a creditor transaction
  const getSupplierName = () => {
    if (entry.debitAccount === "Creditors" || entry.creditAccount === "Creditors") {
      // In a real implementation, this would come from the entry data
      // For now, we'll return a placeholder
      return "Supplier information not available"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Journal Entry Details</DialogTitle>
          <DialogDescription>Viewing details for journal entry {entry.id}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-1 max-h-[calc(80vh-10rem)]">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Entry ID</h3>
                  <p className="text-base font-semibold">{entry.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="text-base">{entry.date}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-base whitespace-pre-wrap">{entry.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Debit Account</h3>
                  <p className="text-base font-medium">{entry.debitAccount}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Credit Account</h3>
                  <p className="text-base font-medium">{entry.creditAccount}</p>
                </div>
              </div>

              {getCustomerName() && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                  <p className="text-base">{getCustomerName()}</p>
                </div>
              )}

              {getSupplierName() && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
                  <p className="text-base">{getSupplierName()}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                  <p className="text-base font-bold">₹{entry.amount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reference</h3>
                  <p className="text-base">{entry.reference || "—"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-1 ${getStatusClass()}`}
                >
                  {entry.status}
                </span>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                <p className="text-base">System User</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Modified</h3>
                <p className="text-base">{entry.date} (same as entry date for demo)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
