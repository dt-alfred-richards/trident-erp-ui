import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, XCircle, ClipboardCheck, PlusCircle, Search } from "lucide-react"
import { GoodsReceivedDialog } from "./goods-received-dialog"
import { PurchaseOrderViewDialog } from "./purchase-order-view-dialog"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { PurchaseOrderDialog } from "./purchase-order-dialog"
import { Input } from "@/components/ui/input"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PurchaseOrderTabProps } from "./purchase-order-tab"
import { Material, PurchaseOrder, useProcurement } from "@/app/procurement/procurement-context"
import { convertDate } from "../generic"

const PurchaseOrderHelper = ({
    purchaseOrders: externalPurchaseOrders,
    setPurchaseOrders: externalSetPurchaseOrders,
}: PurchaseOrderTabProps) => {
    const { purchaseOrders: contextPurchaseOrder = [], suppliers = [], purchaseOrderMaterials, editPurchaseOrder, materials } = useProcurement()

    const materialMapper = useMemo(() => {
        return materials.reduce((acc: Record<string, Material>, curr) => {
            if (!acc[curr.materialId]) acc[curr.materialId] = curr
            return acc;
        }, {})
    }, [materials])


    const supplierMapper = useMemo(() => {
        return suppliers.reduce((acc: Record<string, string>, curr) => {
            if (!acc[curr.supplierId]) acc[curr.supplierId] = curr.name
            return acc;
        }, {})
    }, [suppliers])

    // Mock data for purchase orders with simplified statuses
    const defaultPurchaseOrders = useMemo(() => {
        return contextPurchaseOrder.map((item) => ({
            id: item.purchaseId,
            supplier: item.supplierId,
            supplierName: supplierMapper[item.supplierId] || "",
            material: "",
            materialName: "",
            quantity: purchaseOrderMaterials.reduce((acc: number, curr) => {
                acc += parseInt(curr.receivedQuantity)
                return acc;
            }, 0),
            unit: "",
            orderDate: convertDate(item.createdOn || item.modifiedOn),
            expectedDelivery: new Date(),
            status: item.status || "pending",
            totalValue: item.total,
        }))
    }, [contextPurchaseOrder, purchaseOrderMaterials])

    // Use external state if provided, otherwise use internal state
    const [internalPurchaseOrders, setInternalPurchaseOrders] = useState(defaultPurchaseOrders)

    // Use either the external or internal state management
    const purchaseOrders = externalPurchaseOrders?.length ? externalPurchaseOrders : internalPurchaseOrders
    const setPurchaseOrders = externalSetPurchaseOrders || setInternalPurchaseOrders

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string[]>([])
    const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [selectedPO, setSelectedPO] = useState<string>("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    })

    // Add new state variables for cancel confirmation and GRN view
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [poToCancel, setPoToCancel] = useState<string>("")
    const [grnViewDialogOpen, setGrnViewDialogOpen] = useState(false)
    const [selectedGrnPo, setSelectedGrnPo] = useState<string>("")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const { toast } = useToast()

    // Add a new state variable for the order dialog
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

    // Add a function to handle the new order button click
    const handleNewOrder = () => {
        setIsOrderDialogOpen(true)
    }

    // Add a function to add a new purchase order
    const addPurchaseOrder = (newOrder: Omit<PurchaseOrder, "id" | "orderDate" | "status">) => {
        // Generate a new PO ID
        const poId = `PO-${String(purchaseOrders.length + 1).padStart(3, "0")}`

        // Create the new order object
        const order: PurchaseOrder = {
            id: poId,
            orderDate: new Date().toISOString().split("T")[0], // Today's date
            status: "pending",
            ...newOrder,
        }

        // Update the state with the new order
        setPurchaseOrders((prev) => [order, ...prev])

        // Show success notification
        toast({
            title: "Purchase Order Created",
            description: `Purchase order ${poId} has been created successfully.`,
            variant: "default",
        })

        // Close the dialog
        setIsOrderDialogOpen(false)
    }

    // Update the getStatusBadge function to include dark mode styling similar to the StatusBadge component

    const getStatusBadge = (status: string, received?: number, quantity?: number) => {
        switch (status) {
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                    >
                        Pending
                    </Badge>
                )
            case "partial":
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
                    >
                        Partial {received && quantity ? `(${received}/${quantity})` : ""}
                    </Badge>
                )
            case "completed":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
                    >
                        Completed
                    </Badge>
                )
            case "cancelled":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
                    >
                        Cancelled
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    // Filter purchase orders based on search query and status filter
    const filteredOrders = defaultPurchaseOrders.filter((po) => {
        const matchesSearch =
            po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (po.supplierName || po.supplier).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (po.materialName || po.material).toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(po.status)

        const orderDate = new Date(po.orderDate)
        const matchesDate =
            !dateRange?.from || (orderDate >= dateRange.from && (!dateRange.to || orderDate <= dateRange.to))

        return matchesSearch && matchesStatus && matchesDate
    })

    // Get current orders for pagination
    const indexOfLastOrder = currentPage * itemsPerPage
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const toggleStatusFilter = (status: string) => {
        setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
    }

    const handleReceiveClick = (poId: string) => {
        setSelectedPO(poId)
        setReceiveDialogOpen(true)
    }

    const handleViewClick = (poId: string) => {
        setSelectedPO(poId)
        setViewDialogOpen(true)
    }

    // Add a new function to handle cancel button click
    const handleCancelClick = (poId: string) => {
        setPoToCancel(poId)
        setCancelDialogOpen(true)
    }

    // Add a new function to handle GRN view button click
    const handleGrnViewClick = (poId: string) => {
        setSelectedGrnPo(poId)
        setGrnViewDialogOpen(true)
    }

    // Add a function to confirm cancellation
    const confirmCancelOrder = () => {
        if (!editPurchaseOrder) return

        editPurchaseOrder({ purchaseId: poToCancel, status: "cancelled" }, []).then(() => {
            // Close the dialog
            setCancelDialogOpen(false)
            setPoToCancel("")
        })
    }

    // Function to clear all filters
    const clearAllFilters = () => {
        setStatusFilter([])
        setDateRange({ from: undefined, to: undefined })
        setSearchQuery("")
    }

    // Check if any filters are applied
    const hasFilters = statusFilter.length > 0 || dateRange?.from || searchQuery

    const handleGoodsReceived = (poId: string, isFullDelivery: boolean) => {
        // Update the purchase orders state with the updated status
        // When using "Create GRN", we always set to "partial" regardless of quantities
        setPurchaseOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id === poId ? { ...order, status: isFullDelivery ? "completed" : "partial" } : order,
            ),
        )

        // Show success notification
        toast({
            title: `Purchase Order ${isFullDelivery ? "Completed" : "Partially Received"}`,
            description: `Purchase order ${poId} has been ${isFullDelivery ? "fully received" : "partially received"}.`,
            variant: "default",
        })
    }

    const receivedGoods = useMemo(() => {
        return purchaseOrderMaterials.filter(item => item.purchaseOrderId === selectedGrnPo)
    }, [purchaseOrderMaterials, selectedGrnPo])

    console.log({ receivedGoods, purchaseOrderMaterials, currentOrders })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold tracking-tight">Purchase Order - TB</h2>

                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    {/* Add Status filter dropdown */}
                    <Select
                        value={statusFilter.length === 1 ? statusFilter[0] : "all"}
                        onValueChange={(value) => {
                            if (value === "all") {
                                setStatusFilter([])
                            } else {
                                setStatusFilter([value])
                            }
                        }}
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleNewOrder}
                        className="gap-1 whitespace-nowrap bg-[#725af2] hover:bg-[#5d48d0] text-white"
                    >
                        <PlusCircle className="h-4 w-4" />
                        <span>New Order</span>
                    </Button>
                </div>
            </div>

            {/* Moved filter indicators to top of table */}
            {hasFilters && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4 bg-muted/30 p-2 rounded-md">
                    <span className="font-medium">Filtered by:</span>
                    {searchQuery && (
                        <Badge variant="secondary">
                            Search: {searchQuery}
                            <button className="ml-1 text-xs" onClick={() => setSearchQuery("")}>
                                ×
                            </button>
                        </Badge>
                    )}
                    {statusFilter.map((status) => (
                        <Badge key={status} variant="secondary" className="capitalize">
                            Status: {status}
                            <button className="ml-1 text-xs" onClick={() => toggleStatusFilter(status)}>
                                ×
                            </button>
                        </Badge>
                    ))}
                    {dateRange?.from && (
                        <Badge variant="secondary">
                            Date: {format(dateRange.from, "PP")}
                            {dateRange.to ? ` - ${format(dateRange.to, "PP")}` : ""}
                            <button className="ml-1 text-xs" onClick={() => setDateRange({ from: undefined, to: undefined })}>
                                ×
                            </button>
                        </Badge>
                    )}
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs ml-auto" onClick={clearAllFilters}>
                        Clear all filters
                    </Button>
                </div>
            )}

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">PO #</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Order Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No purchase orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentOrders.map((po) => (
                                        <TableRow key={po.id}>
                                            <TableCell className="font-medium">{po.id}</TableCell>
                                            <TableCell>{po.supplierName || po.supplier}</TableCell>
                                            <TableCell>{po.orderDate}</TableCell>
                                            <TableCell>{getStatusBadge(po.status, po.received, po.quantity)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {(po.status === "pending" || po.status === "partial") && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 bg-[#43ced7] hover:bg-[#39b0b8] text-white border-0"
                                                            onClick={() => handleReceiveClick(po.id)}
                                                        >
                                                            Receive
                                                        </Button>
                                                    )}
                                                    {po.status === "pending" && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                                        onClick={() => handleCancelClick(po.id)}
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Cancel Order</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    {(po.status === "completed" || po.status === "partial") && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0 text-green-500 hover:text-green-700 hover:bg-green-100"
                                                                        onClick={() => handleGrnViewClick(po.id)}
                                                                    >
                                                                        <ClipboardCheck className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>View GRN</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => handleViewClick(po.id)}
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>View Order Details</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            <DataTablePagination
                totalItems={filteredOrders.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />

            {receiveDialogOpen && (
                <GoodsReceivedDialog
                    open={receiveDialogOpen}
                    onOpenChange={setReceiveDialogOpen}
                    poNumber={selectedPO}
                    onGoodsReceived={handleGoodsReceived}
                />
            )}

            {viewDialogOpen && (
                <PurchaseOrderViewDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} poId={selectedPO} />
            )}

            {cancelDialogOpen && (
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Cancel Purchase Order</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-muted-foreground">
                                Are you sure you want to cancel purchase order <span className="font-medium">{poToCancel}</span>? This
                                action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                                No, Keep Order
                            </Button>
                            <Button variant="destructive" onClick={confirmCancelOrder}>
                                Yes, Cancel Order
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {grnViewDialogOpen && (
                <Dialog open={grnViewDialogOpen} onOpenChange={setGrnViewDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Goods Received Note for PO {selectedGrnPo}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date Received</TableHead>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Quality Check</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* Mock GRN data - in a real app, this would be fetched based on the PO */}
                                        {
                                            receivedGoods.map(item => {
                                                return <TableRow key={`${item.materialId}-${item.id}`}>
                                                    <TableCell>{convertDate(item.modifiedOn)}</TableCell>
                                                    <TableCell>{materialMapper[item.materialId]?.name || ""}</TableCell>
                                                    <TableCell>{`${item.receivedQuantity} ${item.unit}`}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            Passed
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            })
                                        }
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Notes</h4>
                                <p className="text-sm text-muted-foreground">
                                    Material received in good condition. Quality check performed on samples from both batches.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={() => setGrnViewDialogOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {isOrderDialogOpen && (
                <PurchaseOrderDialog
                    open={isOrderDialogOpen}
                    onOpenChange={setIsOrderDialogOpen}
                    onCreateOrder={addPurchaseOrder}
                />
            )}
        </div>
    )
}

export default PurchaseOrderHelper