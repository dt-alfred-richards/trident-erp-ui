"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star, StarHalf } from "lucide-react"

export function SupplierComparisonTable() {
  const [selectedMaterial, setSelectedMaterial] = useState<string>("plastic-resin")
  const [sortBy, setSortBy] = useState<string>("price")

  // This would come from your API in a real application
  const supplierData = {
    "plastic-resin": [
      {
        id: "sup-001",
        name: "PlastiCorp Inc.",
        price: 2.5,
        unit: "kg",
        leadTime: 7,
        rating: 4.5,
        lastDelivery: "2023-05-28",
        notes: "Preferred supplier, consistent quality",
      },
      {
        id: "sup-002",
        name: "Polymer Solutions",
        price: 2.35,
        unit: "kg",
        leadTime: 10,
        rating: 4.0,
        lastDelivery: "2023-05-15",
        notes: "Good price but longer lead time",
      },
      {
        id: "sup-003",
        name: "Global Plastics",
        price: 2.75,
        unit: "kg",
        leadTime: 5,
        rating: 3.5,
        lastDelivery: "2023-05-20",
        notes: "Fast delivery but higher price",
      },
    ],
    "bottle-caps": [
      {
        id: "sup-004",
        name: "CapMakers Ltd.",
        price: 0.05,
        unit: "pc",
        leadTime: 8,
        rating: 4.2,
        lastDelivery: "2023-05-25",
        notes: "Standard supplier for caps",
      },
      {
        id: "sup-005",
        name: "Closure Systems",
        price: 0.06,
        unit: "pc",
        leadTime: 6,
        rating: 4.7,
        lastDelivery: "2023-05-22",
        notes: "Premium quality caps, slightly higher price",
      },
      {
        id: "sup-006",
        name: "Bottle Accessories Co.",
        price: 0.045,
        unit: "pc",
        leadTime: 12,
        rating: 3.8,
        lastDelivery: "2023-05-10",
        notes: "Economical option but inconsistent quality",
      },
    ],
  }

  const renderRating = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-amber-500 text-amber-500" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-amber-500 text-amber-500" />)
    }

    return <div className="flex">{stars}</div>
  }

  const sortedSuppliers = [...(supplierData[selectedMaterial as keyof typeof supplierData] || [])].sort((a, b) => {
    if (sortBy === "price") return a.price - b.price
    if (sortBy === "leadTime") return a.leadTime - b.leadTime
    if (sortBy === "rating") return b.rating - a.rating
    return 0
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <Label htmlFor="material-select" className="mb-2 block">
            Material
          </Label>
          <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
            <SelectTrigger id="material-select">
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plastic-resin">Plastic Resin</SelectItem>
              <SelectItem value="bottle-caps">Bottle Caps</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label htmlFor="sort-by" className="mb-2 block">
            Sort By
          </Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort-by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price (Low to High)</SelectItem>
              <SelectItem value="leadTime">Lead Time (Shortest)</SelectItem>
              <SelectItem value="rating">Rating (Highest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Lead Time</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell className="text-right">
                  ${supplier.price.toFixed(2)}/{supplier.unit}
                </TableCell>
                <TableCell className="text-right">{supplier.leadTime} days</TableCell>
                <TableCell>{renderRating(supplier.rating)}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={supplier.notes}>
                  {supplier.notes}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="default" size="sm">
                    Select
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

