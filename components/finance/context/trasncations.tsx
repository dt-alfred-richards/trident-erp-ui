

"use client";

import { createBoilerContext } from "@/components/custom/context-boilercode";
import { Basic } from "@/contexts/types";


type Transcation = {
    id: number,
    date: string;
    description: string;
    account: string;
    type: "Deposit" | "Withdrawal" | "Transfer";
    status: "Cleared" | "Pending" | "Bounced";
    amount: number;
    reference?: string ;
} & Basic

export const { BoilerProvider: TranscationProvider, useBoiler: useTranscation } = createBoilerContext<Transcation>("v1_transcations")