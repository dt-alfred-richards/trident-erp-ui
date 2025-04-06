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
import { DataByTableName } from "../utils/api"

export function VehiclesTable() {
  const dimVehicleInstance = new DataByTableName("dim_vehicle");

  const { vehicles: _vehicles = {}, triggerRender = () => { } } = useLogisticsData();

  const [vehicles, setVehicles] = useState<any[]>([])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null)
  const [newVehicle, setNewVehicle] = useState({
    id: "",
    type: "",
    model: "",
    capacity: "",
    registrationNumber: "",
  })
  const { toast } = useToast()

  console.log({ newVehicle })

  useEffect(() => {
    setVehicles(Object.values(_vehicles).map(item => ({
      id: item.vehicleId,
      type: item.type,
      model: item.model,
      capacity: item.maxLoad,
      registrationNumber: item.registrationNumber
    })) as any)
  }, [_vehicles])

  const handleAddVehicle = useCallback(() => {
    const { type, capacity, model, registrationNumber } = newVehicle
    dimVehicleInstance.post({
      type,
      model,
      registrationNumber,
      maxLoad: capacity
    }).then(() => {
      triggerRender();
      setIsAddDialogOpen(false)
    }).catch(error => {
      console.log({ error })
    })
  }, [newVehicle])

  const handleEditVehicle = useCallback(() => {

    const payload = Object.fromEntries(Object.entries({
      type: selectedVehicle.type,
      model: selectedVehicle.model,
      maxLoad: selectedVehicle.capacity,
      registrationNumber: selectedVehicle.registrationNumber
    }).filter(item => item[1]))

    dimVehicleInstance.patch({
      key: "vehicleId",
      value: selectedVehicle?.id || ""
    }, payload).then(_ => {
      triggerRender()
      setIsEditDialogOpen(false)
    }).catch(error => {
      console.log({ error })
    })
  }, [selectedVehicle])

  const confirmDelete = (id: string) => {
    setVehicleToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteVehicle = useCallback(() => {
    if (!vehicleToDelete) return;

    dimVehicleInstance.deleteById(
      {
        key: "vehicleId",
        value: vehicleToDelete || ""
      }
    ).then(() => {
      triggerRender();
      setVehicleToDelete(null)
      setIsDeleteDialogOpen(false)
    }).catch(error => {
      console.log({ error })
    })

  }, [vehicleToDelete])

  const openEditDialog = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Vehicles</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>Enter the details of the new vehicle to add to the fleet.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Input
                    id="type"
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={newVehicle.registrationNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, registrationNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVehicle}>Add Vehicle</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.id}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>{vehicle.model}</TableCell>
                <TableCell>{vehicle.capacity}</TableCell>
                <TableCell>{vehicle.registrationNumber}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(vehicle)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(vehicle.id)}
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

      {/* Edit Vehicle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>Update the details of vehicle {selectedVehicle?.id}.</DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Vehicle Type</Label>
                  <Input
                    id="edit-type"
                    value={selectedVehicle.type}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-model">Model</Label>
                  <Input
                    id="edit-model"
                    value={selectedVehicle.model}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, model: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacity</Label>
                  <Input
                    id="edit-capacity"
                    value={selectedVehicle.capacity}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, capacity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-registrationNumber">Registration Number</Label>
                  <Input
                    id="edit-registrationNumber"
                    value={selectedVehicle.registrationNumber}
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, registrationNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditVehicle}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Vehicle"
        description={`Are you sure you want to delete vehicle ${vehicleToDelete}? This action cannot be undone.`}
        onConfirm={handleDeleteVehicle}
      />
    </div>
  )
}
