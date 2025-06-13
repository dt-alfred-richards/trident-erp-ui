"use client";

import { createBoilerContext } from "@/components/custom/context-boilercode";
import { Basic } from "@/contexts/types";

export type BillItem = {
    description: string,
    quantity: number,
    unitPrice: number,
    amount: number,
    taxRate: number,
    taxAmount: number
}

export type Bill = {
    id:string,
    supplier: string,
    date: string,
    dueDate: string,
    status: string,
    items: string,
    amount: number,
    balance: number
} & Basic

export const { BoilerProvider: BillProvider, useBoiler: useBillContext } = createBoilerContext<Bill>("v1_bills")