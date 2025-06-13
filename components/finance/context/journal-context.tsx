"use client";

import { createBoilerContext } from "@/components/custom/context-boilercode";
import { Basic } from "@/contexts/types";

export type Journal = {
    id: string,
    date: Date | string,
    description: string,
    debitAccount: string,
    creditAccount: string,
    debtorCustomer: string,
    creditorSupplier: string,
    activeInvoice: string,
    activeBill: string,
    amount: number,
    reference?: string,
    status: string,
} & Basic

export const { BoilerProvider: JournalProvider, useBoiler: useJournalContext } = createBoilerContext<Journal>("v1_journals")