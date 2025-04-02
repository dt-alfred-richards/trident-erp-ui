"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePendingRequisitionsData } from "@/hooks/use-procurement-data"
import { PriorityIndicator } from "@/components/common/priority-indicator"

export function PendingRequisitions() {
  const { pendingRequisitions } = usePendingRequisitionsData()

  // Make sure pendingRequisitions is not null or undefined
  if (!pendingRequisitions || pendingRequisitions.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No pending purchase orders</div>
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingRequisitions.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">{req.id}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{req.material}</span>
                  <span className="text-xs text-muted-foreground">
                    {req.quantity} {req.unit}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <PriorityIndicator priority={req.urgency} />
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm">
                  Process
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

