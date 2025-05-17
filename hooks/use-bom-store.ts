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
  {
    id: "3",
    productName: "1000ml Glass Bottle",
    bomCode: "BOM-003",
    status: "active",
    components: [
      {
        materialName: "Glass Material",
        quantity: 250,
        unit: "g",
        cost: 25,
      },
      {
        materialName: "Metal Cap",
        quantity: 1,
        unit: "unit",
        cost: 3.5,
      },
      {
        materialName: "Premium Label",
        quantity: 1,
        unit: "unit",
        cost: 4.2,
      },
      {
        materialName: "Protective Coating",
        quantity: 15,
        unit: "ml",
        cost: 2.8,
      },
    ],
    unitCost: 35.5,
  },
  {
    id: "4",
    productName: "1500ml Glass Bottle",
    bomCode: "BOM-004",
    status: "active",
    components: [
      {
        materialName: "Glass Material",
        quantity: 375,
        unit: "g",
        cost: 37.5,
      },
      {
        materialName: "Metal Cap",
        quantity: 1,
        unit: "unit",
        cost: 4.2,
      },
      {
        materialName: "Premium Label",
        quantity: 1,
        unit: "unit",
        cost: 4.5,
      },
      {
        materialName: "Protective Coating",
        quantity: 22,
        unit: "ml",
        cost: 4.1,
      },
    ],
    unitCost: 50.3,
  },
  {
    id: "5",
    productName: "2000ml Glass Bottle",
    bomCode: "BOM-005",
    status: "active",
    components: [
      {
        materialName: "Glass Material",
        quantity: 500,
        unit: "g",
        cost: 50,
      },
      {
        materialName: "Metal Cap",
        quantity: 1,
        unit: "unit",
        cost: 5.5,
      },
      {
        materialName: "Premium Label",
        quantity: 1,
        unit: "unit",
        cost: 5.2,
      },
      {
        materialName: "Protective Coating",
        quantity: 30,
        unit: "ml",
        cost: 5.8,
      },
      {
        materialName: "Handle Attachment",
        quantity: 1,
        unit: "unit",
        cost: 8.5,
      },
    ],
    unitCost: 75,
  },
  {
    id: "6",
    productName: "330ml Aluminum Can",
    bomCode: "BOM-006",
    status: "active",
    components: [
      {
        materialName: "Aluminum Sheet",
        quantity: 15,
        unit: "g",
        cost: 12,
      },
      {
        materialName: "Pull Tab",
        quantity: 1,
        unit: "unit",
        cost: 1.5,
      },
      {
        materialName: "Inner Coating",
        quantity: 5,
        unit: "ml",
        cost: 2.2,
      },
      {
        materialName: "Printed Design",
        quantity: 1,
        unit: "unit",
        cost: 3.8,
      },
    ],
    unitCost: 19.5,
  },
  {
    id: "7",
    productName: "500ml Aluminum Can",
    bomCode: "BOM-007",
    status: "active",
    components: [
      {
        materialName: "Aluminum Sheet",
        quantity: 22,
        unit: "g",
        cost: 17.6,
      },
      {
        materialName: "Pull Tab",
        quantity: 1,
        unit: "unit",
        cost: 1.5,
      },
      {
        materialName: "Inner Coating",
        quantity: 8,
        unit: "ml",
        cost: 3.5,
      },
      {
        materialName: "Printed Design",
        quantity: 1,
        unit: "unit",
        cost: 4.2,
      },
    ],
    unitCost: 26.8,
  },
  {
    id: "8",
    productName: "750ml Wine Bottle",
    bomCode: "BOM-008",
    status: "active",
    components: [
      {
        materialName: "Premium Glass",
        quantity: 400,
        unit: "g",
        cost: 45,
      },
      {
        materialName: "Cork Stopper",
        quantity: 1,
        unit: "unit",
        cost: 8.5,
      },
      {
        materialName: "Foil Capsule",
        quantity: 1,
        unit: "unit",
        cost: 3.2,
      },
      {
        materialName: "Wine Label",
        quantity: 1,
        unit: "unit",
        cost: 6.8,
      },
      {
        materialName: "Back Label",
        quantity: 1,
        unit: "unit",
        cost: 4.5,
      },
    ],
    unitCost: 68,
  },
  {
    id: "9",
    productName: "375ml Wine Bottle",
    bomCode: "BOM-009",
    status: "active",
    components: [
      {
        materialName: "Premium Glass",
        quantity: 200,
        unit: "g",
        cost: 22.5,
      },
      {
        materialName: "Cork Stopper",
        quantity: 1,
        unit: "unit",
        cost: 6.5,
      },
      {
        materialName: "Foil Capsule",
        quantity: 1,
        unit: "unit",
        cost: 2.8,
      },
      {
        materialName: "Wine Label",
        quantity: 1,
        unit: "unit",
        cost: 5.2,
      },
      {
        materialName: "Back Label",
        quantity: 1,
        unit: "unit",
        cost: 3.5,
      },
    ],
    unitCost: 40.5,
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
