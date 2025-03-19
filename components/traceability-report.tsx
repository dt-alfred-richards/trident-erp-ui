"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Download } from "lucide-react"
import { format } from "date-fns"

export function TraceabilityReport() {
  const [date, setDate] = useState<Date>()

  // This would come from your API in a real application
  const traceabilityData = [
    {
      orderId: "SO-0995",
      customer: "Health Foods",
      sku: "500ml",
      orderQuantity: 2000,
      batchId: "BATCH-123",
      batchDate: "2023-05-28",
      allocatedQuantity: 1000,
      dispatchDate: "2023-06-01",
    },
    {
      orderId: "SO-0995",
      customer: "Health Foods",
      sku: "500ml",
      orderQuantity: 2000,
      batchId: "BATCH-125",
      batchDate: "2023-05-30",
      allocatedQuantity: 1000,
      dispatchDate: "2023-06-03",
    },
    {
      orderId: "SO-0996",
      customer: "Wellness Store",
      sku: "750ml",
      orderQuantity: 500,
      batchId: "BATCH-124",
      batchDate: "2023-05-29",
      allocatedQuantity: 500,
      dispatchDate: "2023-06-02",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku-filter">SKU</Label>
          <Select>
            <SelectTrigger id="sku-filter">
              <SelectValue placeholder="All SKUs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All SKUs</SelectItem>
              <SelectItem value="500ml">500ml</SelectItem>
              <SelectItem value="750ml">750ml</SelectItem>
              <SelectItem value="1000ml">1000ml</SelectItem>
              <SelectItem value="2000ml">2000ml</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-filter">Customer</Label>
          <Select>
            <SelectTrigger id="customer-filter">
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="health-foods">Health Foods</SelectItem>
              <SelectItem value="wellness-store">Wellness Store</SelectItem>
              <SelectItem value="fitness-center">Fitness Center</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-filter">Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date-filter" variant={"outline"} className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="batch-filter">Batch ID</Label>
          <Input id="batch-filter" placeholder="Enter batch ID" />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Traceability Results</h3>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Order Qty</TableHead>
              <TableHead>Batch ID</TableHead>
              <TableHead>Batch Date</TableHead>
              <TableHead className="text-right">Allocated Qty</TableHead>
              <TableHead>Dispatch Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {traceabilityData.map((item, index) => (
              <TableRow key={`${item.orderId}-${item.batchId}`}>
                <TableCell className="font-medium">{item.orderId}</TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell className="text-right">{item.orderQuantity.toLocaleString()}</TableCell>
                <TableCell>{item.batchId}</TableCell>
                <TableCell>{new Date(item.batchDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">{item.allocatedQuantity.toLocaleString()}</TableCell>
                <TableCell>{new Date(item.dispatchDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

