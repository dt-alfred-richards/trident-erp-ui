"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TopCustomersProps {
  timeRange: string
}

export function TopCustomers({ timeRange }: TopCustomersProps) {
  // This would come from your API in a real application
  const customerData = {
    week: [
      { name: "ABC Corp", value: "₹52,000", percent: 21, change: "+5.2%" },
      { name: "XYZ Retail", value: "₹48,000", percent: 19, change: "+3.8%" },
      { name: "Global Foods", value: "₹37,000", percent: 15, change: "-2.1%" },
      { name: "Premium Stores", value: "₹29,000", percent: 12, change: "+7.5%" },
      { name: "Wellness Chain", value: "₹21,000", percent: 9, change: "+1.2%" },
    ],
    month: [
      { name: "ABC Corp", value: "₹2.4L", percent: 23, change: "+8.2%" },
      { name: "XYZ Retail", value: "₹2.1L", percent: 20, change: "+5.7%" },
      { name: "Global Foods", value: "₹1.8L", percent: 17, change: "+3.2%" },
      { name: "Premium Stores", value: "₹1.2L", percent: 11, change: "+9.5%" },
      { name: "Wellness Chain", value: "₹0.9L", percent: 8, change: "+2.8%" },
    ],
    quarter: [
      { name: "ABC Corp", value: "₹7.2L", percent: 24, change: "+12.5%" },
      { name: "XYZ Retail", value: "₹6.3L", percent: 21, change: "+8.7%" },
      { name: "Global Foods", value: "₹4.8L", percent: 16, change: "+5.3%" },
      { name: "Premium Stores", value: "₹3.6L", percent: 12, change: "+10.2%" },
      { name: "Wellness Chain", value: "₹2.4L", percent: 8, change: "+4.1%" },
    ],
    year: [
      { name: "ABC Corp", value: "₹28.5L", percent: 25, change: "+15.8%" },
      { name: "XYZ Retail", value: "₹24.2L", percent: 21, change: "+12.3%" },
      { name: "Global Foods", value: "₹18.7L", percent: 16, change: "+9.7%" },
      { name: "Premium Stores", value: "₹14.3L", percent: 12, change: "+14.5%" },
      { name: "Wellness Chain", value: "₹9.8L", percent: 8, change: "+7.2%" },
    ],
    custom: [
      { name: "ABC Corp", value: "���4.8L", percent: 24, change: "+10.5%" },
      { name: "XYZ Retail", value: "₹4.2L", percent: 21, change: "+7.8%" },
      { name: "Global Foods", value: "₹3.2L", percent: 16, change: "+4.5%" },
      { name: "Premium Stores", value: "₹2.4L", percent: 12, change: "+11.2%" },
      { name: "Wellness Chain", value: "₹1.6L", percent: 8, change: "+3.4%" },
    ],
  }

  const data = customerData[timeRange as keyof typeof customerData] || customerData.month

  return (
    <div className="space-y-6">
      {data.map((customer, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{customer.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{customer.value}</p>
                <Badge variant={customer.change.startsWith("+") ? "default" : "destructive"} className="text-xs">
                  {customer.change}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${customer.percent}%` }}></div>
            </div>
            <span className="text-xs font-medium">{customer.percent}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

