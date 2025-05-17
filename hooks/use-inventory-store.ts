"use client"

import { create } from "zustand"

interface RawMaterial {
  id: string
  name: string
  quantity: number
  unit: string
  reorderLevel: number
  supplier: string
  lastRestocked: string
  cost?: number // Adding cost property which might be used in BOM components
}

interface InventoryStore {
  rawMaterials: RawMaterial[]
  inventoryItems: RawMaterial[] // Added this property for compatibility
  addRawMaterial: (material: RawMaterial) => void
  updateRawMaterial: (id: string, updates: Partial<RawMaterial>) => void
  deleteRawMaterial: (id: string) => void
  getInventoryItemByName: (name: string) => RawMaterial | undefined
}

// Sample data with cost property added
const initialRawMaterials: RawMaterial[] = [
  {
    id: "1",
    name: "Stainless Steel Sheet",
    quantity: 500,
    unit: "sheet",
    reorderLevel: 100,
    supplier: "Steel Supplies Inc.",
    lastRestocked: "2023-05-15",
    cost: 1200,
  },
  {
    id: "2",
    name: "PET Resin",
    quantity: 2000,
    unit: "kg",
    reorderLevel: 500,
    supplier: "Plastic Materials Co.",
    lastRestocked: "2023-06-01",
    cost: 80,
  },
  {
    id: "3",
    name: "Plastic Cap",
    quantity: 10000,
    unit: "unit",
    reorderLevel: 2000,
    supplier: "Bottle Parts Ltd.",
    lastRestocked: "2023-05-20",
    cost: 5,
  },
  {
    id: "4",
    name: "Label",
    quantity: 15000,
    unit: "unit",
    reorderLevel: 3000,
    supplier: "Print Solutions",
    lastRestocked: "2023-06-10",
    cost: 2,
  },
  {
    id: "5",
    name: "Aluminum Sheet",
    quantity: 300,
    unit: "sheet",
    reorderLevel: 100,
    supplier: "Metal Works Co.",
    lastRestocked: "2023-05-25",
    cost: 950,
  },
]

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  rawMaterials: initialRawMaterials,
  inventoryItems: initialRawMaterials, // Initialize inventoryItems with the same data

  addRawMaterial: (material) =>
    set((state) => ({
      rawMaterials: [...state.rawMaterials, material],
      inventoryItems: [...state.rawMaterials, material], // Update both arrays
    })),

  updateRawMaterial: (id, updates) =>
    set((state) => {
      const updatedMaterials = state.rawMaterials.map((material) =>
        material.id === id ? { ...material, ...updates } : material,
      )
      return {
        rawMaterials: updatedMaterials,
        inventoryItems: updatedMaterials, // Update both arrays
      }
    }),

  deleteRawMaterial: (id) =>
    set((state) => {
      const filteredMaterials = state.rawMaterials.filter((material) => material.id !== id)
      return {
        rawMaterials: filteredMaterials,
        inventoryItems: filteredMaterials, // Update both arrays
      }
    }),

  getInventoryItemByName: (name) => {
    const state = get()
    return state.rawMaterials.find((material) => material.name === name)
  },
}))
