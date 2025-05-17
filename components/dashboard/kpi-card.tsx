import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  description: string
  icon: LucideIcon
}

export function KpiCard({ title, value, change, trend, description, icon: Icon }: KpiCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          {trend === "up" && <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />}
          {trend === "down" && <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />}
          <p
            className={`text-xs ${
              trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            {change} {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
