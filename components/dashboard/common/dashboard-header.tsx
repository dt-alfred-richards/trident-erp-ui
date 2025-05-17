import type { ReactNode } from "react"
import { TimeRangeSelector } from "./time-range-selector"

interface DashboardHeaderProps {
  icon: ReactNode
  title: string
  description: string
  timeRange: string
  onTimeRangeChange: (value: string) => void
  startDate?: Date
  endDate?: Date
  onStartDateChange?: (date: Date | undefined) => void
  onEndDateChange?: (date: Date | undefined) => void
}

export function DashboardHeader({
  icon,
  title,
  description,
  timeRange,
  onTimeRangeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 bg-card rounded-lg p-4 border shadow-sm">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <TimeRangeSelector
        timeRange={timeRange}
        onTimeRangeChange={onTimeRangeChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
    </div>
  )
}
