"use client";

import { createBoilerContext } from "@/components/custom/context-boilercode";
import { Basic } from "@/contexts/types";

export type InvoiceItem = {
    description: string,
    quantity: number,
    unitPrice: number,
    amount: number,
    taxRate: number,
    taxAmount: number
}

export type Invoice = {
    id: number,
    customer: string,
    date: string,
    dueDate: string,
    status: string,
    items: string,
    subtotal: number, tax: number, total: number
} & Basic

export const { BoilerProvider: InvoiceProvider, useBoiler: useInvoiceContext } = createBoilerContext<Invoice>("v1_invoice")