"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { BomTable } from "@/components/bom/bom-table"
import { CreateBomDialog } from "@/components/bom/create-bom-dialog"
import { useBomStore } from "@/hooks/use-bom-store"
import { BomProvider } from "./bom-context"
import { InventoryProvider } from "@/app/inventory-context"

export function BomDashboard() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { } = useBomStore()

  return (
    <InventoryProvider>
      <BomProvider>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-bold tracking-tight">Bill of Materials</h2>
              <p className="text-muted-foreground">Manage product BOMs and component requirements</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New BOM
            </Button>
          </div>

          <div className="space-y-4">
            <BomTable />
          </div>

          <CreateBomDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
        </div>
      </BomProvider>
    </InventoryProvider>
  )
}
