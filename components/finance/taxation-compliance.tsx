"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, Plus, Search } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"

// Sample data for taxation and compliance
const taxFilings = [
  {
    id: "GST-2023-06",
    type: "GST",
    period: "June 2023",
    dueDate: "2023-07-20",
    status: "Upcoming",
    amount: 450000,
  },
  {
    id: "TDS-2023-06",
    type: "TDS",
    period: "June 2023",
    dueDate: "2023-07-07",
    status: "Upcoming",
    amount: 125000,
  },
  {
    id: "ADV-2023-Q1",
    type: "Advance Tax",
    period: "Q1 2023-24",
    dueDate: "2023-06-15",
    status: "Filed",
    amount: 750000,
  },
  {
    id: "GST-2023-05",
    type: "GST",
    period: "May 2023",
    dueDate: "2023-06-20",
    status: "Filed",
    amount: 425000,
  },
  {
    id: "TDS-2023-05",
    type: "TDS",
    period: "May 2023",
    dueDate: "2023-06-07",
    status: "Filed",
    amount: 118000,
  },
]

const gstTransactions = [
  {
    id: "INV-2023-0089",
    date: "2023-06-15",
    type: "Sales Invoice",
    party: "Acme Corp",
    taxableAmount: 1500000,
    cgst: 135000,
    sgst: 135000,
    igst: 0,
    total: 1770000,
  },
  {
    id: "INV-2023-0088",
    date: "2023-06-10",
    type: "Sales Invoice",
    party: "TechGiant Inc",
    taxableAmount: 750000,
    cgst: 0,
    sgst: 0,
    igst: 135000,
    total: 885000,
  },
  {
    id: "BILL-2023-0112",
    date: "2023-06-12",
    type: "Purchase Invoice",
    party: "RawMaterials Ltd",
    taxableAmount: 1200000,
    cgst: 108000,
    sgst: 108000,
    igst: 0,
    total: 1416000,
  },
  {
    id: "BILL-2023-0111",
    date: "2023-06-08",
    type: "Purchase Invoice",
    party: "Equipment Suppliers",
    taxableAmount: 550000,
    cgst: 49500,
    sgst: 49500,
    igst: 0,
    total: 649000,
  },
  {
    id: "BILL-2023-0110",
    date: "2023-06-05",
    type: "Purchase Invoice",
    party: "Packaging Solutions",
    taxableAmount: 800000,
    cgst: 0,
    sgst: 0,
    igst: 144000,
    total: 944000,
  },
]

const complianceCalendar = [
  {
    id: "COMP-2023-07-1",
    description: "GST Return Filing - GSTR-1",
    dueDate: "2023-07-11",
    responsibility: "Finance Team",
    status: "Upcoming",
  },
  {
    id: "COMP-2023-07-2",
    description: "GST Return Filing - GSTR-3B",
    dueDate: "2023-07-20",
    responsibility: "Finance Team",
    status: "Upcoming",
  },
  {
    id: "COMP-2023-07-3",
    description: "TDS Payment & Filing",
    dueDate: "2023-07-07",
    responsibility: "Finance Team",
    status: "Upcoming",
  },
  {
    id: "COMP-2023-07-4",
    description: "ESI Payment",
    dueDate: "2023-07-15",
    responsibility: "HR Team",
    status: "Upcoming",
  },
  {
    id: "COMP-2023-07-5",
    description: "PF Payment",
    dueDate: "2023-07-15",
    responsibility: "HR Team",
    status: "Upcoming",
  },
]

export function TaxationCompliance() {
  const [activeTab, setActiveTab] = useState("tax-filings")

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="GST Payable"
          value="₹4.50L"
          description="For current period"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="TDS Payable"
          value="₹1.25L"
          description="For current period"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Upcoming Filings"
          value="5"
          description="Due in next 30 days"
          icon={<span className="text-lg">#</span>}
        />
      </div>

      <Tabs defaultValue="tax-filings" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="tax-filings">Tax Filings</TabsTrigger>
          <TabsTrigger value="gst">GST</TabsTrigger>
          <TabsTrigger value="tds-tcs">TDS/TCS</TabsTrigger>
          <TabsTrigger value="compliance-calendar">Compliance Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="tax-filings" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search filings..." className="pl-8 w-[300px]" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="filed">Filed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
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
                New Filing
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filing ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxFilings.map((filing) => (
                    <TableRow key={filing.id}>
                      <TableCell className="font-medium">{filing.id}</TableCell>
                      <TableCell>{filing.type}</TableCell>
                      <TableCell>{filing.period}</TableCell>
                      <TableCell>{filing.dueDate}</TableCell>
                      <TableCell className="text-right">{filing.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            filing.status === "Filed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                              : filing.status === "Upcoming"
                                ? "bg-sky-50 text-sky-700 border-sky-200 font-medium"
                                : "bg-rose-50 text-rose-700 border-rose-200 font-medium"
                          }
                        >
                          {filing.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="june">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="june">June 2023</SelectItem>
                  <SelectItem value="may">May 2023</SelectItem>
                  <SelectItem value="april">April 2023</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">Generate GST Return</Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">GST Summary - June 2023</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Output Tax</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Taxable Amount</span>
                      <span className="font-medium">₹2,250,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST</span>
                      <span className="font-medium">₹135,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST</span>
                      <span className="font-medium">₹135,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IGST</span>
                      <span className="font-medium">₹135,000</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Output Tax</span>
                      <span className="font-medium">₹405,000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Input Tax</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Taxable Amount</span>
                      <span className="font-medium">₹2,550,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST</span>
                      <span className="font-medium">₹157,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST</span>
                      <span className="font-medium">₹157,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IGST</span>
                      <span className="font-medium">₹144,000</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Input Tax</span>
                      <span className="font-medium">₹459,000</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 border rounded-lg bg-gradient-to-br from-muted/30 to-muted/50 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Net GST Payable/(Refundable)</span>
                  <span className="text-lg font-bold text-red-600">₹(54,000)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">GST Transactions - June 2023</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead className="text-right">Taxable Amount (₹)</TableHead>
                    <TableHead className="text-right">CGST (₹)</TableHead>
                    <TableHead className="text-right">SGST (₹)</TableHead>
                    <TableHead className="text-right">IGST (₹)</TableHead>
                    <TableHead className="text-right">Total (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gstTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.party}</TableCell>
                      <TableCell className="text-right">{transaction.taxableAmount.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{transaction.cgst.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{transaction.sgst.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{transaction.igst.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{transaction.total.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tds-tcs" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="june">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="june">June 2023</SelectItem>
                  <SelectItem value="may">May 2023</SelectItem>
                  <SelectItem value="april">April 2023</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="tds">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tds">TDS</SelectItem>
                  <SelectItem value="tcs">TCS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">Generate TDS Return</Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle>TDS Summary - June 2023</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Payment Amount (₹)</TableHead>
                    <TableHead className="text-right">TDS Rate (%)</TableHead>
                    <TableHead className="text-right">TDS Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>194C</TableCell>
                    <TableCell>Payment to Contractors</TableCell>
                    <TableCell className="text-right">850,000</TableCell>
                    <TableCell className="text-right">2%</TableCell>
                    <TableCell className="text-right">17,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>194J</TableCell>
                    <TableCell>Professional Services</TableCell>
                    <TableCell className="text-right">450,000</TableCell>
                    <TableCell className="text-right">10%</TableCell>
                    <TableCell className="text-right">45,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>194I</TableCell>
                    <TableCell>Rent</TableCell>
                    <TableCell className="text-right">350,000</TableCell>
                    <TableCell className="text-right">10%</TableCell>
                    <TableCell className="text-right">35,000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>194A</TableCell>
                    <TableCell>Interest</TableCell>
                    <TableCell className="text-right">280,000</TableCell>
                    <TableCell className="text-right">10%</TableCell>
                    <TableCell className="text-right">28,000</TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={4}>Total</TableCell>
                    <TableCell className="text-right">125,000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance-calendar" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="july">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="july">July 2023</SelectItem>
                  <SelectItem value="august">August 2023</SelectItem>
                  <SelectItem value="september">September 2023</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Responsibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="finance">Finance Team</SelectItem>
                  <SelectItem value="hr">HR Team</SelectItem>
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
                Add Compliance Task
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Compliance Calendar - July 2023</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Responsibility</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceCalendar.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.id}</TableCell>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>{task.responsibility}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            task.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                              : task.status === "Upcoming"
                                ? "bg-sky-50 text-sky-700 border-sky-200 font-medium"
                                : "bg-rose-50 text-rose-700 border-rose-200 font-medium"
                          }
                        >
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

