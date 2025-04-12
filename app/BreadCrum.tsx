'use client'

import { useAccess } from "@/components/Auth/auth-context";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Fragment, ReactNode, useEffect, useState } from "react";

export const BreadCrumb = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === undefined) return;
        const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
        setToken(storedToken);
    }, []);

    return <div className="flex-1 flex flex-col min-w-0 m-2 ml-0">
        {
            !token ? children : <Fragment>
                <div className="flex h-16 items-center border-b px-4 bg-background rounded-t-xl">
                    <div className="ml-4">
                        <BreadcrumbNav />
                    </div>
                </div>
                <main className="flex-1 overflow-auto p-4 w-full bg-background rounded-b-xl">{children}</main>
            </Fragment>
        }
    </div>
}

