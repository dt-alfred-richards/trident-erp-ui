import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DataByTableName } from "../utils/api";
import { lodashGet } from "../common/generic";
import { createType } from "../utils/generic";
import { getMapper } from "@/contexts/order-context";


type RawMaterials = {
    id: number,
    materialId: string,
    name: string,
    size: number,
    units: string,
    type: string,
    createdOn: number,
    modifiedOn: object
}

type Suppliers = {
    name: string,
    gstIn: string,
    contactNumber: number,
    email: string,
    address: string,
    id: number,
    supplierId: string,
    createdOn: number,
    createdBy: object,
    modifiedOn: object,
    modifiedBy: object
}


type PurchaseOrders = {
    id: number,
    purchaseId: string,
    supplierId: string,
    materialId: string,
    createdOn: number,
    status: string,
    modifiedOn: number,
    expectedDeliveryDate: number,
    total: number,
    notes: string,
    currency: string,
    paymentTerms: string,
    priority: string,
    quantity: number,
    price: number
}

export type PurchaseContextType = {
    suppliers: Record<string, Suppliers>,
    rawMaterials: Record<string, RawMaterials>,
    triggerRender: VoidFunction
    purchaseOrders: PurchaseOrders[]
}

const ProcurementContext = createContext<PurchaseContextType>({
    suppliers: {},
    rawMaterials: {},
    triggerRender: () => { },
    purchaseOrders: []
})



export const ProcurementProvider = ({ children }: { children: ReactNode }) => {
    const [suppliers, setSuppliers] = useState<PurchaseContextType["suppliers"]>({})
    const [rawMaterials, setRawMaterials] = useState<PurchaseContextType["rawMaterials"]>({})
    const [purchaseOrders, setPurchaseOrders] = useState([])

    const [render, setRender] = useState(false);

    const triggerRender = useCallback(() => {
        setRender(i => !i)
    }, [setRender])

    useEffect(() => {
        const suppliersInstance = new DataByTableName('dim_supplies');
        const rawMaterialsInstance = new DataByTableName('dim_raw_materials_v1');
        const purchaseOrdersInstance = new DataByTableName('purchase_orders');

        Promise.allSettled([
            suppliersInstance.get(),
            rawMaterialsInstance.get(),
            purchaseOrdersInstance.get()
        ]).then(responses => {
            const suppliers = lodashGet({ data: responses[0], path: 'value.data.data' }) || []
            const rawMaterials = lodashGet({ data: responses[1], path: 'value.data.data' }) || []
            const purchaseOrders = lodashGet({ data: responses[2], path: 'value.data.data' }) || []

            setPurchaseOrders(purchaseOrders.sort((a: any, b: any) => b.id - a.id));
            setSuppliers(getMapper(suppliers, 'supplierId'))
            setRawMaterials(getMapper(rawMaterials, 'materialId'))
        }).catch(error => {
            console.log('error')
        })
    }, [render])

    const values = useMemo(() => ({
        suppliers,
        rawMaterials,
        triggerRender,
        purchaseOrders
    }), [suppliers, rawMaterials])

    return <ProcurementContext.Provider value={values}>{children}</ProcurementContext.Provider>
}


export const useProcurements = () => {
    const context = useContext(ProcurementContext);

    if (context === null) {
        console.log('procurement context is not ready');
    }

    return context;
}