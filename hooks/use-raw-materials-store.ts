"use client"

import { create } from "zustand"

// Define the raw material interface
export interface RawMaterial {
  id: string
  category: string
  type: string
  quantity: number
}

interface RawMaterialsState {
  rawMaterials: RawMaterial[]
  getRawMaterialByTypeAndCategory: (category: string, type: string) => RawMaterial | undefined
  updateRawMaterialQuantity: (category: string, type: string, newQuantity: number) => void
  deductRawMaterialQuantity: (category: string, type: string, amountToDeduct: number) => boolean
}

// Sample data based on the raw materials page
const initialRawMaterials: RawMaterial[] = [
  // Labels
  { id: "label-500ml", category: "Labels", type: "500ml Standard", quantity: 25000 },
  { id: "label-1l", category: "Labels", type: "1L Premium", quantity: 15000 },
  { id: "label-2l", category: "Labels", type: "2L Economy", quantity: 10000 },
  { id: "label-750ml", category: "Labels", type: "750ml Special", quantity: 8000 },
  { id: "label-330ml", category: "Labels", type: "330ml Mini", quantity: 30000 },

  // Pre-Form
  { id: "preform-9.3", category: "Pre-Form", type: "9.3", quantity: 150 },
  { id: "preform-12.5", category: "Pre-Form", type: "12.5", quantity: 200 },
  { id: "preform-19", category: "Pre-Form", type: "19", quantity: 175 },
  { id: "preform-32", category: "Pre-Form", type: "32", quantity: 120 },
  { id: "preform-26", category: "Pre-Form", type: "26", quantity: 90 },

  // Shrink
  { id: "shrink-480", category: "Shrink", type: "480mm", quantity: 50 },
  { id: "shrink-530", category: "Shrink", type: "530mm", quantity: 45 },

  // Caps and Handles (renamed from Caps)
  { id: "cap-red", category: "Caps and Handles", type: "Red Caps", quantity: 50000 },
  { id: "cap-white", category: "Caps and Handles", type: "White Caps", quantity: 45000 },
  { id: "cap-black", category: "Caps and Handles", type: "Black Caps", quantity: 30000 },
  { id: "cap-pink", category: "Caps and Handles", type: "Pink Caps", quantity: 25000 },
  { id: "cap-yellow", category: "Caps and Handles", type: "Yellow Caps", quantity: 20000 },
  { id: "cap-blue", category: "Caps and Handles", type: "Blue Caps", quantity: 35000 },
  { id: "cap-orange", category: "Caps and Handles", type: "Orange Caps", quantity: 15000 },
  { id: "handle-red", category: "Caps and Handles", type: "Red Handles", quantity: 28000 },
  { id: "handle-white", category: "Caps and Handles", type: "White Handles", quantity: 32000 },

  // Consumables
  { id: "consumable-bestcode", category: "Consumables", type: "BestCode Wash Bottles", quantity: 45 },
  { id: "consumable-nilkama", category: "Consumables", type: "Nilkama Ink Bottles", quantity: 30 },
  { id: "consumable-nilkamal", category: "Consumables", type: "Nilkamal Make Up", quantity: 25 },
]

export const useRawMaterialsStore = create<RawMaterialsState>((set, get) => ({
  rawMaterials: initialRawMaterials,

  getRawMaterialByTypeAndCategory: (category: string, type: string) => {
    const { rawMaterials } = get()
    return rawMaterials.find(
      (material) =>
        material.category.toLowerCase() === category.toLowerCase() &&
        material.type.toLowerCase() === type.toLowerCase(),
    )
  },

  updateRawMaterialQuantity: (category: string, type: string, newQuantity: number) => {
    set((state) => ({
      rawMaterials: state.rawMaterials.map((material) => {
        if (
          material.category.toLowerCase() === category.toLowerCase() &&
          material.type.toLowerCase() === type.toLowerCase()
        ) {
          return { ...material, quantity: newQuantity }
        }
        return material
      }),
    }))
  },

  deductRawMaterialQuantity: (category: string, type: string, amountToDeduct: number) => {
    const material = get().getRawMaterialByTypeAndCategory(category, type)

    if (!material || material.quantity < amountToDeduct) {
      return false // Cannot deduct more than available
    }

    const newQuantity = material.quantity - amountToDeduct
    get().updateRawMaterialQuantity(category, type, newQuantity)
    return true
  },
}))
