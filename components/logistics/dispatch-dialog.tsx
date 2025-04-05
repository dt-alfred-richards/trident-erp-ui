"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DataByTableName } from "../utils/api"
import { LogisticsOrder, useLogisticsData } from "@/hooks/use-logistics-data"
import { lodashGet } from "../common/generic"
import { createType } from "../utils/generic"

// Define the product type if not already defined elsewhere
interface Product {
  id: string
  name: string
  sku: string
  quantity: number // Total order quantity
  allocated?: number
  dispatched?: number,
  selected: boolean
}

interface DispatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: LogisticsOrder
}

interface SelectedProduct {
  id: string
  quantity: number
  maxQuantity: number
  isSelected: boolean
}



type LogisticsOrdersDetails = {
  id: number,
  orderId: string,
  productId: string,
  orderQuantity: number,
  allocated: number,
  dispatchQuantity: number,
  createdOn: number,
  modifiedOn: number,
  createdBy: string,
  modifiedBy: string
}

export function DispatchDialog({ open, onOpenChange, order }: DispatchDialogProps) {
  // Mock products data since it's not available in the order object
  const { productInfo, triggerRender, vehicles = {} } = useLogisticsData();
  const [orderProducts, set_OrderProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])

  // Mock data for vehicles
  const mockVehicles = useMemo(() => Object.values(vehicles).map(item => ({ value: item.vehicleId, label: item.vehicleNumber })), [vehicles])
  useEffect(() => {
    if (!order.id) return;

    const logisticsOrders = new DataByTableName('fact_logistics_order');

    logisticsOrders.getby({ column: 'orderId', value: order.id }).then((res) => {
      const data = lodashGet({ data: res, path: 'data.data' }) || []
      set_OrderProducts(data.map((item: LogisticsOrdersDetails) => {
        const { brand, sku } = productInfo[item.productId];
        return {
          id: item.productId,
          name: brand,
          quantity: item.orderQuantity,
          allocated: item.allocated,
          sku,
          dispatched: item.dispatchQuantity,
          selected: false
        } as Product
      }))
    }).catch(error => {
      console.log({ error })
    })

  }, [order, open])

  // Vehicle ID field
  const [vehicleId, setVehicleId] = useState("")
  const [customVehicleId, setCustomVehicleId] = useState("")
  const [isCustomVehicle, setIsCustomVehicle] = useState(false)
  const [vehicleOpen, setVehicleOpen] = useState(false)

  // Driver information fields (now simple text inputs)
  const [driverName, setDriverName] = useState("")
  const [contactNumber, setContactNumber] = useState("")

  // Delivery information
  const [deliveryAddress, setDeliveryAddress] = useState(order.shipmentId || "")
  const [deliveryNote, setDeliveryNote] = useState("")

  // Reset selections when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedProducts([])
      setVehicleId("")
      setCustomVehicleId("")
      setIsCustomVehicle(false)
      setDriverName("")
      setContactNumber("")
      setDeliveryNote("")
    }
    onOpenChange(open)
  }

  const handleCheckboxChange = useCallback((productId: string, checked: boolean) => {
    set_OrderProducts(prev => {
      const updated = [...prev];

      updated.forEach(item => {
        if (item.id === productId) {
          item.selected = checked
        }
      })

      return updated;
    })
  }, [productInfo, set_OrderProducts])

  const handleQuantityChange = useCallback((productId: string, quantity: number) => {
    const product = orderProducts.find((p) => p.id === productId)

    set_OrderProducts(prev => {
      const updated = [...prev];
      updated.forEach(item => {
        if (item.id === productId && quantity <= item.quantity) {
          item.dispatched = quantity;
          item.allocated = Math.abs(item.quantity - item.dispatched)
        }
      })
      return updated;
    })
  }, [productInfo, orderProducts])

  const effectiveVehicleId = useMemo(() => isCustomVehicle ? customVehicleId : vehicleId, [isCustomVehicle, vehicleId])


  const validateDispatchFields = useCallback((fields: {
    hasProductsToDispatch?: boolean;
    deliveryAddress?: string;
    effectiveVehicleId?: string;
    driverName?: string;
    contactNumber?: string;
  }): string | null => {
    const fieldLabels: Record<string, string> = {
      hasProductsToDispatch: "Products to dispatch",
      deliveryAddress: "Delivery address",
      effectiveVehicleId: "Vehicle ID",
      driverName: "Driver name",
      contactNumber: "Contact number"
    };

    const missingFields: string[] = [];

    if (!fields.hasProductsToDispatch) missingFields.push(fieldLabels.hasProductsToDispatch);
    if (!fields.deliveryAddress) missingFields.push(fieldLabels.deliveryAddress);
    if (!fields.effectiveVehicleId) missingFields.push(fieldLabels.effectiveVehicleId);
    if (!fields.driverName) missingFields.push(fieldLabels.driverName);
    if (!fields.contactNumber) missingFields.push(fieldLabels.contactNumber);

    if (missingFields.length > 0) {
      return `Please provide the following: ${missingFields.join(", ")}`;
    }

    return null; // Everything is present
  }, [contactNumber, driverName, deliveryAddress, effectiveVehicleId])

  const handleSubmit = useCallback(() => {

    if (validateDispatchFields({ contactNumber, deliveryAddress, driverName, effectiveVehicleId, hasProductsToDispatch })) {
      alert(validateDispatchFields({ contactNumber, deliveryAddress, driverName, effectiveVehicleId, hasProductsToDispatch }))
      return;
    }

    const selected = orderProducts.filter(item => item.selected);

    const instance = new DataByTableName("fact_logistics");
    const orders = new DataByTableName("fact_logistics_order");

    instance.patch({ key: 'orderId', value: order.id }, {
      status: "dispatched",
      vehicleId,
      driverName,
      contactNumber,
      deliveryAddress,
      deliveryNote
    }).then(_ => {
      return Promise.allSettled([
        selected.map(item => orders.patch({ key: "productId", value: item.id }, { dispatchQuantity: item.dispatched, allocated: item.allocated }))
      ])
    }).then(() => {
      setContactNumber("");
      setDriverName("")
      setDeliveryAddress("");
      setDeliveryNote("")
      triggerRender()
      onOpenChange(false)
    }).catch(error => {
      console.log({ error })
    })
  }, [order, orderProducts, contactNumber, driverName, deliveryAddress, effectiveVehicleId])

  // Check if any products are selected and have a dispatch quantity greater than 0
  const hasProductsToDispatch = useMemo(() => orderProducts.filter(item => item.selected).some((p) => p.selected && p.quantity > 0), [orderProducts])


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Dispatch Order {order.id}</DialogTitle>
          <DialogDescription>Select products to dispatch and enter logistics details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product selection table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Total Order Qty</TableHead>
                  <TableHead className="text-right">Allocated Qty</TableHead>
                  <TableHead className="text-right">Ready to Dispatch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderProducts.length > 0 ? (
                  orderProducts.map((product) => {
                    const allocated = product.allocated || 0
                    const dispatched = product.dispatched || 0
                    const isSelected = product.selected

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleCheckboxChange(product.id, checked === true)}
                            disabled={allocated <= 0}
                          />
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">{allocated}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min={0}
                            max={allocated}
                            value={product.dispatched}
                            onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 0)}
                            className="w-20 ml-auto"
                            disabled={!isSelected}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Loading products or no products available for this order...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Vehicle and Driver info */}
          <div className="grid gap-4">
            {/* Vehicle ID Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vehicle" className="text-right">
                Vehicle ID
              </Label>
              <div className="col-span-3">
                {isCustomVehicle ? (
                  <div className="flex gap-2">
                    <Input
                      id="customVehicle"
                      placeholder="Enter new vehicle ID"
                      value={customVehicleId}
                      onChange={(e) => setCustomVehicleId(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={() => setIsCustomVehicle(false)} type="button">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={vehicleOpen}
                        className="w-full justify-between"
                      >
                        {vehicleId
                          ? mockVehicles.find((vehicle) => vehicle.value === vehicleId)?.label
                          : "Select vehicle..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search vehicle..." />
                        <CommandList>
                          <CommandEmpty>No vehicle found.</CommandEmpty>
                          <CommandGroup>
                            {mockVehicles.map((vehicle) => (
                              <CommandItem
                                key={vehicle.value}
                                value={vehicle.value}
                                onSelect={(currentValue) => {
                                  setVehicleId(currentValue === vehicleId ? "" : currentValue)
                                  setVehicleOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    vehicleId === vehicle.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {vehicle.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                setIsCustomVehicle(true)
                                setVehicleOpen(false)
                              }}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add new vehicle
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            {/* Driver Name Field (now a simple text input) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driver" className="text-right">
                Driver Name
              </Label>
              <Input
                id="driver"
                placeholder="Enter driver name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Contact Number Field (new) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">
                Contact Number
              </Label>
              <Input
                id="contact"
                placeholder="Enter contact number"
                type="number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Delivery Address */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="address" className="text-right pt-2">
                Delivery Address
              </Label>
              <Textarea
                id="address"
                placeholder="Delivery address"
                className="col-span-3"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
              />
            </div>

            {/* Delivery Note */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="note" className="text-right pt-2">
                Delivery Note
              </Label>
              <Textarea
                id="note"
                placeholder="Special delivery instructions or notes"
                className="col-span-3"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
          >
            Mark as Dispatched
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

