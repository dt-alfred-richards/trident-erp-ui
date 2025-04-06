"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import moment from "moment"
import { DataByTableName } from "../utils/api"

type Driver = {
  id: string,
  name: string,
  licenseNumber: string,
  contactNumber: string,
  address: string,
  joiningDate: string,
}

export function DriversTable() {
  const { vehicles: _vehicles = {}, drivers: _drivers = {}, triggerRender } = useLogisticsData();

  const driverInstance = new DataByTableName("dim_drivers");

  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Partial<Driver>>({})
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

  useEffect(() => {
    setDrivers(Object.values(_drivers).map(item => (
      {
        id: item.driverId,
        name: item.name,
        licenseNumber: item.drivingLicense,
        contactNumber: item.phoneNumber,
        address: item.address,
        joiningDate: item.joiningDate ? moment(item.joiningDate).format('YYYY-MM-DD') : '-'
      }
    )) as any)
  }, [_vehicles])

  const handleAddDriver = useCallback(() => {
    const { address, contactNumber, joiningDate, licenseNumber, name } = newDriver

    driverInstance.post({
      address, phoneNumber: contactNumber, joiningDate: joiningDate ? new Date(joiningDate).getTime() : null, drivingLicense: licenseNumber, name
    }).then(() => {
      triggerRender();
      setNewDriver({
        id: "",
        name: "",
        licenseNumber: "",
        contactNumber: "",
        address: "",
        joiningDate: "",
      })
      setIsAddDialogOpen(false)
    }).catch(error => {
      console.log({ error })
    })
  }, [newDriver])

  const handleEditDriver = useCallback(() => {
    const { address, contactNumber, joiningDate, licenseNumber, id, name } = selectedDriver

    driverInstance.patch({
      key: "driverId",
      value: id
    }, {
      address, phoneNumber: contactNumber, joiningDate: joiningDate ? new Date(joiningDate).getTime() : null, drivingLicense: licenseNumber, name
    }).then(() => {
      triggerRender();
      setIsEditDialogOpen(false)
    }).catch(error => {
      console.log({ error })
    })
  }, [selectedDriver])

  const confirmDelete = (id: string) => {
    setDriverToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteDriver = useCallback(() => {
    if (!driverToDelete) return

    driverInstance.deleteById({ key: 'driverId', value: driverToDelete }).then(() => {
      triggerRender();
      setIsDeleteDialogOpen(false);
      setDriverToDelete(null)
    }).catch(error => {
      console.log({ error })
    })
  }, [driverToDelete])

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
                    type="number"
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
