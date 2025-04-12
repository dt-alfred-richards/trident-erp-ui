"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Minus, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PurchaseOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateOrder: (order: any) => void
}

interface LineItem {
  id: string
  material: string
  quantity: string
  unit: string
  price: string
}

const materials = [
  { value: "plastic-resin", label: "Plastic Resin" },
  { value: "bottle-caps", label: "Bottle Caps" },
  { value: "label-adhesive", label: "Label Adhesive" },
  { value: "cardboard-boxes", label: "Cardboard Boxes" },
  { value: "labels", label: "Labels" },
]

const suppliers = [
  { value: "plasticorp", label: "PlastiCorp Inc." },
  { value: "capmakers", label: "CapMakers Ltd." },
  { value: "adhesive", label: "Adhesive Solutions" },
  { value: "packaging", label: "Packaging Experts" },
  { value: "labels", label: "Label Masters" },
]

export function PurchaseOrderDialog({ open, onOpenChange, onCreateOrder }: PurchaseOrderDialogProps) {
  const [supplier, setSupplier] = useState("")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [currency, setCurrency] = useState("USD")
  const [paymentTerms, setPaymentTerms] = useState("net30")
  const [notes, setNotes] = useState("")
  const [priority, setPriority] = useState("normal")

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), material: "", quantity: "", unit: "kg", price: "" },
  ])

  const handleLineItemChange = (id: string, field: string, value: string) => {
    setLineItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { id: crypto.randomUUID(), material: "", quantity: "", unit: "kg", price: "" }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Find the supplier and material names
    const supplierObj = suppliers.find((s) => s.value === supplier)
    const supplierName = supplierObj ? supplierObj.label : supplier

    // Calculate the expected delivery date (2 weeks from now)
    const today = new Date()
    const expectedDelivery = dueDate
      ? format(dueDate, "yyyy-MM-dd")
      : format(new Date(today.setDate(today.getDate() + 14)), "yyyy-MM-dd")

    // Create the new order object
    const newOrder = {
      supplier,
      supplierName,
      material: lineItems[0].material,
      materialName: materials.find((m) => m.value === lineItems[0].material)?.label,
      quantity: Number(lineItems[0].quantity),
      unit: lineItems[0].unit,
      expectedDelivery,
      totalValue: calculateTotal(),
      priority,
      notes,
    }

    // Call the parent function to add the order
    onCreateOrder(newOrder)
  }

  const calculateTotal = () => {
    return lineItems.reduce((total, item) => {
      const itemTotal =
        item.price && item.quantity ? Number.parseFloat(item.price) * Number.parseFloat(item.quantity) : 0
      return total + itemTotal
    }, 0)
  }

  const totalValue = calculateTotal()
  const isFormValid =
    supplier &&
    dueDate &&
    lineItems.every(
      (item) => item.material && item.quantity && Number(item.quantity) > 0 && item.price && Number(item.price) > 0,
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] p-0">
        <DialogHeader className="px-8 pt-8 pb-0">
          <DialogTitle className="text-2xl font-semibold">New Purchase Order -TB</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex flex-col md:flex-row gap-8 p-8">
            <div className="flex-1">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Order Details</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Select value={supplier} onValueChange={setSupplier}>
                        <SelectTrigger id="supplier">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due-date">Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="due-date"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dueDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={setDueDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger id="currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="INR">INR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment-terms">Payment Terms</Label>
                        <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                          <SelectTrigger id="payment-terms">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="net15">Net 15</SelectItem>
                            <SelectItem value="net30">Net 30</SelectItem>
                            <SelectItem value="net45">Net 45</SelectItem>
                            <SelectItem value="net60">Net 60</SelectItem>
                            <SelectItem value="immediate">Immediate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div
                          className={cn(
                            "flex items-center justify-center p-2 rounded-md border cursor-pointer",
                            priority === "low"
                              ? "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "hover:bg-muted",
                          )}
                          onClick={() => setPriority("low")}
                        >
                          Low
                        </div>
                        <div
                          className={cn(
                            "flex items-center justify-center p-2 rounded-md border cursor-pointer",
                            priority === "normal"
                              ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                              : "hover:bg-muted",
                          )}
                          onClick={() => setPriority("normal")}
                        >
                          Normal
                        </div>
                        <div
                          className={cn(
                            "flex items-center justify-center p-2 rounded-md border cursor-pointer",
                            priority === "high"
                              ? "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                              : "hover:bg-muted",
                          )}
                          onClick={() => setPriority("high")}
                        >
                          High
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional information or requirements"
                        className="h-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Items</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="h-8">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Item
                  </Button>
                </div>

                <ScrollArea className="h-[340px] pr-4">
                  <div className="space-y-4">
                    {lineItems.map((item, index) => (
                      <div key={item.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-3">
                          <Select
                            value={item.material}
                            onValueChange={(value) => handleLineItemChange(item.id, "material", value)}
                          >
                            <SelectTrigger className="w-[250px] border-none bg-transparent px-0 h-8">
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent>
                              {materials.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {lineItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(item.id)}
                              className="h-8 px-2 text-muted-foreground"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`quantity-${item.id}`} className="text-sm text-muted-foreground">
                              Quantity
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id={`quantity-${item.id}`}
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleLineItemChange(item.id, "quantity", e.target.value)}
                                min="1"
                                className="flex-1"
                              />
                              <Select
                                value={item.unit}
                                onValueChange={(value) => handleLineItemChange(item.id, "unit", value)}
                              >
                                <SelectTrigger className="w-[80px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="liters">L</SelectItem>
                                  <SelectItem value="pcs">pcs</SelectItem>
                                  <SelectItem value="boxes">box</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`price-${item.id}`} className="text-sm text-muted-foreground">
                              Unit Price
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                id={`price-${item.id}`}
                                type="number"
                                value={item.price}
                                onChange={(e) => handleLineItemChange(item.id, "price", e.target.value)}
                                min="0.01"
                                step="0.01"
                                className="pl-9"
                              />
                            </div>
                          </div>
                        </div>

                        {item.price && item.quantity && (
                          <div className="mt-3 text-right text-sm font-medium">
                            Subtotal: {(Number.parseFloat(item.price) * Number.parseFloat(item.quantity)).toFixed(2)}{" "}
                            {currency}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold">
                      {totalValue.toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/30 border-t flex justify-end">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isFormValid}>
                Create Purchase Order
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
