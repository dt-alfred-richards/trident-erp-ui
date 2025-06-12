"use client"; // required

import { createBoilerContext } from "@/components/custom/context-boilercode";
import { Basic } from "@/contexts/types";

type Product = {
    sku: string,
    totatOrderQuantity: number,
    allocatedQuantity: number,
    dispatchQuantity: number
}

export type Logistics = {
    id: number,
    products: Product[],
    vehicleId: string,
    driverId: string,
    contactNumber: string,
    deliveryAddress: string,
    deliveryNote: string,
    status: string
} & Basic

export const { BoilerProvider: LogisticsProvider, useBoiler: useLogistics } = createBoilerContext<Logistics>("v1_logistics")