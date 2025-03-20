"use client"

import { create } from "zustand"

interface InventoryItem {
  id: string
  name: string
  category: string
  type: string
  quantity: number
  unit: string
  cost: number
  status: "in_stock" | "low_stock" | "out_of_stock"
}

interface InventoryStore {
  inventoryItems: InventoryItem[]
  getInventoryItemByName: (name: string) => InventoryItem | undefined
  updateInventoryQuantity: (name: string, quantity: number) => void
}

// Sample data
const initialInventoryItems: InventoryItem[] = [
  {
    id: "1",
    name: "Stainless Steel Sheet",
    category: "Raw Material",
    type: "Metal",
    quantity: 105,
    unit: "sheet",
    cost: 50,
    status: "in_stock",
  },
  {
    id: "2",
    name: "Plastic Cap",
    category: "Raw Material",
    type: "Plastic",
    quantity: 90,
    unit: "unit",
    cost: 5,
    status: "low_stock",
  },
  {
    id: "3",
    name: "Label",
    category: "Raw Material",
    type: "Paper",
    quantity: 200,
    unit: "unit",
    cost: 2,
    status: "in_stock",
  },
  {
    id: "4",
    name: "PET Resin",
    category: "Raw Material",
    type: "Plastic",
    quantity: 5000,
    unit: "g",
    cost: 0.2,
    status: "in_stock",
  },
]

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  inventoryItems: initialInventoryItems,

  getInventoryItemByName: (name) => {
    return get().inventoryItems.find((item) => item.name === name)
  },

  updateInventoryQuantity: (name, quantity) =>
    set((state) => ({
      inventoryItems: state.inventoryItems.map((item) =>
        item.name === name
          ? {
              ...item,
              quantity,
              status: quantity > 20 ? "in_stock" : quantity > 0 ? "low_stock" : "out_of_stock",
            }
          : item,
      ),
    })),
}))

