import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { getChildObject } from "@/components/generic";
import { DataByTableName } from "@/components/api";

type GloabalPropType = {
    userId: string,
    userName: string,
    userEmail: string,
    usersMapper: Record<string, string>
}

const GlobalContext = createContext<GloabalPropType>({
    userId: "",
    userName: "",
    userEmail: "",
    usersMapper: {}
})

type User = {
    id: string, name: string
}


export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const fetchRef = useRef(true)
    const [userDetails, setUserDetails] = useState({})
    const [usersMapper, setUsersMapper] = useState<Record<string, string>>({})

    useEffect(() => {
        if (!fetchRef.current) return;

        fetchRef.current = false;
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJpYXQiOjE3NDc1NTI5MDR9.uBLHguj0ToxYnfH9-qxHacUELnmO5xd-qkK3ZGIYwuE";

        const tokenPayload = jwtDecode(token)
        const usersInstance = new DataByTableName("users");

        usersInstance.get().then(res => {
            const _usersMapper = getChildObject(res, "data", []).reduce((acc: Record<string, string>, curr: User) => {
                if (!acc[curr.id]) {
                    acc[curr.id] = curr.name
                }
                return acc;
            }, {} as Record<string, string>)
            setUsersMapper(_usersMapper)
            setUserDetails(tokenPayload)
        }).catch(error => {
            console.log({ error })
        })
    }, [])

    const contextValue = useMemo<GloabalPropType>(() => {
        return ({
            userEmail: getChildObject(userDetails, "email", ""),
            userId: getChildObject(userDetails, "id", ""),
            userName: getChildObject(userDetails, "name", ""),
            usersMapper
        })
    }, [userDetails, usersMapper])

    return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>
}

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);

    if (!context) {
        throw new Error("Please wrap global provider to parent")
    }

    return context;
}