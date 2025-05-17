"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Package, Phone, Truck, User } from "lucide-react"

interface ShipmentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
}

export function ShipmentDetailsDialog({ open, onOpenChange, order }: ShipmentDetailsDialogProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Shipment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Order Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium">{order.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={order.status} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Customer</p>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Order Date</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Details */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Product Details</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price Per Unit</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{order.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{order.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${order.pricePerUnit?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell className="text-right">
                    ${(order.quantity * (order.pricePerUnit || 0)).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Shipping Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Shipping Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Carrier</p>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>{order.carrier || "Not assigned"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tracking</p>
                {order.trackingId ? (
                  <div className="text-blue-600 underline cursor-pointer">{order.trackingId}</div>
                ) : (
                  <span className="text-muted-foreground">Not available</span>
                )}
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-muted-foreground">Shipping Address</p>
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>123 Shipping Lane, Delivery City, DC 12345</span>
                </div>
              </div>
              {order.deliveryDate && (
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-muted-foreground">Delivery Date</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(order.deliveryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Vehicle Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vehicle ID</p>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span>{order.vehicleId || "Not assigned"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Driver Name</p>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{order.driverName || "Not assigned"}</span>
                </div>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.contactNumber || "Not available"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
