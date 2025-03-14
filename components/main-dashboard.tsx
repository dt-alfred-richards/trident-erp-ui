"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Calendar, FileText, Package, RefreshCw, ShoppingCart, Truck, ClipboardList } from "lucide-react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { ProductionChart } from "@/components/dashboard/production-chart"
import { QuickActionCard } from "@/components/dashboard/quick-action-card"
import { AlertsWidget } from "@/components/dashboard/alerts-widget"
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed"
import { CreateSalesOrderDialog } from "@/components/sales/create-sales-order-dialog"
import { CreateRequisitionDialog } from "@/components/procurement/create-requisition-dialog"

export function MainDashboard() {
  const [timeRange, setTimeRange] = useState("week")
  const [isSalesDialogOpen, setIsSalesDialogOpen] = useState(false)
  const [isRequisitionDialogOpen, setIsRequisitionDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="insights">Business Insights</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Tabs defaultValue="week" className="w-auto" onValueChange={setTimeRange}>
              <TabsList className="h-8">
                <TabsTrigger value="day" className="text-xs px-2">
                  Today
                </TabsTrigger>
                <TabsTrigger value="week" className="text-xs px-2">
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs px-2">
                  Month
                </TabsTrigger>
                <TabsTrigger value="quarter" className="text-xs px-2">
                  Quarter
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" className="h-8">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Sales"
              value="₹24.5L"
              change="+12.5%"
              trend="up"
              description="vs previous period"
              icon={ShoppingCart}
            />
            <KpiCard
              title="Production Output"
              value="18.2K"
              change="+8.1%"
              trend="up"
              description="bottles produced"
              icon={ClipboardList}
            />
            <KpiCard
              title="Inventory Value"
              value="₹32.7L"
              change="-3.2%"
              trend="down"
              description="in stock value"
              icon={Package}
            />
            <KpiCard
              title="On-Time Delivery"
              value="94.2%"
              change="+2.3%"
              trend="up"
              description="delivery rate"
              icon={Truck}
            />
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left Column - Charts */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key metrics across departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="sales">
                    <TabsList className="mb-4">
                      <TabsTrigger value="sales">Sales</TabsTrigger>
                      <TabsTrigger value="inventory">Inventory</TabsTrigger>
                      <TabsTrigger value="production">Production</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sales" className="h-[300px]">
                      <SalesChart timeRange={timeRange} />
                    </TabsContent>
                    <TabsContent value="inventory" className="h-[300px]">
                      <InventoryChart />
                    </TabsContent>
                    <TabsContent value="production" className="h-[300px]">
                      <ProductionChart timeRange={timeRange} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-medium mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <QuickActionCard
                    title="Create Sales Order"
                    icon={ShoppingCart}
                    onClick={() => setIsSalesDialogOpen(true)}
                  />
                  <QuickActionCard
                    title="Start Production"
                    icon={ClipboardList}
                    onClick={() => console.log("Start Production")}
                  />
                  <QuickActionCard
                    title="Create Requisition"
                    icon={FileText}
                    onClick={() => setIsRequisitionDialogOpen(true)}
                  />
                  <QuickActionCard title="Allocate Stock" icon={Package} href="/inventory" />
                </div>
              </div>
            </div>

            {/* Right Column - Alerts and Activity */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Alerts & Notifications</h3>
                <AlertsWidget />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                <RecentActivityFeed />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Production Status */}
            <Card>
              <CardHeader>
                <CardTitle>Production Status</CardTitle>
                <CardDescription>Current production progress</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  {[
                    { sku: "500ml", status: "In Progress", percent: 65 },
                    { sku: "750ml", status: "Completed", percent: 100 },
                    { sku: "1000ml", status: "In Progress", percent: 40 },
                    { sku: "Custom-A", status: "Planned", percent: 0 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{item.sku}</p>
                        <Badge
                          variant={item.status === "Completed" ? "default" : "outline"}
                          className={item.status === "Planned" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <Progress value={item.percent} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">{item.percent}% complete</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View Production
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Upcoming Deliveries */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deliveries</CardTitle>
                <CardDescription>Scheduled deliveries</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  {[
                    { id: "SO-0995", customer: "Health Foods", date: "2023-10-15", status: "On Track" },
                    { id: "SO-0996", customer: "Wellness Store", date: "2023-10-16", status: "On Track" },
                    { id: "SO-0997", customer: "Fitness Center", date: "2023-10-18", status: "Delayed" },
                    { id: "SO-0998", customer: "Organic Life", date: "2023-10-20", status: "On Track" },
                  ].map((delivery, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{delivery.id}</p>
                        <p className="text-xs text-muted-foreground">{delivery.customer}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs">{new Date(delivery.date).toLocaleDateString()}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            delivery.status === "Delayed"
                              ? "bg-red-50 text-red-700 border-red-200 mt-1"
                              : "bg-green-50 text-green-700 border-green-200 mt-1"
                          }
                        >
                          {delivery.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View Logistics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Procurement Status */}
            <Card>
              <CardHeader>
                <CardTitle>Procurement Status</CardTitle>
                <CardDescription>Purchase orders and requisitions</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  {[
                    { id: "PO-001", supplier: "PlastiCorp Inc.", status: "Shipped", date: "2023-10-18" },
                    { id: "PO-002", supplier: "CapMakers Ltd.", status: "Partial", date: "2023-10-16" },
                    { id: "PO-003", supplier: "Adhesive Solutions", status: "Sent", date: "2023-10-20" },
                    { id: "REQ-001", supplier: "Pending Approval", status: "Pending", date: "2023-10-15" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{item.id}</p>
                        <p className="text-xs text-muted-foreground">{item.supplier}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            item.status === "Shipped"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : item.status === "Partial"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : item.status === "Sent"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                          }
                        >
                          {item.status}
                        </Badge>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View Procurement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Low Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Items below reorder level</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  {[
                    { name: "Plastic Resin", current: 150, reorder: 200, unit: "kg", urgency: "high" },
                    { name: "Bottle Caps", current: 5000, reorder: 8000, unit: "pcs", urgency: "high" },
                    { name: "Label Adhesive", current: 80, reorder: 100, unit: "liters", urgency: "medium" },
                    { name: "Cardboard Boxes", current: 300, reorder: 350, unit: "pcs", urgency: "low" },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{item.name}</p>
                        <Badge
                          variant={item.urgency === "high" ? "destructive" : "outline"}
                          className={
                            item.urgency === "medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : item.urgency === "low"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : ""
                          }
                        >
                          {item.urgency === "high" ? "Critical" : item.urgency === "medium" ? "Low" : "Reorder Soon"}
                        </Badge>
                      </div>
                      <Progress
                        value={(item.current / item.reorder) * 100}
                        className="h-2"
                        indicatorClassName={
                          item.urgency === "high"
                            ? "bg-red-500"
                            : item.urgency === "medium"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        {item.current} {item.unit} / {item.reorder} {item.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View Inventory
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Business Insights Tab */}
        <TabsContent value="insights" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Revenue contribution by customer</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  {[
                    { name: "ABC Corp", value: "₹5.2L", percent: 21 },
                    { name: "XYZ Retail", value: "₹4.8L", percent: 19 },
                    { name: "Global Foods", value: "₹3.7L", percent: 15 },
                    { name: "Premium Stores", value: "₹2.9L", percent: 12 },
                    { name: "Wellness Chain", value: "₹2.1L", percent: 9 },
                  ].map((customer, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.value}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-muted rounded-full mr-2 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${customer.percent}%` }}></div>
                        </div>
                        <Badge variant="outline">{customer.percent}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View Customer Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Sales by SKU */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by SKU</CardTitle>
                <CardDescription>Revenue distribution by product</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <SalesChart timeRange={timeRange} />
              </CardContent>
            </Card>

            {/* Sales Trends */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Sales Trends</CardTitle>
                <CardDescription>Revenue over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ProductionChart timeRange={timeRange} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateSalesOrderDialog open={isSalesDialogOpen} onOpenChange={setIsSalesDialogOpen} />
      <CreateRequisitionDialog open={isRequisitionDialogOpen} onOpenChange={setIsRequisitionDialogOpen} />
    </div>
  )
}

