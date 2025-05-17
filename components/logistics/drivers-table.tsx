"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Plus, Trash2, Search } from "lucide-react"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { DataTablePagination } from "@/components/ui/data-table-pagination"

// Sample driver data
const initialDrivers = [
  {
    id: "DRV001",
    name: "Rajesh Kumar",
    licenseNumber: "DL-0123456789",
    contactNumber: "+91 98765 43210",
    address: "123 Main Street, Mumbai",
    joiningDate: "2022-03-15",
  },
  {
    id: "DRV002",
    name: "Suresh Patel",
    licenseNumber: "DL-9876543210",
    contactNumber: "+91 87654 32109",
    address: "456 Park Avenue, Delhi",
    joiningDate: "2022-05-20",
  },
  {
    id: "DRV003",
    name: "Amit Singh",
    licenseNumber: "DL-5678901234",
    contactNumber: "+91 76543 21098",
    address: "789 Lake View, Bangalore",
    joiningDate: "2022-07-10",
  },
  {
    id: "DRV004",
    name: "Priya Sharma",
    licenseNumber: "DL-2345678901",
    contactNumber: "+91 65432 10987",
    address: "234 Hill Road, Chennai",
    joiningDate: "2022-09-05",
  },
  {
    id: "DRV005",
    name: "Vikram Mehta",
    licenseNumber: "DL-3456789012",
    contactNumber: "+91 54321 09876",
    address: "567 River View, Kolkata",
    joiningDate: "2022-11-15",
  },
  {
    id: "DRV006",
    name: "Neha Gupta",
    licenseNumber: "DL-4567890123",
    contactNumber: "+91 43210 98765",
    address: "678 Mountain Road, Pune",
    joiningDate: "2023-01-10",
  },
  {
    id: "DRV007",
    name: "Rahul Verma",
    licenseNumber: "DL-5678901234",
    contactNumber: "+91 32109 87654",
    address: "789 Valley Street, Hyderabad",
    joiningDate: "2023-03-05",
  },
  {
    id: "DRV008",
    name: "Ananya Reddy",
    licenseNumber: "DL-6789012345",
    contactNumber: "+91 21098 76543",
    address: "890 Ocean View, Ahmedabad",
    joiningDate: "2023-05-20",
  },
]

export function DriversTable() {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<any>(null)
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null)
  const [newDriver, setNewDriver] = useState({
    id: "",
    name: "",
    licenseNumber: "",
    contactNumber: "",
    address: "",
    joiningDate: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter((driver) => {
    const query = searchQuery.toLowerCase()
    return (
      driver.id.toLowerCase().includes(query) ||
      driver.name.toLowerCase().includes(query) ||
      driver.licenseNumber.toLowerCase().includes(query) ||
      driver.contactNumber.toLowerCase().includes(query) ||
      driver.address.toLowerCase().includes(query) ||
      driver.joiningDate.toLowerCase().includes(query)
    )
  })

  // Get current drivers for pagination
  const indexOfLastDriver = currentPage * itemsPerPage
  const indexOfFirstDriver = indexOfLastDriver - itemsPerPage
  const currentDrivers = filteredDrivers.slice(indexOfFirstDriver, indexOfLastDriver)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleAddDriver = () => {
    // Generate a new ID
    const newId = `DRV${(drivers.length + 1).toString().padStart(3, "0")}`
    const driverToAdd = { ...newDriver, id: newId }

    setDrivers([...drivers, driverToAdd])
    setNewDriver({
      id: "",
      name: "",
      licenseNumber: "",
      contactNumber: "",
      address: "",
      joiningDate: "",
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Driver Added",
      description: `Driver ${newId} has been added successfully.`,
    })
  }

  const handleEditDriver = () => {
    setDrivers(drivers.map((driver) => (driver.id === selectedDriver.id ? selectedDriver : driver)))
    setIsEditDialogOpen(false)

    toast({
      title: "Driver Updated",
      description: `Driver ${selectedDriver.id} has been updated successfully.`,
    })
  }

  const confirmDelete = (id: string) => {
    setDriverToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteDriver = () => {
    if (!driverToDelete) return

    setDrivers(drivers.filter((driver) => driver.id !== driverToDelete))
    setIsDeleteDialogOpen(false)

    toast({
      title: "Driver Deleted",
      description: `Driver ${driverToDelete} has been deleted successfully.`,
    })

    setDriverToDelete(null)
  }

  const openEditDialog = (driver: any) => {
    setSelectedDriver(driver)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Drivers</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search drivers..."
              className="w-[250px] pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset to first page on search
              }}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: "#1c86ff", color: "white" }} className="hover:bg-[#1a78e6]">
                <Plus className="h-4 w-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>Enter the details of the new driver to add to the team.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newDriver.name}
                      onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={newDriver.licenseNumber}
                      onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={newDriver.contactNumber}
                      onChange={(e) => setNewDriver({ ...newDriver, contactNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input
                      id="joiningDate"
                      type="date"
                      value={newDriver.joiningDate}
                      onChange={(e) => setNewDriver({ ...newDriver, joiningDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newDriver.address}
                    onChange={(e) => setNewDriver({ ...newDriver, address: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddDriver}
                  style={{ backgroundColor: "#1b84ff", color: "#ffffff" }}
                  className="hover:bg-[#0a6edf]"
                >
                  Add Driver
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Joining Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No drivers found.
                </TableCell>
              </TableRow>
            ) : (
              currentDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.id}</TableCell>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.licenseNumber}</TableCell>
                  <TableCell>{driver.contactNumber}</TableCell>
                  <TableCell>{driver.joiningDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(driver)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(driver.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
        totalItems={filteredDrivers.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Edit Driver Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>Update the details of driver {selectedDriver?.id}.</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedDriver.name}
                    onChange={(e) => setSelectedDriver({ ...selectedDriver, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-licenseNumber">License Number</Label>
                  <Input
                    id="edit-licenseNumber"
                    value={selectedDriver.licenseNumber}
                    onChange={(e) => setSelectedDriver({ ...selectedDriver, licenseNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-contactNumber">Contact Number</Label>
                  <Input
                    id="edit-contactNumber"
                    value={selectedDriver.contactNumber}
                    onChange={(e) => setSelectedDriver({ ...selectedDriver, contactNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-joiningDate">Joining Date</Label>
                  <Input
                    id="edit-joiningDate"
                    type="date"
                    value={selectedDriver.joiningDate}
                    onChange={(e) => setSelectedDriver({ ...selectedDriver, joiningDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={selectedDriver.address}
                  onChange={(e) => setSelectedDriver({ ...selectedDriver, address: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDriver}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Driver"
        description={`Are you sure you want to delete driver ${driverToDelete}? This action cannot be undone.`}
        onConfirm={handleDeleteDriver}
      />
    </div>
  )
}
