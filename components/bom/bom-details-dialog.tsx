"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import type { BomType } from "@/types/bom"
import { useInventoryStore } from "@/hooks/use-inventory-store"
import { Download } from "lucide-react"

interface BomDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bom: BomType
}

export function BomDetailsDialog({ open, onOpenChange, bom }: BomDetailsDialogProps) {
  const { getInventoryItemByName } = useInventoryStore()

  const handleExport = () => {
    // Format BOM data for export
    const exportData = {
      bomCode: bom.bomCode,
      productName: bom.productName,
      status: bom.status,
      unitCost: bom.unitCost,
      components: bom.components.map((component) => ({
        materialName: component.materialName,
        type: component.type || "Standard",
        quantity: component.quantity,
        unit: component.unit,
        cost: component.cost,
        stockStatus: getInventoryItemByName(component.materialName)
          ? getInventoryItemByName(component.materialName).quantity >= component.quantity
            ? "In Stock"
            : "Low Stock"
          : "Not Found",
      })),
    }

    // Convert to CSV
    const headers = ["Material Name", "Type", "Quantity", "Unit", "Cost", "Stock Status"]
    const csvContent = [
      `BOM Code: ${exportData.bomCode}`,
      `Product Name: ${exportData.productName}`,
      `Status: ${exportData.status}`,
      `Unit Cost: ₹${exportData.unitCost.toFixed(2)}`,
      "",
      "Components:",
      headers.join(","),
      ...exportData.components.map((comp) =>
        [
          `"${comp.materialName}"`,
          `"${comp.type}"`,
          comp.quantity,
          comp.unit,
          `₹${comp.cost.toFixed(2)}`,
          `"${comp.stockStatus}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bom-${exportData.bomCode}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {bom.productName}
            <Badge variant={bom.status === "active" ? "default" : "secondary"}>
              {bom.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
          <DialogDescription>BOM Code: {bom.bomCode}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Product Name</h4>
              <p className="text-lg font-semibold">{bom.productName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Unit Cost</h4>
              <p className="text-lg font-semibold">₹{bom.unitCost.toFixed(2)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-base font-medium mb-3">Components</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Stock Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bom.components.map((component, index) => {
                  const inventoryItem = getInventoryItemByName(component.materialName)
                  const stockStatus = inventoryItem
                    ? inventoryItem.quantity >= component.quantity
                      ? "In Stock"
                      : "Low Stock"
                    : "Not Found"

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{component.materialName}</TableCell>
                      <TableCell>{component.type || "Standard"}</TableCell>
                      <TableCell>{component.quantity}</TableCell>
                      <TableCell>{component.unit}</TableCell>
                      <TableCell>₹{component.cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            stockStatus === "In Stock"
                              ? "outline"
                              : stockStatus === "Low Stock"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {stockStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleExport} className="mr-2">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
