import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DataByTableName } from "../api";
import { getChildObject, removebasicTypes } from "../generic";
import { number } from "zod";
import { Basic } from "@/contexts/types";
import { useOrders } from "@/contexts/order-context";
import { useInventory } from "@/app/inventory-context";

export type Bom = {
    id: number,
    bomId: string,
    productId: string,
    productName?: string,
    status: boolean,
} & Basic


export type BomComponent = {
    id: number,
    bomCompId: string,
    bomId: string,
    materialId: string,
    materialName: string,
    type: string,
    quantity: number,
    unit: string,
    cost: number
} & Partial<Basic>

export type BomAndComponent = Bom & { components: BomComponent[], unitCost: number }

export type MaterialOptions = {
    name: string,
    unit: string,
    cost: number,
    materialId: string
}
type Context = {
    bom: BomAndComponent[],
    addBom: (bomItem: Partial<Bom>, bomComponents: Partial<BomComponent>[]) => Promise<void>,
    addBomComponent: (bomId: string, payload: Partial<BomComponent>) => Promise<void>,
    deleteBom: (bomId: string) => Promise<void>,
    deleteBomComponent: (bomCompId: string) => Promise<void>,
    editBom: (bomId: string, bomPayload: Partial<Bom>) => Promise<void>,
    editBomComponent: (bomCompId: string, bomPayload: Partial<BomComponent>) => Promise<void>,
    materialOptions: MaterialOptions[],
    unitOptions: string[],
    typeOptionsMap: Record<string, string[]>,
    refetch: VoidFunction

}
const BomContext = createContext<Partial<Context>>({})

export const BomProvider = ({ children }: { children: ReactNode }) => {
    const fetchRef = useRef(true);
    const { inventory = [] } = useInventory()
    const { clientProposedProductMapper } = useOrders()
    const [bom, setBom] = useState<BomAndComponent[]>([])

    const bomInstance = new DataByTableName("v1_bom")
    const bomComponentsInstance = new DataByTableName("v1_bom_components")


    const getProductName = useCallback((productId: string) => {
        return Object.values(clientProposedProductMapper).flat().find(item => item.productId === productId)?.name || ""
    }, [clientProposedProductMapper])
    const getProductCost = useCallback((productId: string) => {
        return Object.values(clientProposedProductMapper).flat().find(item => item.productId === productId)?.price || 0
    }, [clientProposedProductMapper])

    const fetchData = useCallback(() => {
        Promise.allSettled([
            bomInstance.get(),
            bomComponentsInstance.get()
        ]).then((responses) => {
            const bomResponse = getChildObject(responses, "0.value.data", []), bomComponentResponse = getChildObject(responses, "1.value.data", [])
            const _bom = bomResponse.map((item: Bom) => {
                return {
                    ...item, unitCost: getProductCost(item.productId), productName: getProductName(item.productId), components: bomComponentResponse.filter((i: BomComponent) => item.bomId === i.bomId)
                }
            })
            setBom(_bom)
        })
    }, [clientProposedProductMapper])

    const addBomComponent = (bomId: string, payload: Partial<BomComponent>) => {
        return bomComponentsInstance.post({
            ...removebasicTypes(payload, ["id", "bomCompId"]),
            bomId
        })
    }
    const deleteBomComponent = (bomCompId: string) => {
        return bomComponentsInstance.deleteById({ key: "bomCompId", value: bomCompId })
    }

    const deleteBom = (bomId: string) => {
        return bomInstance.deleteById({ key: "bomId", value: bomId }).then(() => {
            return bomComponentsInstance.deleteById({
                key: "bom_id",
                value: bomId
            })
        })
    }

    const addBom = (bomItem: Partial<Bom>, bomComponents: Partial<BomComponent>[]) => {
        return bomInstance.post(removebasicTypes(bomItem, ["id", "bomId"]))
            .then(response => {
                const bomId = getChildObject(response, "data.0.bomId", "");
                if (!bomId) {
                    throw new Error("Error while saving bom")
                }
                return Promise.allSettled(
                    bomComponents.map(item => addBomComponent(bomId, item))
                )
            }).then(() => {
                fetchData()
            })
    }


    const editBom = (bomId: string, bomPayload: Partial<Bom>) => {
        return bomInstance.patch({
            key: "bom_id",
            value: bomId
        }, removebasicTypes(bomPayload, ["id", "bomId"]))
    }

    const editBomComponent = (bomCompId: string, bomPayload: Partial<BomComponent>) => {
        return bomComponentsInstance.patch({
            key: "bom_comp_id",
            value: bomCompId
        }, removebasicTypes(bomPayload, ["id", "bomCompId"]))
    }

    useEffect(() => {
        if (!fetchRef.current || Object.values(clientProposedProductMapper).flat().length === 0) return;
        fetchRef.current = false;

        fetchData();
    }, [clientProposedProductMapper])

    const materialOptions = useMemo(() => {
        return inventory?.map(item => ({ name: item.material, unit: item.unit, cost: item.price, materialId: item.inventoryId }))
    }, [inventory])

    // Define unit options
    const unitOptions = useMemo(() => {
        return Array.from(new Set(inventory?.map(item => item.unit)))
    }, [inventory]);

    // Define type options based on material
    const typeOptionsMap = useMemo(() => {
        return {
            default: ["Standard", "Premium", "Economy", "Custom"],
            ...inventory.reduce((acc: Record<string, Set<string>>, curr) => {
                if (!acc[curr.material]) {
                    acc[curr.material] = new Set();
                }
                acc[curr.material].add(curr.type)
                return acc;
            }, {})
        }
    }, [inventory])


    return <BomContext.Provider value={{
        materialOptions,
        unitOptions,
        typeOptionsMap,
        bom,
        addBom,
        addBomComponent,
        deleteBom,
        deleteBomComponent,
        editBom,
        editBomComponent,
        refetch: fetchData
    }}>
        {children}
    </BomContext.Provider>
}


export const useBomContext = () => {
    const context = useContext(BomContext);

    if (!context) {
        console.log('Please wrap bom with a provider')
    }

    return context;
}