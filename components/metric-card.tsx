import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  icon?: ReactNode
  description?: string
}

export function MetricCard({ title, value, change, icon, description }: MetricCardProps) {
  return (
    <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {value}
              </h3>
              {change && (
                <span className={`text-sm font-medium ${change.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                  {change.isPositive ? "+" : ""}
                  {change.value}%
                </span>
              )}
            </div>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          {icon && <div className="text-muted-foreground bg-muted/50 p-2 rounded-full">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

