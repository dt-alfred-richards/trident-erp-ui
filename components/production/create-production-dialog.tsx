"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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

interface CreateProductionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sku: string
  deficit: number
}

export function CreateProductionDialog({ open, onOpenChange, sku, deficit }: CreateProductionDialogProps) {
  const [quantity, setQuantity] = useState(deficit > 0 ? deficit.toString() : "1000")
  const [selectedSku, setSelectedSku] = useState(sku || "")
  const [searchTerm, setSearchTerm] = useState("")
  const [assignedTo, setAssignedTo] = useState("John D.")
  const [deadline, setDeadline] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  const [openCombobox, setOpenCombobox] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { createProductionOrder } = useProductionStore()

  // This would come from your API in a real application
  const availableSkus = [
    { value: "500ml", label: "500ml Glass Bottle" },
    { value: "1000ml", label: "1000ml Glass Bottle" },
    { value: "1500ml", label: "1500ml Glass Bottle" },
    { value: "2000ml", label: "2000ml Glass Bottle" },
    { value: "330ml-can", label: "330ml Aluminum Can" },
    { value: "500ml-can", label: "500ml Aluminum Can" },
    { value: "750ml-wine", label: "750ml Wine Bottle" },
    { value: "375ml-wine", label: "375ml Wine Bottle" },
  ]

  const existingProduction = selectedSku === "500ml" ? 2000 : selectedSku === "1000ml" ? 1000 : 0
  const teamMembers = ["John D.", "Sarah M.", "Mike T.", "Lisa R.", "David K."]

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

    createProductionOrder({
      sku: selectedSku,
      quantity: Number.parseInt(quantity),
      deadline: new Date(deadline).toISOString(),
      assignedTo,
    })

    onOpenChange(false)
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
                    <SelectItem key={member} value={member}>
                      {member}
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

