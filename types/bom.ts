export type BomStatus = "active" | "inactive"

export interface BomComponentType {
  materialName: string
  quantity: number
  unit: string
  cost: number
}

export interface BomType {
  id: string
  productName: string
  bomCode: string
  status: BomStatus
  components: BomComponentType[]
  unitCost: number
}

export interface ProductionOrderType {
  id: string
  orderId: string
  bomId: string
  quantity: number
  plannedDate: string
  status: "pending" | "ready" | "insufficient_stock"
}

