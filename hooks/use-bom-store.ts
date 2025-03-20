"use client"

import { create } from "zustand"
import type { BomType } from "@/types/bom"

interface BomStore {
  boms: BomType[]
  addBom: (bom: BomType) => void
  updateBom: (bom: BomType) => void
  deleteBom: (id: string) => void
  getBomById: (id: string) => BomType | undefined
}

// Sample data
const initialBoms: BomType[] = [
  {
    id: "1",
    productName: "500ml Steel Bottle",
    bomCode: "BOM-001",
    status: "active",
    components: [
      {
        materialName: "Stainless Steel Sheet",
        quantity: 1,
        unit: "sheet",
        cost: 50,
      },
      {
        materialName: "Plastic Cap",
        quantity: 1,
        unit: "unit",
        cost: 5,
      },
      {
        materialName: "Label",
        quantity: 1,
        unit: "unit",
        cost: 2,
      },
    ],
    unitCost: 57,
  },
  {
    id: "2",
    productName: "1L Plastic Bottle",
    bomCode: "BOM-002",
    status: "active",
    components: [
      {
        materialName: "PET Resin",
        quantity: 50,
        unit: "g",
        cost: 10,
      },
      {
        materialName: "Plastic Cap",
        quantity: 1,
        unit: "unit",
        cost: 5,
      },
      {
        materialName: "Label",
        quantity: 1,
        unit: "unit",
        cost: 2,
      },
    ],
    unitCost: 17,
  },
]

export const useBomStore = create<BomStore>((set, get) => ({
  boms: initialBoms,

  addBom: (bom) => set((state) => ({ boms: [...state.boms, bom] })),

  updateBom: (bom) =>
    set((state) => ({
      boms: state.boms.map((b) => (b.id === bom.id ? bom : b)),
    })),

  deleteBom: (id) =>
    set((state) => ({
      boms: state.boms.filter((b) => b.id !== id),
    })),

  getBomById: (id) => {
    return get().boms.find((b) => b.id === id)
  },
}))

