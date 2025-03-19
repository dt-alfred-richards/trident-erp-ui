"use client"

import { Progress } from "@/components/ui/progress"

interface StockLevelIndicatorProps {
  currentStock: number
  reorderLevel: number
  urgency: string
}

export function StockLevelIndicator({ currentStock, reorderLevel, urgency }: StockLevelIndicatorProps) {
  const getStockPercentage = (current: number, reorder: number) => {
    return Math.min(Math.round((current / reorder) * 100), 100)
  }

  return (
    <div className="flex flex-col gap-1">
      <Progress
        value={getStockPercentage(currentStock, reorderLevel)}
        className="h-2"
        indicatorClassName={urgency === "high" ? "bg-red-500" : urgency === "medium" ? "bg-amber-500" : "bg-blue-500"}
      />
    </div>
  )
}

