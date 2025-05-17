"use client"
import { useMemo } from "react"
import { useTimeRange } from "@/components/dashboard/common/use-time-range"
import { ChartContainer } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Tooltip,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, CreditCard, Wallet } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/common/dashboard-header"
import { ChartCard } from "@/components/dashboard/common/chart-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ["#43ced7", "#f8285a", "#6610f2", "#2cd07e", "#1b84ff", "#f27104"]

export function FinanceAnalyticsTab() {
  const { timeRange, startDate, endDate, handleTimeRangeChange, setStartDate, setEndDate } = useTimeRange()

  // Sample data for Finance analytics based on time range
  const revenueExpenseData = useMemo(() => {
    switch (timeRange) {
      case "week":
        return [
          { period: "Mon", revenue: 8500, expenses: 6200 },
          { period: "Tue", revenue: 7800, expenses: 5900 },
          { period: "Wed", revenue: 9200, expenses: 6800 },
          { period: "Thu", revenue: 8100, expenses: 6100 },
          { period: "Fri", revenue: 9500, expenses: 7200 },
          { period: "Sat", revenue: 5200, expenses: 3800 },
          { period: "Sun", revenue: 4200, expenses: 2900 },
        ]
      case "month":
        return [
          { period: "Week 1", revenue: 42500, expenses: 32000 },
          { period: "Week 2", revenue: 38700, expenses: 29500 },
          { period: "Week 3", revenue: 45200, expenses: 33800 },
          { period: "Week 4", revenue: 41600, expenses: 31700 },
        ]
      case "quarter":
        return [
          { period: "Jan", revenue: 125000, expenses: 95000 },
          { period: "Feb", revenue: 118000, expenses: 92000 },
          { period: "Mar", revenue: 135000, expenses: 98000 },
          { period: "Apr", revenue: 142000, expenses: 101000 },
          { period: "May", revenue: 155000, expenses: 105000 },
          { period: "Jun", revenue: 168000, expenses: 110000 },
        ]
      default:
        return [
          { period: "Jan", revenue: 125000, expenses: 95000 },
          { period: "Feb", revenue: 118000, expenses: 92000 },
          { period: "Mar", revenue: 135000, expenses: 98000 },
          { period: "Apr", revenue: 142000, expenses: 101000 },
          { period: "May", revenue: 155000, expenses: 105000 },
          { period: "Jun", revenue: 168000, expenses: 110000 },
        ]
    }
  }, [timeRange])

  const cashFlowData = useMemo(() => {
    switch (timeRange) {
      case "week":
        return [
          { period: "Mon", operating: 2300, investing: -1200, financing: -500 },
          { period: "Tue", operating: 1900, investing: -900, financing: -500 },
          { period: "Wed", operating: 2400, investing: -1500, financing: -500 },
          { period: "Thu", operating: 2000, investing: -1100, financing: -500 },
          { period: "Fri", operating: 2300, investing: -1300, financing: -500 },
          { period: "Sat", operating: 1400, investing: -700, financing: -300 },
          { period: "Sun", operating: 1300, investing: -600, financing: -200 },
        ]
      case "month":
        return [
          { period: "Week 1", operating: 10500, investing: -5200, financing: -2000 },
          { period: "Week 2", operating: 9200, investing: -4500, financing: -2000 },
          { period: "Week 3", operating: 11400, investing: -5800, financing: -2000 },
          { period: "Week 4", operating: 9900, investing: -4900, financing: -2000 },
        ]
      case "quarter":
        return [
          { period: "Jan", operating: 30000, investing: -15000, financing: -5000 },
          { period: "Feb", operating: 26000, investing: -12000, financing: -5000 },
          { period: "Mar", operating: 37000, investing: -18000, financing: -5000 },
          { period: "Apr", operating: 41000, investing: -20000, financing: -5000 },
          { period: "May", operating: 50000, investing: -25000, financing: -5000 },
          { period: "Jun", operating: 58000, investing: -30000, financing: -5000 },
        ]
      default:
        return [
          { period: "Jan", operating: 30000, investing: -15000, financing: -5000 },
          { period: "Feb", operating: 26000, investing: -12000, financing: -5000 },
          { period: "Mar", operating: 37000, investing: -18000, financing: -5000 },
          { period: "Apr", operating: 41000, investing: -20000, financing: -5000 },
          { period: "May", operating: 50000, investing: -25000, financing: -5000 },
          { period: "Jun", operating: 58000, investing: -30000, financing: -5000 },
        ]
    }
  }, [timeRange])

  const expenseBreakdownData = useMemo(() => {
    switch (timeRange) {
      case "week":
        return [
          { name: "Raw Materials", value: 42 },
          { name: "Labor", value: 28 },
          { name: "Overhead", value: 16 },
          { name: "Marketing", value: 8 },
          { name: "Admin", value: 6 },
        ]
      case "month":
        return [
          { name: "Raw Materials", value: 45 },
          { name: "Labor", value: 25 },
          { name: "Overhead", value: 15 },
          { name: "Marketing", value: 10 },
          { name: "Admin", value: 5 },
        ]
      case "quarter":
        return [
          { name: "Raw Materials", value: 48 },
          { name: "Labor", value: 22 },
          { name: "Overhead", value: 14 },
          { name: "Marketing", value: 12 },
          { name: "Admin", value: 4 },
        ]
      default:
        return [
          { name: "Raw Materials", value: 45 },
          { name: "Labor", value: 25 },
          { name: "Overhead", value: 15 },
          { name: "Marketing", value: 10 },
          { name: "Admin", value: 5 },
        ]
    }
  }, [timeRange])

  const accountsReceivableData = useMemo(() => {
    switch (timeRange) {
      case "week":
        return [
          { name: "Current", value: 70 },
          { name: "1-30 days", value: 18 },
          { name: "31-60 days", value: 8 },
          { name: "61-90 days", value: 3 },
          { name: ">90 days", value: 1 },
        ]
      case "month":
        return [
          { name: "Current", value: 65 },
          { name: "1-30 days", value: 20 },
          { name: "31-60 days", value: 10 },
          { name: "61-90 days", value: 3 },
          { name: ">90 days", value: 2 },
        ]
      case "quarter":
        return [
          { name: "Current", value: 60 },
          { name: "1-30 days", value: 22 },
          { name: "31-60 days", value: 12 },
          { name: "61-90 days", value: 4 },
          { name: ">90 days", value: 2 },
        ]
      default:
        return [
          { name: "Current", value: 65 },
          { name: "1-30 days", value: 20 },
          { name: "31-60 days", value: 10 },
          { name: "61-90 days", value: 3 },
          { name: ">90 days", value: 2 },
        ]
    }
  }, [timeRange])

  // Get KPI values based on time range
  const kpiValues = useMemo(() => {
    switch (timeRange) {
      case "week":
        return {
          revenue: 42500,
          revenueChange: { value: 8.5, isPositive: true },
          grossProfit: 34.5,
          grossProfitChange: { value: 1.2, isPositive: true },
          expenses: 28200,
          expensesChange: { value: 4.8, isPositive: false },
          cashBalance: 325000,
          cashBalanceChange: { value: 12.3, isPositive: true },
        }
      case "month":
        return {
          revenue: 168000,
          revenueChange: { value: 12.3, isPositive: true },
          grossProfit: 35.2,
          grossProfitChange: { value: 2.1, isPositive: true },
          expenses: 110000,
          expensesChange: { value: 3.5, isPositive: false },
          cashBalance: 325000,
          cashBalanceChange: { value: 15.7, isPositive: true },
        }
      case "quarter":
        return {
          revenue: 843000,
          revenueChange: { value: 15.8, isPositive: true },
          grossProfit: 36.8,
          grossProfitChange: { value: 3.4, isPositive: true },
          expenses: 601000,
          expensesChange: { value: 2.9, isPositive: false },
          cashBalance: 325000,
          cashBalanceChange: { value: 18.2, isPositive: true },
        }
      default:
        return {
          revenue: 168000,
          revenueChange: { value: 12.3, isPositive: true },
          grossProfit: 35.2,
          grossProfitChange: { value: 2.1, isPositive: true },
          expenses: 110000,
          expensesChange: { value: 3.5, isPositive: false },
          cashBalance: 325000,
          cashBalanceChange: { value: 15.7, isPositive: true },
        }
    }
  }, [timeRange])

  // Helper function to get time period description
  const getTimePeriodDescription = () => {
    switch (timeRange) {
      case "week":
        return "daily breakdown for the week"
      case "month":
        return "weekly breakdown for the month"
      case "quarter":
        return "monthly breakdown for the quarter"
      case "custom":
        return "custom date range"
      default:
        return "monthly breakdown"
    }
  }

  // Helper function to get the time period label
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

  // Helper function to get expense breakdown insight
  const getExpenseBreakdownInsight = () => {
    const highestExpense = expenseBreakdownData.reduce(
      (max, item) => (item.value > max.value ? item : max),
      expenseBreakdownData[0],
    )
    return `${highestExpense.name} account for ${highestExpense.value}% of total operating expenses`
  }

  // Helper function to get accounts receivable insight
  const getAccountsReceivableInsight = () => {
    const currentValue = accountsReceivableData.find((item) => item.name === "Current")?.value || 0
    const over60Value =
      (accountsReceivableData.find((item) => item.name === "61-90 days")?.value || 0) +
      (accountsReceivableData.find((item) => item.name === ">90 days")?.value || 0)
    return `${currentValue}% of accounts receivable are current, with only ${over60Value}% over 60 days`
  }

  // Calculate total expenses for percentage calculation
  const totalExpenses = expenseBreakdownData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader
        icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
        title="Finance Analytics"
        description="Monitor revenue, expenses, and financial performance"
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{`${(kpiValues.revenue / 1000).toFixed(1)}K`}</h3>
                  <div
                    className={`flex items-center text-xs font-medium ${kpiValues.revenueChange.isPositive ? "text-green-500" : "text-red-500"}`}
                  >
                    {kpiValues.revenueChange.isPositive ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {kpiValues.revenueChange.isPositive ? "+" : ""}
                    {kpiValues.revenueChange.value}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gross Profit Margin */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gross Profit Margin</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{`${kpiValues.grossProfit}%`}</h3>
                  <div
                    className={`flex items-center text-xs font-medium ${kpiValues.grossProfitChange.isPositive ? "text-green-500" : "text-red-500"}`}
                  >
                    {kpiValues.grossProfitChange.isPositive ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {kpiValues.grossProfitChange.isPositive ? "+" : ""}
                    {kpiValues.grossProfitChange.value}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Expenses */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Operating Expenses</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{`${(kpiValues.expenses / 1000).toFixed(1)}K`}</h3>
                  <div
                    className={`flex items-center text-xs font-medium ${kpiValues.expensesChange.isPositive ? "text-green-500" : "text-red-500"}`}
                  >
                    {kpiValues.expensesChange.isPositive ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {kpiValues.expensesChange.isPositive ? "+" : ""}
                    {kpiValues.expensesChange.value}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{getTimePeriodLabel()}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cash Balance */}
        <Card className="overflow-hidden border-none shadow-md bg-[#f1f5f8] dark:bg-[#0f1729]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cash Balance</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{`${(kpiValues.cashBalance / 1000).toFixed(1)}K`}</h3>
                  <div
                    className={`flex items-center text-xs font-medium ${kpiValues.cashBalanceChange.isPositive ? "text-green-500" : "text-red-500"}`}
                  >
                    {kpiValues.cashBalanceChange.isPositive ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {kpiValues.cashBalanceChange.isPositive ? "+" : ""}
                    {kpiValues.cashBalanceChange.value}%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Current balance</p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <Wallet className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue vs Expenses */}
        <ChartCard
          title="Revenue vs Expenses"
          description={`Financial performance - ${getTimePeriodDescription()}`}
          className="md:col-span-2"
        >
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "#43ced7", // Updated to light green
              },
              expenses: {
                label: "Expenses",
                color: "#f8285a", // Updated to light red
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
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
                              ₹{entry.value.toLocaleString()}
                            </p>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                  wrapperStyle={{ outline: "none" }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="var(--color-revenue)" barSize={12} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            <span>
              Revenue has increased by {kpiValues.revenueChange.value}% compared to last {timeRange}
            </span>
          </div>
        </ChartCard>

        {/* Expense Breakdown - Updated to match Product Distribution layout */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Distribution of expenses - {timeRange} view</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pt-0">
            <ChartContainer
              config={{
                value: {
                  label: "Expenses",
                },
                "Raw Materials": {
                  label: "Raw Materials",
                  color: "#4882d9",
                },
                Labor: {
                  label: "Labor",
                  color: "#c2d6f3",
                },
                Overhead: {
                  label: "Overhead",
                  color: "#4882d9",
                },
                Marketing: {
                  label: "Marketing",
                  color: "#c2d6f3",
                },
                Admin: {
                  label: "Admin",
                  color: "#4882d9",
                },
              }}
              className="w-full max-w-[280px] aspect-square"
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
                              <span className="font-medium text-foreground">{data.value}%</span> of expenses
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">
                                ₹{Math.round((data.value / 100) * kpiValues.expenses).toLocaleString()}
                              </span>{" "}
                              total
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Pie
                    data={expenseBreakdownData}
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
                    {expenseBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="w-full mt-4">
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {expenseBreakdownData.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs">
                      {entry.name} ({entry.value}%)
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 font-medium text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span>{getExpenseBreakdownInsight()}</span>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-1">Showing expense distribution by category</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Cash Flow */}
        <ChartCard
          title="Cash Flow"
          description={`Cash flow by activity - ${getTimePeriodDescription()}`}
          className="md:col-span-2"
        >
          <ChartContainer
            config={{
              operating: {
                label: "Operating",
                color: "#3284f0", // Updated color
              },
              investing: {
                label: "Investing",
                color: "#77878f", // Updated color
              },
              financing: {
                label: "Financing",
                color: "#9ad9ca", // Updated color
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
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
                              ₹{Math.abs(entry.value).toLocaleString()}
                              {entry.value < 0 ? " (outflow)" : " (inflow)"}
                            </p>
                          ))}
                          <p className="text-xs text-muted-foreground mt-1">
                            Net: ₹{payload.reduce((sum, entry) => sum + entry.value, 0).toLocaleString()}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                  wrapperStyle={{ outline: "none" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="operating"
                  stackId="1"
                  stroke="var(--color-operating)"
                  fill="var(--color-operating)"
                />
                <Area
                  type="monotone"
                  dataKey="investing"
                  stackId="1"
                  stroke="var(--color-investing)"
                  fill="var(--color-investing)"
                />
                <Area
                  type="monotone"
                  dataKey="financing"
                  stackId="1"
                  stroke="var(--color-financing)"
                  fill="var(--color-financing)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            <span>
              Operating cash flow has increased by{" "}
              {timeRange === "week" ? "13.5" : timeRange === "month" ? "23.7" : "93.3"}% over the period
            </span>
          </div>
        </ChartCard>

        {/* Accounts Receivable Aging - Updated to match Product Distribution layout */}
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Accounts Receivable Aging</CardTitle>
            <CardDescription>Outstanding invoices - {timeRange} view</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pt-0">
            <ChartContainer
              config={{
                value: {
                  label: "Aging",
                },
                Current: {
                  label: "Current",
                  color: "#4882d9",
                },
                "1-30 days": {
                  label: "1-30 days",
                  color: "#c2d6f3",
                },
                "31-60 days": {
                  label: "31-60 days",
                  color: "#4882d9",
                },
                "61-90 days": {
                  label: "61-90 days",
                  color: "#c2d6f3",
                },
                ">90 days": {
                  label: ">90 days",
                  color: "#4882d9",
                },
              }}
              className="w-full max-w-[280px] aspect-square"
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
                              <span className="font-medium text-foreground">{data.value}%</span> of receivables
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">
                                ₹{Math.round((data.value / 100) * (kpiValues.revenue * 0.4)).toLocaleString()}
                              </span>{" "}
                              outstanding
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Pie
                    data={accountsReceivableData}
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
                    {accountsReceivableData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="w-full mt-4">
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {accountsReceivableData.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs">
                      {entry.name} ({entry.value}%)
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 font-medium text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span>{getAccountsReceivableInsight()}</span>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-1">Showing aging of outstanding invoices</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
