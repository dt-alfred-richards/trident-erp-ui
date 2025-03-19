"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function OpenPurchaseOrders() {
  // This would come from your API in a real application
  const openPOs = [
    {
      id: "PO-001",
      supplier: "PlastiCorp Inc.",
      material: "Plastic Resin",
      quantity: 500,
      unit: "kg",
      orderDate: "2023-06-01",
      expectedDelivery: "2023-06-08",
      status: "sent",
    },
    {
      id: "PO-002",
      supplier: "CapMakers Ltd.",
      material: "Bottle Caps",
      quantity: 10000,
      unit: "pcs",
      orderDate: "2023-06-02",
      expectedDelivery: "2023-06-09",
      status: "partial",
      received: 5000,
    },
    {
      id: "PO-003",
      supplier: "Adhesive Solutions",
      material: "Label Adhesive",
      quantity: 100,
      unit: "liters",
      orderDate: "2023-06-03",
      expectedDelivery: "2023-06-10",
      status: "sent",
    },
  ]

  // Make sure openPOs is not null or undefined
  if (!openPOs || openPOs.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No open purchase orders</div>
  }

  const getStatusBadge = (status: string, received?: number, quantity?: number) => {
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
            Partial ({received}/{quantity})
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
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO #</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Expected Delivery</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {openPOs.map((po) => (
            <TableRow key={po.id}>
              <TableCell className="font-medium">{po.id}</TableCell>
              <TableCell>{po.supplier}</TableCell>
              <TableCell>
                {po.material} ({po.quantity} {po.unit})
              </TableCell>
              <TableCell>{po.expectedDelivery}</TableCell>
              <TableCell>{getStatusBadge(po.status, po.received, po.quantity)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    {po.status === "sent" ? "Receive" : "View"}
                  </Button>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

