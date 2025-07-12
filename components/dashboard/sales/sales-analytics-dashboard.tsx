"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, RefreshCw, BarChart3, TrendingUp, Users, MapPin } from "lucide-react"
import { format, subWeeks, subMonths } from "date-fns"
import { SalesMetrics } from "@/components/sales/analytics/sales-metrics"
import { RevenueChart } from "@/components/sales/analytics/revenue-chart"
import { CustomerInsights } from "@/components/sales/analytics/customer-insights"
import { SalesPerformance } from "@/components/sales/analytics/sales-performance"
import { RegionalBreakdown } from "@/components/sales/analytics/regional-breakdown"
import { CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"

export function SalesAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("month")
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 1))
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

  const chartValues = useMemo(() => {
    return {
      value: {
        label: "Sales",
      },
      "500ml": {
        label: "500ml",
        color: "#7db1f5",
      },
      "750ml": {
        label: "750ml",
        color: "#c3d3db",
      },
      "1000ml": {
        label: "1000ml",
        color: "#77878f",
      },
      "2000ml": {
        label: "2000ml",
        color: "#3284f0",
      },
      "Custom-A": {
        label: "Custom-A",
        color: "#9ad9ca",
      },
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-card rounded-lg p-4 border shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Sales Performance Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">Comprehensive view of your sales metrics and trends</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={timeRange} onValueChange={handleTimeRangeChange} className="w-auto">
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

          {timeRange === "custom" && (
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
                    onSelect={setStartDate}
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
                    onSelect={setEndDate}
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
      </div>

      {/* Key metrics */}
      <SalesMetrics timeRange={timeRange} />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend - takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <RevenueChart timeRange={timeRange} />
        </div>

        {/* Product distribution - takes 1/3 of the width on large screens */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="items-center pb-0">
            <CardTitle>Product Distribution</CardTitle>
            <CardDescription>
              {timeRange === "week"
                ? "Last week"
                : timeRange === "month"
                  ? "Last month"
                  : timeRange === "quarter"
                    ? "Last quarter"
                    : "Custom period"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartValues}
              className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      content={({ payload }) => {
                        if (payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{data.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Intl.NumberFormat("en-IN", {
                                  style: "currency",
                                  currency: "INR",
                                  maximumFractionDigits: 0,
                                }).format(data.value)}
                              </p>
                              <p className="text-xs font-medium">{data.percentage}% of total</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  }
                />
                <Pie
                  data={
                    timeRange === "week"
                      ? [
                        { name: "500ml", value: 120000, percentage: 38 },
                        { name: "750ml", value: 85000, percentage: 27 },
                        { name: "1000ml", value: 65000, percentage: 20 },
                        { name: "2000ml", value: 35000, percentage: 11 },
                        { name: "Custom-A", value: 15000, percentage: 4 },
                      ]
                      : timeRange === "month"
                        ? [
                          { name: "500ml", value: 520000, percentage: 36 },
                          { name: "750ml", value: 420000, percentage: 29 },
                          { name: "1000ml", value: 280000, percentage: 19 },
                          { name: "2000ml", value: 160000, percentage: 11 },
                          { name: "Custom-A", value: 70000, percentage: 5 },
                        ]
                        : timeRange === "quarter"
                          ? [
                            { name: "500ml", value: 1520000, percentage: 35 },
                            { name: "750ml", value: 1280000, percentage: 30 },
                            { name: "1000ml", value: 850000, percentage: 20 },
                            { name: "2000ml", value: 450000, percentage: 11 },
                            { name: "Custom-A", value: 180000, percentage: 4 },
                          ]
                          : [
                            { name: "500ml", value: 850000, percentage: 35 },
                            { name: "750ml", value: 720000, percentage: 29 },
                            { name: "1000ml", value: 480000, percentage: 20 },
                            { name: "2000ml", value: 280000, percentage: 11 },
                            { name: "Custom-A", value: 130000, percentage: 5 },
                          ]
                  }
                  dataKey="value"
                  nameKey="name"
                  label
                  labelLine={false}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {["#7db1f5", "#c3d3db", "#77878f", "#3284f0", "#9ad9ca"].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by{" "}
              {timeRange === "week" ? "4.8" : timeRange === "month" ? "5.2" : timeRange === "quarter" ? "6.5" : "5.7"}%
              this period <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="leading-none text-muted-foreground">Showing sales distribution by product category</div>
          </CardFooter>
        </Card>
      </div>

      {/* Secondary content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-[80%] mx-auto">
        {/* Customer insights */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Customer Insights
              </h3>
              <p className="text-sm text-muted-foreground">Top customers by revenue</p>
            </div>
            <CustomerInsights timeRange={timeRange} />
          </CardContent>
        </Card>

        {/* Regional breakdown */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Top Performing Cities
              </h3>
              <p className="text-sm text-muted-foreground">Sales distribution by top 5 cities</p>
            </div>
            <RegionalBreakdown timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>

      {/* Sales performance */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 pb-2">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Sales Performance
              </h3>
              <p className="text-sm text-muted-foreground">Detailed breakdown of sales metrics</p>
            </div>
          </div>
          <SalesPerformance timeRange={timeRange} />
        </CardContent>
      </Card>
    </div>
  )
}
