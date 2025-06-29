"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useFinance } from "@/contexts/finance-context"
import { useToast } from "@/hooks/use-toast"

// GSTR-1 Report Component
function GSTR1Report({ data, onExport }) {
  const totalTaxableValue = data.reduce((sum, item) => sum + item.taxableAmount, 0)
  const totalCGST = data.reduce((sum, item) => sum + item.cgst, 0)
  const totalSGST = data.reduce((sum, item) => sum + item.sgst, 0)
  const totalIGST = data.reduce((sum, item) => sum + item.igst, 0)
  const totalTaxAmount = totalCGST + totalSGST + totalIGST // Sum of all taxes
  const totalGST = totalTaxableValue + totalTaxAmount // Total with tax

  return (
    <div className="p-6 space-y-6">
      <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-semibold">GSTR-1 Summary (Outward Supplies)</CardTitle>
          <CardDescription>Summary of sales and outward supplies for the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Taxable Value</div>
              <div className="text-xl font-bold">₹{totalTaxableValue.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total CGST</div>
              <div className="text-xl font-bold">₹{totalCGST.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total SGST</div>
              <div className="text-xl font-bold">₹{totalSGST.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total IGST</div>
              <div className="text-xl font-bold">₹{totalIGST.toLocaleString("en-IN")}</div>
            </div>
          </div>
          <div className="mt-6 p-4 border rounded-lg bg-gradient-to-br from-muted/30 to-muted/50 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Output Tax Liability</span>
              <span className="text-lg font-bold text-purple-600">₹{totalGST.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end items-center bg-muted/30 p-4 rounded-lg mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onExport(data, "GSTR-1", [
              "Invoice #",
              "Date",
              "Party",
              "Taxable Amount",
              "CGST (%)",
              "SGST (%)",
              "IGST (%)",
              "Tax Amount", // New header
              "Total",
            ])
          }
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-semibold">Detailed Outward Supplies</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Party</TableHead>
                <TableHead className="text-right">Taxable Amount (₹)</TableHead>
                <TableHead className="text-right">CGST (₹) (%)</TableHead>
                <TableHead className="text-right">SGST (₹) (%)</TableHead>
                <TableHead className="text-right">IGST (₹) (%)</TableHead>
                <TableHead className="text-right">Tax Amount (₹)</TableHead> {/* New column header */}
                <TableHead className="text-right">Total (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.party}</TableCell>
                    <TableCell className="text-right">{item.taxableAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right">
                      {item.cgst.toLocaleString("en-IN")} ({item.gstPercentage}%)
                    </TableCell>
                    <TableCell className="text-right">
                      {item.sgst.toLocaleString("en-IN")} ({item.gstPercentage}%)
                    </TableCell>
                    <TableCell className="text-right">
                      {item.igst.toLocaleString("en-IN")} ({item.gstPercentage}%)
                    </TableCell>
                    <TableCell className="text-right">
                      {(item.cgst + item.sgst + item.igst).toLocaleString("en-IN")}
                    </TableCell>
                    {/* New column data */}
                    <TableCell className="text-right">{item.total.toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    {/* Updated colSpan */}
                    No outward supplies found for the selected period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// GSTR-2A/2B Report Component
function GSTR2A2BReport({ data, onExport }) {
  const totalTaxableValue = data.reduce((sum, item) => sum + item.taxableAmount, 0)
  const totalCGST = data.reduce((sum, item) => sum + item.cgst, 0)
  const totalSGST = data.reduce((sum, item) => sum + item.sgst, 0)
  const totalIGST = data.reduce((sum, item) => sum + item.igst, 0)
  const totalTaxAmount = totalCGST + totalSGST + totalIGST // Sum of all taxes
  const totalITC = totalTaxableValue + totalTaxAmount // Total with tax

  return (
    <div className="p-6 space-y-6">
      <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-semibold">GSTR-2A/2B Summary (Inward Supplies & ITC)</CardTitle>
          <CardDescription>Summary of purchases and input tax credit for the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Taxable Value</div>
              <div className="text-xl font-bold">₹{totalTaxableValue.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total CGST ITC</div>
              <div className="text-xl font-bold">₹{totalCGST.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total SGST ITC</div>
              <div className="text-xl font-bold">₹{totalSGST.toLocaleString("en-IN")}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total IGST ITC</div>
              <div className="text-xl font-bold">₹{totalIGST.toLocaleString("en-IN")}</div>
            </div>
          </div>
          <div className="mt-6 p-4 border rounded-lg bg-gradient-to-br from-muted/30 to-muted/50 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total Input Tax Credit Available</span>
              <span className="text-lg font-bold text-blue-600">₹{totalITC.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end items-center bg-muted/30 p-4 rounded-lg mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onExport(data, "GSTR-2A-2B", [
              "Bill #",
              "Date",
              "Party",
              "Taxable Amount",
              "CGST (%)",
              "SGST (%)",
              "IGST (%)",
              "Tax Amount", // New header
              "Total",
            ])
          }
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-semibold">Detailed Inward Supplies</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Party</TableHead>
                <TableHead className="text-right">Taxable Amount (₹)</TableHead>
                <TableHead className="text-right">CGST (₹) (%)</TableHead>
                <TableHead className="text-right">SGST (₹) (%)</TableHead>
                <TableHead className="text-right">IGST (₹) (%)</TableHead>
                <TableHead className="text-right">Tax Amount (₹)</TableHead> {/* New column header */}
                <TableHead className="text-right">Total (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.party}</TableCell>
                    <TableCell className="text-right">{item.taxableAmount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right">
                      {item.cgst.toLocaleString("en-IN")} ({item.gstPercentage}%)
                    </TableCell>
                    <TableCell className="text-right">
                      {item.sgst.toLocaleString("en-IN")} ({item.gstPercentage}%)
                    </TableCell>
                    <TableCell className="text-right">
                      {item.igst.toLocaleString("en-IN")} ({item.gstPercentage}%)
                    </TableCell>
                    <TableCell className="text-right">
                      {(item.cgst + item.sgst + item.igst).toLocaleString("en-IN")}
                    </TableCell>
                    {/* New column data */}
                    <TableCell className="text-right">{item.total.toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                    {/* Updated colSpan */}
                    No inward supplies found for the selected period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// GSTR-3B Report Component
function GSTR3BReport({ outputTax, inputTax, netTax, onExport }) {
  const getNetStatus = (amount: number) => {
    if (amount > 0) return { text: "Payable", color: "text-red-600" }
    if (amount < 0) return { text: "Refundable", color: "text-green-600" }
    return { text: "Balanced", color: "text-gray-600" }
  }

  const exportData = [
    { type: "Output CGST", amount: outputTax.cgst },
    { type: "Output SGST", amount: outputTax.sgst },
    { type: "Output IGST", amount: outputTax.igst },
    { type: "Total Output Tax", amount: outputTax.total },
    { type: "Input CGST", amount: inputTax.cgst },
    { type: "Input SGST", amount: inputTax.sgst },
    { type: "Input IGST", amount: inputTax.igst },
    { type: "Total Input Tax", amount: inputTax.total },
    { type: "Net CGST", amount: netTax.cgst },
    { type: "Net SGST", amount: netTax.sgst },
    { type: "Net IGST", amount: netTax.igst },
    { type: "Net Total Tax", amount: netTax.total },
  ]

  return (
    <div className="p-6 space-y-6">
      <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-semibold">GSTR-3B Summary (Consolidated)</CardTitle>
          <CardDescription>Consolidated summary of outward and inward supplies, and net tax liability.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Output Tax Liability (from GSTR-1)</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>CGST</span>
                  <span className="font-medium">₹{outputTax.cgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST</span>
                  <span className="font-medium">₹{outputTax.sgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGST</span>
                  <span className="font-medium">₹{outputTax.igst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Output Tax</span>
                  <span className="font-medium">₹{outputTax.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Input Tax Credit (ITC) Available (from GSTR-2A/2B)</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>CGST</span>
                  <span className="font-medium">₹{inputTax.cgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST</span>
                  <span className="font-medium">₹{inputTax.sgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGST</span>
                  <span className="font-medium">₹{inputTax.igst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Input Tax Credit</span>
                  <span className="font-medium">₹{inputTax.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 border rounded-lg bg-gradient-to-br from-muted/30 to-muted/50 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Net GST Payable / (Refundable)</span>
              <span className={`text-lg font-bold ${getNetStatus(netTax.total).color}`}>
                ₹{netTax.total.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <div className="text-muted-foreground">Net CGST</div>
                <div className={`font-semibold ${getNetStatus(netTax.cgst).color}`}>
                  ₹{netTax.cgst.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Net SGST</div>
                <div className={`font-semibold ${getNetStatus(netTax.sgst).color}`}>
                  ₹{netTax.sgst.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Net IGST</div>
                <div className={`font-semibold ${getNetStatus(netTax.igst).color}`}>
                  ₹{netTax.igst.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end items-center bg-muted/30 p-4 rounded-lg mb-4">
        <Button variant="outline" size="sm" onClick={() => onExport(exportData, "GSTR-3B", ["Type", "Amount"])}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}

export function GSTRDashboard() {
  const [activeTab, setActiveTab] = useState("gstr3b")
  const { toast } = useToast()
  const { journalEntries, trialBalance = [], customers = [], suppliers = [] } = useFinance() // Destructure customers and suppliers

  // Helper function to get balance for a specific account from trialBalance
  const getBalanceFromTrialBalance = (accountName: string): number => {
    const entry = trialBalance.find((tb) => tb.account === accountName)
    if (!entry) return 0
    // Assets (Input Tax) have a debit balance (debit - credit)
    // Liabilities (Output Tax) have a credit balance (credit - debit)
    if (entry.accountType === "Asset" || entry.accountType === "Expense") {
      return entry.debit - entry.credit
    } else {
      return entry.credit - entry.debit
    }
  }

  // Calculate GSTR-1 (Output Tax) from trial balance
  const outputCGST = getBalanceFromTrialBalance("CGST Output")
  const outputSGST = getBalanceFromTrialBalance("SGST Output")
  const outputIGST = getBalanceFromTrialBalance("IGST Output")
  const totalOutputTax = outputCGST + outputSGST + outputIGST

  const gstr1Summary = {
    cgst: outputCGST,
    sgst: outputSGST,
    igst: outputIGST,
    total: totalOutputTax,
  }

  // Calculate GSTR-2A/2B (Input Tax) from trial balance
  const inputCGST = getBalanceFromTrialBalance("CGST Input")
  const inputSGST = getBalanceFromTrialBalance("SGST Input")
  const inputIGST = getBalanceFromTrialBalance("IGST Input")
  const totalInputTax = inputCGST + inputSGST + inputIGST

  const gstr2a2bSummary = {
    cgst: inputCGST,
    sgst: inputSGST,
    igst: inputIGST,
    total: totalInputTax,
  }

  // Calculate GSTR-3B (Net Tax)
  const netCGST = outputCGST - inputCGST
  const netSGST = outputSGST - inputSGST
  const netIGST = outputIGST - inputIGST
  const netTotalTax = netCGST + netSGST + netIGST

  const gstr3bSummary = {
    cgst: netCGST,
    sgst: netSGST,
    igst: netIGST,
    total: netTotalTax,
  }

  // Dynamically filter and process journal entries for GSTR-1 and GSTR-2A/2B detailed tables
  const gstr1Transactions = journalEntries
    .filter(
      (entry) =>
        entry.status === "Posted" && // Only consider posted entries
        entry.gstPercentage &&
        entry.gstPercentage > 0 &&
        entry.creditAccount === "Sales Revenue", // Sales transactions
    )
    .map((entry) => {
      const taxableAmount = entry.amount
      const gstAmount = taxableAmount * (entry.gstPercentage / 100)
      const total = taxableAmount + gstAmount
      const partyName = customers.find((c) => c.id === entry.debtorCustomer)?.name || entry.debtorCustomer || "N/A"

      let cgst = 0
      let sgst = 0
      let igst = 0

      if (entry.transactionType === "IGST") {
        igst = gstAmount
      } else {
        cgst = gstAmount / 2
        sgst = gstAmount / 2
      }

      return {
        id: entry.referenceNumber || entry.id, // Use reference number if available, otherwise journal entry ID
        date: entry.date,
        type: "Sales Invoice",
        party: partyName,
        taxableAmount,
        cgst,
        sgst,
        igst,
        total,
        gstPercentage: entry.gstPercentage, // Add this line
      }
    })

  const gstr2a2bTransactions = journalEntries
    .filter(
      (entry) =>
        entry.status === "Posted" && // Only consider posted entries
        entry.gstPercentage &&
        entry.gstPercentage > 0 &&
        (entry.debitAccount === "Raw Materials Inventory" ||
          entry.debitAccount === "Finished Goods Inventory" ||
          entry.debitAccount === "Work-in-Progress"), // Purchase transactions
    )
    .map((entry) => {
      const taxableAmount = entry.amount
      const gstAmount = taxableAmount * (entry.gstPercentage / 100)
      const total = taxableAmount + gstAmount
      const partyName = suppliers.find((s) => s.id === entry.creditorSupplier)?.name || entry.creditorSupplier || "N/A"

      let cgst = 0
      let sgst = 0
      let igst = 0

      if (entry.transactionType === "IGST") {
        igst = gstAmount
      } else {
        cgst = gstAmount / 2
        sgst = gstAmount / 2
      }

      return {
        id: entry.referenceNumber || entry.id, // Use reference number if available, otherwise journal entry ID
        date: entry.date,
        type: "Purchase Invoice",
        party: partyName,
        taxableAmount,
        cgst,
        sgst,
        igst,
        total,
        gstPercentage: entry.gstPercentage, // Add this line
      }
    })

  const handleExport = (data, reportName, headers) => {
    // Convert data to CSV
    let csvContent = headers.join(",") + "\n"

    data.forEach((item) => {
      let row = []
      if (reportName === "GSTR-1" || reportName === "GSTR-2A-2B") {
        row = [
          item.id,
          item.date,
          item.party,
          item.taxableAmount,
          item.cgst,
          item.sgst,
          item.igst,
          item.cgst + item.sgst + item.igst, // New Tax Amount for export
          item.total,
        ]
      } else if (reportName === "GSTR-3B") {
        row = [item.type, item.amount]
      }

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
    link.setAttribute("download", `${reportName.toLowerCase().replace(/\s/g, "-")}-export.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: `${reportName} data has been downloaded as CSV.`,
      duration: 3000,
    })
  }

  const handlePrint = (data, reportName, headers) => {
    let tableRows = ""
    data.forEach((item) => {
      let rowCells = ""
      if (reportName === "GSTR-1" || reportName === "GSTR-2A-2B") {
        rowCells = `
          <td>${item.id}</td>
          <td>${item.date}</td>
          <td>${item.party}</td>
          <td class="amount">${item.taxableAmount.toLocaleString("en-IN")}</td>
          <td class="amount">${item.cgst.toLocaleString("en-IN")} (${item.gstPercentage}%)</td>
          <td class="amount">${item.sgst.toLocaleString("en-IN")} (${item.gstPercentage}%)</td>
          <td class="amount">${item.igst.toLocaleString("en-IN")} (${item.gstPercentage}%)</td>
          <td class="amount">${(item.cgst + item.sgst + item.igst).toLocaleString("en-IN")}</td>
          <td class="amount">${item.total.toLocaleString("en-IN")}</td>
        `
      } else if (reportName === "GSTR-3B") {
        rowCells = `
          <td>${item.type}</td>
          <td class="amount">${item.amount.toLocaleString("en-IN")}</td>
        `
      }
      tableRows += `<tr>${rowCells}</tr>`
    })

    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${reportName} Report - Trident FMS</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 5px;
        }
        h2 {
          font-size: 16px;
          color: #666;
          font-weight: normal;
          margin-top: 0;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .amount {
          text-align: right;
        }
        .total-row {
          font-weight: bold;
          background-color: #f5f5f5;
        }
        .company-header {
          margin-bottom: 30px;
        }
        @media print {
          body {
            margin: 0.5cm;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="company-header">
        <h1>${reportName} Report</h1>
        <h2>As of ${new Date().toLocaleDateString()}</h2>
      </div>
      <table>
        <thead>
          <tr>
            ${headers.map((header) => `<th>${header}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()">Print</button>
      </div>
    </body>
    </html>
    `

    const printWindow = window.open("", "_blank")
    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <Tabs defaultValue="gstr3b" className="flex-1" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="w-full justify-start rounded-none h-12 bg-transparent p-0 border-b-0">
            <TabsTrigger
              value="gstr3b"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
            >
              GSTR-3B
            </TabsTrigger>
            <TabsTrigger
              value="gstr1"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
            >
              GSTR-1
            </TabsTrigger>
            <TabsTrigger
              value="gstr2a-2b"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
            >
              GSTR-2A/2B
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gstr3b" className="flex-1 p-0">
            <GSTR3BReport
              outputTax={gstr1Summary}
              inputTax={gstr2a2bSummary}
              netTax={gstr3bSummary}
              onExport={handleExport}
            />
          </TabsContent>
          <TabsContent value="gstr1" className="flex-1 p-0">
            <GSTR1Report data={gstr1Transactions} onExport={handleExport} />
          </TabsContent>
          <TabsContent value="gstr2a-2b" className="flex-1 p-0">
            <GSTR2A2BReport data={gstr2a2bTransactions} onExport={handleExport} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
