import { TranscationProvider } from "@/components/finance/context/trasncations"
import { ProcurementProvider } from "../procurement/procurement-context"
import DashboardPage from "./dashboard-page"
import { BankAccountProvider } from "@/components/finance/context/bank-account-context"

export default function Dashboard() {
  return (
    <div className="w-full max-w-full flex-1">
      <DashboardPage />
    </div>
  )
}
