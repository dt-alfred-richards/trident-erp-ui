"use client";
import { DataByTableName } from "@/components/api";
import { createType, getChildObject, removebasicTypes } from "@/components/generic";
import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Employee } from "../app/hr/hr-context";
import { useRouter } from 'next/navigation' // ✅ Correct

type Token = {
    firstName: string,
    lastName: string,
    sessionId: string,
    email: string,
    iat: number,
    exp: number,
    userId: string,
    role: string
}

type Session = {
    id: number,
    userId: string,
    createdOn: Date,
    createdBy: string,
    location: string,
    deviceInfo: string,
    sessionId: string
}

type GloabalPropType = {
    userId: string,
    userName: string,
    userEmail: string,
    usersMapper: Record<string, string>,
    user: Partial<Employee>,
    saveUser?: (payload: Partial<Employee>) => Promise<void>,
    tokenDetails: Token,
    sessionInfo: Session[],
    logout?: () => void,
    logoutSession: (sessionId: string) => void
    login: (payload: any, rememberMe: boolean) => void
}

const GlobalContext = createContext<GloabalPropType>({
    user: {},
    userId: "",
    userName: "",
    userEmail: "",
    usersMapper: {},
    tokenDetails: {} as Token,
    sessionInfo: [] as Session[],
    logoutSession: () => { },
    login: () => { }
})


export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const fetchRef = useRef(true)
    const router = useRouter()
    const [userDetails, setUserDetails] = useState({})
    const [usersMapper, setUsersMapper] = useState<Record<string, string>>({})
    const [user, setUser] = useState<Partial<Employee>>({})
    const employeeInstance = new DataByTableName("v1_employee");
    const [tokenDetails, setTokenDetails] = useState<Token>({} as Token)
    const [sessionInfo, setSessionInfo] = useState<Session[]>([])
    const [token, setToken] = useState("")

    useEffect(() => {
        const _token = localStorage?.getItem("token") || sessionStorage?.getItem("token") || ""
        setToken(_token)
    }, [])

    const sessionInstance = new DataByTableName("v1_user_sessions")

    const fetchData = () => {
        const decodeToken = jwtDecode(token) as Token;

        Promise.allSettled([
            employeeInstance.getby({ column: "id", value: decodeToken.userId }),
            sessionInstance.getby({ column: "user_id", value: decodeToken.userId })
        ]).then(responses => {
            const employeeResponse = getChildObject(responses, "0.value.data.0", {})
            const sessionInfoResponse = getChildObject(responses, "1.value.data", []);
            const checkForActiveSessions = sessionInfoResponse.find((item: Session) => item.sessionId === decodeToken.sessionId)

            if (!checkForActiveSessions) {
                router?.push("/login")
            }
            setSessionInfo(sessionInfoResponse)
            setUser(employeeResponse)
            setTokenDetails(decodeToken)
        })
    }

    useEffect(() => {
        if (!fetchRef.current || !token) return;
        fetchRef.current = false;
        fetchData()
    }, [token])

    const apiInstance = new DataByTableName("")


    const login = (payload: any, rememberMe: boolean) => {
        apiInstance.login(payload).then(res => {
            const token = getChildObject(res, "token", '')
            if (rememberMe) {
                localStorage.setItem("token", token)
            } else {
                sessionStorage.setItem("token", token)
            }
            router?.push("/")
        }).then(fetchData)
    }

    const saveUser = (payload: Partial<Employee>) => {
        return employeeInstance.patch({
            key: "employee_id",
            value: payload.employeeId
        }, removebasicTypes(payload, ["id", "employeeId",]))
            .then(() => {
                fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }

    const logout = () => {
        sessionInstance.deleteById({ key: "user_id", value: tokenDetails.userId }).then(() => {
            localStorage.removeItem("token")
            sessionStorage.removeItem("token")
            router?.push("/login")
        })
    }

    const logoutSession = (sessionId: string) => {
        sessionInstance.deleteById({ key: "session_id", value: sessionId }).then(fetchData)
    }


    return <GlobalContext.Provider value={{
        userEmail: getChildObject(userDetails, "email", ""),
        userId: getChildObject(userDetails, "id", ""),
        userName: getChildObject(userDetails, "name", ""),
        usersMapper,
        user,
        saveUser,
        tokenDetails,
        sessionInfo,
        logout,
        logoutSession,
        login
    }}>{children}</GlobalContext.Provider>
}

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);

    if (!context) {
        throw new Error("Please wrap global provider to parent")
    }

    return context;
}