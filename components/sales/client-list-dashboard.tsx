"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus, Search, Edit, Trash2, Eye } from "lucide-react"
import { ClientDetailsDialog } from "@/components/sales/client-details-dialog"
import { ClientViewDialog } from "@/components/sales/client-view-dialog"
import { AddClientDialog } from "@/components/sales/add-client-dialog"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { useToast } from "@/hooks/use-toast"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Client, useClient } from "@/app/sales/client-list/client-context"


export function ClientListDashboard() {
  const { clientMapper, deleteClient, refetchContext } = useClient();
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    setClients(Object.values(clientMapper))
  }, [clientMapper])
  const [searchQuery, setSearchQuery] = useState("")
  const [clientTypeFilter, setClientTypeFilter] = useState("All")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewClient, setViewClient] = useState<Client | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const { toast } = useToast()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredClients = clients.filter(
    (client) =>
      (client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.id + "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (clientTypeFilter === "All" || client.clientType === clientTypeFilter),
  )

  // Get current clients for pagination
  const indexOfLastClient = currentPage * itemsPerPage
  const indexOfFirstClient = indexOfLastClient - itemsPerPage
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient)

  const handleAddClient = (newClient: Client) => {
    // Create the complete client object
    const clientToAdd = {
      ...newClient,
      id: clients.length + 1,
      // Add any other default fields that might be needed
      status: "Active",
    }

    // Update the clients state with the new client
    setClients([...clients, clientToAdd])

    // Show success toast
    toast({
      title: "Client Added",
      description: `${newClient.name} has been added successfully.`,
    })

    console.log("Added new client:", clientToAdd)
  }

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
    toast({
      title: "Client Updated",
      description: `${updatedClient.name} has been updated successfully.`,
    })
  }

  const confirmDelete = (client: Client) => {
    setClientToDelete(client)
    setShowDeleteDialog(true)
  }

  const handleDeleteClient = () => {
    if (!clientToDelete) return

    deleteClient(clientToDelete).then(() => {
      setClientToDelete(null);
      refetchContext()
    })
  }

  // Handle page change
  const handlePageChange = (page: any) => {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Client List</h2>
        <Button onClick={() => setShowAddDialog(true)} className="bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-white">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>Manage your client relationships and information.</CardDescription>
          <div className="flex w-full items-center space-x-2 mt-4">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button type="submit" size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={clientTypeFilter} onValueChange={setClientTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Distributor">Distributor</SelectItem>
                <SelectItem value="Wholeseller">Wholeseller</SelectItem>
                <SelectItem value="Hotels&Restaurants">Hotels & Restaurants</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                currentClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.clientId}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.clientType}</TableCell>
                    <TableCell>{client.contactPerson}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phoneNumber}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                          onClick={() => {
                            setViewClient(client)
                            setShowViewDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (!client) return;
                            setSelectedClient(client)
                            setShowDetailsDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => confirmDelete(client)}
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

          {/* Pagination */}
          <DataTablePagination
            totalItems={filteredClients.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {showDetailsDialog && selectedClient && (
        <ClientDetailsDialog
          client={selectedClient}
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          onSave={handleUpdateClient}
        />
      )}

      {showViewDialog && viewClient && (
        <ClientViewDialog client={viewClient} open={showViewDialog} onOpenChange={setShowViewDialog} />
      )}

      <AddClientDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAddClient={handleAddClient} />

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Client"
        description={`Are you sure you want to delete ${clientToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteClient}
        variant="destructive"
      />
    </div>
  )
}
