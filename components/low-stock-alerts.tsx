"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLowStockData } from "@/hooks/use-procurement-data"
import { StockLevelIndicator } from "@/components/procurement/stock-level-indicator"

export function LowStockAlerts() {
  const { lowStockItems } = useLowStockData()

  // Make sure lowStockItems is not null or undefined
  if (!lowStockItems || lowStockItems.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No low stock alerts</div>
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead>Stock Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lowStockItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.currentStock} {item.unit} / {item.reorderLevel} {item.unit}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <StockLevelIndicator
                  currentStock={item.currentStock}
                  reorderLevel={item.reorderLevel}
                  urgency={item.urgency}
                />
              </TableCell>
              <TableCell>
                <UrgencyBadge urgency={item.urgency} />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">
                  Create PO
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

interface UrgencyBadgeProps {
  urgency: string
}

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  switch (urgency) {
    case "high":
      return <Badge variant="destructive">Critical</Badge>
    case "medium":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Low
        </Badge>
      )
    case "low":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Reorder Soon
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

