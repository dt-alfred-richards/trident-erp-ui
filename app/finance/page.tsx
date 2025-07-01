import { BankAccountProvider } from "@/components/finance/context/bank-account-context"
import { BillProvider } from "@/components/finance/context/bill-context"
import { ChartAccountProvider } from "@/components/finance/context/chart-accounts"
import { InvoiceProvider } from "@/components/finance/context/invoice-context"
import { JournalProvider } from "@/components/finance/context/journal-context"
import { TranscationProvider } from "@/components/finance/context/trasncations"
import { FinanceDashboard } from "@/components/finance/finance-dashboard"
import { ProcurementProvider } from "../procurement/procurement-context"
import { FilingsProvider } from "@/components/finance/context/filings-context"

export default function FinancePage() {
  return <JournalProvider>
    <ProcurementProvider>
      <FilingsProvider>
        <TranscationProvider>
          <ChartAccountProvider>
            <BillProvider>
              <BankAccountProvider>
                <InvoiceProvider>
                  <FinanceDashboard />
                </InvoiceProvider>
              </BankAccountProvider>
            </BillProvider>
          </ChartAccountProvider>
        </TranscationProvider>
      </FilingsProvider>
    </ProcurementProvider>
  </JournalProvider>
}
