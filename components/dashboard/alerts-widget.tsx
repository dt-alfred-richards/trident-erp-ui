import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Package, FileText, ShoppingCart } from "lucide-react"

export function AlertsWidget() {
  // This would come from your API in a real application
  const alerts = [
    {
      id: "alert-1",
      type: "low-stock",
      title: "Low Stock Alert",
      description: "Plastic Resin is below reorder level",
      severity: "high",
      icon: Package,
      action: "Create Requisition",
      link: "/procurement",
    },
    {
      id: "alert-2",
      type: "approval",
      title: "Pending Approval",
      description: "3 requisitions awaiting your approval",
      severity: "medium",
      icon: FileText,
      action: "Review",
      link: "/procurement",
    },
    {
      id: "alert-3",
      type: "order",
      title: "Urgent Order",
      description: "SO-1003 is due in 2 days",
      severity: "high",
      icon: ShoppingCart,
      action: "Process",
      link: "/sales",
    },
    {
      id: "alert-4",
      type: "delivery",
      title: "Delayed Delivery",
      description: "PO-002 delivery is delayed by 2 days",
      severity: "medium",
      icon: Clock,
      action: "Track",
      link: "/procurement",
    },
  ]

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High Priority</Badge>
      case "medium":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Medium Priority
          </Badge>
        )
      default:
        return <Badge variant="outline">Low Priority</Badge>
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
              <div
                className={`rounded-full p-1.5 ${
                  alert.severity === "high"
                    ? "bg-red-100 text-red-600"
                    : alert.severity === "medium"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                }`}
              >
                <alert.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium">{alert.title}</h4>
                  {getSeverityBadge(alert.severity)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                <Button variant="link" size="sm" className="h-6 px-0 text-xs" asChild>
                  <a href={alert.link}>
                    {alert.action} <ArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

