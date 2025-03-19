"use client"

import { Factory } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/common/dashboard-header"
import { ChartCard } from "@/components/dashboard/common/chart-card"
import { useTimeRange } from "@/components/dashboard/common/use-time-range"

export function ProductionAnalyticsTab() {
  const { timeRange, startDate, endDate, handleTimeRangeChange, setStartDate, setEndDate } = useTimeRange("month")

  return (
    <div className="space-y-6">
      <DashboardHeader
        icon={<Factory className="h-5 w-5 text-primary" />}
        title="Production Analytics"
        description="Monitor production efficiency and output"
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <ChartCard title="Production Overview">
        <div className="h-[300px] flex items-center justify-center text-muted-foreground p-6">
          Production analytics content will be displayed here
        </div>
      </ChartCard>
    </div>
  )
}

