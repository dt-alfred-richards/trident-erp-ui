'use client'

import { OrderDetails } from "@/components/sales/sales-dashboard";
import { DataByTableName } from "@/components/utils/api";
import { createType } from "@/components/utils/generic";
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useState } from "react";

interface OrderProduct {
    id: string
    name: string
    sku: string
    quantity: number
    allocated?: number
}

export type Allocations = {
    id: string,
    timestamp: string,
    user: string,
    orderId: string,
    customer: string,
    sku: string,
    allocated: OrderDetails["casesReserved"],
    requested: OrderDetails["cases"],
    status: OrderDetails["status"],
    reason: string,
}

type FinalProduction = {
    date: string,
    productId: string,
    opening: number,
    production: number,
    outward: number,
    closing: number
}

type Cummulative = {
    date: string,
    productId: string,
    stock: number
}

type FinishedGoodsContextType = {
    cummlative: Cummulative[],
    finishedGoods: FinalProduction[],
    orderDetails: OrderDetails[],
    triggerRerender: () => void,
    productionDetails: ProductionDetails[]
}

export type ProductionDetails = {
    numBottles: number,
    numCases: number,
    createdOn: number,
    createdBy: string,
    modifiedOn: number,
    modifiedBy: string,
    id: number,
    status: string,
    productionId: string,
    endTime: string,
    delivered: number,
    clientId: string,
    sku: string,
    startTime: number,
    progress: number,
    date: string
}

const FinishedGoodsContext = createContext<FinishedGoodsContextType>({} as any);

export const FinishProvider = ({ children }: { children: ReactNode }) => {
    const [cummlative, setCummlative] = useState<Cummulative[]>([]);
    const [finishedGoods, setFinishedGoods] = useState<FinalProduction[]>([]);
    const [orderDetails, setOrderDetails] = useState<OrderDetails[]>([]);
    const [fetchTrigger, setFetchTrigger] = useState(true); // Using a timestamp instead of a separate `rerender` state
    const [productionDetails, setProductionDetails] = useState<ProductionDetails[]>([])

    const triggerRerender = useCallback(() => setFetchTrigger(p => !p), []);

    useEffect(() => {
        const orderDetailsInstance = new DataByTableName("order_details") as any;
        const finishedGoodsInstance = new DataByTableName("fact_fp_inventory_v2");
        const cummulativeInstance = new DataByTableName("cumulative_inventory");
        const productionDetailsInstance = new DataByTableName("production_details");

        Promise.allSettled([
            orderDetailsInstance.get(),
            finishedGoodsInstance.get(),
            cummulativeInstance.get(),
            productionDetailsInstance.get()
        ]).then((responses: any[]) => {
            setOrderDetails(responses[0]?.value?.data?.data ?? []);
            setFinishedGoods(responses[1]?.value?.data?.data ?? []);
            setCummlative(responses[2]?.value?.data?.data ?? []);
            setProductionDetails(responses[3]?.value?.data?.data ?? []);
        });
    }, [fetchTrigger]); // Trigger fetch when `fetchTrigger` updates

    return (
        <FinishedGoodsContext.Provider value={{ cummlative, finishedGoods, orderDetails, triggerRerender, productionDetails }}>
            {children}
        </FinishedGoodsContext.Provider>
    );
};


export function useFinished() {
    const context = useContext(FinishedGoodsContext)

    if (context === undefined) {
        throw new Error("useOrders must be used within an OrderProvider")
    }

    return context
}

