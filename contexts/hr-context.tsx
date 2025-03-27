import { DataByTableName } from "@/components/utils/api"
import { createType } from "@/components/utils/generic"
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react"

type HrContextType = {
    employeeDetails: EmployeeRow[],
    attendanceDetails: AttendanceData[],
    refetchData: () => void,
    roles: string[],
    empLeaves: EmpLeaves[],
    employeePayroll: EmployeePayroll[]
}

type EmployeePayroll = {
    id: number,
    employeeId: string,
    name: string,
    role: string,
    attendance: number,
    overtimeHours: number,
    netPay: number,
    status: string,
    createdOn: number,
    createdBy: object,
    modifiedOn: object,
    modifiedBy: object
}

export const textCapitalize = (str: string) => {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

export type DimEmployee = {
    id: number,
    empId: string,
    firstName: string,
    lastName: string,
    contactNumber: number,
    email: string,
    dob: string,
    address: string,
    joiningDate: string,
    department: string,
    role: string,
    salary: number,
    bloodGroup: string,
    averageWorkingHours: number,
    monthlyPayment: boolean,
    basePay: number,
    sundayHoliday: boolean,
    employmentType: string,
    fullName: string,
    gender: string,
    aadhaarNumber: number,
    shiftDuration: number,
    leaves: number,
    payCycle: string,
    earnedLeaves: number,
    usedLeaves: number,
    balanceLeaves: number
}

export type EmployeeRow = {
    id: string,
    firstName: string,
    lastName: string,
    middleName?: string,
    bloodGroup: string,
    email: string,
    role: string,
    department: string,
    employeeType: string,
    salary: number,
    contactNumber?: number,
    dateOfJoining: string,
    gender: string,
    address: string,
    panNumber: string,
    pfNumber: string,
    sundayHoliday: boolean,
    esiNumber: string,
    bankDetails: EmployeeBankDetails,
    aadhaarNumber: number,
    dob: string,
    shiftDuration: number,
    leaves: number,
    payCycle: string,
    aadharImageUrl: string
    earnedLeaves: number,
    usedLeaves: number,
    balanceLeaves: number
}

export type AttendanceData = {
    id: number,
    employeeId: string,
    employeeName: string,
    date: string,
    checkIn: string,
    checkOut: string,
    totalHours: string,
    status: string
}

type AttendaceResponse = {
    date: string,
    empId: string,
    loginTime: string,
    logoutTime: string,
    id: number
}

export type EmployeeBankDetails = {
    id: number,
    employeeId: string,
    bankName: string,
    bankBranch: string,
    ifscCode: string,
    pfNumber: string,
    esiNumber: string,
    accountNumber: number,
    panNumber: string
}

export type EmpLeaves = {
    id: number,
    employeeId: string,
    date: number,
    reason: string,
    status: string,
    createdOn: number,
    modifiedBy: string
}


const HrContext = createContext<HrContextType | undefined>(undefined)


export function HrProvider({ children }: { children: ReactNode }) {
    const [employeeDetails, setEmployeeDetails] = useState<EmployeeRow[]>([])
    const [attendanceDetails, setAttendanceDetails] = useState<AttendanceData[]>([])
    const [rerender, setRerender] = useState(false)
    const [roles, setRoles] = useState<string[]>([])
    const [empLeaves, setEmpLeaves] = useState<EmpLeaves[]>([])
    const [employeePayroll, setEmployeePayroll] = useState<EmployeePayroll[]>([])

    const refetchData = useCallback(() => {
        setRerender(i => !i)
    }, [])

    const getTime = useCallback((timestamp: string) => {
        return timestamp.split("T")[1].split(":").slice(0, 2).join(":"); // Extracts HH:MM
    }, [])

    const fetch = useCallback(async () => {
        try {
            const dimEmployee = new DataByTableName("dim_employee_v2");
            const empAttendence = new DataByTableName("emp_attendence");
            const empBankDetails = new DataByTableName("employee_bank_details");
            const employeeLeaves = new DataByTableName("employee_leaves");
            const employeePayroll = new DataByTableName("employee_payroll");

            const { data: dimEmpData, error: dimErrors } = await dimEmployee.get();
            const { data: empBankData, error: empBankErrors } = await empBankDetails.get();
            const { data: empAttendanceData, error: empAttendanceError } = await empAttendence.get();
            const { data: empLeaves, error: empLeaveErrors } = await employeeLeaves.get();
            const { data: employeePayrollData, error: employeePayrollErrors } = await employeePayroll.get();


            const bankMapper = Object.fromEntries(empBankData.map((item: EmployeeBankDetails) => [item.employeeId, item]))
            const _employees = dimEmpData.sort((a: any, b: any) => b.id - a.id).map((item: DimEmployee) => {
                return ({
                    contactNumber: item.contactNumber,
                    dateOfJoining: item.joiningDate,
                    department: item.department,
                    email: item.email,
                    employeeType: item.employmentType,
                    firstName: item.firstName,
                    gender: item.gender,
                    id: item.empId,
                    lastName: item?.lastName ?? "",
                    role: textCapitalize(item.role),
                    salary: item.salary,
                    sundayHoliday: item.sundayHoliday,
                    bankDetails: bankMapper[item.empId] ?? {},
                    bloodGroup: item.bloodGroup,
                    aadhaarNumber: item.aadhaarNumber,
                    dob: item.dob,
                    shiftDuration: item.shiftDuration,
                    leaves: item.leaves,
                    payCycle: item.payCycle,
                    earnedLeaves: item.earnedLeaves,
                    usedLeaves: item.usedLeaves,
                    balanceLeaves: item.balanceLeaves
                }) as EmployeeRow
            })

            const roles = new Set(_employees.map((item: DimEmployee) => item.role));

            const _attendanceData = empAttendanceData.sort((a: any, b: any) => b.date - a.date).map((item: AttendaceResponse) => {
                return {
                    checkIn: getTime(item.loginTime),
                    checkOut: getTime(item.logoutTime),
                    date: item.date,
                    employeeId: item.empId,
                    employeeName: "",
                    status: item.loginTime ? "present" : "absent",
                    totalHours: item.logoutTime && item.loginTime
                        ? ((new Date(item.logoutTime).getTime() - new Date(item.loginTime).getTime()) / (1000 * 60 * 60)).toFixed(2)
                        : "0",
                    id: item.id
                } as AttendanceData;
            });

            setEmployeeDetails(_employees)
            setAttendanceDetails(_attendanceData)
            setRoles(Array.from(roles) as string[]);
            setEmpLeaves(empLeaves || [])
            setEmployeePayroll(employeePayrollData)
            if (dimErrors) {
                throw new Error(dimErrors?.message);
            }
            if (employeePayrollErrors) {
                throw new Error(employeePayrollErrors?.message);
            }
            if (empLeaveErrors) {
                throw new Error(empLeaveErrors?.message);
            }
            if (empBankErrors) {
                throw new Error(empBankErrors?.message);
            }

            if (empAttendanceError) {
                throw new Error(empAttendanceError?.message);
            }
        } catch (error) {
            console.log({ error })
        }
    }, [rerender])

    useEffect(() => {
        fetch();
    }, [rerender])

    const value = useMemo(() => ({
        employeeDetails,
        attendanceDetails,
        roles: Array.from(roles),
        refetchData,
        empLeaves,
        employeePayroll
    }), [employeeDetails, attendanceDetails, employeePayroll, empLeaves])
    return <HrContext.Provider value={value}>{children}</HrContext.Provider>
}

// Custom hook to use the order context
export function useHrContext() {
    const context = useContext(HrContext)

    if (context === undefined) {
        throw new Error("useOrders must be used within an OrderProvider")
    }

    return context
}