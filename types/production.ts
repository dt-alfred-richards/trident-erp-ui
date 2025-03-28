export interface ProductionOrder {
  id: string
  sku: string
  quantity: number
  startDate: string
  deadline: string
  assignedTo: string
  progress: number,
  productionId: string
}

