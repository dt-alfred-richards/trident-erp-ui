"use client"
import { DataByTableName } from "@/components/api";
import { createType, getChildObject, removebasicTypes } from "@/components/generic";
import { Basic } from "@/contexts/types";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

export type Employee = {
    id: string,
    employeeId?: string,
    firstName: string,
    middleName: string,
    lastName: string,
    gender: string,
    bloodGroup: string,
    contactNumber: string,
    emailId: string,
    dob: string,
    aadhaarNumber: string,
    aadhaarImgUrl: string,
    address: string,
    employeeType: string,
    dateOfJoining: string,
    department: string,
    role: string,
    shiftDuration: string,
    leaves: number,
    sundayOn: boolean,
    payCycle: string,
    salary: string,
    panNumber: string,
    bankName: string,
    bankBranch: string,
    accountNumber: string,
    ifscCode: string,
    password: string,
    personalEmail: string,
    usedLeaves: number,
    bio: string,
    language: string,
    timezone: string,
    nationality: string,
    workPhone: string,
    city: string,
    state: string,
    postalCode: string,
    country: string,
    averageWorkingHours: string,
    basePay: string,
    monthlyPayment: string,
    uanNumber: string,
    earnedLeaves: string,
    twoFactor: boolean,
    systemAlerts: boolean,
    orderUpdates: boolean,
    productionStatusChanges: boolean,
    inventoryAlerts: boolean,
    financialReports: boolean,
    taskAssignments: boolean,
    mentions: boolean,
    comments: boolean,
    approvals: boolean,
    systemUpdates: boolean,
    startTime: string,
    endTime: string,
    quietHours: boolean,
    loggedOn?: Date
} & Basic;

type EmployeeLeaves = {
    id: number,
    leaveId: string,
    reason: string,
    employeeId: string,
} & Basic

type LeaveData = {
    date: Date,
    reason: string
}

export type DailyAttendance = {
    id: number,
    dailyAttendanceId: string,
    employeeId: string,
    employeeName: string,
    checkIn: string,
    checkOut: string,
    totalHours: string,
    status: string,
    createdOn: Date,
    modifiedOn: Date,
    createdBy: string,
    modifiedBy: string,
    date: Date
}

type Context = {
    employees: Employee[],
    employeeLeaves: Record<string, LeaveData[]>
    dailyAttendance: DailyAttendance[],
    addEmployee: (payload: Partial<Employee>) => Promise<void>,
    updateEmployee: (employeeId: string, payload: Partial<Employee>) => Promise<void>,
    deleteEmployee: (employeeId: string) => Promise<void>,
    refetch: VoidFunction,
    addAttendance: (payload: Partial<DailyAttendance>) => Promise<void>,
    updateAttendance: (attendanceId: string, payload: Partial<DailyAttendance>) => Promise<void>
}


const HrContext = createContext<Context>({
    employees: [],
    employeeLeaves: {},
    dailyAttendance: [],
    updateAttendance: (attendanceId: string, payload: Partial<DailyAttendance>) => Promise.resolve(),
    addAttendance: (payload: Partial<DailyAttendance>) => Promise.resolve(),
    addEmployee: (payload: Partial<Employee>) => Promise.resolve(),
    updateEmployee: (employeeId: string, payload: Partial<Employee>) => Promise.resolve(),
    deleteEmployee: (employeeId: string) => Promise.resolve(),
    refetch: () => { }
})


export const HrProvider = ({ children }: { children: ReactNode }) => {
    const fetchRef = useRef(true)
    const [employees, setEmployees] = useState([])
    const [employeeLeaves, setEmployeeLeaves] = useState<Record<string, LeaveData[]>>({})
    const [dailyAttendance, setDailyAttendance] = useState([])
    const employeeInstance = new DataByTableName("v1_employee")
    const employeeleavesInstance = new DataByTableName("v1_employee_leaves")
    const dailyAttendanceInstance = new DataByTableName("v1_employee_daily_attendance")

    const fetchData = () => {
        Promise.allSettled([
            employeeInstance.get(),
            employeeleavesInstance.get(),
            dailyAttendanceInstance.get()
        ]).then(response => {
            const employeeResponse = getChildObject(response, "0.value.data", []).map((item: Employee) => ({ ...item, id: getChildObject(item, "employeeId", "") }))
            const empLeaveResponse = getChildObject(response, "1.value.data", []).reduce((acc: Record<string, LeaveData[]>, curr: EmployeeLeaves) => {
                if (!acc[curr.employeeId]) {
                    acc[curr.employeeId] = []
                }
                acc[curr.employeeId].push({
                    date: curr.createdOn || curr.modifiedOn,
                    reason: curr.reason
                })
                return acc;
            }, {} as Record<string, LeaveData[]>)
            const dailyAttendanceResponse = getChildObject(response, "2.value.data", [])
            setDailyAttendance(dailyAttendanceResponse)
            setEmployees(employeeResponse)
            setEmployeeLeaves(empLeaveResponse)
        })
    }

    const addEmployee = (payload: Partial<Employee>) => {
        const _payload = removebasicTypes(payload, ["id"])
        return employeeInstance.post(_payload)
            .then(_ => {
                fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }
    const addAttendance = (payload: Partial<DailyAttendance>) => {
        const _payload = removebasicTypes(payload, ["id"])
        return dailyAttendanceInstance.post(_payload)
            .then(_ => {
                fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }
    const updateEmployee = (employeeId: string, payload: Partial<Employee>) => {
        const _payload = removebasicTypes(payload, ["id", "employeeId"])
        return employeeInstance.patch({ key: "employee_id", value: employeeId }, _payload).catch(error => {
            console.log({ error })
        })
    }
    const updateAttendance = (attendanceId: string, payload: Partial<DailyAttendance>) => {
        const _payload = removebasicTypes(payload, ["id", "employeeId"])
        return dailyAttendanceInstance.patch({ key: "id", value: attendanceId }, _payload).catch(error => {
            console.log({ error })
        })
    }

    const deleteEmployee = (employeeId: string) => {
        return employeeInstance.deleteById({ key: "employee_id", value: employeeId }).catch(error => {
            console.log({ error })
        })
    }
    useEffect(() => {
        if (!fetchRef.current) return;
        fetchRef.current = false;
        fetchData();
    }, [])
    return <HrContext.Provider value={{
        employees,
        employeeLeaves,
        dailyAttendance,
        addAttendance,
        updateAttendance,
        addEmployee, deleteEmployee, updateEmployee, refetch: fetchData
    }}>
        {children}
    </HrContext.Provider>
}



export const useHrContext = () => {
    const context = useContext(HrContext)
    if (!context) {
        console.log("Please wrap with hr provider ")
    }
    return context
}

