"use client"
import { DataByTableName } from "@/components/api";
import { getChildObject } from "@/components/generic";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

export type Suppliers = {
    id: number,
    supplierId: string,
    name: String,
    contactPerson: string,
    email: string,
    phoneNumber: string,
    address: string,
    createdOn: Date,
    modifiedOn: Date,
    createdBy: string,
    modifiedBy: string
}

export type Material = {
    id: number,
    materialId: string,
    name: string,
    type: string,
    price: number,
    unit: string,
    supplierId: string
}

type ContextType = {
    suppliers: Suppliers[],
    materials: Material[],
    deleteMaterial: (materialId: string) => Promise<void>,
    addSupplier: (payload: Partial<Suppliers>) => Promise<void>,
    addMaterial: (payload: Partial<Material>) => Promise<void>,
    updateSupplier: (supplierId: string, payload: Partial<Suppliers>) => Promise<void>,
    deleteSupplier: (supplierId: string) => Promise<void>,
    refetch: VoidFunction
}

const ProcurementContext = createContext<ContextType>({
    suppliers: [],
    materials: [],
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
    const supplierInstance = new DataByTableName("v1_suppliers");
    const materialInstance = new DataByTableName("v1_supplier_materials");

    const fetchRef = useRef(true)
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

    return <ProcurementContext.Provider value={{ addMaterial, addSupplier, suppliers, updateSupplier, materials, deleteSupplier, deleteMaterial, refetch: fetchData }}>
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