"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Trash2, Download } from "lucide-react"
import { useFinance } from "@/contexts/finance-context"
import { toast } from "@/components/ui/use-toast"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

// Zod schema for note items
const noteItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  originalQuantity: z.number().min(0),
  originalUnitPrice: z.number().min(0),
  originalAmount: z.number().min(0),
  originalTaxRate: z.number().min(0).max(100),
  originalTaxAmount: z.number().min(0),
  quantity: z.coerce.number().min(0, "Quantity must be at least 0"),
  unitPrice: z.coerce.number().min(0.01, "Unit price must be positive"),
  amount: z.coerce.number().min(0), // Calculated
  taxRate: z.coerce.number().min(0).max(100), // Inherited
  taxAmount: z.coerce.number().min(0), // Calculated
})

// Zod schema for the form
const formSchema = z.object({
  noteType: z.enum(["Debit Note", "Credit Note"], { message: "Note type is required" }),
  referenceId: z.string().min(1, { message: "Reference document is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  reason: z.string().min(1, { message: "Reason is required" }),
  items: z.array(noteItemSchema).min(1, "At least one item is required"),
  baseAmount: z.coerce.number().min(0),
  gstAmount: z.coerce.number().min(0),
  totalAmount: z.coerce.number().min(0),
  transactionType: z.enum(["CGST-SGST", "IGST"]),
})

type NoteFormValues = z.infer<typeof formSchema>

export function DebitCreditNoteManager() {
  const { invoices, bills, addDebitNote, addCreditNote, debitNotes, creditNotes, customers, suppliers } = useFinance()
  const [activeTab, setActiveTab] = useState("create-note")

  // Pagination state for notes table
  const [noteCurrentPage, setNoteCurrentPage] = useState(1)
  const [noteItemsPerPage] = useState(5)

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      noteType: "Credit Note",
      referenceId: "",
      date: new Date().toISOString().split("T")[0],
      reason: "",
      items: [],
      baseAmount: 0,
      gstAmount: 0,
      totalAmount: 0,
      transactionType: "CGST-SGST", // Default
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchNoteType = form.watch("noteType")
  const watchReferenceId = form.watch("referenceId")
  const watchItems = form.watch("items")

  // Effect to update items when referenceId changes
  useEffect(() => {
    form.setValue("items", []) // Clear existing items
    form.setValue("baseAmount", 0)
    form.setValue("gstAmount", 0)
    form.setValue("totalAmount", 0)

    if (watchReferenceId) {
      if (watchNoteType === "Credit Note") {
        const invoice = invoices.find((inv) => inv.id === watchReferenceId)
        if (invoice) {
          invoice.items.forEach((item) => {
            append({
              description: item.description,
              originalQuantity: item.quantity,
              originalUnitPrice: item.unitPrice,
              originalAmount: item.amount,
              originalTaxRate: item.taxRate,
              originalTaxAmount: item.taxAmount,
              quantity: item.quantity, // Default to full quantity
              unitPrice: item.unitPrice,
              amount: item.amount,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
            })
          })
          // Set transaction type from the first item's tax rate (assuming consistent)
          if (invoice.items.length > 0) {
            form.setValue("transactionType", invoice.items[0].taxRate > 0 ? "CGST-SGST" : "CGST-SGST") // Default to CGST-SGST if no specific type
          }
        }
      } else if (watchNoteType === "Debit Note") {
        const bill = bills.find((b) => b.id === watchReferenceId)
        if (bill) {
          bill.items.forEach((item) => {
            append({
              description: item.description,
              originalQuantity: item.quantity,
              originalUnitPrice: item.unitPrice,
              originalAmount: item.amount,
              originalTaxRate: item.taxRate,
              originalTaxAmount: item.taxAmount,
              quantity: item.quantity, // Default to full quantity
              unitPrice: item.unitPrice,
              amount: item.amount,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
            })
          })
          // Set transaction type from the first item's tax rate (assuming consistent)
          if (bill.items.length > 0) {
            form.setValue("transactionType", bill.items[0].taxRate > 0 ? "CGST-SGST" : "CGST-SGST") // Default to CGST-SGST if no specific type
          }
        }
      }
    }
  }, [watchReferenceId, watchNoteType, invoices, bills, append, form])

  // Effect to calculate totals whenever items change
  useEffect(() => {
    let totalBase = 0
    let totalGst = 0
    watchItems.forEach((item) => {
      const itemAmount = item.quantity * item.unitPrice
      const itemTaxAmount = itemAmount * (item.taxRate / 100)
      totalBase += itemAmount
      totalGst += itemTaxAmount
    })
    form.setValue("baseAmount", totalBase)
    form.setValue("gstAmount", totalGst)
    form.setValue("totalAmount", totalBase + totalGst)
  }, [watchItems, form])

  const onSubmit = (values: NoteFormValues) => {
    const { noteType, referenceId, date, reason, items, baseAmount, gstAmount, totalAmount, transactionType } = values

    if (noteType === "Credit Note") {
      const invoice = invoices.find((inv) => inv.id === referenceId)
      if (!invoice) {
        toast({ title: "Error", description: "Selected invoice not found.", variant: "destructive" })
        return
      }
      addCreditNote({
        invoiceId: referenceId,
        customer: invoice.customer,
        date,
        reason,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
        })),
        baseAmount,
        gstAmount,
        totalAmount,
        transactionType,
        status: "Posted",
      })
    } else {
      // Debit Note
      const bill = bills.find((b) => b.id === referenceId)
      if (!bill) {
        toast({ title: "Error", description: "Selected bill not found.", variant: "destructive" })
        return
      }
      addDebitNote({
        billId: referenceId,
        supplier: bill.supplier,
        date,
        reason,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
        })),
        baseAmount,
        gstAmount,
        totalAmount,
        transactionType,
        status: "Posted",
      })
    }
    form.reset()
    toast({ title: "Note Created", description: `${noteType} created successfully.` })
  }

  const allNotes = [...debitNotes, ...creditNotes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  // Calculate pagination for notes
  const indexOfLastNote = noteCurrentPage * noteItemsPerPage
  const indexOfFirstNote = indexOfLastNote - noteItemsPerPage
  const paginatedNotes = allNotes.slice(indexOfFirstNote, indexOfLastNote)

  const handleExport = () => {
    let csvData = ""
    const filename = "debit-credit-notes.csv"

    csvData = `Note ID,Type,Date,Reference ID,Party,Reason,Base Amount (₹),GST Amount (₹),Total Amount (₹),Transaction Type,Status\n`

    allNotes.forEach((note) => {
      const partyName = "customer" in note ? note.customer : note.supplier
      const referenceDocId = "invoiceId" in note ? note.invoiceId : note.billId
      const noteType = "invoiceId" in note ? "Credit Note" : "Debit Note"

      csvData += `${note.id},"${noteType}",${note.date},${referenceDocId},"${partyName}","${note.reason}",${note.baseAmount},${note.gstAmount},${note.totalAmount},${note.transactionType},${note.status}\n`
    })

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
      <Tabs defaultValue="create-note" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="create-note"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Create New Note
          </TabsTrigger>
          <TabsTrigger
            value="view-notes"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            View All Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create-note" className="space-y-6 pt-4">
          <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Create New Debit/Credit Note</CardTitle>
              <CardDescription>Adjust transactions by creating a debit or credit note.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="noteType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select note type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Credit Note">Credit Note (Sales Return)</SelectItem>
                              <SelectItem value="Debit Note">Debit Note (Purchase Return)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="referenceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference {watchNoteType === "Credit Note" ? "Invoice" : "Bill"}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={`Select ${watchNoteType === "Credit Note" ? "invoice" : "bill"}`}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {watchNoteType === "Credit Note"
                                ? invoices.map((inv) => (
                                    <SelectItem key={inv.id} value={inv.id}>
                                      {inv.id} - {inv.customer} (₹{inv.balance.toLocaleString("en-IN")})
                                    </SelectItem>
                                  ))
                                : bills.map((bill) => (
                                    <SelectItem key={bill.id} value={bill.id}>
                                      {bill.id} - {bill.supplier} (₹{bill.balance.toLocaleString("en-IN")})
                                    </SelectItem>
                                  ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Select the original document for this return.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transactionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction Type (GST)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select GST type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CGST-SGST">CGST-SGST (Local)</SelectItem>
                              <SelectItem value="IGST">IGST (Inter-state)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Determines how GST is applied (CGST/SGST or IGST).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Note</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Goods returned due to damage, Price adjustment" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <h3 className="text-md font-semibold mt-6 mb-4">Items to Adjust</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Original Qty</TableHead>
                        <TableHead className="text-right">Original Unit Price (₹)</TableHead>
                        <TableHead className="text-right">Return Qty</TableHead>
                        <TableHead className="text-right">Unit Price (₹)</TableHead>
                        <TableHead className="text-right">Tax Rate (%)</TableHead>
                        <TableHead className="text-right">Amount (₹)</TableHead>
                        <TableHead className="text-right">Tax Amount (₹)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.length > 0 ? (
                        fields.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.originalQuantity}</TableCell>
                            <TableCell className="text-right">
                              {item.originalUnitPrice.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max={item.originalQuantity}
                                {...form.register(`items.${index}.quantity`, {
                                  valueAsNumber: true,
                                  onChange: (e) => {
                                    const newQty = Number(e.target.value)
                                    const currentUnitPrice = form.getValues(`items.${index}.unitPrice`)
                                    const currentTaxRate = form.getValues(`items.${index}.taxRate`)
                                    const newAmount = newQty * currentUnitPrice
                                    const newTaxAmount = newAmount * (currentTaxRate / 100)
                                    form.setValue(`items.${index}.amount`, newAmount)
                                    form.setValue(`items.${index}.taxAmount`, newTaxAmount)
                                  },
                                })}
                                className="w-20 text-right"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                {...form.register(`items.${index}.unitPrice`, {
                                  valueAsNumber: true,
                                  onChange: (e) => {
                                    const newUnitPrice = Number(e.target.value)
                                    const currentQuantity = form.getValues(`items.${index}.quantity`)
                                    const currentTaxRate = form.getValues(`items.${index}.taxRate`)
                                    const newAmount = currentQuantity * newUnitPrice
                                    const newTaxAmount = newAmount * (currentTaxRate / 100)
                                    form.setValue(`items.${index}.amount`, newAmount)
                                    form.setValue(`items.${index}.taxAmount`, newTaxAmount)
                                  },
                                })}
                                className="w-24 text-right"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                {...form.register(`items.${index}.taxRate`, {
                                  valueAsNumber: true,
                                  onChange: (e) => {
                                    const newTaxRate = Number(e.target.value)
                                    const currentQuantity = form.getValues(`items.${index}.quantity`)
                                    const currentUnitPrice = form.getValues(`items.${index}.unitPrice`)
                                    const currentAmount = currentQuantity * currentUnitPrice // Recalculate amount based on current qty and unit price
                                    const newTaxAmount = currentAmount * (newTaxRate / 100)
                                    form.setValue(`items.${index}.amount`, currentAmount) // Update amount as well
                                    form.setValue(`items.${index}.taxAmount`, newTaxAmount)
                                  },
                                })}
                                className="w-20 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {form.watch(`items.${index}.amount`)?.toLocaleString("en-IN") || "0"}
                            </TableCell>
                            <TableCell className="text-right">
                              {form.watch(`items.${index}.taxAmount`)?.toLocaleString("en-IN") || "0"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground">
                            Select a reference document to add items.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  <div className="flex justify-end space-x-4 text-lg font-semibold mt-6">
                    <div>Base Amount: ₹{form.watch("baseAmount").toLocaleString("en-IN")}</div>
                    <div>GST Amount: ₹{form.watch("gstAmount").toLocaleString("en-IN")}</div>
                    <div>Total Amount: ₹{form.watch("totalAmount").toLocaleString("en-IN")}</div>
                  </div>

                  <Button type="submit" className="w-full bg-[#725af2] hover:bg-[#6247d9] text-white">
                    Create Note
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view-notes" className="space-y-6 pt-4">
          <div className="flex justify-end items-center bg-muted/30 p-4 rounded-lg mb-4">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Note ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference ID</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead className="text-right">Base Amount (₹)</TableHead>
                    <TableHead className="text-right">GST Amount (₹)</TableHead>
                    <TableHead className="text-right">Total Amount (₹)</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNotes.length > 0 ? (
                    paginatedNotes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell className="font-medium">{note.id}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              "invoiceId" in note
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                            }
                          >
                            {"invoiceId" in note ? "Credit Note" : "Debit Note"}
                          </Badge>
                        </TableCell>
                        <TableCell>{note.date}</TableCell>
                        <TableCell>{"invoiceId" in note ? note.invoiceId : note.billId}</TableCell>
                        <TableCell>{"customer" in note ? note.customer : note.supplier}</TableCell>
                        <TableCell className="text-right">{note.baseAmount.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{note.gstAmount.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {note.totalAmount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{note.reason}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              note.status === "Posted"
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400"
                                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400"
                            }
                          >
                            {note.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                        No debit or credit notes found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {allNotes.length > 0 && (
            <DataTablePagination
              totalItems={allNotes.length}
              itemsPerPage={noteItemsPerPage}
              currentPage={noteCurrentPage}
              onPageChange={setNoteCurrentPage}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
