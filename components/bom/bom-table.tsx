"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import { useBomStore } from "@/hooks/use-bom-store"
import { BomDetailsDialog } from "@/components/bom/bom-details-dialog"
import { EditBomDialog } from "@/components/bom/edit-bom-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

export function BomTable() {
  const { boms, deleteBom } = useBomStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBomId, setSelectedBomId] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [displayBoms, setDisplayBoms] = useState(boms)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Update the first five product names when the component mounts
  useEffect(() => {
    const updatedBoms = [...boms]
    const productNames = ["2000ml", "1000ml", "750ml", "500ml", "250ml"]

    // Update only the first 5 rows or fewer if there are less than 5 boms
    const rowsToUpdate = Math.min(5, updatedBoms.length)

    for (let i = 0; i < rowsToUpdate; i++) {
      updatedBoms[i] = {
        ...updatedBoms[i],
        productName: productNames[i],
      }
    }

    setDisplayBoms(updatedBoms)
  }, [boms])

  // Filter BOMs based on search term
  const filteredBoms = displayBoms.filter(
    (bom) =>
      bom.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bom.bomCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedBoms = filteredBoms.slice(indexOfFirstItem, indexOfLastItem)

  const handleViewDetails = (bomId: string) => {
    setSelectedBomId(bomId)
    setDetailsDialogOpen(true)
  }

  const handleEdit = (bomId: string) => {
    setSelectedBomId(bomId)
    setEditDialogOpen(true)
  }

  const handleDelete = (bomId: string) => {
    setSelectedBomId(bomId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedBomId) {
      deleteBom(selectedBomId)
      setDeleteDialogOpen(false)
    }
  }

  const selectedBom = selectedBomId ? displayBoms.find((bom) => bom.id === selectedBomId) : null

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search BOMs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>BOM Code</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Components</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBoms.length > 0 ? (
              paginatedBoms.map((bom) => (
                <TableRow key={bom.id}>
                  <TableCell className="font-medium">{bom.bomCode}</TableCell>
                  <TableCell>{bom.productName}</TableCell>
                  <TableCell>{bom.components.length}</TableCell>
                  <TableCell>₹{bom.unitCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={bom.status === "active" ? "default" : "secondary"}
                      className={
                        bom.status === "active"
                          ? "bg-green-100 hover:bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900"
                          : "bg-amber-100 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900"
                      }
                    >
                      {bom.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(bom.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(bom.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(bom.id)}>
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? "No BOMs found matching your search" : "No BOMs created yet"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        totalItems={filteredBoms.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {selectedBom && (
        <>
          <BomDetailsDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} bom={selectedBom} />
          <EditBomDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} bom={selectedBom} />
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this BOM. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
