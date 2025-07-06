"use client"

import { Basic } from "@/contexts/types";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { DataByTableName } from "../api";
import { getChildObject, removebasicTypes } from "../generic";


type V1ProductionOrder = {
    id: number;
    productionOrderId: string; // Generated as 'PROD-' || id
    productId: string;
    inProduction: number;
    quantity: number,
    produced: number;
    deadline: Date; // ISO string (e.g., from timestamptz)
    bomId: string;
    sku: string;
    assignedTo: string,
    status: string;
} & Partial<Basic>;

type Context = {
    productionOrders: V1ProductionOrder[],
    createProductionOrder: (newOrder: Partial<V1ProductionOrder>) => Promise<void>,
    deleteProductionOrder: (productionOrderId: string) => Promise<void>,
    updateProductionOrder: (orderId: string, productionOrder: Partial<V1ProductionOrder>) => Promise<void>,
    refetch: VoidFunction
}

const ProductionContext = createContext<Partial<Context>>({})

export const ProductionProvider = ({ children }: { children: ReactNode }) => {
    const [productionOrders, setProductionOrders] = useState([])

    const productionInstance = new DataByTableName("v1_production_order")

    const fetchRef = useRef(true)

    const setStatus = (item: V1ProductionOrder) => {
        const currentStatus = item.status || "pending";
        if (item.quantity === item.produced) return "completed"
        else return currentStatus
    }

    const fetchData = () => {
        Promise.allSettled([
            productionInstance.get(),
        ]).then(responses => {
            const productionOrderResponse = getChildObject(responses, "0.value.data", []).map(item => ({
                ...item, status: setStatus(item)
            }))
            setProductionOrders(productionOrderResponse)
        })
    }

    useEffect(() => {
        if (!fetchRef.current) return;
        fetchRef.current = false;
        fetchData();
    }, [])

    const createProductionOrder = (newOrder: Partial<V1ProductionOrder>) => {
        return productionInstance.post(removebasicTypes({ ...newOrder, status: "pending" }, ["id", "productionOrderId"])).catch(error => {
            console.log({ error })
        })
    }

    const deleteProductionOrder = (productionOrderId: string) => {
        return productionInstance.deleteById({ key: "production_order_id", value: productionOrderId }).catch(error => {
            console.log({ error })
        })
    }

    const updateProductionOrder = (orderId: string, productionOrder: Partial<V1ProductionOrder>) => {
        return productionInstance.patch({
            key: "production_order_id",
            value: orderId
        }, removebasicTypes(productionOrder, ["id", "production_order_id"])).catch(error => {
            console.log({ error })
        }).catch(error => {
            console.log({ error })
        })
    }


    return <ProductionContext.Provider value={{
        productionOrders,
        createProductionOrder,
        refetch: fetchData,
        deleteProductionOrder,
        updateProductionOrder
    }}>
        {children}
    </ProductionContext.Provider>
}

export const useProduction = () => {
    const context = useContext(ProductionContext)
    if (context === undefined) {
        console.log("useProduction must be used within an ProductionProvider")
    }
    return context;
}