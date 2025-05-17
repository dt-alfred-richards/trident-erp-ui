"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, Plus, Search, X } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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
  {
    id: "GST-2023-04",
    type: "GST",
    period: "April 2023",
    dueDate: "2023-05-20",
    status: "Filed",
    amount: 410000,
  },
  {
    id: "TDS-2023-04",
    type: "TDS",
    period: "April 2023",
    dueDate: "2023-05-07",
    status: "Filed",
    amount: 105000,
  },
  {
    id: "ADV-2022-Q4",
    type: "Advance Tax",
    period: "Q4 2022-23",
    dueDate: "2023-03-15",
    status: "Filed",
    amount: 680000,
  },
  {
    id: "GST-2023-07",
    type: "GST",
    period: "July 2023",
    dueDate: "2023-08-20",
    status: "Upcoming",
    amount: 470000,
  },
  {
    id: "TDS-2023-07",
    type: "TDS",
    period: "July 2023",
    dueDate: "2023-08-07",
    status: "Upcoming",
    amount: 130000,
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
  // Adding May transactions for testing
  {
    id: "INV-2023-0075",
    date: "2023-05-25",
    type: "Sales Invoice",
    party: "Global Tech",
    taxableAmount: 1200000,
    cgst: 108000,
    sgst: 108000,
    igst: 0,
    total: 1416000,
  },
  {
    id: "BILL-2023-0098",
    date: "2023-05-18",
    type: "Purchase Invoice",
    party: "Component Suppliers",
    taxableAmount: 650000,
    cgst: 58500,
    sgst: 58500,
    igst: 0,
    total: 767000,
  },
  // Adding April transactions for testing
  {
    id: "INV-2023-0062",
    date: "2023-04-22",
    type: "Sales Invoice",
    party: "Enterprise Solutions",
    taxableAmount: 980000,
    cgst: 88200,
    sgst: 88200,
    igst: 0,
    total: 1156400,
  },
  {
    id: "BILL-2023-0085",
    date: "2023-04-10",
    type: "Purchase Invoice",
    party: "Hardware Depot",
    taxableAmount: 720000,
    cgst: 64800,
    sgst: 64800,
    igst: 0,
    total: 849600,
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
  const { toast } = useToast()

  // Dialog states
  const [newFilingOpen, setNewFilingOpen] = useState(false)
  const [gstReturnOpen, setGstReturnOpen] = useState(false)
  const [tdsReturnOpen, setTdsReturnOpen] = useState(false)
  const [complianceTaskOpen, setComplianceTaskOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  // Filter states
  const [gstPeriod, setGstPeriod] = useState("june")
  const [gstTransactionType, setGstTransactionType] = useState("all")
  const [filteredGstTransactions, setFilteredGstTransactions] = useState(gstTransactions)

  const [complianceMonth, setComplianceMonth] = useState("july")
  const [complianceResponsibility, setComplianceResponsibility] = useState("all")
  const [filteredComplianceCalendar, setFilteredComplianceCalendar] = useState(complianceCalendar)

  // Tax filings filter states
  const [taxFilingStatus, setTaxFilingStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTaxFilings, setFilteredTaxFilings] = useState(taxFilings)

  // Advanced filter states for tax filings
  const [selectedTypes, setSelectedTypes] = useState({
    GST: true,
    TDS: true,
    "Advance Tax": true,
  })
  const [amountRange, setAmountRange] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("all")
  const [isFilterApplied, setIsFilterApplied] = useState(false)

  // Processing states
  const [isProcessing, setIsProcessing] = useState({
    filing: false,
    gst: false,
    tds: false,
    compliance: false,
  })

  // Update filtered GST transactions when filters change
  useEffect(() => {
    const filtered = gstTransactions.filter((transaction) => {
      // Extract month from date (format: YYYY-MM-DD)
      const transactionMonth = transaction.date.split("-")[1]

      // Map month number to month name
      const monthMap = {
        "01": "january",
        "02": "february",
        "03": "march",
        "04": "april",
        "05": "may",
        "06": "june",
        "07": "july",
        "08": "august",
        "09": "september",
        "10": "october",
        "11": "november",
        "12": "december",
      }

      const monthName = monthMap[transactionMonth]

      // Period filter
      const periodMatch = gstPeriod === monthName

      // Transaction type filter
      const typeMatch =
        gstTransactionType === "all"
          ? true
          : gstTransactionType === "sales"
            ? transaction.type.toLowerCase().includes("sales")
            : transaction.type.toLowerCase().includes("purchase")

      return periodMatch && typeMatch
    })

    setFilteredGstTransactions(filtered)
  }, [gstPeriod, gstTransactionType])

  // Update filtered compliance calendar when filters change
  useEffect(() => {
    const filtered = complianceCalendar.filter((task) => {
      // Extract month from due date (format: YYYY-MM-DD)
      const taskMonth = task.dueDate.split("-")[1]

      // Map month number to month name
      const monthMap = {
        "01": "january",
        "02": "february",
        "03": "march",
        "04": "april",
        "05": "may",
        "06": "june",
        "07": "july",
        "08": "august",
        "09": "september",
        "10": "october",
        "11": "november",
        "12": "december",
      }

      const monthName = monthMap[taskMonth]

      // Month filter
      const monthMatch = complianceMonth === monthName

      // Responsibility filter
      const responsibilityMatch =
        complianceResponsibility === "all"
          ? true
          : complianceResponsibility === "finance"
            ? task.responsibility === "Finance Team"
            : task.responsibility === "HR Team"

      return monthMatch && responsibilityMatch
    })

    setFilteredComplianceCalendar(filtered)
  }, [complianceMonth, complianceResponsibility])

  // Update filtered tax filings when filters change
  useEffect(() => {
    const filtered = taxFilings.filter((filing) => {
      // Status filter
      const statusMatch =
        taxFilingStatus === "all" ? true : filing.status.toLowerCase() === taxFilingStatus.toLowerCase()

      // Search query filter
      const searchMatch =
        searchQuery === ""
          ? true
          : filing.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            filing.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            filing.period.toLowerCase().includes(searchQuery.toLowerCase())

      // Type filter
      const typeMatch = selectedTypes[filing.type]

      // Amount range filter
      let amountMatch = true
      if (amountRange === "below-200k") {
        amountMatch = filing.amount < 200000
      } else if (amountRange === "200k-500k") {
        amountMatch = filing.amount >= 200000 && filing.amount <= 500000
      } else if (amountRange === "above-500k") {
        amountMatch = filing.amount > 500000
      }

      // Period filter
      let periodMatch = true
      if (periodFilter === "current-quarter") {
        // Simplified logic for demo - assuming current quarter is Q2 2023
        periodMatch =
          filing.period.includes("Q2 2023") ||
          (filing.period.includes("2023") &&
            (filing.period.includes("April") || filing.period.includes("May") || filing.period.includes("June")))
      } else if (periodFilter === "previous-quarter") {
        // Simplified logic for demo - assuming previous quarter is Q1 2023
        periodMatch =
          filing.period.includes("Q1 2023") ||
          (filing.period.includes("2023") &&
            (filing.period.includes("January") ||
              filing.period.includes("February") ||
              filing.period.includes("March")))
      } else if (periodFilter === "current-year") {
        periodMatch = filing.period.includes("2023")
      }

      return statusMatch && searchMatch && typeMatch && amountMatch && periodMatch
    })

    setFilteredTaxFilings(filtered)
  }, [taxFilingStatus, searchQuery, selectedTypes, amountRange, periodFilter])

  // Handler functions for buttons
  const handleNewFiling = () => {
    setNewFilingOpen(true)
  }

  const handleGenerateGSTReturn = () => {
    setGstReturnOpen(true)
  }

  const handleGenerateTDSReturn = () => {
    setTdsReturnOpen(true)
  }

  const handleAddComplianceTask = () => {
    setComplianceTaskOpen(true)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  const handleTypeFilterChange = (type) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
    setIsFilterApplied(true)
  }

  const handleResetFilters = () => {
    setSelectedTypes({
      GST: true,
      TDS: true,
      "Advance Tax": true,
    })
    setAmountRange("all")
    setPeriodFilter("all")
    setIsFilterApplied(false)
    setFilterDialogOpen(false)
  }

  const handleApplyFilters = () => {
    setIsFilterApplied(true)
    setFilterDialogOpen(false)
  }

  // Submit handlers
  const submitNewFiling = () => {
    setIsProcessing((prev) => ({ ...prev, filing: true }))

    // Simulate API call
    setTimeout(() => {
      setIsProcessing((prev) => ({ ...prev, filing: false }))
      setNewFilingOpen(false)

      toast({
        title: "Success!",
        description: "New tax filing has been created successfully.",
        duration: 3000,
      })

      // Add new filing to the list (in a real app)
    }, 1500)
  }

  const submitGSTReturn = () => {
    setIsProcessing((prev) => ({ ...prev, gst: true }))

    // Simulate API call
    setTimeout(() => {
      setIsProcessing((prev) => ({ ...prev, gst: false }))
      setGstReturnOpen(false)

      toast({
        title: "Success!",
        description: "GST return has been generated successfully.",
        duration: 3000,
      })
    }, 1500)
  }

  const submitTDSReturn = () => {
    setIsProcessing((prev) => ({ ...prev, tds: true }))

    // Simulate API call
    setTimeout(() => {
      setIsProcessing((prev) => ({ ...prev, tds: false }))
      setTdsReturnOpen(false)

      toast({
        title: "Success!",
        description: "TDS return has been generated successfully.",
        duration: 3000,
      })
    }, 1500)
  }

  const submitComplianceTask = () => {
    setIsProcessing((prev) => ({ ...prev, compliance: true }))

    // Simulate API call
    setTimeout(() => {
      setIsProcessing((prev) => ({ ...prev, compliance: false }))
      setComplianceTaskOpen(false)

      toast({
        title: "Success!",
        description: "New compliance task has been added successfully.",
        duration: 3000,
      })

      // Add new task to the list (in a real app)
    }, 1500)
  }

  const handleExport = () => {
    // Determine which data to export based on active tab
    let data = []
    let headers = []
    let filename = ""

    if (activeTab === "tax-filings") {
      data = filteredTaxFilings
      headers = ["Filing ID", "Type", "Period", "Due Date", "Amount", "Status"]
      filename = "tax-filings-export.csv"
    } else if (activeTab === "gst") {
      data = filteredGstTransactions // Export only filtered data
      headers = ["Invoice #", "Date", "Type", "Party", "Taxable Amount", "CGST", "SGST", "IGST", "Total"]
      filename = "gst-transactions-export.csv"
    } else if (activeTab === "tds-tcs") {
      // Using sample TDS data since we don't have a direct array in the component
      data = [
        { section: "194C", description: "Payment to Contractors", amount: 850000, rate: "2%", tdsAmount: 17000 },
        { section: "194J", description: "Professional Services", amount: 450000, rate: "10%", tdsAmount: 45000 },
        { section: "194I", description: "Rent", amount: 350000, rate: "10%", tdsAmount: 35000 },
        { section: "194A", description: "Interest", amount: 280000, rate: "10%", tdsAmount: 28000 },
      ]
      headers = ["Section", "Description", "Payment Amount", "TDS Rate", "TDS Amount"]
      filename = "tds-data-export.csv"
    } else if (activeTab === "compliance-calendar") {
      data = filteredComplianceCalendar // Export only filtered data
      headers = ["Task ID", "Description", "Due Date", "Responsibility", "Status"]
      filename = "compliance-calendar-export.csv"
    }

    // Convert data to CSV
    let csvContent = headers.join(",") + "\n"

    data.forEach((item) => {
      let row = []
      if (activeTab === "tax-filings") {
        row = [item.id, item.type, item.period, item.dueDate, item.amount, item.status]
      } else if (activeTab === "gst") {
        row = [
          item.id,
          item.date,
          item.type,
          item.party,
          item.taxableAmount,
          item.cgst,
          item.sgst,
          item.igst,
          item.total,
        ]
      } else if (activeTab === "tds-tcs") {
        row = [item.section, item.description, item.amount, item.rate, item.tdsAmount]
      } else if (activeTab === "compliance-calendar") {
        row = [item.id, item.description, item.dueDate, item.responsibility, item.status]
      }

      // Format the row and escape commas in text
      const formattedRow = row.map((cell) => {
        if (typeof cell === "string" && cell.includes(",")) {
          return `"${cell}"`
        }
        return cell
      })

      csvContent += formattedRow.join(",") + "\n"
    })

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

    toast({
      title: "Export Successful",
      description: `${filename} has been downloaded.`,
      duration: 3000,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="GST Payable"
          value="₹4.50L"
          description="For current period"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
        />
        <MetricCard
          title="TDS Payable"
          value="₹1.25L"
          description="For current period"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <MetricCard
          title="Upcoming Filings"
          value="5"
          description="Due in next 30 days"
          icon={<span className="text-lg">#</span>}
          iconColor="text-amber-500"
          iconBgColor="bg-amber-500/10"
        />
      </div>

      {/* New Filing Dialog */}
      <Dialog open={newFilingOpen} onOpenChange={setNewFilingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Tax Filing</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="filing-type" className="text-right">
                Type
              </label>
              <Select defaultValue="gst">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select filing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gst">GST</SelectItem>
                  <SelectItem value="tds">TDS</SelectItem>
                  <SelectItem value="advance">Advance Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="period" className="text-right">
                Period
              </label>
              <Select defaultValue="july2023">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="july2023">July 2023</SelectItem>
                  <SelectItem value="aug2023">August 2023</SelectItem>
                  <SelectItem value="sep2023">September 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="amount" className="text-right">
                Amount (₹)
              </label>
              <Input id="amount" defaultValue="450000" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFilingOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitNewFiling}
              disabled={isProcessing.filing}
              className="bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-white"
            >
              {isProcessing.filing ? <>Processing...</> : <>Create Filing</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GST Return Dialog */}
      <Dialog open={gstReturnOpen} onOpenChange={setGstReturnOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate GST Return</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="gst-period" className="text-right">
                Period
              </label>
              <Select defaultValue="june2023">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="june2023">June 2023</SelectItem>
                  <SelectItem value="may2023">May 2023</SelectItem>
                  <SelectItem value="april2023">April 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="gst-type" className="text-right">
                Return Type
              </label>
              <Select defaultValue="gstr1">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select return type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gstr1">GSTR-1</SelectItem>
                  <SelectItem value="gstr3b">GSTR-3B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGstReturnOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitGSTReturn}
              disabled={isProcessing.gst}
              className="bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-white"
            >
              {isProcessing.gst ? <>Processing...</> : <>Generate Return</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TDS Return Dialog */}
      <Dialog open={tdsReturnOpen} onOpenChange={setTdsReturnOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate TDS Return</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tds-period" className="text-right">
                Period
              </label>
              <Select defaultValue="june2023">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="june2023">June 2023</SelectItem>
                  <SelectItem value="may2023">May 2023</SelectItem>
                  <SelectItem value="april2023">April 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="tds-form" className="text-right">
                Form
              </label>
              <Select defaultValue="form26q">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form26q">Form 26Q</SelectItem>
                  <SelectItem value="form27q">Form 27Q</SelectItem>
                  <SelectItem value="form24q">Form 24Q</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTdsReturnOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitTDSReturn}
              disabled={isProcessing.tds}
              className="bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-white"
            >
              {isProcessing.tds ? <>Processing...</> : <>Generate Return</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compliance Task Dialog */}
      <Dialog open={complianceTaskOpen} onOpenChange={setComplianceTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Compliance Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="task-description" className="text-right">
                Description
              </label>
              <Input id="task-description" placeholder="Enter task description" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="due-date" className="text-right">
                Due Date
              </label>
              <Input id="due-date" type="date" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="responsibility" className="text-right">
                Responsibility
              </label>
              <Select defaultValue="finance">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finance">Finance Team</SelectItem>
                  <SelectItem value="hr">HR Team</SelectItem>
                  <SelectItem value="legal">Legal Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComplianceTaskOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitComplianceTask}
              disabled={isProcessing.compliance}
              className="bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-white"
            >
              {isProcessing.compliance ? <>Processing...</> : <>Add Task</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div>
              <h3 className="mb-3 text-sm font-medium">Filing Type</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gst-type"
                    checked={selectedTypes["GST"]}
                    onCheckedChange={() => handleTypeFilterChange("GST")}
                  />
                  <label htmlFor="gst-type" className="text-sm">
                    GST
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tds-type"
                    checked={selectedTypes["TDS"]}
                    onCheckedChange={() => handleTypeFilterChange("TDS")}
                  />
                  <label htmlFor="tds-type" className="text-sm">
                    TDS
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="advance-tax-type"
                    checked={selectedTypes["Advance Tax"]}
                    onCheckedChange={() => handleTypeFilterChange("Advance Tax")}
                  />
                  <label htmlFor="advance-tax-type" className="text-sm">
                    Advance Tax
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium">Amount Range</h3>
              <RadioGroup value={amountRange} onValueChange={setAmountRange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-amount" />
                  <Label htmlFor="all-amount">All Amounts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="below-200k" id="below-200k" />
                  <Label htmlFor="below-200k">Below ₹2,00,000</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="200k-500k" id="200k-500k" />
                  <Label htmlFor="200k-500k">₹2,00,000 - ₹5,00,000</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="above-500k" id="above-500k" />
                  <Label htmlFor="above-500k">Above ₹5,00,000</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium">Period</h3>
              <RadioGroup value={periodFilter} onValueChange={setPeriodFilter}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all-period" />
                  <Label htmlFor="all-period">All Periods</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current-quarter" id="current-quarter" />
                  <Label htmlFor="current-quarter">Current Quarter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="previous-quarter" id="previous-quarter" />
                  <Label htmlFor="previous-quarter">Previous Quarter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current-year" id="current-year" />
                  <Label htmlFor="current-year">Current Year</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button onClick={handleApplyFilters} className="bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-white">
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="tax-filings" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="tax-filings"
            className="rounded-none data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:bg-[#ffffff] dark:data-[state=active]:bg-[#0f1729]"
          >
            Tax Filings
          </TabsTrigger>
          <TabsTrigger
            value="gst"
            className="rounded-none data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:bg-[#ffffff] dark:data-[state=active]:bg-[#0f1729]"
          >
            GST
          </TabsTrigger>
          <TabsTrigger
            value="tds-tcs"
            className="rounded-none data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:bg-[#ffffff] dark:data-[state=active]:bg-[#0f1729]"
          >
            TDS/TCS
          </TabsTrigger>
          <TabsTrigger
            value="compliance-calendar"
            className="rounded-none data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:bg-[#ffffff] dark:data-[state=active]:bg-[#0f1729]"
          >
            Compliance Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tax-filings" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search filings..."
                  className="pl-8 w-[300px]"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery && (
                  <button
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    onClick={handleClearSearch}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={isFilterApplied ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {isFilterApplied ? "Filters Applied" : "Filter"}
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Select value={taxFilingStatus} onValueChange={setTaxFilingStatus}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-white" onClick={handleNewFiling}>
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
                  {filteredTaxFilings.length > 0 ? (
                    filteredTaxFilings.map((filing) => (
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
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 font-medium"
                                : filing.status === "Upcoming"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800 font-medium"
                                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800 font-medium"
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No tax filings found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select value={gstPeriod} onValueChange={setGstPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="june">June 2023</SelectItem>
                  <SelectItem value="may">May 2023</SelectItem>
                  <SelectItem value="april">April 2023</SelectItem>
                </SelectContent>
              </Select>
              <Select value={gstTransactionType} onValueChange={setGstTransactionType}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                className="bg-[#1b84ff] hover:bg-[#0a6edf] text-white"
                onClick={handleGenerateGSTReturn}
              >
                Generate GST Return
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">
                GST Summary - {gstPeriod.charAt(0).toUpperCase() + gstPeriod.slice(1)} 2023
              </CardTitle>
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
              <CardTitle className="text-lg font-semibold">
                GST Transactions - {gstPeriod.charAt(0).toUpperCase() + gstPeriod.slice(1)} 2023
                {gstTransactionType !== "all" &&
                  ` (${gstTransactionType.charAt(0).toUpperCase() + gstTransactionType.slice(1)} Only)`}
              </CardTitle>
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
                  {filteredGstTransactions.length > 0 ? (
                    filteredGstTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>{transaction.party}</TableCell>
                        <TableCell className="text-right">
                          {transaction.taxableAmount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right">{transaction.cgst.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{transaction.sgst.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{transaction.igst.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right">{transaction.total.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                        No transactions found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                className="bg-[#1b84ff] hover:bg-[#0a6edf] text-white"
                onClick={handleGenerateTDSReturn}
              >
                Generate TDS Return
              </Button>
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
              <Select value={complianceMonth} onValueChange={setComplianceMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="july">July 2023</SelectItem>
                  <SelectItem value="august">August 2023</SelectItem>
                  <SelectItem value="september">September 2023</SelectItem>
                </SelectContent>
              </Select>
              <Select value={complianceResponsibility} onValueChange={setComplianceResponsibility}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                className="bg-[#1b84ff] hover:bg-[#0a6edf] text-white"
                onClick={handleAddComplianceTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Compliance Task
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">
                Compliance Calendar - {complianceMonth.charAt(0).toUpperCase() + complianceMonth.slice(1)} 2023
                {complianceResponsibility !== "all" &&
                  ` (${complianceResponsibility === "finance" ? "Finance Team" : "HR Team"})`}
              </CardTitle>
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
                  {filteredComplianceCalendar.length > 0 ? (
                    filteredComplianceCalendar.map((task) => (
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
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 font-medium"
                                : task.status === "Upcoming"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800 font-medium"
                                  : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800 font-medium"
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No compliance tasks found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
