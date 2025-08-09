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
  const { updateOrderProgress, updateOrderStatus } = useProductionStore()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [updateProgressDialogOpen, setUpdateProgressDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedSku, setSelectedSku] = useState<string | null>(null)
  const [selectedDeficit, setSelectedDeficit] = useState<number>(0)
  const [activeTab, setActiveTab] = useState("overview")

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId)
    setDetailsDialogOpen(true)
  }

  const handleUpdateProgress = (orderId: string, progress: number) => {
    // Special case for cancellation
    if (progress === -1) {
      updateOrderStatus(orderId, "cancelled", 0)
    } else {
      updateOrderProgress(orderId, progress)
    }
  }

  const handleProduceClick = (sku: string, deficit: number) => {
    // Only set the SKU for the dialog, not for filtering
    setSelectedDeficit(deficit)
    setCreateDialogOpen(true)

    // Pass the SKU directly to the dialog without affecting the filter
    setSelectedSku(sku)
  }

  // Add a separate function for filtering the pending orders table
  const handleFilterPendingOrders = (sku: string) => {
    setSelectedSku(sku)
  }

  const handleCreateNewOrder = () => {
    setSelectedSku(null)
    setSelectedDeficit(0)
    setCreateDialogOpen(true)
  }

  const handleSwitchToTracking = () => {
    setActiveTab("tracking")
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Production</h2>
          <p className="text-muted-foreground">Manage production orders and track manufacturing progress</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setUpdateProgressDialogOpen(true)}
            className="bg-[#725af2] hover:bg-[#725af2]/90 text-white border-[#725af2]"
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            Update Progress
          </Button>
          <Button
            onClick={handleCreateNewOrder}
            className="bg-[#1b84ff] hover:bg-[#1b84ff]/90 text-white border-[#1b84ff]"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Production Order
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:dark:bg-[#020817] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Production Overview
          </TabsTrigger>
          <TabsTrigger
            value="tracking"
            className="data-[state=active]:bg-white data-[state=active]:dark:bg-[#020817] data-[state=active]:text-[#1b84ff] data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff]"
          >
            Production Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="space-y-6">
            {/* SKU Overview Table */}
            <div>
              <ProductionOverview
                onProduceClick={handleProduceClick}
                onViewOrders={() => { }}
                onViewDemand={handleFilterPendingOrders}
              />
            </div>

            {/* Pending Orders Table */}
            <div className="mt-8">
              <PendingOrdersTable filterSku={null} />
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
        sku={selectedSku || ""}
        deficit={selectedDeficit}
      />

      {/* {selectedOrderId && (
        <ProductionOrderDetails
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          orderId={selectedOrderId}
        />
      )} */}

      <UpdateProgressDialog
        open={updateProgressDialogOpen}
        onOpenChange={setUpdateProgressDialogOpen}
        onUpdateProgress={handleUpdateProgress}
        onSwitchToTracking={handleSwitchToTracking}
      />
    </div>
  )
}
