"use client"

import { Button } from "@/components/ui/button"
import { Plus, PlusCircle } from "lucide-react"

interface ProductionActionButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  sku?: string
  deficit?: number
  type: "create" | "produce"
  onClick: (sku: string, deficit: number) => void
}

export function ProductionActionButton({
  variant = "default",
  size = "default",
  disabled = false,
  sku = "",
  deficit = 0,
  type,
  onClick,
}: ProductionActionButtonProps) {
  const handleClick = () => {
    onClick(sku, deficit)
  }

  if (type === "create") {
    return (
      <Button onClick={handleClick} variant={variant} size={size} disabled={disabled}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      variant={deficit > 0 ? "default" : "outline"}
      size="sm"
      disabled={disabled || deficit === 0}
    >
      <Plus className="h-4 w-4 mr-1" />
      Produce
    </Button>
  )
}

