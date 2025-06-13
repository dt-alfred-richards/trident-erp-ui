"use client";

import { createBoilerContext } from "@/components/custom/context-boilercode";
import { Basic } from "@/contexts/types";

export type BankAccount = {
    id: number,
    name: string,
    bank: string,
    accountNumber: string,
    balance: number,
    type: string
} & Basic

export const { BoilerProvider: BankAccountProvider, useBoiler: useBankAccountContext } = createBoilerContext<BankAccount>("v1_bank_account")