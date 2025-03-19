"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, Plus, Search } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"

// Sample data for fixed assets
const assets = [
  {
    id: "FA-2023-0025",
    name: "CNC Machine - Model X500",
    category: "Machinery & Equipment",
    purchaseDate: "2023-06-10",
    cost: 2750000,
    currentValue: 2612500,
    location: "Production Floor A",
    status: "In Use",
  },
  {
    id: "FA-2023-0024",
    name: "Delivery Truck - Tata LPT 1109",
    category: "Vehicles",
    purchaseDate: "2023-05-15",
    cost: 1850000,
    currentValue: 1739000,
    location: "Transport Bay",
    status: "In Use",
  },
  {
    id: "FA-2023-0023",
    name: "Office Building - East Wing",
    category: "Real Estate",
    purchaseDate: "2022-12-01",
    cost: 25000000,
    currentValue: 24375000,
    location: "Main Campus",
    status: "In Use",
  },
  {
    id: "FA-2023-0022",
    name: "Computer Workstations (20 units)",
    category: "IT Equipment",
    purchaseDate: "2023-02-20",
    cost: 1200000,
    currentValue: 1050000,
    location: "Office Area",
    status: "In Use",
  },
  {
    id: "FA-2023-0021",
    name: "Packaging Machine - AutoPack 2000",
    category: "Machinery & Equipment",
    purchaseDate: "2022-10-15",
    cost: 1850000,
    currentValue: 1665000,
    location: "Packaging Department",
    status: "In Use",
  },
]

const depreciation = [
  {
    id: "DEP-2023-06",
    assetId: "FA-2023-0025",
    assetName: "CNC Machine - Model X500",
    period: "June 2023",
    amount: 22917,
    method: "Straight Line",
    rate: "10% p.a.",
  },
  {
    id: "DEP-2023-06",
    assetId: "FA-2023-0024",
    assetName: "Delivery Truck - Tata LPT 1109",
    period: "June 2023",
    amount: 18500,
    method: "Straight Line",
    rate: "12% p.a.",
  },
  {
    id: "DEP-2023-06",
    assetId: "FA-2023-0023",
    assetName: "Office Building - East Wing",
    period: "June 2023",
    amount: 41667,
    method: "Straight Line",
    rate: "2% p.a.",
  },
  {
    id: "DEP-2023-06",
    assetId: "FA-2023-0022",
    assetName: "Computer Workstations (20 units)",
    period: "June 2023",
    amount: 25000,
    method: "Straight Line",
    rate: "25% p.a.",
  },
  {
    id: "DEP-2023-06",
    assetId: "FA-2023-0021",
    assetName: "Packaging Machine - AutoPack 2000",
    period: "June 2023",
    amount: 15417,
    method: "Straight Line",
    rate: "10% p.a.",
  },
]

export function FixedAssets() {
  const [activeTab, setActiveTab] = useState("assets")

  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.cost, 0)
  const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0)
  const totalDepreciation = totalAssetValue - totalCurrentValue

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Asset Value"
          value={`₹${(totalAssetValue / 1000000).toFixed(2)}M`}
          description="Original cost"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Current Book Value"
          value={`₹${(totalCurrentValue / 1000000).toFixed(2)}M`}
          description="After depreciation"
          icon={<span className="text-lg">₹</span>}
        />
        <MetricCard
          title="Accumulated Depreciation"
          value={`₹${(totalDepreciation / 1000000).toFixed(2)}M`}
          description="Total depreciated value"
          icon={<span className="text-lg">₹</span>}
        />
      </div>

      <Tabs defaultValue="assets" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="assets">Asset Register</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search assets..." className="pl-8 w-[300px]" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="machinery">Machinery & Equipment</SelectItem>
                  <SelectItem value="vehicles">Vehicles</SelectItem>
                  <SelectItem value="realestate">Real Estate</SelectItem>
                  <SelectItem value="it">IT Equipment</SelectItem>
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
                Add Asset
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead className="text-right">Cost (₹)</TableHead>
                    <TableHead className="text-right">Current Value (₹)</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.id}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.category}</TableCell>
                      <TableCell>{asset.purchaseDate}</TableCell>
                      <TableCell className="text-right">{asset.cost.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{asset.currentValue.toLocaleString("en-IN")}</TableCell>
                      <TableCell>{asset.location}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                        >
                          {asset.status}
                        </Badge>
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
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="june">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="june">June 2023</SelectItem>
                  <SelectItem value="may">May 2023</SelectItem>
                  <SelectItem value="april">April 2023</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="machinery">Machinery & Equipment</SelectItem>
                  <SelectItem value="vehicles">Vehicles</SelectItem>
                  <SelectItem value="realestate">Real Estate</SelectItem>
                  <SelectItem value="it">IT Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">Run Depreciation</Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">Depreciation Schedule - June 2023</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entry ID</TableHead>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depreciation.map((entry, index) => (
                    <TableRow key={`${entry.id}-${index}`}>
                      <TableCell className="font-medium">{entry.id}</TableCell>
                      <TableCell>{entry.assetId}</TableCell>
                      <TableCell>{entry.assetName}</TableCell>
                      <TableCell>{entry.period}</TableCell>
                      <TableCell>{entry.method}</TableCell>
                      <TableCell>{entry.rate}</TableCell>
                      <TableCell className="text-right">{entry.amount.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={6}>Total</TableCell>
                    <TableCell className="text-right">
                      {depreciation.reduce((sum, entry) => sum + entry.amount, 0).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search maintenance records..." className="pl-8 w-[300px]" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Maintenance ID</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Completed Date</TableHead>
                    <TableHead className="text-right">Cost (₹)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">MAINT-2023-0012</TableCell>
                    <TableCell>CNC Machine - Model X500</TableCell>
                    <TableCell>Preventive</TableCell>
                    <TableCell>2023-07-15</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">25,000</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-medium">
                        Scheduled
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">MAINT-2023-0011</TableCell>
                    <TableCell>Delivery Truck - Tata LPT 1109</TableCell>
                    <TableCell>Preventive</TableCell>
                    <TableCell>2023-07-10</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className="text-right">15,000</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-medium">
                        Scheduled
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">MAINT-2023-0010</TableCell>
                    <TableCell>Packaging Machine - AutoPack 2000</TableCell>
                    <TableCell>Corrective</TableCell>
                    <TableCell>2023-06-05</TableCell>
                    <TableCell>2023-06-06</TableCell>
                    <TableCell className="text-right">35,000</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium"
                      >
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

