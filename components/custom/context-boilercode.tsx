"use client";

import { useEffect, useRef, useState } from "react"
import { DataByTableName } from "../api"
import { getChildObject, removebasicTypes } from "../generic"

import { createContext, ReactNode, useContext } from "react"

type ContextBoilder<T> = {
    data: T[],
    create: (payload: Partial<T>, refetch?: boolean) => Promise<void>,
    update: (payload: Partial<T>, refetch?: boolean) => Promise<void>,
    deleteItem: (itemId: number, refetch?: boolean) => Promise<void>
}


const useContextBoilerCode = <T,>(tableName: string): ContextBoilder<T> => {
    const tableInstance = new DataByTableName(tableName);
    const fetchRef = useRef(true);
    const [data, setData] = useState<T[]>([])

    const fetchData = () => {
        tableInstance.get().then(response => {
            const responseData = getChildObject(response, "data", []);
            setData(responseData)
        })
    }

    useEffect(() => {
        if (!tableName || !fetchRef.current) return;
        fetchData();
        fetchRef.current = false
    }, [])


    const create = (payload: Partial<T>, refetchData: boolean = true) => {
        return tableInstance.post(payload)
            .then(() => {
                if (refetchData) fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }

    const update = (payload: Partial<T>, refetchData: boolean = true) => {
        const rowId = getChildObject(payload, "id", "")
        if (!rowId) {
            alert("Payload doesnt have row id")
            return Promise.reject("Failed due to no row id");
        }
        return tableInstance.patch({
            key: "id",
            value: rowId
        }, removebasicTypes(payload))
            .then(() => {
                if (refetchData) fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }

    const deleteItem = (itemId: number, refetch: boolean = true) => {
        if (itemId < 0) {
            alert("Item id is missing")
            return Promise.reject("Failed due to no row id");
        }
        return tableInstance.deleteById({
            key: "id",
            value: itemId
        })
            .then(() => {
                if (refetch) fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }


    return {
        data,
        create,
        update,
        deleteItem
    }
}
export function createBoilerContext<T>(tableName: string) {
    const BoilerContext = createContext<ContextBoilder<T> | null>(null)

    const BoilerProvider = ({ children }: { children: ReactNode }) => {
        const boiler = useContextBoilerCode<T>(tableName)
        return (
            <BoilerContext.Provider value={boiler}>
                {children}
            </BoilerContext.Provider>
        )
    }

    const useBoiler = () => {
        const context = useContext(BoilerContext)
        if (!context) {
            console.log(`useBoiler must be used within a ${tableName} BoilerProvider`)
        }
        return context
    }

    return {
        BoilerProvider,
        useBoiler,
    }
}
