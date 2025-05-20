"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Client, useClient } from "@/app/sales/client-list/client-context"

interface ClientDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Partial<Client> // Replace 'any' with a more specific type if available
  onSave: (updatedClient: any) => void // Replace 'any' with a more specific type if available
}

export function ClientDetailsDialog({ open, onOpenChange, client, onSave }: ClientDetailsDialogProps) {
  const [editedClient, setEditedClient] = useState(client || {})
  const { editClient, refetchContext } = useClient()

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedClient((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    const payload: Partial<Client> = {
      phoneNumber: editedClient.phoneNumber,
      panNumber: editedClient.panNumber,
      gstNumber: editedClient.gstNumber,
      shippingAddress: editedClient.shippingAddress,
      name: editedClient.name,
      contactPerson: editedClient.contactPerson,
      email: editedClient.email
    }
    editClient(payload, editedClient.id).then(() => {
      onOpenChange(false)
      refetchContext()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client-id" className="text-right">
              Client ID
            </Label>
            <Input id="client-id" value={editedClient?.clientId || ""} className="col-span-3" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client-name" className="text-right">
              Client Name
            </Label>
            <Input
              id="client-name"
              name="name"
              value={editedClient?.name || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact-person" className="text-right">
              Contact Person
            </Label>
            <Input
              id="contact-person"
              name="contactPerson"
              value={editedClient?.contactPerson || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={editedClient?.email || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phoneNumber" className="text-right">
              Phone
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={editedClient?.phoneNumber || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gstNumber" className="text-right">
              Gst number
            </Label>
            <Input
              id="gstNumber"
              name="gstNumber"
              value={editedClient?.gstNumber || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="panNumber" className="text-right">
              Pan number
            </Label>
            <Input
              id="panNumber"
              name="panNumber"
              value={editedClient?.panNumber || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shippingAddress" className="text-right">
              Address
            </Label>
            <Textarea
              id="shippingAddress"
              name="shippingAddress"
              value={editedClient?.shippingAddress || ""}
              onChange={handleChange}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
