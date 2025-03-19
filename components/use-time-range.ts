"use client"

import { useState } from "react"
import { subWeeks, subMonths } from "date-fns"

export function useTimeRange(defaultRange = "month") {
  const [timeRange, setTimeRange] = useState(defaultRange)
  const [startDate, setStartDate] = useState<Date | undefined>(
    defaultRange === "week"
      ? subWeeks(new Date(), 1)
      : defaultRange === "month"
        ? subMonths(new Date(), 1)
        : defaultRange === "quarter"
          ? subMonths(new Date(), 3)
          : subMonths(new Date(), 1),
  )
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)

    // Set appropriate date range based on selection
    const today = new Date()
    switch (value) {
      case "week":
        setStartDate(subWeeks(today, 1))
        setEndDate(today)
        break
      case "month":
        setStartDate(subMonths(today, 1))
        setEndDate(today)
        break
      case "quarter":
        setStartDate(subMonths(today, 3))
        setEndDate(today)
        break
      case "custom":
        // Keep current custom range
        break
    }
  }

  return {
    timeRange,
    startDate,
    endDate,
    setTimeRange,
    setStartDate,
    setEndDate,
    handleTimeRangeChange,
  }
}

