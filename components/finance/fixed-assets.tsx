"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Plus, Search, Trash2 } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { AddAssetDialog, type Asset } from "./add-asset-dialog"
import { ViewAssetDialog } from "./view-asset-dialog"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"
import { ScheduleMaintenanceDialog, type MaintenanceRecord } from "./schedule-maintenance-dialog"
import { ViewMaintenanceDialog } from "./view-maintenance-dialog"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

// Sample data for fixed assets
const initialAssets = [
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
  // June 2023 entries
  {
    id: "DEP-2023-06",
    assetId: "FA-2023-0025",
    assetName: "CNC Machine - Model X500",
    period: "June 2023",
    amount: 22917,
    method: "Straight Line",
    rate: "10% p.a.",
    category: "Machinery & Equipment",
  },
  {
    id: "DEP-2023-06",
    assetId: "FA-2023-0024",
    assetName: "Delivery Truck - Tata LPT 1109",
    period: "June 2023",
    amount: 18500,
    method: "Straight Line",
    rate: "12% p.a.",
    category: "Vehicles",
  },
  {
    id: "DEP-2023-06",
    assetId: "FA-2023-0023",
    assetName: "Office Building - East Wing",
    period: "June 2023",
    amount: 41667,
    method: "Straight Line",
    rate: "2% p.a.",
    category: "Real Estate",
  },
  {
    id: "DEP-2023-06",
    assetId: "FA-2023-0022",
    assetName: "Computer Workstations (20 units)",
    period: "June 2023",
    amount: 25000,
    method: "Straight Line",
    rate: "25% p.a.",
    category: "IT Equipment",
  },
  {
    id: "DEP-2023-06",
    assetId: "FA-2023-0021",
    assetName: "Packaging Machine - AutoPack 2000",
    period: "June 2023",
    amount: 15417,
    method: "Straight Line",
    rate: "10% p.a.",
    category: "Machinery & Equipment",
  },

  // May 2023 entries
  {
    id: "DEP-2023-05",
    assetId: "FA-2023-0025",
    assetName: "CNC Machine - Model X500",
    period: "May 2023",
    amount: 22917,
    method: "Straight Line",
    rate: "10% p.a.",
    category: "Machinery & Equipment",
  },
  {
    id: "DEP-2023-05",
    assetId: "FA-2023-0024",
    assetName: "Delivery Truck - Tata LPT 1109",
    period: "May 2023",
    amount: 18500,
    method: "Straight Line",
    rate: "12% p.a.",
    category: "Vehicles",
  },
  {
    id: "DEP-2023-05",
    assetId: "FA-2023-0023",
    assetName: "Office Building - East Wing",
    period: "May 2023",
    amount: 41667,
    method: "Straight Line",
    rate: "2% p.a.",
    category: "Real Estate",
  },

  // April 2023 entries
  {
    id: "DEP-2023-04",
    assetId: "FA-2023-0025",
    assetName: "CNC Machine - Model X500",
    period: "April 2023",
    amount: 22917,
    method: "Straight Line",
    rate: "10% p.a.",
    category: "Machinery & Equipment",
  },
  {
    id: "DEP-2023-04",
    assetId: "FA-2023-0024",
    assetName: "Delivery Truck - Tata LPT 1109",
    period: "April 2023",
    amount: 18500,
    method: "Straight Line",
    rate: "12% p.a.",
    category: "Vehicles",
  },
]

// Sample data for maintenance records
const maintenanceRecords: MaintenanceRecord[] = [
  {
    id: "MAINT-2023-0012",
    asset: "CNC Machine - Model X500",
    assetId: "FA-2023-0025",
    type: "Preventive",
    scheduledDate: "2023-07-15",
    completedDate: "",
    cost: 25000,
    status: "Scheduled",
    notes: "Regular quarterly maintenance",
    technician: "Rahul Sharma",
  },
  {
    id: "MAINT-2023-0011",
    asset: "Delivery Truck - Tata LPT 1109",
    assetId: "FA-2023-0024",
    type: "Preventive",
    scheduledDate: "2023-07-10",
    completedDate: "",
    cost: 15000,
    status: "Scheduled",
    notes: "Engine oil change and brake inspection",
    technician: "Suresh Kumar",
  },
  {
    id: "MAINT-2023-0010",
    asset: "Packaging Machine - AutoPack 2000",
    assetId: "FA-2023-0021",
    type: "Corrective",
    scheduledDate: "2023-06-05",
    completedDate: "2023-06-06",
    cost: 35000,
    status: "Completed",
    notes: "Replaced faulty conveyor belt and calibrated sensors",
    technician: "Amit Patel",
  },
  {
    id: "MAINT-2023-0009",
    asset: "Computer Workstations (20 units)",
    assetId: "FA-2023-0022",
    type: "Preventive",
    scheduledDate: "2023-06-20",
    completedDate: "2023-06-21",
    cost: 12000,
    status: "Completed",
    notes: "Software updates and hardware inspection",
    technician: "Priya Singh",
  },
  {
    id: "MAINT-2023-0008",
    asset: "Office Building - East Wing",
    assetId: "FA-2023-0023",
    type: "Preventive",
    scheduledDate: "2023-05-15",
    completedDate: "2023-05-17",
    cost: 75000,
    status: "Completed",
    notes: "HVAC system maintenance and electrical inspection",
    technician: "Vikram Mehta",
  },
  {
    id: "MAINT-2023-0007",
    asset: "CNC Machine - Model X500",
    assetId: "FA-2023-0025",
    type: "Corrective",
    scheduledDate: "2023-04-10",
    completedDate: "2023-04-12",
    cost: 45000,
    status: "Completed",
    notes: "Replaced worn-out cutting tools and calibrated positioning system",
    technician: "Rahul Sharma",
  },
]

// Map for category values to actual category names
const categoryMap = {
  all: "All Categories",
  machinery: "Machinery & Equipment",
  vehicles: "Vehicles",
  realestate: "Real Estate",
  it: "IT Equipment",
}

export function FixedAssets() {
  const [activeTab, setActiveTab] = useState("assets")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [addAssetDialogOpen, setAddAssetDialogOpen] = useState(false)
  const [viewAssetDialogOpen, setViewAssetDialogOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("june")
  const [depreciationCategory, setDepreciationCategory] = useState("all")
  const [maintenanceSearchQuery, setMaintenanceSearchQuery] = useState("")
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState("all")
  const [scheduleMaintenanceOpen, setScheduleMaintenanceOpen] = useState(false)
  const [maintenanceRecordsList, setMaintenanceRecordsList] = useState<MaintenanceRecord[]>(maintenanceRecords)
  const [viewMaintenanceDialogOpen, setViewMaintenanceDialogOpen] = useState(false)
  const [selectedMaintenanceRecord, setSelectedMaintenanceRecord] = useState<MaintenanceRecord | null>(null)
  const [deleteMaintenanceConfirmOpen, setDeleteMaintenanceConfirmOpen] = useState(false)
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<MaintenanceRecord | null>(null)

  // Add a confirmation state and function for deletion
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)

  // Pagination state
  const [assetPage, setAssetPage] = useState(0)
  const [assetRowsPerPage, setAssetRowsPerPage] = useState(5)
  const [maintenancePage, setMaintenancePage] = useState(0)
  const [maintenanceRowsPerPage, setMaintenanceRowsPerPage] = useState(5)

  // Handle adding a new asset
  const handleAddAsset = (newAsset: Asset) => {
    setAssets((prevAssets) => [...prevAssets, newAsset])
    toast({
      title: "Asset Added",
      description: `${newAsset.name} has been added successfully.`,
    })
  }

  // Handle viewing an asset
  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset)
    setViewAssetDialogOpen(true)
  }

  // Add a function to handle deletion
  const handleDeleteAsset = (asset: Asset) => {
    setAssetToDelete(asset)
    setDeleteConfirmOpen(true)
  }

  // Add a function to confirm deletion
  const confirmDeleteAsset = () => {
    if (assetToDelete) {
      setAssets((prevAssets) => prevAssets.filter((a) => a.id !== assetToDelete.id))
      toast({
        title: "Asset Deleted",
        description: `${assetToDelete.name} has been deleted successfully.`,
      })
      setAssetToDelete(null)
    }
  }

  // Add a function to handle saving updated asset
  const handleSaveAsset = (updatedAsset: Asset) => {
    setAssets((prevAssets) => prevAssets.map((asset) => (asset.id === updatedAsset.id ? updatedAsset : asset)))
  }

  // Handle viewing a maintenance record
  const handleViewMaintenance = (record: MaintenanceRecord) => {
    setSelectedMaintenanceRecord(record)
    setViewMaintenanceDialogOpen(true)
  }

  // Handle deleting a maintenance record
  const handleDeleteMaintenance = (record: MaintenanceRecord) => {
    setMaintenanceToDelete(record)
    setDeleteMaintenanceConfirmOpen(true)
  }

  // Confirm deletion of maintenance record
  const confirmDeleteMaintenance = () => {
    if (maintenanceToDelete) {
      setMaintenanceRecordsList((prev) => prev.filter((record) => record.id !== maintenanceToDelete.id))
      toast({
        title: "Maintenance Record Deleted",
        description: `Maintenance record for ${maintenanceToDelete.asset} has been deleted.`,
      })
      setMaintenanceToDelete(null)
    }
  }

  // Handle updating a maintenance record
  const handleUpdateMaintenance = (updatedRecord: MaintenanceRecord) => {
    setMaintenanceRecordsList((prev) => prev.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))
    toast({
      title: "Maintenance Record Updated",
      description: `Maintenance record for ${updatedRecord.asset} has been updated.`,
    })
  }

  // Handle exporting data based on active tab
  const handleExport = () => {
    let data: any[] = []
    let filename = "export.csv"
    let headers: string[] = []

    // Determine which data to export based on active tab
    if (activeTab === "assets") {
      data = filteredAssets
      filename = "asset-register.csv"
      headers = ["Asset ID", "Name", "Category", "Purchase Date", "Cost", "Current Value", "Location", "Status"]
    } else if (activeTab === "depreciation") {
      data = getFilteredDepreciation()
      filename = `depreciation-${selectedPeriod}.csv`
      headers = ["Entry ID", "Asset ID", "Asset Name", "Period", "Method", "Rate", "Amount"]
    } else if (activeTab === "maintenance") {
      data = getFilteredMaintenanceRecords()
      filename = "maintenance-records.csv"
      headers = ["Maintenance ID", "Asset", "Type", "Scheduled Date", "Completed Date", "Cost", "Status", "Technician"]
    }

    // Convert data to CSV
    const csvContent = [
      headers.join(","),
      ...data.map((item) => {
        if (activeTab === "assets") {
          return [
            item.id,
            `"${item.name}"`,
            `"${item.category}"`,
            item.purchaseDate,
            item.cost,
            item.currentValue,
            `"${item.location}"`,
            `"${item.status}"`,
          ].join(",")
        } else if (activeTab === "depreciation") {
          return [
            item.id,
            item.assetId,
            `"${item.assetName}"`,
            `"${item.period}"`,
            `"${item.method}"`,
            `"${item.rate}"`,
            item.amount,
          ].join(",")
        } else {
          return [
            item.id,
            `"${item.asset}"`,
            `"${item.type}"`,
            item.scheduledDate,
            item.completedDate || "",
            item.cost,
            `"${item.status}"`,
            `"${item.technician || ""}"`,
          ].join(",")
        }
      }),
    ].join("\n")

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export Successful",
      description: `${filename} has been downloaded.`,
    })
  }

  // Handle running depreciation
  const handleRunDepreciation = () => {
    // Simulate depreciation calculation
    toast({
      title: "Depreciation Run",
      description: "Depreciation has been calculated successfully for the selected period.",
    })

    // In a real application, this would update the depreciation data
    // For demonstration, we'll just show a success message
  }

  // Filter assets based on search query and selected category
  const filteredAssets = assets.filter((asset) => {
    // First check if the asset matches the search query
    const matchesSearch =
      searchQuery === "" ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase())

    // Then check if it matches the selected category
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "machinery" && asset.category === "Machinery & Equipment") ||
      (selectedCategory === "vehicles" && asset.category === "Vehicles") ||
      (selectedCategory === "realestate" && asset.category === "Real Estate") ||
      (selectedCategory === "it" && asset.category === "IT Equipment")

    // Return true only if both conditions are met
    return matchesSearch && matchesCategory
  })

  // Paginate assets
  const paginatedAssets = filteredAssets.slice(
    assetPage * assetRowsPerPage,
    assetPage * assetRowsPerPage + assetRowsPerPage,
  )

  // Filter depreciation data based on selected period and category
  const getFilteredDepreciation = () => {
    const periodMap: Record<string, string> = {
      june: "June 2023",
      may: "May 2023",
      april: "April 2023",
    }

    return depreciation.filter((entry) => {
      // First filter by period
      const matchesPeriod = entry.period === periodMap[selectedPeriod]

      // Then filter by category if not "all"
      const matchesCategory =
        depreciationCategory === "all" ||
        (depreciationCategory === "machinery" && entry.category === "Machinery & Equipment") ||
        (depreciationCategory === "vehicles" && entry.category === "Vehicles") ||
        (depreciationCategory === "realestate" && entry.category === "Real Estate") ||
        (depreciationCategory === "it" && entry.category === "IT Equipment")

      // Return true only if both conditions are met
      return matchesPeriod && matchesCategory
    })
  }

  // Paginate depreciation entries
  const paginatedDepreciation = getFilteredDepreciation()

  // Filter maintenance records based on search query and status filter
  const getFilteredMaintenanceRecords = () => {
    return maintenanceRecordsList.filter((record) => {
      // First filter by search query
      const matchesSearch =
        maintenanceSearchQuery === "" ||
        record.id.toLowerCase().includes(maintenanceSearchQuery.toLowerCase()) ||
        record.asset.toLowerCase().includes(maintenanceSearchQuery.toLowerCase()) ||
        record.type.toLowerCase().includes(maintenanceSearchQuery.toLowerCase()) ||
        record.notes.toLowerCase().includes(maintenanceSearchQuery.toLowerCase()) ||
        record.technician.toLowerCase().includes(maintenanceSearchQuery.toLowerCase())

      // Then filter by status if not "all"
      const matchesStatus =
        maintenanceStatusFilter === "all" || record.status.toLowerCase() === maintenanceStatusFilter.toLowerCase()

      // Return true only if both conditions are met
      return matchesSearch && matchesStatus
    })
  }

  // Paginate maintenance records
  const paginatedMaintenanceRecords = getFilteredMaintenanceRecords().slice(
    maintenancePage * maintenanceRowsPerPage,
    maintenancePage * maintenanceRowsPerPage + maintenanceRowsPerPage,
  )

  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.cost, 0)
  const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0)
  const totalDepreciation = totalAssetValue - totalCurrentValue

  const handleScheduleMaintenance = (record: MaintenanceRecord) => {
    setMaintenanceRecordsList((prev) => [record, ...prev])
    toast({
      title: "Maintenance Scheduled",
      description: `Maintenance for ${record.asset} has been scheduled for ${record.scheduledDate}.`,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Asset Value"
          value={`₹${(totalAssetValue / 1000000).toFixed(2)}M`}
          description="Original cost"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
        />
        <MetricCard
          title="Current Book Value"
          value={`₹${(totalCurrentValue / 1000000).toFixed(2)}M`}
          description="After depreciation"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <MetricCard
          title="Accumulated Depreciation"
          value={`₹${(totalDepreciation / 1000000).toFixed(2)}M`}
          description="Total depreciated value"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-amber-500"
          iconBgColor="bg-amber-500/10"
        />
      </div>

      <Tabs defaultValue="assets" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="assets"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Asset Register
          </TabsTrigger>
          <TabsTrigger
            value="depreciation"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Depreciation
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search assets..."
                  className="pl-8 w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => setAddAssetDialogOpen(true)}
                className="bg-[#2cd07e] hover:bg-[#2cd07e]/90 text-white"
              >
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
                  {paginatedAssets.length > 0 ? (
                    paginatedAssets.map((asset) => (
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
                            className={`font-medium ${
                              asset.status === "In Use"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                            }`}
                          >
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="View Asset"
                              onClick={() => handleViewAsset(asset)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete Asset"
                              onClick={() => handleDeleteAsset(asset)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                        No assets found matching the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Assets Pagination */}
          {filteredAssets.length > 0 && (
            <DataTablePagination
              totalItems={filteredAssets.length}
              itemsPerPage={assetRowsPerPage}
              currentPage={assetPage + 1}
              onPageChange={(page) => setAssetPage(page - 1)}
              onRowsPerPageChange={(newValue) => {
                setAssetRowsPerPage(newValue)
                setAssetPage(0)
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="june">June 2023</SelectItem>
                  <SelectItem value="may">May 2023</SelectItem>
                  <SelectItem value="april">April 2023</SelectItem>
                </SelectContent>
              </Select>
              <Select value={depreciationCategory} onValueChange={setDepreciationCategory}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-[#f8285a] hover:bg-[#d91e4a] text-white" onClick={handleRunDepreciation}>
                Run Depreciation
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">
                Depreciation Schedule -{" "}
                {selectedPeriod === "june" ? "June 2023" : selectedPeriod === "may" ? "May 2023" : "April 2023"}
                {depreciationCategory !== "all" && ` (${categoryMap[depreciationCategory]})`}
              </CardTitle>
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
                  {paginatedDepreciation.length > 0 ? (
                    paginatedDepreciation.map((entry, index) => (
                      <TableRow key={`${entry.id}-${index}`}>
                        <TableCell className="font-medium">{entry.id}</TableCell>
                        <TableCell>{entry.assetId}</TableCell>
                        <TableCell>{entry.assetName}</TableCell>
                        <TableCell>{entry.period}</TableCell>
                        <TableCell>{entry.method}</TableCell>
                        <TableCell>{entry.rate}</TableCell>
                        <TableCell className="text-right">{entry.amount.toLocaleString("en-IN")}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No depreciation entries found matching the current filters
                      </TableCell>
                    </TableRow>
                  )}
                  {paginatedDepreciation.length > 0 && (
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell colSpan={6}>Total</TableCell>
                      <TableCell className="text-right">
                        {paginatedDepreciation.reduce((sum, entry) => sum + entry.amount, 0).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  )}
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
                <Input
                  type="search"
                  placeholder="Search maintenance records..."
                  className="pl-8 w-[300px]"
                  value={maintenanceSearchQuery}
                  onChange={(e) => setMaintenanceSearchQuery(e.target.value)}
                />
              </div>
              <Select value={maintenanceStatusFilter} onValueChange={setMaintenanceStatusFilter}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => setScheduleMaintenanceOpen(true)}
                className="bg-[#1b84ff] hover:bg-[#0a6edf] text-white"
              >
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
                  {paginatedMaintenanceRecords.length > 0 ? (
                    paginatedMaintenanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.id}</TableCell>
                        <TableCell>{record.asset}</TableCell>
                        <TableCell>{record.type}</TableCell>
                        <TableCell>{record.scheduledDate}</TableCell>
                        <TableCell>{record.completedDate || "-"}</TableCell>
                        <TableCell className="text-right">{record.cost.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`font-medium ${
                              record.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                                : record.status === "Scheduled"
                                  ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800"
                                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                            }`}
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="View Maintenance"
                              onClick={() => handleViewMaintenance(record)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete Maintenance"
                              onClick={() => handleDeleteMaintenance(record)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No maintenance records found matching the current filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Maintenance Records Pagination */}
          {getFilteredMaintenanceRecords().length > 0 && (
            <DataTablePagination
              totalItems={getFilteredMaintenanceRecords().length}
              itemsPerPage={maintenanceRowsPerPage}
              currentPage={maintenancePage + 1}
              onPageChange={(page) => setMaintenancePage(page - 1)}
              onRowsPerPageChange={(newValue) => {
                setMaintenanceRowsPerPage(newValue)
                setMaintenancePage(0)
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Add Asset Dialog */}
      <AddAssetDialog open={addAssetDialogOpen} onOpenChange={setAddAssetDialogOpen} onAddAsset={handleAddAsset} />

      {/* View Asset Dialog */}
      <ViewAssetDialog
        asset={selectedAsset}
        open={viewAssetDialogOpen}
        onOpenChange={setViewAssetDialogOpen}
        onSave={handleSaveAsset}
      />

      {/* View Maintenance Dialog */}
      <ViewMaintenanceDialog
        record={selectedMaintenanceRecord}
        open={viewMaintenanceDialogOpen}
        onOpenChange={setViewMaintenanceDialogOpen}
        onUpdate={handleUpdateMaintenance}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Asset"
        description={`Are you sure you want to delete ${assetToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteAsset}
        variant="destructive"
      />

      <ConfirmationDialog
        open={deleteMaintenanceConfirmOpen}
        onOpenChange={setDeleteMaintenanceConfirmOpen}
        title="Delete Maintenance Record"
        description={`Are you sure you want to delete maintenance record for ${maintenanceToDelete?.asset}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteMaintenance}
        variant="destructive"
      />

      <ScheduleMaintenanceDialog
        open={scheduleMaintenanceOpen}
        onOpenChange={setScheduleMaintenanceOpen}
        onScheduleMaintenance={handleScheduleMaintenance}
        assets={assets.map((asset) => ({ id: asset.id, name: asset.name }))}
      />
    </div>
  )
}
