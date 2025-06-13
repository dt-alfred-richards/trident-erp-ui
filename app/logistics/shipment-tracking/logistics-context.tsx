"use client"; // required

import { createBoilerContext } from "@/components/custom/context-boilercode";
import { Basic } from "@/contexts/types";

export type LogisticsProduct = {
    sku: string,
    totatOrderQuantity: number,
    allocatedQuantity: number,
    dispatchQuantity: number
}

export type Logistics = {
    id: number,
    products: string,
    vehicle: string,
    driver: string,
    contactNumber: string,
    deliveryAddress: string,
    deliveryNote: string,
    status: string,
    clientId: string,
    orderId: string
} & Basic

export const { BoilerProvider: LogisticsProvider, useBoiler: useLogistics } = createBoilerContext<Logistics>("v1_logistics")