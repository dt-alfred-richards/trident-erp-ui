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
    reserved: number,
    inProduction: number
}

type InventoryContext = {
    inventory: Inventory[],
    updateInventory?: (payload: Partial<Inventory>) => Promise<void>,
    updateSaleAllocation?: (payload: any, id: string, selectedOrder: any) => Promise<void>,
    refetchContext?: VoidFunction,
    allocations: any[]
}

const InventoryContext = createContext<Partial<InventoryContext>>({})

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const fetchRef = useRef(true);
    const [inventory, setInventory] = useState([])
    const [allocations, setAllocations] = useState([])
    const inventoryInstance = new DataByTableName("v1_inventory");
    const saleOrderDetailInstance = new DataByTableName("sales_order_details");
    const allocationInstance = new DataByTableName("v1_sale_allocation");
    const fetchData = () => {
        Promise.allSettled([
            inventoryInstance.get(),
            allocationInstance.get()
        ]).then(response => {
            const inventoryResponse = getChildObject(response, "0.value.data", []);
            const allocationResponse = getChildObject(response, "1.value.data", []);
            setInventory(inventoryResponse)
            setAllocations(allocationResponse)
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
    const updateSaleAllocation = (payload: any, id: string, selectedOrder: any) => {
        const saleId = getChildObject(selectedOrder, "id", "")
        const products = getChildObject(selectedOrder, "products", [])
        const product = products.find((item: any) => item.id === id)
        if (!saleId || !product) return Promise.reject("Not enough data");
        return saleOrderDetailInstance.patch({ key: "product_id", value: id }, payload).then(() => {
            return allocationInstance.post({
                orderId: saleId,
                sku: getChildObject(product, "sku", ""),
                allocated: getChildObject(payload, "allocated", 0)
            })
        }).catch(error => {
            console.log({ error })
        })
    }

    return <InventoryContext.Provider value={{
        inventory,
        updateInventory,
        updateSaleAllocation,
        refetchContext: fetchData,
        allocations
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