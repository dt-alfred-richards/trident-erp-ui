"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function InventoryPage() {
  const router = useRouter()

  // Redirect to finished goods by default
  useEffect(() => {
    router.push("/inventory/finished-goods")
  }, [router])

  return null
}
