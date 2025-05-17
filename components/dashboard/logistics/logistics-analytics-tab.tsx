"use client"

import {
  Truck,
  TrendingUp,
  Clock,
  Package,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/common/dashboard-header"
import { ChartCard } from "@/components/dashboard/common/chart-card"
import { useTimeRange } from "@/components/dashboard/common/use-time-range"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLogisticsContext } from "@/hooks/use-logistics-data"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const COLORS = ["#43ced7", "#f8285a", "#6610f2", "#2cd07e", "#1b84ff", "#f27104"]

export function LogisticsAnalyticsTab() {
  const { timeRange, startDate, endDate, handleTimeRangeChange, setStartDate, setEndDate } = useTimeRange("month")
  const { orders } = useLogisticsContext()

  // Calculate KPI values based on time range
  const getKpiValues = () => {
    switch (timeRange) {
      case "week":
        return {
          totalShipments: 42,
          totalShipmentsChange: 8.3,
          onTimeDelivery: 92,
          onTimeDeliveryChange: 2.1,
          avgDeliveryTime: 2.3,
          avgDeliveryTimeChange: -0.2,
          pendingDeliveries: 8,
          pendingDeliveriesChange: -3,
        }
      case "month":
        return {
          totalShipments: 185,
          totalShipmentsChange: 12.5,
          onTimeDelivery: 94,
          onTimeDeliveryChange: 3.2,
          avgDeliveryTime: 2.1,
          avgDeliveryTimeChange: -0.3,
          pendingDeliveries: 15,
          pendingDeliveriesChange: -5,
        }
      case "quarter":
        return {
          totalShipments: 560,
          totalShipmentsChange: 15.8,
          onTimeDelivery: 95,
          onTimeDeliveryChange: 4.5,
          avgDeliveryTime: 2.0,
          avgDeliveryTimeChange: -0.4,
          pendingDeliveries: 22,
          pendingDeliveriesChange: -8,
        }
      default:
        return {
          totalShipments: 185,
          totalShipmentsChange: 12.5,
          onTimeDelivery: 94,
          onTimeDeliveryChange: 3.2,
          avgDeliveryTime: 2.1,
          avgDeliveryTimeChange: -0.3,
          pendingDeliveries: 15,
          pendingDeliveriesChange: -5,
        }
    }
  }

  const kpiValues = getKpiValues()

  // Shipment volume data
  const getShipmentVolumeData = () => {
    if (timeRange === "week") {
      return [
        { date: "Mon", shipments: 8, deliveries: 6 },
        { date: "Tue", shipments: 10, deliveries: 9 },
        { date: "Wed", shipments: 7, deliveries: 6 },
        { date: "Thu", shipments: 9, deliveries: 8 },
        { date: "Fri", shipments: 12, deliveries: 10 },
        { date: "Sat", shipments: 4, deliveries: 3 },
        { date: "Sun", shipments: 2, deliveries: 1 },
      ]
    } else if (timeRange === "month") {
      return [
        { date: "Week 1", shipments: 42, deliveries: 38 },
        { date: "Week 2", shipments: 48, deliveries: 45 },
        { date: "Week 3", shipments: 53, deliveries: 50 },
        { date: "Week 4", shipments: 42, deliveries: 40 },
      ]
    } else {
      return [
        { date: "Jan", shipments: 150, deliveries: 142 },
        { date: "Feb", shipments: 180, deliveries: 172 },
        { date: "Mar", shipments: 230, deliveries: 220 },
      ]
    }
  }

  // Delivery performance data
  const getDeliveryPerformanceData = () => {
    if (timeRange === "week") {
      return [
        { date: "Mon", onTime: 85, delayed: 15 },
        { date: "Tue", onTime: 90, delayed: 10 },
        { date: "Wed", onTime: 95, delayed: 5 },
        { date: "Thu", onTime: 92, delayed: 8 },
        { date: "Fri", onTime: 88, delayed: 12 },
        { date: "Sat", onTime: 95, delayed: 5 },
        { date: "Sun", onTime: 100, delayed: 0 },
      ]
    } else if (timeRange === "month") {
      return [
        { date: "Week 1", onTime: 92, delayed: 8 },
        { date: "Week 2", onTime: 94, delayed: 6 },
        { date: "Week 3", onTime: 96, delayed: 4 },
        { date: "Week 4", onTime: 93, delayed: 7 },
      ]
    } else {
      return [
        { date: "Jan", onTime: 93, delayed: 7 },
        { date: "Feb", onTime: 94, delayed: 6 },
        { date: "Mar", onTime: 95, delayed: 5 },
      ]
    }
  }

  // Carrier performance data
  const getCarrierPerformanceData = () => {
    if (timeRange === "week") {
      return [
        { name: "Vehicle 1", value: 35, percentage: 35, color: "#4882d9" },
        { name: "Vehicle 2", value: 30, percentage: 30, color: "#c2d6f3" },
        { name: "Vehicle 3", value: 20, percentage: 20, color: "#4882d9" },
        { name: "Vehicle 4", value: 15, percentage: 15, color: "#c2d6f3" },
      ]
    } else if (timeRange === "month") {
      return [
        { name: "Vehicle 1", value: 40, percentage: 40, color: "#4882d9" },
        { name: "Vehicle 2", value: 25, percentage: 25, color: "#c2d6f3" },
        { name: "Vehicle 3", value: 20, percentage: 20, color: "#4882d9" },
        { name: "Vehicle 4", value: 15, percentage: 15, color: "#c2d6f3" },
      ]
    } else if (timeRange === "quarter") {
      return [
        { name: "Vehicle 1", value: 45, percentage: 45, color: "#4882d9" },
        { name: "Vehicle 2", value: 20, percentage: 20, color: "#c2d6f3" },
        { name: "Vehicle 3", value: 25, percentage: 25, color: "#4882d9" },
        { name: "Vehicle 4", value: 10, percentage: 10, color: "#c2d6f3" },
      ]
    } else {
      // Custom time range or fallback
      return [
        { name: "Vehicle 1", value: 40, percentage: 40, color: "#4882d9" },
        { name: "Vehicle 2", value: 25, percentage: 25, color: "#c2d6f3" },
        { name: "Vehicle 3", value: 20, percentage: 20, color: "#4882d9" },
        { name: "Vehicle 4", value: 15, percentage: 15, color: "#c2d6f3" },
      ]
    }
  }

  // Delivery status data
  const getDeliveryStatusData = () => {
    if (timeRange === "week") {
      return [
        { name: "Ready", value: 15, percentage: 15 },
        { name: "Dispatched", value: 45, percentage: 45 },
        { name: "Delivered", value: 40, percentage: 40 },
      ]
    } else if (timeRange === "month") {
      return [
        { name: "Ready", value: 25, percentage: 25 },
        { name: "Dispatched", value: 35, percentage: 35 },
        { name: "Delivered", value: 40, percentage: 40 },
      ]
    } else if (timeRange === "quarter") {
      return [
        { name: "Ready", value: 20, percentage: 20 },
        { name: "Dispatched", value: 30, percentage: 30 },
        { name: "Delivered", value: 50, percentage: 50 },
      ]
    } else {
      // Custom time range or fallback
      return [
        { name: "Ready", value: 25, percentage: 25 },
        { name: "Dispatched", value: 35, percentage: 35 },
        { name: "Delivered", value: 40, percentage: 40 },
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
      <DashboardHeader
        icon={<Truck className="h-5 w-5 text-primary" />}
        title="Logistics Analytics"
        description="Monitor shipments and delivery performance"
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Shipments */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.totalShipments}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.totalShipmentsChange}%
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

        {/* On-Time Delivery */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">On-Time Delivery</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.onTimeDelivery}%</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.onTimeDeliveryChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg. Delivery Time */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Avg. Delivery Time</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.avgDeliveryTime} days</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    {kpiValues.avgDeliveryTimeChange}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Deliveries */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Deliveries</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.pendingDeliveries}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    {kpiValues.pendingDeliveriesChange}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Volume Trend - takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <ChartCard title="Shipment Volume Trend" description="Number of shipments and deliveries over time">
            <div className="p-6 pt-0 h-[300px]">
              <ChartContainer
                config={{
                  shipments: {
                    label: "Shipments",
                    color: "#6711f2", // Updated to light blue
                  },
                  deliveries: {
                    label: "Deliveries",
                    color: "#43ced7", // Updated to medium gray
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getShipmentVolumeData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const totalShipments = payload[0].value
                          const totalDeliveries = payload[1].value
                          const total = totalShipments + totalDeliveries
                          const shipmentsPercentage = ((totalShipments / total) * 100).toFixed(1)
                          const deliveriesPercentage = ((totalDeliveries / total) * 100).toFixed(1)

                          return (
                            <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
                              <p className="font-medium mb-1">{label}</p>
                              {payload.map((entry, index) => (
                                <p key={index} className="text-muted-foreground">
                                  <span className="font-medium" style={{ color: entry.color }}>
                                    {entry.name}:{" "}
                                  </span>
                                  {entry.value.toLocaleString()}
                                  {index === 0 && <span className="text-xs ml-1">({shipmentsPercentage}%)</span>}
                                  {index === 1 && <span className="text-xs ml-1">({deliveriesPercentage}%)</span>}
                                </p>
                              ))}
                              <p className="text-xs text-muted-foreground mt-1">Total: {total.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">
                                Delivery Rate: {((totalDeliveries / totalShipments) * 100).toFixed(1)}%
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                      wrapperStyle={{ outline: "none" }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ paddingTop: "10px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="shipments"
                      stroke="var(--color-shipments)"
                      fill="var(--color-shipments)"
                      fillOpacity={0.5}
                      name="Shipments"
                    />
                    <Area
                      type="monotone"
                      dataKey="deliveries"
                      stroke="var(--color-deliveries)"
                      fill="var(--color-deliveries)"
                      fillOpacity={0.7}
                      name="Deliveries"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="px-6 pb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span>
                  Shipment volume increased by {timeRange === "week" ? "12%" : timeRange === "month" ? "15%" : "18%"}{" "}
                  compared to previous {timeRange}
                </span>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Delivery Status - takes 1/3 of the width on large screens */}
        <Card className="flex flex-col overflow-hidden h-full">
          <CardHeader className="pb-2 pt-6">
            <CardTitle>Delivery Status</CardTitle>
            <CardDescription>Current status of all shipments</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-between pt-0 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border border-border rounded-md shadow-md p-3 text-sm">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-muted-foreground">
                            <span className="font-medium">{data.value}</span> shipments
                          </p>
                          <p className="text-muted-foreground">
                            <span className="font-medium">{data.percentage}%</span> of total
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Pie
                  data={getDeliveryStatusData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={80}
                  paddingAngle={2}
                  label={false}
                  labelLine={false}
                >
                  {getDeliveryStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="w-full mt-2">
              <div className="flex flex-wrap justify-center gap-3 mb-2">
                {getDeliveryStatusData().map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs">
                      {entry.name} ({entry.percentage}%)
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>
                  {getDeliveryStatusData().find((item) => item.name === "Delivered")?.value}% of shipments successfully
                  delivered
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Performance */}
        <ChartCard title="Delivery Performance" description="On-time vs delayed deliveries">
          <div className="p-6 pt-0 h-[300px]">
            <ChartContainer
              config={{
                onTime: {
                  label: "On Time",
                  color: "#2cd07e",
                },
                delayed: {
                  label: "Delayed",
                  color: "#f8285a",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDeliveryPerformanceData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                {entry.value}%
                              </p>
                            ))}
                            <p className="text-xs text-muted-foreground mt-1">
                              Total: {payload.reduce((sum, entry) => sum + entry.value, 0)}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Legend />
                  <Bar dataKey="onTime" stackId="a" fill="var(--color-onTime)" barSize={12} />
                  <Bar dataKey="delayed" stackId="a" fill="var(--color-delayed)" barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </ChartCard>

        {/* Carrier Performance - styled like Inventory Details */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Vehicle Performance</CardTitle>
            <CardDescription>Shipment distribution by vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getCarrierPerformanceData().map((carrier, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{carrier.name}</span>
                    <span className="text-sm font-medium">{carrier.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${carrier.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span>Vehicle 1 handles the largest portion of shipments at 35%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
