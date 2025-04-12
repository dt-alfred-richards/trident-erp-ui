"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Search, Plus, Eye } from "lucide-react"
import { EditSupplierDialog } from "./edit-supplier-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { AddSupplierDialog } from "./add-supplier-dialog"
import { ViewSupplierDialog } from "./view-supplier-dialog"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { Supplier, useProcurement } from "./procurement-context"

export function SupplierListTab() {
  const { suppliersData = [], triggerRender } = useProcurement();

  const [suppliers, setSuppliers] = useState<any[]>([])

  useEffect(() => {
    setSuppliers(
      suppliersData?.map(item => ({
        id: item.id + '',
        name: item.name,
        materialName: "Circuit Boards",
        materialType: "Electronic",
        price: 45,
        unit: "per piece",
        contactPerson: item.contactPerson,
        email: item.email,
        phone: item.phone,
      }))
    )
  }, [suppliersData])
  const [searchQuery, setSearchQuery] = useState("")

  // For edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentSupplier, setCurrentSupplier] = useState<any>(null)

  // For view dialog
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [supplierToView, setSupplierToView] = useState<any>(null)

  // For delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null)

  // For add supplier dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Get existing supplier IDs for validation
  const existingSupplierIds = useMemo(() => {
    return suppliers.map((supplier) => supplier.id)
  }, [suppliers])

  // Filter suppliers based on search query
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.phone.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [suppliers, searchQuery])

  // Get current suppliers for pagination
  const indexOfLastSupplier = currentPage * itemsPerPage
  const indexOfFirstSupplier = indexOfLastSupplier - itemsPerPage
  const currentSuppliers = filteredSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle view supplier
  const handleViewClick = (supplier: any) => {
    setSupplierToView(supplier)
    setIsViewDialogOpen(true)
  }

  // Handle edit supplier
  const handleEditClick = (supplier: any) => {
    setCurrentSupplier(supplier)
    setIsEditDialogOpen(true)
  }

  // Handle save edited supplier
  const handleSaveSupplier = (updatedSupplier: any) => {
    setSuppliers(suppliers.map((supplier) => (supplier.id === updatedSupplier.id ? updatedSupplier : supplier)))
    setIsEditDialogOpen(false)
  }

  // Handle delete button click
  const handleDeleteClick = (supplier: any) => {
    setSupplierToDelete(supplier)
    setIsDeleteDialogOpen(true)
  }

  const { toast } = useToast()

  // Handle confirm deletion
  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      setSuppliers(suppliers.filter((supplier) => supplier.id !== supplierToDelete.id))
      setIsDeleteDialogOpen(false)
      setSupplierToDelete(null)

      // Show success toast
      toast({
        title: "Supplier deleted",
        description: `${supplierToDelete.name} has been removed from the supplier list.`,
      })
    }
  }

  // Handle add new supplier
  const handleAddSupplier = (newSupplier: any) => {
    setSuppliers([...suppliers, newSupplier])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button className="whitespace-nowrap" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier ID</TableHead>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No suppliers found.
                </TableCell>
              </TableRow>
            ) : (
              currentSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.id}</TableCell>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewClick(supplier)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(supplier)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(supplier)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        totalItems={filteredSuppliers.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {isViewDialogOpen && supplierToView && (
        <ViewSupplierDialog supplier={supplierToView} open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen} />
      )}

      {isEditDialogOpen && currentSupplier && (
        <EditSupplierDialog
          supplier={currentSupplier}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveSupplier}
        />
      )}

      {isDeleteDialogOpen && supplierToDelete && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Supplier</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this supplier? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>
                <strong>Supplier ID:</strong> {supplierToDelete.id}
              </p>
              <p>
                <strong>Supplier Name:</strong> {supplierToDelete.name}
              </p>
              <p>
                <strong>Contact Person:</strong> {supplierToDelete.contactPerson}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete Supplier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AddSupplierDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddSupplier}
        existingIds={existingSupplierIds}
      />
    </div>
  )
}
