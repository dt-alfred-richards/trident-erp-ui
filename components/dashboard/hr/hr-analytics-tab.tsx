"use client"
import { DashboardHeader } from "@/components/dashboard/common/dashboard-header"
import { ChartCard } from "@/components/dashboard/common/chart-card"
import { useTimeRange } from "@/components/dashboard/common/use-time-range"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { Users, Calendar, TrendingUp, CheckCircle, Clock, Briefcase, ArrowUpRight } from "lucide-react"
// First, import the initialEmployees array from the HR Dashboard component
import { initialEmployees } from "@/components/hr/hr-dashboard"
import { useMemo } from "react"

const COLORS = ["#43ced7", "#f8285a", "#6610f2", "#2cd07e", "#1b84ff", "#f27104"]

export function HRAnalyticsTab() {
  const { timeRange, startDate, endDate, handleTimeRangeChange, setStartDate, setEndDate } = useTimeRange("month")

  // Define chart data for different time ranges
  const chartData = useMemo(() => {
    // Attendance data for different time ranges
    const attendanceData = {
      week: [
        { date: "Mon", present: 95, absent: 5, late: 8 },
        { date: "Tue", present: 92, absent: 8, late: 6 },
        { date: "Wed", present: 94, absent: 6, late: 10 },
        { date: "Thu", present: 90, absent: 10, late: 7 },
        { date: "Fri", present: 88, absent: 12, late: 9 },
      ],
      month: [
        { date: "Week 1", present: 93, absent: 7, late: 8 },
        { date: "Week 2", present: 91, absent: 9, late: 7 },
        { date: "Week 3", present: 94, absent: 6, late: 9 },
        { date: "Week 4", present: 92, absent: 8, late: 6 },
      ],
      quarter: [
        { date: "Jan", present: 92, absent: 8, late: 7 },
        { date: "Feb", present: 93, absent: 7, late: 8 },
        { date: "Mar", present: 91, absent: 9, late: 6 },
      ],
      custom: [
        { date: "Period 1", present: 90, absent: 10, late: 8 },
        { date: "Period 2", present: 92, absent: 8, late: 7 },
        { date: "Period 3", present: 94, absent: 6, late: 9 },
      ],
    }

    // Department headcount for different time ranges
    const departmentHeadcount = {
      week: [
        { name: "Production", value: 45 },
        { name: "Sales", value: 25 },
        { name: "Admin", value: 15 },
        { name: "Logistics", value: 20 },
        { name: "Finance", value: 10 },
      ],
      month: [
        { name: "Production", value: 48 },
        { name: "Sales", value: 27 },
        { name: "Admin", value: 16 },
        { name: "Logistics", value: 22 },
        { name: "Finance", value: 12 },
      ],
      quarter: [
        { name: "Production", value: 50 },
        { name: "Sales", value: 30 },
        { name: "Admin", value: 18 },
        { name: "Logistics", value: 25 },
        { name: "Finance", value: 15 },
      ],
      custom: [
        { name: "Production", value: 47 },
        { name: "Sales", value: 26 },
        { name: "Admin", value: 17 },
        { name: "Logistics", value: 21 },
        { name: "Finance", value: 11 },
      ],
    }

    // Employee turnover data for different time ranges
    const employeeTurnoverData = {
      week: [
        { month: "Mon", hires: 2, separations: 1 },
        { month: "Tue", hires: 1, separations: 0 },
        { month: "Wed", hires: 0, separations: 1 },
        { month: "Thu", hires: 1, separations: 0 },
        { month: "Fri", hires: 2, separations: 1 },
      ],
      month: [
        { month: "Week 1", hires: 3, separations: 1 },
        { month: "Week 2", hires: 2, separations: 2 },
        { month: "Week 3", hires: 4, separations: 1 },
        { month: "Week 4", hires: 3, separations: 2 },
      ],
      quarter: [
        { month: "Jan", hires: 5, separations: 2 },
        { month: "Feb", hires: 3, separations: 1 },
        { month: "Mar", hires: 4, separations: 3 },
        { month: "Apr", hires: 6, separations: 2 },
        { month: "May", hires: 2, separations: 4 },
        { month: "Jun", hires: 5, separations: 1 },
      ],
      custom: [
        { month: "Period 1", hires: 4, separations: 2 },
        { month: "Period 2", hires: 3, separations: 1 },
        { month: "Period 3", hires: 5, separations: 3 },
      ],
    }

    // Gender distribution for different time ranges
    const genderDistribution = {
      week: [
        { name: "Male", value: 58, count: 67 },
        { name: "Female", value: 42, count: 48 },
      ],
      month: [
        { name: "Male", value: 60, count: 71 },
        { name: "Female", value: 40, count: 47 },
      ],
      quarter: [
        { name: "Male", value: 62, count: 74 },
        { name: "Female", value: 38, count: 46 },
      ],
      custom: [
        { name: "Male", value: 59, count: 68 },
        { name: "Female", value: 41, count: 47 },
      ],
    }

    return {
      attendanceData,
      departmentHeadcount,
      employeeTurnoverData,
      genderDistribution,
    }
  }, [timeRange])

  // Get the appropriate data based on the selected time range
  const currentAttendanceData = chartData.attendanceData[timeRange]
  const currentDepartmentHeadcount = chartData.departmentHeadcount[timeRange]
  const currentEmployeeTurnoverData = chartData.employeeTurnoverData[timeRange]
  const currentGenderDistribution = chartData.genderDistribution[timeRange]

  // Calculate total employees for the current time range
  const totalEmployeesForTimeRange = useMemo(() => {
    return currentDepartmentHeadcount.reduce((sum, dept) => sum + dept.value, 0)
  }, [currentDepartmentHeadcount])

  // Calculate part-time employee salary total
  const calculatePartTimeSalary = () => {
    const partTimeEmployees = initialEmployees.filter((emp) => emp.employeeType === "Part-time")
    return partTimeEmployees.reduce((sum, emp) => sum + emp.salary, 0)
  }

  // Calculate full-time employee salary total
  const calculateFullTimeSalary = () => {
    const fullTimeEmployees = initialEmployees.filter((emp) => emp.employeeType === "Full-time")
    return fullTimeEmployees.reduce((sum, emp) => sum + emp.salary, 0)
  }

  // Replace the getKpiValues function to include fullTimeSalary and partTimeSalary
  const getKpiValues = () => {
    // Calculate full-time salary
    const fullTimeSalary = calculateFullTimeSalary()

    // Calculate part-time salary
    const partTimeSalary = calculatePartTimeSalary()

    // Calculate salary changes based on time range (simulated data)
    const fullTimeSalaryChange = {
      week: 2.3,
      month: 3.5,
      quarter: 4.2,
      custom: 3.0,
    }

    const partTimeSalaryChange = {
      week: 1.5,
      month: 2.2,
      quarter: 3.0,
      custom: 2.5,
    }

    switch (timeRange) {
      case "week":
        return {
          totalEmployees: 115,
          totalEmployeesChange: 3.2,
          attendanceRate: 92,
          attendanceRateChange: 1.5,
          fullTimeSalary: fullTimeSalary,
          fullTimeSalaryChange: fullTimeSalaryChange.week,
          partTimeSalary: partTimeSalary,
          partTimeSalaryChange: partTimeSalaryChange.week,
        }
      case "month":
        return {
          totalEmployees: 118,
          totalEmployeesChange: 3.2,
          attendanceRate: 94,
          attendanceRateChange: 1.5,
          fullTimeSalary: fullTimeSalary,
          fullTimeSalaryChange: fullTimeSalaryChange.month,
          partTimeSalary: partTimeSalary,
          partTimeSalaryChange: partTimeSalaryChange.month,
        }
      case "quarter":
        return {
          totalEmployees: 120,
          totalEmployeesChange: 3.2,
          attendanceRate: 93,
          attendanceRateChange: 1.5,
          fullTimeSalary: fullTimeSalary,
          fullTimeSalaryChange: fullTimeSalaryChange.quarter,
          partTimeSalary: partTimeSalary,
          partTimeSalaryChange: partTimeSalaryChange.quarter,
        }
      default:
        return {
          totalEmployees: 118,
          totalEmployeesChange: 3.2,
          attendanceRate: 94,
          attendanceRateChange: 1.5,
          fullTimeSalary: fullTimeSalary,
          fullTimeSalaryChange: fullTimeSalaryChange.custom,
          partTimeSalary: partTimeSalary,
          partTimeSalaryChange: partTimeSalaryChange.custom,
        }
    }
  }

  const kpiValues = getKpiValues()

  // Define specific colors for gender
  const GENDER_COLORS = [COLORS[0], COLORS[1]] // Primary for Male, Secondary for Female

  // Get time period description based on selected time range
  const getTimePeriodDescription = () => {
    switch (timeRange) {
      case "week":
        return "this week"
      case "month":
        return "this month"
      case "quarter":
        return "this quarter"
      case "custom":
        return "in selected period"
      default:
        return "this month"
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        icon={<Users className="h-5 w-5 text-primary" />}
        title="HR Analytics"
        description="Monitor employee metrics, attendance, and department performance"
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.totalEmployees}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.totalEmployeesChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {timeRange === "week" ? "This week" : timeRange === "month" ? "This month" : "This quarter"}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{kpiValues.attendanceRate}%</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.attendanceRateChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {timeRange === "week" ? "This week" : timeRange === "month" ? "This month" : "This quarter"}
                </p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Full Time Payout */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Full Time Payout</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">₹{(kpiValues.fullTimeSalary / 100000).toFixed(2)}L</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.fullTimeSalaryChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Full-time employees</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <Briefcase className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part Time Payout */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Part Time Payout</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">₹{kpiValues.partTimeSalary.toLocaleString()}</h3>
                  <div className="flex items-center text-xs font-medium text-green-500">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />+{kpiValues.partTimeSalaryChange}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Part-time employees</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends - takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Attendance Trends"
            description={`Daily attendance statistics ${getTimePeriodDescription()}`}
          >
            <div className="p-6 pt-0 h-[300px]">
              <ChartContainer
                config={{
                  present: {
                    label: "Present",
                    color: "#2cd07e", // Teal color
                  },
                  absent: {
                    label: "Absent",
                    color: "#f8285a", // Red color
                  },
                  late: {
                    label: "Late",
                    color: "#f6c000", // Amber/orange color
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={currentAttendanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={12}
                  >
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
                    <Bar dataKey="present" stackId="a" fill="var(--color-present)" />
                    <Bar dataKey="absent" stackId="a" fill="var(--color-absent)" />
                    <Bar dataKey="late" stackId="a" fill="var(--color-late)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="px-6 pb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span>
                  {timeRange === "week"
                    ? "Attendance has improved by 2.5% compared to last week"
                    : timeRange === "month"
                      ? "Attendance has improved by 3.2% compared to last month"
                      : timeRange === "quarter"
                        ? "Attendance has improved by 1.8% compared to last quarter"
                        : "Attendance has improved by 2.7% compared to previous period"}
                </span>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Department Headcount - takes 1/3 of the width on large screens */}
        <Card className="flex flex-col overflow-hidden h-full">
          <CardHeader className="pb-2 pt-6">
            <CardTitle>Department Headcount</CardTitle>
            <CardDescription>Employee distribution by department {getTimePeriodDescription()}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-between pt-0">
            <ChartContainer
              config={{
                value: {
                  label: "Headcount",
                },
                Production: {
                  label: "Production",
                  color: "#1b84ff",
                },
                Sales: {
                  label: "Sales",
                  color: "#43ced7",
                },
                Admin: {
                  label: "Admin",
                  color: "#725af2",
                },
                Logistics: {
                  label: "Logistics",
                  color: "#1bc6ff",
                },
                Finance: {
                  label: "Finance",
                  color: "#f6c000",
                },
              }}
              className="w-full max-w-[200px] h-[200px] [&_.recharts-pie-label-text]:fill-foreground"
            >
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
                              <span className="font-medium text-foreground">{data.value}</span> employees
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {Math.round((data.value / totalEmployeesForTimeRange) * 100)}%
                              </span>{" "}
                              of total
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Pie
                    data={currentDepartmentHeadcount}
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
                    {currentDepartmentHeadcount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="w-full mt-1">
              <div className="flex flex-wrap justify-center gap-2 mb-1">
                {currentDepartmentHeadcount.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs">
                      {entry.name} ({Math.round((entry.value / totalEmployeesForTimeRange) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>
                    Production department has the highest headcount at{" "}
                    {currentDepartmentHeadcount.find((dept) => dept.name === "Production")?.value} employees
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Turnover */}
        <ChartCard
          title="Employee Turnover"
          description={`${timeRange === "week" ? "Daily" : timeRange === "month" ? "Weekly" : "Monthly"} hires and separations ${getTimePeriodDescription()}`}
        >
          <div className="p-6 pt-0 h-[300px]">
            <ChartContainer
              config={{
                hires: {
                  label: "New Hires",
                  color: "#1b84ff", // Primary color
                },
                separations: {
                  label: "Separations",
                  color: "#f6c000", // Secondary color
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentEmployeeTurnoverData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
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
                                {entry.value} {entry.name === "hires" ? "new employees" : "departures"}
                              </p>
                            ))}
                            <p className="text-xs text-muted-foreground mt-1">
                              Net change: {payload[0].value - payload[1].value} employees
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
                    dataKey="hires"
                    stroke="var(--color-hires)"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="separations" stroke="var(--color-separations)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="px-6 pb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span>
                {timeRange === "week"
                  ? "Net employee growth of 4 employees this week"
                  : timeRange === "month"
                    ? "Net employee growth of 6 employees this month"
                    : timeRange === "quarter"
                      ? "Net employee growth of 12 employees over the past 6 months"
                      : "Net employee growth of 6 employees in the selected period"}
              </span>
            </div>
          </div>
        </ChartCard>

        {/* Gender Distribution - replacing Training Completion */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Employee gender breakdown {getTimePeriodDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentGenderDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm font-medium">
                      {item.value}% ({item.count})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>
                  {currentGenderDistribution[0].value > currentGenderDistribution[1].value
                    ? `Male employees represent the majority at ${currentGenderDistribution[0].value}% of the workforce`
                    : `Female employees represent the majority at ${currentGenderDistribution[1].value}% of the workforce`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
