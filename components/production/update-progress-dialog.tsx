"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ProductionDetails, useFinished } from "@/app/inventory/finished-goods/context"
import { useOrders } from "@/contexts/order-context"
import moment from "moment"
import { PendingOrder } from "./pending-orders-table"
import { DataByTableName } from "../utils/api"

// Define a type for progress history entries
interface ProgressHistoryEntry {
  timestamp: string
  units: number
  totalUnits: number
  progressPercentage: number
}

// Mock data for progress history - in a real app, this would come from your backend
const mockProgressHistory: Record<string, ProgressHistoryEntry[]> = {
  "prod-1": [
    {
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      units: 0,
      totalUnits: 1500,
      progressPercentage: 0,
    },
    {
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      units: 300,
      totalUnits: 1500,
      progressPercentage: 20,
    },
    {
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      units: 750,
      totalUnits: 1500,
      progressPercentage: 50,
    },
  ],
  "prod-2": [
    {
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      units: 0,
      totalUnits: 800,
      progressPercentage: 0,
    },
  ],
  "prod-3": [
    {
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      units: 0,
      totalUnits: 1000,
      progressPercentage: 0,
    },
    {
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      units: 300,
      totalUnits: 1000,
      progressPercentage: 30,
    },
    {
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      units: 700,
      totalUnits: 1000,
      progressPercentage: 70,
    },
  ],
  "prod-4": [
    {
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      units: 0,
      totalUnits: 1200,
      progressPercentage: 0,
    },
    {
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      units: 600,
      totalUnits: 1200,
      progressPercentage: 50,
    },
    {
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      units: 1200,
      totalUnits: 1200,
      progressPercentage: 100,
    },
  ],
}

interface UpdateProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orders: ProductionOrder[]
  onUpdateProgress: (orderId: string, progress: number) => void
}

export function UpdateProgressDialog({ open, onOpenChange, onUpdateProgress }: UpdateProgressDialogProps) {
  const { productionDetails, triggerRerender } = useFinished();
  const { clientInfo, productInfo } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string>("")
  const [completedUnits, setCompletedUnits] = useState<number>(0)
  const [previousCompletedUnits, setPreviousCompletedUnits] = useState<number>(0)
  const [totalUnits, setTotalUnits] = useState<number>(0)
  const [progressPercentage, setProgressPercentage] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<ProductionOrder[]>([])

  useEffect(() => {
    setOrders(productionDetails.map(item => ({
      assignedTo: clientInfo[item.clientId]?.name,
      deadline: moment(item.startTime).format('LL'),
      id: item.id + '',
      progress: item.progress,
      quantity: item.numBottles,
      sku: productInfo[item.productionId]?.sku || '',
      startDate: moment(item.startTime).format('LL'),
      productionId: item.productionId
    }) as ProductionOrder))
  }, [productInfo, clientInfo, productionDetails])

  // Reset state when dialog opens
  useEffect(() => {
    if (open && orders.length > 0) {
      setSelectedOrderId(orders[0].id)
    } else {
      setSelectedOrderId("")
      setCompletedUnits(0)
      setPreviousCompletedUnits(0)
      setTotalUnits(0)
      setProgressPercentage(0)
      setError(null)
    }
  }, [open, orders])

  // Update state when selected order changes
  useEffect(() => {
    if (selectedOrderId) {
      const selectedOrder = orders.find((order) => order.id === selectedOrderId)
      if (selectedOrder) {
        // Calculate completed units based on progress percentage
        const total = selectedOrder.quantity
        const completed = Math.round(total * (selectedOrder.progress / 100))

        setTotalUnits(total)
        setCompletedUnits(completed)
        setPreviousCompletedUnits(completed)
        setProgressPercentage(selectedOrder.progress)
        setError(null)
      }
    }
  }, [selectedOrderId, orders])

  // Update progress percentage when completed units change
  const handleCompletedUnitsChange = (value: number) => {
    // Validate that new value is not less than previous value
    if (value < previousCompletedUnits) {
      setError(`Cannot decrease progress. Previous completed units: ${previousCompletedUnits}`)
      setCompletedUnits(previousCompletedUnits)
      return
    }

    // Validate that new value is not greater than total
    if (value > totalUnits) {
      setError(`Cannot exceed total units: ${totalUnits}`)
      setCompletedUnits(totalUnits)
      setProgressPercentage(100)
      return
    }

    setError(null)
    setCompletedUnits(value)

    if (totalUnits > 0) {
      const newProgress = Math.min(Math.round((value / totalUnits) * 100), 100)
      setProgressPercentage(newProgress)
    }
  }

  const selectedOrder = orders.find((order) => order.id === selectedOrderId)
  const progressHistory = selectedOrderId ? mockProgressHistory[selectedOrderId] || [] : []

  const handleSave = useCallback(() => {
    const productionId = selectedOrder?.productionId ?? ""

    const instance = new DataByTableName("production_details")

    if (!productionId) return;

    instance.patch({
      key: "productionId",
      value: productionId
    }, { progress: progressPercentage }).then(() => {
      onOpenChange(false)
      triggerRerender()
    }).catch(error => {
      console.log({ error })
    })
  }, [selectedOrder])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Update Production Progress</DialogTitle>
          <DialogDescription>Track the progress of production by entering completed units.</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 overflow-hidden flex-1 flex flex-col">
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
                  <Label htmlFor="completed-units">Completed Units</Label>
                  <Input
                    id="completed-units"
                    type="number"
                    min={previousCompletedUnits}
                    max={totalUnits}
                    value={completedUnits}
                    onChange={(e) =>
                      handleCompletedUnitsChange(Number.parseInt(e.target.value) || previousCompletedUnits)
                    }
                  />
                  {previousCompletedUnits > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      Previous: {previousCompletedUnits} units
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-units">Total Units</Label>
                  <Input id="total-units" type="number" value={totalUnits} readOnly className="bg-muted" />
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
                  <Label>Progress</Label>
                  <span className="text-sm font-medium">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">SKU:</span> {selectedOrder.sku}
                </div>
                <div>
                  <span className="font-medium">Assigned To:</span> {selectedOrder.assignedTo}
                </div>
                <div>
                  <span className="font-medium">Deadline:</span> {new Date(selectedOrder.deadline).toLocaleDateString()}
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2 flex-1 overflow-hidden">
                <h3 className="text-sm font-medium">Progress History</h3>
                <ScrollArea className="h-[180px] rounded-md border">
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
                            <span className="text-muted-foreground">Units:</span> {entry.units} of {entry.totalUnits}
                          </div>
                          <Progress value={entry.progressPercentage} className="h-1.5 mt-1" />
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedOrderId || !!error}>
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

