"use client";

import { createBoilerContext } from "@/components/custom/context-boilercode";
import { Basic } from "@/contexts/types";
export type Payroll = {
    id: number,
    empId: string,
    employee: string,
    department: string,
    role: string,
    basicSalary: string,
    overtime: string,
    bonus: string,
    tax: string,
    providentFund: string,
    otherDeductions: string,
    status: string,
    attendance: number
} & Basic;

export const { BoilerProvider: PayrollProvider, useBoiler: usePayrollContext } = createBoilerContext<Payroll>("v1_payroll")