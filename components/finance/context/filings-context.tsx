"use client";

import { createBoilerContext } from "@/components/custom/context-boilercode";
import { Basic } from "@/contexts/types";

export type Filings = {
    id: number,
    type: string,
    period: string,
    amount: string,
    status: string
} & Basic

export const { BoilerProvider: FilingsProvider, useBoiler: useFilings } = createBoilerContext<Filings>("v1_filings")