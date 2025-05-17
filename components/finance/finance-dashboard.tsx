"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinanceOverview } from "@/components/finance/finance-overview"
import { GeneralLedger } from "@/components/finance/general-ledger"
import { AccountsReceivable } from "@/components/finance/accounts-receivable"
import { AccountsPayable } from "@/components/finance/accounts-payable"
import { BankingCash } from "@/components/finance/banking-cash"
import { FixedAssets } from "@/components/finance/fixed-assets"
import { CostAccounting } from "@/components/finance/cost-accounting"
import { TaxationCompliance } from "@/components/finance/taxation-compliance"
import { FinanceProvider } from "@/contexts/finance-context"
import { Button } from "@/components/ui/button"
import { JournalEntryForm } from "@/components/finance/journal-entry-form"
import { Plus } from "lucide-react"

export function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isJournalEntryFormOpen, setIsJournalEntryFormOpen] = useState(false)

  return (
    <FinanceProvider>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">Finance Management</h1>
          {activeTab === "overview" && (
            <Button
              onClick={() => setIsJournalEntryFormOpen(true)}
              className="bg-[#725af2] hover:bg-[#6247d9] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Journal Entry
            </Button>
          )}
        </div>

        <Tabs defaultValue="overview" className="flex-1" onValueChange={(value) => setActiveTab(value)}>
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none h-12 bg-transparent p-0 border-b-0">
              <TabsTrigger
                value="overview"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="general-ledger"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
              >
                General Ledger
              </TabsTrigger>
              <TabsTrigger
                value="accounts-receivable"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
              >
                Accounts Receivable
              </TabsTrigger>
              <TabsTrigger
                value="accounts-payable"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
              >
                Accounts Payable
              </TabsTrigger>
              <TabsTrigger
                value="banking-cash"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
              >
                Banking & Cash
              </TabsTrigger>
              <TabsTrigger
                value="fixed-assets"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
              >
                Fixed Assets
              </TabsTrigger>
              <TabsTrigger
                value="cost-accounting"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
              >
                Cost Accounting
              </TabsTrigger>
              <TabsTrigger
                value="taxation"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#1b84ff] data-[state=active]:shadow-none h-12 px-4 font-medium text-muted-foreground data-[state=active]:text-[#1b84ff] data-[state=active]:bg-white dark:data-[state=active]:bg-[#0f1729]"
              >
                Taxation & Compliance
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="flex-1 p-0">
            <FinanceOverview />
          </TabsContent>
          <TabsContent value="general-ledger" className="flex-1 p-0">
            <GeneralLedger />
          </TabsContent>
          <TabsContent value="accounts-receivable" className="flex-1 p-0">
            <AccountsReceivable />
          </TabsContent>
          <TabsContent value="accounts-payable" className="flex-1 p-0">
            <AccountsPayable />
          </TabsContent>
          <TabsContent value="banking-cash" className="flex-1 p-0">
            <BankingCash />
          </TabsContent>
          <TabsContent value="fixed-assets" className="flex-1 p-0">
            <FixedAssets />
          </TabsContent>
          <TabsContent value="cost-accounting" className="flex-1 p-0">
            <CostAccounting />
          </TabsContent>
          <TabsContent value="taxation" className="flex-1 p-0">
            <TaxationCompliance />
          </TabsContent>
        </Tabs>

        {/* Journal Entry Form Dialog */}
        <JournalEntryForm open={isJournalEntryFormOpen} onOpenChange={setIsJournalEntryFormOpen} />
      </div>
    </FinanceProvider>
  )
}
