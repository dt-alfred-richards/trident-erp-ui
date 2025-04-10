"use client"

import { useCallback, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DataByTableName } from "../utils/api"
import { useOrders } from "@/contexts/order-context"

interface ClientDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: any // Replace 'any' with a more specific type if available
  onSave: (updatedClient: any) => void // Replace 'any' with a more specific type if available
}

export function ClientDetailsDialog({ open, onOpenChange, client, onSave }: ClientDetailsDialogProps) {
  const [editedClient, setEditedClient] = useState<any>(client || {})
  const { setRefetchData } = useOrders()

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedClient((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = useCallback(() => {
    const { name = "", id, contactPerson = "", email = "", phone = 0, address = "" } = editedClient

    const payload = {
      name: name,
      reference: contactPerson,
      email,
      contactNumber: phone,
      address
    }

    const instance = new DataByTableName("dim_client_v2");

    instance.patch({
      key: "clientId",
      value: id
    }, payload).then(() => {
      onSave(editedClient)
      onOpenChange(false)
      setRefetchData(p => !p)
    }).catch(error => {
      console.log({ error })
    })
  }, [editedClient])

  console.log({ editedClient })
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
            <Input id="client-id" value={editedClient?.id || ""} className="col-span-3" readOnly />
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
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              value={editedClient?.phone || ""}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Textarea
              id="address"
              name="address"
              value={editedClient?.address || ""}
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
