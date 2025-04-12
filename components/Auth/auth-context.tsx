"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { DataByTableName } from "../utils/api";

// Define context type
interface AccessContextProps {
    role: string | null;
    roleMapping: Record<string, string[]>,
    pathname: string
}

const AccessContext = createContext<AccessContextProps | null>(null);

// Access Provider to store user role
export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const [roleMapping, setRoleMapping] = useState<Record<string, string[]>>({})
    const [token, setToken] = useState("")

    useEffect(() => {
        const accessInstance = new DataByTableName("access_mapping");
        accessInstance.get().then(res => {
            const data = (res.data.data || []).reduce((acc: any, curr: any) => {
                acc[curr.role] = curr.permissions;
                return acc;
            }, {})
            setRoleMapping(data)
        })
    }, [])


    useEffect(() => {
        if (typeof window === undefined) return;
        const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token") || '';
        setToken(storedToken)
    }, [])

    useEffect(() => {
        if (Object.values(roleMapping).length === 0) return;
        if (!token && pathname !== "/login") {
            return;
        }

        try {
            const decoded: { role: string, exp: number } = jwtDecode(token || "");
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                console.warn("Token expired. Redirecting to login...");
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("role");
                localStorage.removeItem("role");
                return;
            }

            if (!roleMapping[decoded.role]) {
                return;
            }
            setRole(decoded.role);
        } catch (error) {
            console.log({ error })
        }
    }, [router, roleMapping, pathname, token]);

    const value = useMemo(() => ({
        role, roleMapping, pathname
    }), [role, roleMapping])

    return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
};

// Custom Hook to check permissions dynamically
export const useAccess = (tableName: string) => {
    const context = useContext(AccessContext);
    if (!context) {
        throw new Error("useAccess must be used within an AccessProvider");
    }

    const { role, roleMapping, pathname } = context;
    const permissions = role ? roleMapping[role] || [] : [];

    return {
        canRead: permissions.includes(`${tableName}:read`),
        canWrite: permissions.includes(`${tableName}:write`),
        canDelete: permissions.includes(`${tableName}:delete`),
        canUpdate: permissions.includes(`${tableName}:update`),
        pathname
    };
};
