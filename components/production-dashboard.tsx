"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, BarChart2 } from "lucide-react"
import { ProductionOverview } from "@/components/production/production-overview"
import { PendingOrdersTable } from "@/components/production/pending-orders-table"
import { ProductionKanban } from "@/components/production/production-kanban"
import { CreateProductionDialog } from "@/components/production/create-production-dialog"
import { ProductionOrderDetails } from "@/components/production/production-order-details"
import { UpdateProgressDialog } from "@/components/production/update-progress-dialog"
import { useProductionStore } from "@/hooks/use-production-store"

export function ProductionDashboard() {
  const { productionOrders, updateOrderProgress } = useProductionStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [updateProgressDialogOpen, setUpdateProgressDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedSku, setSelectedSku] = useState<string | null>(null)
  const [selectedDeficit, setSelectedDeficit] = useState<number>(0)

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId)
    setDetailsDialogOpen(true)
  }

  const handleUpdateProgress = (orderId: string, progress: number) => {
    updateOrderProgress(orderId, progress)
  }

  const handleProduceClick = (sku: string, deficit: number) => {
    setSelectedSku(sku)
    setSelectedDeficit(deficit)
    setCreateDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Production</h2>
          <p className="text-muted-foreground">Manage production orders and track manufacturing progress</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setUpdateProgressDialogOpen(true)}>
            <BarChart2 className="mr-2 h-4 w-4" />
            Update Progress
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Production Order
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Production Overview</TabsTrigger>
          <TabsTrigger value="tracking">Production Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="space-y-6">
            {/* SKU Overview Table */}
            <div>
              <ProductionOverview
                onProduceClick={handleProduceClick}
                onViewOrders={() => {}}
                onViewDemand={(sku) => setSelectedSku(sku)}
              />
            </div>

            {/* Pending Orders Table */}
            <div className="mt-8">
              <PendingOrdersTable filterSku={selectedSku} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          {/* Production Tracking (Kanban) */}
          <div>
            <ProductionKanban onViewDetails={handleViewDetails} onUpdateProgress={handleUpdateProgress} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateProductionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        sku={selectedSku || undefined}
        deficit={selectedDeficit}
      />

      {selectedOrderId && (
        <ProductionOrderDetails
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          orderId={selectedOrderId}
        />
      )}

      <UpdateProgressDialog
        open={updateProgressDialogOpen}
        onOpenChange={setUpdateProgressDialogOpen}
        orders={productionOrders}
        onUpdateProgress={handleUpdateProgress}
      />
    </div>
  )
}

