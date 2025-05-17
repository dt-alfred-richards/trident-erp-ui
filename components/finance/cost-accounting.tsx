"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Plus, Search, Eye, Trash2 } from "lucide-react"
import { MetricCard } from "@/components/dashboard/common/metric-card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

// Update the form schema to include variance field

// Form schema for cost center
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.string().min(1, { message: "Please select a type." }),
  manager: z.string().min(2, { message: "Manager name must be at least 2 characters." }),
  budget: z.coerce.number().positive({ message: "Budget must be a positive number." }),
  actual: z.coerce.number().nonnegative({ message: "Actual must be a non-negative number." }),
  variance: z.coerce.number().optional(),
})

// Add a new form schema for product editing after the existing formSchema

// Form schema for product
const productFormSchema = z.object({
  materialCost: z.coerce.number().nonnegative({ message: "Material cost must be a non-negative number." }),
  laborCost: z.coerce.number().nonnegative({ message: "Labor cost must be a non-negative number." }),
  overheadCost: z.coerce.number().nonnegative({ message: "Overhead cost must be a non-negative number." }),
  totalCost: z.coerce.number().nonnegative({ message: "Total cost must be a non-negative number." }),
  sellingPrice: z.coerce.number().nonnegative({ message: "Selling price must be a non-negative number." }),
})

// Form schema for new product
const newProductFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  materialCost: z.coerce.number().nonnegative({ message: "Material cost must be a non-negative number." }),
  laborCost: z.coerce.number().nonnegative({ message: "Labor cost must be a non-negative number." }),
  overheadCost: z.coerce.number().nonnegative({ message: "Overhead cost must be a non-negative number." }),
  sellingPrice: z.coerce.number().positive({ message: "Selling price must be a positive number." }),
})

// Define the cost center type
type CostCenter = {
  id: string
  name: string
  type: string
  manager: string
  budget: number
  actual: number
  variance: number
}

// Define the product type
type Product = {
  id: string
  name: string
  category: string
  materialCost: number
  laborCost: number
  overheadCost: number
  totalCost: number
  sellingPrice: number
  margin: number
  marginPercentage: number
}

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

const inventoryData = [
  {
    type: "Raw Materials",
    quantity: 15250,
    fifoValue: 3812500,
    lifoValue: 3887500,
    avgValue: 3850000,
    avgCost: 250,
  },
  {
    type: "Work in Progress",
    quantity: 2800,
    fifoValue: 1120000,
    lifoValue: 1176000,
    avgValue: 1148000,
    avgCost: 400,
  },
  {
    type: "Finished Goods",
    quantity: 8500,
    fifoValue: 4250000,
    lifoValue: 4335000,
    avgValue: 4292500,
    avgCost: 500,
  },
]

export function CostAccounting() {
  const [activeTab, setActiveTab] = useState("cost-centers")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newCostCenterDialogOpen, setNewCostCenterDialogOpen] = useState(false)
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null)
  const [costCentersList, setCostCentersList] = useState<CostCenter[]>(costCenters)

  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [productCategoryFilter, setProductCategoryFilter] = useState("all")
  const [viewProductDialogOpen, setViewProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false)
  const [productsList, setProductsList] = useState<Product[]>(products)
  const [newProductDialogOpen, setNewProductDialogOpen] = useState(false)

  const [valuationMethod, setValuationMethod] = useState("fifo")
  const [inventoryType, setInventoryType] = useState("all")

  // Pagination state
  const [costCenterPage, setCostCenterPage] = useState(0)
  const [costCenterRowsPerPage, setCostCenterRowsPerPage] = useState(5)
  const [productPage, setProductPage] = useState(0)
  const [productRowsPerPage, setProductRowsPerPage] = useState(5)

  // Handler for exporting data
  const handleExport = () => {
    let filename = ""
    let csvContent = ""
    let headers = []
    let data = []

    // Determine what to export based on active tab
    if (activeTab === "cost-centers") {
      filename = "cost-centers-export.csv"
      headers = ["ID", "Name", "Type", "Manager", "Budget", "Actual", "Variance"]
      data = filteredCostCenters.map((center) => [
        center.id,
        center.name,
        center.type,
        center.manager,
        center.budget,
        center.actual,
        center.variance,
      ])
    } else if (activeTab === "product-costing") {
      filename = "product-costing-export.csv"
      headers = [
        "ID",
        "Name",
        "Category",
        "Material Cost",
        "Labor Cost",
        "Overhead Cost",
        "Total Cost",
        "Selling Price",
        "Margin",
        "Margin %",
      ]
      data = filteredProducts.map((product) => [
        product.id,
        product.name,
        product.category,
        product.materialCost,
        product.laborCost,
        product.overheadCost,
        product.totalCost,
        product.sellingPrice,
        product.margin,
        product.marginPercentage.toFixed(2) + "%",
      ])
    } else if (activeTab === "inventory-valuation") {
      filename = "inventory-valuation-export.csv"
      headers = ["Inventory Type", "Quantity", "Value", "Avg. Cost per Unit"]
      data = filteredInventoryData.map((item) => [
        item.type,
        item.quantity,
        valuationMethod === "fifo" ? item.fifoValue : valuationMethod === "lifo" ? item.lifoValue : item.avgValue,
        item.avgCost,
      ])
    }

    // Create CSV content
    csvContent = [headers.join(","), ...data.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Show success message
    toast({
      title: "Export Successful",
      description: `Data has been exported to ${filename}`,
    })
  }

  // Setup form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "Manufacturing",
      manager: "",
      budget: 0,
      actual: 0,
    },
  })

  // Setup product form
  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
      totalCost: 0,
      sellingPrice: 0,
    },
  })

  // Setup new product form
  const newProductForm = useForm<z.infer<typeof newProductFormSchema>>({
    resolver: zodResolver(newProductFormSchema),
    defaultValues: {
      name: "",
      category: "Fasteners",
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
      sellingPrice: 0,
    },
  })

  // Update the handleViewCostCenter function to reset the form with the selected cost center's values

  // Handler for viewing a cost center
  const handleViewCostCenter = (center: CostCenter) => {
    setSelectedCostCenter(center)
    // Reset form with the selected cost center's values
    form.reset({
      name: center.name,
      type: center.type,
      manager: center.manager,
      budget: center.budget,
      actual: center.actual,
      variance: center.variance,
    })
    setViewDialogOpen(true)
  }

  // Handler for viewing a product
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    // Reset form with the selected product's values
    productForm.reset({
      materialCost: product.materialCost,
      laborCost: product.laborCost,
      overheadCost: product.overheadCost,
      totalCost: product.totalCost,
      sellingPrice: product.sellingPrice,
    })
    setViewProductDialogOpen(true)
  }

  // Handler for opening new product dialog
  const handleNewProduct = () => {
    newProductForm.reset({
      name: "",
      category: "Fasteners",
      materialCost: 0,
      laborCost: 0,
      overheadCost: 0,
      sellingPrice: 0,
    })
    setNewProductDialogOpen(true)
  }

  // Handler for delete confirmation
  const handleDeleteConfirm = (center: CostCenter) => {
    setSelectedCostCenter(center)
    setDeleteDialogOpen(true)
  }

  // Handler for product delete confirmation
  const handleDeleteProductConfirm = (product: Product) => {
    setSelectedProduct(product)
    setDeleteProductDialogOpen(true)
  }

  // Handler for actual deletion
  const handleDeleteCostCenter = () => {
    if (selectedCostCenter) {
      setCostCentersList(costCentersList.filter((center) => center.id !== selectedCostCenter.id))
      toast({
        title: "Cost Center Deleted",
        description: `${selectedCostCenter.name} has been deleted successfully.`,
      })
      setDeleteDialogOpen(false)
    }
  }

  // Handler for actual product deletion
  const handleDeleteProduct = () => {
    if (selectedProduct) {
      setProductsList(productsList.filter((product) => product.id !== selectedProduct.id))
      toast({
        title: "Product Deleted",
        description: `${selectedProduct.name} has been deleted successfully.`,
      })
      setDeleteProductDialogOpen(false)
    }
  }

  // Handler for opening new cost center dialog
  const handleNewCostCenter = () => {
    form.reset({
      name: "",
      type: "Manufacturing",
      manager: "",
      budget: 0,
      actual: 0,
    })
    setNewCostCenterDialogOpen(true)
  }

  // Handler for submitting new cost center
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Generate a new ID
    const newId = `CC-${String(costCentersList.length + 1).padStart(3, "0")}`

    // Calculate variance
    const variance = values.budget - values.actual

    // Create new cost center object
    const newCostCenter: CostCenter = {
      id: newId,
      name: values.name,
      type: values.type,
      manager: values.manager,
      budget: values.budget,
      actual: values.actual,
      variance: variance,
    }

    // Add to list
    setCostCentersList([newCostCenter, ...costCentersList])

    // Show success message
    toast({
      title: "Cost Center Created",
      description: `${values.name} has been created successfully.`,
    })

    // Close dialog
    setNewCostCenterDialogOpen(false)
  }

  // Handler for submitting new product
  const onSubmitNewProduct = (values: z.infer<typeof newProductFormSchema>) => {
    // Generate a new ID
    const newId = `PROD-${String(productsList.length + 1).padStart(3, "0")}`

    // Calculate total cost
    const totalCost = values.materialCost + values.laborCost + values.overheadCost

    // Calculate margin and margin percentage
    const margin = values.sellingPrice - totalCost
    const marginPercentage = (margin / values.sellingPrice) * 100

    // Create new product object
    const newProduct: Product = {
      id: newId,
      name: values.name,
      category: values.category,
      materialCost: values.materialCost,
      laborCost: values.laborCost,
      overheadCost: values.overheadCost,
      totalCost: totalCost,
      sellingPrice: values.sellingPrice,
      margin: margin,
      marginPercentage: marginPercentage,
    }

    // Add to list
    setProductsList([newProduct, ...productsList])

    // Show success message
    toast({
      title: "Product Created",
      description: `${values.name} has been created successfully.`,
    })

    // Close dialog
    setNewProductDialogOpen(false)
  }

  // Filter cost centers based on search term and type
  const filteredCostCenters = costCentersList.filter((center) => {
    const matchesSearch =
      searchTerm === "" ||
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.manager.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || center.type.toLowerCase() === filterType.toLowerCase()

    return matchesSearch && matchesType
  })

  // Filter products based on search term and category
  const filteredProducts = productsList.filter((product) => {
    const matchesSearch =
      productSearchTerm === "" || product.name.toLowerCase().includes(productSearchTerm.toLowerCase())

    const matchesCategory = productCategoryFilter === "all" || product.category === productCategoryFilter

    return matchesSearch && matchesCategory
  })

  // Filter inventory data based on type
  const filteredInventoryData = inventoryData.filter((item) => {
    if (inventoryType === "all") return true
    if (inventoryType === "raw" && item.type === "Raw Materials") return true
    if (inventoryType === "wip" && item.type === "Work in Progress") return true
    if (inventoryType === "finished" && item.type === "Finished Goods") return true
    return false
  })

  // Calculate totals for the filtered data
  const inventoryTotals = {
    quantity: filteredInventoryData.reduce((sum, item) => sum + item.quantity, 0),
    fifoValue: filteredInventoryData.reduce((sum, item) => sum + item.fifoValue, 0),
    lifoValue: filteredInventoryData.reduce((sum, item) => sum + item.lifoValue, 0),
    avgValue: filteredInventoryData.reduce((sum, item) => sum + item.avgValue, 0),
  }

  // Paginate cost centers
  const paginatedCostCenters = filteredCostCenters.slice(
    costCenterPage * costCenterRowsPerPage,
    costCenterPage * costCenterRowsPerPage + costCenterRowsPerPage,
  )

  // Paginate products
  const paginatedProducts = filteredProducts.slice(
    productPage * productRowsPerPage,
    productPage * productRowsPerPage + productRowsPerPage,
  )

  // No pagination for inventory data
  const paginatedInventoryData = filteredInventoryData

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Manufacturing Cost"
          value="₹10.85M"
          description="Current month"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-indigo-500"
          iconBgColor="bg-indigo-500/10"
        />
        <MetricCard
          title="Cost per Unit"
          value="₹344"
          change={{ value: 5, isPositive: false }}
          description="vs last month"
          icon={<span className="text-lg">₹</span>}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <MetricCard
          title="Average Margin"
          value="37.12%"
          change={{ value: 2.5, isPositive: true }}
          description="vs last month"
          icon={<span className="text-lg">%</span>}
          iconColor="text-emerald-500"
          iconBgColor="bg-emerald-500/10"
        />
      </div>

      <Tabs defaultValue="cost-centers" onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="cost-centers"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Cost Centers
          </TabsTrigger>
          <TabsTrigger
            value="product-costing"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Product Costing
          </TabsTrigger>
          <TabsTrigger
            value="inventory-valuation"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Inventory Valuation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cost-centers" className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cost centers..."
                  className="pl-8 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleNewCostCenter} className="bg-[#f8285a] hover:bg-[#f8285a]/90 text-white">
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
                  {paginatedCostCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell className="font-medium">{center.id}</TableCell>
                      <TableCell>{center.name}</TableCell>
                      <TableCell>{center.type}</TableCell>
                      <TableCell>{center.manager}</TableCell>
                      <TableCell className="text-right">{center.budget.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">{center.actual.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            center.variance >= 0
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
                          }`}
                        >
                          {center.variance >= 0 ? "+" : ""}
                          {center.variance.toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View"
                            onClick={() => handleViewCostCenter(center)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            title="Delete"
                            onClick={() => handleDeleteConfirm(center)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedCostCenters.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No cost centers found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Cost Centers Pagination */}
          {filteredCostCenters.length > 0 && (
            <DataTablePagination
              totalItems={filteredCostCenters.length}
              itemsPerPage={costCenterRowsPerPage}
              currentPage={costCenterPage + 1}
              onPageChange={(page) => setCostCenterPage(page - 1)}
              onRowsPerPageChange={(newValue) => {
                setCostCenterRowsPerPage(newValue)
                setCostCenterPage(0)
              }}
            />
          )}

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
                      {costCentersList.map((center) => (
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
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 w-[300px]"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                />
              </div>
              <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Fasteners">Fasteners</SelectItem>
                  <SelectItem value="Components">Components</SelectItem>
                  <SelectItem value="Brackets">Brackets</SelectItem>
                  <SelectItem value="Fittings">Fittings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleNewProduct} className="bg-[#2cd07e] hover:bg-[#25b06a] text-white">
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
                  {paginatedProducts.map((product) => (
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
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            title="Delete"
                            onClick={() => handleDeleteProductConfirm(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                        No products found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Products Pagination */}
          {filteredProducts.length > 0 && (
            <DataTablePagination
              totalItems={filteredProducts.length}
              itemsPerPage={productRowsPerPage}
              currentPage={productPage + 1}
              onPageChange={(page) => setProductPage(page - 1)}
              onRowsPerPageChange={(newValue) => {
                setProductRowsPerPage(newValue)
                setProductPage(0)
              }}
            />
          )}

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
              <Select value={valuationMethod} onValueChange={setValuationMethod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Valuation Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fifo">FIFO</SelectItem>
                  <SelectItem value="lifo">LIFO</SelectItem>
                  <SelectItem value="avg">Weighted Average</SelectItem>
                </SelectContent>
              </Select>
              <Select value={inventoryType} onValueChange={setInventoryType}>
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
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg font-semibold">
                Inventory Valuation Summary ({valuationMethod.toUpperCase()} Method)
              </CardTitle>
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
                  {paginatedInventoryData.map((item) => (
                    <TableRow key={item.type}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="text-right">{item.quantity.toLocaleString("en-IN")} units</TableCell>
                      <TableCell className="text-right">
                        {valuationMethod === "fifo" && item.fifoValue.toLocaleString("en-IN")}
                        {valuationMethod === "lifo" && item.lifoValue.toLocaleString("en-IN")}
                        {valuationMethod === "avg" && item.avgValue.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">{item.avgCost}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {inventoryTotals.quantity.toLocaleString("en-IN")} units
                    </TableCell>
                    <TableCell className="text-right">
                      {valuationMethod === "fifo" && inventoryTotals.fifoValue.toLocaleString("en-IN")}
                      {valuationMethod === "lifo" && inventoryTotals.lifoValue.toLocaleString("en-IN")}
                      {valuationMethod === "avg" && inventoryTotals.avgValue.toLocaleString("en-IN")}
                    </TableCell>
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
                    <TableRow className={valuationMethod === "fifo" ? "bg-muted/30" : ""}>
                      <TableCell>FIFO</TableCell>
                      <TableCell className="text-right">{inventoryTotals.fifoValue.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                    <TableRow className={valuationMethod === "lifo" ? "bg-muted/30" : ""}>
                      <TableCell>LIFO</TableCell>
                      <TableCell className="text-right">{inventoryTotals.lifoValue.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right text-green-600">
                        +{(inventoryTotals.lifoValue - inventoryTotals.fifoValue).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                    <TableRow className={valuationMethod === "avg" ? "bg-muted/30" : ""}>
                      <TableCell>Weighted Average</TableCell>
                      <TableCell className="text-right">{inventoryTotals.avgValue.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right text-green-600">
                        +{(inventoryTotals.avgValue - inventoryTotals.fifoValue).toLocaleString("en-IN")}
                      </TableCell>
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

      {/* View/Edit Cost Center Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Cost Center</DialogTitle>
            <DialogDescription>Make changes to the cost center details and save them.</DialogDescription>
          </DialogHeader>
          {selectedCostCenter && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => {
                  // Update the cost center with new values
                  const updatedCenter = {
                    ...selectedCostCenter,
                    name: values.name,
                    type: values.type,
                    manager: values.manager,
                    budget: values.budget,
                    actual: values.actual,
                    variance: values.budget - values.actual,
                  }

                  // Update the cost centers list
                  setCostCentersList(
                    costCentersList.map((center) => (center.id === selectedCostCenter.id ? updatedCenter : center)),
                  )

                  // Show success message
                  toast({
                    title: "Cost Center Updated",
                    description: `${values.name} has been updated successfully.`,
                  })

                  // Close the dialog
                  setViewDialogOpen(false)
                })}
                className="space-y-4 py-2"
              >
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">ID:</div>
                  <div className="col-span-3">{selectedCostCenter.id}</div>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  defaultValue={selectedCostCenter.name}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Name:</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input {...field} defaultValue={selectedCostCenter.name} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  defaultValue={selectedCostCenter.type}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Type:</FormLabel>
                      <div className="col-span-3">
                        <Select onValueChange={field.onChange} defaultValue={selectedCostCenter.type}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manager"
                  defaultValue={selectedCostCenter.manager}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Manager:</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input {...field} defaultValue={selectedCostCenter.manager} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  defaultValue={selectedCostCenter.budget}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Budget:</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            defaultValue={selectedCostCenter.budget}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value))
                              // Update variance in real-time
                              const actual = form.getValues("actual") || selectedCostCenter.actual
                              form.setValue("variance", Number(e.target.value) - actual)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actual"
                  defaultValue={selectedCostCenter.actual}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Actual:</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            defaultValue={selectedCostCenter.actual}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value))
                              // Update variance in real-time
                              const budget = form.getValues("budget") || selectedCostCenter.budget
                              form.setValue("variance", budget - Number(e.target.value))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variance"
                  defaultValue={selectedCostCenter.variance}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Variance:</FormLabel>
                      <div className="col-span-3">
                        <div
                          className={`flex items-center justify-between rounded px-3 py-2 border ${
                            field.value >= 0
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
                              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
                          }`}
                        >
                          {field.value >= 0 ? "+" : ""}
                          {field.value?.toLocaleString("en-IN") || "0"}
                        </div>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Utilization:</div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            form.getValues("actual") <= form.getValues("budget")
                              ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                              : "bg-gradient-to-r from-red-500 to-red-600"
                          }`}
                          style={{
                            width: `${Math.min(Math.round((form.getValues("actual") / form.getValues("budget")) * 100), 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span>{Math.round((form.getValues("actual") / form.getValues("budget")) * 100)}%</span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setViewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={viewProductDialogOpen} onOpenChange={setViewProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product Details</DialogTitle>
            <DialogDescription>View and edit details for the selected product.</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <Form {...productForm}>
              <form
                onSubmit={productForm.handleSubmit((values) => {
                  // Calculate margin and margin percentage
                  const margin = values.sellingPrice - values.totalCost
                  const marginPercentage = (margin / values.sellingPrice) * 100

                  // Update the product with new values
                  const updatedProduct = {
                    ...selectedProduct,
                    materialCost: values.materialCost,
                    laborCost: values.laborCost,
                    overheadCost: values.overheadCost,
                    totalCost: values.totalCost,
                    sellingPrice: values.sellingPrice,
                    margin: margin,
                    marginPercentage: marginPercentage,
                  }

                  // Update the products list
                  setProductsList(
                    productsList.map((product) => (product.id === selectedProduct.id ? updatedProduct : product)),
                  )

                  // Show success message
                  toast({
                    title: "Product Updated",
                    description: `${selectedProduct.name} has been updated successfully.`,
                  })

                  // Close the dialog
                  setViewProductDialogOpen(false)
                })}
                className="space-y-4 py-2"
              >
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">ID:</div>
                  <div className="col-span-3">{selectedProduct.id}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Name:</div>
                  <div className="col-span-3">{selectedProduct.name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Category:</div>
                  <div className="col-span-3">{selectedProduct.category}</div>
                </div>

                <FormField
                  control={productForm.control}
                  name="materialCost"
                  defaultValue={selectedProduct.materialCost}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Material Cost:</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value))
                              // Update total cost in real-time
                              const laborCost = productForm.getValues("laborCost") || selectedProduct.laborCost
                              const overheadCost = productForm.getValues("overheadCost") || selectedProduct.overheadCost
                              const newTotalCost = Number(e.target.value) + laborCost + overheadCost
                              productForm.setValue("totalCost", newTotalCost)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="laborCost"
                  defaultValue={selectedProduct.laborCost}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Labor Cost:</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value))
                              // Update total cost in real-time
                              const materialCost = productForm.getValues("materialCost") || selectedProduct.materialCost
                              const overheadCost = productForm.getValues("overheadCost") || selectedProduct.overheadCost
                              const newTotalCost = materialCost + Number(e.target.value) + overheadCost
                              productForm.setValue("totalCost", newTotalCost)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="overheadCost"
                  defaultValue={selectedProduct.overheadCost}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Overhead Cost:</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value))
                              // Update total cost in real-time
                              const materialCost = productForm.getValues("materialCost") || selectedProduct.materialCost
                              const laborCost = productForm.getValues("laborCost") || selectedProduct.laborCost
                              const newTotalCost = materialCost + laborCost + Number(e.target.value)
                              productForm.setValue("totalCost", newTotalCost)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="totalCost"
                  defaultValue={selectedProduct.totalCost}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Total Cost:</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input type="number" {...field} className="font-semibold" />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={productForm.control}
                  name="sellingPrice"
                  defaultValue={selectedProduct.sellingPrice}
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="font-medium">Selling Price:</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Margin:</div>
                  <div className="col-span-3 text-green-600">
                    ₹
                    {(productForm.getValues("sellingPrice") || selectedProduct.sellingPrice) -
                      (productForm.getValues("totalCost") || selectedProduct.totalCost)}
                    (
                    {(
                      (((productForm.getValues("sellingPrice") || selectedProduct.sellingPrice) -
                        (productForm.getValues("totalCost") || selectedProduct.totalCost)) /
                        (productForm.getValues("sellingPrice") || selectedProduct.sellingPrice)) *
                      100
                    ).toFixed(2)}
                    %)
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Cost Breakdown:</div>
                  <div className="col-span-3 w-full">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Material</span>
                        <span>
                          {Math.round(
                            ((productForm.getValues("materialCost") || selectedProduct.materialCost) /
                              (productForm.getValues("totalCost") || selectedProduct.totalCost)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                          style={{
                            width: `${Math.round(
                              ((productForm.getValues("materialCost") || selectedProduct.materialCost) /
                                (productForm.getValues("totalCost") || selectedProduct.totalCost)) *
                                100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Labor</span>
                        <span>
                          {Math.round(
                            ((productForm.getValues("laborCost") || selectedProduct.laborCost) /
                              (productForm.getValues("totalCost") || selectedProduct.totalCost)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                          style={{
                            width: `${Math.round(
                              ((productForm.getValues("laborCost") || selectedProduct.laborCost) /
                                (productForm.getValues("totalCost") || selectedProduct.totalCost)) *
                                100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Overhead</span>
                        <span>
                          {Math.round(
                            ((productForm.getValues("overheadCost") || selectedProduct.overheadCost) /
                              (productForm.getValues("totalCost") || selectedProduct.totalCost)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted/70 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                          style={{
                            width: `${Math.round(
                              ((productForm.getValues("overheadCost") || selectedProduct.overheadCost) /
                                (productForm.getValues("totalCost") || selectedProduct.totalCost)) *
                                100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setViewProductDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* New Product Dialog */}
      <Dialog open={newProductDialogOpen} onOpenChange={setNewProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>Fill in the details to create a new product.</DialogDescription>
          </DialogHeader>
          <Form {...newProductForm}>
            <form onSubmit={newProductForm.handleSubmit(onSubmitNewProduct)} className="space-y-4 py-2">
              <FormField
                control={newProductForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newProductForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fasteners">Fasteners</SelectItem>
                        <SelectItem value="Components">Components</SelectItem>
                        <SelectItem value="Brackets">Brackets</SelectItem>
                        <SelectItem value="Fittings">Fittings</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newProductForm.control}
                name="materialCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter material cost" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newProductForm.control}
                name="laborCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter labor cost" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newProductForm.control}
                name="overheadCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overhead Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter overhead cost" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Total Cost:</div>
                <div className="col-span-3 font-semibold">
                  ₹
                  {(newProductForm.getValues("materialCost") || 0) +
                    (newProductForm.getValues("laborCost") || 0) +
                    (newProductForm.getValues("overheadCost") || 0)}
                </div>
              </div>

              <FormField
                control={newProductForm.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter selling price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {newProductForm.getValues("sellingPrice") > 0 && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Estimated Margin:</div>
                  <div className="col-span-3 text-green-600">
                    ₹
                    {(newProductForm.getValues("sellingPrice") || 0) -
                      ((newProductForm.getValues("materialCost") || 0) +
                        (newProductForm.getValues("laborCost") || 0) +
                        (newProductForm.getValues("overheadCost") || 0))}
                    (
                    {(
                      (((newProductForm.getValues("sellingPrice") || 0) -
                        ((newProductForm.getValues("materialCost") || 0) +
                          (newProductForm.getValues("laborCost") || 0) +
                          (newProductForm.getValues("overheadCost") || 0))) /
                        (newProductForm.getValues("sellingPrice") || 1)) *
                      100
                    ).toFixed(2)}
                    %)
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewProductDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the cost center
              {selectedCostCenter ? ` "${selectedCostCenter.name}"` : ""} and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCostCenter}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={deleteProductDialogOpen} onOpenChange={setDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              {selectedProduct ? ` "${selectedProduct.name}"` : ""} and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Cost Center Dialog */}
      <Dialog open={newCostCenterDialogOpen} onOpenChange={setNewCostCenterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Cost Center</DialogTitle>
            <DialogDescription>Fill in the details to create a new cost center.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter cost center name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cost center type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manager name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter budget amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Expense (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter actual expense" {...field} />
                    </FormControl>
                    <FormDescription>Leave at 0 for new cost centers with no expenses yet.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewCostCenterDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Cost Center</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
