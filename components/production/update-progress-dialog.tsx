"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Clock, ArrowUp } from "lucide-react"
import type { ProductionOrder } from "@/types/production"
import { Separator } from "@/components/ui/separator"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"

// Define a type for progress history entries
interface ProgressHistoryEntry {
  timestamp: string
  completedUnits: number
  totalUnits: number
  progressPercentage: number
}

// Store for progress history - persists between dialog opens/closes
export const progressHistoryStore: Record<string, ProgressHistoryEntry[]> = {
  "prod-1": [
    {
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      completedUnits: 0,
      totalUnits: 1500,
      progressPercentage: 0,
    },
    {
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      completedUnits: 300,
      totalUnits: 1500,
      progressPercentage: 20,
    },
    {
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completedUnits: 750,
      totalUnits: 1500,
      progressPercentage: 50,
    },
  ],
  "prod-2": [
    {
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedUnits: 0,
      totalUnits: 800,
      progressPercentage: 0,
    },
  ],
  "prod-3": [
    {
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      completedUnits: 0,
      totalUnits: 1000,
      progressPercentage: 0,
    },
    {
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      completedUnits: 300,
      totalUnits: 1000,
      progressPercentage: 30,
    },
    {
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      completedUnits: 700,
      totalUnits: 1000,
      progressPercentage: 70,
    },
  ],
  "prod-4": [
    {
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      completedUnits: 0,
      totalUnits: 1200,
      progressPercentage: 0,
    },
    {
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      completedUnits: 600,
      totalUnits: 1200,
      progressPercentage: 50,
    },
    {
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      completedUnits: 1200,
      totalUnits: 1200,
      progressPercentage: 100,
    },
  ],
}

// Store for completed units - persists between dialog opens/closes
const completedUnitsStore: Record<string, number> = {}

interface UpdateProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: ProductionOrder[]
  onUpdateProgress: (orderId: string, progress: number) => void
  onSwitchToTracking?: () => void
}

export function UpdateProgressDialog({
  open,
  onOpenChange,
  orders,
  onUpdateProgress,
  onSwitchToTracking,
}: UpdateProgressDialogProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string>("")
  const [newCompletedUnits, setNewCompletedUnits] = useState<string>("")
  const [previousCompletedUnits, setPreviousCompletedUnits] = useState<number>(0)
  const [totalUnits, setTotalUnits] = useState<number>(0)
  const [progressPercentage, setProgressPercentage] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [updateConfirmDialogOpen, setUpdateConfirmDialogOpen] = useState(false)
  const [progressHistory, setProgressHistory] = useState<ProgressHistoryEntry[]>([])

  // Reset state when dialog opens
  useEffect(() => {
    if (open && orders.length > 0) {
      // If no order is selected yet, select the first one
      if (!selectedOrderId) {
        setSelectedOrderId(orders[0].id)
      }
    } else if (!open) {
      // Don't reset selectedOrderId when closing the dialog
      // This helps maintain the selection when reopening
      setNewCompletedUnits("")
      setError(null)
    }
  }, [open, orders, selectedOrderId])

  // Update state when selected order changes
  useEffect(() => {
    if (selectedOrderId) {
      const selectedOrder = orders.find((order) => order.id === selectedOrderId)
      if (selectedOrder) {
        const total = selectedOrder.quantity

        // Get the actual completed units from our store
        let completed = completedUnitsStore[selectedOrderId]

        // If we don't have a stored value, initialize to 0
        if (completed === undefined) {
          // Get the last history entry if available
          const history = progressHistoryStore[selectedOrderId] || []
          if (history.length > 0) {
            completed = history[history.length - 1].completedUnits
          } else {
            completed = 0
          }
          // Store this initial value
          completedUnitsStore[selectedOrderId] = completed
        }

        setTotalUnits(total)
        setNewCompletedUnits("")
        setPreviousCompletedUnits(completed)

        // Calculate progress percentage with 2 decimal places
        const exactProgress = (completed / total) * 100
        setProgressPercentage(Number.parseFloat(exactProgress.toFixed(2)))

        setError(null)

        // Get progress history for this order
        const history = progressHistoryStore[selectedOrderId] || []
        setProgressHistory(history)
      }
    }
  }, [selectedOrderId, orders])

  // Validate and update when new completed units change
  const handleNewCompletedUnitsChange = (value: string) => {
    // Allow empty string for user to type
    if (value === "") {
      setNewCompletedUnits("")
      setError(null)
      return
    }

    // Check if the value is a valid integer
    const numValue = Number.parseInt(value, 10)
    if (isNaN(numValue) || numValue.toString() !== value) {
      setError("Please enter a valid integer")
      setNewCompletedUnits(value)
      return
    }

    // Validate that new value is not negative
    if (numValue < 0) {
      setError("Cannot enter negative units")
      setNewCompletedUnits(value)
      return
    }

    // Validate that new value does not exceed remaining units
    const remainingUnits = totalUnits - previousCompletedUnits
    if (numValue > remainingUnits) {
      setError(`Cannot exceed remaining units: ${remainingUnits}`)
      setNewCompletedUnits(value)
      return
    }

    setError(null)
    setNewCompletedUnits(value)

    if (totalUnits > 0) {
      const newTotalCompleted = previousCompletedUnits + numValue
      // Calculate exact progress percentage with 2 decimal places
      const exactProgress = (newTotalCompleted / totalUnits) * 100
      setProgressPercentage(Number.parseFloat(exactProgress.toFixed(2)))
    }
  }

  const handleUpdateClick = () => {
    const numValue = Number.parseInt(newCompletedUnits, 10)

    if (selectedOrderId && !error && !isNaN(numValue) && numValue > 0) {
      const newTotalCompleted = previousCompletedUnits + numValue

      // Validate that completed + remaining = total
      if (newTotalCompleted > totalUnits) {
        setError(`Total completed units (${newTotalCompleted}) cannot exceed total units (${totalUnits})`)
        return
      }

      setUpdateConfirmDialogOpen(true)
    }
  }

  const confirmUpdate = () => {
    const numValue = Number.parseInt(newCompletedUnits, 10)

    if (selectedOrderId && !error && !isNaN(numValue) && numValue > 0) {
      const newTotalCompleted = previousCompletedUnits + numValue

      // Update our completed units store with the exact value
      completedUnitsStore[selectedOrderId] = newTotalCompleted

      // Calculate exact progress percentage with 2 decimal places
      const exactProgress = (newTotalCompleted / totalUnits) * 100
      const formattedProgress = Number.parseFloat(exactProgress.toFixed(2))

      // Create a new progress history entry with the exact units
      const newHistoryEntry: ProgressHistoryEntry = {
        timestamp: new Date().toISOString(),
        completedUnits: newTotalCompleted,
        totalUnits: totalUnits,
        progressPercentage: formattedProgress,
      }

      // Update the progress history in our local store
      const updatedHistory = [...progressHistory, newHistoryEntry]
      progressHistoryStore[selectedOrderId] = updatedHistory
      setProgressHistory(updatedHistory)

      // Update the progress in the parent component
      onUpdateProgress(selectedOrderId, formattedProgress)

      // Close the confirmation dialog
      setUpdateConfirmDialogOpen(false)

      // Close the main dialog
      onOpenChange(false)
    }
  }

  const handleCancelProduction = () => {
    setCancelDialogOpen(true)
  }

  const confirmCancelProduction = () => {
    if (selectedOrderId) {
      // First close the cancel dialog
      setCancelDialogOpen(false)

      // Then close the update dialog
      onOpenChange(false)

      // Update the order status to cancelled
      // We're using a timeout to ensure the dialogs are closed first
      setTimeout(() => {
        // Call the onUpdateProgress with a special flag for cancellation
        onUpdateProgress(selectedOrderId, -1) // Using -1 as a special flag for cancellation

        // Switch to the tracking tab to show the cancelled order
        if (onSwitchToTracking) {
          onSwitchToTracking()
        }
      }, 100)
    }
  }

  const selectedOrder = orders.find((order) => order.id === selectedOrderId)
  const remainingUnits = totalUnits - previousCompletedUnits
  const newTotalCompleted = previousCompletedUnits + (Number.parseInt(newCompletedUnits, 10) || 0)
  const newRemainingUnits = totalUnits - newTotalCompleted

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Update Production Progress</DialogTitle>
            <DialogDescription>Track the progress of production by entering completed units.</DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 overflow-y-auto pr-6" style={{ maxHeight: "calc(80vh - 200px)" }}>
            <div className="space-y-2">
              <Label htmlFor="order-select">Select Production Order</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger id="order-select">
                  <SelectValue placeholder="Select a production order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.sku} - {order.id.slice(0, 8)} ({order.progress}% complete)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOrder && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="completed-units">Units Completed in This Update</Label>
                    <Input
                      id="completed-units"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={newCompletedUnits}
                      onChange={(e) => handleNewCompletedUnitsChange(e.target.value)}
                      placeholder="Enter integer value"
                    />
                    <p className="text-xs text-muted-foreground flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      Previous total: {previousCompletedUnits} units
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-units">Total Units</Label>
                    <Input id="total-units" type="number" value={totalUnits} readOnly className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Remaining: {remainingUnits} units</p>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Progress After Update</Label>
                    <span className="text-sm font-medium">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      New total: {newTotalCompleted} of {totalUnits} units
                    </span>
                    <span>Remaining: {newRemainingUnits} units</span>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">SKU:</span> {selectedOrder.sku}
                  </div>
                  <div>
                    <span className="font-medium">Assigned To:</span> {selectedOrder.assignedTo}
                  </div>
                  <div>
                    <span className="font-medium">Deadline:</span>{" "}
                    {new Date(selectedOrder.deadline).toLocaleDateString()}
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Progress History</h3>
                  <div className="h-[180px] rounded-md border overflow-y-auto">
                    {progressHistory.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No progress history available</div>
                    ) : (
                      <div className="p-4 space-y-4">
                        {progressHistory.map((entry, index) => (
                          <div key={index} className="space-y-1 pb-3 border-b last:border-0">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center text-sm font-medium">
                                <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                {new Date(entry.timestamp).toLocaleDateString()} at{" "}
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </div>
                              <div className="text-sm font-semibold">{entry.progressPercentage}%</div>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Units:</span> {entry.completedUnits} of{" "}
                              {entry.totalUnits}
                            </div>
                            <Progress value={entry.progressPercentage} className="h-1.5 mt-1" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleCancelProduction}
                disabled={!selectedOrderId || progressPercentage === 100}
              >
                Cancel Production
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                onClick={handleUpdateClick}
                disabled={
                  !selectedOrderId || !!error || !newCompletedUnits || Number.parseInt(newCompletedUnits, 10) <= 0
                }
                className="bg-[#725af2] text-white hover:bg-[#5e48d0]"
              >
                Update
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Cancellation */}
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

      {/* Confirmation Dialog for Update */}
      <ConfirmationDialog
        open={updateConfirmDialogOpen}
        onOpenChange={setUpdateConfirmDialogOpen}
        title="Confirm Progress Update"
        description={`Are you sure you want to update the progress by adding ${newCompletedUnits} units? This will bring the total to ${newTotalCompleted} of ${totalUnits} units (${progressPercentage}%).`}
        confirmLabel="Update"
        cancelLabel="Cancel"
        onConfirm={confirmUpdate}
      />
    </>
  )
}
