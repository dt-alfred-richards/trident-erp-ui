"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  LineChart,
  Package,
  Truck,
  ShoppingCart,
  Users,
  DollarSign,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { toast } from "@/components/ui/use-toast"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { StatusBadge } from "@/components/common/status-badge"
import { Badge } from "@/components/ui/badge"
import { ClientProposedProduct, useOrders } from "@/contexts/order-context"
import { convertDate, getChildObject, getCummulativeSum } from "../generic"
import { useProduction } from "../production/production-context"
import { useInventory } from "@/app/inventory-context"
import { useLogistics } from "@/app/logistics/shipment-tracking/logistics-context"
import { useProcurement } from "@/app/procurement/procurement-context"
import { DailyAttendance, useHrContext } from "@/app/hr/hr-context"
import { OrderProduct } from "@/types/order"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"


// Sample data for each tab
const salesData = [
  {
    orderId: "ORD-2023-1001",
    customer: "Reliance Industries",
    product: "Dhaara 2000 ML",
    category: "Dhaara",
    date: "10 May 2023",
    quantity: 500,
    unitPrice: 1250,
    total: 625000,
    status: "Delivered",
  },
  {
    orderId: "ORD-2023-1002",
    customer: "Tata Projects",
    product: "Dhaara 1000 ML",
    category: "Dhaara",
    date: "11 May 2023",
    quantity: 750,
    unitPrice: 500,
    total: 375000,
    status: "Delivered",
  },
  {
    orderId: "ORD-2023-1003",
    customer: "L&T Construction",
    product: "Dhaara 500 ML",
    category: "Dhaara",
    date: "12 May 2023",
    quantity: 600,
    unitPrice: 400,
    total: 240000,
    status: "Delivered",
  },
  {
    orderId: "ORD-2023-1004",
    customer: "Adani Infrastructure",
    product: "Antera 500 ML",
    category: "Customised",
    date: "13 May 2023",
    quantity: 400,
    unitPrice: 800,
    total: 320000,
    status: "Shipped",
  },
  {
    orderId: "ORD-2023-1005",
    customer: "BHEL",
    product: "Paradise 1000 ML",
    category: "Customised",
    date: "14 May 2023",
    quantity: 550,
    unitPrice: 450,
    total: 247500,
    status: "Processing",
  },
]

const productionData = [
  {
    batchId: "PB-2023-0458",
    product: "Dhaara 2000 ML",
    startDate: "10 May 2023",
    endDate: "12 May 2023",
    plannedQty: 500,
    actualQty: 487,
    efficiency: "97.4%",
    defectRate: "1.2%",
    status: "Completed",
  },
  {
    batchId: "PB-2023-0459",
    product: "Dhaara 1000 ML",
    startDate: "11 May 2023",
    endDate: "13 May 2023",
    plannedQty: 750,
    actualQty: 742,
    efficiency: "98.9%",
    defectRate: "0.8%",
    status: "Completed",
  },
  {
    batchId: "PB-2023-0460",
    product: "Dhaara 500 ML",
    startDate: "12 May 2023",
    endDate: "14 May 2023",
    plannedQty: 600,
    actualQty: 600,
    efficiency: "100.0%",
    defectRate: "0.5%",
    status: "Completed",
  },
  {
    batchId: "PB-2023-0461",
    product: "Antera 500 ML",
    startDate: "13 May 2023",
    endDate: "15 May 2023",
    plannedQty: 400,
    actualQty: 385,
    efficiency: "96.3%",
    defectRate: "2.1%",
    status: "Completed",
  },
  {
    batchId: "PB-2023-0462",
    product: "Paradise 1000 ML",
    startDate: "14 May 2023",
    endDate: "-",
    plannedQty: 550,
    actualQty: 320,
    efficiency: "58.2%",
    defectRate: "1.9%",
    status: "In Progress",
  },
]

const inventoryData = [
  {
    itemCode: "DH-2000",
    description: "Dhaara 2000 ML",
    category: "Dhaara",
    warehouse: "Mumbai",
    inStock: 1245,
    allocated: 780,
    available: 465,
    value: 1556250,
    status: "Healthy",
  },
  {
    itemCode: "DH-1000",
    description: "Dhaara 1000 ML",
    category: "Dhaara",
    warehouse: "Delhi",
    inStock: 587,
    allocated: 420,
    available: 167,
    value: 293500,
    status: "Healthy",
  },
  {
    itemCode: "DH-500",
    description: "Dhaara 500 ML",
    category: "Dhaara",
    warehouse: "Bangalore",
    inStock: 176,
    allocated: 150,
    available: 26,
    value: 70400,
    status: "Low Stock",
  },
  {
    itemCode: "ANT-500",
    description: "Antera 500 ML",
    category: "Customised",
    warehouse: "Chennai",
    inStock: 54,
    allocated: 50,
    available: 4,
    value: 43200,
    status: "Critical",
  },
  {
    itemCode: "PAR-1000",
    description: "Paradise 1000 ML",
    category: "Customised",
    warehouse: "Mumbai",
    inStock: 843,
    allocated: 320,
    available: 523,
    value: 379350,
    status: "Healthy",
  },
]

const logisticsData = [
  {
    shipmentId: "SH-2023-1245",
    orderId: "ORD-2023-1001",
    customer: "Reliance Industries",
    origin: "Mumbai",
    destination: "Delhi",
    dispatchDate: "10 May 2023",
    deliveryDate: "12 May 2023",
    carrier: "Blue Dart",
    status: "Delivered",
  },
  {
    shipmentId: "SH-2023-1246",
    orderId: "ORD-2023-1002",
    customer: "Tata Projects",
    origin: "Mumbai",
    destination: "Bangalore",
    dispatchDate: "11 May 2023",
    deliveryDate: "13 May 2023",
    carrier: "DTDC",
    status: "Delivered",
  },
  {
    shipmentId: "SH-2023-1247",
    orderId: "ORD-2023-1003",
    customer: "L&T Construction",
    origin: "Mumbai",
    destination: "Chennai",
    dispatchDate: "12 May 2023",
    deliveryDate: "14 May 2023",
    carrier: "Delhivery",
    status: "Delivered",
  },
  {
    shipmentId: "SH-2023-1248",
    orderId: "ORD-2023-1004",
    customer: "Adani Infrastructure",
    origin: "Mumbai",
    destination: "Ahmedabad",
    dispatchDate: "13 May 2023",
    deliveryDate: "-",
    carrier: "TCI Express",
    status: "In Transit",
  },
  {
    shipmentId: "SH-2023-1249",
    orderId: "ORD-2023-1005",
    customer: "BHEL",
    origin: "Mumbai",
    destination: "Hyderabad",
    dispatchDate: "14 May 2023",
    deliveryDate: "-",
    carrier: "Safexpress",
    status: "Dispatched",
  },
]

const procurementData = [
  {
    poNumber: "PO-2023-0125",
    supplier: "JSW Steel",
    category: "Raw Materials",
    orderDate: "05 May 2023",
    deliveryDate: "10 May 2023",
    items: 3,
    value: 1245000,
    paymentTerms: "Net 30",
    status: "Received",
  },
  {
    poNumber: "PO-2023-0126",
    supplier: "Hindalco",
    category: "Raw Materials",
    orderDate: "06 May 2023",
    deliveryDate: "12 May 2023",
    items: 2,
    value: 875000,
    paymentTerms: "Net 45",
    status: "Received",
  },
  {
    poNumber: "PO-2023-0127",
    supplier: "Supreme Pipes",
    category: "Components",
    orderDate: "08 May 2023",
    deliveryDate: "15 May 2023",
    items: 5,
    value: 650000,
    paymentTerms: "Net 30",
    status: "Partial",
  },
  {
    poNumber: "PO-2023-0128",
    supplier: "Finolex Cables",
    category: "Components",
    orderDate: "10 May 2023",
    deliveryDate: "20 May 2023",
    items: 4,
    value: 425000,
    paymentTerms: "Net 30",
    status: "In Transit",
  },
  {
    poNumber: "PO-2023-0129",
    supplier: "Asian Paints",
    category: "Consumables",
    orderDate: "12 May 2023",
    deliveryDate: "22 May 2023",
    items: 6,
    value: 280000,
    paymentTerms: "Net 15",
    status: "Ordered",
  },
]

const hrData = [
  {
    employeeId: "EMP-1001",
    name: "Rajesh Kumar",
    department: "Production",
    designation: "Supervisor",
    location: "Mumbai",
    workingDays: 22,
    present: 21,
    absent: 1,
    attendance: "95.5%",
    overtime: 12,
  },
  {
    employeeId: "EMP-1002",
    name: "Priya Sharma",
    department: "Sales & Marketing",
    designation: "Manager",
    location: "Delhi",
    workingDays: 22,
    present: 22,
    absent: 0,
    attendance: "100.0%",
    overtime: 4,
  },
  {
    employeeId: "EMP-1003",
    name: "Amit Patel",
    department: "Engineering",
    designation: "Engineer",
    location: "Bangalore",
    workingDays: 22,
    present: 20,
    absent: 2,
    attendance: "90.9%",
    overtime: 8,
  },
  {
    employeeId: "EMP-1004",
    name: "Sunita Reddy",
    department: "Logistics",
    designation: "Coordinator",
    location: "Chennai",
    workingDays: 22,
    present: 19,
    absent: 3,
    attendance: "86.4%",
    overtime: 6,
  },
  {
    employeeId: "EMP-1005",
    name: "Vikram Singh",
    department: "Administration",
    designation: "Admin Officer",
    location: "Mumbai",
    workingDays: 22,
    present: 22,
    absent: 0,
    attendance: "100.0%",
    overtime: 2,
  },
]

const financeData = [
  {
    department: "Production",
    budget: 7500000,
    actual: 7245000,
    variance: 255000,
    variancePercent: "3.4%",
    ytdBudget: 30000000,
    ytdActual: 28980000,
    ytdVariance: 1020000,
    status: "Under Budget",
  },
  {
    department: "Sales & Marketing",
    budget: 2500000,
    actual: 2675000,
    variance: -175000,
    variancePercent: "-7.0%",
    ytdBudget: 10000000,
    ytdActual: 10700000,
    ytdVariance: -700000,
    status: "Over Budget",
  },
  {
    department: "R&D",
    budget: 1500000,
    actual: 1425000,
    variance: 75000,
    variancePercent: "5.0%",
    ytdBudget: 6000000,
    ytdActual: 5700000,
    ytdVariance: 300000,
    status: "Under Budget",
  },
  {
    department: "Administration",
    budget: 1200000,
    actual: 1185000,
    variance: 15000,
    variancePercent: "1.3%",
    ytdBudget: 4800000,
    ytdActual: 4740000,
    ytdVariance: 60000,
    status: "Under Budget",
  },
  {
    department: "IT",
    budget: 800000,
    actual: 845000,
    variance: -45000,
    variancePercent: "-5.6%",
    ytdBudget: 3200000,
    ytdActual: 3380000,
    ytdVariance: -180000,
    status: "Over Budget",
  },
]

export function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState("sales")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  const { orders, clientProposedProductMapper } = useOrders();
  const { productionOrders } = useProduction()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter states
  const [selectedProduct, setSelectedProduct] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedWarehouse, setSelectedWarehouse] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSupplier, setSelectedSupplier] = useState("all")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const { inventory = [] } = useInventory()
  const { data: logisticsContextData } = useLogistics()
  const { purchaseOrders } = useProcurement()

  const { employees, dailyAttendance } = useHrContext()

  const productMapper = useMemo(() => {
    return Object.values(clientProposedProductMapper).flat().reduce((acc: Record<string, ClientProposedProduct>, curr) => {
      if (!acc[curr?.productId || ""]) acc[curr?.productId || ""] = curr
      return acc;
    }, {})
  }, [clientProposedProductMapper])

  const attendanceMapper = useMemo(() => {
    return dailyAttendance.reduce((acc: Record<string, DailyAttendance[]>, curr) => {
      if (!acc[curr.employeeId]) {
        acc[curr.employeeId] = []
      }
      acc[curr.employeeId].push(curr)
      return acc;
    }, {})
  }, [dailyAttendance])

  const hrData = useMemo(() => {
    return employees.map(item => {
      const employeeAttendance = attendanceMapper[item?.employeeId || ""] || [],
        total = employeeAttendance?.length || 0,
        present = employeeAttendance.filter(item => item.status === "present")?.length || 0,
        absent = total - present,
        avgWorkingHours = item.averageWorkingHours,
        overtime = employeeAttendance.filter(item => item.totalHours > avgWorkingHours).length;
      return ({
        employeeId: item.id,
        name: [item.firstName, item.lastName].filter(item => item).join(" "),
        department: item.department,
        designation: item.role,
        workingDays: total,
        present,
        absent,
        attendance: present === 0 || total === 0 ? 0 : (present / total) * 100,
        overtime,
      })
    })
  }, [employees])

  const procurementData = useMemo(() => {
    return purchaseOrders.map(item => ({
      poNumber: `PO-${item.id}`,
      supplier: item.supplierId,
      category: "Raw Materials",
      orderDate: convertDate(item.createdOn),
      deliveryDate: convertDate(item.dueDate),
      items: 3,
      value: item.total,
      paymentTerms: item.paymentTerms,
      status: item?.status || "",
    }))
  }, [purchaseOrders])

  const calculateInventoryStatus = (inStock: number, allocated: number) => {
    if (inStock < allocated) {
      return "Low stock";
    } else if (inStock > allocated) {
      return "Healthy"
    } else {
      return ""
    }
  }

  const inventoryData = useMemo(() => {
    return inventory.map(item => {
      return ({
        itemCode: `${item.id}`,
        description: item.material,
        category: item.category,
        warehouse: "Mumbai",
        inStock: item.quantity,
        allocated: item?.reserved || 0,
        value: item.quantity * item.price,
        status: calculateInventoryStatus(item.quantity, item.reserved),
      })
    })
  }, [inventory])

  const logisticsData = useMemo(() => {
    return logisticsContextData.map(item => {
      return ({
        shipmentId: `SH-${item.id}`,
        orderId: item.orderId,
        customer: item.clientId,
        origin: "Mumbai",
        destination: "Delhi",
        dispatchDate: convertDate(item.createdOn),
        deliveryDate: item.modifiedOn ? convertDate(item.modifiedOn) : "",
        carrier: "",
        status: item?.status || "",
      })
    })
  }, [logisticsContextData])

  const productionData = useMemo(() => {
    return productionOrders?.map(item => {
      return ({
        batchId: `PB-${item.id}`,
        product: productMapper[item.productId]?.name || "",
        startDate: convertDate(item.createdOn),
        endDate: item.modifiedOn ? convertDate(item.modifiedOn) : "",
        plannedQty: 500,
        actualQty: 487,
        status: item.status,
      })
    })
  }, [productionOrders, productMapper])

  const salesData = useMemo(() => {
    const products: Array<OrderProduct & { customer: string, saleId: string, orderDate: Date }> = []
    orders.forEach(item => {
      item.products.forEach(element => {
        products.push({
          ...element,
          customer: item.customer,
          saleId: item.id,
          orderDate: item.orderDate
        })
      })
    })
    return products.map(item => {
      return ({
        orderId: item.saleId,
        customer: item.customer,
        product: item.name,
        category: getChildObject(item, "category", ""),
        date: convertDate(item.orderDate),
        quantity: item.cases,
        unitPrice: item.price,
        total: item.cases * item.price,
      })
    })
  }, [orders])

  // Filtered data based on selections
  const filteredSalesData = useMemo(() => {
    return salesData.filter((item) => {
      // Filter by product
      if (selectedProduct !== "all" && item.product !== selectedProduct) {
        return false
      }

      // Filter by category
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false
      }

      // Filter by search query
      if (
        searchQuery &&
        !Object.values(item).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false
      }

      return true
    })
  }, [selectedProduct, selectedCustomer, selectedCategory, searchQuery, salesData])

  const filteredProductionData = useMemo(() => {
    return productionData?.filter((item) => {
      // Filter by product
      if (selectedProduct !== "all" && item.product !== selectedProduct) {
        return false
      }

      // Filter by category
      if (selectedCategory !== "all") {
        // Determine category based on product name
        const productCategory = item.product.includes("Dhaara") ? "Dhaara" : "Customised"
        if (productCategory !== selectedCategory) {
          return false
        }
      }

      // Filter by status
      if (selectedStatus !== "all") {
        const statusMap: Record<string, string> = {
          completed: "Completed",
          inProgress: "In Progress",
          planned: "Planned",
          cancelled: "Cancelled",
        }
        if (item.status !== statusMap[selectedStatus]) {
          return false
        }
      }

      // Filter by search query
      if (
        searchQuery &&
        !Object.values(item).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false
      }

      return true
    })
  }, [selectedProduct, selectedStatus, selectedCategory, searchQuery, productionData])

  const filteredInventoryData = useMemo(() => {
    return inventoryData.filter((item) => {
      // Filter by product
      if (selectedProduct !== "all" && item.description !== selectedProduct) {
        return false
      }

      // Filter by category
      if (selectedCategory !== "all" && item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false
      }

      // Filter by warehouse
      if (selectedWarehouse !== "all" && item.warehouse.toLowerCase() !== selectedWarehouse) {
        return false
      }

      // Filter by status
      if (selectedStatus !== "all" && item.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false
      }

      // Filter by search query
      if (
        searchQuery &&
        !Object.values(item).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false
      }

      return true
    })
  }, [selectedProduct, selectedCategory, selectedWarehouse, selectedStatus, searchQuery, inventoryData])

  const filteredLogisticsData = useMemo(() => {
    return logisticsData.filter((item) => {
      // Filter by customer
      if (selectedCustomer !== "all" && item.customer !== selectedCustomer) {
        return false
      }

      // Filter by status
      if (selectedStatus !== "all") {
        const statusMap: Record<string, string> = {
          delivered: "Delivered",
          inTransit: "In Transit",
          dispatched: "Dispatched",
          pending: "Pending",
        }
        if (item.status !== statusMap[selectedStatus]) {
          return false
        }
      }

      // Filter by search query
      if (
        searchQuery &&
        !Object.values(item).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false
      }

      return true
    })
  }, [selectedCustomer, selectedStatus, searchQuery, logisticsData])

  const filteredProcurementData = useMemo(() => {
    return procurementData.filter((item) => {
      // Filter by supplier
      if (selectedSupplier !== "all" && item.supplier !== selectedSupplier) {
        return false
      }

      // Filter by category
      if (selectedCategory !== "all") {
        const categoryMap: Record<string, string> = {
          rawMaterials: "Raw Materials",
          components: "Components",
          consumables: "Consumables",
          equipment: "Equipment",
        }
        if (item.category !== categoryMap[selectedCategory]) {
          return false
        }
      }

      // Filter by search query
      if (
        searchQuery &&
        !Object.values(item).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false
      }

      return true
    })
  }, [selectedSupplier, selectedCategory, searchQuery, procurementData])

  const filteredHrData = useMemo(() => {
    return hrData.filter((item) => {
      // Filter by department
      if (selectedDepartment !== "all") {
        const deptMap: Record<string, string> = {
          production: "Production",
          sales: "Sales & Marketing",
          engineering: "Engineering",
          logistics: "Logistics",
          admin: "Administration",
        }
        if (item.department !== deptMap[selectedDepartment]) {
          return false
        }
      }

      // Filter by location
      if (selectedLocation !== "all" && item.location.toLowerCase() !== selectedLocation) {
        return false
      }

      // Filter by search query
      if (
        searchQuery &&
        !Object.values(item).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false
      }

      return true
    })
  }, [selectedDepartment, selectedLocation, searchQuery, hrData])

  const filteredFinanceData = useMemo(() => {
    return financeData.filter((item) => {
      // Filter by department
      if (selectedDepartment !== "all") {
        const deptMap: Record<string, string> = {
          production: "Production",
          sales: "Sales & Marketing",
          rd: "R&D",
          admin: "Administration",
          it: "IT",
        }
        if (item.department !== deptMap[selectedDepartment]) {
          return false
        }
      }

      // Filter by category (status in this case)
      if (selectedCategory !== "all") {
        if (selectedCategory === "revenue" && item.variance < 0) return false
        if (selectedCategory === "expenses" && item.variance >= 0) return false
        // Note: assets and liabilities filters would need additional data to implement properly
      }

      // Filter by search query
      if (
        searchQuery &&
        !Object.values(item).some((value) => String(value).toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false
      }

      return true
    })
  }, [selectedDepartment, selectedCategory, searchQuery])

  // Paginate data
  const paginateSalesData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSalesData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSalesData, currentPage, itemsPerPage])

  const paginateProductionData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProductionData?.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProductionData, currentPage, itemsPerPage])

  const paginateInventoryData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredInventoryData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredInventoryData, currentPage, itemsPerPage])

  const paginateLogisticsData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredLogisticsData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredLogisticsData, currentPage, itemsPerPage])

  const paginateProcurementData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProcurementData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProcurementData, currentPage, itemsPerPage])

  const paginateHrData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredHrData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredHrData, currentPage, itemsPerPage])

  const paginateFinanceData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredFinanceData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredFinanceData, currentPage, itemsPerPage])

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    let data: any[] = []
    let filename = ""

    // Determine which data to export based on active tab
    switch (activeTab) {
      case "sales":
        data = filteredSalesData
        filename = "sales-report"
        break
      case "production":
        data = filteredProductionData
        filename = "production-report"
        break
      case "inventory":
        data = filteredInventoryData
        filename = "inventory-report"
        break
      case "logistics":
        data = filteredLogisticsData
        filename = "logistics-report"
        break
      case "procurement":
        data = filteredProcurementData
        filename = "procurement-report"
        break
      case "hr":
        data = filteredHrData
        filename = "hr-report"
        break
      case "finance":
        data = filteredFinanceData
        filename = "finance-report"
        break
      default:
        data = []
        filename = "report"
    }

    // Format the date for the filename
    const date = new Date()
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    filename = `${filename}-${formattedDate}`

    if (data.length === 0) {
      toast({
        title: "Export Error",
        description: "No data to export",
        variant: "destructive",
        duration: 3000,
      })
      return // Exit if no data
    }

    // Handle different export formats
    switch (format) {
      case "pdf":
        const doc = new jsPDF()
        const headers = Object.keys(data[0])
        const body = data.map((row) => headers.map((header) => row[header]))

        doc.text(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`, 14, 15)
        autoTable(doc, {
          head: [headers],
          body,
          startY: 20,
        })
        doc.save(`${filename}.pdf`)
        toast({
          title: "PDF Export",
          description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report has been exported as PDF.`,
          duration: 3000,
        })
        break

      case "excel": {
        // Build the worksheet and workbook.
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, activeTab.charAt(0).toUpperCase() + activeTab.slice(1))

        // Generate an ArrayBuffer and turn it into a Blob.
        const arrayBuffer = XLSX.write(wb, {
          bookType: "xlsx",
          type: "array",
        }) as ArrayBuffer

        const blob = new Blob([arrayBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })

        // Trigger a client-side download.
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${filename}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: "Excel Export",
          description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report has been exported as Excel.`,
          duration: 3000,
        })
        break
      }

      case "csv":
        const headersCsv = Object.keys(data[0])
        const csvContent = [
          headersCsv.join(","),
          ...data.map((row) =>
            headersCsv
              .map((header) => {
                const cell = row[header]
                // Handle commas and quotes in the data
                return typeof cell === "string" && (cell.includes(",") || cell.includes('"'))
                  ? `"${cell.replace(/"/g, '""')}"`
                  : cell
              })
              .join(","),
          ),
        ].join("\n")

        // Create and download the file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `${filename}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "CSV Export",
          description: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report has been exported as CSV.`,
          duration: 3000,
        })
        break
    }
  }

  // Reset filters when changing tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSelectedProduct("all")
    setSelectedCustomer("all")
    setSelectedCategory("all")
    setSelectedWarehouse("all")
    setSelectedStatus("all")
    setSelectedSupplier("all")
    setSelectedDepartment("all")
    setSelectedLocation("all")
    setSearchQuery("")
    setCurrentPage(1) // Reset to first page when changing tabs
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "sales" ? "border-primary bg-primary/5" : "hover:border-primary/50"
            }`}
          onClick={() => handleTabChange("sales")}
        >
          <CardContent className="p-4 flex items-center space-x-3">
            <div className={`p-2 rounded-full ${activeTab === "sales" ? "bg-[#1b84ff] text-white" : "bg-muted"}`}>
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Sales</h3>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "production" ? "border-primary bg-primary/5" : "hover:border-primary/50"
            }`}
          onClick={() => handleTabChange("production")}
        >
          <CardContent className="p-4 flex items-center space-x-3">
            <div className={`p-2 rounded-full ${activeTab === "production" ? "bg-[#1b84ff] text-white" : "bg-muted"}`}>
              <LineChart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Production</h3>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "inventory" ? "border-primary bg-primary/5" : "hover:border-primary/50"
            }`}
          onClick={() => handleTabChange("inventory")}
        >
          <CardContent className="p-4 flex items-center space-x-3">
            <div className={`p-2 rounded-full ${activeTab === "inventory" ? "bg-[#1b84ff] text-white" : "bg-muted"}`}>
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Inventory</h3>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "logistics" ? "border-primary bg-primary/5" : "hover:border-primary/50"
            }`}
          onClick={() => handleTabChange("logistics")}
        >
          <CardContent className="p-4 flex items-center space-x-3">
            <div className={`p-2 rounded-full ${activeTab === "logistics" ? "bg-[#1b84ff] text-white" : "bg-muted"}`}>
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Logistics</h3>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "procurement" ? "border-primary bg-primary/5" : "hover:border-primary/50"
            }`}
          onClick={() => handleTabChange("procurement")}
        >
          <CardContent className="p-4 flex items-center space-x-3">
            <div className={`p-2 rounded-full ${activeTab === "procurement" ? "bg-[#1b84ff] text-white" : "bg-muted"}`}>
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Procurement</h3>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "hr" ? "border-primary bg-primary/5" : "hover:border-primary/50"
            }`}
          onClick={() => handleTabChange("hr")}
        >
          <CardContent className="p-4 flex items-center space-x-3">
            <div className={`p-2 rounded-full ${activeTab === "hr" ? "bg-[#1b84ff] text-white" : "bg-muted"}`}>
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-sm">HR</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        {activeTab === "sales" && (
          <Card>
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>View sales data by customer, SKU, and time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        {
                          Object.values(productMapper).map(item => {
                            return (<SelectItem key={item.productId} value={item.name}>{item.name}</SelectItem>)
                          })
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Dhaara">Dhaara</SelectItem>
                        <SelectItem value="Customised">Customised</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="Reliance Industries">Reliance Industries</SelectItem>
                        <SelectItem value="Tata Projects">Tata Projects</SelectItem>
                        <SelectItem value="L&T Construction">L&T Construction</SelectItem>
                        <SelectItem value="Adani Infrastructure">Adani Infrastructure</SelectItem>
                        <SelectItem value="BHEL">BHEL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search..."
                    className="w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport("pdf")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("excel")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("csv")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price (₹)</TableHead>
                      <TableHead className="text-right">Total (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateSalesData.length > 0 ? (
                      paginateSalesData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.orderId}</TableCell>
                          <TableCell>{item.customer}</TableCell>
                          <TableCell>{item.product}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.category === "Dhaara"
                                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                                  : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                              }
                            >
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <DataTablePagination
                  totalItems={filteredSalesData.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "production" && (
          <Card>
            <CardHeader>
              <CardTitle>Production Report</CardTitle>
              <CardDescription>Analyze production efficiency and output</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        {
                          Object.values(productMapper).map(item => {
                            return (<SelectItem key={item.productId} value={item.name}>{item.name}</SelectItem>)
                          })
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="flex items-center space-x-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Dhaara">Dhaara</SelectItem>
                        <SelectItem value="Customised">Customised</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
                  <div className="flex items-center space-x-2">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="inProgress">In Progress</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search..."
                    className="w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport("pdf")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("excel")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("csv")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-right">Planned Qty</TableHead>
                      <TableHead className="text-right">Actual Qty</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateProductionData.length > 0 ? (
                      paginateProductionData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.batchId}</TableCell>
                          <TableCell>{item.product}</TableCell>
                          <TableCell>{item.startDate}</TableCell>
                          <TableCell>{item.endDate}</TableCell>
                          <TableCell className="text-right">{item.plannedQty}</TableCell>
                          <TableCell className="text-right">{item.actualQty}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status.toLowerCase().replace(" ", "_") as any} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <DataTablePagination
                  totalItems={filteredProductionData.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "inventory" && (
          <Card>
            <CardHeader>
              <CardTitle>Inventory Report</CardTitle>
              <CardDescription>Track inventory levels, movements, and valuations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="dhaara">Dhaara</SelectItem>
                        <SelectItem value="customised">Customised</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="flex items-center space-x-2">
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Warehouses</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
                  <div className="flex items-center space-x-2">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="healthy">Healthy</SelectItem>
                        <SelectItem value="lowStock">Low Stock</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="overstock">Overstock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search..."
                    className="w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport("pdf")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("excel")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("csv")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">In Stock</TableHead>
                      <TableHead className="text-right">Allocated</TableHead>
                      <TableHead className="text-right">Value (₹)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateInventoryData.length > 0 ? (
                      paginateInventoryData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{`INV-${item.itemCode}`}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                item.category === "Dhaara"
                                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                                  : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                              }
                            >
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{item.inStock.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.allocated.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.value.toLocaleString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status.toLowerCase().replace(" ", "_") as any} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <DataTablePagination
                  totalItems={filteredInventoryData.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "logistics" && (
          <Card>
            <CardHeader>
              <CardTitle>Logistics Report</CardTitle>
              <CardDescription>Monitor shipments, deliveries, and transportation metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="Reliance Industries">Reliance Industries</SelectItem>
                        <SelectItem value="Tata Projects">Tata Projects</SelectItem>
                        <SelectItem value="L&T Construction">L&T Construction</SelectItem>
                        <SelectItem value="Adani Infrastructure">Adani Infrastructure</SelectItem>
                        <SelectItem value="BHEL">BHEL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="inTransit">In Transit</SelectItem>
                        <SelectItem value="dispatched">Dispatched</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search..."
                    className="w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport("pdf")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("excel")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("csv")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Dispatch Date</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateLogisticsData.length > 0 ? (
                      paginateLogisticsData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.shipmentId}</TableCell>
                          <TableCell>{item.orderId}</TableCell>
                          <TableCell>{item.customer}</TableCell>
                          <TableCell>{item.dispatchDate}</TableCell>
                          <TableCell>{item.deliveryDate}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status.toLowerCase().replace(" ", "_") as any} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <DataTablePagination
                  totalItems={filteredLogisticsData.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "procurement" && (
          <Card>
            <CardHeader>
              <CardTitle>Procurement Report</CardTitle>
              <CardDescription>Analyze purchase orders, supplier performance, and spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        <SelectItem value="JSW Steel">JSW Steel</SelectItem>
                        <SelectItem value="Hindalco">Hindalco</SelectItem>
                        <SelectItem value="Supreme Pipes">Supreme Pipes</SelectItem>
                        <SelectItem value="Finolex Cables">Finolex Cables</SelectItem>
                        <SelectItem value="Asian Paints">Asian Paints</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="flex items-center space-x-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="rawMaterials">Raw Materials</SelectItem>
                        <SelectItem value="components">Components</SelectItem>
                        <SelectItem value="consumables">Consumables</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search..."
                    className="w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport("pdf")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("excel")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("csv")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Value (₹)</TableHead>
                      <TableHead className="text-right">Payment Terms</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateProcurementData.length > 0 ? (
                      paginateProcurementData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.poNumber}</TableCell>
                          <TableCell>{item.supplier}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.orderDate}</TableCell>
                          <TableCell>{item.deliveryDate}</TableCell>
                          <TableCell className="text-right">{item.items}</TableCell>
                          <TableCell className="text-right">{item.value.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.paymentTerms}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status.toLowerCase().replace(" ", "_") as any} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <DataTablePagination
                  totalItems={filteredProcurementData.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "hr" && (
          <Card>
            <CardHeader>
              <CardTitle>HR Report</CardTitle>
              <CardDescription>Review employee data, attendance, and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="sales">Sales & Marketing</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="admin">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="flex items-center space-x-2">
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search..."
                    className="w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport("pdf")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("excel")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("csv")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead className="text-right">Working Days</TableHead>
                      <TableHead className="text-right">Present</TableHead>
                      <TableHead className="text-right">Absent</TableHead>
                      <TableHead className="text-right">Attendance %</TableHead>
                      <TableHead className="text-right">Overtime (hrs)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateHrData.length > 0 ? (
                      paginateHrData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.employeeId}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.department}</TableCell>
                          <TableCell>{item.designation}</TableCell>
                          <TableCell className="text-right">{item.workingDays}</TableCell>
                          <TableCell className="text-right">{item.present}</TableCell>
                          <TableCell className="text-right">{item.absent}</TableCell>
                          <TableCell className="text-right">{item.attendance}</TableCell>
                          <TableCell className="text-right">{item.overtime}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-4">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <DataTablePagination
                  totalItems={filteredHrData.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "finance" && (
          <Card>
            <CardHeader>
              <CardTitle>Finance Report</CardTitle>
              <CardDescription>Analyze financial statements, cash flow, and profitability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="sales">Sales & Marketing</SelectItem>
                        <SelectItem value="rd">R&D</SelectItem>
                        <SelectItem value="admin">Administration</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expenses">Expenses</SelectItem>
                        <SelectItem value="assets">Assets</SelectItem>
                        <SelectItem value="liabilities">Liabilities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search..."
                    className="w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport("pdf")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("excel")}>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport("csv")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Budget (₹)</TableHead>
                      <TableHead className="text-right">Actual (₹)</TableHead>
                      <TableHead className="text-right">Variance (₹)</TableHead>
                      <TableHead className="text-right">Variance %</TableHead>
                      <TableHead className="text-right">YTD Budget (₹)</TableHead>
                      <TableHead className="text-right">YTD Actual (₹)</TableHead>
                      <TableHead className="text-right">YTD Variance (₹)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateFinanceData.length > 0 ? (
                      paginateFinanceData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.department}</TableCell>
                          <TableCell className="text-right">{item.budget.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.actual.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.variance.toLocaleString()}</TableCell>
                          <TableCell className={`text-right ${item.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {item.variancePercent}
                          </TableCell>
                          <TableCell className="text-right">{item.ytdBudget.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.ytdActual.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.ytdVariance.toLocaleString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status.toLowerCase().replace(" ", "_") as any} />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4">
                          No data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <DataTablePagination
                  totalItems={filteredFinanceData.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
