import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import DashboardPage from "@/app/dashboard/dashboard-page"
import { BankAccountProvider } from "@/components/finance/context/bank-account-context"
import { TranscationProvider } from "@/components/finance/context/trasncations"
import { ProcurementProvider } from "./procurement/procurement-context"
import { InventoryProvider } from "./inventory-context"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dhaara ERP Dashboard",
}

export default function Home() {
  return (
    <DashboardShell>
      <ProcurementProvider>
        <BankAccountProvider>
          <TranscationProvider>
            <InventoryProvider>
              <DashboardPage />]
            </InventoryProvider>
          </TranscationProvider>
        </BankAccountProvider>
      </ProcurementProvider>
    </DashboardShell>
  )
}
