"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { AlertCircle, Search, Check } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useProductionStore } from "@/hooks/use-production-store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ProductionDetails, useFinished } from "@/app/inventory/finished-goods/context"
import { useOrders } from "@/contexts/order-context"
import { DataByTableName } from "../utils/api"

interface CreateProductionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sku: string
  deficit: number
}

export function CreateProductionDialog({ open, onOpenChange, sku, deficit }: CreateProductionDialogProps) {
  const [quantity, setQuantity] = useState(deficit > 0 ? deficit.toString() : "1000")
  const [selectedSku, setSelectedSku] = useState(sku || "")
  const { productInfo, clientInfo } = useOrders();
  const { triggerRerender } = useFinished()
  const [searchTerm, setSearchTerm] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [deadline, setDeadline] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  const [openCombobox, setOpenCombobox] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // This would come from your API in a real application
  const availableSkus = useMemo(() => {
    return Object.values(productInfo).map(item => ({
      label: item.sku, value: item.productId
    }))
  }, [productInfo])

  const existingProduction = selectedSku === "500ml" ? 2000 : selectedSku === "1000ml" ? 1000 : 0
  const teamMembers = useMemo(() => {
    return Object.values(clientInfo).map(item => ({ label: item.name, value: item.clientId }))
  }, [clientInfo])

  // Filter SKUs based on search term
  const filteredSkus = availableSkus.filter(
    (skuOption) =>
      skuOption.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skuOption.label.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Auto-focus the search input when dialog opens
  useEffect(() => {
    if (open && !sku && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
        setOpenCombobox(true)
      }, 100)
    }
  }, [open, sku])

  // Update search term when selected SKU changes
  useEffect(() => {
    if (selectedSku) {
      const selected = availableSkus.find((s) => s.value === selectedSku)
      if (selected) {
        setSearchTerm(selected.label)
      }
    }
  }, [selectedSku])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSku) {
      return // Prevent submission without a SKU
    }

    const payload = {
      clientId: assignedTo,
      delivered: 0,
      endTime: new Date(deadline).getTime(),
      numBottles: Number.parseInt(quantity),
      numCases: 0,
      sku: productInfo[selectedSku]?.sku || "",
      productionId: selectedSku
    } as Partial<ProductionDetails>

    const instance = new DataByTableName("production_details");

    instance.post(payload).then(() => {
      onOpenChange(false)
      triggerRerender()
    }).catch(error => {
      console.log({ error })
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Production Order</DialogTitle>
          <DialogDescription>Create a new production order{sku ? ` for ${sku} SKU` : ""}.</DialogDescription>
        </DialogHeader>

        {existingProduction > 0 && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              {existingProduction.toLocaleString()} bottles of {selectedSku} are already in production.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              {sku ? (
                <Input id="sku" value={sku} readOnly className="col-span-3 bg-muted" />
              ) : (
                <div className="col-span-3">
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full justify-between"
                      >
                        {selectedSku
                          ? availableSkus.find((sku) => sku.value === selectedSku)?.label
                          : "Search for SKU..."}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search SKU..."
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                          ref={searchInputRef}
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No SKU found.</CommandEmpty>
                          <CommandGroup>
                            {filteredSkus.map((sku) => (
                              <CommandItem
                                key={sku.value}
                                value={sku.value}
                                onSelect={(currentValue) => {
                                  setSelectedSku(currentValue)
                                  setOpenCombobox(false)
                                }}
                              >
                                {sku.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedSku === sku.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="col-span-3"
                min="1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">
                Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedTo" className="text-right">
                Assign To
              </Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.value} value={member.value}>
                      {member.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!selectedSku}>
              Create Production Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

