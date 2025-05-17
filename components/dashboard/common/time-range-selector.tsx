"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, RefreshCw } from "lucide-react"
import { format } from "date-fns"

interface TimeRangeSelectorProps {
  timeRange: string
  onTimeRangeChange: (value: string) => void
  startDate?: Date
  endDate?: Date
  onStartDateChange?: (date: Date | undefined) => void
  onEndDateChange?: (date: Date | undefined) => void
}

export function TimeRangeSelector({
  timeRange,
  onTimeRangeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tabs value={timeRange} onValueChange={onTimeRangeChange} className="w-auto">
        <TabsList className="h-9 bg-muted/50">
          <TabsTrigger
            value="week"
            className="text-xs px-3 data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Week
          </TabsTrigger>
          <TabsTrigger
            value="month"
            className="text-xs px-3 data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Month
          </TabsTrigger>
          <TabsTrigger
            value="quarter"
            className="text-xs px-3 data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Quarter
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="text-xs px-3 data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Custom
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {timeRange === "custom" && onStartDateChange && onEndDateChange && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 bg-background">
                <CalendarIcon className="h-3.5 w-3.5" />
                {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                initialFocus
                disabled={(date) => date > new Date() || (endDate ? date > endDate : false)}
              />
            </PopoverContent>
          </Popover>
          <span className="text-sm text-muted-foreground">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 bg-background">
                <CalendarIcon className="h-3.5 w-3.5" />
                {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                initialFocus
                disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      <Button variant="outline" size="sm" className="h-9 gap-1 bg-background">
        <RefreshCw className="h-3.5 w-3.5" />
        <span className="text-xs">Refresh</span>
      </Button>
    </div>
  )
}
