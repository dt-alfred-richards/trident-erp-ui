"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Flag } from "lucide-react"

export function AllocationPanel() {
  const [selectedSku, setSelectedSku] = useState<string>("")
  const [availableStock, setAvailableStock] = useState<number>(0)
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [totalAllocated, setTotalAllocated] = useState<number>(0)

  // This would come from your API in a real application
  const skuOptions = [
    { value: "500ml", stock: 250 },
    { value: "750ml", stock: 1200 },
    { value: "1000ml", stock: 200 },
    { value: "2000ml", stock: 1000 },
  ]

  // This would come from your API in a real application
  const pendingOrders = [
    {
      id: "SO-0998",
      customer: "Fresh Markets",
      sku: "750ml",
      quantity: 1200,
      priority: "medium",
      date: "2023-06-02",
    },
    {
      id: "SO-0999",
      customer: "Organic Stores",
      sku: "750ml",
      quantity: 300,
      priority: "high",
      date: "2023-06-03",
    },
    {
      id: "SO-1001",
      customer: "Acme Corp",
      sku: "500ml",
      quantity: 1000,
      priority: "high",
      date: "2023-06-05",
    },
    {
      id: "SO-1002",
      customer: "TechStart Inc",
      sku: "1000ml",
      quantity: 500,
      priority: "medium",
      date: "2023-06-06",
    },
  ]

  const filteredOrders = pendingOrders.filter((order) => order.sku === selectedSku)

  const handleSkuChange = (value: string) => {
    setSelectedSku(value)
    const selectedSkuOption = skuOptions.find((option) => option.value === value)
    setAvailableStock(selectedSkuOption?.stock || 0)
    setAllocations({})
    setTotalAllocated(0)
  }

  const handleAllocationChange = (orderId: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    const newAllocations = { ...allocations, [orderId]: numValue }
    setAllocations(newAllocations)

    // Calculate total allocated
    const newTotal = Object.values(newAllocations).reduce((sum, val) => sum + val, 0)
    setTotalAllocated(newTotal)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would submit the allocations to your API
    console.log("Allocations:", allocations)
    alert("Allocations saved successfully!")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-amber-500"
      case "low":
        return "text-green-500"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="sku-select">Select SKU for Allocation</Label>
        <Select value={selectedSku} onValueChange={handleSkuChange}>
          <SelectTrigger id="sku-select">
            <SelectValue placeholder="Select SKU" />
          </SelectTrigger>
          <SelectContent>
            {skuOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.value} ({option.stock} available)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSku && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Pending Orders for {selectedSku}</h3>
              <div className="text-sm">
                <span className="font-medium">Available Stock:</span>{" "}
                <span
                  className={totalAllocated > availableStock ? "text-red-500 font-bold" : "text-blue-600 font-bold"}
                >
                  {availableStock.toLocaleString()}
                </span>
              </div>
            </div>

            {filteredOrders.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Requested</TableHead>
                      <TableHead className="text-right">Allocate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Checkbox
                            id={`select-${order.id}`}
                            checked={!!allocations[order.id]}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleAllocationChange(order.id, "0")
                              } else {
                                const newAllocations = { ...allocations }
                                delete newAllocations[order.id]
                                setAllocations(newAllocations)

                                // Recalculate total
                                const newTotal = Object.values(newAllocations).reduce((sum, val) => sum + val, 0)
                                setTotalAllocated(newTotal)
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Flag className={`h-4 w-4 mr-1 ${getPriorityColor(order.priority)}`} />
                            <span className="capitalize">{order.priority}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{order.quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={allocations[order.id] || ""}
                            onChange={(e) => handleAllocationChange(order.id, e.target.value)}
                            disabled={!allocations[order.id]}
                            min="0"
                            max={Math.min(order.quantity, availableStock)}
                            className="w-24 ml-auto"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm">
                    <span className="font-medium">Total Allocated:</span>{" "}
                    <span className={totalAllocated > availableStock ? "text-red-500 font-bold" : "font-bold"}>
                      {totalAllocated.toLocaleString()}
                    </span>{" "}
                    of <span className="font-bold">{availableStock.toLocaleString()}</span>
                  </div>

                  <Button type="submit" disabled={totalAllocated === 0 || totalAllocated > availableStock}>
                    Save Allocations
                  </Button>
                </div>

                {totalAllocated > availableStock && (
                  <div className="text-red-500 text-sm font-medium">
                    Error: Total allocation exceeds available stock.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No pending orders found for {selectedSku}.</div>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

