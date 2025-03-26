"use client"

import type React from "react"
import { format } from "date-fns"
import { useState, useEffect, useRef } from "react"
import { AlertCircle, Search, Check, Info, CalendarIcon } from "lucide-react"
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
import { useBomStore } from "@/hooks/use-bom-store"
import { useInventoryStore } from "@/hooks/use-inventory-store"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { BomComponentType } from "@/types/bom"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"

interface CreateProductionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sku: string
  deficit: number
}

interface BomComponentWithAvailability extends BomComponentType {
  available: number
  isSelected: boolean
  isSufficient: boolean
}

export function CreateProductionDialog({ open, onOpenChange, sku, deficit }: CreateProductionDialogProps) {
  const [quantity, setQuantity] = useState(deficit > 0 ? deficit.toString() : "1000")
  const [selectedSku, setSelectedSku] = useState(sku || "")
  const [searchTerm, setSearchTerm] = useState("")
  const [assignedTo, setAssignedTo] = useState("John D.")
  const [date, setDate] = useState<Date>(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
  const [openCombobox, setOpenCombobox] = useState(false)
  const [openDatePicker, setOpenDatePicker] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [bomComponents, setBomComponents] = useState<BomComponentWithAvailability[]>([])
  const [bomId, setBomId] = useState<string>("")
  const [allComponentsSelected, setAllComponentsSelected] = useState(false)

  const { createProductionOrder } = useProductionStore()
  const { boms } = useBomStore()
  const { rawMaterials } = useInventoryStore()

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

  // Update BOM components when SKU or quantity changes
  useEffect(() => {
    if (!selectedSku) {
      setBomComponents([])
      setBomId("")
      return
    }

    // Get BOM for the selected SKU
    const bomForSku = boms.find(
      (bom) =>
        bom.productName.toLowerCase().includes(selectedSku.toLowerCase()) ||
        selectedSku.toLowerCase().includes(bom.productName.toLowerCase()),
    )

    if (!bomForSku) {
      setBomComponents([])
      setBomId("")
      return
    }

    setBomId(bomForSku.id)

    // Calculate required quantities and check availability
    const requiredQuantity = Number(quantity)
    const componentsWithAvailability = bomForSku.components.map((component) => {
      const material = rawMaterials.find((m) => m.name.toLowerCase() === component.materialName.toLowerCase())
      const available = material?.quantity || 0
      const required = component.quantity * requiredQuantity
      const isSufficient = available >= required

      return {
        ...component,
        available,
        isSelected: isSufficient, // Auto-select if sufficient
        isSufficient,
      }
    })

    setBomComponents(componentsWithAvailability)
  }, [selectedSku, quantity, boms, rawMaterials])

  // Check if all components are selected and sufficient
  useEffect(() => {
    const allSelected =
      bomComponents.length > 0 && bomComponents.every((component) => component.isSelected && component.isSufficient)
    setAllComponentsSelected(allSelected)
  }, [bomComponents])

  const handleComponentToggle = (index: number, checked: boolean) => {
    const updatedComponents = [...bomComponents]
    updatedComponents[index].isSelected = checked
    setBomComponents(updatedComponents)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSku || !bomId || !allComponentsSelected) {
      return // Prevent submission without a SKU or if components aren't all selected
    }

    createProductionOrder({
      sku: selectedSku,
      quantity: Number.parseInt(quantity),
      deadline: date.toISOString(),
      assignedTo,
      bomId,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
          <div className="space-y-6">
            {/* Order Details Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SKU Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    {sku ? (
                      <Input id="sku" value={sku} readOnly className="bg-muted" />
                    ) : (
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
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                    />
                  </div>

                  {/* Deadline Date Picker */}
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal" id="deadline">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(date) => {
                            if (date) {
                              setDate(date)
                              setOpenDatePicker(false)
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Assign To */}
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger id="assignedTo">
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
              </CardContent>
            </Card>

            {/* BOM Components Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Bill of Materials</h3>
                {bomComponents.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Use</TableHead>
                          <TableHead>Material</TableHead>
                          <TableHead className="text-right">Required</TableHead>
                          <TableHead className="text-right">Available</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bomComponents.map((component, index) => {
                          const requiredQty = component.quantity * Number(quantity)
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Checkbox
                                  checked={component.isSelected}
                                  onCheckedChange={(checked) => handleComponentToggle(index, checked as boolean)}
                                  disabled={!component.isSufficient}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{component.materialName}</TableCell>
                              <TableCell className="text-right">
                                {requiredQty.toLocaleString()} {component.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                {component.available.toLocaleString()} {component.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                {component.isSufficient ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Sufficient
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Insufficient
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : selectedSku ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No BOM Found</AlertTitle>
                    <AlertDescription>No bill of materials found for the selected SKU.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-center p-6 border rounded-md bg-muted">
                    <Info className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Select an SKU to view the bill of materials</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {bomComponents.length > 0 && !allComponentsSelected && (
            <Alert variant="warning" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Materials Check Required</AlertTitle>
              <AlertDescription>
                Please ensure all required materials are selected and sufficient before creating the production order.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={!selectedSku || !allComponentsSelected}>
              Create Production Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

