"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle } from "lucide-react"

interface StockReservationSummaryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: {
    items: Array<{
      orderId: string
      sku: string
      customer: string
      allocated: number
      requested: number
    }>
    stockBefore: Record<string, number>
    stockAfter: Record<string, number>
  }
}

export function StockReservationSummary({ open, onOpenChange, data }: StockReservationSummaryProps) {
  // Group allocations by SKU
  const skuAllocations: Record<string, number> = {}
  data.items.forEach((item) => {
    if (!skuAllocations[item.sku || ""]) {
      skuAllocations[item.sku || ""] = 0
    }
    skuAllocations[item.sku || ""] += item.allocated
  })

  const timestamp = new Date().toLocaleString()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Stock Reserved Successfully
          </DialogTitle>
          <DialogDescription>The following stock has been reserved for the selected orders.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Allocated Orders</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.orderId}>
                    <TableCell className="font-medium">{item.orderId}</TableCell>
                    <TableCell>{item.customer}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="text-right">{item.allocated.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {item.allocated < item.requested ? (
                        <span className="text-amber-600 font-medium">
                          {item.allocated.toLocaleString()}/{item.requested.toLocaleString()}
                        </span>
                      ) : (
                        <span>{item.requested.toLocaleString()}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Stock Update</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Previous Stock</TableHead>
                  <TableHead className="text-right">Reserved</TableHead>
                  <TableHead className="text-right">Remaining Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(skuAllocations).map(([sku, allocated]) => (
                  <TableRow key={sku}>
                    <TableCell className="font-medium">{sku}</TableCell>
                    <TableCell className="text-right">{data.stockBefore[sku]?.toLocaleString() || 0}</TableCell>
                    <TableCell className="text-right text-amber-600 font-medium">
                      -{allocated.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {data.stockAfter[sku]?.toLocaleString() || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Allocation completed on {timestamp}</p>
            <p>User: Production Manager</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
