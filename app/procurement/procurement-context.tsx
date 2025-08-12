"use client"
import { DataByTableName } from "@/components/api";
import { getChildObject, removebasicTypes } from "@/components/generic";
import { Basic } from "@/contexts/types";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

export type Suppliers = {
    id: number,
    supplierId: string,
    name: string,
    contactPerson: string,
    email: string,
    phoneNumber: string,
    address: string,
    createdOn: Date,
    modifiedOn: Date,
    createdBy: string,
    modifiedBy: string,
    bankName: string,
    ifscCode: string,
    bankAccount: string,
    upi: string,
    gst: string,
    pan: string;
}

export type Material = {
    id: number,
    materialId: string,
    name: string,
    type: string,
    price: number,
    unit: string,
    supplierId: string,
    inventoryId: string
}

export type PurchaseOrder = {
    id: number;
    purchaseId: string;
    supplierId: string;
    dueDate: Date;
    currency: string;
    paymentTerms: string;
    priority: string;
    notes: string;
    total: number;
    status: string,
    grnCreated: boolean
} & Basic;

export type PurchaseOrderMaterial = {
    id: number;
    purchaseItemId: string;
    purchaseOrderId: string,
    materialId: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    receivedQuantity: string
} & Basic


type ContextType = {
    suppliers: Suppliers[],
    materials: Material[],
    purchaseOrders: PurchaseOrder[],
    purchaseOrderMaterials: PurchaseOrderMaterial[],
    deleteMaterial: (materialId: string) => Promise<void>,
    addSupplier: (payload: Partial<Suppliers>) => Promise<void>,
    addMaterial: (payload: Partial<Material>) => Promise<void>,
    updateSupplier: (supplierId: string, payload: Partial<Suppliers>) => Promise<void>,
    deleteSupplier: (supplierId: string) => Promise<void>,
    refetch: VoidFunction,
    createPurchaseOrder?: (purhcaseOrder: Partial<PurchaseOrder>, purchaseOrderItem: Partial<PurchaseOrderMaterial>[]) => Promise<void>,
    editPurchaseOrder?: (purchase: Partial<PurchaseOrder>, purchaseOrders: Partial<PurchaseOrderMaterial>[]) => Promise<void>,
    deletePurchaseOrder?: (purchaseOrderId: string, purchaseOrderItems: string[]) => Promise<void>,

}

const ProcurementContext = createContext<ContextType>({
    suppliers: [],
    materials: [],
    purchaseOrderMaterials: [],
    purchaseOrders: [],
    deleteMaterial: (materialId: string) => Promise.reject("Not yuet initilised"),
    addSupplier: (payload: Partial<Suppliers>) => Promise.reject("Not yet initilised"),
    addMaterial: (payload: Partial<Material>) => Promise.reject("Not yet initilised"),
    updateSupplier: (supplierId: string, payload: Partial<Suppliers>) => Promise.reject("Not yet initilised"),
    deleteSupplier: (supplierId: string) => Promise.reject("Not yet initilised"),
    refetch: () => { }
})


export const ProcurementProvider = ({ children }: { children: ReactNode }) => {
    const [suppliers, setSuppliers] = useState([])
    const [materials, setMaterials] = useState([])
    const [purchaseOrders, setPurchaseOrders] = useState([])
    const [purchaseOrderItems, setPurchaseOrderItems] = useState([])
    const supplierInstance = new DataByTableName("v1_suppliers");
    const materialInstance = new DataByTableName("v1_supplier_materials");

    const purhchaseOrderInstance = new DataByTableName("v1_purchase_order")
    const purhchaseOrderItemsInstance = new DataByTableName("v1_purchase_order_materials")
    const fetchRef = useRef(true)

    const fetchPurchases = () => {
        Promise.allSettled([
            purhchaseOrderInstance.get(),
            purhchaseOrderItemsInstance.get()
        ]).then(response => {
            const purchaseOrderResponse = getChildObject(response, "0.value.data", [])
            const purchaseOrderItemsResponse = getChildObject(response, "1.value.data", [])
            setPurchaseOrders(purchaseOrderResponse)
            setPurchaseOrderItems(purchaseOrderItemsResponse)
        })
    }

    const fetchData = () => {
        Promise.allSettled([
            supplierInstance.get(),
            materialInstance.get()
        ]).then(response => {
            const supplierResponse = getChildObject(response, "0.value.data", [])
            const materialResponse = getChildObject(response, "1.value.data", [])

            setSuppliers(supplierResponse)
            setMaterials(materialResponse)
        })
    }

    useEffect(() => {
        if (!fetchRef.current) return;

        fetchRef.current = false
        fetchData()
        fetchPurchases()
    }, [])

    const addSupplier = (payload: Partial<Suppliers>) => {
        return supplierInstance.post(payload).then(() => {
            fetchData()
        }).catch((error) => {
            console.log({ error })
        })
    }

    const addMaterial = (payload: Partial<Material>) => {
        return materialInstance.post(payload).then(() => {
            fetchData()
        }).catch((error) => {
            console.log({ error })
        })
    }


    const updateSupplier = (supplierId: string, payload: Partial<Suppliers>) => {
        return supplierInstance.patch({ key: "supplier_id", value: supplierId }, payload).then(() => {
            fetchData()
        }).catch((error) => {
            console.log({ error })
        })
    }



    const deleteSupplier = (supplierId: string) => {
        return supplierInstance.deleteById({ key: "supplier_id", value: supplierId }).then(() => {
            fetchData()
        }).catch((error) => {
            console.log({ error })
        })
    }

    const deleteMaterial = (materialId: string) => {
        return materialInstance.deleteById({ key: "material_id", value: materialId }).catch(error => {
            console.log({ error })
        })
    }

    const createPurchaseOrder = (purhcaseOrder: Partial<PurchaseOrder>, purchaseOrderItem: Partial<PurchaseOrderMaterial>[]) => {
        const _purchaseOrder = removebasicTypes(purhcaseOrder, ["id", "purchaseId"])

        return purhchaseOrderInstance.post({ ..._purchaseOrder, supplierId: purhcaseOrder.supplierId }).then((res) => {
            const purchaseOrderId = getChildObject(res, "data.0.purchaseId", "")
            if (!purchaseOrderId) throw new Error("Purchase order not created properly")
            return Promise.allSettled(
                purchaseOrderItem.map(item => purhchaseOrderItemsInstance.post(removebasicTypes({ ...item, purchaseOrderId }, ["id"])))
            )
        }).then(fetchPurchases)
    }

    const editPurchaseOrder = (purchase: Partial<PurchaseOrder>, purchaseOrders: Partial<PurchaseOrderMaterial>[]) => {
        const purchaseOrderId = purchase.purchaseId
        const payload = removebasicTypes(purchase, ["id", "purchaseId"])
        return purhchaseOrderInstance.patch({
            key: "purchase_id",
            value: purchaseOrderId
        }, payload).then(() => {
            return editPurchaseOrderItems(purchaseOrders)
        }).then(() => {
            fetchPurchases()
        })
    }

    const editPurchaseOrderItems = (purchaseOrders: Partial<PurchaseOrderMaterial>[]) => {
        return Promise.allSettled(
            purchaseOrders.map(item => purhchaseOrderItemsInstance.patch({
                key: "purchase_item_id",
                value: item.purchaseItemId
            }, removebasicTypes(item, ["id", "purchaseItemId"])))
        )
    }

    const deletePurchaseOrder = (purchaseOrderId: string, purchaseOrderItems: string[]) => {
        return purhchaseOrderInstance.deleteById({
            key: "purchase_id",
            value: purchaseOrderId
        }).then(() => deletePurchaseOrderItems(purchaseOrderItems)).then(() => {
            fetchPurchases()
        })
    }

    const deletePurchaseOrderItems = (purchaseOrderItems: string[]) => {
        return Promise.allSettled(
            purchaseOrderItems.map(item => purhchaseOrderInstance.deleteById({
                key: "purchase_order_id",
                value: item
            }))
        )
    }

    return <ProcurementContext.Provider value={{ addMaterial, addSupplier, suppliers, updateSupplier, materials, deleteSupplier, deleteMaterial, refetch: fetchData, createPurchaseOrder, deletePurchaseOrder, editPurchaseOrder, purchaseOrders, purchaseOrderMaterials: purchaseOrderItems }}>
        {children}
    </ProcurementContext.Provider>
}

export const useProcurement = () => {
    const context = useContext(ProcurementContext)

    if (!context) {
        console.log("Please wrap with procurement provider")

    }

    return context;
}