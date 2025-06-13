"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { useFinance, type Invoice } from "@/contexts/finance-context"
import { InvoiceForm } from "@/components/finance/invoice-form"
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
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { useInvoiceContext } from "./context/invoice-context"
import { getCummulativeSum } from "../generic"

export function AccountsReceivable() {
  const [activeTab, setActiveTab] = useState("invoices")
  const [searchTerm, setSearchTerm] = useState("")
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  // Pagination state
  const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1)
  const [invoiceItemsPerPage] = useState(5)
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1)
  const [customerItemsPerPage] = useState(5)
  const { data, deleteItem: deleteInvoice } = useInvoiceContext()
  const invoices = useMemo(() => {
    return data.map(item => {
      const items = JSON.parse(item.items)
      return ({
        id: item.id + '',
        customer: item.customer,
        date: item.date,
        dueDate: item.dueDate,
        amount: item?.total || 0,
        balance: (item?.total || 0) - (item?.subtotal || 0),
        status: item.status,
        items
      })
    })
  }, [data])

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })


  // Calculate pagination for invoices
  const indexOfLastInvoice = invoiceCurrentPage * invoiceItemsPerPage
  const indexOfFirstInvoice = indexOfLastInvoice - invoiceItemsPerPage
  const paginatedInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice)

  // Reset invoice page when filters change
  useEffect(() => {
    setInvoiceCurrentPage(1)
  }, [searchTerm, statusFilter])

  // Get unique customers from invoices
  const uniqueCustomers = Array.from(new Set(invoices.map((invoice) => invoice.customer)))

  // Filter customers based on search term
  const filteredCustomers = uniqueCustomers.filter((customer) =>
    customer.toLowerCase().includes(customerSearchTerm.toLowerCase()),
  )

  // Calculate pagination for customers
  const indexOfLastCustomer = customerCurrentPage * customerItemsPerPage
  const indexOfFirstCustomer = indexOfLastCustomer - customerItemsPerPage
  const paginatedCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer)

  // Reset customer page when filters change
  useEffect(() => {
    setCustomerCurrentPage(1)
  }, [customerSearchTerm])

  const totalReceivables = invoices.reduce((sum, inv) => sum + inv.balance, 0)
  const currentReceivables = invoices
    .filter((inv) => new Date(inv.dueDate) >= new Date())
    .reduce((sum, inv) => sum + inv.balance, 0)
  const overdueReceivables = totalReceivables - currentReceivables

  // Handle edit button click
  const handleEdit = (invoice: Invoice) => {
    // Make sure we're passing the complete invoice object
    setSelectedInvoice({
      ...invoice,
      // Ensure items array is properly formatted
      items: invoice.items.map((item) => ({
        ...item,
        // Convert any string numbers to actual numbers if needed
        quantity: typeof item.quantity === "string" ? Number.parseFloat(item.quantity) : item.quantity,
        unitPrice: typeof item.unitPrice === "string" ? Number.parseFloat(item.unitPrice) : item.unitPrice,
        amount: typeof item.amount === "string" ? Number.parseFloat(item.amount) : item.amount,
        taxRate: typeof item.taxRate === "string" ? Number.parseFloat(item.taxRate) : item.taxRate,
        taxAmount: typeof item.taxAmount === "string" ? Number.parseFloat(item.taxAmount) : item.taxAmount,
      })),
    })
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
      deleteInvoice(parseInt(invoiceToDelete)).then(()=>{
        setInvoiceToDelete(null)
        setIsDeleteDialogOpen(false)
      })
    }
  }

  // Handle new invoice button click
  const handleNewInvoice = () => {
    setSelectedInvoice(null)
    setIsFormOpen(true)
  }

  // Handle view customer details
  const handleViewCustomer = (customer: string) => {
    // For now, just show the customer's invoices
    const customerInvoices = invoices.filter((invoice) => invoice.customer === customer)
    if (customerInvoices.length > 0) {
      handleView(customerInvoices[0])
    }
  }

  // Handle export functionality
  const handleExport = () => {
    let dataToExport = []
    let filename = "accounts-receivable.csv"

    if (activeTab === "invoices") {
      // Export invoices data
      dataToExport = filteredInvoices.map((invoice) => ({
        "Invoice #": invoice.id,
        Customer: invoice.customer,
        Date: invoice.date,
        "Due Date": invoice.dueDate,
        "Amount (₹)": invoice.amount,
        "Balance (₹)": invoice.balance,
        Status: invoice.status,
      }))
      filename = "accounts-receivable-invoices.csv"
    } else if (activeTab === "customers") {
      // Export customers data
      dataToExport = paginatedCustomers.map((customer, index) => {
        const customerInvoices = invoices.filter((invoice) => invoice.customer === customer)
        const totalDue = customerInvoices.reduce((sum, invoice) => sum + invoice.balance, 0)
        const creditLimit = 500000 + index * 100000 // Dummy credit limit

        return {
          "Customer ID": `CUST-${String(index + 1).padStart(3, "0")}`,
          Name: customer,
          "Contact Person": `Contact Person ${index + 1}`,
          Email: `contact${index + 1}@example.com`,
          Phone: `+91 ${Math.floor(Math.random() * 10000000000)
            .toString()
            .padStart(10, "0")}`,
          "Total Due (₹)": totalDue,
          "Credit Limit (₹)": creditLimit,
        }
      })
      filename = "accounts-receivable-customers.csv"
    } else if (activeTab === "aging") {
      // Export aging data
      const today = new Date()
      dataToExport = Array.from(new Set(invoices.map((invoice) => invoice.customer))).map((customer) => {
        const customerInvoices = invoices.filter((invoice) => invoice.customer === customer)

        // Calculate days overdue for each invoice
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

        const total = aging.current + aging.days1to30 + aging.days31to60 + aging.days61to90 + aging.days90plus

        return {
          Customer: customer,
          Current: aging.current,
          "1-30 Days": aging.days1to30,
          "31-60 Days": aging.days31to60,
          "61-90 Days": aging.days61to90,
          "90+ Days": aging.days90plus,
          Total: total,
        }
      })
      filename = "accounts-receivable-aging.csv"
    }

    // Convert to CSV
    if (dataToExport.length > 0) {
      const headers = Object.keys(dataToExport[0])
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              // Add quotes around values that contain commas
              return typeof value === "string" && value.includes(",") ? `"${value}"` : value
            })
            .join(","),
        ),
      ].join("\n")

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Receivables"
          value={`₹${(totalReceivables / 100000).toFixed(2)}L`}
          description="Outstanding invoices"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <MetricCard
          title="Current"
          value={`₹${(currentReceivables / 100000).toFixed(2)}L`}
          description="Not yet due"
          trend="up"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-emerald-500"
          iconBgColor="bg-emerald-500/10"
        />
        <MetricCard
          title="Overdue"
          value={`₹${(overdueReceivables / 100000).toFixed(2)}L`}
          description="Past due date"
          trend="down"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-red-500"
          iconBgColor="bg-red-500/10"
        />
      </div>

      <Tabs defaultValue="invoices" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="invoices"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Invoices
          </TabsTrigger>
          <TabsTrigger
            value="customers"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Customers
          </TabsTrigger>
          <TabsTrigger
            value="aging"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Aging Analysis
          </TabsTrigger>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={handleNewInvoice}
                style={{ backgroundColor: "#43ced7", color: "white" }}
                className="hover:bg-[#36a8b0]"
              >
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
                  {paginatedInvoices.length > 0 ? (
                    paginatedInvoices.map((invoice) => (
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
                                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                                : invoice.status === "Open"
                                  ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                                  : invoice.status === "Overdue"
                                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                                    : "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleView(invoice)} className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(invoice)} className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(invoice.id)}
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
                      <TableCell colSpan={8} className="h-24 text-center">
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Invoices Pagination */}
          {filteredInvoices.length > 0 && (
            <DataTablePagination
              totalItems={filteredInvoices.length}
              itemsPerPage={invoiceItemsPerPage}
              currentPage={invoiceCurrentPage}
              onPageChange={setInvoiceCurrentPage}
            />
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="pl-8 w-[300px]"
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
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
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer, index) => {
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewCustomer(customer)}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Customer</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Customers Pagination */}
          {filteredCustomers.length > 0 && (
            <DataTablePagination
              totalItems={filteredCustomers.length}
              itemsPerPage={customerItemsPerPage}
              currentPage={customerCurrentPage}
              onPageChange={setCustomerCurrentPage}
            />
          )}
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
                        ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400 mt-1"
                        : viewInvoice.status === "Open"
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400 mt-1"
                          : viewInvoice.status === "Overdue"
                            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 mt-1"
                            : "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 mt-1"
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
