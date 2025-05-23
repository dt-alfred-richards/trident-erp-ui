"use client"

import { DataByTableName } from "@/components/api";
import { getChildObject } from "@/components/generic";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

export type Inventory = {
    category: string,
    createdOn: Date,
    id: number,
    createdBy: string,
    inventoryId: string,
    modifiedOn: Date,
    quantity: number,
    material: string,
    status: string,
    wastage?: number,
}

type InventoryContext = {
    inventory: Inventory[],
    updateInventory?: (payload: Partial<Inventory>) => Promise<void>
}

const InventoryContext = createContext<Partial<InventoryContext>>({})

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const fetchRef = useRef(true);
    const [inventory, setInventory] = useState([])
    const inventoryInstance = new DataByTableName("v1_inventory");

    const fetchData = () => {
        Promise.allSettled([
            inventoryInstance.get()
        ]).then(response => {
            const inventoryResponse = getChildObject(response, "0.value.data", []);
            setInventory(inventoryResponse)
        })
    }
    useEffect(() => {
        if (!fetchRef.current) return;
        fetchRef.current = false;
        fetchData()
    }, [])

    const updateInventory = (payload: Partial<Inventory>) => {
        const id = payload.id || ""
        return inventoryInstance.patch({ key: "id", value: id }, Object.fromEntries(Object.entries(payload).filter(([key]) => key !== 'id')))
            .then(() => {
                fetchData()
            }).catch(error => {
                console.log({ error })
            })
    }

    return <InventoryContext.Provider value={{
        inventory,
        updateInventory
    }}>
        {children}
    </InventoryContext.Provider>
}


export const useInventory = () => {
    const context = useContext(InventoryContext);

    if (!context) {
        console.log("Please wrap inventory provider")
    }

    return context;
}