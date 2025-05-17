"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ProductionTableProps {
  onProduceClick: (sku: string, deficit: number) => void
}

export function ProductionTable({ onProduceClick }: ProductionTableProps) {
  // This would come from your API in a real application
  const productionData = [
    {
      sku: "500ml",
      pendingOrders: 4000,
      inProduction: 2000,
      availableStock: 500,
      deficit: 1500,
      status: "deficit",
    },
    {
      sku: "750ml",
      pendingOrders: 2500,
      inProduction: 1500,
      availableStock: 1200,
      deficit: 0,
      status: "sufficient",
    },
    {
      sku: "1000ml",
      pendingOrders: 3000,
      inProduction: 1000,
      availableStock: 200,
      deficit: 1800,
      status: "deficit",
    },
    {
      sku: "2000ml",
      pendingOrders: 1500,
      inProduction: 500,
      availableStock: 1000,
      deficit: 0,
      status: "sufficient",
    },
    {
      sku: "Custom-A",
      pendingOrders: 800,
      inProduction: 0,
      availableStock: 0,
      deficit: 800,
      status: "deficit",
    },
  ]

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Pending Orders</TableHead>
            <TableHead className="text-right">In Production</TableHead>
            <TableHead className="text-right">Available Stock</TableHead>
            <TableHead className="text-right">Deficit</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productionData.map((item) => (
            <TableRow key={item.sku}>
              <TableCell className="font-medium">{item.sku}</TableCell>
              <TableCell className="text-right">{item.pendingOrders.toLocaleString()}</TableCell>
              <TableCell className="text-right">{item.inProduction.toLocaleString()}</TableCell>
              <TableCell className="text-right">{item.availableStock.toLocaleString()}</TableCell>
              <TableCell className={`text-right font-medium ${item.deficit > 0 ? "text-red-500" : "text-green-500"}`}>
                {item.deficit > 0 ? item.deficit.toLocaleString() : "Sufficient"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant={item.deficit > 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onProduceClick(item.sku, item.deficit)}
                >
                  Produce
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
