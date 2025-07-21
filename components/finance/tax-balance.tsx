"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { useFinance } from "@/contexts/finance-context"
import { Badge } from "@/components/ui/badge"
import { Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOrders } from "@/contexts/order-context"

export function TaxBalance() {
  const { orders } = useOrders()

  const { trialBalance = [] } = useFinance()

  // Helper function to get balance for a specific account from trialBalance
  // This function is already defined in finance-context.tsx and general-ledger.tsx
  // For consistency, I'll re-implement it here or assume it's accessible.
  // Given the context, I'll assume it's accessible via a helper or re-implement a local version.
  // For this component, I'll create a local helper for clarity.
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

  // Calculate Input Tax Credit (ITC)
  const inputCGST = getBalanceFromTrialBalance("CGST Input")
  const inputSGST = getBalanceFromTrialBalance("SGST Input")
  const inputIGST = getBalanceFromTrialBalance("IGST Input")
  const totalInputTax = inputCGST + inputSGST + inputIGST

  // Calculate Output Tax Liability
  const outputCGST = getBalanceFromTrialBalance("CGST Output")
  const outputSGST = getBalanceFromTrialBalance("SGST Output")
  const outputIGST = getBalanceFromTrialBalance("IGST Output")
  const totalOutputTax = outputCGST + outputSGST + outputIGST

  // Calculate Net Tax Payable / Refundable
  const netCGST = outputCGST - inputCGST
  const netSGST = outputSGST - inputSGST
  const netIGST = outputIGST - inputIGST
  const netTotalTax = netCGST + netSGST + netIGST

  const getNetStatus = (amount: number) => {
    if (amount > 0) return { text: "Payable", variant: "destructive" }
    if (amount < 0) return { text: "Refundable", variant: "default" } // Using default for refundable
    return { text: "Balanced", variant: "outline" }
  }

  const handlePrintTaxBalance = () => {
    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Tax Balance Report - Trident FMS</title>
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
        .section-header {
          background-color: #e0e0e0;
          font-weight: bold;
        }
        .company-header {
          margin-bottom: 30px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          border-radius: 9999px;
          padding-left: 0.625rem;
          padding-right: 0.625rem;
          padding-top: 0.125rem;
          padding-bottom: 0.125rem;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid;
        }
        .badge-destructive {
          background-color: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }
        .badge-default {
          background-color: #e0f2fe;
          color: #0284c7;
          border-color: #7dd3fc;
        }
        .badge-outline {
          background-color: #f3f4f6;
          color: #4b5563;
          border-color: #d1d5db;
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
        <h1>Tax Balance Report</h1>
        <h2>As of ${new Date().toLocaleDateString()}</h2>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 24px;">
        <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
          <h3 style="font-size: 0.875rem; font-weight: 500; color: #6b7280;">Total Input Tax (ITC)</h3>
          <div style="font-size: 1.875rem; font-weight: 700; margin-top: 0.5rem;">₹${totalInputTax.toLocaleString("en-IN")}</div>
          <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">Tax paid on purchases</p>
        </div>
        <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
          <h3 style="font-size: 0.875rem; font-weight: 500; color: #6b7280;">Total Output Tax</h3>
          <div style="font-size: 1.875rem; font-weight: 700; margin-top: 0.5rem;">₹${totalOutputTax.toLocaleString("en-IN")}</div>
          <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">Tax collected on sales</p>
        </div>
        <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
          <h3 style="font-size: 0.875rem; font-weight: 500; color: #6b7280;">Net Tax Payable / (Refundable)</h3>
          <div style="font-size: 1.875rem; font-weight: 700; margin-top: 0.5rem; color: ${netTotalTax > 0 ? "#dc2626" : netTotalTax < 0 ? "#0284c7" : "#4b5563"};">₹${netTotalTax.toLocaleString("en-IN")}</div>
          <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">${getNetStatus(netTotalTax).text}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>GST Type</th>
            <th class="amount">Input Tax (ITC) (₹)</th>
            <th class="amount">Output Tax (₹)</th>
            <th class="amount">Net Balance (₹)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CGST</td>
            <td class="amount">${inputCGST.toLocaleString("en-IN")}</td>
            <td class="amount">${outputCGST.toLocaleString("en-IN")}</td>
            <td class="amount">${netCGST.toLocaleString("en-IN")}</td>
            <td><span class="badge badge-${getNetStatus(netCGST).variant}">${getNetStatus(netCGST).text}</span></td>
          </tr>
          <tr>
            <td>SGST</td>
            <td class="amount">${inputSGST.toLocaleString("en-IN")}</td>
            <td class="amount">${outputSGST.toLocaleString("en-IN")}</td>
            <td class="amount">${netSGST.toLocaleString("en-IN")}</td>
            <td><span class="badge badge-${getNetStatus(netSGST).variant}">${getNetStatus(netSGST).text}</span></td>
          </tr>
          <tr>
            <td>IGST</td>
            <td class="amount">${inputIGST.toLocaleString("en-IN")}</td>
            <td class="amount">${outputIGST.toLocaleString("en-IN")}</td>
            <td class="amount">${netIGST.toLocaleString("en-IN")}</td>
            <td><span class="badge badge-${getNetStatus(netIGST).variant}">${getNetStatus(netIGST).text}</span></td>
          </tr>
          <tr class="total-row">
            <td>Total</td>
            <td class="amount">${totalInputTax.toLocaleString("en-IN")}</td>
            <td class="amount">${totalOutputTax.toLocaleString("en-IN")}</td>
            <td class="amount">${netTotalTax.toLocaleString("en-IN")}</td>
            <td><span class="badge badge-${getNetStatus(netTotalTax).variant}">${getNetStatus(netTotalTax).text}</span></td>
          </tr>
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

  const handleExportTaxBalance = () => {
    const csvData = `GST Type,Input Tax (ITC) (₹),Output Tax (₹),Net Balance (₹),Status
CGST,${inputCGST},${outputCGST},${netCGST},${getNetStatus(netCGST).text}
SGST,${inputSGST},${outputSGST},${netSGST},${getNetStatus(netSGST).text}
IGST,${inputIGST},${outputIGST},${netIGST},${getNetStatus(netIGST).text}
Total,${totalInputTax},${totalOutputTax},${netTotalTax},${getNetStatus(netTotalTax).text}
`
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "tax-balance-report.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Input Tax (ITC)"
          value={`₹${totalInputTax.toLocaleString("en-IN")}`}
          description="Tax paid on purchases"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <MetricCard
          title="Total Output Tax"
          value={`₹${totalOutputTax.toLocaleString("en-IN")}`}
          description="Tax collected on sales"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
        />
        <MetricCard
          title="Net Tax Payable / (Refundable)"
          value={`₹${netTotalTax.toLocaleString("en-IN")}`}
          description={getNetStatus(netTotalTax).text}
          icon={<span className="text-lg">₹</span>}
          iconColor={netTotalTax > 0 ? "text-red-500" : netTotalTax < 0 ? "text-green-500" : "text-gray-500"}
          iconBgColor={netTotalTax > 0 ? "bg-red-500/10" : netTotalTax < 0 ? "bg-green-500/10" : "bg-gray-500/10"}
        />
      </div>

      <div className="flex justify-end items-center bg-muted/30 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportTaxBalance}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintTaxBalance}>
            <FileText className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-semibold">GST Balance Breakdown</CardTitle>
          <CardDescription>Detailed breakdown of GST input, output, and net balance by type.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="[&_tbody_tr:last-child]:border-0">
            <TableHeader>
              <TableRow>
                <TableHead>GST Type</TableHead>
                <TableHead className="text-right">Input Tax (ITC) (₹)</TableHead>
                <TableHead className="text-right">Output Tax (₹)</TableHead>
                <TableHead className="text-right">Net Balance (₹)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">CGST</TableCell>
                <TableCell className="text-right">{inputCGST.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right">{outputCGST.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right font-semibold">{netCGST.toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <Badge
                    variant={getNetStatus(netCGST).variant}
                    className={
                      getNetStatus(netCGST).variant === "destructive"
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
                        : getNetStatus(netCGST).variant === "default"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                          : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/50 dark:text-gray-400 dark:border-gray-800"
                    }
                  >
                    {getNetStatus(netCGST).text}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">SGST</TableCell>
                <TableCell className="text-right">{inputSGST.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right">{outputSGST.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right font-semibold">{netSGST.toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <Badge
                    variant={getNetStatus(netSGST).variant}
                    className={
                      getNetStatus(netSGST).variant === "destructive"
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
                        : getNetStatus(netSGST).variant === "default"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                          : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/50 dark:text-gray-400 dark:border-gray-800"
                    }
                  >
                    {getNetStatus(netSGST).text}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">IGST</TableCell>
                <TableCell className="text-right">{inputIGST.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right">{outputIGST.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right font-semibold">{netIGST.toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <Badge
                    variant={getNetStatus(netIGST).variant}
                    className={
                      getNetStatus(netIGST).variant === "destructive"
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
                        : getNetStatus(netIGST).variant === "default"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                          : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/50 dark:text-gray-400 dark:border-gray-800"
                    }
                  >
                    {getNetStatus(netIGST).text}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow className="font-bold bg-muted/50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{totalInputTax.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right">{totalOutputTax.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-right">{netTotalTax.toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <Badge
                    variant={getNetStatus(netTotalTax).variant}
                    className={
                      getNetStatus(netTotalTax).variant === "destructive"
                        ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
                        : getNetStatus(netTotalTax).variant === "default"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                          : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/50 dark:text-gray-400 dark:border-gray-800"
                    }
                  >
                    {getNetStatus(netTotalTax).text}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
