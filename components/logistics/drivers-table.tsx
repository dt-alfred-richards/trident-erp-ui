"use client"

import { useEffect, useState } from "react"
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
import { Edit, Plus, Trash2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { useLogisticsData } from "@/hooks/use-logistics-data"

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
]

export function DriversTable() {
  const { vehicles: _vehicles = {} } = useLogisticsData();

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
  const { toast } = useToast()

  // useEffect(() => {
  //   setDrivers(Object.values(_vehicles).map(item => ({
  //     id: item,
  //     name: "Vikram Mehta",
  //     licenseNumber: "DL-3456789012",
  //     contactNumber: "+91 54321 09876",
  //     address: "567 River View, Kolkata",
  //     joiningDate: "2022-11-15",
  //   })) as any)
  // }, [_vehicles])

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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
              <Button onClick={handleAddDriver}>Add Driver</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            {drivers.map((driver) => (
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
            ))}
          </TableBody>
        </Table>
      </div>

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
