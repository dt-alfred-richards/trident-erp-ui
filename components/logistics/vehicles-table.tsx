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
import { Edit, Plus, Trash2, Search } from "lucide-react"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { useVehicleContext, Vehicle } from "./vehicle-context"
import { getChildObject } from "../generic"

// Sample vehicle data
const initialVehicles = [
  {
    id: "VEH001",
    type: "Truck",
    model: "Tata Ace",
    capacity: "1 Ton",
    registrationNumber: "MH 01 AB 1234",
  },
  {
    id: "VEH002",
    type: "Van",
    model: "Mahindra Supro",
    capacity: "750 kg",
    registrationNumber: "MH 02 CD 5678",
  },
  {
    id: "VEH003",
    type: "Truck",
    model: "Ashok Leyland Dost",
    capacity: "1.25 Ton",
    registrationNumber: "MH 03 EF 9012",
  },
  {
    id: "VEH004",
    type: "Truck",
    model: "Eicher Pro 1049",
    capacity: "2.5 Ton",
    registrationNumber: "MH 04 GH 3456",
  },
  {
    id: "VEH005",
    type: "Van",
    model: "Tata Winger",
    capacity: "1 Ton",
    registrationNumber: "MH 05 IJ 7890",
  },
  {
    id: "VEH006",
    type: "Truck",
    model: "Tata 407",
    capacity: "2.5 Ton",
    registrationNumber: "MH 06 KL 1234",
  },
  {
    id: "VEH007",
    type: "Van",
    model: "Force Traveller",
    capacity: "1.2 Ton",
    registrationNumber: "MH 07 MN 5678",
  },
  {
    id: "VEH008",
    type: "Truck",
    model: "Mahindra Bolero Pickup",
    capacity: "1.5 Ton",
    registrationNumber: "MH 08 OP 9012",
  },
]

export function VehiclesTable() {
  const { addVehicle = () => { }, vehicles: contextVehicles, updateVehicle, deleteVehicle } = useVehicleContext()

  const [vehicles, setVehicles] = useState(initialVehicles)
  useEffect(() => {
    setVehicles(contextVehicles.map((item: Vehicle) => ({
      id: item.vehicleId,
      type: item.vehicleType,
      model: item.model,
      capacity: item.capacity,
      registrationNumber: item.registrationNumber,
    })))
  }, [contextVehicles])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null)
  const [newVehicle, setNewVehicle] = useState({
    vehicleType: "",
    model: "",
    capacity: "",
    registrationNumber: "",
  })
  const { toast } = useToast()

  // Add search functionality to the vehicles table
  const [searchQuery, setSearchQuery] = useState("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter((vehicle) => {
    const query = searchQuery.toLowerCase()
    return (
      vehicle.id.toLowerCase().includes(query) ||
      vehicle.type.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.registrationNumber.toLowerCase().includes(query) ||
      vehicle.capacity.toLowerCase().includes(query)
    )
  })

  // Get current vehicles for pagination
  const indexOfLastVehicle = currentPage * itemsPerPage
  const indexOfFirstVehicle = indexOfLastVehicle - itemsPerPage
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  console.log(newVehicle)

  const handleAddVehicle = () => {
    if (!addVehicle) return;

    // Generate a new ID
    addVehicle(newVehicle).then((res: any) => {
      setNewVehicle({
        vehicleType: "",
        model: "",
        capacity: "",
        registrationNumber: "",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Vehicle Added",
        description: `Vehicle ${getChildObject(res, "data.0.vehicleId")} has been added successfully.`,
      })
    })
  }

  const handleEditVehicle = () => {
    const payload = {
      capacity: selectedVehicle.capacity,
      model: selectedVehicle.model,
      registrationNumber: selectedVehicle.registrationNumber,
      vehicleType: selectedVehicle.type
    } as Partial<Vehicle>
    delete payload["id"]
    updateVehicle(selectedVehicle.id, payload).then(() => {
      setIsEditDialogOpen(false)
      setSelectedVehicle(null)
      toast({
        title: "Vehicle Updated",
        description: `Vehicle ${selectedVehicle.id} has been updated successfully.`,
      })
    })
  }

  const confirmDelete = (id: string) => {
    setVehicleToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteVehicle = () => {
    if (!vehicleToDelete) return

    deleteVehicle(vehicleToDelete).then(() => {
      setIsDeleteDialogOpen(false)
      toast({
        title: "Vehicle Deleted",
        description: `Vehicle ${vehicleToDelete} has been deleted successfully.`,
      })
      setVehicleToDelete(null)
    })

  }

  const openEditDialog = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Vehicles</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vehicles..."
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
              <Button className="bg-[#1c86ff] hover:bg-[#1a78e6] text-[#ffffff]">
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
                      value={newVehicle.vehicleType}
                      onChange={(e) => setNewVehicle({ ...newVehicle, vehicleType: e.target.value })}
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
                <Button onClick={handleAddVehicle} className="bg-[#1b84ff] hover:bg-[#0a6edf] text-[#ffffff]">
                  Add Vehicle
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
              <TableHead>Type</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No vehicles found.
                </TableCell>
              </TableRow>
            ) : (
              currentVehicles.map((vehicle) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        totalItems={filteredVehicles.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

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
