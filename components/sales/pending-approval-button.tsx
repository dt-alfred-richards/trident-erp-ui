"use client"

import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

interface PendingApprovalButtonProps {
  count: number
  onClick: () => void
}

export function PendingApprovalButton({ count, onClick }: PendingApprovalButtonProps) {
  return (
    <Button variant="outline" onClick={onClick} className="flex items-center gap-2">
      <Bell className="h-4 w-4" />
      Pending Approval
      {count > 0 && (
        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          {count}
        </span>
      )}
    </Button>
  )
}

