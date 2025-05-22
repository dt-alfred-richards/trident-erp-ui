"use client"

import { useState } from "react"
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

// Sample client data with removed fields
const initialClients = [
  {
    id: "CL-001",
    name: "Acme Corporation",
    contactPerson: "John Doe",
    email: "john.doe@acme.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, New York, NY 10001",
    status: "Active",
    lastOrder: "2023-04-15",
    totalOrders: 24,
    totalValue: "$145,780",
    clientType: "Corporate",
  },
  {
    id: "CL-002",
    name: "TechNova Solutions",
    contactPerson: "Jane Smith",
    email: "jane.smith@technova.com",
    phone: "+1 (555) 987-6543",
    address: "456 Innovation Blvd, San Francisco, CA 94105",
    status: "Active",
    lastOrder: "2023-04-02",
    totalOrders: 18,
    totalValue: "$98,450",
    clientType: "Corporate",
  },
  {
    id: "CL-003",
    name: "Global Industries",
    contactPerson: "Robert Johnson",
    email: "robert@globalind.com",
    phone: "+1 (555) 456-7890",
    address: "789 Enterprise St, Chicago, IL 60601",
    status: "Inactive",
    lastOrder: "2023-01-20",
    totalOrders: 7,
    totalValue: "$42,300",
    clientType: "Distributor",
  },
  {
    id: "CL-004",
    name: "Sunrise Manufacturing",
    contactPerson: "Emily Chen",
    email: "emily.chen@sunrise.com",
    phone: "+1 (555) 234-5678",
    address: "101 Factory Lane, Detroit, MI 48201",
    status: "Active",
    lastOrder: "2023-03-28",
    totalOrders: 15,
    totalValue: "$87,620",
    clientType: "Wholeseller",
  },
  {
    id: "CL-005",
    name: "Quantum Enterprises",
    contactPerson: "Michael Brown",
    email: "michael@quantum.com",
    phone: "+1 (555) 876-5432",
    address: "202 Quantum Drive, Austin, TX 78701",
    status: "Active",
    lastOrder: "2023-04-10",
    totalOrders: 12,
    totalValue: "$65,890",
    clientType: "Corporate",
  },
  {
    id: "CL-006",
    name: "Pinnacle Systems",
    contactPerson: "Sarah Wilson",
    email: "sarah@pinnacle.com",
    phone: "+1 (555) 222-3333",
    address: "303 Summit Road, Boston, MA 02108",
    status: "Active",
    lastOrder: "2023-04-05",
    totalOrders: 9,
    totalValue: "$54,320",
    clientType: "Hotels&Restaurants",
  },
  {
    id: "CL-007",
    name: "Horizon Distributors",
    contactPerson: "David Lee",
    email: "david@horizon.com",
    phone: "+1 (555) 444-5555",
    address: "404 Skyline Ave, Seattle, WA 98101",
    status: "Inactive",
    lastOrder: "2023-02-15",
    totalOrders: 5,
    totalValue: "$28,750",
    clientType: "Distributor",
  },
  {
    id: "CL-008",
    name: "Elite Innovations",
    contactPerson: "Jennifer Taylor",
    email: "jennifer@elite.com",
    phone: "+1 (555) 666-7777",
    address: "505 Tech Parkway, Denver, CO 80202",
    status: "Active",
    lastOrder: "2023-03-22",
    totalOrders: 14,
    totalValue: "$76,430",
    clientType: "Wholeseller",
  },
]

export function ClientListDashboard() {
  const [clients, setClients] = useState(initialClients)
  const [searchQuery, setSearchQuery] = useState("")
  const [clientTypeFilter, setClientTypeFilter] = useState("All")
  const [selectedClient, setSelectedClient] = useState(null)
  const [viewClient, setViewClient] = useState(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const { toast } = useToast()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredClients = clients.filter(
    (client) =>
      (client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (clientTypeFilter === "All" || client.clientType === clientTypeFilter),
  )

  // Get current clients for pagination
  const indexOfLastClient = currentPage * itemsPerPage
  const indexOfFirstClient = indexOfLastClient - itemsPerPage
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient)

  const handleAddClient = (newClient) => {
    // Generate a new client ID
    const newId = `CL-${String(clients.length + 1).padStart(3, "0")}`

    // Create the complete client object
    const clientToAdd = {
      ...newClient,
      id: newId,
      // Add any other default fields that might be needed
      status: "Active",
      lastOrder: "-",
      totalOrders: 0,
      totalValue: "₹0.00",
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

  const handleUpdateClient = (updatedClient) => {
    setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
    toast({
      title: "Client Updated",
      description: `${updatedClient.name} has been updated successfully.`,
    })
  }

  const confirmDelete = (client) => {
    setClientToDelete(client)
    setShowDeleteDialog(true)
  }

  const handleDeleteClient = () => {
    if (!clientToDelete) return

    setClients(clients.filter((client) => client.id !== clientToDelete.id))
    toast({
      title: "Client Removed",
      description: `${clientToDelete.name} has been removed successfully.`,
    })
    setClientToDelete(null)
  }

  // Handle page change
  const handlePageChange = (page) => {
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
                    <TableCell className="font-medium">{client.id}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.clientType}</TableCell>
                    <TableCell>{client.contactPerson}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
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
