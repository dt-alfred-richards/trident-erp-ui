import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types/order"

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "pending_approval":
        return {
          label: "Pending Approval",
          variant: "outline" as const,
          className:
            "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400",
        }
      case "approved":
        return {
          label: "Approved",
          variant: "outline" as const,
          className:
            "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
        }
      case "ready":
        return {
          label: "Ready",
          variant: "outline" as const,
          className:
            "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400",
        }
      case "dispatched":
        return {
          label: "Dispatched",
          variant: "outline" as const,
          className:
            "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400",
        }
      case "delivered":
        return {
          label: "Delivered",
          variant: "outline" as const,
          className:
            "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400",
        }
      case "partial_fulfillment":
        return {
          label: "Partial Fulfillment",
          variant: "outline" as const,
          className:
            "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400",
        }
      case "cancelled":
        return {
          label: "Cancelled",
          variant: "outline" as const,
          className: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400",
        }
      default:
        return {
          label: status.replace("_", " "),
          variant: "outline" as const,
          className: "",
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

