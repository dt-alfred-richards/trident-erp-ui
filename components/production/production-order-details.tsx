"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProductionStore } from "@/hooks/use-production-store"

interface ProductionOrderDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

export function ProductionOrderDetails({ open, onOpenChange, orderId }: ProductionOrderDetailsProps) {
  const { getOrderById } = useProductionStore()
  const order = getOrderById(orderId)

  if (!order) return null

  const daysLeft = Math.ceil((new Date(order.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const isLate = daysLeft < 0
  const isUrgent = daysLeft <= 2 && daysLeft >= 0

  // Sample products used data - in a real app, this would come from your data store
  const productsUsed = [
    { name: "Raw Material A", quantity: "250 units", status: "In Stock" },
    { name: "Raw Material B", quantity: "150 units", status: "In Stock" },
    { name: "Packaging", quantity: "100 units", status: "In Stock" },
    { name: "Labels", quantity: "100 units", status: "Low Stock" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Production Order: {order.sku}
            {order.progress === 100 ? (
              <Badge className="bg-green-500 ml-2">Completed</Badge>
            ) : isLate ? (
              <Badge variant="destructive" className="ml-2">
                Overdue
              </Badge>
            ) : isUrgent ? (
              <Badge variant="warning" className="bg-amber-500 ml-2">
                Urgent
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2">
                In Progress
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Order #{order.id.slice(0, 8)} • Created on {new Date(order.startDate).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Details Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Quantity</h4>
                  <p className="text-lg font-semibold">{order.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Deadline</h4>
                  <p className="text-lg font-semibold">
                    {new Date(order.deadline).toLocaleDateString()}
                    {isLate ? (
                      <span className="text-sm text-red-500 ml-2">{Math.abs(daysLeft)} days overdue</span>
                    ) : (
                      <span className="text-sm text-muted-foreground ml-2">{daysLeft} days left</span>
                    )}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Assigned To</h4>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt={order.assignedTo} />
                    <AvatarFallback>{order.assignedTo.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{order.assignedTo}</p>
                    <p className="text-sm text-muted-foreground">Production Supervisor</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Current Progress</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completion:</span>
                    <span className="font-medium">{order.progress}%</span>
                  </div>
                  <Progress value={order.progress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Used Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Products Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {productsUsed.map((product, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">Quantity: {product.quantity}</div>
                    <Badge variant={product.status === "Low Stock" ? "destructive" : "outline"} className="mt-2">
                      {product.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Production History Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Production History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-full bg-primary rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Order Created</div>
                    <div className="text-xs text-muted-foreground">{new Date(order.startDate).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1 h-full bg-primary rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Materials Allocated</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(new Date(order.startDate).getTime() + 86400000).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1 h-full bg-primary rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium">Production Started</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(new Date(order.startDate).getTime() + 172800000).toLocaleString()}
                    </div>
                  </div>
                </div>
                {order.progress >= 50 && (
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-full bg-primary rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">50% Complete</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(new Date(order.startDate).getTime() + 345600000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
                {order.progress === 100 && (
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-full bg-primary rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">Production Completed</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(new Date(order.startDate).getTime() + 518400000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

