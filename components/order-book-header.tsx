import type { ReactNode } from "react"

interface OrderBookHeaderProps {
  children: ReactNode
}

export function OrderBookHeader({ children }: OrderBookHeaderProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Order Book</h2>
      {children}
    </div>
  )
}

