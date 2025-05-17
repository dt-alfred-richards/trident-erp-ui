import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  icon?: ReactNode
  iconColor?: string
  iconBgColor?: string
  description?: string
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  description,
}: MetricCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {change && (
                <div
                  className={`flex items-center text-xs font-medium ${
                    change.isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {change.isPositive ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {change.isPositive ? "+" : "-"}
                  {change.value}%
                </div>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {icon && <div className={cn("rounded-full p-3", iconBgColor)}>{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
