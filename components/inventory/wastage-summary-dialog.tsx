import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface WastageData {
  id: string
  product: string
  wastage: number
  wastagePercentage: number
  lastUpdated: Date
}

interface WastageSummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wastageData: WastageData[]
}

export function WastageSummaryDialog({ open, onOpenChange, wastageData }: WastageSummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Wastage Summary</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="border rounded-md">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Wastage</TableHead>
                    <TableHead className="text-right">Wastage %</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wastageData.length > 0 ? (
                    wastageData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell className="text-right">{item.wastage}</TableCell>
                        <TableCell className="text-right">{item.wastagePercentage.toFixed(1)}%</TableCell>
                        <TableCell>{formatDistanceToNow(item.lastUpdated, { addSuffix: true })}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No wastage data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
