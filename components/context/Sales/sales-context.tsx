"use client"

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DataByTableName } from "../../api"
import { Client, ClientReferences, Sale } from "./sales-types";

const SalesContext = createContext<{
    sales: Sale[],
    clients: Client[],
    clientReferences: ClientReferences[],
    refetchContext: VoidFunction
}>({
    sales: [],
    clients: [],
    clientReferences: [],
    refetchContext: () => { }
});

export const SalesProvider = ({ children }: { children: ReactNode }) => {
    const fetchRef = useRef(true);

    const [setRerender, setSetRerender] = useState(false)
    const [sales, setSales] = useState([]);
    const [clients, setClients] = useState([])
    const [clientReferences, setClientReferences] = useState([])

    const fetchContextInfo = useCallback(() => {
        const referenceInstance = new DataByTableName("client_references");
        const clientInstance = new DataByTableName("clients");
        const salesInstance = new DataByTableName("sales");

        Promise.allSettled([
            referenceInstance.get(),
            clientInstance.get(),
            salesInstance.get()
        ]).then(responses => {
            console.log({ responses })
        })
    }, [fetchRef])

    useEffect(() => {
        if (!fetchRef.current) return
        fetchRef.current = false;
        fetchContextInfo()
    }, [fetchRef, fetchContextInfo])

    const contextValue = useMemo(() => {
        return ({ clientReferences, sales, clients, refetchContext: fetchContextInfo })
    }, [clientReferences, clients, sales])

    return <SalesContext.Provider value={contextValue}>
        {children}
    </SalesContext.Provider>
}


export const useSales = () => {
    const context = useContext(SalesContext)

    if (!context) {
        throw new Error("Sales context is not initilised yet")
    }
    return context;
}