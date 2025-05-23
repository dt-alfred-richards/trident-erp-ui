"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { Order, Product, ProductStatus, ShippingAddress } from "@/types/order"
import { useOrders } from "@/contexts/order-context"
import { convertDate } from "../generic"

// Mock shipping addresses database
const customerAddresses: Record<string, { id: string; name: string; address: string; isDefault?: boolean }[]> = {
  "Acme Corp": [
    { id: "addr1", name: "Headquarters", address: "123 Main St, New York, NY 10001", isDefault: true },
    { id: "addr2", name: "Warehouse", address: "456 Industrial Blvd, Newark, NJ 07101" },
    { id: "addr3", name: "Distribution Center", address: "789 Logistics Way, Philadelphia, PA 19019" },
  ],
  "Globex Industries": [
    { id: "addr4", name: "Main Office", address: "100 Tech Drive, San Francisco, CA 94105", isDefault: true },
    { id: "addr5", name: "Manufacturing Plant", address: "200 Factory Lane, Oakland, CA 94621" },
  ],
  "Stark Enterprises": [
    { id: "addr6", name: "Tower", address: "200 Park Avenue, New York, NY 10166", isDefault: true },
    { id: "addr7", name: "Research Facility", address: "300 Innovation Dr, Malibu, CA 90265" },
  ],
  "Wayne Enterprises": [
    { id: "addr8", name: "Corporate HQ", address: "1007 Mountain Drive, Gotham, NJ 07101", isDefault: true },
    { id: "addr9", name: "R&D Center", address: "1939 Kane Street, Gotham, NJ 07101" },
  ],
  "Umbrella Corporation": [
    { id: "addr10", name: "Main Campus", address: "500 Raccoon Rd, Raccoon City, MI 48226", isDefault: true },
  ],
  "Oscorp Industries": [
    { id: "addr11", name: "Science Tower", address: "888 Broadway, New York, NY 10003", isDefault: true },
  ],
  "Cyberdyne Systems": [
    { id: "addr12", name: "Research HQ", address: "18144 El Camino Real, Sunnyvale, CA 94087", isDefault: true },
  ],
}


interface OrderItem {
  id: string
  productId: string
  productName: string
  cases: number
  pricePerCase: number
  taxRate: number
  basePay: number
  taxAmount: number
  status: string,
  salesId: string
}

interface EditOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

export function EditOrderDialog({ open, onOpenChange, order }: EditOrderDialogProps) {
  const { updateOrder, clientMapper, shippingAddress: contextShippingAddress, references, products } = useOrders()

  const productCatalog = useMemo<Product[]>(() => {
    return products;
  }, [products])

  // Order header state (non-editable)
  const [orderDate] = useState<Date>(order.orderDate ? new Date(order.orderDate) : new Date())
  const [customer] = useState(clientMapper[order.clientId]?.clientName || "")
  const [poNumber] = useState(order.poNumber || "")
  const [poId] = useState(order.poId || "")
  const [poDate] = useState<Date | undefined>(order.poDate ? new Date(order.poDate) : undefined)
  const [remarks] = useState(order.remarks || "")

  // Editable fields
  const [reference, setReference] = useState(order.reference)
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | undefined>(
    order.deliveryDate ? new Date(order.deliveryDate) : undefined,
  )

  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([])
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(order.shippingAddress || "")
  // Tax location state
  const [isInTelangana, setIsInTelangana] = useState(true)

  // Item entry state
  const [showItemForm, setShowItemForm] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [cases, setCases] = useState("")

  // Combobox state
  const [openCombobox, setOpenCombobox] = useState(false)

  // Order items state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // Order summary state
  const [subtotal, setSubtotal] = useState(0)
  const [taxTotal, setTaxTotal] = useState(0)
  const [discount, setDiscount] = useState(order.summary?.discount || 0)
  const [discountType, setDiscountType] = useState<string>(order.summary?.discountType || "amount")
  const [taxesEnabled, setTaxesEnabled] = useState(order.summary?.taxesEnabled !== false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setShippingAddresses(contextShippingAddress.filter(item => item.clientId === order.clientId))
    const selectedAddress = contextShippingAddress.find(item => item.addressId === order.shippingAddress)
    if (selectedAddress) {
      setSelectedShippingAddressId(selectedAddress.addressId)
    }
  }, [order, contextShippingAddress])
  // Initialize order items from order products
  useEffect(() => {
    if (open && order.products) {
      const items: OrderItem[] = order.products.map((product) => ({
        id: product.id,
        productId: product.sku,
        productName: product.name,
        cases: product.quantity,
        pricePerCase: product.price,
        taxRate: 18, // Default tax rate
        basePay: product.price * product.quantity,
        taxAmount: 0, // Will be calculated in useEffect
        status: product.status,
        salesId: product.salesId || ""
      }))
      setOrderItems(items)
    }
  }, [open, order])

  console.log({ order })

  // Update when shipping address changes
  useEffect(() => {
    if (selectedShippingAddressId) {
      const selectedAddress = contextShippingAddress.find((addr) => addr.id + "" === selectedShippingAddressId)
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
        const itemDiscountRatio = item.basePay / (newSubtotal || 1) // Avoid division by zero
        const itemDiscountAmount = discountAmount * itemDiscountRatio
        const discountedItemAmount = item.basePay - itemDiscountAmount
        return sum + (discountedItemAmount * item.taxRate) / 100
      }, 0)
    }

    setSubtotal(newSubtotal)
    setTaxTotal(newTaxTotal)
    setTotal(discountedSubtotal + newTaxTotal)

  }, [orderItems, discount, discountType, taxesEnabled])

  useEffect(() => {
    if (orderItems.length === 0) return

    const newSubtotal = orderItems.reduce((sum, item) => sum + item.basePay, 0)

    // Calculate discount amount
    let discountAmount = 0
    if (discountType === "percentage") {
      discountAmount = (newSubtotal * discount) / 100
    } else {
      discountAmount = discount
    }

    // For each item in the table, calculate its tax amount for display
    const itemsWithTaxAmounts = orderItems.map((item) => {
      const itemDiscountRatio = item.basePay / (newSubtotal || 1)
      const itemDiscountAmount = discountAmount * itemDiscountRatio
      const discountedItemAmount = item.basePay - itemDiscountAmount
      const taxAmount = taxesEnabled ? (discountedItemAmount * item.taxRate) / 100 : 0

      return {
        ...item,
        taxAmount,
      }
    })

    // Only update if the tax amounts have actually changed
    const taxAmountsChanged = itemsWithTaxAmounts.some((item, index) => item.taxAmount !== orderItems[index].taxAmount)

    if (taxAmountsChanged) {
      setOrderItems(itemsWithTaxAmounts)
    }
  }, [subtotal, discount, discountType, taxesEnabled])

  // Handle adding a new item to the order
  const handleAddItem = () => {
    if (!selectedProductId || !cases || Number(cases) <= 0) {
      return
    }

    const product = productCatalog.find((p) => p.productId === selectedProductId)

    console.log({ product, productCatalog, selectedProductId })
    if (!product) return

    const quantity = Number(cases)
    const basePay = product.price * quantity

    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      productId: product.productId,
      productName: product.name,
      cases: quantity,
      pricePerCase: product.price,
      taxRate: product.taxRate,
      basePay,
      taxAmount: 0, // Will be calculated in useEffect
      status: "pending",
      salesId: order.salesId || ""
    }

    setOrderItems([...orderItems, newItem])

    // Reset form
    setSelectedProductId("")
    setCases("")
    setShowItemForm(false)
  }

  // Handle removing an item from the order
  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  // Handle product quantity change
  const handleProductQuantityChange = (itemId: string, newQuantity: number) => {
    setOrderItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const basePay = item.pricePerCase * newQuantity
          return {
            ...item,
            cases: newQuantity,
            basePay,
          }
        }
        return item
      }),
    )
  }

  console.log({ orderItems })

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create updated products array
    const updatedProducts = orderItems.map((item) => ({
      name: item.productName,
      sku: item.productId,
      cases: item.cases,
      price: item.pricePerCase,
      status: item.status as ProductStatus,
      salesId: item.salesId
    }))

    // Create the updated order
    const updatedOrder: Partial<Order> = {
      reference,
      deliveryDate: expectedDeliveryDate,
      products: updatedProducts as any,
      shippingAddress: selectedShippingAddressId,
      summary: {
        subtotal,
        discountType,
        discount,
        taxesEnabled,
        taxType: isInTelangana ? "CGST+SGST" : "IGST",
        taxTotal,
        total,
      },
    }

    // Update the order
    updateOrder(order.id, updatedOrder).then(() => {
      // onOpenChange(false)
    }).catch((error) => {
      console.log({ error })
    })
  }

  // CSS to hide number input arrows
  const hideNumberInputArrows =
    "appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sales Order {order.id}</DialogTitle>
          <DialogDescription>Update the sales order details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* Order Header Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Order Date (Non-editable) */}
              <div className="space-y-2">
                <Label htmlFor="order-date">Order Date</Label>
                <Input id="order-date" value={format(orderDate, "PPP")} readOnly className="bg-muted" />
              </div>

              {/* Expected Delivery Date (Editable) */}
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

              {/* Client Selection (Non-editable) */}
              <div className="space-y-2">
                <Label htmlFor="client">Client Name</Label>
                <Input id="client" value={customer} readOnly className="bg-muted" />
              </div>

              {/* Reference Selection (Editable) */}
              <div className="space-y-2">
                <Label htmlFor="reference">
                  Reference <span className="text-red-500">*</span>
                </Label>
                <Select value={reference} onValueChange={setReference}>
                  <SelectTrigger id="reference">
                    <SelectValue placeholder="Select reference" />
                  </SelectTrigger>
                  <SelectContent>
                    {
                      references.map(item => <SelectItem key={item.referenceId + ""} value={item.referenceId}>{item.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Purchase Order ID (Non-editable) */}
              <div className="space-y-2">
                <Label htmlFor="po-id">Purchase Order ID</Label>
                <Input id="po-id" value={poId} readOnly className="bg-muted" />
              </div>

              {/* Purchase Order Number (Non-editable) */}
              <div className="space-y-2">
                <Label htmlFor="po-number">Purchase Order Number</Label>
                <Input id="po-number" value={poNumber} readOnly className="bg-muted" />
              </div>

              {/* Purchase Order Date (Non-editable) */}
              <div className="space-y-2">
                <Label htmlFor="po-date">Purchase Order Date</Label>
                <Input
                  id="po-date"
                  value={poDate ? convertDate(poDate) : "Not specified"}
                  readOnly
                  className="bg-muted"
                />
              </div>

              {/* Shipping Address Selection (Editable) */}
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
                        shippingAddresses.length === 0 ? "No addresses available" : "Select shipping address"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingAddresses.map((address) => (
                      <SelectItem key={address.id} value={address.addressId + ''}>
                        {address.name} {address.isDefault && "(Default)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedShippingAddressId && (
                  <div className="mt-2 text-xs text-muted-foreground whitespace-pre-line border p-2 rounded">
                    {shippingAddresses.find((addr) => addr.addressId + '' === selectedShippingAddressId)?.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Remarks (Non-editable) */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" value={remarks} readOnly className="min-h-[80px] bg-muted" />
          </div>

          {/* Order Items Section (Editable) */}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Product Selection - Combobox */}
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
                              ? productCatalog.find((product) => product.productId === selectedProductId)?.name
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
                                {productCatalog.map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={product.productId}
                                    onSelect={(currentValue) => {
                                      setSelectedProductId(currentValue === selectedProductId ? "" : currentValue)
                                      setOpenCombobox(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedProductId === product.productId ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {product.name} - ₹{product.price}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                        className={hideNumberInputArrows}
                      />
                    </div>

                    {/* Price (Auto-populated) */}
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per Case</Label>
                      <Input
                        id="price"
                        value={
                          selectedProductId
                            ? `₹${productCatalog.find((p) => p.id === selectedProductId)?.price.toFixed(2) || "0.00"}`
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
                        setCases("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!selectedProductId || !cases || Number(cases) <= 0}
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
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.length > 0 ? (
                    orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">
                          {item.status === "pending" ? (
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleProductQuantityChange(item.id, Math.max(0, item.cases - 1))}
                              >
                                -
                              </Button>
                              <Input
                                type="number"
                                value={item.cases === 0 ? "" : item.cases}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? 0 : Number.parseInt(e.target.value, 10)
                                  handleProductQuantityChange(item.id, isNaN(value) ? 0 : value)
                                }}
                                className={`w-16 text-center h-6 px-1 ${hideNumberInputArrows}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleProductQuantityChange(item.id, item.cases + 1)}
                              >
                                +
                              </Button>
                            </div>
                          ) : (
                            item.cases
                          )}
                        </TableCell>
                        <TableCell className="text-right">₹{item.pricePerCase.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{item.basePay.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.taxRate}%</TableCell>
                        <TableCell className="text-right">₹{item.taxAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={item.status === "pending" ? "outline" : "secondary"}>
                            {item.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            disabled={item.status !== "pending"}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
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
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {/* Discount Section (Non-editable) */}
                <div className="flex justify-between py-1">
                  <span>Discount:</span>
                  <span>
                    {discountType === "percentage"
                      ? `${discount}% (₹${((subtotal * discount) / 100).toFixed(2)})`
                      : `₹${discount.toFixed(2)}`}
                  </span>
                </div>

                {/* Taxes - Conditional with breakdown (Non-editable) */}
                {taxesEnabled && (
                  <>
                    {isInTelangana ? (
                      <>
                        <div className="flex justify-between py-1">
                          <span>CGST (9%):</span>
                          <span>₹{(taxTotal / 2).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>SGST (9%):</span>
                          <span>₹{(taxTotal / 2).toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between py-1">
                        <span>IGST (18%):</span>
                        <span>₹{taxTotal.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between py-2 font-bold border-t">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
