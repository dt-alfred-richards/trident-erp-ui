"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TraceabilityReport } from "@/components/reports/traceability-report"

export function ReportsDashboard() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="traceability" className="w-full">
        <TabsList>
          <TabsTrigger value="traceability">Traceability Report</TabsTrigger>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="production">Production Report</TabsTrigger>
        </TabsList>

        <TabsContent value="traceability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order to Production Linkage</CardTitle>
              <CardDescription>Track which production batches were used to fulfill specific orders</CardDescription>
            </CardHeader>
            <CardContent>
              <TraceabilityReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>View sales data by customer, SKU, and time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Sales report content will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Report</CardTitle>
              <CardDescription>Analyze production efficiency and output</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Production report content will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

