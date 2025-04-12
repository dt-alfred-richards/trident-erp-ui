"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search } from "lucide-react"

interface SelectPurchaseOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPOSelected: (poId: string) => void
}

export function SelectPurchaseOrderDialog({ open, onOpenChange, onPOSelected }: SelectPurchaseOrderDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPO, setSelectedPO] = useState<string | null>(null)

  // This would come from your API in a real application
  const pendingPOs = [
    {
      id: "PO-001",
      supplier: "PlastiCorp Inc.",
      material: "Plastic Resin",
      quantity: 500,
      unit: "kg",
      status: "pending",
      date: "2023-03-15",
    },
    {
      id: "PO-002",
      supplier: "CapMakers Ltd.",
      material: "Bottle Caps",
      quantity: 10000,
      unit: "pcs",
      status: "partial",
      received: 5000,
      date: "2023-03-10",
    },
    {
      id: "PO-003",
      supplier: "Adhesive Solutions",
      material: "Label Adhesive",
      quantity: 100,
      unit: "liters",
      status: "pending",
      date: "2023-03-05",
    },
  ]

  const filteredPOs = pendingPOs.filter(
    (po) =>
      po.status === "pending" ||
      (po.status === "partial" &&
        (po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          po.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          po.material.toLowerCase().includes(searchQuery.toLowerCase()))),
  )

  const handleSubmit = () => {
    if (selectedPO) {
      onPOSelected(selectedPO)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Purchase Order</DialogTitle>
          <DialogDescription>Choose a purchase order to receive goods for</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by PO #, supplier or material..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="border rounded-md">
            <RadioGroup value={selectedPO || ""} onValueChange={setSelectedPO} className="divide-y">
              {filteredPOs.length > 0 ? (
                filteredPOs.map((po) => (
                  <div key={po.id} className="p-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={po.id} id={po.id} />
                      <Label htmlFor={po.id} className="flex-1 cursor-pointer">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          <div className="font-medium">{po.id}</div>
                          <div className="text-sm text-muted-foreground">{po.date}</div>
                          <div>{po.material}</div>
                          <div className="text-sm text-muted-foreground">{po.supplier}</div>
                          <div className="text-sm">
                            {po.status === "partial"
                              ? `${po.received} / ${po.quantity} ${po.unit}`
                              : `${po.quantity} ${po.unit}`}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">No pending purchase orders found</div>
              )}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedPO}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
