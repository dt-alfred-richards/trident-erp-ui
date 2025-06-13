

"use client";

import { createBoilerContext } from "@/components/custom/context-boilercode";
import { Basic } from "@/contexts/types";


type Account = {
    accountCode: string,
    name: string,
    type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense",
    balance: number,
    parentId?: string,
    id: number
} & Basic

export const { BoilerProvider: ChartAccountProvider, useBoiler: useChartAccount } = createBoilerContext<Account>("v1_chart_accounts")