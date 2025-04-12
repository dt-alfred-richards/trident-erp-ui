import { Badge } from "@/components/ui/badge"
import type { OrderStatus, ProductStatus } from "@/types/order"

interface StatusBadgeProps {
  status: OrderStatus | ProductStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    // Order-level statuses
    case "processing":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Processing
        </Badge>
      )
    case "pending_approval":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Pending Approval
        </Badge>
      )
    case "approved":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Approved
        </Badge>
      )
    case "ready":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Ready
        </Badge>
      )
    case "dispatched":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Dispatched
        </Badge>
      )
    case "delivered":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Delivered
        </Badge>
      )
    case "partial_fulfillment":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Partial Fulfillment
        </Badge>
      )

    // Product-level statuses
    case "pending":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Pending
        </Badge>
      )
    case "partially_ready":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Partially Ready
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className="bg-amber-50 text-red-700 border-red-200">
          Rejected
        </Badge>
      )
    case "partially_dispatched":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Partially Dispatched
        </Badge>
      )
    case "partially_delivered":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Partially Delivered
        </Badge>
      )
    case "out_for_delivery":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Out for delivery
        </Badge>
      )

    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

