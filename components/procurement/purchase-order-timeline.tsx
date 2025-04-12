"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, Package, Send, ShieldCheck, Truck } from "lucide-react"

export function PurchaseOrderTimeline() {
  const [selectedPO, setSelectedPO] = useState<string>("PO-001")

  // This would come from your API in a real application
  const purchaseOrders = [
    { id: "PO-001", supplier: "PlastiCorp Inc.", material: "Plastic Resin" },
    { id: "PO-002", supplier: "CapMakers Ltd.", material: "Bottle Caps" },
    { id: "PO-003", supplier: "Adhesive Solutions", material: "Label Adhesive" },
  ]

  // This would come from your API in a real application
  const poDetails = {
    "PO-001": {
      id: "PO-001",
      supplier: "PlastiCorp Inc.",
      material: "Plastic Resin",
      quantity: 500,
      unit: "kg",
      unitPrice: 2.5,
      totalPrice: 1250,
      orderDate: "2023-06-01",
      expectedDelivery: "2023-06-08",
      status: "shipped",
      timeline: [
        {
          status: "created",
          date: "2023-06-01",
          time: "09:15 AM",
          note: "Purchase order created by John Smith",
          completed: true,
        },
        {
          status: "sent",
          date: "2023-06-01",
          time: "10:30 AM",
          note: "PO sent to supplier via email",
          completed: true,
        },
        {
          status: "confirmed",
          date: "2023-06-02",
          time: "11:45 AM",
          note: "Order confirmed by supplier",
          completed: true,
        },
        {
          status: "shipped",
          date: "2023-06-05",
          time: "02:30 PM",
          note: "Order shipped by supplier (Tracking: TRK-12345)",
          completed: true,
        },
        {
          status: "received",
          date: "",
          time: "",
          note: "Pending delivery",
          completed: false,
        },
        {
          status: "quality_check",
          date: "",
          time: "",
          note: "Pending quality inspection",
          completed: false,
        },
      ],
    },
    "PO-002": {
      id: "PO-002",
      supplier: "CapMakers Ltd.",
      material: "Bottle Caps",
      quantity: 10000,
      unit: "pcs",
      unitPrice: 0.05,
      totalPrice: 500,
      orderDate: "2023-06-02",
      expectedDelivery: "2023-06-09",
      status: "partial",
      timeline: [
        {
          status: "created",
          date: "2023-06-02",
          time: "11:20 AM",
          note: "Purchase order created by Sarah Johnson",
          completed: true,
        },
        {
          status: "sent",
          date: "2023-06-02",
          time: "01:15 PM",
          note: "PO sent to supplier via email",
          completed: true,
        },
        {
          status: "confirmed",
          date: "2023-06-03",
          time: "09:30 AM",
          note: "Order confirmed by supplier",
          completed: true,
        },
        {
          status: "shipped",
          date: "2023-06-04",
          time: "10:45 AM",
          note: "Partial shipment (5000 pcs) shipped by supplier (Tracking: TRK-12346)",
          completed: true,
        },
        {
          status: "received",
          date: "2023-06-06",
          time: "02:15 PM",
          note: "Partial shipment (5000 pcs) received",
          completed: true,
        },
        {
          status: "quality_check",
          date: "2023-06-06",
          time: "03:30 PM",
          note: "Quality check passed for received items",
          completed: true,
        },
      ],
    },
    "PO-003": {
      id: "PO-003",
      supplier: "Adhesive Solutions",
      material: "Label Adhesive",
      quantity: 100,
      unit: "liters",
      unitPrice: 8.75,
      totalPrice: 875,
      orderDate: "2023-06-03",
      expectedDelivery: "2023-06-10",
      status: "sent",
      timeline: [
        {
          status: "created",
          date: "2023-06-03",
          time: "02:45 PM",
          note: "Purchase order created by Mike Williams",
          completed: true,
        },
        {
          status: "sent",
          date: "2023-06-03",
          time: "04:30 PM",
          note: "PO sent to supplier via email",
          completed: true,
        },
        {
          status: "confirmed",
          date: "",
          time: "",
          note: "Awaiting confirmation from supplier",
          completed: false,
        },
        {
          status: "shipped",
          date: "",
          time: "",
          note: "Pending shipment",
          completed: false,
        },
        {
          status: "received",
          date: "",
          time: "",
          note: "Pending delivery",
          completed: false,
        },
        {
          status: "quality_check",
          date: "",
          time: "",
          note: "Pending quality inspection",
          completed: false,
        },
      ],
    },
  }

  const selectedPoDetails = selectedPO ? poDetails[selectedPO as keyof typeof poDetails] : undefined

  const getStatusIcon = (status: string, completed: boolean) => {
    if (!completed) {
      return <Clock className="h-6 w-6 text-gray-400" />
    }

    switch (status) {
      case "created":
        return <CheckCircle2 className="h-6 w-6 text-blue-500" />
      case "sent":
        return <Send className="h-6 w-6 text-blue-500" />
      case "confirmed":
        return <CheckCircle2 className="h-6 w-6 text-blue-500" />
      case "shipped":
        return <Truck className="h-6 w-6 text-blue-500" />
      case "received":
        return <Package className="h-6 w-6 text-green-500" />
      case "quality_check":
        return <ShieldCheck className="h-6 w-6 text-green-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Sent
          </Badge>
        )
      case "partial":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Partially Received
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Shipped
          </Badge>
        )
      case "received":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Received
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <Label htmlFor="po-select" className="mb-2 block">
            Purchase Order
          </Label>
          <Select value={selectedPO} onValueChange={setSelectedPO}>
            <SelectTrigger id="po-select">
              <SelectValue placeholder="Select PO" />
            </SelectTrigger>
            <SelectContent>
              {purchaseOrders.map((po) => (
                <SelectItem key={po.id} value={po.id}>
                  {po.id} - {po.supplier} ({po.material})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedPoDetails && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{selectedPoDetails.id}</CardTitle>
                <CardDescription>
                  {selectedPoDetails.supplier} - {selectedPoDetails.material}
                </CardDescription>
              </div>
              {getStatusBadge(selectedPoDetails.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">
                  {selectedPoDetails.quantity} {selectedPoDetails.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit Price</p>
                <p className="font-medium">
                  ${selectedPoDetails.unitPrice.toFixed(2)}/{selectedPoDetails.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="font-medium">${selectedPoDetails.totalPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Delivery</p>
                <p className="font-medium">{new Date(selectedPoDetails.expectedDelivery).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Order Timeline</h3>
              <div className="relative">
                <div className="absolute left-3.5 top-0 h-full w-px bg-border" />
                <div className="space-y-8">
                  {selectedPoDetails.timeline.map((event, index) => (
                    <div key={index} className="relative flex gap-4">
                      <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-background">
                        {getStatusIcon(event.status, event.completed)}
                      </div>
                      <div className="flex-1 pl-12">
                        <div className="font-semibold capitalize">{event.status.replace("_", " ")}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.completed ? `${event.date} at ${event.time}` : "Pending"}
                        </div>
                        <div className="mt-1 text-sm">{event.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Print PO</Button>
            <Button>
              {selectedPoDetails.status === "shipped"
                ? "Receive Order"
                : selectedPoDetails.status === "sent"
                  ? "Mark as Shipped"
                  : "View Details"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
