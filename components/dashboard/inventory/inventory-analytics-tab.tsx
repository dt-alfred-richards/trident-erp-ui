"use client"

import {
  Package,
  RefreshCw,
  CalendarIcon,
  TrendingUp,
  Archive,
  AlertTriangle,
  BoxIcon,
  BookmarkIcon,
  ArrowUpRight,
  Layers,
} from "lucide-react"
import { useMemo, useState } from "react"
import { format, subMonths, subWeeks } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChartContainer } from "@/components/ui/chart"
import { CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Cell, Pie, PieChart, LineChart, Line } from "recharts"
import { useRawMaterialsStore } from "@/hooks/use-raw-materials-store"
import { useOrders } from "@/contexts/order-context"
import { convertToChart } from "../sales/dashboard-helper"
import { useInventory } from "@/app/inventory-context"
import { getCummulativeSum } from "@/components/generic"

const COLORS = ["#6610f2", "#f8285a", "#43ced7", "#1b84ff", "#2cd07e", "#dadada"]

export function InventoryAnalyticsTab() {
  const [timeRange, setTimeRange] = useState("month")
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 1))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [materialCategory, setMaterialCategory] = useState("Pre-Form")

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

  // Format number to K format (e.g., 1000 -> 1K, 1500 -> 1.5K)
  const formatToK = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K"
    }
    return num.toString()
  }

  const { inventory = [] } = useInventory()

  // Get raw materials data from the store
  const rawMaterials = useMemo(() => {
    return inventory.map(item => {
      return ({ id: item.id, category: item.category, type: item.type || item.material, quantity: item.quantity })
    })
  }, [inventory])

  console.log({ rawMaterials })

  // Calculate distinct count of raw materials by category
  const distinctRawMaterialsCount = new Set(rawMaterials.map((material) => `${material.category}-${material.type}`))
    .size

  // Get KPI values based on time range
  const getKpiValues = () => {
    switch (timeRange) {
      case "week":
        return {
          totalMaterials: distinctRawMaterialsCount,
          totalMaterialsChange: 5.2,
          lowStockMaterials: 28,
          lowStockMaterialsChange: 12.5,
          casesAvailable: "8,750",
          casesAvailableChange: 7.8,
          casesReserved: "3,250",
          casesReservedChange: 4.3,
          inventoryGrowth: 5.7,
        }
      case "month":
        return {
          totalMaterials: distinctRawMaterialsCount,
          totalMaterialsChange: 4.8,
          lowStockMaterials: 32,
          lowStockMaterialsChange: 10.2,
          casesAvailable: "32,500",
          casesAvailableChange: 6.5,
          casesReserved: "12,800",
          casesReservedChange: 3.9,
          inventoryGrowth: 4.8,
        }
      case "quarter":
        return {
          totalMaterials: distinctRawMaterialsCount,
          totalMaterialsChange: 6.5,
          lowStockMaterials: 45,
          lowStockMaterialsChange: 15.8,
          casesAvailable: "98,200",
          casesAvailableChange: 8.2,
          casesReserved: "38,500",
          casesReservedChange: 5.1,
          inventoryGrowth: 2.3,
        }
      default:
        return {
          totalMaterials: distinctRawMaterialsCount,
          totalMaterialsChange: 4.8,
          lowStockMaterials: 32,
          lowStockMaterialsChange: 10.2,
          casesAvailable: "32,500",
          casesAvailableChange: 6.5,
          casesReserved: "12,800",
          casesReservedChange: 3.9,
          inventoryGrowth: 4.8,
        }
    }
  }

  const kpiValues = getKpiValues()

  const { orders } = useOrders()

  const finishedGoods = useMemo(() => {
    return orders.filter(item => item.status === 'approved')
  }, [orders])


  // Define finished goods inventory data
  const getFinishedGoodsData = useMemo(() => {
    const chart = convertToChart(finishedGoods.map(item => ({ date: item.modifiedOn || item.createdAt, total: item.total })))
    return () => {
      if (timeRange === "week") {
        return chart.week.map(item => ({ date: item.date, finishedGoods: item.revenue, unitsSold: 0 }))
      } else if (timeRange === "month") {
        return chart.month.map(item => ({ date: item.date, finishedGoods: item.revenue, unitsSold: 0 }))
        // [
        //   { date: "Week 1", finishedGoods: 75000, unitsSold: 12000 },
        //   { date: "Week 2", finishedGoods: 78000, unitsSold: 13500 },
        //   { date: "Week 3", finishedGoods: 81000, unitsSold: 14200 },
        //   { date: "Week 4", finishedGoods: 84000, unitsSold: 15800 },
        // ]
      } else {
        return chart.quarter.map(item => ({ date: item.date, finishedGoods: item.revenue, unitsSold: 0 }))
        // [
        //   { date: "Jan", finishedGoods: 220000, unitsSold: 35000 },
        //   { date: "Feb", finishedGoods: 225000, unitsSold: 38000 },
        //   { date: "Mar", finishedGoods: 230000, unitsSold: 42000 },
        //   { date: "Apr", finishedGoods: 235000, unitsSold: 45000 },
        //   { date: "May", finishedGoods: 240000, unitsSold: 48000 },
        //   { date: "Jun", finishedGoods: 245000, unitsSold: 52000 },
        // ]
      }
    }
  }, [finishedGoods])


  // Get raw materials data for the donut chart
  const getRawMaterialsChartData = () => {
    // Filter materials by selected category
    const filteredMaterials = rawMaterials.filter(
      (material) => material.category.toLowerCase() === materialCategory.toLowerCase(),
    )

    // Apply time-based variations to the data
    const timeBasedMaterials = filteredMaterials.map((material) => {
      let quantityMultiplier = 1

      // Modify quantities based on time range to simulate different data for different periods
      switch (timeRange) {
        case "week":
          // Weekly data shows recent fluctuations
          quantityMultiplier = material.type.length % 3 === 0 ? 0.85 : 1.15
          break
        case "month":
          // Monthly data is our baseline
          quantityMultiplier = 1
          break
        case "quarter":
          // Quarterly data shows longer term trends
          quantityMultiplier = material.type.length % 2 === 0 ? 1.25 : 0.95
          break
        case "custom":
          // Custom range shows more variation
          quantityMultiplier = (material.type.charCodeAt(0) % 4) * 0.1 + 0.9
          break
      }

      return {
        ...material,
        quantity: Math.round(material.quantity * quantityMultiplier),
      }
    })

    // Group by type and sum quantities
    const groupedData = timeBasedMaterials.reduce(
      (acc, material) => {
        const key = material.type
        if (!acc[key]) {
          acc[key] = {
            name: material.type,
            value: 0,
            details: material.details || "",
          }
        }
        acc[key].value += material.quantity
        return acc
      },
      {} as Record<string, { name: string; value: number; details: string }>,
    )

    // Convert to array and sort by value
    return Object.values(groupedData).sort((a, b) => b.value - a.value)
  }

  // Get material type details for the legend
  const getMaterialTypeDetails = () => {
    const chartData = getRawMaterialsChartData()
    // Calculate total value for percentage calculation
    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)

    return chartData.map((item, index) => ({
      name: item.name,
      details: item.details,
      color: COLORS[index % COLORS.length],
      value: item.value,
      percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    }))
  }

  // Helper function to get time period label based on selected range
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

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Labels":
        return <Layers className="h-4 w-4" />
      case "Pre-Form":
        return <BoxIcon className="h-4 w-4" />
      case "Shrink":
        return <Package className="h-4 w-4" />
      case "Caps and Handles":
        return <Package className="h-4 w-4" />
      case "Consumables":
        return <BoxIcon className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-card rounded-lg p-4 border shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Inventory Performance Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">Comprehensive view of your inventory metrics and trends</p>
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

      {/* Inventory KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Materials */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Materials</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.totalMaterials}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.totalMaterialsChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Archive className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Materials */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Low Stock Materials</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.lowStockMaterials}</h3>
                  <div className="flex items-center text-xs font-medium text-red-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.lowStockMaterialsChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-red-500/10 p-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Available */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cases Available</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.casesAvailable}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.casesAvailableChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <BoxIcon className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Reserved */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cases Reserved</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.casesReserved}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.casesReservedChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <BookmarkIcon className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory trend - takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle>Finished Goods Stock Levels vs. Sales</CardTitle>
              <CardDescription>Comparing inventory levels with actual units sold</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={{
                  finishedGoods: {
                    label: "Inventory Level",
                    color: "#3284f0",
                  },
                  unitsSold: {
                    label: "Units Sold",
                    color: "#77878f",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFinishedGoodsData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
                              <p className="font-medium">{label}</p>
                              {payload.map((entry, index) => (
                                <p key={index} className="text-muted-foreground">
                                  <span className="font-medium" style={{ color: entry.color }}>
                                    {entry.name}:{" "}
                                  </span>
                                  {entry.value.toLocaleString()} units
                                </p>
                              ))}
                              <p className="text-xs text-muted-foreground mt-1">
                                Total: {payload.reduce((sum, entry) => sum + entry.value, 0).toLocaleString()} units
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                      wrapperStyle={{ outline: "none" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="finishedGoods"
                      stroke="#3284f0"
                      name="Inventory Level"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#3284f0" }}
                      activeDot={{ r: 7 }}
                      connectNulls={true}
                      label={({ value, x, y }) => (
                        <text x={x} y={y - 10} fill="#3284f0" fontSize={11} textAnchor="middle" fontWeight="600">
                          {formatToK(value)}
                        </text>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="unitsSold"
                      stroke="#77878f"
                      name="Units Sold"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#77878f" }}
                      activeDot={{ r: 7 }}
                      connectNulls={true}
                      label={({ value, x, y }) => (
                        <text x={x} y={y - 10} fill="#77878f" fontSize={11} textAnchor="middle" fontWeight="600">
                          {formatToK(value)}
                        </text>
                      )}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                Inventory growing at {kpiValues.inventoryGrowth}% while sales are increasing at a slower rate
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="leading-none text-muted-foreground">
                Showing the disparity between production and actual sales
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Inventory distribution - takes 1/3 of the width on large screens */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Raw Materials Distribution</CardTitle>
            <CardDescription>
              {timeRange === "week"
                ? "Weekly"
                : timeRange === "month"
                  ? "Monthly"
                  : timeRange === "quarter"
                    ? "Quarterly"
                    : "Custom"}{" "}
              stock by material type
            </CardDescription>
          </CardHeader>
          <div className="px-6">
            <Tabs value={materialCategory} onValueChange={setMaterialCategory} className="w-full">
              <TabsList className="bg-transparent p-0 h-auto space-x-2 flex flex-wrap">
                {["Labels", "Pre-Form", "Shrink", "Caps and Handles", "Consumables"].map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="px-3 py-1.5 h-auto text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5"
                  >
                    {getCategoryIcon(category)}
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <CardContent className="flex-1 pb-0">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getRawMaterialsChartData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    // Remove the label to make room for the tooltip
                    label={false}
                    labelLine={false}
                  >
                    {getRawMaterialsChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        const totalValue = getRawMaterialsChartData().reduce((sum, item) => sum + item.value, 0)
                        const percentage = ((data.value / totalValue) * 100).toFixed(1)

                        return (
                          <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">{data.value.toLocaleString()}</span> units
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">{percentage}%</span> of total
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
          </CardContent>
          {/* CardFooter with legends removed */}
          <CardFooter className="pt-0">
            <div className="w-full mt-2 text-center">
              <p className="text-xs text-muted-foreground">Hover over segments for details</p>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Secondary content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Details */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Inventory Details</CardTitle>
            <CardDescription>Finished goods by products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {
                inventory.map(item => {
                  return (<div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.material}</span>
                      <span className="text-sm font-medium">{item.quantity}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: "72%", backgroundColor: "#43ced7" }}></div>
                    </div>
                  </div>)
                })
              }
            </div>
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current status of inventory items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Total SKUs</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">{inventory.length}</div>
                    <span className="ml-2 text-xs text-emerald-500"></span>
                  </div>
                </div>
                {/* <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Low Stock</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">28</div>
                    <span className="ml-2 text-xs text-red-500">+3</span>
                  </div>
                </div> */}
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Optimal Stock</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">{getCummulativeSum({ refObject: inventory, key: 'quantity' })}</div>
                    <span className="ml-2 text-xs text-emerald-500"></span>
                  </div>
                </div>
                {/* <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-muted-foreground">Overstock</div>
                  <div className="mt-1 flex items-baseline">
                    <div className="text-2xl font-semibold">14</div>
                    <span className="ml-2 text-xs text-amber-500">0</span>
                  </div>
                </div> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
