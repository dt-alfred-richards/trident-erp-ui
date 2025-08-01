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
import { useFinance, type Bill } from "@/contexts/finance-context"
import { BillForm } from "@/components/finance/bill-form"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { useBillContext } from "./context/bill-context"
import { formatNumberIndian } from "../generic"

export function AccountsPayable() {
  const [activeTab, setActiveTab] = useState("bills")
  const [searchTerm, setSearchTerm] = useState("")
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [billToDelete, setBillToDelete] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewBill, setViewBill] = useState<Bill | null>(null)

  // Pagination state
  const [billCurrentPage, setBillCurrentPage] = useState(1)
  const [billItemsPerPage] = useState(5)
  const [supplierCurrentPage, setSupplierCurrentPage] = useState(1)
  const [supplierItemsPerPage] = useState(5)

  const { data, deleteItem: deleteBill } = useBillContext()

  const bills = useMemo(() => {
    return data.map(item => {
      return ({
        ...item,
        items: JSON.parse(item.items)
      })
    })
  }, [data])

  // Filter bills based on search term and status
  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (`${bill?.id}`).toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || bill.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Calculate pagination for bills
  const indexOfLastBill = billCurrentPage * billItemsPerPage
  const indexOfFirstBill = indexOfLastBill - billItemsPerPage
  const paginatedBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill)

  // Reset bill page when filters change
  useEffect(() => {
    setBillCurrentPage(1)
  }, [searchTerm, statusFilter])

  // Get unique suppliers from bills
  const uniqueSuppliers = Array.from(new Set(bills.map((bill) => bill.supplier)))

  // Filter suppliers based on search term
  const filteredSuppliers = uniqueSuppliers.filter((supplier) =>
    supplier.toLowerCase().includes(supplierSearchTerm.toLowerCase()),
  )

  // Calculate pagination for suppliers
  const indexOfLastSupplier = supplierCurrentPage * supplierItemsPerPage
  const indexOfFirstSupplier = indexOfLastSupplier - supplierItemsPerPage
  const paginatedSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier)

  // Reset supplier page when filters change
  useEffect(() => {
    setSupplierCurrentPage(1)
  }, [supplierSearchTerm])

  const totalPayables = bills.reduce((sum, bill) => sum + bill.balance, 0)
  const currentPayables = bills
    .filter((bill) => new Date(bill.dueDate) >= new Date())
    .reduce((sum, bill) => sum + bill.balance, 0)
  const overduePayables = totalPayables - currentPayables

  // Handle edit button click
  const handleEdit = (bill: Bill) => {
    setSelectedBill({
      ...bill,
      items: bill.items.map((item) => ({
        ...item,
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
    setBillToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Handle view button click
  const handleView = (bill: Bill) => {
    setViewBill(bill)
    setIsViewDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = () => {
    if (billToDelete) {
      deleteBill(parseInt(billToDelete)).then(() => {
        setBillToDelete(null)
        setIsDeleteDialogOpen(false)
      })
    }
  }

  // Handle export functionality
  const handleExport = () => {
    // Determine which data to export based on active tab
    let dataToExport = []
    let filename = ""

    if (activeTab === "bills") {
      dataToExport = filteredBills
      filename = "accounts-payable-bills.csv"
    } else if (activeTab === "suppliers") {
      dataToExport = filteredSuppliers.map((supplier, index) => {
        const supplierBills = bills.filter((bill) => bill.supplier === supplier)
        const totalDue = supplierBills.reduce((sum, bill) => sum + bill.balance, 0)
        const creditLimit = 500000 + index * 100000

        return {
          id: `SUP-${String(index + 1).padStart(3, "0")}`,
          name: supplier,
          contactPerson: `Contact Person ${index + 1}`,
          email: `contact${index + 1}@example.com`,
          phone: `+91 ${Math.floor(Math.random() * 10000000000)
            .toString()
            .padStart(10, "0")}`,
          totalDue,
          creditLimit,
        }
      })
      filename = "accounts-payable-suppliers.csv"
    } else if (activeTab === "aging") {
      // Create aging data for export
      dataToExport = Array.from(new Set(bills.map((bill) => bill.supplier))).map((supplier) => {
        const supplierBills = bills.filter((bill) => bill.supplier === supplier)
        const today = new Date()
        const aging = {
          supplier,
          current: 0,
          days1to30: 0,
          days31to60: 0,
          days61to90: 0,
          days90plus: 0,
          total: 0,
        }

        supplierBills.forEach((bill) => {
          if (bill.balance <= 0) return

          const dueDate = new Date(bill.dueDate)
          const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

          if (daysDiff <= 0) {
            aging.current += bill.balance
          } else if (daysDiff <= 30) {
            aging.days1to30 += bill.balance
          } else if (daysDiff <= 60) {
            aging.days31to60 += bill.balance
          } else if (daysDiff <= 90) {
            aging.days61to90 += bill.balance
          } else {
            aging.days90plus += bill.balance
          }
        })

        aging.total = aging.current + aging.days1to30 + aging.days31to60 + aging.days61to90 + aging.days90plus
        return aging
      })
      filename = "accounts-payable-aging.csv"
    }

    // Convert data to CSV
    if (dataToExport.length > 0) {
      const headers = Object.keys(dataToExport[0])
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) =>
          headers
            .map((header) => {
              const value = row[header]
              // Handle values that might contain commas
              return typeof value === "string" && value.includes(",") ? `"${value}"` : value
            })
            .join(","),
        ),
      ].join("\n")

      // Create download link
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

  // Handle new bill button click
  const handleNewBill = () => {
    setSelectedBill(null)
    setIsFormOpen(true)
  }

  // Handle view supplier details
  const handleViewSupplier = (supplier: string) => {
    // For now, just show the supplier's bills
    const supplierBills = bills.filter((bill) => bill.supplier === supplier)
    if (supplierBills.length > 0) {
      handleView(supplierBills[0])
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Payables"
          value={`₹${formatNumberIndian(totalPayables)}`}
          description="Outstanding bills"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-indigo-500"
          iconBgColor="bg-indigo-500/10"
        />
        <MetricCard
          title="Current"
          value={`₹${formatNumberIndian(currentPayables)}`}
          description="Not yet due"
          trend="up"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-emerald-500"
          iconBgColor="bg-emerald-500/10"
        />
        <MetricCard
          title="Overdue"
          value={`₹${formatNumberIndian(overduePayables)}`}
          description="Past due date"
          trend="down"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-red-500"
          iconBgColor="bg-red-500/10"
        />
      </div>

      <Tabs defaultValue="bills" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="bills"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Bills
          </TabsTrigger>
          <TabsTrigger
            value="suppliers"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Suppliers
          </TabsTrigger>
          <TabsTrigger
            value="aging"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Aging Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search bills..."
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
                onClick={handleNewBill}
                style={{ backgroundColor: "#f8285a", color: "white" }}
                className="hover:bg-[#d92149]"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Bill
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-right">Balance (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBills.length > 0 ? (
                    paginatedBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{`PO-${bill.id}`}</TableCell>
                        <TableCell>{bill.supplier}</TableCell>
                        <TableCell>{bill.date}</TableCell>
                        <TableCell>{bill.dueDate}</TableCell>
                        <TableCell className="text-right">{bill.amount.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{bill.balance.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              bill.status === "Paid"
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800 font-medium"
                                : bill.status === "Open"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 font-medium"
                                  : bill.status === "Overdue"
                                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 font-medium"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800 font-medium"
                            }
                          >
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleView(bill)} className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(bill)} className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(bill.id)}
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
                        No bills found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Bills Pagination */}
          {filteredBills.length > 0 && (
            <DataTablePagination
              totalItems={filteredBills.length}
              itemsPerPage={billItemsPerPage}
              currentPage={billCurrentPage}
              onPageChange={setBillCurrentPage}
            />
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search suppliers..."
                  className="pl-8 w-[300px]"
                  value={supplierSearchTerm}
                  onChange={(e) => setSupplierSearchTerm(e.target.value)}
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
                    <TableHead>Supplier ID</TableHead>
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
                  {paginatedSuppliers.length > 0 ? (
                    paginatedSuppliers.map((supplier, index) => {
                      const supplierBills = bills.filter((bill) => bill.supplier === supplier)
                      const totalDue = supplierBills.reduce((sum, bill) => sum + bill.balance, 0)
                      const creditLimit = 500000 + index * 100000 // Dummy credit limit

                      return (
                        <TableRow key={supplier}>
                          <TableCell className="font-medium">{`SUP-${String(index + 1).padStart(3, "0")}`}</TableCell>
                          <TableCell>{supplier}</TableCell>
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
                              onClick={() => handleViewSupplier(supplier)}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View Supplier</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No suppliers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Suppliers Pagination */}
          {filteredSuppliers.length > 0 && (
            <DataTablePagination
              totalItems={filteredSuppliers.length}
              itemsPerPage={supplierItemsPerPage}
              currentPage={supplierCurrentPage}
              onPageChange={setSupplierCurrentPage}
            />
          )}
        </TabsContent>

        <TabsContent value="aging" className="space-y-6 pt-4">
          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Accounts Payable Aging</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">1-30 Days</TableHead>
                    <TableHead className="text-right">31-60 Days</TableHead>
                    <TableHead className="text-right">61-90 Days</TableHead>
                    <TableHead className="text-right">90+ Days</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Group bills by supplier and calculate aging buckets */}
                  {Array.from(new Set(bills.map((bill) => bill.supplier))).map((supplier) => {
                    const supplierBills = bills.filter((bill) => bill.supplier === supplier)

                    // Calculate days overdue for each bill
                    const today = new Date()
                    const aging = {
                      current: 0,
                      days1to30: 0,
                      days31to60: 0,
                      days61to90: 0,
                      days90plus: 0,
                    }

                    supplierBills.forEach((bill) => {
                      if (bill.balance <= 0) return

                      const dueDate = new Date(bill.dueDate)
                      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

                      if (daysDiff <= 0) {
                        aging.current += bill.balance
                      } else if (daysDiff <= 30) {
                        aging.days1to30 += bill.balance
                      } else if (daysDiff <= 60) {
                        aging.days31to60 += bill.balance
                      } else if (daysDiff <= 90) {
                        aging.days61to90 += bill.balance
                      } else {
                        aging.days90plus += bill.balance
                      }
                    })

                    const total =
                      aging.current + aging.days1to30 + aging.days31to60 + aging.days61to90 + aging.days90plus

                    return (
                      <TableRow key={supplier}>
                        <TableCell>{supplier}</TableCell>
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

                    bills.forEach((bill) => {
                      if (bill.balance <= 0) return

                      const dueDate = new Date(bill.dueDate)
                      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

                      if (daysDiff <= 0) {
                        aging.current += bill.balance
                      } else if (daysDiff <= 30) {
                        aging.days1to30 += bill.balance
                      } else if (daysDiff <= 60) {
                        aging.days31to60 += bill.balance
                      } else if (daysDiff <= 90) {
                        aging.days61to90 += bill.balance
                      } else {
                        aging.days90plus += bill.balance
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

      {/* Bill Form Dialog */}
      <BillForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialValues={selectedBill || {}}
        billId={selectedBill?.id}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bill.
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

      {/* View Bill Dialog */}
      {viewBill && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Bill {viewBill.id}</DialogTitle>
              <DialogDescription>Bill details for {viewBill.supplier}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
                  <p className="text-base">{viewBill.supplier}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge
                    variant="outline"
                    className={
                      viewBill.status === "Paid"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800 font-medium mt-1"
                        : viewBill.status === "Open"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 font-medium mt-1"
                          : viewBill.status === "Overdue"
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800 font-medium mt-1"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800 font-medium mt-1"
                    }
                  >
                    {viewBill.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Bill Date</h3>
                  <p className="text-base">{viewBill.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <p className="text-base">{viewBill.dueDate}</p>
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
                    {viewBill.items.map((item, index) => (
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
                  <span>₹{viewBill.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tax:</span>
                  <span>₹{viewBill.items.reduce((sum, item) => sum + item.taxAmount, 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{viewBill.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span>Balance Due:</span>
                  <span className={viewBill.balance > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                    ₹{viewBill.balance.toLocaleString("en-IN")}
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
