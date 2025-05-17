"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, BarChart2 } from "lucide-react"
import { useProductionStore } from "@/hooks/use-production-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { progressHistoryStore } from "./update-progress-dialog"

interface ProductionKanbanProps {
  onViewDetails: (orderId: string) => void
  onUpdateProgress: (orderId: string, progress: number) => void
}

export function ProductionKanban({ onViewDetails, onUpdateProgress }: ProductionKanbanProps) {
  const { productionOrders } = useProductionStore()
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [unitsCompleted, setUnitsCompleted] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)
  const [progressPercentage, setProgressPercentage] = useState<number>(0)
  const [updateConfirmDialogOpen, setUpdateConfirmDialogOpen] = useState(false)
  const [previousCompletedUnits, setPreviousCompletedUnits] = useState<number>(0)

  // Group orders by status
  const columns = {
    inProgress: {
      id: "inProgress",
      title: "In Progress",
      items: productionOrders.filter(
        (order) => order.progress > 0 && order.progress < 100 && order.status !== "cancelled",
      ),
    },
    completed: {
      id: "completed",
      title: "Completed",
      items: productionOrders.filter((order) => order.progress === 100),
    },
    cancelled: {
      id: "cancelled",
      title: "Cancelled Orders",
      items: productionOrders.filter((order) => order.status === "cancelled"),
    },
  }

  const selectedOrder = productionOrders.find((order) => order.id === selectedOrderId)

  // Calculate remaining units and progress percentage
  const totalUnits = selectedOrder?.quantity || 0
  const remainingUnits = totalUnits - unitsCompleted

  const handleOpenUpdateDialog = (orderId: string) => {
    const order = productionOrders.find((o) => o.id === orderId)
    if (order) {
      setSelectedOrderId(orderId)

      // Get the actual completed units from our store or calculate from progress
      let completed = 0

      // Check if we have history for this order
      const history = progressHistoryStore[orderId] || []
      if (history.length > 0) {
        // Use the last history entry's completed units
        completed = history[history.length - 1].completedUnits
      } else {
        // Calculate exact units from the current progress
        completed = Math.round((order.progress / 100) * order.quantity)

        // Create an initial history entry if none exists
        progressHistoryStore[orderId] = [
          {
            timestamp: new Date(order.startDate).toISOString(),
            completedUnits: completed,
            totalUnits: order.quantity,
            progressPercentage: order.progress,
          },
        ]
      }

      setUnitsCompleted(completed)
      setPreviousCompletedUnits(completed)

      // Store the exact progress percentage
      setProgressPercentage(order.progress)

      setError(null)
      setUpdateDialogOpen(true)
    }
  }

  const handleUpdateClick = () => {
    if (selectedOrderId && selectedOrder && !error) {
      // Validate that new value is not less than previous
      if (unitsCompleted < previousCompletedUnits) {
        setError(`Cannot decrease from previous value of ${previousCompletedUnits} units`)
        return
      }

      setUpdateConfirmDialogOpen(true)
    }
  }

  const confirmUpdate = () => {
    if (selectedOrderId && selectedOrder && !error) {
      // Create a new progress history entry
      const newHistoryEntry = {
        timestamp: new Date().toISOString(),
        completedUnits: unitsCompleted,
        totalUnits: selectedOrder.quantity,
        progressPercentage: progressPercentage,
      }

      // Update the progress history in our local store
      const currentHistory = progressHistoryStore[selectedOrderId] || []
      progressHistoryStore[selectedOrderId] = [...currentHistory, newHistoryEntry]

      // Call the store to update the order progress
      onUpdateProgress(selectedOrderId, progressPercentage)

      // Close both dialogs
      setUpdateConfirmDialogOpen(false)
      setUpdateDialogOpen(false)
    }
  }

  const handleMarkComplete = (orderId: string) => {
    const order = productionOrders.find((o) => o.id === orderId)
    if (order) {
      // Create a history entry for 100% completion
      const newHistoryEntry = {
        timestamp: new Date().toISOString(),
        completedUnits: order.quantity,
        totalUnits: order.quantity,
        progressPercentage: 100,
      }

      // Update the progress history
      const currentHistory = progressHistoryStore[orderId] || []
      progressHistoryStore[orderId] = [...currentHistory, newHistoryEntry]

      // Update the progress
      onUpdateProgress(orderId, 100)
    }
  }

  const handleCancelProduction = (orderId: string) => {
    setOrderToCancel(orderId)
    setCancelDialogOpen(true)
  }

  const confirmCancelProduction = () => {
    if (orderToCancel) {
      // Call the store to update the order status
      const { updateOrderStatus } = useProductionStore.getState()
      updateOrderStatus(orderToCancel, "cancelled", 0)

      // Close both dialogs
      setCancelDialogOpen(false)
      setUpdateDialogOpen(false)
      setOrderToCancel(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Production Tracking</h2>
        <div className="text-sm text-muted-foreground flex items-center">
          <span className="text-red-500 mr-1 text-lg">★</span>
          Use the Update Progress button to move items to Completed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(columns).map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{column.title}</h3>
              <Badge variant="outline" className="px-2 py-1">
                {column.items.length} {column.items.length === 1 ? "Order" : "Orders"}
              </Badge>
            </div>
            <div className="flex-1 space-y-3 min-h-[500px] bg-muted/30 p-3 rounded-lg">
              {column.items.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No {column.title.toLowerCase()}
                </div>
              ) : (
                column.items.map((item) => (
                  <Card
                    key={item.id}
                    className={`border-l-4 ${
                      column.id === "completed"
                        ? "border-l-green-500"
                        : column.id === "cancelled"
                          ? "border-l-red-500"
                          : "border-l-[#f6c000]"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{item.sku}</CardTitle>
                        <Badge
                          variant="outline"
                          className={`
${
  column.id === "inProgress"
    ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
    : column.id === "completed"
      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
}
`}
                        >
                          {column.id === "inProgress"
                            ? "In Progress"
                            : column.id === "completed"
                              ? "Completed"
                              : "Cancelled"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Quantity:</span>
                          <span className="font-medium">{item.quantity.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={item.progress}
                            className={`h-2 flex-1 ${
                              item.progress === 100
                                ? "bg-[#2cd07e]/20 [&>div]:bg-[#2cd07e]"
                                : column.id === "cancelled"
                                  ? "bg-red-100 [&>div]:bg-red-500"
                                  : "bg-[#f6c000]/20 [&>div]:bg-[#f6c000]"
                            }`}
                          />
                          <span className="text-sm font-medium w-14">{item.progress.toFixed(2)}%</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Deadline: {new Date(item.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <div className="flex items-center gap-2 text-sm">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder-user.jpg" alt={item.assignedTo} />
                          <AvatarFallback>{item.assignedTo.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{item.assignedTo}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={() => onViewDetails(item.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {column.id === "inProgress" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs rounded-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50 dark:hover:text-blue-200"
                              onClick={() => handleOpenUpdateDialog(item.id)}
                            >
                              <BarChart2 className="h-3 w-3 mr-1" />
                              Update
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs rounded-full bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/50 dark:hover:text-green-200"
                              onClick={() => handleMarkComplete(item.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                          </>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Production Progress</DialogTitle>
            <DialogDescription>
              {selectedOrder && (
                <>
                  Update production units for <span className="font-medium">{selectedOrder.sku}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              {selectedOrder && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Order Quantity</p>
                    <p className="text-lg font-semibold">{selectedOrder.quantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Progress</p>
                    <p className="text-lg font-semibold">{selectedOrder.progress.toFixed(2)}%</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="units-completed" className="text-sm font-medium">
                  Units Completed
                </label>
                <Input
                  id="units-completed"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={unitsCompleted}
                  onChange={(e) => {
                    const value = e.target.value

                    // Allow empty string for user to clear the field
                    if (value === "") {
                      setUnitsCompleted(0)
                      setError(null)
                      return
                    }

                    // Check if the value is a valid integer
                    const numValue = Number.parseInt(value, 10)
                    if (isNaN(numValue) || numValue.toString() !== value) {
                      setError("Please enter a valid integer")
                      return
                    }

                    // Update the units completed
                    setUnitsCompleted(numValue)

                    if (selectedOrder) {
                      // Prevent decreasing progress
                      if (numValue < previousCompletedUnits) {
                        setError(
                          `Cannot decrease progress. Previous completed units: ${previousCompletedUnits.toLocaleString()}`,
                        )
                        return
                      }

                      if (numValue > selectedOrder.quantity) {
                        setError(`Cannot exceed order quantity of ${selectedOrder.quantity.toLocaleString()} units`)
                        return
                      }

                      setError(null)

                      // Calculate exact progress percentage with 2 decimal places
                      const exactProgress = (numValue / selectedOrder.quantity) * 100
                      setProgressPercentage(Number.parseFloat(exactProgress.toFixed(2)))
                    }
                  }}
                  className="w-full"
                />
                {previousCompletedUnits > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span className="mr-1">↑</span>
                    Previous total: {previousCompletedUnits.toLocaleString()} units
                  </p>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md">
                <div>
                  <p className="text-sm font-medium">Remaining Units</p>
                  <p className="text-lg font-semibold text-amber-600">
                    {selectedOrder ? (selectedOrder.quantity - unitsCompleted).toLocaleString() : 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">New Progress</p>
                  <p className="text-lg font-semibold text-blue-600">{progressPercentage.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button
                variant="destructive"
                onClick={() => selectedOrderId && handleCancelProduction(selectedOrderId)}
                disabled={!selectedOrderId || selectedOrder?.progress === 100}
              >
                Cancel Production
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateClick} disabled={!!error}>
                  Update
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Confirmation Dialog */}
      <ConfirmationDialog
        open={updateConfirmDialogOpen}
        onOpenChange={setUpdateConfirmDialogOpen}
        title="Confirm Progress Update"
        description={
          selectedOrder
            ? `Are you sure you want to update the progress to ${unitsCompleted} units (${progressPercentage.toFixed(2)}%)?`
            : "Confirm progress update"
        }
        confirmLabel="Update"
        cancelLabel="Cancel"
        onConfirm={confirmUpdate}
      />

      {/* Cancellation Confirmation Dialog */}
      <ConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Confirm Production Cancellation"
        description="Are you sure you want to cancel this production order?"
        confirmLabel="Confirm"
        cancelLabel="Go Back"
        onConfirm={confirmCancelProduction}
        variant="destructive"
      />
    </div>
  )
}
