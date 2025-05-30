"use client"

import type React from "react"

import { ProcurementProvider } from "@/app/procurement/procurement-context"
import PurchaseOrderHelper from "./PurchaseOrderHelper"

interface PurchaseOrder {
  id: string
  supplier: string
  supplierName?: string
  material: string
  materialName?: string
  quantity: number
  unit: string
  orderDate: string
  expectedDelivery: string
  status: string
  totalValue: number
  received?: number
}

// Update the PurchaseOrderTabProps interface to make the props optional with default values
export interface PurchaseOrderTabProps {
  purchaseOrders?: PurchaseOrder[]
  setPurchaseOrders?: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>
}

// Add default mock data inside the component
export function PurchaseOrderTab({
  purchaseOrders: externalPurchaseOrders,
  setPurchaseOrders: externalSetPurchaseOrders,
}: PurchaseOrderTabProps) {
  return <ProcurementProvider>
    <PurchaseOrderHelper purchaseOrders={externalPurchaseOrders} setPurchaseOrders={externalSetPurchaseOrders} />
  </ProcurementProvider>
}
