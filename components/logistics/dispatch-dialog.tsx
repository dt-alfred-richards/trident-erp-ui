"use client"

import { useState, useEffect, useMemo } from "react"
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
import { useOrders } from "@/contexts/order-context"
import { useVehicleContext } from "./vehicle-context"
import { Logistics, useLogistics } from "@/app/logistics/shipment-tracking/logistics-context"
import { getChildObject } from "../generic"

// Define the product type if not already defined elsewhere
interface Product {
  id: string
  name: string
  sku: string
  cases: number // Total order quantity
  allocated?: number
  dispatched?: number
}

interface DispatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: {
    id: string
    customer: string
    deliveryAddress?: string
    // Products might not be available in the original order object
  }
  onDispatchComplete?: (orderId: string, updatedOrder: any) => void
}

interface SelectedProduct {
  id: string
  dispatchQuantity: number
  allocated: number
  isSelected: boolean
  sku: string,
  cases: number
}

export function DispatchDialog({ open, onOpenChange, order, onDispatchComplete }: DispatchDialogProps) {
  // Mock products data since it's not available in the order object
  const { orders, updateOrder } = useOrders()
  const { vehicles, drivers } = useVehicleContext()
  const { create: createLogistics, update: updateLogistics } = useLogistics()

  const saleOrder = useMemo(() => {
    return orders.find(item => item.id === order.id)
  }, [orders])

  // Mock data for vehicles
  const mockVehicles = useMemo(() => {
    return vehicles.map(item => ({ value: item.id + '', label: `${item.vehicleId} - ${item.model}` }))
  }, [vehicles])
  const mockDrivers = useMemo(() => {
    return drivers.map(item => ({ value: item.id + '', label: `${item.driverId} - ${item.fullName}` }))
  }, [drivers])

  const [orderProducts, set_OrderProducts] = useState<Product[]>([])
  useEffect(() => {
    if (!saleOrder) return
    set_OrderProducts((saleOrder?.products || []).map(item => ({
      id: item.id,
      name: item.name,
      cases: item.cases,
      allocated: item.allocated,
      sku: item.sku,
      dispatched: 0
    } as Product)))
  }, [saleOrder])

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])

  // Vehicle ID field
  const [vehicleId, setVehicleId] = useState("")
  const [customVehicleId, setCustomVehicleId] = useState("")
  const [isCustomVehicle, setIsCustomVehicle] = useState(false)
  const [vehicleOpen, setVehicleOpen] = useState(false)

  // Driver ID field
  const [driverId, setDriverId] = useState("")
  const [customDriverName, setCustomDriverName] = useState("")
  const [isCustomDriver, setIsCustomDriver] = useState(false)
  const [driverOpen, setDriverOpen] = useState(false)

  // Contact Number Field (new)
  const [contactNumber, setContactNumber] = useState("")

  // Delivery information
  const [deliveryAddress, setDeliveryAddress] = useState(order.deliveryAddress || "")
  const [deliveryNote, setDeliveryNote] = useState("")

  // Simulate fetching products for this order when the dialog opens
  useEffect(() => {
    if (open) {
      // Auto-fill delivery address from order
      if (order.deliveryAddress) {
        setDeliveryAddress(order.deliveryAddress)
      } else {
        // Fallback to a mock address if not available in the order
        setDeliveryAddress("123 Customer Street, Customer City, 123456")
      }
    }
  }, [open, order.id, order.deliveryAddress])

  // Reset selections when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedProducts([])
      setVehicleId("")
      setCustomVehicleId("")
      setIsCustomVehicle(false)
      setDriverId("")
      setCustomDriverName("")
      setIsCustomDriver(false)
      setContactNumber("")
      setDeliveryNote("")
    }
    onOpenChange(open)
  }

  // Initialize selected products with all dispatchable products
  useEffect(() => {
    if (open && orderProducts.length > 0) {
      const initialSelected: SelectedProduct[] = orderProducts.map((product) => {
        return {
          id: product.id,
          sku: product.sku,
          allocated: product.allocated || 0,
          cases: product.cases,
          dispatchQuantity: 0,
          isSelected: false
        }
      })

      setSelectedProducts(initialSelected)
    }
  }, [open, orderProducts])

  const handleCheckboxChange = (productId: string, checked: boolean) => {
    setSelectedProducts(
      selectedProducts.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            isSelected: checked,
            // Reset quantity to max if being selected, keep current if just being unselected
            dispatchQuantity: checked ? p.allocated : p.dispatchQuantity,
          }
        }
        return p
      }),
    )
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = orderProducts.find((p) => p.id === productId)
    const allocated = product?.allocated || 0

    setSelectedProducts(
      selectedProducts.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            dispatchQuantity: quantity, // Ensure between 0 and allocated
          }
        }
        return p
      }),
    )
  }

  const handleSubmit = () => {
    const payload = {
      id: getChildObject(order, "logisticsId", ""),
      contactNumber,
      deliveryAddress,
      deliveryNote,
      products: JSON.stringify(selectedProducts.filter(item => item.isSelected).map(item => ({
        sku: item.sku,
        totatOrderQuantity: item.cases,
        allocatedQuantity: item.allocated,
        dispatchQuantity: item.dispatchQuantity
      }))),
      status: "dispatched",
      vehicle: vehicleId,
      driver: driverId,
      orderId: order.id
    } as Partial<Logistics>

    updateLogistics(payload).then(() => {
      onOpenChange(false)
    })
  }

  // Check if any products are selected and have a dispatch quantity greater than 0
  const hasProductsToDispatch = selectedProducts.some((p) => p.isSelected && p.dispatchQuantity > 0)

  // Get the effective vehicle ID (either selected or custom)
  const effectiveVehicleId = isCustomVehicle ? customVehicleId : vehicleId

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Dispatch Order {order.id}</DialogTitle>
          <DialogDescription>Select products to dispatch and enter logistics details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-1 max-h-[calc(90vh-180px)]">
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
                    const available = allocated - dispatched
                    const selectedProduct = selectedProducts.find((p) => p.id === product.id)
                    const isSelected = selectedProduct?.isSelected || false

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleCheckboxChange(product.id, checked === true)}
                          // disabled={allocated <= 0}
                          />
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell className="text-right">{product.cases}</TableCell>
                        <TableCell className="text-right">{allocated}</TableCell>
                        <TableCell className="text-right">
                          {1 > 0 ? (
                            <Input
                              type="number"
                              min={0}
                              max={allocated}
                              value={selectedProduct?.dispatchQuantity || 0}
                              onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 0)}
                              className="w-20 ml-auto"
                              disabled={!isSelected}
                            />
                          ) : (
                            "0"
                          )}
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

            {/* Driver Name Field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="driver" className="text-right">
                Driver Name
              </Label>
              <div className="col-span-3">
                {isCustomDriver ? (
                  <div className="flex gap-2">
                    <Input
                      id="customDriver"
                      placeholder="Enter external driver name"
                      value={customDriverName}
                      onChange={(e) => setCustomDriverName(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={() => setIsCustomDriver(false)} type="button">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Popover open={driverOpen} onOpenChange={setDriverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={driverOpen}
                        className="w-full justify-between"
                      >
                        {driverId ? mockDrivers.find((driver) => driver.value === driverId)?.label : "Select driver..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search driver..." />
                        <CommandList>
                          <CommandEmpty>No driver found.</CommandEmpty>
                          <CommandGroup>
                            {mockDrivers.map((driver) => (
                              <CommandItem
                                key={driver.value}
                                value={driver.value}
                                onSelect={(currentValue) => {
                                  setDriverId(currentValue === driverId ? "" : currentValue)
                                  setDriverOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    driverId === driver.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {driver.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => {
                                setIsCustomDriver(true)
                                setDriverOpen(false)
                              }}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add external driver
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            {/* Contact Number Field (new) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">
                Contact Number
              </Label>
              <Input
                id="contact"
                placeholder="Enter contact number"
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

        <DialogFooter className="flex justify-between gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            // disabled={
            //   !hasProductsToDispatch ||
            //   !deliveryAddress ||
            //   !effectiveVehicleId ||
            //   !(isCustomDriver ? customDriverName : driverId) ||
            //   !contactNumber ||
            //   (isCustomVehicle && !customVehicleId)
            // }
            className="bg-[#725af2] text-white hover:bg-[#5e48d0]"
          >
            Mark as Dispatched
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
