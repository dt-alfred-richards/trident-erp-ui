"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Filter, Plus, Search } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data for cost accounting
const costCenters = [
  {
    id: "CC-001",
    name: "Production Department",
    type: "Manufacturing",
    manager: "Rajesh Kumar",
    budget: 2500000,
    actual: 2350000,
    variance: 150000,
  },
  {
    id: "CC-002",
    name: "Assembly Line",
    type: "Manufacturing",
    manager: "Priya Sharma",
    budget: 1800000,
    actual: 1750000,
    variance: 50000,
  },
  {
    id: "CC-003",
    name: "Quality Control",
    type: "Manufacturing",
    manager: "Amit Singh",
    budget: 950000,
    actual: 980000,
    variance: -30000,
  },
  {
    id: "CC-004",
    name: "Packaging Department",
    type: "Manufacturing",
    manager: "Neha Gupta",
    budget: 750000,
    actual: 720000,
    variance: 30000,
  },
  {
    id: "CC-005",
    name: "Administration",
    type: "Support",
    manager: "Vikram Patel",
    budget: 1200000,
    actual: 1150000,
    variance: 50000,
  },
]

const products = [
  {
    id: "PROD-001",
    name: "Premium Steel Fastener",
    category: "Fasteners",
    materialCost: 120,
    laborCost: 45,
    overheadCost: 35,
    totalCost: 200,
    sellingPrice: 350,
    margin: 150,
    marginPercentage: 42.86,
  },
  {
    id: "PROD-002",
    name: "Industrial Grade Bolt",
    category: "Fasteners",
    materialCost: 85,
    laborCost: 30,
    overheadCost: 25,
    totalCost: 140,
    sellingPrice: 250,
    margin: 110,
    marginPercentage: 44.0,
  },
  {
    id: "PROD-003",
    name: "Precision Machined Component",
    category: "Components",
    materialCost: 350,
    laborCost: 180,
    overheadCost: 120,
    totalCost: 650,
    sellingPrice: 950,
    margin: 300,
    marginPercentage: 31.58,
  },
  {
    id: "PROD-004",
    name: "Stainless Steel Bracket",
    category: "Brackets",
    materialCost: 220,
    laborCost: 90,
    overheadCost: 70,
    totalCost: 380,
    sellingPrice: 580,
    margin: 200,
    marginPercentage: 34.48,
  },
  {
    id: "PROD-005",
    name: "Custom Aluminum Fitting",
    category: "Fittings",
    materialCost: 180,
    laborCost: 110,
    overheadCost: 60,
    totalCost: 350,
    sellingPrice: 520,
    margin: 170,
    marginPercentage: 32.69,
  },
]

const costBreakdownData = [
  { name: "Raw Materials", value: 4500000 },
  { name: "Direct Labor", value: 2800000 },
  { name: "Manufacturing Overhead", value: 1850000 },
  { name: "Quality Control", value: 950000 },
  { name: "Packaging", value: 750000 },
]

export function CostAccounting() {
  const [activeTab, setActiveTab] = useState("cost-centers")

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Manufacturing Cost"
          value="₹10.85M"
          description="Current month"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Cost per Unit"
          value="₹344"
          change="-5%"
          trend="down"
          description="vs last month"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Average Margin"
          value="37.12%"
          change="+2.5%"
          trend="up"
          description="vs last month"
          icon={<span className="text-lg">%</span>}
        />
      </div>

      <Tabs defaultValue="cost-centers" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="cost-centers">Cost Centers</TabsTrigger>
          <TabsTrigger value="product-costing">Product Costing</TabsTrigger>
          <TabsTrigger value="inventory-valuation">Inventory Valuation</TabsTrigger>
        </TabsList>

        <TabsContent value="cost-centers" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search cost centers..." className="pl-8 w-[300px]" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Cost Center
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead className="text-right">Budget (₹)</TableHead>
                    <TableHead className="text-right">Actual (₹)</TableHead>
                    <TableHead className="text-right">Variance (₹)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell className="font-medium">{center.id}</TableCell>
                      <TableCell>{center.name}</TableCell>
                      <TableCell>{center.type}</TableCell>
                      <TableCell>{center.manager}</TableCell>
                      <TableCell className="text-right">{center.budget.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{center.actual.toLocaleString("en-IN")}</TableCell>
                      <TableCell className={`text-right ${center.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {center.variance >= 0 ? "+" : ""}
                        {center.variance.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg font-semibold">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Amount (₹)",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costBreakdownData}>
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${(value / 1000000).toFixed(1)}M`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--color-value)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg font-semibold">Cost Center Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Budget vs Actual by Cost Center</h3>
                    <div className="space-y-2">
                      {costCenters.map((center) => (
                        <div key={center.id} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{center.name}</span>
                            <span>{Math.round((center.actual / center.budget) * 100)}%</span>
                          </div>
                          <div className="w-full bg-muted/70 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                center.actual <= center.budget
                                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                  : "bg-gradient-to-r from-red-500 to-red-600"
                              }`}
                              style={{ width: `${Math.min(Math.round((center.actual / center.budget) * 100), 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="product-costing" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search products..." className="pl-8 w-[300px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fasteners">Fasteners</SelectItem>
                  <SelectItem value="components">Components</SelectItem>
                  <SelectItem value="brackets">Brackets</SelectItem>
                  <SelectItem value="fittings">Fittings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Product
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Material Cost (₹)</TableHead>
                    <TableHead className="text-right">Labor Cost (₹)</TableHead>
                    <TableHead className="text-right">Overhead Cost (₹)</TableHead>
                    <TableHead className="text-right">Total Cost (₹)</TableHead>
                    <TableHead className="text-right">Selling Price (₹)</TableHead>
                    <TableHead className="text-right">Margin (%)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">{product.materialCost}</TableCell>
                      <TableCell className="text-right">{product.laborCost}</TableCell>
                      <TableCell className="text-right">{product.overheadCost}</TableCell>
                      <TableCell className="text-right font-medium">{product.totalCost}</TableCell>
                      <TableCell className="text-right">{product.sellingPrice}</TableCell>
                      <TableCell className="text-right">{product.marginPercentage.toFixed(2)}%</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Cost Composition Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Average Cost Breakdown</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Material Cost</span>
                        <span>55%</span>
                      </div>
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                          style={{ width: "55%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Labor Cost</span>
                        <span>25%</span>
                      </div>
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                          style={{ width: "25%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overhead Cost</span>
                        <span>20%</span>
                      </div>
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                          style={{ width: "20%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-4">Margin Analysis by Category</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fasteners</span>
                        <span>43.4%</span>
                      </div>
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                          style={{ width: "43.4%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Components</span>
                        <span>31.6%</span>
                      </div>
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                          style={{ width: "31.6%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Brackets</span>
                        <span>34.5%</span>
                      </div>
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                          style={{ width: "34.5%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fittings</span>
                        <span>32.7%</span>
                      </div>
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                          style={{ width: "32.7%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory-valuation" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="fifo">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Valuation Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fifo">FIFO</SelectItem>
                  <SelectItem value="lifo">LIFO</SelectItem>
                  <SelectItem value="avg">Weighted Average</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Inventory Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="raw">Raw Materials</SelectItem>
                  <SelectItem value="wip">Work in Progress</SelectItem>
                  <SelectItem value="finished">Finished Goods</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Inventory Valuation Summary (FIFO Method)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inventory Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Value (₹)</TableHead>
                    <TableHead className="text-right">Avg. Cost per Unit (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Raw Materials</TableCell>
                    <TableCell className="text-right">15,250 units</TableCell>
                    <TableCell className="text-right">3,812,500</TableCell>
                    <TableCell className="text-right">250</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Work in Progress</TableCell>
                    <TableCell className="text-right">2,800 units</TableCell>
                    <TableCell className="text-right">1,120,000</TableCell>
                    <TableCell className="text-right">400</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Finished Goods</TableCell>
                    <TableCell className="text-right">8,500 units</TableCell>
                    <TableCell className="text-right">4,250,000</TableCell>
                    <TableCell className="text-right">500</TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">26,550 units</TableCell>
                    <TableCell className="text-right">9,182,500</TableCell>
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg font-semibold">Inventory Turnover Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Inventory Turnover Ratio</div>
                      <div className="text-2xl font-bold mt-1">5.8</div>
                      <div className="text-sm text-green-600 mt-1">+0.3 vs last year</div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-muted-foreground">Days Inventory Outstanding</div>
                      <div className="text-2xl font-bold mt-1">62.9 days</div>
                      <div className="text-sm text-green-600 mt-1">-3.2 days vs last year</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Inventory Turnover by Category</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Raw Materials</span>
                          <span>6.2</span>
                        </div>
                        <div className="w-full bg-muted/70 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: "62%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Work in Progress</span>
                          <span>8.5</span>
                        </div>
                        <div className="w-full bg-muted/70 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Finished Goods</span>
                          <span>4.8</span>
                        </div>
                        <div className="w-full bg-muted/70 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: "48%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg font-semibold">Inventory Valuation Methods Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Valuation Method</TableHead>
                      <TableHead className="text-right">Total Value (₹)</TableHead>
                      <TableHead className="text-right">Difference (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>FIFO</TableCell>
                      <TableCell className="text-right">9,182,500</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>LIFO</TableCell>
                      <TableCell className="text-right">9,350,000</TableCell>
                      <TableCell className="text-right text-green-600">+167,500</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Weighted Average</TableCell>
                      <TableCell className="text-right">9,265,000</TableCell>
                      <TableCell className="text-right text-green-600">+82,500</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    Note: The company uses FIFO method for financial reporting and tax purposes as per Indian accounting
                    standards.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

