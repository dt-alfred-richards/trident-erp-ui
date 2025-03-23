"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { add, format } from "date-fns"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from 'uuid';
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
import { FactSales, OrderDetails } from "./sales-dashboard"
import { DataByTableName } from "../utils/api"
import { useOrders } from "@/contexts/order-context"

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

type ClientType = {
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

export function CreateSalesOrderDialog({ open, onOpenChange }: CreateSalesOrderDialogProps) {
  // Order header state
  const { clientInfo, productInfo, clientAddress = {}, clientProposedPrice = {}, setRefetchData } = useOrders()

  const [orderDate] = useState<Date>(new Date()) // Remove setOrderDate since it's now fixed
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<Date | undefined>(undefined)
  const [clientId, setClientId] = useState("")
  const [reference, setReference] = useState("")
  const [poDate, setPoDate] = useState<Date | undefined>(undefined)
  const [poId, setPoId] = useState("")
  const [remarks, setRemarks] = useState("")
  const products = useMemo(() => {
    return Object.values(productInfo).map(product => ({
      id: product.productId, name: product.brand, price: clientProposedPrice[product.productId]?.proposedPrice, taxRate: 0
    }))
  }, [productInfo])


  const clients = useMemo(() => {
    return Object.values(clientInfo).map(client => {
      if (!clientAddress) return
      const address = clientAddress[client.clientId] ?? []
      if (address.length > 0) {
        console.log({ address })
      }
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

  // Item entry state
  const [showItemForm, setShowItemForm] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [cases, setCases] = useState("")

  // Order items state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // Order summary state
  const [subtotal, setSubtotal] = useState(0)
  const [taxTotal, setTaxTotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [total, setTotal] = useState(0)

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false)

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

  // Calculate order summary whenever items change
  useEffect(() => {
    const newSubtotal = orderItems.reduce((sum, item) => sum + item.basePay, 0)
    const newTaxTotal = orderItems.reduce((sum, item) => sum + item.taxAmount, 0)

    setSubtotal(newSubtotal)
    setTaxTotal(newTaxTotal)
    setTotal(newSubtotal + newTaxTotal - discount)
  }, [orderItems, discount])

  // Handle adding a new item to the order
  const handleAddItem = () => {
    if (!selectedProductId || !cases || Number(cases) <= 0) {
      return
    }

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const quantity = Number(cases)
    const basePay = product.price * quantity
    const taxAmount = (basePay * product.taxRate) / 100

    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      cases: quantity,
      pricePerCase: product.price,
      taxRate: product.taxRate,
      basePay,
      taxAmount,
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

  // Handle discount change
  const handleDiscountChange = (value: string) => {
    const newDiscount = value === "" ? 0 : Number(value)
    if (newDiscount >= 0) {
      setDiscount(newDiscount)
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    setShowConfirmation(true)
  }

  const dateConverter = (date: Date | undefined) => {
    if (!date) return "";
    return date.toISOString().split("T")[0]
  }

  const orderId = useMemo(() => {
    return uuidv4()
  }, [orderItems, clientId])

  // Handle final submission after confirmation
  const handleConfirmedSubmit = useCallback(() => {
    // Get the selected shipping address details
    const selectedAddress = shippingAddresses.find((addr) => addr.id === selectedShippingAddressId)
    const salesPayload: Partial<FactSales> = {
      "amount": total,
      "clientId": clientId,
      "date": dateConverter(orderDate),
      "expectedDeliveryDate": new Date().getTime(),
      "invoiceNumber": "",
      "numOrders": 0,
      "poDate": poDate?.getTime(),
      poId,
      "poNumber": "",
      "referenceName": reference,
      "remarks": "",
      "status": "pending_approval"
    }
    const factSalesInstance = new DataByTableName("fact_sales");
    const orderDetailsInstance = new DataByTableName("order_details");

    const orderDetailsPayload = orderItems.map(order => ({
      cases: order.cases,
      casesDelivered: 0,
      casesReserved: 0,
      clientId,
      expectedDeliveryDate,
      productId: order.productId,
      addressId: selectedAddress?.id,
      status: "pending_approval",
      tradePrice: order.pricePerCase
    } as OrderDetails))

    factSalesInstance.post(salesPayload).then(res => {
      const createdId = res?.data[0]?.orderId ?? "";
      if (createdId) {
        const orderPayload = orderDetailsPayload.map(item => ({ ...item, orderId: createdId }))
        return orderDetailsInstance.post(orderPayload)
      } else {
        throw new Error("Order id is not created")
      }
    }).then(() => {
      resetForm();
    })
      .catch(error => {
        alert(error.message)
      })
  }, [orderItems, clientId, reference, selectedProductId, orderId])

  // Reset the form to initial state
  const resetForm = () => {
    // No need to reset orderDate as it's always today
    setClientId("")
    setReference("")
    setExpectedDeliveryDate(undefined)
    setPoDate(undefined)
    setPoId("")
    setRemarks("")
    setOrderItems([])
    setDiscount(0)
    setShowItemForm(false)
    setSelectedProductId("")
    setCases("")
    setShippingAddresses([])
    setSelectedShippingAddressId("")
    onOpenChange(false)
    setRefetchData(p => !p)
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
                  <Select value={clientId} onValueChange={value => {
                    setClientId(value)
                  }}>
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={`key_ ${client?.id ?? ""}`} value={client?.id ?? ""}>
                          {client?.name ?? ""}
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
                      <Calendar mode="single" selected={poDate} onSelect={setPoDate} initialFocus />
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Product Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="product">Product</Label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                          <SelectTrigger id="product">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
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
                              ? `₹${products.find((p) => p.id === selectedProductId)?.price.toFixed(2) || "0.00"}`
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
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.length > 0 ? (
                      orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.cases}</TableCell>
                          <TableCell className="text-right">₹{item.pricePerCase.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{item.basePay.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{item.taxRate}%</TableCell>
                          <TableCell className="text-right">₹{item.taxAmount.toFixed(2)}</TableCell>
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
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Taxes:</span>
                    <span>₹{taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 items-center">
                    <span>Discount:</span>
                    <div className="flex items-center gap-2">
                      <span>₹</span>
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                        className="w-24 h-8 text-right"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between py-2 font-bold border-t">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
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
              disabled={!orderDate || !clientId || !reference || orderItems.length === 0}
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

