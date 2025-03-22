"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { useFinance, type Invoice } from "@/contexts/finance-context"
import { InvoiceForm } from "@/components/finance/invoice-form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function AccountsReceivable() {
  const { invoices, deleteInvoice } = useFinance()
  const [activeTab, setActiveTab] = useState("invoices")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const totalReceivables = invoices.reduce((sum, inv) => sum + inv.balance, 0)
  const currentReceivables = invoices
    .filter((inv) => new Date(inv.dueDate) >= new Date())
    .reduce((sum, inv) => sum + inv.balance, 0)
  const overdueReceivables = totalReceivables - currentReceivables

  // Handle edit button click
  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsFormOpen(true)
  }

  // Handle delete button click
  const handleDelete = (id: string) => {
    setInvoiceToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Handle view button click
  const handleView = (invoice: Invoice) => {
    setViewInvoice(invoice)
    setIsViewDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete)
      setInvoiceToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle new invoice button click
  const handleNewInvoice = () => {
    setSelectedInvoice(null)
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Receivables"
          value={`₹${(totalReceivables / 100000).toFixed(2)}L`}
          description="Outstanding invoices"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Current"
          value={`₹${(currentReceivables / 100000).toFixed(2)}L`}
          description="Not yet due"
          trend="up"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Overdue"
          value={`₹${(overdueReceivables / 100000).toFixed(2)}L`}
          description="Past due date"
          trend="down"
          icon={<span className="text-lg">₹</span>}
        />
      </div>

      <Tabs defaultValue="invoices" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-8 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Select defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partially paid">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleNewInvoice}>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-right">Balance (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell className="text-right">{invoice.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{invoice.balance.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={invoice.status === "Paid" ? "outline" : "default"}
                          className={
                            invoice.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                              : invoice.status === "Open"
                                ? "bg-sky-50 text-sky-700 border-sky-200 font-medium"
                                : invoice.status === "Overdue"
                                  ? "bg-red-50 text-red-700 border-red-200 font-medium"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200 font-medium"
                          }
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleView(invoice)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(invoice.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search customers..." className="pl-8 w-[300px]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Customer
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Total Due (₹)</TableHead>
                    <TableHead className="text-right">Credit Limit (₹)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Group invoices by customer and calculate total due */}
                  {Array.from(new Set(invoices.map((invoice) => invoice.customer))).map((customer, index) => {
                    const customerInvoices = invoices.filter((invoice) => invoice.customer === customer)
                    const totalDue = customerInvoices.reduce((sum, invoice) => sum + invoice.balance, 0)
                    const creditLimit = 500000 + index * 100000 // Dummy credit limit

                    return (
                      <TableRow key={customer}>
                        <TableCell className="font-medium">{`CUST-${String(index + 1).padStart(3, "0")}`}</TableCell>
                        <TableCell>{customer}</TableCell>
                        <TableCell>{`Contact Person ${index + 1}`}</TableCell>
                        <TableCell>{`contact${index + 1}@example.com`}</TableCell>
                        <TableCell>{`+91 ${Math.floor(Math.random() * 10000000000)
                          .toString()
                          .padStart(10, "0")}`}</TableCell>
                        <TableCell className="text-right">{totalDue.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{creditLimit.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-6 pt-4">
          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Accounts Receivable Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">1-30 Days</TableHead>
                    <TableHead className="text-right">31-60 Days</TableHead>
                    <TableHead className="text-right">61-90 Days</TableHead>
                    <TableHead className="text-right">90+ Days</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Group invoices by customer and calculate aging buckets */}
                  {Array.from(new Set(invoices.map((invoice) => invoice.customer))).map((customer) => {
                    const customerInvoices = invoices.filter((invoice) => invoice.customer === customer)

                    // Calculate days overdue for each invoice
                    const today = new Date()
                    const aging = {
                      current: 0,
                      days1to30: 0,
                      days31to60: 0,
                      days61to90: 0,
                      days90plus: 0,
                    }

                    customerInvoices.forEach((invoice) => {
                      if (invoice.balance <= 0) return

                      const dueDate = new Date(invoice.dueDate)
                      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

                      if (daysDiff <= 0) {
                        aging.current += invoice.balance
                      } else if (daysDiff <= 30) {
                        aging.days1to30 += invoice.balance
                      } else if (daysDiff <= 60) {
                        aging.days31to60 += invoice.balance
                      } else if (daysDiff <= 90) {
                        aging.days61to90 += invoice.balance
                      } else {
                        aging.days90plus += invoice.balance
                      }
                    })

                    const total =
                      aging.current + aging.days1to30 + aging.days31to60 + aging.days61to90 + aging.days90plus

                    return (
                      <TableRow key={customer}>
                        <TableCell>{customer}</TableCell>
                        <TableCell className="text-right">{aging.current.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{aging.days1to30.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{aging.days31to60.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{aging.days61to90.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{aging.days90plus.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-medium">{total.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    )
                  })}

                  {/* Calculate totals for each aging bucket */}
                  {(() => {
                    const today = new Date()
                    const aging = {
                      current: 0,
                      days1to30: 0,
                      days31to60: 0,
                      days61to90: 0,
                      days90plus: 0,
                    }

                    invoices.forEach((invoice) => {
                      if (invoice.balance <= 0) return

                      const dueDate = new Date(invoice.dueDate)
                      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

                      if (daysDiff <= 0) {
                        aging.current += invoice.balance
                      } else if (daysDiff <= 30) {
                        aging.days1to30 += invoice.balance
                      } else if (daysDiff <= 60) {
                        aging.days31to60 += invoice.balance
                      } else if (daysDiff <= 90) {
                        aging.days61to90 += invoice.balance
                      } else {
                        aging.days90plus += invoice.balance
                      }
                    })

                    const total =
                      aging.current + aging.days1to30 + aging.days31to60 + aging.days61to90 + aging.days90plus

                    return (
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{aging.current.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{aging.days1to30.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{aging.days31to60.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{aging.days61to90.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{aging.days90plus.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{total.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    )
                  })()}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Form Dialog */}
      <InvoiceForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialValues={selectedInvoice || undefined}
        invoiceId={selectedInvoice?.id}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice.
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

      {/* View Invoice Dialog */}
      {viewInvoice && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Invoice {viewInvoice.id}</DialogTitle>
              <DialogDescription>Invoice details for {viewInvoice.customer}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                  <p className="text-base">{viewInvoice.customer}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge
                    variant={viewInvoice.status === "Paid" ? "outline" : "default"}
                    className={
                      viewInvoice.status === "Paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium mt-1"
                        : viewInvoice.status === "Open"
                          ? "bg-sky-50 text-sky-700 border-sky-200 font-medium mt-1"
                          : viewInvoice.status === "Overdue"
                            ? "bg-red-50 text-red-700 border-red-200 font-medium mt-1"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 font-medium mt-1"
                    }
                  >
                    {viewInvoice.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Invoice Date</h3>
                  <p className="text-base">{viewInvoice.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <p className="text-base">{viewInvoice.dueDate}</p>
                </div>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price (₹)</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                      <TableHead className="text-right">Tax Rate (%)</TableHead>
                      <TableHead className="text-right">Tax Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.unitPrice.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{item.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{item.taxRate}%</TableCell>
                        <TableCell className="text-right">{item.taxAmount.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border rounded-md p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span>₹{viewInvoice.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tax:</span>
                  <span>
                    ₹{viewInvoice.items.reduce((sum, item) => sum + item.taxAmount, 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{viewInvoice.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span>Balance Due:</span>
                  <span className={viewInvoice.balance > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                    ₹{viewInvoice.balance.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

