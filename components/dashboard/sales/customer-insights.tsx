"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface CustomerInsightsProps {
  timeRange: string
}

export function CustomerInsights({ timeRange }: CustomerInsightsProps) {
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
    custom: [
      { name: "ABC Corp", value: "₹4.8L", percent: 24, change: "+10.5%" },
      { name: "XYZ Retail", value: "₹4.2L", percent: 21, change: "+7.8%" },
      { name: "Global Foods", value: "₹3.2L", percent: 16, change: "+4.5%" },
      { name: "Premium Stores", value: "₹2.4L", percent: 12, change: "+11.2%" },
      { name: "Wellness Chain", value: "₹1.6L", percent: 8, change: "+3.4%" },
    ],
  }

  const data = customerData[timeRange as keyof typeof customerData] || customerData["month"]

  // Generate a color based on the customer name (for consistent avatar colors)
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-primary text-primary-foreground",
      "bg-blue-500 text-white",
      "bg-green-500 text-white",
      "bg-amber-500 text-white",
      "bg-purple-500 text-white",
      "bg-rose-500 text-white",
    ]

    // Simple hash function to get a consistent index
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="p-6 pt-0">
      <div className="space-y-4">
        {data.map((customer, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar className={`h-10 w-10 ${getAvatarColor(customer.name)}`}>
                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{customer.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{customer.value}</p>
                  <div
                    className={`flex items-center text-xs font-medium ${customer.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}
                  >
                    {customer.change.startsWith("+") ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {customer.change}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${customer.percent}%` }}></div>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {customer.percent}%
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

