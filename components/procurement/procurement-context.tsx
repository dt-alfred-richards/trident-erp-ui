import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { DataByTableName } from '../utils/api';

export type Supplier = {
    id: number;
    supplierId: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: number;
    gstNumber?: string;
    createdOn?: number;
    createdBy?: string;
    modifiedOn?: number;
    modifiedBy?: string;
};

type Purchase = {
    id: number;
    supplier_id: string;
    item_name: string;
    quantity: number;
    price: number;
    purchase_date: string;
    // Add more fields if needed
};

type ProcurementContextType = {
    suppliersData: Supplier[];
    purchaseData: Purchase[];
    triggerRender: () => void;
    loading: boolean;
};

export const sortByid = (data = []) => {
    return data.sort((a: any, b: any) => b.id - a.id)
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const useProcurement = () => {
    const context = useContext(ProcurementContext);
    if (!context) throw new Error('useProcurement must be used within ProcurementProvider');
    return context;
};

export const ProcurementProvider = ({ children }: { children: ReactNode }) => {
    const [suppliersData, setSuppliersData] = useState<Supplier[]>([]);
    const [purchaseData, setPurchaseData] = useState<Purchase[]>([]);
    const [renderTrigger, setRenderTrigger] = useState(0);
    const [loading, setLoading] = useState(false);
    const fetchRef = useRef(true);
    const fetchData = async () => {
        try {
            setLoading(true);

            const suppliesInstance = new DataByTableName("dim_supplies");
            // const purchaseInstance = new DataByTableName("fact_purchases");

            const [suppliersResponse] = await Promise.all([
                suppliesInstance.get(),
                // purchaseInstance.get(),
            ]);

            setSuppliersData(sortByid(suppliersResponse?.data?.data));
            // setPurchaseData(purchaseResponse?.data || []);
        } catch (err) {
            console.error('Error fetching procurement data:', err);
        } finally {
            setLoading(false);
        }
    };

    const triggerRender = () => {
        setRenderTrigger(prev => prev + 1);
    };

    useEffect(() => {
        if (!fetchRef.current) return;

        fetchRef.current = false;
        fetchData();
    }, [renderTrigger, fetchRef]);

    return (
        <ProcurementContext.Provider value={{ suppliersData, purchaseData, triggerRender, loading }}>
            {children}
        </ProcurementContext.Provider>
    );
};
