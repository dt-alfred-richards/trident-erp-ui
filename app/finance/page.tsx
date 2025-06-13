import { ChartAccountProvider } from "@/components/finance/context/chart-accounts"
import { JournalProvider } from "@/components/finance/context/journal-context"
import { FinanceDashboard } from "@/components/finance/finance-dashboard"

export default function FinancePage() {
  return <JournalProvider>
    <ChartAccountProvider>
      <FinanceDashboard />
    </ChartAccountProvider>
  </JournalProvider>
}
