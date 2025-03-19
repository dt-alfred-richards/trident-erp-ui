"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Filter, Plus, Search, Edit, Trash2 } from "lucide-react"
import { useFinance } from "@/contexts/finance-context"
import { JournalEntryForm } from "@/components/finance/journal-entry-form"
import type { JournalEntry } from "@/contexts/finance-context"
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

export function GeneralLedger() {
  const { journalEntries, accounts, deleteJournalEntry } = useFinance()
  const [activeTab, setActiveTab] = useState("journal-entries")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)

  // Filter journal entries based on search term and status
  const filteredEntries = journalEntries.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.debitAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.creditAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || entry.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Handle edit button click
  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsFormOpen(true)
  }

  // Handle delete button click
  const handleDelete = (id: string) => {
    setEntryToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = () => {
    if (entryToDelete) {
      deleteJournalEntry(entryToDelete)
      setEntryToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Handle new journal entry button click
  const handleNewEntry = () => {
    setSelectedEntry(null)
    setIsFormOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="journal-entries" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="journal-entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="chart-of-accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="journal-entries" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search journal entries..."
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
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleNewEntry}>
                <Plus className="h-4 w-4 mr-2" />
                New Journal Entry
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Debit Account</TableHead>
                    <TableHead>Credit Account</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.id}</TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.debitAccount}</TableCell>
                      <TableCell>{entry.creditAccount}</TableCell>
                      <TableCell className="text-right">{entry.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell>{entry.reference}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            entry.status === "Posted"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : entry.status === "Draft"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : entry.status === "Pending"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {entry.status}
                        </span>
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
                            <DropdownMenuItem onClick={() => handleEdit(entry)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(entry.id)}>
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

        <TabsContent value="chart-of-accounts" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search accounts..." className="pl-8 w-[300px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Account
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Balance (₹)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts
                    .filter((account) => !account.parentId)
                    .map((account) => (
                      <>
                        <TableRow key={account.id} className="bg-muted/50">
                          <TableCell className="font-medium">{account.id}</TableCell>
                          <TableCell className="font-medium">{account.name}</TableCell>
                          <TableCell>{account.type}</TableCell>
                          <TableCell className="text-right font-medium">
                            {account.balance.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                        {accounts
                          .filter((subAccount) => subAccount.parentId === account.id)
                          .map((subAccount) => (
                            <TableRow key={subAccount.id}>
                              <TableCell className="pl-8">{subAccount.id}</TableCell>
                              <TableCell>{subAccount.name}</TableCell>
                              <TableCell>{account.type}</TableCell>
                              <TableCell className="text-right">{subAccount.balance.toLocaleString("en-IN")}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial-balance" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="current">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="previous">Previous Month</SelectItem>
                  <SelectItem value="quarter">Current Quarter</SelectItem>
                  <SelectItem value="year">Current Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Trial Balance</CardTitle>
              <CardDescription>As of June 30, 2023</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="[&_tbody_tr:last-child]:border-0">
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit (₹)</TableHead>
                    <TableHead className="text-right">Credit (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Cash</TableCell>
                    <TableCell className="text-right">3,500,000</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Accounts Receivable</TableCell>
                    <TableCell className="text-right">6,300,000</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Inventory</TableCell>
                    <TableCell className="text-right">8,200,000</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Fixed Assets</TableCell>
                    <TableCell className="text-right">12,500,000</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Accounts Payable</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">4,900,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Long-term Liabilities</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">7,500,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Capital</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">10,000,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Retained Earnings</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">4,500,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sales Revenue</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">18,500,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Cost of Goods Sold</TableCell>
                    <TableCell className="text-right">9,800,000</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Operating Expenses</TableCell>
                    <TableCell className="text-right">4,200,000</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Salary Expenses</TableCell>
                    <TableCell className="text-right">6,500,000</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Utilities Expenses</TableCell>
                    <TableCell className="text-right">1,200,000</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">52,200,000</TableCell>
                    <TableCell className="text-right">52,200,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Journal Entry Form Dialog */}
      <JournalEntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialValues={
          selectedEntry
            ? {
                date: selectedEntry.date,
                description: selectedEntry.description,
                debitAccount: selectedEntry.debitAccount,
                creditAccount: selectedEntry.creditAccount,
                amount: selectedEntry.amount,
                reference: selectedEntry.reference,
                status: selectedEntry.status,
              }
            : undefined
        }
        entryId={selectedEntry?.id}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the journal entry.
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
    </div>
  )
}

