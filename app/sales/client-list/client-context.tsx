"use client"

import { DataByTableName } from "@/components/api";
import { removebasicTypes, getChildObject } from "@/components/generic";
import { Basic } from "@/contexts/types";
import { Context, createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"

export type Client = {
    id: number,
    clientId: string,
    name: string,
    contactPerson: string,
    email: string,
    phoneNumber: string,
    shippingAddress: string,
    clientType: string,
    gstNumber: string,
    panNumber: string,
    createdOn: string,
    modifiedOn: string,
    createdBy: string,
    modifiedBy: string
}


type ClientContext = {
    clientMapper: Record<string, Client>,
    addClient: (client: Client) => Promise<void>
    refetchContext: VoidFunction,
    editClient: (data: any, clientId: number | undefined) => Promise<void>,
    deleteClient: (data: Client) => Promise<void>,
    clientProposedPriceMapper: Record<string, ClientProposedPrice[]>,
    addClientProduct: (payload: Partial<ClientProposedPrice>) => Promise<void>,
    updateClientProduct: ({ key, value }: { key: string, value: string }, payload: any) => Promise<void>,
    deleteClientProduct: ({ key, value }: { key: string, value: string }) => Promise<void>
}

export type ClientProposedPrice = {
    id: number,
    productId: string,
    name: string,
    clientId: string,
    sku: string,
    price: number,
    unit: string
}

const ClientContext = createContext<Partial<ClientContext>>({});

export const ClientProvider = ({ children }: { children: ReactNode }) => {
    const clientInstance = new DataByTableName("v1_clients");
    const clientProposedPriceInstance = new DataByTableName("client_proposed_price")
    const fetchRef = useRef(true);

    const [clientMapper, setClientMapper] = useState<Record<string, Client>>({})
    const [clientProposedPriceMapper, setClientProposedPriceMapper] = useState<Record<string, ClientProposedPrice[]>>({});

    const fetchData = () => {
        Promise.allSettled([
            clientInstance.get(),
            clientProposedPriceInstance.get()
        ]).then(responses => {
            const clientInfo = getChildObject(responses, '0.value.data', [])
            const proposedPrice = getChildObject(responses, '1.value.data', []);

            setClientProposedPriceMapper(proposedPrice.reduce((acc: Record<string, ClientProposedPrice[]>, curr: ClientProposedPrice) => {
                if (!acc[curr.clientId]) {
                    acc[curr.clientId] = []
                }
                acc[curr.clientId].push(curr);
                return acc;
            }, {}))
            setClientMapper(clientInfo.reduce((acc: ClientContext["clientMapper"], curr: Client) => {
                if (!acc[curr.clientId]) acc[curr.clientId] = curr;
                return acc;
            }, {}))
        })
    }
    useEffect(() => {
        if (!fetchRef.current) return

        fetchRef.current = false;
        fetchData()
    }, [])

    const refetchContext = () => {
        fetchData();
    }

    const updateClientProduct = ({ key, value }: { key: string, value: string }, payload: any) => {
        return clientProposedPriceInstance.patch({ key, value: value }, payload).catch(error => {
            console.log({ error })
        })
    }

    const deleteClientProduct = ({ key, value }: { key: string, value: string }) => {
        return clientProposedPriceInstance.deleteById({ key, value: value }).catch(error => {
            console.log({ error })
        })
    }

    const addClientProduct = (payload: Partial<ClientProposedPrice>) => {
        return clientProposedPriceInstance.post(payload).catch(error => {
            console.log({ error })
        })
    }

    const editClient = (data: any, clientId: number | undefined) => {
        return clientInstance.patch({ key: "id", value: clientId }, data).catch(error => {
            console.log({ error })
        })
    }

    const deleteClient = (data: Client) => {
        return clientInstance.deleteById({ key: "id", value: data.id }).catch(error => {
            console.log({ error })
        })
    }

    const addClient = (client: Client) => {
        const payload = removebasicTypes(client, ["id", "clientId"]);
        return clientInstance.post(payload).catch(error => {
            console.log({ error })
        })
    }

    const contextValue = useMemo(() => {
        return { clientMapper, updateClientProduct, deleteClientProduct, addClient, refetchContext, editClient, deleteClient, clientProposedPriceMapper, addClientProduct }
    }, [clientMapper])

    return <ClientContext.Provider value={contextValue}>
        {children}
    </ClientContext.Provider>
}

export function getContext<T>(currentContext: Context<T>) {
    const context = useContext(currentContext);

    if (!context) {
        throw new Error("Context is not initilised yet.Please wrap it with a provider");
    }
    return context;
}


export const useClient = () => {
    return getContext<ClientContext | undefined>(ClientContext);
}