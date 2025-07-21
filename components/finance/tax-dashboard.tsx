"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaxationCompliance } from "@/components/finance/taxation-compliance"
import { TaxBalance } from "@/components/finance/tax-balance"
import { GSTRDashboard } from "@/components/finance/gstr-dashboard" // Import the new GSTRDashboard

export function TaxDashboard() {
  const [activeTab, setActiveTab] = useState("tax-balance")

  return (
    <div className="flex flex-col h-full">
      <div className="border-b">
        <Tabs defaultValue="tax-balance" className="flex-1" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="w-full justify-start rounded-none h-12 bg-transparent p-0 border-b-0">
            <TabsTrigger
              value="tax-balance"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
            >
              Tax Balance
            </TabsTrigger>
            <TabsTrigger
              value="gstr"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
            >
              GSTR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tax-balance" className="flex-1 p-0">
            <TaxBalance />
          </TabsContent>
          <TabsContent value="tax-filings" className="flex-1 p-0">
            <TaxationCompliance />
          </TabsContent>
          <TabsContent value="gstr" className="flex-1 p-0">
            <GSTRDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
