export type ProductionStatus = "pending" | "in_progress" | "completed" | "cancelled"

export interface ProductionOrder {
  id: string
  sku: string
  quantity: number
  completedQuantity: number
  deadline: Date
  createdAt: Date
  status: ProductionStatus
  assignedTo: string
  bomId?: string // Add bomId field
}

export interface ProductionStore {
  productionOrders: ProductionOrder[]
  createProductionOrder: (order: Omit<ProductionOrder, "id" | "createdAt" | "status" | "completedQuantity">) => void
  updateProductionStatus: (id: string, status: ProductionStatus) => void
  updateProductionProgress: (id: string, completedQuantity: number) => void
  getProductionOrderById: (id: string) => ProductionOrder | undefined
}
