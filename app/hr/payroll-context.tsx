"use client";

import { createBoilerContext } from "@/components/custom/context-boilercode";
export type Payroll = {
    id: number,
    dailyAttendanceId: string,
    employeeId: string,
    employeeName: string,
    checkIn: string,
    checkOut: string,
    totalHours: string,
    status: string,
    createdOn: string,
    modifiedOn: string,
    createdBy: string,
    modifiedBy: string,
    date: string
};

export const { BoilerProvider: PayrollProvider, useBoiler: usePayroll } = createBoilerContext<Payroll>("v1_payroll");