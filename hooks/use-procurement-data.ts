"\"use client"

import { useState, useEffect } from "react"

// Low Stock Data
interface LowStockItem {
  id: string
  name: string
  currentStock: number
  reorderLevel: number
  unit: string
  urgency: string
}

// Pending Requisitions Data
interface PendingRequisition {
  id: string
  material: string
  quantity: number
  unit: string
  requestedBy: string
  date: string
  urgency: string
}

// Open Purchase Orders Data
interface OpenPurchaseOrder {
  id: string
  supplier: string
  material: string
  quantity: number
  unit: string
  orderDate: string
  expectedDelivery: string
  status: string
  received?: number
}

export function useLowStockData() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])

  useEffect(() => {
    // This would come from your API in a real application
    const lowStockItemsData: LowStockItem[] = [
      {
        id: "mat-001",
        name: "Plastic Resin",
        currentStock: 150,
        reorderLevel: 200,
        unit: "kg",
        urgency: "high",
      },
      {
        id: "mat-002",
        name: "Bottle Caps",
        currentStock: 5000,
        reorderLevel: 8000,
        unit: "pcs",
        urgency: "high",
      },
      {
        id: "mat-003",
        name: "Label Adhesive",
        currentStock: 80,
        reorderLevel: 100,
        unit: "liters",
        urgency: "medium",
      },
      {
        id: "mat-004",
        name: "Cardboard Boxes",
        currentStock: 300,
        reorderLevel: 350,
        unit: "pcs",
        urgency: "low",
      },
    ]
    setLowStockItems(lowStockItemsData)
  }, [])

  return { lowStockItems }
}

export function usePendingRequisitionsData() {
  const [pendingRequisitions, setPendingRequisitions] = useState<PendingRequisition[]>([])

  useEffect(() => {
    // This would come from your API in a real application
    const pendingRequisitionsData: PendingRequisition[] = [
      {
        id: "REQ-001",
        material: "Plastic Resin",
        quantity: 500,
        unit: "kg",
        requestedBy: "John Smith",
        date: "2023-06-05",
        urgency: "high",
      },
      {
        id: "REQ-002",
        material: "Bottle Caps",
        quantity: 10000,
        unit: "pcs",
        requestedBy: "Sarah Johnson",
        date: "2023-06-06",
        urgency: "medium",
      },
      {
        id: "REQ-003",
        material: "Label Adhesive",
        quantity: 50,
        unit: "liters",
        requestedBy: "Mike Williams",
        date: "2023-06-07",
        urgency: "low",
      },
    ]
    setPendingRequisitions(pendingRequisitionsData)
  }, [])

  return { pendingRequisitions }
}

export function useOpenPurchaseOrdersData() {
  const [openPOs, setOpenPOs] = useState<OpenPurchaseOrder[]>([])

  useEffect(() => {
    // This would come from your API in a real application
    const openPurchaseOrdersData: OpenPurchaseOrder[] = [
      {
        id: "PO-001",
        supplier: "PlastiCorp Inc.",
        material: "Plastic Resin",
        quantity: 500,
        unit: "kg",
        orderDate: "2023-06-01",
        expectedDelivery: "2023-06-08",
        status: "sent",
      },
      {
        id: "PO-002",
        supplier: "CapMakers Ltd.",
        material: "Bottle Caps",
        quantity: 10000,
        unit: "pcs",
        orderDate: "2023-06-02",
        expectedDelivery: "2023-06-09",
        status: "partial",
        received: 5000,
      },
      {
        id: "PO-003",
        supplier: "Adhesive Solutions",
        material: "Label Adhesive",
        quantity: 100,
        unit: "liters",
        orderDate: "2023-06-03",
        expectedDelivery: "2023-06-10",
        status: "sent",
      },
    ]
    setOpenPOs(openPurchaseOrdersData)
  }, [])

  return { openPOs }
}

export function useProcurementData() {
  const { lowStockItems } = useLowStockData()
  const { pendingRequisitions } = usePendingRequisitionsData()
  const { openPOs } = useOpenPurchaseOrdersData()
  return { lowStockItems, pendingRequisitions, openPOs }
}
