"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useOrders } from "@/contexts/order-context"
import { DataByTableName } from "../utils/api"
import { FactSales, OrderDetails } from "./sales-dashboard"
import { lodashGet } from "../common/generic"

interface OrderItem {
  id: string
  productId: string
  productName: string
  cases: number
  pricePerCase: number
  taxRate: number
  basePay: number
  taxAmount: number
}

interface CreateSalesOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export type ClientType = {
  id: string,
  name: string,
  gstNumber: string,
  panNumber: string,
  references: string[],
  shippingAddresses: {
    id: string,
    name: string,
    address: string,
    isDefault: boolean,
  }[]
}

// Size SKU options
const SIZE_SKUS = [
  { id: "250ML", name: "250ML" },
  { id: "500ML", name: "500ML" },
  { id: "750ML", name: "750ML" },
  { id: "1000ML", name: "1000ML" },
  { id: "2000ML", name: "2000ML" },
]

export function CreateSalesOrderDialog({ open, onOpenChange }: CreateSalesOrderDialogProps) {
  const { clientInfo, productInfo, clientAddress = {}, clientProposedPrice = {}, setRefetchData } = useOrders()  // Order header state
  const [orderDate] = useState<Date>(new Date()) // Remove setOrderDate since it's now fixed
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | undefined>(undefined)
  const [clientId, setClientId] = useState("")
  const [reference, setReference] = useState("")
  const [poDate, setPoDate] = useState<Date | undefined>(undefined)
  const [poId, setPoId] = useState("")
  const [poNumber, setPoNumber] = useState("") // New state for Purchase Order Number
  const [remarks, setRemarks] = useState("")
  const products = useMemo(() => {
    return Object.values(productInfo).map(product => ({
      id: product.productId, name: product.name, price: clientProposedPrice[product.productId]?.proposedPrice, taxRate: 0
    }))
  }, [productInfo])

  const clients = useMemo(() => {
    return Object.values(clientInfo).map(client => {
      if (!clientAddress) return
      const address = clientAddress[client.clientId] ?? []
      return ({
        id: client.clientId,
        name: client.name,
        gstNumber: client.gst,
        panNumber: client.pan,
        references: [client.reference],
        shippingAddresses: address.map((a, index) => ({
          id: a.addressId,
          name: [a.addressLine_1, a.addressLine_2, a.cityDistrictState, a.pincode].join(","),
          address: [a.addressLine_1, a.addressLine_2, a.cityDistrictState, a.pincode].join(","),
          isDefault: index === 0,
        }))
      }) as ClientType
    })
  }, [clientInfo, clientAddress])

  // Client details (auto-populated)
  const [clientName, setClientName] = useState("")
  const [gstNumber, setGstNumber] = useState("")
  const [panNumber, setPanNumber] = useState("")
  const [availableReferences, setAvailableReferences] = useState<string[]>([])
  const [shippingAddresses, setShippingAddresses] = useState<
    Array<{ id: string; name: string; address: string; isDefault: boolean }>
  >([])
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState("")

  // Tax location state
  const [isInTelangana, setIsInTelangana] = useState(true) // Default to true (within Telangana)

  // Item entry state
  const [showItemForm, setShowItemForm] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedSizeSku, setSelectedSizeSku] = useState("")
  const [cases, setCases] = useState("")

  // Combobox state
  const [openCombobox, setOpenCombobox] = useState(false)

  // Order items state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // Order summary state
  const [subtotal, setSubtotal] = useState(0)
  const [taxTotal, setTaxTotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<"percentage" | "amount">("amount")
  const [taxesEnabled, setTaxesEnabled] = useState(true) // New state for optional taxes
  const [total, setTotal] = useState(0)

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Access the orders context

  // Generate a unique order ID
  const generateOrderId = () => {
    const prefix = "SO-"
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    return `${prefix}${randomNum}`
  }

  // Update client details when client changes
  useEffect(() => {
    if (clientId) {
      const selectedClient = clients.find((client) => client?.id === clientId)
      if (selectedClient) {
        setClientName(selectedClient.name)
        setGstNumber(selectedClient.gstNumber)
        setPanNumber(selectedClient.panNumber)
        setAvailableReferences(selectedClient.references)
        setReference("") // Reset reference when client changes

        // Set shipping addresses
        if (selectedClient.shippingAddresses) {
          setShippingAddresses(selectedClient.shippingAddresses)

          // Auto-select if there's only one address or a default address
          if (selectedClient.shippingAddresses.length === 1) {
            setSelectedShippingAddressId(selectedClient.shippingAddresses[0].id)
          } else {
            const defaultAddress = selectedClient.shippingAddresses.find((addr) => addr.isDefault)
            if (defaultAddress) {
              setSelectedShippingAddressId(defaultAddress.id)
            } else {
              setSelectedShippingAddressId("") // Reset if no default
            }
          }
        } else {
          setShippingAddresses([])
          setSelectedShippingAddressId("")
        }
      }
    } else {
      setClientName("")
      setGstNumber("")
      setPanNumber("")
      setAvailableReferences([])
      setReference("")
      setShippingAddresses([])
      setSelectedShippingAddressId("")
    }
  }, [clientId])

  // Update when shipping address changes
  useEffect(() => {
    if (selectedShippingAddressId) {
      const selectedAddress = shippingAddresses.find((addr) => addr.id === selectedShippingAddressId)
      if (selectedAddress) {
        // Check if address contains "Telangana" to determine tax type
        setIsInTelangana(selectedAddress.address.includes("Telangana"))
      }
    }
  }, [selectedShippingAddressId, shippingAddresses])

  // Calculate order summary whenever items change
  useEffect(() => {
    const newSubtotal = orderItems.reduce((sum, item) => sum + item.basePay, 0)

    // Calculate discount amount
    let discountAmount = 0
    if (discountType === "percentage") {
      discountAmount = (newSubtotal * discount) / 100
    } else {
      discountAmount = discount
    }

    // Apply discount to subtotal before calculating tax
    const discountedSubtotal = newSubtotal - discountAmount

    // Calculate tax only if taxes are enabled
    let newTaxTotal = 0
    if (taxesEnabled) {
      // Tax calculation is the same regardless of tax type, just displayed differently
      newTaxTotal = orderItems.reduce((sum, item) => {
        const itemDiscountRatio = item.basePay / newSubtotal
        const itemDiscountAmount = discountAmount * itemDiscountRatio
        const discountedItemAmount = item.basePay - itemDiscountAmount
        return sum + (discountedItemAmount * item.taxRate) / 100
      }, 0) || 0
    }

    setSubtotal(newSubtotal)
    setTaxTotal(newTaxTotal)
    setTotal(discountedSubtotal + newTaxTotal)
  }, [orderItems, discount, discountType, taxesEnabled])

  // Handle adding a new item to the order
  const handleAddItem = () => {
    if (!selectedProductId || !selectedSizeSku || !cases || Number(cases) <= 0) {
      return
    }

    const product = products.find((p) => p.id === selectedProductId)

    if (!product) return

    const price = product.price || 0
    const quantity = Number(cases)
    const basePay = price * quantity
    // Calculate tax amount based on base pay and tax rate
    const taxAmount = (basePay * product.taxRate) / 100

    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      productName: `${product.name} (${selectedSizeSku})`,
      cases: quantity,
      pricePerCase: price,
      taxRate: product.taxRate,
      basePay,
      taxAmount,
    }

    setOrderItems([...orderItems, newItem])

    // Reset form
    setSelectedProductId("")
    setSelectedSizeSku("")
    setCases("")
    setShowItemForm(false)
  }

  // Handle removing an item from the order
  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  // Handle discount change
  const handleDiscountChange = (value: string) => {
    const newDiscount = value === "" ? 0 : Number(value)
    if (newDiscount >= 0) {
      setDiscount(newDiscount)
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (
      !orderDate ||
      !clientId ||
      !reference ||
      !expectedDeliveryDate ||
      orderItems.length === 0 ||
      (shippingAddresses.length > 0 && !selectedShippingAddressId)
    ) {
      alert("Please fill in all required fields and add at least one item.")
      return
    }

    // Show confirmation dialog
    setShowConfirmation(true)
  }

  const dateConverter = (date: Date | undefined) => {
    if (!date) return "";
    return date.toISOString().split("T")[0]
  }

  const handleConfirmedSubmit = useCallback(() => {
    // Get the selected shipping address details
    const selectedAddress = shippingAddresses.find((addr) => addr.id === selectedShippingAddressId)
    const salesPayload = {
      clientId,
      discount,
      expectedDeliveryDate: expectedDeliveryDate?.getTime(),
      orderDate: orderDate.getTime(),
      purchaseDate: poDate?.getTime(),
      purchaseOrderId: poId,
      purchaseOrderNumber: poNumber,
      reference: reference,
      remarks,
      shippingAddressId: selectedAddress?.id,
      subTotal: subtotal,
      taxesEnabled
    } as Partial<FactSales>

    const salesInstance = new DataByTableName("fact_sales_v2")

    salesInstance.post(salesPayload).then(res => {
      const orderId = lodashGet({ data: res, path: "data.data.0.orderId" })
      const orderDetailsInstance = new DataByTableName("order_details");

      const orderDetailsPayload = orderItems.map(order => ({
        cases: order.cases,
        casesDelivered: 0,
        casesReserved: 0,
        clientId,
        expectedDeliveryDate: expectedDeliveryDate?.getTime(),
        productId: order.productId,
        addressId: selectedAddress?.id || "",
        status: "pending_approval",
        tradePrice: order.pricePerCase,
        orderId
      } as OrderDetails))
      return orderDetailsInstance.post(orderDetailsPayload)
    }).then(resetForm).catch(error => {
      console.log({ error })
    })
  }, [clientId, discount, expectedDeliveryDate, orderDate, poDate, poId, poNumber, reference, selectedShippingAddressId, subtotal, taxesEnabled])

  // Reset the form to initial state
  const resetForm = () => {
    // No need to reset orderDate as it's always today
    setClientId("")
    setReference("")
    setExpectedDeliveryDate(undefined)
    setPoDate(undefined)
    setPoId("")
    setPoNumber("") // Reset the new field
    setRemarks("")
    setOrderItems([])
    setDiscount(0)
    setDiscountType("amount")
    setTaxesEnabled(true)
    setShowItemForm(false)
    setSelectedProductId("")
    setSelectedSizeSku("")
    setCases("")
    setShippingAddresses([])
    setSelectedShippingAddressId("")
    setRefetchData(p => !p)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sales Order Entry</DialogTitle>
            <DialogDescription>Create a new sales order for a client.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Order Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Order Date (Non-editable) */}
                <div className="space-y-2">
                  <Label htmlFor="order-date">
                    Order Date <span className="text-red-500">*</span>
                  </Label>
                  <Input id="order-date" value={format(orderDate, "PPP")} readOnly className="bg-muted" />
                </div>

                {/* Expected Delivery Date */}
                <div className="space-y-2">
                  <Label htmlFor="delivery-date">
                    Delivery Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="delivery-date"
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expectedDeliveryDate ? format(expectedDeliveryDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={expectedDeliveryDate}
                        onSelect={(date) => date && setExpectedDeliveryDate(date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Client Selection */}
                <div className="space-y-2">
                  <Label htmlFor="client">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client?.id} value={client?.id || ""}>
                          {client?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference Selection */}
                <div className="space-y-2">
                  <Label htmlFor="reference">
                    Reference <span className="text-red-500">*</span>
                  </Label>
                  <Select value={reference} onValueChange={setReference} disabled={availableReferences.length === 0}>
                    <SelectTrigger id="reference">
                      <SelectValue
                        placeholder={availableReferences.length === 0 ? "Select a client first" : "Select reference"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReferences.map((ref) => (
                        <SelectItem key={ref} value={ref}>
                          {ref}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Purchase Order Date */}
                <div className="space-y-2">
                  <Label htmlFor="po-date">Purchase Order Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="po-date" variant={"outline"} className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {poDate ? format(poDate, "PPP") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={poDate}
                        onSelect={setPoDate}
                        initialFocus
                        disabled={(date) => date > orderDate}
                        footer={
                          <p className="text-xs text-center text-muted-foreground p-2">
                            Purchase Order Date cannot be after Order Date
                          </p>
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Client ID (Auto-populated) */}
                <div className="space-y-2">
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input id="client-id" value={clientId} readOnly className="bg-muted" />
                </div>

                {/* GST Number (Auto-populated) */}
                <div className="space-y-2">
                  <Label htmlFor="gst-number">GST Number</Label>
                  <Input id="gst-number" value={gstNumber} readOnly className="bg-muted" />
                </div>

                {/* PAN Number (Auto-populated) */}
                <div className="space-y-2">
                  <Label htmlFor="pan-number">PAN Number</Label>
                  <Input id="pan-number" value={panNumber} readOnly className="bg-muted" />
                </div>

                {/* Purchase Order ID */}
                <div className="space-y-2">
                  <Label htmlFor="po-id">Purchase Order ID</Label>
                  <Input id="po-id" value={poId} onChange={(e) => setPoId(e.target.value)} placeholder="Enter PO ID" />
                </div>

                {/* Purchase Order Number - New Field */}
                <div className="space-y-2">
                  <Label htmlFor="po-number">Purchase Order Number</Label>
                  <Input
                    id="po-number"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="Enter PO Number"
                  />
                </div>

                {/* Shipping Address Selection */}
                <div className="space-y-2">
                  <Label htmlFor="shipping-address">
                    Shipping Address {shippingAddresses.length > 0 && <span className="text-red-500">*</span>}
                  </Label>
                  <Select
                    value={selectedShippingAddressId}
                    onValueChange={setSelectedShippingAddressId}
                    disabled={shippingAddresses.length === 0}
                  >
                    <SelectTrigger id="shipping-address">
                      <SelectValue
                        placeholder={
                          shippingAddresses.length === 0 ? "Select a client first" : "Select shipping address"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingAddresses.map((address) => (
                        <SelectItem key={address.id} value={address.id}>
                          {address.name} {address.isDefault && "(Default)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedShippingAddressId && (
                    <div className="mt-2 text-xs text-muted-foreground whitespace-pre-line border p-2 rounded">
                      {shippingAddresses.find((addr) => addr.id === selectedShippingAddressId)?.address}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any additional notes or comments here"
                className="min-h-[80px]"
              />
            </div>

            {/* Order Items Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Order Items</h3>
                {!showItemForm && (
                  <Button
                    type="button"
                    onClick={() => setShowItemForm(true)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Item
                  </Button>
                )}
              </div>

              {/* Item Entry Form */}
              {showItemForm && (
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Product Selection - Replaced with Combobox */}
                      <div className="space-y-2">
                        <Label htmlFor="product">Product</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCombobox}
                              className="w-full justify-between"
                            >
                              {selectedProductId
                                ? products.find((product) => product.id === selectedProductId)?.name
                                : "Select product..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search products..." />
                              <CommandList>
                                <CommandEmpty>No product found.</CommandEmpty>
                                <CommandGroup>
                                  {products.map((product) => (
                                    <CommandItem
                                      key={product.id}
                                      value={product.id}
                                      onSelect={(currentValue) => {
                                        setSelectedProductId(currentValue === selectedProductId ? "" : currentValue)
                                        setOpenCombobox(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedProductId === product.id ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      {product.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Size SKU Selection - New Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="size-sku">Size SKU</Label>
                        <Select value={selectedSizeSku} onValueChange={setSelectedSizeSku}>
                          <SelectTrigger id="size-sku">
                            <SelectValue placeholder="Select size..." />
                          </SelectTrigger>
                          <SelectContent>
                            {SIZE_SKUS.map((size) => (
                              <SelectItem key={size.id} value={size.id}>
                                {size.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Cases */}
                      <div className="space-y-2">
                        <Label htmlFor="cases">Cases</Label>
                        <Input
                          id="cases"
                          type="number"
                          value={cases}
                          onChange={(e) => setCases(e.target.value)}
                          min="1"
                          placeholder="Enter quantity"
                        />
                      </div>

                      {/* Price (Auto-populated) */}
                      <div className="space-y-2">
                        <Label htmlFor="price">Price per Case</Label>
                        <Input
                          id="price"
                          value={
                            selectedProductId
                              ? `₹${products.find((p) => p.id === selectedProductId)?.price?.toFixed(2) || "0.00"}`
                              : ""
                          }
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowItemForm(false)
                          setSelectedProductId("")
                          setSelectedSizeSku("")
                          setCases("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddItem}
                        disabled={!selectedProductId || !selectedSizeSku || !cases || Number(cases) <= 0}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items Table */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Cases</TableHead>
                      <TableHead className="text-right">Price/Case</TableHead>
                      <TableHead className="text-right">Base Pay</TableHead>
                      <TableHead className="text-right">Tax Rate</TableHead>
                      <TableHead className="text-right">Tax Amount</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.length > 0 ? (
                      orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.cases}</TableCell>
                          <TableCell className="text-right">₹{item.pricePerCase?.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{item.basePay?.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.taxRate}%</TableCell>
                          <TableCell className="text-right">₹{item.taxAmount?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                          No items added to this order yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Order Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div></div> {/* Empty div for alignment */}
                <div className="space-y-2">
                  <div className="flex justify-between py-1">
                    <span>Subtotal:</span>
                    <span>₹{subtotal?.toFixed(2)}</span>
                  </div>

                  {/* Discount Section - Updated */}
                  <div className="flex justify-between py-1 items-center">
                    <span>Discount:</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                        className="w-24 h-8 text-right"
                        min="0"
                      />
                      <Select
                        value={discountType}
                        onValueChange={(value: "percentage" | "amount") => setDiscountType(value)}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="amount">₹</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Taxes Toggle - New */}
                  <div className="flex justify-between py-1 items-center">
                    <span>Apply Taxes:</span>
                    <Switch checked={taxesEnabled} onCheckedChange={setTaxesEnabled} />
                  </div>

                  {/* Taxes - Conditional with breakdown */}
                  {taxesEnabled && (
                    <>
                      {isInTelangana ? (
                        <>
                          <div className="flex justify-between py-1">
                            <span>CGST (9%):</span>
                            <span>₹{(taxTotal / 2)?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>SGST (9%):</span>
                            <span>₹{(taxTotal / 2)?.toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between py-1">
                          <span>IGST (18%):</span>
                          <span>₹{taxTotal?.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between py-2 font-bold border-t">
                    <span>Total:</span>
                    <span>₹{total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Terms & Conditions</h3>
              <div className="text-sm text-muted-foreground border p-3 rounded-md bg-muted/30">
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Payment due within 30 days of invoice date.</li>
                  <li>Goods remain the property of Dhaara until paid in full.</li>
                  <li>Returns accepted within 7 days with original packaging.</li>
                  <li>Delivery times are estimates and not guaranteed.</li>
                  <li>Prices are subject to change without notice.</li>
                  <li>Prices are subject to change without notice.</li>
                </ol>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!orderDate || !clientId || !reference || !expectedDeliveryDate || orderItems.length === 0}
            >
              Add Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send for Admin Approval?</AlertDialogTitle>
            <AlertDialogDescription>
              This will submit the sales order for administrative approval before processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit}>Submit for Approval</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
