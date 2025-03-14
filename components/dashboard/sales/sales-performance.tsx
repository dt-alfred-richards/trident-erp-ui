"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SalesPerformanceProps {
  timeRange: string
}

interface ProductData {
  product: string
  revenue: string
  revenueValue: number // For sorting purposes
  orders: number
  aov: string
  growth: string
}

export function SalesPerformance({ timeRange }: SalesPerformanceProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // This would come from your API in a real application
  // Added more SKUs and included revenueValue for sorting
  const performanceData: Record<string, ProductData[]> = {
    week: [
      { product: "500ml", revenue: "₹1.2L", revenueValue: 120000, orders: 120, aov: "₹10,000", growth: "+8.2%" },
      { product: "750ml", revenue: "₹85K", revenueValue: 85000, orders: 85, aov: "₹10,000", growth: "+3.8%" },
      { product: "1000ml", revenue: "₹65K", revenueValue: 65000, orders: 52, aov: "₹12,500", growth: "-2.1%" },
      { product: "2000ml", revenue: "₹35K", revenueValue: 35000, orders: 25, aov: "₹14,000", growth: "+7.5%" },
      { product: "Custom-A", revenue: "₹15K", revenueValue: 15000, orders: 10, aov: "₹15,000", growth: "+1.2%" },
      { product: "Premium-X", revenue: "₹12K", revenueValue: 12000, orders: 8, aov: "₹15,000", growth: "+0.8%" },
      { product: "Eco-500", revenue: "₹10K", revenueValue: 10000, orders: 10, aov: "₹10,000", growth: "+2.5%" },
      { product: "Lite-250", revenue: "₹8K", revenueValue: 8000, orders: 16, aov: "₹5,000", growth: "+1.7%" },
      { product: "Pro-1500", revenue: "₹7K", revenueValue: 7000, orders: 5, aov: "₹14,000", growth: "-0.5%" },
      { product: "Ultra-2L", revenue: "₹6K", revenueValue: 6000, orders: 4, aov: "₹15,000", growth: "+0.3%" },
    ],
    month: [
      { product: "500ml", revenue: "₹5.2L", revenueValue: 520000, orders: 520, aov: "₹10,000", growth: "+12.3%" },
      { product: "750ml", revenue: "₹4.2L", revenueValue: 420000, orders: 420, aov: "₹10,000", growth: "+8.7%" },
      { product: "1000ml", revenue: "₹2.8L", revenueValue: 280000, orders: 224, aov: "₹12,500", growth: "+5.2%" },
      { product: "2000ml", revenue: "₹1.6L", revenueValue: 160000, orders: 114, aov: "₹14,035", growth: "+9.5%" },
      { product: "Custom-A", revenue: "₹70K", revenueValue: 70000, orders: 47, aov: "₹14,893", growth: "+2.8%" },
      { product: "Premium-X", revenue: "₹65K", revenueValue: 65000, orders: 43, aov: "₹15,116", growth: "+3.2%" },
      { product: "Eco-500", revenue: "₹55K", revenueValue: 55000, orders: 55, aov: "₹10,000", growth: "+4.1%" },
      { product: "Lite-250", revenue: "₹40K", revenueValue: 40000, orders: 80, aov: "₹5,000", growth: "+2.9%" },
      { product: "Pro-1500", revenue: "₹35K", revenueValue: 35000, orders: 25, aov: "₹14,000", growth: "-1.2%" },
      { product: "Ultra-2L", revenue: "₹30K", revenueValue: 30000, orders: 20, aov: "₹15,000", growth: "+1.5%" },
    ],
    quarter: [
      { product: "500ml", revenue: "₹15.2L", revenueValue: 1520000, orders: 1520, aov: "₹10,000", growth: "+15.7%" },
      { product: "750ml", revenue: "₹12.8L", revenueValue: 1280000, orders: 1280, aov: "₹10,000", growth: "+10.2%" },
      { product: "1000ml", revenue: "₹8.5L", revenueValue: 850000, orders: 680, aov: "₹12,500", growth: "+7.8%" },
      { product: "2000ml", revenue: "₹4.5L", revenueValue: 450000, orders: 321, aov: "₹14,019", growth: "+12.5%" },
      { product: "Custom-A", revenue: "₹1.8L", revenueValue: 180000, orders: 120, aov: "₹15,000", growth: "+4.1%" },
      { product: "Premium-X", revenue: "₹1.6L", revenueValue: 160000, orders: 107, aov: "₹14,953", growth: "+5.3%" },
      { product: "Eco-500", revenue: "₹1.4L", revenueValue: 140000, orders: 140, aov: "₹10,000", growth: "+6.2%" },
      { product: "Lite-250", revenue: "₹1.1L", revenueValue: 110000, orders: 220, aov: "₹5,000", growth: "+4.8%" },
      { product: "Pro-1500", revenue: "₹95K", revenueValue: 95000, orders: 68, aov: "₹13,971", growth: "-0.8%" },
      { product: "Ultra-2L", revenue: "₹85K", revenueValue: 85000, orders: 57, aov: "₹14,912", growth: "+2.7%" },
    ],
    custom: [
      { product: "500ml", revenue: "₹8.5L", revenueValue: 850000, orders: 850, aov: "₹10,000", growth: "+14.2%" },
      { product: "750ml", revenue: "₹7.2L", revenueValue: 720000, orders: 720, aov: "₹10,000", growth: "+9.8%" },
      { product: "1000ml", revenue: "₹4.8L", revenueValue: 480000, orders: 384, aov: "₹12,500", growth: "+6.3%" },
      { product: "2000ml", revenue: "₹2.8L", revenueValue: 280000, orders: 200, aov: "₹14,000", growth: "+11.2%" },
      { product: "Custom-A", revenue: "₹1.3L", revenueValue: 130000, orders: 87, aov: "₹14,943", growth: "+3.4%" },
      { product: "Premium-X", revenue: "₹1.1L", revenueValue: 110000, orders: 73, aov: "₹15,068", growth: "+4.2%" },
      { product: "Eco-500", revenue: "₹95K", revenueValue: 95000, orders: 95, aov: "₹10,000", growth: "+5.1%" },
      { product: "Lite-250", revenue: "₹75K", revenueValue: 75000, orders: 150, aov: "₹5,000", growth: "+3.8%" },
      { product: "Pro-1500", revenue: "₹65K", revenueValue: 65000, orders: 46, aov: "₹14,130", growth: "-0.5%" },
      { product: "Ultra-2L", revenue: "₹55K", revenueValue: 55000, orders: 37, aov: "₹14,865", growth: "+2.1%" },
    ],
  }

  const rawData = performanceData[timeRange as keyof typeof performanceData] || performanceData["month"]

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    return rawData
      .filter((item) => item.product.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.revenueValue - a.revenueValue)
  }, [rawData, searchQuery])

  return (
    <div className="p-6 pt-0 space-y-4">
      <div className="flex items-center justify-end mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="font-medium">Product</TableHead>
                <TableHead className="font-medium text-right">Revenue</TableHead>
                <TableHead className="font-medium text-right">Orders</TableHead>
                <TableHead className="font-medium text-right">Avg. Order Value</TableHead>
                <TableHead className="font-medium text-right">Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((item) => (
                <TableRow key={item.product} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell className="text-right">{item.revenue}</TableCell>
                  <TableCell className="text-right">{item.orders}</TableCell>
                  <TableCell className="text-right">{item.aov}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-0.5 ${
                          item.growth.startsWith("+")
                            ? "bg-green-500/10 text-green-600 border-green-200"
                            : "bg-red-500/10 text-red-600 border-red-200"
                        }`}
                      >
                        {item.growth.startsWith("+") ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {item.growth}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

