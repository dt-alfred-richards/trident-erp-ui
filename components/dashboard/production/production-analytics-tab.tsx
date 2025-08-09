"use client"

import { Factory, RefreshCw, CalendarIcon, TrendingUp, Package, Layers, Percent, ArrowUpRight } from "lucide-react"
import { useMemo, useState } from "react"
import { format, subMonths, subWeeks } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChartContainer } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Cell, Pie, PieChart, Tooltip } from "recharts"
import { useProduction } from "@/components/production/production-context"
import { convertToChart } from "../sales/dashboard-helper"

const COLORS = ["#1b84ff", "#43ced7", "#f8285a", "#2cd07e", "#725AF2", "#2cd07e"]

export function ProductionAnalyticsTab() {
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

  // Get KPI values based on time range
  const getKpiValues = () => {
    switch (timeRange) {
      case "week":
        return {
          totalQuantity: "12,450",
          totalQuantityChange: 8.2,
          dhaaraQuantity: "9,850",
          dhaaraQuantityChange: 6.8,
          customizedQuantity: "2,600",
          customizedQuantityChange: 12.5,
          percentageChange: "+8.2%",
          percentageChangeValue: 1.2,
        }
      case "month":
        return {
          totalQuantity: "48,750",
          totalQuantityChange: 7.5,
          dhaaraQuantity: "38,200",
          dhaaraQuantityChange: 5.9,
          customizedQuantity: "10,550",
          customizedQuantityChange: 10.8,
          percentageChange: "+7.5%",
          percentageChangeValue: 0.9,
        }
      case "quarter":
        return {
          totalQuantity: "145,200",
          totalQuantityChange: 9.3,
          dhaaraQuantity: "112,500",
          dhaaraQuantityChange: 8.2,
          customizedQuantity: "32,700",
          customizedQuantityChange: 14.2,
          percentageChange: "+9.3%",
          percentageChangeValue: 1.5,
        }
      default:
        return {
          totalQuantity: "48,750",
          totalQuantityChange: 7.5,
          dhaaraQuantity: "38,200",
          dhaaraQuantityChange: 5.9,
          customizedQuantity: "10,550",
          customizedQuantityChange: 10.8,
          percentageChange: "+7.5%",
          percentageChangeValue: 0.9,
        }
    }
  }

  const kpiValues = getKpiValues()

  // Define colors for the donut chart
  // const COLORS = ["#6610f2", "#43ced7", "#f8285a", "#1b84ff"]

  const { productionOrders = [] } = useProduction()

  const chartValues = useMemo(() => {
    return convertToChart(productionOrders.map(item => ({ date: item.modifiedOn || item.createdOn || '' as Date, total: item.quantity })))
  }, [productionOrders])

  // Define data for the donut chart based on time range
  const getDonutData = () => {
    if (timeRange === "week") {
      return [
        { name: "250ml", value: 3200, percentage: 26 },
        { name: "500ml", value: 4800, percentage: 38 },
        { name: "1000ml", value: 3100, percentage: 25 },
        { name: "2000ml", value: 1350, percentage: 11 },
      ]
    } else if (timeRange === "month") {
      return [
        { name: "250ml", value: 12500, percentage: 25 },
        { name: "500ml", value: 19500, percentage: 40 },
        { name: "1000ml", value: 11400, percentage: 23 },
        { name: "2000ml", value: 5350, percentage: 12 },
      ]
    } else if (timeRange === "quarter") {
      return [
        { name: "250ml", value: 37800, percentage: 24 },
        { name: "500ml", value: 65200, percentage: 42 },
        { name: "1000ml", value: 36200, percentage: 23 },
        { name: "2000ml", value: 16000, percentage: 11 },
      ]
    } else {
      // Custom time range or fallback
      return [
        { name: "250ml", value: 12500, percentage: 25 },
        { name: "500ml", value: 19500, percentage: 40 },
        { name: "1000ml", value: 11400, percentage: 23 },
        { name: "2000ml", value: 5350, percentage: 12 },
      ]
    }
  }

  // Helper function to get time period label
  const getTimePeriodLabel = () => {
    switch (timeRange) {
      case "week":
        return "This week"
      case "month":
        return "This month"
      case "quarter":
        return "This quarter"
      case "custom":
        return "Custom period"
      default:
        return "This month"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-card rounded-lg p-4 border shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" />
            Production Performance Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">Comprehensive view of your production metrics and trends</p>
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

      {/* Production KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quantity Produced */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Quantity Produced</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.totalQuantity}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.totalQuantityChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dhaara Quantity Produced */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Dhaara Quantity</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.dhaaraQuantity}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.dhaaraQuantityChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <Factory className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customized Quantity Produced */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Customized Quantity</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.customizedQuantity}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.customizedQuantityChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <Layers className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* % Change Produced */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">% Change Produced</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.percentageChange}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.percentageChangeValue}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <Percent className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production trend - takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col overflow-hidden h-[400px]">
            <CardHeader className="pb-0">
              <CardTitle>Production Output Trend</CardTitle>
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
                config={{
                  dhaara: {
                    label: "Dhaara Products",
                    color: "#6610f2",
                  },
                  custom: {
                    label: "Custom Products",
                    color: "#43ced7",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      timeRange === "week"
                        ? [
                          { day: "Mon", dhaara: 1250, custom: 350 },
                          { day: "Tue", dhaara: 1450, custom: 420 },
                          { day: "Wed", dhaara: 1350, custom: 380 },
                          { day: "Thu", dhaara: 1550, custom: 450 },
                          { day: "Fri", dhaara: 1650, custom: 480 },
                          { day: "Sat", dhaara: 1400, custom: 320 },
                          { day: "Sun", dhaara: 1200, custom: 200 },
                        ]
                        : timeRange === "month"
                          ? [
                            { day: "Week 1", dhaara: 8500, custom: 2300 },
                            { day: "Week 2", dhaara: 9200, custom: 2500 },
                            { day: "Week 3", dhaara: 10500, custom: 2800 },
                            { day: "Week 4", dhaara: 10000, custom: 2950 },
                          ]
                          : [
                            { day: "Jan", dhaara: 32000, custom: 9500 },
                            { day: "Feb", dhaara: 35000, custom: 10200 },
                            { day: "Mar", dhaara: 38000, custom: 11500 },
                            { day: "Apr", dhaara: 36000, custom: 10800 },
                            { day: "May", dhaara: 39000, custom: 11200 },
                            { day: "Jun", dhaara: 42000, custom: 12500 },
                          ]
                    }
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const total = payload.reduce((sum, entry) => sum + entry.value, 0)
                          return (
                            <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
                              <p className="font-medium">{label}</p>
                              {payload.map((entry, index) => (
                                <p key={index} className="text-muted-foreground">
                                  <span className="font-medium" style={{ color: entry.color }}>
                                    {entry.name}:{" "}
                                  </span>
                                  {entry.value.toLocaleString()} units
                                  <span className="text-xs ml-1">({((entry.value / total) * 100).toFixed(1)}%)</span>
                                </p>
                              ))}
                              <p className="text-xs text-muted-foreground mt-1">
                                Total: {total.toLocaleString()} units
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                      wrapperStyle={{ outline: "none" }}
                    />
                    <Legend />
                    <Bar dataKey="dhaara" fill="#6610f2" name="Dhaara Products" barSize={12} />
                    <Bar dataKey="custom" fill="#43ced7" name="Custom Products" barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                Trending up by {kpiValues.totalQuantityChange}% this period{" "}
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="leading-none text-muted-foreground">Showing production output by product type</div>
            </CardFooter>
          </Card>
        </div>

        {/* Product distribution - takes 1/3 of the width on large screens */}
        <Card className="flex flex-col overflow-hidden h-[400px]">
          <CardHeader className="pb-0">
            <CardTitle>Quantity by SKU Size</CardTitle>
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
          <CardContent className="flex-1 flex flex-col items-center justify-between pt-0">
            <div className="w-full max-w-[220px] mx-auto mt-2">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={getDonutData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {getDonutData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">{data.value.toLocaleString()}</span> units
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">{data.percentage}%</span> of total
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                    wrapperStyle={{ outline: "none" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full">
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {getDonutData().map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs">
                      {item.name} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 font-medium text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>500ml bottles remain the highest volume at 38%</span>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-1">Showing production quantity by SKU size</p>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className="text-xs text-muted-foreground">Volume distribution stable compared to previous period</div>
          </CardFooter>
        </Card>
      </div>

      {/* Secondary content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Efficiency */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Production Details</CardTitle>
            <CardDescription>Cases Produced by Products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Product C</span>
                  <span className="text-sm font-medium">95</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: "95%", backgroundColor: "#1c86ff" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  
                  <span className="text-sm font-medium">Product A</span>
                  <span className="text-sm font-medium">92</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: "92%", backgroundColor: "#43ced7" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Product B</span>
                  <span className="text-sm font-medium">88</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: "88%", backgroundColor: "#6610f2" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Custom Product</span>
                  <span className="text-sm font-medium">84</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: "84%", backgroundColor: "#2cd07e" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Quality */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Production Orders</CardTitle>
            <CardDescription>Current status of production orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">24</div>
                    <span className="ml-2 text-xs text-emerald-500">+3</span>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">In Progress</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">8</div>
                    <span className="ml-2 text-xs text-emerald-500">+2</span>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Completed</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">14</div>
                    <span className="ml-2 text-xs text-emerald-500">+1</span>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Cancelled</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">2</div>
                    <span className="ml-2 text-xs text-amber-500">0</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
