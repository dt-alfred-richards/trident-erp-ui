import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ClipboardList, FileText, Package, ShoppingCart, Truck } from "lucide-react"

export function RecentActivityFeed() {
  // This would come from your API in a real application
  const activities = [
    {
      id: "act-1",
      user: "John Smith",
      action: "created",
      object: "Sales Order",
      objectId: "SO-1005",
      timestamp: "10 minutes ago",
      icon: ShoppingCart,
    },
    {
      id: "act-2",
      user: "Sarah Johnson",
      action: "approved",
      object: "Requisition",
      objectId: "REQ-003",
      timestamp: "25 minutes ago",
      icon: FileText,
    },
    {
      id: "act-3",
      user: "Mike Williams",
      action: "completed",
      object: "Production",
      objectId: "PROD-008",
      timestamp: "1 hour ago",
      icon: ClipboardList,
    },
    {
      id: "act-4",
      user: "Lisa Brown",
      action: "received",
      object: "Shipment",
      objectId: "PO-002",
      timestamp: "2 hours ago",
      icon: Package,
    },
    {
      id: "act-5",
      user: "David Lee",
      action: "dispatched",
      object: "Order",
      objectId: "SO-0997",
      timestamp: "3 hours ago",
      icon: Truck,
    },
  ]

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "text-blue-600"
      case "approved":
        return "text-green-600"
      case "completed":
        return "text-green-600"
      case "received":
        return "text-purple-600"
      case "dispatched":
        return "text-amber-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className={getActionColor(activity.action)}>{activity.action}</span>{" "}
                  <span>{activity.object}</span> <span className="font-medium">{activity.objectId}</span>
                </p>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <activity.icon className="h-3 w-3 mr-1" />
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
