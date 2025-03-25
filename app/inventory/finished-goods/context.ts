import { OrderDetails } from "@/components/sales/sales-dashboard";
import { createContext, Dispatch, SetStateAction } from "react";

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

export const FinishedGoodsContext = createContext<{
    cummlative: Cummulative[],
    finishedGoods: FinalProduction[],
    orderDetails: OrderDetails[],
    setRerender: () => void
}>({
    cummlative: [],
    finishedGoods: [],
    orderDetails: [],
    setRerender: () => { }
});

