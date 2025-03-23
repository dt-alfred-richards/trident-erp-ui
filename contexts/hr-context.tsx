import { DataByTableName } from "@/components/utils/api"
import { createType } from "@/components/utils/generic"
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react"

type HrContextType = {
    employeeDetails: EmployeeRow[],
    attendanceDetails: AttendanceData[],
    refetchData: () => void,
    roles: string[]
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
    gender: string
}

export type EmployeeRow = {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    role: string,
    department: string,
    employeeType: string,
    salary: number,
    contactNumber: number,
    dateOfJoining: string,
    gender: string,
    address: string,
    panNumber: string,
    pfNumber: string,
    sundayHoliday: boolean,
    esiNumber: string,
    bankDetails: EmployeeBankDetails
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


const HrContext = createContext<HrContextType | undefined>(undefined)


export function HrProvider({ children }: { children: ReactNode }) {
    const [employeeDetails, setEmployeeDetails] = useState<EmployeeRow[]>([])
    const [attendanceDetails, setAttendanceDetails] = useState<AttendanceData[]>([])
    const [rerender, setRerender] = useState(false)
    const [roles, setRoles] = useState<string[]>([])

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

            const { data: de, error: dee } = await dimEmployee.get();
            const { data: eb, error: ebe } = await empBankDetails.get();
            const { data: ea, error: ee } = await empAttendence.get();

            const bankMapper = Object.fromEntries(eb.map((item: EmployeeBankDetails) => [item.employeeId, item]))
            const _employees = de.sort((a: any, b: any) => b.id - a.id).map((item: DimEmployee) => {
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
                    bankDetails: bankMapper[item.empId] ?? {}
                }) as EmployeeRow
            })

            const roles = new Set(_employees.map((item: DimEmployee) => item.role));

            const _attendanceData = ea.sort((a: any, b: any) => b.date - a.date).map((item: AttendaceResponse) => {
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
            setRoles(roles);
            if (dee) {
                throw new Error(dee?.message);
            }

            if (ee) {
                throw new Error(ee?.message);
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
        refetchData
    }), [employeeDetails, attendanceDetails])
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