"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface WastageData {
  id: string
  material: string
  category: string
  wastage: number
  wastagePercentage: number
  lastUpdated: Date
}

interface RawMaterialsWastageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wastageData: WastageData[]
}

export function RawMaterialsWastageDialog({ open, onOpenChange, wastageData }: RawMaterialsWastageDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Get unique categories from the wastage data
  const categories = Array.from(new Set(wastageData.map((item) => item.category))).sort()

  // Filter data based on selected category
  const filteredData =
    selectedCategory === "all" ? wastageData : wastageData.filter((item) => item.category === selectedCategory)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Raw Materials Wastage Summary</DialogTitle>
        </DialogHeader>

        <div className="mt-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Filter by material type:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Materials</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-h-[400px] overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Wastage</TableHead>
                <TableHead className="text-right">Wastage %</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.material}</TableCell>
                    <TableCell className="text-right">{item.wastage}</TableCell>
                    <TableCell className="text-right">{item.wastagePercentage.toFixed(1)}%</TableCell>
                    <TableCell>{formatDistanceToNow(item.lastUpdated, { addSuffix: true })}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No wastage data found for this material type
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
