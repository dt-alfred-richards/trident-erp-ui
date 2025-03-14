"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SupplierComparisonTable } from "@/components/procurement/supplier-comparison-table"

export function SupplierComparisonTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <SupplierComparisonTable />
      </CardContent>
    </Card>
  )
}

