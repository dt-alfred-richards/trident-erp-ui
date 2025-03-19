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

  // Group orders by status - removed "planned" section
  const columns = {
    inProgress: {
      id: "inProgress",
      title: "In Progress",
      items: productionOrders.filter((order) => order.progress > 0 && order.progress < 100),
    },
    completed: {
      id: "completed",
      title: "Completed",
      items: productionOrders.filter((order) => order.progress === 100),
    },
  }

  const selectedOrder = productionOrders.find((order) => order.id === selectedOrderId)

  // Calculate remaining units and progress percentage
  const totalUnits = selectedOrder?.quantity || 0
  const remainingUnits = totalUnits - unitsCompleted
  const progressPercentage = totalUnits > 0 ? Math.round((unitsCompleted / totalUnits) * 100) : 0

  const handleOpenUpdateDialog = (orderId: string) => {
    const order = productionOrders.find((o) => o.id === orderId)
    if (order) {
      setSelectedOrderId(orderId)
      // Initialize units completed based on current progress
      const initialUnitsCompleted = Math.round((order.progress / 100) * order.quantity)
      setUnitsCompleted(initialUnitsCompleted)
      setError(null)
      setUpdateDialogOpen(true)
    }
  }

  const handleUnitsChange = (value: string) => {
    const units = Number.parseInt(value, 10) || 0

    if (selectedOrder) {
      if (units > selectedOrder.quantity) {
        setError(`Cannot exceed order quantity of ${selectedOrder.quantity.toLocaleString()} units`)
        setUnitsCompleted(selectedOrder.quantity)
      } else if (units < 0) {
        setError("Units completed cannot be negative")
        setUnitsCompleted(0)
      } else {
        setError(null)
        setUnitsCompleted(units)
      }
    }
  }

  const handleSaveProgress = () => {
    if (selectedOrderId && selectedOrder) {
      // Convert units to percentage
      const progress = Math.round((unitsCompleted / selectedOrder.quantity) * 100)
      onUpdateProgress(selectedOrderId, progress)
      setUpdateDialogOpen(false)
    }
  }

  const handleMarkComplete = (orderId: string) => {
    onUpdateProgress(orderId, 100)
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  No {column.title.toLowerCase()} orders
                </div>
              ) : (
                column.items.map((item) => (
                  <Card
                    key={item.id}
                    className={`border-l-4 ${column.id === "completed" ? "border-l-green-500" : "border-l-blue-500"}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{item.sku}</CardTitle>
                        <Badge variant={column.id === "completed" ? "default" : "outline"}>
                          {column.id === "inProgress" ? "In Progress" : "Completed"}
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
                            className={`h-2 flex-1 ${item.progress === 100 ? "bg-green-100" : ""}`}
                          />
                          <span className="text-sm font-medium w-9">{item.progress}%</span>
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
                          className="h-7 w-7 p-0"
                          onClick={() => onViewDetails(item.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {column.id === "inProgress" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200"
                              onClick={() => handleOpenUpdateDialog(item.id)}
                            >
                              <BarChart2 className="h-3 w-3 mr-1 text-blue-600" />
                              Update
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200"
                              onClick={() => handleMarkComplete(item.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
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
                    <p className="text-lg font-semibold">{selectedOrder.progress}%</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="units-completed" className="text-sm font-medium">
                  Units Completed
                </label>
                <Input
                  id="units-completed"
                  type="number"
                  value={unitsCompleted}
                  onChange={(e) => handleUnitsChange(e.target.value)}
                  min={0}
                  max={selectedOrder?.quantity}
                  className="w-full"
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md">
                <div>
                  <p className="text-sm font-medium">Remaining Units</p>
                  <p className="text-lg font-semibold text-amber-600">{remainingUnits.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">New Progress</p>
                  <p className="text-lg font-semibold text-blue-600">{progressPercentage}%</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProgress}
              disabled={!!error}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              Save Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

