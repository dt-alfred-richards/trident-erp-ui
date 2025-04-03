"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { DataByTableName } from "../utils/api";

// Define context type
interface AccessContextProps {
    role: string | null;
    roleMapping: Record<string, string[]>
}

const AccessContext = createContext<AccessContextProps | null>(null);

// Access Provider to store user role
export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const [roleMapping, setRoleMapping] = useState<Record<string, string[]>>({})

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


    const redirectToLogin = useCallback(() => {
        if (pathname !== '/login') {
            router.push('/login')
        }
    }, [pathname])

    useEffect(() => {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQzNjk2NTE2fQ.CkxY1xunRpY_4noaT1QxcBAgFjR8legJOIhi-gVhHyk"

        localStorage.setItem("token", token);
        // const token = localStorage.getItem("token");

        if (Object.values(roleMapping).length === 0) {
            return;
        }

        if (!token && pathname !== "/login") {
            redirectToLogin();
            return;
        }

        try {
            const decoded: { role: string, exp: number } = jwtDecode(token || "");
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                console.warn("Token expired. Redirecting to login...");
                localStorage.removeItem("token");
                redirectToLogin();
                return;
            }

            if (!roleMapping[decoded.role]) {
                redirectToLogin();
                return;
            }
            setRole(decoded.role);
        } catch (error) {
            console.log({ error })
            redirectToLogin();
        }
    }, [router, roleMapping, pathname]);

    const value = useMemo(() => ({
        role, roleMapping
    }), [role, roleMapping])

    return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
};

// Custom Hook to check permissions dynamically
export const useAccess = (tableName: string) => {
    const context = useContext(AccessContext);
    if (!context) {
        throw new Error("useAccess must be used within an AccessProvider");
    }

    const { role, roleMapping } = context;
    const permissions = role ? roleMapping[role] || [] : [];

    return {
        canRead: permissions.includes(`${tableName}:read`),
        canWrite: permissions.includes(`${tableName}:write`),
        canDelete: permissions.includes(`${tableName}:delete`),
        canUpdate: permissions.includes(`${tableName}:update`),
    };
};
