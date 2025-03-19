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
import { useFinance, type Bill } from "@/contexts/finance-context"
import { BillForm } from "@/components/finance/bill-form"
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

export function AccountsPayable() {
  const { bills, deleteBill } = useFinance()
  const [activeTab, setActiveTab] = useState("bills")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [billToDelete, setBillToDelete] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewBill, setViewBill] = useState<Bill | null>(null)

  // Filter bills based on search term and status
  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || bill.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const totalPayables = bills.reduce((sum, bill) => sum + bill.balance, 0)
  const currentPayables = bills
    .filter((bill) => new Date(bill.dueDate) >= new Date())
    .reduce((sum, bill) => sum + bill.balance, 0)
  const overduePayables = totalPayables - currentPayables

  // Handle edit button click
  const handleEdit = (bill: Bill) => {
    setSelectedBill(bill)
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
      deleteBill(billToDelete)
      setBillToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle new bill button click
  const handleNewBill = () => {
    setSelectedBill(null)
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Payables"
          value={`₹${(totalPayables / 100000).toFixed(2)}L`}
          description="Outstanding bills"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Current"
          value={`₹${(currentPayables / 100000).toFixed(2)}L`}
          description="Not yet due"
          trend="up"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Overdue"
          value={`₹${(overduePayables / 100000).toFixed(2)}L`}
          description="Past due date"
          trend="down"
          icon={<span className="text-lg">₹</span>}
        />
      </div>

      <Tabs defaultValue="bills" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
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
              <Button size="sm" onClick={handleNewBill}>
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
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.id}</TableCell>
                      <TableCell>{bill.supplier}</TableCell>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell>{bill.dueDate}</TableCell>
                      <TableCell className="text-right">{bill.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{bill.balance.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={bill.status === "Paid" ? "outline" : "default"}
                          className={
                            bill.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                              : bill.status === "Open"
                                ? "bg-sky-50 text-sky-700 border-sky-200 font-medium"
                                : bill.status === "Overdue"
                                  ? "bg-red-50 text-red-700 border-red-200 font-medium"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200 font-medium"
                          }
                        >
                          {bill.status}
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
                            <DropdownMenuItem onClick={() => handleView(bill)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(bill)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(bill.id)}>
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

        <TabsContent value="suppliers" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search suppliers..." className="pl-8 w-[300px]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Supplier
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
                    <TableHead>Payment Terms</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Group bills by supplier and calculate total due */}
                  {Array.from(new Set(bills.map((bill) => bill.supplier))).map((supplier, index) => {
                    const supplierBills = bills.filter((bill) => bill.supplier === supplier)
                    const totalDue = supplierBills.reduce((sum, bill) => sum + bill.balance, 0)

                    return (
                      <TableRow key={supplier}>
                        <TableCell className="font-medium">{`SUPP-${String(index + 1).padStart(3, "0")}`}</TableCell>
                        <TableCell>{supplier}</TableCell>
                        <TableCell>{`Contact Person ${index + 1}`}</TableCell>
                        <TableCell>{`supplier${index + 1}@example.com`}</TableCell>
                        <TableCell>{`+91 ${Math.floor(Math.random() * 10000000000)
                          .toString()
                          .padStart(10, "0")}`}</TableCell>
                        <TableCell className="text-right">{totalDue.toLocaleString("en-IN")}</TableCell>
                        <TableCell>Net 30</TableCell>
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
        initialValues={selectedBill || undefined}
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
                    variant={viewBill.status === "Paid" ? "outline" : "default"}
                    className={
                      viewBill.status === "Paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium mt-1"
                        : viewBill.status === "Open"
                          ? "bg-sky-50 text-sky-700 border-sky-200 font-medium mt-1"
                          : viewBill.status === "Overdue"
                            ? "bg-red-50 text-red-700 border-red-200 font-medium mt-1"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 font-medium mt-1"
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

