import { DataByTableName } from "@/components/utils/api"
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react"

type HrContextType = {
    employeeDetails: EmployeeRow[],
    attendanceDetails: AttendanceData[],
    refetchData: () => void
}

type DimEmployee = {
    empId: string,
    name: string,
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
    lastName?: string
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
    gender: string
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
    logoutTime: string
}


const HrContext = createContext<HrContextType | undefined>(undefined)


export function HrProvider({ children }: { children: ReactNode }) {
    const [employeeDetails, setEmployeeDetails] = useState<EmployeeRow[]>([])
    const [attendanceDetails, setAttendanceDetails] = useState<AttendanceData[]>([])
    const [rerender, setRerender] = useState(false)

    const refetchData = useCallback(() => {
        setRerender(i => !i)
    }, [])

    const getTime = useCallback((timestamp: string) => {
        return timestamp.split("T")[1].split(":").slice(0, 2).join(":"); // Extracts HH:MM
    }, [])

    const fetch = useCallback(async () => {
        try {
            const dimEmployee = new DataByTableName("dim_employee");
            const empAttendence = new DataByTableName("emp_attendence");
            const { data: de, error: dee } = await dimEmployee.get();
            const { data: ea, error: ee } = await empAttendence.get();
            const _employees = de.map((item: DimEmployee) => {
                return ({
                    contactNumber: item.contactNumber,
                    dateOfJoining: item.joiningDate,
                    department: item.department,
                    email: item.email,
                    employeeType: "",
                    firstName: item.name,
                    gender: "",
                    id: item.empId,
                    lastName: item?.lastName ?? "",
                    role: item.role,
                    salary: item.salary
                }) as EmployeeRow
            })

            const _attendanceData = ea.map((item: AttendaceResponse, index: number) => {
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
                    id: index
                } as AttendanceData;
            });

            setEmployeeDetails(_employees)
            setAttendanceDetails(_attendanceData)
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